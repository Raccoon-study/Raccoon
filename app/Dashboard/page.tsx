"use client";

import { useEffect,useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";

import{
Menu,
Bell,
FileText,
Brain,
Flame,
BookOpen,
ChevronRight
}from "lucide-react";

interface Material{
id:string;
nombre_archivo:string;
url_archivo:string;
progreso:number;
fecha_subida:string;
}

export default function Dashboard(){

const [materiales,setMateriales]=
useState<Material[]>([]);

const [nombreUsuario,setNombreUsuario]=
useState("Usuario");

const [notificacion,setNotificacion]=
useState("");



useEffect(()=>{

obtenerMateriales();
obtenerNombreUsuario();

},[]);



const mostrarNotificacion=(mensaje:string)=>{

setNotificacion(mensaje);

setTimeout(()=>{

setNotificacion("");

},2500);

};



const obtenerNombreUsuario=
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

const {data,error}=

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
);

if(error){

console.log(error);
return;

}

setMateriales(
data||[]
);

};



const subirArchivo=async(

e:React.ChangeEvent<HTMLInputElement>

)=>{

const archivo=
e.target.files?.[0];

if(!archivo)return;

try{

const nombre=

`${Date.now()}-${archivo.name}`;

const {error}=

await supabase.storage
.from("materiales")
.upload(
nombre,
archivo
);

if(error)
throw error;


const {data:urlData}=

supabase.storage
.from("materiales")
.getPublicUrl(
nombre
);


const{

data:{user}

}

=

await supabase.auth.getUser();

const progresoAleatorio=

Math.floor(
Math.random()*101
);

const {error:dbError}=

await supabase
.from("materiales")
.insert({

nombre_archivo:
archivo.name,

url_archivo:
urlData.publicUrl,

progreso:
progresoAleatorio,

usuario_id:
user?.id

});


if(dbError)
throw dbError;


await obtenerMateriales();

mostrarNotificacion(
"Archivo subido 🎉"
);

}catch(error:any){

mostrarNotificacion(
error.message
);

}

};



const ultimoMaterial=
materiales[0];



const calcularRacha=()=>{

if(materiales.length===0)
return 0;

const fechas=[

...new Set(

materiales.map(

m=>

new Date(
m.fecha_subida
)
.toDateString()

)

)

];

return fechas.length;

};


const rachaActual=
calcularRacha();



return(

<main

className="

min-h-screen

bg-gradient-to-b
from-[#B9D1F8]
via-[#D8E7FF]
to-[#EEF5FF]

dark:from-slate-900
dark:to-slate-800

transition-all
duration-500

"

>

<div className="

w-full
max-w-[1400px]

mx-auto

px-5
lg:px-10

pb-24

">

{/* HEADER */}

<header className="

flex
justify-between
items-center

pt-6
pb-4

">

<div className="flex items-center gap-2">

<Menu className="text-blue-600"/>

<h1 className="

font-bold
text-xl

text-black
dark:text-white

">

Raccoon

<span className="text-blue-600">

Study

</span>

</h1>

</div>

<Bell className="text-blue-600"/>

</header>



{/* NOTIFICACION */}

{notificacion&&(

<div className="

fixed
top-6
left-1/2
-translate-x-1/2

z-50

bg-gradient-to-r
from-[#2563ff]
to-[#18C3F7]

text-white

px-6
py-3

rounded-2xl
shadow-xl

">

{notificacion}

</div>

)}



<section>

{/* SALUDO */}

<div className="

bg-white/90
dark:bg-slate-800

rounded-[35px]

shadow-xl

p-6

flex
justify-between
items-center

">

<div>

<h2 className="

font-bold

text-2xl
md:text-4xl

text-black
dark:text-white

">

¡Buenas {

new Date().getHours()<12
?
"mañanas"
:
new Date().getHours()<18
?
"tardes"
:
"noches"

},

<br/>

{nombreUsuario}

👋

</h2>

<p className="

mt-2

text-gray-500
dark:text-gray-300

">

¿Lista para aprender algo increíble hoy?

</p>

</div>

<Image
src="/raccoon.png"
alt="raccoon"
width={130}
height={130}
className="w-[100px] md:w-[130px] h-auto"
/>

</div>



{/* SUBIR */}

<div className="

bg-white/90
dark:bg-slate-800

rounded-[35px]

shadow-xl

p-6

mt-6

">

<label className="cursor-pointer flex flex-col items-center">

<div className="bg-[#DCE7FF] p-5 rounded-full">

<BookOpen className="text-blue-600"/>

</div>

<h3 className="font-bold mt-4 text-blue-600">

Toca para subir

</h3>

<input
type="file"
className="hidden"
onChange={subirArchivo}
/>

</label>

</div>



{/* IA */}

<Link

href="/Chat"

className="block mt-6"

>

<div className="

rounded-[35px]

bg-gradient-to-r
from-purple-600
via-blue-500
to-cyan-400

p-6

text-white
shadow-xl

">

<h3 className="text-xl font-bold">

🤖 Raccoon IA

</h3>

<p className="mt-2">

Tu tutor inteligente disponible 24/7

</p>

</div>

</Link>



{/* MATERIAL */}

<div className="mt-6">

{ultimoMaterial?(

<div className="

bg-white/90
dark:bg-slate-800

rounded-[35px]

p-6

shadow-xl

">

<h3 className="dark:text-white font-bold">

{ultimoMaterial.nombre_archivo}

</h3>

<p className="text-gray-400">

Último material

</p>

</div>

):(

<div className="

bg-white/90
dark:bg-slate-800

rounded-[35px]

p-6

shadow-xl

text-center

text-gray-400

">

No has subido materiales

</div>

)}

</div>



{/* RACHA */}

<div className="

bg-white/90
dark:bg-slate-800

rounded-[35px]

p-6

shadow-xl

mt-6

flex
justify-between

">

<div>

<p className="text-red-500">

🔥 RACHA

</p>

<h2 className="text-4xl font-bold dark:text-white">

{rachaActual}

</h2>

</div>

<Flame className="text-orange-500"/>

</div>

</section>



<nav className="

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

">

<Link href="/Dashboard" className="text-blue-600">

<BookOpen/>

</Link>

<Link href="/metodos">

<Brain className="text-gray-400"/>

</Link>

<Link href="/quizzes">

<FileText className="text-gray-400"/>

</Link>

<Link href="/perfil">

<ChevronRight className="text-gray-400"/>

</Link>

</nav>

</div>

</main>

);

}