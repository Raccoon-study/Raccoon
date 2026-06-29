"use client";


import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
} from "lucide-react";

export default function Chat() {
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const [mensajes, setMensajes] = useState([
    {
      tipo: "ia",
      texto:
        "👋 ¡Hola! Soy Raccoon IA.\nEstoy listo para ayudarte a estudiar.\n\n¿Qué tema quieres aprender hoy?",
    },
  ]);

  const finalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finalRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [mensajes]);

  async function preguntar() {
    if (!mensaje.trim()) return;

    const pregunta = mensaje;

    setMensajes((prev) => [
      ...prev,
      {
        tipo: "user",
        texto: pregunta,
      },
    ]);

    setMensaje("");

    setCargando(true);

    try {
      const res = await fetch("/Api/Chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensaje: pregunta,
        }),
      });

      const data = await res.json();

      setMensajes((prev) => [
        ...prev,
        {
          tipo: "ia",
          texto: data.respuesta,
        },
      ]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          tipo: "ia",
          texto: "❌ Ocurrió un error al responder.",
        },
      ]);
    }

    setCargando(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-purple-100 flex flex-col">

      {/* HEADER */}

      <header className="bg-white shadow-md px-8 py-5 flex justify-between items-center">

        <div className="flex items-center gap-4">

          <Link
            href="/Dashboard"
            className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>

            <h1 className="text-2xl font-bold text-cyan-700 flex items-center gap-2">
              <Sparkles />
              Raccoon IA
            </h1>

            <p className="text-gray-500 text-sm">
              Tu asistente inteligente de estudio
            </p>

          </div>

        </div>

      </header>

      {/* CHAT */}

      <div className="flex-1 overflow-y-auto px-10 py-8">

        <div className="max-w-5xl mx-auto space-y-6">

          {mensajes.map((m, i) => (

            <div
              key={i}
              className={`flex ${
                m.tipo === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`rounded-3xl shadow-lg px-6 py-5 max-w-2xl whitespace-pre-wrap ${
                  m.tipo === "user"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    : "bg-white"
                }`}
              >

                <div className="flex items-center gap-2 mb-3">

                  {m.tipo === "user" ? (
                    <>
                      <User size={18} />
                      <b>Tú</b>
                    </>
                  ) : (
                    <>
                      <Bot size={18} />
                      <b>Raccoon IA</b>
                    </>
                  )}

                </div>

                {m.texto}

              </div>

            </div>

          ))}

          {cargando && (

            <div className="flex">

              <div className="bg-white rounded-3xl shadow-lg px-6 py-5">

                <div className="flex items-center gap-3">

                  <Loader2 className="animate-spin" />

                  Pensando...

                </div>

              </div>

            </div>

          )}

          <div ref={finalRef} />

        </div>

      </div>

      {/* INPUT */}

      <div className="bg-white border-t p-6">

        <div className="max-w-5xl mx-auto flex gap-4">

          <textarea
            rows={2}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Pregunta cualquier tema..."
            className="flex-1 border rounded-2xl p-4 resize-none outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button
            onClick={preguntar}
            disabled={cargando}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 duration-300 text-white px-8 rounded-2xl shadow-xl"
          >

            <Send />

          </button>

        </div>

      </div>

    </div>
  );
}