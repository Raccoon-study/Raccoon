"use client";

import type { LucideIcon } from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  BrainCircuit,
  Check,
  CircleCheckBig,
  ClipboardCheck,
  Columns3,
  Crown,
  FileText,
  GitBranch,
  Home,
  Library,
  ListTree,
  LoaderCircle,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Network,
  Sparkles,
  Sun,
  Upload,
  User,
  WandSparkles,
  X,
  Clock3,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "../../../lib/supabase";

/* =====================================================
   TIPOS
===================================================== */

type PlanType =
  | "free"
  | "month"
  | "year";

type TipoOrganizador =
  | "mapa-mental"
  | "mapa-conceptual"
  | "cuadro-comparativo"
  | "linea-tiempo"
  | "diagrama-flujo"
  | "esquema-llaves";

type NivelDetalle =
  | "basico"
  | "intermedio"
  | "profundo";

interface ElementoMenu {
  nombre: string;
  href: string;
  icono: LucideIcon;
  activo?: boolean;
}

interface OpcionOrganizador {
  id: TipoOrganizador;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  color: string;
  fondo: string;
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

const opciones: OpcionOrganizador[] = [
  {
    id: "mapa-mental",
    titulo: "Mapa mental",
    descripcion:
      "Organiza ideas alrededor de un concepto principal.",
    icono: BrainCircuit,
    color:
      "text-violet-600 dark:text-violet-300",
    fondo:
      "bg-violet-100 dark:bg-violet-950/30",
  },
  {
    id: "mapa-conceptual",
    titulo: "Mapa conceptual",
    descripcion:
      "Relaciona conceptos de forma jerárquica.",
    icono: Network,
    color:
      "text-blue-600 dark:text-blue-300",
    fondo:
      "bg-blue-100 dark:bg-blue-950/30",
  },
  {
    id: "cuadro-comparativo",
    titulo: "Cuadro comparativo",
    descripcion:
      "Compara características, diferencias y semejanzas.",
    icono: Columns3,
    color:
      "text-emerald-600 dark:text-emerald-300",
    fondo:
      "bg-emerald-100 dark:bg-emerald-950/30",
  },
  {
    id: "linea-tiempo",
    titulo: "Línea de tiempo",
    descripcion:
      "Ordena hechos, etapas o eventos cronológicamente.",
    icono: Clock3,
    color:
      "text-orange-600 dark:text-orange-300",
    fondo:
      "bg-orange-100 dark:bg-orange-950/30",
  },
  {
    id: "diagrama-flujo",
    titulo: "Diagrama de flujo",
    descripcion:
      "Representa procesos, decisiones y recorridos.",
    icono: GitBranch,
    color:
      "text-pink-600 dark:text-pink-300",
    fondo:
      "bg-pink-100 dark:bg-pink-950/30",
  },
  {
    id: "esquema-llaves",
    titulo: "Esquema de llaves",
    descripcion:
      "Divide un tema en categorías y subcategorías.",
    icono: ListTree,
    color:
      "text-amber-600 dark:text-amber-300",
    fondo:
      "bg-amber-100 dark:bg-amber-950/30",
  },
];

/* =====================================================
   HELPERS
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
   COMPONENTE
===================================================== */

export default function CrearOrganizadorPage() {
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
    planActual === "month" ||
    planActual === "year";

  /* ===================================================
     UI
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
     CREACIÓN
  =================================================== */

  const [
    archivo,
    setArchivo,
  ] =
    useState<File | null>(
      null
    );

  const [
    tipo,
    setTipo,
  ] =
    useState<TipoOrganizador>(
      "mapa-mental"
    );

  const [
    nivel,
    setNivel,
  ] =
    useState<NivelDetalle>(
      "intermedio"
    );

  const [
    generando,
    setGenerando,
  ] =
    useState(false);

  const [
    recomendando,
    setRecomendando,
  ] =
    useState(false);

  const [
    progreso,
    setProgreso,
  ] =
    useState(0);

  const [
    mensajeProceso,
    setMensajeProceso,
  ] =
    useState("");

  /* ===================================================
     INICIO
  =================================================== */

  useEffect(() => {
    const iniciar =
      async () => {
        inicializarTema();

        leerParametros();

        await obtenerUsuarioYPlan();
      };

    void iniciar();
  }, []);

  /* ===================================================
     QUERY PARAMS
  =================================================== */

  const leerParametros =
    () => {
      const params =
        new URLSearchParams(
          window.location.search
        );

      const tipoParam =
        params.get(
          "tipo"
        ) as TipoOrganizador | null;

      if (
        tipoParam &&
        opciones.some(
          (opcion) =>
            opcion.id ===
            tipoParam
        )
      ) {
        setTipo(
          tipoParam
        );
      }
    };

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

  const cambiarTema =
    () => {
      setModoOscuro(
        (
          actual
        ) => {
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
     USUARIO + PREMIUM
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
          metadata.premium === true ||
          metadata.is_premium === true ||
          metadata.es_premium === true;

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

        /* =============================================
           CONSULTA REAL AL SERVIDOR
        ============================================= */

        try {
          const respuesta =
            await fetch(
              "/api/suscripciones",
              {
                method:
                  "GET",

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
            const datos: unknown =
              await respuesta.json();

            if (
              esObjeto(
                datos
              )
            ) {
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
     SESIÓN
  =================================================== */

  const cerrarSesion =
    async () => {
      await supabase.auth.signOut();

      router.push(
        "/Login"
      );
    };

  /* ===================================================
     ORGANIZADOR ACTUAL
  =================================================== */

  const opcionActual =
    useMemo(
      () =>
        opciones.find(
          (
            opcion
          ) =>
            opcion.id ===
            tipo
        ),
      [
        tipo,
      ]
    );

  /* ===================================================
     ARCHIVO
  =================================================== */

  const seleccionarArchivo =
    (
      evento: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (
        !esPremium
      ) {
        mostrarNotificacion(
          "Necesitas Raccoon Premium para crear organizadores visuales."
        );

        return;
      }

      const nuevoArchivo =
        evento.target.files?.[0];

      if (
        !nuevoArchivo
      ) {
        return;
      }

      const extensionesPermitidas =
        [
          "pdf",
          "docx",
          "pptx",
          "txt",
        ];

      const extension =
        nuevoArchivo.name
          .split(".")
          .pop()
          ?.toLowerCase();

      if (
        !extension ||
        !extensionesPermitidas.includes(
          extension
        )
      ) {
        mostrarNotificacion(
          "Solo puedes subir archivos PDF, DOCX, PPTX o TXT."
        );

        evento.target.value =
          "";

        return;
      }

      const maximo =
        20 *
        1024 *
        1024;

      if (
        nuevoArchivo.size >
        maximo
      ) {
        mostrarNotificacion(
          "El archivo no puede superar los 20 MB."
        );

        evento.target.value =
          "";

        return;
      }

      setArchivo(
        nuevoArchivo
      );

      setMensajeProceso(
        ""
      );
    };

  /* ===================================================
     RECOMENDAR
  =================================================== */

  const recomendarOrganizador =
    async () => {
      if (
        !esPremium
      ) {
        router.push(
          "/suscripciones"
        );

        return;
      }

      if (
        !archivo
      ) {
        mostrarNotificacion(
          "Primero sube un material para que Raccoon IA pueda analizarlo."
        );

        return;
      }

      try {
        setRecomendando(
          true
        );

        setMensajeProceso(
          "Raccoon IA está analizando tu material..."
        );

        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (
          !session
        ) {
          router.push(
            "/Login"
          );

          return;
        }

        const formData =
          new FormData();

        formData.append(
          "archivo",
          archivo
        );

        const respuesta =
          await fetch(
            "/api/organizadores/recomendar",
            {
              method:
                "POST",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },

              body:
                formData,
            }
          );

        const datos: unknown =
          await respuesta.json();

        if (
          !respuesta.ok
        ) {
          if (
            esObjeto(
              datos
            ) &&
            typeof datos.error ===
              "string"
          ) {
            throw new Error(
              datos.error
            );
          }

          throw new Error(
            "No se pudo obtener una recomendación."
          );
        }

        if (
          esObjeto(
            datos
          ) &&
          typeof datos.tipo ===
            "string"
        ) {
          const tipoRecomendado =
            datos.tipo as TipoOrganizador;

          if (
            opciones.some(
              (
                opcion
              ) =>
                opcion.id ===
                tipoRecomendado
            )
          ) {
            setTipo(
              tipoRecomendado
            );

            const encontrado =
              opciones.find(
                (
                  opcion
                ) =>
                  opcion.id ===
                  tipoRecomendado
              );

            setMensajeProceso(
              `Raccoon recomienda: ${
                encontrado?.titulo ||
                "Mapa conceptual"
              } ✨`
            );
          }
        }
      } catch (
        error
      ) {
        console.error(
          error
        );

        mostrarNotificacion(
          error instanceof Error
            ? error.message
            : "No se pudo analizar el material."
        );
      } finally {
        setRecomendando(
          false
        );
      }
    };

  /* ===================================================
     GENERAR
  =================================================== */

  const generarOrganizador =
    async () => {
      if (
        !esPremium
      ) {
        router.push(
          "/suscripciones"
        );

        return;
      }

      if (
        !archivo
      ) {
        mostrarNotificacion(
          "Primero debes subir un material."
        );

        return;
      }

      try {
        setGenerando(
          true
        );

        setProgreso(
          15
        );

        setMensajeProceso(
          "Preparando tu material..."
        );

        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (
          !session
        ) {
          router.push(
            "/Login"
          );

          return;
        }

        const formData =
          new FormData();

        formData.append(
          "archivo",
          archivo
        );

        formData.append(
          "tipo",
          tipo
        );

        formData.append(
          "nivel",
          nivel
        );

        setProgreso(
          30
        );

        setMensajeProceso(
          "Raccoon IA está identificando las ideas principales..."
        );

        const respuesta =
          await fetch(
            "/api/organizadores/generar",
            {
              method:
                "POST",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },

              body:
                formData,
            }
          );

        setProgreso(
          70
        );

        setMensajeProceso(
          "Organizando conceptos y relaciones..."
        );

        const datos: unknown =
          await respuesta.json();

        if (
          !respuesta.ok
        ) {
          if (
            respuesta.status ===
            403
          ) {
            router.push(
              "/suscripciones"
            );

            return;
          }

          if (
            esObjeto(
              datos
            ) &&
            typeof datos.error ===
              "string"
          ) {
            throw new Error(
              datos.error
            );
          }

          throw new Error(
            "No se pudo generar el organizador."
          );
        }

        setProgreso(
          100
        );

        setMensajeProceso(
          "¡Tu organizador está listo! 🎉"
        );

        sessionStorage.setItem(
          "organizador-generado",
          JSON.stringify(
            datos
          )
        );

        sessionStorage.setItem(
          "organizador-archivo",
          archivo.name
        );

        window.setTimeout(
          () => {
            router.push(
              `/metodos/organizadores/crear/editor?tipo=${tipo}`
            );
          },
          650
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        mostrarNotificacion(
          error instanceof Error
            ? error.message
            : "Ocurrió un error generando el organizador."
        );
      } finally {
        window.setTimeout(
          () => {
            setGenerando(
              false
            );
          },
          700
        );
      }
    };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div
      className="
        min-h-screen
        bg-[#F7FAFF]
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

        {/* PIE */}

        <div
          className="
            space-y-2
            px-4
            pb-5
          "
        >
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

          {/* PREMIUM CLICKEABLE */}

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
              {cargandoPlan
                ? "Cargando..."
                : esPremium
                  ? "Premium activo"
                  : "Ver Premium"}

              <ArrowRight
                size={15}
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
          onClick={() =>
            setMenuAbierto(
              false
            )
          }
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            lg:hidden
          "
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
                <p className="font-black">
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
              Crear organizador visual
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
              max-w-[1380px]
            "
          >
            {/* VOLVER */}

            <Link
              href="/metodos/organizadores"
              className="
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-white
                px-4
                py-2
                text-sm
                font-bold
                text-[#57708E]
                shadow-sm
                transition
                hover:-translate-x-0.5
                dark:bg-[#121F31]
                dark:text-slate-300
              "
            >
              <ArrowLeft
                size={17}
              />

              Volver a organizadores
            </Link>

            {/* =============================================
                HERO
            ============================================= */}

            <section
              className="
                relative
                overflow-hidden
                rounded-[30px]
                border
                border-[#DEDFF6]
                bg-gradient-to-r
                from-[#EFE9FF]
                via-[#EDF4FF]
                to-[#E8F8FF]
                p-6
                shadow-[0_18px_45px_rgba(55,90,150,0.08)]
                dark:border-slate-700
                dark:from-[#29233F]
                dark:via-[#1A2940]
                dark:to-[#16364D]
                sm:p-8
              "
            >
              <Sparkles
                size={29}
                className="
                  absolute
                  right-[20%]
                  top-6
                  text-yellow-400
                "
              />

              <div
                className="
                  relative
                  z-10
                  grid
                  items-center
                  gap-5
                  lg:grid-cols-[1fr_280px]
                "
              >
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
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        bg-white/85
                        px-3
                        py-1.5
                        text-xs
                        font-black
                        text-[#7652D9]
                        dark:bg-white/10
                        dark:text-violet-200
                      "
                    >
                      <Crown
                        size={14}
                      />

                      FUNCIÓN PREMIUM
                    </span>

                    {esPremium && (
                      <span
                        className="
                          rounded-full
                          bg-[#DCF8E7]
                          px-3
                          py-1.5
                          text-[10px]
                          font-black
                          text-[#139556]
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
                      mt-4
                      max-w-[800px]
                      text-3xl
                      font-black
                      tracking-[-0.04em]
                      sm:text-4xl
                      lg:text-[42px]
                    "
                  >
                    Convierte tu material en una herramienta visual
                  </h2>

                  <p
                    className="
                      mt-3
                      max-w-2xl
                      text-sm
                      leading-6
                      text-[#617A97]
                      dark:text-slate-300
                      sm:text-base
                    "
                  >
                    Raccoon IA analiza tu contenido, identifica las ideas principales y las transforma en una estructura visual clara y fácil de estudiar.
                  </p>
                </div>

                <Image
                  src="/raccoon.png"
                  alt="Raccoon Study"
                  width={230}
                  height={200}
                  className="
                    hidden
                    max-h-[190px]
                    w-auto
                    justify-self-center
                    object-contain
                    drop-shadow-xl
                    lg:block
                  "
                />
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
                  min-h-[300px]
                  items-center
                  justify-center
                  rounded-[28px]
                  border
                  border-[#E1E8F0]
                  bg-white
                  dark:border-slate-700
                  dark:bg-[#121F31]
                "
              >
                <div className="text-center">
                  <LoaderCircle
                    size={40}
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
                    Comprobando tu suscripción...
                  </p>
                </div>
              </div>
            )}

            {/* =============================================
                FREE
            ============================================= */}

            {!cargandoPlan &&
              !esPremium && (
                <section
                  className="
                    mt-6
                    rounded-[30px]
                    border
                    border-[#E1D7FF]
                    bg-gradient-to-br
                    from-[#FBF9FF]
                    via-white
                    to-[#F1F8FF]
                    p-7
                    text-center
                    shadow-[0_18px_45px_rgba(86,72,160,0.08)]
                    dark:border-violet-900/30
                    dark:from-[#211C36]
                    dark:via-[#121F31]
                    dark:to-[#13263C]
                    sm:p-10
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
                    <Lock
                      size={34}
                    />
                  </div>

                  <h2
                    className="
                      mt-5
                      text-3xl
                      font-black
                      sm:text-4xl
                    "
                  >
                    Esta herramienta es Premium
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
                    Para subir materiales y generar Organizadores Visuales necesitas tener una suscripción Raccoon Premium activa.
                  </p>

                  <Link
                    href="/suscripcion"
                    className="
                      mt-7
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
                </section>
              )}

            {/* =============================================
                PREMIUM
            ============================================= */}

            {!cargandoPlan &&
              esPremium && (
                <section
                  className="
                    mt-6
                    grid
                    gap-6
                    xl:grid-cols-[minmax(0,1fr)_360px]
                  "
                >
                  {/* =====================================
                      IZQUIERDA
                  ===================================== */}

                  <div
                    className="
                      min-w-0
                      space-y-5
                    "
                  >
                    {/* ===================================
                        PASO 1
                    =================================== */}

                    <section
                      className="
                        rounded-[28px]
                        border
                        border-[#E0E7F1]
                        bg-white
                        p-5
                        shadow-[0_12px_30px_rgba(35,75,120,0.05)]
                        dark:border-slate-700
                        dark:bg-[#121F31]
                        sm:p-6
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >
                        <div
                          className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            from-[#5E6CF2]
                            to-[#7652D9]
                            text-sm
                            font-black
                            text-white
                          "
                        >
                          1
                        </div>

                        <div>
                          <h3
                            className="
                              text-lg
                              font-black
                            "
                          >
                            Sube tu material
                          </h3>

                          <p
                            className="
                              text-xs
                              text-[#7489A1]
                              dark:text-slate-400
                            "
                          >
                            PDF, DOCX, PPTX o TXT · máximo 20 MB
                          </p>
                        </div>
                      </div>

                      <label
                        htmlFor="archivo-organizador"
                        className={`
                          mt-5
                          flex
                          min-h-[220px]
                          cursor-pointer
                          flex-col
                          items-center
                          justify-center
                          rounded-[24px]
                          border-2
                          border-dashed
                          px-5
                          text-center
                          transition-all
                          duration-300

                          ${
                            archivo
                              ? `
                                border-emerald-300
                                bg-gradient-to-br
                                from-emerald-50
                                via-white
                                to-blue-50
                                dark:from-emerald-950/20
                                dark:via-[#101B2C]
                                dark:to-blue-950/20
                              `
                              : `
                                border-[#AFC3FF]
                                bg-gradient-to-br
                                from-[#FAFBFF]
                                to-[#F9F5FF]
                                hover:-translate-y-0.5
                                hover:border-[#7652D9]
                                hover:shadow-md
                                dark:border-slate-600
                                dark:from-[#0E1929]
                                dark:to-[#17172B]
                              `
                          }
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-full
                            shadow-sm

                            ${
                              archivo
                                ? `
                                  bg-emerald-100
                                  text-emerald-600
                                `
                                : `
                                  bg-[#ECE7FF]
                                  text-[#7652D9]
                                  dark:bg-violet-950/30
                                `
                            }
                          `}
                        >
                          {archivo ? (
                            <CircleCheckBig
                              size={30}
                            />
                          ) : (
                            <Upload
                              size={30}
                            />
                          )}
                        </div>

                        <p
                          className="
                            mt-4
                            max-w-full
                            break-words
                            text-base
                            font-black
                          "
                        >
                          {archivo
                            ? archivo.name
                            : "Arrastra tu archivo aquí"}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-[#8494A8]
                            dark:text-slate-400
                          "
                        >
                          {archivo
                            ? "Tu material está listo para analizar"
                            : "o selecciónalo desde tu dispositivo"}
                        </p>

                        {!archivo && (
                          <span
                            className="
                              mt-4
                              rounded-xl
                              bg-gradient-to-r
                              from-[#4169F2]
                              to-[#7652D9]
                              px-5
                              py-2.5
                              text-xs
                              font-black
                              text-white
                              shadow-[0_8px_18px_rgba(93,82,217,0.22)]
                            "
                          >
                            Seleccionar archivo
                          </span>
                        )}
                      </label>

                      <input
                        id="archivo-organizador"
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.pptx,.txt"
                        onChange={
                          seleccionarArchivo
                        }
                      />

                      {archivo && (
                        <div
                          className="
                            mt-4
                            flex
                            flex-col
                            gap-3
                            rounded-2xl
                            border
                            border-[#E4EAF2]
                            bg-[#FAFCFF]
                            p-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            dark:border-slate-700
                            dark:bg-[#0E1929]
                          "
                        >
                          <div
                            className="
                              flex
                              min-w-0
                              items-center
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
                                bg-red-100
                                text-red-500
                              "
                            >
                              <FileText
                                size={19}
                              />
                            </div>

                            <div
                              className="
                                min-w-0
                              "
                            >
                              <p
                                className="
                                  truncate
                                  text-sm
                                  font-black
                                "
                              >
                                {
                                  archivo.name
                                }
                              </p>

                              <p
                                className="
                                  text-[10px]
                                  text-[#8091A5]
                                  dark:text-slate-400
                                "
                              >
                                {(
                                  archivo.size /
                                  1024 /
                                  1024
                                ).toFixed(
                                  2
                                )}{" "}
                                MB
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setArchivo(
                                null
                              )
                            }
                            className="
                              rounded-xl
                              px-4
                              py-2
                              text-xs
                              font-black
                              text-red-500
                              hover:bg-red-50
                              dark:hover:bg-red-950/20
                            "
                          >
                            Quitar
                          </button>
                        </div>
                      )}
                    </section>

                    {/* ===================================
                        PASO 2
                    =================================== */}

                    <section
                      className="
                        rounded-[28px]
                        border
                        border-[#E0E7F1]
                        bg-white
                        p-5
                        shadow-[0_12px_30px_rgba(35,75,120,0.05)]
                        dark:border-slate-700
                        dark:bg-[#121F31]
                        sm:p-6
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-4
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                          "
                        >
                          <div
                            className="
                              flex
                              h-11
                              w-11
                              items-center
                              justify-center
                              rounded-xl
                              bg-gradient-to-br
                              from-[#38A7F5]
                              to-[#3978F6]
                              text-sm
                              font-black
                              text-white
                            "
                          >
                            2
                          </div>

                          <div>
                            <h3
                              className="
                                text-lg
                                font-black
                              "
                            >
                              Elige el organizador
                            </h3>

                            <p
                              className="
                                text-xs
                                text-[#7489A1]
                                dark:text-slate-400
                              "
                            >
                              Selecciónalo tú o deja que Raccoon IA te ayude
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={
                            recomendarOrganizador
                          }
                          disabled={
                            recomendando ||
                            !archivo
                          }
                          className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-gradient-to-r
                            from-[#F0ECFF]
                            to-[#E8F4FF]
                            px-4
                            py-2.5
                            text-xs
                            font-black
                            text-[#7652D9]
                            transition
                            hover:shadow-md
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            dark:from-violet-950/30
                            dark:to-blue-950/20
                            dark:text-violet-200
                          "
                        >
                          {recomendando ? (
                            <LoaderCircle
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <WandSparkles
                              size={16}
                            />
                          )}

                          {recomendando
                            ? "Analizando..."
                            : "Recomendarme uno"}
                        </button>
                      </div>

                      <div
                        className="
                          mt-5
                          grid
                          gap-3
                          sm:grid-cols-2
                          lg:grid-cols-3
                        "
                      >
                        {opciones.map(
                          (
                            opcion
                          ) => {
                            const Icono =
                              opcion.icono;

                            const activo =
                              tipo ===
                              opcion.id;

                            return (
                              <button
                                key={
                                  opcion.id
                                }
                                type="button"
                                onClick={() =>
                                  setTipo(
                                    opcion.id
                                  )
                                }
                                className={`
                                  relative
                                  overflow-hidden
                                  rounded-[20px]
                                  border
                                  p-4
                                  text-left
                                  transition-all
                                  duration-300

                                  ${
                                    activo
                                      ? `
                                        scale-[1.02]
                                        border-[#7652D9]
                                        bg-gradient-to-br
                                        from-[#F4F0FF]
                                        to-[#EEF5FF]
                                        shadow-[0_10px_25px_rgba(98,82,217,0.12)]
                                        dark:from-violet-950/20
                                        dark:to-blue-950/20
                                      `
                                      : `
                                        border-[#E3E9F1]
                                        bg-white
                                        hover:-translate-y-1
                                        hover:border-[#C4D1E7]
                                        hover:shadow-md
                                        dark:border-slate-700
                                        dark:bg-[#0E1929]
                                      `
                                  }
                                `}
                              >
                                {activo && (
                                  <div
                                    className="
                                      absolute
                                      right-3
                                      top-3
                                      flex
                                      h-6
                                      w-6
                                      items-center
                                      justify-center
                                      rounded-full
                                      bg-[#7652D9]
                                      text-white
                                    "
                                  >
                                    <Check
                                      size={13}
                                    />
                                  </div>
                                )}

                                <div
                                  className={`
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl

                                    ${
                                      opcion.fondo
                                    }

                                    ${
                                      opcion.color
                                    }
                                  `}
                                >
                                  <Icono
                                    size={21}
                                  />
                                </div>

                                <p
                                  className="
                                    mt-3
                                    text-sm
                                    font-black
                                  "
                                >
                                  {
                                    opcion.titulo
                                  }
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-[10px]
                                    leading-4
                                    text-[#7B8DA3]
                                    dark:text-slate-400
                                  "
                                >
                                  {
                                    opcion.descripcion
                                  }
                                </p>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </section>

                    {/* ===================================
                        PASO 3
                    =================================== */}

                    <section
                      className="
                        rounded-[28px]
                        border
                        border-[#E0E7F1]
                        bg-white
                        p-5
                        shadow-[0_12px_30px_rgba(35,75,120,0.05)]
                        dark:border-slate-700
                        dark:bg-[#121F31]
                        sm:p-6
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >
                        <div
                          className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            from-[#19B879]
                            to-[#35C98C]
                            text-sm
                            font-black
                            text-white
                          "
                        >
                          3
                        </div>

                        <div>
                          <h3
                            className="
                              text-lg
                              font-black
                            "
                          >
                            Nivel de detalle
                          </h3>

                          <p
                            className="
                              text-xs
                              text-[#7489A1]
                              dark:text-slate-400
                            "
                          >
                            Elige cuánto contenido quieres mostrar
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          mt-5
                          grid
                          gap-3
                          sm:grid-cols-3
                        "
                      >
                        {[
                          {
                            id:
                              "basico",
                            nombre:
                              "Básico",
                            texto:
                              "Ideas principales y estructura ligera.",
                            fondo:
                              "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
                          },
                          {
                            id:
                              "intermedio",
                            nombre:
                              "Intermedio",
                            texto:
                              "Más conceptos, ramas y relaciones.",
                            fondo:
                              "from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20",
                          },
                          {
                            id:
                              "profundo",
                            nombre:
                              "Profundo",
                            texto:
                              "Mayor detalle, subtemas y conexiones.",
                            fondo:
                              "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
                          },
                        ].map(
                          (
                            item
                          ) => {
                            const activo =
                              nivel ===
                              item.id;

                            return (
                              <button
                                key={
                                  item.id
                                }
                                type="button"
                                onClick={() =>
                                  setNivel(
                                    item.id as NivelDetalle
                                  )
                                }
                                className={`
                                  relative
                                  rounded-[20px]
                                  border
                                  bg-gradient-to-br
                                  p-4
                                  text-left
                                  transition-all

                                  ${
                                    activo
                                      ? `
                                        scale-[1.02]
                                        border-[#7652D9]
                                        shadow-md
                                      `
                                      : `
                                        border-[#E3E9F1]
                                        hover:-translate-y-1
                                        dark:border-slate-700
                                      `
                                  }

                                  ${
                                    item.fondo
                                  }
                                `}
                              >
                                {activo && (
                                  <div
                                    className="
                                      absolute
                                      right-3
                                      top-3
                                      flex
                                      h-6
                                      w-6
                                      items-center
                                      justify-center
                                      rounded-full
                                      bg-[#7652D9]
                                      text-white
                                    "
                                  >
                                    <Check
                                      size={13}
                                    />
                                  </div>
                                )}

                                <p
                                  className="
                                    text-sm
                                    font-black
                                  "
                                >
                                  {
                                    item.nombre
                                  }
                                </p>

                                <p
                                  className="
                                    mt-1
                                    pr-5
                                    text-[10px]
                                    leading-4
                                    text-[#7B8DA3]
                                    dark:text-slate-400
                                  "
                                >
                                  {
                                    item.texto
                                  }
                                </p>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </section>
                  </div>

                  {/* =====================================
                      DERECHA
                  ===================================== */}

                  <aside
                    className="
                      min-w-0
                      space-y-5
                      xl:sticky
                      xl:top-[95px]
                      xl:self-start
                    "
                  >
                    {/* SELECCIÓN */}

                    <section
                      className="
                        rounded-[28px]
                        border
                        border-[#E0E7F1]
                        bg-white
                        p-5
                        shadow-[0_12px_30px_rgba(35,75,120,0.05)]
                        dark:border-slate-700
                        dark:bg-[#121F31]
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <div>
                          <p
                            className="
                              text-[10px]
                              font-black
                              uppercase
                              tracking-[0.14em]
                              text-[#8293A8]
                            "
                          >
                            Tu selección
                          </p>

                          <h3
                            className="
                              mt-1
                              text-lg
                              font-black
                            "
                          >
                            {
                              opcionActual?.titulo
                            }
                          </h3>
                        </div>

                        {opcionActual &&
                          (() => {
                            const Icono =
                              opcionActual.icono;

                            return (
                              <div
                                className={`
                                  flex
                                  h-12
                                  w-12
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl

                                  ${
                                    opcionActual.fondo
                                  }

                                  ${
                                    opcionActual.color
                                  }
                                `}
                              >
                                <Icono
                                  size={22}
                                />
                              </div>
                            );
                          })()}
                      </div>

                      <div
                        className="
                          relative
                          mt-5
                          overflow-hidden
                          rounded-[22px]
                          bg-gradient-to-br
                          from-[#F1EBFF]
                          via-[#EDF4FF]
                          to-[#EAF9FF]
                          p-5
                          dark:from-[#28223D]
                          dark:via-[#1B2940]
                          dark:to-[#173148]
                        "
                      >
                        <Sparkles
                          size={18}
                          className="
                            absolute
                            right-5
                            top-5
                            text-yellow-400
                          "
                        />

                        <Image
                          src="/raccoon.png"
                          alt="Raccoon IA"
                          width={130}
                          height={130}
                          className="
                            mx-auto
                            h-[118px]
                            w-[118px]
                            object-contain
                          "
                        />

                        <p
                          className="
                            mt-3
                            text-center
                            text-xs
                            leading-5
                            text-[#627A96]
                            dark:text-slate-300
                          "
                        >
                          Raccoon IA estructurará automáticamente la información según el formato seleccionado.
                        </p>
                      </div>
                    </section>

                    {/* PREPARACIÓN */}

                    <section
                      className="
                        rounded-[28px]
                        border
                        border-[#E0E7F1]
                        bg-white
                        p-5
                        shadow-[0_12px_30px_rgba(35,75,120,0.05)]
                        dark:border-slate-700
                        dark:bg-[#121F31]
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >
                        <h3
                          className="
                            font-black
                          "
                        >
                          Preparación
                        </h3>

                        <Sparkles
                          size={18}
                          className="text-[#7652D9]"
                        />
                      </div>

                      <div
                        className="
                          mt-4
                          space-y-3
                        "
                      >
                        {[
                          {
                            nombre:
                              "Material cargado",
                            listo:
                              Boolean(
                                archivo
                              ),
                          },
                          {
                            nombre:
                              "Organizador elegido",
                            listo:
                              Boolean(
                                tipo
                              ),
                          },
                          {
                            nombre:
                              "Nivel configurado",
                            listo:
                              Boolean(
                                nivel
                              ),
                          },
                        ].map(
                          (
                            item
                          ) => (
                            <div
                              key={
                                item.nombre
                              }
                              className="
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                bg-[#FAFCFF]
                                p-3
                                dark:bg-[#0E1929]
                              "
                            >
                              <div
                                className={`
                                  flex
                                  h-7
                                  w-7
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  border

                                  ${
                                    item.listo
                                      ? `
                                        border-emerald-400
                                        bg-emerald-100
                                        text-emerald-600
                                      `
                                      : `
                                        border-[#D8E0EA]
                                        text-[#A0ADBC]
                                      `
                                  }
                                `}
                              >
                                {item.listo && (
                                  <Check
                                    size={14}
                                  />
                                )}
                              </div>

                              <span
                                className="
                                  text-xs
                                  font-bold
                                "
                              >
                                {
                                  item.nombre
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      {mensajeProceso && (
                        <div
                          className="
                            mt-5
                            rounded-xl
                            border
                            border-violet-100
                            bg-[#F4F0FF]
                            p-3
                            text-xs
                            font-bold
                            leading-5
                            text-[#7652D9]
                            dark:border-violet-900/30
                            dark:bg-violet-950/20
                            dark:text-violet-200
                          "
                        >
                          {
                            mensajeProceso
                          }
                        </div>
                      )}

                      {generando && (
                        <div
                          className="
                            mt-5
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              text-xs
                              font-bold
                              text-[#617892]
                              dark:text-slate-300
                            "
                          >
                            <span
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                              />

                              Generando...
                            </span>

                            <span>
                              {
                                progreso
                              }
                              %
                            </span>
                          </div>

                          <div
                            className="
                              mt-3
                              h-2.5
                              overflow-hidden
                              rounded-full
                              bg-[#E6ECF4]
                              dark:bg-slate-700
                            "
                          >
                            <div
                              className="
                                h-full
                                rounded-full
                                bg-gradient-to-r
                                from-[#3978F6]
                                via-[#5E63F2]
                                to-[#7652D9]
                                transition-all
                                duration-500
                              "
                              style={{
                                width:
                                  `${progreso}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={
                          generarOrganizador
                        }
                        disabled={
                          generando ||
                          !archivo
                        }
                        className="
                          mt-5
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-[16px]
                          bg-gradient-to-r
                          from-[#357AF7]
                          via-[#5A68F1]
                          to-[#7C4FE5]
                          px-5
                          py-4
                          text-sm
                          font-black
                          text-white
                          shadow-[0_12px_30px_rgba(93,82,217,0.28)]
                          transition
                          hover:-translate-y-0.5
                          hover:brightness-110
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {generando ? (
                          <LoaderCircle
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <Sparkles
                            size={18}
                          />
                        )}

                        {generando
                          ? "Creando..."
                          : "Generar mi organizador"}
                      </button>
                    </section>
                  </aside>
                </section>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}