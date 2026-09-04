"use client";

import type { LucideIcon } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Brain,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Cloud,
  CreditCard,
  Crown,
  FileText,
  Headphones,
  Home,
  Infinity,
  Library,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Music2,
  RefreshCcw,
  Shield,
  Sparkles,
  Sun,
  User,
  Users,
  Building2,
  GraduationCap,
  UserPlus,
  Mail,
  X,
  Zap,
} from "lucide-react";

import { supabase } from "../lib/supabase";

declare global {
  interface Window {
    paypal?: {
      createInstance: (options: {
        clientId: string;
        components: string[];
        pageType?: string;
      }) => Promise<{
        findEligibleMethods: (options?: {
          currencyCode?: string;
        }) => Promise<{
          isEligible: (method: string) => boolean;
        }>;
        createPayPalOneTimePaymentSession: (options: {
          onApprove: (data: { orderId: string }) => Promise<unknown>;
          onCancel: () => void;
          onError: (error: unknown) => void;
        }) => Promise<{
          start: (
            options: { presentationMode: string },
            createOrderPromise: Promise<{ orderId: string }>
          ) => Promise<void>;
        }>;
      }>;
    };
  }
}


/* =====================================================
   TIPOS
===================================================== */

type PlanType = "free" | "month" | "year";

interface ElementoMenu {
  nombre: string;
  href: string;
  icono: LucideIcon;
}

interface InformacionPlan {
  id: PlanType;
  nombre: string;
  subtitulo: string;
  precio: string;
  periodo: string;
  descripcion: string;
  insignia?: string;
  icono: LucideIcon;
  caracteristicas: string[];
  estilo: {
    tarjeta: string;
    icono: string;
    boton: string;
    etiqueta: string;
  };
}

interface RespuestaSuscripcion {
  success?: boolean;
  plan?: string;
  subscription?: string;
  status?: string;
  message?: string;
  error?: string;
  checkout_url?: string;
  checkoutUrl?: string;
  redirect_url?: string;
  redirectUrl?: string;
  url?: string;
  session?: {
    url?: string;
  };
}

/* =====================================================
   DATOS
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

const planes: InformacionPlan[] = [
  {
    id: "free",
    nombre: "Gratuito",
    subtitulo: "Para comenzar",
    precio: "$0",
    periodo: "/mes",
    descripcion:
      "Organiza tus materiales y prueba las herramientas principales de Raccoon Study.",
    icono: Shield,
    caracteristicas: [
      "Subida y organización de materiales",
      "Pomodoro gratuito",
      "Resúmenes con uso limitado",
      "Quizzes básicos",
      "Música gratuita de Jamendo",
      "Seguimiento básico del progreso",
    ],
    estilo: {
      tarjeta:
        "border-[#DDEAF7] bg-white dark:border-slate-700 dark:bg-[#182437]",
      icono:
        "bg-[#EAF5FF] text-[#1687D9] dark:bg-[#1D3558]",
      boton:
        "border border-[#CFE6F7] bg-[#F1F8FD] text-[#1687D9] hover:bg-[#E5F4FF] dark:border-slate-600 dark:bg-slate-700 dark:text-blue-300",
      etiqueta:
        "bg-[#EAF5FF] text-[#1687D9] dark:bg-[#1D3558] dark:text-blue-300",
    },
  },
  {
    id: "month",
    nombre: "Premium mensual",
    subtitulo: "Flexibilidad total",
    precio: "$5.99",
    periodo: "/mes",
    descripcion:
      "Accede a todas las herramientas Premium sin comprometerte con un plan anual.",
    insignia: "Más flexible",
    icono: Zap,
    caracteristicas: [
      "Resúmenes sin límites",
      "Lector de resúmenes en voz alta",
      "Playlist Premium de Deezer",
      "Quizzes avanzados",
      "Más almacenamiento de materiales",
      "Acceso a nuevas funciones",
    ],
    estilo: {
      tarjeta:
        "border-[#D9D1FF] bg-gradient-to-br from-[#F8F5FF] via-white to-[#EEF8FF] dark:border-[#51478A] dark:from-[#28243E] dark:via-[#182437] dark:to-[#1C304D]",
      icono:
        "bg-[#E9E2FF] text-[#7652D9] dark:bg-[#3B3156]",
      boton:
        "bg-gradient-to-r from-[#55A8E8] to-[#7771E8] text-white shadow-lg shadow-[#7771E8]/20 hover:-translate-y-0.5",
      etiqueta:
        "bg-[#E9E2FF] text-[#7652D9] dark:bg-[#3B3156] dark:text-purple-200",
    },
    
  },
  {
    id: "year",
    nombre: "Premium anual",
    subtitulo: "La mejor opción",
    precio: "$69.99",
    periodo: "/año",
    descripcion:
      "Disfruta de todas las funciones Premium durante un año completo con un ahorro real frente al plan mensual.",
    insignia: "Recomendado",
    icono: Crown,
    caracteristicas: [
      "Todo lo incluido en Premium mensual",
      "Acceso Premium durante 12 meses",
      "Lector de archivos en voz alta",
      "Música Premium desbloqueada",
      "Herramientas sin límites",
      "Prioridad en nuevas funciones",
    ],
    estilo: {
      tarjeta:
        "border-[#F1C968] bg-gradient-to-br from-[#FFF9E9] via-white to-[#F1EEFF] dark:border-[#A98B3D] dark:from-[#332B1D] dark:via-[#182437] dark:to-[#28243E]",
      icono:
        "bg-[#FFF1C9] text-[#E0A100] dark:bg-[#4B3D1E]",
      boton:
        "bg-gradient-to-r from-[#F2B93B] via-[#EBA900] to-[#7771E8] text-white shadow-lg shadow-[#EBA900]/20 hover:-translate-y-0.5",
      etiqueta:
        "bg-[#FFF1C9] text-[#A97900] dark:bg-[#4B3D1E] dark:text-yellow-200",
    },
  },
];



const planInstitucional = {
  nombre: "Raccoon Instituciones",
  subtitulo: "Para colegios y universidades",
  precio: "Desde $1.99",
  periodo: "/estudiante/mes",
  detalle: "Planes desde 50 estudiantes",
  descripcion:
    "Una solución para colegios, universidades, programas educativos y organizaciones que necesitan gestionar estudiantes y revisar su progreso.",
  caracteristicas: [
    "Todo Raccoon Premium para estudiantes",
    "Panel administrativo institucional",
    "Gestión de estudiantes y grupos",
    "Seguimiento de horas de estudio semanales",
    "Resultados de quizzes y actividades",
    "Reportes de progreso",
    "Soporte prioritario",
    "Precios especiales por volumen",
  ],
};

/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */

function esObjeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
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
    texto === "premium_month" ||
    texto === "premium_mensual" ||
    texto === "premium"
  ) {
    return "month";
  }

  return premium ? "month" : "free";
}

function obtenerUrlPago(
  respuesta: RespuestaSuscripcion
): string | null {
  const url =
    respuesta.checkout_url ||
    respuesta.checkoutUrl ||
    respuesta.redirect_url ||
    respuesta.redirectUrl ||
    respuesta.url ||
    respuesta.session?.url;

  return typeof url === "string" && url.trim()
    ? url
    : null;
}

function obtenerMensajeError(
  valor: unknown
): string {
  if (!esObjeto(valor)) {
    return "No se pudo procesar la solicitud.";
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

  return "No se pudo procesar la solicitud.";
}

function nombrePlan(plan: PlanType): string {
  if (plan === "month") {
    return "Premium mensual";
  }

  if (plan === "year") {
    return "Premium anual";
  }

  return "Gratuito";
}

/* =====================================================
   COMPONENTE
===================================================== */

export default function SuscripcionPage() {
  const router = useRouter();

  /* USUARIO */

  const [nombreUsuario, setNombreUsuario] =
    useState("Usuario");

  const [correoUsuario, setCorreoUsuario] =
    useState("");

  const [fotoPerfil, setFotoPerfil] =
    useState("/raccoon.png");

  /* PLAN */

  const [planActual, setPlanActual] =
    useState<PlanType>("free");

  const [cargandoPlan, setCargandoPlan] =
    useState(true);

  const [
    planProcesando,
    setPlanProcesando,
  ] = useState<PlanType | null>(null);


  const paypalIniciandoRef = useRef(false);

  const paypalClientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const paypalMode =
    process.env.NEXT_PUBLIC_PAYPAL_MODE ??
    process.env.PAYPAL_MODE ??
    "sandbox";

  const paypalScript =
    paypalMode === "live"
      ? "https://www.paypal.com/web-sdk/v6/core"
      : "https://www.sandbox.paypal.com/web-sdk/v6/core";

  const [
    mostrarConfirmacionGratis,
    setMostrarConfirmacionGratis,
  ] = useState(false);

  const [
    mostrarPlanInstitucion,
    setMostrarPlanInstitucion,
  ] = useState(false);

  const [
    institucion,
    setInstitucion,
  ] = useState("");

  const [
    responsable,
    setResponsable,
  ] = useState("");

  const [
    correoInstitucional,
    setCorreoInstitucional,
  ] = useState("");

  const [
    cantidadEstudiantes,
    setCantidadEstudiantes,
  ] = useState("50");

  /* DISEÑO */

  const [menuAbierto, setMenuAbierto] =
    useState(false);

  const [perfilAbierto, setPerfilAbierto] =
    useState(false);

  const [modoOscuro, setModoOscuro] =
    useState(false);

  const [notificacion, setNotificacion] =
    useState("");

  const whatsappNumero =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

  const abrirWhatsAppRaccoon = () => {
    const numero =
      whatsappNumero.replace(/\D/g, "");

    if (!numero) {
      mostrarNotificacion(
        "Falta configurar NEXT_PUBLIC_WHATSAPP_NUMBER."
      );
      return;
    }

    const mensaje = encodeURIComponent(
      "Hola Raccoon Study 👋 Tengo una duda sobre los planes y suscripciones."
    );

    window.open(
      `https://wa.me/${numero}?text=${mensaje}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const esPremium =
    planActual === "month" ||
    planActual === "year";

  /* =====================================================
     INICIAR
  ===================================================== */

  useEffect(() => {
    const iniciar = async () => {
      inicializarTema();

      await cargarUsuarioYPlan();

      procesarRetornoPago();
    };

    void iniciar();
  }, []);

  /* =====================================================
     TEMA
  ===================================================== */

  const inicializarTema = () => {
    const temaGuardado =
      localStorage.getItem("raccoon-theme");

    const sistemaOscuro =
      window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches ?? false;

    const oscuro =
      temaGuardado === "dark" ||
      (!temaGuardado && sistemaOscuro);

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
    }, 4500);
  };

  /* =====================================================
     CARGAR USUARIO Y PLAN
  ===================================================== */

  const cargarUsuarioYPlan = async () => {
    try {
      setCargandoPlan(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!user || !session) {
        router.replace("/Login");
        return;
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

      setCorreoUsuario(user.email || "");

      if (metadata.avatar_url) {
        setFotoPerfil(metadata.avatar_url);
      }

      const premiumMetadata =
        metadata.premium === true ||
        metadata.is_premium === true ||
        metadata.es_premium === true;

      const planMetadata = normalizarPlan(
        metadata.plan ||
          metadata.subscription ||
          metadata.tipo_plan ||
          metadata.subscription_plan,
        premiumMetadata
      );

      setPlanActual(planMetadata);

      /*
        También intenta obtener el plan desde el servidor.

        Si tu ruta solamente acepta POST, responderá 405
        y simplemente se conservará el plan del metadata.
      */

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

            const planServidor =
              normalizarPlan(
                datos.plan ||
                  datos.subscription ||
                  datos.tipo_plan,
                premiumServidor
              );

            setPlanActual(planServidor);
          }
        }
      } catch {
        /*
          El metadata continúa siendo el respaldo.
        */
      }
    } catch (error) {
      console.error(
        "Error cargando suscripción:",
        error
      );

      mostrarNotificacion(
        "No se pudo cargar el estado de tu suscripción."
      );
    } finally {
      setCargandoPlan(false);
    }
  };

  /* =====================================================
     RETORNO DEL PAGO
  ===================================================== */

  const procesarRetornoPago = () => {
    const parametros =
      new URLSearchParams(
        window.location.search
      );

    const estado =
      parametros.get("status") ||
      parametros.get("payment") ||
      parametros.get("suscripcion");

    if (
      estado === "success" ||
      estado === "exitoso" ||
      estado === "completed"
    ) {
      mostrarNotificacion(
        "Tu suscripción se procesó correctamente."
      );

      window.setTimeout(() => {
        void refrescarPlan();
      }, 800);

      router.replace("/suscripcion");
      return;
    }

    if (
      estado === "cancelled" ||
      estado === "canceled" ||
      estado === "cancelado"
    ) {
      mostrarNotificacion(
        "El proceso de pago fue cancelado."
      );

      router.replace("/suscripcion");
    }
  };

  /* =====================================================
     REFRESCAR PLAN
  ===================================================== */

  const refrescarPlan = async () => {
    try {
      setCargandoPlan(true);

      await supabase.auth.refreshSession();

      await cargarUsuarioYPlan();

      router.refresh();
    } catch (error) {
      console.error(error);

      mostrarNotificacion(
        "No se pudo actualizar el estado del plan."
      );
    } finally {
      setCargandoPlan(false);
    }
  };

  /* =====================================================
     CAMBIAR PLAN / PAYPAL
  ===================================================== */

  const solicitarCambioGratis = async () => {
    if (planProcesando) {
      return;
    }

    try {
      setPlanProcesando("free");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/Login");
        return;
      }

      const respuesta = await fetch(
        "/api/suscripciones",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            plan: "free",
          }),
        }
      );

      const datos: unknown =
        await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeError(datos)
        );
      }

      setPlanActual("free");
      setMostrarConfirmacionGratis(false);

      await supabase.auth.refreshSession();

      mostrarNotificacion(
        "Ahora estás en el plan gratuito."
      );

      window.setTimeout(() => {
        void cargarUsuarioYPlan();
      }, 500);
    } catch (error) {
      console.error(
        "Error cambiando a gratuito:",
        error
      );

      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar al plan gratuito."
      );
    } finally {
      setPlanProcesando(null);
    }
  };

  const iniciarPagoPayPal = async (
    planDestino: "month" | "year"
  ) => {
    if (
      paypalIniciandoRef.current ||
      planProcesando ||
      planDestino === planActual
    ) {
      return;
    }

    try {
      paypalIniciandoRef.current = true;
      setPlanProcesando(planDestino);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/Login");
        return;
      }

      if (
        !paypalClientId ||
        paypalClientId ===
          "TU_PAYPAL_CLIENT_ID"
      ) {
        throw new Error(
          "Falta NEXT_PUBLIC_PAYPAL_CLIENT_ID."
        );
      }

      if (!window.paypal) {
        throw new Error(
          "PayPal todavía se está cargando. Inténtalo nuevamente en unos segundos."
        );
      }

      const sdkInstance =
        await window.paypal.createInstance({
          clientId: paypalClientId,
          components: [
            "paypal-payments",
          ],
          pageType: "checkout",
        });

      const elegibilidad =
        await sdkInstance.findEligibleMethods({
          currencyCode: "USD",
        });

      if (
        !elegibilidad.isEligible(
          "paypal"
        )
      ) {
        throw new Error(
          "PayPal no está disponible para esta sesión."
        );
      }

      const paymentSession =
        await sdkInstance.createPayPalOneTimePaymentSession(
          {
            onApprove: async ({
              orderId,
            }) => {
              try {
                setPlanProcesando(
                  planDestino
                );

                const respuestaCaptura =
                  await fetch(
                    "/api/paypal/capture-order",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type":
                          "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({
                        orderId,
                        plan: planDestino,
                      }),
                    }
                  );

                const datosCaptura: unknown =
                  await respuestaCaptura.json();

                if (
                  !respuestaCaptura.ok
                ) {
                  throw new Error(
                    obtenerMensajeError(
                      datosCaptura
                    )
                  );
                }

                setPlanActual(
                  planDestino
                );

                await supabase.auth.refreshSession();

                mostrarNotificacion(
                  planDestino ===
                    "year"
                    ? "¡Pago completado! Premium anual está activo."
                    : "¡Pago completado! Premium mensual está activo."
                );

                await cargarUsuarioYPlan();
                router.refresh();

                return datosCaptura;
              } catch (error) {
                console.error(
                  "Error capturando PayPal:",
                  error
                );

                mostrarNotificacion(
                  error instanceof Error
                    ? error.message
                    : "El pago no pudo confirmarse."
                );

                throw error;
              } finally {
                setPlanProcesando(
                  null
                );
                paypalIniciandoRef.current =
                  false;
              }
            },

            onCancel: () => {
              setPlanProcesando(null);
              paypalIniciandoRef.current =
                false;

              mostrarNotificacion(
                "Pago cancelado. No se realizó ningún cargo."
              );
            },

            onError: (error) => {
              console.error(
                "PayPal error:",
                error
              );

              setPlanProcesando(null);
              paypalIniciandoRef.current =
                false;

              mostrarNotificacion(
                "Ocurrió un error con PayPal. Inténtalo nuevamente."
              );
            },
          }
        );

      const createOrderPromise =
        fetch(
          "/api/paypal/create-order",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              plan: planDestino,
            }),
          }
        ).then(async (respuesta) => {
          const datos: unknown =
            await respuesta.json();

          if (
            !respuesta.ok ||
            !esObjeto(datos) ||
            typeof datos.id !==
              "string"
          ) {
            throw new Error(
              obtenerMensajeError(
                datos
              )
            );
          }

          return {
            orderId: datos.id,
          };
        });

      await paymentSession.start(
        {
          presentationMode: "auto",
        },
        createOrderPromise
      );
    } catch (error) {
      console.error(
        "Error iniciando PayPal:",
        error
      );

      setPlanProcesando(null);
      paypalIniciandoRef.current =
        false;

      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar PayPal."
      );
    }
  };

  /* =====================================================
     BOTÓN DE PLAN
  ===================================================== */

  const textoBotonPlan = (
    plan: PlanType
  ): string => {
    if (planProcesando === plan) {
      return "Procesando...";
    }

    if (plan === planActual) {
      return "Tu plan actual";
    }

    if (plan === "free") {
      return "Cambiar a gratuito";
    }

    if (plan === "month") {
      return esPremium
        ? "Cambiar a mensual"
        : "Elegir Premium mensual";
    }

    return esPremium
      ? "Cambiar a anual"
      : "Elegir Premium anual";
  };

  const activarPremiumMensualDirecto = async () => {
    if (planProcesando) {
      return;
    }

    try {
      setPlanProcesando("month");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/Login");
        return;
      }

      const respuesta = await fetch(
        "/api/suscripciones",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            plan: "month",
          }),
        }
      );

      const datos: unknown =
        await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeError(datos)
        );
      }

      setPlanActual("month");

      await supabase.auth.refreshSession();

      mostrarNotificacion(
        "¡Premium mensual activado!"
      );

      await cargarUsuarioYPlan();
      router.refresh();
    } catch (error) {
      console.error(
        "Error activando Premium mensual:",
        error
      );

      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudo activar Premium mensual."
      );
    } finally {
      setPlanProcesando(null);
    }
  };

  const seleccionarPlan = (
    plan: PlanType
  ) => {
    if (plan === planActual) {
      return;
    }

    if (plan === "free") {
      if (esPremium) {
        setMostrarConfirmacionGratis(true);
        return;
      }

      void solicitarCambioGratis();
      return;
    }

    if (plan === "month") {
      void activarPremiumMensualDirecto();
      return;
    }

    // Solo Premium anual utiliza PayPal.
    void iniciarPagoPayPal("year");
  };


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
    <main className="min-h-screen bg-[#F5FAFF] text-[#10233F] transition-colors duration-500 dark:bg-[#101827] dark:text-white">
      <Script
        src={paypalScript}
        strategy="afterInteractive"
        onError={() =>
          mostrarNotificacion(
            "No se pudo cargar PayPal."
          )
        }
      />

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
            }) => (
              <Link
                key={href}
                href={href}
                onClick={() =>
                  setMenuAbierto(false)
                }
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-[#253650]
                  transition
                  hover:bg-[#F0F8FF]
                  hover:text-[#1687D9]
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
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
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              text-[#253650]
              transition
              hover:bg-[#F0F8FF]
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
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
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              text-red-500
              transition
              hover:bg-red-50
              dark:hover:bg-red-950/30
            "
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>

          <div
            className={`
              relative
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
                  <BadgeCheck size={23} />
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
                  {esPremium
                    ? nombrePlan(planActual)
                    : "Desbloquea más funciones"}
                </p>
              </div>
            </div>

            <div className="relative mt-3 flex items-center gap-1 text-xs font-bold">
              <Sparkles size={13} />

              {esPremium
                ? "Tu cuenta es Premium"
                : "Estás en el plan gratuito"}
            </div>
          </div>
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
                <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <div className="border-b border-[#E7EDF5] px-3 py-3 dark:border-slate-700">
                    <p className="truncate text-sm font-black">
                      {nombreUsuario}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#6085A5] dark:text-slate-400">
                      {correoUsuario}
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
          <div className="fixed left-1/2 top-5 z-[300] w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl bg-[#4169A1] px-5 py-3 text-center text-sm font-bold text-white shadow-2xl">
            {notificacion}
          </div>
        )}

        <div className="mx-auto max-w-[1500px] px-4 py-6 pb-28 sm:px-6 lg:px-8">
          {/* HERO */}

          <section
            className={`
              relative
              overflow-hidden
              rounded-[30px]
              p-6
              shadow-sm
              sm:p-8
              ${
                esPremium
                  ? "bg-gradient-to-br from-[#FFF6D8] via-[#F7F3FF] to-[#EAF7FF] dark:from-[#332B1D] dark:via-[#28243E] dark:to-[#1C304D]"
                  : "bg-gradient-to-br from-[#EAF8FF] via-white to-[#F0ECFF] dark:from-[#1D3558] dark:via-[#182437] dark:to-[#28243E]"
              }
            `}
          >
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#7771E8]/10" />

            <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="max-w-2xl">
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
                        ? "bg-[#FFF1C9] text-[#A97900] dark:bg-[#4B3D1E] dark:text-yellow-200"
                        : "bg-[#DDF3FF] text-[#1687D9] dark:bg-[#1D3558] dark:text-blue-300"
                    }
                  `}
                >
                  {esPremium ? (
                    <BadgeCheck size={17} />
                  ) : (
                    <Shield size={17} />
                  )}

                  {cargandoPlan
                    ? "Comprobando tu plan..."
                    : esPremium
                    ? "Tu cuenta es Premium"
                    : "Estás usando Raccoon gratis"}
                </span>

                <h1 className="mt-5 text-4xl font-black sm:text-5xl">
                  Elige el plan ideal para ti
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-[#6085A5] dark:text-slate-300">
                  Estudia con resúmenes, quizzes,
                  música y herramientas diseñadas
                  para ayudarte a aprender mejor.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-white/80 px-4 py-3 text-sm font-bold shadow-sm dark:bg-slate-800">
                    <FileText
                      size={18}
                      className="text-[#7652D9]"
                    />
                    Resúmenes inteligentes
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-white/80 px-4 py-3 text-sm font-bold shadow-sm dark:bg-slate-800">
                    <Music2
                      size={18}
                      className="text-[#55A8E8]"
                    />
                    Música para estudiar
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-white/80 px-4 py-3 text-sm font-bold shadow-sm dark:bg-slate-800">
                    <ClipboardCheck
                      size={18}
                      className="text-[#26A66B]"
                    />
                    Quizzes automáticos
                  </div>
                </div>
              </div>

              <div className="relative w-full max-w-[330px]">
                <Image
                  src="/raccoon.png"
                  alt="Raccoon Premium"
                  width={260}
                  height={260}
                  className="mx-auto object-contain drop-shadow-xl"
                />

                <div className="rounded-[22px] border border-white/70 bg-white/85 p-5 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-[#182437]/90">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#6085A5]">
                        Tu plan actual
                      </p>

                      <p className="mt-1 text-xl font-black">
                        {cargandoPlan
                          ? "Cargando..."
                          : nombrePlan(
                              planActual
                            )}
                      </p>
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
                            ? "bg-[#FFF1C9] text-[#E0A100]"
                            : "bg-[#DDF3FF] text-[#1687D9]"
                        }
                      `}
                    >
                      {esPremium ? (
                        <Crown size={25} />
                      ) : (
                        <Shield size={25} />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      void refrescarPlan()
                    }
                    disabled={cargandoPlan}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F1F8FD] py-3 text-sm font-bold text-[#1687D9] transition hover:bg-[#E5F4FF] disabled:opacity-60 dark:bg-slate-700 dark:text-blue-300"
                  >
                    <RefreshCcw
                      size={16}
                      className={
                        cargandoPlan
                          ? "animate-spin"
                          : ""
                      }
                    />

                    Actualizar estado
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ESTADO PREMIUM */}

          <section className="mt-6 rounded-[25px] bg-white p-5 shadow-sm dark:bg-[#182437] sm:p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div
                  className={`
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    ${
                      esPremium
                        ? "bg-[#FFF1C9] text-[#E0A100]"
                        : "bg-[#EAF5FF] text-[#1687D9]"
                    }
                  `}
                >
                  {esPremium ? (
                    <BadgeCheck size={28} />
                  ) : (
                    <LockKeyhole size={27} />
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    {esPremium
                      ? "Premium está activo"
                      : "Actualmente tienes el plan gratuito"}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#6085A5] dark:text-slate-400">
                    {esPremium
                      ? `Tienes acceso a las funciones de ${nombrePlan(
                          planActual
                        )}.`
                      : "Puedes actualizar tu cuenta para desbloquear todas las herramientas."}
                  </p>
                </div>
              </div>

              <div
                className={`
                  flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-2
                  text-sm
                  font-black
                  ${
                    esPremium
                      ? "bg-[#DDF7EA] text-[#258A5B]"
                      : "bg-[#EAF1FF] text-[#1769E0]"
                  }
                `}
              >
                <span
                  className={`
                    h-2.5
                    w-2.5
                    rounded-full
                    ${
                      esPremium
                        ? "bg-[#26A66B]"
                        : "bg-[#55A8E8]"
                    }
                  `}
                />

                {esPremium
                  ? "Cuenta Premium"
                  : "Cuenta gratuita"}
              </div>
            </div>
          </section>

          {/* TRES PLANES */}

          <section
            id="planes"
            className="mt-8"
          >
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E9E2FF] px-4 py-2 text-sm font-bold text-[#7652D9] dark:bg-[#302747] dark:text-purple-200">
                <CreditCard size={16} />
                Planes disponibles
              </span>

              <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                Planes individuales
              </h2>

              <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#6085A5] dark:text-slate-400">
                Elige entre la versión gratuita o Premium según tu forma de estudiar.
              </p>
            </div>

            <div className="grid items-stretch gap-6 lg:grid-cols-3">
              {planes.map((plan) => {
                const Icono =
                  plan.icono;

                const esActual =
                  planActual === plan.id;

                const procesando =
                  planProcesando === plan.id;

                return (
                  <article
                    key={plan.id}
                    className={`
                      relative
                      flex
                      min-h-full
                      flex-col
                      overflow-hidden
                      rounded-[28px]
                      border-2
                      p-6
                      shadow-sm
                      transition
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-xl
                      sm:p-7
                      ${plan.estilo.tarjeta}
                      ${
                        esActual
                          ? "ring-4 ring-[#55A8E8]/20"
                          : ""
                      }
                    `}
                  >
                    <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/30 dark:bg-white/5" />

                    <div className="relative flex items-start justify-between gap-3">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${plan.estilo.icono}`}
                      >
                        <Icono size={28} />
                      </div>

                      {esActual ? (
                        <span className="flex items-center gap-1 rounded-full bg-[#DDF7EA] px-3 py-1.5 text-xs font-black text-[#258A5B]">
                          <CheckCircle2
                            size={14}
                          />
                          Plan actual
                        </span>
                      ) : plan.insignia ? (
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-black ${plan.estilo.etiqueta}`}
                        >
                          {plan.insignia}
                        </span>
                      ) : null}
                    </div>

                    <div className="relative mt-6">
                      <p className="text-sm font-bold text-[#6085A5] dark:text-slate-400">
                        {plan.subtitulo}
                      </p>

                      <h3 className="mt-1 text-2xl font-black">
                        {plan.nombre}
                      </h3>
                    </div>

                    <div className="relative mt-6 flex items-end gap-2">
                      <span className="text-5xl font-black sm:text-6xl">
                        {plan.precio}
                      </span>

                      <span className="mb-2 text-sm font-semibold text-[#6085A5] dark:text-slate-400">
                        {plan.periodo}
                      </span>
                    </div>

                    {plan.id === "year" && (
                      <div className="relative mt-3 w-fit rounded-full bg-[#DDF7EA] px-3 py-1.5 text-xs font-black text-[#258A5B]">
                        Mejor valor anual
                      </div>
                    )}

                    <p className="relative mt-5 min-h-[72px] text-sm leading-6 text-[#6085A5] dark:text-slate-300">
                      {plan.descripcion}
                    </p>

                    <button
                      onClick={() =>
                        seleccionarPlan(
                          plan.id
                        )
                      }
                      disabled={
                        esActual ||
                        Boolean(
                          planProcesando
                        ) ||
                        cargandoPlan
                      }
                      className={`
                        relative
                        mt-7
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        px-4
                        py-4
                        font-black
                        transition
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        ${plan.estilo.boton}
                      `}
                    >
                      {procesando ? (
                        <LoaderCircle
                          size={19}
                          className="animate-spin"
                        />
                      ) : esActual ? (
                        <CheckCircle2
                          size={19}
                        />
                      ) : plan.id ===
                        "free" ? (
                        <Shield size={19} />
                      ) : (
                        <Crown size={19} />
                      )}

                      {textoBotonPlan(
                        plan.id
                      )}
                    </button>

                    <div className="relative mt-7 border-t border-[#E4EBF3] pt-6 dark:border-slate-700">
                      <p className="text-sm font-black">
                        Incluye:
                      </p>

                      <div className="mt-4 space-y-3.5">
                        {plan.caracteristicas.map(
                          (
                            caracteristica
                          ) => (
                            <div
                              key={
                                caracteristica
                              }
                              className="flex items-start gap-3"
                            >
                              <div
                                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${plan.estilo.icono}`}
                              >
                                <CheckCircle2
                                  size={14}
                                />
                              </div>

                              <span className="text-sm leading-6 text-[#506C88] dark:text-slate-300">
                                {
                                  caracteristica
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {plan.id === "year" && (
                      <div className="relative mt-auto pt-7">
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-white/60 px-3 py-2 text-xs font-bold text-[#6085A5] dark:bg-slate-800/70 dark:text-slate-300">
                          <LockKeyhole
                            size={14}
                          />
                          Pago disponible actualmente mediante PayPal
                        </div>
                      </div>
                    )}
                    {plan.id === "year" && (
                    <div className="relative mt-6 border-t border-[#DDEAF7] pt-6 dark:border-slate-700">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6085A5] dark:text-slate-400">
                    Métodos de pago
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-[#DDEAF7] bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800">
                      <span className="text-[16px] font-black italic">
                        <span className="text-[#003087] dark:text-[#7DB8FF]">Pay</span><span className="text-[#009CDE]">Pal</span>
                      </span>
                      <span className="rounded-full bg-[#DDF7EA] px-2 py-0.5 text-[9px] font-black uppercase text-[#258A5B] dark:bg-[#1E3A32] dark:text-emerald-200">
                        Disponible
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-[#E4EBF3] bg-[#F8FAFC] px-3 py-2 opacity-70 dark:border-slate-700 dark:bg-slate-900/40">
                      <span className="text-[14px] font-black italic text-[#1434CB] dark:text-[#8FA7FF]">VISA</span>
                      <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-300">Próximamente</span>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-[#E4EBF3] bg-[#F8FAFC] px-3 py-2 opacity-70 dark:border-slate-700 dark:bg-slate-900/40">
                      <span className="flex items-center"><span className="h-4 w-4 rounded-full bg-[#EB001B]" /><span className="-ml-1.5 h-4 w-4 rounded-full bg-[#F79E1B]" /></span>
                      <span className="text-[10px] font-black">Mastercard</span>
                      <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-300">Próximamente</span>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-[#E4EBF3] bg-[#F8FAFC] px-3 py-2 opacity-70 dark:border-slate-700 dark:bg-slate-900/40">
                      <span className="text-[13px] font-black text-[#6F2C91] dark:text-[#C79AE1]">Yappy</span>
                      <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-300">Próximamente</span>
                    </div>
                  </div>
                </div>
                  )}

              </article>
                );
              })}
            </div>
          </section>


          {/* PLAN INSTITUCIONAL */}

          <section className="mt-10">
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F8F2] px-4 py-2 text-sm font-bold text-[#258A5B] dark:bg-[#1E3A32] dark:text-emerald-200">
                <Users size={16} />
                Planes para instituciones
              </span>

              <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                Raccoon para instituciones
              </h2>

              <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#6085A5] dark:text-slate-400">
                Una opción pensada para colegios, universidades y programas educativos.
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-6">
              <article className="relative overflow-hidden rounded-[30px] border-2 border-[#C8B9FF] bg-gradient-to-br from-[#F7F2FF] via-white to-[#EEFAF5] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-[#5B4B8A] dark:from-[#2B2442] dark:via-[#182437] dark:to-[#17352C] sm:p-8">
                <div className="absolute -right-20 -top-16 h-56 w-56 rounded-full bg-[#7652D9]/10" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9E2FF] text-[#7652D9] dark:bg-[#3B3156]">
                    <Building2 size={31} />
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      🚧 EN DESARROLLO
                    </span>
                    <span className="rounded-full bg-[#E9E2FF] px-3 py-1.5 text-xs font-black text-[#7652D9] dark:bg-[#3B3156] dark:text-purple-200">
                      B2B · Educación
                    </span>
                  </div>
                </div>

                <div className="relative mt-6">
                  <p className="text-sm font-bold text-[#6085A5] dark:text-slate-400">
                    {planInstitucional.subtitulo}
                  </p>

                  <h3 className="mt-1 text-3xl font-black">
                    {planInstitucional.nombre}
                  </h3>
                </div>

                <div className="relative mt-6 flex flex-wrap items-end gap-2">
                  <span className="text-4xl font-black sm:text-5xl">
                    {planInstitucional.precio}
                  </span>

                  <span className="mb-2 text-sm font-semibold text-[#6085A5] dark:text-slate-400">
                    {planInstitucional.periodo}
                  </span>
                </div>

                <div className="relative mt-3 w-fit rounded-full bg-[#FFF1C9] px-3 py-1.5 text-xs font-black text-[#A97900]">
                  {planInstitucional.detalle}
                </div>

                <p className="relative mt-5 text-sm leading-6 text-[#6085A5] dark:text-slate-300">
                  {planInstitucional.descripcion}
                </p>

                <button
                  type="button"
                  disabled
                  className="relative mt-7 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 font-black text-amber-700 opacity-90 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                >
                  <LoaderCircle size={19} />
                  En desarrollo · Próximamente
                </button>

                <div className="relative mt-7 border-t border-[#E8E1F8] pt-6 dark:border-slate-700">
                  <p className="text-sm font-black">
                    Incluye:
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {planInstitucional.caracteristicas.map(
                      (caracteristica) => (
                        <div
                          key={caracteristica}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E9E2FF] text-[#7652D9] dark:bg-[#3B3156]">
                            <CheckCircle2 size={14} />
                          </div>

                          <span className="text-sm leading-6 text-[#506C88] dark:text-slate-300">
                            {caracteristica}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* BENEFICIOS PREMIUM */}

          <section className="mt-8 rounded-[30px] bg-gradient-to-r from-[#EAF8FF] via-[#F7F4FF] to-[#FFF8E8] p-6 dark:from-[#1D3558] dark:via-[#28243E] dark:to-[#332B1D] sm:p-8">
            <div className="text-center">
              <h2 className="text-2xl font-black sm:text-3xl">
                Todo lo que obtienes con Premium
              </h2>

              <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#6085A5] dark:text-slate-300">
                Herramientas adicionales para estudiar
                con menos distracciones y aprovechar
                mejor tus materiales.
              </p>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <BeneficioPremium
                icono={FileText}
                titulo="Resúmenes"
                descripcion="Guías elaboradas desde tus archivos."
                color="bg-[#E9E2FF] text-[#7652D9]"
              />

              <BeneficioPremium
                icono={Headphones}
                titulo="Lector de voz"
                descripcion="Escucha tus resúmenes dentro de la app."
                color="bg-[#DDF3FF] text-[#1687D9]"
              />

              <BeneficioPremium
                icono={Music2}
                titulo="Música Premium"
                descripcion="Acceso a la playlist exclusiva de Deezer."
                color="bg-[#FFF1C9] text-[#E0A100]"
              />

              <BeneficioPremium
                icono={Infinity}
                titulo="Menos límites"
                descripcion="Utiliza más herramientas y materiales."
                color="bg-[#DDF7EA] text-[#26A66B]"
              />
            </div>
          </section>

          {/* AYUDA */}

          <section className="mt-8 flex flex-col items-center justify-between gap-5 rounded-[25px] bg-white p-6 shadow-sm dark:bg-[#182437] md:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#DDF3FF] p-3 text-[#1687D9]">
                <MessageCircle size={25} />
              </div>

              <div>
                <h2 className="text-lg font-black">
                  ¿Tienes dudas sobre los planes?
                </h2>

                <p className="mt-1 text-sm text-[#6085A5] dark:text-slate-400">
                  Raccoon puede ayudarte a elegir el plan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={abrirWhatsAppRaccoon}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EAF1FF] px-5 py-3 font-bold text-[#1769E0] transition hover:bg-[#DDF3FF] dark:bg-[#1D3558] dark:text-blue-300 md:w-auto"
            >
              <MessageCircle size={18} />
              Hablar con Raccoon por WhatsApp
              <ArrowRight size={17} />
            </button>
          </section>
        </div>
      </div>


      {/* MODAL PLAN GRUPAL */}


      {/* MODAL INSTITUCIONES */}

      {mostrarPlanInstitucion && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-7 shadow-2xl dark:bg-[#182437]">
            <button
              type="button"
              onClick={() =>
                setMostrarPlanInstitucion(false)
              }
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5FA] text-[#6085A5] dark:bg-slate-700"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9E2FF] text-[#7652D9] dark:bg-[#3B3156]">
              <Building2 size={31} />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              Solicitar plan institucional
            </h2>

            <p className="mt-2 leading-7 text-[#6085A5] dark:text-slate-300">
              Cuéntanos sobre tu institución. El precio se ajusta
              según la cantidad de estudiantes y comienza desde
              $1.99 por estudiante al mes.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-black">
                  Nombre de la institución
                </label>
                <input
                  value={institucion}
                  onChange={(evento) =>
                    setInstitucion(evento.target.value)
                  }
                  placeholder="Colegio, universidad o programa"
                  className="mt-2 w-full rounded-xl border border-[#DDEAF7] bg-[#F8FBFE] px-4 py-3.5 outline-none transition focus:border-[#7652D9] dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-sm font-black">
                  Responsable
                </label>
                <input
                  value={responsable}
                  onChange={(evento) =>
                    setResponsable(evento.target.value)
                  }
                  placeholder="Nombre y apellido"
                  className="mt-2 w-full rounded-xl border border-[#DDEAF7] bg-[#F8FBFE] px-4 py-3.5 outline-none transition focus:border-[#7652D9] dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-sm font-black">
                  Correo institucional
                </label>
                <input
                  type="email"
                  value={correoInstitucional}
                  onChange={(evento) =>
                    setCorreoInstitucional(evento.target.value)
                  }
                  placeholder="correo@institucion.edu"
                  className="mt-2 w-full rounded-xl border border-[#DDEAF7] bg-[#F8FBFE] px-4 py-3.5 outline-none transition focus:border-[#7652D9] dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-sm font-black">
                  Cantidad de estudiantes
                </label>
                <select
                  value={cantidadEstudiantes}
                  onChange={(evento) =>
                    setCantidadEstudiantes(evento.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#DDEAF7] bg-[#F8FBFE] px-4 py-3.5 outline-none transition focus:border-[#7652D9] dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="50">50 - 99</option>
                  <option value="100">100 - 199</option>
                  <option value="200">200 - 499</option>
                  <option value="500">500 - 999</option>
                  <option value="1000">1,000+</option>
                </select>
              </div>

              <div className="rounded-xl bg-[#F7F2FF] p-4 dark:bg-[#302747]">
                <p className="text-xs font-bold uppercase tracking-wide text-[#7652D9]">
                  Precio orientativo
                </p>
                <p className="mt-1 text-lg font-black">
                  Desde $2.99
                </p>
                <p className="text-xs text-[#6085A5] dark:text-slate-300">
                  por estudiante / mes
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-[#E5EAF3] dark:border-slate-700">
              <div className="grid grid-cols-2 bg-[#F7F9FD] px-4 py-3 text-xs font-black uppercase tracking-wide text-[#6085A5] dark:bg-slate-800">
                <span>Estudiantes</span>
                <span className="text-right">Precio mensual</span>
              </div>

              {[
                ["50 - 199", "$2.99 / estudiante"],
                ["200 - 499", "$2.49 / estudiante"],
                ["500+", "$1.99 / estudiante"],
              ].map(([rango, precio]) => (
                <div
                  key={rango}
                  className="grid grid-cols-2 border-t border-[#E5EAF3] px-4 py-3 text-sm dark:border-slate-700"
                >
                  <span>{rango}</span>
                  <span className="text-right font-black">{precio}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={async () => {
                if (
                  !institucion.trim() ||
                  !responsable.trim() ||
                  !correoInstitucional.trim()
                ) {
                  mostrarNotificacion(
                    "Completa los datos principales para enviar la solicitud."
                  );
                  return;
                }

                try {
                  const {
                    data: { session },
                  } = await supabase.auth.getSession();

                  const respuesta = await fetch(
                    "/api/instituciones/solicitudes",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        ...(session?.access_token
                          ? {
                              Authorization:
                                `Bearer ${session.access_token}`,
                            }
                          : {}),
                      },
                      body: JSON.stringify({
                        institucion: institucion.trim(),
                        responsable: responsable.trim(),
                        correo: correoInstitucional.trim(),
                        cantidad_estudiantes:
                          Number(cantidadEstudiantes),
                      }),
                    }
                  );

                  const datos = await respuesta
                    .json()
                    .catch(() => null);

                  if (!respuesta.ok) {
                    throw new Error(
                      esObjeto(datos) &&
                      typeof datos.error === "string"
                        ? datos.error
                        : "No se pudo enviar la solicitud."
                    );
                  }

                  setMostrarPlanInstitucion(false);
                  setInstitucion("");
                  setResponsable("");
                  setCorreoInstitucional("");
                  setCantidadEstudiantes("50");

                  mostrarNotificacion(
                    "Solicitud institucional enviada correctamente."
                  );
                } catch (error) {
                  mostrarNotificacion(
                    error instanceof Error
                      ? error.message
                      : "No se pudo enviar la solicitud."
                  );
                }
              }}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7652D9] to-[#55A8E8] py-4 font-black text-white"
            >
              <Mail size={19} />
              Solicitar cotización
            </button>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR A GRATIS */}

      {mostrarConfirmacionGratis && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl dark:bg-[#182437]">
            <button
              onClick={() =>
                setMostrarConfirmacionGratis(
                  false
                )
              }
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5FA] text-[#6085A5] dark:bg-slate-700"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF1C9] text-[#E0A100]">
              <Crown size={31} />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              ¿Cambiar al plan gratuito?
            </h2>

            <p className="mt-3 leading-7 text-[#6085A5] dark:text-slate-300">
              Perderás el acceso al lector de voz,
              música Premium y demás funciones
              exclusivas cuando finalice tu periodo
              actual.
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={() =>
                  void solicitarCambioGratis()
                }
                disabled={
                  planProcesando === "free"
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-4 font-black text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {planProcesando ===
                "free" ? (
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Shield size={19} />
                )}

                Confirmar cambio
              </button>

              <button
                onClick={() =>
                  setMostrarConfirmacionGratis(
                    false
                  )
                }
                className="w-full rounded-xl bg-[#F1F8FD] py-4 font-bold text-[#1687D9] dark:bg-slate-700 dark:text-blue-300"
              >
                Mantener Premium
              </button>
            </div>
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
   BENEFICIO PREMIUM
===================================================== */

function BeneficioPremium({
  icono: Icono,
  titulo,
  descripcion,
  color,
}: {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  color: string;
}) {
  return (
    <article className="rounded-2xl bg-white/85 p-5 shadow-sm dark:bg-[#182437]/90">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
      >
        <Icono size={23} />
      </div>

      <h3 className="mt-4 font-black">
        {titulo}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#6085A5] dark:text-slate-400">
        {descripcion}
      </p>
    </article>
  );
}