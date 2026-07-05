"use client";

import {useEffect,useState} from "react";
import {supabase} from "@/app/lib/supabase";
import Link from "next/link";
import Image from "next/image";

import{
ArrowLeft,
RefreshCcw
} from "lucide-react";

export default function ActiveRecall(){

const[
preguntas,
setPreguntas
]=useState([]);

const[
actual,
setActual
]=useState(0);

useEffect(()=>{

cargar();

},[]);

async function cargar(){

const {
data:{user}
}=await supabase.auth.getUser();

if(!user)return;

const {data}=await supabase
.from("ia_generaciones")
.select("preguntas")
.eq("usuario_id",user.id)
.order(
"created_at",
{ascending:false}
)
.limit(1)
.single();

if(data){

setPreguntas(
data.preguntas||[]
);

}

}

return(

<div className="min-h-screen bg-gradient-to-b from-[#B9D1F8] via-[#DDEBFF] to-[#EEF5FF] dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 p-4 sm:p-8">

<div className="flex items-center gap-4">

<Link
href="/metodos"
className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow"
>

<ArrowLeft/>

</Link>

<h1 className="text-2xl font-bold dark:text-white">

❓ Active Recall

</h1>

</div>

<div className="bg-white dark:bg-slate-800 rounded-[35px] p-6 mt-8 shadow-xl max-w-3xl mx-auto">

<Image
src="/raccoon.png"
alt=""
width={80}
height={80}
className="mx-auto"
/>

<h2 className="text-center font-bold text-2xl mt-4 dark:text-white">

Raccoon generó preguntas para ti

</h2>

<div className="bg-[#EEF5FF] dark:bg-slate-700 rounded-[30px] mt-6 min-h-[250px] flex items-center justify-center p-6">

<p className="text-center font-bold text-xl dark:text-white">

{
preguntas.length
?
preguntas[actual]
:
"Cargando preguntas..."
}

</p>

</div>

<button

onClick={()=>{

setActual(
(actual+1)%preguntas.length
)

}}

className="mt-6 bg-blue-600 text-white rounded-2xl py-4 w-full flex justify-center gap-2"

>

<RefreshCcw/>

Siguiente

</button>

</div>

</div>

)

}
