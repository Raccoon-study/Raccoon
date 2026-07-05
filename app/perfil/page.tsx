"use client";

import Link from "next/link";
import { useEffect,useState } from "react";
import { supabase } from "../lib/supabase";

import{
ChevronLeft,
Edit2,
Camera,
User2Icon,
Mail,
Sparkles,
Globe,
Clock,
CreditCard,
ChevronRight,
Home,
Brain,
FileText,
CheckCircle2
}from "lucide-react";

export default function PerfilScreen(){

const[
usuario,
setUsuario
]=useState({

nombre:"",
correo:"",
username:""

});

const[
fotoPerfil,
setFotoPerfil
]=useState("/raccoon.png");

const[
subiendoFoto,
setSubiendoFoto
]=useState(false);

const[
editando,
setEditando
]=useState(false);

const[
idioma,
setIdioma
]=useState("Español");

const[
userId,
setUserId
]=useState("");

const[
showIdiomaModal,
setShowIdiomaModal
]=useState(false);

useEffect(()=>{

cargarDatos();

},[]);

async function cargarDatos(){

const{

data:{user}

}=await supabase.auth.getUser();

if(!user)return;

setUserId(user.id);

setUsuario({

nombre:
user.user_metadata?.nombre
||
"Usuario",

correo:
user.email
||
"",

username:
user.user_metadata?.username
||
user.email?.split("@")[0]
||
""

});

setFotoPerfil(

user.user_metadata?.avatar_url
||
"/raccoon.png"

);

const {data}=await supabase

.from("user_settings")

.select("idioma")

.eq(
"user_id",
user.id
)

.single();

if(data?.idioma){

setIdioma(
data.idioma
);

}

}

async function cambiarFoto(

e:React.ChangeEvent<HTMLInputElement>

){

const archivo=
e.target.files?.[0];

if(!archivo)return;

try{

setSubiendoFoto(
true
);

const nombreArchivo=

`${Date.now()}-${archivo.name}`;

const{

error

}=await supabase.storage

.from("avatars")

.upload(

nombreArchivo,
archivo

);

if(error)
throw error;

const{

data

}=supabase.storage

.from("avatars")

.getPublicUrl(
nombreArchivo
);

const nuevaFoto=
data.publicUrl;

setFotoPerfil(
nuevaFoto
);

await supabase.auth.updateUser({

data:{

avatar_url:
nuevaFoto

}

});

}catch(error){

console.log(error);

alert(
"Error subiendo imagen"
);

}

setSubiendoFoto(false);

}

async function guardarNombre(){

await supabase.auth.updateUser({

data:{

nombre:
usuario.nombre

}

});

setEditando(false);

}

async function handleIdioma(

nuevoIdioma:string

){

setIdioma(
nuevoIdioma
);

setShowIdiomaModal(
false
);

}

const opciones=[

{

titulo:"Correo",

valor:usuario.correo,

icono:<Mail size={18}/>,

color:"bg-cyan-100 text-cyan-600"

},

{

titulo:"Usuario",

valor:usuario.username,

icono:<Sparkles size={18}/>,

color:"bg-purple-100 text-purple-600"

},

{

titulo:"Idioma",

valor:idioma,

icono:<Globe size={18}/>,

color:"bg-green-100 text-green-600",

idioma:true

},

{

titulo:"Zona Horaria",

valor:"GMT-5",

icono:<Clock size={18}/>,

color:"bg-orange-100 text-orange-600"

},

{

titulo:"Suscripción",

valor:"Plan Gratuito",

icono:<CreditCard size={18}/>,

color:"bg-indigo-100 text-indigo-600",

ruta:"/suscripcion"

}

];

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
py-5

">

<Link
href="/Dashboard"

className="

w-10
h-10

bg-white
dark:bg-slate-800

rounded-xl

shadow

flex
justify-center
items-center

"

>

<ChevronLeft/>

</Link>

<h1 className="

font-bold
text-xl

dark:text-white

">

Perfil

</h1>

<button

onClick={()=>{

if(editando){

guardarNombre();

}else{

setEditando(true);

}

}}

className="

bg-blue-600
text-white

rounded-xl

px-4
py-2

"

>

{

editando
?
"Guardar"
:
"Editar"

}

</button>

</header>

<main className="

px-5
max-w-4xl
mx-auto

space-y-6

">

<section className="

bg-white
dark:bg-slate-800

rounded-[35px]

shadow-xl

p-8

flex
flex-col
items-center

">

<div className="relative">

<img

src={fotoPerfil}

alt="perfil"

className="

w-[120px]
h-[120px]

rounded-full

object-cover

border-4
border-blue-500

"

/>

<label

className="

absolute
bottom-0
right-0

bg-blue-600

text-white

rounded-full

p-2

cursor-pointer

"

>

{

subiendoFoto
?
"..."
:
<Camera size={15}/>

}

<input
type="file"
accept="image/*"
onChange={cambiarFoto}
className="hidden"
/>

</label>

</div>

{

editando

?

<input

value={usuario.nombre}

onChange={(e)=>setUsuario({

...usuario,

nombre:e.target.value

})}

className="

mt-4
p-3

border

rounded-xl

dark:bg-slate-700
dark:text-white

"

/>

:

<h2 className="

font-bold
text-2xl

mt-4

dark:text-white

">

{usuario.nombre}

</h2>

}

<p className="text-gray-500">

{usuario.correo}

</p>

</section>

<section className="

bg-white
dark:bg-slate-800

rounded-[35px]

shadow-xl

overflow-hidden

">

{

opciones.map(
(item,index)=>(

<div

key={index}

onClick={()=>{

if(item.idioma){

setShowIdiomaModal(true);

}

}}

className="

flex
justify-between
items-center

p-5

cursor-pointer

border-b

dark:border-slate-700

"

>

<div className="flex gap-4">

<div className={`

w-10
h-10

rounded-xl

flex
items-center
justify-center

${item.color}

`}>

{item.icono}

</div>

<div>

<p className="text-xs text-gray-400">

{item.titulo}

</p>

<p className="font-semibold dark:text-white">

{item.valor}

</p>

</div>

</div>

{

item.ruta

?

<Link href={item.ruta}>

<ChevronRight/>

</Link>

:

<ChevronRight/>

}

</div>

))

}

</section>

</main>

{

showIdiomaModal&&(

<div className="

fixed
inset-0

bg-black/40

flex
justify-center
items-end

">

<div className="

w-full
max-w-md

bg-white
dark:bg-slate-800

rounded-t-[35px]

p-6

">

<h2 className="

font-bold
text-lg

dark:text-white

">

Selecciona idioma

</h2>

<div className="space-y-3 mt-5">

{

["Español","English"]

.map((lang)=>(

<button

key={lang}

onClick={()=>handleIdioma(lang)}

className="

w-full

flex
justify-between

p-3

rounded-xl

hover:bg-slate-100
dark:hover:bg-slate-700

"

>

<span className="dark:text-white">

{lang}

</span>

{

idioma===lang&&(

<CheckCircle2
className="text-blue-600"
/>

)

}

</button>

))

}

</div>

</div>

</div>

)

}

<nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t flex justify-around py-4">

<Link href="/Dashboard">

<Home className="text-gray-400"/>

</Link>

<Link href="/metodos">

<Brain className="text-gray-400"/>

</Link>

<Link href="/quizzes">

<FileText className="text-gray-400"/>

</Link>

<Link href="/perfil">

<User2Icon className="text-blue-600"/>

</Link>

</nav>

</div>

);

}