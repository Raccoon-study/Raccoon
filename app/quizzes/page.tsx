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
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Crown,
  FileText,
  FileUp,
  Flame,
  FolderOpen,
  HelpCircle,
  Home,
  Library,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Sun,
  Target,
  TextCursorInput,
  ToggleLeft,
  Trophy,
  Upload,
  User,
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

type TipoFuente =
  | "archivo"
  | "texto"
  | "biblioteca";

type TipoPregunta =
  | "multiple"
  | "true_false"
  | "short"
  | "mixed";

type Dificultad =
  | "easy"
  | "medium"
  | "hard";

interface ElementoMenu {
  nombre: string;
  href: string;
  icono: LucideIcon;
  activo?: boolean;
}

interface Material {
  id: string;
  nombre_archivo: string;
  url_archivo: string;
  fecha_subida: string;
}

interface PreguntaQuiz {
  id: string;
  tipo:
    | "multiple"
    | "true_false"
    | "short";
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
  explicacion: string;
}

interface QuizGuardado {
  id: string;
  usuario_id: string;
  titulo: string;
  materia: string;
  tipo_preguntas: TipoPregunta;
  cantidad_preguntas: number;
  dificultad: Dificultad;
  preguntas: PreguntaQuiz[];
  estado: string;
  respuestas_correctas: number;
  preguntas_respondidas: number;
  precision: number;
  fecha_creacion: string;
  fecha_completado: string | null;
}

interface RespuestaGenerarQuiz {
  success: boolean;
  quiz: QuizGuardado;
  premium: boolean;
  quizzes_restantes?: number | null;
}

interface ResultadoRespuesta {
  pregunta_id: string;
  respuesta_usuario: string;
  correcta: boolean;
}

interface ResultadoFinal {
  correctas: number;
  total: number;
  precision: number;
}

/* =====================================================
   MENÚ
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
    activo: true,
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

/* =====================================================
   OPCIONES
===================================================== */

const tiposPregunta: Array<{
  id: TipoPregunta;
  nombre: string;
  descripcion: string;
  icono: LucideIcon;
  premium: boolean;
}> = [
  {
    id: "multiple",
    nombre: "Opción múltiple",
    descripcion: "Selecciona una respuesta.",
    icono: ListChecks,
    premium: false,
  },
  {
    id: "true_false",
    nombre: "Verdadero o falso",
    descripcion: "Decide si la afirmación es correcta.",
    icono: ToggleLeft,
    premium: false,
  },
  {
    id: "short",
    nombre: "Respuesta corta",
    descripcion: "Escribe la respuesta correcta.",
    icono: TextCursorInput,
    premium: true,
  },
  {
    id: "mixed",
    nombre: "Mixto",
    descripcion: "Combina todos los tipos.",
    icono: Shuffle,
    premium: true,
  },
];

const cantidades = [
  {
    valor: 5,
    premium: false,
  },
  {
    valor: 10,
    premium: false,
  },
  {
    valor: 15,
    premium: true,
  },
  {
    valor: 20,
    premium: true,
  },
  {
    valor: 25,
    premium: true,
  },
];

const dificultades: Array<{
  id: Dificultad;
  nombre: string;
  descripcion: string;
  color: string;
  premium: boolean;
}> = [
  {
    id: "easy",
    nombre: "Fácil",
    descripcion: "Conceptos básicos",
    color: "bg-[#25B873]",
    premium: false,
  },
  {
    id: "medium",
    nombre: "Intermedio",
    descripcion: "Comprensión y análisis",
    color: "bg-[#F5B82E]",
    premium: false,
  },
  {
    id: "hard",
    nombre: "Avanzado",
    descripcion: "Análisis profundo",
    color: "bg-[#EF5B67]",
    premium: true,
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

function obtenerMensajeError(
  valor: unknown
): string {
  if (!esObjeto(valor)) {
    return "No se pudo completar la solicitud.";
  }

  if (
    typeof valor.error === "string" &&
    valor.error.trim()
  ) {
    return valor.error;
  }

  if (
    typeof valor.message === "string" &&
    valor.message.trim()
  ) {
    return valor.message;
  }

  return "No se pudo completar la solicitud.";
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

function normalizarMaterial(
  dato: Record<string, unknown>
): Material {
  return {
    id: String(dato.id || ""),

    nombre_archivo:
      typeof dato.nombre_archivo === "string"
        ? dato.nombre_archivo
        : "Material sin nombre",

    url_archivo:
      typeof dato.url_archivo === "string"
        ? dato.url_archivo
        : "",

    fecha_subida:
      typeof dato.fecha_subida === "string"
        ? dato.fecha_subida
        : new Date().toISOString(),
  };
}

function esPreguntaQuiz(
  valor: unknown
): valor is PreguntaQuiz {
  if (!esObjeto(valor)) {
    return false;
  }

  return (
    typeof valor.id === "string" &&
    typeof valor.tipo === "string" &&
    typeof valor.pregunta === "string" &&
    Array.isArray(valor.opciones) &&
    valor.opciones.every(
      (opcion) =>
        typeof opcion === "string"
    ) &&
    typeof valor.respuesta_correcta ===
      "string" &&
    typeof valor.explicacion === "string"
  );
}

function normalizarQuiz(
  dato: Record<string, unknown>
): QuizGuardado {
  const preguntas =
    Array.isArray(dato.preguntas)
      ? dato.preguntas.filter(
          esPreguntaQuiz
        )
      : [];

  return {
    id: String(dato.id || ""),

    usuario_id: String(
      dato.usuario_id || ""
    ),

    titulo:
      typeof dato.titulo === "string"
        ? dato.titulo
        : "Quiz sin título",

    materia:
      typeof dato.materia === "string"
        ? dato.materia
        : "General",

    tipo_preguntas:
      dato.tipo_preguntas ===
        "true_false" ||
      dato.tipo_preguntas === "short" ||
      dato.tipo_preguntas === "mixed"
        ? dato.tipo_preguntas
        : "multiple",

    cantidad_preguntas: Number(
      dato.cantidad_preguntas ||
        preguntas.length
    ),

    dificultad:
      dato.dificultad === "medium" ||
      dato.dificultad === "hard"
        ? dato.dificultad
        : "easy",

    preguntas,

    estado:
      typeof dato.estado === "string"
        ? dato.estado
        : "creado",

    respuestas_correctas: Number(
      dato.respuestas_correctas || 0
    ),

    preguntas_respondidas: Number(
      dato.preguntas_respondidas || 0
    ),

    precision: Number(
      dato.precision || 0
    ),

    fecha_creacion:
      typeof dato.fecha_creacion ===
      "string"
        ? dato.fecha_creacion
        : new Date().toISOString(),

    fecha_completado:
      typeof dato.fecha_completado ===
      "string"
        ? dato.fecha_completado
        : null,
  };
}

function normalizarRespuesta(
  texto: string
): string {
  return texto
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?¿¡]/g, "")
    .replace(/\s+/g, " ");
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

function nombreDificultad(
  dificultad: Dificultad
): string {
  if (dificultad === "hard") {
    return "Avanzado";
  }

  if (dificultad === "medium") {
    return "Intermedio";
  }

  return "Fácil";
}

function nombreTipoPregunta(
  tipo: TipoPregunta
): string {
  if (tipo === "true_false") {
    return "Verdadero o falso";
  }

  if (tipo === "short") {
    return "Respuesta corta";
  }

  if (tipo === "mixed") {
    return "Mixto";
  }

  return "Opción múltiple";
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

  return "Gratuito";
}

/* =====================================================
   COMPONENTE PRINCIPAL
===================================================== */

export default function QuizzesPage() {
  const router = useRouter();

  const inputArchivoRef =
    useRef<HTMLInputElement | null>(
      null
    );

  /* USUARIO */

  const [
    nombreUsuario,
    setNombreUsuario,
  ] = useState("Usuario");

  const [fotoPerfil, setFotoPerfil] =
    useState("/raccoon.png");

  const [planActual, setPlanActual] =
    useState<PlanType>("free");

  const [cargandoPlan, setCargandoPlan] =
    useState(true);

  const esPremium =
    planActual === "month" ||
    planActual === "year";

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

  const [
    mostrarPremium,
    setMostrarPremium,
  ] = useState(false);

  const [
    mostrarBiblioteca,
    setMostrarBiblioteca,
  ] = useState(false);

  /* FUENTE */

  const [tipoFuente, setTipoFuente] =
    useState<TipoFuente>("archivo");

  const [
    archivoSeleccionado,
    setArchivoSeleccionado,
  ] = useState<File | null>(null);

  const [
    textoPegado,
    setTextoPegado,
  ] = useState("");

  const [
    materiales,
    setMateriales,
  ] = useState<Material[]>([]);

  const [
    materialSeleccionado,
    setMaterialSeleccionado,
  ] = useState<Material | null>(null);

  const [
    cargandoMateriales,
    setCargandoMateriales,
  ] = useState(true);

  const [
    busquedaMaterial,
    setBusquedaMaterial,
  ] = useState("");

  /* CONFIGURACIÓN */

  const [
    tipoPregunta,
    setTipoPregunta,
  ] =
    useState<TipoPregunta>(
      "multiple"
    );

  const [
    cantidadPreguntas,
    setCantidadPreguntas,
  ] = useState(10);

  const [
    dificultad,
    setDificultad,
  ] =
    useState<Dificultad>(
      "medium"
    );

  /* QUIZ */

  const [
    generandoQuiz,
    setGenerandoQuiz,
  ] = useState(false);

  const [
    estadoGeneracion,
    setEstadoGeneracion,
  ] = useState("");

  const [
    quizActivo,
    setQuizActivo,
  ] = useState<QuizGuardado | null>(
    null
  );

  const [
    indicePregunta,
    setIndicePregunta,
  ] = useState(0);

  const [
    respuestaUsuario,
    setRespuestaUsuario,
  ] = useState("");

  const [
    respuestaComprobada,
    setRespuestaComprobada,
  ] = useState(false);

  const [
    ultimaRespuestaCorrecta,
    setUltimaRespuestaCorrecta,
  ] = useState<boolean | null>(
    null
  );

  const [
    respuestas,
    setRespuestas,
  ] =
    useState<ResultadoRespuesta[]>(
      []
    );

  const [
    resultadoFinal,
    setResultadoFinal,
  ] = useState<ResultadoFinal | null>(
    null
  );

  const [
    guardandoResultado,
    setGuardandoResultado,
  ] = useState(false);

  /* HISTORIAL */

  const [
    quizzesRecientes,
    setQuizzesRecientes,
  ] = useState<QuizGuardado[]>([]);

  const [
    cargandoQuizzes,
    setCargandoQuizzes,
  ] = useState(true);

  /* =====================================================
     INICIAR
  ===================================================== */

  useEffect(() => {
    const iniciar = async () => {
      inicializarTema();

      const usuarioValido =
        await cargarUsuarioYPlan();

      if (!usuarioValido) {
        return;
      }

      await Promise.all([
        cargarMateriales(),
        cargarQuizzes(),
      ]);

      cargarMaterialPendiente();
    };

    void iniciar();
  }, []);

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

    const oscuro =
      temaGuardado === "dark" ||
      (!temaGuardado &&
        sistemaOscuro);

    setModoOscuro(oscuro);

    document.documentElement.classList.toggle(
      "dark",
      oscuro
    );

    document.documentElement.style.colorScheme =
      oscuro ? "dark" : "light";
  };

  const cambiarTema = () => {
    setModoOscuro((actual) => {
      const nuevo = !actual;

      document.documentElement.classList.toggle(
        "dark",
        nuevo
      );

      document.documentElement.style.colorScheme =
        nuevo ? "dark" : "light";

      localStorage.setItem(
        "raccoon-theme",
        nuevo ? "dark" : "light"
      );

      return nuevo;
    });

    setPerfilAbierto(false);
  };

  /* =====================================================
     NOTIFICACIONES
  ===================================================== */

  const mostrarNotificacion = (
    mensaje: string
  ) => {
    setNotificacion(mensaje);

    window.setTimeout(() => {
      setNotificacion("");
    }, 5000);
  };

  /* =====================================================
     USUARIO Y PLAN
  ===================================================== */

  const cargarUsuarioYPlan =
    async (): Promise<boolean> => {
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
          return false;
        }

        const metadata = {
          ...(user.user_metadata || {}),
          ...(user.app_metadata || {}),
        };

        setNombreUsuario(
          metadata.nombre ||
            metadata.full_name ||
            metadata.name ||
            user.email?.split("@")[0] ||
            "Usuario"
        );

        if (metadata.avatar_url) {
          setFotoPerfil(
            metadata.avatar_url
          );
        }

        const premiumMetadata =
          metadata.premium === true ||
          metadata.is_premium === true ||
          metadata.es_premium === true;

        const planMetadata =
          normalizarPlan(
            metadata.plan ||
              metadata.subscription ||
              metadata.tipo_plan,
            premiumMetadata
          );

        setPlanActual(planMetadata);

        try {
          const respuesta = await fetch(
            "/api/suscripciones",
            {
              method: "GET",

              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },

              cache: "no-store",
            }
          );

          if (respuesta.ok) {
            const datos: unknown =
              await respuesta.json();

            if (esObjeto(datos)) {
              const premiumServidor =
                datos.premium === true ||
                datos.is_premium === true ||
                datos.es_premium === true;

              setPlanActual(
                normalizarPlan(
                  datos.plan ||
                    datos.subscription ||
                    datos.tipo_plan,
                  premiumServidor
                )
              );
            }
          }
        } catch {
          // Los metadatos continúan como respaldo.
        }

        return true;
      } catch (error) {
        console.error(
          "Error cargando usuario:",
          error
        );

        mostrarNotificacion(
          "No se pudo cargar tu información."
        );

        return false;
      } finally {
        setCargandoPlan(false);
      }
    };

  /* =====================================================
     MATERIALES
  ===================================================== */

  const cargarMateriales =
    async () => {
      try {
        setCargandoMateriales(true);

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data, error } =
          await supabase
            .from("materiales")
            .select(
              "id, nombre_archivo, url_archivo, fecha_subida"
            )
            .eq(
              "usuario_id",
              user.id
            )
            .order("fecha_subida", {
              ascending: false,
            });

        if (error) {
          throw new Error(
            error.message
          );
        }

        setMateriales(
          (data || []).map(
            (material) =>
              normalizarMaterial(
                material as Record<
                  string,
                  unknown
                >
              )
          )
        );
      } catch (error) {
        console.error(
          "Error cargando materiales:",
          error
        );

        setMateriales([]);
      } finally {
        setCargandoMateriales(false);
      }
    };

  const cargarMaterialPendiente =
    () => {
      const contenido =
        localStorage.getItem(
          "quiz-material"
        );

      if (!contenido) {
        return;
      }

      try {
        const material: unknown =
          JSON.parse(contenido);

        if (!esObjeto(material)) {
          return;
        }

        const contenidoTexto =
          typeof material.contenido ===
          "string"
            ? material.contenido
            : "";

        const urlArchivo =
          typeof material.url_archivo ===
          "string"
            ? material.url_archivo
            : "";

        const nombreArchivo =
          typeof material.nombre_archivo ===
          "string"
            ? material.nombre_archivo
            : typeof material.titulo ===
                "string"
              ? material.titulo
              : "Material seleccionado";

        const materialId = String(
          material.material_id ||
            material.id ||
            ""
        );

        if (
          contenidoTexto.trim().length >=
          40
        ) {
          setTipoFuente("texto");
          setTextoPegado(
            contenidoTexto
          );

          mostrarNotificacion(
            "El contenido está listo para crear el quiz."
          );

          return;
        }

        if (
          urlArchivo &&
          materialId
        ) {
          setTipoFuente(
            "biblioteca"
          );

          setMaterialSeleccionado({
            id: materialId,
            nombre_archivo:
              nombreArchivo,
            url_archivo:
              urlArchivo,
            fecha_subida:
              typeof material.fecha_subida ===
              "string"
                ? material.fecha_subida
                : new Date().toISOString(),
          });

          mostrarNotificacion(
            "El material está listo para crear el quiz."
          );
        }
      } catch (error) {
        console.error(
          "Material pendiente inválido:",
          error
        );
      }
    };

  /* =====================================================
     HISTORIAL
  ===================================================== */

  const cargarQuizzes = async () => {
    try {
      setCargandoQuizzes(true);

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data, error } =
        await supabase
          .from("quizzes")
          .select("*")
          .eq(
            "usuario_id",
            user.id
          )
          .order("fecha_creacion", {
            ascending: false,
          })
          .limit(10);

      if (error) {
        console.warn(
          "No se pudo cargar la tabla quizzes:",
          error.message
        );

        setQuizzesRecientes([]);
        return;
      }

      setQuizzesRecientes(
        (data || []).map((quiz) =>
          normalizarQuiz(
            quiz as Record<
              string,
              unknown
            >
          )
        )
      );
    } catch (error) {
      console.error(error);
      setQuizzesRecientes([]);
    } finally {
      setCargandoQuizzes(false);
    }
  };

  /* =====================================================
     FUENTES
  ===================================================== */

  const seleccionarFuente = (
    fuente: TipoFuente
  ) => {
    setTipoFuente(fuente);

    if (fuente === "archivo") {
      setTextoPegado("");
      setMaterialSeleccionado(null);
    }

    if (fuente === "texto") {
      setArchivoSeleccionado(null);
      setMaterialSeleccionado(null);
    }

    if (fuente === "biblioteca") {
      setArchivoSeleccionado(null);
      setTextoPegado("");
      setMostrarBiblioteca(true);
    }
  };

  const seleccionarArchivo = (
    evento: ChangeEvent<HTMLInputElement>
  ) => {
    const archivo =
      evento.target.files?.[0];

    if (!archivo) {
      return;
    }

    const extension =
      archivo.name
        .split(".")
        .pop()
        ?.toLowerCase() || "";

    const permitidas = [
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

    if (!permitidas.includes(extension)) {
      mostrarNotificacion(
        "Formato no permitido. Usa PDF, Word, PowerPoint, TXT o imagen."
      );

      evento.target.value = "";
      return;
    }

    const limite =
      esPremium
        ? 25 * 1024 * 1024
        : 10 * 1024 * 1024;

    if (archivo.size > limite) {
      mostrarNotificacion(
        esPremium
          ? "El archivo no puede superar los 25 MB."
          : "El plan gratuito permite archivos de hasta 10 MB."
      );

      evento.target.value = "";
      return;
    }

    setArchivoSeleccionado(
      archivo
    );

    setTipoFuente("archivo");
  };

  const elegirMaterialBiblioteca = (
    material: Material
  ) => {
    setMaterialSeleccionado(
      material
    );

    setTipoFuente(
      "biblioteca"
    );

    setMostrarBiblioteca(false);

    mostrarNotificacion(
      "Material seleccionado."
    );
  };

  /* =====================================================
     OPCIONES PREMIUM
  ===================================================== */

  const seleccionarTipoPregunta = (
    tipo: TipoPregunta,
    premium: boolean
  ) => {
    if (
      premium &&
      !esPremium
    ) {
      setMostrarPremium(true);
      return;
    }

    setTipoPregunta(tipo);
  };

  const seleccionarCantidad = (
    cantidad: number,
    premium: boolean
  ) => {
    if (
      premium &&
      !esPremium
    ) {
      setMostrarPremium(true);
      return;
    }

    setCantidadPreguntas(cantidad);
  };

  const seleccionarDificultad = (
    nuevaDificultad: Dificultad,
    premium: boolean
  ) => {
    if (
      premium &&
      !esPremium
    ) {
      setMostrarPremium(true);
      return;
    }

    setDificultad(
      nuevaDificultad
    );
  };

  /* =====================================================
     GENERAR QUIZ
  ===================================================== */

  const generarQuiz = async () => {
    if (generandoQuiz) {
      return;
    }

    if (
      tipoPregunta === "short" ||
      tipoPregunta === "mixed"
    ) {
      if (!esPremium) {
        setMostrarPremium(true);
        return;
      }
    }

    if (
      cantidadPreguntas > 10 &&
      !esPremium
    ) {
      setMostrarPremium(true);
      return;
    }

    if (
      dificultad === "hard" &&
      !esPremium
    ) {
      setMostrarPremium(true);
      return;
    }

    if (
      tipoFuente === "archivo" &&
      !archivoSeleccionado
    ) {
      mostrarNotificacion(
        "Selecciona un archivo primero."
      );

      return;
    }

    if (
      tipoFuente === "texto" &&
      textoPegado.trim().length < 50
    ) {
      mostrarNotificacion(
        "Escribe o pega al menos 50 caracteres."
      );

      return;
    }

    if (
      tipoFuente === "biblioteca" &&
      !materialSeleccionado
    ) {
      mostrarNotificacion(
        "Selecciona un material de la biblioteca."
      );

      return;
    }

    try {
      setGenerandoQuiz(true);

      setEstadoGeneracion(
        "Preparando tu material..."
      );

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!session) {
        router.replace("/Login");
        return;
      }

      const formulario =
        new FormData();

      formulario.append(
        "fuente",
        tipoFuente
      );

      formulario.append(
        "tipo_preguntas",
        tipoPregunta
      );

      formulario.append(
        "cantidad_preguntas",
        String(cantidadPreguntas)
      );

      formulario.append(
        "dificultad",
        dificultad
      );

      if (
        tipoFuente === "archivo" &&
        archivoSeleccionado
      ) {
        formulario.append(
          "archivo",
          archivoSeleccionado
        );
      }

      if (
        tipoFuente === "texto"
      ) {
        formulario.append(
          "texto",
          textoPegado.trim()
        );
      }

      if (
        tipoFuente ===
          "biblioteca" &&
        materialSeleccionado
      ) {
        formulario.append(
          "material_id",
          materialSeleccionado.id
        );

        formulario.append(
          "material_nombre",
          materialSeleccionado.nombre_archivo
        );

        formulario.append(
          "material_url",
          materialSeleccionado.url_archivo
        );
      }

      setEstadoGeneracion(
        "Raccoon está analizando el contenido..."
      );

      const respuesta = await fetch(
        "/api/quizzes/generar",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },

          body: formulario,
        }
      );

      const tipoContenido =
        respuesta.headers.get(
          "content-type"
        ) || "";

      let datos: unknown;

      if (
        tipoContenido.includes(
          "application/json"
        )
      ) {
        datos = await respuesta.json();
      } else {
        datos = {
          error:
            (await respuesta.text()) ||
            `Error ${respuesta.status}`,
        };
      }

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeError(datos)
        );
      }

      if (
        !esObjeto(datos) ||
        !esObjeto(datos.quiz)
      ) {
        throw new Error(
          "La API devolvió un quiz incorrecto."
        );
      }

      const resultado =
        datos as unknown as RespuestaGenerarQuiz;

      const nuevoQuiz =
        normalizarQuiz(
          resultado.quiz as unknown as Record<
            string,
            unknown
          >
        );

      if (
        nuevoQuiz.preguntas.length ===
        0
      ) {
        throw new Error(
          "La IA no generó preguntas."
        );
      }

      setEstadoGeneracion(
        "¡Quiz terminado!"
      );

      setQuizActivo(nuevoQuiz);
      setIndicePregunta(0);
      setRespuestaUsuario("");
      setRespuestaComprobada(false);
      setUltimaRespuestaCorrecta(null);
      setRespuestas([]);
      setResultadoFinal(null);

      localStorage.removeItem(
        "quiz-material"
      );

      await cargarQuizzes();

      mostrarNotificacion(
        "Quiz generado correctamente."
      );
    } catch (error) {
      console.error(
        "Error generando quiz:",
        error
      );

      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudo generar el quiz."
      );
    } finally {
      setGenerandoQuiz(false);
      setEstadoGeneracion("");
    }
  };

  /* =====================================================
     RESPONDER QUIZ
  ===================================================== */

  const preguntaActual =
    quizActivo?.preguntas[
      indicePregunta
    ] || null;

  const comprobarRespuesta = () => {
    if (
      !preguntaActual ||
      respuestaComprobada
    ) {
      return;
    }

    if (!respuestaUsuario.trim()) {
      mostrarNotificacion(
        "Selecciona o escribe una respuesta."
      );

      return;
    }

    const correcta =
      normalizarRespuesta(
        respuestaUsuario
      ) ===
      normalizarRespuesta(
        preguntaActual.respuesta_correcta
      );

    setRespuestaComprobada(true);

    setUltimaRespuestaCorrecta(
      correcta
    );

    setRespuestas((anteriores) => [
      ...anteriores,
      {
        pregunta_id:
          preguntaActual.id,

        respuesta_usuario:
          respuestaUsuario,

        correcta,
      },
    ]);
  };

  const siguientePregunta = async () => {
    if (
      !quizActivo ||
      !preguntaActual ||
      !respuestaComprobada
    ) {
      return;
    }

    const esUltima =
      indicePregunta ===
      quizActivo.preguntas.length - 1;

    if (esUltima) {
      await finalizarQuiz();
      return;
    }

    setIndicePregunta(
      (actual) => actual + 1
    );

    setRespuestaUsuario("");
    setRespuestaComprobada(false);
    setUltimaRespuestaCorrecta(null);
  };

  const finalizarQuiz = async () => {
    if (!quizActivo) {
      return;
    }

    const correctas =
      respuestas.filter(
        (respuesta) =>
          respuesta.correcta
      ).length;

    const total =
      quizActivo.preguntas.length;

    const precision =
      total > 0
        ? Math.round(
            (correctas / total) * 100
          )
        : 0;

    const resultado = {
      correctas,
      total,
      precision,
    };

    setResultadoFinal(resultado);

    try {
      setGuardandoResultado(true);

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { error } =
        await supabase
          .from("quizzes")
          .update({
            estado: "completado",

            respuestas_correctas:
              correctas,

            preguntas_respondidas:
              total,

            precision,

            fecha_completado:
              new Date().toISOString(),
          })
          .eq("id", quizActivo.id)
          .eq(
            "usuario_id",
            user.id
          );

      if (error) {
        console.warn(
          "No se guardó el resultado:",
          error.message
        );
      }

      await cargarQuizzes();
    } finally {
      setGuardandoResultado(false);
    }
  };

  const repetirQuiz = () => {
    if (!quizActivo) {
      return;
    }

    setIndicePregunta(0);
    setRespuestaUsuario("");
    setRespuestaComprobada(false);
    setUltimaRespuestaCorrecta(null);
    setRespuestas([]);
    setResultadoFinal(null);
  };

  const abrirQuizReciente = (
    quiz: QuizGuardado
  ) => {
    setQuizActivo(quiz);
    setIndicePregunta(0);
    setRespuestaUsuario("");
    setRespuestaComprobada(false);
    setUltimaRespuestaCorrecta(null);
    setRespuestas([]);
    setResultadoFinal(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const volverAlCreador = () => {
    setQuizActivo(null);
    setResultadoFinal(null);
    setIndicePregunta(0);
    setRespuestaUsuario("");
    setRespuestaComprobada(false);
    setUltimaRespuestaCorrecta(null);
    setRespuestas([]);
  };

  /* =====================================================
     ESTADÍSTICAS
  ===================================================== */

  const quizzesCompletados =
    quizzesRecientes.filter(
      (quiz) =>
        quiz.estado ===
        "completado"
    );

  const preguntasRespondidas =
    quizzesRecientes.reduce(
      (total, quiz) =>
        total +
        quiz.preguntas_respondidas,
      0
    );

  const precisionPromedio =
    quizzesCompletados.length > 0
      ? Math.round(
          quizzesCompletados.reduce(
            (total, quiz) =>
              total + quiz.precision,
            0
          ) /
            quizzesCompletados.length
        )
      : 0;

  const hoy = new Date();

  const quizzesHoy =
    quizzesRecientes.filter((quiz) => {
      const fecha =
        new Date(
          quiz.fecha_creacion
        );

      return (
        fecha.getDate() ===
          hoy.getDate() &&
        fecha.getMonth() ===
          hoy.getMonth() &&
        fecha.getFullYear() ===
          hoy.getFullYear()
      );
    }).length;

  const quizzesRestantes =
    esPremium
      ? null
      : Math.max(
          3 - quizzesHoy,
          0
        );

  const materialesFiltrados =
    materiales.filter((material) =>
      material.nombre_archivo
        .toLowerCase()
        .includes(
          busquedaMaterial
            .trim()
            .toLowerCase()
        )
    );

  /* =====================================================
     SESIÓN
  ===================================================== */

  const cerrarSesion = async () => {
    await supabase.auth.signOut();

    router.push("/Login");
  };

  /* =====================================================
     INTERFAZ
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#F7F9FF] text-[#10233F] transition-colors duration-500 dark:bg-[#101827] dark:text-white">
      {/* OVERLAY MÓVIL */}

      {menuAbierto && (
        <div
          onClick={() =>
            setMenuAbierto(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR FIJO */}

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
              Raccoon
              <span className="text-[#55A8E8]">
                Study
              </span>
            </h1>
          </div>

          <button
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
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  transition
                  ${
                    activo
                      ? "bg-[#EDEAFF] font-black text-[#6548E8] dark:bg-[#302B58]"
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
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>

          <Link
            href="/suscripcion"
            className={`
              relative
              block
              overflow-hidden
              rounded-2xl
              p-4
              text-white
              shadow-lg
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
                  <CheckCircle2
                    size={22}
                  />
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
                ? "Quizzes ilimitados"
                : "Desbloquear funciones"}
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
              Raccoon
              <span className="text-[#55A8E8]">
                Study
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-3 rounded-full bg-[#F1F3FB] px-4 py-2.5 dark:bg-slate-800 md:flex">
              <Search
                size={18}
                className="text-[#8AA4BE]"
              />

              <input
                placeholder="Buscar métodos, temas, quizzes..."
                className="w-48 bg-transparent text-sm outline-none placeholder:text-[#8AA4BE] lg:w-64"
              />
            </div>

            <button
              onClick={cambiarTema}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#55A8E8] hover:bg-[#EFF8FF] dark:hover:bg-slate-800"
              aria-label="Cambiar tema"
            >
              {modoOscuro ? (
                <Sun size={21} />
              ) : (
                <Moon size={21} />
              )}
            </button>

            <button
              onClick={() =>
                mostrarNotificacion(
                  "No tienes notificaciones nuevas."
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#55A8E8] hover:bg-[#EFF8FF] dark:hover:bg-slate-800"
            >
              <Bell size={21} />
            </button>

            <div className="relative">
              <button
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
                  <p className="px-3 py-2 text-sm font-black">
                    {nombreUsuario}
                  </p>

                  <Link
                    href="/perfil"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <User size={17} />
                    Mi perfil
                  </Link>

                  <button
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
                </div>
              )}
            </div>
          </div>
        </header>

        {notificacion && (
          <div className="fixed left-1/2 top-5 z-[300] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 rounded-2xl bg-[#4169A1] px-5 py-3 text-center text-sm font-bold text-white shadow-2xl">
            {notificacion}
          </div>
        )}

        <div className="mx-auto max-w-[1500px] px-4 py-6 pb-28 sm:px-6 lg:px-8">
          {!quizActivo ? (
            <>
              <Link
                href="/Dashboard"
                className="mb-5 flex w-fit items-center gap-2 text-sm font-bold text-[#4169A1] dark:text-blue-300"
              >
                <ArrowLeft size={18} />
                Crear nuevo quiz
              </Link>

              <div className="grid gap-7 xl:grid-cols-[1fr_360px]">
                {/* COLUMNA PRINCIPAL */}

                <div>
                  {/* HERO */}

                  <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#F3F0FF] via-[#F8F6FF] to-[#EDF4FF] p-6 dark:from-[#28243E] dark:via-[#25253E] dark:to-[#1C304D] sm:p-8">
                    <div className="absolute right-16 top-8 h-8 w-8 rotate-45 bg-[#D9D0FF]/50" />

                    <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
                      <div className="max-w-lg">
                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            px-4
                            py-2
                            text-sm
                            font-black
                            ${
                              esPremium
                                ? "bg-[#FFF1C9] text-[#A97900]"
                                : "bg-[#E9E2FF] text-[#7652D9]"
                            }
                          `}
                        >
                          {esPremium ? (
                            <Crown size={16} />
                          ) : (
                            <Sparkles
                              size={16}
                            />
                          )}

                          {esPremium
                            ? "Creación Premium"
                            : "Creación gratuita"}
                        </span>

                        <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                          Crea un quiz con IA ✨
                        </h1>

                        <p className="mt-3 max-w-md leading-7 text-[#506C88] dark:text-slate-300">
                          Sube tus materiales y deja que Raccoon Study genere preguntas inteligentes para ti.
                        </p>
                      </div>

                      <Image
                        src="/raccoon.png"
                        alt="Raccoon creando quiz"
                        width={230}
                        height={190}
                        className="max-h-[180px] w-auto object-contain drop-shadow-xl"
                      />
                    </div>
                  </section>

                  {/* FORMULARIO */}

                  <section className="mt-5 rounded-[28px] bg-white p-5 shadow-sm dark:bg-[#182437] sm:p-7">
                    {/* PASO 1 */}

                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7652D9] to-[#6548E8] text-sm font-black text-white">
                        1
                      </div>

                      <h2 className="text-lg font-black">
                        ¿De dónde quieres obtener el material?
                      </h2>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      {/* ARCHIVO */}

                      <button
                        type="button"
                        onClick={() =>
                          seleccionarFuente(
                            "archivo"
                          )
                        }
                        className={`
                          rounded-[22px]
                          border-2
                          p-5
                          text-left
                          transition
                          ${
                            tipoFuente ===
                            "archivo"
                              ? "border-[#7652D9] bg-[#FAF8FF] shadow-md dark:bg-[#302747]"
                              : "border-[#E4EAF2] hover:border-[#B7A8FF] dark:border-slate-700 dark:hover:border-[#7652D9]"
                          }
                        `}
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9E2FF] text-[#7652D9]">
                          <FileUp size={22} />
                        </div>

                        <h3 className="mt-4 font-black">
                          Subir archivo
                        </h3>

                        <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#6085A5] dark:text-slate-400">
                          PDF, Word, PowerPoint o imagen de apuntes.
                        </p>
                      </button>

                      {/* TEXTO */}

                      <button
                        type="button"
                        onClick={() =>
                          seleccionarFuente(
                            "texto"
                          )
                        }
                        className={`
                          rounded-[22px]
                          border-2
                          p-5
                          text-left
                          transition
                          ${
                            tipoFuente ===
                            "texto"
                              ? "border-[#26A66B] bg-[#F3FCF7] shadow-md dark:bg-[#193028]"
                              : "border-[#E4EAF2] hover:border-[#8DDBB4] dark:border-slate-700"
                          }
                        `}
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDF7EA] text-[#26A66B]">
                          <TextCursorInput
                            size={22}
                          />
                        </div>

                        <h3 className="mt-4 font-black">
                          Pegar texto
                        </h3>

                        <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#6085A5] dark:text-slate-400">
                          Escribe o pega aquí tus apuntes o contenido.
                        </p>
                      </button>

                      {/* BIBLIOTECA */}

                      <button
                        type="button"
                        onClick={() =>
                          seleccionarFuente(
                            "biblioteca"
                          )
                        }
                        className={`
                          rounded-[22px]
                          border-2
                          p-5
                          text-left
                          transition
                          ${
                            tipoFuente ===
                            "biblioteca"
                              ? "border-[#EBA900] bg-[#FFF9EA] shadow-md dark:bg-[#332B1D]"
                              : "border-[#E4EAF2] hover:border-[#F0CE75] dark:border-slate-700"
                          }
                        `}
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF1C9] text-[#D89A00]">
                          <FolderOpen size={22} />
                        </div>

                        <h3 className="mt-4 font-black">
                          Elegir de la biblioteca
                        </h3>

                        <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#6085A5] dark:text-slate-400">
                          Usa un material que ya hayas subido.
                        </p>
                      </button>
                    </div>

                    {/* ÁREA DE FUENTE */}

                    <div className="mt-5">
                      {tipoFuente ===
                        "archivo" && (
                        <div className="rounded-[20px] border-2 border-dashed border-[#B7A8FF] bg-[#FCFBFF] p-5 text-center dark:bg-[#242238]">
                          <input
                            ref={
                              inputArchivoRef
                            }
                            id="archivo-quiz"
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.webp"
                            className="hidden"
                            onChange={
                              seleccionarArchivo
                            }
                          />

                          {archivoSeleccionado ? (
                            <div className="flex flex-col items-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9E2FF] text-[#7652D9]">
                                <FileText
                                  size={27}
                                />
                              </div>

                              <p className="mt-3 max-w-full truncate font-black">
                                {
                                  archivoSeleccionado.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-[#6085A5]">
                                {(
                                  archivoSeleccionado.size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </p>

                              <div className="mt-4 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    inputArchivoRef.current?.click()
                                  }
                                  className="rounded-xl bg-[#F3EDFF] px-4 py-2 text-sm font-bold text-[#7652D9]"
                                >
                                  Cambiar archivo
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setArchivoSeleccionado(
                                      null
                                    )
                                  }
                                  className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-500 dark:bg-red-950/30"
                                >
                                  Quitar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label
                              htmlFor="archivo-quiz"
                              className="flex cursor-pointer flex-col items-center"
                            >
                              <Upload
                                size={32}
                                className="text-[#6548E8]"
                              />

                              <p className="mt-3 font-black text-[#6548E8]">
                                Subir archivo
                              </p>

                              <p className="mt-2 text-xs leading-5 text-[#6085A5]">
                                PDF, DOCX, PPTX, JPG, PNG o TXT
                                <br />
                                Tamaño máximo:{" "}
                                {esPremium
                                  ? "25 MB"
                                  : "10 MB"}
                              </p>
                            </label>
                          )}
                        </div>
                      )}

                      {tipoFuente ===
                        "texto" && (
                        <div>
                          <textarea
                            value={
                              textoPegado
                            }
                            onChange={(
                              evento
                            ) =>
                              setTextoPegado(
                                evento.target
                                  .value
                              )
                            }
                            placeholder="Pega aquí tus apuntes, resumen o contenido..."
                            className="min-h-[180px] w-full resize-none rounded-[20px] border-2 border-[#BFE7D0] bg-[#FAFFFC] p-5 leading-7 outline-none transition focus:border-[#26A66B] dark:border-slate-700 dark:bg-slate-800"
                          />

                          <div className="mt-2 flex justify-between text-xs text-[#6085A5]">
                            <span>
                              Mínimo 50 caracteres
                            </span>

                            <span>
                              {
                                textoPegado.length
                              }{" "}
                              caracteres
                            </span>
                          </div>
                        </div>
                      )}

                      {tipoFuente ===
                        "biblioteca" && (
                        <div className="rounded-[20px] border-2 border-dashed border-[#F0CE75] bg-[#FFFDF6] p-5 text-center dark:bg-[#2F291E]">
                          {materialSeleccionado ? (
                            <div className="flex flex-col items-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1C9] text-[#D89A00]">
                                <BookOpen
                                  size={27}
                                />
                              </div>

                              <p className="mt-3 font-black">
                                {
                                  materialSeleccionado.nombre_archivo
                                }
                              </p>

                              <p className="mt-1 text-xs text-[#6085A5]">
                                Material seleccionado
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  setMostrarBiblioteca(
                                    true
                                  )
                                }
                                className="mt-4 rounded-xl bg-[#FFF1C9] px-5 py-2.5 text-sm font-bold text-[#A97900]"
                              >
                                Elegir otro
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setMostrarBiblioteca(
                                  true
                                )
                              }
                              className="flex w-full flex-col items-center"
                            >
                              <FolderOpen
                                size={32}
                                className="text-[#D89A00]"
                              />

                              <p className="mt-3 font-black text-[#A97900]">
                                Ver mis archivos
                              </p>

                              <p className="mt-2 text-xs text-[#6085A5]">
                                Selecciona un material guardado.
                              </p>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* DIVISOR */}

                    <div className="my-7 h-px bg-[#E7EDF5] dark:bg-slate-700" />

                    {/* PASO 2 */}

                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7652D9] to-[#6548E8] text-sm font-black text-white">
                        2
                      </div>

                      <h2 className="text-lg font-black">
                        Configura tu quiz
                      </h2>
                    </div>

                    {/* TIPOS */}

                    <div className="mt-6">
                      <p className="text-sm font-black">
                        Tipo de preguntas
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {tiposPregunta.map(
                          (tipo) => {
                            const Icono =
                              tipo.icono;

                            const bloqueado =
                              tipo.premium &&
                              !esPremium;

                            const activo =
                              tipoPregunta ===
                              tipo.id;

                            return (
                              <button
                                key={
                                  tipo.id
                                }
                                type="button"
                                onClick={() =>
                                  seleccionarTipoPregunta(
                                    tipo.id,
                                    tipo.premium
                                  )
                                }
                                className={`
                                  relative
                                  min-h-[132px]
                                  rounded-2xl
                                  border-2
                                  p-4
                                  text-center
                                  transition
                                  ${
                                    activo
                                      ? "border-[#7652D9] bg-[#F8F5FF] dark:bg-[#302747]"
                                      : "border-[#E4EAF2] hover:border-[#B7A8FF] dark:border-slate-700"
                                  }
                                `}
                              >
                                {bloqueado && (
                                  <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF1C9] text-[#D89A00]">
                                    <Lock
                                      size={14}
                                    />
                                  </span>
                                )}

                                <Icono
                                  size={23}
                                  className="mx-auto text-[#6548E8]"
                                />

                                <p className="mt-3 text-sm font-black">
                                  {
                                    tipo.nombre
                                  }
                                </p>

                                {tipo.premium && (
                                  <p className="mt-1 text-[10px] font-black text-[#D89A00]">
                                    PREMIUM
                                  </p>
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div className="mt-7 grid gap-7 lg:grid-cols-2">
                      {/* CANTIDAD */}

                      <div>
                        <p className="text-sm font-black">
                          Cantidad de preguntas
                        </p>

                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {cantidades.map(
                            ({
                              valor,
                              premium,
                            }) => {
                              const bloqueado =
                                premium &&
                                !esPremium;

                              const activo =
                                cantidadPreguntas ===
                                valor;

                              return (
                                <button
                                  key={valor}
                                  type="button"
                                  onClick={() =>
                                    seleccionarCantidad(
                                      valor,
                                      premium
                                    )
                                  }
                                  className={`
                                    relative
                                    rounded-xl
                                    border-2
                                    py-4
                                    text-sm
                                    font-black
                                    transition
                                    ${
                                      activo
                                        ? "border-[#6548E8] bg-[#F3EDFF] text-[#6548E8] dark:bg-[#302747]"
                                        : "border-[#E4EAF2] dark:border-slate-700"
                                    }
                                  `}
                                >
                                  {bloqueado && (
                                    <Lock
                                      size={11}
                                      className="absolute right-1 top-1 text-[#D89A00]"
                                    />
                                  )}

                                  {valor}
                                </button>
                              );
                            }
                          )}
                        </div>

                        <p className="mt-3 text-xs text-[#6085A5]">
                          Recomendado: 10 preguntas
                        </p>
                      </div>

                      {/* DIFICULTAD */}

                      <div>
                        <p className="text-sm font-black">
                          Dificultad
                        </p>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {dificultades.map(
                            (opcion) => {
                              const bloqueado =
                                opcion.premium &&
                                !esPremium;

                              const activo =
                                dificultad ===
                                opcion.id;

                              return (
                                <button
                                  key={
                                    opcion.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    seleccionarDificultad(
                                      opcion.id,
                                      opcion.premium
                                    )
                                  }
                                  className={`
                                    relative
                                    rounded-xl
                                    border-2
                                    px-2
                                    py-4
                                    text-center
                                    transition
                                    ${
                                      activo
                                        ? "border-[#6548E8] bg-[#F8F5FF] dark:bg-[#302747]"
                                        : "border-[#E4EAF2] dark:border-slate-700"
                                    }
                                  `}
                                >
                                  {bloqueado && (
                                    <Lock
                                      size={12}
                                      className="absolute right-2 top-2 text-[#D89A00]"
                                    />
                                  )}

                                  <span
                                    className={`mx-auto block h-3 w-3 rounded-full ${opcion.color}`}
                                  />

                                  <span className="mt-2 block text-xs font-black">
                                    {
                                      opcion.nombre
                                    }
                                  </span>
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    {/* BOTÓN */}

                    <button
                      type="button"
                      onClick={() =>
                        void generarQuiz()
                      }
                      disabled={
                        generandoQuiz
                      }
                      className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#356AF2] via-[#5255EC] to-[#7B35E8] py-4 font-black text-white shadow-lg shadow-[#6548E8]/20 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
                    >
                      {generandoQuiz ? (
                        <LoaderCircle
                          size={20}
                          className="animate-spin"
                        />
                      ) : (
                        <Sparkles
                          size={20}
                        />
                      )}

                      {generandoQuiz
                        ? estadoGeneracion ||
                          "Generando quiz..."
                        : "Generar mi Quiz"}
                    </button>

                    <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[#6085A5]">
                      <Lock size={13} />
                      Tus archivos se usan únicamente para generar el quiz.
                    </p>
                  </section>

                  {/* HISTORIAL */}

                  <section className="mt-7">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black">
                          Mis quizzes
                        </h2>

                        <p className="mt-1 text-sm text-[#6085A5] dark:text-slate-400">
                          Practica nuevamente tus quizzes anteriores.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          void cargarQuizzes()
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6548E8] shadow-sm dark:bg-[#182437]"
                      >
                        <RefreshCcw
                          size={18}
                          className={
                            cargandoQuizzes
                              ? "animate-spin"
                              : ""
                          }
                        />
                      </button>
                    </div>

                    {cargandoQuizzes ? (
                      <div className="flex min-h-[220px] items-center justify-center rounded-[25px] bg-white dark:bg-[#182437]">
                        <LoaderCircle className="animate-spin text-[#6548E8]" />
                      </div>
                    ) : quizzesRecientes.length ===
                      0 ? (
                      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[25px] bg-white p-7 text-center shadow-sm dark:bg-[#182437]">
                        <ClipboardCheck
                          size={45}
                          className="text-[#9CB1C7]"
                        />

                        <h3 className="mt-4 text-lg font-black">
                          Aún no tienes quizzes
                        </h3>

                        <p className="mt-2 text-sm text-[#6085A5]">
                          Crea tu primer quiz usando el formulario.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {quizzesRecientes
                          .slice(0, 6)
                          .map(
                            (quiz) => (
                              <article
                                key={
                                  quiz.id
                                }
                                className="rounded-[22px] bg-white p-5 shadow-sm dark:bg-[#182437]"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9E2FF] text-[#7652D9]">
                                    <ClipboardCheck
                                      size={22}
                                    />
                                  </div>

                                  <span
                                    className={`
                                      rounded-full
                                      px-3
                                      py-1
                                      text-[10px]
                                      font-black
                                      ${
                                        quiz.estado ===
                                        "completado"
                                          ? "bg-[#DDF7EA] text-[#258A5B]"
                                          : "bg-[#EAF1FF] text-[#1769E0]"
                                      }
                                    `}
                                  >
                                    {quiz.estado ===
                                    "completado"
                                      ? "COMPLETADO"
                                      : "NUEVO"}
                                  </span>
                                </div>

                                <h3 className="mt-4 font-black">
                                  {
                                    quiz.titulo
                                  }
                                </h3>

                                <p className="mt-2 text-xs text-[#6085A5]">
                                  {
                                    quiz.cantidad_preguntas
                                  }{" "}
                                  preguntas ·{" "}
                                  {nombreDificultad(
                                    quiz.dificultad
                                  )}
                                </p>

                                {quiz.estado ===
                                  "completado" && (
                                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F6FAFD] px-3 py-2 dark:bg-slate-800">
                                    <Target
                                      size={16}
                                      className="text-[#26A66B]"
                                    />

                                    <span className="text-sm font-black">
                                      {
                                        quiz.precision
                                      }
                                      % de precisión
                                    </span>
                                  </div>
                                )}

                                <button
                                  onClick={() =>
                                    abrirQuizReciente(
                                      quiz
                                    )
                                  }
                                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F3EDFF] py-3 text-sm font-black text-[#6548E8] dark:bg-[#302747]"
                                >
                                  <RotateCcw
                                    size={17}
                                  />
                                  Practicar
                                </button>
                              </article>
                            )
                          )}
                      </div>
                    )}
                  </section>
                </div>

                {/* COLUMNA DERECHA */}

                <aside className="space-y-6">
                  {/* PLAN */}

                  <section
                    className={`
                      rounded-[25px]
                      p-6
                      shadow-sm
                      ${
                        esPremium
                          ? "bg-gradient-to-br from-[#FFF8DE] to-[#F2EDFF] dark:from-[#332B1D] dark:to-[#28243E]"
                          : "bg-white dark:bg-[#182437]"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase text-[#6085A5]">
                          Tu plan
                        </p>

                        <h2 className="mt-1 text-xl font-black">
                          {cargandoPlan
                            ? "Cargando..."
                            : nombrePlan(
                                planActual
                              )}
                        </h2>
                      </div>

                      <div
                        className={`
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          ${
                            esPremium
                              ? "bg-[#FFF1C9] text-[#D89A00]"
                              : "bg-[#EAF1FF] text-[#1769E0]"
                          }
                        `}
                      >
                        {esPremium ? (
                          <Crown
                            size={24}
                          />
                        ) : (
                          <ShieldCheck
                            size={24}
                          />
                        )}
                      </div>
                    </div>

                    {esPremium ? (
                      <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#DDF7EA] px-4 py-3 text-sm font-black text-[#258A5B]">
                        <CheckCircle2
                          size={17}
                        />
                        Quizzes ilimitados
                      </div>
                    ) : (
                      <>
                        <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F4F8FC] px-4 py-3 dark:bg-slate-800">
                          <span className="text-sm font-bold">
                            Quizzes restantes hoy
                          </span>

                          <span className="text-xl font-black text-[#6548E8]">
                            {
                              quizzesRestantes
                            }
                            /3
                          </span>
                        </div>

                        <Link
                          href="/suscripcion"
                          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] py-3 font-black text-white"
                        >
                          <Crown
                            size={18}
                          />
                          Mejorar a Premium
                        </Link>
                      </>
                    )}
                  </section>

                  {/* RESUMEN */}

                  <section className="rounded-[25px] bg-white p-6 shadow-sm dark:bg-[#182437]">
                    <div className="flex items-center gap-3">
                      <BarChart3
                        size={22}
                        className="text-[#7652D9]"
                      />

                      <h2 className="text-lg font-black">
                        Resumen rápido
                      </h2>
                    </div>

                    <div className="mt-5 space-y-4">
                      <Estadistica
                        icono={
                          ClipboardCheck
                        }
                        nombre="Quizzes creados"
                        valor={
                          quizzesRecientes.length
                        }
                        color="bg-[#EAF1FF] text-[#1769E0]"
                      />

                      <Estadistica
                        icono={
                          MessageCircle
                        }
                        nombre="Preguntas respondidas"
                        valor={
                          preguntasRespondidas
                        }
                        color="bg-[#DDF7EA] text-[#258A5B]"
                      />

                      <Estadistica
                        icono={Target}
                        nombre="Precisión promedio"
                        valor={
                          precisionPromedio >
                          0
                            ? `${precisionPromedio}%`
                            : "—"
                        }
                        color="bg-[#F3EDFF] text-[#7652D9]"
                      />

                      <Estadistica
                        icono={Flame}
                        nombre="Racha actual"
                        valor="0 días"
                        color="bg-[#FFF0E8] text-[#E86D3A]"
                      />
                    </div>
                  </section>

                  {/* CONSEJO */}

                  <section className="relative overflow-hidden rounded-[25px] bg-gradient-to-br from-[#FFFDF7] to-[#F3EDFF] p-6 dark:from-[#2E2A20] dark:to-[#28243E]">
                    <Lightbulb
                      size={22}
                      className="text-[#EBA900]"
                    />

                    <h2 className="mt-3 font-black text-[#7652D9] dark:text-purple-200">
                      Consejo del día
                    </h2>

                    <p className="mt-3 max-w-[220px] text-sm leading-6 text-[#506C88] dark:text-slate-300">
                      Intenta responder sin mirar tus apuntes. Tu cerebro recordará mejor la información.
                    </p>

                    <Image
                      src="/raccoon.png"
                      alt="Consejo Raccoon"
                      width={100}
                      height={100}
                      className="absolute bottom-2 right-2 object-contain"
                    />
                  </section>

                  {/* CÓMO FUNCIONA */}

                  <section className="rounded-[25px] bg-white p-6 shadow-sm dark:bg-[#182437]">
                    <h2 className="text-lg font-black">
                      ¿Cómo funciona?
                    </h2>

                    <div className="mt-5 space-y-5">
                      <PasoFuncionamiento
                        numero="1"
                        titulo="Sube tu material"
                        descripcion="Raccoon lo analiza con IA."
                      />

                      <PasoFuncionamiento
                        numero="2"
                        titulo="Generamos preguntas"
                        descripcion="Creamos preguntas relevantes."
                      />

                      <PasoFuncionamiento
                        numero="3"
                        titulo="Practica y aprende"
                        descripcion="Responde, repasa y mejora."
                      />
                    </div>
                  </section>

                  {/* PRIVACIDAD */}

                  <section className="flex gap-4 rounded-[25px] border border-[#E4EAF2] bg-[#F8FAFF] p-5 dark:border-slate-700 dark:bg-[#182437]">
                    <ShieldCheck
                      size={28}
                      className="shrink-0 text-[#1769E0]"
                    />

                    <div>
                      <h2 className="font-black">
                        Tu privacidad es importante
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[#6085A5] dark:text-slate-400">
                        Tus archivos se utilizan solamente para generar el quiz.
                      </p>
                    </div>
                  </section>
                </aside>
              </div>
            </>
          ) : (
            /* =================================================
               RESOLVER QUIZ
            ================================================= */

            <section className="mx-auto max-w-5xl">
              <button
                onClick={volverAlCreador}
                className="mb-5 flex items-center gap-2 text-sm font-bold text-[#4169A1] dark:text-blue-300"
              >
                <ArrowLeft size={18} />
                Volver a mis quizzes
              </button>

              {resultadoFinal ? (
                /* RESULTADO FINAL */

                <div className="overflow-hidden rounded-[30px] bg-white shadow-sm dark:bg-[#182437]">
                  <div className="bg-gradient-to-r from-[#356AF2] via-[#6548E8] to-[#8A42E8] p-8 text-center text-white">
                    <Trophy
                      size={62}
                      className="mx-auto"
                    />

                    <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                      ¡Quiz completado!
                    </h1>

                    <p className="mt-2 text-white/80">
                      {quizActivo.titulo}
                    </p>
                  </div>

                  <div className="p-6 sm:p-9">
                    <div className="mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-full border-[12px] border-[#E9E2FF] bg-[#F8F5FF] dark:bg-[#302747]">
                      <span className="text-4xl font-black text-[#6548E8]">
                        {
                          resultadoFinal.precision
                        }
                        %
                      </span>

                      <span className="mt-1 text-sm font-bold text-[#6085A5]">
                        Precisión
                      </span>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      <ResultadoTarjeta
                        titulo="Correctas"
                        valor={
                          resultadoFinal.correctas
                        }
                        color="text-[#26A66B]"
                      />

                      <ResultadoTarjeta
                        titulo="Incorrectas"
                        valor={
                          resultadoFinal.total -
                          resultadoFinal.correctas
                        }
                        color="text-[#EF5B67]"
                      />

                      <ResultadoTarjeta
                        titulo="Total"
                        valor={
                          resultadoFinal.total
                        }
                        color="text-[#6548E8]"
                      />
                    </div>

                    {guardandoResultado && (
                      <p className="mt-5 flex items-center justify-center gap-2 text-sm text-[#6085A5]">
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />
                        Guardando resultado...
                      </p>
                    )}

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={repetirQuiz}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#F3EDFF] py-4 font-black text-[#6548E8] dark:bg-[#302747]"
                      >
                        <RotateCcw
                          size={19}
                        />
                        Repetir quiz
                      </button>

                      <button
                        onClick={volverAlCreador}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#356AF2] to-[#7652D9] py-4 font-black text-white"
                      >
                        <Sparkles
                          size={19}
                        />
                        Crear otro quiz
                      </button>
                    </div>
                  </div>
                </div>
              ) : preguntaActual ? (
                /* PREGUNTA */

                <div>
                  <section className="rounded-[28px] bg-gradient-to-r from-[#F3F0FF] to-[#EDF4FF] p-6 dark:from-[#28243E] dark:to-[#1C304D] sm:p-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <span className="rounded-full bg-[#E9E2FF] px-4 py-2 text-xs font-black text-[#6548E8]">
                          {
                            quizActivo.materia
                          }
                        </span>

                        <h1 className="mt-4 text-2xl font-black sm:text-3xl">
                          {quizActivo.titulo}
                        </h1>

                        <p className="mt-2 text-sm text-[#6085A5] dark:text-slate-300">
                          {nombreTipoPregunta(
                            quizActivo.tipo_preguntas
                          )}{" "}
                          ·{" "}
                          {nombreDificultad(
                            quizActivo.dificultad
                          )}
                        </p>
                      </div>

                      <Image
                        src="/raccoon.png"
                        alt="Raccoon Quiz"
                        width={120}
                        height={120}
                        className="mx-auto object-contain sm:mx-0"
                      />
                    </div>
                  </section>

                  <section className="mt-5 rounded-[28px] bg-white p-6 shadow-sm dark:bg-[#182437] sm:p-9">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-[#6548E8]">
                        Pregunta{" "}
                        {indicePregunta + 1} de{" "}
                        {
                          quizActivo
                            .preguntas
                            .length
                        }
                      </span>

                      <span className="rounded-full bg-[#F3EDFF] px-3 py-1 text-xs font-black text-[#6548E8] dark:bg-[#302747]">
                        {Math.round(
                          ((indicePregunta +
                            1) /
                            quizActivo
                              .preguntas
                              .length) *
                            100
                        )}
                        %
                      </span>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E7EDF5] dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#356AF2] to-[#7652D9] transition-all"
                        style={{
                          width: `${
                            ((indicePregunta +
                              1) /
                              quizActivo
                                .preguntas
                                .length) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <h2 className="mt-8 text-xl font-black leading-8 sm:text-2xl">
                      {
                        preguntaActual.pregunta
                      }
                    </h2>

                    {preguntaActual.tipo ===
                    "short" ? (
                      <textarea
                        value={
                          respuestaUsuario
                        }
                        onChange={(evento) =>
                          setRespuestaUsuario(
                            evento.target
                              .value
                          )
                        }
                        disabled={
                          respuestaComprobada
                        }
                        placeholder="Escribe tu respuesta..."
                        className="mt-6 min-h-[130px] w-full resize-none rounded-2xl border-2 border-[#DDE5EF] bg-[#FAFCFE] p-5 outline-none transition focus:border-[#7652D9] disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800"
                      />
                    ) : (
                      <div className="mt-6 grid gap-3">
                        {preguntaActual.opciones.map(
                          (
                            opcion,
                            indice
                          ) => {
                            const seleccionada =
                              respuestaUsuario ===
                              opcion;

                            const correcta =
                              respuestaComprobada &&
                              normalizarRespuesta(
                                opcion
                              ) ===
                                normalizarRespuesta(
                                  preguntaActual.respuesta_correcta
                                );

                            const incorrecta =
                              respuestaComprobada &&
                              seleccionada &&
                              !correcta;

                            return (
                              <button
                                key={`${opcion}-${indice}`}
                                type="button"
                                disabled={
                                  respuestaComprobada
                                }
                                onClick={() =>
                                  setRespuestaUsuario(
                                    opcion
                                  )
                                }
                                className={`
                                  flex
                                  items-center
                                  gap-4
                                  rounded-2xl
                                  border-2
                                  p-4
                                  text-left
                                  transition
                                  ${
                                    correcta
                                      ? "border-[#26A66B] bg-[#F0FBF5]"
                                      : incorrecta
                                        ? "border-[#EF5B67] bg-[#FFF3F4]"
                                        : seleccionada
                                          ? "border-[#7652D9] bg-[#F8F5FF] dark:bg-[#302747]"
                                          : "border-[#E4EAF2] hover:border-[#B7A8FF] dark:border-slate-700 dark:hover:border-[#7652D9]"
                                  }
                                `}
                              >
                                <span
                                  className={`
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-sm
                                    font-black
                                    ${
                                      seleccionada
                                        ? "bg-[#7652D9] text-white"
                                        : "bg-[#F1F5FA] text-[#6085A5] dark:bg-slate-700"
                                    }
                                  `}
                                >
                                  {String.fromCharCode(
                                    65 +
                                      indice
                                  )}
                                </span>

                                <span className="font-semibold">
                                  {opcion}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}

                    {respuestaComprobada && (
                      <div
                        className={`
                          mt-6
                          rounded-2xl
                          border
                          p-5
                          ${
                            ultimaRespuestaCorrecta
                              ? "border-[#BDE8D0] bg-[#F0FBF5]"
                              : "border-[#F6C5CA] bg-[#FFF3F4]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-full
                              ${
                                ultimaRespuestaCorrecta
                                  ? "bg-[#26A66B] text-white"
                                  : "bg-[#EF5B67] text-white"
                              }
                            `}
                          >
                            {ultimaRespuestaCorrecta ? (
                              <Check
                                size={20}
                              />
                            ) : (
                              <X size={20} />
                            )}
                          </div>

                          <div>
                            <h3 className="font-black text-[#10233F]">
                              {ultimaRespuestaCorrecta
                                ? "¡Respuesta correcta!"
                                : "Respuesta incorrecta"}
                            </h3>

                            {!ultimaRespuestaCorrecta && (
                              <p className="mt-1 text-sm text-[#506C88]">
                                La respuesta correcta es:{" "}
                                <strong>
                                  {
                                    preguntaActual.respuesta_correcta
                                  }
                                </strong>
                              </p>
                            )}
                          </div>
                        </div>

                        {esPremium ? (
                          <div className="mt-4 border-t border-black/5 pt-4">
                            <p className="flex items-center gap-2 text-sm font-black text-[#7652D9]">
                              <Lightbulb
                                size={17}
                              />
                              Explicación Premium
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[#506C88]">
                              {
                                preguntaActual.explicacion
                              }
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setMostrarPremium(
                                true
                              )
                            }
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#F0CE75] bg-[#FFF9EA] py-3 text-sm font-black text-[#A97900]"
                          >
                            <Lock size={16} />
                            Desbloquear explicación detallada
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-7 flex justify-end">
                      {!respuestaComprobada ? (
                        <button
                          onClick={
                            comprobarRespuesta
                          }
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#356AF2] to-[#7652D9] px-7 py-3.5 font-black text-white"
                        >
                          Comprobar respuesta
                          <CheckCircle2
                            size={19}
                          />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            void siguientePregunta()
                          }
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#356AF2] to-[#7652D9] px-7 py-3.5 font-black text-white"
                        >
                          {indicePregunta ===
                          quizActivo.preguntas
                            .length -
                            1
                            ? "Ver resultados"
                            : "Siguiente pregunta"}

                          <ArrowRight
                            size={19}
                          />
                        </button>
                      )}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="flex min-h-[400px] items-center justify-center rounded-[28px] bg-white dark:bg-[#182437]">
                  <LoaderCircle className="animate-spin text-[#7652D9]" />
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* MODAL BIBLIOTECA */}

      {mostrarBiblioteca && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-[28px] bg-white p-6 shadow-2xl dark:bg-[#182437]">
            <button
              onClick={() =>
                setMostrarBiblioteca(false)
              }
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5FA] dark:bg-slate-700"
            >
              <X size={20} />
            </button>

            <div className="pr-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1C9] text-[#D89A00]">
                <FolderOpen size={27} />
              </div>

              <h2 className="mt-5 text-2xl font-black">
                Elegir de la biblioteca
              </h2>

              <p className="mt-2 text-sm text-[#6085A5]">
                Selecciona un material que hayas subido anteriormente.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#F4F8FC] px-4 py-3 dark:bg-slate-800">
              <Search
                size={18}
                className="text-[#8AA4BE]"
              />

              <input
                value={
                  busquedaMaterial
                }
                onChange={(evento) =>
                  setBusquedaMaterial(
                    evento.target.value
                  )
                }
                placeholder="Buscar material..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
              {cargandoMateriales ? (
                <div className="flex min-h-[250px] items-center justify-center">
                  <LoaderCircle className="animate-spin text-[#7652D9]" />
                </div>
              ) : materialesFiltrados.length ===
                0 ? (
                <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                  <FolderOpen
                    size={45}
                    className="text-[#9CB1C7]"
                  />

                  <h3 className="mt-4 font-black">
                    No hay materiales
                  </h3>

                  <p className="mt-2 text-sm text-[#6085A5]">
                    Sube un archivo desde el Dashboard.
                  </p>
                </div>
              ) : (
                materialesFiltrados.map(
                  (material) => (
                    <button
                      key={material.id}
                      onClick={() =>
                        elegirMaterialBiblioteca(
                          material
                        )
                      }
                      className="flex w-full items-center gap-4 rounded-2xl border border-[#E4EAF2] p-4 text-left transition hover:border-[#EBA900] hover:bg-[#FFFDF6] dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF1C9] text-[#D89A00]">
                        <FileText
                          size={21}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black">
                          {
                            material.nombre_archivo
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#6085A5]">
                          {formatearFecha(
                            material.fecha_subida
                          )}
                        </p>
                      </div>

                      <ArrowRight
                        size={18}
                        className="text-[#D89A00]"
                      />
                    </button>
                  )
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREMIUM */}

      {mostrarPremium && (
        <div className="fixed inset-0 z-[230] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl dark:bg-[#182437]">
            <button
              onClick={() =>
                setMostrarPremium(false)
              }
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5FA] dark:bg-slate-700"
            >
              <X size={20} />
            </button>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F2B93B] to-[#7652D9] text-white">
              <Crown size={31} />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              Función Premium
            </h2>

            <p className="mt-3 leading-7 text-[#6085A5] dark:text-slate-300">
              Desbloquea respuestas cortas, preguntas mixtas, dificultad avanzada, explicaciones detalladas y quizzes ilimitados.
            </p>

            <div className="mt-5 space-y-3">
              {[
                "Hasta 25 preguntas",
                "Dificultad avanzada",
                "Explicaciones detalladas",
                "Quizzes ilimitados",
              ].map((beneficio) => (
                <div
                  key={beneficio}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2
                    size={18}
                    className="text-[#26A66B]"
                  />

                  <span className="text-sm font-semibold">
                    {beneficio}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/suscripcion"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] py-4 font-black text-white"
            >
              <Zap size={19} />
              Mejorar a Premium
            </Link>
          </div>
        </div>
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
            className="text-[#6548E8]"
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
   COMPONENTES DEL MISMO ARCHIVO
===================================================== */

function Estadistica({
  icono: Icono,
  nombre,
  valor,
  color,
}: {
  icono: LucideIcon;
  nombre: string;
  valor: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}
      >
        <Icono size={18} />
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

function PasoFuncionamiento({
  numero,
  titulo,
  descripcion,
}: {
  numero: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9E2FF] font-black text-[#7652D9]">
        {numero}
      </div>

      <div>
        <p className="text-sm font-black">
          {titulo}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#6085A5] dark:text-slate-400">
          {descripcion}
        </p>
      </div>
    </div>
  );
}

function ResultadoTarjeta({
  titulo,
  valor,
  color,
}: {
  titulo: string;
  valor: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F7FAFD] p-5 text-center dark:bg-slate-800">
      <p
        className={`text-3xl font-black ${color}`}
      >
        {valor}
      </p>

      <p className="mt-2 text-sm font-bold text-[#6085A5]">
        {titulo}
      </p>
    </div>
  );
}