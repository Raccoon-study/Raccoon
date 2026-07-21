"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function VerificacionPage() {
  const [verificando, setVerificando] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Supabase procesa automáticamente los tokens que vienen en la URL (#access_token o ?token)
    // Solo validamos que la sesión se haya establecido tras hacer clic en el correo
    const verificarSesion = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // Si hay una sesión activa o el usuario ya está confirmado
        setVerificando(false);
      } catch (err: any) {
        setErrorMsg(err.message || "No se pudo verificar el correo o el enlace ha expirado.");
        setVerificando(false);
      }
    };

    verificarSesion();
  }, []);

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#B9D1F8] via-[#D8E7FF] to-[#EEF5FF] dark:from-slate-900 dark:to-slate-800 overflow-hidden flex flex-col items-center justify-center px-5 py-10">
      
      {/* Mapache idéntico al de tu login */}
      <div className="relative mb-2">
        <Image
          src="/raccoon.png"
          alt="Raccoon Success"
          width={350}
          height={350}
          priority
          className="w-[200px] sm:w-[260px] md:w-[320px] h-auto"
        />
      </div>

      {/* Tarjeta con el estilo redondeado y blur de tu app */}
      <div className="w-full max-w-[600px] bg-white/90 dark:bg-slate-800 backdrop-blur-md rounded-[40px] shadow-xl p-8 md:p-10 text-center">
        
        {verificando ? (
          <div className="space-y-4 py-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Verificando tu cuenta...
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Por favor espera un momento mientras validamos tu correo.
            </p>
          </div>
        ) : errorMsg ? (
          <div className="space-y-6">
            <div className="p-4 bg-red-100 text-red-600 rounded-2xl text-sm font-medium">
              {errorMsg}
            </div>
            <Link
              href="/"
              className="block w-full py-4 rounded-2xl bg-gradient-to-r from-[#2563ff] to-[#18C3F7] text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 size={64} className="text-green-500 animate-bounce" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              ¡Correo Verificado con Éxito!
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
              Tu cuenta ya está lista. Ahora puedes iniciar sesión y disfrutar de todas las funciones de Raccoon.
            </p>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full h-[58px] md:h-[65px] rounded-2xl bg-gradient-to-r from-[#2563ff] to-[#18C3F7] text-white font-bold text-lg md:text-xl shadow-lg hover:scale-[1.02] transition"
            >
              Iniciar sesión <ArrowRight size={22} />
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}