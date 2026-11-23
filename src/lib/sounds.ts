/** Sons de ruído gerados localmente e reproduzidos por HTMLAudioElement.
 * O elemento de áudio é iniciado diretamente no toque do usuário, evitando
 * bloqueios de autoplay do Safari/iOS com AudioContext suspenso.
 */
export type SoundId = "white" | "pink" | "rain" | "ocean";

function createNoiseUrl(kind: SoundId): string {
  const sampleRate = 22050;
  const seconds = 8;
  const length = sampleRate * seconds;
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + length * bytesPerSample);
  const view = new DataView(buffer);

  const writeText = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + length * bytesPerSample, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, length * bytesPerSample, true);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, brown = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    let sample: number;

    if (kind === "white") {
      sample = white * 0.55;
    } else if (kind === "pink" || kind === "rain") {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
      const modulation = kind === "rain" ? 0.78 + 0.22 * Math.sin(2 * Math.PI * 0.16 * i / sampleRate) : 1;
      sample = pink * (kind === "rain" ? 2.2 : 2.8) * modulation;
    } else {
      brown = (brown + 0.02 * white) / 1.02;
      const modulation = 0.72 + 0.28 * Math.sin(2 * Math.PI * 0.09 * i / sampleRate);
      sample = brown * 7 * modulation;
    }

    const clipped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * bytesPerSample, clipped * 32767, true);
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

export class SoundPlayer {
  private audio: HTMLAudioElement | null = null;
  private objectUrl: string | null = null;

  async play(id: SoundId, volume: number): Promise<void> {
    this.stop();

    const url = createNoiseUrl(id);
    const audio = new Audio();
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.src = url;
    this.audio = audio;
    this.objectUrl = url;

    // Chamar play() antes de qualquer await é importante para o gesto do iOS.
    try {
      await audio.play();
    } catch (error) {
      this.stop();
      throw error;
    }
  }

  setVolume(volume: number) {
    if (this.audio) this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load();
      this.audio = null;
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  dispose() {
    this.stop();
  }
}
