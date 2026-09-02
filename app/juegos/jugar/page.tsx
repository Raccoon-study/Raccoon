

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Clock3, Gamepad2, RotateCcw, Star, Trophy, X } from "lucide-react";

type JuegoBase = { tipo: "memoria"|"crucigrama"|"ahorcado"|"relaciona"|"verdadero_falso"; titulo:string; materialNombre?:string; dificultad?:string; };
type Carta = { id:string; parejaId:string; texto:string };
type Pareja = { id:string; izquierda:string; derecha:string };
type Juego =
 | (JuegoBase & {tipo:"memoria"; cartas:Carta[]})
 | (JuegoBase & {tipo:"ahorcado"; palabras:{palabra:string;pista:string}[]})
 | (JuegoBase & {tipo:"relaciona"; parejas:Pareja[]})
 | (JuegoBase & {tipo:"crucigrama"; items:{pista:string;respuesta:string}[]})
 | (JuegoBase & {tipo:"verdadero_falso"; items:{afirmacion:string;respuesta:boolean;explicacion?:string}[]});

const mezclar = <T,>(a:T[]) => [...a].sort(()=>Math.random()-0.5);

export default function JugarPage() {
  const router = useRouter();
  const [juego,setJuego]=useState<Juego|null>(null);
  const [terminado,setTerminado]=useState(false);
  const [puntos,setPuntos]=useState(0);

  useEffect(()=>{
    const raw=sessionStorage.getItem("raccoon_juego_actual");
    if(!raw) return router.replace("/juegos");
    try{setJuego(JSON.parse(raw));}catch{router.replace("/juegos");}
  },[router]);

  if(!juego) return <div className="grid min-h-screen place-items-center bg-[#f7fbff] text-5xl">🦝</div>;

  return <div className="min-h-screen bg-[#f7fbff] text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button onClick={()=>router.push("/juegos")} className="flex items-center gap-2 rounded-2xl px-3 py-2 font-black text-slate-600 hover:bg-slate-100"><ArrowLeft size={19}/>Juegos</button>
        <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">Raccoon Games</p><h1 className="font-black">{juego.titulo}</h1></div>
        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 font-black text-amber-600"><Star size={17}/> {puntos}</div>
      </div>
    </header>

    <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm">
        <div><p className="text-xs font-bold text-slate-400">{juego.materialNombre||"Tu material"}</p><p className="mt-1 text-sm font-black capitalize">Dificultad: {juego.dificultad||"medio"}</p></div>
        <div className="flex items-center gap-2 text-sm font-black text-slate-500"><Clock3 size={17}/> Repasa con calma</div>
      </div>

      {juego.tipo==="memoria" && <Memoria juego={juego} fin={(p)=>{setPuntos(p);setTerminado(true)}}/>}
      {juego.tipo==="ahorcado" && <Ahorcado juego={juego} score={setPuntos} fin={()=>setTerminado(true)}/>}
      {juego.tipo==="relaciona" && <Relaciona juego={juego} fin={(p)=>{setPuntos(p);setTerminado(true)}}/>}
      {juego.tipo==="crucigrama" && <Crucigrama juego={juego} fin={(p)=>{setPuntos(p);setTerminado(true)}}/>}
      {juego.tipo==="verdadero_falso" && <VF juego={juego} fin={(p)=>{setPuntos(p);setTerminado(true)}}/>}

      {terminado && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-[32px] bg-white p-7 text-center shadow-2xl">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber-50 text-4xl">🦝</div>
          <Trophy className="mx-auto mt-5 text-amber-500" size={34}/>
          <h2 className="mt-3 text-2xl font-black">¡Excelente trabajo!</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Terminaste el reto y reforzaste lo aprendido.</p>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-400">Puntuación</p><p className="mt-1 text-4xl font-black text-indigo-600">{puntos}</p></div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={()=>location.reload()} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 font-black"><RotateCcw size={18}/>Repetir</button>
            <button onClick={()=>router.push("/juegos")} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 font-black text-white"><Gamepad2 size={18}/>Otro juego</button>
          </div>
        </div>
      </div>}
    </main>
  </div>;
}

function Memoria({juego,fin}:{juego:Extract<Juego,{tipo:"memoria"}>;fin:(p:number)=>void}) {
  const [cartas]=useState(()=>mezclar(juego.cartas||[]));
  const [abiertas,setAbiertas]=useState<string[]>([]);
  const [resueltas,setResueltas]=useState<string[]>([]);
  const [bloqueado,setBloqueado]=useState(false);
  const [mov,setMov]=useState(0);

  function abrir(c:Carta){
    if(bloqueado||abiertas.includes(c.id)||resueltas.includes(c.id))return;
    const n=[...abiertas,c.id]; setAbiertas(n);
    if(n.length===2){
      setBloqueado(true); setMov(v=>v+1);
      const [a,b]=n.map(id=>cartas.find(x=>x.id===id)!);
      if(a.parejaId===b.parejaId&&a.id!==b.id){
        const r=[...resueltas,a.id,b.id];
        setTimeout(()=>{setResueltas(r);setAbiertas([]);setBloqueado(false);if(r.length===cartas.length)fin(Math.max(50,200-mov*8));},500);
      } else setTimeout(()=>{setAbiertas([]);setBloqueado(false)},900);
    }
  }

  return <section>
    <div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-black">Encuentra las parejas</h2><span className="rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">Movimientos: {mov}</span></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cartas.map(c=>{const v=abiertas.includes(c.id)||resueltas.includes(c.id);return <button key={c.id} onClick={()=>abrir(c)} className={`min-h-36 rounded-[26px] border p-4 text-center ${v?"border-indigo-200 bg-white shadow-lg":"border-indigo-200 bg-gradient-to-br from-sky-500 to-indigo-600 text-white"}`}>{v?<span className="text-sm font-black leading-5">{c.texto}</span>:<span className="text-4xl">🦝</span>}</button>})}
    </div>
  </section>
}

function Ahorcado({juego,score,fin}:{juego:Extract<Juego,{tipo:"ahorcado"}>;score:(n:number)=>void;fin:()=>void}) {
  const [i,setI]=useState(0), [letras,setLetras]=useState<string[]>([]), [errores,setErrores]=useState(0), [pts,setPts]=useState(0);
  const a=juego.palabras[i];
  const palabra=(a?.palabra||"").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const ok=palabra.split("").every(l=>l===" "||letras.includes(l));

  useEffect(()=>{if(!ok||!a)return;const t=setTimeout(()=>{const n=pts+50;setPts(n);score(n);if(i+1>=juego.palabras.length)fin();else{setI(v=>v+1);setLetras([]);setErrores(0)}},650);return()=>clearTimeout(t)},[ok,a,i,juego.palabras.length,pts,score,fin]);

  if(!a)return <div className="rounded-3xl bg-white p-8">No hay palabras disponibles.</div>;
  const abc="ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
  return <section className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8"><div className="mx-auto max-w-3xl text-center">
    <p className="text-sm font-black text-indigo-500">Palabra {i+1} de {juego.palabras.length}</p><div className="mt-5 text-6xl">{["🙂","😐","😬","😵","🫣","😣","💀"][errores]}</div>
    <p className="mt-5 text-sm font-bold text-slate-500">Pista: {a.pista}</p>
    <div className="mt-7 flex flex-wrap justify-center gap-2">{palabra.split("").map((l,k)=>l===" "?<span key={k} className="w-4"/>:<span key={k} className="grid h-12 min-w-10 place-items-center rounded-xl border-b-4 border-slate-300 bg-slate-50 text-xl font-black">{letras.includes(l)?l:""}</span>)}</div>
    <div className="mt-8 flex flex-wrap justify-center gap-2">{abc.map(l=><button key={l} disabled={letras.includes(l)} onClick={()=>{if(!letras.includes(l)){setLetras(v=>[...v,l]);if(!palabra.includes(l))setErrores(v=>Math.min(6,v+1))}}} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 font-black disabled:opacity-30">{l}</button>)}</div>
  </div></section>
}

function Relaciona({juego,fin}:{juego:Extract<Juego,{tipo:"relaciona"}>;fin:(p:number)=>void}) {
  const [sel,setSel]=useState<Record<string,string>>({});
  const der=useMemo(()=>mezclar(juego.parejas.map(p=>p.derecha)),[juego.parejas]);
  return <section className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">Relaciona cada concepto</h2><div className="mt-6 space-y-4">
    {juego.parejas.map(p=><div key={p.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-2 md:items-center"><div className="font-black">{p.izquierda}</div><select value={sel[p.id]||""} onChange={e=>setSel(v=>({...v,[p.id]:e.target.value}))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold"><option value="">Selecciona...</option>{der.map(d=><option key={d}>{d}</option>)}</select></div>)}
  </div><button onClick={()=>fin(juego.parejas.filter(p=>sel[p.id]===p.derecha).length*40)} className="mt-6 w-full rounded-2xl bg-indigo-600 py-4 font-black text-white">Comprobar respuestas</button></section>
}

function Crucigrama({juego,fin}:{juego:Extract<Juego,{tipo:"crucigrama"}>;fin:(p:number)=>void}) {
  const [r,setR]=useState<Record<number,string>>({});
  return <section className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">Crucigrama de conceptos</h2><p className="mt-2 text-sm font-semibold text-slate-500">Escribe la palabra que corresponde a cada pista.</p><div className="mt-6 space-y-4">
    {juego.items.map((it,i)=><div key={i} className="rounded-2xl border border-slate-200 p-4"><p className="text-sm font-black">{i+1}. {it.pista}</p><input value={r[i]||""} onChange={e=>setR(v=>({...v,[i]:e.target.value}))} className="mt-3 w-full rounded-xl bg-slate-50 px-4 py-3 font-black uppercase outline-none"/></div>)}
  </div><button onClick={()=>fin(juego.items.filter((it,i)=>(r[i]||"").trim().toLowerCase()===it.respuesta.trim().toLowerCase()).length*40)} className="mt-6 w-full rounded-2xl bg-violet-600 py-4 font-black text-white">Comprobar crucigrama</button></section>
}

function VF({juego,fin}:{juego:Extract<Juego,{tipo:"verdadero_falso"}>;fin:(p:number)=>void}) {
  const [i,setI]=useState(0), [pts,setPts]=useState(0); const it=juego.items[i];
  function resp(v:boolean){const n=pts+(v===it.respuesta?40:0);setPts(n);if(i+1>=juego.items.length)fin(n);else setI(x=>x+1)}
  return <section className="mx-auto max-w-3xl rounded-[32px] bg-white p-6 text-center shadow-sm sm:p-9"><p className="text-sm font-black text-sky-500">Pregunta {i+1} de {juego.items.length}</p><div className="mx-auto mt-6 grid h-20 w-20 place-items-center rounded-full bg-sky-50 text-4xl">🦝</div><h2 className="mt-6 text-2xl font-black leading-9">{it.afirmacion}</h2><div className="mt-8 grid grid-cols-2 gap-4"><button onClick={()=>resp(true)} className="rounded-2xl bg-emerald-500 py-4 font-black text-white"><Check className="mx-auto mb-1"/>Verdadero</button><button onClick={()=>resp(false)} className="rounded-2xl bg-rose-500 py-4 font-black text-white"><X className="mx-auto mb-1"/>Falso</button></div></section>
}
