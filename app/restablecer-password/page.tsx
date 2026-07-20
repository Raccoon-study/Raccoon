"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RestablecerPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    
    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("¡Contraseña actualizada con éxito!");
      router.push("/Login"); 
    }
    setLoading(false);
  }

  return (
    <main
      className="
      min-h-screen
      w-full
      bg-gradient-to-b
      from-[#B9D1F8]
      via-[#D8E7FF]
      to-[#EEF5FF]
      dark:from-slate-900
      dark:to-slate-800
      flex
      flex-col
      justify-center
      items-center
      px-6
      py-10
      overflow-hidden
      "
    >
      {/* Contenedor superior con la imagen del mapache */}
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/raccoon.png"
          alt="Raccoon Study"
          width={180}
          height={180}
          priority
          className="w-[140px] sm:w-[160px] h-auto object-contain"
        />
      </div>

      {/* Tarjeta central blanca idéntica a tus otras vistas */}
      <div
        className="
        w-full
        max-w-[440px]
        bg-white
        dark:bg-slate-900
        rounded-[30px]
        shadow-xl
        p-8
        sm:p-10
        flex
        flex-col
        items-center
        "
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
          Nueva contraseña
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          Ingresa tu nueva contraseña para acceder a Raccoon Study.
        </p>

        <form onSubmit={handleReset} className="w-full flex flex-col gap-4">
          <div className="w-full relative">
            <input 
              className="
              w-full
              h-[52px]
              px-4
              rounded-xl
              border
              border-gray-200
              dark:border-slate-700
              bg-transparent
              text-gray-800
              dark:text-white
              focus:outline-none
              focus:border-[#2563ff]
              transition
              "
              type="password" 
              placeholder="Nueva contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <button 
            type="submit"
            className="
            w-full
            h-[52px]
            mt-2
            rounded-xl
            bg-gradient-to-r
            from-[#2563ff]
            to-[#18C3F7]
            text-white
            font-bold
            shadow-md
            hover:scale-[1.01]
            transition
            disabled:opacity-50
            "
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}