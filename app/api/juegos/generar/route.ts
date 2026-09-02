import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TipoJuego = "memoria"|"crucigrama"|"ahorcado"|"relaciona"|"verdadero_falso";

function token(req:NextRequest){
  const a=req.headers.get("authorization");
  return a?.toLowerCase().startsWith("bearer ")?a.slice(7).trim():null;
}

function admin(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error("Faltan variables de Supabase.");
  return createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
}

function textoMaterial(m:Record<string,unknown>){
  return [m.texto_extraido,m.contenido_texto,m.contenido,m.texto,m.resumen,m.descripcion]
    .filter((v):v is string=>typeof v==="string"&&v.trim().length>0).join("\n\n").slice(0,50000);
}

function nombre(m:Record<string,unknown>){
  return [m.nombre,m.titulo,m.file_name,m.filename].find((v):v is string=>typeof v==="string"&&v.trim().length>0)||"Material de estudio";
}

function formato(tipo:TipoJuego){
  if(tipo==="memoria") return `{"parejas":[{"concepto":"...","definicion":"..."}]} Genera 6 parejas.`;
  if(tipo==="ahorcado") return `{"palabras":[{"palabra":"...","pista":"..."}]} Genera 5 palabras importantes con pistas.`;
  if(tipo==="crucigrama") return `{"items":[{"pista":"...","respuesta":"..."}]} Genera 8 pistas con respuestas cortas.`;
  if(tipo==="relaciona") return `{"parejas":[{"izquierda":"...","derecha":"..."}]} Genera 6 relaciones.`;
  return `{"items":[{"afirmacion":"...","respuesta":true,"explicacion":"..."}]} Genera 8 afirmaciones mezclando verdaderas y falsas.`;
}

export async function POST(req:NextRequest){
  try{
    const t=token(req);
    if(!t) return NextResponse.json({error:"Debes iniciar sesión."},{status:401});

    const body=await req.json();
    const materialId=String(body?.materialId||"");
    const tipo=String(body?.tipo||"") as TipoJuego;
    const dificultad=String(body?.dificultad||"medio");
    const validos:TipoJuego[]=["memoria","crucigrama","ahorcado","relaciona","verdadero_falso"];
    if(!materialId||!validos.includes(tipo)) return NextResponse.json({error:"Solicitud no válida."},{status:400});

    const sb=admin();
    const {data:{user},error:authError}=await sb.auth.getUser(t);
    if(authError||!user) return NextResponse.json({error:"Sesión inválida."},{status:401});

    const {data:material,error}=await sb.from("materiales").select("*").eq("id",materialId).eq("usuario_id",user.id).maybeSingle();
    if(error) return NextResponse.json({error:error.message},{status:500});
    if(!material) return NextResponse.json({error:"No encontramos ese material."},{status:404});

    const m=material as Record<string,unknown>;
    const texto=textoMaterial(m);
    if(texto.length<80) return NextResponse.json({error:"El material todavía no tiene suficiente texto procesado."},{status:400});

    const apiKey=process.env.OPENAI_API_KEY;
    if(!apiKey) throw new Error("Falta OPENAI_API_KEY.");
    const openai=new OpenAI({apiKey});

    const c=await openai.chat.completions.create({
      model:"gpt-4o-mini",
      temperature:0.4,
      response_format:{type:"json_object"},
      messages:[
        {role:"system",content:"Eres la IA educativa de Raccoon Study. Genera juegos fieles al material. Responde solo JSON válido."},
        {role:"user",content:`Crea un juego en español usando EXCLUSIVAMENTE este material. Dificultad: ${dificultad}. Tipo: ${tipo}. Formato: ${formato(tipo)}\n\nMATERIAL:\n${texto}`}
      ]
    });

    const raw=c.choices[0]?.message?.content;
    if(!raw) throw new Error("La IA no devolvió contenido.");
    const g=JSON.parse(raw) as Record<string,unknown>;
    let juego:Record<string,unknown>;

    if(tipo==="memoria"){
      const parejas=Array.isArray(g.parejas)?g.parejas:[];
      const cartas=parejas.flatMap((p:any,i:number)=>[
        {id:`c-${i}-a`,parejaId:`p-${i}`,texto:String(p?.concepto||"")},
        {id:`c-${i}-b`,parejaId:`p-${i}`,texto:String(p?.definicion||"")}
      ]);
      juego={tipo,titulo:"Memoria Raccoon",dificultad,materialNombre:nombre(m),cartas};
    } else if(tipo==="ahorcado"){
      juego={tipo,titulo:"Ahorcado Raccoon",dificultad,materialNombre:nombre(m),palabras:Array.isArray(g.palabras)?g.palabras:[]};
    } else if(tipo==="crucigrama"){
      juego={tipo,titulo:"Crucigrama Raccoon",dificultad,materialNombre:nombre(m),items:Array.isArray(g.items)?g.items:[]};
    } else if(tipo==="relaciona"){
      const parejas=Array.isArray(g.parejas)?g.parejas.map((p:any,i:number)=>({id:`p-${i}`,izquierda:String(p?.izquierda||""),derecha:String(p?.derecha||"")})):[];
      juego={tipo,titulo:"Relaciona Raccoon",dificultad,materialNombre:nombre(m),parejas};
    } else {
      juego={tipo,titulo:"Verdadero o falso",dificultad,materialNombre:nombre(m),items:Array.isArray(g.items)?g.items:[]};
    }

    return NextResponse.json({success:true,juego});
  }catch(e){
    console.error("Error generando juego:",e);
    return NextResponse.json({error:e instanceof Error?e.message:"No se pudo generar el juego."},{status:500});
  }
}
