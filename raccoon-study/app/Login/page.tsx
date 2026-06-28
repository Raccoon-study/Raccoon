"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../src/lib/supabase";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

export default function Login() {
  const [mostrar, setMostrar] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function iniciarSesion() {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/Dashboard";
  }

  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          `${window.location.origin}/Dashboard`,
      },
    });
  }

  async function loginMicrosoft() {
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo:
          `${window.location.origin}/Dashboard`,
      },
    });
  }

  return (
    <main
      className="
      min-h-screen
      bg-gradient-to-b
      from-[#B9D1F8]
      via-[#D6E5FA]
      to-[#EAF2FF]
      flex
      justify-center
      overflow-hidden
      "
    >
      <div
        className="
        w-full
        max-w-md
        min-h-screen
        flex
        flex-col
        px-5
        pt-5
        "
      >

        {/* FLECHA */}

        <Link href="/">
          <button
            className="
            w-12
            h-12
            rounded-full
            bg-white
            shadow-md
            flex
            items-center
            justify-center
            "
          >
            <ArrowLeft
              size={22}
              className="text-[#2563ff]"
            />
          </button>
        </Link>


        {/* MAPACHE */}

        <div
          className="
          flex
          justify-center
          mt-3
          mb-2
          "
        >
          <Image
            src="/raccoon.png"
            alt="Raccoon"
            width={160}
            height={160}
            priority
            className="
            w-[140px]
            h-auto
            object-contain
            "
          />
        </div>


        {/* TARJETA */}

        <div
          className="
          bg-[#f8f8f8]
          rounded-t-[35px]
          px-6
          py-7
          shadow-xl
          flex-1
          "
        >

          <h1
            className="
            text-[30px]
            font-extrabold
            text-center
            text-gray-800
            "
          >
            Iniciar sesión
          </h1>

          <p
            className="
            text-center
            text-gray-500
            mt-2
            "
          >
            Bienvenido nuevamente
          </p>


          {/* EMAIL */}

          <div
            className="
            mt-6
            h-14
            rounded-2xl
            border
            border-gray-300
            bg-white
            flex
            items-center
            px-4
            "
          >
            <Mail
              size={18}
              className="text-[#2563ff]"
            />

            <input
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              type="email"
              placeholder="Correo electrónico"
              className="
              ml-3
              w-full
              outline-none
              bg-transparent
              "
            />
          </div>


          {/* PASSWORD */}

          <div
            className="
            mt-4
            h-14
            rounded-2xl
            border
            border-gray-300
            bg-white
            flex
            items-center
            px-4
            "
          >
            <Lock
              size={18}
              className="text-[#2563ff]"
            />

            <input
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              type={
                mostrar
                  ? "text"
                  : "password"
              }
              placeholder="Contraseña"
              className="
              ml-3
              w-full
              outline-none
              bg-transparent
              "
            />

            <button
              onClick={() =>
                setMostrar(!mostrar)
              }
            >
              {mostrar ? (
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


          <div className="text-right mt-3">
            <button
              className="
              text-[#2563ff]
              text-sm
              "
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>


          {/* BOTÓN LOGIN */}

          <button
            onClick={iniciarSesion}
            className="
            w-full
            h-14
            mt-6
            rounded-[22px]
            bg-gradient-to-r
            from-[#2563ff]
            to-[#6ba8ff]
            text-white
            text-xl
            font-bold
            shadow-lg
            hover:scale-[1.02]
            transition
            "
          >
            Iniciar sesión
          </button>


          {/* DIVISOR */}

          <div
            className="
            flex
            items-center
            gap-3
            my-6
            "
          >
            <div className="flex-1 h-[1px] bg-gray-300" />

            <span
              className="
              text-sm
              text-gray-500
              "
            >
              o continuar con
            </span>

            <div className="flex-1 h-[1px] bg-gray-300" />
          </div>


          {/* GOOGLE + MICROSOFT */}

          <div
            className="
            flex
            justify-center
            gap-5
            "
          >

            <button
              onClick={loginGoogle}
              className="
              w-[90px]
              h-[56px]
              rounded-[18px]
              bg-white
              shadow-md
              border
              border-gray-200
              flex
              items-center
              justify-center
              hover:scale-105
              transition
              "
            >
              <Image
                src="/google.png"
                alt="Google"
                width={28}
                height={28}
                className="w-auto h-auto"
              />
            </button>


            <button
              onClick={loginMicrosoft}
              className="
              w-[90px]
              h-[56px]
              rounded-[18px]
              bg-white
              shadow-md
              border
              border-gray-200
              flex
              items-center
              justify-center
              hover:scale-105
              transition
              "
            >
              <Image
                src="/microsoft.png"
                alt="Microsoft"
                width={28}
                height={28}
                className="w-auto h-auto"
              />
            </button>

          </div>


          <p
            className="
            text-center
            text-sm
            text-gray-500
            mt-6
            "
          >
            ¿No tienes cuenta?{" "}

            <Link
              href="/Registro"
              className="
              text-[#2563ff]
              font-bold
              "
            >
              Regístrate
            </Link>

          </p>

        </div>

      </div>
    </main>
  );
}