"use client";

import { useEffect,useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

import {
ArrowLeft,
Check,
X,
FileText,
RefreshCcw
} from "lucide-react";

interface Tarjeta{

id:string;
pregunta:string;
respuesta:string;
caja:number;
material_id:string;

}

interface Material{

id:string;
nombre_archivo:string;

}

export default function Leitner(){

const [tarjetas,setTarjetas]=
useState<Tarjeta[]>([]);

const [material,setMaterial]=
useState<Material|null>(null);

const [indice,setIndice]=
useState(0);

const [girada,setGirada]=
useState(false);

const [loading,setLoading]=
useState(true);

useEffect(()=>{

cargarTodo();

},[]);

async function cargarTodo(){

setLoading(true);

const {

data:{user}

}=await supabase.auth.getUser();

if(!user){

setLoading(false);

return;

}

const {data:materiales}=await supabase
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

if(materiales?.length){

setMaterial(materiales[0]);

}

const {data}=await supabase
.from("tarjetas_leitner")
.select("*")
.eq(
"usuario_id",
user.id
)
.order(
"caja",
{
ascending:true
}
);

setTarjetas(
data||[]
);

setLoading(false);

}

async function correcta(){

const tarjeta=
tarjetas[indice];

const nuevaCaja=
Math.min(
5,
tarjeta.caja+1
);

await supabase
.from(
"tarjetas_leitner"
)
.update({

caja:nuevaCaja

})
.eq(
"id",
tarjeta.id
);

cargarTodo();

siguiente();

}

async function incorrecta(){

const tarjeta=
tarjetas[indice];

await supabase
.from(
"tarjetas_leitner"
)
.update({

caja:1

})
.eq(
"id",
tarjeta.id
);

cargarTodo();

siguiente();

}

function siguiente(){

setGirada(false);

if(
indice<
tarjetas.length-1
){

setIndice(
prev=>prev+1
);

}else{

setIndice(0);

}

}

if(loading){

return(

<div className="min-h-screen flex items-center justify-center dark:bg-slate-900">

Cargando...

</div>

)

}

const actual=
tarjetas[indice];

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

p-5

">

<div className="max-w-4xl mx-auto">

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

🦝 🎓 Método Leitner

</h1>

</div>


<div className="

bg-white
dark:bg-slate-800

rounded-[35px]

p-6
mt-6

shadow-xl

text-center

">

<div className="text-6xl">

🦝

</div>

<h2 className="

font-bold
text-2xl
mt-3

dark:text-white

">

Aprende usando repetición inteligente

</h2>

<p className="text-gray-500 mt-2">

Las respuestas correctas suben de nivel

</p>

{material&&(

<div className="

mt-5

bg-blue-50
dark:bg-slate-700

rounded-2xl

p-4

flex
items-center
justify-center
gap-2

">

<FileText size={18}/>

{material.nombre_archivo}

</div>

)}

</div>


{actual? (

<div className="

bg-white
dark:bg-slate-800

rounded-[35px]

shadow-xl

p-6
mt-8

">

<div className="

flex
justify-between
items-center

">

<h3 className="

font-bold
dark:text-white

">

Caja {actual.caja}

</h3>

<span className="text-gray-500">

{indice+1}/{tarjetas.length}

</span>

</div>


<div className="flex gap-2 mt-5">

{[1,2,3,4,5].map((n)=>(

<div
key={n}
className={`

flex-1
h-3
rounded-full

${
n<=actual.caja
?
"bg-green-500"
:
"bg-gray-200"
}

`}
/>

))}

</div>


<div

onClick={()=>
setGirada(
!girada
)
}

className="

mt-6

h-[250px]

rounded-[35px]

bg-[#D9F1FF]
dark:bg-slate-700

flex
items-center
justify-center

cursor-pointer

text-center

p-8

"

>

<div>

<h2 className="

font-bold
text-4xl

dark:text-white

">

{

girada
?

actual.respuesta

:

actual.pregunta

}

</h2>

<p className="

mt-5
text-gray-500

">

Toca para girar

</p>

</div>

</div>


<div className="

grid
grid-cols-2
gap-4
mt-6

">

<button

onClick={incorrecta}

className="

bg-red-500

hover:bg-red-600

text-white

rounded-2xl

py-4

flex
justify-center
items-center
gap-2

"

>

<X/>

Incorrecta

</button>


<button

onClick={correcta}

className="

bg-green-500

hover:bg-green-600

text-white

rounded-2xl

py-4

flex
justify-center
items-center
gap-2

"

>

<Check/>

Correcta

</button>

</div>

</div>

)

:

(

<div className="

bg-white
dark:bg-slate-800

rounded-[35px]

p-10

mt-8

text-center

shadow-xl

">

<div className="text-5xl">

📭

</div>

<h2 className="

font-bold
text-2xl
mt-4

dark:text-white

">

No hay tarjetas

</h2>

<p className="text-gray-500 mt-3">

La IA generará tarjetas cuando subas material

</p>

<button

onClick={cargarTodo}

className="

mt-5

bg-blue-600
text-white

px-5
py-3

rounded-xl

inline-flex
gap-2

"

>

<RefreshCcw size={18}/>

Actualizar

</button>

</div>

)

}

</div>

</div>

);

}