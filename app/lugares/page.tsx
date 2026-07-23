"use client";

import type { FormEvent } from "react";
import type { LucideIcon } from "lucide-react";

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
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Coffee,
  Crown,
  ExternalLink,
  Filter,
  GraduationCap,
  Heart,
  Home,
  Library,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Navigation,
  Phone,
  Search,
  Send,
  Star,
  Sun,
  Trees,
  User,
  Users,
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

type CategoriaLugar =
  | "cafeterias"
  | "bibliotecas"
  | "parques"
  | "universidades"
  | "otros";

type CategoriaFiltro =
  | "todos"
  | CategoriaLugar;

interface ResenaGoogle {
  id: string;
  autor: string;
  fotoAutor: string;
  calificacion: number;
  comentario: string;
  fecha: string;
  enlaceAutor: string;
}

interface ResenaUsuario {
  id: string;
  user_id: string;
  lugar_id: string;
  calificacion: number;
  comentario: string;
  nombre_usuario: string;
  avatar_url: string;
  created_at: string;
}

interface ResenaVisible {
  id: string;
  autor: string;
  fotoAutor: string;
  calificacion: number;
  comentario: string;
  fecha: string;
  esPropia: boolean;
}

interface Lugar {
  id: string;

  nombre: string;

  direccion: string;

  latitud: number | null;
  longitud: number | null;

  calificacion: number;
  cantidadResenas: number;

  categoria: CategoriaLugar;

  tipo: string;

  foto: string;
  fotos: string[];

  fotoAtribucion: string;

  abiertoAhora:
    | boolean
    | null;

  horario: string[];

  mapaUrl: string;

  web: string;

  telefono: string;

  descripcion: string;

  caracteristicas: string[];

  estado: string;

  resenasGoogle: ResenaGoogle[];
}

interface Categoria {
  id: CategoriaFiltro;
  nombre: string;
  icono: LucideIcon;
}

interface MenuItem {
  nombre: string;
  href: string;
  icono: LucideIcon;
  activo?: boolean;
}

/* =====================================================
   MENÚ
===================================================== */

const MENU: MenuItem[] = [
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
  },
  {
    nombre: "Lugares",
    href: "/lugares",
    icono: MapPin,
    activo: true,
  },
];

/* =====================================================
   CATEGORÍAS
===================================================== */

const CATEGORIAS: Categoria[] = [
  {
    id: "todos",
    nombre: "Todos",
    icono: MapPin,
  },
  {
    id: "cafeterias",
    nombre: "Cafeterías",
    icono: Coffee,
  },
  {
    id: "bibliotecas",
    nombre: "Bibliotecas",
    icono: BookOpen,
  },
  {
    id: "parques",
    nombre: "Parques",
    icono: Trees,
  },
  {
    id: "universidades",
    nombre: "Universidades",
    icono: GraduationCap,
  },
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

function arregloString(
  valor: unknown
): string[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.filter(
    (
      item
    ): item is string =>
      typeof item === "string"
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

function categoriaSegura(
  valor: unknown
): CategoriaLugar {
  if (
    valor === "cafeterias" ||
    valor === "bibliotecas" ||
    valor === "parques" ||
    valor === "universidades" ||
    valor === "otros"
  ) {
    return valor;
  }

  return "otros";
}

function normalizarResenasGoogle(
  valor: unknown
): ResenaGoogle[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .filter(esObjeto)
    .map(
      (
        item,
        indice
      ): ResenaGoogle => ({
        id: String(
          item.id ||
            `google-${indice}`
        ),

        autor: String(
          item.autor ||
            "Usuario de Google"
        ),

        fotoAutor:
          typeof item.fotoAutor ===
          "string"
            ? item.fotoAutor
            : "",

        calificacion:
          numeroSeguro(
            item.calificacion
          ),

        comentario:
          typeof item.comentario ===
          "string"
            ? item.comentario
            : "",

        fecha:
          typeof item.fecha ===
          "string"
            ? item.fecha
            : "",

        enlaceAutor:
          typeof item.enlaceAutor ===
          "string"
            ? item.enlaceAutor
            : "",
      })
    )
    .filter(
      (resena) =>
        resena.comentario
          .trim()
          .length > 0
    );
}

function normalizarLugar(
  valor: unknown
): Lugar | null {
  if (!esObjeto(valor)) {
    return null;
  }

  const id = String(
    valor.id || ""
  ).trim();

  const nombre = String(
    valor.nombre || ""
  ).trim();

  if (!id || !nombre) {
    return null;
  }

  const foto =
    typeof valor.foto ===
    "string"
      ? valor.foto
      : "";

  let fotos =
    arregloString(
      valor.fotos
    );

  if (
    fotos.length === 0 &&
    foto
  ) {
    fotos = [foto];
  }

  return {
    id,

    nombre,

    direccion:
      typeof valor.direccion ===
      "string"
        ? valor.direccion
        : "Santiago de Veraguas, Panamá",

    latitud:
      typeof valor.latitud ===
      "number"
        ? valor.latitud
        : null,

    longitud:
      typeof valor.longitud ===
      "number"
        ? valor.longitud
        : null,

    calificacion:
      numeroSeguro(
        valor.calificacion
      ),

    cantidadResenas:
      numeroSeguro(
        valor.cantidadResenas
      ),

    categoria:
      categoriaSegura(
        valor.categoria
      ),

    tipo:
      typeof valor.tipo ===
      "string"
        ? valor.tipo
        : "Lugar",

    foto,

    fotos,

    fotoAtribucion:
      typeof valor.fotoAtribucion ===
      "string"
        ? valor.fotoAtribucion
        : "",

    abiertoAhora:
      typeof valor.abiertoAhora ===
      "boolean"
        ? valor.abiertoAhora
        : null,

    horario:
      arregloString(
        valor.horario
      ),

    mapaUrl:
      typeof valor.mapaUrl ===
      "string"
        ? valor.mapaUrl
        : "",

    web:
      typeof valor.web ===
      "string"
        ? valor.web
        : "",

    telefono:
      typeof valor.telefono ===
      "string"
        ? valor.telefono
        : "",

    descripcion:
      typeof valor.descripcion ===
      "string"
        ? valor.descripcion
        : `${nombre} es un lugar ubicado en Santiago de Veraguas.`,

    caracteristicas:
      arregloString(
        valor.caracteristicas
      ),

    estado:
      typeof valor.estado ===
      "string"
        ? valor.estado
        : "",

    resenasGoogle:
      normalizarResenasGoogle(
        valor.resenasGoogle
      ),
  };
}

function obtenerError(
  valor: unknown
): string {
  if (
    esObjeto(valor) &&
    typeof valor.error ===
      "string"
  ) {
    return valor.error;
  }

  return "No se pudieron cargar los lugares.";
}

function iconoCategoria(
  categoria: CategoriaLugar
): LucideIcon {
  switch (categoria) {
    case "cafeterias":
      return Coffee;

    case "bibliotecas":
      return BookOpen;

    case "parques":
      return Trees;

    case "universidades":
      return GraduationCap;

    default:
      return MapPin;
  }
}

function formatearFecha(
  fecha: string
): string {
  const valor =
    new Date(fecha);

  if (
    Number.isNaN(
      valor.getTime()
    )
  ) {
    return fecha;
  }

  return valor.toLocaleDateString(
    "es-PA",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function fechaInput(
  fecha: Date
): string {
  const year =
    fecha.getFullYear();

  const month =
    String(
      fecha.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      fecha.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

function obtenerFechaManana():
  string {
  const fecha =
    new Date();

  fecha.setDate(
    fecha.getDate() + 1
  );

  return fechaInput(fecha);
}

function prepararNumeroWhatsApp(
  telefono: string
): string {
  let numero =
    telefono.replace(
      /\D/g,
      ""
    );

  if (!numero) {
    return "";
  }

  /*
    Los teléfonos locales de Panamá
    normalmente vienen sin +507.
  */

  if (
    !numero.startsWith(
      "507"
    ) &&
    numero.length <= 8
  ) {
    numero =
      `507${numero}`;
  }

  return numero;
}

/* =====================================================
   PÁGINA
===================================================== */

export default function LugaresPage() {
  const router =
    useRouter();

  const timeoutRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  /* =====================================================
     USUARIO
  ===================================================== */

  const [
    usuarioId,
    setUsuarioId,
  ] = useState("");

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

  /* =====================================================
     UI
  ===================================================== */

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
    mensaje,
    setMensaje,
  ] = useState("");

  /* =====================================================
     LUGARES
  ===================================================== */

  const [
    lugares,
    setLugares,
  ] = useState<Lugar[]>(
    []
  );

  const [
    lugarSeleccionado,
    setLugarSeleccionado,
  ] =
    useState<Lugar | null>(
      null
    );

  const [
    cargandoLugares,
    setCargandoLugares,
  ] = useState(true);

  const [
    cargandoDetalle,
    setCargandoDetalle,
  ] = useState(false);

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    categoria,
    setCategoria,
  ] =
    useState<CategoriaFiltro>(
      "todos"
    );

  /* =====================================================
     FILTROS
  ===================================================== */

  const [
    mostrarFiltros,
    setMostrarFiltros,
  ] = useState(false);

  const [
    soloAbiertos,
    setSoloAbiertos,
  ] = useState(false);

  const [
    calificacionMinima,
    setCalificacionMinima,
  ] = useState(0);

  /* =====================================================
     GALERÍA Y MAPA
  ===================================================== */

  const [
    indiceFoto,
    setIndiceFoto,
  ] = useState(0);

  const [
    mostrarMapa,
    setMostrarMapa,
  ] = useState(false);

  /* =====================================================
     FAVORITOS
  ===================================================== */

  const [
    favoritos,
    setFavoritos,
  ] = useState<string[]>(
    []
  );

  const [
    guardandoFavorito,
    setGuardandoFavorito,
  ] = useState("");

  /* =====================================================
     RESEÑAS
  ===================================================== */

  const [
    resenasUsuarios,
    setResenasUsuarios,
  ] =
    useState<
      ResenaUsuario[]
    >([]);

  const [
    modalResena,
    setModalResena,
  ] = useState(false);

  const [
    calificacionResena,
    setCalificacionResena,
  ] = useState(5);

  const [
    comentarioResena,
    setComentarioResena,
  ] = useState("");

  const [
    guardandoResena,
    setGuardandoResena,
  ] = useState(false);

  /* =====================================================
     RESERVA PREMIUM
  ===================================================== */

  const [
    modalReserva,
    setModalReserva,
  ] = useState(false);

  const [
    fechaReserva,
    setFechaReserva,
  ] = useState(
    obtenerFechaManana()
  );

  const [
    horaReserva,
    setHoraReserva,
  ] = useState(
    "10:00"
  );

  const [
    personasReserva,
    setPersonasReserva,
  ] = useState(1);

  const [
    notaReserva,
    setNotaReserva,
  ] = useState("");

  /* =====================================================
     FILTRADOS
  ===================================================== */

  const lugaresFiltrados =
    useMemo(() => {
      return lugares.filter(
        (lugar) => {
          if (
            soloAbiertos &&
            lugar.abiertoAhora !==
              true
          ) {
            return false;
          }

          if (
            calificacionMinima >
              0 &&
            lugar.calificacion <
              calificacionMinima
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      lugares,
      soloAbiertos,
      calificacionMinima,
    ]);

  /* =====================================================
     FOTOS
  ===================================================== */

  const fotos =
    useMemo(() => {
      if (
        !lugarSeleccionado
      ) {
        return [];
      }

      const todas = [
        ...lugarSeleccionado
          .fotos,
      ];

      if (
        lugarSeleccionado.foto &&
        !todas.includes(
          lugarSeleccionado.foto
        )
      ) {
        todas.unshift(
          lugarSeleccionado.foto
        );
      }

      return [
        ...new Set(
          todas.filter(Boolean)
        ),
      ];
    }, [
      lugarSeleccionado,
    ]);

  /* =====================================================
     MAPA
  ===================================================== */

  const mapaEmbed =
    useMemo(() => {
      if (
        !lugarSeleccionado
      ) {
        return "";
      }

      let consulta = "";

      if (
        lugarSeleccionado.latitud !==
          null &&
        lugarSeleccionado.longitud !==
          null
      ) {
        consulta =
          `${lugarSeleccionado.latitud},${lugarSeleccionado.longitud}`;
      } else {
        consulta =
          `${lugarSeleccionado.nombre}, ${lugarSeleccionado.direccion}`;
      }

      return (
        "https://www.google.com/maps?q=" +
        encodeURIComponent(
          consulta
        ) +
        "&z=16&output=embed"
      );
    }, [
      lugarSeleccionado,
    ]);

  /* =====================================================
     RESEÑAS COMBINADAS
  ===================================================== */

  const resenasVisibles:
    ResenaVisible[] =
    useMemo(() => {
      if (
        !lugarSeleccionado
      ) {
        return [];
      }

      const propias =
        resenasUsuarios.map(
          (
            resena
          ): ResenaVisible => ({
            id:
              resena.id,

            autor:
              resena
                .nombre_usuario,

            fotoAutor:
              resena.avatar_url,

            calificacion:
              resena.calificacion,

            comentario:
              resena.comentario,

            fecha:
              formatearFecha(
                resena.created_at
              ),

            esPropia:
              resena.user_id ===
              usuarioId,
          })
        );

      const google =
        lugarSeleccionado
          .resenasGoogle.map(
            (
              resena
            ): ResenaVisible => ({
              id:
                `google-${resena.id}`,

              autor:
                resena.autor,

              fotoAutor:
                resena.fotoAutor,

              calificacion:
                resena.calificacion,

              comentario:
                resena.comentario,

              fecha:
                resena.fecha,

              esPropia:
                false,
            })
          );

      return [
        ...propias,
        ...google,
      ];
    }, [
      lugarSeleccionado,
      resenasUsuarios,
      usuarioId,
    ]);

  /* =====================================================
     MENSAJES
  ===================================================== */

  function mostrarMensaje(
    texto: string
  ) {
    if (
      timeoutRef.current
    ) {
      clearTimeout(
        timeoutRef.current
      );
    }

    setMensaje(texto);

    timeoutRef.current =
      setTimeout(() => {
        setMensaje("");
      }, 4200);
  }

  /* =====================================================
     TEMA
  ===================================================== */

  function iniciarTema() {
    const tema =
      localStorage.getItem(
        "raccoon-theme"
      );

    const oscuro =
      tema === "dark";

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
     USUARIO + PREMIUM
  ===================================================== */

  async function cargarUsuario():
    Promise<string | null> {
    try {
      setCargandoPlan(
        true
      );

      const [
        usuarioRespuesta,
        sesionRespuesta,
      ] =
        await Promise.all([
          supabase.auth
            .getUser(),

          supabase.auth
            .getSession(),
        ]);

      const user =
        usuarioRespuesta
          .data.user;

      const session =
        sesionRespuesta
          .data.session;

      if (
        !user ||
        !session
      ) {
        router.replace(
          "/Login"
        );

        return null;
      }

      setUsuarioId(
        user.id
      );

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
        metadata.avatar_url
          .trim()
      ) {
        setFotoPerfil(
          metadata.avatar_url
        );
      }

      const premiumMetadata =
        metadata.premium ===
          true ||
        metadata.is_premium ===
          true ||
        metadata.es_premium ===
          true;

      let planDetectado =
        normalizarPlan(
          metadata.plan ||
            metadata.tipo_plan ||
            metadata.subscription,

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

              cache:
                "no-store",
            }
          );

        if (
          respuesta.ok
        ) {
          const datos:
            unknown =
            await respuesta.json();

          if (
            esObjeto(datos)
          ) {
            const premium =
              datos.premium ===
                true ||
              datos.is_premium ===
                true ||
              datos.es_premium ===
                true;

            let planServidor:
              unknown =
              datos.plan ||
              datos.tipo_plan;

            if (
              typeof datos.subscription ===
              "string"
            ) {
              planServidor =
                datos.subscription;
            }

            if (
              esObjeto(
                datos.subscription
              )
            ) {
              planServidor =
                datos.subscription
                  .plan ||
                datos.subscription
                  .tipo_plan ||
                planServidor;
            }

            planDetectado =
              normalizarPlan(
                planServidor,
                premium
              );
          }
        }
      } catch (error) {
        console.warn(
          "Plan:",
          error
        );
      }

      setPlan(
        planDetectado
      );

      return user.id;
    } catch (error) {
      console.error(
        "Usuario:",
        error
      );

      return null;
    } finally {
      setCargandoPlan(
        false
      );
    }
  }

  /* =====================================================
     FAVORITOS
  ===================================================== */

  async function cargarFavoritos(
    userId: string
  ) {
    try {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "lugares_favoritos"
          )
          .select(
            "lugar_id"
          )
          .eq(
            "user_id",
            userId
          );

      if (error) {
        return;
      }

      setFavoritos(
        (data || []).map(
          (item) =>
            String(
              item.lugar_id
            )
        )
      );
    } catch {
      // La pantalla sigue
      // funcionando sin favoritos.
    }
  }

  async function cambiarFavorito(
    lugar: Lugar
  ) {
    if (!usuarioId) {
      return;
    }

    const existe =
      favoritos.includes(
        lugar.id
      );

    if (
      !existe &&
      !esPremium &&
      favoritos.length >= 5
    ) {
      mostrarMensaje(
        "El plan gratuito permite guardar hasta 5 lugares."
      );

      return;
    }

    try {
      setGuardandoFavorito(
        lugar.id
      );

      if (existe) {
        const {
          error,
        } =
          await supabase
            .from(
              "lugares_favoritos"
            )
            .delete()
            .eq(
              "user_id",
              usuarioId
            )
            .eq(
              "lugar_id",
              lugar.id
            );

        if (error) {
          throw error;
        }

        setFavoritos(
          (actuales) =>
            actuales.filter(
              (id) =>
                id !== lugar.id
            )
        );

        return;
      }

      const {
        error,
      } =
        await supabase
          .from(
            "lugares_favoritos"
          )
          .insert({
            user_id:
              usuarioId,

            lugar_id:
              lugar.id,

            lugar,
          });

      if (error) {
        throw error;
      }

      setFavoritos(
        (actuales) => [
          ...actuales,
          lugar.id,
        ]
      );
    } catch (error) {
      console.error(
        error
      );

      mostrarMensaje(
        "No se pudo actualizar el favorito."
      );
    } finally {
      setGuardandoFavorito(
        ""
      );
    }
  }

  /* =====================================================
     CARGAR LUGARES
  ===================================================== */

  async function cargarLugares(
    texto: string,
    categoriaActual:
      CategoriaFiltro
  ) {
    try {
      setCargandoLugares(
        true
      );

      setLugarSeleccionado(
        null
      );

      setIndiceFoto(
        0
      );

      const params =
        new URLSearchParams();

      params.set(
        "categoria",
        categoriaActual
      );

      if (
        texto.trim()
      ) {
        params.set(
          "q",
          texto.trim()
        );
      }

      const respuesta =
        await fetch(
          `/api/lugares?${params.toString()}`,
          {
            method: "GET",

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
          obtenerError(
            datos
          )
        );
      }

      if (
        !esObjeto(datos) ||
        !Array.isArray(
          datos.lugares
        )
      ) {
        throw new Error(
          "La API devolvió datos incorrectos."
        );
      }

      const lista =
        datos.lugares
          .map(
            normalizarLugar
          )
          .filter(
            (
              lugar
            ): lugar is Lugar =>
              lugar !== null
          );

      setLugares(
        lista
      );

      if (
        lista.length >
        0
      ) {
        void seleccionarLugar(
          lista[0]
        );
      }
    } catch (error) {
      console.error(
        "Lugares:",
        error
      );

      setLugares(
        []
      );

      mostrarMensaje(
        error instanceof
          Error
          ? error.message
          : "No se pudieron cargar los lugares."
      );
    } finally {
      setCargandoLugares(
        false
      );
    }
  }

  /* =====================================================
     DETALLE
  ===================================================== */

  async function seleccionarLugar(
    lugar: Lugar
  ) {
    setLugarSeleccionado(
      lugar
    );

    setIndiceFoto(
      0
    );

    setMostrarMapa(
      false
    );

    void cargarResenasUsuario(
      lugar.id
    );

    try {
      setCargandoDetalle(
        true
      );

      const respuesta =
        await fetch(
          `/api/lugares?id=${encodeURIComponent(
            lugar.id
          )}`,
          {
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
        !respuesta.ok ||
        !esObjeto(datos)
      ) {
        return;
      }

      const detalle =
        normalizarLugar(
          datos.lugar
        );

      if (!detalle) {
        return;
      }

      setLugarSeleccionado(
        detalle
      );

      setIndiceFoto(
        0
      );
    } catch (error) {
      console.warn(
        "Detalle:",
        error
      );
    } finally {
      setCargandoDetalle(
        false
      );
    }
  }

  /* =====================================================
     RESEÑAS
  ===================================================== */

  async function cargarResenasUsuario(
    lugarId: string
  ) {
    try {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "lugares_resenas"
          )
          .select(
            "id,user_id,lugar_id,calificacion,comentario,nombre_usuario,avatar_url,created_at"
          )
          .eq(
            "lugar_id",
            lugarId
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (error) {
        console.warn(
          "Reseñas:",
          error.message
        );

        setResenasUsuarios(
          []
        );

        return;
      }

      setResenasUsuarios(
        (data ||
          []) as ResenaUsuario[]
      );
    } catch {
      setResenasUsuarios(
        []
      );
    }
  }

  function abrirResena() {
    if (
      !lugarSeleccionado
    ) {
      return;
    }

    const mia =
      resenasUsuarios.find(
        (resena) =>
          resena.user_id ===
          usuarioId
      );

    if (mia) {
      setCalificacionResena(
        mia.calificacion
      );

      setComentarioResena(
        mia.comentario
      );
    } else {
      setCalificacionResena(
        5
      );

      setComentarioResena(
        ""
      );
    }

    setModalResena(
      true
    );
  }

  async function guardarResena(
    evento:
      FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (
      !usuarioId ||
      !lugarSeleccionado ||
      guardandoResena
    ) {
      return;
    }

    const comentario =
      comentarioResena.trim();

    if (
      comentario.length <
      5
    ) {
      mostrarMensaje(
        "Escribe una reseña de al menos 5 caracteres."
      );

      return;
    }

    try {
      setGuardandoResena(
        true
      );

      const {
        error,
      } =
        await supabase
          .from(
            "lugares_resenas"
          )
          .upsert(
            {
              user_id:
                usuarioId,

              lugar_id:
                lugarSeleccionado.id,

              calificacion:
                calificacionResena,

              comentario,

              nombre_usuario:
                nombreUsuario,

              avatar_url:
                fotoPerfil,
            },
            {
              onConflict:
                "user_id,lugar_id",
            }
          );

      if (error) {
        throw error;
      }

      await cargarResenasUsuario(
        lugarSeleccionado.id
      );

      setModalResena(
        false
      );

      mostrarMensaje(
        "Tu reseña fue guardada correctamente."
      );
    } catch (error) {
      console.error(
        "Guardar reseña:",
        error
      );

      mostrarMensaje(
        error instanceof
          Error
          ? error.message
          : "No se pudo guardar la reseña."
      );
    } finally {
      setGuardandoResena(
        false
      );
    }
  }

  /* =====================================================
     RESERVAR POR WHATSAPP
  ===================================================== */

  function abrirReserva() {
    if (
      !lugarSeleccionado
    ) {
      return;
    }

    if (!esPremium) {
      mostrarMensaje(
        "Las reservas por WhatsApp son una función exclusiva de Premium."
      );

      return;
    }

  const numeroWhatsApp =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

if (!numeroWhatsApp) {
  mostrarMensaje(
    "El número de WhatsApp de Raccoon Study no está configurado."
  );

  return;
}

    setFechaReserva(
      obtenerFechaManana()
    );

    setHoraReserva(
      "10:00"
    );

    setPersonasReserva(
      1
    );

    setNotaReserva(
      ""
    );

    setModalReserva(
      true
    );
  }

  function enviarReservaWhatsApp(
    evento:
      FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (
      !lugarSeleccionado ||
      !esPremium
    ) {
      return;
    }

    const numero =
  prepararNumeroWhatsApp(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
      ""
  );

    if (!numero) {
      mostrarMensaje(
        "No pudimos obtener el número del establecimiento."
      );

      return;
    }

    if (
      !fechaReserva ||
      !horaReserva
    ) {
      mostrarMensaje(
        "Selecciona la fecha y la hora de tu reserva."
      );

      return;
    }

    const fecha =
      new Date(
        `${fechaReserva}T12:00:00`
      ).toLocaleDateString(
        "es-PA",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );

    const personasTexto =
      personasReserva === 1
        ? "1 persona"
        : `${personasReserva} personas`;

    let texto =
      `Hola 👋 Soy ${nombreUsuario}. ` +
      `Encontré *${lugarSeleccionado.nombre}* en Raccoon Study 🦝.\n\n` +
      `Me gustaría consultar disponibilidad para reservar un espacio para estudiar.\n\n` +
      `📅 Fecha: ${fecha}\n` +
      `🕐 Hora: ${horaReserva}\n` +
      `👥 Personas: ${personasTexto}`;

    if (
      notaReserva.trim()
    ) {
      texto +=
        `\n📝 Nota: ${notaReserva.trim()}`;
    }

    texto +=
      "\n\n¿Tienen disponibilidad? Muchas gracias.";

    const url =
      `https://wa.me/${numero}?text=${encodeURIComponent(
        texto
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    setModalReserva(
      false
    );
  }

  /* =====================================================
     BUSCAR
  ===================================================== */

  function buscar(
    evento:
      FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    void cargarLugares(
      busqueda,
      categoria
    );
  }

  function cambiarCategoria(
    nueva:
      CategoriaFiltro
  ) {
    setCategoria(
      nueva
    );

    setBusqueda(
      ""
    );

    setSoloAbiertos(
      false
    );

    setCalificacionMinima(
      0
    );

    void cargarLugares(
      "",
      nueva
    );
  }

  /* =====================================================
     GALERÍA
  ===================================================== */

  function fotoAnterior() {
    if (
      fotos.length <= 1
    ) {
      return;
    }

    setIndiceFoto(
      (actual) =>
        actual === 0
          ? fotos.length - 1
          : actual - 1
    );
  }

  function fotoSiguiente() {
    if (
      fotos.length <= 1
    ) {
      return;
    }

    setIndiceFoto(
      (actual) =>
        actual >=
        fotos.length - 1
          ? 0
          : actual + 1
    );
  }

  /* =====================================================
     SESIÓN
  ===================================================== */

  async function cerrarSesion() {
    await supabase.auth
      .signOut();

    router.replace(
      "/Login"
    );
  }

  /* =====================================================
     INICIO
  ===================================================== */

  useEffect(() => {
    async function iniciar() {
      iniciarTema();

      const id =
        await cargarUsuario();

      if (!id) {
        return;
      }

      await Promise.all([
        cargarFavoritos(
          id
        ),

        cargarLugares(
          "",
          "todos"
        ),
      ]);
    }

    void iniciar();

    return () => {
      if (
        timeoutRef.current
      ) {
        clearTimeout(
          timeoutRef.current
        );
      }
    };
  }, []);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#F7F9FE] text-[#111B44] transition-colors dark:bg-[#101827] dark:text-white">
      {/* OVERLAY MÓVIL */}

      {menuAbierto && (
        <button
          type="button"
          onClick={() =>
            setMenuAbierto(
              false
            )
          }
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          aria-label="Cerrar menú"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[250px]
          flex-col
          border-r border-[#E1E7F5]
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
            />

            <span className="font-black">
              Raccoon
              <span className="text-[#5A47FF]">
                Study
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() =>
              setMenuAbierto(
                false
              )
            }
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-3 flex-1 space-y-1.5 overflow-y-auto px-3">
          {MENU.map(
            ({
              nombre,
              href,
              icono:
                Icono,
              activo,
            }) => (
              <Link
                key={href}
                href={href}
                onClick={() =>
                  setMenuAbierto(
                    false
                  )
                }
                className={`
                  flex items-center gap-3
                  rounded-xl px-4 py-3
                  text-sm transition
                  ${
                    activo
                      ? "bg-[#EFEDFF] font-black text-[#5A47FF] dark:bg-[#302B58]"
                      : "font-semibold text-[#293958] hover:bg-[#F2F5FD] dark:text-slate-200 dark:hover:bg-slate-800"
                  }
                `}
              >
                <Icono
                  size={19}
                />

                {nombre}
              </Link>
            )
          )}
        </nav>

        <div className="px-3 pb-3">
          <Link
            href="/suscripcion"
            className={`
              relative block
              overflow-hidden
              rounded-[22px]
              p-4 text-white
              shadow-lg
              ${
                esPremium
                  ? "bg-gradient-to-br from-[#F5B942] to-[#6D55FF]"
                  : "bg-gradient-to-br from-[#49A6EA] to-[#6855FF]"
              }
            `}
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" />

            <Crown
              size={24}
              className="relative"
            />

            <p className="relative mt-3 font-black">
              {esPremium
                ? "Premium activo"
                : "Raccoon Premium"}
            </p>

            <p className="relative mt-1 text-xs leading-5 text-white/80">
              {cargandoPlan
                ? "Comprobando plan..."
                : esPremium
                  ? nombrePlan(
                      plan
                    )
                  : "Reservas y más funciones"}
            </p>
          </Link>
        </div>

        <div className="space-y-1 px-3 pb-5">
          <button
            type="button"
            onClick={
              cambiarTema
            }
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold hover:bg-[#F2F5FD] dark:hover:bg-slate-800"
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
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut
              size={19}
            />

            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <div className="lg:ml-[250px]">
        {/* HEADER */}

        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#E1E7F5] bg-white/90 px-4 backdrop-blur-xl dark:border-slate-700 dark:bg-[#151F30]/90 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMenuAbierto(
                  true
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#5A47FF] lg:hidden"
            >
              <Menu
                size={22}
              />
            </button>

            <div>
              <h2 className="font-black sm:text-lg">
                Raccoon
                <span className="text-[#5A47FF]">
                  Study
                </span>
              </h2>

              <p className="hidden text-[10px] text-[#8090AB] sm:block">
                Encuentra tu lugar ideal para estudiar
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setPerfilAbierto(
                  !perfilAbierto
                )
              }
              className="flex items-center gap-2 rounded-full p-1 hover:bg-[#F1F4FA] dark:hover:bg-slate-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fotoPerfil}
                alt={nombreUsuario}
                className="h-10 w-10 rounded-full border-2 border-[#E6EAFF] object-cover"
                onError={(
                  evento
                ) => {
                  evento.currentTarget.src =
                    "/raccoon.png";
                }}
              />

              <ChevronDown
                size={16}
                className="hidden sm:block"
              />
            </button>

            {perfilAbierto && (
              <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-[#E1E7F5] bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-[#E6EAF3] px-3 py-3 dark:border-slate-700">
                  <p className="truncate font-black">
                    {nombreUsuario}
                  </p>

                  <p className="mt-1 text-xs text-[#8494B4]">
                    {nombrePlan(
                      plan
                    )}
                  </p>
                </div>

                <Link
                  href="/perfil"
                  className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-[#F3F5FA] dark:hover:bg-slate-700"
                >
                  <User
                    size={17}
                  />

                  Mi perfil
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* MENSAJE */}

        {mensaje && (
          <div className="fixed left-1/2 top-5 z-[900] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 rounded-2xl bg-[#5A47FF] px-5 py-3 text-center text-sm font-black text-white shadow-2xl">
            {mensaje}
          </div>
        )}

        {/* =====================================================
            GRID
        ===================================================== */}

        <div className="grid min-h-[calc(100vh-76px)] xl:grid-cols-[minmax(500px,1fr)_minmax(430px,0.9fr)]">
          {/* =================================================
              IZQUIERDA
          ================================================= */}

          <section className="border-r border-[#E1E7F5] p-4 dark:border-slate-700 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8E5FF] to-[#E3F0FF] text-[#6B55F5]">
                <MapPin
                  size={27}
                />
              </div>

              <div>
                <h1 className="text-2xl font-black sm:text-3xl">
                  Lugares de estudio en Santiago
                </h1>

                <p className="mt-1 text-sm leading-6 text-[#52688B] dark:text-slate-300">
                  Encuentra cafeterías, bibliotecas, parques y universidades en Santiago de Veraguas.
                </p>
              </div>
            </div>

            {/* BUSCADOR */}

            <form
              onSubmit={buscar}
              className="mt-6 flex gap-3"
            >
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-[#DDE4F2] bg-white px-4 shadow-sm focus-within:border-[#6D55FF] dark:border-slate-700 dark:bg-[#182437]">
                <Search
                  size={19}
                  className="shrink-0 text-[#8494B4]"
                />

                <input
                  value={busqueda}
                  onChange={(
                    evento
                  ) =>
                    setBusqueda(
                      evento.target.value
                    )
                  }
                  placeholder="Buscar cafeterías, bibliotecas..."
                  className="w-full bg-transparent py-4 text-sm outline-none"
                />

                {busqueda && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusqueda(
                        ""
                      );

                      void cargarLugares(
                        "",
                        categoria
                      );
                    }}
                    className="text-[#8090AB]"
                  >
                    <X
                      size={17}
                    />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setMostrarFiltros(
                    !mostrarFiltros
                  )
                }
                className={`
                  flex items-center gap-2
                  rounded-xl border px-4
                  font-black transition
                  ${
                    mostrarFiltros
                      ? "border-[#6D55FF] bg-[#EFEDFF] text-[#5A47FF]"
                      : "border-[#DDE4F2] bg-white text-[#52688B] dark:border-slate-700 dark:bg-[#182437] dark:text-slate-200"
                  }
                `}
              >
                <Filter
                  size={18}
                />

                <span className="hidden sm:inline">
                  Filtros
                </span>
              </button>
            </form>

            {/* FILTROS */}

            {mostrarFiltros && (
              <div className="mt-4 grid gap-4 rounded-2xl border border-[#E6EAF4] bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#182437] sm:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E6EAF4] p-4 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-black">
                      Abiertos ahora
                    </p>

                    <p className="mt-1 text-[11px] text-[#8494B4]">
                      Solo lugares disponibles
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      soloAbiertos
                    }
                    onChange={(
                      evento
                    ) =>
                      setSoloAbiertos(
                        evento.target.checked
                      )
                    }
                    className="h-5 w-5 accent-[#5A47FF]"
                  />
                </label>

                <div>
                  <p className="text-sm font-black">
                    Calificación mínima
                  </p>

                  <select
                    value={
                      calificacionMinima
                    }
                    onChange={(
                      evento
                    ) =>
                      setCalificacionMinima(
                        Number(
                          evento.target.value
                        )
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-[#E1E7F5] bg-white p-3 text-sm font-bold outline-none dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option
                      value={0}
                    >
                      Cualquiera
                    </option>

                    <option
                      value={3}
                    >
                      3.0 o más
                    </option>

                    <option
                      value={4}
                    >
                      4.0 o más
                    </option>

                    <option
                      value={4.5}
                    >
                      4.5 o más
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* CATEGORÍAS */}

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {CATEGORIAS.map(
                (item) => {
                  const Icono =
                    item.icono;

                  const activa =
                    categoria ===
                    item.id;

                  return (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        cambiarCategoria(
                          item.id
                        )
                      }
                      className={`
                        flex shrink-0
                        items-center gap-2
                        rounded-full border
                        px-4 py-2
                        text-sm font-black
                        transition
                        ${
                          activa
                            ? "border-[#6D55FF] bg-gradient-to-r from-[#6D55FF] to-[#8068FF] text-white shadow-md"
                            : "border-[#DDE4F2] bg-white text-[#52688B] hover:border-[#AFA4FF] dark:border-slate-700 dark:bg-[#182437] dark:text-slate-200"
                        }
                      `}
                    >
                      <Icono
                        size={16}
                      />

                      {item.nombre}
                    </button>
                  );
                }
              )}
            </div>

            {!cargandoLugares && (
              <p className="mt-2 text-xs font-bold text-[#8494B4]">
                {lugaresFiltrados.length}{" "}
                {lugaresFiltrados.length ===
                1
                  ? "lugar encontrado"
                  : "lugares encontrados"}
              </p>
            )}

            {/* TARJETAS */}

            <div className="mt-4 space-y-3">
              {cargandoLugares ? (
                Array.from({
                  length: 5,
                }).map(
                  (
                    _,
                    indice
                  ) => (
                    <div
                      key={
                        indice
                      }
                      className="h-[150px] animate-pulse rounded-2xl border border-[#E6EAF3] bg-white dark:border-slate-700 dark:bg-[#182437]"
                    />
                  )
                )
              ) : lugaresFiltrados.length ===
                0 ? (
                <div className="rounded-[24px] border border-[#E5EAF5] bg-white p-10 text-center dark:border-slate-700 dark:bg-[#182437]">
                  <MapPin
                    size={42}
                    className="mx-auto text-[#8B98B3]"
                  />

                  <h2 className="mt-4 text-xl font-black">
                    No encontramos lugares
                  </h2>
                </div>
              ) : (
                lugaresFiltrados.map(
                  (
                    lugar
                  ) => (
                    <TarjetaLugar
                      key={
                        lugar.id
                      }
                      lugar={
                        lugar
                      }
                      seleccionado={
                        lugarSeleccionado?.id ===
                        lugar.id
                      }
                      onClick={() =>
                        void seleccionarLugar(
                          lugar
                        )
                      }
                    />
                  )
                )
              )}
            </div>
          </section>

          {/* =================================================
              DERECHA
          ================================================= */}

          <section className="bg-white dark:bg-[#131D2D] xl:sticky xl:top-[76px] xl:h-[calc(100vh-76px)] xl:overflow-y-auto">
            {!lugarSeleccionado ? (
              <div className="flex min-h-[600px] flex-col items-center justify-center p-8 text-center">
                {cargandoLugares ? (
                  <>
                    <LoaderCircle
                      size={40}
                      className="animate-spin text-[#5A47FF]"
                    />

                    <p className="mt-4 font-black">
                      Buscando lugares...
                    </p>
                  </>
                ) : (
                  <>
                    <MapPin
                      size={50}
                      className="text-[#8B98B3]"
                    />

                    <h2 className="mt-4 text-2xl font-black">
                      Selecciona un lugar
                    </h2>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* FOTO */}

                <div className="relative h-[280px] overflow-hidden bg-gradient-to-br from-[#E9E6FF] to-[#E4F2FF]">
                  <FotoLugar
                    key={`${lugarSeleccionado.id}-${indiceFoto}`}
                    src={
                      fotos[
                        indiceFoto
                      ] ||
                      lugarSeleccionado.foto
                    }
                    nombre={
                      lugarSeleccionado.nombre
                    }
                    categoria={
                      lugarSeleccionado.categoria
                    }
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

                  {fotos.length >
                    1 && (
                    <>
                      <button
                        type="button"
                        onClick={
                          fotoAnterior
                        }
                        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#5A47FF] shadow-lg"
                      >
                        <ChevronLeft
                          size={20}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={
                          fotoSiguiente
                        }
                        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#5A47FF] shadow-lg"
                      >
                        <ChevronRight
                          size={20}
                        />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      void cambiarFavorito(
                        lugarSeleccionado
                      )
                    }
                    disabled={
                      guardandoFavorito ===
                      lugarSeleccionado.id
                    }
                    className={`
                      absolute right-5 top-5
                      flex h-12 w-12
                      items-center justify-center
                      rounded-full shadow-xl
                      ${
                        favoritos.includes(
                          lugarSeleccionado.id
                        )
                          ? "bg-[#FF557F] text-white"
                          : "bg-white text-[#FF557F]"
                      }
                    `}
                  >
                    {guardandoFavorito ===
                    lugarSeleccionado.id ? (
                      <LoaderCircle
                        size={20}
                        className="animate-spin"
                      />
                    ) : (
                      <Heart
                        size={22}
                        fill={
                          favoritos.includes(
                            lugarSeleccionado.id
                          )
                            ? "currentColor"
                            : "none"
                        }
                      />
                    )}
                  </button>
                </div>

                {/* CONTENIDO */}

                <div className="p-5 sm:p-6">
                  {cargandoDetalle && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#F4F1FF] p-3 text-sm font-black text-[#7652D9] dark:bg-[#302B58]">
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />

                      Cargando detalles...
                    </div>
                  )}

                  {/* TÍTULO + MAPA */}

                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-2xl font-black">
                        {lugarSeleccionado.nombre}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[#52688B] dark:text-slate-300">
                        {lugarSeleccionado.direccion}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {lugarSeleccionado.calificacion >
                        0 && (
                          <span className="flex items-center gap-1">
                            <Star
                              size={18}
                              fill="currentColor"
                              className="text-[#FFB629]"
                            />

                            <strong>
                              {lugarSeleccionado.calificacion.toFixed(
                                1
                              )}
                            </strong>

                            <span className="text-sm text-[#647793]">
                              (
                              {
                                lugarSeleccionado.cantidadResenas
                              }{" "}
                              reseñas)
                            </span>
                          </span>
                        )}

                        {lugarSeleccionado.abiertoAhora !==
                          null && (
                          <span
                            className={`
                              rounded-full px-3 py-1
                              text-xs font-black
                              ${
                                lugarSeleccionado.abiertoAhora
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }
                            `}
                          >
                            {lugarSeleccionado.abiertoAhora
                              ? "Abierto ahora"
                              : "Cerrado"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACCIONES MÁS PEQUEÑAS */}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setMostrarMapa(
                            !mostrarMapa
                          )
                        }
                        className="
                          inline-flex h-11
                          items-center gap-2
                          self-start
                          rounded-xl
                          bg-[#5A47FF]
                          px-4
                          text-sm
                          font-black
                          text-white
                          shadow-md
                          transition
                          hover:bg-[#4936E8]
                        "
                      >
                        <Navigation
                          size={16}
                        />

                        {mostrarMapa
                          ? "Ocultar mapa"
                          : "Ver mapa"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          abrirResena
                        }
                        className="
                          inline-flex h-11
                          items-center gap-2
                          rounded-xl
                          border
                          border-[#D8D2FF]
                          bg-[#F3F0FF]
                          px-4
                          text-sm
                          font-black
                          text-[#5A47FF]
                          transition
                          hover:bg-[#EAE5FF]
                          dark:border-[#4C4381]
                          dark:bg-[#302B58]
                        "
                      >
                        <Star
                          size={16}
                        />

                        Agregar reseña
                      </button>

                      <button
                        type="button"
                        onClick={
                          abrirReserva
                        }
                        className={`
                          inline-flex h-11
                          items-center gap-2
                          rounded-xl
                          px-4
                          text-sm
                          font-black
                          transition
                          ${
                            esPremium
                              ? "bg-[#E8FFF3] text-[#15955C] hover:bg-[#D9F9E9]"
                              : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }
                        `}
                      >
                        {esPremium ? (
                          <MessageCircle
                            size={17}
                          />
                        ) : (
                          <Crown
                            size={17}
                          />
                        )}

                        {esPremium
                          ? "Reservar"
                          : "Reserva Premium"}
                      </button>
                    </div>
                  </div>

                  {/* MAPA */}

                  {mostrarMapa &&
                    mapaEmbed && (
                      <div className="mt-5 overflow-hidden rounded-2xl border border-[#E1E7F5] shadow-sm dark:border-slate-700">
                        <iframe
                          src={
                            mapaEmbed
                          }
                          title={`Mapa de ${lugarSeleccionado.nombre}`}
                          className="h-[310px] w-full border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    )}

                  {/* CARACTERÍSTICAS */}

                  {lugarSeleccionado.caracteristicas.length >
                    0 && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {lugarSeleccionado.caracteristicas.map(
                        (
                          caracteristica
                        ) => (
                          <div
                            key={
                              caracteristica
                            }
                            className="rounded-xl border border-[#E8ECF5] bg-[#FAFBFF] p-3 text-center dark:border-slate-700 dark:bg-slate-800"
                          >
                            <CheckCircle2
                              size={20}
                              className="mx-auto text-[#5A47FF]"
                            />

                            <p className="mt-2 text-xs font-black">
                              {caracteristica}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* RESERVA PREMIUM BANNER */}

                  <div
                    className={`
                      mt-6
                      rounded-2xl
                      border p-5
                      ${
                        esPremium
                          ? "border-green-200 bg-gradient-to-r from-[#F0FFF7] to-[#F6FFFB] dark:border-green-900/60 dark:from-green-950/20 dark:to-slate-900"
                          : "border-[#E3DDFE] bg-gradient-to-r from-[#F7F4FF] to-[#FAF9FF] dark:border-[#4D4576] dark:from-[#292443] dark:to-[#1D2637]"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          flex h-11 w-11 shrink-0
                          items-center justify-center
                          rounded-xl
                          ${
                            esPremium
                              ? "bg-green-100 text-green-700"
                              : "bg-[#E9E3FF] text-[#6855E8]"
                          }
                        `}
                      >
                        {esPremium ? (
                          <MessageCircle
                            size={22}
                          />
                        ) : (
                          <Crown
                            size={22}
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-black">
                          {esPremium
                            ? "Reserva tu espacio"
                            : "Reserva con Raccoon Premium"}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-[#637590] dark:text-slate-300">
                          {esPremium
                            ? "Selecciona fecha, hora y cantidad de personas. Raccoon preparará el mensaje para enviarlo al establecimiento por WhatsApp."
                            : "Con Premium puedes contactar al establecimiento directamente para solicitar una reserva."}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              esPremium
                            ) {
                              abrirReserva();
                            } else {
                              router.push(
                                "/suscripcion"
                              );
                            }
                          }}
                          className={`
                            mt-4 inline-flex
                            items-center gap-2
                            rounded-xl px-4 py-2.5
                            text-sm font-black
                            ${
                              esPremium
                                ? "bg-[#20A66A] text-white hover:bg-[#188B58]"
                                : "bg-[#6855E8] text-white hover:bg-[#5845D5]"
                            }
                          `}
                        >
                          {esPremium ? (
                            <MessageCircle
                              size={16}
                            />
                          ) : (
                            <Crown
                              size={16}
                            />
                          )}

                          {esPremium
                            ? "Reservar por WhatsApp"
                            : "Ver Premium"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPCIÓN */}

                  <div className="mt-6 border-t border-[#E8ECF5] pt-6 dark:border-slate-700">
                    <h3 className="font-black">
                      Descripción
                    </h3>

                    <p className="mt-3 leading-7 text-[#52688B] dark:text-slate-300">
                      {lugarSeleccionado.descripcion}
                    </p>
                  </div>

                  {/* HORARIO */}

                  {lugarSeleccionado.horario.length >
                    0 && (
                    <div className="mt-6 border-t border-[#E8ECF5] pt-6 dark:border-slate-700">
                      <h3 className="font-black">
                        Horario
                      </h3>

                      <div className="mt-3 space-y-2 rounded-2xl bg-[#F8FAFF] p-4 dark:bg-slate-800">
                        {lugarSeleccionado.horario.map(
                          (
                            item,
                            indice
                          ) => (
                            <p
                              key={`${item}-${indice}`}
                              className="text-sm text-[#52688B] dark:text-slate-300"
                            >
                              {item}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* CONTACTO */}

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-[#E8ECF5] pt-6 dark:border-slate-700">
                    {lugarSeleccionado.telefono && (
                      <a
                        href={`tel:${lugarSeleccionado.telefono}`}
                        className="flex items-center gap-2 rounded-xl bg-[#EEF4FF] px-4 py-3 text-sm font-black text-[#3159AB]"
                      >
                        <Phone
                          size={17}
                        />

                        Llamar
                      </a>
                    )}

                    {lugarSeleccionado.web && (
                      <a
                        href={
                          lugarSeleccionado.web
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-xl bg-[#F1EDFF] px-4 py-3 text-sm font-black text-[#7652D9]"
                      >
                        <ExternalLink
                          size={17}
                        />

                        Sitio web
                      </a>
                    )}

                    {lugarSeleccionado.mapaUrl && (
                      <a
                        href={
                          lugarSeleccionado.mapaUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-xl bg-[#EAF8F1] px-4 py-3 text-sm font-black text-green-700"
                      >
                        <Navigation
                          size={17}
                        />

                        Cómo llegar
                      </a>
                    )}
                  </div>

                  {/* =================================================
                      RESEÑAS
                  ================================================= */}

                  <div className="mt-7 border-t border-[#E8ECF5] pt-6 dark:border-slate-700">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">
                          Reseñas
                        </h3>

                        <p className="mt-1 text-xs text-[#8494B4]">
                          Opiniones de Google y la comunidad de Raccoon Study
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          abrirResena
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#F0EDFF] px-4 py-2.5 text-xs font-black text-[#5A47FF] dark:bg-[#302B58]"
                      >
                        <Star
                          size={15}
                        />

                        Agregar reseña
                      </button>
                    </div>

                    {resenasVisibles.length ===
                    0 ? (
                      <div className="mt-5 rounded-2xl bg-[#F8FAFF] p-7 text-center dark:bg-slate-800">
                        <Users
                          size={30}
                          className="mx-auto text-[#8B98AE]"
                        />

                        <p className="mt-3 font-black">
                          Sé el primero en opinar
                        </p>

                        <p className="mt-1 text-sm text-[#71819C]">
                          Comparte cómo fue tu experiencia estudiando aquí.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 space-y-4">
                        {resenasVisibles
                          .slice(
                            0,
                            8
                          )
                          .map(
                            (
                              resena
                            ) => (
                              <article
                                key={
                                  resena.id
                                }
                                className="border-b border-[#E8ECF5] pb-4 last:border-none dark:border-slate-700"
                              >
                                <div className="flex gap-3">
                                  {resena.fotoAutor ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={
                                        resena.fotoAutor
                                      }
                                      alt={
                                        resena.autor
                                      }
                                      className="h-10 w-10 rounded-full object-cover"
                                      onError={(
                                        evento
                                      ) => {
                                        evento.currentTarget.src =
                                          "/raccoon.png";
                                      }}
                                    />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFEAFF] text-[#7652D9]">
                                      <User
                                        size={18}
                                      />
                                    </div>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <strong>
                                        {resena.autor}
                                      </strong>

                                      {resena.esPropia && (
                                        <span className="rounded-full bg-[#E6F7ED] px-2 py-1 text-[9px] font-black text-green-700">
                                          Tu reseña
                                        </span>
                                      )}

                                      {resena.fecha && (
                                        <span className="text-xs text-[#8A98AF]">
                                          {resena.fecha}
                                        </span>
                                      )}
                                    </div>

                                    <div className="mt-1 flex gap-0.5 text-[#FFB629]">
                                      {Array.from({
                                        length: 5,
                                      }).map(
                                        (
                                          _,
                                          indice
                                        ) => (
                                          <Star
                                            key={
                                              indice
                                            }
                                            size={14}
                                            fill={
                                              indice <
                                              Math.round(
                                                resena.calificacion
                                              )
                                                ? "currentColor"
                                                : "none"
                                            }
                                          />
                                        )
                                      )}
                                    </div>

                                    <p className="mt-2 text-sm leading-6 text-[#52688B] dark:text-slate-300">
                                      {resena.comentario}
                                    </p>
                                  </div>
                                </div>
                              </article>
                            )
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {/* =====================================================
          MODAL RESEÑA
      ===================================================== */}

      {modalResena &&
        lugarSeleccionado && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={() =>
                setModalResena(
                  false
                )
              }
              className="absolute inset-0"
              aria-label="Cerrar"
            />

            <section className="relative z-10 w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl dark:bg-[#182437] sm:p-8">
              <button
                type="button"
                onClick={() =>
                  setModalResena(
                    false
                  )
                }
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F4F9] dark:bg-slate-700"
              >
                <X
                  size={20}
                />
              </button>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF5D9] text-[#F5AC20]">
                <Star
                  size={27}
                  fill="currentColor"
                />
              </div>

              <h2 className="mt-5 text-2xl font-black">
                Agregar reseña
              </h2>

              <p className="mt-2 text-sm text-[#667995] dark:text-slate-300">
                {lugarSeleccionado.nombre}
              </p>

              <form
                onSubmit={
                  guardarResena
                }
                className="mt-6"
              >
                <p className="text-sm font-black">
                  ¿Qué te pareció?
                </p>

                <div className="mt-3 flex gap-2">
                  {Array.from({
                    length: 5,
                  }).map(
                    (
                      _,
                      indice
                    ) => {
                      const valor =
                        indice + 1;

                      return (
                        <button
                          key={
                            valor
                          }
                          type="button"
                          onClick={() =>
                            setCalificacionResena(
                              valor
                            )
                          }
                          className="text-[#FFB629] transition hover:scale-110"
                        >
                          <Star
                            size={31}
                            fill={
                              valor <=
                              calificacionResena
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      );
                    }
                  )}
                </div>

                <label className="mt-6 block">
                  <span className="text-sm font-black">
                    Cuéntanos tu experiencia
                  </span>

                  <textarea
                    value={
                      comentarioResena
                    }
                    onChange={(
                      evento
                    ) =>
                      setComentarioResena(
                        evento.target.value
                      )
                    }
                    maxLength={
                      600
                    }
                    placeholder="Ejemplo: Es tranquilo, tiene buen ambiente y pude estudiar cómodamente..."
                    className="mt-2 min-h-[140px] w-full resize-none rounded-2xl border border-[#DDE4F2] bg-transparent p-4 text-sm outline-none focus:border-[#6D55FF] dark:border-slate-600"
                  />

                  <p className="mt-1 text-right text-xs text-[#8997AC]">
                    {
                      comentarioResena.length
                    }
                    /600
                  </p>
                </label>

                <button
                  type="submit"
                  disabled={
                    guardandoResena
                  }
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5A47FF] font-black text-white disabled:opacity-60"
                >
                  {guardandoResena ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />

                      Guardando...
                    </>
                  ) : (
                    <>
                      <Send
                        size={18}
                      />

                      Publicar reseña
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>
        )}

      {/* =====================================================
          MODAL RESERVA PREMIUM
      ===================================================== */}

      {modalReserva &&
        lugarSeleccionado && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={() =>
                setModalReserva(
                  false
                )
              }
              className="absolute inset-0"
              aria-label="Cerrar"
            />

            <section className="relative z-10 w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl dark:bg-[#182437] sm:p-8">
              <button
                type="button"
                onClick={() =>
                  setModalReserva(
                    false
                  )
                }
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F4F9] dark:bg-slate-700"
              >
                <X
                  size={20}
                />
              </button>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F9EF] text-[#20A66A]">
                <MessageCircle
                  size={28}
                />
              </div>

              <div className="mt-5 flex items-center gap-2">
                <h2 className="text-2xl font-black">
                  Reservar espacio
                </h2>

                <span className="rounded-full bg-gradient-to-r from-[#F5B942] to-[#6D55FF] px-2.5 py-1 text-[10px] font-black text-white">
                  PREMIUM
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-[#667995] dark:text-slate-300">
                Completa los detalles y abriremos WhatsApp con el mensaje listo para{" "}
                <strong>
                  {
                    lugarSeleccionado.nombre
                  }
                </strong>
                .
              </p>

              <form
                onSubmit={
                  enviarReservaWhatsApp
                }
                className="mt-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="text-sm font-black">
                      Fecha
                    </span>

                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#DDE4F2] px-3 dark:border-slate-600">
                      <CalendarDays
                        size={18}
                        className="text-[#7652D9]"
                      />

                      <input
                        type="date"
                        min={
                          fechaInput(
                            new Date()
                          )
                        }
                        value={
                          fechaReserva
                        }
                        onChange={(
                          evento
                        ) =>
                          setFechaReserva(
                            evento.target.value
                          )
                        }
                        className="h-12 w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </label>

                  <label>
                    <span className="text-sm font-black">
                      Hora
                    </span>

                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#DDE4F2] px-3 dark:border-slate-600">
                      <Clock3
                        size={18}
                        className="text-[#7652D9]"
                      />

                      <input
                        type="time"
                        value={
                          horaReserva
                        }
                        onChange={(
                          evento
                        ) =>
                          setHoraReserva(
                            evento.target.value
                          )
                        }
                        className="h-12 w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="text-sm font-black">
                    Cantidad de personas
                  </span>

                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#DDE4F2] px-3 dark:border-slate-600">
                    <Users
                      size={18}
                      className="text-[#7652D9]"
                    />

                    <select
                      value={
                        personasReserva
                      }
                      onChange={(
                        evento
                      ) =>
                        setPersonasReserva(
                          Number(
                            evento.target.value
                          )
                        )
                      }
                      className="h-12 w-full bg-transparent text-sm outline-none"
                    >
                      {Array.from({
                        length: 10,
                      }).map(
                        (
                          _,
                          indice
                        ) => {
                          const numero =
                            indice + 1;

                          return (
                            <option
                              key={
                                numero
                              }
                              value={
                                numero
                              }
                            >
                              {numero}{" "}
                              {numero ===
                              1
                                ? "persona"
                                : "personas"}
                            </option>
                          );
                        }
                      )}
                    </select>
                  </div>
                </label>

                <label className="mt-4 block">
                  <span className="text-sm font-black">
                    Nota opcional
                  </span>

                  <textarea
                    value={
                      notaReserva
                    }
                    onChange={(
                      evento
                    ) =>
                      setNotaReserva(
                        evento.target.value
                      )
                    }
                    maxLength={
                      250
                    }
                    placeholder="Ejemplo: Necesitamos una mesa cerca de un enchufe."
                    className="mt-2 min-h-[90px] w-full resize-none rounded-xl border border-[#DDE4F2] bg-transparent p-3 text-sm outline-none focus:border-[#20A66A] dark:border-slate-600"
                  />
                </label>

                <div className="mt-5 rounded-xl bg-[#F2FFF8] p-4 dark:bg-green-950/20">
                  <p className="text-xs leading-5 text-[#547464] dark:text-green-200">
                    La reserva no se confirma automáticamente. Raccoon Study abrirá WhatsApp para que el establecimiento confirme disponibilidad contigo.
                  </p>
                </div>

                <button
                  type="submit"
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#20A66A] font-black text-white transition hover:bg-[#188B58]"
                >
                  <MessageCircle
                    size={19}
                  />

                  Continuar en WhatsApp
                </button>
              </form>
            </section>
          </div>
        )}
    </main>
  );
}

/* =====================================================
   TARJETA
===================================================== */

function TarjetaLugar({
  lugar,
  seleccionado,
  onClick,
}: {
  lugar: Lugar;
  seleccionado: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        flex w-full
        flex-col gap-4
        rounded-2xl
        border-2
        bg-white p-3
        text-left
        transition
        hover:-translate-y-0.5
        hover:shadow-md
        dark:bg-[#182437]
        sm:flex-row
        ${
          seleccionado
            ? "border-[#7866FF] shadow-md"
            : "border-[#E6EAF3] hover:border-[#AFA4FF] dark:border-slate-700"
        }
      `}
    >
      <div className="h-[135px] w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#EEE9FF] to-[#E5F5FF] sm:w-[155px]">
        <FotoLugar
          src={
            lugar.foto
          }
          nombre={
            lugar.nombre
          }
          categoria={
            lugar.categoria
          }
        />
      </div>

      <div className="min-w-0 flex-1 py-1">
        <h3 className="line-clamp-2 text-lg font-black">
          {lugar.nombre}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#52688B] dark:text-slate-300">
          {lugar.direccion}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {lugar.calificacion >
          0 ? (
            <>
              <Star
                size={16}
                fill="currentColor"
                className="text-[#FFB629]"
              />

              <strong>
                {lugar.calificacion.toFixed(
                  1
                )}
              </strong>

              <span className="text-[#8B98AE]">
                (
                {
                  lugar.cantidadResenas
                }
                )
              </span>
            </>
          ) : (
            <span className="text-xs text-[#8B98AE]">
              Sin valoración
            </span>
          )}

          {lugar.abiertoAhora ===
            true && (
            <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-black text-green-700">
              Abierto
            </span>
          )}

          {lugar.abiertoAhora ===
            false && (
            <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-black text-red-600">
              Cerrado
            </span>
          )}
        </div>

        {lugar.caracteristicas.length >
          0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {lugar.caracteristicas
              .slice(
                0,
                3
              )
              .map(
                (
                  caracteristica
                ) => (
                  <span
                    key={
                      caracteristica
                    }
                    className="rounded-full bg-[#F4F5FB] px-3 py-1 text-[10px] font-bold text-[#52688B] dark:bg-slate-700 dark:text-slate-200"
                  >
                    {caracteristica}
                  </span>
                )
              )}
          </div>
        )}
      </div>

      <div className="hidden items-center justify-center px-2 text-[#7652D9] sm:flex">
        <ArrowRight
          size={20}
        />
      </div>
    </button>
  );
}

/* =====================================================
   FOTO
===================================================== */

function FotoLugar({
  src,
  nombre,
  categoria,
}: {
  src: string;
  nombre: string;
  categoria: CategoriaLugar;
}) {
  const [
    error,
    setError,
  ] = useState(false);

  const [
    cargando,
    setCargando,
  ] = useState(
    Boolean(src)
  );

  useEffect(() => {
    setError(false);

    setCargando(
      Boolean(src)
    );
  }, [
    src,
  ]);

  const Icono =
    iconoCategoria(
      categoria
    );

  if (
    !src ||
    error
  ) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#EEE9FF] via-[#F7F6FF] to-[#E3F2FF] px-3 text-center text-[#7652D9] dark:from-[#28243E] dark:via-[#1D2A40] dark:to-[#1C304D]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/85 shadow-sm dark:bg-slate-800">
          <Icono
            size={28}
          />
        </div>

        <p className="mt-2 line-clamp-2 text-[10px] font-black">
          {nombre}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {cargando && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#EDF2FA] dark:bg-slate-800">
          <LoaderCircle
            size={24}
            className="animate-spin text-[#7652D9]"
          />
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Foto de ${nombre}`}
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        loading="lazy"
        decoding="async"
        onLoad={() =>
          setCargando(
            false
          )
        }
        onError={() => {
          setCargando(
            false
          );

          setError(
            true
          );
        }}
      />
    </div>
  );
}