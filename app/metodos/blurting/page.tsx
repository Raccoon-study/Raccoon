"use client";

import {useEffect,useState} from "react";
import {supabase} from "@/app/lib/supabase";

import Link from "next/link";
import Image from "next/image";

import{
ArrowLeft,
Save
}from "lucide-react";

export default function Blurting(){

const[
conceptos,
setConceptos
]=useState([]);

const[
texto,
setTexto
]=useState("");

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
.select("conceptos")
.eq(
"usuario_id",
user.id
)
.order(
"created_at",
{
ascending:false
}
)
.limit(1)
.single();

if(data){

setConceptos(
data.conceptos||[]
);

}

}

return(

<div className="min-h-screen bg-gradient-to-b from-[#B9D1F8] via-[#DDEBFF] to-[#EEF5FF] dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 p-5">

<div className="flex items-center gap-4">

<Link
href="/metodos"
className="bg-white dark:bg-slate-800 p-3 rounded-xl"
>

<ArrowLeft/>

</Link>

<h1 className="font-bold text-2xl dark:text-white">

✍️ Blurting

</h1>

</div>

<div className="bg-white dark:bg-slate-800 rounded-[35px] p-6 mt-8 max-w-4xl mx-auto">

<Image
src="/raccoon.png"
alt=""
width={70}
height={70}
className="mx-auto"
/>

<h2 className="font-bold text-center text-2xl mt-4 dark:text-white">

Escribe lo que recuerdes

</h2>

<div className="bg-blue-50 dark:bg-slate-700 rounded-2xl p-4 mt-5">

<p className="font-bold dark:text-white">

Conceptos:

</p>

<p className="dark:text-gray-300">

{conceptos.join(", ")}

</p>

</div>

<textarea
value={texto}
onChange={(e)=>setTexto(e.target.value)}
placeholder="Escribe..."
className="w-full mt-5 h-[300px] rounded-2xl p-4 bg-[#EEF5FF] dark:bg-slate-700 dark:text-white"
/>

</div>

</div>

)
}
