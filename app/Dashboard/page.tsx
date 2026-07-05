"use client";

import { useEffect,useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

import{
Menu,
X,
Bell,
FileText,
Brain,
Flame,
CloudUpload,
ChevronRight,
User,
Settings,
LogOut,
Home,
User2Icon
}from "lucide-react";

interface Material{
id:string;
nombre_archivo:string;
url_archivo:string;
progreso:number;
fecha_subida:string;
usuario_id:string;
}

export default function Dashboard(){

const router=useRouter();

const [materiales,setMateriales]=
useState<Material[]>([]);

const [nombreUsuario,setNombreUsuario]=
useState("Usuario");

const [notificacion,setNotificacion]=
useState("");

const [menuAbierto,setMenuAbierto]=
useState(false);


useEffect(()=>{

obtenerNombreUsuario();
obtenerMateriales();

},[]);



const mostrarNotificacion=(mensaje:string)=>{

setNotificacion(mensaje);

setTimeout(()=>{

setNotificacion("");

},2500);

};



const cerrarSesion=async()=>{

await supabase.auth.signOut();

router.push("/Login");

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
user.email?.split("@")[0]
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

setMateriales(data||[]);

};



const subirArchivo=async(

e:React.ChangeEvent<HTMLInputElement>

)=>{

const archivo=
e.target.files?.[0];

if(!archivo)return;

try{

const{

data:{user}

}

=

await supabase.auth.getUser();

if(!user)return;


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


const {error:dbError}=

await supabase
.from("materiales")
.insert({

nombre_archivo:
archivo.name,

url_archivo:
urlData.publicUrl,

progreso:0,

usuario_id:
user.id

});


if(dbError)
throw dbError;


mostrarNotificacion(
"Archivo subido 🎉"
);

obtenerMateriales();

}catch(error:any){

mostrarNotificacion(
error.message
);

}

};



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

fechas.sort(

(a,b)=>

new Date(b).getTime()
-
new Date(a).getTime()

);


const hoy=
new Date();

const ultimaFecha=
new Date(
fechas[0]
);

const diferencia=

Math.floor(

(
hoy.getTime()
-
ultimaFecha.getTime()
)

/

(
1000*60*60*24
)

);


if(
diferencia>1
)
return 0;


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

const dias=

Math.floor(

(
actual.getTime()
-
anterior.getTime()
)

/

(
1000*60*60*24
)

);

if(
dias===1
){

racha++;

}else{

break;

}

}

return racha;

};


const ultimoMaterial=
materiales[0];

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
dark:via-slate-800
dark:to-slate-950

transition-all
duration-500

"

>


{menuAbierto&&(

<div

onClick={()=>
setMenuAbierto(false)
}

className="

fixed
inset-0

bg-black/50

z-40

"

/>

)}


<div

className={`

fixed
top-0
left-0

w-[280px]
h-full

bg-white
dark:bg-slate-900

z-50

shadow-2xl

transition-all

duration-300

${
menuAbierto
?
"translate-x-0"
:
"-translate-x-full"
}

`}

>

<div className="p-6">

<div className="flex justify-between">

<h2 className="font-bold dark:text-white">

{nombreUsuario}

</h2>

<X

className="cursor-pointer"

onClick={()=>

setMenuAbierto(false)

}

/>

</div>


<div className="space-y-8 mt-10">

<Link
href="/perfil"
className="flex gap-3"
>

<User/>

Perfil

</Link>


<Link
href="/configuracion"
className="flex gap-3"
>

<Settings/>

Configuración

</Link>


<button

onClick={cerrarSesion}

className="

flex
gap-3

text-red-500

"

>

<LogOut/>

Cerrar sesión

</button>

</div>

</div>

</div>



<div className="max-w-[1400px] mx-auto px-5 lg:px-10 pb-28">

<header

className="

flex
justify-between

pt-6
pb-6

"

>

<div className="flex gap-3">

<Menu

className="
cursor-pointer
text-blue-600
"

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

</div>

<Bell className="text-blue-600"/>

</header>


{notificacion&&(

<div

className="

fixed
top-5
left-1/2
-translate-x-1/2

bg-gradient-to-r
from-[#2563ff]
to-[#18C3F7]

px-6
py-3

rounded-2xl

text-white

z-50

"

>

{notificacion}

</div>

)}



<section>

<div className="bg-white/90 dark:bg-slate-800 rounded-[35px] p-6 shadow-xl flex justify-between items-center">

<div>

<h2 className="font-bold text-2xl md:text-4xl dark:text-white">

¡Hola {nombreUsuario}! 👋

</h2>

<p className="text-gray-500 dark:text-gray-300 mt-2">

¿Lista para estudiar?

</p>

</div>

<Image
src="/raccoon.png"
alt=""
width={130}
height={130}
className="w-[90px] md:w-[130px]"
/>

</div>


<div className="bg-white/90 dark:bg-slate-800 rounded-[35px] p-6 mt-6 shadow-xl">

<label className="cursor-pointer flex flex-col items-center">

<CloudUpload
className="text-blue-600"
size={35}
/>

<h3 className="font-bold mt-4 text-blue-600">

Subir material

</h3>

<input
type="file"
className="hidden"
onChange={subirArchivo}
/>

</label>

</div>


<Link href="/Chat">

<div className="mt-6 rounded-[35px] p-6 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 text-white shadow-xl">

<h2 className="font-bold text-xl">

🤖 Raccoon IA

</h2>

<p>

Tu tutor inteligente disponible 24/7

</p>

</div>

</Link>


<div className="mt-6">

{ultimoMaterial?(

<div className="bg-white/90 dark:bg-slate-800 rounded-[35px] p-6 shadow-xl">

<h3 className="font-bold dark:text-white">

{ultimoMaterial.nombre_archivo}

</h3>

<p className="text-gray-500">

Progreso: {ultimoMaterial.progreso}%

</p>

</div>

):(

<div className="bg-white/90 dark:bg-slate-800 rounded-[35px] p-6 text-center">

No has subido materiales

</div>

)}

</div>


<div className="bg-white/90 dark:bg-slate-800 rounded-[35px] p-6 mt-6 shadow-xl flex justify-between">

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

</div>



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

</main>

);

}