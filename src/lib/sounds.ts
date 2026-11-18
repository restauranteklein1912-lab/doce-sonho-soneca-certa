/** Sons gerados com Web Audio API (sem arquivos externos). */
export type SoundId = "white" | "pink" | "rain" | "ocean";

function noiseBuffer(ctx: AudioContext, kind: "white" | "pink" | "brown"): AudioBuffer {
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "white") d[i] = w * 0.5;
      else if (kind === "pink") {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
  }
  return buf;
}

export class SoundPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private sources: AudioScheduledSourceNode[] = [];

  play(id: SoundId, volume: number) {
    this.stop();
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = this.ctx ?? new Ctx();
    const ctx = this.ctx;
    void ctx.resume();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);
    master.connect(ctx.destination);
    this.master = master;

    const src = ctx.createBufferSource();
    src.loop = true;
    this.sources.push(src);

    if (id === "white" || id === "pink") {
      src.buffer = noiseBuffer(ctx, id);
      src.connect(master);
    } else if (id === "rain") {
      src.buffer = noiseBuffer(ctx, "pink");
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 400;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000;
      const g = ctx.createGain(); g.gain.value = 0.9;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.15;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.15;
      lfo.connect(lfoGain).connect(g.gain);
      src.connect(hp).connect(lp).connect(g).connect(master);
      lfo.start();
      this.sources.push(lfo);
      this.nodes.push(hp, lp, g, lfoGain);
    } else {
      src.buffer = noiseBuffer(ctx, "brown");
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
      const g = ctx.createGain(); g.gain.value = 0.5;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.09;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.45;
      lfo.connect(lfoGain).connect(g.gain);
      src.connect(lp).connect(g).connect(master);
      lfo.start();
      this.sources.push(lfo);
      this.nodes.push(lp, g, lfoGain);
    }
    src.start();
  }

  setVolume(v: number) {
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
  }

  stop() {
    this.sources.forEach((s) => { try { s.stop(); } catch { /* já parado */ } s.disconnect(); });
    this.nodes.forEach((n) => n.disconnect());
    this.master?.disconnect();
    this.sources = []; this.nodes = []; this.master = null;
  }
}
