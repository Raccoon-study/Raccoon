"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import {
Menu,
Bell,
Sparkles,
Brain,
Home,
Grid,
HelpCircle,
User2Icon,
Play,
FileText
} from "lucide-react";

interface Material{

id:string;
nombre_archivo:string;

}

interface Quiz{

id:number;
titulo:string;
preguntas:number;
progreso:number;

}

export default function Quizzes(){

const [materiales,setMateriales]=
useState<Material[]>([]);

const [quizzes,setQuizzes]=
useState<Quiz[]>([]);

const [loading,setLoading]=
useState(false);

useEffect(()=>{

cargarUsuario();

},[]);


async function cargarUsuario(){

const {

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
});

setMateriales(
data||[]
);

}


async function generarQuiz(){

setLoading(true);

if(materiales.length===0){

alert(
"Sube material primero"
);

setLoading(false);

return;

}

const ultimo=
materiales[0];

const nuevoQuiz={

id:Date.now(),

titulo:
ultimo.nombre_archivo.replace(
".pdf",
""
),

preguntas:10,

progreso:0

};

setQuizzes(
prev=>[
nuevoQuiz,
...prev
]
);

setLoading(false);

}



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

pb-32

">

<header className="

flex
justify-between
items-center

px-5
pt-6

">

<button>

<Menu
className="text-blue-600"
/>

</button>

<h1 className="

font-bold
text-xl

dark:text-white

">

Raccoon

<span className="text-blue-600">

Study

</span>

</h1>

<Bell
className="text-blue-600"
/>

</header>


<main className="px-5 mt-6 max-w-6xl mx-auto">

<div className="

bg-white
dark:bg-slate-800

rounded-[35px]

shadow-xl

p-8

">

<div className="text-center">

<div className="text-6xl">

🦝🧠

</div>

<h2 className="

font-bold
text-3xl
mt-4

dark:text-white

">

Pon a prueba tu aprendizaje

</h2>

<p className="

text-gray-500
mt-4

">

La IA crea cuestionarios usando
tu material subido

</p>

<button

onClick={generarQuiz}

className="

mx-auto
mt-6

bg-blue-600
hover:bg-blue-700

text-white

px-6
py-4

rounded-full

flex
items-center
gap-2

"

>

<Sparkles size={18}/>

{

loading
?
"Generando..."
:
"Generar Quiz"

}

</button>

</div>

</div>



<div className="mt-8">

<h2 className="

font-bold
text-2xl

dark:text-white

">

Material reciente

</h2>


<div className="space-y-4 mt-4">

{

materiales.slice(0,3).map(
(material)=>(

<div
key={material.id}

className="

bg-white
dark:bg-slate-800

rounded-3xl

shadow

p-4

flex
items-center
gap-3

"

>

<FileText
className="
text-blue-600
"
/>

<div>

<h3 className="dark:text-white">

{material.nombre_archivo}

</h3>

</div>

</div>

))

}

</div>

</div>



<div className="mt-10">

<h2 className="

font-bold
text-2xl

dark:text-white

">

Quizzes generados

</h2>

<div className="

grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-3

gap-5
mt-5

">

{

quizzes.map(
(quiz)=>(

<div

key={quiz.id}

className="

bg-white
dark:bg-slate-800

rounded-[30px]

shadow-xl

p-5

"

>

<div className="flex justify-between">

<div className="text-4xl">

🧠

</div>

<Brain
className="
text-blue-600
"
/>

</div>

<h3 className="

font-bold
mt-4

dark:text-white

">

{quiz.titulo}

</h3>

<p className="text-gray-500">

{quiz.preguntas}
preguntas

</p>

<div className="

bg-gray-200

h-3

rounded-full

mt-4

">

<div

className="

bg-blue-600

h-3

rounded-full

"

style={{

width:
`${quiz.progreso}%`

}}

></div>

</div>

<button

className="

w-full

mt-5

bg-blue-600

text-white

rounded-xl

py-3

flex
justify-center
items-center
gap-2

"

>

<Play size={16}/>

Comenzar

</button>

</div>

))

}

</div>

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