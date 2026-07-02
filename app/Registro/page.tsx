"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

import Image from "next/image";
import Link from "next/link";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft
} from "lucide-react";

export default function Registro() {

const router=useRouter();

const [nombre,setNombre]=useState("");
const [correo,setCorreo]=useState("");
const [password,setPassword]=useState("");
const [confirmarPassword,setConfirmarPassword]=useState("");

const [mostrarPassword,setMostrarPassword]=useState(false);
const [mostrarConfirmar,setMostrarConfirmar]=useState(false);

const [loading,setLoading]=useState(false);


async function handleRegister(){

if(
!nombre||
!correo||
!password||
!confirmarPassword
){
alert("Completa todos los campos");
return;
}

if(password!==confirmarPassword){
alert("Las contraseñas no coinciden");
return;
}

try{

setLoading(true);

const {data,error}=await supabase.auth.signUp({

email:correo,
password,

options:{
data:{
nombre
}
}

});

if(error) throw error;

if(data.user){

await supabase
.from("usuarios")
.insert([{

id:data.user.id,
nombre,
email:correo,
racha:0,
avatar:"raccoon"

}]);

}

router.push("/Dashboard");

}catch(error:any){

alert(error.message);

}

setLoading(false);

}

async function loginGoogle(){

await supabase.auth.signInWithOAuth({
provider:"google"
});

}

async function loginMicrosoft(){

await supabase.auth.signInWithOAuth({
provider:"azure"
});

}


return(

<main className="min-h-screen w-full bg-gradient-to-b from-[#B9D1F8] via-[#D8E7FF] to-[#EEF5FF] dark:from-slate-900 dark:to-slate-800 overflow-hidden">

<div className="absolute top-6 left-6 z-50">

<Link href="/">

<button className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">

<ArrowLeft
size={24}
className="text-blue-500"
/>

</button>

</Link>

</div>



<div className="w-full min-h-screen flex flex-col items-center px-5 lg:px-20 pt-20 pb-10">

{/* mapache */}

<div className="relative">

<Image
src="/raccoon.png"
alt="registro"
width={450}
height={450}
priority
className="
w-[250px]
sm:w-[320px]
md:w-[400px]
lg:w-[450px]
h-auto
"
/>

</div>



{/* formulario */}

<div className="

w-full
max-w-[700px]

bg-white/90
dark:bg-slate-800

backdrop-blur-md

rounded-[40px]

shadow-xl

p-6
sm:p-8
md:p-10

mt-4

">

<div className="space-y-5">

{/* nombre */}

<InputBox
icon={<User size={24}/>}

placeholder="Nombre completo"

value={nombre}

onChange={(e:any)=>setNombre(e.target.value)}
/>



{/* correo */}

<InputBox
icon={<Mail size={24}/>}

placeholder="Correo"

value={correo}

onChange={(e:any)=>setCorreo(e.target.value)}
/>




{/* contraseña */}

<InputBox
icon={<Lock size={24}/>}

placeholder="Contraseña"

type={mostrarPassword?"text":"password"}

value={password}

onChange={(e:any)=>setPassword(e.target.value)}

rightIcon={

<button
onClick={()=>setMostrarPassword(!mostrarPassword)}
>

{
mostrarPassword
?
<EyeOff size={24}/>
:
<Eye size={24}/>
}

</button>

}

/>



{/* confirmar */}

<InputBox
icon={<Lock size={24}/>}

placeholder="Confirmar contraseña"

type={mostrarConfirmar?"text":"password"}

value={confirmarPassword}

onChange={(e:any)=>

setConfirmarPassword(
e.target.value
)

}

rightIcon={

<button
onClick={()=>setMostrarConfirmar(!mostrarConfirmar)}
>

{
mostrarConfirmar
?
<EyeOff size={24}/>
:
<Eye size={24}/>
}

</button>

}

/>


</div>



<button

onClick={handleRegister}

className="

w-full

h-[58px]
md:h-[65px]

mt-8

rounded-2xl

bg-gradient-to-r
from-[#2563ff]
to-[#18C3F7]

text-white

font-bold
text-lg
md:text-xl

shadow-lg

hover:scale-[1.02]
transition

"

>

{
loading
?
"Registrando..."
:
"Registrarse"
}

</button>




<div className="flex justify-center gap-6 mt-8">

<button
onClick={loginGoogle}

className="
w-14
h-14
md:w-16
md:h-16

bg-white

rounded-full
shadow-md

flex
items-center
justify-center
"

>

<Image
src="/google.png"
alt="google"
width={30}
height={30}
/>

</button>


<button
onClick={loginMicrosoft}

className="
w-14
h-14
md:w-16
md:h-16

bg-white

rounded-full
shadow-md

flex
items-center
justify-center
"

>

<Image
src="/microsoft.png"
alt="microsoft"
width={30}
height={30}
/>

</button>

</div>



<p className="text-center mt-8 text-gray-600 dark:text-gray-300">

¿Ya tienes cuenta?

<Link
href="/Login"
className="ml-2 font-bold text-blue-500"
>

Inicia sesión

</Link>

</p>

</div>

</div>

</main>

);

}



function InputBox({

icon,
rightIcon,
...props

}:any){

return(

<div

className="

w-full

h-[58px]
md:h-[65px]

border

rounded-2xl

px-5

flex
items-center

"

>

<div className="text-blue-500 mr-4">

{icon}

</div>


<input

{...props}

className="

flex-1

bg-transparent
outline-none

text-base
md:text-lg

text-black
dark:text-white

"

/>

{rightIcon}

</div>

)

}