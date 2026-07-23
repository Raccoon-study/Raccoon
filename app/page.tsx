"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  LoaderCircle,
  Moon,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trophy,
  WandSparkles,
} from "lucide-react";

import {
  supabase,
} from "./lib/supabase";

/* =====================================================
   PÁGINA PRINCIPAL
===================================================== */

export default function Home() {
  const router =
    useRouter();

  const [
    modoOscuro,
    setModoOscuro,
  ] = useState(false);

  const [
    comprobandoSesion,
    setComprobandoSesion,
  ] = useState(true);

  /* =====================================================
     TEMA
  ===================================================== */

  function inicializarTema() {
    const temaGuardado =
      localStorage.getItem(
        "raccoon-theme"
      );

    const sistemaOscuro =
      window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches ?? false;

    const oscuro =
      temaGuardado === "dark" ||
      (
        !temaGuardado &&
        sistemaOscuro
      );

    setModoOscuro(
      oscuro
    );

    document.documentElement.classList.toggle(
      "dark",
      oscuro
    );

    document.documentElement.style.colorScheme =
      oscuro
        ? "dark"
        : "light";
  }

  function cambiarTema() {
    setModoOscuro(
      (actual) => {
        const nuevo =
          !actual;

        document.documentElement.classList.toggle(
          "dark",
          nuevo
        );

        document.documentElement.style.colorScheme =
          nuevo
            ? "dark"
            : "light";

        localStorage.setItem(
          "raccoon-theme",
          nuevo
            ? "dark"
            : "light"
        );

        return nuevo;
      }
    );
  }

  /* =====================================================
     REVISAR SI EL USUARIO YA TIENE SESIÓN
  ===================================================== */

  useEffect(() => {
    inicializarTema();

    void (async () => {
      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth
            .getSession();

        /*
          Si el usuario ya inició sesión,
          no mostramos nuevamente
          Login / Registro.
        */

        if (
          session?.user
        ) {
          router.replace(
            "/Dashboard"
          );

          return;
        }
      } catch (error) {
        console.warn(
          "No se pudo comprobar la sesión:",
          error
        );
      } finally {
        setComprobandoSesion(
          false
        );
      }
    })();
  }, [
    router,
  ]);

  /* =====================================================
     CARGANDO
  ===================================================== */

  if (
    comprobandoSesion
  ) {
    return (
      <main
        className="
          flex min-h-screen
          items-center
          justify-center
          bg-[#F4F8FF]
          transition-colors
          dark:bg-[#0D1626]
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              flex h-24 w-24
              items-center
              justify-center
              rounded-[28px]
              border border-white
              bg-white
              shadow-xl
              dark:border-slate-700
              dark:bg-[#172235]
            "
          >
            <Image
              src="/raccoon.png"
              alt="Raccoon Study"
              width={72}
              height={72}
              priority
              className="h-[68px] w-[68px] object-contain"
            />
          </div>

          <LoaderCircle
            size={28}
            className="
              mx-auto mt-6
              animate-spin
              text-[#3978F6]
            "
          />

          <p
            className="
              mt-3
              text-sm
              font-bold
              text-[#6F819C]
              dark:text-slate-400
            "
          >
            Preparando Raccoon Study...
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     HOME
  ===================================================== */

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#F4F8FF]
        text-[#07152F]
        transition-colors
        dark:bg-[#0D1626]
        dark:text-white
      "
    >
      {/* =====================================================
          FONDO
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            -left-[180px]
            -top-[200px]
            h-[680px]
            w-[680px]
            rounded-full
            bg-[#BBD7FF]/55
            blur-3xl
            dark:bg-[#244B7A]/20
          "
        />

        <div
          className="
            absolute
            right-[-160px]
            top-[80px]
            h-[600px]
            w-[600px]
            rounded-full
            bg-[#DDD8FF]/60
            blur-3xl
            dark:bg-[#4B3D80]/20
          "
        />

        <div
          className="
            absolute
            bottom-[-280px]
            left-[35%]
            h-[600px]
            w-[600px]
            rounded-full
            bg-[#D3EEFF]/70
            blur-3xl
            dark:bg-[#214663]/15
          "
        />

        <span
          className="
            absolute
            left-[10%]
            top-[18%]
            animate-pulse
            text-3xl
            text-[#FFD766]
          "
        >
          ✦
        </span>

        <span
          className="
            absolute
            left-[47%]
            top-[12%]
            text-2xl
            text-[#9DB8FF]
          "
        >
          ✦
        </span>

        <span
          className="
            absolute
            right-[8%]
            top-[30%]
            animate-pulse
            text-2xl
            text-[#FFD766]
          "
        >
          ★
        </span>

        <span
          className="
            absolute
            bottom-[14%]
            left-[7%]
            text-2xl
            text-[#9DB8FF]
          "
        >
          ✦
        </span>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          relative z-40
          mx-auto
          flex min-h-[88px]
          max-w-[1550px]
          items-center
          justify-between
          px-5
          sm:px-8
          lg:px-12
        "
      >
        {/* LOGO */}

        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div
            className="
              flex h-12 w-12
              items-center
              justify-center
              rounded-2xl
              bg-white/80
              shadow-sm
              backdrop-blur-xl
              dark:bg-slate-800/70
            "
          >
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
          <button
            type="button"
            onClick={cambiarTema}
            className="
              flex h-11
              items-center
              justify-center
              gap-2
              rounded-full
              border border-[#DAE4F2]
              bg-white/70
              px-3
              text-sm
              font-bold
              text-[#536A88]
              backdrop-blur-xl
              transition
              hover:bg-white
              hover:shadow-md
              dark:border-slate-700
              dark:bg-slate-800/70
              dark:text-slate-200
              dark:hover:bg-slate-800
              sm:px-4
            "
          >
            {modoOscuro ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}

            <span className="hidden md:block">
              {modoOscuro
                ? "Modo claro"
                : "Modo oscuro"}
            </span>
          </button>

          <Link
            href="/Login"
            className="
              hidden h-11
              items-center
              justify-center
              rounded-full
              border border-[#D5E0F0]
              bg-white/75
              px-5
              text-sm
              font-black
              text-[#2E5CA3]
              transition
              hover:bg-white
              hover:shadow-md
              dark:border-slate-700
              dark:bg-slate-800/70
              dark:text-white
              sm:flex
            "
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative z-10
          mx-auto
          grid
          min-h-[calc(100vh-88px)]
          max-w-[1550px]
          items-center
          gap-8
          px-5
          pb-10
          pt-5
          sm:px-8
          lg:grid-cols-[0.95fr_1.05fr]
          lg:px-12
          xl:gap-12
        "
      >
        {/* =====================================================
            PARTE IZQUIERDA
        ===================================================== */}

        <div
          className="
            relative z-20
            mx-auto
            w-full
            max-w-[650px]
            text-center
            lg:mx-0
            lg:text-left
          "
        >
          {/* BADGE */}

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border border-white/80
              bg-white/70
              px-4 py-2
              text-xs
              font-black
              text-[#3978F6]
              shadow-sm
              backdrop-blur-xl
              dark:border-slate-700
              dark:bg-slate-800/65
              dark:text-[#95BEFF]
            "
          >
            <Sparkles size={15} />

            Estudia mejor con inteligencia artificial

            <span
              className="
                rounded-full
                bg-[#E5F0FF]
                px-2 py-1
                text-[9px]
                text-[#3978F6]
                dark:bg-[#263955]
              "
            >
              IA
            </span>
          </div>

          {/* TÍTULO */}

          <h2
            className="
              mt-7
              text-[42px]
              font-black
              leading-[1.03]
              tracking-[-0.04em]
              sm:text-[58px]
              lg:text-[64px]
              xl:text-[72px]
            "
          >
            Estudiar puede
            <br className="hidden sm:block" />

            ser mucho{" "}

            <span
              className="
                bg-gradient-to-r
                from-[#246CF2]
                via-[#347FF5]
                to-[#49AEF2]
                bg-clip-text
                text-transparent
              "
            >
              más fácil.
            </span>
          </h2>

          {/* DESCRIPCIÓN */}

          <p
            className="
              mx-auto
              mt-6
              max-w-[580px]
              text-base
              leading-7
              text-[#506782]
              dark:text-slate-300
              sm:text-lg
              lg:mx-0
              lg:leading-8
            "
          >
            Sube tus materiales y abre el camino
            para elegir resúmenes guiados,
            cuestionarios interactivos, flashcards
            y planes adaptados a tu ritmo.
            Además, cuentas con Roccoo, nuestro
            asistente inteligente, para acompañarte
            durante todo tu estudio.
          </p>

          {/* BOTONES */}

          <div
            className="
              mx-auto
              mt-8
              flex
              max-w-[540px]
              flex-col
              gap-3
              sm:flex-row
              lg:mx-0
            "
          >
            <Link
              href="/Registro"
              className="
                group
                flex h-[60px]
                flex-1
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-gradient-to-r
                from-[#246AF2]
                via-[#2C7AF4]
                to-[#35A3F0]
                px-6
                font-black
                text-white
                shadow-[0_14px_30px_rgba(39,113,240,0.28)]
                transition
                hover:-translate-y-1
                hover:shadow-[0_18px_35px_rgba(39,113,240,0.34)]
              "
            >
              Comenzar gratis

              <ArrowRight
                size={20}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>

            <Link
              href="/Login"
              className="
                flex h-[60px]
                flex-1
                items-center
                justify-center
                rounded-2xl
                border border-[#D3DFEF]
                bg-white/80
                px-6
                font-black
                text-[#2F5F9C]
                shadow-sm
                backdrop-blur
                transition
                hover:-translate-y-1
                hover:bg-white
                hover:shadow-lg
                dark:border-slate-700
                dark:bg-slate-800/75
                dark:text-white
                dark:hover:bg-slate-800
                sm:hidden
              "
            >
              Iniciar sesión
            </Link>
          </div>

          {/* BENEFICIOS RÁPIDOS */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              justify-center
              gap-x-5
              gap-y-2
              text-xs
              font-bold
              text-[#73859D]
              dark:text-slate-400
              lg:justify-start
            "
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2
                size={15}
                className="text-green-500"
              />

              Registro gratuito
            </span>

            <span className="flex items-center gap-1.5">
              <CheckCircle2
                size={15}
                className="text-green-500"
              />

              Sin tarjeta
            </span>

            <span className="flex items-center gap-1.5">
              <ShieldCheck
                size={15}
                className="text-[#3978F6]"
              />

              Cuenta privada
            </span>
          </div>

          {/* PASOS */}

          <div
            className="
              mt-9
              grid
              gap-3
              sm:grid-cols-3
            "
          >
            <MiniFuncion
              icono={
                <FileText size={20} />
              }
              titulo="Sube tu material"
              texto="PDF, imágenes y apuntes"
            />

            <MiniFuncion
              icono={
                <WandSparkles size={20} />
              }
              titulo="Roccoo analiza"
              texto="Entiende tu contenido"
            />

            <MiniFuncion
              icono={
                <Trophy size={20} />
              }
              titulo="Aprende mejor"
              texto="Practica y mide tu progreso"
            />
          </div>
        </div>

        {/* =====================================================
            PARTE DERECHA
        ===================================================== */}

        <div
          className="
            relative
            mx-auto
            flex
            min-h-[500px]
            w-full
            max-w-[720px]
            items-center
            justify-center
            lg:min-h-[720px]
          "
        >
          {/* FONDO CIRCULAR */}

          <div
            className="
              absolute
              h-[340px]
              w-[340px]
              rounded-full
              border border-white/80
              bg-gradient-to-br
              from-[#DCEAFF]/90
              via-[#C9E0FF]/75
              to-[#E3DEFF]/80
              shadow-[0_0_100px_rgba(74,133,241,0.25)]
              backdrop-blur
              dark:border-[#415B7A]/30
              dark:from-[#203A5B]/60
              dark:via-[#1E3552]/50
              dark:to-[#342C57]/50
              sm:h-[470px]
              sm:w-[470px]
              lg:h-[555px]
              lg:w-[555px]
            "
          />

          {/* ÓRBITA */}

          <div
            className="
              absolute
              h-[400px]
              w-[400px]
              rounded-full
              border border-dashed
              border-[#86AEED]/45
              dark:border-[#6685AC]/25
              sm:h-[550px]
              sm:w-[550px]
              lg:h-[645px]
              lg:w-[645px]
            "
          />

          {/* ESTRELLA */}

          <span
            className="
              absolute
              left-[20%]
              top-[7%]
              text-4xl
              text-[#FFD35D]
            "
          >
            ★
          </span>

          <span
            className="
              absolute
              right-[17%]
              top-[19%]
              text-2xl
              text-[#7EACF9]
            "
          >
            ✦
          </span>

          {/* MAPACHE */}

          <div className="relative z-20">
            <Image
              src="/raccoon.png"
              alt="Roccoo, asistente de Raccoon Study"
              width={540}
              height={540}
              priority
              className="
                h-auto
                w-[300px]
                object-contain
                drop-shadow-[0_32px_32px_rgba(38,76,135,0.22)]
                sm:w-[400px]
                lg:w-[490px]
              "
            />
          </div>

          {/* MATERIAL */}

          <TarjetaFlotante
            className="
              left-[0%]
              top-[16%]
              sm:left-[1%]
            "
          >
            <div
              className="
                flex h-12 w-12
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-[#7D6CF7]
                to-[#5D58DF]
                text-white
                shadow-lg
              "
            >
              <FileText size={23} />
            </div>

            <div>
              <p className="text-xs font-black">
                Material listo
              </p>

              <p className="mt-1 text-[10px] text-[#7E8EA5]">
                Biología.pdf
              </p>
            </div>
          </TarjetaFlotante>

          {/* IA */}

          <TarjetaFlotante
            className="
              right-[0%]
              top-[8%]
              sm:right-[2%]
            "
          >
            <div
              className="
                flex h-12 w-12
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-[#2673F5]
                to-[#45B3F2]
                text-white
                shadow-lg
              "
            >
              <BrainCircuit size={24} />
            </div>

            <div>
              <p className="text-xs font-black">
                Roccoo IA
              </p>

              <p className="mt-1 text-[10px] text-[#7E8EA5]">
                Analizando...
              </p>
            </div>
          </TarjetaFlotante>

          {/* RACHA */}

          <TarjetaFlotante
            className="
              bottom-[17%]
              left-[0%]
              sm:left-[2%]
            "
          >
            <div
              className="
                flex h-12 w-12
                items-center
                justify-center
                rounded-2xl
                bg-[#FFF0DA]
                text-[#F59E0B]
                dark:bg-[#3B2D1A]
              "
            >
              <Flame
                size={25}
                fill="currentColor"
              />
            </div>

            <div>
              <p className="text-xs font-black">
                7 días
              </p>

              <p className="mt-1 text-[10px] text-[#7E8EA5]">
                Racha de estudio
              </p>
            </div>
          </TarjetaFlotante>

          {/* RESULTADO */}

          <TarjetaFlotante
            className="
              bottom-[9%]
              right-[0%]
              sm:right-[2%]
            "
          >
            <div
              className="
                flex h-12 w-12
                items-center
                justify-center
                rounded-2xl
                bg-[#E9F9EE]
                text-green-600
                dark:bg-green-950/30
              "
            >
              <Star
                size={24}
                fill="currentColor"
              />
            </div>

            <div>
              <p className="text-xs font-black">
                Quiz completado
              </p>

              <p className="mt-1 text-[10px] text-[#7E8EA5]">
                90% de precisión
              </p>
            </div>
          </TarjetaFlotante>
        </div>
      </section>

      {/* =====================================================
          HERRAMIENTAS
      ===================================================== */}

      <section
        className="
          relative z-10
          mx-auto
          max-w-[1400px]
          px-5
          pb-12
          sm:px-8
          lg:px-12
        "
      >
        <div
          className="
            grid gap-4
            rounded-[28px]
            border border-white/80
            bg-white/65
            p-5
            shadow-[0_20px_50px_rgba(45,80,135,0.08)]
            backdrop-blur-xl
            dark:border-slate-700
            dark:bg-slate-800/55
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <Caracteristica
            icono={
              <FileText size={22} />
            }
            titulo="Resúmenes inteligentes"
            texto="Convierte tus documentos en contenido más fácil de comprender."
          />

          <Caracteristica
            icono={
              <BrainCircuit size={22} />
            }
            titulo="Quizzes con IA"
            texto="Practica con preguntas creadas directamente desde tus materiales."
          />

          <Caracteristica
            icono={
              <BookOpen size={22} />
            }
            titulo="Flashcards"
            texto="Memoriza conceptos y comprueba tus respuestas."
          />

          <Caracteristica
            icono={
              <Clock3 size={22} />
            }
            titulo="Organiza tu estudio"
            texto="Controla tu tiempo, progreso y hábitos desde un mismo lugar."
          />
        </div>
      </section>

      {/* =====================================================
          CTA FINAL
      ===================================================== */}

      <section
        className="
          relative z-10
          mx-auto
          max-w-[1100px]
          px-5
          pb-16
          sm:px-8
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[30px]
            bg-gradient-to-r
            from-[#286CF1]
            via-[#377EF1]
            to-[#47A6EE]
            px-6 py-9
            text-center
            text-white
            shadow-[0_20px_50px_rgba(36,108,240,0.25)]
            sm:px-10
            sm:py-12
          "
        >
          <div
            className="
              absolute
              -right-16
              -top-24
              h-56 w-56
              rounded-full
              bg-white/15
            "
          />

          <div
            className="
              absolute
              -bottom-24
              -left-12
              h-52 w-52
              rounded-full
              bg-white/10
            "
          />

          <div className="relative">
            <Sparkles
              size={28}
              className="mx-auto"
            />

            <h2
              className="
                mt-4
                text-2xl
                font-black
                sm:text-3xl
              "
            >
              Tu próximo estudio puede ser diferente.
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-xl
                text-sm
                leading-6
                text-white/85
                sm:text-base
              "
            >
              Crea tu cuenta y deja que Roccoo transforme
              tus materiales en una experiencia de estudio
              más rápida, organizada e interactiva.
            </p>

            <Link
              href="/Registro"
              className="
                mt-6
                inline-flex
                h-[54px]
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-white
                px-7
                font-black
                text-[#286CF1]
                shadow-lg
                transition
                hover:-translate-y-1
              "
            >
              Empezar ahora

              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="
          relative z-10
          border-t
          border-[#DCE5F1]
          bg-white/35
          px-5 py-6
          backdrop-blur
          dark:border-slate-800
          dark:bg-[#101A2A]/30
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
            gap-4
            text-center
            sm:flex-row
            sm:text-left
          "
        >
          <div className="flex items-center gap-2">
            <Image
              src="/raccoon.png"
              alt="Raccoon Study"
              width={30}
              height={30}
              className="h-7 w-7 object-contain"
            />

            <span className="text-sm font-black">
              Raccoon
              <span className="text-[#3978F6]">
                Study
              </span>
            </span>
          </div>

          <p
            className="
              text-xs
              text-[#7C8DA5]
              dark:text-slate-500
            "
          >
            © 2026 Raccoon Study · Aprende mejor,
            estudia diferente.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* =====================================================
   MINI FUNCIÓN
===================================================== */

function MiniFuncion({
  icono,
  titulo,
  texto,
}: {
  icono: ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <div
      className="
        flex items-center
        gap-3
        rounded-2xl
        border border-white/80
        bg-white/65
        p-4
        text-left
        shadow-sm
        backdrop-blur-xl
        transition
        hover:-translate-y-1
        hover:bg-white
        hover:shadow-lg
        dark:border-slate-700
        dark:bg-slate-800/55
        dark:hover:bg-slate-800
      "
    >
      <div
        className="
          flex h-11 w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#EAF2FF]
          text-[#3978F6]
          dark:bg-[#243650]
          dark:text-[#90BBFF]
        "
      >
        {icono}
      </div>

      <div>
        <p
          className="
            text-xs
            font-black
            sm:text-sm
          "
        >
          {titulo}
        </p>

        <p
          className="
            mt-1
            text-[10px]
            leading-4
            text-[#7A8BA3]
            dark:text-slate-400
          "
        >
          {texto}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   TARJETA FLOTANTE
===================================================== */

function TarjetaFlotante({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        absolute z-30
        hidden
        items-center
        gap-3
        rounded-2xl
        border border-white/90
        bg-white/85
        p-3
        pr-5
        shadow-[0_15px_35px_rgba(40,75,130,0.14)]
        backdrop-blur-xl
        dark:border-slate-700
        dark:bg-[#172235]/85
        sm:flex
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* =====================================================
   CARACTERÍSTICA
===================================================== */

function Caracteristica({
  icono,
  titulo,
  texto,
}: {
  icono: ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <article
      className="
        rounded-2xl
        p-4
        transition
        hover:-translate-y-1
        hover:bg-white/70
        dark:hover:bg-slate-700/40
      "
    >
      <div
        className="
          flex h-12 w-12
          items-center
          justify-center
          rounded-2xl
          bg-gradient-to-br
          from-[#E7F0FF]
          to-[#EEE9FF]
          text-[#3978F6]
          dark:from-[#243650]
          dark:to-[#302B50]
          dark:text-[#90BBFF]
        "
      >
        {icono}
      </div>

      <h3 className="mt-4 font-black">
        {titulo}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-[#657993]
          dark:text-slate-400
        "
      >
        {texto}
      </p>
    </article>
  );
}