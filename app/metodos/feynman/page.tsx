"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/app/lib/supabase";

import {
ArrowLeft,
Brain,
Send,
CheckCircle
} from "lucide-react";

interface Material{
id:string;
nombre_archivo:string;
}

export default function Feynman(){

const [material,setMaterial]=
useState<Material|null>(null);

const [explicacion,setExplicacion]=
useState("");

const [respuesta,setRespuesta]=
useState("");

const [cargando,setCargando]=
useState(false);

useEffect(()=>{

obtenerMaterial();

},[]);


const obtenerMaterial=
async()=>{

const{
data:{user}
}=await supabase.auth.getUser();

if(!user)return;

const{data}=await supabase
.from("materiales")
.select("*")
.eq(
"usuario_id",
user.id
)
.order(
"fecha_subida",
{
ascending:false
}
)
.limit(1);

if(data?.length){

setMaterial(data[0]);

}

};


const analizarExplicacion=
async()=>{

if(!explicacion.trim())return;

setCargando(true);

try{

const res=
await fetch("/api/ia",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

texto:`

Analiza esta explicación usando método Feynman.

Tema:
${material?.nombre_archivo}

Explicación:
${explicacion}

Dime:
1. Qué comprendió bien
2. Qué necesita reforzar
3. Cómo mejorarlo

`

})

});

const data=
await res.json();

setRespuesta(
data.resultado
);

}catch{

setRespuesta(
"❌ Error analizando explicación"
);

}

setCargando(false);

};


return(

<div
className="

min-h-screen

bg-gradient-to-b
from-[#B9D1F8]
via-[#DDEBFF]
to-[#EEF5FF]

dark:from-slate-900
dark:via-slate-800
dark:to-slate-950

transition-all
duration-500

p-5
"

>

<div className="max-w-5xl mx-auto">

{/* HEADER */}

<div className="flex items-center gap-4">

<Link
href="/metodos"
className="
bg-white
dark:bg-slate-800
p-3
rounded-2xl
shadow-lg
"
>

<ArrowLeft/>

</Link>

<h1
className="
font-bold
text-2xl
dark:text-white
flex
items-center
gap-2
"
>

🧠 Método Feynman

</h1>

</div>


{/* RACCOON */}

<div
className="
mt-6
bg-white
dark:bg-slate-800
rounded-[35px]
shadow-xl
p-6
text-center
"
>

<Image
src="/raccoon.png"
alt="raccoon"
width={80}
height={80}
className="mx-auto"
/>

<h2
className="
font-bold
text-xl
mt-3
dark:text-white
"
>

Aprende explicando

</h2>

<p
className="
text-gray-500
mt-2
"
>

Si puedes explicarlo con palabras simples,
realmente lo entiendes.

</p>

</div>


{/* MATERIAL */}

<div
className="
mt-6
bg-white
dark:bg-slate-800
rounded-[35px]
p-6
shadow-xl
"
>

<p className="text-gray-400">

Material usado:

</p>

<h2
className="
font-bold
text-lg
mt-2
dark:text-white
"
>

{material?.nombre_archivo ||
"No hay material"}

</h2>

</div>


{/* EXPLICACIÓN */}

<div
className="
mt-6
bg-white
dark:bg-slate-800
rounded-[35px]
p-6
shadow-xl
"
>

<div className="flex gap-2">

<Brain
className="text-blue-600"
/>

<h2
className="
font-bold
dark:text-white
"
>

Explícalo con tus palabras

</h2>

</div>

<textarea
value={explicacion}
onChange={(e)=>
setExplicacion(
e.target.value
)
}

placeholder="Escribe aquí tu explicación..."

className="

w-full
mt-5

h-[200px]

rounded-2xl
border

bg-transparent

p-4

dark:text-white

outline-none

"
/>

<button
onClick={
analizarExplicacion
}

disabled={cargando}

className="

mt-5

w-full

bg-gradient-to-r
from-blue-600
to-cyan-400

text-white

py-4

rounded-2xl

font-bold

flex
justify-center
items-center
gap-2

"

>

<Send size={18}/>

{

cargando
?
"Analizando..."
:
"Analizar explicación"

}

</button>

</div>


{/* RESPUESTA IA */}

{respuesta&&(

<div
className="

mt-6

bg-white
dark:bg-slate-800

rounded-[35px]

p-6

shadow-xl

"

>

<div className="flex gap-2">

<CheckCircle
className="
text-green-500
"
/>

<h2
className="
font-bold
dark:text-white
"
>

Raccoon IA

</h2>

</div>

<p
className="
mt-4
whitespace-pre-wrap
text-gray-600
dark:text-gray-300
"
>

{respuesta}

</p>

</div>

)}

</div>

</div>

);

}