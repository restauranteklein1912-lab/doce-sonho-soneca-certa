import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Apple, Baby, Milk, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { localDayKey, toLocalInput, useAppData } from "@/lib/app-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Empty, ErrorState, Loading, PageTitle } from "@/components/app/States";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/_authenticated/app/alimentacao")({
  head: () => ({ meta: [{ title: "Diário de alimentação · Doce Sonho" }] }),
  component: Alimentacao,
});

type Kind = "breast" | "bottle" | "expressed_milk" | "solids";
type Feeding = {
  id: string; baby_id: string; kind: Kind; started_at: string; duration_minutes: number | null;
  breast_side: "left" | "right" | "both" | "not_applicable" | null;
  left_minutes: number | null; right_minutes: number | null; amount_ml: number | null;
  food: string | null; reaction: "none" | "accepted" | "refused" | "possible_reaction" | "other" | null;
  notes: string | null;
};
const labels: Record<Kind,string> = { breast:"Peito", bottle:"Mamadeira", expressed_milk:"Leite ordenhado", solids:"Introdução alimentar" };
const time = (v:string) => new Date(v).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
const dateLabel = (v:string) => new Date(v+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"});

function Alimentacao() {
  const { baby } = useAppData();
  const [rows,setRows] = useState<Feeding[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(false);
  const [editing,setEditing] = useState<Feeding | "new" | null>(null);
  const [deleting,setDeleting] = useState<Feeding|null>(null);
  const [refresh,setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!baby) { setRows([]); setLoading(false); return; }
      setLoading(true); setError(false);
      const result = await supabase.from("feeding_logs").select("*").eq("baby_id",baby.id).order("started_at",{ascending:false}).limit(300);
      if (!active) return;
      if(result.error){setError(true);setRows([]);} else setRows((result.data??[]) as Feeding[]);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  },[baby?.id,refresh]);

  const grouped = useMemo(() => {
    const map = new Map<string,Feeding[]>();
    for(const row of rows){const key=localDayKey(new Date(row.started_at));map.set(key,[...(map.get(key)??[]),row]);}
    return [...map.entries()];
  },[rows]);

  async function remove() {
    if(!deleting)return;
    const {error}=await supabase.from("feeding_logs").delete().eq("id",deleting.id);
    setDeleting(null);
    if(error)toast.error(s.common.error); else {toast.success(s.common.deleted);setRefresh(x=>x+1);}
  }
  return <div>
    <PageTitle title="Diário de alimentação" subtitle={baby ? `Registros de ${baby.name}` : "Acompanhe a alimentação do bebê"} action={<Button onClick={()=>setEditing("new")}><Plus/> Registrar</Button>}/>
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {(["breast","bottle","expressed_milk","solids"] as Kind[]).map((kind)=><div key={kind} className="card-soft flex items-center gap-2 p-3 text-sm"><span className="grid h-9 w-9 place-items-center rounded-full bg-peach text-peach-foreground">{kind==="solids"?<Apple/>:kind==="breast"?<Baby/>:<Milk/>}</span><span className="font-semibold">{labels[kind]}</span></div>)}
    </div>
    {loading?<Loading/>:error?<ErrorState onRetry={()=>setRefresh(x=>x+1)}/>:grouped.length===0?<Empty>Nenhuma alimentação registrada ainda. Toque em “Registrar” para adicionar a primeira.</Empty>:<div className="space-y-5">
      {grouped.map(([day,items])=><section key={day}><h2 className="mb-2 text-sm font-semibold capitalize text-muted-foreground">{dateLabel(day)}</h2><ul className="card-soft divide-y">
        {items.map(row=><li key={row.id} className="flex items-start gap-3 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-peach text-peach-foreground">{row.kind==="solids"?<Apple/>:row.kind==="breast"?<Baby/>:<Milk/>}</span>
          <div className="min-w-0 flex-1 text-sm"><p className="font-semibold">{labels[row.kind]} · <span className="tabular-nums">{time(row.started_at)}</span></p>
            <p className="text-muted-foreground">{row.kind==="breast"?[`Lado: ${row.breast_side==="left"?"esquerdo":row.breast_side==="right"?"direito":row.breast_side==="both"?"ambos":"não informado"}`,row.left_minutes!=null?`Esquerdo ${row.left_minutes} min`:null,row.right_minutes!=null?`Direito ${row.right_minutes} min`:null,row.duration_minutes!=null?`${row.duration_minutes} min no total`:null].filter(Boolean).join(" · "):row.kind==="solids"?[row.food,row.reaction&&row.reaction!=="none"?({accepted:"Aceitou",refused:"Recusou",possible_reaction:"Possível reação",other:"Outra observação"} as Record<string,string>)[row.reaction]:null].filter(Boolean).join(" · "):[row.amount_ml!=null?`${row.amount_ml} ml`:null,row.duration_minutes!=null?`${row.duration_minutes} min`:null].filter(Boolean).join(" · ")}</p>
            {row.notes&&<p className="mt-1 break-words text-muted-foreground">{row.notes}</p>}
          </div><div className="flex shrink-0 gap-1"><Button size="icon" variant="ghost" aria-label="Editar" onClick={()=>setEditing(row)}><Pencil/></Button><Button size="icon" variant="ghost" aria-label="Excluir" onClick={()=>setDeleting(row)}><Trash2/></Button></div>
        </li>)}
      </ul></section>)}
    </div>}
    {editing&&baby&&<FeedingDialog babyId={baby.id} row={editing==="new"?null:editing} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);setRefresh(x=>x+1);}}/>}
    <AlertDialog open={!!deleting} onOpenChange={v=>!v&&setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir este registro?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{s.common.cancel}</AlertDialogCancel><AlertDialogAction onClick={remove}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialog>
  </div>;
}

function FeedingDialog({babyId,row,onClose,onSaved}:{babyId:string;row:Feeding|null;onClose:()=>void;onSaved:()=>void}) {
  const [kind,setKind]=useState<Kind>(row?.kind??"breast");
  const [started,setStarted]=useState(toLocalInput(row?new Date(row.started_at):new Date()));
  const [side,setSide]=useState(row?.breast_side??"left");
  const [duration,setDuration]=useState(row?.duration_minutes?.toString()??"");
  const [left,setLeft]=useState(row?.left_minutes?.toString()??"");
  const [right,setRight]=useState(row?.right_minutes?.toString()??"");
  const [amount,setAmount]=useState(row?.amount_ml?.toString()??"");
  const [food,setFood]=useState(row?.food??"");
  const [reaction,setReaction]=useState(row?.reaction??"none");
  const [notes,setNotes]=useState(row?.notes??"");
  const [busy,setBusy]=useState(false);
  async function save(e:React.FormEvent){
    e.preventDefault();
    const num=(v:string)=>v.trim()===""?null:Number(v);
    if(kind==="solids"&&!food.trim()){toast.error("Informe o alimento oferecido.");return;}
    const startedDate=new Date(started);
    if(Number.isNaN(startedDate.getTime())){toast.error("Informe um horário válido.");return;}
    const payload={baby_id:babyId,kind,started_at:startedDate.toISOString(),
      duration_minutes:kind==="solids"?null:num(duration),
      breast_side:kind==="breast"?side:null,left_minutes:kind==="breast"?num(left):null,right_minutes:kind==="breast"?num(right):null,
      amount_ml:kind==="bottle"||kind==="expressed_milk"?num(amount):null,food:kind==="solids"?food.trim():null,
      reaction:kind==="solids"?reaction:null,notes:notes.trim()||null};
    setBusy(true);
    const result=row?await supabase.from("feeding_logs").update(payload).eq("id",row.id):await supabase.from("feeding_logs").insert(payload);
    setBusy(false);
    if(result.error){toast.error(s.common.error);return;}
    toast.success(s.common.saved);onSaved();
  }
  return <Dialog open onOpenChange={v=>!v&&onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl"><DialogHeader><DialogTitle>{row?"Editar alimentação":"Registrar alimentação"}</DialogTitle></DialogHeader>
    <form onSubmit={save} className="space-y-4">
      <div><Label>Tipo de alimentação</Label><Select value={kind} onValueChange={v=>setKind(v as Kind)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{(Object.keys(labels) as Kind[]).map(k=><SelectItem key={k} value={k}>{labels[k]}</SelectItem>)}</SelectContent></Select></div>
      <div><Label htmlFor="feeding-start">Data e horário</Label><Input id="feeding-start" type="datetime-local" value={started} onChange={e=>setStarted(e.target.value)} required/></div>
      {kind==="breast"&&<><div><Label>Lado utilizado</Label><Select value={side} onValueChange={v=>setSide(v as typeof side)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="left">Esquerdo</SelectItem><SelectItem value="right">Direito</SelectItem><SelectItem value="both">Ambos</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="left-min">Minutos no esquerdo</Label><Input id="left-min" type="number" min="0" max="600" value={left} onChange={e=>setLeft(e.target.value)} placeholder="Opcional"/></div><div><Label htmlFor="right-min">Minutos no direito</Label><Input id="right-min" type="number" min="0" max="600" value={right} onChange={e=>setRight(e.target.value)} placeholder="Opcional"/></div></div><div><Label htmlFor="duration">Duração total (minutos)</Label><Input id="duration" type="number" min="0" max="600" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Opcional"/></div></>}
      {(kind==="bottle"||kind==="expressed_milk")&&<><div><Label htmlFor="amount">Quantidade (ml)</Label><Input id="amount" type="number" min="0" max="2000" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Opcional"/></div><div><Label htmlFor="duration-other">Duração (minutos)</Label><Input id="duration-other" type="number" min="0" max="600" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Opcional"/></div></>}
      {kind==="solids"&&<><div><Label htmlFor="food">Alimento oferecido</Label><Input id="food" maxLength={300} value={food} onChange={e=>setFood(e.target.value)} placeholder="Ex.: banana amassada" required/></div><div><Label>Como foi a aceitação?</Label><Select value={reaction??"none"} onValueChange={v=>setReaction(v as typeof reaction)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">Não informado</SelectItem><SelectItem value="accepted">Aceitou</SelectItem><SelectItem value="refused">Recusou</SelectItem><SelectItem value="possible_reaction">Possível reação</SelectItem><SelectItem value="other">Outra observação</SelectItem></SelectContent></Select></div></>}
      <div><Label htmlFor="feeding-notes">Observações (opcional)</Label><Textarea id="feeding-notes" maxLength={1000} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Anote algo que queira lembrar..."/></div>
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>{s.common.cancel}</Button><Button type="submit" disabled={busy}>{busy?s.common.saving:s.common.save}</Button></div>
    </form>
  </DialogContent></Dialog>;
}
