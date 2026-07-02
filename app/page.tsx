import Image from "next/image";
import Link from "next/link";

export default function Home() {
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
      justify-center
      items-center
      overflow-hidden
      transition-all
      duration-500
      "
    >
      <div
        className="
        w-full
        max-w-[1400px]

        min-h-screen

        flex
        flex-col
        items-center
        justify-center

        px-6
        sm:px-10
        lg:px-20

        py-10
        "
      >

        {/* Imagen */}
        <Image
          src="/raccoon.png"
          alt="Raccoon Study"
          width={500}
          height={500}
          priority
          className="
          w-[220px]
          sm:w-[280px]
          md:w-[340px]
          lg:w-[420px]
          h-auto
          object-contain
          "
        />

        {/* Título */}
        <h1
          className="
          text-4xl
          sm:text-5xl
          md:text-6xl
          lg:text-7xl

          font-extrabold
          text-center
          leading-none
          mt-3
          "
        >
          <span className="text-black dark:text-white">
            Raccoon
          </span>

          <span className="text-[#2563ff]">
            Study
          </span>
        </h1>

        {/* Subtítulo */}
        <p
          className="
          text-gray-700
          dark:text-gray-300

          text-base
          sm:text-lg
          md:text-xl

          mt-4
          text-center
          "
        >
          Aprende mejor, estudia diferente.
        </p>

        {/* Indicadores */}
        <div className="flex gap-2 mt-6">
          <div className="w-7 h-2 rounded-full bg-[#2563ff]" />
          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500" />
          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500" />
        </div>

        {/* Botones */}
        <div
          className="
          w-full
          max-w-[700px]
          mt-14
          flex
          flex-col
          gap-5
          "
        >
          <Link href="/Registro">
            <button
              className="
              w-full
              h-[58px]
              md:h-[65px]

              rounded-2xl

              bg-gradient-to-r
              from-[#2563ff]
              to-[#18C3F7]

              text-white
              text-lg
              md:text-xl
              font-bold

              shadow-lg

              hover:scale-[1.02]
              transition
              "
            >
              Registrarse →
            </button>
          </Link>

          <Link href="/Login">
            <button
              className="
              w-full
              h-[58px]
              md:h-[65px]

              rounded-2xl

              bg-white/90
              dark:bg-slate-800

              text-[#2563ff]
              dark:text-white

              text-lg
              md:text-xl
              font-bold

              shadow-lg

              hover:scale-[1.02]
              transition
              "
            >
              Iniciar sesión
            </button>
          </Link>

          <p
            className="
            text-center

            text-gray-700
            dark:text-gray-300

            text-sm
            sm:text-base

            font-medium
            mt-2
            "
          >
            Comienza tu viaje académico hoy
          </p>

        </div>

      </div>
    </main>
  );
}