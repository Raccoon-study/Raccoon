"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
Menu,
Bell,
ChevronRight,
Settings,
User,
BookOpen,
Palette,
Globe,
Info,
Home,
Layers,
HelpCircle
} from "lucide-react";

export default function ConfiguracionScreen(){

const [tema,setTema]=useState("system");

useEffect(()=>{

const temaGuardado=
localStorage.getItem("tema") || "system";

setTema(temaGuardado);

aplicarTema(temaGuardado);

},[]);


const aplicarTema=(nuevoTema:string)=>{

setTema(nuevoTema);

localStorage.setItem(
"tema",
nuevoTema
);

const html=
document.documentElement;

html.classList.remove("dark");

if(nuevoTema==="dark"){

html.classList.add("dark");

}

if(nuevoTema==="system"){

const oscuro=

window.matchMedia(
"(prefers-color-scheme: dark)"
).matches;

if(oscuro){

html.classList.add("dark");

}

}

};


const opciones=[

{
titulo:"Perfil",
descripcion:"Edita tu información personal",
icono:<User size={20}/>,
color:"text-blue-500 bg-blue-100 dark:bg-blue-900/40"
},

{
titulo:"Preferencias",
descripcion:"Personaliza tu aprendizaje",
icono:<BookOpen size={20}/>,
color:"text-purple-500 bg-purple-100 dark:bg-purple-900/40"
},

{
titulo:"Idioma",
descripcion:"Selecciona idioma",
icono:<Globe size={20}/>,
color:"text-green-500 bg-green-100 dark:bg-green-900/40"
},

{
titulo:"Acerca de",
descripcion:"Información de la app",
icono:<Info size={20}/>,
color:"text-cyan-500 bg-cyan-100 dark:bg-cyan-900/40"
}

];

return(

<main
className="

min-h-screen

bg-gradient-to-b
from-[#B9D1F8]
via-[#D8E7FF]
to-[#EEF5FF]

dark:from-slate-900
dark:via-slate-800
dark:to-slate-950

transition-all
duration-500

pb-28
"
>

<div
className="

max-w-[1200px]
mx-auto

px-4
sm:px-6
lg:px-10
"
>

{/* HEADER */}

<header
className="

flex
justify-between
items-center

pt-6
"
>

<button
className="

p-3

rounded-xl

bg-white/70
dark:bg-slate-800

shadow
"
>

<Menu
className="
text-slate-700
dark:text-white
"
/>

</button>

<h1
className="

font-bold
text-xl
md:text-2xl

text-slate-900
dark:text-white
"
>

Raccoon

<span className="text-blue-600">

Study

</span>

</h1>

<button
className="

relative

p-3

rounded-xl

bg-white/70
dark:bg-slate-800

shadow
"
>

<Bell
className="
text-slate-700
dark:text-white
"
/>

<div
className="
absolute
top-2
right-2

w-2
h-2

rounded-full
bg-red-500
"
/>

</button>

</header>


{/* TITULO */}

<section className="mt-8">

<div
className="

w-16
h-16

rounded-2xl

bg-white
dark:bg-slate-800

shadow

flex
items-center
justify-center
"
>

<Settings
size={30}
className="
text-blue-600
"
/>

</div>

<h2
className="

mt-5

text-3xl
md:text-5xl

font-extrabold

text-slate-900
dark:text-white
"
>

Configuración

</h2>

<p
className="
text-slate-500
dark:text-slate-300
mt-2
"
>

Personaliza tu experiencia

</p>

</section>



{/* TEMA */}

<section
className="

bg-white/90
dark:bg-slate-800

mt-6

rounded-[35px]

shadow-xl

p-6
"
>

<div className="flex items-center gap-3">

<div
className="

w-11
h-11

rounded-xl

bg-yellow-100
dark:bg-yellow-900/30

flex
items-center
justify-center
"
>

<Palette
className="text-yellow-500"
/>

</div>

<div>

<h3
className="
font-bold
dark:text-white
"
>

Tema

</h3>

<p
className="
text-sm
text-gray-500
dark:text-gray-300
"
>

Selecciona apariencia

</p>

</div>

</div>


<div
className="

grid

grid-cols-1
sm:grid-cols-3

gap-3

mt-6
"
>

{["light","dark","system"].map((op)=>(

<button
key={op}

onClick={()=>
aplicarTema(op)
}

className={`

py-4

rounded-2xl

font-semibold

transition

${
tema===op
?

"bg-gradient-to-r from-[#2563ff] to-[#18C3F7] text-white"

:

"bg-slate-100 dark:bg-slate-700 dark:text-white"

}

`}
>

{op==="light"
? "☀️ Claro"

:op==="dark"
? "🌙 Oscuro"

:"💻 Sistema"}

</button>

))}

</div>

</section>



{/* OPCIONES */}

<section
className="

mt-6

bg-white/90
dark:bg-slate-800

rounded-[35px]

shadow-xl

overflow-hidden
"
>

{opciones.map((item,index)=>(

<div

key={index}

className="

flex
justify-between
items-center

p-5

border-b

border-slate-200
dark:border-slate-700

hover:bg-slate-50
dark:hover:bg-slate-700

transition
"

>

<div className="flex gap-4">

<div
className={`
w-12
h-12
rounded-xl

flex
items-center
justify-center

${item.color}
`}
>

{item.icono}

</div>

<div>

<h3
className="
font-bold
dark:text-white
"
>

{item.titulo}

</h3>

<p
className="
text-sm
text-gray-500
dark:text-gray-300
"
>

{item.descripcion}

</p>

</div>

</div>

<ChevronRight
className="
text-gray-400
"
/>

</div>

))}

</section>

</div>



{/* FOOTER */}

<nav
className="

fixed
bottom-0
left-0

w-full

bg-white/95
dark:bg-slate-900/95

backdrop-blur-md

border-t
border-slate-200
dark:border-slate-700

px-2
sm:px-6

py-3

z-50
"
>

<div
className="

max-w-[700px]

mx-auto

flex
justify-around
items-center
"
>

<Link
href="/Dashboard"
className="
flex
flex-col
items-center

text-xs

text-gray-500
dark:text-gray-300
"
>

<Home size={22}/>
<span>Inicio</span>

</Link>

<Link
href="/metodos"
className="
flex
flex-col
items-center

text-xs

text-gray-500
dark:text-gray-300
"
>

<Layers size={22}/>
<span>Métodos</span>

</Link>

<Link
href="/quizzes"
className="
flex
flex-col
items-center

text-xs

text-gray-500
dark:text-gray-300
"
>

<HelpCircle size={22}/>
<span>Quiz</span>

</Link>

<Link
href="/perfil"
className="
flex
flex-col
items-center

text-xs

text-blue-600
font-bold
"
>

<User size={22}/>
<span>Perfil</span>

</Link>

</div>

</nav>

</main>

);

}