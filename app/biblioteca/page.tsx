"use client";

import type {
  FormEvent,
} from "react";

import type {
  LucideIcon,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Bell,
  BookMarked,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Calculator,
  ChevronDown,
  ClipboardCheck,
  Crown,
  FileText,
  FlaskConical,
  Heart,
  Home,
  Languages,
  Landmark,
  Laptop,
  Library,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  Moon,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Star,
  Sun,
  User,
  X,
} from "lucide-react";

import {
  supabase,
} from "../lib/supabase";

import GoogleBooksViewer from "./GoogleBooksViewer";

/* =====================================================
   TIPOS
===================================================== */

type PlanType =
  | "free"
  | "month"
  | "year";

type OrdenType =
  | "relevance"
  | "newest";

type IdiomaType =
  | "todos"
  | "es"
  | "en";

type FiltroType =
  | "todos"
  | "partial"
  | "full"
  | "free-ebooks";

type TabType =
  | "explorar"
  | "favoritos";

interface Libro {
  id: string;
  titulo: string;
  subtitulo: string;
  autores: string[];
  descripcion: string;
  categorias: string[];
  fechaPublicacion: string;
  editorial: string;
  paginas: number;
  idioma: string;
  portada: string;
  miniatura: string;
  vistaPrevia: string;
  informacion: string;
  lectorWeb: string;
  comprable: boolean;
  enlaceCompra: string;
  precio: number | null;
  moneda: string;
  valoracion: number;
  cantidadValoraciones: number;
  isbn: string;
  vistaDisponible: boolean;
  embebible: boolean;
  accesoCompleto: boolean;
  dominioPublico: boolean;
}

interface Favorito {
  libro_id: string;
  libro: Libro;
  created_at: string;
}

interface Categoria {
  id: string;
  nombre: string;
  consulta: string;
  descripcion: string;
  icono: LucideIcon;
  estilo: string;
}

interface ElementoMenu {
  nombre: string;
  href: string;
  icono: LucideIcon;
  activo?: boolean;
}

/* =====================================================
   CONSTANTES
===================================================== */

const CONSULTA_INICIAL =
  "educación aprendizaje productividad";

const CATEGORIAS: Categoria[] = [
  {
    id: "todos",
    nombre: "Todos",
    consulta:
      CONSULTA_INICIAL,
    descripcion:
      "Explora diferentes temas",
    icono: BookOpen,
    estilo:
      "bg-[#EAF1FF] text-[#1769E0]",
  },
  {
    id: "psicologia",
    nombre: "Psicología",
    consulta:
      "subject:psychology",
    descripcion:
      "Mente y comportamiento",
    icono: Brain,
    estilo:
      "bg-[#F7E5FF] text-[#A64DD4]",
  },
  {
    id: "ciencia",
    nombre: "Ciencia",
    consulta:
      "subject:science",
    descripcion:
      "Descubre y experimenta",
    icono: FlaskConical,
    estilo:
      "bg-[#DDF5FF] text-[#1687D9]",
  },
  {
    id: "historia",
    nombre: "Historia",
    consulta:
      "subject:history",
    descripcion:
      "Conoce el pasado",
    icono: Landmark,
    estilo:
      "bg-[#FFF0DE] text-[#C77722]",
  },
  {
    id: "tecnologia",
    nombre: "Tecnología",
    consulta:
      "subject:technology",
    descripcion:
      "Programación e innovación",
    icono: Laptop,
    estilo:
      "bg-[#E8EAFF] text-[#6056D9]",
  },
  {
    id: "negocios",
    nombre: "Negocios",
    consulta:
      "subject:business",
    descripcion:
      "Finanzas y emprendimiento",
    icono:
      BriefcaseBusiness,
    estilo:
      "bg-[#EEE8FF] text-[#7652D9]",
  },
  {
    id: "matematicas",
    nombre: "Matemáticas",
    consulta:
      "subject:mathematics",
    descripcion:
      "Números y razonamiento",
    icono: Calculator,
    estilo:
      "bg-[#E5F8EE] text-[#258A5B]",
  },
  {
    id: "idiomas",
    nombre: "Idiomas",
    consulta:
      "subject:language",
    descripcion:
      "Aprende nuevos idiomas",
    icono: Languages,
    estilo:
      "bg-[#FFF1E9] text-[#D66A2E]",
  },
  {
    id: "desarrollo",
    nombre:
      "Desarrollo personal",
    consulta:
      "subject:self-help",
    descripcion:
      "Hábitos y crecimiento",
    icono: Sprout,
    estilo:
      "bg-[#E3F8EC] text-[#2F9A67]",
  },
];

const ELEMENTOS_MENU: ElementoMenu[] = [
  {
    nombre: "Inicio",
    href: "/Dashboard",
    icono: Home,
  },
  {
    nombre:
      "Métodos de estudio",
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
    activo: true,
  },
    {
    nombre: "Lugares",
    href: "/lugares",
    icono: MapPin,
  },
  {
    nombre: "Perfil",
    href: "/perfil",
    icono: User,
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

function normalizarPlan(
  valor: unknown,
  premium = false
): PlanType {
  const texto = String(
    valor || ""
  )
    .trim()
    .toLowerCase();

  if (
    texto === "year" ||
    texto === "annual" ||
    texto === "anual" ||
    texto ===
      "premium_year" ||
    texto ===
      "premium_anual"
  ) {
    return "year";
  }

  if (
    texto === "month" ||
    texto === "monthly" ||
    texto === "mensual" ||
    texto === "premium" ||
    texto ===
      "premium_month" ||
    texto ===
      "premium_mensual"
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

function convertirTextoArray(
  valor: unknown,
  respaldo: string[]
): string[] {
  if (!Array.isArray(valor)) {
    return respaldo;
  }

  const resultado =
    valor.filter(
      (
        elemento
      ): elemento is string =>
        typeof elemento ===
          "string" &&
        elemento.trim().length > 0
    );

  return resultado.length > 0
    ? resultado
    : respaldo;
}

function normalizarLibro(
  dato: unknown
): Libro | null {
  if (!esObjeto(dato)) {
    return null;
  }

  const id =
    String(dato.id || "").trim();

  const titulo =
    typeof dato.titulo ===
      "string"
      ? dato.titulo.trim()
      : "";

  if (!id || !titulo) {
    return null;
  }

  return {
    id,
    titulo,

    subtitulo:
      typeof dato.subtitulo ===
      "string"
        ? dato.subtitulo
        : "",

    autores:
      convertirTextoArray(
        dato.autores,
        ["Autor desconocido"]
      ),

    descripcion:
      typeof dato.descripcion ===
      "string"
        ? dato.descripcion
        : "Descripción no disponible.",

    categorias:
      convertirTextoArray(
        dato.categorias,
        ["General"]
      ),

    fechaPublicacion:
      typeof dato.fechaPublicacion ===
      "string"
        ? dato.fechaPublicacion
        : "",

    editorial:
      typeof dato.editorial ===
      "string"
        ? dato.editorial
        : "Editorial no disponible",

    paginas:
      Number.isFinite(
        Number(dato.paginas)
      )
        ? Number(dato.paginas)
        : 0,

    idioma:
      typeof dato.idioma ===
      "string"
        ? dato.idioma
        : "",

    portada:
      typeof dato.portada ===
      "string"
        ? dato.portada
        : "",

    miniatura:
      typeof dato.miniatura ===
      "string"
        ? dato.miniatura
        : "",

    vistaPrevia:
      typeof dato.vistaPrevia ===
      "string"
        ? dato.vistaPrevia
        : "",

    informacion:
      typeof dato.informacion ===
      "string"
        ? dato.informacion
        : "",

    lectorWeb:
      typeof dato.lectorWeb ===
      "string"
        ? dato.lectorWeb
        : "",

    comprable:
      dato.comprable === true,

    enlaceCompra:
      typeof dato.enlaceCompra ===
      "string"
        ? dato.enlaceCompra
        : "",

    precio:
      typeof dato.precio ===
      "number"
        ? dato.precio
        : null,

    moneda:
      typeof dato.moneda ===
      "string"
        ? dato.moneda
        : "",

    valoracion:
      Number.isFinite(
        Number(dato.valoracion)
      )
        ? Number(
            dato.valoracion
          )
        : 0,

    cantidadValoraciones:
      Number.isFinite(
        Number(
          dato.cantidadValoraciones
        )
      )
        ? Number(
            dato.cantidadValoraciones
          )
        : 0,

    isbn:
      typeof dato.isbn ===
      "string"
        ? dato.isbn
        : "",

    vistaDisponible:
      dato.vistaDisponible ===
      true,

    embebible:
      dato.embebible === true,

    accesoCompleto:
      dato.accesoCompleto ===
      true,

    dominioPublico:
      dato.dominioPublico ===
      true,
  };
}

function obtenerError(
  dato: unknown
): string {
  if (!esObjeto(dato)) {
    return "No se pudo completar la solicitud.";
  }

  if (
    typeof dato.error ===
      "string" &&
    dato.error.trim()
  ) {
    return dato.error;
  }

  if (
    typeof dato.message ===
      "string" &&
    dato.message.trim()
  ) {
    return dato.message;
  }

  return "No se pudo completar la solicitud.";
}

function textoIdioma(
  idioma: string
): string {
  if (idioma === "es") {
    return "Español";
  }

  if (idioma === "en") {
    return "English";
  }

  return idioma
    ? idioma.toUpperCase()
    : "No indicado";
}

function añoPublicacion(
  fecha: string
): string {
  if (!fecha) {
    return "Sin fecha";
  }

  return fecha.split("-")[0];
}

/* =====================================================
   COMPONENTE PRINCIPAL
===================================================== */

export default function BibliotecaPage() {
  const router = useRouter();

  /* USUARIO */

  const [
    nombreUsuario,
    setNombreUsuario,
  ] = useState("Usuario");

  const [
    fotoPerfil,
    setFotoPerfil,
  ] = useState(
    "/raccoon.png"
  );

  const [
    usuarioId,
    setUsuarioId,
  ] = useState("");

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
    planActual !== "free";

  /* LIBROS */

  const [
    libros,
    setLibros,
  ] = useState<Libro[]>([]);

  const [
    libroActivo,
    setLibroActivo,
  ] = useState<Libro | null>(
    null
  );

  const [
    libroLeyendo,
    setLibroLeyendo,
  ] = useState<Libro | null>(
    null
  );

  const [
    cargandoLibros,
    setCargandoLibros,
  ] = useState(true);

  const [
    cargandoMas,
    setCargandoMas,
  ] = useState(false);

  const [
    totalResultados,
    setTotalResultados,
  ] = useState(0);

  const [
    consultaActual,
    setConsultaActual,
  ] = useState(
    CONSULTA_INICIAL
  );

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    categoriaActiva,
    setCategoriaActiva,
  ] = useState("todos");

  const [
    orden,
    setOrden,
  ] =
    useState<OrdenType>(
      "relevance"
    );

  const [
    idioma,
    setIdioma,
  ] =
    useState<IdiomaType>(
      "todos"
    );

  const [
    filtro,
    setFiltro,
  ] =
    useState<FiltroType>(
      "todos"
    );

  const [
    tabActiva,
    setTabActiva,
  ] =
    useState<TabType>(
      "explorar"
    );

  /* FAVORITOS */

  const [
    favoritos,
    setFavoritos,
  ] = useState<Favorito[]>([]);

  const [
    cargandoFavoritos,
    setCargandoFavoritos,
  ] = useState(true);

  const [
    guardandoFavorito,
    setGuardandoFavorito,
  ] = useState("");

  /* INTERFAZ */

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
    mostrarFiltros,
    setMostrarFiltros,
  ] = useState(false);

  const [
    mostrarPremium,
    setMostrarPremium,
  ] = useState(false);

  const [
    notificacion,
    setNotificacion,
  ] = useState("");

  const limiteFavoritos =
    esPremium
      ? Number.POSITIVE_INFINITY
      : 12;

  const cantidadPorPagina =
    esPremium ? 24 : 12;

  const librosFavoritos =
    favoritos.map(
      (favorito) =>
        favorito.libro
    );

  const librosMostrados =
    tabActiva === "favoritos"
      ? librosFavoritos
      : libros;

  const puedeCargarMas =
    tabActiva === "explorar" &&
    libros.length <
      totalResultados;

  /* =====================================================
     INICIAR
  ===================================================== */

  useEffect(() => {
    const iniciar = async () => {
      inicializarTema();

      const informacion =
        await cargarUsuarioYPlan();

      if (!informacion) {
        return;
      }

      await Promise.all([
        cargarFavoritos(
          informacion.usuarioId
        ),

        buscarLibros(
          CONSULTA_INICIAL,
          true,
          {
            premium:
              informacion.plan !==
              "free",
          }
        ),
      ]);
    };

    void iniciar();
  }, []);

  /* =====================================================
     TEMA
  ===================================================== */

  function inicializarTema() {
    const guardado =
      localStorage.getItem(
        "raccoon-theme"
      );

    const sistemaOscuro =
      window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches ?? false;

    const oscuro =
      guardado === "dark" ||
      (
        !guardado &&
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
    }, 4000);
  }

  /* =====================================================
     USUARIO Y PLAN
  ===================================================== */

  async function cargarUsuarioYPlan(): Promise<{
    usuarioId: string;
    plan: PlanType;
  } | null> {
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

      setUsuarioId(user.id);

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
          "string" &&
        metadata.avatar_url.trim()
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

      let plan =
        normalizarPlan(
          metadata.plan ||
            metadata.subscription ||
            metadata.tipo_plan ||
            metadata.subscription_plan,
          premiumMetadata
        );

      try {
        const respuesta =
          await fetch(
            "/api/suscripciones",
            {
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
            plan =
              normalizarPlan(
                datos.plan ||
                  datos.subscription ||
                  datos.tipo_plan,
                datos.premium ===
                  true ||
                  datos.is_premium ===
                    true ||
                  datos.es_premium ===
                    true
              );
          }
        }
      } catch (error) {
        console.warn(
          "No se pudo verificar el plan:",
          error
        );
      }

      setPlanActual(plan);

      return {
        usuarioId: user.id,
        plan,
      };
    } catch (error) {
      console.error(
        "Error cargando cuenta:",
        error
      );

      mostrarNotificacion(
        "No se pudo cargar tu cuenta."
      );

      return null;
    } finally {
      setCargandoPlan(false);
    }
  }

  /* =====================================================
     BUSCAR LIBROS
  ===================================================== */

  async function buscarLibros(
    consulta: string,
    reiniciar = true,
    opciones?: {
      premium?: boolean;
      orden?: OrdenType;
      idioma?: IdiomaType;
      filtro?: FiltroType;
    }
  ) {
    const termino =
      consulta.trim();

    if (!termino) {
      mostrarNotificacion(
        "Escribe un título, autor o tema."
      );

      return;
    }

    const usarPremium =
      opciones?.premium ??
      esPremium;

    const ordenUsado =
      opciones?.orden ??
      orden;

    const idiomaUsado =
      opciones?.idioma ??
      idioma;

    const filtroUsado =
      opciones?.filtro ??
      filtro;

    try {
      if (reiniciar) {
        setCargandoLibros(true);
      } else {
        setCargandoMas(true);
      }

      const inicio =
        reiniciar
          ? 0
          : libros.length;

      const parametros =
        new URLSearchParams({
          q: termino,

          startIndex:
            String(inicio),

          maxResults:
            String(
              usarPremium
                ? 24
                : 12
            ),

          orderBy:
            ordenUsado,
        });

      if (
        idiomaUsado !==
        "todos"
      ) {
        parametros.set(
          "langRestrict",
          idiomaUsado
        );
      }

      if (
        filtroUsado !==
        "todos"
      ) {
        parametros.set(
          "filter",
          filtroUsado
        );
      }

      const respuesta =
        await fetch(
          `/api/libros?${parametros.toString()}`,
          {
            cache: "no-store",
          }
        );

      const datos: unknown =
        await respuesta
          .json()
          .catch(() => null);

      if (!respuesta.ok) {
        throw new Error(
          obtenerError(datos)
        );
      }

      if (
        !esObjeto(datos) ||
        !Array.isArray(
          datos.libros
        )
      ) {
        throw new Error(
          "La API devolvió una respuesta inválida."
        );
      }

      const nuevosLibros =
        datos.libros
          .map(normalizarLibro)
          .filter(
            (
              libro
            ): libro is Libro =>
              libro !== null
          );

      setLibros(
        (actuales) => {
          if (reiniciar) {
            return nuevosLibros;
          }

          return [
            ...actuales,
            ...nuevosLibros.filter(
              (nuevo) =>
                !actuales.some(
                  (actual) =>
                    actual.id ===
                    nuevo.id
                )
            ),
          ];
        }
      );

      setTotalResultados(
        Number(
          datos.total || 0
        )
      );

      if (reiniciar) {
        setConsultaActual(
          termino
        );

        setTabActiva(
          "explorar"
        );
      }
    } catch (error) {
      console.error(
        "Error buscando libros:",
        error
      );

      if (reiniciar) {
        setLibros([]);
      }

      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los libros."
      );
    } finally {
      setCargandoLibros(false);
      setCargandoMas(false);
    }
  }

  function buscarDesdeFormulario(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    const categoria =
      CATEGORIAS.find(
        (elemento) =>
          elemento.id ===
          categoriaActiva
      );

    const texto =
      busqueda.trim();

    const consulta =
      texto
        ? categoriaActiva ===
          "todos"
          ? texto
          : `${texto} ${categoria?.consulta || ""}`
        : categoria?.consulta ||
          CONSULTA_INICIAL;

    void buscarLibros(
      consulta,
      true
    );
  }

  function seleccionarCategoria(
    categoria: Categoria
  ) {
    setCategoriaActiva(
      categoria.id
    );

    setBusqueda("");

    void buscarLibros(
      categoria.consulta,
      true
    );
  }

  function cambiarOrden(
    nuevoOrden: OrdenType
  ) {
    if (
      nuevoOrden === "newest" &&
      !esPremium
    ) {
      setMostrarPremium(true);
      return;
    }

    setOrden(nuevoOrden);

    void buscarLibros(
      consultaActual,
      true,
      {
        orden: nuevoOrden,
      }
    );
  }

  function cambiarIdioma(
    nuevoIdioma: IdiomaType
  ) {
    setIdioma(nuevoIdioma);

    void buscarLibros(
      consultaActual,
      true,
      {
        idioma:
          nuevoIdioma,
      }
    );
  }

  function cambiarFiltro(
    nuevoFiltro: FiltroType
  ) {
    setFiltro(nuevoFiltro);

    void buscarLibros(
      consultaActual,
      true,
      {
        filtro:
          nuevoFiltro,
      }
    );
  }

  /* =====================================================
     FAVORITOS
  ===================================================== */

  async function cargarFavoritos(
    id: string
  ) {
    try {
      setCargandoFavoritos(true);

      const {
        data,
        error,
      } = await supabase
        .from(
          "biblioteca_favoritos"
        )
        .select(
          "libro_id, libro, created_at"
        )
        .eq(
          "user_id",
          id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {
        throw new Error(
          error.message
        );
      }

      const lista:
        Favorito[] = [];

      for (
        const elemento of
          data || []
      ) {
        const libro =
          normalizarLibro(
            elemento.libro
          );

        if (!libro) {
          continue;
        }

        lista.push({
          libro_id:
            String(
              elemento.libro_id
            ),

          libro,

          created_at:
            String(
              elemento.created_at ||
                ""
            ),
        });
      }

      setFavoritos(lista);
    } catch (error) {
      console.warn(
        "No se cargaron favoritos:",
        error
      );

      setFavoritos([]);
    } finally {
      setCargandoFavoritos(false);
    }
  }

  function esFavorito(
    libroId: string
  ): boolean {
    return favoritos.some(
      (favorito) =>
        favorito.libro_id ===
        libroId
    );
  }

  async function alternarFavorito(
    libro: Libro
  ) {
    if (
      !usuarioId ||
      guardandoFavorito
    ) {
      return;
    }

    const guardado =
      esFavorito(libro.id);

    try {
      setGuardandoFavorito(
        libro.id
      );

      if (guardado) {
        const {
          error,
        } = await supabase
          .from(
            "biblioteca_favoritos"
          )
          .delete()
          .eq(
            "user_id",
            usuarioId
          )
          .eq(
            "libro_id",
            libro.id
          );

        if (error) {
          throw new Error(
            error.message
          );
        }

        setFavoritos(
          (actuales) =>
            actuales.filter(
              (favorito) =>
                favorito.libro_id !==
                libro.id
            )
        );

        mostrarNotificacion(
          "Libro eliminado de favoritos."
        );

        return;
      }

      if (
        !esPremium &&
        favoritos.length >=
          limiteFavoritos
      ) {
        setMostrarPremium(true);
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from(
          "biblioteca_favoritos"
        )
        .insert({
          user_id:
            usuarioId,

          libro_id:
            libro.id,

          libro,
        })
        .select(
          "libro_id, libro, created_at"
        )
        .single();

      if (error) {
        throw new Error(
          error.message
        );
      }

      setFavoritos(
        (actuales) => [
          {
            libro_id:
              libro.id,

            libro,

            created_at:
              String(
                data.created_at ||
                  new Date().toISOString()
              ),
          },
          ...actuales,
        ]
      );

      mostrarNotificacion(
        "Libro guardado en favoritos."
      );
    } catch (error) {
      console.error(
        "Error actualizando favorito:",
        error
      );

      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el favorito."
      );
    } finally {
      setGuardandoFavorito("");
    }
  }

  /* =====================================================
     ABRIR LECTOR
  ===================================================== */

  function abrirLector(
    libro: Libro
  ) {
    if (!libro.embebible) {
      mostrarNotificacion(
        "Este libro no permite lectura dentro de la aplicación."
      );

      return;
    }

    setLibroLeyendo(libro);
    setLibroActivo(null);
  }

  /* =====================================================
     SESIÓN
  ===================================================== */

  async function cerrarSesion() {
    await supabase.auth.signOut();

    router.push("/Login");
  }

  /* =====================================================
     INTERFAZ
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#FBFCFF] text-[#10233F] transition-colors duration-500 dark:bg-[#0C1524] dark:text-white">
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
          fixed left-0 top-0 z-50 flex h-screen w-[238px]
          flex-col border-r border-[#E4EAF3] bg-white
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
          {ELEMENTOS_MENU.map(
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
                      ? "bg-gradient-to-r from-[#EEF6FF] to-[#F3EEFF] font-black text-[#6548E8] shadow-sm dark:from-[#243650] dark:to-[#302B58]"
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
              relative block overflow-hidden rounded-2xl p-4 text-white shadow-lg
              ${
                esPremium
                  ? "bg-gradient-to-br from-[#F2B93B] to-[#7771E8]"
                  : "bg-gradient-to-br from-[#55A8E8] to-[#7771E8]"
              }
            `}
          >
            <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-white/15" />

            <div className="relative flex items-center gap-3">
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

      <div className="lg:ml-[238px]">
        {/* HEADER */}

        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#E4EAF3] bg-white/95 px-4 backdrop-blur-xl dark:border-slate-700 dark:bg-[#151F30]/90 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setMenuAbierto(true)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#55A8E8] lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>

            <div>
              <h1 className="text-xl font-black">
                Biblioteca
              </h1>

              <p className="hidden text-xs text-[#6085A5] sm:block">
                Encuentra libros para continuar aprendiendo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
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
                  className="hidden sm:block"
                />
              </button>

              {perfilAbierto && (
                <div className="absolute right-0 top-14 z-50 w-52 rounded-2xl border border-[#E7EDF5] bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <div className="border-b border-[#E7EDF5] px-3 py-3 dark:border-slate-700">
                    <p className="truncate font-black">
                      {nombreUsuario}
                    </p>

                    <p className="mt-1 text-xs text-[#6085A5]">
                      {nombrePlan(
                        planActual
                      )}
                    </p>
                  </div>

                  <Link
                    href="/perfil"
                    className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <User size={17} />
                    Mi perfil
                  </Link>

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
          <div className="fixed left-1/2 top-5 z-[400] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 rounded-2xl bg-[#4169A1] px-5 py-3 text-center text-sm font-bold text-white shadow-2xl">
            {notificacion}
          </div>
        )}

        <div className="mx-auto max-w-[1540px] px-4 py-5 pb-24 sm:px-6 xl:px-7">
          {/* HERO */}

          <section className="relative overflow-hidden rounded-[28px] border border-[#E6EAF6] bg-gradient-to-r from-[#F2EDFF] via-[#F8F7FF] to-[#EAF6FF] px-7 py-7 shadow-[0_14px_40px_rgba(92,91,190,0.08)] dark:border-slate-700 dark:from-[#28243E] dark:via-[#24263F] dark:to-[#1C304D] sm:px-9 sm:py-8">
            <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#7652D9]/10" />

            <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#7652D9] shadow-sm dark:bg-slate-800">
                  <Sparkles size={16} />
                  Aprende con libros
                </span>

                <h1 className="mt-5 text-3xl font-black sm:text-4xl">
                  Biblioteca Raccoon
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-[#6085A5] dark:text-slate-300">
                  Busca libros, explora categorías, guarda tus favoritos y lee las vistas disponibles sin salir de Raccoon Study.
                </p>
              </div>

              <Image
                src="/raccoon.png"
                alt="Raccoon leyendo"
                width={205}
                height={205}
                className="h-[170px] w-[210px] object-contain drop-shadow-[0_14px_18px_rgba(72,74,145,0.16)] sm:h-[190px]"
              />
            </div>
          </section>

          {/* BÚSQUEDA */}

          <form
            onSubmit={
              buscarDesdeFormulario
            }
            className="relative z-10 mt-3 flex w-full flex-col gap-3 rounded-[22px] border border-[#E5EAF2] bg-white p-3 shadow-[0_10px_30px_rgba(38,70,110,0.08)] dark:border-slate-700 dark:bg-[#182437] sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-[#E6EBF3] bg-[#FBFCFE] px-4 dark:border-slate-700 dark:bg-slate-800">
              <Search className="shrink-0 text-[#8AA4BE]" />

              <input
                value={busqueda}
                onChange={(evento) =>
                  setBusqueda(
                    evento.target.value
                  )
                }
                placeholder="Buscar por título, autor o tema..."
                className="w-full bg-transparent py-4 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setMostrarFiltros(
                  !mostrarFiltros
                )
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-[#DED8FF] bg-[#F7F4FF] px-6 py-3 font-black text-[#7652D9] transition hover:bg-[#EFEAFF] dark:border-[#514B75] dark:bg-[#302747]"
            >
              <SlidersHorizontal size={18} />
              Filtros
            </button>

            <button
              type="submit"
              className="flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#356AF2] to-[#7652D9] px-7 py-3 font-black text-white shadow-lg shadow-[#7652D9]/15 transition hover:-translate-y-0.5"
            >
              Buscar
            </button>
          </form>

          {/* FILTROS */}

          {mostrarFiltros && (
            <section className="mx-auto mt-4 grid max-w-4xl gap-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-[#182437] sm:grid-cols-3">
              <label>
                <span className="text-xs font-black text-[#6085A5]">
                  Orden
                </span>

                <select
                  value={orden}
                  onChange={(evento) =>
                    cambiarOrden(
                      evento.target
                        .value as OrdenType
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#DDE6F0] bg-white p-3 outline-none dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="relevance">
                    Más relevantes
                  </option>

                  <option value="newest">
                    Más recientes · Premium
                  </option>
                </select>
              </label>

              <label>
                <span className="text-xs font-black text-[#6085A5]">
                  Idioma
                </span>

                <select
                  value={idioma}
                  onChange={(evento) =>
                    cambiarIdioma(
                      evento.target
                        .value as IdiomaType
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#DDE6F0] bg-white p-3 outline-none dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="todos">
                    Todos
                  </option>

                  <option value="es">
                    Español
                  </option>

                  <option value="en">
                    English
                  </option>
                </select>
              </label>

              <label>
                <span className="text-xs font-black text-[#6085A5]">
                  Disponibilidad
                </span>

                <select
                  value={filtro}
                  onChange={(evento) =>
                    cambiarFiltro(
                      evento.target
                        .value as FiltroType
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#DDE6F0] bg-white p-3 outline-none dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="todos">
                    Todos
                  </option>

                  <option value="partial">
                    Con vista previa
                  </option>

                  <option value="full">
                    Lectura completa
                  </option>

                  <option value="free-ebooks">
                    Libros gratuitos
                  </option>
                </select>
              </label>
            </section>
          )}

          {/* CATEGORÍAS */}

          <section className="mt-6">
            <div className="mb-5">
              <h2 className="text-2xl font-black">
                Categorías populares
              </h2>

              <p className="mt-1 text-sm text-[#6085A5]">
                Selecciona un tema para descubrir nuevos libros.
              </p>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 [scrollbar-width:thin] [scrollbar-color:#B9C8DD_transparent]">
              {CATEGORIAS.map(
                (categoria) => {
                  const Icono =
                    categoria.icono;

                  const activa =
                    categoriaActiva ===
                    categoria.id;

                  return (
                    <button
                      key={
                        categoria.id
                      }
                      type="button"
                      onClick={() =>
                        seleccionarCategoria(
                          categoria
                        )
                      }
                      className={`
                        min-w-[142px] rounded-[18px] border p-4 text-center transition
                        ${
                          activa
                            ? "border-[#7652D9] bg-white shadow-[0_8px_24px_rgba(118,82,217,0.12)] dark:bg-[#302747]"
                            : "border-[#E8EDF4] bg-white hover:-translate-y-1 hover:border-[#D8D0FF] hover:shadow-md dark:border-slate-700 dark:bg-[#182437]"
                        }
                      `}
                    >
                      <div
                        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${categoria.estilo}`}
                      >
                        <Icono size={21} />
                      </div>

                      <p className="mt-3 font-black">
                        {categoria.nombre}
                      </p>

                      <p className="mt-1 text-xs text-[#6085A5]">
                        {
                          categoria.descripcion
                        }
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </section>

          {/* TABS */}

          <div className="mt-5 flex w-full flex-wrap gap-1 rounded-[18px] border border-[#E8EDF4] bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-[#182437]">
            <button
              type="button"
              onClick={() =>
                setTabActiva(
                  "explorar"
                )
              }
              className={`
                flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black
                ${
                  tabActiva ===
                  "explorar"
                    ? "bg-[#EDE9FF] text-[#7652D9] dark:bg-[#302747]"
                    : "text-[#6085A5]"
                }
              `}
            >
              <BookOpen size={18} />
              Explorar
            </button>

            <button
              type="button"
              onClick={() =>
                setTabActiva(
                  "favoritos"
                )
              }
              className={`
                flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black
                ${
                  tabActiva ===
                  "favoritos"
                    ? "bg-[#FFEAF0] text-[#E04E76] dark:bg-[#402536]"
                    : "text-[#6085A5]"
                }
              `}
            >
              <Heart size={18} />
              Favoritos

              <span className="rounded-full bg-white px-2 py-0.5 text-xs dark:bg-slate-700">
                {favoritos.length}
              </span>
            </button>
          </div>

          {/* RESULTADOS */}

          <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">
                    {tabActiva ===
                    "favoritos"
                      ? "Mis libros favoritos"
                      : categoriaActiva ===
                          "todos"
                        ? "Libros recomendados"
                        : CATEGORIAS.find(
                            (
                              categoria
                            ) =>
                              categoria.id ===
                              categoriaActiva
                          )?.nombre}
                  </h2>

                  <p className="mt-1 text-sm text-[#6085A5]">
                    {tabActiva ===
                    "favoritos"
                      ? "Tus próximas lecturas guardadas."
                      : `${totalResultados.toLocaleString(
                          "es-PA"
                        )} resultados encontrados.`}
                  </p>
                </div>

                {tabActiva ===
                  "explorar" && (
                  <button
                    type="button"
                    onClick={() =>
                      void buscarLibros(
                        consultaActual,
                        true
                      )
                    }
                    disabled={
                      cargandoLibros
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#7652D9] shadow-sm disabled:opacity-50 dark:bg-[#182437]"
                    aria-label="Recargar libros"
                  >
                    <RefreshCcw
                      className={
                        cargandoLibros
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>
                )}
              </div>

              {cargandoLibros &&
              tabActiva ===
                "explorar" ? (
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  {Array.from({
                    length: 6,
                  }).map(
                    (
                      _,
                      indice
                    ) => (
                      <div
                        key={indice}
                        className="h-[440px] animate-pulse rounded-2xl bg-white dark:bg-[#182437]"
                      />
                    )
                  )}
                </div>
              ) : cargandoFavoritos &&
                tabActiva ===
                  "favoritos" ? (
                <div className="flex h-72 items-center justify-center">
                  <LoaderCircle className="animate-spin text-[#7652D9]" />
                </div>
              ) : librosMostrados.length ===
                0 ? (
                <div className="rounded-[25px] bg-white p-12 text-center dark:bg-[#182437]">
                  <BookOpen
                    size={50}
                    className="mx-auto text-[#9CB1C7]"
                  />

                  <h3 className="mt-5 text-xl font-black">
                    {tabActiva ===
                    "favoritos"
                      ? "Aún no tienes favoritos"
                      : "No encontramos libros"}
                  </h3>

                  <p className="mt-2 text-[#6085A5]">
                    {tabActiva ===
                    "favoritos"
                      ? "Guarda un libro tocando el corazón."
                      : "Prueba con otra búsqueda o categoría."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  {librosMostrados.map(
                    (libro) => (
                      <TarjetaLibro
                        key={
                          libro.id
                        }
                        libro={libro}
                        favorito={esFavorito(
                          libro.id
                        )}
                        guardando={
                          guardandoFavorito ===
                          libro.id
                        }
                        onAbrir={() =>
                          setLibroActivo(
                            libro
                          )
                        }
                        onFavorito={() =>
                          void alternarFavorito(
                            libro
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}

              {puedeCargarMas && (
                <button
                  type="button"
                  onClick={() =>
                    void buscarLibros(
                      consultaActual,
                      false
                    )
                  }
                  disabled={cargandoMas}
                  className="mx-auto mt-7 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#356AF2] to-[#7652D9] px-7 py-4 font-black text-white disabled:opacity-60"
                >
                  {cargandoMas ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <BookOpen />
                  )}

                  {cargandoMas
                    ? "Cargando libros..."
                    : `Cargar ${cantidadPorPagina} más`}
                </button>
              )}
            </div>

            {/* PANEL DERECHO */}

            <aside className="space-y-5">
              <section className="overflow-hidden rounded-[22px] border border-[#E6EBF3] bg-white shadow-sm dark:border-slate-700 dark:bg-[#182437]">
                <div className="flex items-center gap-2 px-5 pb-3 pt-5">
                  <BookOpen size={20} className="text-[#7652D9]" />
                  <h2 className="font-black">Mi biblioteca</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setTabActiva("favoritos")}
                  className="flex w-full items-center justify-between border-t border-[#EDF1F6] px-5 py-4 text-left transition hover:bg-[#FAFBFF] dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0F4] text-[#E04E76]">
                      <Heart size={18} />
                    </span>
                    <span className="text-sm font-bold">Favoritos</span>
                  </span>
                  <span className="flex items-center gap-2 font-black">
                    {favoritos.length}
                    <ArrowRight size={15} className="text-[#91A2B5]" />
                  </span>
                </button>

                <div className="flex w-full items-center justify-between border-t border-[#EDF1F6] px-5 py-4 dark:border-slate-700">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#3478E5]">
                      <BookMarked size={18} />
                    </span>
                    <span className="text-sm font-bold">Vistas disponibles</span>
                  </span>
                  <span className="font-black">
                    {libros.filter((libro) => libro.vistaDisponible).length}
                  </span>
                </div>

                <div className="flex w-full items-center justify-between border-t border-[#EDF1F6] px-5 py-4 dark:border-slate-700">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F8FF] text-[#1687D9]">
                      <BookOpen size={18} />
                    </span>
                    <span className="text-sm font-bold">Resultados</span>
                  </span>
                  <span className="font-black">
                    {totalResultados.toLocaleString("es-PA")}
                  </span>
                </div>
              </section>

              <section className="rounded-[22px] border border-[#E6EBF3] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#182437]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#D4931C]">
                      Tus lecturas
                    </p>
                    <h2 className="mt-1 text-lg font-black">
                      Favoritos recientes
                    </h2>
                  </div>
                  <BookMarked size={20} className="text-[#D4931C]" />
                </div>

                {favoritos.length === 0 ? (
                  <div className="mt-4 rounded-2xl bg-[#F8FBFD] p-5 text-center dark:bg-slate-800">
                    <Heart className="mx-auto text-[#9CB1C7]" />
                    <p className="mt-3 text-sm font-bold">
                      Guarda tus próximas lecturas.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {favoritos.slice(0, 2).map((favorito) => (
                      <button
                        key={favorito.libro_id}
                        type="button"
                        onClick={() => setLibroActivo(favorito.libro)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-[#E7EDF5] p-3 text-left transition hover:border-[#7652D9] hover:shadow-sm dark:border-slate-700"
                      >
                        {favorito.libro.miniatura ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={favorito.libro.miniatura}
                            alt={favorito.libro.titulo}
                            className="h-16 w-11 rounded-md object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-16 w-11 items-center justify-center rounded-md bg-[#EDE9FF]">
                            <BookOpen size={18} />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-black">
                            {favorito.libro.titulo}
                          </p>
                          <p className="mt-1 truncate text-xs text-[#6085A5]">
                            {favorito.libro.autores[0]}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="relative overflow-hidden rounded-[22px] border border-[#E1E8F5] bg-gradient-to-br from-[#F4F8FF] to-[#EDF4FF] p-5 dark:border-slate-700 dark:from-[#1A2940] dark:to-[#182437]">
                <Sparkles size={20} className="text-[#3478E5]" />
                <h2 className="mt-3 font-black text-[#3478E5]">
                  Consejo del día
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#5D7894] dark:text-slate-300">
                  Explora una categoría diferente y guarda los libros que quieras revisar después.
                </p>
                <Image
                  src="/raccoon.png"
                  alt="Raccoon"
                  width={76}
                  height={76}
                  className="absolute -bottom-2 -right-1 object-contain opacity-95"
                />
              </section>

              <section
                className={`
                  relative overflow-hidden rounded-[22px] p-5 text-white shadow-sm
                  ${
                    esPremium
                      ? "bg-gradient-to-br from-[#F2B93B] via-[#E6A834] to-[#7771E8]"
                      : "bg-gradient-to-br from-[#55A8E8] to-[#7771E8]"
                  }
                `}
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15" />
                <Crown size={26} />
                <h2 className="mt-3 text-lg font-black">
                  {esPremium ? "Premium activo" : "Raccoon Premium"}
                </h2>
                <p className="mt-1 text-xs text-white/85">
                  {esPremium
                    ? "Disfruta tu biblioteca sin límites."
                    : "Desbloquea más resultados y favoritos."}
                </p>

                <Link
                  href="/suscripcion"
                  className="relative mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/95 py-3 text-sm font-black text-[#7652D9]"
                >
                  {esPremium ? "Administrar plan" : "Ver Premium"}
                  <ArrowRight size={16} />
                </Link>
              </section>
            </aside>
          </div>

          {/* RECOMENDACIÓN */}

          <section className="mt-7 overflow-hidden rounded-[24px] border border-[#E5E7F5] bg-gradient-to-r from-[#F3EEFF] to-[#EAF8FF] p-6 dark:from-[#28243E] dark:to-[#1C304D]">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                <Image
                  src="/raccoon.png"
                  alt="Raccoon recomendando libros"
                  width={120}
                  height={120}
                />

                <div>
                  <h2 className="text-2xl font-black">
                    ¿No sabes qué leer?
                  </h2>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-[#6085A5] dark:text-slate-300">
                    Raccoon puede seleccionar una categoría al azar para ayudarte a descubrir nuevos temas.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const opciones =
                    CATEGORIAS.filter(
                      (categoria) =>
                        categoria.id !==
                        "todos"
                    );

                  const categoria =
                    opciones[
                      Math.floor(
                        Math.random() *
                          opciones.length
                      )
                    ];

                  seleccionarCategoria(
                    categoria
                  );
                }}
                className="rounded-xl bg-[#7652D9] px-6 py-4 font-black text-white"
              >
                Sorpréndeme
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* DETALLE DEL LIBRO */}

      {libroActivo && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() =>
              setLibroActivo(null)
            }
            className="absolute inset-0"
            aria-label="Cerrar detalle"
          />

          <section className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-white p-6 shadow-2xl dark:bg-[#182437] sm:p-8">
            <button
              type="button"
              onClick={() =>
                setLibroActivo(null)
              }
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5FA] text-[#6085A5] transition hover:bg-red-50 hover:text-red-500 dark:bg-slate-700"
              aria-label="Cerrar"
            >
              <X />
            </button>

            <div className="grid gap-7 md:grid-cols-[230px_1fr]">
              <div>
                {libroActivo.portada ||
                libroActivo.miniatura ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      libroActivo.portada ||
                      libroActivo.miniatura
                    }
                    alt={
                      libroActivo.titulo
                    }
                    className="mx-auto h-[330px] w-[220px] rounded-xl object-cover shadow-xl"
                    onError={(evento) => {
                      evento.currentTarget.src =
                        "/raccoon.png";
                    }}
                  />
                ) : (
                  <div className="mx-auto flex h-[330px] w-[220px] items-center justify-center rounded-xl bg-gradient-to-br from-[#EDE9FF] to-[#DDF3FF]">
                    <BookOpen
                      size={70}
                      className="text-[#7652D9]"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void alternarFavorito(
                      libroActivo
                    )
                  }
                  disabled={
                    guardandoFavorito ===
                    libroActivo.id
                  }
                  className={`
                    mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-black
                    ${
                      esFavorito(
                        libroActivo.id
                      )
                        ? "bg-[#FFEAF0] text-[#E04E76]"
                        : "bg-[#F1F5FA] text-[#6085A5] dark:bg-slate-700"
                    }
                  `}
                >
                  {guardandoFavorito ===
                  libroActivo.id ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Heart
                      size={18}
                      fill={
                        esFavorito(
                          libroActivo.id
                        )
                          ? "currentColor"
                          : "none"
                      }
                    />
                  )}

                  {esFavorito(
                    libroActivo.id
                  )
                    ? "Guardado"
                    : "Guardar favorito"}
                </button>
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  {libroActivo.categorias
                    .slice(0, 3)
                    .map(
                      (
                        categoria
                      ) => (
                        <span
                          key={
                            categoria
                          }
                          className="rounded-full bg-[#EDE9FF] px-3 py-1.5 text-xs font-black text-[#7652D9] dark:bg-[#302747]"
                        >
                          {categoria}
                        </span>
                      )
                    )}

                  {libroActivo.embebible && (
                    <span className="rounded-full bg-[#DDF7EA] px-3 py-1.5 text-xs font-black text-[#258A5B]">
                      Lectura interna
                    </span>
                  )}
                </div>

                <h2 className="mt-4 pr-10 text-3xl font-black">
                  {
                    libroActivo.titulo
                  }
                </h2>

                {libroActivo.subtitulo && (
                  <p className="mt-2 text-lg font-semibold text-[#6085A5]">
                    {
                      libroActivo.subtitulo
                    }
                  </p>
                )}

                <p className="mt-3 font-bold text-[#4169A1]">
                  {libroActivo.autores.join(
                    ", "
                  )}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <DatoLibro
                    icono={Star}
                    texto={
                      libroActivo.valoracion
                        ? `${libroActivo.valoracion} estrellas`
                        : "Sin valoración"
                    }
                  />

                  <DatoLibro
                    icono={FileText}
                    texto={
                      libroActivo.paginas
                        ? `${libroActivo.paginas} páginas`
                        : "Páginas no indicadas"
                    }
                  />

                  <DatoLibro
                    icono={Languages}
                    texto={textoIdioma(
                      libroActivo.idioma
                    )}
                  />

                  <DatoLibro
                    icono={BookOpen}
                    texto={añoPublicacion(
                      libroActivo.fechaPublicacion
                    )}
                  />
                </div>

                <div className="mt-6 rounded-2xl bg-[#F8FBFD] p-5 dark:bg-slate-800">
                  <h3 className="font-black">
                    Descripción
                  </h3>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#506C88] dark:text-slate-300">
                    {
                      libroActivo.descripcion
                    }
                  </p>
                </div>

                <div className="mt-5">
                  {libroActivo.embebible ? (
                    <button
                      type="button"
                      onClick={() =>
                        abrirLector(
                          libroActivo
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#356AF2] to-[#7652D9] py-4 font-black text-white shadow-lg shadow-[#7652D9]/20 transition hover:-translate-y-0.5"
                    >
                      <BookOpen size={19} />
                      Leer dentro de Raccoon
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-[#E7EDF5] px-4 py-4 text-center text-sm font-black text-[#8AA4BE] dark:bg-slate-700">
                      <BookOpen size={19} />
                      Este libro no permite lectura interna
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* LECTOR INTERNO */}

      {libroLeyendo && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/75 p-2 backdrop-blur-sm sm:p-5">
          <button
            type="button"
            onClick={() =>
              setLibroLeyendo(null)
            }
            className="absolute inset-0"
            aria-label="Cerrar lector"
          />

          <section className="relative flex h-[97vh] w-full max-w-7xl flex-col overflow-hidden rounded-[26px] bg-white shadow-2xl dark:bg-[#182437] sm:h-[94vh]">
            <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-[#DDEAF7] bg-white px-4 py-3 dark:border-slate-700 dark:bg-[#151F30] sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EAF1FF] to-[#EDE9FF] text-[#7652D9] dark:from-[#1D3558] dark:to-[#302747]">
                  <BookOpen size={22} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide text-[#7652D9]">
                    Lector Raccoon
                  </p>

                  <h2 className="truncate text-sm font-black sm:text-lg">
                    {libroLeyendo.titulo}
                  </h2>

                  <p className="hidden truncate text-xs text-[#6085A5] sm:block">
                    {libroLeyendo.autores.join(
                      ", "
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setLibroLeyendo(null)
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F1F5FA] text-[#6085A5] transition hover:bg-red-50 hover:text-red-500 dark:bg-slate-700 dark:hover:bg-red-950/30"
                aria-label="Cerrar lector"
              >
                <X size={22} />
              </button>
            </header>

            <div className="min-h-0 flex-1">
              <GoogleBooksViewer
                libroId={
                  libroLeyendo.id
                }
                titulo={
                  libroLeyendo.titulo
                }
                isbn={
                  libroLeyendo.isbn
                }
              />
            </div>
          </section>
        </div>
      )}

      {/* MODAL PREMIUM */}

      {mostrarPremium && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() =>
              setMostrarPremium(false)
            }
            className="absolute inset-0"
            aria-label="Cerrar"
          />

          <section className="relative w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl dark:bg-[#182437]">
            <button
              type="button"
              onClick={() =>
                setMostrarPremium(false)
              }
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5FA] dark:bg-slate-700"
            >
              <X />
            </button>

            <Crown
              size={46}
              className="text-[#D89A00]"
            />

            <h2 className="mt-5 text-2xl font-black">
              Biblioteca Premium
            </h2>

            <p className="mt-3 leading-7 text-[#6085A5]">
              Desbloquea favoritos ilimitados, más resultados por búsqueda y orden por libros recientes.
            </p>

            <Link
              href="/suscripcion"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] py-4 font-black text-white"
            >
              <Sparkles size={19} />
              Mejorar a Premium
            </Link>
          </section>
        </div>
      )}
    </main>
  );
}

/* =====================================================
   TARJETA DE LIBRO
===================================================== */

function TarjetaLibro({
  libro,
  favorito,
  guardando,
  onAbrir,
  onFavorito,
}: {
  libro: Libro;
  favorito: boolean;
  guardando: boolean;
  onAbrir: () => void;
  onFavorito: () => void;
}) {
  return (
    <article className="group flex min-h-[190px] overflow-hidden rounded-[18px] border border-[#E7ECF3] bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#DCD4FF] hover:shadow-lg dark:border-slate-700 dark:bg-[#182437]">
      <div className="relative flex w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-[#F1EDFF] to-[#EAF8FF] p-2 dark:from-[#28243E] dark:to-[#1C304D]">
        {libro.miniatura || libro.portada ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={libro.portada || libro.miniatura}
            alt={libro.titulo}
            className="h-[150px] w-[92px] rounded-md object-cover shadow-md transition duration-300 group-hover:scale-[1.03]"
            onError={(evento) => {
              evento.currentTarget.src = "/raccoon.png";
            }}
          />
        ) : (
          <BookOpen size={48} className="text-[#7652D9]" />
        )}

        {libro.embebible && (
          <span className="absolute bottom-2 left-2 rounded-full bg-[#DDF7EA] px-2 py-1 text-[9px] font-black text-[#258A5B] shadow-sm">
            Leer aquí
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-3 py-1">
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-1 rounded-full bg-[#F1EDFF] px-2.5 py-1 text-[10px] font-black text-[#7652D9] dark:bg-[#302747]">
            {libro.categorias[0] || "General"}
          </span>

          <button
            type="button"
            onClick={(evento) => {
              evento.stopPropagation();
              onFavorito();
            }}
            disabled={guardando}
            className={`
              flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition
              ${
                favorito
                  ? "border-[#FFD0DC] bg-[#FFF0F4] text-[#E04E76]"
                  : "border-[#E5EAF1] bg-white text-[#7890A9] hover:border-[#FFD0DC] hover:text-[#E04E76] dark:border-slate-600 dark:bg-slate-800"
              }
            `}
            aria-label={favorito ? "Eliminar favorito" : "Guardar favorito"}
          >
            {guardando ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Heart
                size={16}
                fill={favorito ? "currentColor" : "none"}
              />
            )}
          </button>
        </div>

        <h3 className="mt-2 line-clamp-2 text-[15px] font-black leading-5">
          {libro.titulo}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs text-[#6085A5]">
          {libro.autores.join(", ")}
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-black text-[#D89A00]">
            <Star size={13} fill="currentColor" />
            {libro.valoracion ? libro.valoracion : "—"}
          </span>
          <span className="text-[#9AAABC]">
            {añoPublicacion(libro.fechaPublicacion)}
          </span>
        </div>

        <button
          type="button"
          onClick={onAbrir}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#F1EDFF] to-[#EEF5FF] py-2.5 text-xs font-black text-[#7652D9] transition hover:from-[#7652D9] hover:to-[#4B7DF4] hover:text-white dark:from-[#302747] dark:to-[#233B60]"
        >
          Ver libro
          <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

/* =====================================================
   DATO DEL LIBRO
===================================================== */

function DatoLibro({
  icono: Icono,
  texto,
}: {
  icono: LucideIcon;
  texto: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#F1F5FA] px-3 py-2 text-xs font-bold text-[#506C88] dark:bg-slate-700 dark:text-slate-200">
      <Icono size={15} />
      {texto}
    </div>
  );
}