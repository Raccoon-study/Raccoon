"use client";

import type {
  Connection,
  Edge,
  Node,
  NodeProps,
} from "@xyflow/react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Circle,
  ClipboardCheck,
  Copy,
  Crown,
  FileImage,
  FileText,
  Home,
  Library,
  Link2,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Network,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Shapes,
  Sparkles,
  Square,
  Sun,
  Trash2,
  User,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  toPng,
} from "html-to-image";

import jsPDF from "jspdf";

import {
  supabase,
} from "../../../../lib/supabase";

/* =========================================================
   TIPOS
========================================================= */

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

type FormaNodo =
  | "rounded"
  | "pill"
  | "square";

type NodoIA = {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: number;
  categoria: string;
  orden: number;
};

type ConexionIA = {
  id: string;
  origen: string;
  destino: string;
  etiqueta: string;
};

type FilaTabla = {
  criterio: string;
  valores: string[];
};

type EventoTimeline = {
  id: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  orden: number;
};

type PasoFlujo = {
  id: string;
  titulo: string;
  descripcion: string;

  tipo:
    | "inicio"
    | "proceso"
    | "decision"
    | "fin";

  siguiente: string[];
  orden: number;
};

type OrganizadorIA = {
  tipo: TipoOrganizador;

  titulo: string;
  subtitulo: string;

  temaCentral: string;
  resumen: string;

  nodos: NodoIA[];

  conexiones: ConexionIA[];

  grupos: {
    titulo: string;
    items: string[];
  }[];

  tabla: {
    columnas: string[];
    filas: FilaTabla[];
  };

  timeline: EventoTimeline[];

  pasos: PasoFlujo[];

  conceptosClave: string[];

  sugerenciaEstudio: string;
};

type RespuestaGeneracion = {
  ok?: boolean;

  configuracion?: {
    tipo?: TipoOrganizador;
    nivel?: string;
  };

  archivo?: {
    nombre?: string;
  };

  organizador?: OrganizadorIA;

  editor?: {
    nodes: Node<DatosNodo>[];
    edges: Edge[];
    guardadoEn?: string;
  };
};

type DatosNodo = {
  titulo: string;
  descripcion: string;

  categoria?: string;

  nivel?: number;

  colorIndex?: number;

  forma?: FormaNodo;
};

/* =========================================================
   MENÚ
========================================================= */

const elementosMenu = [
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

/* =========================================================
   PALETA
========================================================= */

const coloresNodo = [
  {
    nombre: "Violeta",
    fondo: "#EEE9FF",
    borde: "#7857E8",
    texto: "#5132C8",
  },

  {
    nombre: "Azul",
    fondo: "#E5F2FF",
    borde: "#3489EB",
    texto: "#176CC8",
  },

  {
    nombre: "Verde",
    fondo: "#E4FAEE",
    borde: "#36BA72",
    texto: "#16834A",
  },

  {
    nombre: "Naranja",
    fondo: "#FFF0DB",
    borde: "#F59C42",
    texto: "#C66B13",
  },

  {
    nombre: "Rosado",
    fondo: "#FFE7F0",
    borde: "#ED5790",
    texto: "#C53370",
  },

  {
    nombre: "Amarillo",
    fondo: "#FFF5C9",
    borde: "#E5B835",
    texto: "#A37B09",
  },
];

/* =========================================================
   HELPERS
========================================================= */

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
) {
  if (
    plan === "year"
  ) {
    return "Premium anual";
  }

  if (
    plan === "month"
  ) {
    return "Premium mensual";
  }

  return "Plan gratuito";
}

/* =========================================================
   CONSTRUIR MAPA
========================================================= */

function construirMapa(
  organizador: OrganizadorIA
): {
  nodos: Node<DatosNodo>[];
  conexiones: Edge[];
} {
  const tipo =
    organizador.tipo;

  /* =====================================================
     CUADRO COMPARATIVO
  ===================================================== */

  if (
    tipo ===
    "cuadro-comparativo"
  ) {
    const columnas =
      organizador.tabla?.columnas ||
      [];

    const filas =
      organizador.tabla?.filas ||
      [];

    const nodos: Node<DatosNodo>[] =
      [];

    const conexiones: Edge[] =
      [];

    nodos.push({
      id: "tema-central",

      position: {
        x: 370,
        y: 40,
      },

      type: "visual",

      data: {
        titulo:
          organizador.temaCentral ||
          organizador.titulo,

        descripcion:
          organizador.resumen,

        nivel: 0,

        categoria:
          "principal",

        colorIndex: 0,

        forma: "pill",
      },
    });

    columnas.forEach(
      (
        columna,
        indice
      ) => {
        const id =
          `columna-${indice}`;

        const descripcion =
          filas
            .map(
              (
                fila
              ) => {
                const valor =
                  fila.valores[
                    indice
                  ] ||
                  "-";

                return `${fila.criterio}: ${valor}`;
              }
            )
            .join(
              "\n"
            );

        nodos.push({
          id,

          type: "visual",

          position: {
            x:
              80 +
              indice *
                310,

            y: 230,
          },

          data: {
            titulo:
              columna,

            descripcion,

            nivel: 1,

            categoria:
              "comparacion",

            colorIndex:
              (
                indice +
                2
              ) %
              coloresNodo.length,

            forma:
              "rounded",
          },
        });

        conexiones.push({
          id:
            `conexion-${id}`,

          source:
            "tema-central",

          target:
            id,

          label:
            "compara",

          type:
            "smoothstep",

          markerEnd: {
            type:
              MarkerType.ArrowClosed,
          },

          style: {
            stroke:
              "#7A91AE",
            strokeWidth:
              2,
          },
        });
      }
    );

    return {
      nodos,
      conexiones,
    };
  }

  /* =====================================================
     LÍNEA DE TIEMPO
  ===================================================== */

  if (
    tipo ===
    "linea-tiempo"
  ) {
    const eventos =
      [
        ...(organizador.timeline ||
          []),
      ].sort(
        (
          a,
          b
        ) =>
          a.orden -
          b.orden
      );

    const nodos:
      Node<DatosNodo>[] =
      eventos.map(
        (
          evento,
          indice
        ) => ({
          id:
            evento.id,

          type:
            "visual",

          position: {
            x:
              indice *
                300 +
              60,

            y:
              indice %
                2 ===
              0
                ? 100
                : 330,
          },

          data: {
            titulo:
              evento.fecha
                ? `${evento.fecha} · ${evento.titulo}`
                : evento.titulo,

            descripcion:
              evento.descripcion,

            nivel: 1,

            categoria:
              "evento",

            colorIndex:
              indice %
              coloresNodo.length,

            forma:
              "rounded",
          },
        })
      );

    const conexiones:
      Edge[] =
      eventos
        .slice(
          0,
          -1
        )
        .map(
          (
            evento,
            indice
          ) => ({
            id:
              `timeline-${indice}`,

            source:
              evento.id,

            target:
              eventos[
                indice +
                  1
              ].id,

            type:
              "smoothstep",

            markerEnd: {
              type:
                MarkerType.ArrowClosed,
            },

            style: {
              stroke:
                "#7A91AE",
              strokeWidth:
                2,
            },
          })
        );

    return {
      nodos,
      conexiones,
    };
  }

  /* =====================================================
     DIAGRAMA DE FLUJO
  ===================================================== */

  if (
    tipo ===
    "diagrama-flujo"
  ) {
    const pasos =
      [
        ...(organizador.pasos ||
          []),
      ].sort(
        (
          a,
          b
        ) =>
          a.orden -
          b.orden
      );

    const nodos:
      Node<DatosNodo>[] =
      pasos.map(
        (
          paso,
          indice
        ) => ({
          id:
            paso.id,

          type:
            "visual",

          position: {
            x:
              paso.tipo ===
              "decision"
                ? 420
                : 300,

            y:
              60 +
              indice *
                180,
          },

          data: {
            titulo:
              paso.titulo,

            descripcion:
              paso.descripcion,

            nivel:
              indice,

            categoria:
              paso.tipo,

            colorIndex:
              paso.tipo ===
              "inicio"
                ? 2
                : paso.tipo ===
                    "decision"
                  ? 5
                  : paso.tipo ===
                      "fin"
                    ? 4
                    : 1,

            forma:
              paso.tipo ===
                "inicio" ||
              paso.tipo ===
                "fin"
                ? "pill"
                : "rounded",
          },
        })
      );

    const conexiones:
      Edge[] =
      [];

    pasos.forEach(
      (
        paso
      ) => {
        paso.siguiente.forEach(
          (
            siguiente,
            indice
          ) => {
            conexiones.push({
              id:
                `${paso.id}-${siguiente}-${indice}`,

              source:
                paso.id,

              target:
                siguiente,

              type:
                "smoothstep",

              label:
                paso.tipo ===
                "decision"
                  ? indice ===
                    0
                    ? "Sí"
                    : "No"
                  : "",

              markerEnd: {
                type:
                  MarkerType.ArrowClosed,
              },

              style: {
                stroke:
                  "#7A91AE",
                strokeWidth:
                  2,
              },
            });
          }
        );
      }
    );

    return {
      nodos,
      conexiones,
    };
  }

  /* =====================================================
     MAPAS Y ESQUEMAS
  ===================================================== */

  const nodosIA =
    organizador.nodos ||
    [];

  const cantidadPorNivel =
    new Map<
      number,
      number
    >();

  nodosIA.forEach(
    (
      nodo
    ) => {
      cantidadPorNivel.set(
        nodo.nivel,
        (
          cantidadPorNivel.get(
            nodo.nivel
          ) ||
          0
        ) + 1
      );
    }
  );

  const contadorNivel =
    new Map<
      number,
      number
    >();

  const nodos:
    Node<DatosNodo>[] =
    nodosIA.map(
      (
        nodo
      ) => {
        const indice =
          contadorNivel.get(
            nodo.nivel
          ) ||
          0;

        contadorNivel.set(
          nodo.nivel,
          indice +
            1
        );

        const cantidad =
          cantidadPorNivel.get(
            nodo.nivel
          ) ||
          1;

        let x = 0;
        let y = 0;

        if (
          tipo ===
          "mapa-mental"
        ) {
          if (
            nodo.nivel ===
            0
          ) {
            x = 450;
            y = 300;
          } else {
            const angulo =
              (
                Math.PI *
                2 *
                indice
              ) /
              cantidad;

            const radio =
              nodo.nivel ===
              1
                ? 310
                : 500;

            x =
              450 +
              Math.cos(
                angulo
              ) *
                radio;

            y =
              300 +
              Math.sin(
                angulo
              ) *
                (
                  radio *
                  0.63
                );
          }
        } else {
          x =
            80 +
            indice *
              290;

          y =
            60 +
            nodo.nivel *
              200;
        }

        return {
          id:
            nodo.id,

          type:
            "visual",

          position: {
            x,
            y,
          },

          data: {
            titulo:
              nodo.titulo,

            descripcion:
              nodo.descripcion,

            nivel:
              nodo.nivel,

            categoria:
              nodo.categoria,

            colorIndex:
              nodo.nivel %
              coloresNodo.length,

            forma:
              nodo.nivel ===
              0
                ? "pill"
                : "rounded",
          },
        };
      }
    );

  const conexiones:
    Edge[] =
    (
      organizador.conexiones ||
      []
    ).map(
      (
        conexion
      ) => ({
        id:
          conexion.id,

        source:
          conexion.origen,

        target:
          conexion.destino,

        label:
          conexion.etiqueta,

        type:
          "smoothstep",

        markerEnd: {
          type:
            MarkerType.ArrowClosed,
        },

        style: {
          stroke:
            "#7A91AE",
          strokeWidth:
            2,
        },
      })
    );

  return {
    nodos,
    conexiones,
  };
}

/* =========================================================
   NODO VISUAL
========================================================= */

function NodoVisual(
  props: NodeProps<
    Node<DatosNodo>
  >
) {
  const {
    data,
    selected,
  } = props;

  const colorIndex =
    typeof data.colorIndex ===
    "number"
      ? data.colorIndex
      : 0;

  const color =
    coloresNodo[
      colorIndex %
        coloresNodo.length
    ];

  const forma =
    data.forma ||
    "rounded";

  const borderRadius =
    forma ===
    "pill"
      ? 999
      : forma ===
          "square"
        ? 8
        : 20;

  return (
    <div
      style={{
        minWidth:
          190,

        maxWidth:
          260,

        position:
          "relative",

        padding:
          forma ===
          "pill"
            ? "16px 24px"
            : "15px 17px",

        borderRadius,

        background:
          color.fondo,

        border:
          selected
            ? `3px solid ${color.borde}`
            : `2px solid ${color.borde}`,

        boxShadow:
          selected
            ? `0 14px 38px ${color.borde}40`
            : "0 9px 24px rgba(34,70,110,.12)",

        color:
          "#10233F",

        transition:
          "all .2s ease",
      }}
    >
      <Handle
        type="target"
        position={
          Position.Top
        }
        style={{
          width: 12,
          height: 12,

          background:
            color.borde,

          border:
            "3px solid white",
        }}
      />

      <Handle
        id="left"
        type="target"
        position={
          Position.Left
        }
        style={{
          width: 12,
          height: 12,

          background:
            color.borde,

          border:
            "3px solid white",
        }}
      />

      <p
        style={{
          fontSize:
            data.nivel ===
            0
              ? 16
              : 13,

          fontWeight:
            900,

          lineHeight:
            1.3,

          color:
            color.texto,

          textAlign:
            forma ===
            "pill"
              ? "center"
              : "left",
        }}
      >
        {
          data.titulo
        }
      </p>

      {data.descripcion && (
        <p
          style={{
            marginTop:
              7,

            fontSize:
              10,

            lineHeight:
              1.5,

            color:
              "#526B87",

            whiteSpace:
              "pre-line",

            textAlign:
              forma ===
              "pill"
                ? "center"
                : "left",
          }}
        >
          {
            data.descripcion
          }
        </p>
      )}

      <Handle
        id="right"
        type="source"
        position={
          Position.Right
        }
        style={{
          width: 12,
          height: 12,

          background:
            color.borde,

          border:
            "3px solid white",
        }}
      />

      <Handle
        id="bottom"
        type="source"
        position={
          Position.Bottom
        }
        style={{
          width: 12,
          height: 12,

          background:
            color.borde,

          border:
            "3px solid white",
        }}
      />
    </div>
  );
}

const nodeTypes = {
  visual:
    NodoVisual,
};

/* =========================================================
   COMPONENTE
========================================================= */

export default function EditorOrganizadorPage() {
  const router =
    useRouter();

  const canvasRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /* =====================================================
     USUARIO
  ===================================================== */

  const [
    nombreUsuario,
    setNombreUsuario,
  ] =
    useState(
      "Usuario"
    );

  const [
    fotoPerfil,
    setFotoPerfil,
  ] =
    useState(
      "/raccoon.png"
    );

  /* =====================================================
     PLAN
  ===================================================== */

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

  /* =====================================================
     UI
  ===================================================== */

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
    panelAbierto,
    setPanelAbierto,
  ] =
    useState(true);

  const [
    mensaje,
    setMensaje,
  ] =
    useState("");

  const [
    exportando,
    setExportando,
  ] =
    useState(false);

  /* =====================================================
     ORGANIZADOR
  ===================================================== */

  const [
    datosGenerados,
    setDatosGenerados,
  ] =
    useState<RespuestaGeneracion | null>(
      null
    );

  const [
    cargandoOrganizador,
    setCargandoOrganizador,
  ] =
    useState(true);

  const [
    nodeSeleccionado,
    setNodeSeleccionado,
  ] =
    useState<string | null>(
      null
    );

  const [
    nodes,
    setNodes,
    onNodesChange,
  ] =
    useNodesState<
      Node<DatosNodo>
    >(
      []
    );

  const [
    edges,
    setEdges,
    onEdgesChange,
  ] =
    useEdgesState<Edge>(
      []
    );

  /* =====================================================
     INICIAR
  ===================================================== */

  useEffect(() => {
    const iniciar =
      async () => {
        inicializarTema();

        await obtenerUsuarioYPlan();

        cargarOrganizador();
      };

    void iniciar();
  }, []);

  /* =====================================================
     TEMA
  ===================================================== */

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

  /* =====================================================
     MENSAJE
  ===================================================== */

  const mostrarMensaje =
    (
      texto: string
    ) => {
      setMensaje(
        texto
      );

      window.setTimeout(
        () => {
          setMensaje(
            ""
          );
        },
        3500
      );
    };

  /* =====================================================
     USUARIO / PLAN
  ===================================================== */

  const obtenerUsuarioYPlan =
    async () => {
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

          return;
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

        setPlanActual(
          normalizarPlan(
            metadata.plan ||
              metadata.subscription ||
              metadata.tipo_plan ||
              metadata.subscription_plan,
            premiumMetadata
          )
        );

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
              const premium =
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
                  premium
                )
              );
            }
          }
        } catch (
          error
        ) {
          console.warn(
            "No se pudo consultar la suscripción:",
            error
          );
        }
      } finally {
        setCargandoPlan(
          false
        );
      }
    };

  /* =====================================================
     CARGAR ORGANIZADOR
  ===================================================== */

  const cargarOrganizador =
    () => {
      try {
        setCargandoOrganizador(
          true
        );

        const editado =
          sessionStorage.getItem(
            "organizador-editado"
          );

        if (
          editado
        ) {
          try {
            const parsedEditado =
              JSON.parse(
                editado
              ) as RespuestaGeneracion;

            if (
              parsedEditado.editor?.nodes &&
              parsedEditado.editor?.edges
            ) {
              setDatosGenerados(
                parsedEditado
              );

              setNodes(
                parsedEditado.editor.nodes
              );

              setEdges(
                parsedEditado.editor.edges
              );

              return;
            }
          } catch (
            error
          ) {
            console.warn(
              "Edición guardada inválida:",
              error
            );
          }
        }

        const guardado =
          sessionStorage.getItem(
            "organizador-generado"
          );

        if (
          !guardado
        ) {
          mostrarMensaje(
            "No encontramos un organizador generado."
          );

          return;
        }

        const parsed =
          JSON.parse(
            guardado
          ) as RespuestaGeneracion;

        if (
          !parsed.organizador
        ) {
          mostrarMensaje(
            "Los datos del organizador no son válidos."
          );

          return;
        }

        setDatosGenerados(
          parsed
        );

        const mapa =
          construirMapa(
            parsed.organizador
          );

        setNodes(
          mapa.nodos
        );

        const conexionesIniciales:
          Edge[] =
          mapa.conexiones.map(
            (
              edge
            ): Edge => ({
              ...edge,

              type:
                edge.type ||
                "smoothstep",

              markerEnd:
                edge.markerEnd || {
                  type:
                    MarkerType.ArrowClosed,
                },

              style: {
                stroke:
                  "#7A91AE",

                strokeWidth:
                  2,

                ...(
                  edge.style ||
                  {}
                ),
              },

              labelStyle: {
                fontSize:
                  10,

                fontWeight:
                  700,

                fill:
                  "#526B87",
              },

              labelBgStyle: {
                fill:
                  "#FFFFFF",

                fillOpacity:
                  0.92,
              },
            })
          );

        setEdges(
          conexionesIniciales
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        mostrarMensaje(
          "No se pudo cargar el organizador."
        );
      } finally {
        setCargandoOrganizador(
          false
        );
      }
    };

  /* =====================================================
     CONECTAR NODOS
  ===================================================== */

  const onConnect =
    useCallback(
      (
        connection: Connection
      ) => {
        if (
          !connection.source ||
          !connection.target
        ) {
          return;
        }

        const nuevaConexion:
          Edge = {
          id:
            `edge-${connection.source}-${connection.target}-${Date.now()}`,

          source:
            connection.source,

          target:
            connection.target,

          sourceHandle:
            connection.sourceHandle ??
            undefined,

          targetHandle:
            connection.targetHandle ??
            undefined,

          type:
            "smoothstep",

          markerEnd: {
            type:
              MarkerType.ArrowClosed,
          },

          style: {
            stroke:
              "#7893B5",

            strokeWidth:
              2,
          },
        };

        setEdges(
          (
            actuales
          ) =>
            addEdge(
              nuevaConexion,
              actuales
            )
        );

        mostrarMensaje(
          "Conexión creada."
        );
      },
      [
        setEdges,
      ]
    );

  /* =====================================================
     NODO ACTUAL
  ===================================================== */

  const nodoActual =
    useMemo(
      () =>
        nodes.find(
          (
            nodo
          ) =>
            nodo.id ===
            nodeSeleccionado
        ) ||
        null,
      [
        nodes,
        nodeSeleccionado,
      ]
    );

  /* =====================================================
     EDITAR TITULO
  ===================================================== */

  const editarTitulo =
    (
      valor: string
    ) => {
      if (
        !nodeSeleccionado
      ) {
        return;
      }

      setNodes(
        (
          actuales
        ) =>
          actuales.map(
            (
              nodo
            ) =>
              nodo.id ===
              nodeSeleccionado
                ? {
                    ...nodo,

                    data: {
                      ...nodo.data,

                      titulo:
                        valor,
                    },
                  }
                : nodo
          )
      );
    };

  /* =====================================================
     EDITAR DESCRIPCIÓN
  ===================================================== */

  const editarDescripcion =
    (
      valor: string
    ) => {
      if (
        !nodeSeleccionado
      ) {
        return;
      }

      setNodes(
        (
          actuales
        ) =>
          actuales.map(
            (
              nodo
            ) =>
              nodo.id ===
              nodeSeleccionado
                ? {
                    ...nodo,

                    data: {
                      ...nodo.data,

                      descripcion:
                        valor,
                    },
                  }
                : nodo
          )
      );
    };

  /* =====================================================
     COLOR
  ===================================================== */

  const cambiarColor =
    (
      colorIndex: number
    ) => {
      if (
        !nodeSeleccionado
      ) {
        return;
      }

      setNodes(
        (
          actuales
        ) =>
          actuales.map(
            (
              nodo
            ) =>
              nodo.id ===
              nodeSeleccionado
                ? {
                    ...nodo,

                    data: {
                      ...nodo.data,

                      colorIndex,
                    },
                  }
                : nodo
          )
      );
    };

  /* =====================================================
     FORMA
  ===================================================== */

  const cambiarForma =
    (
      forma: FormaNodo
    ) => {
      if (
        !nodeSeleccionado
      ) {
        return;
      }

      setNodes(
        (
          actuales
        ) =>
          actuales.map(
            (
              nodo
            ) =>
              nodo.id ===
              nodeSeleccionado
                ? {
                    ...nodo,

                    data: {
                      ...nodo.data,

                      forma,
                    },
                  }
                : nodo
          )
      );
    };

  /* =====================================================
     AGREGAR NODO
  ===================================================== */

  const agregarNodo =
    () => {
      const nuevoId =
        `nodo-${Date.now()}`;

      const nuevoNodo:
        Node<DatosNodo> = {
        id:
          nuevoId,

        type:
          "visual",

        position: {
          x:
            350 +
            Math.random() *
              250,

          y:
            250 +
            Math.random() *
              250,
        },

        data: {
          titulo:
            "Nueva idea",

          descripcion:
            "Agrega aquí tu información.",

          nivel: 1,

          categoria:
            "personalizado",

          colorIndex:
            1,

          forma:
            "rounded",
        },
      };

      setNodes(
        (
          actuales
        ) => [
          ...actuales,
          nuevoNodo,
        ]
      );

      setNodeSeleccionado(
        nuevoId
      );

      setPanelAbierto(
        true
      );

      mostrarMensaje(
        "Nuevo elemento agregado."
      );
    };

  /* =====================================================
     DUPLICAR
  ===================================================== */

  const duplicarNodo =
    () => {
      if (
        !nodoActual
      ) {
        return;
      }

      const nuevoId =
        `nodo-${Date.now()}`;

      const copia:
        Node<DatosNodo> = {
        ...nodoActual,

        id:
          nuevoId,

        selected:
          false,

        position: {
          x:
            nodoActual.position.x +
            45,

          y:
            nodoActual.position.y +
            45,
        },

        data: {
          ...nodoActual.data,

          titulo:
            `${nodoActual.data.titulo} copia`,
        },
      };

      setNodes(
        (
          actuales
        ) => [
          ...actuales,
          copia,
        ]
      );

      setNodeSeleccionado(
        nuevoId
      );

      mostrarMensaje(
        "Elemento duplicado."
      );
    };

  /* =====================================================
     ELIMINAR
  ===================================================== */

  const eliminarNodo =
    () => {
      if (
        !nodeSeleccionado
      ) {
        return;
      }

      setNodes(
        (
          actuales
        ) =>
          actuales.filter(
            (
              nodo
            ) =>
              nodo.id !==
              nodeSeleccionado
          )
      );

      setEdges(
        (
          actuales
        ) =>
          actuales.filter(
            (
              edge
            ) =>
              edge.source !==
                nodeSeleccionado &&
              edge.target !==
                nodeSeleccionado
          )
      );

      setNodeSeleccionado(
        null
      );

      mostrarMensaje(
        "Elemento eliminado."
      );
    };

  /* =====================================================
     GUARDAR
  ===================================================== */

  const guardarCambios =
    () => {
      const copia:
        RespuestaGeneracion = {
        ...(
          datosGenerados ||
          {}
        ),

        editor: {
          nodes,
          edges,

          guardadoEn:
            new Date().toISOString(),
        },
      };

      sessionStorage.setItem(
        "organizador-editado",
        JSON.stringify(
          copia
        )
      );

      setDatosGenerados(
        copia
      );

      mostrarMensaje(
        "Cambios guardados."
      );
    };

  /* =====================================================
     RESTAURAR
  ===================================================== */

  const restaurar =
    () => {
      if (
        !datosGenerados?.organizador
      ) {
        return;
      }

      const mapa =
        construirMapa(
          datosGenerados.organizador
        );

      setNodes(
        mapa.nodos
      );

      setEdges(
        mapa.conexiones
      );

      sessionStorage.removeItem(
        "organizador-editado"
      );

      setNodeSeleccionado(
        null
      );

      mostrarMensaje(
        "Diseño original restaurado."
      );
    };

  /* =====================================================
     IMAGEN DEL CANVAS
  ===================================================== */

  const obtenerImagenCanvas =
    async () => {
      const elemento =
        canvasRef.current;

      if (
        !elemento
      ) {
        throw new Error(
          "No se encontró el lienzo."
        );
      }

      return await toPng(
        elemento,
        {
          backgroundColor:
            modoOscuro
              ? "#0E1929"
              : "#FFFFFF",

          pixelRatio:
            2,

          cacheBust:
            true,

          filter: (
            nodo
          ) => {
            if (
              nodo instanceof
              HTMLElement
            ) {
              if (
                nodo.classList.contains(
                  "react-flow__controls"
                )
              ) {
                return false;
              }

              if (
                nodo.classList.contains(
                  "react-flow__minimap"
                )
              ) {
                return false;
              }

              if (
                nodo.classList.contains(
                  "react-flow__panel"
                )
              ) {
                return false;
              }
            }

            return true;
          },
        }
      );
    };

  /* =====================================================
     EXPORTAR PNG
  ===================================================== */

  const exportarPNG =
    async () => {
      try {
        setExportando(
          true
        );

        const dataUrl =
          await obtenerImagenCanvas();

        const enlace =
          document.createElement(
            "a"
          );

        const titulo =
          datosGenerados
            ?.organizador
            ?.titulo ||
          "organizador";

        enlace.download =
          `${titulo
            .replace(
              /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g,
              "-"
            )
            .toLowerCase()}.png`;

        enlace.href =
          dataUrl;

        enlace.click();

        mostrarMensaje(
          "PNG exportado."
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        mostrarMensaje(
          "No se pudo exportar la imagen."
        );
      } finally {
        setExportando(
          false
        );
      }
    };

  /* =====================================================
     EXPORTAR PDF
  ===================================================== */

  const exportarPDF =
    async () => {
      try {
        setExportando(
          true
        );

        const dataUrl =
          await obtenerImagenCanvas();

        const pdf =
          new jsPDF({
            orientation:
              "landscape",

            unit:
              "mm",

            format:
              "a4",
          });

        const anchoPagina =
          pdf.internal.pageSize.getWidth();

        const altoPagina =
          pdf.internal.pageSize.getHeight();

        const margen =
          8;

        const imagen =
          pdf.getImageProperties(
            dataUrl
          );

        const anchoDisponible =
          anchoPagina -
          margen *
            2;

        const altoDisponible =
          altoPagina -
          margen *
            2;

        const proporcion =
          Math.min(
            anchoDisponible /
              imagen.width,

            altoDisponible /
              imagen.height
          );

        const ancho =
          imagen.width *
          proporcion;

        const alto =
          imagen.height *
          proporcion;

        const x =
          (
            anchoPagina -
            ancho
          ) /
          2;

        const y =
          (
            altoPagina -
            alto
          ) /
          2;

        pdf.addImage(
          dataUrl,
          "PNG",
          x,
          y,
          ancho,
          alto
        );

        const titulo =
          datosGenerados
            ?.organizador
            ?.titulo ||
          "organizador";

        pdf.save(
          `${titulo
            .replace(
              /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g,
              "-"
            )
            .toLowerCase()}.pdf`
        );

        mostrarMensaje(
          "PDF exportado."
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        mostrarMensaje(
          "No se pudo crear el PDF."
        );
      } finally {
        setExportando(
          false
        );
      }
    };

  /* =====================================================
     CERRAR SESIÓN
  ===================================================== */

  const cerrarSesion =
    async () => {
      await supabase.auth.signOut();

      router.push(
        "/Login"
      );
    };

  /* =====================================================
     CARGANDO
  ===================================================== */

  if (
    cargandoPlan
  ) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#F7FAFF]
          dark:bg-[#07111F]
          dark:text-white
        "
      >
        <div className="text-center">
          <LoaderCircle
            size={42}
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
            Preparando tu editor...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     FREE
  ===================================================== */

  if (
    !esPremium
  ) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#F7FAFF]
          p-5
          dark:bg-[#07111F]
        "
      >
        <div
          className="
            max-w-lg
            rounded-[30px]
            border
            border-violet-200
            bg-white
            p-8
            text-center
            shadow-xl
            dark:border-violet-900/40
            dark:bg-[#121F31]
            dark:text-white
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
              from-[#FFD765]
              to-[#FFB737]
              text-white
              shadow-lg
            "
          >
            <Crown
              size={38}
            />
          </div>

          <h1
            className="
              mt-5
              text-3xl
              font-black
            "
          >
            Editor Premium
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-[#647C96]
              dark:text-slate-300
            "
          >
            Organizadores Visuales y su editor interactivo están disponibles exclusivamente con Raccoon Premium.
          </p>

          <Link
            href="/suscripciones"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-[#3978F6]
              to-[#7652D9]
              px-6
              py-3
              text-sm
              font-black
              text-white
            "
          >
            <Crown
              size={17}
            />

            Ver Premium
          </Link>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

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
      {mensaje && (
        <div
          className="
            fixed
            right-5
            top-20
            z-[200]
            flex
            max-w-sm
            items-center
            gap-2
            rounded-2xl
            border
            border-[#DCE5F0]
            bg-white
            px-5
            py-3
            text-sm
            font-black
            shadow-xl
            dark:border-slate-700
            dark:bg-[#121F31]
          "
        >
          <Check
            size={17}
            className="text-emerald-500"
          />

          {
            mensaje
          }
        </div>
      )}

      {/* =================================================
          SIDEBAR
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

                    ${
                      item.activo
                        ? `
                          bg-[#EAF5FF]
                          text-[#1284ED]
                          dark:bg-[#16304B]
                          dark:text-[#64BBFF]
                        `
                        : `
                          hover:bg-[#F4F7FB]
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
              />
            ) : (
              <Moon
                size={19}
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
            "
          >
            <LogOut
              size={19}
            />

            Cerrar sesión
          </button>

          <Link
            href="/suscripciones"
            className="
              mt-4
              block
              rounded-[22px]
              bg-gradient-to-br
              from-[#38AEF5]
              via-[#48A5F3]
              to-[#7752E8]
              p-4
              text-white
              shadow-lg
              transition
              hover:-translate-y-1
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

                <p
                  className="
                    text-[10px]
                    text-white/80
                  "
                >
                  {nombrePlan(
                    planActual
                  )}
                </p>
              </div>
            </div>

            <div
              className="
                mt-4
                flex
                items-center
                justify-between
                text-xs
                font-black
              "
            >
              Premium activo

              <ArrowRight
                size={14}
              />
            </div>
          </Link>
        </div>
      </aside>

      {/* =================================================
          MOBILE MENU
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
            border-[#E1E8F0]
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

            <strong>
              Raccoon{" "}
              <span className="text-blue-500">
                Study
              </span>
            </strong>
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
              size={21}
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
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                  "
                >
                  <Icono
                    size={18}
                  />

                  {
                    item.nombre
                  }
                </Link>
              );
            }
          )}
        </nav>
      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="lg:pl-[252px]">
        <header
          className="
            sticky
            top-0
            z-30
            flex
            min-h-[70px]
            items-center
            justify-between
            border-b
            border-[#E1E8F0]
            bg-white/95
            px-4
            backdrop-blur
            dark:border-slate-800
            dark:bg-[#0B1626]/95
            sm:px-6
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

            <Link
              href="/metodos/organizadores/crear"
              className="
                hidden
                rounded-xl
                p-2
                hover:bg-slate-100
                dark:hover:bg-slate-800
                sm:block
              "
            >
              <ArrowLeft
                size={20}
              />
            </Link>

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
                  tracking-[0.14em]
                  text-[#8293A8]
                "
              >
                Editor visual
              </p>

              <h1
                className="
                  max-w-[390px]
                  truncate
                  text-lg
                  font-black
                  sm:text-xl
                "
              >
                {datosGenerados
                  ?.organizador
                  ?.titulo ||
                  "Organizador visual"}
              </h1>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={
                restaurar
              }
              className="
                hidden
                h-10
                items-center
                gap-2
                rounded-xl
                border
                border-[#DFE6F0]
                px-3
                text-xs
                font-black
                md:flex
                dark:border-slate-700
              "
            >
              <RotateCcw
                size={15}
              />

              Restaurar
            </button>

            <button
              type="button"
              onClick={
                guardarCambios
              }
              className="
                flex
                h-10
                items-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-[#3978F6]
                to-[#7652D9]
                px-4
                text-xs
                font-black
                text-white
              "
            >
              <Save
                size={15}
              />

              <span
                className="
                  hidden
                  sm:inline
                "
              >
                Guardar
              </span>
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
                h-10
                w-10
                overflow-hidden
                rounded-xl
                border
                border-[#DFE6F0]
                dark:border-slate-700
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
          </div>
        </header>

        <main
          className="
            p-3
            sm:p-5
          "
        >
          <div
            className="
              flex
              gap-4
            "
          >
            <section
              className="
                relative
                min-w-0
                flex-1
                overflow-hidden
                rounded-[26px]
                border
                border-[#DFE7F1]
                bg-white
                shadow-[0_15px_40px_rgba(38,70,110,0.06)]
                dark:border-slate-700
                dark:bg-[#0E1929]
              "
            >
              {cargandoOrganizador ? (
                <div
                  className="
                    flex
                    h-[calc(100vh-115px)]
                    min-h-[650px]
                    items-center
                    justify-center
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
                      Preparando tu organizador...
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  ref={
                    canvasRef
                  }
                  className="
                    h-[calc(100vh-115px)]
                    min-h-[650px]
                    bg-white
                    dark:bg-[#0E1929]
                  "
                >
                  <ReactFlow
                    nodes={
                      nodes
                    }
                    edges={
                      edges
                    }
                    nodeTypes={
                      nodeTypes
                    }
                    onNodesChange={
                      onNodesChange
                    }
                    onEdgesChange={
                      onEdgesChange
                    }
                    onConnect={
                      onConnect
                    }
                    onNodeClick={(
                      _,
                      nodo
                    ) => {
                      setNodeSeleccionado(
                        nodo.id
                      );

                      setPanelAbierto(
                        true
                      );
                    }}
                    onPaneClick={() =>
                      setNodeSeleccionado(
                        null
                      )
                    }
                    fitView
                    fitViewOptions={{
                      padding:
                        0.25,
                    }}
                    minZoom={
                      0.15
                    }
                    maxZoom={
                      2.5
                    }
                    deleteKeyCode={[
                      "Backspace",
                      "Delete",
                    ]}
                    defaultEdgeOptions={{
                      type:
                        "smoothstep",

                      markerEnd: {
                        type:
                          MarkerType.ArrowClosed,
                      },
                    }}
                  >
                    <Background
                      variant={
                        BackgroundVariant.Dots
                      }
                      gap={22}
                      size={1.3}
                    />

                    <Controls />

                    <MiniMap
                      pannable
                      zoomable
                      nodeStrokeWidth={
                        3
                      }
                      className="
                        !rounded-xl
                        !border
                        !border-slate-200
                        dark:!border-slate-700
                        dark:!bg-slate-900
                      "
                    />

                    <Panel
                      position="top-left"
                    >
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                          rounded-2xl
                          border
                          border-[#DEE7F1]
                          bg-white/95
                          p-2
                          shadow-lg
                          backdrop-blur
                          dark:border-slate-700
                          dark:bg-[#121F31]/95
                        "
                      >
                        <button
                          type="button"
                          onClick={
                            agregarNodo
                          }
                          className="
                            flex
                            h-9
                            items-center
                            gap-2
                            rounded-xl
                            bg-[#EAF4FF]
                            px-3
                            text-xs
                            font-black
                            text-[#247DCE]
                            dark:bg-blue-950/30
                            dark:text-blue-300
                          "
                        >
                          <Plus
                            size={15}
                          />

                          Agregar
                        </button>

                        <button
                          type="button"
                          disabled={
                            !nodoActual
                          }
                          onClick={
                            duplicarNodo
                          }
                          className="
                            flex
                            h-9
                            items-center
                            gap-2
                            rounded-xl
                            px-3
                            text-xs
                            font-black
                            hover:bg-slate-100
                            disabled:opacity-40
                            dark:hover:bg-slate-800
                          "
                        >
                          <Copy
                            size={15}
                          />

                          Duplicar
                        </button>

                        <button
                          type="button"
                          disabled={
                            !nodoActual
                          }
                          onClick={
                            eliminarNodo
                          }
                          className="
                            flex
                            h-9
                            items-center
                            gap-2
                            rounded-xl
                            px-3
                            text-xs
                            font-black
                            text-red-500
                            hover:bg-red-50
                            disabled:opacity-40
                            dark:hover:bg-red-950/20
                          "
                        >
                          <Trash2
                            size={15}
                          />

                          Eliminar
                        </button>

                        <button
                          type="button"
                          onClick={
                            exportarPNG
                          }
                          disabled={
                            exportando
                          }
                          className="
                            flex
                            h-9
                            items-center
                            gap-2
                            rounded-xl
                            px-3
                            text-xs
                            font-black
                            text-[#3978F6]
                          "
                        >
                          <FileImage
                            size={15}
                          />

                          PNG
                        </button>

                        <button
                          type="button"
                          onClick={
                            exportarPDF
                          }
                          disabled={
                            exportando
                          }
                          className="
                            flex
                            h-9
                            items-center
                            gap-2
                            rounded-xl
                            px-3
                            text-xs
                            font-black
                            text-[#E15454]
                          "
                        >
                          <FileText
                            size={15}
                          />

                          PDF
                        </button>
                      </div>
                    </Panel>

                    <Panel
                      position="bottom-left"
                    >
                      <div
                        className="
                          hidden
                          max-w-[340px]
                          rounded-2xl
                          border
                          border-violet-100
                          bg-white/95
                          p-3
                          shadow-lg
                          backdrop-blur
                          sm:block
                          dark:border-violet-900/40
                          dark:bg-[#121F31]/95
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <Sparkles
                            size={15}
                            className="text-[#7652D9]"
                          />

                          <span
                            className="
                              text-xs
                              font-black
                            "
                          >
                            Raccoon IA
                          </span>
                        </div>

                        <p
                          className="
                            mt-1
                            text-[10px]
                            leading-4
                            text-[#73869D]
                            dark:text-slate-400
                          "
                        >
                          {datosGenerados
                            ?.organizador
                            ?.sugerenciaEstudio ||
                            "Mueve, conecta y personaliza cada elemento según tu forma de estudiar."}
                        </p>
                      </div>
                    </Panel>
                  </ReactFlow>
                </div>
              )}
            </section>

            {panelAbierto && (
              <aside
                className="
                  hidden
                  w-[340px]
                  shrink-0
                  space-y-4
                  xl:block
                "
              >
                <section
                  className="
                    rounded-[26px]
                    border
                    border-[#DFE7F1]
                    bg-white
                    p-5
                    shadow-[0_12px_30px_rgba(38,70,110,0.05)]
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
                        Personalizar
                      </p>

                      <h2
                        className="
                          mt-1
                          text-lg
                          font-black
                        "
                      >
                        {nodoActual
                          ? "Editar elemento"
                          : "Selecciona un elemento"}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPanelAbierto(
                          false
                        )
                      }
                      className="
                        rounded-xl
                        p-2
                        hover:bg-slate-100
                        dark:hover:bg-slate-800
                      "
                    >
                      <X
                        size={18}
                      />
                    </button>
                  </div>

                  {nodoActual ? (
                    <div
                      className="
                        mt-5
                        space-y-5
                      "
                    >
                      <div>
                        <label
                          className="
                            text-xs
                            font-black
                            text-[#536B86]
                            dark:text-slate-300
                          "
                        >
                          Título
                        </label>

                        <input
                          value={
                            nodoActual.data.titulo
                          }
                          onChange={(
                            evento
                          ) =>
                            editarTitulo(
                              evento.target.value
                            )
                          }
                          className="
                            mt-2
                            w-full
                            rounded-xl
                            border
                            border-[#DDE5EE]
                            bg-[#FAFCFF]
                            px-4
                            py-3
                            text-sm
                            font-bold
                            text-[#10233F]
                            outline-none
                            focus:border-[#7652D9]
                            dark:border-slate-700
                            dark:bg-[#0E1929]
                            dark:text-white
                          "
                        />
                      </div>

                      <div>
                        <label
                          className="
                            text-xs
                            font-black
                            text-[#536B86]
                            dark:text-slate-300
                          "
                        >
                          Descripción
                        </label>

                        <textarea
                          value={
                            nodoActual.data.descripcion
                          }
                          onChange={(
                            evento
                          ) =>
                            editarDescripcion(
                              evento.target.value
                            )
                          }
                          rows={5}
                          className="
                            mt-2
                            w-full
                            resize-none
                            rounded-xl
                            border
                            border-[#DDE5EE]
                            bg-[#FAFCFF]
                            px-4
                            py-3
                            text-sm
                            leading-6
                            text-[#10233F]
                            outline-none
                            focus:border-[#7652D9]
                            dark:border-slate-700
                            dark:bg-[#0E1929]
                            dark:text-white
                          "
                        />
                      </div>

                      <div>
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <Palette
                            size={16}
                            className="text-[#7652D9]"
                          />

                          <label
                            className="
                              text-xs
                              font-black
                              text-[#536B86]
                              dark:text-slate-300
                            "
                          >
                            Color
                          </label>
                        </div>

                        <div
                          className="
                            mt-3
                            grid
                            grid-cols-6
                            gap-2
                          "
                        >
                          {coloresNodo.map(
                            (
                              color,
                              indice
                            ) => {
                              const activo =
                                (
                                  nodoActual.data.colorIndex ??
                                  0
                                ) ===
                                indice;

                              return (
                                <button
                                  key={
                                    color.nombre
                                  }
                                  type="button"
                                  onClick={() =>
                                    cambiarColor(
                                      indice
                                    )
                                  }
                                  style={{
                                    background:
                                      color.fondo,

                                    borderColor:
                                      activo
                                        ? color.borde
                                        : "transparent",
                                  }}
                                  className="
                                    h-9
                                    w-9
                                    rounded-xl
                                    border-[3px]
                                    transition
                                    hover:scale-110
                                  "
                                />
                              );
                            }
                          )}
                        </div>
                      </div>

                      <div>
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <Shapes
                            size={16}
                            className="text-[#7652D9]"
                          />

                          <label
                            className="
                              text-xs
                              font-black
                              text-[#536B86]
                              dark:text-slate-300
                            "
                          >
                            Forma
                          </label>
                        </div>

                        <div
                          className="
                            mt-3
                            grid
                            grid-cols-3
                            gap-2
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              cambiarForma(
                                "rounded"
                              )
                            }
                            className="
                              flex
                              flex-col
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-[#DDE5EE]
                              p-3
                              text-[10px]
                              font-black
                              dark:border-slate-700
                            "
                          >
                            <Square
                              size={20}
                            />

                            Redondeado
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              cambiarForma(
                                "pill"
                              )
                            }
                            className="
                              flex
                              flex-col
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-[#DDE5EE]
                              p-3
                              text-[10px]
                              font-black
                              dark:border-slate-700
                            "
                          >
                            <Circle
                              size={20}
                            />

                            Cápsula
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              cambiarForma(
                                "square"
                              )
                            }
                            className="
                              flex
                              flex-col
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-[#DDE5EE]
                              p-3
                              text-[10px]
                              font-black
                              dark:border-slate-700
                            "
                          >
                            <Square
                              size={20}
                            />

                            Cuadrado
                          </button>
                        </div>
                      </div>

                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-3
                        "
                      >
                        <button
                          type="button"
                          onClick={
                            duplicarNodo
                          }
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-[#DDE5EE]
                            py-3
                            text-xs
                            font-black
                            dark:border-slate-700
                          "
                        >
                          <Copy
                            size={15}
                          />

                          Duplicar
                        </button>

                        <button
                          type="button"
                          onClick={
                            eliminarNodo
                          }
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-red-50
                            py-3
                            text-xs
                            font-black
                            text-red-500
                            dark:bg-red-950/20
                          "
                        >
                          <Trash2
                            size={15}
                          />

                          Eliminar
                        </button>
                      </div>

                      <div
                        className="
                          rounded-2xl
                          bg-gradient-to-br
                          from-[#F6F3FF]
                          to-[#EFF7FF]
                          p-4
                          dark:from-violet-950/20
                          dark:to-blue-950/20
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            font-black
                            text-[#7652D9]
                          "
                        >
                          <Link2
                            size={15}
                          />

                          Crear conexiones
                        </div>

                        <p
                          className="
                            mt-2
                            text-[10px]
                            leading-5
                            text-[#73869D]
                            dark:text-slate-400
                          "
                        >
                          Arrastra desde los puntos del cuadro hacia otro elemento para crear una relación.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="
                        mt-6
                        rounded-[22px]
                        bg-gradient-to-br
                        from-[#F2EDFF]
                        to-[#EAF6FF]
                        p-5
                        text-center
                        dark:from-[#28223D]
                        dark:to-[#173148]
                      "
                    >
                      <Network
                        size={36}
                        className="
                          mx-auto
                          text-[#7652D9]
                        "
                      />

                      <p
                        className="
                          mt-3
                          text-sm
                          font-black
                        "
                      >
                        Selecciona un elemento
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          leading-5
                          text-[#73869D]
                          dark:text-slate-400
                        "
                      >
                        Haz clic sobre cualquier cuadro para editarlo.
                      </p>
                    </div>
                  )}
                </section>
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}