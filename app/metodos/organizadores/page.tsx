"use client";

import type { LucideIcon } from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Brain,
  ClipboardCheck,
  Columns3,
  Crown,
  Home,
  LayoutGrid,
  Library,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Network,
  Sparkles,
  Sun,
  User,
  WandSparkles,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "../../lib/supabase";

/* =====================================================
   TIPOS
===================================================== */

type PlanType =
  | "free"
  | "month"
  | "year";

type ColorKey =
  | "violet"
  | "blue"
  | "green"
  | "orange"
  | "pink"
  | "amber";

interface ElementoMenu {
  nombre: string;
  href: string;
  icono: LucideIcon;
  activo?: boolean;
}

interface Organizador {
  id: string;
  titulo: string;
  etiqueta: string;
  descripcion: string;
  color: ColorKey;
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
   ORGANIZADORES
===================================================== */

const organizadores: Organizador[] = [
  {
    id: "mapa-mental",
    titulo: "Mapa mental",
    etiqueta: "Creatividad",
    descripcion:
      "Ideal para lluvias de ideas y asociaciones rápidas.",
    color: "violet",
  },
  {
    id: "mapa-conceptual",
    titulo: "Mapa conceptual",
    etiqueta: "Organización",
    descripcion:
      "Conecta conceptos y muestra relaciones entre ideas.",
    color: "blue",
  },
  {
    id: "cuadro-comparativo",
    titulo: "Cuadro comparativo",
    etiqueta: "Comparación",
    descripcion:
      "Perfecto para comparar características, ventajas y diferencias.",
    color: "green",
  },
  {
    id: "linea-tiempo",
    titulo: "Línea de tiempo",
    etiqueta: "Secuencia",
    descripcion:
      "Ordena hechos, procesos o eventos en el tiempo.",
    color: "orange",
  },
  {
    id: "diagrama-flujo",
    titulo: "Diagrama de flujo",
    etiqueta: "Proceso",
    descripcion:
      "Visualiza pasos, decisiones y rutas de un procedimiento.",
    color: "pink",
  },
  {
    id: "esquema-llaves",
    titulo: "Esquema de llaves",
    etiqueta: "Resumen",
    descripcion:
      "Resume el contenido en niveles claros y ordenados.",
    color: "amber",
  },
];

/* =====================================================
   ESTILOS
===================================================== */

const estilos = {
  violet: {
    titulo:
      "text-[#6946F5] dark:text-violet-300",
    etiqueta:
      "bg-[#EFE9FF] text-[#6946F5] dark:bg-violet-950/40 dark:text-violet-300",
    boton:
      "from-[#F5F0FF] to-[#EBE4FF] text-[#6847ED] dark:from-violet-950/30 dark:to-violet-900/20 dark:text-violet-300",
    borde:
      "hover:border-violet-300 dark:hover:border-violet-700",
  },

  blue: {
    titulo:
      "text-[#087EF2] dark:text-blue-300",
    etiqueta:
      "bg-[#E8F3FF] text-[#087EF2] dark:bg-blue-950/40 dark:text-blue-300",
    boton:
      "from-[#F0F8FF] to-[#DFF1FF] text-[#087EF2] dark:from-blue-950/30 dark:to-blue-900/20 dark:text-blue-300",
    borde:
      "hover:border-blue-300 dark:hover:border-blue-700",
  },

  green: {
    titulo:
      "text-[#0AA04F] dark:text-green-300",
    etiqueta:
      "bg-[#E5F8EC] text-[#0AA04F] dark:bg-green-950/40 dark:text-green-300",
    boton:
      "from-[#EFFCF4] to-[#DFF8E9] text-[#0A934A] dark:from-green-950/30 dark:to-green-900/20 dark:text-green-300",
    borde:
      "hover:border-green-300 dark:hover:border-green-700",
  },

  orange: {
    titulo:
      "text-[#FF6900] dark:text-orange-300",
    etiqueta:
      "bg-[#FFF0E1] text-[#FF6900] dark:bg-orange-950/40 dark:text-orange-300",
    boton:
      "from-[#FFF8F0] to-[#FFEAD7] text-[#FF6900] dark:from-orange-950/30 dark:to-orange-900/20 dark:text-orange-300",
    borde:
      "hover:border-orange-300 dark:hover:border-orange-700",
  },

  pink: {
    titulo:
      "text-[#EC1E77] dark:text-pink-300",
    etiqueta:
      "bg-[#FFE7F1] text-[#EC1E77] dark:bg-pink-950/40 dark:text-pink-300",
    boton:
      "from-[#FFF4F8] to-[#FFE5EF] text-[#EC1E77] dark:from-pink-950/30 dark:to-pink-900/20 dark:text-pink-300",
    borde:
      "hover:border-pink-300 dark:hover:border-pink-700",
  },

  amber: {
    titulo:
      "text-[#E58B00] dark:text-amber-300",
    etiqueta:
      "bg-[#FFF2CE] text-[#E58B00] dark:bg-amber-950/40 dark:text-amber-300",
    boton:
      "from-[#FFF9EB] to-[#FFF0C9] text-[#DE8500] dark:from-amber-950/30 dark:to-amber-900/20 dark:text-amber-300",
    borde:
      "hover:border-amber-300 dark:hover:border-amber-700",
  },
};

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

/* =====================================================
   PREVIEW MAPA MENTAL
===================================================== */

function VistaMapaMental() {
  return (
    <div
      className="
        relative
        h-[145px]
        overflow-hidden
        rounded-[20px]
        border
        border-violet-100
        bg-[#FCFAFF]
        dark:border-violet-900/30
        dark:bg-[#171427]
      "
    >
      <div
        className="
          absolute
          left-1/2
          top-1/2
          h-[48px]
          w-[88px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border-2
          border-violet-500
          bg-violet-200
          dark:bg-violet-900
        "
      />

      <div className="absolute left-[18px] top-[28px] h-5 w-12 rounded-full border border-green-500 bg-green-100" />

      <div className="absolute left-[18px] bottom-[28px] h-5 w-12 rounded-full border border-blue-500 bg-blue-100" />

      <div className="absolute right-[18px] top-[28px] h-5 w-12 rounded-full border border-red-400 bg-red-100" />

      <div className="absolute right-[18px] bottom-[28px] h-5 w-12 rounded-full border border-amber-400 bg-amber-100" />

      <div className="absolute left-[48px] top-[48px] h-[2px] w-[75px] rotate-[14deg] bg-violet-300" />

      <div className="absolute right-[48px] top-[48px] h-[2px] w-[75px] -rotate-[14deg] bg-violet-300" />

      <div className="absolute bottom-[46px] left-[48px] h-[2px] w-[75px] -rotate-[14deg] bg-violet-300" />

      <div className="absolute bottom-[46px] right-[48px] h-[2px] w-[75px] rotate-[14deg] bg-violet-300" />
    </div>
  );
}

/* =====================================================
   PREVIEW MAPA CONCEPTUAL
===================================================== */

function VistaMapaConceptual() {
  return (
    <div
      className="
        relative
        h-[145px]
        overflow-hidden
        rounded-[20px]
        border
        border-blue-100
        bg-[#F9FCFF]
        dark:border-blue-900/30
        dark:bg-[#101C2D]
      "
    >
      <div className="absolute left-1/2 top-[18px] h-[32px] w-[85px] -translate-x-1/2 rounded-lg border border-blue-500 bg-blue-200 dark:bg-blue-900" />

      <div className="absolute left-1/2 top-[50px] h-[30px] w-[2px] bg-blue-300" />

      <div className="absolute left-[22%] right-[22%] top-[79px] h-[2px] bg-blue-300" />

      <div className="absolute bottom-[17px] left-[10%] h-[30px] w-[60px] rounded-lg border border-green-500 bg-green-100" />

      <div className="absolute bottom-[17px] left-1/2 h-[30px] w-[60px] -translate-x-1/2 rounded-lg border border-violet-500 bg-violet-100" />

      <div className="absolute bottom-[17px] right-[10%] h-[30px] w-[60px] rounded-lg border border-amber-500 bg-amber-100" />
    </div>
  );
}

/* =====================================================
   PREVIEW CUADRO COMPARATIVO
===================================================== */

function VistaCuadroComparativo() {
  return (
    <div
      className="
        h-[145px]
        overflow-hidden
        rounded-[20px]
        border
        border-green-100
        bg-[#FAFFFC]
        p-4
        dark:border-green-900/30
        dark:bg-[#101F1A]
      "
    >
      <div
        className="
          grid
          h-full
          grid-cols-3
          overflow-hidden
          rounded-xl
          border
          border-green-200
        "
      >
        <div className="bg-green-100 dark:bg-green-950/40" />

        <div className="flex items-center justify-center bg-green-400 text-[8px] font-black text-white">
          Tema A
        </div>

        <div className="flex items-center justify-center bg-green-400 text-[8px] font-black text-white">
          Tema B
        </div>

        {Array.from({
          length: 9,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="
                flex
                items-center
                justify-center
                border-t
                border-green-100
                text-xs
                font-black
                text-green-500
              "
            >
              {index % 3 !== 0 &&
              index % 2 === 0
                ? "✓"
                : ""}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* =====================================================
   PREVIEW LÍNEA DE TIEMPO
===================================================== */

function VistaLineaTiempo() {
  return (
    <div
      className="
        relative
        h-[145px]
        overflow-hidden
        rounded-[20px]
        border
        border-orange-100
        bg-[#FFFCF8]
        dark:border-orange-900/30
        dark:bg-[#201711]
      "
    >
      <div className="absolute left-[20px] right-[20px] top-1/2 h-[3px] bg-slate-400" />

      {[
        "18%",
        "39%",
        "61%",
        "82%",
      ].map(
        (
          posicion,
          index
        ) => (
          <div
            key={`${posicion}-${index}`}
            className="
              absolute
              top-1/2
              h-4
              w-4
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border-[3px]
              border-white
              bg-orange-500
              shadow
            "
            style={{
              left: posicion,
            }}
          />
        )
      )}
    </div>
  );
}

/* =====================================================
   PREVIEW DIAGRAMA DE FLUJO
===================================================== */

function VistaDiagramaFlujo() {
  return (
    <div
      className="
        relative
        h-[145px]
        overflow-hidden
        rounded-[20px]
        border
        border-pink-100
        bg-[#FFFAFC]
        dark:border-pink-900/30
        dark:bg-[#21121A]
      "
    >
      <div className="absolute left-1/2 top-[15px] h-[28px] w-[70px] -translate-x-1/2 rounded-full border border-green-500 bg-green-100" />

      <div className="absolute left-1/2 top-[43px] h-[25px] w-[2px] bg-slate-400" />

      <div className="absolute left-1/2 top-[68px] h-[42px] w-[42px] -translate-x-1/2 rotate-45 border border-amber-500 bg-amber-100" />

      <div className="absolute bottom-[12px] left-[12%] h-[28px] w-[62px] rounded-lg border border-pink-500 bg-pink-100" />

      <div className="absolute bottom-[12px] right-[12%] h-[28px] w-[62px] rounded-lg border border-blue-500 bg-blue-100" />
    </div>
  );
}

/* =====================================================
   PREVIEW ESQUEMA
===================================================== */

function VistaEsquema() {
  return (
    <div
      className="
        relative
        h-[145px]
        overflow-hidden
        rounded-[20px]
        border
        border-amber-100
        bg-[#FFFDF8]
        p-5
        dark:border-amber-900/30
        dark:bg-[#211A0F]
      "
    >
      <div className="absolute bottom-5 left-8 top-5 w-[2px] bg-amber-400" />

      {[0, 1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="
              absolute
              left-8
              flex
              items-center
              gap-3
            "
            style={{
              top:
                20 +
                item * 27,
            }}
          >
            <div className="h-[2px] w-5 bg-amber-400" />

            <div className="h-2 w-[82px] rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
        )
      )}
    </div>
  );
}

function VistaOrganizador({
  tipo,
}: {
  tipo: string;
}) {
  if (
    tipo === "mapa-mental"
  ) {
    return (
      <VistaMapaMental />
    );
  }

  if (
    tipo ===
    "mapa-conceptual"
  ) {
    return (
      <VistaMapaConceptual />
    );
  }

  if (
    tipo ===
    "cuadro-comparativo"
  ) {
    return (
      <VistaCuadroComparativo />
    );
  }

  if (
    tipo ===
    "linea-tiempo"
  ) {
    return (
      <VistaLineaTiempo />
    );
  }

  if (
    tipo ===
    "diagrama-flujo"
  ) {
    return (
      <VistaDiagramaFlujo />
    );
  }

  return (
    <VistaEsquema />
  );
}

/* =====================================================
   COMPONENTE PRINCIPAL
===================================================== */

export default function OrganizadoresPage() {
  const router =
    useRouter();

  /* ===================================================
     USUARIO
  =================================================== */

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

  /* ===================================================
     PLAN
  =================================================== */

  const [
    planActual,
    setPlanActual,
  ] =
    useState<PlanType>(
      "free"
    );

  const [
    cargandoPlan,
    setCargandoPlan,
  ] =
    useState(true);

  const esPremium =
    planActual ===
      "month" ||
    planActual ===
      "year";

  /* ===================================================
     INTERFAZ
  =================================================== */

  const [
    menuAbierto,
    setMenuAbierto,
  ] =
    useState(false);

  const [
    perfilAbierto,
    setPerfilAbierto,
  ] =
    useState(false);

  const [
    modoOscuro,
    setModoOscuro,
  ] =
    useState(false);

  const [
    notificacion,
    setNotificacion,
  ] =
    useState("");

  /* ===================================================
     INICIAR
  =================================================== */

  useEffect(() => {
    const iniciar =
      async () => {
        inicializarTema();

        await obtenerUsuarioYPlan();
      };

    void iniciar();
  }, []);

  /* ===================================================
     TEMA
  =================================================== */

  const inicializarTema =
    () => {
      const temaGuardado =
        localStorage.getItem(
          "raccoon-theme"
        );

      const sistemaOscuro =
        window.matchMedia?.(
          "(prefers-color-scheme: dark)"
        ).matches ??
        false;

      const usarOscuro =
        temaGuardado ===
          "dark" ||
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

  const cambiarTema =
    () => {
      setModoOscuro(
        (
          modoActual
        ) => {
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

      setPerfilAbierto(
        false
      );
    };

  /* ===================================================
     NOTIFICACIONES
  =================================================== */

  const mostrarNotificacion =
    (
      mensaje: string
    ) => {
      setNotificacion(
        mensaje
      );

      window.setTimeout(
        () => {
          setNotificacion(
            ""
          );
        },
        4500
      );
    };

  /* ===================================================
     OBTENER USUARIO Y PLAN
  =================================================== */

  const obtenerUsuarioYPlan =
    async (): Promise<
      string | null
    > => {
      try {
        setCargandoPlan(
          true
        );

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (
          !user ||
          !session
        ) {
          router.replace(
            "/Login"
          );

          return null;
        }

        const metadata = {
          ...(
            user.user_metadata ||
            {}
          ),

          ...(
            user.app_metadata ||
            {}
          ),
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
          metadata.premium ===
            true ||
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

        /* ===============================================
           CONSULTAR PLAN REAL EN SERVIDOR
        =============================================== */

        try {
          const respuesta =
            await fetch(
              "/api/suscripciones",
              {
                method:
                  "GET",

                headers:
                  {
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
            const datos: unknown =
              await respuesta.json();

            if (
              esObjeto(
                datos
              )
            ) {
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
        } catch (
          error
        ) {
          console.warn(
            "No se pudo consultar el plan:",
            error
          );
        }

        return user.id;
      } catch (
        error
      ) {
        console.error(
          "Error obteniendo usuario:",
          error
        );

        mostrarNotificacion(
          "No se pudo cargar tu información."
        );

        return null;
      } finally {
        setCargandoPlan(
          false
        );
      }
    };

  /* ===================================================
     CERRAR SESIÓN
  =================================================== */

  const cerrarSesion =
    async () => {
      await supabase.auth.signOut();

      router.push(
        "/Login"
      );
    };

  /* ===================================================
     ABRIR ORGANIZADOR
  =================================================== */

  const abrirOrganizador =
    (
      tipo: string
    ) => {
      if (
        cargandoPlan
      ) {
        return;
      }

      if (
        !esPremium
      ) {
        mostrarNotificacion(
          "Organizadores Visuales está disponible exclusivamente con Raccoon Premium."
        );

        return;
      }

      router.push(
        `/metodos/organizadores/crear?tipo=${tipo}`
      );
    };

  /* ===================================================
     RECOMENDACIÓN IA
  =================================================== */

  const recomendar =
    () => {
      if (
        cargandoPlan
      ) {
        return;
      }

      if (
        !esPremium
      ) {
        mostrarNotificacion(
          "La recomendación inteligente requiere Raccoon Premium."
        );

        return;
      }

      router.push(
        "/metodos/organizadores/crear?recomendar=true"
      );
    };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div
      className="
        min-h-screen
        bg-[#F8FAFE]
        text-[#10233F]
        dark:bg-[#07111F]
        dark:text-white
      "
    >
      {/* =================================================
          NOTIFICACIÓN
      ================================================= */}

      {notificacion && (
        <div
          className="
            fixed
            right-5
            top-20
            z-[100]
            max-w-sm
            rounded-2xl
            border
            border-[#D9E4F0]
            bg-white
            px-5
            py-4
            text-sm
            font-bold
            text-[#294565]
            shadow-2xl
            dark:border-slate-700
            dark:bg-[#111D2E]
            dark:text-white
          "
        >
          {
            notificacion
          }
        </div>
      )}

      {/* =================================================
          SIDEBAR DESKTOP
      ================================================= */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-40
          hidden
          w-[252px]
          border-r
          border-[#E1E8F0]
          bg-white
          lg:flex
          lg:flex-col
          dark:border-slate-800
          dark:bg-[#0B1626]
        "
      >
        {/* LOGO */}

        <div
          className="
            flex
            h-[145px]
            flex-col
            items-center
            justify-center
          "
        >
          <Image
            src="/raccoon.png"
            alt="Raccoon Study"
            width={76}
            height={76}
            className="
              h-[70px]
              w-[70px]
              object-contain
            "
          />

          <h2
            className="
              mt-1
              text-xl
              font-black
            "
          >
            Raccoon{" "}
            <span className="text-[#2B8CFF]">
              Study
            </span>
          </h2>
        </div>

        {/* MENÚ */}

        <nav
          className="
            flex-1
            space-y-2
            px-4
          "
        >
          {elementosMenu.map(
            (
              item
            ) => {
              const Icono =
                item.icono;

              return (
                <Link
                  key={
                    item.nombre
                  }
                  href={
                    item.href
                  }
                  className={`
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    px-4
                    py-3.5
                    text-sm
                    font-semibold
                    transition

                    ${
                      item.activo
                        ? `
                          bg-[#EAF5FF]
                          text-[#1284ED]
                          dark:bg-[#16304B]
                          dark:text-[#64BBFF]
                        `
                        : `
                          text-[#253B57]
                          hover:bg-[#F4F7FB]
                          dark:text-slate-200
                          dark:hover:bg-slate-800
                        `
                    }
                  `}
                >
                  <Icono
                    size={19}
                  />

                  {
                    item.nombre
                  }
                </Link>
              );
            }
          )}
        </nav>

        {/* PARTE INFERIOR */}

        <div
          className="
            space-y-2
            px-4
            pb-5
          "
        >
          {/* MODO OSCURO */}

          <button
            type="button"
            onClick={
              cambiarTema
            }
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              px-4
              py-3
              text-sm
              font-semibold
              hover:bg-[#F4F7FB]
              dark:hover:bg-slate-800
            "
          >
            {modoOscuro ? (
              <Sun
                size={19}
                className="text-amber-400"
              />
            ) : (
              <Moon
                size={19}
                className="text-amber-500"
              />
            )}

            {modoOscuro
              ? "Modo claro"
              : "Modo oscuro"}
          </button>

          {/* CERRAR SESIÓN */}

          <button
            type="button"
            onClick={
              cerrarSesion
            }
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              px-4
              py-3
              text-sm
              font-semibold
              text-red-500
              hover:bg-red-50
              dark:hover:bg-red-950/20
            "
          >
            <LogOut
              size={19}
            />

            Cerrar sesión
          </button>

          {/* =============================================
              TARJETA PREMIUM CLICKEABLE
          ============================================= */}

          <Link
            href="/suscripcion"
            className={`
              group
              mt-4
              block
              overflow-hidden
              rounded-[22px]
              p-4
              text-white
              shadow-[0_15px_30px_rgba(56,118,220,0.24)]
              transition-all
              duration-300

              hover:-translate-y-1
              hover:shadow-[0_20px_38px_rgba(56,118,220,0.34)]

              ${
                esPremium
                  ? `
                    bg-gradient-to-br
                    from-[#38AEF5]
                    via-[#48A5F3]
                    to-[#7752E8]
                  `
                  : `
                    bg-gradient-to-br
                    from-[#718399]
                    to-[#48596F]
                  `
              }
            `}
          >
            <div
              className="
                flex
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/20
                  transition
                  group-hover:scale-110
                "
              >
                <Crown
                  size={20}
                />
              </div>

              <div>
                <p className="font-black">
                  {esPremium
                    ? "Raccoon Premium"
                    : "Raccoon Study"}
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    leading-4
                    text-white/80
                  "
                >
                  {esPremium
                    ? nombrePlan(
                        planActual
                      )
                    : "Desbloquea todas las herramientas"}
                </p>
              </div>
            </div>

            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                text-xs
                font-black
              "
            >
              <span>
                {cargandoPlan
                  ? "Cargando..."
                  : esPremium
                    ? "Premium activo"
                    : "Ver Premium"}
              </span>

              <ArrowRight
                size={15}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </div>
          </Link>
        </div>
      </aside>

      {/* =================================================
          OVERLAY MOBILE
      ================================================= */}

      {menuAbierto && (
        <button
          type="button"
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            lg:hidden
          "
          onClick={() =>
            setMenuAbierto(
              false
            )
          }
        />
      )}

      {/* =================================================
          SIDEBAR MOBILE
      ================================================= */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          w-[280px]
          bg-white
          shadow-2xl
          transition-transform
          duration-300
          dark:bg-[#0B1626]
          lg:hidden

          ${
            menuAbierto
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-[#E3EAF2]
            p-4
            dark:border-slate-800
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <Image
              src="/raccoon.png"
              alt="Raccoon"
              width={44}
              height={44}
            />

            <span className="font-black">
              Raccoon{" "}
              <span className="text-[#2B8CFF]">
                Study
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setMenuAbierto(
                false
              )
            }
          >
            <X
              size={20}
            />
          </button>
        </div>

        <nav
          className="
            space-y-2
            p-4
          "
        >
          {elementosMenu.map(
            (
              item
            ) => {
              const Icono =
                item.icono;

              return (
                <Link
                  key={
                    item.nombre
                  }
                  href={
                    item.href
                  }
                  onClick={() =>
                    setMenuAbierto(
                      false
                    )
                  }
                  className={`
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    px-4
                    py-3
                    text-sm
                    font-semibold

                    ${
                      item.activo
                        ? `
                          bg-[#EAF5FF]
                          text-[#1284ED]
                          dark:bg-[#16304B]
                        `
                        : ""
                    }
                  `}
                >
                  <Icono
                    size={19}
                  />

                  {
                    item.nombre
                  }
                </Link>
              );
            }
          )}
        </nav>

        {/* PREMIUM MOBILE */}

        <div
          className="
            absolute
            bottom-5
            left-4
            right-4
          "
        >
          <Link
            href="/suscripcion"
            onClick={() =>
              setMenuAbierto(
                false
              )
            }
            className="
              block
              rounded-[20px]
              bg-gradient-to-br
              from-[#38AEF5]
              via-[#48A5F3]
              to-[#7752E8]
              p-4
              text-white
              shadow-xl
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <Crown
                size={20}
              />

              <div>
                <p className="text-sm font-black">
                  Raccoon Premium
                </p>

                <p className="text-[10px] text-white/80">
                  {esPremium
                    ? nombrePlan(
                        planActual
                      )
                    : "Ver beneficios"}
                </p>
              </div>
            </div>

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                text-xs
                font-black
              "
            >
              {esPremium
                ? "Premium activo"
                : "Desbloquear"}

              <ArrowRight
                size={14}
              />
            </div>
          </Link>
        </div>
      </aside>

      {/* =================================================
          CONTENIDO
      ================================================= */}

      <div className="lg:pl-[252px]">
        {/* HEADER */}

        <header
          className="
            sticky
            top-0
            z-30
            flex
            h-[70px]
            items-center
            justify-between
            border-b
            border-[#E1E8F0]
            bg-white/95
            px-4
            backdrop-blur
            dark:border-slate-800
            dark:bg-[#0B1626]/95
            sm:px-7
            lg:px-9
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <button
              type="button"
              onClick={() =>
                setMenuAbierto(
                  true
                )
              }
              className="
                rounded-xl
                p-2
                lg:hidden
              "
            >
              <Menu
                size={22}
              />
            </button>

            <h1
              className="
                text-xl
                font-black
                sm:text-2xl
              "
            >
              Organizadores visuales
            </h1>
          </div>

          {/* PERFIL */}

          <div
            className="
              relative
              flex
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={
                cambiarTema
              }
              className="
                hidden
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-[#E3EAF3]
                bg-white
                sm:flex
                dark:border-slate-700
                dark:bg-slate-800
              "
            >
              {modoOscuro ? (
                <Sun
                  size={18}
                />
              ) : (
                <Moon
                  size={18}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setPerfilAbierto(
                  (
                    actual
                  ) =>
                    !actual
                )
              }
              className="
                h-11
                w-11
                overflow-hidden
                rounded-[14px]
                border
                border-[#DFE7F0]
                bg-white
                shadow-sm
                dark:border-slate-700
                dark:bg-slate-800
              "
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}

              <img
                src={
                  fotoPerfil
                }
                alt={
                  nombreUsuario
                }
                className="
                  h-full
                  w-full
                  object-cover
                "
                onError={(
                  evento
                ) => {
                  evento.currentTarget.src =
                    "/raccoon.png";
                }}
              />
            </button>

            {perfilAbierto && (
              <div
                className="
                  absolute
                  right-0
                  top-[54px]
                  w-[230px]
                  rounded-2xl
                  border
                  border-[#E1E8F0]
                  bg-white
                  p-3
                  shadow-xl
                  dark:border-slate-700
                  dark:bg-[#121F31]
                "
              >
                <p
                  className="
                    px-3
                    py-2
                    text-sm
                    font-black
                  "
                >
                  {
                    nombreUsuario
                  }
                </p>

                <p
                  className="
                    px-3
                    pb-2
                    text-xs
                    text-[#7A8EA5]
                    dark:text-slate-400
                  "
                >
                  {nombrePlan(
                    planActual
                  )}
                </p>

                <Link
                  href="/perfil"
                  className="
                    block
                    rounded-xl
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    hover:bg-[#F5F8FC]
                    dark:hover:bg-slate-800
                  "
                >
                  Ver perfil
                </Link>

                <Link
                  href="/suscripcion"
                  className="
                    mt-1
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    text-[#7652D9]
                    hover:bg-[#F4F0FF]
                    dark:hover:bg-violet-950/20
                  "
                >
                  <Crown
                    size={16}
                  />

                  Mi suscripción
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* =================================================
            PAGE
        ================================================= */}

        <main
          className="
            px-4
            py-7
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              mx-auto
              max-w-[1370px]
            "
          >
            {/* =============================================
                HERO
            ============================================= */}

            <section
              className="
                relative
                overflow-hidden
                rounded-[26px]
                border
                border-[#DDE5F0]
                bg-gradient-to-r
                from-[#F5F0FF]
                via-[#F5F7FF]
                to-[#EDF8FF]
                px-6
                py-6
                shadow-[0_12px_30px_rgba(40,77,120,0.06)]
                dark:border-slate-700
                dark:from-[#28243E]
                dark:via-[#1B2940]
                dark:to-[#17344B]
                sm:px-8
                lg:px-9
              "
            >
              <div
                className="
                  relative
                  z-10
                  grid
                  min-h-[155px]
                  items-center
                  gap-5
                  lg:grid-cols-[1fr_350px]
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-6
                  "
                >
                  <div
                    className="
                      hidden
                      h-[100px]
                      w-[100px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#EAE1FF]
                      text-[#7151ED]
                      sm:flex
                      dark:bg-violet-950/40
                    "
                  >
                    <Network
                      size={45}
                    />
                  </div>

                  <div>
                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          rounded-full
                          bg-white/80
                          px-3
                          py-1.5
                          text-[10px]
                          font-black
                          text-[#7652D9]
                          dark:bg-white/10
                          dark:text-violet-200
                        "
                      >
                        <Crown
                          size={13}
                          className="
                            mr-1
                            inline
                          "
                        />

                        FUNCIÓN PREMIUM
                      </span>

                      {!cargandoPlan &&
                        esPremium && (
                          <span
                            className="
                              rounded-full
                              bg-[#E7F8EE]
                              px-3
                              py-1.5
                              text-[10px]
                              font-black
                              text-[#18A35D]
                              dark:bg-green-950/30
                              dark:text-green-300
                            "
                          >
                            Premium activo
                          </span>
                        )}
                    </div>

                    <h2
                      className="
                        mt-3
                        text-3xl
                        font-black
                        tracking-[-0.04em]
                        text-[#071D43]
                        dark:text-white
                        sm:text-4xl
                        lg:text-[44px]
                      "
                    >
                      Elige tu organizador visual
                    </h2>

                    <p
                      className="
                        mt-2
                        max-w-2xl
                        text-sm
                        leading-6
                        text-[#526E8E]
                        dark:text-slate-300
                        sm:text-base
                      "
                    >
                      Transforma tu material en mapas, esquemas y diagramas creados con Raccoon IA.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    relative
                    hidden
                    h-[155px]
                    lg:block
                  "
                >
                  <Sparkles
                    size={22}
                    className="
                      absolute
                      left-5
                      top-3
                      text-pink-400
                    "
                  />

                  <LayoutGrid
                    size={27}
                    className="
                      absolute
                      right-9
                      top-5
                      text-amber-400
                    "
                  />

                  <Image
                    src="/raccoon.png"
                    alt="Raccoon Study"
                    width={230}
                    height={210}
                    className="
                      absolute
                      bottom-[-28px]
                      right-[70px]
                      max-h-[200px]
                      w-auto
                      object-contain
                      drop-shadow-xl
                    "
                  />
                </div>
              </div>
            </section>

            {/* =============================================
                CARGANDO PLAN
            ============================================= */}

            {cargandoPlan && (
              <div
                className="
                  mt-6
                  flex
                  min-h-[280px]
                  items-center
                  justify-center
                  rounded-[26px]
                  border
                  border-[#E1E8F0]
                  bg-white
                  dark:border-slate-700
                  dark:bg-[#121F31]
                "
              >
                <div className="text-center">
                  <LoaderCircle
                    size={38}
                    className="
                      mx-auto
                      animate-spin
                      text-[#7652D9]
                    "
                  />

                  <p
                    className="
                      mt-4
                      text-sm
                      font-black
                    "
                  >
                    Comprobando tu plan...
                  </p>
                </div>
              </div>
            )}

            {/* =============================================
                USUARIO GRATUITO
            ============================================= */}

            {!cargandoPlan &&
              !esPremium && (
                <section
                  className="
                    relative
                    mt-6
                    overflow-hidden
                    rounded-[30px]
                    border
                    border-[#E1D7FF]
                    bg-gradient-to-br
                    from-[#FBF9FF]
                    via-white
                    to-[#F1F8FF]
                    p-6
                    shadow-[0_18px_45px_rgba(86,72,160,0.08)]
                    dark:border-violet-900/30
                    dark:from-[#211C36]
                    dark:via-[#121F31]
                    dark:to-[#13263C]
                    sm:p-9
                  "
                >
                  <div
                    className="
                      mx-auto
                      max-w-[780px]
                      text-center
                    "
                  >
                    <div
                      className="
                        mx-auto
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-full
                        bg-gradient-to-br
                        from-[#FFD76B]
                        to-[#FFB739]
                        text-white
                        shadow-[0_14px_30px_rgba(255,185,60,0.28)]
                      "
                    >
                      <Crown
                        size={36}
                      />
                    </div>

                    <span
                      className="
                        mt-5
                        inline-flex
                        rounded-full
                        bg-[#F0E9FF]
                        px-4
                        py-2
                        text-xs
                        font-black
                        text-[#7652D9]
                        dark:bg-violet-950/30
                        dark:text-violet-200
                      "
                    >
                      ORGANIZADORES VISUALES · PREMIUM
                    </span>

                    <h2
                      className="
                        mt-4
                        text-3xl
                        font-black
                        tracking-[-0.035em]
                        sm:text-4xl
                      "
                    >
                      Convierte tus materiales en herramientas visuales
                    </h2>

                    <p
                      className="
                        mx-auto
                        mt-3
                        max-w-2xl
                        text-sm
                        leading-7
                        text-[#637B97]
                        dark:text-slate-300
                        sm:text-base
                      "
                    >
                      Desbloquea mapas mentales, mapas conceptuales, cuadros comparativos, líneas de tiempo, diagramas de flujo y esquemas generados automáticamente con IA.
                    </p>

                    <div
                      className="
                        mt-7
                        grid
                        gap-3
                        text-left
                        sm:grid-cols-2
                        lg:grid-cols-3
                      "
                    >
                      {organizadores.map(
                        (
                          organizador
                        ) => (
                          <div
                            key={
                              organizador.id
                            }
                            className="
                              flex
                              items-center
                              gap-3
                              rounded-2xl
                              border
                              border-[#E7E1F4]
                              bg-white/80
                              p-4
                              dark:border-slate-700
                              dark:bg-white/5
                            "
                          >
                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#F0ECFF]
                                text-[#7652D9]
                                dark:bg-violet-950/30
                              "
                            >
                              <Network
                                size={17}
                              />
                            </div>

                            <p
                              className="
                                text-xs
                                font-black
                              "
                            >
                              {
                                organizador.titulo
                              }
                            </p>
                          </div>
                        )
                      )}
                    </div>

                    {/* BOTÓN PREMIUM */}

                    <Link
                      href="/suscripcion"
                      className="
                        mt-8
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        bg-gradient-to-r
                        from-[#3978F6]
                        via-[#5F64F1]
                        to-[#7652D9]
                        px-8
                        py-4
                        text-sm
                        font-black
                        text-white
                        shadow-[0_14px_30px_rgba(93,82,217,0.28)]
                        transition
                        hover:-translate-y-0.5
                        hover:brightness-110
                      "
                    >
                      <Crown
                        size={18}
                      />

                      Desbloquear Premium

                      <ArrowRight
                        size={17}
                      />
                    </Link>
                  </div>
                </section>
              )}

            {/* =============================================
                PREMIUM
            ============================================= */}

            {!cargandoPlan &&
              esPremium && (
                <>
                  <section
                    className="
                      mt-7
                      grid
                      gap-5
                      md:grid-cols-2
                      xl:grid-cols-3
                    "
                  >
                    {organizadores.map(
                      (
                        organizador
                      ) => {
                        const estilo =
                          estilos[
                            organizador.color
                          ];

                        return (
                          <article
                            key={
                              organizador.id
                            }
                            className={`
                              group
                              rounded-[24px]
                              border
                              border-[#E1E8F0]
                              bg-white
                              p-4
                              shadow-[0_8px_22px_rgba(33,73,118,0.055)]
                              transition-all
                              duration-300
                              hover:-translate-y-1
                              hover:shadow-[0_18px_38px_rgba(44,88,150,0.11)]
                              dark:border-slate-700
                              dark:bg-[#121F31]

                              ${
                                estilo.borde
                              }
                            `}
                          >
                            <div
                              className="
                                grid
                                gap-4
                                sm:grid-cols-[175px_1fr]
                              "
                            >
                              <VistaOrganizador
                                tipo={
                                  organizador.id
                                }
                              />

                              <div
                                className="
                                  flex
                                  min-w-0
                                  flex-col
                                "
                              >
                                <h3
                                  className={`
                                    text-xl
                                    font-black

                                    ${
                                      estilo.titulo
                                    }
                                  `}
                                >
                                  {
                                    organizador.titulo
                                  }
                                </h3>

                                <span
                                  className={`
                                    mt-2
                                    w-fit
                                    rounded-full
                                    px-3
                                    py-1
                                    text-[10px]
                                    font-black

                                    ${
                                      estilo.etiqueta
                                    }
                                  `}
                                >
                                  {
                                    organizador.etiqueta
                                  }
                                </span>

                                <p
                                  className="
                                    mt-4
                                    text-sm
                                    leading-6
                                    text-[#526B87]
                                    dark:text-slate-300
                                  "
                                >
                                  {
                                    organizador.descripcion
                                  }
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                abrirOrganizador(
                                  organizador.id
                                )
                              }
                              className={`
                                mt-4
                                flex
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                px-4
                                py-3
                                text-sm
                                font-black
                                transition
                                hover:brightness-[0.98]

                                ${
                                  estilo.boton
                                }
                              `}
                            >
                              Crear organizador

                              <ArrowRight
                                size={17}
                              />
                            </button>
                          </article>
                        );
                      }
                    )}
                  </section>

                  {/* IA */}

                  <section
                    className="
                      relative
                      mt-5
                      overflow-hidden
                      rounded-[24px]
                      border
                      border-[#DDD7FF]
                      bg-gradient-to-r
                      from-[#F5EEFF]
                      via-[#F7F4FF]
                      to-[#EEF6FF]
                      px-5
                      py-4
                      dark:border-violet-900/30
                      dark:from-[#29223F]
                      dark:via-[#22253C]
                      dark:to-[#173148]
                      sm:px-7
                    "
                  >
                    <div
                      className="
                        grid
                        items-center
                        gap-5
                        lg:grid-cols-[1fr_auto]
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-4
                        "
                      >
                        <Image
                          src="/raccoon.png"
                          alt="Raccoon IA"
                          width={105}
                          height={105}
                          className="
                            hidden
                            h-[95px]
                            w-[95px]
                            object-contain
                            sm:block
                          "
                        />

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            text-[#7652D9]
                            shadow-sm
                            dark:bg-slate-800
                          "
                        >
                          <WandSparkles
                            size={24}
                          />
                        </div>

                        <div>
                          <h2
                            className="
                              text-xl
                              font-black
                            "
                          >
                            ¿No sabes cuál elegir?
                          </h2>

                          <p
                            className="
                              mt-1
                              text-sm
                              text-[#5D7390]
                              dark:text-slate-300
                            "
                          >
                            Raccoon IA puede analizar tu material y recomendarte el organizador más adecuado.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={
                          recomendar
                        }
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-gradient-to-r
                          from-[#6659ED]
                          to-[#764CE8]
                          px-7
                          py-3.5
                          text-sm
                          font-black
                          text-white
                          shadow-[0_10px_23px_rgba(108,77,230,0.23)]
                          transition
                          hover:brightness-110
                        "
                      >
                        <Sparkles
                          size={17}
                        />

                        Recomendarme uno
                      </button>
                    </div>
                  </section>
                </>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}