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
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Crown,
  FileText,
  FileUp,
  FolderOpen,
  HelpCircle,
  Home,
  Layers3,
  Library,
  Lightbulb,
  LoaderCircle,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Moon,
  RefreshCcw,
  Repeat2,
  RotateCcw,
  Search,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Sun,
  Target,
  TextCursorInput,
  Trophy,
  Upload,
  User,
  X,
  Zap,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

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

type ModoEstudio =
  | "normal"
  | "smart";

type DificultadTarjeta =
  | "easy"
  | "medium"
  | "hard";

type NivelRespuesta =
  | "again"
  | "almost"
  | "mastered";

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

interface Flashcard {
  id: string;
  frente: string;
  reverso: string;
  pista: string;
  ejemplo: string;
  categoria: string;
  dificultad: DificultadTarjeta;
}

interface MazoFlashcards {
  id: string;
  usuario_id: string;
  material_id: string | null;
  titulo: string;
  materia: string;
  cantidad_tarjetas: number;
  modo_estudio: ModoEstudio;
  tarjetas: Flashcard[];
  estado: string;
  tarjetas_estudiadas: number;
  tarjetas_dominadas: number;
  progreso: number;
  fecha_creacion: string;
  fecha_ultima_revision: string | null;
}

interface EvaluacionTarjeta {
  tarjeta_id: string;
  nivel: NivelRespuesta;
}

interface ResultadoSesion {
  dominadas: number;
  casi: number;
  otraVez: number;
  total: number;
  progreso: number;
}

interface ResultadoComparacion {
  correcta: boolean;
  porcentaje: number;
  mensaje: string;
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
    activo: true,
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

const cantidades = [
  {
    valor: 10,
    premium: false,
  },
  {
    valor: 20,
    premium: false,
  },
  {
    valor: 30,
    premium: true,
  },
  {
    valor: 40,
    premium: true,
  },
  {
    valor: 50,
    premium: true,
  },
];

const modosEstudio: Array<{
  id: ModoEstudio;
  nombre: string;
  descripcion: string;
  icono: LucideIcon;
  premium: boolean;
}> = [
  {
    id: "normal",
    nombre: "Modo normal",
    descripcion:
      "Estudia las tarjetas en el orden generado.",
    icono: Layers3,
    premium: false,
  },
  {
    id: "smart",
    nombre: "Repaso inteligente",
    descripcion:
      "Repite automáticamente las tarjetas difíciles.",
    icono: Shuffle,
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

function esFlashcard(
  valor: unknown
): valor is Flashcard {
  if (!esObjeto(valor)) {
    return false;
  }

  return (
    typeof valor.id === "string" &&
    typeof valor.frente === "string" &&
    typeof valor.reverso === "string" &&
    typeof valor.pista === "string" &&
    typeof valor.ejemplo === "string" &&
    typeof valor.categoria === "string" &&
    (
      valor.dificultad === "easy" ||
      valor.dificultad === "medium" ||
      valor.dificultad === "hard"
    )
  );
}

function normalizarMazo(
  dato: Record<string, unknown>
): MazoFlashcards {
  const tarjetas =
    Array.isArray(dato.tarjetas)
      ? dato.tarjetas.filter(esFlashcard)
      : [];

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

    titulo:
      typeof dato.titulo === "string"
        ? dato.titulo
        : "Mazo sin título",

    materia:
      typeof dato.materia === "string"
        ? dato.materia
        : "General",

    cantidad_tarjetas: Number(
      dato.cantidad_tarjetas ||
        tarjetas.length
    ),

    modo_estudio:
      dato.modo_estudio === "smart"
        ? "smart"
        : "normal",

    tarjetas,

    estado:
      typeof dato.estado === "string"
        ? dato.estado
        : "creado",

    tarjetas_estudiadas: Number(
      dato.tarjetas_estudiadas || 0
    ),

    tarjetas_dominadas: Number(
      dato.tarjetas_dominadas || 0
    ),

    progreso: Number(
      dato.progreso || 0
    ),

    fecha_creacion:
      typeof dato.fecha_creacion ===
      "string"
        ? dato.fecha_creacion
        : new Date().toISOString(),

    fecha_ultima_revision:
      typeof dato.fecha_ultima_revision ===
      "string"
        ? dato.fecha_ultima_revision
        : null,
  };
}

function formatearFecha(
  fecha: string
): string {
  const fechaObjeto =
    new Date(fecha);

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

function normalizarRespuesta(
  texto: string
): string {
  return texto
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(/[.,;:!?¿¡()"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function obtenerPalabrasImportantes(
  texto: string
): string[] {
  const palabrasIgnoradas =
    new Set([
      "el",
      "la",
      "los",
      "las",
      "un",
      "una",
      "unos",
      "unas",
      "de",
      "del",
      "al",
      "y",
      "o",
      "en",
      "es",
      "son",
      "se",
      "que",
      "por",
      "para",
      "con",
      "como",
      "su",
      "sus",
      "a",
      "e",
      "lo",
      "esta",
      "este",
      "estos",
      "estas",
    ]);

  return normalizarRespuesta(texto)
    .split(" ")
    .filter(
      (palabra) =>
        palabra.length > 2 &&
        !palabrasIgnoradas.has(
          palabra
        )
    );
}

function compararRespuesta(
  respuestaUsuario: string,
  respuestaCorrecta: string
): ResultadoComparacion {
  const usuario =
    normalizarRespuesta(
      respuestaUsuario
    );

  const correcta =
    normalizarRespuesta(
      respuestaCorrecta
    );

  if (!usuario) {
    return {
      correcta: false,
      porcentaje: 0,
      mensaje:
        "No escribiste una respuesta.",
    };
  }

  if (
    usuario === correcta ||
    correcta.includes(usuario) ||
    usuario.includes(correcta)
  ) {
    return {
      correcta: true,
      porcentaje: 100,
      mensaje:
        "Tu respuesta coincide con la respuesta de la tarjeta.",
    };
  }

  const palabrasCorrectas = [
    ...new Set(
      obtenerPalabrasImportantes(
        correcta
      )
    ),
  ];

  const palabrasUsuario =
    new Set(
      obtenerPalabrasImportantes(
        usuario
      )
    );

  if (
    palabrasCorrectas.length === 0
  ) {
    return {
      correcta: false,
      porcentaje: 0,
      mensaje:
        "Compara tu respuesta con la explicación.",
    };
  }

  const coincidencias =
    palabrasCorrectas.filter(
      (palabra) =>
        palabrasUsuario.has(
          palabra
        )
    ).length;

  const porcentaje =
    Math.round(
      (
        coincidencias /
        palabrasCorrectas.length
      ) * 100
    );

  if (porcentaje >= 60) {
    return {
      correcta: true,
      porcentaje,
      mensaje:
        "Tu respuesta contiene la mayoría de las ideas importantes.",
    };
  }

  if (porcentaje >= 30) {
    return {
      correcta: false,
      porcentaje,
      mensaje:
        "Tu respuesta se acerca, pero le faltan ideas importantes.",
    };
  }

  return {
    correcta: false,
    porcentaje,
    mensaje:
      "Tu respuesta es diferente. Revisa la respuesta correcta.",
  };
}

function barajarTarjetas(
  tarjetas: Flashcard[]
): Flashcard[] {
  const copia = [...tarjetas];

  for (
    let indice =
      copia.length - 1;
    indice > 0;
    indice--
  ) {
    const aleatorio =
      Math.floor(
        Math.random() *
          (indice + 1)
      );

    [
      copia[indice],
      copia[aleatorio],
    ] = [
      copia[aleatorio],
      copia[indice],
    ];
  }

  return copia;
}

/* =====================================================
   COMPONENTE
===================================================== */

export default function FlashcardsPage() {
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

  const [
    fotoPerfil,
    setFotoPerfil,
  ] = useState("/raccoon.png");

  const [
    planActual,
    setPlanActual,
  ] = useState<PlanType>("free");

  const [
    cargandoPlan,
    setCargandoPlan,
  ] = useState(true);

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

  /* FUENTE */

  const [
    tipoFuente,
    setTipoFuente,
  ] =
    useState<TipoFuente>(
      "biblioteca"
    );

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
  ] = useState<Material | null>(
    null
  );

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
    cantidadTarjetas,
    setCantidadTarjetas,
  ] = useState(10);

  const [
    modoEstudio,
    setModoEstudio,
  ] =
    useState<ModoEstudio>(
      "normal"
    );

  /* GENERACIÓN */

  const [
    generando,
    setGenerando,
  ] = useState(false);

  const [
    estadoGeneracion,
    setEstadoGeneracion,
  ] = useState("");

  /* MAZOS */

  const [mazos, setMazos] =
    useState<MazoFlashcards[]>([]);

  const [
    cargandoMazos,
    setCargandoMazos,
  ] = useState(true);

  /* ESTUDIO */

  const [
    mazoActivo,
    setMazoActivo,
  ] = useState<MazoFlashcards | null>(
    null
  );

  const [
    tarjetasSesion,
    setTarjetasSesion,
  ] = useState<Flashcard[]>([]);

  const [
    indiceTarjeta,
    setIndiceTarjeta,
  ] = useState(0);

  const [
    tarjetaVolteada,
    setTarjetaVolteada,
  ] = useState(false);

  const [
    respuestaEscrita,
    setRespuestaEscrita,
  ] = useState("");

  const [
    resultadoComparacion,
    setResultadoComparacion,
  ] =
    useState<ResultadoComparacion | null>(
      null
    );

  const [
    evaluaciones,
    setEvaluaciones,
  ] = useState<EvaluacionTarjeta[]>(
    []
  );

  const [
    tarjetasRepetidas,
    setTarjetasRepetidas,
  ] = useState<string[]>([]);

  const [
    resultadoSesion,
    setResultadoSesion,
  ] = useState<ResultadoSesion | null>(
    null
  );

  const [
    guardandoResultado,
    setGuardandoResultado,
  ] = useState(false);

  const tarjetaActual =
    tarjetasSesion[
      indiceTarjeta
    ] || null;

  /* =====================================================
     INICIO
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
        cargarMazos(),
      ]);

      cargarMaterialDesdeDashboard();
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
  };

  const cambiarTema = () => {
    setModoOscuro((actual) => {
      const nuevo = !actual;

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
    }, 4500);
  };

  /* =====================================================
     USUARIO
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

        setPlanActual(
          normalizarPlan(
            metadata.plan ||
              metadata.subscription ||
              metadata.tipo_plan,
            premiumMetadata
          )
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
          // Se conservan los metadatos.
        }

        return true;
      } catch (error) {
        console.error(error);

        mostrarNotificacion(
          "No se pudo cargar tu información."
        );

        return false;
      } finally {
        setCargandoPlan(false);
      }
    };

  /* =====================================================
     MATERIALES DEL DASHBOARD
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
            .order(
              "fecha_subida",
              {
                ascending: false,
              }
            );

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
        console.error(error);

        mostrarNotificacion(
          "No se pudieron cargar los materiales del Dashboard."
        );

        setMateriales([]);
      } finally {
        setCargandoMateriales(false);
      }
    };

  const cargarMaterialDesdeDashboard =
    () => {
      const contenidoDirecto =
        localStorage.getItem(
          "flashcard-material"
        );

      const contenidoGeneral =
        localStorage.getItem(
          "raccoon-material-seleccionado"
        );

      const contenido =
        contenidoDirecto ||
        contenidoGeneral;

      if (!contenido) {
        return;
      }

      try {
        const dato: unknown =
          JSON.parse(contenido);

        if (!esObjeto(dato)) {
          return;
        }

        const id = String(
          dato.material_id ||
            dato.id ||
            ""
        );

        const nombre =
          typeof dato.nombre_archivo ===
          "string"
            ? dato.nombre_archivo
            : typeof dato.titulo ===
                "string"
              ? dato.titulo
              : "Material seleccionado";

        const url =
          typeof dato.url_archivo ===
          "string"
            ? dato.url_archivo
            : "";

        if (!id || !url) {
          return;
        }

        setTipoFuente(
          "biblioteca"
        );

        setMaterialSeleccionado({
          id,
          nombre_archivo: nombre,
          url_archivo: url,
          fecha_subida:
            typeof dato.fecha_subida ===
            "string"
              ? dato.fecha_subida
              : new Date().toISOString(),
        });

        mostrarNotificacion(
          "El material del Dashboard está listo para crear flashcards."
        );
      } catch (error) {
        console.error(
          "Material del Dashboard inválido:",
          error
        );
      }
    };

  /* =====================================================
     MAZOS
  ===================================================== */

  const cargarMazos = async () => {
    try {
      setCargandoMazos(true);

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data, error } =
        await supabase
          .from("flashcard_sets")
          .select("*")
          .eq(
            "usuario_id",
            user.id
          )
          .order(
            "fecha_creacion",
            {
              ascending: false,
            }
          );

      if (error) {
        throw new Error(
          error.message
        );
      }

      setMazos(
        (data || []).map(
          (mazo) =>
            normalizarMazo(
              mazo as Record<
                string,
                unknown
              >
            )
        )
      );
    } catch (error) {
      console.error(error);
      setMazos([]);
    } finally {
      setCargandoMazos(false);
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

    if (
      fuente === "biblioteca"
    ) {
      setArchivoSeleccionado(null);
      setTextoPegado("");
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

    if (
      !permitidas.includes(
        extension
      )
    ) {
      mostrarNotificacion(
        "Formato no permitido."
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
  };

  const seleccionarMaterial = (
    material: Material
  ) => {
    setTipoFuente(
      "biblioteca"
    );

    setMaterialSeleccionado(
      material
    );

    mostrarNotificacion(
      "Material del Dashboard seleccionado."
    );
  };

  /* =====================================================
     PREMIUM
  ===================================================== */

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

    setCantidadTarjetas(
      cantidad
    );
  };

  const seleccionarModo = (
    modo: ModoEstudio,
    premium: boolean
  ) => {
    if (
      premium &&
      !esPremium
    ) {
      setMostrarPremium(true);
      return;
    }

    setModoEstudio(modo);
  };

  /* =====================================================
     GENERAR
  ===================================================== */

  const generarFlashcards =
    async () => {
      if (generando) {
        return;
      }

      if (
        cantidadTarjetas > 20 &&
        !esPremium
      ) {
        setMostrarPremium(true);
        return;
      }

      if (
        modoEstudio === "smart" &&
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
          "Selecciona un archivo."
        );

        return;
      }

      if (
        tipoFuente === "texto" &&
        textoPegado.trim().length <
          50
      ) {
        mostrarNotificacion(
          "Escribe al menos 50 caracteres."
        );

        return;
      }

      if (
        tipoFuente ===
          "biblioteca" &&
        !materialSeleccionado
      ) {
        mostrarNotificacion(
          "Selecciona uno de tus materiales del Dashboard."
        );

        return;
      }

      try {
        setGenerando(true);

        setEstadoGeneracion(
          "Preparando el material..."
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
          "cantidad_tarjetas",
          String(
            cantidadTarjetas
          )
        );

        formulario.append(
          "modo_estudio",
          modoEstudio
        );

        if (
          tipoFuente ===
            "archivo" &&
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
          "Raccoon está creando las tarjetas..."
        );

        const respuesta =
          await fetch(
            "/api/flashcards/generar",
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
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
          datos =
            await respuesta.json();
        } else {
          datos = {
            error:
              (await respuesta.text()) ||
              `Error ${respuesta.status}`,
          };
        }

        if (!respuesta.ok) {
          throw new Error(
            obtenerMensajeError(
              datos
            )
          );
        }

        if (
          !esObjeto(datos) ||
          !esObjeto(datos.mazo)
        ) {
          throw new Error(
            "La API devolvió un mazo incorrecto."
          );
        }

        const nuevoMazo =
          normalizarMazo(
            datos.mazo
          );

        if (
          nuevoMazo.tarjetas.length ===
          0
        ) {
          throw new Error(
            "La IA no generó tarjetas."
          );
        }

        setMazos((actuales) => [
          nuevoMazo,
          ...actuales.filter(
            (mazo) =>
              mazo.id !==
              nuevoMazo.id
          ),
        ]);

        localStorage.removeItem(
          "flashcard-material"
        );

        mostrarNotificacion(
          "Flashcards generadas correctamente."
        );

        iniciarEstudio(
          nuevoMazo
        );
      } catch (error) {
        console.error(error);

        mostrarNotificacion(
          error instanceof Error
            ? error.message
            : "No se pudieron generar las flashcards."
        );
      } finally {
        setGenerando(false);
        setEstadoGeneracion("");
      }
    };

  /* =====================================================
     ESTUDIO
  ===================================================== */

  const iniciarEstudio = (
    mazo: MazoFlashcards
  ) => {
    const tarjetas =
      mazo.modo_estudio ===
        "smart" &&
      esPremium
        ? barajarTarjetas(
            mazo.tarjetas
          )
        : [...mazo.tarjetas];

    setMazoActivo(mazo);
    setTarjetasSesion(tarjetas);
    setIndiceTarjeta(0);
    setTarjetaVolteada(false);
    setRespuestaEscrita("");
    setResultadoComparacion(null);
    setEvaluaciones([]);
    setTarjetasRepetidas([]);
    setResultadoSesion(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const comprobarYGirar = () => {
    if (!tarjetaActual) {
      return;
    }

    if (
      !respuestaEscrita.trim()
    ) {
      mostrarNotificacion(
        "Escribe una respuesta antes de comprobar."
      );

      return;
    }

    const resultado =
      compararRespuesta(
        respuestaEscrita,
        tarjetaActual.reverso
      );

    setResultadoComparacion(
      resultado
    );

    setTarjetaVolteada(true);
  };

  const mostrarRespuestaSinResponder =
    () => {
      setResultadoComparacion({
        correcta: false,
        porcentaje: 0,
        mensaje:
          "Marcaste que no recordabas la respuesta.",
      });

      setTarjetaVolteada(true);
    };

  const evaluarTarjeta = (
    nivel: NivelRespuesta
  ) => {
    if (
      !mazoActivo ||
      !tarjetaActual
    ) {
      return;
    }

    const nuevasEvaluaciones = [
      ...evaluaciones,
      {
        tarjeta_id:
          tarjetaActual.id,
        nivel,
      },
    ];

    let nuevaSesion = [
      ...tarjetasSesion,
    ];

    if (
      nivel === "again" &&
      mazoActivo.modo_estudio ===
        "smart" &&
      esPremium &&
      !tarjetasRepetidas.includes(
        tarjetaActual.id
      )
    ) {
      nuevaSesion.push(
        tarjetaActual
      );

      setTarjetasSesion(
        nuevaSesion
      );

      setTarjetasRepetidas(
        (actuales) => [
          ...actuales,
          tarjetaActual.id,
        ]
      );
    }

    setEvaluaciones(
      nuevasEvaluaciones
    );

    const esUltima =
      indiceTarjeta >=
      nuevaSesion.length - 1;

    if (esUltima) {
      void finalizarEstudio(
        nuevasEvaluaciones
      );

      return;
    }

    setIndiceTarjeta(
      (actual) => actual + 1
    );

    setTarjetaVolteada(false);
    setRespuestaEscrita("");
    setResultadoComparacion(null);
  };

  const finalizarEstudio =
    async (
      evaluacionesFinales:
        EvaluacionTarjeta[]
    ) => {
      if (!mazoActivo) {
        return;
      }

      const ultimaEvaluacion =
        new Map<
          string,
          NivelRespuesta
        >();

      evaluacionesFinales.forEach(
        (evaluacion) => {
          ultimaEvaluacion.set(
            evaluacion.tarjeta_id,
            evaluacion.nivel
          );
        }
      );

      let dominadas = 0;
      let casi = 0;
      let otraVez = 0;

      mazoActivo.tarjetas.forEach(
        (tarjeta) => {
          const nivel =
            ultimaEvaluacion.get(
              tarjeta.id
            );

          if (
            nivel === "mastered"
          ) {
            dominadas++;
          } else if (
            nivel === "almost"
          ) {
            casi++;
          } else {
            otraVez++;
          }
        }
      );

      const total =
        mazoActivo.tarjetas.length;

      const progreso =
        total > 0
          ? Math.round(
              (
                dominadas /
                total
              ) * 100
            )
          : 0;

      setResultadoSesion({
        dominadas,
        casi,
        otraVez,
        total,
        progreso,
      });

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
            .from(
              "flashcard_sets"
            )
            .update({
              estado:
                progreso === 100
                  ? "completado"
                  : "en_progreso",

              tarjetas_estudiadas:
                total,

              tarjetas_dominadas:
                dominadas,

              progreso,

              fecha_ultima_revision:
                new Date().toISOString(),
            })
            .eq(
              "id",
              mazoActivo.id
            )
            .eq(
              "usuario_id",
              user.id
            );

        if (error) {
          console.error(error);
        }

        await cargarMazos();
      } finally {
        setGuardandoResultado(false);
      }
    };

  const repetirMazo = () => {
    if (mazoActivo) {
      iniciarEstudio(
        mazoActivo
      );
    }
  };

  const volverAlCreador = () => {
    setMazoActivo(null);
    setTarjetasSesion([]);
    setIndiceTarjeta(0);
    setTarjetaVolteada(false);
    setRespuestaEscrita("");
    setResultadoComparacion(null);
    setEvaluaciones([]);
    setTarjetasRepetidas([]);
    setResultadoSesion(null);
  };

  /* =====================================================
     ESTADÍSTICAS
  ===================================================== */

  const tarjetasEstudiadas =
    mazos.reduce(
      (total, mazo) =>
        total +
        mazo.tarjetas_estudiadas,
      0
    );

  const tarjetasDominadas =
    mazos.reduce(
      (total, mazo) =>
        total +
        mazo.tarjetas_dominadas,
      0
    );

  const progresoPromedio =
    mazos.length > 0
      ? Math.round(
          mazos.reduce(
            (total, mazo) =>
              total + mazo.progreso,
            0
          ) / mazos.length
        )
      : 0;

  const textoBusqueda =
    busquedaMaterial
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

  /* =====================================================
     SESIÓN
  ===================================================== */

  const cerrarSesion =
    async () => {
      await supabase.auth.signOut();
      router.push("/Login");
    };

  /* =====================================================
     INTERFAZ
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#F7F9FF] text-[#10233F] transition-colors dark:bg-[#101827] dark:text-white">
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
            />

            <h1 className="font-black">
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
                className={`
                  flex items-center gap-3 rounded-xl px-4 py-3 text-sm
                  ${
                    activo
                      ? "bg-[#EDEAFF] font-black text-[#6548E8] dark:bg-[#302B58]"
                      : "font-semibold text-[#253650] hover:bg-[#F0F8FF] dark:text-slate-200 dark:hover:bg-slate-800"
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
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold hover:bg-[#F0F8FF] dark:hover:bg-slate-800"
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
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500"
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>

          <Link
            href="/suscripcion"
            className={`
              block rounded-2xl p-4 text-white
              ${
                esPremium
                  ? "bg-gradient-to-br from-[#F2B93B] to-[#7771E8]"
                  : "bg-gradient-to-br from-[#55A8E8] to-[#7771E8]"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Crown size={23} />

              <div>
                <p className="font-black">
                  {esPremium
                    ? "Premium activo"
                    : "Raccoon Premium"}
                </p>

                <p className="text-xs text-white/80">
                  {cargandoPlan
                    ? "Comprobando..."
                    : nombrePlan(
                        planActual
                      )}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* CONTENIDO */}

      <div className="lg:ml-[250px]">
        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-[#DDEAF7] bg-white/90 px-4 backdrop-blur-xl dark:border-slate-700 dark:bg-[#151F30]/90 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setMenuAbierto(true)
              }
              className="lg:hidden"
            >
              <Menu size={24} />
            </button>

            <h1 className="text-xl font-black">
              Flashcards con IA
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={cambiarTema}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#55A8E8]"
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
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#55A8E8]"
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fotoPerfil}
                  alt="Perfil"
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(evento) => {
                    evento.currentTarget.src =
                      "/raccoon.png";
                  }}
                />

                <ChevronDown size={16} />
              </button>

              {perfilAbierto && (
                <div className="absolute right-0 top-14 w-52 rounded-2xl bg-white p-2 shadow-xl dark:bg-slate-800">
                  <p className="px-3 py-2 font-black">
                    {nombreUsuario}
                  </p>

                  <Link
                    href="/perfil"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <User size={17} />
                    Mi perfil
                  </Link>
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

        <div className="mx-auto max-w-[1450px] px-4 py-6 pb-28 sm:px-6">
          {!mazoActivo ? (
            <>
              <Link
                href="/metodos"
                className="mb-5 flex w-fit items-center gap-2 text-sm font-bold text-[#4169A1]"
              >
                <ArrowLeft size={18} />
                Volver a métodos
              </Link>

              <section className="rounded-[28px] bg-gradient-to-r from-[#F3F0FF] to-[#EDF4FF] p-7 dark:from-[#28243E] dark:to-[#1C304D]">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#E9E2FF] px-4 py-2 text-sm font-black text-[#7652D9]">
                      <Sparkles size={16} />
                      Memorización inteligente
                    </span>

                    <h1 className="mt-4 text-4xl font-black">
                      Crea flashcards con IA
                    </h1>

                    <p className="mt-3 max-w-xl leading-7 text-[#506C88] dark:text-slate-300">
                      Usa los documentos que ya subiste en el Dashboard o agrega nuevo contenido.
                    </p>
                  </div>

                  <Image
                    src="/raccoon.png"
                    alt="Raccoon Flashcards"
                    width={210}
                    height={180}
                  />
                </div>
              </section>

              <div className="mt-6 grid gap-7 xl:grid-cols-[1fr_350px]">
                <div className="space-y-7">
                  {/* CREADOR */}

                  <section className="rounded-[28px] bg-white p-6 shadow-sm dark:bg-[#182437]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7652D9] font-black text-white">
                        1
                      </span>

                      <h2 className="text-lg font-black">
                        Elige el contenido
                      </h2>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <BotonFuente
                        activo={
                          tipoFuente ===
                          "biblioteca"
                        }
                        icono={FolderOpen}
                        titulo="Mis materiales"
                        descripcion="Documentos subidos desde el Dashboard."
                        onClick={() =>
                          seleccionarFuente(
                            "biblioteca"
                          )
                        }
                      />

                      <BotonFuente
                        activo={
                          tipoFuente ===
                          "archivo"
                        }
                        icono={FileUp}
                        titulo="Subir archivo"
                        descripcion="Agregar un archivo nuevo."
                        onClick={() =>
                          seleccionarFuente(
                            "archivo"
                          )
                        }
                      />

                      <BotonFuente
                        activo={
                          tipoFuente ===
                          "texto"
                        }
                        icono={
                          TextCursorInput
                        }
                        titulo="Pegar texto"
                        descripcion="Escribe o pega tus apuntes."
                        onClick={() =>
                          seleccionarFuente(
                            "texto"
                          )
                        }
                      />
                    </div>

                    {tipoFuente ===
                      "biblioteca" && (
                      <div className="mt-6">
                        <div className="flex items-center gap-3 rounded-2xl bg-[#F4F8FC] px-4 py-3 dark:bg-slate-800">
                          <Search size={18} />

                          <input
                            value={
                              busquedaMaterial
                            }
                            onChange={(
                              evento
                            ) =>
                              setBusquedaMaterial(
                                evento.target
                                  .value
                              )
                            }
                            placeholder="Buscar documentos del Dashboard..."
                            className="w-full bg-transparent text-sm outline-none"
                          />
                        </div>

                        {cargandoMateriales ? (
                          <div className="flex h-48 items-center justify-center">
                            <LoaderCircle className="animate-spin text-[#7652D9]" />
                          </div>
                        ) : materialesFiltrados.length ===
                          0 ? (
                          <div className="mt-4 rounded-2xl border-2 border-dashed p-8 text-center dark:border-slate-700">
                            <FolderOpen
                              size={42}
                              className="mx-auto text-[#9CB1C7]"
                            />

                            <h3 className="mt-4 font-black">
                              No hay materiales
                            </h3>

                            <Link
                              href="/Dashboard"
                              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#EAF1FF] px-5 py-3 font-bold text-[#1769E0]"
                            >
                              Ir al Dashboard
                              <ArrowRight size={17} />
                            </Link>
                          </div>
                        ) : (
                          <div className="mt-4 grid max-h-[350px] gap-3 overflow-y-auto md:grid-cols-2">
                            {materialesFiltrados.map(
                              (material) => {
                                const seleccionado =
                                  materialSeleccionado?.id ===
                                  material.id;

                                return (
                                  <button
                                    key={
                                      material.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      seleccionarMaterial(
                                        material
                                      )
                                    }
                                    className={`
                                      flex items-center gap-3 rounded-2xl border-2 p-4 text-left
                                      ${
                                        seleccionado
                                          ? "border-[#7652D9] bg-[#F8F5FF] dark:bg-[#302747]"
                                          : "border-[#E4EAF2] dark:border-slate-700"
                                      }
                                    `}
                                  >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9E2FF] text-[#7652D9]">
                                      <FileText size={21} />
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

                                    {seleccionado && (
                                      <CheckCircle2 className="shrink-0 text-[#26A66B]" />
                                    )}
                                  </button>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {tipoFuente ===
                      "archivo" && (
                      <div className="mt-6 rounded-2xl border-2 border-dashed border-[#B7A8FF] p-7 text-center">
                        <input
                          ref={
                            inputArchivoRef
                          }
                          id="archivo-flashcard"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.webp"
                          onChange={
                            seleccionarArchivo
                          }
                        />

                        {archivoSeleccionado ? (
                          <>
                            <FileText
                              size={35}
                              className="mx-auto text-[#7652D9]"
                            />

                            <p className="mt-3 font-black">
                              {
                                archivoSeleccionado.name
                              }
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                inputArchivoRef.current?.click()
                              }
                              className="mt-4 rounded-xl bg-[#F3EDFF] px-5 py-3 font-bold text-[#7652D9]"
                            >
                              Cambiar archivo
                            </button>
                          </>
                        ) : (
                          <label
                            htmlFor="archivo-flashcard"
                            className="cursor-pointer"
                          >
                            <Upload
                              size={35}
                              className="mx-auto text-[#7652D9]"
                            />

                            <p className="mt-3 font-black">
                              Seleccionar archivo
                            </p>
                          </label>
                        )}
                      </div>
                    )}

                    {tipoFuente ===
                      "texto" && (
                      <textarea
                        value={textoPegado}
                        onChange={(evento) =>
                          setTextoPegado(
                            evento.target.value
                          )
                        }
                        placeholder="Pega aquí tus apuntes..."
                        className="mt-6 min-h-[180px] w-full resize-none rounded-2xl border-2 border-[#BFE7D0] bg-[#FAFFFC] p-5 outline-none dark:border-slate-700 dark:bg-slate-800"
                      />
                    )}

                    <div className="my-7 h-px bg-[#E7EDF5] dark:bg-slate-700" />

                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7652D9] font-black text-white">
                        2
                      </span>

                      <h2 className="text-lg font-black">
                        Configura las tarjetas
                      </h2>
                    </div>

                    <p className="mt-6 text-sm font-black">
                      Cantidad de tarjetas
                    </p>

                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {cantidades.map(
                        ({
                          valor,
                          premium,
                        }) => (
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
                              relative rounded-xl border-2 py-4 font-black
                              ${
                                cantidadTarjetas ===
                                valor
                                  ? "border-[#7652D9] bg-[#F3EDFF] text-[#7652D9] dark:bg-[#302747]"
                                  : "border-[#E4EAF2] dark:border-slate-700"
                              }
                            `}
                          >
                            {premium &&
                              !esPremium && (
                                <Lock
                                  size={11}
                                  className="absolute right-1 top-1 text-[#D89A00]"
                                />
                              )}

                            {valor}
                          </button>
                        )
                      )}
                    </div>

                    <p className="mt-6 text-sm font-black">
                      Modo de estudio
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {modosEstudio.map(
                        (modo) => {
                          const Icono =
                            modo.icono;

                          return (
                            <button
                              key={modo.id}
                              type="button"
                              onClick={() =>
                                seleccionarModo(
                                  modo.id,
                                  modo.premium
                                )
                              }
                              className={`
                                relative rounded-2xl border-2 p-5 text-left
                                ${
                                  modoEstudio ===
                                  modo.id
                                    ? "border-[#7652D9] bg-[#F8F5FF] dark:bg-[#302747]"
                                    : "border-[#E4EAF2] dark:border-slate-700"
                                }
                              `}
                            >
                              {modo.premium &&
                                !esPremium && (
                                  <Lock className="absolute right-4 top-4 text-[#D89A00]" />
                                )}

                              <Icono className="text-[#7652D9]" />

                              <h3 className="mt-3 font-black">
                                {modo.nombre}
                              </h3>

                              <p className="mt-2 text-sm text-[#6085A5]">
                                {
                                  modo.descripcion
                                }
                              </p>
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void generarFlashcards()
                      }
                      disabled={generando}
                      className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#356AF2] to-[#7B35E8] py-4 font-black text-white disabled:opacity-60"
                    >
                      {generando ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <Sparkles />
                      )}

                      {generando
                        ? estadoGeneracion
                        : "Generar mis Flashcards"}
                    </button>
                  </section>

                  {/* HISTORIAL */}

                  <section>
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-2xl font-black">
                        Mis flashcards
                      </h2>

                      <button
                        type="button"
                        onClick={() =>
                          void cargarMazos()
                        }
                      >
                        <RefreshCcw
                          className={
                            cargandoMazos
                              ? "animate-spin"
                              : ""
                          }
                        />
                      </button>
                    </div>

                    {cargandoMazos ? (
                      <div className="flex h-52 items-center justify-center rounded-2xl bg-white dark:bg-[#182437]">
                        <LoaderCircle className="animate-spin" />
                      </div>
                    ) : mazos.length ===
                      0 ? (
                      <div className="rounded-2xl bg-white p-10 text-center dark:bg-[#182437]">
                        <Layers3
                          size={45}
                          className="mx-auto text-[#9CB1C7]"
                        />

                        <h3 className="mt-4 font-black">
                          Aún no tienes mazos
                        </h3>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {mazos.map(
                          (mazo) => (
                            <article
                              key={mazo.id}
                              className="rounded-2xl bg-white p-5 shadow-sm dark:bg-[#182437]"
                            >
                              <Layers3 className="text-[#7652D9]" />

                              <p className="mt-4 text-xs font-bold text-[#7652D9]">
                                {mazo.materia}
                              </p>

                              <h3 className="mt-1 font-black">
                                {mazo.titulo}
                              </h3>

                              <p className="mt-2 text-sm text-[#6085A5]">
                                {
                                  mazo.cantidad_tarjetas
                                }{" "}
                                tarjetas
                              </p>

                              <div className="mt-4 h-2.5 rounded-full bg-[#E7EDF5] dark:bg-slate-700">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#55A8E8] to-[#7652D9]"
                                  style={{
                                    width: `${mazo.progreso}%`,
                                  }}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  iniciarEstudio(
                                    mazo
                                  )
                                }
                                className="mt-5 w-full rounded-xl bg-[#F3EDFF] py-3 font-black text-[#7652D9] dark:bg-[#302747]"
                              >
                                Estudiar
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
                  <section className="rounded-[25px] bg-white p-6 shadow-sm dark:bg-[#182437]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#6085A5]">
                          Tu plan
                        </p>

                        <h2 className="mt-1 text-xl font-black">
                          {nombrePlan(
                            planActual
                          )}
                        </h2>
                      </div>

                      <ShieldCheck className="text-[#55A8E8]" />
                    </div>

                    {!esPremium && (
                      <Link
                        href="/suscripcion"
                        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] py-3 font-black text-white"
                      >
                        <Crown size={18} />
                        Mejorar a Premium
                      </Link>
                    )}
                  </section>

                  <section className="rounded-[25px] bg-white p-6 shadow-sm dark:bg-[#182437]">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="text-[#7652D9]" />

                      <h2 className="font-black">
                        Resumen rápido
                      </h2>
                    </div>

                    <div className="mt-5 space-y-4">
                      <Estadistica
                        nombre="Mazos creados"
                        valor={mazos.length}
                      />

                      <Estadistica
                        nombre="Tarjetas estudiadas"
                        valor={
                          tarjetasEstudiadas
                        }
                      />

                      <Estadistica
                        nombre="Tarjetas dominadas"
                        valor={
                          tarjetasDominadas
                        }
                      />

                      <Estadistica
                        nombre="Progreso promedio"
                        valor={`${progresoPromedio}%`}
                      />
                    </div>
                  </section>
                </aside>
              </div>
            </>
          ) : (
            /* =================================================
               ESTUDIAR
            ================================================= */

            <section className="mx-auto max-w-5xl">
              <button
                type="button"
                onClick={volverAlCreador}
                className="mb-5 flex items-center gap-2 font-bold text-[#4169A1]"
              >
                <ArrowLeft />
                Volver a mis flashcards
              </button>

              {resultadoSesion ? (
                <div className="overflow-hidden rounded-[30px] bg-white shadow-sm dark:bg-[#182437]">
                  <div className="bg-gradient-to-r from-[#356AF2] to-[#8A42E8] p-8 text-center text-white">
                    <Trophy
                      size={60}
                      className="mx-auto"
                    />

                    <h1 className="mt-4 text-4xl font-black">
                      ¡Sesión completada!
                    </h1>
                  </div>

                  <div className="p-8">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <ResultadoTarjeta
                        titulo="Dominadas"
                        valor={
                          resultadoSesion.dominadas
                        }
                      />

                      <ResultadoTarjeta
                        titulo="Casi"
                        valor={
                          resultadoSesion.casi
                        }
                      />

                      <ResultadoTarjeta
                        titulo="Otra vez"
                        valor={
                          resultadoSesion.otraVez
                        }
                      />
                    </div>

                    {guardandoResultado && (
                      <p className="mt-5 text-center">
                        Guardando progreso...
                      </p>
                    )}

                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={repetirMazo}
                        className="rounded-xl bg-[#F3EDFF] py-4 font-black text-[#7652D9]"
                      >
                        Repetir mazo
                      </button>

                      <button
                        type="button"
                        onClick={volverAlCreador}
                        className="rounded-xl bg-[#7652D9] py-4 font-black text-white"
                      >
                        Crear otro
                      </button>
                    </div>
                  </div>
                </div>
              ) : tarjetaActual ? (
                <>
                  <section className="rounded-[28px] bg-gradient-to-r from-[#F3F0FF] to-[#EDF4FF] p-7 dark:from-[#28243E] dark:to-[#1C304D]">
                    <span className="rounded-full bg-[#E9E2FF] px-4 py-2 text-xs font-black text-[#7652D9]">
                      {mazoActivo.materia}
                    </span>

                    <h1 className="mt-4 text-3xl font-black">
                      {mazoActivo.titulo}
                    </h1>
                  </section>

                  <section className="mt-5 rounded-[28px] bg-white p-6 shadow-sm dark:bg-[#182437] sm:p-8">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#7652D9]">
                        Tarjeta{" "}
                        {indiceTarjeta + 1} de{" "}
                        {tarjetasSesion.length}
                      </span>

                      <span className="rounded-full bg-[#F3EDFF] px-3 py-1 text-xs font-black text-[#7652D9]">
                        {Math.round(
                          (
                            (
                              indiceTarjeta +
                              1
                            ) /
                            tarjetasSesion.length
                          ) *
                            100
                        )}
                        %
                      </span>
                    </div>

                    <div className="mt-4 h-3 rounded-full bg-[#E7EDF5] dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#356AF2] to-[#7652D9]"
                        style={{
                          width: `${
                            (
                              (
                                indiceTarjeta +
                                1
                              ) /
                              tarjetasSesion.length
                            ) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    {/* FLASHCARD */}

                    <div className="mt-8 min-h-[440px] [perspective:1200px]">
                      <div
                        className={`
                          relative min-h-[440px] w-full transition-transform duration-500 [transform-style:preserve-3d]
                          ${
                            tarjetaVolteada
                              ? "[transform:rotateY(180deg)]"
                              : ""
                          }
                        `}
                      >
                        {/* FRENTE */}

                        <div className="absolute inset-0 flex flex-col rounded-[28px] border-2 border-[#DCD4FF] bg-gradient-to-br from-[#F8F5FF] via-white to-[#EEF7FF] p-7 [backface-visibility:hidden] dark:from-[#28243E] dark:via-[#182437] dark:to-[#1C304D]">
                          <span className="mx-auto rounded-full bg-[#E9E2FF] px-4 py-2 text-xs font-black text-[#7652D9]">
                            {
                              tarjetaActual.categoria
                            }
                          </span>

                          <p className="mt-7 text-center text-xs font-black uppercase tracking-[0.2em] text-[#8AA4BE]">
                            Pregunta
                          </p>

                          <h2 className="mx-auto mt-5 max-w-3xl text-center text-2xl font-black leading-9">
                            {
                              tarjetaActual.frente
                            }
                          </h2>

                          <div className="mx-auto mt-8 w-full max-w-2xl">
                            <label className="text-sm font-black">
                              Escribe tu respuesta antes de girar
                            </label>

                            <textarea
                              value={
                                respuestaEscrita
                              }
                              onChange={(
                                evento
                              ) =>
                                setRespuestaEscrita(
                                  evento.target
                                    .value
                                )
                              }
                              placeholder="Escribe lo que recuerdas..."
                              className="mt-3 min-h-[105px] w-full resize-none rounded-2xl border-2 border-[#DDE5EF] bg-white p-4 outline-none focus:border-[#7652D9] dark:border-slate-700 dark:bg-slate-800"
                            />

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <button
                                type="button"
                                onClick={
                                  comprobarYGirar
                                }
                                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#356AF2] to-[#7652D9] py-3.5 font-black text-white"
                              >
                                <CheckCircle2 size={18} />
                                Comprobar y girar
                              </button>

                              <button
                                type="button"
                                onClick={
                                  mostrarRespuestaSinResponder
                                }
                                className="flex items-center justify-center gap-2 rounded-xl bg-[#F3EDFF] py-3.5 font-black text-[#7652D9] dark:bg-[#302747]"
                              >
                                <HelpCircle size={18} />
                                No lo sé
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* REVERSO */}

                        <div className="absolute inset-0 flex flex-col overflow-y-auto rounded-[28px] border-2 border-[#BDE8D0] bg-gradient-to-br from-[#F1FCF6] via-white to-[#F3F0FF] p-7 [backface-visibility:hidden] [transform:rotateY(180deg)] dark:from-[#193028] dark:via-[#182437] dark:to-[#28243E]">
                          <CheckCircle2
                            size={42}
                            className="mx-auto text-[#26A66B]"
                          />

                          <p className="mt-4 text-center text-xs font-black uppercase tracking-[0.2em] text-[#258A5B]">
                            Respuesta correcta
                          </p>

                          <h2 className="mx-auto mt-4 max-w-3xl text-center text-2xl font-black leading-9">
                            {
                              tarjetaActual.reverso
                            }
                          </h2>

                          <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl bg-white/80 p-4 dark:bg-slate-800">
                              <p className="text-sm font-black text-[#7652D9]">
                                Tu respuesta
                              </p>

                              <p className="mt-2 text-sm leading-6 text-[#506C88] dark:text-slate-300">
                                {respuestaEscrita ||
                                  "No escribiste una respuesta."}
                              </p>
                            </div>

                            <div
                              className={`
                                rounded-2xl p-4
                                ${
                                  resultadoComparacion?.correcta
                                    ? "bg-[#DDF7EA] text-[#258A5B]"
                                    : "bg-[#FFF1E9] text-[#B85C2E]"
                                }
                              `}
                            >
                              <p className="text-sm font-black">
                                Comparación
                              </p>

                              <p className="mt-2 text-sm leading-6">
                                {
                                  resultadoComparacion?.mensaje
                                }
                              </p>

                              <p className="mt-2 text-xs font-black">
                                Coincidencia:{" "}
                                {resultadoComparacion?.porcentaje ||
                                  0}
                                %
                              </p>
                            </div>
                          </div>

                          {esPremium && (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div className="rounded-2xl bg-white/80 p-4 dark:bg-slate-800">
                                <p className="flex items-center gap-2 font-black text-[#7652D9]">
                                  <HelpCircle size={17} />
                                  Pista
                                </p>

                                <p className="mt-2 text-sm">
                                  {
                                    tarjetaActual.pista
                                  }
                                </p>
                              </div>

                              <div className="rounded-2xl bg-white/80 p-4 dark:bg-slate-800">
                                <p className="flex items-center gap-2 font-black text-[#D89A00]">
                                  <Lightbulb size={17} />
                                  Ejemplo
                                </p>

                                <p className="mt-2 text-sm">
                                  {
                                    tarjetaActual.ejemplo
                                  }
                                </p>
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setTarjetaVolteada(
                                false
                              )
                            }
                            className="mx-auto mt-5 flex items-center gap-2 text-sm font-bold text-[#7652D9]"
                          >
                            <Repeat2 size={17} />
                            Volver a la pregunta
                          </button>
                        </div>
                      </div>
                    </div>

                    {tarjetaVolteada && (
                      <div className="mt-7">
                        <p className="text-center font-black">
                          ¿Qué tan bien la recordaste?
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <button
                            type="button"
                            onClick={() =>
                              evaluarTarjeta(
                                "again"
                              )
                            }
                            className="rounded-2xl bg-[#FFF3F4] p-4 font-black text-[#D94D59]"
                          >
                            <RotateCcw className="mx-auto" />
                            <span className="mt-2 block">
                              Otra vez
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              evaluarTarjeta(
                                "almost"
                              )
                            }
                            className="rounded-2xl bg-[#FFF9EA] p-4 font-black text-[#B47D00]"
                          >
                            <HelpCircle className="mx-auto" />
                            <span className="mt-2 block">
                              Casi
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              evaluarTarjeta(
                                "mastered"
                              )
                            }
                            className="rounded-2xl bg-[#F0FBF5] p-4 font-black text-[#258A5B]"
                          >
                            <CheckCircle2 className="mx-auto" />
                            <span className="mt-2 block">
                              Dominada
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                </>
              ) : null}
            </section>
          )}
        </div>
      </div>

      {/* PREMIUM */}

      {mostrarPremium && (
        <div className="fixed inset-0 z-[230] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[28px] bg-white p-7 dark:bg-[#182437]">
            <button
              type="button"
              onClick={() =>
                setMostrarPremium(false)
              }
              className="absolute right-5 top-5"
            >
              <X />
            </button>

            <Crown
              size={45}
              className="text-[#D89A00]"
            />

            <h2 className="mt-5 text-2xl font-black">
              Flashcards Premium
            </h2>

            <p className="mt-3 text-[#6085A5]">
              Desbloquea hasta 50 tarjetas, pistas, ejemplos y repaso inteligente.
            </p>

            <Link
              href="/suscripcion"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] py-4 font-black text-white"
            >
              <Zap size={19} />
              Mejorar a Premium
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

/* =====================================================
   COMPONENTES
===================================================== */

function BotonFuente({
  activo,
  icono: Icono,
  titulo,
  descripcion,
  onClick,
}: {
  activo: boolean;
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-2xl border-2 p-5 text-left
        ${
          activo
            ? "border-[#7652D9] bg-[#F8F5FF] dark:bg-[#302747]"
            : "border-[#E4EAF2] dark:border-slate-700"
        }
      `}
    >
      <Icono className="text-[#7652D9]" />

      <h3 className="mt-4 font-black">
        {titulo}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#6085A5]">
        {descripcion}
      </p>
    </button>
  );
}

function Estadistica({
  nombre,
  valor,
}: {
  nombre: string;
  valor: string | number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#6085A5]">
        {nombre}
      </span>

      <span className="font-black">
        {valor}
      </span>
    </div>
  );
}

function ResultadoTarjeta({
  titulo,
  valor,
}: {
  titulo: string;
  valor: number;
}) {
  return (
    <div className="rounded-2xl bg-[#F7FAFD] p-5 text-center dark:bg-slate-800">
      <p className="text-3xl font-black text-[#7652D9]">
        {valor}
      </p>

      <p className="mt-2 text-sm font-bold text-[#6085A5]">
        {titulo}
      </p>
    </div>
  );
}