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
          px-8
          py-8
        "
      >
        {/* Imagen */}
        <Image
          src="/raccoon.png"
          alt="Raccoon Study"
          width={320}
          height={320}
          priority
          className="
            w-[250px]
            sm:w-[280px]
            md:w-[320px]
            h-auto
            object-contain
            -mt-12
          "
        />

        {/* Título */}
        <h1
          className="
            text-5xl
            sm:text-6xl
            font-extrabold
            text-center
            leading-none
            mt-2
          "
        >
          <span className="text-black">
            Raccoon
          </span>

          <span className="text-[#2563ff]">
            Study
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="text-gray-700 text-lg mt-4 text-center">
          Aprende mejor, estudia diferente.
        </p>

        {/* Indicadores */}
        <div className="flex gap-2 mt-6">
          <div className="w-7 h-2 rounded-full bg-[#2563ff]" />
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <div className="w-2 h-2 rounded-full bg-gray-300" />
        </div>

        {/* Botones */}
        <div className="w-full mt-16 flex flex-col gap-6">

          <Link href="/Registro">
            <button
              className="
                w-full
                h-16
                rounded-[24px]
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
              Registrarse →
            </button>
          </Link>

          <Link href="/Login">
            <button
              className="
                w-full
                h-16
                rounded-[24px]
                bg-white
                text-[#2563ff]
                text-xl
                font-bold
                shadow-lg
                hover:scale-[1.02]
                transition
              "
            >
              Iniciar sesión
            </button>
          </Link>

          <p className="text-center text-gray-700 text-base font-medium mt-2">
            Comienza tu viaje académico hoy
          </p>

        </div>
      </div>
    </main>
  );
}