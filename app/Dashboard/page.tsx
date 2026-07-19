"use client";

import type { ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
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

type AccionEstudio =
  | "pomodoro"
  | "resumen"
  | "quiz";

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

/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */

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

    progreso:
      typeof dato.progreso === "number"
        ? dato.progreso
        : Number(dato.progreso || 0),

    fecha_subida:
      typeof dato.fecha_subida === "string"
        ? dato.fecha_subida
        : new Date().toISOString(),

    usuario_id:
      typeof dato.usuario_id === "string"
        ? dato.usuario_id
        : "",
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

    ultimo_mensaje: obtenerTextoDeCampos(
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

function formatearFecha(
  fecha: string
): string {
  if (!fecha) {
    return "Reciente";
  }

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

  const diferencia = Math.floor(
    (ahora.getTime() -
      fechaObjeto.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diferencia === 0) {
    return "Hoy";
  }

  if (diferencia === 1) {
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

/* =====================================================
   COMPONENTE
===================================================== */

export default function Dashboard() {
  const router = useRouter();

  /* USUARIO */

  const [
    nombreUsuario,
    setNombreUsuario,
  ] = useState("Usuario");

  const [fotoPerfil, setFotoPerfil] =
    useState("/raccoon.png");

  /* MATERIALES */

  const [materiales, setMateriales] =
    useState<Material[]>([]);

  const [
    cargandoMateriales,
    setCargandoMateriales,
  ] = useState(true);

  const [subiendo, setSubiendo] =
    useState(false);

  const [busqueda, setBusqueda] =
    useState("");

  const [
    mostrarTodos,
    setMostrarTodos,
  ] = useState(false);

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
  ] = useState<Material | null>(null);

  const [
    textoArchivo,
    setTextoArchivo,
  ] = useState("");

  const [
    cargandoTexto,
    setCargandoTexto,
  ] = useState(false);

  const [errorVisor, setErrorVisor] =
    useState("");

  /* OPCIONES DE ESTUDIO */

  const [
    materialParaAccion,
    setMaterialParaAccion,
  ] = useState<Material | null>(null);

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

  const [horasEstudio] = useState(0);

  /* =====================================================
     INICIAR
  ===================================================== */

  useEffect(() => {
    const iniciarDashboard =
      async () => {
        inicializarTema();

        const usuarioValido =
          await obtenerUsuario();

        if (usuarioValido) {
          await Promise.all([
            obtenerMateriales(),
            obtenerChatsRecientes(),
          ]);
        }
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

    const cargarTexto = async () => {
      try {
        setCargandoTexto(true);
        setErrorVisor("");

        const respuesta = await fetch(
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

        setTextoArchivo(contenido);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
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
     TEMA CLARO Y OSCURO
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
      (!temaGuardado &&
        sistemaOscuro);

    setModoOscuro(usarOscuro);

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
     NOTIFICACIONES
  ===================================================== */

  const mostrarNotificacion = (
    mensaje: string
  ) => {
    setNotificacion(mensaje);

    window.setTimeout(() => {
      setNotificacion("");
    }, 4000);
  };

  /* =====================================================
     USUARIO
  ===================================================== */

  const obtenerUsuario =
    async () => {
      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          router.replace("/Login");
          return false;
        }

        setNombreUsuario(
          user.user_metadata
            ?.nombre ||
            user.user_metadata
              ?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Usuario"
        );

        if (
          user.user_metadata
            ?.avatar_url
        ) {
          setFotoPerfil(
            user.user_metadata
              .avatar_url
          );
        }

        return true;
      } catch (error) {
        console.error(
          "Error obteniendo usuario:",
          error
        );

        mostrarNotificacion(
          "No se pudo cargar tu información."
        );

        return false;
      }
    };

  /* =====================================================
     OBTENER MATERIALES
  ===================================================== */

  const obtenerMateriales =
    async () => {
      try {
        setCargandoMateriales(true);

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          router.replace("/Login");
          return;
        }

        const { data, error } =
          await supabase
            .from("materiales")
            .select("*")
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

        const lista = (
          data || []
        ).map((material) =>
          normalizarMaterial(
            material as Record<
              string,
              unknown
            >
          )
        );

        setMateriales(lista);
      } catch (error) {
        console.error(
          "Error cargando materiales:",
          error
        );

        mostrarNotificacion(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los materiales."
        );
      } finally {
        setCargandoMateriales(false);
      }
    };

  /* =====================================================
     OBTENER CHATS RECIENTES
  ===================================================== */

  const obtenerChatsRecientes =
    async () => {
      try {
        setCargandoChats(true);

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          return;
        }

        /*
          El código intenta encontrar chats
          utilizando nombres comunes de tablas.
          Si no existe una tabla, continúa sin
          causar errores en el Dashboard.
        */

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
          const { data, error } =
            await supabase
              .from(consulta.tabla)
              .select("*")
              .eq(
                consulta.columnaUsuario,
                user.id
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
                  (chatA, chatB) =>
                    new Date(
                      chatB.fecha_actualizacion
                    ).getTime() -
                    new Date(
                      chatA.fecha_actualizacion
                    ).getTime()
                )
                .slice(0, 3);

            setChatsRecientes(chats);
            return;
          }
        }

        /*
          Respaldo opcional desde localStorage.
        */

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
                      typeof elemento ===
                        "object" &&
                      elemento !== null
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

    if (!archivo || subiendo) {
      return;
    }

    const extension =
      obtenerExtension(archivo.name);

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

    if (
      archivo.size >
      20 * 1024 * 1024
    ) {
      mostrarNotificacion(
        "El archivo no puede superar los 20 MB."
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

      rutaStorage = `${user.id}/${identificador}-${nombreSeguro}`;

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
          .remove([rutaStorage]);

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
     OPCIONES DE ESTUDIO
  ===================================================== */

  const elegirAccionEstudio = (
    accion: AccionEstudio,
    material:
      | Material
      | null = materialParaAccion
  ) => {
    if (!material) {
      mostrarNotificacion(
        "Selecciona primero un material."
      );

      return;
    }

    const informacionMaterial = {
      id: material.id,

      material_id: material.id,

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

    setMostrarOpcionesEstudio(false);
    setMaterialAbierto(null);

    if (accion === "pomodoro") {
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

    if (accion === "resumen") {
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
     VISOR INTERNO
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
  };

  const cerrarVisor = () => {
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
     CERRAR SESIÓN
  ===================================================== */

  const cerrarSesion =
    async () => {
      await supabase.auth.signOut();

      router.push("/Login");
    };

  /* =====================================================
     PROGRESO
  ===================================================== */

  const calcularRacha = () => {
    if (
      materiales.length === 0
    ) {
      return 0;
    }

    const fechasValidas =
      materiales
        .map((material) =>
          new Date(
            material.fecha_subida
          )
        )
        .filter(
          (fecha) =>
            !Number.isNaN(
              fecha.getTime()
            )
        )
        .map((fecha) =>
          fecha.toDateString()
        );

    const fechasUnicas = [
      ...new Set(fechasValidas),
    ];

    if (
      fechasUnicas.length === 0
    ) {
      return 0;
    }

    fechasUnicas.sort(
      (fechaA, fechaB) =>
        new Date(
          fechaB
        ).getTime() -
        new Date(
          fechaA
        ).getTime()
    );

    const hoy = new Date();

    const ultimaFecha = new Date(
      fechasUnicas[0]
    );

    const diferenciaInicial =
      Math.floor(
        (hoy.getTime() -
          ultimaFecha.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    if (
      diferenciaInicial > 1
    ) {
      return 0;
    }

    let racha = 1;

    for (
      let indice = 1;
      indice <
      fechasUnicas.length;
      indice++
    ) {
      const fechaActual =
        new Date(
          fechasUnicas[
            indice - 1
          ]
        );

      const fechaAnterior =
        new Date(
          fechasUnicas[indice]
        );

      const diferenciaDias =
        Math.round(
          (fechaActual.getTime() -
            fechaAnterior.getTime()) /
            (1000 *
              60 *
              60 *
              24)
        );

      if (
        diferenciaDias === 1
      ) {
        racha++;
      } else {
        break;
      }
    }

    return racha;
  };

  const materialesCompletados =
    materiales.filter(
      (material) =>
        material.progreso >= 100
    ).length;

  const xp =
    materialesCompletados * 500;

  const xpMax = 2000;

  const nivel = Math.min(
    Math.floor(xp / xpMax) + 1,
    10
  );

  const xpNivel =
    xp >= xpMax
      ? xp % xpMax
      : xp;

  const porcentajeXp = Math.min(
    (xpNivel / xpMax) * 100,
    100
  );

  const rachaActual =
    calcularRacha();

  /* =====================================================
     BÚSQUEDA
  ===================================================== */

  const textoBusqueda =
    busqueda
      .trim()
      .toLowerCase();

  const materialesFiltrados =
    materiales.filter((material) =>
      material.nombre_archivo
        .toLowerCase()
        .includes(textoBusqueda)
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

  /* =====================================================
     VISOR
  ===================================================== */

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
      {/* OVERLAY MÓVIL */}

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
              Descubrir Premium
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
            {/* BÚSQUEDA */}

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
                    setMostrarTodos(true);
                  }
                }}
                placeholder="Buscar materiales..."
                className="w-40 bg-transparent text-sm outline-none placeholder:text-[#8AA4BE] lg:w-52"
              />

              {busqueda && (
                <button
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

            {/* TEMA */}

            <button
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

            {/* PERFIL */}

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
                  <p className="px-3 py-2 text-sm font-bold">
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

                  <button
                    onClick={cerrarSesion}
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
          <div className="fixed left-1/2 top-5 z-[300] w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl bg-[#55A8E8] px-5 py-3 text-center text-sm font-bold text-white shadow-2xl">
            {notificacion}
          </div>
        )}

        <div className="mx-auto max-w-[1500px] px-4 py-6 pb-28 sm:px-6 lg:px-8">
          {/* BÚSQUEDA MÓVIL */}

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
                  setMostrarTodos(true);
                }
              }}
              placeholder="Buscar materiales..."
              className="w-full bg-transparent text-sm outline-none"
            />

            {busqueda && (
              <button
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
              {/* BIENVENIDA */}

              <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#EAF8FF] via-white to-[#F0ECFF] p-6 shadow-sm dark:from-[#1D3558] dark:via-[#182437] dark:to-[#28243E] sm:p-8">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#55A8E8]/10" />

                <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-[#1687D9] dark:bg-slate-800">
                      <Sparkles size={16} />
                      Tu espacio de estudio
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

              {/* CONTINUAR ESTUDIANDO ARRIBA DE SUBIR */}

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
                        {
                          ultimoMaterial.nombre_archivo
                        }
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
                              width: `${Math.min(
                                ultimoMaterial.progreso,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="text-sm font-black">
                          {
                            ultimoMaterial.progreso
                          }
                          %
                        </span>
                      </div>
                    </div>

                    <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                      <button
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
                      Después de subirlo podrás elegir Pomodoro, Resumen o Quiz.
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
                    mt-6
                    flex
                    min-h-[260px]
                    flex-col
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-[25px]
                    border-2
                    border-dashed
                    p-6
                    text-center
                    transition
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
                        PDF, Word, PowerPoint, TXT o imágenes. Tamaño máximo: 20 MB.
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
                ) : materiales.length ===
                  0 ? (
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
                ) : materialesVisibles.length ===
                  0 ? (
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
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                ${
                                  indice % 3 ===
                                  0
                                    ? "bg-[#E9E2FF] text-[#7652D9]"
                                    : indice %
                                        3 ===
                                      1
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
                            {
                              material.nombre_archivo
                            }
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
                                {
                                  material.progreso
                                }
                                %
                              </span>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-[#E7ECF4] dark:bg-slate-700">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#55A8E8] to-[#7771E8]"
                                style={{
                                  width: `${Math.min(
                                    material.progreso,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-2">
                            <button
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
                              onClick={() =>
                                abrirOpcionesMaterial(
                                  material
                                )
                              }
                              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] py-3 text-sm font-black text-white"
                            >
                              Estudiar
                              <ArrowRight
                                size={17}
                              />
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

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <Link
                    href="/metodos/pomodoro"
                    className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-[#182437]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFE6E8] text-[#EE5A68]">
                      <Timer size={24} />
                    </div>

                    <h3 className="mt-5 font-black">
                      Pomodoro
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#6085A5] dark:text-slate-400">
                      Estudia en sesiones de concentración.
                    </p>
                  </Link>

                  <Link
                    href="/metodos/resumenes"
                    className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-[#182437]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E9E2FF] text-[#7652D9]">
                      <FileText size={24} />
                    </div>

                    <h3 className="mt-5 font-black">
                      Crear resumen
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#6085A5] dark:text-slate-400">
                      Convierte materiales en guías de estudio.
                    </p>
                  </Link>

                  <Link
                    href="/quizzes"
                    className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-[#182437]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DDF7EA] text-[#26A66B]">
                      <ClipboardCheck
                        size={24}
                      />
                    </div>

                    <h3 className="mt-5 font-black">
                      Crear quiz
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#6085A5] dark:text-slate-400">
                      Evalúa lo que aprendiste.
                    </p>
                  </Link>

                  <Link
                    href="/perfil"
                    className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-[#182437]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1C9] text-[#EBA900]">
                      <Trophy size={24} />
                    </div>

                    <h3 className="mt-5 font-black">
                      Ver progreso
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#6085A5] dark:text-slate-400">
                      Revisa tu nivel, racha y experiencia.
                    </p>
                  </Link>
                </div>
              </section>
            </div>

            {/* COLUMNA DERECHA */}

            <aside className="space-y-7">
              {/* TU PROGRESO */}

              <section className="rounded-[25px] bg-white p-7 shadow-sm dark:bg-[#182437]">
                <h2 className="text-xl font-black">
                  Tu Progreso
                </h2>

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
                        {rachaActual} días
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
                      width: `${porcentajeXp}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-right text-sm font-semibold text-[#6085A5]">
                  XP: {xpNivel} / {xpMax}
                </p>
              </section>

              {/* RACCOON IA DEBAJO DE PROGRESO */}

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

              {/* CHATS RECIENTES */}

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
                ) : chatsRecientes.length >
                  0 ? (
                  <div className="mt-5 space-y-3">
                    {chatsRecientes.map(
                      (chat) => (
                        <button
                          key={chat.id}
                          onClick={() =>
                            abrirChat(chat)
                          }
                          className="flex w-full items-center gap-3 rounded-2xl border border-[#E7EDF5] p-3 text-left transition hover:border-[#55A8E8] hover:bg-[#F4FAFF] dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9E2FF] text-[#7652D9]">
                            <MessageCircle
                              size={20}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black">
                              {chat.titulo}
                            </p>

                            <p className="mt-1 truncate text-xs text-[#6085A5] dark:text-slate-400">
                              {
                                chat.ultimo_mensaje
                              }
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
                      <MessageCircle
                        size={17}
                      />
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
                  <div className="rounded-2xl bg-[#F1F8FD] p-4 dark:bg-slate-700">
                    <FileText
                      size={22}
                      className="text-[#1687D9]"
                    />

                    <p className="mt-3 text-2xl font-black">
                      {materiales.length}
                    </p>

                    <p className="mt-1 text-xs text-[#6085A5] dark:text-slate-300">
                      Materiales
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F3EDFF] p-4 dark:bg-slate-700">
                    <CheckCircle2
                      size={22}
                      className="text-[#7652D9]"
                    />

                    <p className="mt-3 text-2xl font-black">
                      {
                        materialesCompletados
                      }
                    </p>

                    <p className="mt-1 text-xs text-[#6085A5] dark:text-slate-300">
                      Completados
                    </p>
                  </div>
                </div>
              </section>

              {/* TIEMPO */}

              <section className="rounded-[25px] bg-white p-7 shadow-sm dark:bg-[#182437]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">
                    Tiempo de Estudio
                  </h2>

                  <span className="font-semibold text-[#6085A5]">
                    {horasEstudio}h
                  </span>
                </div>

                <div className="mt-7 flex h-32 items-end justify-between gap-3">
                  {[
                    15, 35, 25, 50, 30,
                    60, 40,
                  ].map(
                    (
                      altura,
                      indice
                    ) => (
                      <div
                        key={indice}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-[#55A8E8] to-[#7771E8]"
                          style={{
                            height: `${altura}%`,
                          }}
                        />

                        <span className="text-xs text-[#6085A5]">
                          {
                            [
                              "L",
                              "M",
                              "X",
                              "J",
                              "V",
                              "S",
                              "D",
                            ][indice]
                          }
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

      {/* MODAL OPCIONES DE ESTUDIO */}

      {mostrarOpcionesEstudio &&
        materialParaAccion && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl rounded-[30px] bg-white p-6 shadow-2xl dark:bg-[#182437] sm:p-8">
              <button
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
                  <CheckCircle2
                    size={17}
                  />
                  Material listo
                </span>

                <h2 className="mt-5 text-3xl font-black">
                  ¿Cómo quieres estudiar?
                </h2>

                <p className="mt-2 line-clamp-2 text-[#6085A5] dark:text-slate-300">
                  {
                    materialParaAccion.nombre_archivo
                  }
                </p>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <button
                  onClick={() =>
                    elegirAccionEstudio(
                      "pomodoro"
                    )
                  }
                  className="group rounded-[22px] border border-[#FFE1E4] bg-[#FFF6F7] p-5 text-left transition hover:-translate-y-1 hover:border-[#EE5A68] hover:shadow-lg dark:border-slate-700 dark:bg-[#2A1B22]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFE1E4] text-[#EE5A68]">
                    <Timer size={28} />
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    Pomodoro
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#6085A5] dark:text-slate-300">
                    Lee el material en sesiones de enfoque y descanso.
                  </p>

                  <div className="mt-5 flex items-center gap-2 font-black text-[#EE5A68]">
                    Comenzar
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </button>

                <button
                  onClick={() =>
                    elegirAccionEstudio(
                      "resumen"
                    )
                  }
                  className="group rounded-[22px] border border-[#DFD7FF] bg-[#F8F5FF] p-5 text-left transition hover:-translate-y-1 hover:border-[#7652D9] hover:shadow-lg dark:border-slate-700 dark:bg-[#28243E]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9E2FF] text-[#7652D9]">
                    <FileText size={28} />
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    Generar resumen
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#6085A5] dark:text-slate-300">
                    Convierte el contenido en una guía organizada.
                  </p>

                  <div className="mt-5 flex items-center gap-2 font-black text-[#7652D9]">
                    Crear resumen
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </button>

                <button
                  onClick={() =>
                    elegirAccionEstudio(
                      "quiz"
                    )
                  }
                  className="group rounded-[22px] border border-[#CFEEDD] bg-[#F2FBF6] p-5 text-left transition hover:-translate-y-1 hover:border-[#26A66B] hover:shadow-lg dark:border-slate-700 dark:bg-[#193028]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF7EA] text-[#26A66B]">
                    <ClipboardCheck
                      size={28}
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    Crear quiz
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#6085A5] dark:text-slate-300">
                    Evalúa tus conocimientos con preguntas.
                  </p>

                  <div className="mt-5 flex items-center gap-2 font-black text-[#26A66B]">
                    Crear quiz
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-[#E7EDF5] pt-5 sm:flex-row sm:justify-between dark:border-slate-700">
                <button
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
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9E2FF] text-[#7652D9]">
                    <FileText size={22} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-black">
                      {
                        materialAbierto.nombre_archivo
                      }
                    </h2>

                    <p className="mt-1 text-xs text-[#6085A5] dark:text-slate-400">
                      Revisando dentro de Raccoon Study
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    elegirAccionEstudio(
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
                  onClick={() =>
                    elegirAccionEstudio(
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
                  onClick={() =>
                    elegirAccionEstudio(
                      "quiz",
                      materialAbierto
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#EDF9F2] px-3 py-2 text-sm font-bold text-[#26A66B] dark:bg-[#193028]"
                >
                  <ClipboardCheck
                    size={17}
                  />
                  Quiz
                </button>

                <button
                  onClick={cerrarVisor}
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
                extensionAbierta ===
                  "md" ? (
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
                        {
                          materialAbierto.nombre_archivo
                        }
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