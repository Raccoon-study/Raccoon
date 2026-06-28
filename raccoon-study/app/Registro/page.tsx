"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../src/lib/supabase";
import Image from "next/image";
import Link from "next/link";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

export default function Registro() {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
const router = useRouter();

const [nombre, setNombre] = useState("");
const [correo, setCorreo] = useState("");
const [password, setPassword] = useState("");
const [confirmarPassword, setConfirmarPassword] = useState("");

const handleRegister = async () => {
  if (!nombre || !correo || !password || !confirmarPassword) {
    alert("Completa todos los campos");
    return;
  }

  if (password !== confirmarPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  const { error } = await supabase.auth.signUp({
    email: correo,
    password,
    options: {
      data: {
        nombre,
      },
    },
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Usuario registrado correctamente");
  router.push("/Login");
};
  return (
    <main
      className="
        min-h-screen
        w-full
        bg-gradient-to-b
        from-[#B9D1F8]
        via-[#D6E5FA]
        to-[#EAF2FF]
        flex
        justify-center
        items-center
      "
    >
      <div
        className="
          relative
          w-full
          max-w-md
          min-h-screen
          flex
          flex-col
          items-center
          justify-center
          px-6
          py-6
        "
      >
        {/* Botón volver */}
        <Link href="/">
          <button
            className="
              absolute
              top-4
              left-4
              w-12
              h-12
              rounded-full
              bg-white
              shadow-lg
              flex
              items-center
              justify-center
            "
          >
            <ArrowLeft
              size={24}
              className="text-[#2563ff]"
            />
          </button>
        </Link>

        {/* Imagen del mapache */}
        <Image
          src="/raccoon.png"
          alt="Raccoon Study"
          width={280}
          height={280}
          priority
          className="
            w-[220px]
            sm:w-[250px]
            md:w-[280px]
            h-auto
            object-contain
            -mt-16
          "
        />

        {/* Tarjeta */}
        <div
          className="
            w-full
            bg-white/85
            backdrop-blur-sm
            rounded-[35px]
            shadow-xl
            p-6
            mt-2
          "
        >
          <div className="space-y-4">

            {/* Nombre */}
            <div
              className="
                h-14
                border
                border-gray-300
                rounded-2xl
                flex
                items-center
                px-4
              "
            >
              <User
                className="text-[#2563ff] mr-3"
                size={20}
              />

              <input
                 type="text"
                  placeholder="Nombre Completo"
                   value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                   className="
                     w-full
                    outline-none
                      bg-transparent
                 "
              />
            </div>

            {/* Correo */}
            <div
              className="
                h-14
                border
                border-gray-300
                rounded-2xl
                flex
                items-center
                px-4
              "
            >
              <Mail
                className="text-[#2563ff] mr-3"
                size={20}
              />

              <input
               type="email"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="
                 w-full
                outline-none
                bg-transparent
           "
         />
            </div>

            {/* Contraseña */}
            <div
              className="
                h-14
                border
                border-gray-300
                rounded-2xl
                flex
                items-center
                px-4
              "
            >
              <Lock
                className="text-[#2563ff] mr-3"
                size={20}
              />

              <input
                 type={mostrarPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="
                w-full
                outline-none
                bg-transparent
                "
              />
              
              <button
                type="button"
                onClick={() =>
                  setMostrarPassword(!mostrarPassword)
                }
              >
                {mostrarPassword ? (
                  <EyeOff
                    size={20}
                    className="text-gray-400"
                  />
                ) : (
                  <Eye
                    size={20}
                    className="text-gray-400"
                  />
                )}
              </button>
            </div>

            {/* Confirmar contraseña */}
            <div
              className="
                h-14
                border
                border-gray-300
                rounded-2xl
                flex
                items-center
                px-4
              "
            >
              <Lock
                className="text-[#2563ff] mr-3"
                size={20}
              />

              <input
               type={mostrarConfirmar ? "text" : "password"}
               placeholder="Confirmar contraseña"
               value={confirmarPassword}
               onChange={(e) => setConfirmarPassword(e.target.value)}
               className="w-full outline-none bg-transparent"
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarConfirmar(!mostrarConfirmar)
                }
              >
                {mostrarConfirmar ? (
                  <EyeOff
                    size={20}
                    className="text-gray-400"
                  />
                ) : (
                  <Eye
                    size={20}
                    className="text-gray-400"
                  />
                )}
              </button>
            </div>

          </div>

          {/* Botón registrarse */}
          <button
            className="
              w-full
              h-16
              mt-8
              rounded-[24px]
              bg-gradient-to-r
              from-[#2563ff]
              to-[#6BA8FF]
              text-white
              text-xl
              font-bold
              shadow-lg
              hover:scale-[1.02]
              transition
            "
          >
            Registrarse
          </button>

          {/* Link login */}
          <p
            className="
              text-center
              text-gray-700
              mt-8
            "
          >
            ¿Ya tienes cuenta?

            <Link
              href="/Login"
              className="
                text-[#2563ff]
                font-bold
                ml-2
              "
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}