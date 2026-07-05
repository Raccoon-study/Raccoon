"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect,useState } from "react";
import { supabase } from "../../lib/supabase";

import{
ArrowLeft,
FileText,
Save
} from "lucide-react";

interface Material{
id:string;
nombre_archivo:string;
}

export default function Cornell(){

const [material,setMaterial]=
useState<Material|null>(null);

const [preguntas,setPreguntas]=
useState("");

const [notas,setNotas]=
useState("");

const [resumen,setResumen]=
useState("");

useEffect(()=>{

obtenerMaterial();

},[]);


const obtenerMaterial=
async()=>{

const{
data:{user}
}=await supabase.auth.getUser();

if(!user)return;

const {data}=await supabase
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


const guardar=()=>{

localStorage.setItem(
"cornellPreguntas",
preguntas
);

localStorage.setItem(
"cornellNotas",
notas
);

localStorage.setItem(
"cornellResumen",
resumen
);

alert("Notas guardadas 🎉");

};

useEffect(()=>{

setPreguntas(
localStorage.getItem(
"cornellPreguntas"
)||""
);

setNotas(
localStorage.getItem(
"cornellNotas"
)||""
);

setResumen(
localStorage.getItem(
"cornellResumen"
)||""
);

},[]);



return(

<div className="

min-h-screen

bg-gradient-to-b
from-[#B9D1F8]
via-[#DDEBFF]
to-[#EEF5FF]

dark:from-slate-900
dark:via-slate-800
dark:to-slate-950

p-4
md:p-8

">

{/* HEADER */}

<div className="flex items-center gap-4">

<Link
href="/metodos"
className="
bg-white
dark:bg-slate-800
p-3
rounded-2xl
shadow
"
>

<ArrowLeft/>

</Link>

<h1 className="

font-bold
text-2xl

dark:text-white

">

📄 Cornell Notes

</h1>

</div>



{/* CARD SUPERIOR */}

<div className="

mt-8

bg-white
dark:bg-slate-800

rounded-[35px]

shadow-xl

p-6

text-center

">

<Image
src="/raccoon.png"
alt="raccoon"
width={80}
height={80}
className="mx-auto"
/>

<h2 className="

text-2xl
font-bold
mt-4

dark:text-white

">

Aprende organizando ideas

</h2>

<p className="

text-gray-500
mt-2

">

Divide tus apuntes en preguntas,
notas y resumen final.

</p>


{material&&(

<div className="

mt-5

bg-[#EEF5FF]
dark:bg-slate-700

rounded-2xl

p-4

">

<p className="text-sm text-gray-500">

Último material cargado

</p>

<h3 className="font-bold dark:text-white">

📘 {material.nombre_archivo}

</h3>

</div>

)}

</div>



{/* ESTRUCTURA CORNELL */}

<div className="

mt-8

grid

grid-cols-1
lg:grid-cols-3

gap-6

">

{/* preguntas */}

<div className="

bg-white
dark:bg-slate-800

rounded-[30px]

shadow-lg

p-5

">

<h3 className="

font-bold
mb-3

dark:text-white

">

Preguntas clave

</h3>

<textarea

value={preguntas}

onChange={(e)=>
setPreguntas(
e.target.value
)
}

placeholder="Escribe preguntas..."

className="

w-full
h-[300px]

bg-[#EEF5FF]
dark:bg-slate-700

rounded-2xl

p-4

outline-none

dark:text-white

resize-none

"

/>

</div>


{/* notas */}

<div className="

bg-white
dark:bg-slate-800

rounded-[30px]

shadow-lg

p-5

">

<h3 className="

font-bold
mb-3

dark:text-white

">

Notas

</h3>

<textarea

value={notas}

onChange={(e)=>
setNotas(
e.target.value
)
}

placeholder="Escribe apuntes..."

className="

w-full
h-[300px]

bg-[#EEF5FF]
dark:bg-slate-700

rounded-2xl

p-4

outline-none

dark:text-white

resize-none

"

/>

</div>


{/* resumen */}

<div className="

bg-white
dark:bg-slate-800

rounded-[30px]

shadow-lg

p-5

">

<h3 className="

font-bold
mb-3

dark:text-white

">

Resumen

</h3>

<textarea

value={resumen}

onChange={(e)=>
setResumen(
e.target.value
)
}

placeholder="Resume lo aprendido..."

className="

w-full
h-[300px]

bg-[#EEF5FF]
dark:bg-slate-700

rounded-2xl

p-4

outline-none

dark:text-white

resize-none

"

/>

</div>

</div>



<button

onClick={guardar}

className="

mt-8

bg-gradient-to-r
from-blue-600
to-cyan-500

text-white

rounded-2xl

px-6
py-4

flex
items-center
gap-3

mx-auto

"

>

<Save/>

Guardar notas

</button>

</div>

);

}