"use client";

import type {
  ChangeEvent,
  ReactNode,
} from "react";

import type {
  LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  AtSign,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpenCheck,
  Brain,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Crown,
  Edit3,
  FileText,
  Flame,
  Globe2,
  Home,
  Languages,
  Library,
  LoaderCircle,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Timer,
  Trophy,
  User,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import { supabase } from "../lib/supabase";

/* =====================================================
   TIPOS
===================================================== */

type PlanType =
  | "free"
  | "month"
  | "year";

type IdiomaType =
  | "Español"
  | "English";

interface UsuarioPerfil {
  nombre: string;
  correo: string;
  username: string;
}

interface AjustesUsuario {
  idioma: IdiomaType;
  zona_horaria: string;
  objetivo_semanal_minutos: number;
  notificaciones: boolean;
}

interface EstadisticasPerfil {
  total_segundos: number;
  segundos_semana: number;
  segundos_por_dia: number[];
  fechas_actividad: string[];

  materiales: number;
  materiales_completados: number;

  quizzes_completados: number;
  precision_promedio: number;

  resumenes: number;

  mazos_revisados: number;
  tarjetas_dominadas: number;
}

interface ElementoMenu {
  nombre: string;
  href: string;
  icono: LucideIcon;
  activo?: boolean;
}

interface EventoActividad {
  fecha: string;
  duracion_segundos: number;
}

interface Logro {
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  desbloqueado: boolean;
  progreso: number;
}

/* =====================================================
   CONSTANTES
===================================================== */

const elementosMenu: ElementoMenu[] = [
  {
    nombre: "Inicio",
    href: "/Dashboard",
    icono: Home,
  },
  {
    nombre: "Métodos de estudio",
    href: "/metodos",
    icono: Brain,
  },
  {
    nombre: "Quizzes",
    href: "/quizzes",
    icono: ClipboardCheck,
  },
  {
    nombre: "Biblioteca",
    href: "/biblioteca",
    icono: Library,
  },
  {
    nombre: "Perfil",
    href: "/perfil",
    icono: User,
    activo: true,
  },
  {
    nombre: "Lugares",
    href: "/lugares",
    icono: MapPin,
  },
];

const diasSemana = [
  "L",
  "M",
  "X",
  "J",
  "V",
  "S",
  "D",
];

const zonasHorarias = [
  {
    valor: "America/Panama",
    nombre: "Panamá · GMT-5",
  },
  {
    valor: "America/Bogota",
    nombre: "Bogotá · GMT-5",
  },
  {
    valor: "America/Mexico_City",
    nombre: "Ciudad de México",
  },
  {
    valor: "America/New_York",
    nombre: "Nueva York",
  },
  {
    valor: "America/Los_Angeles",
    nombre: "Los Ángeles",
  },
  {
    valor: "Europe/Madrid",
    nombre: "Madrid",
  },
];

const metasSemanales = [
  {
    minutos: 120,
    nombre: "2 horas",
    descripcion: "Meta ligera",
  },
  {
    minutos: 300,
    nombre: "5 horas",
    descripcion: "Meta recomendada",
  },
  {
    minutos: 600,
    nombre: "10 horas",
    descripcion: "Meta intensiva",
  },
  {
    minutos: 900,
    nombre: "15 horas",
    descripcion: "Meta avanzada",
  },
];

/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */

function esObjeto(
  valor: unknown
): valor is Record<string, unknown> {
  return (
    typeof valor === "object" &&
    valor !== null
  );
}

function numeroSeguro(
  valor: unknown,
  respaldo = 0
): number {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : respaldo;
}

function normalizarPlan(
  valor: unknown,
  premium = false
): PlanType {
  const texto = String(valor || "")
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
    texto === "premium_month" ||
    texto === "premium_mensual"
  ) {
    return "month";
  }

  return premium
    ? "month"
    : "free";
}

function nombrePlan(
  plan: PlanType
): string {
  if (plan === "year") {
    return "Premium anual";
  }

  if (plan === "month") {
    return "Premium mensual";
  }

  return "Plan gratuito";
}

function claveFechaLocal(
  fecha: Date
): string {
  const año =
    fecha.getFullYear();

  const mes = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    fecha.getDate()
  ).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
}

function fechaSinHora(
  fecha: Date
): Date {
  return new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate()
  );
}

function obtenerInicioSemana(
  fecha: Date
): Date {
  const resultado =
    fechaSinHora(fecha);

  const dia =
    resultado.getDay();

  const diferencia =
    dia === 0
      ? -6
      : 1 - dia;

  resultado.setDate(
    resultado.getDate() +
      diferencia
  );

  return resultado;
}

function indiceSemana(
  fecha: Date,
  inicioSemana: Date
): number {
  return Math.floor(
    (
      fechaSinHora(fecha).getTime() -
      inicioSemana.getTime()
    ) /
      (
        1000 *
        60 *
        60 *
        24
      )
  );
}

function calcularRacha(
  fechas: string[]
): number {
  const dias =
    new Set<string>();

  fechas.forEach((fecha) => {
    const fechaObjeto =
      new Date(fecha);

    if (
      !Number.isNaN(
        fechaObjeto.getTime()
      )
    ) {
      dias.add(
        claveFechaLocal(
          fechaObjeto
        )
      );
    }
  });

  if (dias.size === 0) {
    return 0;
  }

  const hoy =
    fechaSinHora(
      new Date()
    );

  const ayer =
    new Date(hoy);

  ayer.setDate(
    ayer.getDate() - 1
  );

  let cursor: Date;

  if (
    dias.has(
      claveFechaLocal(hoy)
    )
  ) {
    cursor = hoy;
  } else if (
    dias.has(
      claveFechaLocal(ayer)
    )
  ) {
    cursor = ayer;
  } else {
    return 0;
  }

  let racha = 0;

  while (
    dias.has(
      claveFechaLocal(cursor)
    )
  ) {
    racha++;

    const anterior =
      new Date(cursor);

    anterior.setDate(
      anterior.getDate() - 1
    );

    cursor = anterior;
  }

  return racha;
}

function minutosDesdeTexto(
  texto: unknown
): number {
  if (
    typeof texto !== "string"
  ) {
    return 5;
  }

  const coincidencia =
    texto.match(/\d+/);

  if (!coincidencia) {
    return 5;
  }

  return Math.max(
    1,
    Number(coincidencia[0])
  );
}

function formatearTiempo(
  segundos: number
): string {
  if (segundos < 60) {
    return "0 min";
  }

  const minutos =
    Math.round(
      segundos / 60
    );

  if (minutos < 60) {
    return `${minutos} min`;
  }

  const horas =
    segundos / 3600;

  return `${horas.toFixed(
    horas >= 10 ? 0 : 1
  )} h`;
}

function nombreZonaHoraria(
  zona: string
): string {
  const encontrada =
    zonasHorarias.find(
      (elemento) =>
        elemento.valor === zona
    );

  return encontrada?.nombre ||
    zona.replaceAll("_", " ");
}

function obtenerExtension(
  nombreArchivo: string
): string {
  return (
    nombreArchivo
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "png"
  );
}

/* =====================================================
   COMPONENTE PRINCIPAL
===================================================== */

export default function PerfilScreen() {
  const router = useRouter();

  const inputFotoRef =
    useRef<HTMLInputElement | null>(
      null
    );

  /* USUARIO */

  const [
    userId,
    setUserId,
  ] = useState("");

  const [
    usuario,
    setUsuario,
  ] = useState<UsuarioPerfil>({
    nombre: "",
    correo: "",
    username: "",
  });

  const [
    formularioPerfil,
    setFormularioPerfil,
  ] = useState({
    nombre: "",
    username: "",
  });

  const [
    fotoPerfil,
    setFotoPerfil,
  ] = useState(
    "/raccoon.png"
  );

  const [
    avatarPath,
    setAvatarPath,
  ] = useState("");

  /* PLAN */

  const [
    planActual,
    setPlanActual,
  ] =
    useState<PlanType>("free");

  const [
    cargandoPlan,
    setCargandoPlan,
  ] = useState(true);

  const esPremium =
    planActual === "month" ||
    planActual === "year";

  /* AJUSTES */

  const [
    ajustes,
    setAjustes,
  ] = useState<AjustesUsuario>({
    idioma: "Español",
    zona_horaria:
      "America/Panama",
    objetivo_semanal_minutos:
      300,
    notificaciones: true,
  });

  /* ESTADÍSTICAS */

  const [
    estadisticas,
    setEstadisticas,
  ] =
    useState<EstadisticasPerfil>({
      total_segundos: 0,
      segundos_semana: 0,
      segundos_por_dia: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ],
      fechas_actividad: [],
      materiales: 0,
      materiales_completados: 0,
      quizzes_completados: 0,
      precision_promedio: 0,
      resumenes: 0,
      mazos_revisados: 0,
      tarjetas_dominadas: 0,
    });

  /* CARGA */

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    guardandoPerfil,
    setGuardandoPerfil,
  ] = useState(false);

  const [
    guardandoAjustes,
    setGuardandoAjustes,
  ] = useState(false);

  const [
    subiendoFoto,
    setSubiendoFoto,
  ] = useState(false);

  /* MODALES */

  const [
    mostrarEditarPerfil,
    setMostrarEditarPerfil,
  ] = useState(false);

  const [
    mostrarIdioma,
    setMostrarIdioma,
  ] = useState(false);

  const [
    mostrarZona,
    setMostrarZona,
  ] = useState(false);

  const [
    mostrarObjetivo,
    setMostrarObjetivo,
  ] = useState(false);

  /* DISEÑO */

  const [
    menuAbierto,
    setMenuAbierto,
  ] = useState(false);

  const [
    perfilAbierto,
    setPerfilAbierto,
  ] = useState(false);

  const [
    modoOscuro,
    setModoOscuro,
  ] = useState(false);

  const [
    notificacion,
    setNotificacion,
  ] = useState("");

  /* =====================================================
     INICIALIZAR
  ===================================================== */

  useEffect(() => {
    const iniciar = async () => {
      inicializarTema();

      const id =
        await cargarUsuario();

      if (!id) {
        return;
      }

      await Promise.all([
        cargarAjustes(id),
        cargarEstadisticas(id),
      ]);
    };

    void iniciar();
  }, []);

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

    setModoOscuro(oscuro);

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

    setPerfilAbierto(false);
  }

  /* =====================================================
     NOTIFICACIÓN
  ===================================================== */

  function mostrarNotificacion(
    mensaje: string
  ) {
    setNotificacion(mensaje);

    window.setTimeout(() => {
      setNotificacion("");
    }, 4500);
  }

  /* =====================================================
     CARGAR USUARIO Y PLAN
  ===================================================== */

  async function cargarUsuario(): Promise<
    string | null
  > {
    try {
      setCargando(true);
      setCargandoPlan(true);

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!user || !session) {
        router.replace("/Login");
        return null;
      }

      setUserId(user.id);

      const metadata = {
        ...(user.user_metadata ||
          {}),
        ...(user.app_metadata ||
          {}),
      };

      const nombre = String(
        metadata.nombre ||
          metadata.full_name ||
          metadata.name ||
          user.email?.split("@")[0] ||
          "Usuario"
      );

      const username = String(
        metadata.username ||
          user.email?.split("@")[0] ||
          "usuario"
      );

      const correo =
        user.email || "";

      const avatar =
        typeof metadata.avatar_url ===
          "string" &&
        metadata.avatar_url.trim()
          ? metadata.avatar_url
          : "/raccoon.png";

      const rutaAvatar =
        typeof metadata.avatar_path ===
          "string"
          ? metadata.avatar_path
          : "";

      setUsuario({
        nombre,
        correo,
        username,
      });

      setFormularioPerfil({
        nombre,
        username,
      });

      setFotoPerfil(avatar);
      setAvatarPath(rutaAvatar);

      const premiumMetadata =
        metadata.premium === true ||
        metadata.is_premium ===
          true ||
        metadata.es_premium ===
          true;

      const planMetadata =
        normalizarPlan(
          metadata.plan ||
            metadata.subscription ||
            metadata.tipo_plan ||
            metadata.subscription_plan,
          premiumMetadata
        );

      setPlanActual(
        planMetadata
      );

      try {
        const respuesta =
          await fetch(
            "/api/suscripciones",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },

              cache: "no-store",
            }
          );

        if (respuesta.ok) {
          const datos: unknown =
            await respuesta.json();

          if (esObjeto(datos)) {
            const premiumServidor =
              datos.premium ===
                true ||
              datos.is_premium ===
                true ||
              datos.es_premium ===
                true;

            const planServidor =
              normalizarPlan(
                datos.plan ||
                  datos.subscription ||
                  datos.tipo_plan,
                premiumServidor
              );

            setPlanActual(
              planServidor
            );
          }
        }
      } catch (error) {
        console.warn(
          "No se pudo verificar el plan:",
          error
        );
      }

      return user.id;
    } catch (error) {
      console.error(
        "Error cargando usuario:",
        error
      );

      mostrarNotificacion(
        "No se pudo cargar tu perfil."
      );

      return null;
    } finally {
      setCargando(false);
      setCargandoPlan(false);
    }
  }

  /* =====================================================
     AJUSTES
  ===================================================== */

  async function cargarAjustes(
    id: string
  ) {
    const zonaNavegador =
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone ||
      "America/Panama";

    try {
      const {
        data,
        error,
      } = await supabase
        .from("user_settings")
        .select(
          "idioma, zona_horaria, objetivo_semanal_minutos, notificaciones"
        )
        .eq("user_id", id)
        .maybeSingle();

      if (error) {
        console.warn(
          "No se cargaron los ajustes:",
          error.message
        );

        setAjustes({
          idioma: "Español",
          zona_horaria:
            zonaNavegador,
          objetivo_semanal_minutos:
            300,
          notificaciones: true,
        });

        return;
      }

      if (!data) {
        const nuevosAjustes: AjustesUsuario =
          {
            idioma: "Español",
            zona_horaria:
              zonaNavegador,
            objetivo_semanal_minutos:
              300,
            notificaciones: true,
          };

        setAjustes(
          nuevosAjustes
        );

        await supabase
          .from("user_settings")
          .upsert(
            {
              user_id: id,
              ...nuevosAjustes,
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "user_id",
            }
          );

        return;
      }

      setAjustes({
        idioma:
          data.idioma ===
          "English"
            ? "English"
            : "Español",

        zona_horaria:
          typeof data.zona_horaria ===
            "string"
            ? data.zona_horaria
            : zonaNavegador,

        objetivo_semanal_minutos:
          Math.max(
            30,
            numeroSeguro(
              data.objetivo_semanal_minutos,
              300
            )
          ),

        notificaciones:
          data.notificaciones !==
          false,
      });
    } catch (error) {
      console.warn(
        "Error cargando ajustes:",
        error
      );
    }
  }

  async function guardarAjustes(
    cambios: Partial<AjustesUsuario>
  ): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const nuevosAjustes = {
      ...ajustes,
      ...cambios,
    };

    try {
      setGuardandoAjustes(true);

      const {
        error,
      } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: userId,
            ...nuevosAjustes,
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "user_id",
          }
        );

      if (error) {
        throw new Error(
          error.message
        );
      }

      setAjustes(
        nuevosAjustes
      );

      mostrarNotificacion(
        "Preferencias guardadas."
      );

      return true;
    } catch (error) {
      console.error(
        "Error guardando ajustes:",
        error
      );

      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudieron guardar los ajustes."
      );

      return false;
    } finally {
      setGuardandoAjustes(false);
    }
  }

  /* =====================================================
     ESTADÍSTICAS
  ===================================================== */

  async function cargarEstadisticas(
    id: string
  ) {
    try {
      const [
        materialesRespuesta,
        sesionesRespuesta,
        quizzesRespuesta,
        resumenesRespuesta,
        flashcardsRespuesta,
      ] = await Promise.all([
        supabase
          .from("materiales")
          .select(
            "id, progreso, fecha_subida"
          )
          .eq(
            "usuario_id",
            id
          ),

        supabase
          .from("study_sessions")
          .select(
            "duracion_segundos, fecha_inicio, fecha_fin"
          )
          .eq(
            "usuario_id",
            id
          ),

        supabase
          .from("quizzes")
          .select(
            "estado, precision, preguntas_respondidas, fecha_creacion, fecha_completado"
          )
          .eq(
            "usuario_id",
            id
          ),

        supabase
          .from("resumenes")
          .select(
            "tiempo_lectura, fecha_creacion"
          )
          .eq(
            "usuario_id",
            id
          ),

        supabase
          .from(
            "flashcard_sets"
          )
          .select(
            "tarjetas_estudiadas, tarjetas_dominadas, progreso, fecha_creacion, fecha_ultima_revision"
          )
          .eq(
            "usuario_id",
            id
          ),
      ]);

      const materiales =
        materialesRespuesta.error
          ? []
          : materialesRespuesta.data ||
            [];

      const sesiones =
        sesionesRespuesta.error
          ? []
          : sesionesRespuesta.data ||
            [];

      const quizzes =
        quizzesRespuesta.error
          ? []
          : quizzesRespuesta.data ||
            [];

      const resumenes =
        resumenesRespuesta.error
          ? []
          : resumenesRespuesta.data ||
            [];

      const flashcards =
        flashcardsRespuesta.error
          ? []
          : flashcardsRespuesta.data ||
            [];

      const eventos:
        EventoActividad[] = [];

      sesiones.forEach(
        (sesion) => {
          const duracion =
            Math.max(
              0,
              numeroSeguro(
                sesion.duracion_segundos
              )
            );

          const fecha =
            typeof sesion.fecha_fin ===
              "string"
              ? sesion.fecha_fin
              : typeof sesion.fecha_inicio ===
                  "string"
                ? sesion.fecha_inicio
                : "";

          if (
            duracion > 0 &&
            fecha
          ) {
            eventos.push({
              fecha,
              duracion_segundos:
                duracion,
            });
          }
        }
      );

      const quizzesCompletados =
        quizzes.filter(
          (quiz) =>
            quiz.estado ===
              "completado" ||
            Boolean(
              quiz.fecha_completado
            )
        );

      quizzesCompletados.forEach(
        (quiz) => {
          const preguntas =
            Math.max(
              1,
              numeroSeguro(
                quiz.preguntas_respondidas,
                5
              )
            );

          eventos.push({
            fecha:
              typeof quiz.fecha_completado ===
                "string"
                ? quiz.fecha_completado
                : String(
                    quiz.fecha_creacion ||
                      new Date().toISOString()
                  ),

            duracion_segundos:
              Math.max(
                120,
                preguntas * 60
              ),
          });
        }
      );

      resumenes.forEach(
        (resumen) => {
          eventos.push({
            fecha: String(
              resumen.fecha_creacion ||
                new Date().toISOString()
            ),

            duracion_segundos:
              minutosDesdeTexto(
                resumen.tiempo_lectura
              ) * 60,
          });
        }
      );

      const mazosRevisados =
        flashcards.filter(
          (mazo) =>
            numeroSeguro(
              mazo.tarjetas_estudiadas
            ) > 0 ||
            Boolean(
              mazo.fecha_ultima_revision
            )
        );

      mazosRevisados.forEach(
        (mazo) => {
          eventos.push({
            fecha:
              typeof mazo.fecha_ultima_revision ===
                "string"
                ? mazo.fecha_ultima_revision
                : String(
                    mazo.fecha_creacion ||
                      new Date().toISOString()
                  ),

            duracion_segundos:
              Math.max(
                120,
                numeroSeguro(
                  mazo.tarjetas_estudiadas,
                  5
                ) * 30
              ),
          });
        }
      );

      const inicioSemana =
        obtenerInicioSemana(
          new Date()
        );

      const segundosPorDia = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ];

      eventos.forEach((evento) => {
        const fecha =
          new Date(evento.fecha);

        if (
          Number.isNaN(
            fecha.getTime()
          )
        ) {
          return;
        }

        const indice =
          indiceSemana(
            fecha,
            inicioSemana
          );

        if (
          indice >= 0 &&
          indice <= 6
        ) {
          segundosPorDia[indice] +=
            evento.duracion_segundos;
        }
      });

      const precisiones =
        quizzesCompletados
          .map((quiz) =>
            numeroSeguro(
              quiz.precision
            )
          )
          .filter(
            (precision) =>
              precision > 0
          );

      const precisionPromedio =
        precisiones.length > 0
          ? Math.round(
              precisiones.reduce(
                (
                  total,
                  precision
                ) =>
                  total +
                  precision,
                0
              ) /
                precisiones.length
            )
          : 0;

      const tarjetasDominadas =
        flashcards.reduce(
          (
            total,
            mazo
          ) =>
            total +
            numeroSeguro(
              mazo.tarjetas_dominadas
            ),
          0
        );

      setEstadisticas({
        total_segundos:
          eventos.reduce(
            (
              total,
              evento
            ) =>
              total +
              evento.duracion_segundos,
            0
          ),

        segundos_semana:
          segundosPorDia.reduce(
            (
              total,
              segundos
            ) =>
              total +
              segundos,
            0
          ),

        segundos_por_dia:
          segundosPorDia,

        fechas_actividad:
          eventos.map(
            (evento) =>
              evento.fecha
          ),

        materiales:
          materiales.length,

        materiales_completados:
          materiales.filter(
            (material) =>
              numeroSeguro(
                material.progreso
              ) >= 100
          ).length,

        quizzes_completados:
          quizzesCompletados.length,

        precision_promedio:
          precisionPromedio,

        resumenes:
          resumenes.length,

        mazos_revisados:
          mazosRevisados.length,

        tarjetas_dominadas:
          tarjetasDominadas,
      });
    } catch (error) {
      console.error(
        "Error cargando estadísticas:",
        error
      );
    }
  }

  /* =====================================================
     EDITAR PERFIL
  ===================================================== */

  async function guardarPerfil() {
    const nombre =
      formularioPerfil.nombre
        .trim();

    const username =
      formularioPerfil.username
        .trim();

    if (nombre.length < 2) {
      mostrarNotificacion(
        "El nombre debe tener al menos dos caracteres."
      );

      return;
    }

    if (
      !/^[a-zA-Z0-9._-]{3,24}$/.test(
        username
      )
    ) {
      mostrarNotificacion(
        "El usuario debe tener entre 3 y 24 caracteres y solo puede usar letras, números, puntos, guiones y guion bajo."
      );

      return;
    }

    try {
      setGuardandoPerfil(true);

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.replace("/Login");
        return;
      }

      const metadataActual = {
        ...(user.user_metadata ||
          {}),
      };

      const {
        error,
      } =
        await supabase.auth.updateUser({
          data: {
            ...metadataActual,
            nombre,
            full_name: nombre,
            username,
          },
        });

      if (error) {
        throw new Error(
          error.message
        );
      }

      setUsuario(
        (actual) => ({
          ...actual,
          nombre,
          username,
        })
      );

      setMostrarEditarPerfil(
        false
      );

      mostrarNotificacion(
        "Perfil actualizado correctamente."
      );
    } catch (error) {
      console.error(
        "Error actualizando perfil:",
        error
      );

      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el perfil."
      );
    } finally {
      setGuardandoPerfil(false);
    }
  }

  /* =====================================================
     FOTO DE PERFIL
  ===================================================== */

  async function cambiarFoto(
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const archivo =
      evento.target.files?.[0];

    if (!archivo) {
      return;
    }

    if (
      !archivo.type.startsWith(
        "image/"
      )
    ) {
      mostrarNotificacion(
        "Selecciona una imagen válida."
      );

      evento.target.value = "";
      return;
    }

    if (
      archivo.size >
      5 * 1024 * 1024
    ) {
      mostrarNotificacion(
        "La foto no puede superar los 5 MB."
      );

      evento.target.value = "";
      return;
    }

    if (!userId) {
      mostrarNotificacion(
        "No se encontró tu sesión."
      );

      return;
    }

    const extension =
      obtenerExtension(
        archivo.name
      );

    const nuevaRuta =
      `${userId}/avatar-${Date.now()}.${extension}`;

    try {
      setSubiendoFoto(true);

      const {
        error: errorSubida,
      } = await supabase.storage
        .from("avatars")
        .upload(
          nuevaRuta,
          archivo,
          {
            upsert: false,
            cacheControl:
              "3600",
            contentType:
              archivo.type,
          }
        );

      if (errorSubida) {
        throw new Error(
          errorSubida.message
        );
      }

      const {
        data: urlData,
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(
          nuevaRuta
        );

      const nuevaFoto =
        `${urlData.publicUrl}?v=${Date.now()}`;

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "No se encontró el usuario."
        );
      }

      const {
        error: errorPerfil,
      } =
        await supabase.auth.updateUser({
          data: {
            ...(user.user_metadata ||
              {}),
            avatar_url:
              nuevaFoto,
            avatar_path:
              nuevaRuta,
          },
        });

      if (errorPerfil) {
        await supabase.storage
          .from("avatars")
          .remove([
            nuevaRuta,
          ]);

        throw new Error(
          errorPerfil.message
        );
      }

      if (
        avatarPath &&
        avatarPath !==
          nuevaRuta
      ) {
        await supabase.storage
          .from("avatars")
          .remove([
            avatarPath,
          ]);
      }

      setFotoPerfil(
        nuevaFoto
      );

      setAvatarPath(
        nuevaRuta
      );

      mostrarNotificacion(
        "Foto de perfil actualizada."
      );
    } catch (error) {
      console.error(
        "Error subiendo foto:",
        error
      );

      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen."
      );
    } finally {
      setSubiendoFoto(false);
      evento.target.value = "";
    }
  }

  /* =====================================================
     CAMBIAR PREFERENCIAS
  ===================================================== */

  async function seleccionarIdioma(
    idioma: IdiomaType
  ) {
    const guardado =
      await guardarAjustes({
        idioma,
      });

    if (guardado) {
      setMostrarIdioma(false);
    }
  }

  async function seleccionarZona(
    zona_horaria: string
  ) {
    const guardado =
      await guardarAjustes({
        zona_horaria,
      });

    if (guardado) {
      setMostrarZona(false);
    }
  }

  async function seleccionarObjetivo(
    objetivo_semanal_minutos: number
  ) {
    const guardado =
      await guardarAjustes({
        objetivo_semanal_minutos,
      });

    if (guardado) {
      setMostrarObjetivo(false);
    }
  }

  async function cambiarNotificaciones() {
    await guardarAjustes({
      notificaciones:
        !ajustes.notificaciones,
    });
  }

  /* =====================================================
     CERRAR SESIÓN
  ===================================================== */

  async function cerrarSesion() {
    await supabase.auth.signOut();

    router.push("/Login");
  }

  /* =====================================================
     MÉTRICAS DERIVADAS
  ===================================================== */

  const rachaActual =
    calcularRacha(
      estadisticas.fechas_actividad
    );

  const minutosTotales =
    estadisticas.total_segundos /
    60;

  const xpTotal =
    Math.round(
      minutosTotales * 3 +
        estadisticas.quizzes_completados *
          100 +
        estadisticas.resumenes *
          75 +
        estadisticas.mazos_revisados *
          80 +
        estadisticas.materiales_completados *
          200
    );

  const xpPorNivel = 1000;

  const nivel =
    Math.floor(
      xpTotal /
        xpPorNivel
    ) + 1;

  const xpNivel =
    xpTotal %
    xpPorNivel;

  const porcentajeNivel =
    Math.min(
      100,
      (
        xpNivel /
        xpPorNivel
      ) * 100
    );

  const objetivoSegundos =
    ajustes.objetivo_semanal_minutos *
    60;

  const porcentajeObjetivo =
    objetivoSegundos > 0
      ? Math.min(
          100,
          Math.round(
            (
              estadisticas.segundos_semana /
              objetivoSegundos
            ) * 100
          )
        )
      : 0;

  const segundosRestantes =
    Math.max(
      0,
      objetivoSegundos -
        estadisticas.segundos_semana
    );

  const maximoSemana =
    Math.max(
      ...estadisticas.segundos_por_dia,
      1
    );

  const alturasSemana =
    estadisticas.segundos_por_dia.map(
      (segundos) => {
        if (segundos === 0) {
          return 5;
        }

        return Math.max(
          15,
          (
            segundos /
            maximoSemana
          ) * 100
        );
      }
    );

  const logros: Logro[] = [
    {
      titulo:
        "Primer material",
      descripcion:
        "Subiste tu primer documento.",
      icono: FileText,
      desbloqueado:
        estadisticas.materiales >=
        1,
      progreso: Math.min(
        100,
        estadisticas.materiales *
          100
      ),
    },
    {
      titulo:
        "Mente evaluada",
      descripcion:
        "Completaste tu primer quiz.",
      icono: ClipboardCheck,
      desbloqueado:
        estadisticas.quizzes_completados >=
        1,
      progreso: Math.min(
        100,
        estadisticas.quizzes_completados *
          100
      ),
    },
    {
      titulo:
        "Memoria maestra",
      descripcion:
        "Dominaste 50 flashcards.",
      icono: Brain,
      desbloqueado:
        estadisticas.tarjetas_dominadas >=
        50,
      progreso: Math.min(
        100,
        (
          estadisticas.tarjetas_dominadas /
          50
        ) * 100
      ),
    },
    {
      titulo:
        "Semana encendida",
      descripcion:
        "Alcanzaste una racha de 7 días.",
      icono: Flame,
      desbloqueado:
        rachaActual >= 7,
      progreso: Math.min(
        100,
        (
          rachaActual /
          7
        ) * 100
      ),
    },
    {
      titulo:
        "Estudiante dedicado",
      descripcion:
        "Acumulaste 10 horas de estudio.",
      icono: Timer,
      desbloqueado:
        estadisticas.total_segundos >=
        36000,
      progreso: Math.min(
        100,
        (
          estadisticas.total_segundos /
          36000
        ) * 100
      ),
    },
    {
      titulo:
        "Raccoon Premium",
      descripcion:
        "Desbloqueaste la experiencia completa.",
      icono: Crown,
      desbloqueado:
        esPremium,
      progreso:
        esPremium ? 100 : 0,
    },
  ];

  /* =====================================================
     PANTALLA DE CARGA
  ===================================================== */

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5FAFF] dark:bg-[#101827]">
        <div className="text-center">
          <div className="relative mx-auto h-24 w-24">
            <Image
              src="/raccoon.png"
              alt="Raccoon Study"
              fill
              className="object-contain"
            />
          </div>

          <LoaderCircle className="mx-auto mt-5 animate-spin text-[#55A8E8]" />

          <p className="mt-3 font-bold text-[#6085A5]">
            Cargando tu perfil...
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     INTERFAZ
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#F5FAFF] text-[#10233F] transition-colors duration-500 dark:bg-[#101827] dark:text-white">
      {/* OVERLAY MÓVIL */}

      {menuAbierto && (
        <button
          type="button"
          onClick={() =>
            setMenuAbierto(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          aria-label="Cerrar menú"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[250px]
          flex-col border-r border-[#DDEAF7] bg-white
          transition-transform duration-300
          dark:border-slate-700 dark:bg-[#151F30]
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
            type="button"
            onClick={() =>
              setMenuAbierto(false)
            }
            className="lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="mt-5 flex-1 space-y-1.5 px-3">
          {elementosMenu.map(
            ({
              nombre,
              href,
              icono: Icono,
              activo,
            }) => (
              <Link
                key={href}
                href={href}
                onClick={() =>
                  setMenuAbierto(false)
                }
                className={`
                  flex items-center gap-3 rounded-xl px-4 py-3
                  text-sm transition
                  ${
                    activo
                      ? "bg-[#E5F4FF] font-black text-[#1687D9] dark:bg-[#1D3558]"
                      : "font-semibold text-[#253650] hover:bg-[#F0F8FF] hover:text-[#1687D9] dark:text-slate-200 dark:hover:bg-slate-800"
                  }
                `}
              >
                <Icono size={19} />
                {nombre}
              </Link>
            )
          )}
        </nav>

        <div className="space-y-2 px-3 pb-5">
          <button
            type="button"
            onClick={cambiarTema}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#253650] transition hover:bg-[#F0F8FF] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {modoOscuro ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}

            {modoOscuro
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
              relative block overflow-hidden rounded-2xl p-4
              text-white shadow-lg transition hover:-translate-y-1
              ${
                esPremium
                  ? "bg-gradient-to-br from-[#F2B93B] via-[#EBA900] to-[#7771E8]"
                  : "bg-gradient-to-br from-[#64C7F2] via-[#55A8E8] to-[#7771E8]"
              }
            `}
          >
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/20" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                {esPremium ? (
                  <BadgeCheck size={22} />
                ) : (
                  <Crown size={22} />
                )}
              </div>

              <div>
                <p className="text-sm font-black">
                  {esPremium
                    ? "Premium activo"
                    : "Raccoon Premium"}
                </p>

                <p className="mt-1 text-[11px] text-white/80">
                  {cargandoPlan
                    ? "Comprobando plan..."
                    : nombrePlan(
                        planActual
                      )}
                </p>
              </div>
            </div>

            <div className="relative mt-3 flex items-center gap-1 text-xs font-bold">
              <Sparkles size={13} />

              {esPremium
                ? "Funciones avanzadas activas"
                : "Descubrir Premium"}

              <ArrowRight size={13} />
            </div>
          </Link>
        </div>
      </aside>

      {/* CONTENIDO */}

      <div className="lg:ml-[250px]">
        {/* HEADER */}

        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-[#DDEAF7] bg-white/90 px-4 backdrop-blur-xl dark:border-slate-700 dark:bg-[#151F30]/90 sm:px-6 lg:px-9">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setMenuAbierto(true)
              }
              className="lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu
                size={24}
                className="text-[#55A8E8]"
              />
            </button>

            <div>
              <h1 className="text-xl font-black">
                Mi Perfil
              </h1>

              <p className="hidden text-xs text-[#6085A5] sm:block">
                Administra tu cuenta y revisa tu progreso.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={cambiarTema}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#55A8E8] transition hover:bg-[#EFF8FF] dark:hover:bg-slate-800"
              aria-label="Cambiar tema"
            >
              {modoOscuro ? (
                <Sun size={21} />
              ) : (
                <Moon size={21} />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                mostrarNotificacion(
                  ajustes.notificaciones
                    ? "No tienes notificaciones nuevas."
                    : "Las notificaciones están desactivadas."
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#55A8E8] transition hover:bg-[#EFF8FF] dark:hover:bg-slate-800"
              aria-label="Notificaciones"
            >
              <Bell size={21} />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setPerfilAbierto(
                    !perfilAbierto
                  )
                }
                className="flex items-center gap-2"
              >
                <div className="h-10 w-10 overflow-hidden rounded-full bg-[#DDF3FF]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoPerfil}
                    alt="Perfil"
                    className="h-full w-full object-cover"
                    onError={(evento) => {
                      evento.currentTarget.src =
                        "/raccoon.png";
                    }}
                  />
                </div>

                <ChevronDown
                  size={16}
                  className="hidden text-[#55A8E8] sm:block"
                />
              </button>

              {perfilAbierto && (
                <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <div className="border-b border-slate-100 px-3 py-3 dark:border-slate-700">
                    <p className="truncate text-sm font-black">
                      {usuario.nombre}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#6085A5]">
                      {usuario.correo}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPerfilAbierto(
                        false
                      );

                      setMostrarEditarPerfil(
                        true
                      );
                    }}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Edit3 size={17} />
                    Editar perfil
                  </button>

                  <button
                    type="button"
                    onClick={cambiarTema}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    {modoOscuro ? (
                      <Sun size={17} />
                    ) : (
                      <Moon size={17} />
                    )}

                    {modoOscuro
                      ? "Modo claro"
                      : "Modo oscuro"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void cerrarSesion()
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <LogOut size={17} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* NOTIFICACIÓN */}

        {notificacion && (
          <div className="fixed left-1/2 top-5 z-[300] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 rounded-2xl bg-[#4169A1] px-5 py-3 text-center text-sm font-bold text-white shadow-2xl">
            {notificacion}
          </div>
        )}

        <div className="mx-auto max-w-[1450px] px-4 py-6 pb-28 sm:px-6 lg:px-8">
          {/* TARJETA DE PERFIL */}

          <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#EAF8FF] via-[#F7F5FF] to-[#EFEAFF] p-6 shadow-sm dark:from-[#1C304D] dark:via-[#24263F] dark:to-[#28243E] sm:p-8">
            <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#7652D9]/10" />

            <div className="relative flex flex-col items-center gap-7 md:flex-row">
              <div className="relative">
                <div className="h-36 w-36 overflow-hidden rounded-full border-[5px] border-white bg-[#DDF3FF] shadow-xl dark:border-slate-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoPerfil}
                    alt={usuario.nombre}
                    className="h-full w-full object-cover"
                    onError={(evento) => {
                      evento.currentTarget.src =
                        "/raccoon.png";
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    inputFotoRef.current?.click()
                  }
                  disabled={subiendoFoto}
                  className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-gradient-to-r from-[#55A8E8] to-[#7652D9] text-white shadow-lg transition hover:scale-110 disabled:cursor-wait dark:border-slate-700"
                  aria-label="Cambiar foto"
                >
                  {subiendoFoto ? (
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <Camera size={19} />
                  )}
                </button>

                <input
                  ref={inputFotoRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={cambiarFoto}
                />
              </div>

              <div className="min-w-0 flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <span
                    className={`
                      inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black
                      ${
                        esPremium
                          ? "bg-[#FFF1C9] text-[#A97900] dark:bg-[#4B3D1E] dark:text-yellow-200"
                          : "bg-white/80 text-[#1687D9] dark:bg-slate-800"
                      }
                    `}
                  >
                    {esPremium ? (
                      <Crown size={15} />
                    ) : (
                      <ShieldCheck size={15} />
                    )}

                    {nombrePlan(
                      planActual
                    )}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-[#DDF7EA] px-4 py-2 text-xs font-black text-[#258A5B]">
                    <Flame size={15} />
                    {rachaActual}{" "}
                    {rachaActual === 1
                      ? "día de racha"
                      : "días de racha"}
                  </span>
                </div>

                <h2 className="mt-4 truncate text-3xl font-black sm:text-4xl">
                  {usuario.nombre}
                </h2>

                <p className="mt-2 flex items-center justify-center gap-2 text-[#6085A5] dark:text-slate-300 md:justify-start">
                  <AtSign size={17} />
                  {usuario.username}
                </p>

                <p className="mt-2 flex items-center justify-center gap-2 text-sm text-[#6085A5] dark:text-slate-400 md:justify-start">
                  <Mail size={16} />
                  {usuario.correo}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormularioPerfil({
                      nombre:
                        usuario.nombre,
                      username:
                        usuario.username,
                    });

                    setMostrarEditarPerfil(
                      true
                    );
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-1"
                >
                  <Edit3 size={18} />
                  Editar perfil
                </button>

                <Link
                  href="/suscripcion"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-black text-[#7652D9] shadow-sm transition hover:-translate-y-1 dark:bg-slate-800"
                >
                  <CreditCard size={18} />
                  Mi suscripción
                </Link>
              </div>
            </div>
          </section>

          {/* ESTADÍSTICAS */}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TarjetaEstadistica
              icono={Flame}
              nombre="Racha actual"
              valor={`${rachaActual} ${
                rachaActual === 1
                  ? "día"
                  : "días"
              }`}
              descripcion="Actividad consecutiva"
              estilo="bg-[#FFF1E9] text-[#E66A2C]"
            />

            <TarjetaEstadistica
              icono={Clock3}
              nombre="Tiempo estudiado"
              valor={formatearTiempo(
                estadisticas.total_segundos
              )}
              descripcion="Tiempo acumulado"
              estilo="bg-[#EAF1FF] text-[#1769E0]"
            />

            <TarjetaEstadistica
              icono={Trophy}
              nombre="Nivel"
              valor={`Nivel ${nivel}`}
              descripcion={`${xpNivel} de ${xpPorNivel} XP`}
              estilo="bg-[#FFF1C9] text-[#C68B00]"
            />

            <TarjetaEstadistica
              icono={CheckCircle2}
              nombre="Completados"
              valor={
                estadisticas.materiales_completados
              }
              descripcion="Materiales al 100%"
              estilo="bg-[#DDF7EA] text-[#258A5B]"
            />
          </section>

          <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_380px]">
            {/* COLUMNA PRINCIPAL */}

            <div className="space-y-7">
              {/* INFORMACIÓN DE CUENTA */}

              <section className="rounded-[28px] bg-white p-6 shadow-sm dark:bg-[#182437] sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1FF] text-[#1769E0]">
                    <Settings size={23} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">
                      Cuenta y preferencias
                    </h2>

                    <p className="mt-1 text-sm text-[#6085A5] dark:text-slate-400">
                      Personaliza tu experiencia en Raccoon Study.
                    </p>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-[#E5EDF5] dark:border-slate-700">
                  <FilaConfiguracion
                    icono={Mail}
                    titulo="Correo electrónico"
                    valor={usuario.correo}
                    estilo="bg-[#DDF3FF] text-[#1687D9]"
                  />

                  <FilaConfiguracion
                    icono={AtSign}
                    titulo="Nombre de usuario"
                    valor={`@${usuario.username}`}
                    estilo="bg-[#EDE9FF] text-[#7652D9]"
                    onClick={() =>
                      setMostrarEditarPerfil(
                        true
                      )
                    }
                  />

                  <FilaConfiguracion
                    icono={Languages}
                    titulo="Idioma"
                    valor={ajustes.idioma}
                    estilo="bg-[#DDF7EA] text-[#258A5B]"
                    onClick={() =>
                      setMostrarIdioma(
                        true
                      )
                    }
                  />

                  <FilaConfiguracion
                    icono={Globe2}
                    titulo="Zona horaria"
                    valor={nombreZonaHoraria(
                      ajustes.zona_horaria
                    )}
                    estilo="bg-[#FFF1E9] text-[#D66A2E]"
                    onClick={() =>
                      setMostrarZona(
                        true
                      )
                    }
                  />

                  <FilaConfiguracion
                    icono={CreditCard}
                    titulo="Suscripción"
                    valor={nombrePlan(
                      planActual
                    )}
                    estilo="bg-[#FFF1C9] text-[#A97900]"
                    href="/suscripcion"
                  />

                  <div className="flex items-center gap-4 border-t border-[#E5EDF5] p-4 dark:border-slate-700 sm:p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F2EDFF] text-[#7652D9]">
                      <Bell size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-black">
                        Notificaciones
                      </p>

                      <p className="mt-1 text-sm text-[#6085A5] dark:text-slate-400">
                        Recordatorios y novedades de estudio.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void cambiarNotificaciones()
                      }
                      disabled={
                        guardandoAjustes
                      }
                      className={`
                        relative h-7 w-12 shrink-0 rounded-full transition
                        ${
                          ajustes.notificaciones
                            ? "bg-[#55A8E8]"
                            : "bg-[#CBD5E1] dark:bg-slate-600"
                        }
                      `}
                      aria-label="Cambiar notificaciones"
                    >
                      <span
                        className={`
                          absolute top-1 h-5 w-5 rounded-full bg-white shadow transition
                          ${
                            ajustes.notificaciones
                              ? "left-6"
                              : "left-1"
                          }
                        `}
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* OBJETIVO SEMANAL */}

              <section className="rounded-[28px] bg-white p-6 shadow-sm dark:bg-[#182437] sm:p-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDF7EA] text-[#258A5B]">
                      <Target size={23} />
                    </div>

                    <div>
                      <h2 className="text-xl font-black">
                        Objetivo semanal
                      </h2>

                      <p className="mt-1 text-sm text-[#6085A5] dark:text-slate-400">
                        Mantén un hábito de estudio constante.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarObjetivo(
                        true
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#F1F8FD] px-4 py-3 text-sm font-black text-[#1687D9] dark:bg-slate-700"
                  >
                    <Edit3 size={16} />
                    Cambiar meta
                  </button>
                </div>

                <div className="mt-7 grid gap-6 md:grid-cols-[190px_1fr] md:items-center">
                  <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-[#EDF3F8] dark:bg-slate-700">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#55A8E8 ${porcentajeObjetivo * 3.6}deg, transparent 0deg)`,
                      }}
                    />

                    <div className="relative flex h-[126px] w-[126px] flex-col items-center justify-center rounded-full bg-white dark:bg-[#182437]">
                      <p className="text-3xl font-black text-[#1687D9]">
                        {porcentajeObjetivo}%
                      </p>

                      <p className="mt-1 text-xs font-bold text-[#6085A5]">
                        completado
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#6085A5]">
                          Esta semana
                        </p>

                        <p className="mt-1 text-3xl font-black">
                          {formatearTiempo(
                            estadisticas.segundos_semana
                          )}
                        </p>
                      </div>

                      <p className="text-right text-sm font-bold text-[#6085A5]">
                        Meta:{" "}
                        {formatearTiempo(
                          objetivoSegundos
                        )}
                      </p>
                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#E7EDF5] dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#55A8E8] to-[#7652D9] transition-all duration-500"
                        style={{
                          width: `${porcentajeObjetivo}%`,
                        }}
                      />
                    </div>

                    <p className="mt-4 text-sm leading-6 text-[#6085A5] dark:text-slate-400">
                      {porcentajeObjetivo >=
                      100
                        ? "¡Meta completada! Sigue estudiando para superar tu récord."
                        : `Te faltan ${formatearTiempo(
                            segundosRestantes
                          )} para completar tu objetivo.`}
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex h-28 items-end gap-3">
                  {alturasSemana.map(
                    (
                      altura,
                      indice
                    ) => (
                      <div
                        key={
                          diasSemana[
                            indice
                          ]
                        }
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <div
                          title={`${Math.round(
                            estadisticas
                              .segundos_por_dia[
                              indice
                            ] / 60
                          )} minutos`}
                          className={`
                            w-full rounded-t-lg bg-gradient-to-t from-[#55A8E8] to-[#7771E8]
                            ${
                              estadisticas
                                .segundos_por_dia[
                                indice
                              ] === 0
                                ? "opacity-20"
                                : "opacity-100"
                            }
                          `}
                          style={{
                            height: `${altura}%`,
                          }}
                        />

                        <span className="text-xs font-bold text-[#6085A5]">
                          {
                            diasSemana[
                              indice
                            ]
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* LOGROS */}

              <section>
                <div className="mb-5">
                  <h2 className="text-2xl font-black">
                    Mis logros
                  </h2>

                  <p className="mt-1 text-sm text-[#6085A5] dark:text-slate-400">
                    Sigue estudiando para desbloquear nuevas insignias.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {logros.map(
                    (logro) => (
                      <LogroCard
                        key={
                          logro.titulo
                        }
                        {...logro}
                      />
                    )
                  )}
                </div>
              </section>
            </div>

            {/* COLUMNA DERECHA */}

            <aside className="space-y-7">
              {/* NIVEL */}

              <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#EAF8FF] via-[#F6F4FF] to-[#EFEAFF] p-7 shadow-sm dark:from-[#1C304D] dark:via-[#24263F] dark:to-[#28243E]">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#7652D9]/10" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#6085A5] dark:text-slate-300">
                      Tu nivel
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                      Nivel {nivel}
                    </h2>
                  </div>

                  <Image
                    src="/raccoon.png"
                    alt="Nivel Raccoon"
                    width={90}
                    height={90}
                    className="object-contain"
                  />
                </div>

                <div className="relative mt-6 h-3 overflow-hidden rounded-full bg-white dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#55A8E8] to-[#7652D9]"
                    style={{
                      width: `${porcentajeNivel}%`,
                    }}
                  />
                </div>

                <div className="relative mt-3 flex items-center justify-between text-sm font-bold">
                  <span className="text-[#7652D9]">
                    {xpNivel} XP
                  </span>

                  <span className="text-[#6085A5]">
                    {xpPorNivel} XP
                  </span>
                </div>
              </section>

              {/* PLAN */}

              <section
                className={`
                  relative overflow-hidden rounded-[28px] p-7 text-white shadow-lg
                  ${
                    esPremium
                      ? "bg-gradient-to-br from-[#F2B93B] via-[#EBA900] to-[#7652D9]"
                      : "bg-gradient-to-br from-[#55A8E8] via-[#4E9CE4] to-[#7652D9]"
                  }
                `}
              >
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15" />

                <div className="relative flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                    <Crown size={28} />
                  </div>

                  <div>
                    <p className="text-sm text-white/80">
                      Tu suscripción
                    </p>

                    <h2 className="text-xl font-black">
                      {nombrePlan(
                        planActual
                      )}
                    </h2>
                  </div>
                </div>

                <div className="relative mt-6 space-y-3">
                  <BeneficioPlan
                    texto={
                      esPremium
                        ? "Quizzes y mazos ampliados"
                        : "Funciones básicas de estudio"
                    }
                  />

                  <BeneficioPlan
                    texto={
                      esPremium
                        ? "Repaso inteligente"
                        : "Hasta 20 flashcards"
                    }
                  />

                  <BeneficioPlan
                    texto={
                      esPremium
                        ? "Archivos de hasta 25 MB"
                        : "Archivos de hasta 10 MB"
                    }
                  />
                </div>

                <Link
                  href="/suscripcion"
                  className="relative mt-6 flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-black text-[#7652D9]"
                >
                  {esPremium
                    ? "Administrar plan"
                    : "Mejorar a Premium"}

                  <ArrowRight size={17} />
                </Link>
              </section>

              {/* RESUMEN DE ACTIVIDAD */}

              <section className="rounded-[28px] bg-white p-7 shadow-sm dark:bg-[#182437]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDE9FF] text-[#7652D9]">
                    <BarChart3 size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-black">
                      Resumen de estudio
                    </h2>

                    <p className="text-xs text-[#6085A5]">
                      Toda tu actividad
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <ResumenEstadistica
                    icono={FileText}
                    nombre="Materiales"
                    valor={
                      estadisticas.materiales
                    }
                    estilo="bg-[#DDF3FF] text-[#1687D9]"
                  />

                  <ResumenEstadistica
                    icono={
                      ClipboardCheck
                    }
                    nombre="Quizzes completados"
                    valor={
                      estadisticas.quizzes_completados
                    }
                    estilo="bg-[#DDF7EA] text-[#258A5B]"
                  />

                  <ResumenEstadistica
                    icono={
                      BookOpenCheck
                    }
                    nombre="Resúmenes"
                    valor={
                      estadisticas.resumenes
                    }
                    estilo="bg-[#EDE9FF] text-[#7652D9]"
                  />

                  <ResumenEstadistica
                    icono={Brain}
                    nombre="Tarjetas dominadas"
                    valor={
                      estadisticas.tarjetas_dominadas
                    }
                    estilo="bg-[#FFF1C9] text-[#A97900]"
                  />

                  <ResumenEstadistica
                    icono={Target}
                    nombre="Precisión promedio"
                    valor={
                      estadisticas.precision_promedio >
                      0
                        ? `${estadisticas.precision_promedio}%`
                        : "—"
                    }
                    estilo="bg-[#FFF1E9] text-[#D66A2E]"
                  />
                </div>
              </section>

              {/* SEGURIDAD */}

              <section className="rounded-[28px] bg-white p-7 shadow-sm dark:bg-[#182437]">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-[#258A5B]" />

                  <h2 className="text-lg font-black">
                    Cuenta segura
                  </h2>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#6085A5] dark:text-slate-400">
                  Tu sesión y tus documentos están asociados a tu cuenta de Raccoon Study.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void cerrarSesion()
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3.5 font-black text-red-500 transition hover:bg-red-100 dark:bg-red-950/20"
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </section>
            </aside>
          </div>
        </div>
      </div>

      {/* MODAL EDITAR PERFIL */}

      {mostrarEditarPerfil && (
        <ModalBase
          titulo="Editar perfil"
          descripcion="Actualiza tu nombre y nombre de usuario."
          icono={UserRound}
          onCerrar={() =>
            setMostrarEditarPerfil(
              false
            )
          }
        >
          <div className="space-y-5">
            <div>
              <label className="text-sm font-black">
                Nombre completo
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#DCE6F0] bg-[#F8FBFE] px-4 dark:border-slate-700 dark:bg-slate-800">
                <User size={18} className="text-[#55A8E8]" />

                <input
                  value={
                    formularioPerfil.nombre
                  }
                  onChange={(evento) =>
                    setFormularioPerfil(
                      (actual) => ({
                        ...actual,
                        nombre:
                          evento.target.value,
                      })
                    )
                  }
                  maxLength={60}
                  className="w-full bg-transparent py-4 outline-none"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-black">
                Nombre de usuario
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#DCE6F0] bg-[#F8FBFE] px-4 dark:border-slate-700 dark:bg-slate-800">
                <AtSign size={18} className="text-[#7652D9]" />

                <input
                  value={
                    formularioPerfil.username
                  }
                  onChange={(evento) =>
                    setFormularioPerfil(
                      (actual) => ({
                        ...actual,
                        username:
                          evento.target.value.replace(
                            /\s/g,
                            ""
                          ),
                      })
                    )
                  }
                  maxLength={24}
                  className="w-full bg-transparent py-4 outline-none"
                  placeholder="nombre.usuario"
                />
              </div>

              <p className="mt-2 text-xs text-[#6085A5]">
                Entre 3 y 24 caracteres. Sin espacios.
              </p>
            </div>

            <div>
              <label className="text-sm font-black">
                Correo electrónico
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#EDF3F8] px-4 text-[#6085A5] dark:bg-slate-700">
                <Lock size={18} />

                <input
                  value={usuario.correo}
                  readOnly
                  className="w-full bg-transparent py-4 outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void guardarPerfil()
              }
              disabled={
                guardandoPerfil
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] py-4 font-black text-white disabled:cursor-wait disabled:opacity-60"
            >
              {guardandoPerfil ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Save size={19} />
              )}

              {guardandoPerfil
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </div>
        </ModalBase>
      )}

      {/* MODAL IDIOMA */}

      {mostrarIdioma && (
        <ModalBase
          titulo="Selecciona tu idioma"
          descripcion="Esta preferencia se guardará en tu cuenta."
          icono={Languages}
          onCerrar={() =>
            setMostrarIdioma(false)
          }
        >
          <div className="space-y-3">
            {(
              [
                "Español",
                "English",
              ] as IdiomaType[]
            ).map((idioma) => {
              const activo =
                ajustes.idioma ===
                idioma;

              return (
                <button
                  key={idioma}
                  type="button"
                  disabled={
                    guardandoAjustes
                  }
                  onClick={() =>
                    void seleccionarIdioma(
                      idioma
                    )
                  }
                  className={`
                    flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition
                    ${
                      activo
                        ? "border-[#55A8E8] bg-[#EFF8FF] dark:bg-[#1D3558]"
                        : "border-[#E5EDF5] hover:border-[#9BC7E5] dark:border-slate-700"
                    }
                  `}
                >
                  <div>
                    <p className="font-black">
                      {idioma}
                    </p>

                    <p className="mt-1 text-xs text-[#6085A5]">
                      {idioma ===
                      "Español"
                        ? "Interfaz y respuestas en español"
                        : "Interface and responses in English"}
                    </p>
                  </div>

                  {activo && (
                    <CheckCircle2 className="text-[#258A5B]" />
                  )}
                </button>
              );
            })}
          </div>
        </ModalBase>
      )}

      {/* MODAL ZONA HORARIA */}

      {mostrarZona && (
        <ModalBase
          titulo="Zona horaria"
          descripcion="Se utilizará para tus metas, rachas y actividad."
          icono={Globe2}
          onCerrar={() =>
            setMostrarZona(false)
          }
        >
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {zonasHorarias.map(
              (zona) => {
                const activo =
                  ajustes.zona_horaria ===
                  zona.valor;

                return (
                  <button
                    key={zona.valor}
                    type="button"
                    disabled={
                      guardandoAjustes
                    }
                    onClick={() =>
                      void seleccionarZona(
                        zona.valor
                      )
                    }
                    className={`
                      flex w-full items-center justify-between rounded-xl border-2 p-4 text-left
                      ${
                        activo
                          ? "border-[#55A8E8] bg-[#EFF8FF] dark:bg-[#1D3558]"
                          : "border-[#E5EDF5] dark:border-slate-700"
                      }
                    `}
                  >
                    <div>
                      <p className="font-black">
                        {zona.nombre}
                      </p>

                      <p className="mt-1 text-xs text-[#6085A5]">
                        {zona.valor}
                      </p>
                    </div>

                    {activo && (
                      <Check className="text-[#258A5B]" />
                    )}
                  </button>
                );
              }
            )}
          </div>
        </ModalBase>
      )}

      {/* MODAL OBJETIVO */}

      {mostrarObjetivo && (
        <ModalBase
          titulo="Objetivo semanal"
          descripcion="Elige cuánto tiempo deseas estudiar cada semana."
          icono={Target}
          onCerrar={() =>
            setMostrarObjetivo(
              false
            )
          }
        >
          <div className="space-y-3">
            {metasSemanales.map(
              (meta) => {
                const activo =
                  ajustes.objetivo_semanal_minutos ===
                  meta.minutos;

                return (
                  <button
                    key={meta.minutos}
                    type="button"
                    disabled={
                      guardandoAjustes
                    }
                    onClick={() =>
                      void seleccionarObjetivo(
                        meta.minutos
                      )
                    }
                    className={`
                      flex w-full items-center justify-between rounded-xl border-2 p-4 text-left
                      ${
                        activo
                          ? "border-[#7652D9] bg-[#F3EFFF] dark:bg-[#302747]"
                          : "border-[#E5EDF5] dark:border-slate-700"
                      }
                    `}
                  >
                    <div>
                      <p className="font-black">
                        {meta.nombre}
                      </p>

                      <p className="mt-1 text-xs text-[#6085A5]">
                        {
                          meta.descripcion
                        }
                      </p>
                    </div>

                    {activo && (
                      <CheckCircle2 className="text-[#258A5B]" />
                    )}
                  </button>
                );
              }
            )}
          </div>
        </ModalBase>
      )}

      {/* NAVEGACIÓN MÓVIL */}

      <nav className="fixed bottom-0 left-0 z-30 flex w-full justify-around border-t border-[#DDEAF7] bg-white py-3 dark:border-slate-700 dark:bg-[#151F30] lg:hidden">
        <Link href="/Dashboard">
          <Home
            size={22}
            className="text-[#7990B3]"
          />
        </Link>

        <Link href="/metodos">
          <Brain
            size={22}
            className="text-[#7990B3]"
          />
        </Link>

        <Link href="/quizzes">
          <ClipboardCheck
            size={22}
            className="text-[#7990B3]"
          />
        </Link>

        <Link href="/biblioteca">
          <Library
            size={22}
            className="text-[#7990B3]"
          />
        </Link>

        <Link href="/perfil">
          <User
            size={22}
            className="text-[#1687D9]"
          />
        </Link>
      </nav>
    </main>
  );
}

/* =====================================================
   COMPONENTES
===================================================== */

function TarjetaEstadistica({
  icono: Icono,
  nombre,
  valor,
  descripcion,
  estilo,
}: {
  icono: LucideIcon;
  nombre: string;
  valor: string | number;
  descripcion: string;
  estilo: string;
}) {
  return (
    <article className="rounded-[22px] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-[#182437]">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${estilo}`}
      >
        <Icono size={23} />
      </div>

      <p className="mt-4 text-sm font-bold text-[#6085A5] dark:text-slate-400">
        {nombre}
      </p>

      <p className="mt-1 text-2xl font-black">
        {valor}
      </p>

      <p className="mt-1 text-xs text-[#8AA4BE]">
        {descripcion}
      </p>
    </article>
  );
}

function FilaConfiguracion({
  icono: Icono,
  titulo,
  valor,
  estilo,
  href,
  onClick,
}: {
  icono: LucideIcon;
  titulo: string;
  valor: string;
  estilo: string;
  href?: string;
  onClick?: () => void;
}) {
  const contenido = (
    <>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${estilo}`}
      >
        <Icono size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-black">
          {titulo}
        </p>

        <p className="mt-1 truncate text-sm text-[#6085A5] dark:text-slate-400">
          {valor}
        </p>
      </div>

      {(href || onClick) && (
        <ArrowRight
          size={18}
          className="shrink-0 text-[#8AA4BE]"
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-4 border-t border-[#E5EDF5] p-4 transition first:border-t-0 hover:bg-[#F8FBFD] dark:border-slate-700 dark:hover:bg-slate-800 sm:p-5"
      >
        {contenido}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center gap-4 border-t border-[#E5EDF5] p-4 text-left transition first:border-t-0 enabled:hover:bg-[#F8FBFD] disabled:cursor-default dark:border-slate-700 dark:enabled:hover:bg-slate-800 sm:p-5"
    >
      {contenido}
    </button>
  );
}

function ResumenEstadistica({
  icono: Icono,
  nombre,
  valor,
  estilo,
}: {
  icono: LucideIcon;
  nombre: string;
  valor: string | number;
  estilo: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${estilo}`}
      >
        <Icono size={19} />
      </div>

      <span className="flex-1 text-sm text-[#506C88] dark:text-slate-300">
        {nombre}
      </span>

      <span className="font-black">
        {valor}
      </span>
    </div>
  );
}

function LogroCard({
  titulo,
  descripcion,
  icono: Icono,
  desbloqueado,
  progreso,
}: Logro) {
  return (
    <article
      className={`
        relative overflow-hidden rounded-[22px] border-2 p-5 transition
        ${
          desbloqueado
            ? "border-[#F0CE75] bg-gradient-to-br from-[#FFFDF6] to-[#F7F3FF] shadow-sm dark:from-[#332B1D] dark:to-[#28243E]"
            : "border-[#E5EDF5] bg-white opacity-75 dark:border-slate-700 dark:bg-[#182437]"
        }
      `}
    >
      <div
        className={`
          flex h-12 w-12 items-center justify-center rounded-xl
          ${
            desbloqueado
              ? "bg-[#FFF1C9] text-[#C68B00]"
              : "bg-[#EDF3F8] text-[#8AA4BE] dark:bg-slate-700"
          }
        `}
      >
        {desbloqueado ? (
          <Icono size={24} />
        ) : (
          <Lock size={21} />
        )}
      </div>

      <h3 className="mt-4 font-black">
        {titulo}
      </h3>

      <p className="mt-2 min-h-[40px] text-sm leading-5 text-[#6085A5] dark:text-slate-400">
        {descripcion}
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E7EDF5] dark:bg-slate-700">
        <div
          className={`
            h-full rounded-full
            ${
              desbloqueado
                ? "bg-gradient-to-r from-[#F2B93B] to-[#7652D9]"
                : "bg-[#9CB1C7]"
            }
          `}
          style={{
            width: `${Math.max(
              4,
              Math.min(
                100,
                progreso
              )
            )}%`,
          }}
        />
      </div>

      <p className="mt-2 text-right text-xs font-black text-[#6085A5]">
        {desbloqueado
          ? "Desbloqueado"
          : `${Math.round(
              progreso
            )}%`}
      </p>
    </article>
  );
}

function BeneficioPlan({
  texto,
}: {
  texto: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold">
      <CheckCircle2
        size={17}
        className="shrink-0"
      />

      {texto}
    </div>
  );
}

function ModalBase({
  titulo,
  descripcion,
  icono: Icono,
  onCerrar,
  children,
}: {
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  onCerrar: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <button
        type="button"
        onClick={onCerrar}
        className="absolute inset-0"
        aria-label="Cerrar modal"
      />

      <section className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl dark:bg-[#182437] sm:p-7">
        <button
          type="button"
          onClick={onCerrar}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5FA] text-[#6085A5] transition hover:text-red-500 dark:bg-slate-700"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="pr-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#55A8E8] to-[#7652D9] text-white">
            <Icono size={27} />
          </div>

          <h2 className="mt-5 text-2xl font-black">
            {titulo}
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#6085A5] dark:text-slate-400">
            {descripcion}
          </p>
        </div>

        <div className="mt-6">
          {children}
        </div>
      </section>
    </div>
  );
}