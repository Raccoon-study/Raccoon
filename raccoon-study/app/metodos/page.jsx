"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  Bell,
  ChevronRight,
  Home,
  Grid,
  HelpCircle,
  User,
  Sparkles,
} from "lucide-react";

export default function Metodos() {

  const [showAI, setShowAI] = useState(false);
  const [input, setInput] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [loading, setLoading] = useState(false);

  const handleIA = async () => {
    setLoading(true);
    setRespuesta("");

    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texto: input }),
      });

      const data = await res.json();
      setRespuesta(data.resultado);
    } catch {
      setRespuesta("Error ❌");
    }

    setLoading(false);
  };

  const metodos = [
    {
      titulo: "Pomodoro",
      descripcion: "Gestiona tu tiempo con bloques de enfoque y descansos.",
      icono: "🍅",
      color: "text-red-500",
      ruta: "/Pomodoro",
    },
    {
      titulo: "Cornell Notes",
      descripcion: "Organiza tus apuntes y mejora la comprensión.",
      icono: "📄",
      color: "text-green-500",
      ruta: "/Tema",
    },
    {
      titulo: "Flashcards",
      descripcion: "Repasa con tarjetas interactivas creadas con IA.",
      icono: "🪪",
      color: "text-orange-500",
      ruta: "/flashcards",
    },
    {
      titulo: "Técnica Feynman",
      descripcion: "Explica conceptos y descubre qué necesitas reforzar.",
      icono: "📝",
      color: "text-indigo-500",
      ruta: "/feynman",
    },
  ];

  return (
    <div className="min-h-screen bg-[#EAF2FB] pb-28">

      <header className="flex justify-between items-center px-6 py-5">
        <Menu size={22} />
        <h1 className="text-xl font-bold text-blue-700">
          Raccoon Study
        </h1>
        <Bell size={20} />
      </header>

      <main className="px-6">

        <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
          ¿Cómo quieres
          <br />
          estudiar hoy?
        </h2>

        <div className="text-3xl mt-2">📚</div>

        <p className="text-gray-500 mt-4 text-sm max-w-xs">
          Elige el método que mejor se adapte a tu forma de aprender.
        </p>

        <div className="mt-8">

          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-3">
            <Sparkles size={16} />
            Recomendado para ti
          </div>

          <div className="bg-[#EEF2FF] rounded-3xl border border-indigo-200 p-5 shadow">

            <div className="flex justify-between items-center">

              <div>
                <h3 className="font-bold text-slate-900">
                  ¿No sabes cuál elegir?
                </h3>

                <p className="text-sm text-indigo-600 mt-2">
                  Deja que Raccoon IA te recomiende el mejor método.
                </p>
              </div>

              <button
                onClick={() => setShowAI(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-full text-xs flex items-center gap-1"
              >
                Preguntar
                <ChevronRight size={14} />
              </button>

            </div>

          </div>

        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">

          {metodos.map((item) => (
            <div
              key={item.titulo}
              className="bg-white rounded-3xl p-5 shadow hover:shadow-lg transition"
            >

              <div className="flex justify-between">
                <div className="text-3xl">{item.icono}</div>
                <span className={item.color}>★</span>
              </div>

              <h3 className="font-bold mt-4">{item.titulo}</h3>

              <p className="text-gray-500 text-xs mt-2 min-h-[60px]">
                {item.descripcion}
              </p>

              <Link
                href={item.ruta}
                className="mt-5 border rounded-xl py-2 flex justify-center items-center gap-2 text-sm font-semibold"
              >
                Elegir método
                <ChevronRight size={15} />
              </Link>

            </div>
          ))}

        </div>

      </main>

      {/* ✅ MODAL IA */}
      {showAI && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md">

            <h2 className="text-lg font-bold mb-3">
              🤖 Raccoon IA
            </h2>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="¿Qué quieres estudiar?"
              className="w-full border rounded-lg p-3 text-sm"
            />

            <button
              onClick={handleIA}
              className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg"
            >
              {loading ? "Pensando..." : "Analizar"}
            </button>

            {respuesta && (
              <div className="mt-4 bg-indigo-50 p-3 rounded-lg text-sm">
                {respuesta}
              </div>
            )}

            <button
              onClick={() => setShowAI(false)}
              className="mt-4 text-xs text-gray-400"
            >
              Cerrar
            </button>

          </div>
        </div>
      )}

     
           {/* NAVBAR */}
           <nav className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[35px] shadow-lg py-3 px-6 flex justify-around">
     
             <Link href="/Dashboard" className="flex flex-col items-center text-gray-500">
               <Home size={20} />
               <span className="text-xs">Inicio</span>
             </Link>
     
             <Link href="/metodos" className="flex flex-col items-center text-gray-500">
               <Grid size={20} />
               <span className="text-xs">Métodos</span>
             </Link>
     
             <Link href="/quizzes" className="flex flex-col items-center text-gray-500">
               <HelpCircle size={20} />
               <span className="text-xs">Quiz</span>
             </Link>
     
             <Link href="/perfil" className="flex flex-col items-center text-blue-600">
               <User size={20} />
               <span className="text-xs font-semibold">Perfil</span>
             </Link>
     
           </nav>
     
         </div>
       );
     }