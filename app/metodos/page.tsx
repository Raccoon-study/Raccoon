"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import {
Menu,
Bell,
Home,
Brain,
User,
FileText,
Sparkles,
X,
Settings,
HelpCircle,
User2Icon
} from "lucide-react";

interface Material{
id:string;
nombre_archivo:string;
fecha_subida:string;
}

interface Recomendacion{
metodo:string;
motivo:string;
ruta:string;
}

export default function Metodos(){

const [materiales,setMateriales]=
useState<Material[]>([]);

const [recomendacion,setRecomendacion]=
useState<Recomendacion|null>(null);

const [menuAbierto,setMenuAbierto]=
useState(false);

const [nombreUsuario,setNombreUsuario]=
useState("Usuario");


useEffect(()=>{

obtenerUsuario();
obtenerMateriales();

},[]);


const obtenerUsuario=
async()=>{

const{
data:{user}
}
=
await supabase.auth.getUser();

if(!user)return;

setNombreUsuario(

user.user_metadata?.nombre
||
"Usuario"

);

};



const obtenerMateriales=
async()=>{

const{
data:{user}
}
=
await supabase.auth.getUser();

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
);

setMateriales(
data||[]
);

if(data?.length){

analizarMaterial(
data[0]
);

}

};



const analizarMaterial=
async(
material:Material
)=>{

if(!material)return;

const texto=
material.nombre_archivo
.toLowerCase();

let resultado={

metodo:"Pomodoro",
motivo:
"Este material parece requerir concentración sostenida.",
ruta:"/metodos/pomodoro"

};

if(
texto.includes("historia")
){

resultado={

metodo:"Flashcards",

motivo:
"Historia funciona muy bien con repetición activa.",

ruta:"/metodos/flashcards"

};

}

else if(
texto.includes("biologia")
||
texto.includes("quimica")
){

resultado={

metodo:"Mapa Mental",

motivo:
"Las relaciones entre conceptos ayudan a aprender.",

ruta:"/metodos/cornell"

};

}

else if(
texto.includes("matematica")
||
texto.includes("fisica")
){

resultado={

metodo:"Feynman",

motivo:
"Explicar conceptos ayuda a entenderlos.",

ruta:"/metodos/feynman"

};

}

setRecomendacion(
resultado
);

};



const metodos=[

{
titulo:"Pomodoro",
icono:"🍅",
ruta:"/metodos/pomodoro",
descripcion:"Bloques de estudio y descanso"
},

{
titulo:"Flashcards",
icono:"🪪",
ruta:"/metodos/flashcards",
descripcion:"Tarjetas generadas por IA"
},

{
titulo:"Feynman",
icono:"🧠",
ruta:"/metodos/feynman",
descripcion:"Explica para aprender"
},

{
titulo:"Cornell",
icono:"📄",
ruta:"/metodos/cornell",
descripcion:"Sistema de apuntes"
},

{
titulo:"Blurting",
icono:"✍️",
ruta:"/metodos/blurting",
descripcion:"Escribe sin mirar"
},

{
titulo:"Active Recall",
icono:"❓",
ruta:"/metodos/active-recall",
descripcion:"Recuerda sin revisar"
},

{
titulo:"Leitner",
icono:"📦",
ruta:"/metodos/leitner",
descripcion:"Sistema por niveles"
},

{
titulo:"Resúmenes",
icono:"📚",
ruta:"/metodos/resumenes",
descripcion:"Resúmenes inteligentes"
}

];



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

transition-all

pb-28

">


{/* MENU LATERAL */}

<div className={`

fixed
top-0
left-0
h-full
w-[280px]

bg-white
dark:bg-slate-900

shadow-2xl
z-50

transform
duration-300

${menuAbierto
?
"translate-x-0"
:
"-translate-x-full"
}

`}>

<div className="p-6">

<div className="flex justify-between">

<div>

<h2 className="font-bold text-xl dark:text-white">

{nombreUsuario}

</h2>

<p className="text-gray-400">

Raccoon Study

</p>

</div>

<button
onClick={()=>
setMenuAbierto(false)
}
>

<X/>

</button>

</div>


<div className="mt-8 flex flex-col gap-4">

<Link href="/Dashboard">

Inicio

</Link>

<Link href="/perfil">

Perfil

</Link>

<Link href="/configuracion">

Configuración

</Link>

<Link href="/Ayuda">

Ayuda

</Link>

</div>

</div>

</div>


<header className="

flex
justify-between
items-center

px-5
pt-6

"
>

<Menu
className="text-blue-600 cursor-pointer"
onClick={()=>
setMenuAbierto(true)
}
/>

<h1 className="font-bold text-xl">

Raccoon

<span className="text-blue-600">

Study

</span>

</h1>

<Bell className="text-blue-600"/>

</header>


<main className="px-5 mt-6">

<h2 className="

text-3xl
font-bold
dark:text-white

">

Métodos 📚

</h2>

<p className="text-gray-500">

La IA analizará tus materiales

</p>



{recomendacion&&(

<Link
href={recomendacion.ruta}
>

<div className="

mt-6

bg-gradient-to-r
from-blue-600
to-cyan-400

rounded-[30px]

text-white

p-6

shadow-xl

">

<div className="flex gap-2">

<Sparkles/>

<h3 className="font-bold">

Recomendado por IA

</h3>

</div>

<h2 className="text-2xl font-bold mt-3">

{recomendacion.metodo}

</h2>

<p className="mt-2">

{recomendacion.motivo}

</p>

</div>

</Link>

)}



<div className="

grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3

gap-5

mt-8

">

{

metodos.map(
(item)=>(

<Link
key={item.titulo}
href={item.ruta}
>

<div className="

bg-white
dark:bg-slate-800

rounded-[30px]

shadow-lg

p-5

hover:scale-[1.03]
transition

">

<div className="text-4xl">

{item.icono}

</div>

<h3 className="

font-bold
mt-4
dark:text-white

">

{item.titulo}

</h3>

<p className="text-gray-500 text-sm mt-2">

{item.descripcion}

</p>

</div>

</Link>

)

)

}

</div>

</main>


<nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t flex justify-around py-4 z-30">

<Link href="/Dashboard">

<Home className="text-blue-600"/>

</Link>

<Link href="/metodos">

<Brain className="text-gray-400"/>

</Link>

<Link href="/quizzes">

<FileText className="text-gray-400"/>

</Link>

<Link href="/perfil">

<User2Icon className="text-gray-400"/>

</Link>

</nav>

</div>

);

}