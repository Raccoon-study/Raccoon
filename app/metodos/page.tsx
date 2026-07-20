"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Home,
  Brain,
  ClipboardCheck,
  Library,
  User,
  MapPin,
  LogOut,
  Crown,
  Sparkles,
  ArrowRight,
  X,
  Menu,
  Clock3,
  FileText,
  Layers3,
  Check,
  ChevronRight,
} from "lucide-react";

type Metodo = {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ReactNode;
  color: string;
  fondo: string;
  etiqueta: string;
  href: string;
  pasos: string[];
};

export default function MetodosPage() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [perfil, setPerfil] = useState({
    nombre: "Jhulianys",
    premium: true,
  });

  useEffect(() => {
    const modoGuardado = localStorage.getItem(
      "raccoon-dark-mode"
    );

    if (modoGuardado === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const usuarioGuardado = localStorage.getItem(
      "raccoon-user"
    );

    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);

        setPerfil({
          nombre: usuario.nombre || "Jhulianys",
          premium: usuario.premium === true,
        });
      } catch {
        console.log("No se pudo cargar el usuario");
      }
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("raccoon-user");
    window.location.href = "/login";
  };

  const cambiarModo = () => {
    const nuevoModo = !darkMode;

    setDarkMode(nuevoModo);

    if (nuevoModo) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("raccoon-dark-mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("raccoon-dark-mode", "false");
    }
  };

  const metodos: Metodo[] = [
    {
      id: "pomodoro",
      nombre: "Pomodoro",
      descripcion:
        "Estudia por bloques de tiempo y toma descansos estratégicos para mantener tu concentración.",
      icono: <Clock3 size={30} />,
      color: "#FF6470",
      fondo: "#FFF0F2",
      etiqueta: "Concentración",
      href: "/metodos/pomodoro",
      pasos: [
        "Elige una tarea",
        "Concéntrate durante 25 minutos",
        "Toma un descanso",
      ],
    },
    {
      id: "resumenes",
      nombre: "Resúmenes",
      descripcion:
        "Convierte tus materiales de estudio en ideas claras y fáciles de recordar.",
      icono: <FileText size={30} />,
      color: "#55A8E8",
      fondo: "#EAF7FF",
      etiqueta: "Comprensión",
      href: "/metodos/resumenes",
      pasos: [
        "Lee el material",
        "Identifica las ideas principales",
        "Organiza la información",
      ],
    },
    {
      id: "flashcards",
      nombre: "Flashcards",
      descripcion:
        "Repasa conceptos importantes con tarjetas rápidas y pon a prueba tu memoria.",
      icono: <Layers3 size={30} />,
      color: "#7771E8",
      fondo: "#F1EDFF",
      etiqueta: "Memoria",
      href: "/metodos/flashcards",
      pasos: [
        "Crea tus tarjetas",
        "Repasa una pregunta",
        "Comprueba tu respuesta",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-[#13213A] transition-colors dark:bg-[#101927] dark:text-white">
      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-[250px]
          flex-col
          border-r
          border-[#DDEAF7]
          bg-white
          transition-transform
          duration-300
          dark:border-slate-700
          dark:bg-[#151F30]
          ${
            menuAbierto
              ? "translate-x-0"
              : "-translate-x-full"
          }
          lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex flex-col items-center">
            <Image
              src="/raccoon.png"
              alt="Raccoon Study"
              width={70}
              height={70}
              className="object-contain"
            />

            <h1 className="mt-1 text-[17px] font-black">
              Raccoon{" "}
              <span className="text-[#55A8E8]">
                Study
              </span>
            </h1>
          </div>

          <button
            onClick={() => setMenuAbierto(false)}
            className="lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="mt-5 flex-1 space-y-1.5 px-3">
          <Link
            href="/Dashboard"
            onClick={() => setMenuAbierto(false)}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              text-[#253650]
              transition
              hover:bg-[#F0F8FF]
              hover:text-[#1687D9]
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
          >
            <Home size={19} />
            Inicio
          </Link>

          <Link
            href="/metodos"
            onClick={() => setMenuAbierto(false)}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              bg-[#E5F4FF]
              px-4
              py-3
              text-sm
              font-bold
              text-[#1687D9]
              dark:bg-[#1D3558]
            "
          >
            <Brain size={19} />
            Métodos de estudio
          </Link>

          <Link
            href="/quizzes"
            onClick={() => setMenuAbierto(false)}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              text-[#253650]
              transition
              hover:bg-[#F0F8FF]
              hover:text-[#1687D9]
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
          >
            <ClipboardCheck size={19} />
            Quizzes
          </Link>

          <Link
            href="/biblioteca"
            onClick={() => setMenuAbierto(false)}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              text-[#253650]
              transition
              hover:bg-[#F0F8FF]
              hover:text-[#1687D9]
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
          >
            <Library size={19} />
            Biblioteca
          </Link>

          <Link
            href="/perfil"
            onClick={() => setMenuAbierto(false)}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              text-[#253650]
              transition
              hover:bg-[#F0F8FF]
              hover:text-[#1687D9]
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
          >
            <User size={19} />
            Perfil
          </Link>

          <Link
            href="/lugares"
            onClick={() => setMenuAbierto(false)}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              text-[#253650]
              transition
              hover:bg-[#F0F8FF]
              hover:text-[#1687D9]
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
          >
            <MapPin size={19} />
            Lugares
          </Link>
        </nav>

        <div className="space-y-2 px-3 pb-5">
          <button
            onClick={cambiarModo}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              text-[#253650]
              transition
              hover:bg-[#F0F8FF]
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
          >
            <span className="text-lg">
              {darkMode ? "☀️" : "🌙"}
            </span>

            {darkMode ? "Modo claro" : "Modo oscuro"}
          </button>

          <button
            onClick={cerrarSesion}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              text-red-500
              transition
              hover:bg-red-50
              dark:hover:bg-red-950/30
            "
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>

          <Link
            href="/suscripcion"
            className="
              relative
              block
              overflow-hidden
              rounded-2xl
              bg-gradient-to-br
              from-[#64C7F2]
              via-[#55A8E8]
              to-[#7771E8]
              p-4
              text-white
              shadow-lg
              shadow-[#55A8E8]/25
              transition
              hover:-translate-y-1
            "
          >
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/20" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Crown size={22} />
              </div>

              <div>
                <p className="text-sm font-black">
                  Raccoon Premium
                </p>

                <p className="mt-1 text-[11px] text-white/80">
                  Lleva tu estudio al siguiente nivel
                </p>
              </div>
            </div>

            <div className="relative mt-3 flex items-center gap-1 text-xs font-bold">
              <Sparkles size={13} />

              {perfil.premium
                ? "Premium activo"
                : "Descubrir Premium"}

              <ArrowRight size={13} />
            </div>
          </Link>
        </div>
      </aside>

      {/* CONTENIDO */}

      <div className="lg:pl-[250px]">
        {/* HEADER */}

        <header className="sticky top-0 z-30 flex h-[80px] items-center justify-between border-b border-[#E4EDF7] bg-white/95 px-5 backdrop-blur dark:border-slate-700 dark:bg-[#151F30]/95 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuAbierto(true)}
              className="lg:hidden"
            >
              <Menu size={25} />
            </button>

            <h1 className="text-xl font-black md:text-2xl">
              Métodos de estudio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-[#F1F6FC] px-4 py-2 text-sm font-semibold text-[#52709B] dark:bg-slate-800 md:block">
              Hola, {perfil.nombre} ✨
            </div>

            <Image
              src="/raccoon.png"
              alt="Perfil"
              width={42}
              height={42}
              className="rounded-full"
            />
          </div>
        </header>

        <div className="mx-auto max-w-[1450px] space-y-7 p-4 md:p-7">
          {/* HERO */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#E8F8FF] via-[#F4F1FF] to-[#FFF1F3] p-6 shadow-sm dark:from-[#1B3850] dark:via-[#29264B] dark:to-[#3A263A] md:p-9">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#55A8E8]/10" />

            <div className="absolute -bottom-20 right-40 h-48 w-48 rounded-full bg-[#FF6470]/10" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-[#7771E8] dark:bg-white/10">
                  <Sparkles size={16} />
                  Estudia de forma inteligente
                </div>

                <h2 className="max-w-2xl text-3xl font-black leading-tight md:text-5xl">
                  Encuentra el método que funciona para ti
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#49627F] dark:text-slate-300 md:text-base">
                  En Raccoon Study seleccionamos métodos simples y efectivos para ayudarte a estudiar mejor, organizar tu tiempo y recordar lo aprendido.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-[#FF6470] dark:bg-white/10">
                    🎯 Enfócate
                  </div>

                  <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-[#55A8E8] dark:bg-white/10">
                    🧠 Comprende
                  </div>

                  <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-[#7771E8] dark:bg-white/10">
                    ✨ Recuerda
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <Image
                  src="/raccoon.png"
                  alt="Raccoon estudiando"
                  width={270}
                  height={270}
                  className="drop-shadow-xl"
                />
              </div>
            </div>
          </section>

          {/* TITULO */}

          <div>
            <h2 className="text-2xl font-black md:text-3xl">
              Métodos recomendados
            </h2>

            <p className="mt-2 text-sm text-[#52709B] dark:text-slate-400">
              Tres formas fáciles de mejorar tu manera de estudiar.
            </p>
          </div>

          {/* CARDS */}

          <section className="grid gap-6 lg:grid-cols-3">
            {metodos.map((metodo) => (
              <Link
                key={metodo.id}
                href={metodo.href}
                className="group relative overflow-hidden rounded-[28px] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-[#182437]"
              >
                <div
                  className="absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-60"
                  style={{
                    backgroundColor: metodo.fondo,
                  }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: metodo.fondo,
                        color: metodo.color,
                      }}
                    >
                      {metodo.icono}
                    </div>

                    <span
                      className="rounded-full px-3 py-1 text-xs font-black"
                      style={{
                        backgroundColor: metodo.fondo,
                        color: metodo.color,
                      }}
                    >
                      {metodo.etiqueta}
                    </span>
                  </div>

                  <h3 className="mt-6 text-2xl font-black">
                    {metodo.nombre}
                  </h3>

                  <p className="mt-3 min-h-[75px] text-sm leading-6 text-[#52709B] dark:text-slate-400">
                    {metodo.descripcion}
                  </p>

                  <div className="mt-6 space-y-3">
                    {metodo.pasos.map((paso, index) => (
                      <div
                        key={paso}
                        className="flex items-center gap-3 text-sm font-semibold"
                      >
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                          style={{
                            backgroundColor: metodo.color,
                          }}
                        >
                          <Check size={14} />
                        </div>

                        {paso}
                      </div>
                    ))}
                  </div>

                  <div
                    className="mt-7 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-black transition group-hover:gap-3"
                    style={{
                      backgroundColor: metodo.fondo,
                      color: metodo.color,
                    }}
                  >
                    Explorar método

                    <ChevronRight size={19} />
                  </div>
                </div>
              </Link>
            ))}
          </section>

          {/* BANNER INFERIOR */}

          <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#55A8E8] to-[#7771E8] p-6 text-white shadow-lg md:p-8">
            <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-white/10" />

            <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={21} />

                  <h2 className="text-xl font-black md:text-2xl">
                    ¿No sabes por dónde empezar?
                  </h2>
                </div>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                  Prueba Pomodoro para organizar tu tiempo y comenzar a estudiar sin complicarte.
                </p>
              </div>

              <Link
                href="/metodos/pomodoro"
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#7771E8] transition hover:-translate-y-1"
              >
                Probar Pomodoro
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}