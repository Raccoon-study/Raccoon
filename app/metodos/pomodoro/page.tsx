"use client";

import { useState,useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/app/lib/supabase";

import{
ArrowLeft,
Play,
Pause,
RotateCcw,
Clock,
BookOpen,
CheckCircle
}from "lucide-react";

interface Material{
id:string;
nombre_archivo:string;
progreso:number;
fecha_subida:string;
}

export default function Pomodoro(){

const [tiempo,setTiempo]=
useState(25*60);

const [activo,setActivo]=
useState(false);

const [sesiones,setSesiones]=
useState(0);

const [material,setMaterial]=
useState<Material|null>(null);

useEffect(()=>{

obtenerMaterial();

},[]);


const obtenerMaterial=
async()=>{

const{
data:{user}
}
=
await supabase.auth.getUser();

if(!user)return;

const {data}=

await supabase
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

if(data&&data.length>0){

setMaterial(
data[0]
);

}

};



useEffect(()=>{

let intervalo:any;

if(
activo &&
tiempo>0
){

intervalo=
setInterval(()=>{

setTiempo(
(prev)=>prev-1
);

},1000);

}

if(
tiempo===0
){

setActivo(false);

setSesiones(
prev=>prev+1
);

alert(
"🎉 Terminaste una sesión Pomodoro"
);

}

return()=>clearInterval(
intervalo
);

},[
activo,
tiempo
]);



const reiniciar=()=>{

setTiempo(
25*60
);

setActivo(false);

};



const minutos=
Math.floor(
tiempo/60
);

const segundos=
tiempo%60;


return(

<div
className="

min-h-screen

bg-gradient-to-b
from-[#B8D6FF]
to-[#EEF5FF]

dark:from-slate-900
dark:to-slate-800

transition-all

p-5

"
>

<div
className="
max-w-6xl
mx-auto
"
>

{/* HEADER */}

<div
className="
flex
justify-between
items-center
"
>

<div
className="
flex
items-center
gap-4
"
>

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

<h1
className="
font-bold
text-2xl
dark:text-white
"
>

🍅 Pomodoro

</h1>

</div>

<Image
src="/raccoon.png"
alt="raccoon"
width={70}
height={70}
className="
w-[60px]
h-auto
animate-bounce
"
/>

</div>


{/* EXPLICACION */}

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

<h2
className="
font-bold
text-xl
dark:text-white
"
>

🦝 ¿Qué es Pomodoro?

</h2>

<p
className="
text-gray-500
dark:text-gray-300
mt-3
leading-relaxed
"
>

Estudia durante 25 minutos con máxima concentración y luego toma descansos cortos. Raccoon IA recomendó este método porque ayuda a mantener el enfoque y evitar la fatiga mental.

</p>

</div>



{/* MATERIAL */}

<div
className="
mt-6
bg-white
dark:bg-slate-800
rounded-[35px]
shadow-xl
p-6
"
>

<div
className="
flex
items-center
gap-3
"
>

<BookOpen
className="text-blue-600"
/>

<h2
className="
font-bold
dark:text-white
"
>

Material recomendado

</h2>

</div>


{material?(

<div
className="
mt-4
"
>

<h3
className="
font-bold
dark:text-white
"
>

{material.nombre_archivo}

</h3>

<p
className="
text-sm
text-gray-400
"
>

Último material analizado por Raccoon IA

</p>


<div
className="
w-full
bg-gray-200
rounded-full
h-3
mt-4
"
>

<div
className="
bg-blue-600
h-3
rounded-full
"
style={{
width:
`${material.progreso}%`
}}
/>

</div>

<p
className="
text-xs
mt-2
text-blue-600
font-semibold
"
>

{material.progreso}% completado

</p>

</div>

):(

<p
className="
mt-4
text-gray-400
"
>

No hay materiales disponibles

</p>

)}

</div>



{/* CRONOMETRO */}

<div
className="
mt-6
bg-white
dark:bg-slate-800
rounded-[35px]
shadow-xl
p-10
text-center
"
>

<Clock
size={35}
className="
mx-auto
text-blue-600
mb-4
"
/>

<p
className="
text-gray-500
dark:text-gray-300
"
>

Tiempo de enfoque

</p>

<h1
className="
text-6xl
md:text-7xl
font-bold
text-blue-600
mt-4
"
>

{String(minutos).padStart(2,"0")}:
{String(segundos).padStart(2,"0")}

</h1>


<div
className="
flex
flex-wrap
justify-center
gap-4
mt-10
"
>

<button
onClick={()=>
setActivo(
!activo
)
}
className="
bg-blue-600
hover:scale-105
duration-300
text-white
px-8
py-4
rounded-2xl
flex
items-center
gap-2
"
>

{

activo
?
<>
<Pause/>
Pausar
</>

:
<>
<Play/>
Iniciar
</>

}

</button>


<button
onClick={reiniciar}
className="
bg-gray-200
dark:bg-slate-700
dark:text-white
px-8
py-4
rounded-2xl
flex
items-center
gap-2
"
>

<RotateCcw/>

Reiniciar

</button>

</div>

</div>


{/* ESTADISTICAS */}

<div
className="
mt-6
bg-white
dark:bg-slate-800
rounded-[35px]
shadow-xl
p-6
flex
justify-between
items-center
"
>

<div>

<p
className="
text-sm
text-gray-500
"
>

Sesiones completadas

</p>

<h2
className="
text-4xl
font-bold
dark:text-white
"
>

{sesiones}

</h2>

</div>

<CheckCircle
size={50}
className="
text-green-500
"
/>

</div>

</div>

</div>

);

}