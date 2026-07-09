"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../lib/supabase";

import {
  ArrowLeft,
  Sparkles,
  FileText,
  Brain,
  BookOpen,
  Clock,
  CheckCircle2,
  Loader2,
  Layers,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

interface Material {
  id: string;
  nombre_archivo: string;
  texto: string;
  fecha_subida: string;
}

interface RespuestaIA {
  resumen: string;
  conceptos?: string[];
  palabras?: string[];
}

export default function Resumenes() {
  const [loading, setLoading] = useState(true);

  const [material, setMaterial] =
    useState<Material | null>(null);

  const [resumen, setResumen] =
    useState("");

  const [conceptos, setConceptos] =
    useState<string[]>([]);

  const [palabras, setPalabras] =
    useState<string[]>([]);

  const [tiempoLectura, setTiempoLectura] =
    useState(0);

  useEffect(() => {
    cargarResumen();
  }, []);

  async function cargarResumen() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("materiales")
      .select("*")
      .eq("usuario_id", user.id)
      .order("fecha_subida", {
        ascending: false,
      })
      .limit(1)
      .single();

    if (!data) {
      setLoading(false);
      return;
    }

    setMaterial(data);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texto: data.texto,
        }),
      });

      const resultado: RespuestaIA =
        await res.json();

      setResumen(resultado.resumen);

      if (resultado.conceptos) {
        setConceptos(resultado.conceptos);
      }

      if (resultado.palabras) {
        setPalabras(resultado.palabras);
      }

      const palabrasTotal =
        resultado.resumen.split(" ").length;

      setTiempoLectura(
        Math.max(
          1,
          Math.ceil(palabrasTotal / 200)
        )
      );
    } catch {
      setResumen(
        "No fue posible generar el resumen."
      );
    }

    setLoading(false);
  }
    return (
    <div className="min-h-screen bg-gradient-to-b from-[#B9D1F8] via-[#DDEBFF] to-[#EEF5FF] dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">

      {/* HEADER */}

      <header className="flex items-center justify-between px-6 pt-6">

        <Link
          href="/Dashboard"
          className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow flex items-center justify-center hover:scale-105 transition"
        >
          <ArrowLeft className="text-blue-600" />
        </Link>

        <div className="flex items-center gap-3">

          <Image
            src="/raccoon.png"
            width={45}
            height={45}
            alt="Raccoon"
          />

          <div>

            <h1 className="text-xl font-extrabold dark:text-white">
              Raccoon
              <span className="text-blue-600">
                Study
              </span>
            </h1>

            <p className="text-xs text-gray-500">
              Resúmenes IA
            </p>

          </div>

        </div>

        <div className="w-12"></div>

      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {loading ? (

          <div className="bg-white dark:bg-slate-800 rounded-[35px] shadow-xl p-12 text-center">

            <Image
              src="/raccoon.png"
              width={90}
              height={90}
              alt=""
              className="mx-auto animate-bounce"
            />

            <Loader2
              size={40}
              className="mx-auto mt-8 animate-spin text-blue-600"
            />

            <h2 className="mt-8 text-2xl font-bold dark:text-white">

              Raccoon IA está analizando tu material...

            </h2>

            <p className="text-gray-500 mt-3">

              Esto puede tardar unos segundos.

            </p>

          </div>

        ) : !material ? (

          <div className="bg-white dark:bg-slate-800 rounded-[35px] p-10 shadow-xl text-center">

            <Image
              src="/raccoon.png"
              width={100}
              height={100}
              alt=""
              className="mx-auto"
            />

            <h2 className="font-bold text-3xl mt-6 dark:text-white">

              No hay material disponible

            </h2>

            <p className="text-gray-500 mt-3">

              Primero sube un documento desde el Dashboard.

            </p>

            <Link
              href="/Dashboard"
              className="inline-flex items-center gap-2 mt-8 bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-2xl"
            >

              <ArrowLeft size={18} />

              Ir al Dashboard

            </Link>

          </div>

        ) : (

          <>

            {/* HERO */}

            <section className="bg-white dark:bg-slate-800 rounded-[40px] shadow-xl p-8">

              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

                <div className="flex-1">

                  <div className="flex items-center gap-3">

                    <Sparkles className="text-blue-600" />

                    <span className="text-blue-600 font-semibold">

                      Inteligencia Artificial

                    </span>

                  </div>

                  <h2 className="text-4xl font-extrabold mt-5 dark:text-white">

                    Resumen Inteligente

                  </h2>

                  <p className="text-gray-500 mt-4 leading-relaxed">

                    Raccoon IA analizó automáticamente el último archivo
                    que subiste y preparó un resumen optimizado para
                    estudiar más rápido.

                  </p>

                </div>

                <Image
                  src="/raccoon.png"
                  width={170}
                  height={170}
                  alt=""
                />

              </div>

            </section>

            {/* INFORMACIÓN */}

            <div className="grid lg:grid-cols-3 gap-6 mt-8">

              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow">

                <FileText className="text-blue-600" />

                <h3 className="font-bold mt-4 dark:text-white">

                  Material

                </h3>

                <p className="text-gray-500 mt-2 break-all">

                  {material.nombre_archivo}

                </p>

              </div>

              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow">

                <Clock className="text-green-600" />

                <h3 className="font-bold mt-4 dark:text-white">

                  Tiempo de lectura

                </h3>

                <p className="text-3xl font-bold mt-2 text-green-600">

                  {tiempoLectura} min

                </p>

              </div>

              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow">

                <Brain className="text-purple-600" />

                <h3 className="font-bold mt-4 dark:text-white">

                  IA

                </h3>

                <p className="text-gray-500 mt-2">

                  Resumen generado automáticamente.

                </p>

              </div>

            </div>

            {/* CONCEPTOS */}

            {conceptos.length > 0 && (

              <section className="bg-white dark:bg-slate-800 rounded-[35px] shadow mt-8 p-8">

                <div className="flex items-center gap-3">

                  <Brain className="text-blue-600" />

                  <h2 className="font-bold text-2xl dark:text-white">

                    Conceptos Clave

                  </h2>

                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">

                  {conceptos.map((item, index) => (

                    <div
                      key={index}
                      className="bg-[#EEF4FF] dark:bg-slate-700 rounded-2xl p-4 flex items-center gap-3"
                    >

                      <CheckCircle2
                        className="text-blue-600"
                        size={20}
                      />

                      <span className="dark:text-white">

                        {item}

                      </span>

                    </div>

                  ))}

                </div>

              </section>

            )}
                        {/* PALABRAS IMPORTANTES */}

            {palabras.length > 0 && (

              <section className="bg-white dark:bg-slate-800 rounded-[35px] shadow mt-8 p-8">

                <div className="flex items-center gap-3">

                  <Lightbulb className="text-yellow-500" />

                  <h2 className="font-bold text-2xl dark:text-white">

                    Palabras importantes

                  </h2>

                </div>

                <div className="flex flex-wrap gap-3 mt-6">

                  {palabras.map((palabra, index) => (

                    <span
                      key={index}
                      className="px-4 py-2 rounded-full bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-white font-medium"
                    >
                      {palabra}
                    </span>

                  ))}

                </div>

              </section>

            )}

            {/* RESUMEN */}

            <section className="bg-white dark:bg-slate-800 rounded-[35px] shadow mt-8 p-8">

              <div className="flex items-center gap-3">

                <BookOpen className="text-blue-600" />

                <h2 className="font-bold text-2xl dark:text-white">

                  Resumen generado por Raccoon IA

                </h2>

              </div>

              <div className="mt-8 bg-[#EEF4FF] dark:bg-slate-700 rounded-3xl p-8">

                <div className="whitespace-pre-wrap leading-8 text-gray-700 dark:text-gray-200">

                  {resumen}

                </div>

              </div>

            </section>

            {/* CONTINUAR ESTUDIANDO */}

            <section className="bg-white dark:bg-slate-800 rounded-[35px] shadow mt-8 p-8">

              <div className="flex items-center gap-3">

                <Layers className="text-blue-600" />

                <h2 className="font-bold text-2xl dark:text-white">

                  Continúa estudiando

                </h2>

              </div>

              <p className="text-gray-500 mt-3">

                Aprovecha este resumen para generar nuevas actividades.

              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

                <Link
                  href="/flashcards"
                  className="rounded-3xl bg-gradient-to-r from-orange-500 to-yellow-400 text-white p-6 hover:scale-105 transition"
                >

                  <Brain size={35} />

                  <h3 className="font-bold text-xl mt-5">

                    Flashcards

                  </h3>

                  <p className="opacity-90 text-sm mt-2">

                    Memoriza con tarjetas inteligentes.

                  </p>

                </Link>

                <Link
                  href="/quizzes"
                  className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 hover:scale-105 transition"
                >

                  <HelpCircle size={35} />

                  <h3 className="font-bold text-xl mt-5">

                    Quiz IA

                  </h3>

                  <p className="opacity-90 text-sm mt-2">

                    Evalúa lo aprendido.

                  </p>

                </Link>

                <Link
                  href="/feynman"
                  className="rounded-3xl bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6 hover:scale-105 transition"
                >

                  <Brain size={35} />

                  <h3 className="font-bold text-xl mt-5">

                    Feynman

                  </h3>

                  <p className="opacity-90 text-sm mt-2">

                    Explica para comprender.

                  </p>

                </Link>

                <Link
                  href="/metodos"
                  className="rounded-3xl bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 hover:scale-105 transition"
                >

                  <Layers size={35} />

                  <h3 className="font-bold text-xl mt-5">

                    Más métodos

                  </h3>

                  <p className="opacity-90 text-sm mt-2">

                    Explora todas las técnicas.

                  </p>

                </Link>

              </div>

            </section>

          </>

        )}

      </main>

    </div>

  );

}