"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, GraduationCap } from "lucide-react";

export default function RegistroExitoso() {
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
          w-full
          max-w-md
          min-h-screen
          flex
          flex-col
          items-center
          justify-center
          px-6
          py-8
        "
      >
        {/* Mapache */}
        <Image
          src="/raccoon.png"
          alt="Raccoon"
          width={260}
          height={260}
          priority
          className="
            w-[200px]
            sm:w-[230px]
            md:w-[260px]
            h-auto
            object-contain
            -mt-14
          "
        />

        {/* Tarjeta */}
        <div
          className="
            relative
            w-full
            bg-white/85
            backdrop-blur-sm
            rounded-[35px]
            shadow-xl
            p-8
            -mt-3
          "
        >
          {/* Círculo check */}
          <div
            className="
              absolute
              -top-7
              left-1/2
              -translate-x-1/2
              w-14
              h-14
              rounded-full
              bg-[#2563ff]
              shadow-lg
              flex
              items-center
              justify-center
            "
          >
            <Check
              size={30}
              className="text-white"
            />
          </div>

          <div className="mt-8">

            <h1
              className="
                text-3xl
                font-extrabold
                text-center
                text-gray-800
              "
            >
              ¡Registro exitoso!
            </h1>

            <p
              className="
                text-gray-500
                text-center
                mt-3
                text-base
              "
            >
              Tu cuenta fue creada correctamente.
              Ya puedes comenzar tu viaje académico.
            </p>

            {/* Tarjeta pequeña */}
            <div
              className="
                mt-8
                border
                rounded-2xl
                p-4
                flex
                items-center
                gap-4
                bg-[#f8faff]
              "
            >
              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-[#e8f0ff]
                  flex
                  items-center
                  justify-center
                "
              >
                <GraduationCap
                  size={22}
                  className="text-[#2563ff]"
                />
              </div>

              <div>
                <p className="font-bold text-sm">
                  Acceso completo activado
                </p>

                <p className="text-[#2563ff] text-xs">
                  Beneficios académicos disponibles
                </p>
              </div>
            </div>

            {/* Botón */}
            <Link href="/login">
              <button
                className="
                  w-full
                  h-16
                  mt-8
                  rounded-[22px]
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
                Continuar
              </button>
            </Link>

          </div>
        </div>

        <h2
          className="
            mt-8
            text-2xl
            font-extrabold
            tracking-[4px]
          "
        >
          <span className="text-gray-400">
            RACCOON
          </span>

          <span className="text-[#A8C4FF] ml-2">
            STUDY
          </span>
        </h2>

      </div>
    </main>
  );
}