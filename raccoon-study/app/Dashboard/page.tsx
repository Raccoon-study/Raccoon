"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../src/lib/supabase.js";
import Link from "next/link";
import {
  Menu,
  Bell,
  FileText,
  Brain,
  Flame,
  BookOpen,
  Lightbulb,
  ChevronRight,
} from "lucide-react";

interface Material {
  id:string;
  nombre_archivo:string;
  url_archivo:string;
  progreso:number;
  fecha_subida:string;
}

export default function Dashboard(){

const [materiales,setMateriales]=
useState<Material[]>([]);
const [resultadoIA,setResultadoIA]=
useState<any>(null);

const [cargandoIA,setCargandoIA]=
useState(false);
const generarIA=async()=>{

if(materiales.length===0){
mostrarNotificacion(
"Sube un material primero"
);
return;
}

setCargandoIA(true);

try{

const respuesta=
await fetch("/api/ia",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

texto:
ultimoMaterial.nombre_archivo

})

});

const data=
await respuesta.json();

setResultadoIA(data);

mostrarNotificacion(
"IA generada ✨"
);

}catch{

mostrarNotificacion(
"Error al generar IA"
);

}

setCargandoIA(false);

};
const [notificacion, setNotificacion] = useState("");

const [nombreUsuario,setNombreUsuario]=
useState("");


const [notificaciones,setNotificaciones]=
useState<string[]>([]);

useEffect(()=>{

obtenerMateriales();
const mostrarNotificacion = (
  mensaje: string
) => {

  setNotificacion(mensaje);

  setTimeout(() => {
    setNotificacion("");
  }, 2500);

};
obtenerNombreUsuario();

},[]);


const mostrarNotificacion=(mensaje:string)=>{

setNotificaciones((prev)=>[
mensaje,
...prev
]);

setTimeout(()=>{

setNotificaciones((prev)=>
prev.slice(0,-1)
);

},3000);

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

const {data,error}=
await supabase
.from("materiales")
.select("*")
.order(
"fecha_subida",
{ascending:false}
);

if(error){

console.log(error);
return;

}

setMateriales(data||[]);

};


const subirArchivo=async(
e:React.ChangeEvent<HTMLInputElement>
)=>{

const archivo=
e.target.files?.[0];

if(!archivo)return;

const nombreLimpio=
archivo.name.replace(
/[^a-zA-Z0-9.-]/g,
"_"
);
const generarIA=async()=>{

if(materiales.length===0)return;

setCargandoIA(true);

try{

const respuesta=
await fetch("/api/ia",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

texto:
ultimoMaterial.nombre_archivo

})

});

const data=
await respuesta.json();

setResultadoIA(data);

mostrarNotificacion(
"IA generada ✨"
);

}catch{

mostrarNotificacion(
"Error IA"
);

}

setCargandoIA(false);

};
const nombre=
`${Date.now()}-${nombreLimpio}`;

const {error}=
await supabase.storage
.from("materiales")
.upload(
nombre,
archivo
);

if(error){

mostrarNotificacion(
error.message
);

return;

}

const {data:urlData}
=
supabase.storage
.from("materiales")
.getPublicUrl(
nombre
);

const progresoAleatorio=
Math.floor(
Math.random()*101
);

const {error:dbError}
=
await supabase
.from("materiales")
.insert({

nombre_archivo:
archivo.name,

url_archivo:
urlData.publicUrl,

progreso:
progresoAleatorio

});

if(dbError){

mostrarNotificacion(
dbError.message
);

return;

}

await obtenerMateriales();

mostrarNotificacion(
"Archivo subido correctamente 🎉"
);

};


const ultimoMaterial=
materiales[0];


const calcularRacha=()=>{

if(
materiales.length===0
)
return 0;

const fechas=[
...new Set(

materiales.map(
(m)=>
new Date(
m.fecha_subida
).toDateString()
)

)

];

fechas.sort(
(a,b)=>

new Date(b).getTime()
-
new Date(a).getTime()

);

let racha=1;

for(
let i=1;
i<fechas.length;
i++
){

const actual=
new Date(
fechas[i-1]
);

const anterior=
new Date(
fechas[i]
);

const diferencia=

(
actual.getTime()
-
anterior.getTime()
)

/

(
1000*60*60*24
);

if(
diferencia<=1
){

racha++;

}else{

break;

}

}

return racha;

};

const rachaActual=
calcularRacha();

  return (


<main className="min-h-screen bg-[#f4f6fb] flex justify-center">

<div className="w-full max-w-[430px] min-h-screen bg-[#f4f6fb] pb-24">

<header className="flex justify-between items-center px-5 pt-6 pb-3">

<div className="flex items-center gap-2">

<Menu className="w-5 h-5 text-blue-600"/>

<h1 className="font-bold text-blue-600">
RaccoonStudy
</h1>

</div>

<div className="relative">

<Bell
className="w-5 h-5 text-blue-600"
/>

</div>

</header>
{notificacion && (

<div
className="
fixed
top-6
left-1/2
-translate-x-1/2
z-50
bg-gradient-to-r
from-blue-600
to-cyan-400
text-white
px-5
py-3
rounded-2xl
shadow-xl
animate-bounce
font-medium
"
>

{notificacion}

</div>

)}
<section className="px-5">

{notificaciones.length>0 && (

<div
className="
bg-white
rounded-3xl
p-5
shadow-sm
mb-5
"
>

<h3 className="font-bold mb-3">
Notificaciones
</h3>

{
notificaciones.map(
(notificacion,index)=>(

<div
key={index}
className="
border-b
py-2
text-sm
"
>

{notificacion}

</div>

))
}

</div>

)}

<div className="bg-[#dce8f8] rounded-3xl p-5">

<div className="flex justify-between">

<div>

<h2 className="font-bold text-3xl leading-tight">

¡Buenas {

new Date().getHours()<12
? "mañanas"
:
new Date().getHours()<18
? "tardes"
:
"noches"

},
<br/>

{nombreUsuario}! 🌙

</h2>

<p className="text-sm text-gray-500 mt-2">

¿Lista para aprender algo increíble hoy?

</p>

</div>

<Image
src="/raccoon.png"
alt="Mapache"
width={110}
height={110}
/>

</div>

</div>

<h3 className="font-semibold text-xl mt-8 text-center">

Sube tu material

</h3>

<p className="text-center text-gray-500 text-sm mb-4">

y deja que la IA haga su magia ✨

</p>

<div className="bg-white rounded-3xl p-6 shadow-sm border">

<label className="cursor-pointer flex flex-col items-center">

<div className="bg-[#dce7ff] p-5 rounded-full">

<BookOpen className="text-blue-600"/>

</div>

<h3 className="text-blue-600 font-semibold mt-4">

Toca para subir

</h3>

<p className="text-xs text-gray-400 text-center mt-2">

PDF, imágenes o apuntes escritos a mano

</p>

<input
type="file"
className="hidden"
accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
onChange={subirArchivo}
/>

</label>

</div>

<h3 className="font-semibold mt-8 mb-3">
  Continuar estudiando
</h3>
<Link
  href="/Chat"
  className="block mt-5 rounded-2xl bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 p-5 text-white shadow-lg hover:scale-[1.02] transition"
>
    <h3 className="text-xl font-bold">
        🤖 Raccoon IA
    </h3>

    <p className="text-sm opacity-90 mt-1">
        Tu tutor inteligente disponible 24/7
    </p>

    <button className="mt-4 bg-white text-blue-600 font-semibold px-5 py-2 rounded-xl">
        Abrir Chat →
    </button>
</Link>


{ultimoMaterial ? (

<div className="bg-white rounded-3xl p-5 shadow-sm">

<div className="flex justify-between">

<div className="flex gap-3">

<div className="bg-[#dce7ff] p-3 rounded-2xl">

<FileText className="text-blue-600"/>

</div>


<div>

<h4 className="font-medium">

{ultimoMaterial.nombre_archivo}

</h4>

<p className="text-xs text-gray-400">

Último material subido

</p>

</div>

</div>

<span className="text-blue-600 font-semibold">

{ultimoMaterial.progreso ?? 0}%

</span>

</div>

<div className="bg-gray-200 rounded-full h-2 mt-4">

<div
className="bg-blue-600 h-2 rounded-full"
style={{
width:
`${ultimoMaterial.progreso ??0}%`
}}
/>

</div>

</div>

):(


<div className="bg-white rounded-3xl p-5 text-center text-gray-400">

Aún no has subido materiales.

</div>

)}

<div className="bg-white rounded-3xl p-5 shadow-sm mt-6 flex justify-between items-center">

<div>

<p className="text-xs text-red-500 font-bold">

🔥 RACHA ACTUAL

</p>

<h3 className="text-3xl font-bold">

{rachaActual} días

</h3>

<p className="text-sm text-gray-400">

¡Sigue así!

</p>

</div>

<Flame className="text-orange-500 w-12 h-12"/>

</div>

</section>

<nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t flex justify-around py-3">

  <Link
    href="/Dashboard"
    className="flex flex-col items-center text-blue-600 text-xs"
  >
    <BookOpen size={20} />
    <span>Inicio</span>
  </Link>

  <Link
    href="/metodos"
    className="flex flex-col items-center text-gray-400 hover:text-blue-600 text-xs"
  >
    <Brain size={20} />
    <span>Métodos</span>
  </Link>

  <Link
    href="/quizzes"
    className="flex flex-col items-center text-gray-400 hover:text-blue-600 text-xs"
  >
    <FileText size={20} />
    <span>Quiz</span>
  </Link>

  <Link
    href="/perfil"
    className="flex flex-col items-center text-gray-400 hover:text-blue-600 text-xs"
  >
    <ChevronRight size={20} />
    <span>Perfil</span>
  </Link>

</nav>
</div>

</main>

);
}