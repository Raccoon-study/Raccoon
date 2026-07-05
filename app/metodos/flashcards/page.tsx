"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Flashcard{
id:string;
pregunta:string;
respuesta:string;
}

export default function Flashcards(){

const [cards,setCards]=
useState<Flashcard[]>([]);

const [index,setIndex]=
useState(0);

const [girada,setGirada]=
useState(false);

const [cargando,setCargando]=
useState(true);

useEffect(()=>{

obtenerFlashcards();

},[]);

const obtenerFlashcards=
async()=>{

try{

const {
data:{user}
}
=
await supabase.auth.getUser();

if(!user)return;

const {data,error}=

await supabase
.from("flashcards")
.select("*")
.eq(
"usuario_id",
user.id
);

if(error) throw error;

setCards(data||[]);

}catch(error){

console.log(error);

}

setCargando(false);

};

const siguiente=()=>{

setGirada(false);

setIndex(

(prev)=>

(prev+1)%cards.length

);

};

return(

<div
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

px-4
sm:px-6
md:px-10
py-6

"
>

<div
className="
max-w-4xl
mx-auto
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
shadow-lg
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

🪪 Flashcards

</h1>

</div>

<div
className="

bg-white
dark:bg-slate-800

rounded-[35px]

shadow-xl

mt-8

p-6
sm:p-8

"
>

<div className="flex justify-center">

<Image
src="/raccoon.png"
alt="raccoon"
width={70}
height={70}
className="w-[60px] h-auto"
/>

</div>

<h2
className="
text-center
font-bold
text-xl
mt-3
dark:text-white
"
>

Aprende con repetición activa

</h2>

<p
className="
text-center
text-gray-500
dark:text-gray-300
mb-8
"
>

Tus tarjetas se generan automáticamente según tu material

</p>

{cargando ? (

<div className="text-center">

Cargando...

</div>

)

:

cards.length===0 ?

(

<div
className="
text-center
text-gray-400
py-10
"
>

Todavía no tienes flashcards.

Sube un material y Raccoon IA las generará 🦝

</div>

)

:

(

<>

<div

onClick={()=>
setGirada(
!girada
)
}

className="

cursor-pointer

min-h-[250px]

sm:min-h-[300px]

rounded-[30px]

bg-[#DCE7FF]
dark:bg-slate-700

flex
items-center
justify-center

text-center

p-8

shadow-inner

"

>

<h2
className="
font-bold
text-xl
sm:text-2xl
dark:text-white
"
>

{

girada

?

cards[index]
.respuesta

:

cards[index]
.pregunta

}

</h2>

</div>

<p
className="
text-center
mt-4
text-sm
text-gray-500
"
>

Toca la tarjeta para girarla

</p>

<div
className="
flex
justify-center
mt-8
"
>

<button

onClick={siguiente}

className="

bg-blue-600

hover:scale-105

transition

text-white

px-8
py-4

rounded-2xl

flex
items-center
gap-2

"

>

<RotateCcw/>

Siguiente

</button>

</div>

</>

)}

</div>

</div>

</div>

);

}