"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

import {
  Menu,
  X,
  Bell,
  FileText,
  Brain,
  Flame,
  CloudUpload,
  User,
  Settings,
  LogOut,
  Home,
  User2Icon,
} from "lucide-react";

interface Material {
  id: string;
  nombre_archivo: string;
  url_archivo: string;
  progreso: number;
  fecha_subida: string;
  usuario_id: string;
}

export default function Dashboard() {

  const router = useRouter();

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [nombreUsuario, setNombreUsuario] = useState("Usuario");
  const [notificacion, setNotificacion] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);
   // PARTE 6

  const [quizzesRealizados] = useState(0);

  const [flashcardsCreadas] = useState(0);

  const [horasEstudio] = useState(0);

  // PARTE 7

  const [objetivo] = useState(5);

  const [mensajeIA] = useState(
    "¡Vas muy bien! Cada material que estudias te acerca más a dominar el tema. 🚀"
  );

  useEffect(() => {

    obtenerNombreUsuario();
    obtenerMateriales();

  }, []);

  useEffect(() => {
    obtenerNombreUsuario();
    obtenerMateriales();
  }, []);
  
  // =============================
// NOTIFICACIONES
// =============================

const mostrarNotificacion = (mensaje: string) => {
  setNotificacion(mensaje);

  setTimeout(() => {
    setNotificacion("");
  }, 2500);
};

// =============================
// CERRAR SESIÓN
// =============================

const cerrarSesion = async () => {
  await supabase.auth.signOut();
  router.push("/Login");
};

// =============================
// OBTENER NOMBRE
// =============================

const obtenerNombreUsuario = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  setNombreUsuario(
    user.user_metadata?.nombre ||
      user.email?.split("@")[0] ||
      "Usuario"
  );
};

// =============================
// OBTENER MATERIALES
// =============================

const obtenerMateriales = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from("materiales")
    .select("*")
    .eq("usuario_id", user.id)
    .order("fecha_subida", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return;
  }

  setMateriales(data || []);
};

// =============================
// SUBIR ARCHIVO
// =============================

const subirArchivo = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const archivo = e.target.files?.[0];

  if (!archivo) return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const nombre = `${Date.now()}-${archivo.name}`;

    // subir al Storage

    const { error } = await supabase.storage
      .from("materiales")
      .upload(nombre, archivo, {
        upsert: false,
      });

    if (error) throw error;

    // obtener URL pública

    const { data } = supabase.storage
      .from("materiales")
      .getPublicUrl(nombre);

    // guardar en BD

    const { error: dbError } = await supabase
      .from("materiales")
      .insert({
        usuario_id: user.id,
        nombre_archivo: archivo.name,
        url_archivo: data.publicUrl,
        progreso: 0,
      });

    if (dbError) throw dbError;

    mostrarNotificacion("✅ Archivo subido correctamente");

    obtenerMateriales();

    // limpiar input

    e.target.value = "";
  } catch (error: any) {
    console.error(error);

    mostrarNotificacion(
      error.message || "Error al subir el archivo."
    );
  }
};

// =============================
// RACHA
// =============================

const calcularRacha = () => {
  if (materiales.length === 0) return 0;

  const fechas = [
    ...new Set(
      materiales.map((m) =>
        new Date(m.fecha_subida).toDateString()
      )
    ),
  ];

  fechas.sort(
    (a, b) =>
      new Date(b).getTime() -
      new Date(a).getTime()
  );

  const hoy = new Date();

  const ultimaFecha = new Date(fechas[0]);

  const diferencia = Math.floor(
    (hoy.getTime() - ultimaFecha.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diferencia > 1) return 0;

  let racha = 1;

  for (let i = 1; i < fechas.length; i++) {
    const actual = new Date(fechas[i - 1]);

    const anterior = new Date(fechas[i]);

    const dias = Math.floor(
      (actual.getTime() - anterior.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (dias === 1) {
      racha++;
    } else {
      break;
    }
  }

  return racha;
};

// =============================

const ultimoMaterial = materiales[0];

const rachaActual = calcularRacha();
return (

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

{/* Overlay */}

{menuAbierto && (

<div
onClick={()=>setMenuAbierto(false)}
className="
fixed
inset-0
bg-black/40
backdrop-blur-sm
z-40
"
/>

)}

{/* MENÚ */}

<div

className={`
fixed
top-0
left-0
w-[290px]
h-full
bg-white
dark:bg-slate-900
shadow-2xl
z-50
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

<div className="flex justify-between items-center">

<div>

<h2 className="font-bold text-xl dark:text-white">

{nombreUsuario}

</h2>

<p className="text-gray-500 text-sm">

Bienvenido nuevamente

</p>

</div>

<X

className="cursor-pointer"

onClick={()=>setMenuAbierto(false)}

/>

</div>

<div className="mt-10 space-y-2">

<Link
href="/perfil"
className="
flex
items-center
gap-3
p-3
rounded-xl
hover:bg-blue-50
dark:hover:bg-slate-800
transition
"
>

<User className="text-blue-600"/>

<span className="dark:text-white">

Perfil

</span>

</Link>

<Link
href="/configuracion"
className="
flex
items-center
gap-3
p-3
rounded-xl
hover:bg-blue-50
dark:hover:bg-slate-800
transition
"
>

<Settings className="text-blue-600"/>

<span className="dark:text-white">

Configuración

</span>

</Link>

<button

onClick={cerrarSesion}

className="
w-full
flex
items-center
gap-3
p-3
rounded-xl
hover:bg-red-50
transition
text-red-500
"

>

<LogOut/>

Cerrar sesión

</button>

</div>

</div>

</div>

<div className="max-w-[1450px] mx-auto px-5 lg:px-10 pb-28">

{/* HEADER */}

<header

className="
flex
justify-between
items-center
pt-6
pb-6
"

>

<div className="flex items-center gap-4">

<button
onClick={()=>setMenuAbierto(true)}
>

<Menu
className="
text-blue-600
cursor-pointer
"
/>

</button>

<div>

<h1 className="font-black text-2xl dark:text-white">

Raccoon

<span className="text-blue-600">

Study

</span>

</h1>

<p className="text-xs text-gray-500">

Tu espacio de aprendizaje

</p>

</div>

</div>

<div className="relative">

<button
className="
w-11
h-11
rounded-full
bg-white
dark:bg-slate-800
shadow
flex
items-center
justify-center
"
>

<Bell className="text-blue-600"/>

</button>

</div>

</header>

{/* NOTIFICACIÓN */}

{

notificacion && (

<div

className="
fixed
top-6
left-1/2
-translate-x-1/2
bg-gradient-to-r
from-blue-600
to-cyan-500
text-white
px-6
py-3
rounded-2xl
shadow-2xl
z-[100]
animate-pulse
"

>

{notificacion}

</div>

)

}
{/* CONTENIDO */}

<section className="space-y-6">

  {/* BIENVENIDA */}

  <div className="bg-white dark:bg-slate-800 rounded-[35px] shadow-xl p-6 flex flex-col md:flex-row items-center justify-between">

    <div>

      <h2 className="text-3xl md:text-4xl font-bold dark:text-white">

        ¡Hola {nombreUsuario}! 👋

      </h2>

      <p className="mt-3 text-gray-500 dark:text-gray-300">

        Continúa aprendiendo donde lo dejaste.

      </p>

    </div>

    <Image
      src="/raccoon.png"
      alt="Raccoon"
      width={170}
      height={170}
      className="w-32 md:w-44 mt-6 md:mt-0"
    />

  </div>

  {/* SUBIR MATERIAL */}

  <div className="bg-white dark:bg-slate-800 rounded-[35px] shadow-xl p-8">

    <label
      htmlFor="archivo"
      className="cursor-pointer flex flex-col items-center justify-center"
    >

      <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-slate-700 flex items-center justify-center">

        <CloudUpload
          size={45}
          className="text-blue-600"
        />

      </div>

      <h3 className="mt-6 text-2xl font-bold text-blue-600">

        Subir material

      </h3>

      <p className="mt-2 text-gray-500 text-center">

        PDF, Word o PowerPoint

      </p>

      <div className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-full shadow-lg hover:scale-105 transition">

        Seleccionar archivo

      </div>

      <input
        id="archivo"
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx"
        onChange={subirArchivo}
      />

    </label>

  </div>

  {/* IA */}

  <Link href="/Chat">

    <div className="rounded-[35px] p-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 shadow-xl text-white hover:scale-[1.01] transition">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold">

            🤖 Raccoon IA

          </h2>

          <p className="mt-3 opacity-90">

            Pregunta cualquier tema, genera resúmenes,
            explicaciones y ayuda personalizada.

          </p>

          <button className="mt-6 bg-white text-blue-700 px-6 py-3 rounded-full font-semibold">

            Abrir IA

          </button>

        </div>

        <Image
          src="/raccoon.png"
          alt="IA"
          width={130}
          height={130}
          className="hidden md:block"
        />

      </div>

    </div>

  </Link>

  {/* ÚLTIMO MATERIAL */}

  <div className="bg-white dark:bg-slate-800 rounded-[35px] shadow-xl p-6">

    <h2 className="font-bold text-2xl dark:text-white mb-5">

      Último material

    </h2>

    {

      ultimoMaterial ? (

        <div className="flex items-center gap-5">

          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-slate-700 flex items-center justify-center">

            <FileText
              className="text-blue-600"
              size={30}
            />

          </div>

          <div>

            <h3 className="font-bold dark:text-white">

              {ultimoMaterial.nombre_archivo}

            </h3>

            <p className="text-gray-500">

              Progreso: {ultimoMaterial.progreso}%

            </p>

          </div>

        </div>

      ) : (

        <div className="text-center py-8">

          <Image
            src="/raccoon.png"
            alt=""
            width={70}
            height={70}
            className="mx-auto opacity-60"
          />

          <p className="mt-4 text-gray-500">

            Todavía no has subido materiales.

          </p>

        </div>

      )

    }

  </div>

  {/* RACHA */}

  <div className="bg-white dark:bg-slate-800 rounded-[35px] shadow-xl p-6 flex justify-between items-center">

    <div>

      <p className="text-red-500 font-semibold">

        🔥 Racha actual

      </p>

      <h2 className="text-5xl font-bold dark:text-white">

        {rachaActual}

      </h2>

      <p className="text-gray-500 mt-2">

        días consecutivos

      </p>

    </div>

    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">

      <Flame
        className="text-orange-500"
        size={40}
      />

    </div>

  </div>

</section>
{/* ================= ACCIONES RÁPIDAS ================= */}

<section className="mt-8">

  <div className="flex justify-between items-center mb-5">

    <div>

      <h2 className="text-2xl font-bold dark:text-white">

        Acciones rápidas ⚡

      </h2>

      <p className="text-gray-500">

        Continúa estudiando con un solo clic

      </p>

    </div>

  </div>

  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

    {/* RESÚMENES */}

    <Link href="/metodos/resumenes">

      <div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer">

        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">

          <FileText
            size={30}
            className="text-blue-600"
          />

        </div>

        <h3 className="font-bold text-lg mt-5 dark:text-white">

          Resúmenes IA

        </h3>

        <p className="text-gray-500 text-sm mt-2">

          Resume automáticamente cualquier PDF.

        </p>

      </div>

    </Link>

    {/* FLASHCARDS */}

    <Link href="/metodos/flashcards">

      <div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer">

        <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center">

          <Brain
            size={30}
            className="text-cyan-600"
          />

        </div>

        <h3 className="font-bold text-lg mt-5 dark:text-white">

          Flashcards

        </h3>

        <p className="text-gray-500 text-sm mt-2">

          Tarjetas creadas por IA.

        </p>

      </div>

    </Link>

    {/* QUIZZES */}

    <Link href="/quizzes">

      <div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer">

        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">

          <Brain
            size={30}
            className="text-purple-600"
          />

        </div>

        <h3 className="font-bold text-lg mt-5 dark:text-white">

          Quizzes

        </h3>

        <p className="text-gray-500 text-sm mt-2">

          Evalúa tu conocimiento.

        </p>

      </div>

    </Link>

    {/* MÉTODOS */}

    <Link href="/metodos">

      <div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer">

        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">

          <Brain
            size={30}
            className="text-orange-500"
          />

        </div>

        <h3 className="font-bold text-lg mt-5 dark:text-white">

          Métodos

        </h3>

        <p className="text-gray-500 text-sm mt-2">

          Aprende con técnicas inteligentes.

        </p>

      </div>

    </Link>

  </div>

</section>
{/* ================= ESTADÍSTICAS ================= */}

<section className="mt-10">

  <div className="flex justify-between items-center mb-5">

    <div>

      <h2 className="text-2xl font-bold dark:text-white">

        Tu progreso 📈

      </h2>

      <p className="text-gray-500">

        Sigue creciendo cada día.

      </p>

    </div>

  </div>

  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

    {/* Materiales */}

    <div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6">

      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">

        <FileText
          className="text-blue-600"
          size={28}
        />

      </div>

      <h3 className="text-3xl font-bold mt-5 dark:text-white">

        {materiales.length}

      </h3>

      <p className="text-gray-500 mt-2">

        Materiales

      </p>

    </div>

    {/* Flashcards */}

    <div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6">

      <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center">

        <Brain
          className="text-cyan-600"
          size={28}
        />

      </div>

      <h3 className="text-3xl font-bold mt-5 dark:text-white">

        {flashcardsCreadas}

      </h3>

      <p className="text-gray-500 mt-2">

        Flashcards

      </p>

    </div>

    {/* Quizzes */}

    <div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6">

      <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">

        <Brain
          className="text-purple-600"
          size={28}
        />

      </div>

      <h3 className="text-3xl font-bold mt-5 dark:text-white">

        {quizzesRealizados}

      </h3>

      <p className="text-gray-500 mt-2">

        Quizzes

      </p>

    </div>

    {/* Horas */}

    <div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6">

      <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">

        <Flame
          className="text-orange-500"
          size={28}
        />

      </div>

      <h3 className="text-3xl font-bold mt-5 dark:text-white">

        {horasEstudio}h

      </h3>

      <p className="text-gray-500 mt-2">

        Estudiadas

      </p>

    </div>

  </div>

</section>

{/* ================= PROGRESO GENERAL ================= */}

<section className="mt-10">

  <div className="bg-white dark:bg-slate-800 rounded-[35px] shadow-xl p-8">

    <div className="flex justify-between items-center">

      <div>

        <h2 className="text-2xl font-bold dark:text-white">

          Progreso general 🎯

        </h2>

        <p className="text-gray-500 mt-2">

          Sigue estudiando para completar tu meta.

        </p>

      </div>

      <span className="text-4xl">

        🚀

      </span>

    </div>

    <div className="mt-8 h-5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">

      <div
        className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 rounded-full transition-all duration-700"
        style={{
          width: `${
            materiales.length === 0
              ? 0
              : Math.min(materiales.length * 10, 100)
          }%`,
        }}
      />

    </div>

    <div className="flex justify-between mt-3">

      <span className="text-gray-500">

        Nivel actual

      </span>

      <span className="font-bold text-blue-600">

        {Math.min(materiales.length * 10,100)}%

      </span>

    </div>

  </div>

</section>
{/* ================= OBJETIVO DEL DÍA ================= */}

<section className="mt-10">

<div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-[35px] shadow-xl p-8 text-white">

<div className="flex justify-between items-center">

<div>

<h2 className="text-2xl font-bold">

🎯 Objetivo de hoy

</h2>

<p className="opacity-90 mt-2">

Completa {objetivo} actividades para mantener tu racha.

</p>

</div>

<Image
src="/raccoon.png"
width={90}
height={90}
alt=""
/>

</div>

<div className="mt-6">

<div className="bg-white/30 rounded-full h-4 overflow-hidden">

<div
className="bg-white h-full rounded-full transition-all duration-700"
style={{
width:`${Math.min(materiales.length*20,100)}%`
}}
/>

</div>

<p className="mt-3">

{Math.min(materiales.length,objetivo)} de {objetivo} actividades completadas

</p>

</div>

</div>

</section>



{/* ================= RACCOON IA ================= */}

<section className="mt-10">

<div className="bg-white dark:bg-slate-800 rounded-[35px] shadow-xl p-8">

<div className="flex items-center gap-5">

<Image
src="/raccoon.png"
width={75}
height={75}
alt=""
/>

<div>

<h2 className="text-2xl font-bold dark:text-white">

Raccoon IA dice...

</h2>

<p className="text-gray-500">

Tu tutor inteligente

</p>

</div>

</div>

<div className="mt-6 bg-blue-50 dark:bg-slate-700 rounded-3xl p-6">

<p className="leading-8 text-lg dark:text-white">

{mensajeIA}

</p>

</div>

</div>

</section>



{/* ================= LOGROS ================= */}

<section className="mt-10">

<h2 className="text-2xl font-bold mb-5 dark:text-white">

🏆 Logros

</h2>

<div className="grid grid-cols-2 md:grid-cols-4 gap-5">

<div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6 text-center">

<div className="text-5xl">

🥇

</div>

<h3 className="font-bold mt-4 dark:text-white">

Primer material

</h3>

<p className="text-gray-500 text-sm mt-2">

Sube tu primer documento.

</p>

</div>

<div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6 text-center">

<div className="text-5xl">

🔥

</div>

<h3 className="font-bold mt-4 dark:text-white">

3 días

</h3>

<p className="text-gray-500 text-sm mt-2">

Mantén tu racha.

</p>

</div>

<div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6 text-center">

<div className="text-5xl">

🧠

</div>

<h3 className="font-bold mt-4 dark:text-white">

Primer Quiz

</h3>

<p className="text-gray-500 text-sm mt-2">

Responde un quiz.

</p>

</div>

<div className="bg-white dark:bg-slate-800 rounded-[30px] shadow-xl p-6 text-center">

<div className="text-5xl">

🚀

</div>

<h3 className="font-bold mt-4 dark:text-white">

Nivel Experto

</h3>

<p className="text-gray-500 text-sm mt-2">

Completa todos los métodos.

</p>

</div>

</div>

</section>



{/* ================= ACTIVIDAD RECIENTE ================= */}

<section className="mt-10 mb-10">

<div className="bg-white dark:bg-slate-800 rounded-[35px] shadow-xl p-8">

<h2 className="text-2xl font-bold dark:text-white">

Actividad reciente

</h2>

<div className="mt-6 space-y-4">

{

materiales.slice(0,5).map((material)=>(

<div
key={material.id}
className="flex justify-between items-center bg-slate-50 dark:bg-slate-700 rounded-2xl p-4"
>

<div className="flex gap-4 items-center">

<FileText
className="text-blue-600"
/>

<div>

<h3 className="font-semibold dark:text-white">

{material.nombre_archivo}

</h3>

<p className="text-gray-500 text-sm">

Material agregado

</p>

</div>

</div>

<p className="text-gray-400 text-sm">

{new Date(material.fecha_subida).toLocaleDateString()}

</p>

</div>

))

}

{

materiales.length===0 &&(

<div className="text-center py-10">

<Image
src="/raccoon.png"
width={80}
height={80}
alt=""
className="mx-auto opacity-60"
/>

<p className="mt-4 text-gray-500">

Todavía no hay actividad.

</p>

</div>

)

}

</div>

</div>

</section>
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
</main>
);

}