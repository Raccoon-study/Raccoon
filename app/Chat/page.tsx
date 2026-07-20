"use client";

import type { KeyboardEvent } from "react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bot,
  Brain,
  ChevronDown,
  ClipboardCheck,
  Crown,
  Home,
  Library,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  MessagesSquare,
  Moon,
  Plus,
  Send,
  Sparkles,
  Sun,
  User,
  WandSparkles,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

/* =====================================================
   TIPOS
===================================================== */

type TipoMensaje = "ia" | "user";

type PlanUsuario =
  | "free"
  | "month"
  | "year";

interface Mensaje {
  id: string;
  tipo: TipoMensaje;
  texto: string;
  fecha: string;
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
  icono: typeof Home;
  activo?: boolean;
}

/* =====================================================
   CONSTANTES
===================================================== */

const MENSAJE_BIENVENIDA: Mensaje = {
  id: "bienvenida-raccoon",
  tipo: "ia",
  texto:
    "👋 **¡Hola! Soy Raccoon IA.**\n\nEstoy lista para ayudarte a estudiar, comprender tus materiales, preparar exámenes y resolver tus dudas.\n\n**¿Qué quieres aprender hoy?**",
  fecha: "",
};

const SUGERENCIAS = [
  "Explícame un tema de forma sencilla",
  "Ayúdame a prepararme para un examen",
  "Crea una guía de estudio",
  "Hazme preguntas para practicar",
];

const ELEMENTOS_MENU: ElementoMenu[] = [
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
  },
];

/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */

function crearId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

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
): PlanUsuario {
  const texto = String(valor || "")
    .trim()
    .toLowerCase();

  if (
    texto === "year" ||
    texto === "annual" ||
    texto === "anual" ||
    texto.includes("year") ||
    texto.includes("anual")
  ) {
    return "year";
  }

  if (
    texto === "month" ||
    texto === "monthly" ||
    texto === "mensual" ||
    texto === "premium" ||
    texto.includes("month") ||
    texto.includes("mensual")
  ) {
    return "month";
  }

  return premium
    ? "month"
    : "free";
}

function nombrePlan(
  plan: PlanUsuario
): string {
  if (plan === "year") {
    return "Premium anual";
  }

  if (plan === "month") {
    return "Premium mensual";
  }

  return "Plan gratuito";
}

function formatearHora(
  fecha: string
): string {
  if (!fecha) {
    return "";
  }

  const fechaObjeto =
    new Date(fecha);

  if (
    Number.isNaN(
      fechaObjeto.getTime()
    )
  ) {
    return "";
  }

  return fechaObjeto.toLocaleTimeString(
    "es-PA",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatearFechaChat(
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

function normalizarMensajes(
  valor: unknown
): Mensaje[] {
  if (!Array.isArray(valor)) {
    return [
      {
        ...MENSAJE_BIENVENIDA,
      },
    ];
  }

  const resultado =
    valor
      .filter(esObjeto)
      .map((elemento) => {
        const tipo: TipoMensaje =
          elemento.tipo === "user"
            ? "user"
            : "ia";

        return {
          id: String(
            elemento.id ||
              crearId()
          ),

          tipo,

          texto:
            typeof elemento.texto ===
              "string"
              ? elemento.texto
              : "",

          fecha:
            typeof elemento.fecha ===
              "string"
              ? elemento.fecha
              : new Date().toISOString(),
        };
      })
      .filter(
        (elemento) =>
          elemento.texto.trim() !== ""
      );

  if (resultado.length === 0) {
    return [
      {
        ...MENSAJE_BIENVENIDA,
      },
    ];
  }

  return resultado;
}

function normalizarChats(
  valor: unknown
): ChatReciente[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .filter(esObjeto)
    .map((chat) => ({
      id: String(
        chat.id ||
          crearId()
      ),

      titulo:
        typeof chat.titulo ===
          "string"
          ? chat.titulo
          : "Conversación con Raccoon IA",

      ultimo_mensaje:
        typeof chat.ultimo_mensaje ===
          "string"
          ? chat.ultimo_mensaje
          : "Continúa tu conversación.",

      fecha_actualizacion:
        typeof chat.fecha_actualizacion ===
          "string"
          ? chat.fecha_actualizacion
          : new Date().toISOString(),
    }))
    .slice(0, 8);
}

function obtenerError(
  valor: unknown
): string {
  if (!esObjeto(valor)) {
    return "No se pudo obtener una respuesta.";
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

  return "No se pudo obtener una respuesta.";
}

/* =====================================================
   COMPONENTE PRINCIPAL
===================================================== */

export default function ChatPage() {
  const router = useRouter();

  const finalRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
    mensajes,
    setMensajes,
  ] = useState<Mensaje[]>([
    {
      ...MENSAJE_BIENVENIDA,
    },
  ]);

  const [
    cargando,
    setCargando,
  ] = useState(false);

  const [
    chatId,
    setChatId,
  ] = useState("");

  const [
    tituloChat,
    setTituloChat,
  ] = useState(
    "Nueva conversación"
  );

  const [
    chatsRecientes,
    setChatsRecientes,
  ] = useState<ChatReciente[]>([]);

  const [
    nombreUsuario,
    setNombreUsuario,
  ] = useState("Usuario");

  const [
    fotoPerfil,
    setFotoPerfil,
  ] = useState("/raccoon.png");

  const [
    planUsuario,
    setPlanUsuario,
  ] =
    useState<PlanUsuario>("free");

  const [
    cargandoPlan,
    setCargandoPlan,
  ] = useState(true);

  const [
    modoOscuro,
    setModoOscuro,
  ] = useState(false);

  const [
    menuAbierto,
    setMenuAbierto,
  ] = useState(false);

  const [
    perfilAbierto,
    setPerfilAbierto,
  ] = useState(false);

  const [
    panelConversaciones,
    setPanelConversaciones,
  ] = useState(false);

  const [
    notificacion,
    setNotificacion,
  ] = useState("");

  const esPremium =
    planUsuario === "month" ||
    planUsuario === "year";

  /* =====================================================
     INICIALIZACIÓN
  ===================================================== */

  useEffect(() => {
    const iniciar = async () => {
      inicializarTema();
      cargarChatsLocales();
      cargarConversacionInicial();

      await cargarUsuarioYPlan();
    };

    void iniciar();
  }, []);

  /* =====================================================
     SCROLL AUTOMÁTICO
  ===================================================== */

  useEffect(() => {
    finalRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [mensajes, cargando]);

  /* =====================================================
     GUARDAR CONVERSACIÓN
  ===================================================== */

  useEffect(() => {
    if (!chatId) {
      return;
    }

    localStorage.setItem(
      `raccoon-chat-${chatId}`,
      JSON.stringify(mensajes)
    );
  }, [mensajes, chatId]);

  /* =====================================================
     AJUSTAR TEXTAREA
  ===================================================== */

  useEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height =
      "auto";

    textarea.style.height =
      `${Math.min(
        textarea.scrollHeight,
        170
      )}px`;
  }, [mensaje]);

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
  };

  /* =====================================================
     NOTIFICACIONES
  ===================================================== */

  const mostrarNotificacion = (
    texto: string
  ) => {
    setNotificacion(texto);

    window.setTimeout(() => {
      setNotificacion("");
    }, 4000);
  };

  /* =====================================================
     USUARIO Y PLAN
  ===================================================== */

  const cargarUsuarioYPlan =
    async () => {
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
          return;
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

        const planMetadata =
          normalizarPlan(
            metadata.plan ||
              metadata.subscription ||
              metadata.tipo_plan ||
              metadata.subscription_plan,
            premiumMetadata
          );

        setPlanUsuario(
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

                cache:
                  "no-store",
              }
            );

          if (!respuesta.ok) {
            return;
          }

          const datos: unknown =
            await respuesta.json();

          if (!esObjeto(datos)) {
            return;
          }

          const premiumServidor =
            datos.premium === true ||
            datos.is_premium === true ||
            datos.es_premium === true;

          const planServidor =
            normalizarPlan(
              datos.plan ||
                datos.subscription ||
                datos.tipo_plan,
              premiumServidor
            );

          setPlanUsuario(
            planServidor
          );
        } catch (error) {
          console.warn(
            "No se pudo verificar el plan:",
            error
          );
        }
      } catch (error) {
        console.error(
          "Error cargando usuario:",
          error
        );

        mostrarNotificacion(
          "No se pudo cargar tu información."
        );
      } finally {
        setCargandoPlan(false);
      }
    };

  /* =====================================================
     CARGAR CHATS
  ===================================================== */

  const cargarChatsLocales =
    () => {
      try {
        const guardados =
          localStorage.getItem(
            "raccoon-chats-recientes"
          );

        if (!guardados) {
          setChatsRecientes([]);
          return;
        }

        const datos: unknown =
          JSON.parse(guardados);

        setChatsRecientes(
          normalizarChats(
            datos
          )
        );
      } catch {
        setChatsRecientes([]);
      }
    };

  const cargarConversacionInicial =
    () => {
      try {
        const parametros =
          new URLSearchParams(
            window.location.search
          );

        const chatUrl =
          parametros.get("chat");

        const seleccionadoTexto =
          localStorage.getItem(
            "raccoon-chat-seleccionado"
          );

        let seleccionado:
          | ChatReciente
          | null = null;

        if (seleccionadoTexto) {
          const dato: unknown =
            JSON.parse(
              seleccionadoTexto
            );

          if (esObjeto(dato)) {
            seleccionado = {
              id: String(
                dato.id || ""
              ),

              titulo:
                typeof dato.titulo ===
                  "string"
                  ? dato.titulo
                  : "Conversación con Raccoon IA",

              ultimo_mensaje:
                typeof dato.ultimo_mensaje ===
                  "string"
                  ? dato.ultimo_mensaje
                  : "",

              fecha_actualizacion:
                typeof dato.fecha_actualizacion ===
                  "string"
                  ? dato.fecha_actualizacion
                  : new Date().toISOString(),
            };
          }
        }

        const id =
          chatUrl ||
          seleccionado?.id ||
          crearId();

        const titulo =
          seleccionado?.titulo ||
          "Nueva conversación";

        const mensajesGuardados =
          localStorage.getItem(
            `raccoon-chat-${id}`
          );

        if (mensajesGuardados) {
          const datos: unknown =
            JSON.parse(
              mensajesGuardados
            );

          setMensajes(
            normalizarMensajes(
              datos
            )
          );
        } else {
          setMensajes([
            {
              ...MENSAJE_BIENVENIDA,
            },
          ]);
        }

        setChatId(id);
        setTituloChat(titulo);

        window.history.replaceState(
          {},
          "",
          `/Chat?chat=${encodeURIComponent(
            id
          )}`
        );
      } catch (error) {
        console.error(
          "Error cargando conversación:",
          error
        );

        const id =
          crearId();

        setChatId(id);
        setTituloChat(
          "Nueva conversación"
        );

        setMensajes([
          {
            ...MENSAJE_BIENVENIDA,
          },
        ]);

        window.history.replaceState(
          {},
          "",
          `/Chat?chat=${encodeURIComponent(
            id
          )}`
        );
      }
    };

  const actualizarChatReciente = (
    id: string,
    titulo: string,
    ultimoMensaje: string
  ) => {
    const chatActualizado:
      ChatReciente = {
      id,
      titulo,
      ultimo_mensaje:
        ultimoMensaje
          .replace(/\n/g, " ")
          .slice(0, 120),

      fecha_actualizacion:
        new Date().toISOString(),
    };

    setChatsRecientes(
      (anteriores) => {
        const nuevos = [
          chatActualizado,
          ...anteriores.filter(
            (chat) =>
              chat.id !== id
          ),
        ].slice(0, 8);

        localStorage.setItem(
          "raccoon-chats-recientes",
          JSON.stringify(nuevos)
        );

        localStorage.setItem(
          "raccoon-chat-seleccionado",
          JSON.stringify(
            chatActualizado
          )
        );

        return nuevos;
      }
    );
  };

  /* =====================================================
     NUEVO CHAT
  ===================================================== */

  const crearNuevoChat = () => {
    if (cargando) {
      return;
    }

    const id =
      crearId();

    setChatId(id);

    setTituloChat(
      "Nueva conversación"
    );

    setMensajes([
      {
        ...MENSAJE_BIENVENIDA,
      },
    ]);

    setMensaje("");

    setPanelConversaciones(
      false
    );

    localStorage.removeItem(
      "raccoon-chat-seleccionado"
    );

    window.history.replaceState(
      {},
      "",
      `/Chat?chat=${encodeURIComponent(
        id
      )}`
    );

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const abrirChat = (
    chat: ChatReciente
  ) => {
    if (cargando) {
      return;
    }

    try {
      const guardado =
        localStorage.getItem(
          `raccoon-chat-${chat.id}`
        );

      if (guardado) {
        const datos: unknown =
          JSON.parse(guardado);

        setMensajes(
          normalizarMensajes(
            datos
          )
        );
      } else {
        setMensajes([
          {
            ...MENSAJE_BIENVENIDA,
          },
        ]);
      }
    } catch {
      setMensajes([
        {
          ...MENSAJE_BIENVENIDA,
        },
      ]);
    }

    setChatId(chat.id);

    setTituloChat(
      chat.titulo
    );

    localStorage.setItem(
      "raccoon-chat-seleccionado",
      JSON.stringify(chat)
    );

    window.history.replaceState(
      {},
      "",
      `/Chat?chat=${encodeURIComponent(
        chat.id
      )}`
    );

    setPanelConversaciones(
      false
    );
  };

  /* =====================================================
     PREGUNTAR
  ===================================================== */

  const preguntar = async (
    textoSugerido?: string
  ) => {
    const pregunta =
      (
        textoSugerido ??
        mensaje
      ).trim();

    if (
      !pregunta ||
      cargando
    ) {
      return;
    }

    const idConversacion =
      chatId || crearId();

    if (!chatId) {
      setChatId(
        idConversacion
      );
    }

    const cantidadPreguntas =
      mensajes.filter(
        (elemento) =>
          elemento.tipo === "user"
      ).length;

    const esPrimeraPregunta =
      cantidadPreguntas === 0;

    const nuevoTitulo =
      esPrimeraPregunta
        ? pregunta.length > 42
          ? `${pregunta.slice(
              0,
              42
            )}...`
          : pregunta
        : tituloChat;

    if (esPrimeraPregunta) {
      setTituloChat(
        nuevoTitulo
      );
    }

    const mensajeUsuario:
      Mensaje = {
      id: crearId(),
      tipo: "user",
      texto: pregunta,
      fecha:
        new Date().toISOString(),
    };

    const mensajesConUsuario = [
      ...mensajes,
      mensajeUsuario,
    ];

    setMensajes(
      mensajesConUsuario
    );

    localStorage.setItem(
      `raccoon-chat-${idConversacion}`,
      JSON.stringify(
        mensajesConUsuario
      )
    );

    actualizarChatReciente(
      idConversacion,
      nuevoTitulo,
      pregunta
    );

    setMensaje("");
    setCargando(true);

    try {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      const headers:
        Record<string, string> = {
        "Content-Type":
          "application/json",
      };

      if (
        session?.access_token
      ) {
        headers.Authorization =
          `Bearer ${session.access_token}`;
      }

      const respuesta =
        await fetch("/api/chat", {
          method: "POST",
          headers,

          body: JSON.stringify({
            mensaje: pregunta,
          }),
        });

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
          obtenerError(datos)
        );
      }

      if (
        !esObjeto(datos) ||
        typeof datos.respuesta !==
          "string" ||
        !datos.respuesta.trim()
      ) {
        throw new Error(
          "Raccoon IA no devolvió una respuesta válida."
        );
      }

      const mensajeIA:
        Mensaje = {
        id: crearId(),
        tipo: "ia",
        texto:
          datos.respuesta,
        fecha:
          new Date().toISOString(),
      };

      const conversacionFinal = [
        ...mensajesConUsuario,
        mensajeIA,
      ];

      setMensajes(
        conversacionFinal
      );

      localStorage.setItem(
        `raccoon-chat-${idConversacion}`,
        JSON.stringify(
          conversacionFinal
        )
      );

      actualizarChatReciente(
        idConversacion,
        nuevoTitulo,
        mensajeIA.texto
      );
    } catch (error) {
      console.error(
        "Error en el chat:",
        error
      );

      const textoError =
        error instanceof Error
          ? error.message
          : "Error conectando con Raccoon IA.";

      const mensajeError:
        Mensaje = {
        id: crearId(),
        tipo: "ia",
        texto:
          `❌ **No pude responder en este momento.**\n\n${textoError}`,
        fecha:
          new Date().toISOString(),
      };

      const conversacionError = [
        ...mensajesConUsuario,
        mensajeError,
      ];

      setMensajes(
        conversacionError
      );

      localStorage.setItem(
        `raccoon-chat-${idConversacion}`,
        JSON.stringify(
          conversacionError
        )
      );

      actualizarChatReciente(
        idConversacion,
        nuevoTitulo,
        textoError
      );
    } finally {
      setCargando(false);

      window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const manejarTecla = (
    evento: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      evento.key === "Enter" &&
      !evento.shiftKey
    ) {
      evento.preventDefault();

      void preguntar();
    }
  };

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
            }) => (
              <Link
                key={href}
                href={href}
                onClick={() =>
                  setMenuAbierto(false)
                }
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#253650] transition hover:bg-[#F0F8FF] hover:text-[#1687D9] dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Icono size={19} />
                {nombre}
              </Link>
            )
          )}

          <div className="my-3 border-t border-[#E7EDF5] dark:border-slate-700" />

          <div className="flex items-center gap-3 rounded-xl bg-[#EDE9FF] px-4 py-3 text-sm font-black text-[#7652D9] dark:bg-[#302B58] dark:text-[#C4B7FF]">
            <Bot size={19} />
            Raccoon IA
          </div>
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
              relative
              block
              overflow-hidden
              rounded-2xl
              p-4
              text-white
              shadow-lg
              transition
              hover:-translate-y-1
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
                <Crown size={22} />
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
                        planUsuario
                      )}
                </p>
              </div>
            </div>

            <div className="relative mt-3 flex items-center gap-1 text-xs font-bold">
              <Sparkles size={13} />

              {esPremium
                ? "Funciones Premium activas"
                : "Descubrir Premium"}

              <ArrowRight size={13} />
            </div>
          </Link>
        </div>
      </aside>

      {/* CONTENIDO */}

      <div className="flex min-h-screen flex-col lg:ml-[250px]">
        {/* HEADER */}

        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-[#DDEAF7] bg-white/90 px-4 backdrop-blur-xl dark:border-slate-700 dark:bg-[#151F30]/90 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMenuAbierto(true)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#55A8E8] transition hover:bg-[#EFF8FF] lg:hidden dark:hover:bg-slate-800"
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>

            <Link
              href="/Dashboard"
              className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#F1F8FD] text-[#1687D9] transition hover:bg-[#E5F4FF] sm:flex dark:bg-slate-800"
              aria-label="Volver al Dashboard"
            >
              <ArrowLeft size={21} />
            </Link>

            <div className="relative hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#55A8E8] to-[#7652D9] text-white shadow-md sm:flex">
              <Bot size={23} />

              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#26A66B] dark:border-[#151F30]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-black sm:text-xl">
                  {tituloChat}
                </h1>

                <Sparkles
                  size={16}
                  className="shrink-0 text-[#EBA900]"
                />
              </div>

              <p className="text-xs font-semibold text-[#6085A5] dark:text-slate-400">
                Raccoon IA está en línea
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={crearNuevoChat}
              className="hidden items-center gap-2 rounded-xl bg-[#EDE9FF] px-4 py-2.5 text-sm font-black text-[#7652D9] transition hover:bg-[#E3DCFF] sm:flex dark:bg-[#302747] dark:text-[#C5B8FF]"
            >
              <Plus size={18} />
              Nuevo chat
            </button>

            <button
              type="button"
              onClick={() =>
                setPanelConversaciones(
                  true
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#55A8E8] transition hover:bg-[#EFF8FF] xl:hidden dark:hover:bg-slate-800"
              aria-label="Abrir conversaciones"
            >
              <MessagesSquare size={21} />
            </button>

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
              className="hidden h-10 w-10 items-center justify-center rounded-full text-[#55A8E8] transition hover:bg-[#EFF8FF] sm:flex dark:hover:bg-slate-800"
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
                      {nombreUsuario}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#6085A5] dark:text-slate-400">
                      {nombrePlan(
                        planUsuario
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
          <div className="fixed left-1/2 top-5 z-[300] w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl bg-[#55A8E8] px-5 py-3 text-center text-sm font-bold text-white shadow-2xl">
            {notificacion}
          </div>
        )}

        {/* ÁREA PRINCIPAL */}

        <div className="mx-auto flex w-full max-w-[1550px] flex-1 gap-6 p-3 sm:p-5 lg:p-7">
          {/* CHAT */}

          <section className="flex min-h-[calc(100vh-110px)] min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-[#DDEAF7] bg-white shadow-sm dark:border-slate-700 dark:bg-[#151F30]">
            {/* PRESENTACIÓN */}

            <div className="relative overflow-hidden border-b border-[#E7EDF5] bg-gradient-to-r from-[#EFF9FF] via-[#F8F7FF] to-[#F0ECFF] px-5 py-5 dark:border-slate-700 dark:from-[#1C304D] dark:via-[#20263A] dark:to-[#28243E] sm:px-7">
              <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#7652D9]/10" />

              <div className="relative flex items-center justify-between gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#258A5B] shadow-sm dark:bg-slate-800">
                      <span className="h-2 w-2 rounded-full bg-[#26A66B]" />
                      Tutor disponible
                    </span>

                    <span
                      className={`
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-black
                        ${
                          esPremium
                            ? "bg-[#FFF1C9] text-[#A97900] dark:bg-[#4B3D1E] dark:text-yellow-200"
                            : "bg-[#EAF1FF] text-[#1769E0] dark:bg-[#1D3558]"
                        }
                      `}
                    >
                      {esPremium ? (
                        <Crown size={13} />
                      ) : (
                        <User size={13} />
                      )}

                      {nombrePlan(
                        planUsuario
                      )}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-black sm:text-2xl">
                    Estudia junto a Raccoon IA
                  </h2>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-[#6085A5] dark:text-slate-300">
                    Pregunta, practica y recibe explicaciones adaptadas a tu forma de aprender.
                  </p>
                </div>

                <Image
                  src="/raccoon.png"
                  alt="Raccoon IA"
                  width={100}
                  height={100}
                  className="hidden h-[90px] w-[90px] object-contain sm:block"
                />
              </div>
            </div>

            {/* MENSAJES */}

            <div className="flex-1 overflow-y-auto bg-[#F8FBFE] px-3 py-6 dark:bg-[#101827] sm:px-6">
              <div className="mx-auto max-w-4xl space-y-6">
                {mensajes.map(
                  (elemento) => {
                    const esUsuario =
                      elemento.tipo ===
                      "user";

                    const hora =
                      formatearHora(
                        elemento.fecha
                      );

                    return (
                      <div
                        key={elemento.id}
                        className={`
                          flex
                          items-end
                          gap-3
                          ${
                            esUsuario
                              ? "justify-end"
                              : "justify-start"
                          }
                        `}
                      >
                        {!esUsuario && (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#55A8E8] to-[#7652D9] shadow-md">
                            <Image
                              src="/raccoon.png"
                              alt="Raccoon IA"
                              width={38}
                              height={38}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}

                        <div
                          className={`
                            max-w-[88%]
                            rounded-[24px]
                            px-5
                            py-4
                            shadow-sm
                            sm:max-w-[78%]
                            sm:px-6
                            ${
                              esUsuario
                                ? "rounded-br-md bg-gradient-to-r from-[#55A8E8] to-[#7652D9] text-white"
                                : "rounded-bl-md border border-[#E3EBF4] bg-white text-[#263B55] dark:border-slate-700 dark:bg-[#182437] dark:text-slate-100"
                            }
                          `}
                        >
                          <div className="mb-3 flex items-center justify-between gap-5">
                            <div className="flex items-center gap-2 text-xs font-black">
                              {esUsuario ? (
                                <>
                                  <User size={15} />
                                  Tú
                                </>
                              ) : (
                                <>
                                  <Bot
                                    size={15}
                                    className="text-[#7652D9]"
                                  />

                                  <span className="text-[#7652D9] dark:text-[#B9AAFF]">
                                    Raccoon IA
                                  </span>
                                </>
                              )}
                            </div>

                            {hora && (
                              <span
                                className={`
                                  text-[10px]
                                  font-semibold
                                  ${
                                    esUsuario
                                      ? "text-white/70"
                                      : "text-[#8AA4BE]"
                                  }
                                `}
                              >
                                {hora}
                              </span>
                            )}
                          </div>

                          <div
                            className={`
                              max-w-none
                              break-words
                              text-[15px]
                              leading-7

                              [&_a]:font-bold
                              [&_a]:underline

                              [&_blockquote]:my-3
                              [&_blockquote]:border-l-4
                              [&_blockquote]:border-[#55A8E8]
                              [&_blockquote]:pl-4

                              [&_code]:rounded-md
                              [&_code]:bg-slate-100
                              [&_code]:px-1.5
                              [&_code]:py-0.5
                              [&_code]:text-sm
                              [&_code]:text-[#7652D9]

                              [&_h1]:mb-3
                              [&_h1]:mt-4
                              [&_h1]:text-xl
                              [&_h1]:font-black

                              [&_h2]:mb-3
                              [&_h2]:mt-4
                              [&_h2]:text-lg
                              [&_h2]:font-black

                              [&_h3]:mb-2
                              [&_h3]:mt-3
                              [&_h3]:font-black

                              [&_li]:mb-1

                              [&_ol]:my-3
                              [&_ol]:list-decimal
                              [&_ol]:pl-6

                              [&_p]:mb-3
                              [&_p:last-child]:mb-0

                              [&_pre]:my-4
                              [&_pre]:overflow-x-auto
                              [&_pre]:rounded-xl
                              [&_pre]:bg-slate-950
                              [&_pre]:p-4

                              [&_pre_code]:bg-transparent
                              [&_pre_code]:p-0
                              [&_pre_code]:text-slate-100

                              [&_strong]:font-black

                              [&_table]:my-4
                              [&_table]:w-full
                              [&_table]:border-collapse

                              [&_td]:border
                              [&_td]:border-slate-300
                              [&_td]:p-2

                              [&_th]:border
                              [&_th]:border-slate-300
                              [&_th]:bg-slate-100
                              [&_th]:p-2

                              [&_ul]:my-3
                              [&_ul]:list-disc
                              [&_ul]:pl-6

                              ${
                                esUsuario
                                  ? "[&_a]:text-white [&_blockquote]:border-white/70 [&_code]:bg-white/15 [&_code]:text-white"
                                  : "dark:[&_code]:bg-slate-700 dark:[&_th]:bg-slate-700"
                              }
                            `}
                          >
                            <ReactMarkdown
                              remarkPlugins={[
                                remarkGfm,
                              ]}
                            >
                              {elemento.texto}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {esUsuario && (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#DDF3FF] shadow-sm dark:bg-slate-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={fotoPerfil}
                              alt={nombreUsuario}
                              className="h-full w-full object-cover"
                              onError={(evento) => {
                                evento.currentTarget.src =
                                  "/raccoon.png";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  }
                )}

                {/* CARGANDO */}

                {cargando && (
                  <div className="flex items-end gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#55A8E8] to-[#7652D9]">
                      <Image
                        src="/raccoon.png"
                        alt="Raccoon IA"
                        width={38}
                        height={38}
                      />
                    </div>

                    <div className="rounded-[22px] rounded-bl-md border border-[#E3EBF4] bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-[#182437]">
                      <div className="mb-3 flex items-center gap-2 text-xs font-black text-[#7652D9] dark:text-[#B9AAFF]">
                        <Bot size={15} />
                        Raccoon IA está pensando
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#55A8E8] [animation-delay:-0.3s]" />

                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#7652D9] [animation-delay:-0.15s]" />

                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#EBA900]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={finalRef} />
              </div>
            </div>

            {/* INPUT */}

            <div className="border-t border-[#DDEAF7] bg-white p-3 dark:border-slate-700 dark:bg-[#151F30] sm:p-5">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-end gap-3 rounded-[24px] border border-[#D6E4F0] bg-[#F8FBFE] p-2 transition focus-within:border-[#55A8E8] focus-within:ring-4 focus-within:ring-[#55A8E8]/10 dark:border-slate-700 dark:bg-[#182437]">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    maxLength={4000}
                    value={mensaje}
                    onChange={(evento) =>
                      setMensaje(
                        evento.target.value
                      )
                    }
                    onKeyDown={
                      manejarTecla
                    }
                    placeholder="Escribe tu pregunta para Raccoon IA..."
                    className="max-h-40 min-h-[48px] flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-6 outline-none placeholder:text-[#8AA4BE] dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      void preguntar()
                    }
                    disabled={
                      cargando ||
                      !mensaje.trim()
                    }
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] text-white shadow-lg shadow-[#7652D9]/20 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                    aria-label="Enviar mensaje"
                  >
                    {cargando ? (
                      <LoaderCircle
                        size={21}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={21} />
                    )}
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-[#8AA4BE]">
                  <span>
                    Enter para enviar · Shift + Enter para otra línea
                  </span>

                  <span>
                    {mensaje.length}/4000
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* PANEL DERECHO */}

          <aside className="hidden w-[330px] shrink-0 space-y-5 xl:block">
            <PanelDerecho
              chatsRecientes={
                chatsRecientes
              }
              chatActual={chatId}
              planUsuario={
                planUsuario
              }
              esPremium={esPremium}
              onNuevoChat={
                crearNuevoChat
              }
              onAbrirChat={
                abrirChat
              }
              onSugerencia={(
                sugerencia
              ) =>
                void preguntar(
                  sugerencia
                )
              }
            />
          </aside>
        </div>
      </div>

      {/* PANEL MÓVIL */}

      {panelConversaciones && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-slate-950/50 backdrop-blur-sm xl:hidden">
          <button
            type="button"
            onClick={() =>
              setPanelConversaciones(
                false
              )
            }
            className="absolute inset-0"
            aria-label="Cerrar panel"
          />

          <aside className="relative h-full w-[92%] max-w-sm overflow-y-auto bg-[#F5FAFF] p-5 shadow-2xl dark:bg-[#101827]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">
                  Raccoon IA
                </h2>

                <p className="mt-1 text-xs text-[#6085A5]">
                  Conversaciones y sugerencias
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPanelConversaciones(
                    false
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6085A5] shadow-sm dark:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <PanelDerecho
              chatsRecientes={
                chatsRecientes
              }
              chatActual={chatId}
              planUsuario={
                planUsuario
              }
              esPremium={esPremium}
              onNuevoChat={
                crearNuevoChat
              }
              onAbrirChat={
                abrirChat
              }
              onSugerencia={(
                sugerencia
              ) => {
                setPanelConversaciones(
                  false
                );

                void preguntar(
                  sugerencia
                );
              }}
            />
          </aside>
        </div>
      )}

      {/* NUEVO CHAT MÓVIL */}

      <button
        type="button"
        onClick={crearNuevoChat}
        className="fixed bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#55A8E8] to-[#7652D9] text-white shadow-xl sm:hidden"
        aria-label="Nuevo chat"
      >
        <Plus size={23} />
      </button>
    </main>
  );
}

/* =====================================================
   PANEL DERECHO
===================================================== */

function PanelDerecho({
  chatsRecientes,
  chatActual,
  planUsuario,
  esPremium,
  onNuevoChat,
  onAbrirChat,
  onSugerencia,
}: {
  chatsRecientes: ChatReciente[];
  chatActual: string;
  planUsuario: PlanUsuario;
  esPremium: boolean;
  onNuevoChat: () => void;
  onAbrirChat: (
    chat: ChatReciente
  ) => void;
  onSugerencia: (
    sugerencia: string
  ) => void;
}) {
  return (
    <>
      {/* NUEVA CONVERSACIÓN */}

      <section className="rounded-[25px] bg-white p-5 shadow-sm dark:bg-[#182437]">
        <button
          type="button"
          onClick={onNuevoChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] py-3.5 font-black text-white shadow-lg shadow-[#7652D9]/20 transition hover:-translate-y-0.5"
        >
          <Plus size={19} />
          Nueva conversación
        </button>
      </section>

      {/* SUGERENCIAS */}

      <section className="rounded-[25px] bg-white p-5 shadow-sm dark:bg-[#182437]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDE9FF] text-[#7652D9] dark:bg-[#302747]">
            <WandSparkles size={22} />
          </div>

          <div>
            <h2 className="font-black">
              Preguntas rápidas
            </h2>

            <p className="text-xs text-[#6085A5] dark:text-slate-400">
              Comienza con una sugerencia
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {SUGERENCIAS.map(
            (sugerencia) => (
              <button
                key={sugerencia}
                type="button"
                onClick={() =>
                  onSugerencia(
                    sugerencia
                  )
                }
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-[#E5EDF5] px-4 py-3 text-left text-sm font-semibold transition hover:border-[#55A8E8] hover:bg-[#F3FAFF] dark:border-slate-700 dark:hover:bg-slate-700"
              >
                <span>
                  {sugerencia}
                </span>

                <ArrowRight
                  size={15}
                  className="shrink-0 text-[#55A8E8] transition group-hover:translate-x-1"
                />
              </button>
            )
          )}
        </div>
      </section>

      {/* CHATS RECIENTES */}

      <section className="rounded-[25px] bg-white p-5 shadow-sm dark:bg-[#182437]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black">
              Chats recientes
            </h2>

            <p className="mt-1 text-xs text-[#6085A5] dark:text-slate-400">
              Continúa donde quedaste
            </p>
          </div>

          <MessagesSquare
            size={20}
            className="text-[#7652D9]"
          />
        </div>

        {chatsRecientes.length > 0 ? (
          <div className="mt-4 space-y-2">
            {chatsRecientes.map(
              (chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() =>
                    onAbrirChat(
                      chat
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    border
                    p-3
                    text-left
                    transition
                    ${
                      chat.id ===
                      chatActual
                        ? "border-[#7652D9] bg-[#F3EFFF] dark:bg-[#302747]"
                        : "border-[#E7EDF5] hover:border-[#55A8E8] hover:bg-[#F4FAFF] dark:border-slate-700 dark:hover:bg-slate-700"
                    }
                  `}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FF] text-[#7652D9] dark:bg-[#302747]">
                    <MessageCircle size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">
                      {chat.titulo}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#6085A5] dark:text-slate-400">
                      {chat.ultimo_mensaje}
                    </p>
                  </div>

                  <span className="shrink-0 text-[10px] font-semibold text-[#8AA4BE]">
                    {formatearFechaChat(
                      chat.fecha_actualizacion
                    )}
                  </span>
                </button>
              )
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-[#F8FBFD] p-5 text-center dark:bg-slate-800">
            <MessageCircle
              size={30}
              className="mx-auto text-[#8AA4BE]"
            />

            <p className="mt-3 text-sm font-black">
              No hay chats recientes
            </p>

            <p className="mt-1 text-xs leading-5 text-[#6085A5] dark:text-slate-400">
              Tus conversaciones aparecerán aquí después de enviar tu primera pregunta.
            </p>
          </div>
        )}
      </section>

      {/* PLAN */}

      <section
        className={`
          relative
          overflow-hidden
          rounded-[25px]
          p-5
          text-white
          shadow-lg
          ${
            esPremium
              ? "bg-gradient-to-br from-[#F4C24F] via-[#EBA900] to-[#7652D9]"
              : "bg-gradient-to-br from-[#55A8E8] to-[#7652D9]"
          }
        `}
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Crown size={23} />
          </div>

          <div>
            <p className="font-black">
              {esPremium
                ? "Premium activo"
                : "Raccoon gratuito"}
            </p>

            <p className="mt-1 text-xs text-white/80">
              {nombrePlan(
                planUsuario
              )}
            </p>
          </div>
        </div>

        <p className="relative mt-4 text-sm leading-6 text-white/85">
          {esPremium
            ? "Tu cuenta tiene activadas las herramientas Premium de Raccoon Study."
            : "Actualiza tu cuenta para desbloquear todas las herramientas Premium."}
        </p>

        {!esPremium && (
          <Link
            href="/suscripcion"
            className="relative mt-4 flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-black text-[#7652D9]"
          >
            Ver Premium
            <ArrowRight size={16} />
          </Link>
        )}
      </section>
    </>
  );
}