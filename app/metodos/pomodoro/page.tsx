"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  ArrowLeft,
  X,
  Menu,
  Music2,
  Play,
  Pause,
  RotateCcw,
  Settings2,
  Clock3,
  Coffee,
  Timer,
  CircleHelp,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Lock,
  ChevronDown,
} from "lucide-react";

type Fase = "focus" | "shortBreak" | "longBreak";

type Track = {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  image: string;
  duration: number;
};

const JAMENDO_URL =
  "https://api.jamendo.com/v3.0/tracks/?client_id=b49a735b&format=json&tags=relax&limit=12&audioformat=mp32";

const VIDEO_ID = "IUXNiDJJ_9s";

export default function PomodoroPage() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [fase, setFase] = useState<Fase>("focus");
  const [ciclo, setCiclo] = useState(1);

  const [focusMinutes, setFocusMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(20);

  const [segundosRestantes, setSegundosRestantes] = useState(25 * 60);
  const [activo, setActivo] = useState(false);
  const [sesionesCompletadas, setSesionesCompletadas] = useState(0);

  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [mostrarTodasMusicas, setMostrarTodasMusicas] = useState(false);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackActual, setTrackActual] = useState(0);
  const [musicaActiva, setMusicaActiva] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const [darkMode, setDarkMode] = useState(false);

  const [esPremium, setEsPremium] = useState(false);

  const tiempoTotal = useMemo(() => {
    if (fase === "focus") return focusMinutes * 60;
    if (fase === "shortBreak") return shortBreakMinutes * 60;
    return longBreakMinutes * 60;
  }, [
    fase,
    focusMinutes,
    shortBreakMinutes,
    longBreakMinutes,
  ]);

  const porcentaje = Math.max(
    0,
    Math.min(
      100,
      ((tiempoTotal - segundosRestantes) / tiempoTotal) * 100
    )
  );

  const minutos = Math.floor(segundosRestantes / 60)
    .toString()
    .padStart(2, "0");

  const segundos = (segundosRestantes % 60)
    .toString()
    .padStart(2, "0");

  const faseTexto =
    fase === "focus"
      ? "Enfoque"
      : fase === "shortBreak"
      ? "Descanso breve"
      : "Descanso largo";

  const faseColor =
    fase === "focus"
      ? "#FF6470"
      : fase === "shortBreak"
      ? "#55A8E8"
      : "#7771E8";

  useEffect(() => {
    // DETECTAR PLAN DEL USUARIO
    const usuarioGuardado = localStorage.getItem("raccoon-user");

    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);

        const premium =
          usuario?.premium === true ||
          usuario?.plan === "premium" ||
          usuario?.plan === "Premium" ||
          usuario?.subscription === "premium";

        setEsPremium(premium);
      } catch (error) {
        console.error("Error leyendo usuario:", error);
      }
    }

    const modoGuardado = localStorage.getItem(
      "raccoon-dark-mode"
    );

    if (modoGuardado === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const cargarMusica = async () => {
      try {
        const respuesta = await fetch(JAMENDO_URL);
        const data = await respuesta.json();

        if (data?.results) {
          setTracks(data.results);
        }
      } catch (error) {
        console.error("Error cargando música:", error);
      }
    };

    cargarMusica();
  }, []);

  useEffect(() => {
    if (!activo) return;

    const intervalo = setInterval(() => {
      setSegundosRestantes((actual) => {
        if (actual <= 1) {
          clearInterval(intervalo);
          cambiarAutomaticamente();
          return 0;
        }

        return actual - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [
    activo,
    fase,
    ciclo,
    focusMinutes,
    shortBreakMinutes,
    longBreakMinutes,
  ]);

  const cambiarAutomaticamente = () => {
    if (fase === "focus") {
      setFase("shortBreak");
      setSegundosRestantes(shortBreakMinutes * 60);
      setActivo(true);
      return;
    }

    if (fase === "shortBreak") {
      if (ciclo < 4) {
        setCiclo((actual) => actual + 1);
        setFase("focus");
        setSegundosRestantes(focusMinutes * 60);
        setActivo(true);
      } else {
        setFase("longBreak");
        setSegundosRestantes(longBreakMinutes * 60);
        setActivo(true);
      }

      return;
    }

    if (fase === "longBreak") {
      setSesionesCompletadas((actual) => actual + 1);
      setCiclo(1);
      setFase("focus");
      setSegundosRestantes(focusMinutes * 60);
      setActivo(true);
    }
  };

  const reiniciarPomodoro = () => {
    setActivo(false);
    setFase("focus");
    setCiclo(1);
    setSegundosRestantes(focusMinutes * 60);
  };

  const aplicarConfiguracion = () => {
    setActivo(false);
    setFase("focus");
    setCiclo(1);
    setSegundosRestantes(focusMinutes * 60);
    setMostrarConfiguracion(false);
  };

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

  const reproducirTrack = (track: Track, index: number) => {
    if (!esPremium) return;

    if (audio) {
      audio.pause();
    }

    const nuevoAudio = new Audio(track.audio);
    nuevoAudio.loop = true;
    nuevoAudio.volume = 0.7;

    nuevoAudio.play();

    setAudio(nuevoAudio);
    setTrackActual(index);
    setMusicaActiva(true);
  };

  const pausarMusica = () => {
    if (audio) {
      audio.pause();
    }

    setMusicaActiva(false);
  };

  const siguienteTrack = () => {
    if (!tracks.length || !esPremium) return;

    const siguiente = (trackActual + 1) % tracks.length;

    reproducirTrack(tracks[siguiente], siguiente);
  };

  const anteriorTrack = () => {
    if (!tracks.length || !esPremium) return;

    const anterior =
      (trackActual - 1 + tracks.length) % tracks.length;

    reproducirTrack(tracks[anterior], anterior);
  };

  const tracksVisibles = mostrarTodasMusicas
    ? tracks
    : tracks.slice(0, 4);

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-[#13213A] transition-colors dark:bg-[#101927] dark:text-white">
      {/* SIDEBAR */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col border-r border-[#DDEAF7] bg-white transition-transform duration-300 dark:border-slate-700 dark:bg-[#151F30] ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
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
              <span className="text-[#55A8E8]">Study</span>
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
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#253650] transition hover:bg-[#F0F8FF] hover:text-[#1687D9] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Home size={19} />
            Inicio
          </Link>

          <Link
            href="/metodos"
            className="flex items-center gap-3 rounded-xl bg-[#E5F4FF] px-4 py-3 text-sm font-bold text-[#1687D9] dark:bg-[#1D3558]"
          >
            <Brain size={19} />
            Métodos de estudio
          </Link>

          <Link
            href="/quizzes"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#253650] transition hover:bg-[#F0F8FF] hover:text-[#1687D9] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ClipboardCheck size={19} />
            Quizzes
          </Link>

          <Link
            href="/biblioteca"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#253650] transition hover:bg-[#F0F8FF] hover:text-[#1687D9] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Library size={19} />
            Biblioteca
          </Link>
           <Link
            href="/lugares"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#253650] transition hover:bg-[#F0F8FF] hover:text-[#1687D9] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <MapPin size={19} />
            Lugares
          </Link>

          <Link
            href="/perfil"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#253650] transition hover:bg-[#F0F8FF] hover:text-[#1687D9] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <User size={19} />
            Perfil
          </Link>

         
        </nav>

        <div className="space-y-2 px-3 pb-5">
          <button
            onClick={cambiarModo}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#253650] transition hover:bg-[#F0F8FF] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span className="text-lg">
              {darkMode ? "☀️" : "🌙"}
            </span>

            {darkMode ? "Modo claro" : "Modo oscuro"}
          </button>

          <button
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>

          <Link
            href="/suscripcion"
            className="relative block overflow-hidden rounded-2xl bg-gradient-to-br from-[#64C7F2] via-[#55A8E8] to-[#7771E8] p-4 text-white shadow-lg shadow-[#55A8E8]/25 transition hover:-translate-y-1"
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

              {esPremium
                ? "Premium activo"
                : "Descubrir Premium"}

              <ArrowRight size={13} />
            </div>
          </Link>
        </div>
      </aside>

      {/* CONTENIDO */}

      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-[80px] items-center justify-between border-b border-[#E4EDF7] bg-white/95 px-5 backdrop-blur dark:border-slate-700 dark:bg-[#151F30]/95 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuAbierto(true)}
              className="lg:hidden"
            >
              <Menu size={25} />
            </button>

            <h1 className="text-xl font-black md:text-2xl">
              Pomodoro
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-[#F1F6FC] px-4 py-2 text-sm font-semibold text-[#52709B] dark:bg-slate-800 md:block">
              {esPremium
                ? "Premium activo ✨"
                : "Plan gratuito"}
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

        <div className="mx-auto max-w-[1450px] space-y-6 p-4 md:p-7">

  {/* REGRESAR A MÉTODOS */}

  <Link
    href="/metodos"
    className="
      inline-flex
      items-center
      gap-2
      rounded-xl
      bg-white
      px-4
      py-2.5
      text-sm
      font-bold
      text-[#52709B]
      shadow-sm
      transition
      hover:-translate-x-1
      hover:bg-[#EAF7FF]
      hover:text-[#1687D9]
      dark:bg-[#182437]
      dark:text-slate-300
      dark:hover:bg-slate-700
    "
  >
    <ArrowLeft size={18} />
    Volver a métodos de estudio
  </Link>

          {/* BANNER */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#E8F8FF] via-[#F4F1FF] to-[#EAF4FF] p-5 shadow-sm dark:from-[#1B3850] dark:via-[#29264B] dark:to-[#1D3558] md:p-8">
            <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#55A8E8]/10" />

            <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-[#7771E8] dark:bg-white/10">
                  <Sparkles size={16} />
                  Concentración efectiva
                </div>

                <h2 className="text-3xl font-black text-[#13213A] dark:text-white md:text-5xl">
                  Pomodoro
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-7 text-[#49627F] dark:text-slate-300 md:text-base">
                  Bloques de estudio y descanso para mantener tu concentración al máximo.
                </p>

                <div className="mt-5 space-y-3 text-sm font-semibold text-[#334B68] dark:text-slate-200">
                  <div className="flex items-center gap-3">
                    <Clock3
                      size={21}
                      className="text-[#FF6470]"
                    />
                    {focusMinutes} minutos de enfoque
                  </div>

                  <div className="flex items-center gap-3">
                    <Coffee
                      size={21}
                      className="text-[#55A8E8]"
                    />
                    {shortBreakMinutes} minutos de descanso
                  </div>

                  <div className="flex items-center gap-3">
                    <Timer
                      size={21}
                      className="text-[#7771E8]"
                    />
                    Ciclos para mayor productividad
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <Image
                  src="/raccoon.png"
                  alt="Raccoon estudiando"
                  width={280}
                  height={280}
                  className="drop-shadow-xl"
                />
              </div>
            </div>
          </section>

          {/* CRONOMETRO + VIDEO */}

          <div className="grid gap-6 xl:grid-cols-[1fr_1.45fr]">
            <section className="rounded-[28px] bg-white p-5 shadow-sm dark:bg-[#182437] md:p-7">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black md:text-xl">
                  Sesión Pomodoro
                </h2>

                <button
                  onClick={() =>
                    setMostrarConfiguracion(
                      !mostrarConfiguracion
                    )
                  }
                  className="rounded-xl bg-[#F2F7FC] p-2.5 text-[#52709B] transition hover:bg-[#E4F3FF] dark:bg-slate-700"
                >
                  <Settings2 size={20} />
                </button>
              </div>

              {mostrarConfiguracion && (
                <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#EFF9FF] to-[#F4F0FF] p-4 dark:from-slate-800 dark:to-slate-700">
                  <h3 className="font-black">
                    Personalizar cronómetro
                  </h3>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <label className="text-xs font-bold">
                      Enfoque

                      <input
                        type="number"
                        min="1"
                        value={focusMinutes}
                        onChange={(e) =>
                          setFocusMinutes(
                            Number(e.target.value)
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-[#D9E7F4] bg-white px-3 py-2 text-sm outline-none dark:bg-slate-800"
                      />
                    </label>

                    <label className="text-xs font-bold">
                      Descanso

                      <input
                        type="number"
                        min="1"
                        value={shortBreakMinutes}
                        onChange={(e) =>
                          setShortBreakMinutes(
                            Number(e.target.value)
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-[#D9E7F4] bg-white px-3 py-2 text-sm outline-none dark:bg-slate-800"
                      />
                    </label>

                    <label className="text-xs font-bold">
                      Largo

                      <input
                        type="number"
                        min="15"
                        max="30"
                        value={longBreakMinutes}
                        onChange={(e) =>
                          setLongBreakMinutes(
                            Number(e.target.value)
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-[#D9E7F4] bg-white px-3 py-2 text-sm outline-none dark:bg-slate-800"
                      />
                    </label>
                  </div>

                  <button
                    onClick={aplicarConfiguracion}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] py-3 font-bold text-white"
                  >
                    Guardar configuración
                  </button>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <div
                  className="relative flex h-[275px] w-[275px] items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(${faseColor} ${porcentaje}%, #EAF0F6 ${porcentaje}% 100%)`,
                  }}
                >
                  <div className="flex h-[245px] w-[245px] flex-col items-center justify-center rounded-full bg-white dark:bg-[#182437]">
                    <span className="text-6xl font-black tracking-tight md:text-7xl">
                      {minutos}:{segundos}
                    </span>

                    <span
                      className="mt-2 text-lg font-black"
                      style={{ color: faseColor }}
                    >
                      {faseTexto}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 font-bold">
                <Sparkles
                  size={18}
                  className="text-[#7771E8]"
                />
                Ciclo {ciclo} de 4
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setActivo(!activo)}
                  className="flex min-w-[145px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] px-5 py-3 font-black text-white shadow-lg shadow-[#55A8E8]/20 transition hover:-translate-y-0.5"
                >
                  {activo ? (
                    <>
                      <Pause size={19} />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play size={19} />
                      Comenzar
                    </>
                  )}
                </button>

                <button
                  onClick={reiniciarPomodoro}
                  className="rounded-xl bg-[#F1F5FA] px-4 py-3 text-[#52709B] transition hover:bg-[#E6F1FA] dark:bg-slate-700"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-[#7771E8]">
                <Sparkles size={17} />
                Al finalizar cada fase, el siguiente ciclo comenzará automáticamente.
              </div>

              <p className="mt-7 text-center font-black">
                Sesiones completadas: {sesionesCompletadas}
              </p>
            </section>

            {/* VIDEO DISPONIBLE PARA TODOS */}

            <section className="rounded-[28px] bg-white p-5 shadow-sm dark:bg-[#182437] md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    Aprende Pomodoro
                  </h2>

                  <p className="mt-2 text-sm text-[#52709B] dark:text-slate-400">
                    Mira cómo funciona el método y mejora tu concentración.
                  </p>
                </div>

                <CircleHelp
                  size={25}
                  className="text-[#7771E8]"
                />
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl bg-[#EAF4FF] dark:bg-slate-800">
                {mostrarVideo ? (
                  <div className="aspect-video">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${VIDEO_ID}`}
                      title="Cómo funciona Pomodoro"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center bg-gradient-to-br from-[#DDF5FF] via-[#F2EDFF] to-[#E6F1FF] p-6 text-center dark:from-[#1D3558] dark:via-[#29243F] dark:to-[#1B3850]">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#7771E8] shadow-lg dark:bg-slate-800">
                      <Play
                        size={34}
                        fill="currentColor"
                      />
                    </div>

                    <h3 className="mt-5 text-xl font-black">
                      ¿Cómo funciona Pomodoro?
                    </h3>

                    <p className="mt-2 max-w-md text-sm text-[#52709B] dark:text-slate-300">
                      Aprende a estudiar por ciclos de enfoque y descanso.
                    </p>

                    <button
                      onClick={() => setMostrarVideo(true)}
                      className="mt-5 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] px-6 py-3 font-bold text-white"
                    >
                      Ver video
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-[#FFF0F2] p-4 text-center">
                  <p className="text-2xl font-black text-[#FF6470]">
                    {focusMinutes}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#7A5060]">
                    Min. enfoque
                  </p>
                </div>

                <div className="rounded-2xl bg-[#EAF7FF] p-4 text-center">
                  <p className="text-2xl font-black text-[#55A8E8]">
                    {shortBreakMinutes}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#52709B]">
                    Min. descanso
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F1EDFF] p-4 text-center">
                  <p className="text-2xl font-black text-[#7771E8]">
                    4
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#61558D]">
                    Ciclos
                  </p>
                </div>

                <div className="rounded-2xl bg-[#E9FAF2] p-4 text-center">
                  <p className="text-2xl font-black text-[#26A66B]">
                    {longBreakMinutes}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#477A62]">
                    Min. largo
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* MUSICA */}

          <section className="rounded-[28px] bg-white p-5 shadow-sm dark:bg-[#182437] md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Music2
                    size={27}
                    className="text-[#7771E8]"
                  />

                  <h2 className="text-2xl font-black">
                    Música relajante
                  </h2>
                </div>

                <p className="mt-2 text-sm text-[#52709B] dark:text-slate-400">
                  Escucha música para mantener la calma y mejorar tu concentración.
                </p>
              </div>

              {esPremium ? (
                <div className="flex items-center gap-2 rounded-full bg-[#E9FAF2] px-4 py-2 text-sm font-bold text-[#26A66B]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#26A66B]" />
                  Premium desbloqueado
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-[#FFF3D9] px-4 py-2 text-sm font-bold text-[#C88700]">
                  <Lock size={15} />
                  Función Premium
                </div>
              )}
            </div>

            {!esPremium ? (
              <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#EDE9FF] via-[#E9F7FF] to-[#DDF5FF] p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-[#7771E8] shadow-lg">
                  <Lock size={34} />
                </div>

                <h3 className="mt-5 text-2xl font-black">
                  Música relajante Premium
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-[#52709B]">
                  Desbloquea música relajante para acompañar tus sesiones de estudio.
                </p>

                <Link
                  href="/suscripcion"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] px-6 py-3 font-black text-white shadow-lg"
                >
                  <Crown size={18} />
                  Desbloquear Premium
                  <ArrowRight size={17} />
                </Link>
              </div>
            ) : tracks.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#F1EDFF] to-[#EAF5FF] p-8 text-center">
                <Music2
                  size={35}
                  className="mx-auto text-[#7771E8]"
                />

                <p className="mt-3 font-bold">
                  Cargando música relajante...
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {tracksVisibles.map((track, index) => (
                    <button
                      key={track.id}
                      onClick={() =>
                        musicaActiva &&
                        trackActual === index
                          ? pausarMusica()
                          : reproducirTrack(track, index)
                      }
                      className={`group overflow-hidden rounded-2xl border text-left transition hover:-translate-y-1 hover:shadow-lg ${
                        trackActual === index &&
                        musicaActiva
                          ? "border-[#7771E8] shadow-md"
                          : "border-[#E5EDF5] dark:border-slate-700"
                      }`}
                    >
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={track.image}
                          alt={track.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#7771E8] shadow">
                          {trackActual === index &&
                          musicaActiva ? (
                            <Pause
                              size={17}
                              fill="currentColor"
                            />
                          ) : (
                            <Play
                              size={17}
                              fill="currentColor"
                            />
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="line-clamp-1 font-black">
                          {track.name}
                        </p>

                        <p className="mt-1 line-clamp-1 text-sm text-[#52709B] dark:text-slate-400">
                          {track.artist_name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex justify-center">
                  <button
                    onClick={() =>
                      setMostrarTodasMusicas(
                        !mostrarTodasMusicas
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-[#F1EDFF] px-5 py-3 text-sm font-black text-[#7771E8] transition hover:bg-[#E8E1FF]"
                  >
                    {mostrarTodasMusicas
                      ? "Mostrar menos"
                      : "Ver más música"}

                    <ChevronDown
                      size={18}
                      className={
                        mostrarTodasMusicas
                          ? "rotate-180 transition"
                          : "transition"
                      }
                    />
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#F1EDFF] to-[#EAF5FF] p-4 dark:from-[#29243F] dark:to-[#1D3558] md:flex-row md:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#7771E8] dark:bg-slate-800">
                    <Music2 size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-black">
                      {tracks[trackActual]?.name}
                    </p>

                    <p className="text-sm text-[#52709B] dark:text-slate-400">
                      {tracks[trackActual]?.artist_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={anteriorTrack}
                      className="rounded-full p-2 transition hover:bg-white/70"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      onClick={() =>
                        musicaActiva
                          ? pausarMusica()
                          : reproducirTrack(
                              tracks[trackActual],
                              trackActual
                            )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7771E8] text-white shadow-lg"
                    >
                      {musicaActiva ? (
                        <Pause
                          size={19}
                          fill="currentColor"
                        />
                      ) : (
                        <Play
                          size={19}
                          fill="currentColor"
                        />
                      )}
                    </button>

                    <button
                      onClick={siguienteTrack}
                      className="rounded-full p-2 transition hover:bg-white/70"
                    >
                      <ChevronRight size={20} />
                    </button>

                    <Volume2
                      size={20}
                      className="ml-2 text-[#7771E8]"
                    />
                  </div>
                </div>
              </>
            )}
          </section>

          {/* CONSEJO */}

          <section className="rounded-2xl bg-gradient-to-r from-[#F2F0FF] to-[#EAF5FF] px-5 py-4 dark:from-[#29243F] dark:to-[#1D3558]">
            <div className="flex items-start gap-3">
              <Sparkles
                size={21}
                className="mt-0.5 text-[#7771E8]"
              />

              <p className="text-sm leading-6">
                <strong>Consejo:</strong> Concéntrate en una tarea a la vez y evita distracciones para aprovechar al máximo cada Pomodoro.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}