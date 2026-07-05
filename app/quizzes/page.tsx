"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

import{
Menu,
Bell,
Sparkles,
Brain,
Home,
FileText,
User2Icon,
Play,
X,
LogOut,
Settings
}from "lucide-react";

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

const router=useRouter();

const[
materiales,
setMateriales
]=useState<Material[]>([]);

const[
quizzes,
setQuizzes
]=useState<Quiz[]>([]);

const[
loading,
setLoading
]=useState(false);

const[
menuAbierto,
setMenuAbierto
]=useState(false);

const[
nombreUsuario,
setNombreUsuario
]=useState("Usuario");

useEffect(()=>{

cargarUsuario();

},[]);

async function cargarUsuario(){

const{
data:{user}
}=await supabase.auth.getUser();

if(!user)return;

setNombreUsuario(

user.user_metadata?.nombre
||
"Usuario"

);

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
);

setMateriales(
data||[]
);

}

async function cerrarSesion(){

await supabase.auth.signOut();

router.push(
"/login"
);

}

async function generarQuiz(){

setLoading(true);

if(
materiales.length===0
){

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

pb-32

transition-all

"
>

{/* MENU LATERAL */}

<div
className={`

fixed
top-0
left-0

h-full
w-[280px]

bg-white
dark:bg-slate-900

z-50

shadow-xl

transform
transition-all

${
menuAbierto
?
"translate-x-0"
:
"-translate-x-full"
}

`}
>

<div className="p-5">

<div className="flex justify-between">

<h2
className="
font-bold
text-xl
dark:text-white
"
>

Menú

</h2>

<X
onClick={()=>
setMenuAbierto(false)
}
className="cursor-pointer"
/>

</div>

<div className="mt-8">

<div className="flex gap-3 items-center">

<Image
src="/raccoon.png"
width={55}
height={55}
alt="raccoon"
/>

<div>

<h3
className="
font-bold
dark:text-white
"
>

{nombreUsuario}

</h3>

<p
className="
text-gray-500
text-sm
"
>

Estudiante

</p>

</div>

</div>

<div className="space-y-4 mt-8">

<Link
href="/Dashboard"
className="flex gap-3"
>

<Home/>
Inicio

</Link>

<Link
href="/configuracion"
className="flex gap-3"
>

<Settings/>

Configuración

</Link>

<button
onClick={
cerrarSesion
}
className="flex gap-3 text-red-500"
>

<LogOut/>

Cerrar sesión

</button>

</div>

</div>

</div>

</div>

<header
className="

flex
justify-between
items-center

px-5
pt-6

"
>

<Menu
className="
text-blue-600
cursor-pointer
"
onClick={()=>
setMenuAbierto(
true
)
}
/>

<h1
className="
font-bold
text-xl
dark:text-white
"
>

Raccoon

<span className="text-blue-600">

Study

</span>

</h1>

<Bell
className="text-blue-600"
/>

</header>

<main
className="
px-5
mt-6
max-w-6xl
mx-auto
"
>

<div
className="

bg-white
dark:bg-slate-800

rounded-[35px]

shadow-xl

p-8

"
>

<div className="text-center">

<Image
src="/raccoon.png"
width={140}
height={140}
alt="raccoon"
className="
mx-auto
"
/>

<h2
className="
font-bold
text-3xl
mt-4
dark:text-white
"
>

RaccoonStudy Quiz

</h2>

<p
className="
text-gray-500
mt-4
"
>

La IA crea cuestionarios usando
tus materiales subidos

</p>

<button

onClick={generarQuiz}

className="

mx-auto
mt-6

bg-gradient-to-r
from-blue-600
to-cyan-400

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

<div className="mt-10">

<h2
className="
font-bold
text-2xl
dark:text-white
"
>

Quizzes generados

</h2>

<div
className="

grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-3

gap-5
mt-5

"
>

{

quizzes.map(
quiz=>(

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

<Image
src="/raccoon.png"
width={60}
height={60}
alt="raccoon"
/>

<h3
className="
font-bold
mt-4
dark:text-white
"
>

{quiz.titulo}

</h3>

<p
className="
text-gray-500
"
>

{quiz.preguntas}
 preguntas

</p>

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

<nav
className="

fixed
bottom-0
left-0

w-full

bg-white
dark:bg-slate-900

border-t

flex
justify-around

py-4

z-30

"
>

<Link href="/Dashboard">

<Home className="text-gray-400"/>

</Link>

<Link href="/metodos">

<Brain className="text-gray-400"/>

</Link>

<Link href="/quizzes">

<FileText className="text-blue-600"/>

</Link>

<Link href="/perfil">

<User2Icon className="text-gray-400"/>

</Link>

</nav>

</div>

);

}