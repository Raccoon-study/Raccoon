"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BrainCircuit,
  Code2,
  Eye,
  Heart,
  Moon,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  Users,
} from "lucide-react";

const lideres = [
  {
    nombre: "Marielis Díaz",
    cargo: "Diseño y Branding",
    descripcion:
      "Aporta creatividad, diseño e identidad visual al proyecto Raccoon Study.",
    imagen: "/images/Marielis.jpg",
  },
  {
    nombre: "Jhulianys Urriola",
    cargo: "Programación",
    descripcion:
      "Participa en el desarrollo, programación y funcionamiento de Raccoon Study.",
    imagen: "/images/Jhulianys.jpg",
  },
];

const branding = [
  "MARIELIS",
  "EMMA",
  "IAN M",
  "IDALIZ BATISTA",
  "JULI H",
  "JOWMEY",
];

const programacion = [
  "JHULI",
  "CESS",
  "MANUEL",
  "RICHARD CORONEL",
  "VALERIA SOLIS",
  "DANIELA",
];

const valores = [
  {
    titulo: "Empatía",
    descripcion:
      "Entendemos las necesidades de nuestros usuarios y creamos soluciones pensadas en ellos.",
    icono: <Heart size={27} />,
    color: "blue",
  },
  {
    titulo: "Innovación",
    descripcion:
      "Buscamos nuevas ideas y tecnologías para mejorar constantemente la experiencia de estudio.",
    icono: <Sparkles size={27} />,
    color: "green",
  },
  {
    titulo: "Trabajo en equipo",
    descripcion:
      "Colaboramos con respeto y confianza para alcanzar objetivos comunes.",
    icono: <Users size={27} />,
    color: "violet",
  },
  {
    titulo: "Compromiso",
    descripcion:
      "Estamos comprometidos con la calidad y el éxito de cada estudiante.",
    icono: <ShieldCheck size={27} />,
    color: "orange",
  },
];

export default function NosotrosPage() {
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const temaGuardado = localStorage.getItem("raccoon-theme");

    const sistemaOscuro =
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

    const oscuro =
      temaGuardado === "dark" || (!temaGuardado && sistemaOscuro);

    setModoOscuro(oscuro);

    document.documentElement.classList.toggle("dark", oscuro);
    document.documentElement.style.colorScheme = oscuro ? "dark" : "light";
  }, []);

  function cambiarTema() {
    setModoOscuro((actual) => {
      const nuevo = !actual;

      document.documentElement.classList.toggle("dark", nuevo);
      document.documentElement.style.colorScheme = nuevo ? "dark" : "light";

      localStorage.setItem(
        "raccoon-theme",
        nuevo ? "dark" : "light"
      );

      return nuevo;
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#07152F] transition-colors dark:bg-[#0D1626] dark:text-white">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          sticky top-0 z-50
          border-b border-blue-100/60
          bg-white/90
          backdrop-blur-xl
          dark:border-slate-800
          dark:bg-[#0D1626]/90
        "
      >
        <div
          className="
            mx-auto
            flex min-h-[88px]
            max-w-[1500px]
            items-center
            justify-between
            gap-5
            px-5
            sm:px-8
            lg:px-12
          "
        >
          {/* LOGO */}
          <Link
            href="/"
            className="
              group
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                relative
                flex h-12 w-12
                items-center
                justify-center
                rounded-2xl
                border border-blue-100
                bg-white
                shadow-[0_8px_20px_rgba(57,120,246,0.12)]
                transition
                duration-300
                group-hover:-translate-y-1
                group-hover:shadow-[0_12px_28px_rgba(57,120,246,0.2)]
                dark:border-slate-700
                dark:bg-slate-800
              "
            >
              <div
                className="
                  absolute
                  -right-1
                  -top-1
                  h-3
                  w-3
                  rounded-full
                  bg-yellow-400
                  shadow-sm
                "
              />

              <Image
                src="/raccoon.png"
                alt="Raccoon Study"
                width={46}
                height={46}
                priority
                className="h-11 w-11 object-contain"
              />
            </div>

            <div>
              <h1
                className="
                  text-lg
                  font-black
                  tracking-tight
                  text-[#07152F]
                  dark:text-white
                  sm:text-xl
                "
              >
                Raccoon
                <span className="text-[#3978F6]">
                  Study
                </span>
              </h1>

              <p
                className="
                  hidden
                  text-[10px]
                  font-semibold
                  text-[#7587A1]
                  dark:text-slate-400
                  sm:block
                "
              >
                Tu compañero inteligente de estudio
              </p>
            </div>
          </Link>

          {/* ACCIONES */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* INICIO */}
            <Link
              href="/"
              className="
                group
                relative
                flex h-11
                items-center
                justify-center
                overflow-hidden
                rounded-full
                border border-blue-200
                bg-white/80
                px-5
                text-sm
                font-black
                text-[#3978F6]
                shadow-sm
                backdrop-blur-xl
                transition
                duration-300
                hover:-translate-y-0.5
                hover:border-[#3978F6]
                hover:bg-blue-50
                hover:shadow-[0_8px_20px_rgba(57,120,246,0.14)]
                dark:border-slate-700
                dark:bg-slate-800/70
                dark:text-blue-300
                dark:hover:bg-slate-800
              "
            >
              <span
                className="
                  absolute
                  inset-x-5
                  bottom-0
                  h-[3px]
                  origin-left
                  scale-x-0
                  rounded-full
                  bg-[#3978F6]
                  transition-transform
                  duration-300
                  group-hover:scale-x-100
                "
              />

              Inicio
            </Link>

            {/* MODO OSCURO */}
            <button
              type="button"
              onClick={cambiarTema}
              className="
                group
                flex h-11
                items-center
                justify-center
                gap-2
                rounded-full
                border border-[#DAE4F2]
                bg-white/75
                px-3
                text-sm
                font-bold
                text-[#536A88]
                shadow-sm
                backdrop-blur-xl
                transition
                duration-300
                hover:-translate-y-0.5
                hover:border-blue-200
                hover:bg-white
                hover:text-[#3978F6]
                hover:shadow-md
                dark:border-slate-700
                dark:bg-slate-800/70
                dark:text-slate-200
                dark:hover:bg-slate-800
                sm:px-4
              "
            >
              <span
                className="
                  transition-transform
                  duration-300
                  group-hover:rotate-12
                "
              >
                {modoOscuro ? (
                  <Sun size={17} />
                ) : (
                  <Moon size={17} />
                )}
              </span>

              <span className="hidden md:block">
                {modoOscuro ? "Modo claro" : "Modo oscuro"}
              </span>
            </button>

            {/* LOGIN */}
            <Link
              href="/Login"
              className="
                hidden h-11
                items-center
                justify-center
                rounded-full
                border border-[#BFD3F1]
                bg-white/80
                px-5
                text-sm
                font-black
                text-[#2E5CA3]
                shadow-sm
                transition
                duration-300
                hover:-translate-y-0.5
                hover:border-[#3978F6]
                hover:bg-[#3978F6]
                hover:text-white
                hover:shadow-[0_8px_20px_rgba(57,120,246,0.18)]
                dark:border-slate-700
                dark:bg-slate-800/70
                dark:text-white
                sm:flex
              "
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO NOSOTROS
      ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-gradient-to-r
          from-[#EDF5FF]
          via-[#F7FAFF]
          to-[#EAF3FF]
          dark:from-[#132238]
          dark:via-[#101B2D]
          dark:to-[#172239]
        "
      >
        <div
          className="
            absolute
            -right-24
            top-0
            h-[500px]
            w-[500px]
            rounded-full
            bg-blue-200/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            left-[45%]
            top-10
            h-40
            w-40
            rounded-full
            bg-violet-200/20
            blur-3xl
          "
        />

        <div
          className="
            mx-auto
            grid
            min-h-[510px]
            max-w-[1400px]
            items-center
            gap-10
            px-5
            py-14
            sm:px-8
            lg:grid-cols-2
            lg:px-12
          "
        >
          {/* TEXTO */}
          <div className="relative z-10">
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.18em]
                text-[#3978F6]
              "
            >
              Conoce nuestro equipo
            </p>

            <h2
              className="
                mt-4
                text-4xl
                font-black
                leading-[1.05]
                tracking-tight
                text-[#07193B]
                dark:text-white
                sm:text-5xl
                lg:text-[58px]
              "
            >
              Quiénes somos en
              <br />

              Raccoon
              <span className="text-[#3978F6]">
                Study
              </span>
            </h2>

            <p
              className="
                mt-7
                max-w-[620px]
                text-sm
                leading-7
                text-slate-600
                dark:text-slate-300
                sm:text-[15px]
              "
            >
              Raccoon Study nació de una idea simple pero poderosa:
              ayudar a otros estudiantes a estudiar de forma más
              inteligente, clara y motivadora.
            </p>

            <p
              className="
                mt-1
                max-w-[620px]
                text-sm
                leading-7
                text-slate-600
                dark:text-slate-300
                sm:text-[15px]
              "
            >
              Somos un equipo apasionado por la educación,
              la creatividad y la tecnología.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Badge
                icono={<Users size={17} />}
                texto="Hecho por estudiantes"
                color="blue"
              />

              <Badge
                icono={<Heart size={17} />}
                texto="Educación con propósito"
                color="green"
              />

              <Badge
                icono={<BrainCircuit size={17} />}
                texto="Tecnología educativa"
                color="violet"
              />
            </div>
          </div>

          {/* MASCOTA */}
          <div
            className="
              relative
              flex
              min-h-[400px]
              items-center
              justify-center
            "
          >
            <div
              className="
                absolute
                h-[370px]
                w-[370px]
                rounded-full
                bg-blue-200/25
                sm:h-[420px]
                sm:w-[420px]
              "
            />

            <div
              className="
                absolute
                h-[440px]
                w-[440px]
                rounded-full
                border
                border-dashed
                border-blue-300/40
              "
            />

            <Image
              src="/raccoon.png"
              alt="Mascota Raccoon Study"
              width={340}
              height={340}
              priority
              className="
                relative
                z-10
                h-auto
                w-[270px]
                object-contain
                drop-shadow-2xl
                sm:w-[340px]
              "
            />

            <span className="absolute bottom-[17%] left-[7%] text-6xl">
              ⭐
            </span>

            <span className="absolute right-[8%] top-[10%] text-7xl">
              🎓
            </span>

            <span className="absolute bottom-[12%] right-[4%] text-7xl">
              📖
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          EQUIPO LÍDER
      ===================================================== */}

      <section
        className="
          mx-auto
          max-w-[1200px]
          px-5
          pb-20
          pt-20
          sm:px-8
        "
      >
        <TituloSeccion
          icono={<Star size={24} fill="currentColor" />}
          titulo="Nuestro equipo líder"
          descripcion="Las personas que lideran nuestro proyecto con creatividad y dedicación."
        />

        <div
          className="
            mx-auto
            mt-11
            grid
            max-w-[760px]
            gap-7
            sm:grid-cols-2
          "
        >
          {lideres.map((persona) => (
            <LeaderCard
              key={persona.nombre}
              nombre={persona.nombre}
              cargo={persona.cargo}
              descripcion={persona.descripcion}
              imagen={persona.imagen}
            />
          ))}
        </div>
      </section>

      {/* =====================================================
          EQUIPO COLABORADOR
      ===================================================== */}

      <section
        className="
          mx-auto
          max-w-[1180px]
          px-5
          pb-24
          sm:px-8
        "
      >
        <TituloSeccion
          icono={<Users size={24} />}
          titulo="Equipo colaborador"
          descripcion="Dos áreas que trabajan juntas para transformar una idea en una experiencia educativa completa."
        />

        <div
          className="
            mt-12
            grid
            gap-8
            lg:grid-cols-2
          "
        >
          {/* BRANDING PRIMERO */}
          <TeamCard
            icono={<Palette size={27} />}
            subtitulo="Área creativa"
            titulo="Diseño y Branding"
            descripcion="Construyen la identidad visual, experiencia y estilo que hacen reconocible a Raccoon Study."
            nombres={branding}
            tipo="branding"
          />

          {/* PROGRAMACIÓN */}
          <TeamCard
            icono={<Code2 size={27} />}
            subtitulo="Área tecnológica"
            titulo="Programación"
            descripcion="Transforman las ideas y diseños en funciones reales, rápidas y accesibles para los estudiantes."
            nombres={programacion}
            tipo="programacion"
          />
        </div>
      </section>

      {/* =====================================================
          MISIÓN Y VISIÓN
      ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          border-y
          border-slate-100
          bg-[#F8FBFF]
          py-20
          dark:border-slate-800
          dark:bg-[#101A2A]
        "
      >
        <div
          className="
            absolute
            -left-32
            top-10
            h-72
            w-72
            rounded-full
            bg-blue-200/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -right-32
            bottom-0
            h-72
            w-72
            rounded-full
            bg-green-200/20
            blur-3xl
          "
        />

        <div
          className="
            relative
            mx-auto
            max-w-[1180px]
            px-5
            sm:px-8
          "
        >
          <div className="text-center">
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.18em]
                text-[#3978F6]
              "
            >
              Nuestro propósito
            </p>

            <h2
              className="
                mt-3
                text-3xl
                font-black
                text-[#07152F]
                dark:text-white
              "
            >
              Lo que nos impulsa
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-[600px]
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              Trabajamos para mejorar la experiencia de estudio hoy
              mientras construimos una visión para el futuro.
            </p>
          </div>

          <div
            className="
              mt-12
              grid
              gap-8
              lg:grid-cols-2
            "
          >
            <PurposeCard
              icono={<Target size={36} />}
              etiqueta="Lo que hacemos hoy"
              titulo="Nuestra misión"
              descripcion="Facilitar el estudio mediante herramientas, recursos y experiencias que ayuden a los estudiantes a aprender de manera más clara, organizada y efectiva."
              etiquetas={[
                "Organización",
                "Aprendizaje",
                "Confianza",
              ]}
              tipo="mision"
            />

            <PurposeCard
              icono={<Eye size={36} />}
              etiqueta="Hacia dónde vamos"
              titulo="Nuestra visión"
              descripcion="Ser una plataforma educativa reconocida por transformar la forma en que los estudiantes aprenden, se organizan y alcanzan sus metas."
              etiquetas={[
                "Innovación",
                "Crecimiento",
                "Futuro",
              ]}
              tipo="vision"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          VALORES
      ===================================================== */}

      <section
        className="
          mx-auto
          max-w-[1200px]
          px-5
          py-20
          sm:px-8
        "
      >
        <TituloSeccion
          icono={<Star size={24} fill="currentColor" />}
          titulo="Nuestros valores"
          descripcion="Principios que guían cada decisión y cada parte de Raccoon Study."
        />

        <div
          className="
            mt-11
            grid
            gap-6
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {valores.map((valor) => (
            <ValueCard
              key={valor.titulo}
              icono={valor.icono}
              titulo={valor.titulo}
              descripcion={valor.descripcion}
              color={valor.color}
            />
          ))}
        </div>
      </section>

      {/* =====================================================
          BANNER FINAL
      ===================================================== */}

      <section
        className="
          mx-auto
          max-w-[1320px]
          px-5
          pb-16
          pt-5
          sm:px-8
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[32px]
            border
            border-blue-100
            bg-gradient-to-r
            from-[#EAF3FF]
            via-[#EEF5FF]
            to-[#E8F2FF]
            px-8
            py-10
            shadow-[0_18px_50px_rgba(37,99,235,0.07)]
            dark:border-slate-700
            dark:from-[#17263D]
            dark:via-[#18263B]
            dark:to-[#142238]
            sm:px-12
            lg:px-14
          "
        >
          <div
            className="
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-blue-200/25
              blur-2xl
            "
          />

          <span
            className="
              absolute
              right-[38%]
              top-8
              text-2xl
              text-blue-300
            "
          >
            ✦
          </span>

          <span
            className="
              absolute
              bottom-8
              right-[5%]
              text-xl
              text-blue-300
            "
          >
            ✦
          </span>

          <div
            className="
              relative
              z-10
              grid
              items-center
              gap-10
              lg:grid-cols-[1fr_0.85fr]
            "
          >
            <div>
              <p
                className="
                  mb-3
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.15em]
                  text-[#3978F6]
                "
              >
                Crecemos juntos
              </p>

              <h2
                className="
                  text-3xl
                  font-black
                  leading-tight
                  text-[#07152F]
                  dark:text-white
                  sm:text-[36px]
                "
              >
                Juntos estamos construyendo
                <br />
                el futuro de la educación.
              </h2>

              <p
                className="
                  mt-4
                  max-w-[550px]
                  text-sm
                  leading-6
                  text-slate-500
                  dark:text-slate-300
                "
              >
                Gracias por ser parte de una comunidad donde
                estudiar, aprender y crecer puede convertirse
                en una experiencia diferente.
              </p>

              <Link
                href="/"
                className="
                  group
                  mt-7
                  inline-flex
                  items-center
                  gap-3
                  rounded-2xl
                  bg-[#3978F6]
                  px-6
                  py-3.5
                  text-sm
                  font-black
                  text-white
                  shadow-lg
                  shadow-blue-600/20
                  transition
                  hover:-translate-y-1
                  hover:bg-blue-700
                "
              >
                Explorar Raccoon Study

                <ArrowRight
                  size={18}
                  className="
                    transition
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>

            <div
              className="
                relative
                flex
                min-h-[240px]
                items-center
                justify-center
              "
            >
              <div
                className="
                  absolute
                  h-[220px]
                  w-[380px]
                  rounded-full
                  bg-white/45
                  blur-sm
                  dark:bg-white/5
                "
              />

              <div
                className="
                  relative
                  flex
                  items-end
                  justify-center
                  gap-5
                  sm:gap-7
                "
              >
                <div
                  className="
                    flex
                    h-28
                    w-28
                    items-center
                    justify-center
                    rounded-[28px]
                    bg-white/75
                    text-6xl
                    shadow-sm
                    backdrop-blur
                    dark:bg-slate-800/70
                  "
                >
                  📚
                </div>

                <div
                  className="
                    flex
                    h-36
                    w-36
                    items-center
                    justify-center
                    rounded-[32px]
                    bg-blue-100/65
                    text-7xl
                    shadow-md
                    dark:bg-blue-950/30
                  "
                >
                  🎒
                </div>

                <div
                  className="
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                    rounded-[24px]
                    bg-white/75
                    text-5xl
                    shadow-sm
                    backdrop-blur
                    dark:bg-slate-800/70
                  "
                >
                  🪴
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="
          border-t
          border-slate-100
          bg-white
          dark:border-slate-800
          dark:bg-[#0D1626]
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-[1400px]
            flex-col
            items-center
            justify-between
            gap-5
            px-5
            py-7
            text-center
            sm:px-8
            md:flex-row
            md:text-left
          "
        >
          <div className="flex items-center gap-3">
            <Image
              src="/raccoon.png"
              alt="Raccoon Study"
              width={40}
              height={40}
              className="object-contain"
            />

            <div>
              <p
                className="
                  font-black
                  text-[#07193B]
                  dark:text-white
                "
              >
                Raccoon
                <span className="text-[#3978F6]">
                  Study
                </span>
              </p>

              <p className="text-[9px] text-slate-400">
                Aprende mejor, estudia diferente.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 Raccoon Study · Aprende mejor, estudia diferente.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   BADGE
========================================================= */

function Badge({
  icono,
  texto,
  color,
}: {
  icono: ReactNode;
  texto: string;
  color: "blue" | "green" | "violet";
}) {
  const colores = {
    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/40",

    green:
      "bg-green-50 text-green-600 dark:bg-green-950/40",

    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/40",
  };

  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-white
        bg-white/85
        px-4
        py-3
        text-xs
        font-bold
        text-slate-600
        shadow-sm
        dark:border-slate-700
        dark:bg-[#172235]
        dark:text-slate-200
      "
    >
      <span
        className={`
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          ${colores[color]}
        `}
      >
        {icono}
      </span>

      {texto}
    </div>
  );
}

/* =========================================================
   TÍTULO
========================================================= */

function TituloSeccion({
  icono,
  titulo,
  descripcion,
}: {
  icono: ReactNode;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="text-center">
      <div
        className="
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-[#3978F6]
          dark:bg-blue-950/40
        "
      >
        {icono}
      </div>

      <h2
        className="
          mt-4
          text-3xl
          font-black
          text-[#07152F]
          dark:text-white
        "
      >
        {titulo}
      </h2>

      <p
        className="
          mx-auto
          mt-2
          max-w-[620px]
          text-sm
          leading-6
          text-slate-500
          dark:text-slate-400
        "
      >
        {descripcion}
      </p>
    </div>
  );
}

/* =========================================================
   LÍDER
========================================================= */

function LeaderCard({
  nombre,
  cargo,
  descripcion,
  imagen,
}: {
  nombre: string;
  cargo: string;
  descripcion: string;
  imagen: string;
}) {
  return (
    <article
      className="
        rounded-[28px]
        border
        border-slate-200
        bg-white
        p-7
        text-center
        shadow-[0_10px_30px_rgba(15,23,42,0.06)]
        transition
        hover:-translate-y-2
        hover:border-blue-200
        hover:shadow-[0_20px_45px_rgba(37,99,235,0.12)]
        dark:border-slate-700
        dark:bg-[#172235]
      "
    >
      <div
        className="
          relative
          mx-auto
          h-32
          w-32
          overflow-hidden
          rounded-full
          border-4
          border-blue-50
          bg-slate-100
          dark:border-slate-700
          dark:bg-slate-800
        "
      >
        <Image
          src={imagen}
          alt={nombre}
          fill
          className="object-cover"
        />
      </div>

      <p
        className="
          mt-5
          text-sm
          font-bold
          text-[#3978F6]
        "
      >
        {cargo}
      </p>

      <h3
        className="
          mt-1
          text-lg
          font-black
          text-[#07193B]
          dark:text-white
        "
      >
        {nombre}
      </h3>

      <p
        className="
          mx-auto
          mt-3
          max-w-[250px]
          text-xs
          leading-5
          text-slate-500
          dark:text-slate-400
        "
      >
        {descripcion}
      </p>
    </article>
  );
}

/* =========================================================
   EQUIPO
========================================================= */

function TeamCard({
  icono,
  subtitulo,
  titulo,
  descripcion,
  nombres,
  tipo,
}: {
  icono: ReactNode;
  subtitulo: string;
  titulo: string;
  descripcion: string;
  nombres: string[];
  tipo: "branding" | "programacion";
}) {
  const brandingCard = tipo === "branding";

  return (
    <article
      className={`
        relative
        overflow-hidden
        rounded-[30px]
        border
        p-7
        shadow-[0_18px_45px_rgba(37,99,235,0.06)]
        sm:p-9
        ${
          brandingCard
            ? `
              border-violet-100
              bg-gradient-to-br
              from-[#F8F5FF]
              via-white
              to-[#F2EEFF]
              dark:border-violet-900/30
              dark:from-[#211D39]
              dark:via-[#172235]
              dark:to-[#241D3B]
            `
            : `
              border-blue-100
              bg-gradient-to-br
              from-[#F2F7FF]
              via-white
              to-[#EBF4FF]
              dark:border-blue-900/30
              dark:from-[#152640]
              dark:via-[#172235]
              dark:to-[#122642]
            `
        }
      `}
    >
      <div
        className={`
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          blur-2xl
          ${
            brandingCard
              ? "bg-violet-200/20"
              : "bg-blue-200/20"
          }
        `}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-4">
          <div
            className={`
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-2xl
              ${
                brandingCard
                  ? `
                    bg-violet-100
                    text-violet-600
                    dark:bg-violet-950/50
                    dark:text-violet-300
                  `
                  : `
                    bg-blue-100
                    text-blue-600
                    dark:bg-blue-950/50
                    dark:text-blue-300
                  `
              }
            `}
          >
            {icono}
          </div>

          <div>
            <p
              className={`
                text-[11px]
                font-black
                uppercase
                tracking-[0.16em]
                ${
                  brandingCard
                    ? "text-violet-400"
                    : "text-blue-400"
                }
              `}
            >
              {subtitulo}
            </p>

            <h3
              className={`
                mt-1
                text-xl
                font-black
                ${
                  brandingCard
                    ? "text-violet-600 dark:text-violet-300"
                    : "text-blue-600 dark:text-blue-300"
                }
              `}
            >
              {titulo}
            </h3>
          </div>
        </div>

        <p
          className="
            mt-5
            text-sm
            leading-6
            text-slate-500
            dark:text-slate-400
          "
        >
          {descripcion}
        </p>

        <div
          className="
            mt-7
            grid
            gap-3
            sm:grid-cols-2
          "
        >
          {nombres.map((nombre) => (
            <div
              key={nombre}
              className={`
                flex
                min-h-[52px]
                items-center
                gap-3
                rounded-2xl
                border
                bg-white/90
                px-4
                py-3
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-md
                dark:bg-[#1B293D]
                ${
                  brandingCard
                    ? "border-violet-100 dark:border-violet-900/30"
                    : "border-blue-100 dark:border-blue-900/30"
                }
              `}
            >
              <div
                className={`
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  ${
                    brandingCard
                      ? `
                        bg-violet-50
                        text-violet-600
                        dark:bg-violet-950/50
                        dark:text-violet-300
                      `
                      : `
                        bg-blue-50
                        text-blue-600
                        dark:bg-blue-950/50
                        dark:text-blue-300
                      `
                  }
                `}
              >
                {brandingCard ? (
                  <Palette size={14} />
                ) : (
                  <Code2 size={14} />
                )}
              </div>

              <span
                className="
                  text-xs
                  font-bold
                  text-slate-700
                  dark:text-slate-200
                "
              >
                {nombre}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MISIÓN / VISIÓN
========================================================= */

function PurposeCard({
  icono,
  etiqueta,
  titulo,
  descripcion,
  etiquetas,
  tipo,
}: {
  icono: ReactNode;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  etiquetas: string[];
  tipo: "mision" | "vision";
}) {
  const mision = tipo === "mision";

  return (
    <article
      className={`
        group
        relative
        overflow-hidden
        rounded-[30px]
        border
        bg-white
        p-8
        transition
        hover:-translate-y-1
        dark:bg-[#172235]
        sm:p-10
        ${
          mision
            ? `
              border-blue-100
              shadow-[0_15px_40px_rgba(37,99,235,0.07)]
              hover:shadow-[0_20px_50px_rgba(37,99,235,0.12)]
              dark:border-blue-900/30
            `
            : `
              border-green-100
              shadow-[0_15px_40px_rgba(22,163,74,0.07)]
              hover:shadow-[0_20px_50px_rgba(22,163,74,0.12)]
              dark:border-green-900/30
            `
        }
      `}
    >
      <div
        className={`
          absolute
          -right-16
          -top-16
          h-44
          w-44
          rounded-full
          opacity-60
          ${
            mision
              ? "bg-blue-100 dark:bg-blue-950/30"
              : "bg-green-100 dark:bg-green-950/30"
          }
        `}
      />

      <div
        className="
          relative
          z-10
          flex
          flex-col
          gap-6
          sm:flex-row
          sm:items-start
        "
      >
        <div
          className={`
            flex
            h-20
            w-20
            shrink-0
            items-center
            justify-center
            rounded-[24px]
            shadow-inner
            ${
              mision
                ? `
                  bg-gradient-to-br
                  from-blue-50
                  to-blue-100
                  text-blue-600
                  dark:from-blue-950/40
                  dark:to-blue-900/20
                  dark:text-blue-300
                `
                : `
                  bg-gradient-to-br
                  from-green-50
                  to-green-100
                  text-green-600
                  dark:from-green-950/40
                  dark:to-green-900/20
                  dark:text-green-300
                `
            }
          `}
        >
          {icono}
        </div>

        <div>
          <p
            className={`
              text-xs
              font-black
              uppercase
              tracking-[0.14em]
              ${
                mision
                  ? "text-blue-400"
                  : "text-green-500"
              }
            `}
          >
            {etiqueta}
          </p>

          <h3
            className={`
              mt-2
              text-2xl
              font-black
              ${
                mision
                  ? "text-blue-600"
                  : "text-green-600"
              }
            `}
          >
            {titulo}
          </h3>

          <p
            className="
              mt-4
              text-sm
              leading-7
              text-slate-600
              dark:text-slate-300
            "
          >
            {descripcion}
          </p>

          <div
            className="
              mt-6
              flex
              flex-wrap
              gap-2
            "
          >
            {etiquetas.map((item) => (
              <span
                key={item}
                className={`
                  rounded-full
                  px-3
                  py-1.5
                  text-[11px]
                  font-bold
                  ${
                    mision
                      ? `
                        bg-blue-50
                        text-blue-600
                        dark:bg-blue-950/30
                      `
                      : `
                        bg-green-50
                        text-green-600
                        dark:bg-green-950/30
                      `
                  }
                `}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   VALORES
========================================================= */

function ValueCard({
  icono,
  titulo,
  descripcion,
  color,
}: {
  icono: ReactNode;
  titulo: string;
  descripcion: string;
  color: string;
}) {
  const estilos: Record<
    string,
    {
      icon: string;
      title: string;
    }
  > = {
    blue: {
      icon:
        "bg-blue-50 text-blue-600 dark:bg-blue-950/40",

      title:
        "text-blue-600",
    },

    green: {
      icon:
        "bg-green-50 text-green-600 dark:bg-green-950/40",

      title:
        "text-green-600",
    },

    violet: {
      icon:
        "bg-violet-50 text-violet-600 dark:bg-violet-950/40",

      title:
        "text-violet-600",
    },

    orange: {
      icon:
        "bg-orange-50 text-orange-500 dark:bg-orange-950/40",

      title:
        "text-orange-500",
    },
  };

  const estilo = estilos[color];

  return (
    <article
      className="
        rounded-[26px]
        border
        border-slate-200
        bg-white
        px-6
        py-8
        text-center
        shadow-[0_8px_25px_rgba(15,23,42,0.04)]
        transition
        hover:-translate-y-2
        hover:shadow-xl
        dark:border-slate-700
        dark:bg-[#172235]
      "
    >
      <div
        className={`
          mx-auto
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-full
          ${estilo.icon}
        `}
      >
        {icono}
      </div>

      <h3
        className={`
          mt-5
          font-black
          ${estilo.title}
        `}
      >
        {titulo}
      </h3>

      <p
        className="
          mt-3
          text-xs
          leading-5
          text-slate-500
          dark:text-slate-400
        "
      >
        {descripcion}
      </p>
    </article>
  );
}