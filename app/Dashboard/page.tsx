"use client";

import type { ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";

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
  BadgeCheck,
  Bell,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Crown,
  Eye,
  FilePlus2,
  FileText,
  Flame,
  Home,
  Layers3,
  Library,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  MessagesSquare,
  Moon,
  Search,
  Shield,
  Sparkles,
  Sun,
  Timer,
  Trophy,
  Upload,
  User,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

/* =====================================================
   TIPOS
===================================================== */

type PlanType =
  | "free"
  | "month"
  | "year";

type AccionEstudio =
  | "pomodoro"
  | "resumen"
  | "quiz"
  | "flashcards";

type TipoActividad =
  | "revision"
  | "pomodoro"
  | "quiz"
  | "flashcards"
  | "resumen";

interface Material {
  id: string;
  nombre_archivo: string;
  url_archivo: string;
  progreso: number;
  fecha_subida: string;
  usuario_id: string;
}

interface ChatReciente {
  id: string;
  titulo: string;
  ultimo_mensaje: string;
  fecha_actualizacion: string;
}

interface ElementoMenu {
  nombre: string;
  href: string;
  icono: LucideIcon;
  activo?: boolean;
}

interface SesionEstudio {
  id: string;
  usuario_id: string;
  material_id: string | null;
  tipo: TipoActividad;
  duracion_segundos: number;
  fecha_inicio: string;
  fecha_fin: string;
}

interface QuizActividad {
  id: string;
  material_id: string | null;
  estado: string;
  preguntas_respondidas: number;
  precision: number;
  fecha_creacion: string;
  fecha_completado: string | null;
}

interface ResumenActividad {
  id: string;
  material_id: string | null;
  tiempo_lectura: string;
  fecha_creacion: string;
}

interface FlashcardActividad {
  id: string;
  material_id: string | null;
  estado: string;
  tarjetas_estudiadas: number;
  tarjetas_dominadas: number;
  progreso: number;
  fecha_creacion: string;
  fecha_ultima_revision: string | null;
}

interface EventoActividad {
  fecha: string;
  duracion_segundos: number;
  material_id: string | null;
  tipo: TipoActividad;
}

interface MetricasEstudio {
  total_segundos: number;
  segundos_semana: number[];
  fechas_actividad: string[];
  quizzes_completados: number;
  resumenes_creados: number;
  mazos_revisados: number;
  tarjetas_dominadas: number;
}

interface RevisionActiva {
  material: Material;
  inicio: number;
}

/* =====================================================
   MENÚ
===================================================== */

const elementosMenu: ElementoMenu[] = [
  {
    nombre: "Inicio",
    href: "/Dashboard",
    icono: Home,
    activo: true,
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

function textoSeguro(
  valor: unknown,
  respaldo = ""
): string {
  return typeof valor === "string"
    ? valor
    : respaldo;
}

function limitarPorcentaje(
  porcentaje: number
): number {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(porcentaje)
    )
  );
}

function normalizarMaterial(
  dato: Record<string, unknown>
): Material {
  return {
    id: String(dato.id || ""),

    nombre_archivo:
      typeof dato.nombre_archivo ===
      "string"
        ? dato.nombre_archivo
        : "Material sin nombre",

    url_archivo:
      typeof dato.url_archivo === "string"
        ? dato.url_archivo
        : "",

    progreso: limitarPorcentaje(
      numeroSeguro(dato.progreso)
    ),

    fecha_subida:
      typeof dato.fecha_subida ===
      "string"
        ? dato.fecha_subida
        : new Date().toISOString(),

    usuario_id:
      typeof dato.usuario_id === "string"
        ? dato.usuario_id
        : "",
  };
}

function normalizarSesion(
  dato: Record<string, unknown>
): SesionEstudio {
  const tipo = textoSeguro(
    dato.tipo,
    "revision"
  );

  const tipoValido: TipoActividad =
    tipo === "pomodoro" ||
    tipo === "quiz" ||
    tipo === "flashcards" ||
    tipo === "resumen"
      ? tipo
      : "revision";

  return {
    id: String(dato.id || ""),
    usuario_id: String(
      dato.usuario_id || ""
    ),

    material_id:
      dato.material_id === null ||
      dato.material_id === undefined
        ? null
        : String(dato.material_id),

    tipo: tipoValido,

    duracion_segundos: Math.max(
      0,
      numeroSeguro(
        dato.duracion_segundos
      )
    ),

    fecha_inicio: textoSeguro(
      dato.fecha_inicio,
      new Date().toISOString()
    ),

    fecha_fin: textoSeguro(
      dato.fecha_fin,
      textoSeguro(
        dato.fecha_inicio,
        new Date().toISOString()
      )
    ),
  };
}

function normalizarQuizActividad(
  dato: Record<string, unknown>
): QuizActividad {
  return {
    id: String(dato.id || ""),

    material_id:
      dato.material_id === null ||
      dato.material_id === undefined
        ? null
        : String(dato.material_id),

    estado: textoSeguro(
      dato.estado,
      "creado"
    ),

    preguntas_respondidas:
      numeroSeguro(
        dato.preguntas_respondidas
      ),

    precision: numeroSeguro(
      dato.precision
    ),

    fecha_creacion: textoSeguro(
      dato.fecha_creacion,
      new Date().toISOString()
    ),

    fecha_completado:
      typeof dato.fecha_completado ===
      "string"
        ? dato.fecha_completado
        : null,
  };
}

function normalizarResumenActividad(
  dato: Record<string, unknown>
): ResumenActividad {
  return {
    id: String(dato.id || ""),

    material_id:
      dato.material_id === null ||
      dato.material_id === undefined
        ? null
        : String(dato.material_id),

    tiempo_lectura: textoSeguro(
      dato.tiempo_lectura,
      "5 min"
    ),

    fecha_creacion: textoSeguro(
      dato.fecha_creacion,
      new Date().toISOString()
    ),
  };
}

function normalizarFlashcardActividad(
  dato: Record<string, unknown>
): FlashcardActividad {
  return {
    id: String(dato.id || ""),

    material_id:
      dato.material_id === null ||
      dato.material_id === undefined
        ? null
        : String(dato.material_id),

    estado: textoSeguro(
      dato.estado,
      "creado"
    ),

    tarjetas_estudiadas:
      numeroSeguro(
        dato.tarjetas_estudiadas
      ),

    tarjetas_dominadas:
      numeroSeguro(
        dato.tarjetas_dominadas
      ),

    progreso: limitarPorcentaje(
      numeroSeguro(dato.progreso)
    ),

    fecha_creacion: textoSeguro(
      dato.fecha_creacion,
      new Date().toISOString()
    ),

    fecha_ultima_revision:
      typeof dato.fecha_ultima_revision ===
      "string"
        ? dato.fecha_ultima_revision
        : null,
  };
}

function obtenerTextoDeCampos(
  dato: Record<string, unknown>,
  campos: string[],
  respaldo: string
): string {
  for (const campo of campos) {
    const valor = dato[campo];

    if (
      typeof valor === "string" &&
      valor.trim()
    ) {
      return valor;
    }
  }

  return respaldo;
}

function normalizarChat(
  dato: Record<string, unknown>,
  indice: number
): ChatReciente {
  return {
    id: String(
      dato.id ||
        dato.chat_id ||
        dato.conversacion_id ||
        indice
    ),

    titulo: obtenerTextoDeCampos(
      dato,
      [
        "titulo",
        "title",
        "nombre",
        "asunto",
      ],
      "Conversación con Raccoon IA"
    ),

    ultimo_mensaje:
      obtenerTextoDeCampos(
        dato,
        [
          "ultimo_mensaje",
          "last_message",
          "mensaje",
          "contenido",
          "descripcion",
        ],
        "Continúa conversando con tu tutor."
      ),

    fecha_actualizacion:
      obtenerTextoDeCampos(
        dato,
        [
          "fecha_actualizacion",
          "updated_at",
          "fecha",
          "created_at",
        ],
        new Date().toISOString()
      ),
  };
}

function obtenerExtension(
  nombreArchivo: string
): string {
  return (
    nombreArchivo
      .split(".")
      .pop()
      ?.toLowerCase() || ""
  );
}

function esImagen(
  extension: string
): boolean {
  return [
    "png",
    "jpg",
    "jpeg",
    "webp",
    "gif",
  ].includes(extension);
}

function esDocumentoOffice(
  extension: string
): boolean {
  return [
    "doc",
    "docx",
    "ppt",
    "pptx",
    "xls",
    "xlsx",
  ].includes(extension);
}

function formatearFecha(
  fecha: string
): string {
  const fechaObjeto = new Date(fecha);

  if (
    Number.isNaN(
      fechaObjeto.getTime()
    )
  ) {
    return "Reciente";
  }

  return fechaObjeto.toLocaleDateString(
    "es-PA",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatearFechaChat(
  fecha: string
): string {
  const fechaObjeto = new Date(fecha);

  if (
    Number.isNaN(
      fechaObjeto.getTime()
    )
  ) {
    return "Reciente";
  }

  const ahora = new Date();

  const diferenciaDias =
    Math.floor(
      (
        ahora.getTime() -
        fechaObjeto.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        )
    );

  if (diferenciaDias === 0) {
    return "Hoy";
  }

  if (diferenciaDias === 1) {
    return "Ayer";
  }

  return fechaObjeto.toLocaleDateString(
    "es-PA",
    {
      day: "numeric",
      month: "short",
    }
  );
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

  return premium ? "month" : "free";
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
  const año = fecha.getFullYear();

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
  const inicio =
    fechaSinHora(fecha);

  const dia = inicio.getDay();

  const diferencia =
    dia === 0
      ? -6
      : 1 - dia;

  inicio.setDate(
    inicio.getDate() +
      diferencia
  );

  return inicio;
}

function indiceSemana(
  fecha: Date,
  inicioSemana: Date
): number {
  const fechaLimpia =
    fechaSinHora(fecha);

  return Math.floor(
    (
      fechaLimpia.getTime() -
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
  const dias = new Set<string>();

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
    fechaSinHora(new Date());

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
  texto: string
): number {
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

/* =====================================================
   COMPONENTE
===================================================== */

export default function Dashboard() {
  const router = useRouter();

  const revisionActivaRef =
    useRef<RevisionActiva | null>(
      null
    );

  /* USUARIO Y PLAN */

  const [
    nombreUsuario,
    setNombreUsuario,
  ] = useState("Usuario");

  const [
    fotoPerfil,
    setFotoPerfil,
  ] = useState("/raccoon.png");

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

  /* MATERIALES */

  const [
    materiales,
    setMateriales,
  ] = useState<Material[]>([]);

  const [
    cargandoMateriales,
    setCargandoMateriales,
  ] = useState(true);

  const [
    subiendo,
    setSubiendo,
  ] = useState(false);

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    mostrarTodos,
    setMostrarTodos,
  ] = useState(false);

  /* ACTIVIDAD */

  const [
    metricas,
    setMetricas,
  ] = useState<MetricasEstudio>({
    total_segundos: 0,
    segundos_semana: [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ],
    fechas_actividad: [],
    quizzes_completados: 0,
    resumenes_creados: 0,
    mazos_revisados: 0,
    tarjetas_dominadas: 0,
  });

  const [
    cargandoActividad,
    setCargandoActividad,
  ] = useState(true);

  /* CHATS */

  const [
    chatsRecientes,
    setChatsRecientes,
  ] = useState<ChatReciente[]>([]);

  const [
    cargandoChats,
    setCargandoChats,
  ] = useState(true);

  /* VISOR */

  const [
    materialAbierto,
    setMaterialAbierto,
  ] = useState<Material | null>(
    null
  );

  const [
    textoArchivo,
    setTextoArchivo,
  ] = useState("");

  const [
    cargandoTexto,
    setCargandoTexto,
  ] = useState(false);

  const [
    errorVisor,
    setErrorVisor,
  ] = useState("");

  /* OPCIONES */

  const [
    materialParaAccion,
    setMaterialParaAccion,
  ] = useState<Material | null>(
    null
  );

  const [
    mostrarOpcionesEstudio,
    setMostrarOpcionesEstudio,
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
     INICIAR
  ===================================================== */

  useEffect(() => {
    const iniciarDashboard =
      async () => {
        inicializarTema();

        const usuarioId =
          await obtenerUsuarioYPlan();

        if (!usuarioId) {
          return;
        }

        await Promise.all([
          obtenerDatosEstudio(
            usuarioId
          ),
          obtenerChatsRecientes(
            usuarioId
          ),
        ]);
      };

    void iniciarDashboard();
  }, []);

  /* =====================================================
     CARGAR TXT EN VISOR
  ===================================================== */

  useEffect(() => {
    if (!materialAbierto) {
      setTextoArchivo("");
      setErrorVisor("");
      return;
    }

    const extension =
      obtenerExtension(
        materialAbierto.nombre_archivo
      );

    if (
      extension !== "txt" &&
      extension !== "md"
    ) {
      setTextoArchivo("");
      setErrorVisor("");
      return;
    }

    const controlador =
      new AbortController();

    const cargarTexto =
      async () => {
        try {
          setCargandoTexto(true);
          setErrorVisor("");

          const respuesta =
            await fetch(
              materialAbierto.url_archivo,
              {
                signal:
                  controlador.signal,
              }
            );

          if (!respuesta.ok) {
            throw new Error(
              "No se pudo leer el archivo."
            );
          }

          const contenido =
            await respuesta.text();

          setTextoArchivo(
            contenido
          );
        } catch (error) {
          if (
            error instanceof Error &&
            error.name ===
              "AbortError"
          ) {
            return;
          }

          setErrorVisor(
            error instanceof Error
              ? error.message
              : "No se pudo leer el archivo."
          );
        } finally {
          setCargandoTexto(false);
        }
      };

    void cargarTexto();

    return () => {
      controlador.abort();
    };
  }, [materialAbierto]);

  /* =====================================================
     TEMA
  ===================================================== */

  const inicializarTema = () => {
    const temaGuardado =
      localStorage.getItem(
        "raccoon-theme"
      );

    const sistemaOscuro =
      window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches ?? false;

    const usarOscuro =
      temaGuardado === "dark" ||
      (
        !temaGuardado &&
        sistemaOscuro
      );

    setModoOscuro(
      usarOscuro
    );

    document.documentElement.classList.toggle(
      "dark",
      usarOscuro
    );

    document.documentElement.style.colorScheme =
      usarOscuro
        ? "dark"
        : "light";
  };

  const cambiarTema = () => {
    setModoOscuro(
      (modoActual) => {
        const nuevoModo =
          !modoActual;

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

        return nuevoModo;
      }
    );

    setPerfilAbierto(false);
  };

  /* =====================================================
     NOTIFICACIÓN
  ===================================================== */

  const mostrarNotificacion = (
    mensaje: string
  ) => {
    setNotificacion(mensaje);

    window.setTimeout(() => {
      setNotificacion("");
    }, 4500);
  };

  /* =====================================================
     USUARIO Y PREMIUM
  ===================================================== */

  const obtenerUsuarioYPlan =
    async (): Promise<
      string | null
    > => {
      try {
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

        const metadata = {
          ...(user.user_metadata ||
            {}),
          ...(user.app_metadata ||
            {}),
        };

        setNombreUsuario(
          String(
            metadata.nombre ||
              metadata.full_name ||
              metadata.name ||
              user.email?.split(
                "@"
              )[0] ||
              "Usuario"
          )
        );

        if (
          typeof metadata.avatar_url ===
          "string"
        ) {
          setFotoPerfil(
            metadata.avatar_url
          );
        }

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
            "No se pudo consultar el plan en el servidor:",
            error
          );
        }

        return user.id;
      } catch (error) {
        console.error(
          "Error obteniendo usuario:",
          error
        );

        mostrarNotificacion(
          "No se pudo cargar tu información."
        );

        return null;
      } finally {
        setCargandoPlan(false);
      }
    };

  /* =====================================================
     DATOS DE ESTUDIO
  ===================================================== */

  const obtenerDatosEstudio =
    async (
      usuarioId: string
    ) => {
      try {
        setCargandoMateriales(true);
        setCargandoActividad(true);

        const [
          materialesRespuesta,
          sesionesRespuesta,
          quizzesRespuesta,
          resumenesRespuesta,
          flashcardsRespuesta,
        ] = await Promise.all([
          supabase
            .from("materiales")
            .select("*")
            .eq(
              "usuario_id",
              usuarioId
            )
            .order(
              "fecha_subida",
              {
                ascending: false,
              }
            ),

          supabase
            .from("study_sessions")
            .select("*")
            .eq(
              "usuario_id",
              usuarioId
            )
            .order(
              "fecha_fin",
              {
                ascending: false,
              }
            ),

          supabase
            .from("quizzes")
            .select(
              "id, material_id, estado, preguntas_respondidas, precision, fecha_creacion, fecha_completado"
            )
            .eq(
              "usuario_id",
              usuarioId
            ),

          supabase
            .from("resumenes")
            .select(
              "id, material_id, tiempo_lectura, fecha_creacion"
            )
            .eq(
              "usuario_id",
              usuarioId
            ),

          supabase
            .from(
              "flashcard_sets"
            )
            .select(
              "id, material_id, estado, tarjetas_estudiadas, tarjetas_dominadas, progreso, fecha_creacion, fecha_ultima_revision"
            )
            .eq(
              "usuario_id",
              usuarioId
            ),
        ]);

        if (
          materialesRespuesta.error
        ) {
          throw new Error(
            materialesRespuesta.error.message
          );
        }

        const listaMateriales =
          (
            materialesRespuesta.data ||
            []
          ).map((material) =>
            normalizarMaterial(
              material as Record<
                string,
                unknown
              >
            )
          );

        const sesiones =
          sesionesRespuesta.error
            ? []
            : (
                sesionesRespuesta.data ||
                []
              ).map((sesion) =>
                normalizarSesion(
                  sesion as Record<
                    string,
                    unknown
                  >
                )
              );

        if (
          sesionesRespuesta.error
        ) {
          console.warn(
            "No se cargaron sesiones:",
            sesionesRespuesta.error
              .message
          );
        }

        const quizzes =
          quizzesRespuesta.error
            ? []
            : (
                quizzesRespuesta.data ||
                []
              ).map((quiz) =>
                normalizarQuizActividad(
                  quiz as Record<
                    string,
                    unknown
                  >
                )
              );

        const resumenes =
          resumenesRespuesta.error
            ? []
            : (
                resumenesRespuesta.data ||
                []
              ).map((resumen) =>
                normalizarResumenActividad(
                  resumen as Record<
                    string,
                    unknown
                  >
                )
              );

        const flashcards =
          flashcardsRespuesta.error
            ? []
            : (
                flashcardsRespuesta.data ||
                []
              ).map((mazo) =>
                normalizarFlashcardActividad(
                  mazo as Record<
                    string,
                    unknown
                  >
                )
              );

        const eventos:
          EventoActividad[] = [];

        sesiones.forEach(
          (sesion) => {
            if (
              sesion.duracion_segundos >
              0
            ) {
              eventos.push({
                fecha:
                  sesion.fecha_fin ||
                  sesion.fecha_inicio,

                duracion_segundos:
                  sesion.duracion_segundos,

                material_id:
                  sesion.material_id,

                tipo: sesion.tipo,
              });
            }
          }
        );

        quizzes.forEach((quiz) => {
          if (
            quiz.estado ===
              "completado" ||
            quiz.fecha_completado
          ) {
            eventos.push({
              fecha:
                quiz.fecha_completado ||
                quiz.fecha_creacion,

              duracion_segundos:
                Math.max(
                  120,
                  quiz.preguntas_respondidas *
                    60
                ),

              material_id:
                quiz.material_id,

              tipo: "quiz",
            });
          }
        });

        resumenes.forEach(
          (resumen) => {
            eventos.push({
              fecha:
                resumen.fecha_creacion,

              duracion_segundos:
                minutosDesdeTexto(
                  resumen.tiempo_lectura
                ) * 60,

              material_id:
                resumen.material_id,

              tipo: "resumen",
            });
          }
        );

        flashcards.forEach(
          (mazo) => {
            if (
              mazo.tarjetas_estudiadas >
                0 ||
              mazo.fecha_ultima_revision
            ) {
              eventos.push({
                fecha:
                  mazo.fecha_ultima_revision ||
                  mazo.fecha_creacion,

                duracion_segundos:
                  Math.max(
                    120,
                    mazo.tarjetas_estudiadas *
                      30
                  ),

                material_id:
                  mazo.material_id,

                tipo: "flashcards",
              });
            }
          }
        );

        const inicioSemana =
          obtenerInicioSemana(
            new Date()
          );

        const segundosSemana = [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ];

        eventos.forEach((evento) => {
          const fechaEvento =
            new Date(evento.fecha);

          if (
            Number.isNaN(
              fechaEvento.getTime()
            )
          ) {
            return;
          }

          const indice =
            indiceSemana(
              fechaEvento,
              inicioSemana
            );

          if (
            indice >= 0 &&
            indice <= 6
          ) {
            segundosSemana[indice] +=
              evento.duracion_segundos;
          }
        });

        const sesionesPorMaterial =
          new Map<string, number>();

        sesiones.forEach(
          (sesion) => {
            if (
              !sesion.material_id
            ) {
              return;
            }

            const actual =
              sesionesPorMaterial.get(
                sesion.material_id
              ) || 0;

            sesionesPorMaterial.set(
              sesion.material_id,
              actual +
                sesion.duracion_segundos
            );
          }
        );

        const resumenesPorMaterial =
          new Set<string>();

        resumenes.forEach(
          (resumen) => {
            if (
              resumen.material_id
            ) {
              resumenesPorMaterial.add(
                resumen.material_id
              );
            }
          }
        );

        const quizPorMaterial =
          new Map<
            string,
            {
              creado: boolean;
              completado: boolean;
            }
          >();

        quizzes.forEach((quiz) => {
          if (!quiz.material_id) {
            return;
          }

          const actual =
            quizPorMaterial.get(
              quiz.material_id
            ) || {
              creado: false,
              completado: false,
            };

          actual.creado = true;

          if (
            quiz.estado ===
              "completado" ||
            quiz.fecha_completado
          ) {
            actual.completado =
              true;
          }

          quizPorMaterial.set(
            quiz.material_id,
            actual
          );
        });

        const flashcardsPorMaterial =
          new Map<string, number>();

        flashcards.forEach(
          (mazo) => {
            if (!mazo.material_id) {
              return;
            }

            const actual =
              flashcardsPorMaterial.get(
                mazo.material_id
              ) || 0;

            flashcardsPorMaterial.set(
              mazo.material_id,
              Math.max(
                actual,
                mazo.progreso
              )
            );
          }
        );

        const materialesActualizados =
          listaMateriales.map(
            (material) => {
              let progresoCalculado = 0;

              const segundosMaterial =
                sesionesPorMaterial.get(
                  material.id
                ) || 0;

              const minutosMaterial =
                segundosMaterial / 60;

              progresoCalculado +=
                Math.min(
                  25,
                  (
                    minutosMaterial /
                    60
                  ) * 25
                );

              if (
                resumenesPorMaterial.has(
                  material.id
                )
              ) {
                progresoCalculado +=
                  20;
              }

              const quiz =
                quizPorMaterial.get(
                  material.id
                );

              if (quiz?.completado) {
                progresoCalculado +=
                  30;
              } else if (
                quiz?.creado
              ) {
                progresoCalculado +=
                  10;
              }

              const progresoFlashcards =
                flashcardsPorMaterial.get(
                  material.id
                ) || 0;

              progresoCalculado +=
                (
                  progresoFlashcards /
                  100
                ) * 25;

              const progresoFinal =
                limitarPorcentaje(
                  Math.max(
                    material.progreso,
                    progresoCalculado
                  )
                );

              return {
                ...material,
                progreso:
                  progresoFinal,
              };
            }
          );

        setMateriales(
          materialesActualizados
        );

        const actualizaciones =
          materialesActualizados
            .filter(
              (
                material,
                indice
              ) =>
                material.progreso !==
                listaMateriales[
                  indice
                ].progreso
            )
            .map((material) =>
              supabase
                .from("materiales")
                .update({
                  progreso:
                    material.progreso,
                })
                .eq(
                  "id",
                  material.id
                )
                .eq(
                  "usuario_id",
                  usuarioId
                )
            );

        if (
          actualizaciones.length >
          0
        ) {
          await Promise.all(
            actualizaciones
          );
        }

        const totalSegundos =
          eventos.reduce(
            (
              total,
              evento
            ) =>
              total +
              evento.duracion_segundos,
            0
          );

        setMetricas({
          total_segundos:
            totalSegundos,

          segundos_semana:
            segundosSemana,

          fechas_actividad:
            eventos.map(
              (evento) =>
                evento.fecha
            ),

          quizzes_completados:
            quizzes.filter(
              (quiz) =>
                quiz.estado ===
                  "completado" ||
                Boolean(
                  quiz.fecha_completado
                )
            ).length,

          resumenes_creados:
            resumenes.length,

          mazos_revisados:
            flashcards.filter(
              (mazo) =>
                mazo.tarjetas_estudiadas >
                  0 ||
                Boolean(
                  mazo.fecha_ultima_revision
                )
            ).length,

          tarjetas_dominadas:
            flashcards.reduce(
              (
                total,
                mazo
              ) =>
                total +
                mazo.tarjetas_dominadas,
              0
            ),
        });
      } catch (error) {
        console.error(
          "Error cargando el Dashboard:",
          error
        );

        mostrarNotificacion(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los datos."
        );
      } finally {
        setCargandoMateriales(false);
        setCargandoActividad(false);
      }
    };

  /* =====================================================
     CHATS
  ===================================================== */

  const obtenerChatsRecientes =
    async (
      usuarioId: string
    ) => {
      try {
        setCargandoChats(true);

        const consultas = [
          {
            tabla: "chats",
            columnaUsuario:
              "usuario_id",
          },
          {
            tabla: "conversaciones",
            columnaUsuario:
              "usuario_id",
          },
          {
            tabla: "chats",
            columnaUsuario:
              "user_id",
          },
          {
            tabla: "conversaciones",
            columnaUsuario:
              "user_id",
          },
        ];

        for (const consulta of consultas) {
          const {
            data,
            error,
          } = await supabase
            .from(consulta.tabla)
            .select("*")
            .eq(
              consulta.columnaUsuario,
              usuarioId
            )
            .limit(10);

          if (
            !error &&
            data &&
            data.length > 0
          ) {
            const chats =
              data
                .map(
                  (
                    chat,
                    indice
                  ) =>
                    normalizarChat(
                      chat as Record<
                        string,
                        unknown
                      >,
                      indice
                    )
                )
                .sort(
                  (
                    chatA,
                    chatB
                  ) =>
                    new Date(
                      chatB.fecha_actualizacion
                    ).getTime() -
                    new Date(
                      chatA.fecha_actualizacion
                    ).getTime()
                )
                .slice(0, 3);

            setChatsRecientes(
              chats
            );

            return;
          }
        }

        const clavesLocales = [
          "raccoon-chats-recientes",
          "chats-recientes",
          "raccoon-chats",
        ];

        for (const clave of clavesLocales) {
          const contenido =
            localStorage.getItem(
              clave
            );

          if (!contenido) {
            continue;
          }

          try {
            const datos: unknown =
              JSON.parse(contenido);

            if (
              Array.isArray(datos)
            ) {
              const chats =
                datos
                  .filter(
                    (
                      elemento
                    ): elemento is Record<
                      string,
                      unknown
                    > =>
                      esObjeto(
                        elemento
                      )
                  )
                  .map(
                    (
                      chat,
                      indice
                    ) =>
                      normalizarChat(
                        chat,
                        indice
                      )
                  )
                  .slice(0, 3);

              if (
                chats.length > 0
              ) {
                setChatsRecientes(
                  chats
                );

                return;
              }
            }
          } catch {
            // Continúa buscando.
          }
        }

        setChatsRecientes([]);
      } catch (error) {
        console.warn(
          "No se pudieron cargar los chats:",
          error
        );

        setChatsRecientes([]);
      } finally {
        setCargandoChats(false);
      }
    };

  /* =====================================================
     SUBIR MATERIAL
  ===================================================== */

  const subirArchivo = async (
    evento: ChangeEvent<HTMLInputElement>
  ) => {
    const archivo =
      evento.target.files?.[0];

    if (
      !archivo ||
      subiendo
    ) {
      return;
    }

    const extension =
      obtenerExtension(
        archivo.name
      );

    const extensionesPermitidas = [
      "pdf",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "txt",
      "md",
      "png",
      "jpg",
      "jpeg",
      "webp",
    ];

    if (
      !extensionesPermitidas.includes(
        extension
      )
    ) {
      mostrarNotificacion(
        "Formato no permitido. Sube PDF, Word, PowerPoint, TXT o imágenes."
      );

      evento.target.value = "";
      return;
    }

    if (archivo.size === 0) {
      mostrarNotificacion(
        "El archivo está vacío."
      );

      evento.target.value = "";
      return;
    }

    const limiteBytes =
      esPremium
        ? 25 * 1024 * 1024
        : 10 * 1024 * 1024;

    if (
      archivo.size >
      limiteBytes
    ) {
      mostrarNotificacion(
        esPremium
          ? "El archivo no puede superar los 25 MB."
          : "El plan gratuito permite archivos de hasta 10 MB."
      );

      evento.target.value = "";
      return;
    }

    let rutaStorage = "";

    try {
      setSubiendo(true);

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.replace("/Login");
        return;
      }

      const nombreSeguro =
        archivo.name
          .normalize("NFD")
          .replace(
            /[\u0300-\u036f]/g,
            ""
          )
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );

      const identificador =
        typeof crypto !==
          "undefined" &&
        "randomUUID" in crypto
          ? crypto.randomUUID()
          : Date.now().toString();

      rutaStorage =
        `${user.id}/${identificador}-${nombreSeguro}`;

      const {
        error: errorStorage,
      } = await supabase.storage
        .from("materiales")
        .upload(
          rutaStorage,
          archivo,
          {
            upsert: false,
            cacheControl: "3600",
            contentType:
              archivo.type ||
              "application/octet-stream",
          }
        );

      if (errorStorage) {
        throw new Error(
          `No se pudo subir el archivo: ${errorStorage.message}`
        );
      }

      const { data: urlData } =
        supabase.storage
          .from("materiales")
          .getPublicUrl(
            rutaStorage
          );

      const {
        data: materialInsertado,
        error: errorBaseDatos,
      } = await supabase
        .from("materiales")
        .insert({
          usuario_id: user.id,
          nombre_archivo:
            archivo.name,
          url_archivo:
            urlData.publicUrl,
          progreso: 0,
        })
        .select("*")
        .single();

      if (errorBaseDatos) {
        await supabase.storage
          .from("materiales")
          .remove([
            rutaStorage,
          ]);

        throw new Error(
          `No se pudo guardar el material: ${errorBaseDatos.message}`
        );
      }

      if (!materialInsertado) {
        throw new Error(
          "No se recibió la información del material."
        );
      }

      const nuevoMaterial =
        normalizarMaterial(
          materialInsertado as Record<
            string,
            unknown
          >
        );

      setMateriales(
        (anteriores) => [
          nuevoMaterial,
          ...anteriores,
        ]
      );

      setMaterialParaAccion(
        nuevoMaterial
      );

      setMostrarOpcionesEstudio(
        true
      );

      mostrarNotificacion(
        "Material subido correctamente."
      );
    } catch (error) {
      console.error(
        "Error subiendo material:",
        error
      );

      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudo subir el material."
      );
    } finally {
      setSubiendo(false);
      evento.target.value = "";
    }
  };

  /* =====================================================
     REGISTRAR REVISIÓN
  ===================================================== */

  const guardarRevisionActual =
    async () => {
      const revision =
        revisionActivaRef.current;

      revisionActivaRef.current =
        null;

      if (!revision) {
        return;
      }

      const fin = Date.now();

      const segundos =
        Math.floor(
          (
            fin -
            revision.inicio
          ) / 1000
        );

      /*
        Evita registrar aperturas accidentales.
      */

      if (segundos < 10) {
        return;
      }

      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const {
          error,
        } = await supabase
          .from("study_sessions")
          .insert({
            usuario_id:
              user.id,

            material_id:
              revision.material.id,

            tipo: "revision",

            duracion_segundos:
              segundos,

            fecha_inicio:
              new Date(
                revision.inicio
              ).toISOString(),

            fecha_fin:
              new Date(
                fin
              ).toISOString(),
          });

        if (error) {
          console.warn(
            "No se registró el tiempo:",
            error.message
          );

          return;
        }

        await obtenerDatosEstudio(
          user.id
        );
      } catch (error) {
        console.warn(
          "Error registrando revisión:",
          error
        );
      }
    };

  /* =====================================================
     OPCIONES DE ESTUDIO
  ===================================================== */

  const elegirAccionEstudio =
    async (
      accion: AccionEstudio,
      material:
        | Material
        | null =
        materialParaAccion
    ) => {
      if (!material) {
        mostrarNotificacion(
          "Selecciona primero un material."
        );

        return;
      }

      if (
        materialAbierto?.id ===
        material.id
      ) {
        await guardarRevisionActual();
      }

      const informacionMaterial = {
        id: material.id,

        material_id:
          material.id,

        titulo:
          material.nombre_archivo,

        nombre_archivo:
          material.nombre_archivo,

        url_archivo:
          material.url_archivo,

        progreso:
          material.progreso,

        fecha_subida:
          material.fecha_subida,

        origen: "dashboard",
      };

      localStorage.setItem(
        "raccoon-material-seleccionado",
        JSON.stringify(
          informacionMaterial
        )
      );

      setMostrarOpcionesEstudio(
        false
      );

      setMaterialAbierto(null);

      if (
        accion === "pomodoro"
      ) {
        localStorage.setItem(
          "pomodoro-material",
          JSON.stringify(
            informacionMaterial
          )
        );

        router.push(
          `/metodos/pomodoro?material=${encodeURIComponent(
            material.id
          )}`
        );

        return;
      }

      if (
        accion === "resumen"
      ) {
        sessionStorage.setItem(
          "resumen-material-pendiente",
          JSON.stringify(
            informacionMaterial
          )
        );

        router.push(
          `/metodos/resumenes?generar=1&material=${encodeURIComponent(
            material.id
          )}`
        );

        return;
      }

      if (
        accion === "flashcards"
      ) {
        localStorage.setItem(
          "flashcard-material",
          JSON.stringify({
            ...informacionMaterial,
            materia: "General",
            contenido: "",
          })
        );

        router.push(
          `/metodos/flashcards?crear=1&origen=material&material=${encodeURIComponent(
            material.id
          )}`
        );

        return;
      }

      localStorage.setItem(
        "quiz-material",
        JSON.stringify({
          ...informacionMaterial,
          materia: "General",
          contenido: "",
          ideas_principales: [],
          conceptos_clave: [],
          origen: "material",
        })
      );

      router.push(
        `/quizzes?crear=1&origen=material&material=${encodeURIComponent(
          material.id
        )}`
      );
    };

  const abrirOpcionesMaterial = (
    material: Material
  ) => {
    setMaterialParaAccion(
      material
    );

    setMostrarOpcionesEstudio(
      true
    );
  };

  /* =====================================================
     VISOR
  ===================================================== */

  const abrirMaterial = (
    material: Material
  ) => {
    if (!material.url_archivo) {
      mostrarNotificacion(
        "Este material no tiene una dirección válida."
      );

      return;
    }

    setErrorVisor("");
    setTextoArchivo("");
    setMaterialAbierto(material);

    revisionActivaRef.current = {
      material,
      inicio: Date.now(),
    };
  };

  const cerrarVisor =
    async () => {
      await guardarRevisionActual();

      setMaterialAbierto(null);
      setTextoArchivo("");
      setErrorVisor("");
    };

  /* =====================================================
     CHAT
  ===================================================== */

  const abrirChat = (
    chat: ChatReciente
  ) => {
    localStorage.setItem(
      "raccoon-chat-seleccionado",
      JSON.stringify(chat)
    );

    router.push(
      `/Chat?chat=${encodeURIComponent(
        chat.id
      )}`
    );
  };

  /* =====================================================
     SESIÓN
  ===================================================== */

  const cerrarSesion =
    async () => {
      await guardarRevisionActual();
      await supabase.auth.signOut();

      router.push("/Login");
    };

  /* =====================================================
     MÉTRICAS
  ===================================================== */

  const rachaActual =
    calcularRacha(
      metricas.fechas_actividad
    );

  const materialesCompletados =
    materiales.filter(
      (material) =>
        material.progreso >= 100
    ).length;

  const minutosTotales =
    metricas.total_segundos /
    60;

  const xpTotal =
    Math.round(
      minutosTotales * 3 +
        metricas.quizzes_completados *
          100 +
        metricas.resumenes_creados *
          75 +
        metricas.mazos_revisados *
          80 +
        materialesCompletados *
          200
    );

  const xpMax = 1000;

  const nivel =
    Math.floor(
      xpTotal / xpMax
    ) + 1;

  const xpNivel =
    xpTotal % xpMax;

  const porcentajeXp =
    Math.min(
      (
        xpNivel /
        xpMax
      ) * 100,
      100
    );

  const maximoSemana =
    Math.max(
      ...metricas.segundos_semana,
      1
    );

  const alturasSemana =
    metricas.segundos_semana.map(
      (segundos) => {
        if (segundos <= 0) {
          return 4;
        }

        return Math.max(
          12,
          (
            segundos /
            maximoSemana
          ) * 100
        );
      }
    );

  /* =====================================================
     BÚSQUEDA
  ===================================================== */

  const textoBusqueda =
    busqueda
      .trim()
      .toLowerCase();

  const materialesFiltrados =
    materiales.filter(
      (material) =>
        material.nombre_archivo
          .toLowerCase()
          .includes(
            textoBusqueda
          )
    );

  const materialesVisibles =
    textoBusqueda !== "" ||
    mostrarTodos
      ? materialesFiltrados
      : materialesFiltrados.slice(
          0,
          3
        );

  const ultimoMaterial =
    materiales[0] || null;

  const extensionAbierta =
    materialAbierto
      ? obtenerExtension(
          materialAbierto.nombre_archivo
        )
      : "";

  const urlOffice =
    materialAbierto &&
    esDocumentoOffice(
      extensionAbierta
    )
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          materialAbierto.url_archivo
        )}`
      : "";

  /* =====================================================
     INTERFAZ
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#F5FAFF] text-[#10233F] transition-colors duration-500 dark:bg-[#101827] dark:text-white">
      {menuAbierto && (
        <div
          onClick={() =>
            setMenuAbierto(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
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
                  flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition
                  ${
                    activo
                      ? "bg-[#E5F4FF] font-bold text-[#1687D9] dark:bg-[#1D3558]"
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
              relative block overflow-hidden rounded-2xl p-4 text-white
              shadow-lg transition hover:-translate-y-1
              ${
                esPremium
                  ? "bg-gradient-to-br from-[#F2B93B] via-[#EBA900] to-[#7771E8] shadow-[#EBA900]/25"
                  : "bg-gradient-to-br from-[#64C7F2] via-[#55A8E8] to-[#7771E8] shadow-[#55A8E8]/25"
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
                ? "Todas tus funciones están activas"
                : "Descubrir Premium"}

              <ArrowRight size={13} />
            </div>
          </Link>
        </div>
      </aside>

      {/* CONTENIDO */}

      <div className="lg:ml-[250px]">
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

            <h1 className="text-[20px] font-black">
              Raccoon{" "}
              <span className="text-[#55A8E8]">
                Study
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-3 rounded-full bg-[#F1F8FD] px-4 py-2.5 dark:bg-slate-800 md:flex">
              <Search
                size={18}
                className="text-[#8AA4BE]"
              />

              <input
                value={busqueda}
                onChange={(evento) => {
                  const valor =
                    evento.target.value;

                  setBusqueda(valor);

                  if (valor.trim()) {
                    setMostrarTodos(
                      true
                    );
                  }
                }}
                placeholder="Buscar materiales..."
                className="w-40 bg-transparent text-sm outline-none placeholder:text-[#8AA4BE] lg:w-52"
              />

              {busqueda && (
                <button
                  type="button"
                  onClick={() =>
                    setBusqueda("")
                  }
                  aria-label="Limpiar búsqueda"
                >
                  <X
                    size={16}
                    className="text-[#8AA4BE]"
                  />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={cambiarTema}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#55A8E8] transition hover:bg-[#EFF8FF] dark:hover:bg-slate-800"
              aria-label={
                modoOscuro
                  ? "Activar modo claro"
                  : "Activar modo oscuro"
              }
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
                  "No tienes notificaciones nuevas."
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
                  className="text-[#55A8E8]"
                />
              </button>

              {perfilAbierto && (
                <div className="absolute right-0 top-14 z-50 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <p className="px-3 py-2 text-sm font-bold">
                    {nombreUsuario}
                  </p>

                  <p className="px-3 pb-2 text-xs font-semibold text-[#6085A5]">
                    {nombrePlan(
                      planActual
                    )}
                  </p>

                  <Link
                    href="/perfil"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <User size={17} />
                    Mi perfil
                  </Link>

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

        {notificacion && (
          <div className="fixed left-1/2 top-5 z-[300] w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl bg-[#55A8E8] px-5 py-3 text-center text-sm font-bold text-white shadow-2xl">
            {notificacion}
          </div>
        )}

        <div className="mx-auto max-w-[1500px] px-4 py-6 pb-28 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-[#182437] md:hidden">
            <Search
              size={19}
              className="text-[#8AA4BE]"
            />

            <input
              value={busqueda}
              onChange={(evento) => {
                const valor =
                  evento.target.value;

                setBusqueda(valor);

                if (valor.trim()) {
                  setMostrarTodos(
                    true
                  );
                }
              }}
              placeholder="Buscar materiales..."
              className="w-full bg-transparent text-sm outline-none"
            />

            {busqueda && (
              <button
                type="button"
                onClick={() =>
                  setBusqueda("")
                }
                aria-label="Limpiar búsqueda"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="grid gap-7 xl:grid-cols-[1fr_380px]">
            {/* COLUMNA PRINCIPAL */}

            <div className="space-y-7">
              <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#EAF8FF] via-white to-[#F0ECFF] p-6 shadow-sm dark:from-[#1D3558] dark:via-[#182437] dark:to-[#28243E] sm:p-8">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#55A8E8]/10" />

                <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <span
                      className={`
                        inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold
                        ${
                          esPremium
                            ? "bg-[#FFF1C9] text-[#A97900] dark:bg-[#4B3D1E] dark:text-yellow-200"
                            : "bg-white/80 text-[#1687D9] dark:bg-slate-800"
                        }
                      `}
                    >
                      {esPremium ? (
                        <Crown size={16} />
                      ) : (
                        <Sparkles size={16} />
                      )}

                      {cargandoPlan
                        ? "Comprobando tu plan..."
                        : esPremium
                        ? "Tu espacio Premium"
                        : "Tu espacio de estudio"}
                    </span>

                    <h2 className="mt-5 text-3xl font-black sm:text-4xl">
                      ¡Hola {nombreUsuario}! 👋
                    </h2>

                    <p className="mt-3 max-w-xl text-base leading-7 text-[#6085A5] dark:text-slate-300">
                      Sube tus materiales, revísalos dentro de Raccoon Study y selecciona cómo deseas estudiar.
                    </p>
                  </div>

                  <Image
                    src="/raccoon.png"
                    alt="Raccoon Study"
                    width={180}
                    height={180}
                    className="mx-auto w-[150px] object-contain sm:mx-0 sm:w-[180px]"
                  />
                </div>
              </section>

              {/* CONTINUAR ESTUDIANDO */}

              {ultimoMaterial && (
                <section className="rounded-[28px] bg-white p-5 shadow-sm dark:bg-[#182437] sm:p-7">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black">
                        Continúa estudiando
                      </h2>

                      <p className="mt-1 text-sm text-[#6085A5] dark:text-slate-400">
                        Retoma tu material más reciente.
                      </p>
                    </div>

                    <span className="rounded-full bg-[#DDF7EA] px-3 py-1.5 text-xs font-black text-[#258A5B]">
                      Reciente
                    </span>
                  </div>

                  <div className="flex flex-col gap-5 rounded-[24px] bg-gradient-to-r from-[#EAF8FF] to-[#F0ECFF] p-5 dark:from-slate-800 dark:to-[#28243E] sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FF5D68] text-white">
                      <FileText size={27} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-black">
                        {ultimoMaterial.nombre_archivo}
                      </h3>

                      <p className="mt-2 text-sm text-[#6085A5] dark:text-slate-400">
                        Subido el{" "}
                        {formatearFecha(
                          ultimoMaterial.fecha_subida
                        )}
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white dark:bg-slate-600">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#55A8E8] to-[#7771E8]"
                            style={{
                              width:
                                `${ultimoMaterial.progreso}%`,
                            }}
                          />
                        </div>

                        <span className="text-sm font-black">
                          {ultimoMaterial.progreso}%
                        </span>
                      </div>
                    </div>

                    <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                      <button
                        type="button"
                        onClick={() =>
                          abrirMaterial(
                            ultimoMaterial
                          )
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#1687D9] shadow-sm dark:bg-slate-700"
                      >
                        <Eye size={17} />
                        Revisar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          abrirOpcionesMaterial(
                            ultimoMaterial
                          )
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] px-4 py-3 text-sm font-black text-white"
                      >
                        Estudiar
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* SUBIR MATERIAL */}

              <section className="rounded-[28px] bg-white p-5 shadow-sm dark:bg-[#182437] sm:p-7">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-2xl font-black">
                      Subir material
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#6085A5] dark:text-slate-400">
                      Después de subirlo podrás elegir Pomodoro, Resumen, Quiz o Flashcards.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-[#EAF1FF] px-4 py-2 text-sm font-bold text-[#1769E0] dark:bg-[#1D3558]">
                    {materiales.length}{" "}
                    {materiales.length === 1
                      ? "material"
                      : "materiales"}
                  </span>
                </div>

                <label
                  htmlFor="archivo-dashboard"
                  className={`
                    mt-6 flex min-h-[260px] flex-col items-center justify-center
                    overflow-hidden rounded-[25px] border-2 border-dashed
                    p-6 text-center transition
                    ${
                      subiendo
                        ? "cursor-wait border-[#7771E8] bg-[#F2EEFF] dark:bg-[#28243E]"
                        : "cursor-pointer border-[#9BC7E5] bg-gradient-to-br from-[#F4FBFF] to-[#F1F0FF] hover:-translate-y-1 hover:border-[#55A8E8] hover:shadow-lg dark:from-[#182A42] dark:to-[#28243E]"
                    }
                  `}
                >
                  {subiendo ? (
                    <>
                      <LoaderCircle
                        size={48}
                        className="animate-spin text-[#7771E8]"
                      />

                      <h3 className="mt-5 text-xl font-black">
                        Subiendo material...
                      </h3>

                      <p className="mt-2 text-sm text-[#6085A5] dark:text-slate-300">
                        Espera un momento. Estamos guardando el archivo.
                      </p>
                    </>
                  ) : (
                    <>
                      <Image
                        src="/subirmaterial.png"
                        alt="Subir material"
                        width={150}
                        height={150}
                        className="object-contain"
                      />

                      <h3 className="mt-3 text-xl font-black">
                        Selecciona tu archivo
                      </h3>

                      <p className="mt-2 max-w-lg text-sm leading-6 text-[#6085A5] dark:text-slate-400">
                        PDF, Word, PowerPoint, TXT o imágenes. Tamaño máximo:{" "}
                        {esPremium
                          ? "25 MB."
                          : "10 MB en el plan gratuito."}
                      </p>

                      <div className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] px-7 py-3 font-black text-white">
                        <Upload size={19} />
                        Subir material
                      </div>
                    </>
                  )}
                </label>

                <input
                  id="archivo-dashboard"
                  type="file"
                  className="hidden"
                  disabled={subiendo}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.webp"
                  onChange={subirArchivo}
                />
              </section>

              {/* MIS ESTUDIOS */}

              <section>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">
                      Mis Estudios
                    </h2>

                    <p className="mt-1 text-sm text-[#6085A5] dark:text-slate-400">
                      Revisa y utiliza tus materiales.
                    </p>
                  </div>

                  {materiales.length > 3 &&
                    !busqueda && (
                      <button
                        type="button"
                        onClick={() =>
                          setMostrarTodos(
                            !mostrarTodos
                          )
                        }
                        className="shrink-0 font-bold text-[#1687D9]"
                      >
                        {mostrarTodos
                          ? "Ver menos"
                          : "Ver todos"}
                      </button>
                    )}
                </div>

                {cargandoMateriales ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[25px] bg-white p-7 shadow-sm dark:bg-[#182437]">
                    <LoaderCircle
                      size={45}
                      className="animate-spin text-[#55A8E8]"
                    />

                    <p className="mt-4 font-bold text-[#6085A5]">
                      Cargando materiales...
                    </p>
                  </div>
                ) : materiales.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[25px] bg-white p-7 text-center shadow-sm dark:bg-[#182437]">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#F0F8FD] dark:bg-slate-700">
                      <FilePlus2
                        size={45}
                        className="text-[#7B9BB8]"
                      />
                    </div>

                    <h3 className="mt-6 text-xl font-black">
                      No tienes materiales todavía
                    </h3>

                    <p className="mt-3 max-w-md leading-7 text-[#6085A5] dark:text-slate-400">
                      Utiliza el área de subida para comenzar a estudiar.
                    </p>
                  </div>
                ) : materialesVisibles.length === 0 ? (
                  <div className="rounded-[25px] bg-white p-10 text-center shadow-sm dark:bg-[#182437]">
                    <Search
                      size={48}
                      className="mx-auto text-[#9BB2C8]"
                    />

                    <h3 className="mt-5 text-xl font-black">
                      No encontramos materiales
                    </h3>

                    <p className="mt-2 text-sm text-[#6085A5]">
                      Intenta buscar con otro nombre.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setBusqueda("")
                      }
                      className="mt-5 rounded-xl bg-[#EAF1FF] px-5 py-3 font-bold text-[#1769E0]"
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {materialesVisibles.map(
                      (
                        material,
                        indice
                      ) => (
                        <article
                          key={material.id}
                          className="rounded-[22px] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-[#182437]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={`
                                flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                                ${
                                  indice % 3 === 0
                                    ? "bg-[#E9E2FF] text-[#7652D9]"
                                    : indice % 3 === 1
                                    ? "bg-[#DDF3FF] text-[#1687D9]"
                                    : "bg-[#DDF7EA] text-[#26A66B]"
                                }
                              `}
                            >
                              <FileText size={22} />
                            </div>

                            <span className="rounded-full bg-[#F1F8FD] px-3 py-1 text-xs font-bold text-[#6085A5] dark:bg-slate-700">
                              {obtenerExtension(
                                material.nombre_archivo
                              ).toUpperCase() ||
                                "FILE"}
                            </span>
                          </div>

                          <h3 className="mt-4 line-clamp-2 min-h-[48px] font-black">
                            {material.nombre_archivo}
                          </h3>

                          <p className="mt-2 text-xs text-[#8AA4BE]">
                            {formatearFecha(
                              material.fecha_subida
                            )}
                          </p>

                          <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between text-xs font-bold">
                              <span className="text-[#6085A5]">
                                Progreso
                              </span>

                              <span>
                                {material.progreso}%
                              </span>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-[#E7ECF4] dark:bg-slate-700">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#55A8E8] to-[#7771E8]"
                                style={{
                                  width:
                                    `${material.progreso}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                abrirMaterial(
                                  material
                                )
                              }
                              className="flex items-center justify-center gap-2 rounded-xl bg-[#F1F8FD] py-3 text-sm font-bold text-[#1687D9] transition hover:bg-[#E4F3FC] dark:bg-slate-700"
                            >
                              <Eye size={17} />
                              Revisar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                abrirOpcionesMaterial(
                                  material
                                )
                              }
                              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] py-3 text-sm font-black text-white"
                            >
                              Estudiar
                              <ArrowRight size={17} />
                            </button>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )}
              </section>

              {/* ACCIONES */}

              <section>
                <h2 className="mb-5 text-2xl font-black">
                  ¿Qué puedes hacer?
                </h2>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                  <AccionRapida
                    href="/metodos/pomodoro"
                    icono={Timer}
                    titulo="Pomodoro"
                    descripcion="Estudia en sesiones de concentración."
                    estiloIcono="bg-[#FFE6E8] text-[#EE5A68]"
                  />

                  <AccionRapida
                    href="/metodos/resumenes"
                    icono={FileText}
                    titulo="Crear resumen"
                    descripcion="Convierte materiales en guías."
                    estiloIcono="bg-[#E9E2FF] text-[#7652D9]"
                  />

                  <AccionRapida
                    href="/quizzes"
                    icono={ClipboardCheck}
                    titulo="Crear quiz"
                    descripcion="Evalúa lo que aprendiste."
                    estiloIcono="bg-[#DDF7EA] text-[#26A66B]"
                  />

                  <AccionRapida
                    href="/metodos/flashcards"
                    icono={Layers3}
                    titulo="Flashcards"
                    descripcion="Memoriza con tarjetas."
                    estiloIcono="bg-[#DDF3FF] text-[#1687D9]"
                  />

                  <AccionRapida
                    href="/perfil"
                    icono={Trophy}
                    titulo="Ver progreso"
                    descripcion="Revisa tu nivel y experiencia."
                    estiloIcono="bg-[#FFF1C9] text-[#EBA900]"
                  />
                </div>
              </section>
            </div>

            {/* COLUMNA DERECHA */}

            <aside className="space-y-7">
              {/* PROGRESO */}

              <section className="rounded-[25px] bg-white p-7 shadow-sm dark:bg-[#182437]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">
                    Tu Progreso
                  </h2>

                  {cargandoActividad && (
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-[#55A8E8]"
                    />
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Image
                    src="/raccoon.png"
                    alt="Nivel"
                    width={70}
                    height={70}
                  />

                  <div className="flex items-center gap-2">
                    <Flame
                      size={25}
                      className="text-orange-500"
                    />

                    <div>
                      <p className="text-sm text-[#6085A5] dark:text-slate-400">
                        Racha
                      </p>

                      <p className="font-black">
                        {rachaActual}{" "}
                        {rachaActual === 1
                          ? "día"
                          : "días"}
                      </p>
                    </div>
                  </div>

                  <div className="h-12 w-px bg-[#E6EBF3] dark:bg-slate-700" />

                  <div className="flex items-center gap-2">
                    <Shield
                      size={27}
                      className="text-[#55A8E8]"
                    />

                    <p className="font-black">
                      Nivel {nivel}
                    </p>
                  </div>
                </div>

                <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#E7ECF4] dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#55A8E8] to-[#7771E8]"
                    style={{
                      width:
                        `${porcentajeXp}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-right text-sm font-semibold text-[#6085A5]">
                  XP: {xpNivel} / {xpMax}
                </p>
              </section>

              {/* IA */}

              <section className="relative overflow-hidden rounded-[25px] bg-gradient-to-br from-[#F1EDFF] via-[#F7F4FF] to-[#EEF8FF] p-7 dark:from-[#28243E] dark:via-[#24263F] dark:to-[#1C304D]">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#7652D9]/10" />

                <div className="relative flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#55A8E8] to-[#7652D9] text-white shadow-lg">
                    <Bot size={27} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black">
                        Raccoon IA
                      </h2>

                      <span className="flex items-center gap-1 rounded-full bg-[#DDF7EA] px-2 py-1 text-[10px] font-black text-[#258A5B]">
                        <span className="h-2 w-2 rounded-full bg-[#26A66B]" />
                        En línea
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-[#7652D9]">
                      Tu tutor inteligente
                    </p>
                  </div>
                </div>

                <div className="relative mt-5 flex items-center justify-center">
                  <Image
                    src="/raccoon.png"
                    alt="Raccoon IA"
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>

                <p className="relative mt-3 text-center text-sm leading-6 text-[#6085A5] dark:text-slate-300">
                  Pregunta sobre tus materiales, tareas o temas de estudio y recibe ayuda personalizada.
                </p>

                <Link
                  href="/Chat"
                  className="relative mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#7652D9] py-3.5 font-black text-white shadow-lg shadow-[#7652D9]/20 transition hover:-translate-y-0.5"
                >
                  <MessageCircle size={18} />
                  Chatear con la IA
                </Link>
              </section>

              {/* CHATS */}

              <section className="rounded-[25px] bg-white p-7 shadow-sm dark:bg-[#182437]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">
                      Chats recientes
                    </h2>

                    <p className="mt-1 text-xs text-[#6085A5] dark:text-slate-400">
                      Continúa tus conversaciones.
                    </p>
                  </div>

                  <Link
                    href="/Chat"
                    className="shrink-0 text-sm font-bold text-[#1687D9]"
                  >
                    Ver todos
                  </Link>
                </div>

                {cargandoChats ? (
                  <div className="flex min-h-[190px] flex-col items-center justify-center">
                    <LoaderCircle
                      size={35}
                      className="animate-spin text-[#55A8E8]"
                    />

                    <p className="mt-3 text-sm font-semibold text-[#6085A5]">
                      Cargando chats...
                    </p>
                  </div>
                ) : chatsRecientes.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {chatsRecientes.map(
                      (chat) => (
                        <button
                          key={chat.id}
                          type="button"
                          onClick={() =>
                            abrirChat(chat)
                          }
                          className="flex w-full items-center gap-3 rounded-2xl border border-[#E7EDF5] p-3 text-left transition hover:border-[#55A8E8] hover:bg-[#F4FAFF] dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9E2FF] text-[#7652D9]">
                            <MessageCircle size={20} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black">
                              {chat.titulo}
                            </p>

                            <p className="mt-1 truncate text-xs text-[#6085A5] dark:text-slate-400">
                              {chat.ultimo_mensaje}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end">
                            <span className="text-[10px] font-semibold text-[#8AA4BE]">
                              {formatearFechaChat(
                                chat.fecha_actualizacion
                              )}
                            </span>

                            <ArrowRight
                              size={16}
                              className="mt-2 text-[#55A8E8]"
                            />
                          </div>
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-5 flex min-h-[190px] flex-col items-center justify-center rounded-2xl bg-[#F8FBFD] p-5 text-center dark:bg-slate-800">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF1FF] dark:bg-slate-700">
                      <MessagesSquare
                        size={30}
                        className="text-[#7990B3]"
                      />
                    </div>

                    <h3 className="mt-4 font-black">
                      Aún no hay conversaciones
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#6085A5] dark:text-slate-400">
                      Tus conversaciones con Raccoon IA aparecerán aquí.
                    </p>

                    <Link
                      href="/Chat"
                      className="mt-4 flex items-center gap-2 rounded-xl bg-[#EAF1FF] px-5 py-3 text-sm font-bold text-[#1769E0] dark:bg-[#1D3558]"
                    >
                      <MessageCircle size={17} />
                      Iniciar chat
                    </Link>
                  </div>
                )}
              </section>

              {/* ACTIVIDAD */}

              <section className="rounded-[25px] bg-white p-7 shadow-sm dark:bg-[#182437]">
                <h2 className="text-xl font-black">
                  Tu actividad
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <ActividadCard
                    icono={FileText}
                    valor={materiales.length}
                    nombre="Materiales"
                    estilo="bg-[#F1F8FD] text-[#1687D9]"
                  />

                  <ActividadCard
                    icono={CheckCircle2}
                    valor={materialesCompletados}
                    nombre="Completados"
                    estilo="bg-[#F3EDFF] text-[#7652D9]"
                  />

                  <ActividadCard
                    icono={ClipboardCheck}
                    valor={metricas.quizzes_completados}
                    nombre="Quizzes"
                    estilo="bg-[#DDF7EA] text-[#26A66B]"
                  />

                  <ActividadCard
                    icono={Layers3}
                    valor={metricas.tarjetas_dominadas}
                    nombre="Dominadas"
                    estilo="bg-[#FFF1C9] text-[#D89A00]"
                  />
                </div>
              </section>

              {/* TIEMPO */}

              <section className="rounded-[25px] bg-white p-7 shadow-sm dark:bg-[#182437]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">
                      Tiempo de Estudio
                    </h2>

                    <p className="mt-1 text-xs text-[#6085A5]">
                      Actividad de esta semana
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-[#EAF1FF] px-3 py-2 font-black text-[#1769E0] dark:bg-[#1D3558]">
                    <Clock3 size={17} />

                    {formatearTiempo(
                      metricas.total_segundos
                    )}
                  </div>
                </div>

                <div className="mt-7 flex h-32 items-end justify-between gap-3">
                  {alturasSemana.map(
                    (
                      altura,
                      indice
                    ) => (
                      <div
                        key={
                          diasSemana[indice]
                        }
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <div
                          title={`${Math.round(
                            metricas.segundos_semana[
                              indice
                            ] / 60
                          )} minutos`}
                          className={`
                            w-full rounded-t-md bg-gradient-to-t from-[#55A8E8] to-[#7771E8] transition-all
                            ${
                              metricas.segundos_semana[
                                indice
                              ] === 0
                                ? "opacity-20"
                                : "opacity-100"
                            }
                          `}
                          style={{
                            height:
                              `${altura}%`,
                          }}
                        />

                        <span className="text-xs text-[#6085A5]">
                          {diasSemana[indice]}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      {/* MODAL OPCIONES */}

      {mostrarOpcionesEstudio &&
        materialParaAccion && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl rounded-[30px] bg-white p-6 shadow-2xl dark:bg-[#182437] sm:p-8">
              <button
                type="button"
                onClick={() =>
                  setMostrarOpcionesEstudio(
                    false
                  )
                }
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5FA] text-[#6085A5] transition hover:text-red-500 dark:bg-slate-700"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>

              <div className="pr-12">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#DDF7EA] px-4 py-2 text-sm font-black text-[#258A5B]">
                  <CheckCircle2 size={17} />
                  Material listo
                </span>

                <h2 className="mt-5 text-3xl font-black">
                  ¿Cómo quieres estudiar?
                </h2>

                <p className="mt-2 line-clamp-2 text-[#6085A5] dark:text-slate-300">
                  {materialParaAccion.nombre_archivo}
                </p>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <OpcionEstudio
                  icono={Timer}
                  titulo="Pomodoro"
                  descripcion="Lee el material en sesiones de enfoque y descanso."
                  accion="Comenzar"
                  estiloTarjeta="border-[#FFE1E4] bg-[#FFF6F7] hover:border-[#EE5A68] dark:bg-[#2A1B22]"
                  estiloIcono="bg-[#FFE1E4] text-[#EE5A68]"
                  estiloAccion="text-[#EE5A68]"
                  onClick={() =>
                    void elegirAccionEstudio(
                      "pomodoro"
                    )
                  }
                />

                <OpcionEstudio
                  icono={FileText}
                  titulo="Generar resumen"
                  descripcion="Convierte el contenido en una guía organizada."
                  accion="Crear resumen"
                  estiloTarjeta="border-[#DFD7FF] bg-[#F8F5FF] hover:border-[#7652D9] dark:bg-[#28243E]"
                  estiloIcono="bg-[#E9E2FF] text-[#7652D9]"
                  estiloAccion="text-[#7652D9]"
                  onClick={() =>
                    void elegirAccionEstudio(
                      "resumen"
                    )
                  }
                />

                <OpcionEstudio
                  icono={ClipboardCheck}
                  titulo="Crear quiz"
                  descripcion="Evalúa tus conocimientos con preguntas."
                  accion="Crear quiz"
                  estiloTarjeta="border-[#CFEEDD] bg-[#F2FBF6] hover:border-[#26A66B] dark:bg-[#193028]"
                  estiloIcono="bg-[#DDF7EA] text-[#26A66B]"
                  estiloAccion="text-[#26A66B]"
                  onClick={() =>
                    void elegirAccionEstudio(
                      "quiz"
                    )
                  }
                />

                <OpcionEstudio
                  icono={Layers3}
                  titulo="Flashcards"
                  descripcion="Convierte el material en tarjetas para memorizar."
                  accion="Crear tarjetas"
                  estiloTarjeta="border-[#D7E3FF] bg-[#F5F8FF] hover:border-[#55A8E8] dark:bg-[#1C2A42]"
                  estiloIcono="bg-[#DDF3FF] text-[#1687D9]"
                  estiloAccion="text-[#1687D9]"
                  onClick={() =>
                    void elegirAccionEstudio(
                      "flashcards"
                    )
                  }
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-[#E7EDF5] pt-5 sm:flex-row sm:justify-between dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarOpcionesEstudio(
                      false
                    );

                    abrirMaterial(
                      materialParaAccion
                    );
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#F1F8FD] px-5 py-3 font-bold text-[#1687D9] dark:bg-slate-700"
                >
                  <Eye size={18} />
                  Revisar primero
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarOpcionesEstudio(
                      false
                    )
                  }
                  className="rounded-xl px-5 py-3 font-bold text-[#6085A5] hover:bg-[#F7FAFD] dark:hover:bg-slate-700"
                >
                  Solo guardar por ahora
                </button>
              </div>
            </div>
          </div>
        )}

      {/* VISOR INTERNO */}

      {materialAbierto && (
        <div className="fixed inset-0 z-[230] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5">
          <div className="flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[26px] bg-white shadow-2xl dark:bg-[#182437]">
            <div className="flex flex-col gap-4 border-b border-[#DDEAF7] px-5 py-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9E2FF] text-[#7652D9]">
                  <FileText size={22} />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-black">
                    {materialAbierto.nombre_archivo}
                  </h2>

                  <p className="mt-1 flex items-center gap-1 text-xs text-[#6085A5] dark:text-slate-400">
                    <Clock3 size={13} />
                    El tiempo de revisión se guarda automáticamente
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void elegirAccionEstudio(
                      "pomodoro",
                      materialAbierto
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#FFF0F2] px-3 py-2 text-sm font-bold text-[#EE5A68] dark:bg-[#2A1B22]"
                >
                  <Timer size={17} />
                  Pomodoro
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void elegirAccionEstudio(
                      "resumen",
                      materialAbierto
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#F3EDFF] px-3 py-2 text-sm font-bold text-[#7652D9] dark:bg-[#302747]"
                >
                  <FileText size={17} />
                  Resumen
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void elegirAccionEstudio(
                      "quiz",
                      materialAbierto
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#EDF9F2] px-3 py-2 text-sm font-bold text-[#26A66B] dark:bg-[#193028]"
                >
                  <ClipboardCheck size={17} />
                  Quiz
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void elegirAccionEstudio(
                      "flashcards",
                      materialAbierto
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#EAF5FF] px-3 py-2 text-sm font-bold text-[#1687D9] dark:bg-[#1D3558]"
                >
                  <Layers3 size={17} />
                  Flashcards
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void cerrarVisor()
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#6085A5] transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                  aria-label="Cerrar visor"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden bg-[#EDF3F8] dark:bg-[#101827]">
              {errorVisor ? (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <FileText
                    size={55}
                    className="text-[#9BB2C8]"
                  />

                  <h3 className="mt-5 text-xl font-black">
                    No se pudo mostrar el archivo
                  </h3>

                  <p className="mt-2 max-w-md text-[#6085A5] dark:text-slate-400">
                    {errorVisor}
                  </p>
                </div>
              ) : esImagen(
                  extensionAbierta
                ) ? (
                <div className="flex h-full items-center justify-center overflow-auto p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      materialAbierto.url_archivo
                    }
                    alt={
                      materialAbierto.nombre_archivo
                    }
                    className="max-h-full max-w-full rounded-xl object-contain shadow-xl"
                    onError={() =>
                      setErrorVisor(
                        "No se pudo cargar la imagen."
                      )
                    }
                  />
                </div>
              ) : extensionAbierta ===
                  "txt" ||
                extensionAbierta === "md" ? (
                <div className="h-full overflow-y-auto p-5 sm:p-8">
                  {cargandoTexto ? (
                    <div className="flex h-full flex-col items-center justify-center">
                      <LoaderCircle
                        size={44}
                        className="animate-spin text-[#55A8E8]"
                      />

                      <p className="mt-4 font-bold text-[#6085A5]">
                        Cargando documento...
                      </p>
                    </div>
                  ) : (
                    <article className="mx-auto min-h-full max-w-4xl rounded-2xl bg-white p-6 shadow-sm dark:bg-[#182437] sm:p-10">
                      <h1 className="border-b border-[#E7EDF5] pb-5 text-2xl font-black dark:border-slate-700">
                        {materialAbierto.nombre_archivo}
                      </h1>

                      <pre className="mt-6 whitespace-pre-wrap break-words font-sans text-base leading-8 text-[#405E7A] dark:text-slate-300">
                        {textoArchivo}
                      </pre>
                    </article>
                  )}
                </div>
              ) : esDocumentoOffice(
                  extensionAbierta
                ) ? (
                <iframe
                  src={urlOffice}
                  className="h-full w-full border-0"
                  title={`Visor de ${materialAbierto.nombre_archivo}`}
                  onError={() =>
                    setErrorVisor(
                      "No se pudo cargar Word o PowerPoint. Verifica que el archivo sea público."
                    )
                  }
                />
              ) : (
                <iframe
                  src={
                    materialAbierto.url_archivo
                  }
                  className="h-full w-full border-0"
                  title={`Material ${materialAbierto.nombre_archivo}`}
                  onError={() =>
                    setErrorVisor(
                      "El navegador no pudo mostrar este archivo."
                    )
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* NAVEGACIÓN MÓVIL */}

      <nav className="fixed bottom-0 left-0 z-30 flex w-full justify-around border-t border-[#DDEAF7] bg-white py-3 dark:border-slate-700 dark:bg-[#151F30] lg:hidden">
        <Link href="/Dashboard">
          <Home
            size={22}
            className="text-[#1687D9]"
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
            className="text-[#7990B3]"
          />
        </Link>
      </nav>
    </main>
  );
}

/* =====================================================
   COMPONENTES
===================================================== */

function AccionRapida({
  href,
  icono: Icono,
  titulo,
  descripcion,
  estiloIcono,
}: {
  href: string;
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  estiloIcono: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-[#182437]"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${estiloIcono}`}
      >
        <Icono size={24} />
      </div>

      <h3 className="mt-5 font-black">
        {titulo}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-[#6085A5] dark:text-slate-400">
        {descripcion}
      </p>
    </Link>
  );
}

function ActividadCard({
  icono: Icono,
  valor,
  nombre,
  estilo,
}: {
  icono: LucideIcon;
  valor: number;
  nombre: string;
  estilo: string;
}) {
  return (
    <div className={`rounded-2xl p-4 ${estilo}`}>
      <Icono size={22} />

      <p className="mt-3 text-2xl font-black text-[#10233F] dark:text-white">
        {valor}
      </p>

      <p className="mt-1 text-xs text-[#6085A5] dark:text-slate-300">
        {nombre}
      </p>
    </div>
  );
}

function OpcionEstudio({
  icono: Icono,
  titulo,
  descripcion,
  accion,
  estiloTarjeta,
  estiloIcono,
  estiloAccion,
  onClick,
}: {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  accion: string;
  estiloTarjeta: string;
  estiloIcono: string;
  estiloAccion: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-[22px] border p-5 text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 ${estiloTarjeta}`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${estiloIcono}`}
      >
        <Icono size={28} />
      </div>

      <h3 className="mt-5 text-xl font-black">
        {titulo}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#6085A5] dark:text-slate-300">
        {descripcion}
      </p>

      <div
        className={`mt-5 flex items-center gap-2 font-black ${estiloAccion}`}
      >
        {accion}

        <ArrowRight
          size={17}
          className="transition group-hover:translate-x-1"
        />
      </div>
    </button>
  );
}