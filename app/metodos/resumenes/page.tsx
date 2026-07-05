"use client";

import {useState} from "react";
import Image from "next/image";

export default function Resumenes(){

const [resumen]=
useState("Aquí aparecerá el resumen generado por IA");

return(

<div className="min-h-screen bg-gradient-to-b from-[#B9D1F8] via-[#DDEBFF] to-[#EEF5FF] dark:from-slate-900 dark:to-slate-950 p-5">

<div className="bg-white dark:bg-slate-800 rounded-[35px] p-6">

<Image
src="/raccoon.png"
width={80}
height={80}
alt=""
className="mx-auto"
/>

<h1 className="text-center font-bold text-2xl dark:text-white">

📚 Resúmenes IA

</h1>

<div className="bg-[#EEF4FF] dark:bg-slate-700 p-5 rounded-3xl mt-6">

{resumen}

</div>

</div>

</div>

)

}