"use client";

import { useState,useRef,useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import{

ArrowLeft,
Send,
Bot,
User,
Sparkles

}

from "lucide-react";

interface Mensaje{

tipo:string;
texto:string;

}

export default function Chat(){

const [mensaje,setMensaje]=
useState("");

const [cargando,setCargando]=
useState(false);

const [mensajes,setMensajes]=
useState<Mensaje[]>([

{

tipo:"ia",

texto:
"👋 ¡Hola! Soy Raccoon IA.\n\nEstoy lista para ayudarte a estudiar.\n\n¿Qué quieres aprender hoy?"

}

]);

const finalRef=
useRef<HTMLDivElement>(null);

useEffect(()=>{

finalRef.current?.scrollIntoView({

behavior:"smooth"

});

},[mensajes]);

async function preguntar(){

if(!mensaje.trim()) return;

const pregunta=mensaje;

setMensajes(prev=>[

...prev,

{

tipo:"user",
texto:pregunta

}

]);

setMensaje("");

setCargando(true);

try{

const res=
await fetch("/Api/Chat",{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

mensaje:pregunta

})

});

const data=
await res.json();

setMensajes(prev=>[

...prev,

{

tipo:"ia",
texto:data.respuesta

}

]);

}catch{

setMensajes(prev=>[

...prev,

{

tipo:"ia",
texto:"❌ Error conectando con Raccoon IA"

}

]);

}

setCargando(false);

}

return(

<div className="

min-h-screen
flex
flex-col

bg-gradient-to-b

from-[#B9D1F8]
via-[#DDEBFF]
to-[#EEF5FF]

dark:from-slate-950
dark:via-slate-900
dark:to-slate-800

">

{/* HEADER */}

<header className="

sticky
top-0
z-50

backdrop-blur-xl

bg-white/60
dark:bg-slate-900/60

border-b

px-4
md:px-8

py-4

">

<div className="

max-w-6xl
mx-auto

flex
items-center
gap-4

">

<Link

href="/Dashboard"

className="

bg-white
dark:bg-slate-800

w-14
h-14

rounded-2xl

shadow-lg

flex
justify-center
items-center

hover:scale-105
duration-300

"

>

<ArrowLeft/>

</Link>


<div className="flex items-center gap-3">

<Image

src="/raccoon.png"
width={55}
height={55}

alt="Raccoon Logo"

/>

<div>

<h1 className="

font-black
text-3xl

dark:text-white

">

Raccoon

<span className="text-blue-600">

IA

</span>

<Sparkles

size={18}

className="

inline
ml-2

text-yellow-500

"

/>

</h1>

<p className="text-gray-500">

Tu tutor inteligente

</p>

</div>

</div>

</div>

</header>


{/* MENSAJES */}

<div className="

flex-1
overflow-y-auto

px-4
md:px-8

py-8

">

<div className="

max-w-5xl
mx-auto

space-y-8

">

{

mensajes.map((m,index)=>(

<div

key={index}

className={`

flex

${
m.tipo==="user"

?

"justify-end"

:

"justify-start"

}

`}

>

<div

className={`

rounded-[35px]

p-6

shadow-2xl

max-w-[90%]
md:max-w-[70%]

transition-all

${
m.tipo==="user"

?

`

bg-gradient-to-r
from-cyan-500
via-blue-500
to-purple-500

text-white

`

:

`

bg-white
dark:bg-slate-800

dark:text-white

`

}

`}

>

<div className="

flex
items-center
gap-2

mb-4

font-bold

">

{

m.tipo==="user"

?

<>

<User size={18}/>

Tú

</>

:

<>

<Bot size={18}/>

Raccoon IA

</>

}

</div>


<div className="

prose
dark:prose-invert

max-w-none

prose-p:leading-8
prose-li:leading-8
prose-code:text-blue-500

">

<ReactMarkdown
remarkPlugins={[remarkGfm]}
>

{m.texto}

</ReactMarkdown>

</div>

</div>

</div>

))

}


{

cargando&&(

<div>

<div className="

bg-white
dark:bg-slate-800

p-6

rounded-3xl

shadow-xl

w-32

">

<div className="flex gap-2">

<div className="

w-3
h-3

rounded-full
bg-blue-500

animate-bounce

"/>

<div className="

w-3
h-3

rounded-full
bg-cyan-500

animate-bounce

"/>

<div className="

w-3
h-3

rounded-full
bg-purple-500

animate-bounce

"/>

</div>

</div>

</div>

)

}

<div ref={finalRef}/>

</div>

</div>


{/* INPUT */}

<div className="

sticky
bottom-0

border-t

bg-white/70
dark:bg-slate-900/70

backdrop-blur-xl

p-4

">

<div className="

max-w-5xl
mx-auto

flex
gap-4

">

<textarea

rows={1}

value={mensaje}

onChange={(e)=>
setMensaje(
e.target.value
)
}

placeholder="Pregunta algo..."

className="

flex-1

rounded-full

border

px-6
py-4

outline-none

resize-none

bg-white
dark:bg-slate-800

dark:text-white

focus:ring-4
focus:ring-blue-300

"

/>


<button

onClick={preguntar}

disabled={cargando}

className="

w-16
h-16

rounded-full

bg-gradient-to-r
from-cyan-500
to-purple-500

text-white

shadow-xl

hover:scale-110

duration-300

flex
justify-center
items-center

"

>

<Send/>

</button>

</div>

</div>

</div>

);

}