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
  FolderOpen,
  Search,
  RefreshCw,
  Cloud,
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

interface Material {
  id: string;
  nombre_archivo: string;
  url_archivo: string;
  progreso: number;
  fecha_subida: string;
  usuario_id: string;
}

type ModoMaterial =
  | "existentes"
  | "nuevo";

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

function obtenerExtension(
  nombre: string
): string {
  return (
    nombre
      .split(".")
      .pop()
      ?.toLowerCase() || ""
  );
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
    return "Reciente";
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

function normalizarMaterial(
  dato: Record<string, unknown>
): Material {
  return {
    id:
      String(
        dato.id || ""
      ),

    nombre_archivo:
      typeof dato.nombre_archivo ===
      "string"
        ? dato.nombre_archivo
        : "Material sin nombre",

    url_archivo:
      typeof dato.url_archivo ===
      "string"
        ? dato.url_archivo
        : "",

    progreso:
      Number.isFinite(
        Number(
          dato.progreso
        )
      )
        ? Number(
            dato.progreso
          )
        : 0,

    fecha_subida:
      typeof dato.fecha_subida ===
      "string"
        ? dato.fecha_subida
        : new Date().toISOString(),

    usuario_id:
      typeof dato.usuario_id ===
      "string"
        ? dato.usuario_id
        : "",
  };
}

function materialCompatible(
  material: Material
): boolean {
  return [
    "pdf",
    "docx",
    "pptx",
    "txt",
  ].includes(
    obtenerExtension(
      material.nombre_archivo
    )
  );
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
    materiales,
    setMateriales,
  ] =
    useState<Material[]>(
      []
    );

  const [
    cargandoMateriales,
    setCargandoMateriales,
  ] =
    useState(true);

  const [
    materialSeleccionado,
    setMaterialSeleccionado,
  ] =
    useState<Material | null>(
      null
    );

  const [
    modoMaterial,
    setModoMaterial,
  ] =
    useState<ModoMaterial>(
      "existentes"
    );

  const [
    busquedaMaterial,
    setBusquedaMaterial,
  ] =
    useState("");

  const [
    subiendoMaterial,
    setSubiendoMaterial,
  ] =
    useState(false);

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

        const usuarioId =
          await obtenerUsuarioYPlan();

        if (
          usuarioId
        ) {
          await obtenerMateriales(
            usuarioId
          );
        }
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

  const materialesFiltrados =
    useMemo(
      () => {
        const termino =
          busquedaMaterial
            .trim()
            .toLowerCase();

        return materiales.filter(
          (
            material
          ) =>
            !termino ||
            material.nombre_archivo
              .toLowerCase()
              .includes(
                termino
              )
        );
      },
      [
        materiales,
        busquedaMaterial,
      ]
    );

  const hayMaterial =
    Boolean(
      archivo ||
      materialSeleccionado
    );

  /* ===================================================
     MATERIALES
  =================================================== */

  const obtenerMateriales =
    async (
      usuarioId: string
    ) => {
      try {
        setCargandoMateriales(
          true
        );

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "materiales"
            )
            .select(
              "*"
            )
            .eq(
              "usuario_id",
              usuarioId
            )
            .order(
              "fecha_subida",
              {
                ascending:
                  false,
              }
            );

        if (
          error
        ) {
          throw new Error(
            error.message
          );
        }

        const lista =
          (
            data || []
          ).map(
            (
              material
            ) =>
              normalizarMaterial(
                material as Record<
                  string,
                  unknown
                >
              )
          );

        setMateriales(
          lista
        );

        const params =
          new URLSearchParams(
            window.location.search
          );

        const materialParam =
          params.get(
            "material"
          );

        let idPendiente =
          materialParam ||
          "";

        const guardado =
          localStorage.getItem(
            "raccoon-material-seleccionado"
          );

        if (
          !idPendiente &&
          guardado
        ) {
          try {
            const pendiente =
              JSON.parse(
                guardado
              ) as {
                id?: string;
                material_id?: string;
              };

            idPendiente =
              pendiente.material_id ||
              pendiente.id ||
              "";
          } catch {
            // Ignora un valor local inválido.
          }
        }

        if (
          idPendiente
        ) {
          const encontrado =
            lista.find(
              (
                material
              ) =>
                material.id ===
                idPendiente
            );

          if (
            encontrado &&
            materialCompatible(
              encontrado
            )
          ) {
            seleccionarMaterialExistente(
              encontrado,
              false
            );
          }
        }
      } catch (
        error
      ) {
        console.error(
          "Error cargando materiales:",
          error
        );

        mostrarNotificacion(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar tus materiales."
        );
      } finally {
        setCargandoMateriales(
          false
        );
      }
    };

  const seleccionarMaterialExistente =
    (
      material: Material,
      notificar = true
    ) => {
      if (
        !materialCompatible(
          material
        )
      ) {
        mostrarNotificacion(
          "Este material no es compatible con Organizadores Visuales."
        );

        return;
      }

      setMaterialSeleccionado(
        material
      );

      setArchivo(
        null
      );

      setModoMaterial(
        "existentes"
      );

      setMensajeProceso(
        ""
      );

      localStorage.setItem(
        "raccoon-material-seleccionado",
        JSON.stringify({
          id:
            material.id,

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

          origen:
            "organizadores",
        })
      );

      if (
        notificar
      ) {
        mostrarNotificacion(
          "Material seleccionado."
        );
      }
    };

  const seleccionarArchivo =
    async (
      evento: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (
        !esPremium
      ) {
        router.push(
          "/suscripcion"
        );

        return;
      }

      const nuevoArchivo =
        evento.target.files?.[0];

      if (
        !nuevoArchivo ||
        subiendoMaterial
      ) {
        return;
      }

      const extension =
        obtenerExtension(
          nuevoArchivo.name
        );

      const extensionesPermitidas =
        [
          "pdf",
          "docx",
          "pptx",
          "txt",
        ];

      if (
        !extensionesPermitidas.includes(
          extension
        )
      ) {
        mostrarNotificacion(
          "Solo puedes usar PDF, DOCX, PPTX o TXT."
        );

        evento.target.value =
          "";

        return;
      }

      if (
        nuevoArchivo.size ===
        0
      ) {
        mostrarNotificacion(
          "El archivo está vacío."
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

      let rutaStorage =
        "";

      try {
        setSubiendoMaterial(
          true
        );

        setMensajeProceso(
          "Guardando el material en tu biblioteca..."
        );

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (
          !user
        ) {
          router.replace(
            "/Login"
          );

          return;
        }

        const nombreSeguro =
          nuevoArchivo.name
            .normalize(
              "NFD"
            )
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
          "randomUUID" in
            crypto
            ? crypto.randomUUID()
            : Date.now().toString();

        rutaStorage =
          `${user.id}/${identificador}-${nombreSeguro}`;

        const {
          error:
            errorStorage,
        } =
          await supabase.storage
            .from(
              "materiales"
            )
            .upload(
              rutaStorage,
              nuevoArchivo,
              {
                upsert:
                  false,

                cacheControl:
                  "3600",

                contentType:
                  nuevoArchivo.type ||
                  "application/octet-stream",
              }
            );

        if (
          errorStorage
        ) {
          throw new Error(
            `No se pudo subir el archivo: ${errorStorage.message}`
          );
        }

        const {
          data:
            urlData,
        } =
          supabase.storage
            .from(
              "materiales"
            )
            .getPublicUrl(
              rutaStorage
            );

        const {
          data:
            materialInsertado,
          error:
            errorBaseDatos,
        } =
          await supabase
            .from(
              "materiales"
            )
            .insert({
              usuario_id:
                user.id,

              nombre_archivo:
                nuevoArchivo.name,

              url_archivo:
                urlData.publicUrl,

              progreso:
                0,
            })
            .select(
              "*"
            )
            .single();

        if (
          errorBaseDatos
        ) {
          await supabase.storage
            .from(
              "materiales"
            )
            .remove(
              [
                rutaStorage,
              ]
            );

          throw new Error(
            `No se pudo guardar el material: ${errorBaseDatos.message}`
          );
        }

        if (
          !materialInsertado
        ) {
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
          (
            anteriores
          ) => [
            nuevoMaterial,
            ...anteriores,
          ]
        );

        setArchivo(
          nuevoArchivo
        );

        setMaterialSeleccionado(
          nuevoMaterial
        );

        localStorage.setItem(
          "raccoon-material-seleccionado",
          JSON.stringify({
            id:
              nuevoMaterial.id,

            material_id:
              nuevoMaterial.id,

            titulo:
              nuevoMaterial.nombre_archivo,

            nombre_archivo:
              nuevoMaterial.nombre_archivo,

            url_archivo:
              nuevoMaterial.url_archivo,

            progreso:
              nuevoMaterial.progreso,

            fecha_subida:
              nuevoMaterial.fecha_subida,

            origen:
              "organizadores",
          })
        );

        setMensajeProceso(
          ""
        );

        mostrarNotificacion(
          "Material guardado y seleccionado."
        );
      } catch (
        error
      ) {
        console.error(
          "Error subiendo material:",
          error
        );

        mostrarNotificacion(
          error instanceof Error
            ? error.message
            : "No se pudo subir el material."
        );

        setArchivo(
          null
        );
      } finally {
        setSubiendoMaterial(
          false
        );

        evento.target.value =
          "";
      }
    };

  const obtenerArchivoParaIA =
    async (): Promise<
      File | null
    > => {
      if (
        archivo
      ) {
        return archivo;
      }

      if (
        !materialSeleccionado
      ) {
        return null;
      }

      if (
        !materialSeleccionado.url_archivo
      ) {
        throw new Error(
          "El material seleccionado no tiene una URL válida."
        );
      }

      setMensajeProceso(
        "Preparando tu material guardado..."
      );

      const respuesta =
        await fetch(
          materialSeleccionado.url_archivo,
          {
            cache:
              "no-store",
          }
        );

      if (
        !respuesta.ok
      ) {
        throw new Error(
          "No se pudo descargar el material guardado."
        );
      }

      const blob =
        await respuesta.blob();

      return new File(
        [
          blob,
        ],
        materialSeleccionado.nombre_archivo,
        {
          type:
            blob.type ||
            "application/octet-stream",
        }
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
          "/suscripcion"
        );

        return;
      }

      if (
        !archivo &&
        !materialSeleccionado
      ) {
        mostrarNotificacion(
          "Selecciona uno de tus materiales o sube uno nuevo."
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

        const archivoIA =
          await obtenerArchivoParaIA();

        if (
          !archivoIA
        ) {
          throw new Error(
            "No se pudo preparar el material."
          );
        }

        const formData =
          new FormData();

        formData.append(
          "archivo",
          archivoIA
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
          "/suscripcion"
        );

        return;
      }

      if (
        !archivo &&
        !materialSeleccionado
      ) {
        mostrarNotificacion(
          "Selecciona uno de tus materiales o sube uno nuevo."
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

        const archivoIA =
          await obtenerArchivoParaIA();

        if (
          !archivoIA
        ) {
          throw new Error(
            "No se pudo preparar el material."
          );
        }

        const formData =
          new FormData();

        formData.append(
          "archivo",
          archivoIA
        );

        formData.append(
          "tipo",
          tipo
        );

        formData.append(
          "nivel",
          nivel
        );

        if (
          materialSeleccionado
        ) {
          formData.append(
            "material_id",
            materialSeleccionado.id
          );
        }

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
              "/suscripcion"
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

        const nombreMaterial =
          archivoIA.name;

        sessionStorage.setItem(
          "organizador-generado",
          JSON.stringify(
            datos
          )
        );

        sessionStorage.setItem(
          "organizador-archivo",
          nombreMaterial
        );

        if (
          materialSeleccionado
        ) {
          sessionStorage.setItem(
            "organizador-material",
            JSON.stringify(
              materialSeleccionado
            )
          );
        }

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
                              Elige tu material
                            </h3>

                            <p
                              className="
                                text-xs
                                text-[#7489A1]
                                dark:text-slate-400
                              "
                            >
                              Usa uno que ya subiste o agrega uno nuevo
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            const {
                              data: {
                                user,
                              },
                            } =
                              await supabase.auth.getUser();

                            if (
                              user
                            ) {
                              await obtenerMateriales(
                                user.id
                              );
                            }
                          }}
                          disabled={
                            cargandoMateriales
                          }
                          className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-[#DDE6F0]
                            bg-white
                            px-4
                            py-2.5
                            text-xs
                            font-black
                            text-[#52708F]
                            transition
                            hover:bg-[#F5F8FC]
                            disabled:opacity-50
                            dark:border-slate-700
                            dark:bg-[#0E1929]
                            dark:text-slate-300
                          "
                        >
                          <RefreshCw
                            size={15}
                            className={
                              cargandoMateriales
                                ? "animate-spin"
                                : ""
                            }
                          />

                          Actualizar
                        </button>
                      </div>

                      <div
                        className="
                          mt-5
                          grid
                          grid-cols-2
                          gap-2
                          rounded-[16px]
                          bg-[#F4F7FB]
                          p-1.5
                          dark:bg-[#0E1929]
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setModoMaterial(
                              "existentes"
                            )
                          }
                          className={`
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            px-4
                            py-3
                            text-xs
                            font-black
                            transition

                            ${
                              modoMaterial ===
                              "existentes"
                                ? `
                                  bg-white
                                  text-[#3978F6]
                                  shadow-sm
                                  dark:bg-[#19283C]
                                  dark:text-blue-300
                                `
                                : `
                                  text-[#7489A1]
                                  dark:text-slate-400
                                `
                            }
                          `}
                        >
                          <FolderOpen
                            size={16}
                          />

                          Mis materiales
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setModoMaterial(
                              "nuevo"
                            )
                          }
                          className={`
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            px-4
                            py-3
                            text-xs
                            font-black
                            transition

                            ${
                              modoMaterial ===
                              "nuevo"
                                ? `
                                  bg-white
                                  text-[#7652D9]
                                  shadow-sm
                                  dark:bg-[#19283C]
                                  dark:text-violet-300
                                `
                                : `
                                  text-[#7489A1]
                                  dark:text-slate-400
                                `
                            }
                          `}
                        >
                          <Upload
                            size={16}
                          />

                          Subir nuevo
                        </button>
                      </div>

                      {modoMaterial ===
                        "existentes" && (
                        <div
                          className="
                            mt-5
                          "
                        >
                          <div
                            className="
                              relative
                            "
                          >
                            <Search
                              size={17}
                              className="
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-[#8A9CB0]
                              "
                            />

                            <input
                              value={
                                busquedaMaterial
                              }
                              onChange={(
                                evento
                              ) =>
                                setBusquedaMaterial(
                                  evento.target.value
                                )
                              }
                              placeholder="Buscar entre tus materiales..."
                              className="
                                w-full
                                rounded-[15px]
                                border
                                border-[#DEE6EF]
                                bg-[#FAFCFF]
                                py-3
                                pl-11
                                pr-4
                                text-sm
                                text-[#17304E]
                                outline-none
                                transition
                                focus:border-[#6D69F2]
                                dark:border-slate-700
                                dark:bg-[#0E1929]
                                dark:text-white
                              "
                            />
                          </div>

                          {cargandoMateriales ? (
                            <div
                              className="
                                flex
                                min-h-[180px]
                                items-center
                                justify-center
                              "
                            >
                              <div
                                className="
                                  text-center
                                "
                              >
                                <LoaderCircle
                                  size={28}
                                  className="
                                    mx-auto
                                    animate-spin
                                    text-[#7652D9]
                                  "
                                />

                                <p
                                  className="
                                    mt-3
                                    text-xs
                                    font-bold
                                    text-[#7A8EA5]
                                  "
                                >
                                  Cargando tus materiales...
                                </p>
                              </div>
                            </div>
                          ) : materialesFiltrados.length ===
                            0 ? (
                            <div
                              className="
                                mt-4
                                rounded-[20px]
                                border
                                border-dashed
                                border-[#D7E1EC]
                                bg-[#FAFCFF]
                                p-8
                                text-center
                                dark:border-slate-700
                                dark:bg-[#0E1929]
                              "
                            >
                              <FolderOpen
                                size={30}
                                className="
                                  mx-auto
                                  text-[#8EA0B4]
                                "
                              />

                              <p
                                className="
                                  mt-3
                                  text-sm
                                  font-black
                                "
                              >
                                No encontramos materiales
                              </p>

                              <p
                                className="
                                  mt-1
                                  text-xs
                                  text-[#7B8EA4]
                                  dark:text-slate-400
                                "
                              >
                                Sube uno nuevo y quedará guardado para usarlo después.
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  setModoMaterial(
                                    "nuevo"
                                  )
                                }
                                className="
                                  mt-4
                                  rounded-xl
                                  bg-[#7652D9]
                                  px-5
                                  py-2.5
                                  text-xs
                                  font-black
                                  text-white
                                "
                              >
                                Subir material
                              </button>
                            </div>
                          ) : (
                            <div
                              className="
                                mt-4
                                grid
                                max-h-[360px]
                                gap-3
                                overflow-y-auto
                                pr-1
                                sm:grid-cols-2
                              "
                            >
                              {materialesFiltrados.map(
                                (
                                  material
                                ) => {
                                  const seleccionado =
                                    materialSeleccionado?.id ===
                                    material.id;

                                  const compatible =
                                    materialCompatible(
                                      material
                                    );

                                  const extension =
                                    obtenerExtension(
                                      material.nombre_archivo
                                    ).toUpperCase();

                                  return (
                                    <button
                                      key={
                                        material.id
                                      }
                                      type="button"
                                      disabled={
                                        !compatible
                                      }
                                      onClick={() =>
                                        seleccionarMaterialExistente(
                                          material
                                        )
                                      }
                                      className={`
                                        relative
                                        min-w-0
                                        rounded-[18px]
                                        border
                                        p-4
                                        text-left
                                        transition-all

                                        ${
                                          seleccionado
                                            ? `
                                              border-[#6D69F2]
                                              bg-gradient-to-br
                                              from-[#F2EEFF]
                                              to-[#EDF6FF]
                                              shadow-[0_10px_24px_rgba(86,79,215,0.12)]
                                              dark:from-violet-950/25
                                              dark:to-blue-950/20
                                            `
                                            : `
                                              border-[#E2E9F1]
                                              bg-white
                                              hover:-translate-y-0.5
                                              hover:border-[#B9C9DD]
                                              hover:shadow-md
                                              dark:border-slate-700
                                              dark:bg-[#0E1929]
                                            `
                                        }

                                        ${
                                          !compatible
                                            ? "cursor-not-allowed opacity-50"
                                            : ""
                                        }
                                      `}
                                    >
                                      {seleccionado && (
                                        <span
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
                                        </span>
                                      )}

                                      <div
                                        className="
                                          flex
                                          items-start
                                          gap-3
                                        "
                                      >
                                        <div
                                          className="
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-[#EAF3FF]
                                            text-[#3978F6]
                                            dark:bg-blue-950/30
                                            dark:text-blue-300
                                          "
                                        >
                                          <FileText
                                            size={20}
                                          />
                                        </div>

                                        <div
                                          className="
                                            min-w-0
                                            pr-7
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
                                              material.nombre_archivo
                                            }
                                          </p>

                                          <div
                                            className="
                                              mt-2
                                              flex
                                              flex-wrap
                                              items-center
                                              gap-2
                                              text-[10px]
                                              text-[#8395AA]
                                              dark:text-slate-400
                                            "
                                          >
                                            <span
                                              className="
                                                rounded-full
                                                bg-[#EEF4FB]
                                                px-2
                                                py-1
                                                font-black
                                                text-[#58718E]
                                                dark:bg-slate-800
                                                dark:text-slate-300
                                              "
                                            >
                                              {
                                                extension ||
                                                "FILE"
                                              }
                                            </span>

                                            <span>
                                              {
                                                formatearFecha(
                                                  material.fecha_subida
                                                )
                                              }
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {!compatible && (
                                        <p
                                          className="
                                            mt-3
                                            text-[10px]
                                            font-bold
                                            text-amber-600
                                            dark:text-amber-300
                                          "
                                        >
                                          Formato no compatible con esta herramienta.
                                        </p>
                                      )}
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {modoMaterial ===
                        "nuevo" && (
                        <div
                          className="
                            mt-5
                          "
                        >
                          <label
                            htmlFor="archivo-organizador"
                            className={`
                              flex
                              min-h-[230px]
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

                              ${
                                subiendoMaterial
                                  ? `
                                    cursor-wait
                                    border-violet-300
                                    bg-violet-50
                                    dark:bg-violet-950/20
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
                              className="
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-full
                                bg-[#ECE7FF]
                                text-[#7652D9]
                                shadow-sm
                                dark:bg-violet-950/30
                              "
                            >
                              {subiendoMaterial ? (
                                <LoaderCircle
                                  size={30}
                                  className="animate-spin"
                                />
                              ) : (
                                <Cloud
                                  size={30}
                                />
                              )}
                            </div>

                            <p
                              className="
                                mt-4
                                text-base
                                font-black
                              "
                            >
                              {subiendoMaterial
                                ? "Guardando tu material..."
                                : "Sube un material nuevo"}
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                text-[#8494A8]
                                dark:text-slate-400
                              "
                            >
                              Se guardará en tu cuenta para que puedas reutilizarlo después
                            </p>

                            {!subiendoMaterial && (
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
                                "
                              >
                                Seleccionar archivo
                              </span>
                            )}

                            <p
                              className="
                                mt-3
                                text-[10px]
                                text-[#98A6B7]
                              "
                            >
                              PDF, DOCX, PPTX o TXT · máximo 20 MB
                            </p>
                          </label>

                          <input
                            id="archivo-organizador"
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx,.pptx,.txt"
                            onChange={
                              seleccionarArchivo
                            }
                            disabled={
                              subiendoMaterial
                            }
                          />
                        </div>
                      )}

                      {materialSeleccionado && (
                        <div
                          className="
                            mt-5
                            flex
                            flex-col
                            gap-3
                            rounded-[18px]
                            border
                            border-emerald-200
                            bg-emerald-50/70
                            p-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            dark:border-emerald-900/40
                            dark:bg-emerald-950/20
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
                                bg-emerald-100
                                text-emerald-600
                                dark:bg-emerald-950/40
                                dark:text-emerald-300
                              "
                            >
                              <CircleCheckBig
                                size={20}
                              />
                            </div>

                            <div
                              className="
                                min-w-0
                              "
                            >
                              <p
                                className="
                                  text-[10px]
                                  font-black
                                  uppercase
                                  tracking-[0.12em]
                                  text-emerald-600
                                  dark:text-emerald-300
                                "
                              >
                                Material seleccionado
                              </p>

                              <p
                                className="
                                  truncate
                                  text-sm
                                  font-black
                                "
                              >
                                {
                                  materialSeleccionado.nombre_archivo
                                }
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setMaterialSeleccionado(
                                null
                              );

                              setArchivo(
                                null
                              );

                              localStorage.removeItem(
                                "raccoon-material-seleccionado"
                              );
                            }}
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
                            !hayMaterial
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

                      <div
                        className="
                          mt-6
                          border-t
                          border-[#E4EAF2]
                          pt-5
                          dark:border-slate-700
                        "
                      >
                        <div
                          className="
                            flex
                            flex-col
                            gap-3
                            rounded-[20px]
                            bg-gradient-to-r
                            from-[#F3F0FF]
                            via-[#EFF5FF]
                            to-[#ECFAFF]
                            p-4
                            dark:from-violet-950/20
                            dark:via-blue-950/20
                            dark:to-cyan-950/20
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
                            <div
                              className="
                                min-w-0
                              "
                            >
                              <p
                                className="
                                  text-xs
                                  font-black
                                  text-[#7652D9]
                                  dark:text-violet-200
                                "
                              >
                                Todo listo para crear
                              </p>

                              <p
                                className="
                                  mt-1
                                  truncate
                                  text-[10px]
                                  text-[#71859D]
                                  dark:text-slate-400
                                "
                              >
                                {materialSeleccionado
                                  ? materialSeleccionado.nombre_archivo
                                  : "Selecciona un material para continuar"}
                              </p>
                            </div>

                            <Sparkles
                              size={22}
                              className="
                                shrink-0
                                text-[#7652D9]
                              "
                            />
                          </div>

                          {mensajeProceso && (
                            <div
                              className="
                                rounded-xl
                                border
                                border-violet-100
                                bg-white/70
                                p-3
                                text-xs
                                font-bold
                                leading-5
                                text-[#7652D9]
                                dark:border-violet-900/30
                                dark:bg-black/10
                                dark:text-violet-200
                              "
                            >
                              {
                                mensajeProceso
                              }
                            </div>
                          )}

                          {generando && (
                            <div>
                              <div
                                className="
                                  flex
                                  items-center
                                  justify-between
                                  text-[10px]
                                  font-black
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
                                    size={14}
                                    className="animate-spin"
                                  />

                                  Generando organizador...
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
                                  mt-2
                                  h-2.5
                                  overflow-hidden
                                  rounded-full
                                  bg-white
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
                              subiendoMaterial ||
                              !hayMaterial
                            }
                            className="
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
                        </div>
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
                              "Material seleccionado",
                            listo:
                              hayMaterial,
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

                      <div
                        className="
                          mt-4
                          rounded-xl
                          bg-[#F3F7FC]
                          p-3
                          dark:bg-[#0E1929]
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            font-black
                            uppercase
                            tracking-[0.12em]
                            text-[#8A9BB0]
                          "
                        >
                          Material actual
                        </p>

                        <p
                          className="
                            mt-1
                            break-words
                            text-xs
                            font-black
                          "
                        >
                          {materialSeleccionado?.nombre_archivo ||
                            "Ninguno seleccionado"}
                        </p>
                      </div>
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