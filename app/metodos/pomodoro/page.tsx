"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Coffee,
  Crown,
  Headphones,
  Home,
  Library,
  LoaderCircle,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Music2,
  Pause,
  PartyPopper,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Trophy,
  User,
  Volume2,
  X,
} from "lucide-react";

import {
  supabase,
} from "../../lib/supabase";

/* =====================================================
   TIPOS
===================================================== */

type Fase =
  | "focus"
  | "shortBreak"
  | "longBreak";

type PlanType =
  | "free"
  | "month"
  | "year";

interface Track {
  id: string;

  name: string;

  artist_name: string;

  audio: string;

  image: string;

  duration: number;

  source:
    | "jamendo"
    | "deezer";

  external_url?: string;
}

interface MetaSemanal {
  id: string;

  texto: string;

  completada: boolean;
}

interface ProgresoSemanal {
  semana: string;

  sesiones: number;

  objetivo: number;

  metas: MetaSemanal[];
}

/* =====================================================
   CONSTANTES
===================================================== */

const JAMENDO_API =
  "/api/musica/jamendo";

const DEEZER_API =
  "/api/musica/deezer";

const VIDEO_ID =
  "IUXNiDJJ_9s";

const WEEK_STORAGE_KEY =
  "raccoon-weekly-study";

const MENSAJES_FELICITACION = [
  "¡Lo lograste! Tu enfoque de hoy está construyendo el futuro que quieres. 🚀",

  "¡Pomodoro completado! Roccoo te da una estrella por no rendirte. ⭐",

  "¡Excelente trabajo! Tu cerebro acaba de ganar otra ronda. 🧠✨",

  "¡Nivel de concentración superado! Respira, celebra y sigue avanzando. 🏆",

  "¡Una sesión más! Pequeños bloques, grandes resultados. 💙",
];

/* =====================================================
   HELPERS
===================================================== */

function esObjeto(
  valor: unknown
): valor is Record<
  string,
  unknown
> {
  return (
    typeof valor ===
      "object" &&
    valor !== null
  );
}

function normalizarPlan(
  valor: unknown,
  premium = false
): PlanType {
  const texto =
    String(
      valor || ""
    )
      .trim()
      .toLowerCase();

  if (
    texto === "year" ||
    texto === "annual" ||
    texto === "anual" ||
    texto === "premium_year" ||
    texto === "premium_anual"
  ) {
    return "year";
  }

  if (
    texto === "month" ||
    texto === "monthly" ||
    texto === "mensual" ||
    texto === "premium" ||
    texto === "pro" ||
    texto === "paid" ||
    texto === "pago" ||
    texto === "premium_month" ||
    texto === "premium_mensual"
  ) {
    return "month";
  }

  return premium
    ? "month"
    : "free";
}

function obtenerPlanPayload(
  valor: unknown
): PlanType {
  if (
    !esObjeto(valor)
  ) {
    return "free";
  }

  const premium =
    valor.premium === true ||
    valor.is_premium === true ||
    valor.isPremium === true ||
    valor.es_premium === true ||
    valor.paid === true;

  let posiblePlan:
    unknown =
    valor.plan ||
    valor.tipo_plan ||
    valor.plan_name ||
    valor.planName ||
    valor.tier;

  if (
    typeof valor.subscription ===
      "string"
  ) {
    posiblePlan =
      valor.subscription;
  }

  if (
    esObjeto(
      valor.subscription
    )
  ) {
    posiblePlan =
      valor.subscription.plan ||
      valor.subscription.tipo_plan ||
      valor.subscription.plan_name ||
      posiblePlan;

    const premiumSuscripcion =
      valor.subscription.premium ===
        true ||
      valor.subscription.is_premium ===
        true ||
      valor.subscription.es_premium ===
        true;

    if (
      premiumSuscripcion
    ) {
      return normalizarPlan(
        posiblePlan,
        true
      );
    }
  }

  return normalizarPlan(
    posiblePlan,
    premium
  );
}

function nombrePlan(
  plan: PlanType
): string {
  if (
    plan === "year"
  ) {
    return "Premium anual";
  }

  if (
    plan === "month"
  ) {
    return "Premium mensual";
  }

  return "Plan gratuito";
}

function obtenerMensajeError(
  valor: unknown,
  respaldo: string
): string {
  if (
    typeof valor === "string" &&
    valor.trim()
  ) {
    return valor;
  }

  if (
    !esObjeto(valor)
  ) {
    return respaldo;
  }

  if (
    typeof valor.error ===
      "string" &&
    valor.error.trim()
  ) {
    return valor.error;
  }

  if (
    esObjeto(valor.error) &&
    typeof valor.error.message ===
      "string"
  ) {
    return valor.error.message;
  }

  if (
    typeof valor.message ===
      "string" &&
    valor.message.trim()
  ) {
    return valor.message;
  }

  return respaldo;
}

/* =====================================================
   TRACKS
===================================================== */

function obtenerLista(
  data: unknown
): unknown[] {
  if (
    Array.isArray(data)
  ) {
    return data;
  }

  if (
    !esObjeto(data)
  ) {
    return [];
  }

  const posibles = [
    data.tracks,
    data.results,
    data.data,
    data.items,
  ];

  const lista =
    posibles.find(
      Array.isArray
    );

  return Array.isArray(
    lista
  )
    ? lista
    : [];
}

function normalizarTracks(
  data: unknown,
  source:
    | "jamendo"
    | "deezer"
): Track[] {
  return obtenerLista(data)
    .map(
      (
        item,
        index
      ): Track | null => {
        if (
          !esObjeto(item)
        ) {
          return null;
        }

        const artist =
          esObjeto(item.artist)
            ? item.artist
            : null;

        const album =
          esObjeto(item.album)
            ? item.album
            : null;

        const audio =
          String(
            item.audio ||
              item.preview ||
              item.audio_url ||
              ""
          ).trim();

        if (!audio) {
          return null;
        }

        return {
          id:
            String(
              item.id ||
                `${source}-${index}`
            ),

          name:
            String(
              item.name ||
                item.title ||
                item.titulo ||
                "Sin título"
            ),

          artist_name:
            String(
              item.artist_name ||
                item.artista ||
                artist?.name ||
                "Artista"
            ),

          audio,

          image:
            String(
              item.image ||
                item.portada ||
                item.album_image ||
                album?.cover_medium ||
                album?.cover_big ||
                album?.cover ||
                ""
            ),

          duration:
            Number(
              item.duration ||
                item.duracion ||
                0
            ),

          source,

          external_url:
            String(
              item.external_url ||
                item.shareurl ||
                item.enlace ||
                item.link ||
                ""
            ),
        };
      }
    )
    .filter(
      (
        track
      ): track is Track =>
        track !== null
    );
}

/* =====================================================
   SEMANA
===================================================== */

function obtenerClaveSemana():
  string {
  const hoy =
    new Date();

  const dia =
    (hoy.getDay() +
      6) %
    7;

  const lunes =
    new Date(hoy);

  lunes.setHours(
    0,
    0,
    0,
    0
  );

  lunes.setDate(
    hoy.getDate() -
      dia
  );

  const year =
    lunes.getFullYear();

  const month =
    String(
      lunes.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const date =
    String(
      lunes.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${date}`;
}

/* =====================================================
   PÁGINA
===================================================== */

export default function PomodoroPage() {
  const router =
    useRouter();

  /* =================================================
     SIDEBAR / USUARIO
  ================================================= */

  const [
    menuAbierto,
    setMenuAbierto,
  ] = useState(false);

  const [
    nombreUsuario,
    setNombreUsuario,
  ] = useState(
    "Usuario"
  );

  const [
    fotoPerfil,
    setFotoPerfil,
  ] = useState(
    "/raccoon.png"
  );

  const [
    plan,
    setPlan,
  ] =
    useState<PlanType>(
      "free"
    );

  const [
    cargandoPlan,
    setCargandoPlan,
  ] = useState(true);

  const esPremium =
    plan !== "free";

  /* =================================================
     POMODORO
  ================================================= */

  const [
    fase,
    setFase,
  ] =
    useState<Fase>(
      "focus"
    );

  const [
    ciclo,
    setCiclo,
  ] = useState(1);

  const [
    focusMinutes,
    setFocusMinutes,
  ] = useState(25);

  const [
    shortBreakMinutes,
    setShortBreakMinutes,
  ] = useState(5);

  const [
    longBreakMinutes,
    setLongBreakMinutes,
  ] = useState(20);

  const [
    segundosRestantes,
    setSegundosRestantes,
  ] = useState(
    25 * 60
  );

  const [
    activo,
    setActivo,
  ] = useState(false);

  const [
    sesionesCompletadas,
    setSesionesCompletadas,
  ] = useState(0);

  const [
    mostrarConfiguracion,
    setMostrarConfiguracion,
  ] = useState(false);

  const [
    mostrarVideo,
    setMostrarVideo,
  ] = useState(false);

  /* =================================================
     MÚSICA
  ================================================= */

  const [
    jamendoTracks,
    setJamendoTracks,
  ] =
    useState<Track[]>(
      []
    );

  const [
    deezerTracks,
    setDeezerTracks,
  ] =
    useState<Track[]>(
      []
    );

  const [
    cargandoJamendo,
    setCargandoJamendo,
  ] = useState(true);

  const [
    cargandoDeezer,
    setCargandoDeezer,
  ] = useState(false);

  const [
    playlistPremiumCargada,
    setPlaylistPremiumCargada,
  ] = useState(false);

  const [
    errorJamendo,
    setErrorJamendo,
  ] = useState("");

  const [
    errorDeezer,
    setErrorDeezer,
  ] = useState("");

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const [
    trackActivo,
    setTrackActivo,
  ] =
    useState<Track | null>(
      null
    );

  const [
    musicaActiva,
    setMusicaActiva,
  ] = useState(false);

  const [
    volumen,
    setVolumen,
  ] = useState(0.65);

  /* =================================================
     METAS
  ================================================= */

  const [
    metasSemanales,
    setMetasSemanales,
  ] =
    useState<
      MetaSemanal[]
    >([]);

  const [
    nuevaMeta,
    setNuevaMeta,
  ] = useState("");

  const [
    objetivoSemanal,
    setObjetivoSemanal,
  ] = useState(8);

  const [
    sesionesSemana,
    setSesionesSemana,
  ] = useState(0);

  const [
    progresoCargado,
    setProgresoCargado,
  ] = useState(false);

  /* =================================================
     FELICITACIÓN
  ================================================= */

  const [
    mostrarFelicitacion,
    setMostrarFelicitacion,
  ] = useState(false);

  const [
    mensajeFelicitacion,
    setMensajeFelicitacion,
  ] = useState(
    MENSAJES_FELICITACION[
      0
    ]
  );

  /* =================================================
     TEMA
  ================================================= */

  const [
    darkMode,
    setDarkMode,
  ] = useState(false);

  /* =================================================
     CALCULADOS
  ================================================= */

  const tiempoTotal =
    useMemo(() => {
      if (
        fase === "focus"
      ) {
        return (
          focusMinutes *
          60
        );
      }

      if (
        fase ===
        "shortBreak"
      ) {
        return (
          shortBreakMinutes *
          60
        );
      }

      return (
        longBreakMinutes *
        60
      );
    }, [
      fase,
      focusMinutes,
      shortBreakMinutes,
      longBreakMinutes,
    ]);

  const porcentaje =
    Math.max(
      0,
      Math.min(
        100,
        tiempoTotal >
          0
          ? ((tiempoTotal -
              segundosRestantes) /
              tiempoTotal) *
              100
          : 0
      )
    );

  const minutos =
    Math.floor(
      segundosRestantes /
        60
    )
      .toString()
      .padStart(
        2,
        "0"
      );

  const segundos =
    (
      segundosRestantes %
      60
    )
      .toString()
      .padStart(
        2,
        "0"
      );

  const faseTexto =
    fase === "focus"
      ? "Enfoque"
      : fase ===
          "shortBreak"
        ? "Descanso breve"
        : "Descanso largo";

  const faseColor =
    fase === "focus"
      ? "#FF6470"
      : fase ===
          "shortBreak"
        ? "#55A8E8"
        : "#7771E8";

  /* =====================================================
     PREMIUM REAL
  ===================================================== */

  async function cargarUsuarioYPlan() {
    try {
      setCargandoPlan(
        true
      );

      const [
        respuestaUsuario,
        respuestaSesion,
      ] =
        await Promise.all([
          supabase.auth
            .getUser(),

          supabase.auth
            .getSession(),
        ]);

      const user =
        respuestaUsuario
          .data.user;

      const session =
        respuestaSesion
          .data.session;

      if (
        !user ||
        !session
      ) {
        router.replace(
          "/Login"
        );

        return;
      }

      const metadata = {
        ...(user
          .user_metadata ||
          {}),

        ...(user
          .app_metadata ||
          {}),
      };

      setNombreUsuario(
        String(
          metadata.nombre ||
            metadata.full_name ||
            metadata.name ||
            user.email
              ?.split("@")[0] ||
            "Usuario"
        )
      );

      if (
        typeof metadata.avatar_url ===
          "string" &&
        metadata.avatar_url
          .trim()
      ) {
        setFotoPerfil(
          metadata.avatar_url
        );
      }

      let planDetectado =
        normalizarPlan(
          metadata.plan ||
            metadata.tipo_plan ||
            metadata.subscription,

          metadata.premium ===
            true ||
            metadata.is_premium ===
              true ||
            metadata.es_premium ===
              true
        );

      /*
        La fuente principal del plan
        es /api/suscripciones.
      */

      try {
        const respuesta =
          await fetch(
            "/api/suscripciones",
            {
              method:
                "GET",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },

              cache:
                "no-store",
            }
          );

        const datos:
          unknown =
          await respuesta
            .json()
            .catch(
              () => null
            );

        if (
          respuesta.ok
        ) {
          const planServidor =
            obtenerPlanPayload(
              datos
            );

          /*
            Si el servidor dice Premium,
            tiene prioridad.

            Si dice Free explícitamente,
            también.
          */

          planDetectado =
            planServidor;
        }
      } catch (
        error
      ) {
        console.warn(
          "No se pudo comprobar /api/suscripciones:",
          error
        );
      }

      setPlan(
        planDetectado
      );
    } catch (
      error
    ) {
      console.warn(
        "No se pudo cargar el usuario:",
        error
      );
    } finally {
      setCargandoPlan(
        false
      );
    }
  }

  /* =====================================================
     INICIO
  ===================================================== */

  useEffect(() => {
    const tema =
      localStorage.getItem(
        "raccoon-theme"
      );

    const oscuro =
      tema === "dark";

    setDarkMode(
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

    void cargarUsuarioYPlan();

    /*
      Si el usuario vuelve de la página
      de suscripción, se comprueba otra vez.
    */

    const refrescar =
      () => {
        void cargarUsuarioYPlan();
      };

    window.addEventListener(
      "focus",
      refrescar
    );

    window.addEventListener(
      "raccoon-plan-changed",
      refrescar
    );

    const visibilidad =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          void cargarUsuarioYPlan();
        }
      };

    document.addEventListener(
      "visibilitychange",
      visibilidad
    );

    const {
      data:
        authListener,
    } =
      supabase.auth.onAuthStateChange(
        () => {
          void cargarUsuarioYPlan();
        }
      );

    return () => {
      window.removeEventListener(
        "focus",
        refrescar
      );

      window.removeEventListener(
        "raccoon-plan-changed",
        refrescar
      );

      document.removeEventListener(
        "visibilitychange",
        visibilidad
      );

      authListener.subscription.unsubscribe();

      audioRef.current?.pause();

      audioRef.current =
        null;
    };
  }, []);

  /* =====================================================
     SEMANA
  ===================================================== */

  useEffect(() => {
    const semanaActual =
      obtenerClaveSemana();

    const guardado =
      localStorage.getItem(
        WEEK_STORAGE_KEY
      );

    if (
      guardado
    ) {
      try {
        const progreso =
          JSON.parse(
            guardado
          ) as
            ProgresoSemanal;

        if (
          progreso.semana ===
          semanaActual
        ) {
          setSesionesSemana(
            progreso.sesiones ??
              0
          );

          setObjetivoSemanal(
            progreso.objetivo ??
              8
          );

          setMetasSemanales(
            progreso.metas ??
              []
          );
        } else {
          localStorage.setItem(
            WEEK_STORAGE_KEY,
            JSON.stringify({
              semana:
                semanaActual,

              sesiones:
                0,

              objetivo:
                8,

              metas:
                [],
            } satisfies ProgresoSemanal)
          );
        }
      } catch (
        error
      ) {
        console.warn(
          "No se pudo leer el progreso semanal:",
          error
        );
      }
    }

    setProgresoCargado(
      true
    );
  }, []);

  useEffect(() => {
    if (
      !progresoCargado
    ) {
      return;
    }

    const progreso:
      ProgresoSemanal = {
      semana:
        obtenerClaveSemana(),

      sesiones:
        sesionesSemana,

      objetivo:
        objetivoSemanal,

      metas:
        metasSemanales,
    };

    localStorage.setItem(
      WEEK_STORAGE_KEY,
      JSON.stringify(
        progreso
      )
    );
  }, [
    progresoCargado,
    sesionesSemana,
    objetivoSemanal,
    metasSemanales,
  ]);

  /* =====================================================
     JAMENDO
  ===================================================== */

  async function cargarJamendo() {
    try {
      setCargandoJamendo(
        true
      );

      setErrorJamendo(
        ""
      );

      const respuesta =
        await fetch(
          JAMENDO_API,
          {
            method:
              "GET",

            cache:
              "no-store",
          }
        );

      const datos:
        unknown =
        await respuesta
          .json()
          .catch(
            () => null
          );

      if (
        !respuesta.ok
      ) {
        throw new Error(
          obtenerMensajeError(
            datos,
            `Jamendo respondió ${respuesta.status}.`
          )
        );
      }

      const canciones =
        normalizarTracks(
          datos,
          "jamendo"
        );

      if (
        canciones.length ===
        0
      ) {
        throw new Error(
          "Jamendo no devolvió canciones reproducibles."
        );
      }

      setJamendoTracks(
        canciones
      );
    } catch (
      error
    ) {
      setJamendoTracks(
        []
      );

      setErrorJamendo(
        error instanceof
          Error
          ? error.message
          : "No se pudo cargar Jamendo."
      );
    } finally {
      setCargandoJamendo(
        false
      );
    }
  }

  useEffect(() => {
    void cargarJamendo();
  }, []);

  /* =====================================================
     DEEZER
  ===================================================== */

  async function cargarPlaylistPremium() {
    if (
      cargandoPlan
    ) {
      return;
    }

    if (
      !esPremium
    ) {
      router.push(
        "/suscripcion"
      );

      return;
    }

    try {
      setCargandoDeezer(
        true
      );

      setErrorDeezer(
        ""
      );

      const {
        data: {
          session,
        },
      } =
        await supabase.auth
          .getSession();

      if (
        !session
      ) {
        router.replace(
          "/Login"
        );

        return;
      }

      /*
        IMPORTANTE:
        Deezer recibe el token para que
        el backend compruebe Premium.
      */

      const respuesta =
        await fetch(
          DEEZER_API,
          {
            method:
              "GET",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            cache:
              "no-store",
          }
        );

      const datos:
        unknown =
        await respuesta
          .json()
          .catch(
            () => null
          );

      if (
        respuesta.status ===
        403
      ) {
        setPlan(
          "free"
        );

        throw new Error(
          "Esta playlist está disponible solamente para usuarios Premium."
        );
      }

      if (
        respuesta.status ===
        401
      ) {
        throw new Error(
          "Tu sesión expiró. Vuelve a iniciar sesión."
        );
      }

      if (
        !respuesta.ok
      ) {
        throw new Error(
          obtenerMensajeError(
            datos,
            `Deezer respondió ${respuesta.status}.`
          )
        );
      }

      const canciones =
        normalizarTracks(
          datos,
          "deezer"
        );

      if (
        canciones.length ===
        0
      ) {
        throw new Error(
          "Deezer no devolvió previews reproducibles."
        );
      }

      setDeezerTracks(
        canciones
      );

      setPlaylistPremiumCargada(
        true
      );
    } catch (
      error
    ) {
      setDeezerTracks(
        []
      );

      setPlaylistPremiumCargada(
        false
      );

      setErrorDeezer(
        error instanceof
          Error
          ? error.message
          : "No se pudo cargar Deezer."
      );
    } finally {
      setCargandoDeezer(
        false
      );
    }
  }

  /*
    Si pierde Premium mientras
    escucha Deezer, se detiene.
  */

  useEffect(() => {
    if (
      !cargandoPlan &&
      !esPremium &&
      trackActivo?.source ===
        "deezer"
    ) {
      audioRef.current?.pause();

      audioRef.current =
        null;

      setTrackActivo(
        null
      );

      setMusicaActiva(
        false
      );

      setDeezerTracks(
        []
      );

      setPlaylistPremiumCargada(
        false
      );
    }
  }, [
    esPremium,
    cargandoPlan,
    trackActivo,
  ]);

  /* =====================================================
     AUDIO
  ===================================================== */

  async function reproducirTrack(
    track: Track
  ) {
    if (
      !track.audio
    ) {
      return;
    }

    if (
      track.source ===
        "deezer" &&
      !esPremium
    ) {
      router.push(
        "/suscripcion"
      );

      return;
    }

    const actual =
      audioRef.current;

    const mismaCancion =
      trackActivo?.id ===
        track.id &&
      trackActivo?.source ===
        track.source;

    /*
      Reanudar la misma canción.
    */

    if (
      actual &&
      mismaCancion &&
      actual.paused
    ) {
      try {
        await actual.play();

        setMusicaActiva(
          true
        );
      } catch {
        // Error manejado abajo al reproducir una nueva instancia.
      }

      return;
    }

    /*
      Pausar la misma.
    */

    if (
      actual &&
      mismaCancion &&
      !actual.paused
    ) {
      actual.pause();

      setMusicaActiva(
        false
      );

      return;
    }

    /*
      Detener cualquier canción anterior.
    */

    if (
      actual
    ) {
      actual.pause();

      actual.src =
        "";
    }

    const nuevoAudio =
      new Audio(
        track.audio
      );

    nuevoAudio.volume =
      volumen;

    /*
      Jamendo puede mantenerse como
      música ambiental continua.
      Deezer son previews.
    */

    nuevoAudio.loop =
      track.source ===
      "jamendo";

    nuevoAudio.onended =
      () => {
        setMusicaActiva(
          false
        );
      };

    nuevoAudio.onerror =
      () => {
        setMusicaActiva(
          false
        );

        if (
          track.source ===
          "deezer"
        ) {
          setErrorDeezer(
            "No se pudo reproducir esta preview de Deezer."
          );
        } else {
          setErrorJamendo(
            "No se pudo reproducir esta canción de Jamendo."
          );
        }
      };

    try {
      audioRef.current =
        nuevoAudio;

      setTrackActivo(
        track
      );

      await nuevoAudio.play();

      setMusicaActiva(
        true
      );
    } catch (
      error
    ) {
      console.warn(
        "Audio:",
        error
      );

      setMusicaActiva(
        false
      );

      if (
        track.source ===
        "deezer"
      ) {
        setErrorDeezer(
          "El navegador bloqueó esta preview de Deezer."
        );
      } else {
        setErrorJamendo(
          "El navegador bloqueó esta canción de Jamendo."
        );
      }
    }
  }

  function pausarMusica() {
    audioRef.current?.pause();

    setMusicaActiva(
      false
    );
  }

  function alternarTrack(
    track: Track
  ) {
    void reproducirTrack(
      track
    );
  }

  function cambiarVolumen(
    nuevoVolumen: number
  ) {
    const limitado =
      Math.max(
        0,
        Math.min(
          1,
          nuevoVolumen
        )
      );

    setVolumen(
      limitado
    );

    if (
      audioRef.current
    ) {
      audioRef.current.volume =
        limitado;
    }
  }

  /* =====================================================
     POMODORO
  ===================================================== */

  function registrarSesionCompletada() {
    setSesionesCompletadas(
      (actual) =>
        actual + 1
    );

    setSesionesSemana(
      (actual) =>
        actual + 1
    );

    const mensaje =
      MENSAJES_FELICITACION[
        Math.floor(
          Math.random() *
            MENSAJES_FELICITACION.length
        )
      ];

    setMensajeFelicitacion(
      mensaje
    );

    setMostrarFelicitacion(
      true
    );
  }

  function cambiarAutomaticamente() {
    if (
      fase === "focus"
    ) {
      registrarSesionCompletada();

      setFase(
        "shortBreak"
      );

      setSegundosRestantes(
        shortBreakMinutes *
          60
      );

      setActivo(
        false
      );

      return;
    }

    if (
      fase ===
      "shortBreak"
    ) {
      if (
        ciclo < 4
      ) {
        setCiclo(
          (actual) =>
            actual + 1
        );

        setFase(
          "focus"
        );

        setSegundosRestantes(
          focusMinutes *
            60
        );

        setActivo(
          true
        );
      } else {
        setFase(
          "longBreak"
        );

        setSegundosRestantes(
          longBreakMinutes *
            60
        );

        setActivo(
          true
        );
      }

      return;
    }

    setCiclo(1);

    setFase(
      "focus"
    );

    setSegundosRestantes(
      focusMinutes *
        60
    );

    setActivo(
      true
    );
  }

  useEffect(() => {
    if (
      !activo
    ) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          if (
            segundosRestantes <=
            1
          ) {
            cambiarAutomaticamente();

            return;
          }

          setSegundosRestantes(
            (actual) =>
              Math.max(
                0,
                actual - 1
              )
          );
        },
        1000
      );

    return () => {
      window.clearTimeout(
        timeout
      );
    };
  }, [
    activo,
    segundosRestantes,
    fase,
    ciclo,
    focusMinutes,
    shortBreakMinutes,
    longBreakMinutes,
  ]);

  function reiniciarPomodoro() {
    setActivo(
      false
    );

    setFase(
      "focus"
    );

    setCiclo(1);

    setSegundosRestantes(
      focusMinutes *
        60
    );
  }

  function aplicarConfiguracion() {
    const enfoque =
      Math.max(
        1,
        Math.min(
          120,
          focusMinutes ||
            25
        )
      );

    const descanso =
      Math.max(
        1,
        Math.min(
          60,
          shortBreakMinutes ||
            5
        )
      );

    const largo =
      Math.max(
        5,
        Math.min(
          60,
          longBreakMinutes ||
            20
        )
      );

    setFocusMinutes(
      enfoque
    );

    setShortBreakMinutes(
      descanso
    );

    setLongBreakMinutes(
      largo
    );

    setActivo(
      false
    );

    setFase(
      "focus"
    );

    setCiclo(1);

    setSegundosRestantes(
      enfoque * 60
    );

    setMostrarConfiguracion(
      false
    );
  }

  /* =====================================================
     METAS
  ===================================================== */

  function agregarMeta() {
    const texto =
      nuevaMeta.trim();

    if (!texto) {
      return;
    }

    setMetasSemanales(
      (actuales) => [
        ...actuales,

        {
          id:
            `${Date.now()}-${Math.random()}`,

          texto,

          completada:
            false,
        },
      ]
    );

    setNuevaMeta("");
  }

  function alternarMeta(
    id: string
  ) {
    setMetasSemanales(
      (actuales) =>
        actuales.map(
          (meta) =>
            meta.id ===
            id
              ? {
                  ...meta,

                  completada:
                    !meta.completada,
                }
              : meta
        )
    );
  }

  function eliminarMeta(
    id: string
  ) {
    setMetasSemanales(
      (actuales) =>
        actuales.filter(
          (meta) =>
            meta.id !== id
        )
    );
  }

  /* =====================================================
     TEMA
  ===================================================== */

  function cambiarModo() {
    const nuevoModo =
      !darkMode;

    setDarkMode(
      nuevoModo
    );

    document.documentElement.classList.toggle(
      "dark",
      nuevoModo
    );

    document.documentElement.style.colorScheme =
      nuevoModo
        ? "dark"
        : "light";

    localStorage.setItem(
      "raccoon-theme",
      nuevoModo
        ? "dark"
        : "light"
    );
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  async function cerrarSesion() {
    audioRef.current?.pause();

    await supabase.auth
      .signOut();

    router.replace(
      "/Login"
    );
  }

  /* =====================================================
     RENDER TRACK
  ===================================================== */

  function renderTrack(
    track: Track
  ) {
    const reproduciendo =
      trackActivo?.source ===
        track.source &&
      trackActivo?.id ===
        track.id &&
      musicaActiva;

    return (
      <button
        key={`${track.source}-${track.id}`}
        type="button"
        onClick={() =>
          alternarTrack(
            track
          )
        }
        className={`
          flex w-full min-w-0
          items-center gap-3
          rounded-2xl border
          px-3 py-3 text-left
          transition
          hover:-translate-y-[1px]
          ${
            track.source ===
            "deezer"
              ? reproduciendo
                ? "border-[#7650DC] bg-white shadow-sm dark:bg-slate-800"
                : "border-white/70 bg-white/85 hover:bg-white dark:border-slate-700 dark:bg-slate-800/90"
              : reproduciendo
                ? "border-[#55A8E8] bg-[#F3FAFF] dark:bg-slate-800"
                : "border-[#E2EAF3] hover:border-[#BFD9F1] hover:bg-[#F8FBFF] dark:border-slate-700 dark:hover:bg-slate-800"
          }
        `}
      >
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#EAF4FF]">
          {track.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                track.image
              }
              alt={`Portada de ${track.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(
                evento
              ) => {
                evento.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music2
                size={20}
                className={
                  track.source ===
                  "deezer"
                    ? "text-[#7650DC]"
                    : "text-[#55A8E8]"
                }
              />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-[#14213D] dark:text-white sm:text-base">
            {track.name}
          </p>

          <p className="mt-0.5 truncate text-xs text-[#5D7A9D] dark:text-slate-400">
            {track.artist_name}
          </p>
        </div>

        <div
          className={`
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-full
            ${
              track.source ===
              "deezer"
                ? "text-[#7650DC]"
                : "text-[#14213D] dark:text-white"
            }
          `}
        >
          {reproduciendo ? (
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
        </div>
      </button>
    );
  }

  /* =====================================================
     JSX
  ===================================================== */

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F8FBFF] text-[#13213A] transition-colors dark:bg-[#101927] dark:text-white">
      {/* OVERLAY MÓVIL */}

      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() =>
            setMenuAbierto(
              false
            )
          }
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[250px]
          flex-col
          border-r border-[#DDEAF7]
          bg-white
          transition-transform duration-300
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
        <div className="flex items-center justify-between px-5 py-5">
          <Link
            href="/Dashboard"
            className="flex items-center gap-3"
          >
            <Image
              src="/raccoon.png"
              alt="Raccoon Study"
              width={55}
              height={55}
              className="h-12 w-12 object-contain"
              priority
            />

            <div>
              <h1 className="text-[17px] font-black">
                Raccoon{" "}
                <span className="text-[#55A8E8]">
                  Study
                </span>
              </h1>

              <p className="text-[10px] text-[#8294AA]">
                Estudia mejor
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() =>
              setMenuAbierto(
                false
              )
            }
            className="rounded-lg p-2 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1.5 overflow-y-auto px-3">
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
            type="button"
            onClick={
              cambiarModo
            }
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#253650] transition hover:bg-[#F0F8FF] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span className="text-lg">
              {darkMode
                ? "☀️"
                : "🌙"}
            </span>

            {darkMode
              ? "Modo claro"
              : "Modo oscuro"}
          </button>

          <button
            type="button"
            onClick={() =>
              void cerrarSesion()
            }
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>

          <Link
            href="/suscripcion"
            className={`
              relative block
              overflow-hidden rounded-2xl
              p-4 text-white
              shadow-lg transition
              hover:-translate-y-1
              ${
                esPremium
                  ? "bg-gradient-to-br from-[#F5B942] via-[#8A6CEC] to-[#6955D8]"
                  : "bg-gradient-to-br from-[#64C7F2] via-[#55A8E8] to-[#7771E8]"
              }
            `}
          >
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/20" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Crown size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black">
                  {esPremium
                    ? "Premium activo"
                    : "Raccoon Premium"}
                </p>

                <p className="mt-1 truncate text-[11px] text-white/80">
                  {cargandoPlan
                    ? "Comprobando plan..."
                    : nombrePlan(
                        plan
                      )}
                </p>
              </div>
            </div>

            <div className="relative mt-3 flex items-center gap-1 text-xs font-bold">
              <Sparkles size={13} />

              {esPremium
                ? "Disfruta tus beneficios"
                : "Descubrir Premium"}

              <ArrowRight size={13} />
            </div>
          </Link>
        </div>
      </aside>

      {/* =================================================
          CONTENIDO
      ================================================= */}

      <div className="min-w-0 lg:ml-[250px]">
        {/* HEADER */}

        <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between border-b border-[#E4EDF7] bg-white/95 px-3 py-3 backdrop-blur dark:border-slate-700 dark:bg-[#151F30]/95 sm:px-5 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMenuAbierto(
                  true
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-[#F0F8FF] lg:hidden"
            >
              <Menu size={24} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black sm:text-xl md:text-2xl">
                Pomodoro
              </h1>

              <p className="hidden text-xs text-[#7690AB] sm:block">
                Hola, {nombreUsuario}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div
              className={`
                hidden rounded-full
                px-3 py-2
                text-xs font-black
                sm:block
                ${
                  cargandoPlan
                    ? "bg-[#F1F6FC] text-[#52709B] dark:bg-slate-800"
                    : esPremium
                      ? "bg-[#F3ECFF] text-[#7650DC] dark:bg-[#302B58]"
                      : "bg-[#EAF9F0] text-[#159447] dark:bg-green-950/30"
                }
              `}
            >
              {cargandoPlan
                ? "Comprobando..."
                : esPremium
                  ? "Premium activo ✨"
                  : "Plan gratuito"}
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                fotoPerfil
              }
              alt={
                nombreUsuario
              }
              className="h-10 w-10 rounded-full border-2 border-[#E5EAF5] object-cover"
              onError={(
                evento
              ) => {
                evento.currentTarget.src =
                  "/raccoon.png";
              }}
            />
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px] space-y-5 p-3 sm:p-5 md:space-y-6 md:p-6 2xl:p-8">
          {/* VOLVER */}

          <Link
            href="/metodos"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-[#52709B] shadow-sm transition hover:-translate-x-1 hover:bg-[#EAF7FF] hover:text-[#1687D9] dark:bg-[#182437] dark:text-slate-300 dark:hover:bg-slate-700 sm:px-4 sm:text-sm"
          >
            <ArrowLeft size={18} />

            Volver a métodos de estudio
          </Link>

          {/* =================================================
              BANNER
          ================================================= */}

          <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#E8F8FF] via-[#F4F1FF] to-[#EAF4FF] p-5 shadow-sm dark:from-[#1B3850] dark:via-[#29264B] dark:to-[#1D3558] sm:p-6 md:rounded-[28px] md:p-8">
            <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#55A8E8]/10" />

            <div className="relative grid items-center gap-5 2xl:grid-cols-[1fr_0.9fr]">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-[#7771E8] dark:bg-white/10 sm:px-4 sm:text-sm">
                  <Sparkles size={16} />
                  Concentración efectiva
                </div>

                <h2 className="text-3xl font-black text-[#13213A] dark:text-white sm:text-4xl md:text-5xl">
                  Pomodoro
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#49627F] dark:text-slate-300 md:text-base">
                  Bloques de estudio y descanso para mantener tu concentración al máximo.
                </p>

                <div className="mt-5 grid max-w-xl gap-3 text-sm font-semibold text-[#334B68] dark:text-slate-200 sm:grid-cols-3 2xl:grid-cols-1">
                  <div className="flex items-center gap-3">
                    <Clock3
                      size={21}
                      className="shrink-0 text-[#FF6470]"
                    />

                    {focusMinutes} min. enfoque
                  </div>

                  <div className="flex items-center gap-3">
                    <Coffee
                      size={21}
                      className="shrink-0 text-[#55A8E8]"
                    />

                    {shortBreakMinutes} min. descanso
                  </div>

                  <div className="flex items-center gap-3">
                    <Timer
                      size={21}
                      className="shrink-0 text-[#7771E8]"
                    />

                    4 ciclos
                  </div>
                </div>
              </div>

              <div className="flex justify-center 2xl:justify-end">
                <Image
                  src="/pomodoro.png"
                  alt="Raccoon estudiando"
                  width={480}
                  height={480}
                  className="h-auto w-full max-w-[300px] object-contain drop-shadow-xl sm:max-w-[380px] 2xl:max-w-[430px]"
                />
              </div>
            </div>
          </section>

          {/* =================================================
              CRONÓMETRO + VIDEO
          ================================================= */}

          <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {/* TIMER */}

            <section className="min-w-0 rounded-[24px] bg-white p-4 shadow-sm dark:bg-[#182437] sm:p-5 md:rounded-[28px] md:p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black md:text-xl">
                  Sesión Pomodoro
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarConfiguracion(
                      !mostrarConfiguracion
                    )
                  }
                  className="shrink-0 rounded-xl bg-[#F2F7FC] p-2.5 text-[#52709B] transition hover:bg-[#E4F3FF] dark:bg-slate-700"
                >
                  <Settings2 size={20} />
                </button>
              </div>

              {mostrarConfiguracion && (
                <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#EFF9FF] to-[#F4F0FF] p-4 dark:from-slate-800 dark:to-slate-700">
                  <h3 className="font-black">
                    Personalizar cronómetro
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label className="text-xs font-bold">
                      Enfoque

                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={
                          focusMinutes
                        }
                        onChange={(
                          evento
                        ) =>
                          setFocusMinutes(
                            Number(
                              evento.target.value
                            )
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-[#D9E7F4] bg-white px-3 py-2 text-sm outline-none dark:bg-slate-800"
                      />
                    </label>

                    <label className="text-xs font-bold">
                      Descanso

                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={
                          shortBreakMinutes
                        }
                        onChange={(
                          evento
                        ) =>
                          setShortBreakMinutes(
                            Number(
                              evento.target.value
                            )
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-[#D9E7F4] bg-white px-3 py-2 text-sm outline-none dark:bg-slate-800"
                      />
                    </label>

                    <label className="text-xs font-bold">
                      Largo

                      <input
                        type="number"
                        min={5}
                        max={60}
                        value={
                          longBreakMinutes
                        }
                        onChange={(
                          evento
                        ) =>
                          setLongBreakMinutes(
                            Number(
                              evento.target.value
                            )
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-[#D9E7F4] bg-white px-3 py-2 text-sm outline-none dark:bg-slate-800"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={
                      aplicarConfiguracion
                    }
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] py-3 font-bold text-white"
                  >
                    Guardar configuración
                  </button>
                </div>
              )}

              {/* CÍRCULO RESPONSIVE */}

              <div className="mt-7 flex justify-center">
                <div
                  className="relative flex aspect-square w-[min(74vw,285px)] items-center justify-center rounded-full sm:w-[285px]"
                  style={{
                    background:
                      `conic-gradient(${faseColor} ${porcentaje}%, #EAF0F6 ${porcentaje}% 100%)`,
                  }}
                >
                  <div className="flex h-[88%] w-[88%] flex-col items-center justify-center rounded-full bg-white dark:bg-[#182437]">
                    <span className="text-[clamp(2.8rem,7vw,4.5rem)] font-black tracking-tight">
                      {minutos}:{segundos}
                    </span>

                    <span
                      className="mt-2 text-sm font-black sm:text-lg"
                      style={{
                        color:
                          faseColor,
                      }}
                    >
                      {faseTexto}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold sm:text-base">
                <Sparkles
                  size={18}
                  className="text-[#7771E8]"
                />

                Ciclo {ciclo} de 4
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActivo(
                      !activo
                    )
                  }
                  className="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] px-5 py-3 font-black text-white shadow-lg shadow-[#55A8E8]/20 transition hover:-translate-y-0.5 sm:max-w-[210px]"
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
                  type="button"
                  onClick={
                    reiniciarPomodoro
                  }
                  className="rounded-xl bg-[#F1F5FA] px-4 py-3 text-[#52709B] transition hover:bg-[#E6F1FA] dark:bg-slate-700"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              <p className="mt-7 text-center text-sm font-black">
                Bloques completados:{" "}
                {sesionesCompletadas}
              </p>
            </section>

            {/* VIDEO */}

            <section className="min-w-0 rounded-[24px] bg-white p-4 shadow-sm dark:bg-[#182437] sm:p-5 md:rounded-[28px] md:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black sm:text-xl">
                    Aprende Pomodoro
                  </h2>

                  <p className="mt-2 text-sm text-[#52709B] dark:text-slate-400">
                    Mira cómo funciona el método y mejora tu concentración.
                  </p>
                </div>

                <CircleHelp
                  size={25}
                  className="shrink-0 text-[#7771E8]"
                />
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl bg-[#EAF4FF] dark:bg-slate-800">
                {mostrarVideo ? (
                  <div className="aspect-video w-full">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${VIDEO_ID}`}
                      title="Cómo funciona Pomodoro"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video min-h-[220px] flex-col items-center justify-center bg-gradient-to-br from-[#DDF5FF] via-[#F2EDFF] to-[#E6F1FF] p-5 text-center dark:from-[#1D3558] dark:via-[#29243F] dark:to-[#1B3850]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#7771E8] shadow-lg dark:bg-slate-800 sm:h-20 sm:w-20">
                      <Play
                        size={32}
                        fill="currentColor"
                      />
                    </div>

                    <h3 className="mt-5 text-lg font-black sm:text-xl">
                      ¿Cómo funciona Pomodoro?
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarVideo(
                          true
                        )
                      }
                      className="mt-5 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] px-6 py-3 font-bold text-white"
                    >
                      Ver video
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Dato
                  valor={
                    focusMinutes
                  }
                  texto="Min. enfoque"
                  clase="bg-[#FFF0F2] text-[#FF6470]"
                />

                <Dato
                  valor={
                    shortBreakMinutes
                  }
                  texto="Min. descanso"
                  clase="bg-[#EAF7FF] text-[#55A8E8]"
                />

                <Dato
                  valor={4}
                  texto="Ciclos"
                  clase="bg-[#F1EDFF] text-[#7771E8]"
                />

                <Dato
                  valor={
                    longBreakMinutes
                  }
                  texto="Min. largo"
                  clase="bg-[#E9FAF2] text-[#26A66B]"
                />
              </div>
            </section>
          </div>

          {/* =================================================
              METAS
          ================================================= */}

          <section className="rounded-[24px] bg-white p-4 shadow-sm dark:bg-[#182437] sm:p-5 md:rounded-[28px] md:p-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Target
                    size={27}
                    className="text-[#55A8E8]"
                  />

                  <h2 className="text-xl font-black sm:text-2xl">
                    Metas de la semana
                  </h2>
                </div>

                <p className="mt-2 max-w-2xl text-sm text-[#52709B] dark:text-slate-400">
                  Cada Pomodoro suma a tu progreso semanal.
                </p>
              </div>

              <div className="w-full rounded-2xl bg-gradient-to-r from-[#EAF7FF] to-[#F1EDFF] p-4 dark:from-[#1D3558] dark:to-[#29243F] sm:w-auto sm:min-w-[240px]">
                <p className="text-xs font-bold uppercase tracking-wide text-[#52709B] dark:text-slate-400">
                  Pomodoros esta semana
                </p>

                <div className="mt-1 flex items-center justify-between gap-4">
                  <p className="text-2xl font-black">
                    {sesionesSemana} /{" "}
                    {objetivoSemanal}
                  </p>

                  <Trophy
                    size={28}
                    className="text-[#7771E8]"
                  />
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/80 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#55A8E8] to-[#7771E8] transition-all"
                    style={{
                      width:
                        `${Math.min(
                          100,
                          objetivoSemanal >
                            0
                            ? (sesionesSemana /
                                objetivoSemanal) *
                                100
                            : 0
                        )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid min-w-0 gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
              <label className="rounded-2xl border border-[#E4EDF7] p-4 dark:border-slate-700">
                <span className="text-sm font-black">
                  Objetivo
                </span>

                <input
                  type="number"
                  min={1}
                  max={50}
                  value={
                    objetivoSemanal
                  }
                  onChange={(
                    evento
                  ) =>
                    setObjetivoSemanal(
                      Math.max(
                        1,
                        Math.min(
                          50,
                          Number(
                            evento.target.value
                          ) ||
                            1
                        )
                      )
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-[#D9E7F4] bg-[#F8FBFF] px-4 py-3 font-bold outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </label>

              <div className="min-w-0 rounded-2xl border border-[#E4EDF7] p-4 dark:border-slate-700">
                <p className="text-sm font-black">
                  ¿Qué quieres completar?
                </p>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={
                      nuevaMeta
                    }
                    onChange={(
                      evento
                    ) =>
                      setNuevaMeta(
                        evento.target.value
                      )
                    }
                    onKeyDown={(
                      evento
                    ) => {
                      if (
                        evento.key ===
                        "Enter"
                      ) {
                        agregarMeta();
                      }
                    }}
                    placeholder="Ej. Terminar el capítulo 4 de Física"
                    className="min-w-0 flex-1 rounded-xl border border-[#D9E7F4] bg-[#F8FBFF] px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                  />

                  <button
                    type="button"
                    onClick={
                      agregarMeta
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] px-5 py-3 font-black text-white"
                  >
                    <Plus size={18} />
                    Guardar
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {metasSemanales.length ===
                  0 ? (
                    <div className="rounded-xl bg-[#F8FBFF] px-4 py-4 text-sm text-[#6E84A3] dark:bg-slate-800 dark:text-slate-400">
                      Aún no tienes metas guardadas.
                    </div>
                  ) : (
                    metasSemanales.map(
                      (meta) => (
                        <div
                          key={
                            meta.id
                          }
                          className="flex min-w-0 items-center gap-3 rounded-xl bg-[#F8FBFF] px-3 py-3 dark:bg-slate-800"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              alternarMeta(
                                meta.id
                              )
                            }
                            className={`
                              flex h-8 w-8 shrink-0
                              items-center justify-center
                              rounded-full border
                              ${
                                meta.completada
                                  ? "border-[#26A66B] bg-[#26A66B] text-white"
                                  : "border-[#CFE0EF] bg-white text-[#8AA0B8] dark:bg-slate-700"
                              }
                            `}
                          >
                            <CheckCircle2 size={18} />
                          </button>

                          <p
                            className={`
                              min-w-0 flex-1
                              break-words text-sm
                              font-semibold
                              ${
                                meta.completada
                                  ? "text-[#7C91A8] line-through"
                                  : "text-[#334B68] dark:text-slate-200"
                              }
                            `}
                          >
                            {meta.texto}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              eliminarMeta(
                                meta.id
                              )
                            }
                            className="shrink-0 rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              MÚSICA
          ================================================= */}

          <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black md:text-3xl">
                  Música para estudiar
                </h2>

                <p className="mt-1 text-sm text-[#52709B] dark:text-slate-400">
                  Jamendo está disponible para todos. Deezer se desbloquea con Premium.
                </p>
              </div>

              <div
                className={`
                  inline-flex w-fit
                  items-center gap-2
                  rounded-full px-4 py-2
                  text-xs font-black sm:text-sm
                  ${
                    cargandoPlan
                      ? "bg-[#F1F6FC] text-[#52709B] dark:bg-slate-800"
                      : esPremium
                        ? "bg-[#F0E9FF] text-[#7650DC]"
                        : "bg-[#EAF9F0] text-[#159447]"
                  }
                `}
              >
                {cargandoPlan ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : esPremium ? (
                  <Crown size={16} />
                ) : (
                  <Music2 size={16} />
                )}

                {cargandoPlan
                  ? "Comprobando plan"
                  : esPremium
                    ? `${nombrePlan(plan)} detectado`
                    : "Plan Gratis detectado"}
              </div>
            </div>

            <div className="grid min-w-0 gap-5 2xl:grid-cols-2">
              {/* JAMENDO */}

              <div className="min-w-0 rounded-[24px] border border-[#E2EAF3] bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#182437] sm:p-5 md:rounded-[28px] md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black sm:text-2xl">
                      Música
                    </h3>

                    <p className="mt-0.5 text-sm font-black text-[#16A34A]">
                      Gratis · Jamendo
                    </p>
                  </div>

                  <Headphones
                    size={28}
                    className="text-[#48A7FF]"
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-[#DFE8F2] bg-white p-2.5 dark:border-slate-700 dark:bg-[#151F30] sm:p-3">
                  {cargandoJamendo ? (
                    <EstadoCarga
                      texto="Cargando Jamendo..."
                    />
                  ) : errorJamendo ? (
                    <EstadoError
                      mensaje={
                        errorJamendo
                      }
                      onRetry={() =>
                        void cargarJamendo()
                      }
                    />
                  ) : (
                    <div className="max-h-[360px] space-y-2.5 overflow-y-auto pr-1">
                      {jamendoTracks.map(
                        renderTrack
                      )}
                    </div>
                  )}
                </div>

                <ControlVolumen
                  volumen={
                    volumen
                  }
                  onChange={
                    cambiarVolumen
                  }
                />
              </div>

              {/* DEEZER */}

              <div className="min-w-0 rounded-[24px] bg-gradient-to-br from-[#F3EEFF] via-[#F0F0FF] to-[#EAF7FF] p-4 dark:from-[#29243F] dark:via-[#242845] dark:to-[#1D3558] sm:p-5 md:rounded-[28px] md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black sm:text-2xl">
                      Playlist
                    </h3>

                    <p className="mt-0.5 text-sm font-black text-[#7A4CE0]">
                      Premium · Deezer
                    </p>
                  </div>

                  <Music2 size={27} />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void cargarPlaylistPremium()
                  }
                  disabled={
                    cargandoDeezer ||
                    cargandoPlan
                  }
                  className={`
                    mt-6 flex w-full
                    items-center justify-center
                    gap-2 rounded-xl
                    px-5 py-4
                    font-black text-white
                    shadow-sm transition
                    disabled:cursor-wait
                    disabled:opacity-60
                    ${
                      esPremium
                        ? "bg-[#7650DC] hover:bg-[#6742CE]"
                        : "bg-[#8D85A9] hover:bg-[#7D7698]"
                    }
                  `}
                >
                  {cargandoPlan ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />

                      Comprobando plan...
                    </>
                  ) : cargandoDeezer ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />

                      Cargando playlist...
                    </>
                  ) : esPremium ? (
                    <>
                      <Music2 size={18} />

                      {playlistPremiumCargada
                        ? "Recargar playlist"
                        : "Cargar playlist Premium"}
                    </>
                  ) : (
                    <>
                      <Lock size={17} />

                      Desbloquear con Premium
                    </>
                  )}
                </button>

                {!cargandoPlan &&
                  !esPremium && (
                    <div className="mt-4 rounded-xl bg-white/60 p-4 text-center dark:bg-slate-900/20">
                      <Lock
                        size={25}
                        className="mx-auto text-[#7650DC]"
                      />

                      <p className="mt-2 text-sm font-black text-[#5F5689] dark:text-slate-200">
                        Playlist exclusiva de Premium
                      </p>

                      <Link
                        href="/suscripcion"
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#7650DC] px-4 py-2.5 text-xs font-black text-white"
                      >
                        <Crown size={15} />
                        Ver Premium
                      </Link>
                    </div>
                  )}

                {esPremium &&
                  errorDeezer && (
                    <EstadoError
                      mensaje={
                        errorDeezer
                      }
                      onRetry={() =>
                        void cargarPlaylistPremium()
                      }
                    />
                  )}

                {esPremium &&
                  playlistPremiumCargada &&
                  deezerTracks.length >
                    0 && (
                    <div className="mt-5 max-h-[360px] space-y-2.5 overflow-y-auto pr-1">
                      {deezerTracks.map(
                        renderTrack
                      )}
                    </div>
                  )}

                {esPremium &&
                  playlistPremiumCargada &&
                  deezerTracks.length >
                    0 && (
                    <ControlVolumen
                      volumen={
                        volumen
                      }
                      onChange={
                        cambiarVolumen
                      }
                    />
                  )}
              </div>
            </div>
          </section>

          {/* CONSEJO */}

          <section className="rounded-2xl bg-gradient-to-r from-[#F2F0FF] to-[#EAF5FF] px-4 py-4 dark:from-[#29243F] dark:to-[#1D3558] sm:px-5">
            <div className="flex items-start gap-3">
              <Sparkles
                size={21}
                className="mt-0.5 shrink-0 text-[#7771E8]"
              />

              <p className="text-sm leading-6">
                <strong>
                  Consejo:
                </strong>{" "}
                concéntrate en una tarea a la vez y evita distracciones para aprovechar cada Pomodoro.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* =================================================
          FELICITACIÓN
      ================================================= */}

      {mostrarFelicitacion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07111F]/55 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white p-5 text-center shadow-2xl dark:bg-[#182437] sm:p-7">
            <span className="absolute left-6 top-5 text-2xl">
              ✨
            </span>

            <span className="absolute right-7 top-8 text-2xl">
              🎉
            </span>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#55A8E8] to-[#7771E8] text-white shadow-lg">
              <PartyPopper size={38} />
            </div>

            <p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-[#7771E8]">
              ¡Sesión completada!
            </p>

            <h3 className="mt-2 text-2xl font-black sm:text-3xl">
              ¡Felicidades! 🦝
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#52709B] dark:text-slate-300">
              {mensajeFelicitacion}
            </p>

            <div className="mt-5 rounded-2xl bg-[#F4F8FD] p-4 dark:bg-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-[#7C91A8]">
                Progreso semanal
              </p>

              <p className="mt-1 text-xl font-black">
                {sesionesSemana} de{" "}
                {objetivoSemanal} Pomodoros
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMostrarFelicitacion(
                  false
                );

                setActivo(
                  true
                );
              }}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] py-3.5 font-black text-white"
            >
              Tomar mi descanso ☕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* =====================================================
   COMPONENTES LOCALES
===================================================== */

function Dato({
  valor,
  texto,
  clase,
}: {
  valor: number;
  texto: string;
  clase: string;
}) {
  return (
    <div
      className={`rounded-2xl p-3 text-center sm:p-4 ${clase}`}
    >
      <p className="text-2xl font-black">
        {valor}
      </p>

      <p className="mt-1 text-[11px] font-bold opacity-80 sm:text-xs">
        {texto}
      </p>
    </div>
  );
}

function EstadoCarga({
  texto,
}: {
  texto: string;
}) {
  return (
    <div className="flex h-[300px] items-center justify-center text-center">
      <div>
        <LoaderCircle
          size={34}
          className="mx-auto animate-spin text-[#48A7FF]"
        />

        <p className="mt-3 text-sm font-bold text-[#52709B] dark:text-slate-300">
          {texto}
        </p>
      </div>
    </div>
  );
}

function EstadoError({
  mensaje,
  onRetry,
}: {
  mensaje: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900/50 dark:bg-red-950/20">
      <p className="break-words text-sm font-bold text-red-500">
        {mensaje}
      </p>

      <button
        type="button"
        onClick={
          onRetry
        }
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-black text-white"
      >
        <RotateCcw size={15} />
        Reintentar
      </button>
    </div>
  );
}

function ControlVolumen({
  volumen,
  onChange,
}: {
  volumen: number;
  onChange: (
    valor: number
  ) => void;
}) {
  return (
    <div className="mt-5 flex items-center gap-3">
      <Volume2
        size={19}
        className="shrink-0"
      />

      <input
        aria-label="Volumen de la música"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volumen}
        onChange={(
          evento
        ) =>
          onChange(
            Number(
              evento.target.value
            )
          )
        }
        className="min-w-0 flex-1 accent-[#1687D9]"
      />
    </div>
  );
}