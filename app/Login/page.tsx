"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";

import {
Mail,
Lock,
Eye,
EyeOff,
ArrowLeft
} from "lucide-react";

export default function Login(){

const [email,setEmail]=useState("");
const [password,setPassword]=useState("");

const [mostrar,setMostrar]=useState(false);

const [loading,setLoading]=useState(false);


async function iniciarSesion(){

if(!email||!password){
alert("Completa todos los campos");
return;
}

try{

setLoading(true);

const {error}=await supabase.auth.signInWithPassword({

email,
password

});

if(error) throw error;

window.location.href="/Dashboard";

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

{/* flecha */}

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
alt="login"
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




{/* tarjeta EXACTAMENTE igual */}

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


{/* email */}

<InputBox

icon={<Mail size={24}/>}

placeholder="Correo"

value={email}

onChange={(e:any)=>
setEmail(e.target.value)
}

/>




{/* contraseña */}

<InputBox

icon={<Lock size={24}/>}

placeholder="Contraseña"

type={mostrar?"text":"password"}

value={password}

onChange={(e:any)=>

setPassword(
e.target.value
)

}

rightIcon={

<button
onClick={()=>setMostrar(!mostrar)}
>

{
mostrar
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

onClick={iniciarSesion}

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
"Iniciando..."
:
"Iniciar sesión"
}

</button>




{/* botones sociales iguales */}

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

¿No tienes cuenta?

<Link
href="/Registro"
className="ml-2 font-bold text-blue-500"
>

Regístrate

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
placeholder:text-gray-500
dark:placeholder:text-gray-400

"

/>


{rightIcon}

</div>

)

}