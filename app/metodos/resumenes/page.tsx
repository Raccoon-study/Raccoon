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
  BookOpen,
  Brain,
  BrainCircuit,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Crown,
  Copy,
  FilePlus2,
  FileText,
  FolderOpen,
  GraduationCap,
  Headphones,
  HelpCircle,
  Home,
  Info,
  Layers,
  Library,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Music2,
  Pause,
  Play,
  Search,
  Sparkles,
  Square,
  Sun,
  Upload,
  User,
  Volume2,
  X,
  Zap,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

/* =====================================================
   TIPOS
===================================================== */

interface ConceptoClave {
  concepto: string;
  definicion: string;
}

interface SeccionDesarrollo {
  titulo: string;
  contenido: string;
}

interface ResumenGenerado {
  titulo: string;
  materia: string;
  tiempo_lectura: string;
  resumen_general: string;
  secciones_desarrollo: SeccionDesarrollo[];
  ideas_principales: string[];
  conceptos_clave: ConceptoClave[];
  ejemplos: string[];
  datos_importantes: string[];
  conclusion: string;
}

interface Resumen extends ResumenGenerado {
  id: string;
  usuario_id: string;
  material_id: string | null;
  nombre_archivo: string | null;
  url_archivo: string | null;
  fecha_creacion: string;
}

interface MaterialPendiente {
  id: string;
  material_id?: string;
  nombre_archivo: string;
  url_archivo: string;
  titulo?: string;
  origen?: string;
}

interface JamendoTrack {
  id: string;
  titulo: string;
  artista: string;
  audio: string;
  portada: string;
  enlace: string;
  duracion: number;
}

interface RespuestaJamendo {
  tracks: JamendoTrack[];
}

interface DeezerTrack {
  id: number;
  titulo: string;
  artista: string;
  preview: string;
  portada: string;
  enlace: string;
}

interface DeezerPlaylist {
  id: number;
  titulo: string;
  descripcion: string;
  portada: string;
  enlace: string;
  total: number;
}

interface RespuestaDeezer {
  playlist: DeezerPlaylist;
  tracks: DeezerTrack[];
}

interface ElementoMenu {
  nombre: string;
  href: string;
  icono: LucideIcon;
  activo?: boolean;
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
   VALIDADORES
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
): string | null {
  if (!esObjeto(valor)) {
    return null;
  }

  return typeof valor.error === "string"
    ? valor.error
    : null;
}

function esArregloTextos(
  valor: unknown
): valor is string[] {
  return (
    Array.isArray(valor) &&
    valor.every(
      (elemento) =>
        typeof elemento === "string"
    )
  );
}

function esSeccion(
  valor: unknown
): valor is SeccionDesarrollo {
  return (
    esObjeto(valor) &&
    typeof valor.titulo === "string" &&
    typeof valor.contenido === "string"
  );
}

function esConcepto(
  valor: unknown
): valor is ConceptoClave {
  return (
    esObjeto(valor) &&
    typeof valor.concepto === "string" &&
    typeof valor.definicion === "string"
  );
}

function esResumenGenerado(
  valor: unknown
): valor is ResumenGenerado {
  if (!esObjeto(valor)) {
    return false;
  }

  return (
    typeof valor.titulo === "string" &&
    typeof valor.materia === "string" &&
    typeof valor.tiempo_lectura ===
      "string" &&
    typeof valor.resumen_general ===
      "string" &&
    Array.isArray(
      valor.secciones_desarrollo
    ) &&
    valor.secciones_desarrollo.every(
      esSeccion
    ) &&
    esArregloTextos(
      valor.ideas_principales
    ) &&
    Array.isArray(
      valor.conceptos_clave
    ) &&
    valor.conceptos_clave.every(
      esConcepto
    ) &&
    esArregloTextos(valor.ejemplos) &&
    esArregloTextos(
      valor.datos_importantes
    ) &&
    typeof valor.conclusion === "string"
  );
}

function esMaterialPendiente(
  valor: unknown
): valor is MaterialPendiente {
  return (
    esObjeto(valor) &&
    typeof valor.id === "string" &&
    typeof valor.nombre_archivo ===
      "string" &&
    typeof valor.url_archivo ===
      "string" &&
    valor.id.trim() !== "" &&
    valor.nombre_archivo.trim() !== "" &&
    valor.url_archivo.trim() !== ""
  );
}

function esRespuestaJamendo(
  valor: unknown
): valor is RespuestaJamendo {
  return (
    esObjeto(valor) &&
    Array.isArray(valor.tracks)
  );
}

function esRespuestaDeezer(
  valor: unknown
): valor is RespuestaDeezer {
  return (
    esObjeto(valor) &&
    esObjeto(valor.playlist) &&
    Array.isArray(valor.tracks)
  );
}

function normalizarResumen(
  dato: Partial<Resumen>
): Resumen {
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

    nombre_archivo:
      dato.nombre_archivo || null,

    url_archivo:
      dato.url_archivo || null,

    titulo:
      dato.titulo ||
      "Resumen sin título",

    materia:
      dato.materia || "General",

    tiempo_lectura:
      dato.tiempo_lectura ||
      "5 min de lectura",

    resumen_general:
      dato.resumen_general || "",

    secciones_desarrollo:
      Array.isArray(
        dato.secciones_desarrollo
      )
        ? dato.secciones_desarrollo
        : [],

    ideas_principales:
      Array.isArray(
        dato.ideas_principales
      )
        ? dato.ideas_principales
        : [],

    conceptos_clave:
      Array.isArray(
        dato.conceptos_clave
      )
        ? dato.conceptos_clave
        : [],

    ejemplos:
      Array.isArray(dato.ejemplos)
        ? dato.ejemplos
        : [],

    datos_importantes:
      Array.isArray(
        dato.datos_importantes
      )
        ? dato.datos_importantes
        : [],

    conclusion:
      dato.conclusion || "",

    fecha_creacion:
      dato.fecha_creacion ||
      new Date().toISOString(),
  };
}

/* =====================================================
   COMPONENTE
===================================================== */

export default function ResumenesPage() {
  const router = useRouter();

  const generacionAutomaticaRef =
    useRef(false);

  const lecturaCanceladaRef =
    useRef(false);

  const audioGratisElementRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const audioPremiumRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  /* DISEÑO */

  const [menuAbierto, setMenuAbierto] =
    useState(false);

  const [perfilAbierto, setPerfilAbierto] =
    useState(false);

  const [modoOscuro, setModoOscuro] =
    useState(false);

  const [notificacion, setNotificacion] =
    useState("");

  /* USUARIO */

  const [nombreUsuario, setNombreUsuario] =
    useState("Usuario");

  const [fotoPerfil, setFotoPerfil] =
    useState("/raccoon.png");

  const [esPremium, setEsPremium] =
    useState(false);

  /* RESÚMENES */

  const [resumenes, setResumenes] =
    useState<Resumen[]>([]);

  const [
    resumenSeleccionado,
    setResumenSeleccionado,
  ] = useState<Resumen | null>(null);

  const [
    cargandoResumenes,
    setCargandoResumenes,
  ] = useState(true);

  const [busqueda, setBusqueda] =
    useState("");

  /* GENERACIÓN */

  const [subiendo, setSubiendo] =
    useState(false);

  const [
    estadoGeneracion,
    setEstadoGeneracion,
  ] = useState("");

  const [
    progresoGeneracion,
    setProgresoGeneracion,
  ] = useState(0);

  const [
    tipoResumen,
    setTipoResumen,
  ] = useState<
    "corto" | "completo" | "examen"
  >("corto");

  const [
    nivelDetalle,
    setNivelDetalle,
  ] = useState<
    "basico" | "intermedio" | "profundo"
  >("basico");

  /* LECTOR */

  const [leyendo, setLeyendo] =
    useState(false);

  const [
    lecturaPausada,
    setLecturaPausada,
  ] = useState(false);

  const [
    mostrarPremium,
    setMostrarPremium,
  ] = useState(false);

  /* JAMENDO */

  const [
    tracksGratis,
    setTracksGratis,
  ] = useState<JamendoTrack[]>([]);

  const [
    cargandoMusicaGratis,
    setCargandoMusicaGratis,
  ] = useState(true);

  const [
    trackGratisActual,
    setTrackGratisActual,
  ] = useState<JamendoTrack | null>(
    null
  );

  const [
    musicaGratisActiva,
    setMusicaGratisActiva,
  ] = useState(false);

  const [
    volumenGratis,
    setVolumenGratis,
  ] = useState(55);

  /* DEEZER */

  const [
    playlistPremium,
    setPlaylistPremium,
  ] = useState<DeezerPlaylist | null>(
    null
  );

  const [
    tracksPremium,
    setTracksPremium,
  ] = useState<DeezerTrack[]>([]);

  const [
    cargandoPlaylist,
    setCargandoPlaylist,
  ] = useState(false);

  const [
    trackPremiumActual,
    setTrackPremiumActual,
  ] = useState<DeezerTrack | null>(
    null
  );

  const [
    musicaPremiumActiva,
    setMusicaPremiumActiva,
  ] = useState(false);

  const [
    volumenPremium,
    setVolumenPremium,
  ] = useState(65);

  /* =====================================================
     NOTIFICACIÓN
  ===================================================== */

  const mostrarNotificacion = (
    mensaje: string
  ) => {
    setNotificacion(mensaje);

    window.setTimeout(() => {
      setNotificacion("");
    }, 5000);
  };

  /* =====================================================
     USUARIO
  ===================================================== */

  const obtenerUsuario = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/Login");
      return false;
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

    if (metadata.avatar_url) {
      setFotoPerfil(
        metadata.avatar_url
      );
    }

    const plan = String(
      metadata.plan ||
        metadata.subscription ||
        metadata.tipo_plan ||
        ""
    ).toLowerCase();

    setEsPremium(
      metadata.premium === true ||
        metadata.is_premium === true ||
        plan.includes("premium")
    );

    return true;
  };

  /* =====================================================
     CARGAR RESÚMENES
  ===================================================== */

  const obtenerResumenes = async () => {
    try {
      setCargandoResumenes(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } =
        await supabase
          .from("resumenes")
          .select("*")
          .eq(
            "usuario_id",
            user.id
          )
          .order("fecha_creacion", {
            ascending: false,
          });

      if (error) {
        throw new Error(
          error.message
        );
      }

      setResumenes(
        (data || []).map((item) =>
          normalizarResumen(
            item as Partial<Resumen>
          )
        )
      );
    } catch (error) {
      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los resúmenes."
      );
    } finally {
      setCargandoResumenes(false);
    }
  };

  /* =====================================================
     LLAMAR API DE RESUMEN
  ===================================================== */

  const solicitarResumen = async (
    archivo: File,
    token: string
  ): Promise<ResumenGenerado> => {
    const formulario = new FormData();

    formulario.append(
      "archivo",
      archivo
    );

    formulario.append(
      "tipo_resumen",
      tipoResumen
    );

    formulario.append(
      "nivel_detalle",
      nivelDetalle
    );

    const respuesta = await fetch(
      "/api/resumenes/generar",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formulario,
      }
    );

    const tipoContenido =
      respuesta.headers.get(
        "content-type"
      ) || "";

    let resultado: unknown;

    if (
      tipoContenido.includes(
        "application/json"
      )
    ) {
      resultado =
        await respuesta.json();
    } else {
      resultado = {
        error:
          (await respuesta.text()) ||
          `Error ${respuesta.status}`,
      };
    }

    if (!respuesta.ok) {
      throw new Error(
        obtenerMensajeError(resultado) ||
          "No se pudo generar el resumen."
      );
    }

    if (!esResumenGenerado(resultado)) {
      throw new Error(
        obtenerMensajeError(resultado) ||
          "La IA devolvió un formato incorrecto."
      );
    }

    return resultado;
  };

  /* =====================================================
     GUARDAR RESUMEN
  ===================================================== */

  const guardarResumen = async (
    resultado: ResumenGenerado,
    material: MaterialPendiente,
    usuarioId: string
  ) => {
    const {
      data,
      error,
    } = await supabase
      .from("resumenes")
      .insert({
        usuario_id: usuarioId,

        material_id:
          material.material_id ||
          material.id,

        nombre_archivo:
          material.nombre_archivo,

        url_archivo:
          material.url_archivo,

        titulo:
          resultado.titulo,

        materia:
          resultado.materia,

        tiempo_lectura:
          resultado.tiempo_lectura,

        resumen_general:
          resultado.resumen_general,

        secciones_desarrollo:
          resultado.secciones_desarrollo,

        ideas_principales:
          resultado.ideas_principales,

        conceptos_clave:
          resultado.conceptos_clave,

        ejemplos:
          resultado.ejemplos,

        datos_importantes:
          resultado.datos_importantes,

        conclusion:
          resultado.conclusion,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(
        `No se pudo guardar el resumen: ${error.message}`
      );
    }

    return normalizarResumen(
      data as Partial<Resumen>
    );
  };

  /* =====================================================
     GENERAR DESDE DASHBOARD
  ===================================================== */

  const generarDesdeMaterialExistente =
    async (
      material: MaterialPendiente
    ) => {
      try {
        setSubiendo(true);
        setProgresoGeneracion(10);

        setEstadoGeneracion(
          "Comprobando el material..."
        );

        const {
          data: { user },
        } = await supabase.auth.getUser();

        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!user || !session) {
          router.replace("/Login");
          return;
        }

        /*
          EVITA CREAR EL MISMO RESUMEN
          DOS VECES.
        */

        const {
          data: resumenExistente,
        } = await supabase
          .from("resumenes")
          .select("*")
          .eq(
            "usuario_id",
            user.id
          )
          .eq(
            "material_id",
            material.material_id ||
              material.id
          )
          .maybeSingle();

        if (resumenExistente) {
          const resumen =
            normalizarResumen(
              resumenExistente as Partial<Resumen>
            );

          setResumenes((actuales) => [
            resumen,
            ...actuales.filter(
              (item) =>
                item.id !== resumen.id
            ),
          ]);

          setResumenSeleccionado(
            resumen
          );

          setProgresoGeneracion(100);

          setEstadoGeneracion(
            "Este material ya tenía un resumen."
          );

          mostrarNotificacion(
            "Abrimos el resumen existente."
          );

          return;
        }

        setProgresoGeneracion(25);

        setEstadoGeneracion(
          "Obteniendo el archivo guardado..."
        );

        const respuestaArchivo =
          await fetch(
            material.url_archivo,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        if (!respuestaArchivo.ok) {
          throw new Error(
            "No se pudo obtener el archivo guardado. Verifica que el bucket materiales sea público."
          );
        }

        const blob =
          await respuestaArchivo.blob();

        if (blob.size === 0) {
          throw new Error(
            "El archivo guardado está vacío."
          );
        }

        const archivo = new File(
          [blob],
          material.nombre_archivo,
          {
            type:
              blob.type ||
              "application/octet-stream",
          }
        );

        setProgresoGeneracion(45);

        setEstadoGeneracion(
          "Raccoon está leyendo el documento..."
        );

        const resultado =
          await solicitarResumen(
            archivo,
            session.access_token
          );

        setProgresoGeneracion(80);

        setEstadoGeneracion(
          "Guardando el resumen..."
        );

        const nuevoResumen =
          await guardarResumen(
            resultado,
            material,
            user.id
          );

        setResumenes((actuales) => [
          nuevoResumen,
          ...actuales.filter(
            (item) =>
              item.id !==
              nuevoResumen.id
          ),
        ]);

        setResumenSeleccionado(
          nuevoResumen
        );

        setProgresoGeneracion(100);

        setEstadoGeneracion(
          "¡Resumen terminado!"
        );

        mostrarNotificacion(
          "Resumen generado correctamente."
        );
      } catch (error) {
        console.error(error);

        const mensaje =
          error instanceof Error
            ? error.message
            : "No se pudo generar el resumen.";

        setEstadoGeneracion(mensaje);
        setProgresoGeneracion(0);

        mostrarNotificacion(mensaje);
      } finally {
        setSubiendo(false);
      }
    };

  /* =====================================================
     PROCESAR MATERIAL PENDIENTE
  ===================================================== */

  const procesarMaterialPendiente =
    async () => {
      if (
        generacionAutomaticaRef.current
      ) {
        return;
      }

      const parametros =
        new URLSearchParams(
          window.location.search
        );

      const generar =
        parametros.get("generar");

      const materialId =
        parametros.get("material");

      if (
        generar !== "1" ||
        !materialId
      ) {
        return;
      }

      generacionAutomaticaRef.current =
        true;

      const contenido =
        sessionStorage.getItem(
          "resumen-material-pendiente"
        );

      if (!contenido) {
        mostrarNotificacion(
          "No encontramos el material seleccionado."
        );

        router.replace(
          "/metodos/resumenes"
        );

        return;
      }

      try {
        const material: unknown =
          JSON.parse(contenido);

        if (
          !esMaterialPendiente(
            material
          )
        ) {
          throw new Error(
            "La información del material no es válida."
          );
        }

        if (
          material.id !==
          materialId
        ) {
          throw new Error(
            "El material seleccionado no coincide."
          );
        }

        sessionStorage.removeItem(
          "resumen-material-pendiente"
        );

        router.replace(
          "/metodos/resumenes"
        );

        await generarDesdeMaterialExistente(
          material
        );
      } catch (error) {
        sessionStorage.removeItem(
          "resumen-material-pendiente"
        );

        mostrarNotificacion(
          error instanceof Error
            ? error.message
            : "No se pudo usar el material."
        );

        router.replace(
          "/metodos/resumenes"
        );
      }
    };

  /* =====================================================
     SUBIR DESDE RESÚMENES
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
      archivo.name
        .split(".")
        .pop()
        ?.toLowerCase() || "";

    if (
      ![
        "pdf",
        "docx",
        "pptx",
        "txt",
      ].includes(extension)
    ) {
      mostrarNotificacion(
        "Solo puedes subir PDF, DOCX, PPTX o TXT."
      );

      evento.target.value = "";
      return;
    }

    let rutaStorage = "";

    let materialId:
      | string
      | null = null;

    try {
      setSubiendo(true);
      setProgresoGeneracion(10);

      setEstadoGeneracion(
        "Subiendo el material..."
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!user || !session) {
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

      rutaStorage = `${user.id}/resumenes/${crypto.randomUUID()}-${nombreSeguro}`;

      const {
        error: errorStorage,
      } = await supabase.storage
        .from("materiales")
        .upload(
          rutaStorage,
          archivo
        );

      if (errorStorage) {
        throw new Error(
          errorStorage.message
        );
      }

      const { data: urlData } =
        supabase.storage
          .from("materiales")
          .getPublicUrl(
            rutaStorage
          );

      const {
        data: materialGuardado,
        error: errorMaterial,
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
        .select("id")
        .single();

      if (errorMaterial) {
        throw new Error(
          errorMaterial.message
        );
      }

      materialId = String(
        materialGuardado.id
      );

      setProgresoGeneracion(45);

      setEstadoGeneracion(
        "Generando el resumen..."
      );

      const resultado =
        await solicitarResumen(
          archivo,
          session.access_token
        );

      const nuevoResumen =
        await guardarResumen(
          resultado,
          {
            id: materialId,
            material_id: materialId,
            nombre_archivo:
              archivo.name,
            url_archivo:
              urlData.publicUrl,
          },
          user.id
        );

      setResumenes((actuales) => [
        nuevoResumen,
        ...actuales,
      ]);

      setResumenSeleccionado(
        nuevoResumen
      );

      setProgresoGeneracion(100);

      setEstadoGeneracion(
        "¡Resumen terminado!"
      );
    } catch (error) {
      if (materialId) {
        await supabase
          .from("materiales")
          .delete()
          .eq("id", materialId);
      }

      if (rutaStorage) {
        await supabase.storage
          .from("materiales")
          .remove([rutaStorage]);
      }

      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudo generar el resumen."
      );
    } finally {
      setSubiendo(false);
      evento.target.value = "";
    }
  };

  /* =====================================================
     MÚSICA GRATIS
  ===================================================== */

  const cargarMusicaGratis =
    async () => {
      try {
        setCargandoMusicaGratis(true);

        const respuesta = await fetch(
          "/api/musica/jamendo"
        );

        const resultado: unknown =
          await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            obtenerMensajeError(resultado) ||
              "No se pudo cargar Jamendo."
          );
        }

        if (
          !esRespuestaJamendo(
            resultado
          )
        ) {
          throw new Error(
            "Jamendo devolvió un formato incorrecto."
          );
        }

        setTracksGratis(
          resultado.tracks
        );
      } catch (error) {
        console.error(error);
        setTracksGratis([]);
      } finally {
        setCargandoMusicaGratis(false);
      }
    };

  const reproducirGratis =
    async (track: JamendoTrack) => {
      const audio =
        audioGratisElementRef.current;

      if (!audio) return;

      audioPremiumRef.current?.pause();

      if (
        trackGratisActual?.id ===
        track.id
      ) {
        if (audio.paused) {
          await audio.play();
        } else {
          audio.pause();
        }

        return;
      }

      setTrackGratisActual(track);

      audio.src = track.audio;
      audio.volume =
        volumenGratis / 100;

      await audio.play();
    };

  /* =====================================================
     DEEZER
  ===================================================== */

  const cargarDeezer = async () => {
    if (!esPremium) {
      setMostrarPremium(true);
      return;
    }

    try {
      setCargandoPlaylist(true);

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!session) return;

      const respuesta = await fetch(
        "/api/musica/deezer",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const resultado: unknown =
        await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeError(resultado) ||
            "No se pudo cargar Deezer."
        );
      }

      if (
        !esRespuestaDeezer(
          resultado
        )
      ) {
        throw new Error(
          "Deezer devolvió un formato incorrecto."
        );
      }

      setPlaylistPremium(
        resultado.playlist
      );

      setTracksPremium(
        resultado.tracks
      );
    } catch (error) {
      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "No se pudo cargar Deezer."
      );
    } finally {
      setCargandoPlaylist(false);
    }
  };

  const reproducirPremium =
    async (track: DeezerTrack) => {
      if (!esPremium) {
        setMostrarPremium(true);
        return;
      }

      const audio =
        audioPremiumRef.current;

      if (!audio) return;

      audioGratisElementRef.current?.pause();

      if (
        trackPremiumActual?.id ===
        track.id
      ) {
        if (audio.paused) {
          await audio.play();
        } else {
          audio.pause();
        }

        return;
      }

      setTrackPremiumActual(track);

      audio.src = track.preview;
      audio.volume =
        volumenPremium / 100;

      await audio.play();
    };

  /* =====================================================
     TEXTO, QUIZ Y LECTOR
  ===================================================== */

  const obtenerTextoCompleto = (
    resumen: Resumen
  ) => {
    return `
      ${resumen.titulo}.
      ${resumen.resumen_general}.
      ${resumen.secciones_desarrollo
        .map(
          (seccion) =>
            `${seccion.titulo}. ${seccion.contenido}`
        )
        .join(". ")}.
      ${resumen.ideas_principales.join(
        ". "
      )}.
      ${resumen.conceptos_clave
        .map(
          (concepto) =>
            `${concepto.concepto}: ${concepto.definicion}`
        )
        .join(". ")}.
      ${resumen.conclusion}.
    `
      .replace(/\s+/g, " ")
      .trim();
  };

  const crearQuiz = (
    resumen: Resumen
  ) => {
    localStorage.setItem(
      "quiz-material",
      JSON.stringify({
        resumen_id: resumen.id,
        material_id:
          resumen.material_id,
        titulo:
          resumen.titulo,
        materia:
          resumen.materia,
        contenido:
          obtenerTextoCompleto(resumen),
        origen: "resumen",
      })
    );

    router.push(
      "/quizzes?crear=1&origen=resumen"
    );
  };

  const leerResumen = (
    resumen: Resumen
  ) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      mostrarNotificacion(
        "Tu navegador no admite lectura en voz alta."
      );
      return;
    }

    window.speechSynthesis.cancel();
    lecturaCanceladaRef.current = false;

    const texto =
      obtenerTextoCompleto(resumen);

    /*
      Dividimos el resumen en fragmentos cortos.
      Esto hace que SpeechSynthesis sea mucho más
      estable con resúmenes largos.
    */
    const fragmentos =
      texto
        .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
        ?.map((parte) => parte.trim())
        .filter(Boolean) || [texto];

    let indice = 0;

    const reproducirSiguiente = () => {
      if (
        lecturaCanceladaRef.current ||
        indice >= fragmentos.length
      ) {
        setLeyendo(false);
        setLecturaPausada(false);
        return;
      }

      const utterance =
        new SpeechSynthesisUtterance(
          fragmentos[indice]
        );

      utterance.lang = "es-ES";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voces =
        window.speechSynthesis.getVoices();

      const vozEspanol =
        voces.find((voz) =>
          voz.lang
            .toLowerCase()
            .startsWith("es")
        ) || null;

      if (vozEspanol) {
        utterance.voice = vozEspanol;
      }

      utterance.onstart = () => {
        setLeyendo(true);
        setLecturaPausada(false);
      };

      utterance.onend = () => {
        if (
          lecturaCanceladaRef.current
        ) {
          return;
        }

        indice += 1;
        reproducirSiguiente();
      };

      utterance.onerror = () => {
        setLeyendo(false);
        setLecturaPausada(false);
      };

      window.speechSynthesis.speak(
        utterance
      );
    };

    reproducirSiguiente();
  };

  const detenerLectura = () => {
    lecturaCanceladaRef.current = true;
    window.speechSynthesis.cancel();
    setLeyendo(false);
    setLecturaPausada(false);
  };

  const pausarLectura = () => {
    if (
      window.speechSynthesis.paused
    ) {
      window.speechSynthesis.resume();
      setLecturaPausada(false);
    } else {
      window.speechSynthesis.pause();
      setLecturaPausada(true);
    }
  };

  const copiarResumen = async (
    resumen: Resumen
  ) => {
    try {
      await navigator.clipboard.writeText(
        obtenerTextoCompleto(resumen)
      );

      mostrarNotificacion(
        "Resumen copiado al portapapeles."
      );
    } catch {
      mostrarNotificacion(
        "No se pudo copiar el resumen."
      );
    }
  };

  /* =====================================================
     TEMA
  ===================================================== */

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
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/Login");
  };

  /* =====================================================
     INICIO
  ===================================================== */

  useEffect(() => {
    const iniciar = async () => {
      const tema =
        localStorage.getItem(
          "raccoon-theme"
        );

      const oscuro =
        tema === "dark";

      setModoOscuro(oscuro);

      document.documentElement.classList.toggle(
        "dark",
        oscuro
      );

      const usuarioValido =
        await obtenerUsuario();

      if (!usuarioValido) return;

      await obtenerResumenes();

      void cargarMusicaGratis();

      await procesarMaterialPendiente();
    };

    void iniciar();

    return () => {
      window.speechSynthesis?.cancel();
      audioGratisElementRef.current?.pause();
      audioPremiumRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (audioGratisElementRef.current) {
      audioGratisElementRef.current.volume =
        volumenGratis / 100;
    }
  }, [volumenGratis]);

  useEffect(() => {
    if (audioPremiumRef.current) {
      audioPremiumRef.current.volume =
        volumenPremium / 100;
    }
  }, [volumenPremium]);

  /* =====================================================
     FILTRO
  ===================================================== */

  const resumenesFiltrados =
    resumenes.filter((resumen) =>
      `${resumen.titulo} ${resumen.materia} ${
        resumen.nombre_archivo || ""
      }`
        .toLowerCase()
        .includes(
          busqueda
            .trim()
            .toLowerCase()
        )
    );

  /* =====================================================
     INTERFAZ
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#F7FBFF] text-[#0B1B3A] dark:bg-[#101827] dark:text-white">
      {menuAbierto && (
        <div
          onClick={() =>
            setMenuAbierto(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[250px]
          flex-col border-r border-[#DDEAF7] bg-white
          transition-transform dark:border-slate-700 dark:bg-[#151F30]
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
            onClick={() =>
              setMenuAbierto(false)
            }
            className="lg:hidden"
          >
            <X />
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
                      ? "bg-[#E5F4FF] font-bold text-[#1687D9] dark:bg-[#1D3558]"
                      : "font-semibold hover:bg-[#F0F8FF] dark:hover:bg-slate-800"
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
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500"
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>

          <Link
            href="/suscripcion"
            className="block rounded-2xl bg-gradient-to-br from-[#64C7F2] via-[#55A8E8] to-[#7771E8] p-4 text-white"
          >
            <div className="flex items-center gap-3">
              <Crown />

              <div>
                <p className="font-black">
                  Raccoon Premium
                </p>

                <p className="text-xs">
                  Desbloquea más funciones
                </p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      <div className="lg:ml-[250px]">
        {/* HEADER */}

        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b bg-white/90 px-4 backdrop-blur-xl dark:border-slate-700 dark:bg-[#151F30]/90 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setMenuAbierto(true)
              }
              className="lg:hidden"
            >
              <Menu />
            </button>

            <h1 className="text-xl font-black">
              Resúmenes con IA
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-[#F1F8FD] px-4 py-2 dark:bg-slate-800 md:flex">
              <Search size={18} />

              <input
                value={busqueda}
                onChange={(evento) =>
                  setBusqueda(
                    evento.target.value
                  )
                }
                placeholder="Buscar..."
                className="bg-transparent text-sm outline-none"
              />
            </div>

            <div className="relative">
              <button
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
                />

                <ChevronDown size={16} />
              </button>

              {perfilAbierto && (
                <div className="absolute right-0 top-14 w-52 rounded-2xl bg-white p-2 shadow-xl dark:bg-slate-800">
                  <p className="px-3 py-2 font-bold">
                    {nombreUsuario}
                  </p>

                  <button
                    onClick={cambiarTema}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3"
                  >
                    {modoOscuro ? (
                      <Sun size={17} />
                    ) : (
                      <Moon size={17} />
                    )}

                    Cambiar tema
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {notificacion && (
          <div className="fixed left-1/2 top-5 z-[200] -translate-x-1/2 rounded-2xl bg-[#55A8E8] px-5 py-3 font-bold text-white shadow-xl">
            {notificacion}
          </div>
        )}

        <div className="mx-auto max-w-[1500px] px-4 py-6 pb-28 sm:px-6 lg:px-8">
          <Link
            href="/metodos"
            className="mb-5 flex items-center gap-2 text-sm font-bold text-[#4169A1]"
          >
            <ArrowLeft size={18} />
            Volver a métodos
          </Link>

          {!resumenSeleccionado && (
            <>
              <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_315px]">
                {/* COLUMNA PRINCIPAL */}
                <div className="min-w-0 space-y-4">
                  {/* HERO */}
                  <section className="relative overflow-hidden rounded-[26px] border border-[#E1E8F5] bg-gradient-to-r from-[#F3ECFF] via-[#EEF5FF] to-[#EAF7FF] px-5 py-6 shadow-[0_14px_36px_rgba(52,83,145,0.06)] dark:border-slate-700 dark:from-[#2A2345] dark:via-[#1A2940] dark:to-[#17344B] sm:px-7 lg:px-8">
                    <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/50 blur-3xl dark:bg-white/5" />

                    <div className="relative z-10 flex min-h-[155px] items-center justify-between gap-5">
                      <div className="min-w-0 flex-1">
                        <h1 className="text-3xl font-black tracking-[-0.035em] text-[#081A39] dark:text-white sm:text-4xl lg:text-[42px]">
                          Resúmenes con IA
                        </h1>

                        <p className="mt-2 max-w-[640px] text-sm leading-6 text-[#627995] dark:text-slate-300 sm:text-base">
                          Convierte tus materiales en resúmenes claros, rápidos y útiles para estudiar.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2.5">
                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-3 py-2 text-xs font-bold text-[#5C6F88] shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                            <Sparkles size={15} className="text-[#7652D9]" />
                            Generado con IA
                          </span>

                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-3 py-2 text-xs font-bold text-[#5C6F88] shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                            <FolderOpen size={15} className="text-[#3978F6]" />
                            Organizado por temas
                          </span>

                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-3 py-2 text-xs font-bold text-[#5C6F88] shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                            <Zap size={15} className="text-amber-500" />
                            Listo en segundos
                          </span>
                        </div>
                      </div>

                      <Image
                        src="/resumenes.png"
                        alt="Raccoon creando resúmenes"
                        width={285}
                        height={180}
                        priority
                        className="hidden max-h-[170px] w-auto shrink-0 object-contain drop-shadow-lg md:block"
                      />
                    </div>
                  </section>

                  {/* CREAR NUEVO RESUMEN */}
                  <section className="rounded-[26px] border border-[#E2E9F3] bg-white p-4 shadow-[0_12px_32px_rgba(35,78,124,0.045)] dark:border-slate-700 dark:bg-[#182437] sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black text-[#10233F] dark:text-white">
                          Crear nuevo resumen
                        </h2>
                        <p className="mt-1 text-xs text-[#7A8FA7] dark:text-slate-400">
                          Sube tu material y elige cómo quieres estudiarlo.
                        </p>
                      </div>

                      <span className={`hidden rounded-full px-3 py-1.5 text-[10px] font-black sm:inline-flex ${
                        esPremium
                          ? "bg-[#FFF1C9] text-[#9A6800] dark:bg-amber-950/30 dark:text-amber-300"
                          : "bg-[#EAF1FF] text-[#1769E0] dark:bg-blue-950/30 dark:text-blue-300"
                      }`}>
                        {esPremium ? "👑 Premium activo" : "Plan gratuito"}
                      </span>
                    </div>

                    {/* ÁREA DE SUBIDA COMO EN EL BOCETO */}
                    <div className="overflow-hidden rounded-[22px] border-2 border-dashed border-[#AFC3FF] bg-gradient-to-br from-[#FCFDFF] to-[#FAF8FF] dark:border-[#52669C] dark:from-[#111D2E] dark:to-[#1B1D35]">
                      <div className="grid min-h-[180px] items-center gap-5 p-5 md:grid-cols-[230px_1fr]">
                        {/* FORMATOS */}
                        <div>
                          <p className="text-sm font-black text-[#213752] dark:text-white">
                            Sube tu material
                          </p>

                          <p className="mt-1 text-[10px] text-[#8092A7] dark:text-slate-400">
                            Formatos soportados
                          </p>

                          <div className="mt-4 grid grid-cols-4 gap-2">
                            {[
                              { nombre: "PDF", icono: FileText, color: "text-red-500 bg-red-50 dark:bg-red-950/20" },
                              { nombre: "DOCX", icono: FileText, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
                              { nombre: "PPTX", icono: FileText, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/20" },
                              { nombre: "TXT", icono: FileText, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" },
                            ].map((formato) => {
                              const Icono = formato.icono;

                              return (
                                <div key={formato.nombre} className="text-center">
                                  <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#E4EAF2] ${formato.color} dark:border-slate-700`}>
                                    <Icono size={20} />
                                  </div>
                                  <p className="mt-1.5 text-[9px] font-black text-[#667C96] dark:text-slate-400">
                                    {formato.nombre}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* DROPZONE */}
                        <label
                          htmlFor="archivo-resumen"
                          className={`flex min-h-[135px] cursor-pointer flex-col items-center justify-center rounded-[20px] transition ${
                            subiendo
                              ? "cursor-wait"
                              : "hover:bg-white/65 dark:hover:bg-white/5"
                          }`}
                        >
                          {subiendo ? (
                            <>
                              <LoaderCircle size={38} className="animate-spin text-[#7652D9]" />
                              <p className="mt-3 text-sm font-black">
                                {estadoGeneracion}
                              </p>
                              <div className="mt-4 h-2 w-full max-w-[340px] overflow-hidden rounded-full bg-[#E7ECF4] dark:bg-slate-700">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#3978F6] to-[#7652D9]"
                                  style={{ width: `${progresoGeneracion}%` }}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEE9FF] text-[#7652D9] dark:bg-violet-950/30 dark:text-violet-200">
                                <Upload size={27} />
                              </div>

                              <p className="mt-3 text-sm font-black text-[#213752] dark:text-white">
                                Arrastra y suelta tu archivo aquí
                              </p>

                              <p className="mt-1 text-[10px] text-[#8394A8] dark:text-slate-400">
                                o selecciona un archivo de tu dispositivo
                              </p>

                              <span className="mt-4 rounded-xl bg-gradient-to-r from-[#4169F2] to-[#7652D9] px-6 py-3 text-xs font-black text-white shadow-[0_8px_20px_rgba(93,82,217,0.22)]">
                                Seleccionar archivo
                              </span>
                            </>
                          )}
                        </label>
                      </div>

                      {/* OPCIONES ABAJO */}
                      <div className="grid gap-4 border-t border-dashed border-[#B9C9EE] bg-white/55 p-4 dark:border-[#435679] dark:bg-white/[0.025] md:grid-cols-2">
                        <div className="md:border-r md:border-[#E3E9F2] md:pr-5 dark:md:border-slate-700">
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#70849C] dark:text-slate-400">
                              Tipo de resumen
                            </p>
                            <Info size={13} className="text-[#3978F6]" />
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {[
                              { id: "corto", nombre: "Corto", premium: false },
                              { id: "completo", nombre: "Completo", premium: true },
                              { id: "examen", nombre: "Para examen", premium: true },
                            ].map((opcion) => {
                              const bloqueado = opcion.premium && !esPremium;
                              const activo = tipoResumen === opcion.id;

                              return (
                                <button
                                  key={opcion.id}
                                  type="button"
                                  onClick={() => {
                                    if (bloqueado) {
                                      setMostrarPremium(true);
                                      return;
                                    }
                                    setTipoResumen(opcion.id as "corto" | "completo" | "examen");
                                  }}
                                  className={`relative rounded-xl border px-2 py-2.5 text-[10px] font-black transition sm:text-xs ${
                                    activo
                                      ? "border-[#7652D9] bg-gradient-to-r from-[#4169F2] to-[#7652D9] text-white shadow-sm"
                                      : "border-[#DFE6F0] bg-white text-[#687D95] hover:border-[#B8C8EE] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  }`}
                                >
                                  {opcion.nombre}
                                  {bloqueado && (
                                    <Lock size={10} className="absolute right-1 top-1 text-amber-500" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="md:pl-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#70849C] dark:text-slate-400">
                              Nivel de detalle
                            </p>
                            <Info size={13} className="text-[#3978F6]" />
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {[
                              { id: "basico", nombre: "Básico", premium: false },
                              { id: "intermedio", nombre: "Intermedio", premium: true },
                              { id: "profundo", nombre: "Profundo", premium: true },
                            ].map((opcion) => {
                              const bloqueado = opcion.premium && !esPremium;
                              const activo = nivelDetalle === opcion.id;

                              return (
                                <button
                                  key={opcion.id}
                                  type="button"
                                  onClick={() => {
                                    if (bloqueado) {
                                      setMostrarPremium(true);
                                      return;
                                    }
                                    setNivelDetalle(opcion.id as "basico" | "intermedio" | "profundo");
                                  }}
                                  className={`relative rounded-xl border px-2 py-2.5 text-[10px] font-black transition sm:text-xs ${
                                    activo
                                      ? "border-[#7652D9] bg-[#F0ECFF] text-[#6548E8] dark:bg-violet-950/30 dark:text-violet-200"
                                      : "border-[#DFE6F0] bg-white text-[#687D95] hover:border-[#B8C8EE] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  }`}
                                >
                                  {opcion.nombre}
                                  {bloqueado && (
                                    <Lock size={10} className="absolute right-1 top-1 text-amber-500" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <input
                      id="archivo-resumen"
                      type="file"
                      className="hidden"
                      disabled={subiendo}
                      accept=".pdf,.docx,.pptx,.txt"
                      onChange={subirArchivo}
                    />
                  </section>

                  {/* PROCESO */}
                  <section className="rounded-[22px] border border-[#E2E9F3] bg-white px-4 py-3 dark:border-slate-700 dark:bg-[#182437]">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { titulo: "Archivo recibido", texto: "Listo para analizar", icono: FileText, activo: true },
                        { titulo: "Analizando", texto: "Comprendiendo contenido", icono: BrainCircuit, activo: subiendo },
                        { titulo: "Creando resumen", texto: "Organizando información", icono: Sparkles, activo: subiendo && progresoGeneracion > 45 },
                        { titulo: "Listo", texto: "Revisando calidad", icono: CheckCircle2, activo: false },
                      ].map((paso) => {
                        const Icono = paso.icono;

                        return (
                          <div
                            key={paso.titulo}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                              paso.activo
                                ? "bg-[#F0ECFF] dark:bg-violet-950/20"
                                : ""
                            }`}
                          >
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              paso.activo
                                ? "bg-white text-[#7652D9] shadow-sm dark:bg-slate-800"
                                : "bg-[#F5F7FA] text-[#A3AFBE] dark:bg-slate-800 dark:text-slate-500"
                            }`}>
                              <Icono size={16} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[10px] font-black">
                                {paso.titulo}
                              </p>
                              <p className="mt-0.5 truncate text-[9px] text-[#8A99AB] dark:text-slate-400">
                                {paso.texto}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* COLUMNA DERECHA */}
                <aside className="min-w-0 space-y-5">
                  {/* RACCOON IA */}
                  <section className="rounded-[26px] border border-[#E2E9F3] bg-gradient-to-br from-[#F8FBFF] to-[#F7F2FF] p-5 shadow-[0_12px_30px_rgba(38,78,125,0.05)] dark:border-slate-700 dark:from-[#182437] dark:to-[#211E35]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-800">
                        <Image
                          src="/raccoon.png"
                          alt="Raccoon IA"
                          width={52}
                          height={52}
                          className="h-12 w-12 object-contain"
                        />
                      </div>

                      <div>
                        <h2 className="text-lg font-black">
                          Raccoon IA
                        </h2>
                        <span className="mt-1 inline-flex rounded-full bg-[#EEE8FF] px-3 py-1 text-[10px] font-black text-[#7652D9] dark:bg-violet-950/30 dark:text-violet-200">
                          Tu asistente de estudio
                        </span>
                      </div>
                    </div>

                    <p className="mt-5 text-sm font-bold text-[#4D627C] dark:text-slate-300">
                      ¿Qué te ayudo a hacer hoy?
                    </p>

                    <div className="mt-4 space-y-2.5">
                      {[
                        { titulo: "Resumirlo", texto: "Genera un resumen inteligente", icono: FileText, color: "bg-[#F0ECFF] text-[#7652D9]" },
                        { titulo: "Explicármelo fácil", texto: "En lenguaje sencillo", icono: MessageCircle, color: "bg-[#EAF6FF] text-[#1687D9]" },
                        { titulo: "Crear preguntas", texto: "Genera preguntas de práctica", icono: HelpCircle, color: "bg-[#EAF9F1] text-[#26A66B]" },
                        { titulo: "Prepararme para examen", texto: "Plan de estudio personalizado", icono: GraduationCap, color: "bg-[#FFF3DA] text-[#E29B00]" },
                      ].map((accion) => {
                        const Icono = accion.icono;

                        return (
                          <button
                            key={accion.titulo}
                            type="button"
                            onClick={() => {
                              if (accion.titulo === "Resumirlo") {
                                document.getElementById("archivo-resumen")?.click();
                                return;
                              }

                              if (!esPremium) {
                                setMostrarPremium(true);
                                return;
                              }

                              mostrarNotificacion(`${accion.titulo} estará disponible desde Raccoon IA.`);
                            }}
                            className="flex w-full items-center justify-between rounded-2xl border border-[#E2E9F3] bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#C7D6EE] dark:border-slate-700 dark:bg-[#111D2E]"
                          >
                            <span className="flex items-center gap-3">
                              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accion.color} dark:bg-slate-800`}>
                                <Icono size={18} />
                              </span>

                              <span>
                                <span className="block text-xs font-black">
                                  {accion.titulo}
                                </span>
                                <span className="mt-1 block text-[10px] text-[#8191A5] dark:text-slate-400">
                                  {accion.texto}
                                </span>
                              </span>
                            </span>

                            <ArrowRight size={15} />
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* MÚSICA COMPACTA */}
                  <section className="rounded-[26px] border border-[#E2E9F3] bg-white p-5 shadow-[0_12px_30px_rgba(38,78,125,0.05)] dark:border-slate-700 dark:bg-[#182437]">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black">
                        Música para estudiar
                      </h2>
                      <Music2 size={18} />
                    </div>

                    <div className="mt-4 rounded-[22px] bg-gradient-to-br from-[#EFEAFF] via-[#EBF0FF] to-[#E8F6FF] p-5 dark:from-[#2A2345] dark:via-[#1C2941] dark:to-[#17344B]">
                      <p className="text-sm font-black">
                        {trackPremiumActual?.titulo ||
                          trackGratisActual?.titulo ||
                          tracksGratis[0]?.titulo ||
                          "Lo-fi Focus"}
                      </p>

                      <p className="mt-1 text-[10px] text-[#7D8DA3] dark:text-slate-300">
                        Playlist actual
                      </p>

                      <div className="my-6 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (trackPremiumActual) {
                              void reproducirPremium(trackPremiumActual);
                            } else if (trackGratisActual) {
                              void reproducirGratis(trackGratisActual);
                            } else if (tracksGratis[0]) {
                              void reproducirGratis(tracksGratis[0]);
                            } else {
                              void cargarMusicaGratis();
                            }
                          }}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#4169F2] to-[#7652D9] text-white shadow-[0_12px_28px_rgba(93,82,217,0.28)]"
                        >
                          {musicaGratisActiva || musicaPremiumActiva ? (
                            <Pause size={22} />
                          ) : (
                            <Play size={22} />
                          )}
                        </button>
                      </div>

                      <div className="h-1.5 rounded-full bg-white/65 dark:bg-white/10">
                        <div className="h-full w-[48%] rounded-full bg-gradient-to-r from-[#4169F2] to-[#7652D9]" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!esPremium) {
                          setMostrarPremium(true);
                          return;
                        }

                        const disponibles = [
                          ...tracksGratis.map(
                            (track) => ({
                              tipo: "gratis" as const,
                              track,
                            })
                          ),
                          ...tracksPremium.map(
                            (track) => ({
                              tipo: "premium" as const,
                              track,
                            })
                          ),
                        ];

                        if (disponibles.length === 0) {
                          void cargarMusicaGratis();

                          if (esPremium) {
                            void cargarDeezer();
                          }

                          return;
                        }

                        const actualId =
                          trackPremiumActual?.id ??
                          trackGratisActual?.id;

                        const indiceActual =
                          disponibles.findIndex(
                            (item) =>
                              item.track.id ===
                              actualId
                          );

                        const siguiente =
                          disponibles[
                            (indiceActual + 1) %
                              disponibles.length
                          ];

                        if (
                          siguiente.tipo ===
                          "premium"
                        ) {
                          void reproducirPremium(
                            siguiente.track
                          );
                        } else {
                          void reproducirGratis(
                            siguiente.track
                          );
                        }
                      }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-black text-[#7652D9] transition hover:bg-[#F6F2FF] dark:text-violet-200 dark:hover:bg-violet-950/20"
                    >
                      Cambiar playlist
                      <ArrowRight size={14} />
                    </button>
                  </section>
                </aside>
              </div>
            </>
          )}

          {/* DETALLE O LISTA */}

          {resumenSeleccionado ? (
            <section className="mt-1">
              <button
                onClick={() => {
                  setResumenSeleccionado(null);
                  detenerLectura();
                }}
                className="mb-4 flex items-center gap-2 text-sm font-black text-[#4169A1] dark:text-blue-300"
              >
                <ArrowLeft size={18} />
                Volver a mis resúmenes
              </button>

              {/* RESUMEN LISTO */}
              <section className="relative overflow-hidden rounded-[28px] border border-[#DDE9F5] bg-gradient-to-r from-[#EAF8FF] via-[#F4F1FF] to-[#EAF3FF] p-5 shadow-[0_16px_42px_rgba(52,86,145,0.07)] dark:border-slate-700 dark:from-[#16304D] dark:via-[#28243E] dark:to-[#18314B] sm:p-7">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-800/10" />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2BB57D] text-white shadow-[0_10px_24px_rgba(43,181,125,0.24)]">
                        <Check size={24} />
                      </span>

                      <div>
                        <h1 className="text-3xl font-black leading-tight tracking-[-0.03em] text-[#0A1C3A] dark:text-white sm:text-4xl">
                          Resumen listo 🎉
                        </h1>

                        <p className="mt-1 text-sm text-[#637E9D] dark:text-slate-300">
                          Tu material fue analizado y organizado por Raccoon IA.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid max-w-2xl gap-2 sm:grid-cols-3">
                      {[
                        {
                          titulo: "Claro",
                          texto: "Conceptos fáciles de entender",
                          color: "text-[#1687D9]",
                        },
                        {
                          titulo: "Organizado",
                          texto: "Información por temas",
                          color: "text-[#7652D9]",
                        },
                        {
                          titulo: "Listo para estudiar",
                          texto: "Contenido útil y enfocado",
                          color: "text-[#26A66B]",
                        },
                      ].map((item) => (
                        <div
                          key={item.titulo}
                          className="rounded-xl border border-white/70 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10"
                        >
                          <p className={`text-xs font-black ${item.color}`}>
                            {item.titulo}
                          </p>
                          <p className="mt-1 text-[10px] text-[#7188A2] dark:text-slate-300">
                            {item.texto}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Image
                    src="/raccoon.png"
                    alt="Raccoon Study"
                    width={155}
                    height={155}
                    className="hidden h-[145px] w-[145px] shrink-0 object-contain drop-shadow-lg sm:block"
                  />
                </div>
              </section>

              <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
                {/* CONTENIDO */}
                <div className="min-w-0 space-y-4">
                <article className="min-w-0 rounded-[28px] border border-[#E3EAF3] bg-white p-4 shadow-[0_14px_34px_rgba(38,78,125,0.05)] dark:border-slate-700 dark:bg-[#182437] sm:p-7">
                  <div className="flex flex-wrap gap-2 border-b border-[#E7EDF5] pb-4 dark:border-slate-700">
                    {[
                      "Resumen",
                      "Puntos clave",
                      "Ejemplos",
                      "Preguntas",
                    ].map((tab, indice) => (
                      <span
                        key={tab}
                        className={`rounded-xl px-3 py-2 text-xs font-black ${
                          indice === 0
                            ? "bg-[#EAF1FF] text-[#1769E0] dark:bg-blue-950/30 dark:text-blue-200"
                            : "text-[#7188A2] dark:text-slate-400"
                        }`}
                      >
                        {tab}
                      </span>
                    ))}
                  </div>

                  {/* IDEA PRINCIPAL */}
                  <section className="mt-6 px-1 sm:px-2">
                    <div className="flex items-center gap-3">
                      <BookOpen
                        size={19}
                        className="text-[#1687D9]"
                      />
                      <h2 className="font-black">
                        Idea principal
                      </h2>
                    </div>

                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#506C88] dark:text-slate-300 sm:text-[15px]">
                      {resumenSeleccionado.resumen_general}
                    </p>
                  </section>

                  {/* CONCEPTOS CLAVE */}
                  <section className="mt-6">
                    <div className="flex items-center gap-3">
                      <BrainCircuit
                        size={19}
                        className="text-[#7652D9]"
                      />
                      <h2 className="font-black">
                        Conceptos clave
                      </h2>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {resumenSeleccionado.conceptos_clave.map(
                        (concepto, indice) => (
                          <div
                            key={indice}
                            className="group relative rounded-xl border border-[#DDD5FF] bg-[#F7F4FF] px-3 py-2 dark:border-violet-900/40 dark:bg-violet-950/20"
                            title={concepto.definicion}
                          >
                            <span className="text-xs font-black text-[#6548E8] dark:text-violet-200">
                              {concepto.concepto}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  {/* DESARROLLO */}
                  <section className="mt-7 border-t border-[#EDF1F6] pt-6 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <FileText
                        size={19}
                        className="text-[#D69B00]"
                      />
                      <h2 className="font-black">
                        Desarrollo del tema
                      </h2>
                    </div>

                    <div className="mt-4 space-y-3">
                      {resumenSeleccionado.secciones_desarrollo.map(
                        (seccion, indice) => (
                          <div
                            key={indice}
                            className="flex gap-3"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3978F6]" />

                            <p className="text-sm leading-7 text-[#506C88] dark:text-slate-300">
                              <span className="font-black text-[#3978F6] dark:text-blue-300">
                                {seccion.titulo}:
                              </span>{" "}
                              {seccion.contenido}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  {/* IDEAS PRINCIPALES */}
                  <section className="mt-7">
                    <div className="flex items-center gap-3">
                      <Lightbulb
                        size={19}
                        className="text-yellow-500"
                      />
                      <h2 className="font-black">
                        Puntos clave
                      </h2>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {resumenSeleccionado.ideas_principales.map(
                        (idea, indice) => (
                          <div
                            key={indice}
                            className="flex gap-3 rounded-xl bg-[#FAFCFE] p-3.5 dark:bg-[#111D2E]"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF1FF] text-[11px] font-black text-[#1769E0] dark:bg-blue-950/30 dark:text-blue-200">
                              {indice + 1}
                            </span>

                            <p className="text-sm leading-6 text-[#506C88] dark:text-slate-300">
                              {idea}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  {/* DATOS / EJEMPLOS PREMIUM */}
                  {(resumenSeleccionado.datos_importantes.length > 0 ||
                    resumenSeleccionado.ejemplos.length > 0) && (
                    <section className="mt-7 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-[#D8EFE3] bg-[#F4FBF7] p-4 dark:border-green-900/30 dark:bg-green-950/10">
                        <div className="flex items-center gap-2">
                          <ListChecks
                            size={18}
                            className="text-[#26A66B]"
                          />
                          <h2 className="text-sm font-black">
                            Datos importantes
                          </h2>
                        </div>

                        <div className="mt-3 space-y-2">
                          {resumenSeleccionado.datos_importantes.map(
                            (dato, indice) => (
                              <p
                                key={indice}
                                className="text-xs leading-5 text-[#506C88] dark:text-slate-300"
                              >
                                • {dato}
                              </p>
                            )
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#F0E1B8] bg-[#FFF9EA] p-4 dark:border-amber-900/30 dark:bg-amber-950/10">
                        <div className="flex items-center gap-2">
                          <Sparkles
                            size={18}
                            className="text-[#D69B00]"
                          />
                          <h2 className="text-sm font-black">
                            Ejemplos
                          </h2>
                        </div>

                        {resumenSeleccionado.ejemplos.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {resumenSeleccionado.ejemplos.map(
                              (ejemplo, indice) => (
                                <p
                                  key={indice}
                                  className="text-xs leading-5 text-[#506C88] dark:text-slate-300"
                                >
                                  • {ejemplo}
                                </p>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-[#7188A2] dark:text-slate-400">
                            El material no incluía ejemplos explícitos.
                          </p>
                        )}
                      </div>
                    </section>
                  )}

                  {/* CONCLUSIÓN */}
                  <section className="mt-7 border-t border-[#EDF1F6] pt-6 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-[#26A66B]" />
                      <h2 className="font-black">
                        Conclusión
                      </h2>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-[#506C88] dark:text-slate-300">
                      {resumenSeleccionado.conclusion}
                    </p>
                  </section>

                  {/* ACCIONES MÓVILES / ESCRITORIO */}
                  <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <button
                      onClick={() => leerResumen(resumenSeleccionado)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE7F1] bg-white px-4 py-3 text-xs font-black text-[#4169A1] transition hover:-translate-y-0.5 hover:bg-[#F4F8FF] dark:border-slate-700 dark:bg-slate-800 dark:text-blue-200"
                    >
                      <Headphones size={16} />
                      Escuchar
                    </button>

                    <button
                      onClick={() => void copiarResumen(resumenSeleccionado)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE7F1] bg-white px-4 py-3 text-xs font-black text-[#4169A1] transition hover:-translate-y-0.5 hover:bg-[#F4F8FF] dark:border-slate-700 dark:bg-slate-800 dark:text-blue-200"
                    >
                      <Copy size={16} />
                      Copiar
                    </button>

                    <button
                      onClick={() =>
                        mostrarNotificacion(
                          "Tu resumen ya está guardado en Raccoon Study."
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE7F1] bg-white px-4 py-3 text-xs font-black text-[#4169A1] transition hover:-translate-y-0.5 hover:bg-[#F4F8FF] dark:border-slate-700 dark:bg-slate-800 dark:text-blue-200"
                    >
                      <Bookmark size={16} />
                      Guardar
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3 text-xs font-black text-red-500 transition hover:-translate-y-0.5 hover:bg-red-50 dark:border-red-900/30 dark:bg-slate-800"
                    >
                      <FileText size={16} />
                      Descargar PDF
                    </button>

                    <button
                      onClick={() => {
                        if (!esPremium) {
                          setMostrarPremium(true);
                          return;
                        }
                        mostrarNotificacion(
                          "Usa el nivel Básico para obtener una versión más simple."
                        );
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#DDD5FF] bg-[#FAF8FF] px-4 py-3 text-xs font-black text-[#7652D9] transition hover:-translate-y-0.5 dark:border-violet-900/30 dark:bg-violet-950/20 dark:text-violet-200"
                    >
                      <Sparkles size={16} />
                      Simplificar
                    </button>

                    <button
                      onClick={() => {
                        if (!esPremium) {
                          setMostrarPremium(true);
                          return;
                        }
                        mostrarNotificacion(
                          "Selecciona Completo + Profundo para generar una versión más detallada."
                        );
                      }}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-[#DDE7F1] bg-white px-4 py-3 text-xs font-black text-[#4169A1] transition hover:-translate-y-0.5 hover:bg-[#F4F8FF] dark:border-slate-700 dark:bg-slate-800 dark:text-blue-200 sm:col-auto"
                    >
                      <ListChecks size={16} />
                      Más detallado
                    </button>
                  </div>
                </article>


                  {/* MATERIAL ORIGINAL */}
                  <section className="rounded-[22px] border border-[#E3EAF3] bg-white p-4 shadow-[0_10px_25px_rgba(38,78,125,0.04)] dark:border-slate-700 dark:bg-[#182437]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 dark:border-red-900/30 dark:bg-red-950/20">
                          <FileText size={21} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#526A86] dark:text-slate-300">
                            Material original
                          </p>

                          <p className="mt-1 truncate text-sm font-black">
                            {resumenSeleccionado.nombre_archivo || "Material de estudio"}
                          </p>

                          <p className="mt-1 text-[10px] text-[#8796A8] dark:text-slate-400">
                            {resumenSeleccionado.tiempo_lectura}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF9F1] px-3 py-2 text-[10px] font-black text-[#26A66B] dark:bg-green-950/20 dark:text-green-300">
                          <CheckCircle2 size={14} />
                          Analizado
                        </span>

                        <button
                          type="button"
                          className="rounded-xl border border-[#DCE6F2] px-4 py-2.5 text-xs font-black text-[#1769E0] transition hover:bg-[#F4F8FF] dark:border-slate-700 dark:text-blue-300 dark:hover:bg-slate-800"
                          onClick={() =>
                            mostrarNotificacion(
                              "El material original está asociado a este resumen."
                            )
                          }
                        >
                          Ver material
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                {/* SIDEBAR */}
                <aside className="min-w-0 space-y-4 xl:sticky xl:top-[95px] xl:h-fit">
                  <section className="rounded-[24px] border border-[#E3EAF3] bg-white p-5 shadow-[0_12px_30px_rgba(38,78,125,0.05)] dark:border-slate-700 dark:bg-[#182437]">
                    <div className="flex items-center gap-2">
                      <Zap size={17} className="text-[#3978F6]" />
                      <h2 className="text-lg font-black">
                        Acciones rápidas
                      </h2>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => crearQuiz(resumenSeleccionado)}
                        className="group min-h-[132px] rounded-2xl border border-[#DDD5FF] bg-gradient-to-br from-[#FCFBFF] to-[#F6F2FF] p-4 text-left transition hover:-translate-y-1 hover:shadow-md dark:border-violet-900/30 dark:from-[#211D35] dark:to-[#171B2A]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0ECFF] text-[#7652D9] dark:bg-violet-950/30 dark:text-violet-200">
                          <ClipboardCheck size={19} />
                        </div>
                        <p className="mt-4 text-xs font-black">
                          Crear quiz
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-[#7A8CA2] dark:text-slate-400">
                          Pon a prueba lo aprendido
                        </p>
                      </button>

                      <button
                        onClick={() =>
                          mostrarNotificacion(
                            "Flashcards se generarán desde este resumen próximamente."
                          )
                        }
                        className="group min-h-[132px] rounded-2xl border border-[#CFE9DC] bg-gradient-to-br from-[#FBFFFD] to-[#F2FBF7] p-4 text-left transition hover:-translate-y-1 hover:shadow-md dark:border-green-900/30 dark:from-[#132A25] dark:to-[#15221F]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF9F1] text-[#26A66B] dark:bg-green-950/20 dark:text-green-300">
                          <Layers size={19} />
                        </div>
                        <p className="mt-4 text-xs font-black">
                          Generar flashcards
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-[#7A8CA2] dark:text-slate-400">
                          Tarjetas para repasar
                        </p>
                      </button>

                      <button
                        onClick={() =>
                          mostrarNotificacion(
                            "Mapa mental estará disponible próximamente."
                          )
                        }
                        className="group min-h-[132px] rounded-2xl border border-[#CDE4F7] bg-gradient-to-br from-[#FBFDFF] to-[#F3FAFF] p-4 text-left transition hover:-translate-y-1 hover:shadow-md dark:border-blue-900/30 dark:from-[#15283A] dark:to-[#142132]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF6FF] text-[#1687D9] dark:bg-blue-950/30 dark:text-blue-300">
                          <BrainCircuit size={19} />
                        </div>
                        <p className="mt-4 text-xs font-black">
                          Mapa mental
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-[#7A8CA2] dark:text-slate-400">
                          Visualiza los conceptos
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          if (!esPremium) {
                            setMostrarPremium(true);
                            return;
                          }
                          mostrarNotificacion(
                            "Explícamelo fácil estará disponible próximamente."
                          );
                        }}
                        className="group min-h-[132px] rounded-2xl border border-[#F1DDC9] bg-gradient-to-br from-[#FFFEFC] to-[#FFF8F1] p-4 text-left transition hover:-translate-y-1 hover:shadow-md dark:border-orange-900/30 dark:from-[#2B221B] dark:to-[#211B18]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF2E6] text-orange-500 dark:bg-orange-950/20 dark:text-orange-300">
                          <MessageCircle size={19} />
                        </div>
                        <p className="mt-4 text-xs font-black">
                          Explícamelo fácil
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-[#7A8CA2] dark:text-slate-400">
                          En lenguaje sencillo
                        </p>
                      </button>
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-[#E3EAF3] bg-white p-5 shadow-[0_12px_30px_rgba(38,78,125,0.05)] dark:border-slate-700 dark:bg-[#182437]">
                    <div className="flex items-center justify-between">
                      <h2 className="font-black">
                        Progreso de estudio
                      </h2>
                      <Sparkles size={17} className="text-[#7652D9]" />
                    </div>

                    <div className="mt-5 flex items-end justify-between">
                      <p className="text-sm font-bold text-[#506C88] dark:text-slate-300">
                        Resumen completado
                      </p>
                      <span className="text-2xl font-black text-[#1769E0]">
                        80%
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8EDF5] dark:bg-slate-700">
                      <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-[#4169F2] to-[#7652D9]" />
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        "Material subido y analizado",
                        "Resumen generado",
                        "Listo para estudiar",
                      ].map((paso, indice) => (
                        <div key={paso} className="flex items-center gap-3">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              indice < 2
                                ? "border-[#26A66B] bg-[#EAF9F1] text-[#26A66B] dark:bg-green-950/20"
                                : "border-[#7652D9] text-[#7652D9]"
                            }`}
                          >
                            {indice < 2 && (
                              <Check size={12} strokeWidth={3} />
                            )}
                          </span>
                          <p className="text-xs text-[#7188A2] dark:text-slate-300">
                            {paso}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="relative overflow-hidden rounded-[24px] border border-[#E3EAF3] bg-gradient-to-r from-[#F6FBFF] to-[#F6F0FF] p-5 dark:border-slate-700 dark:from-[#16304D] dark:to-[#28243E]">
                    <div className="relative z-10 max-w-[190px]">
                      <p className="font-black text-[#1769E0] dark:text-blue-200">
                        ¡Vas excelente! 🎉
                      </p>
                      <p className="mt-2 text-xs leading-5 text-[#7188A2] dark:text-slate-300">
                        Sigue estudiando y refuerza tu conocimiento con las herramientas interactivas.
                      </p>
                    </div>

                    <Image
                      src="/raccoon.png"
                      alt="Raccoon"
                      width={95}
                      height={95}
                      className="absolute bottom-0 right-1 h-[88px] w-[88px] object-contain"
                    />
                  </section>

                  {/* LECTOR ACTIVO */}
                  {leyendo && (
                    <section className="rounded-[24px] border border-[#DDD5FF] bg-gradient-to-br from-[#F5F1FF] to-[#EEF7FF] p-5 dark:border-violet-900/40 dark:from-[#2A2345] dark:to-[#16304D]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7652D9] text-white">
                          <Volume2 size={18} />
                        </div>

                        <div>
                          <p className="text-xs font-black">
                            Leyendo resumen
                          </p>
                          <p className="mt-1 text-[10px] text-[#7188A2] dark:text-slate-300">
                            Puedes pausar o detener.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          onClick={pausarLectura}
                          className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-black text-[#6548E8] shadow-sm dark:bg-slate-800 dark:text-violet-200"
                        >
                          {lecturaPausada ? (
                            <Play size={16} />
                          ) : (
                            <Pause size={16} />
                          )}

                          {lecturaPausada
                            ? "Continuar"
                            : "Pausar"}
                        </button>

                        <button
                          onClick={detenerLectura}
                          className="flex items-center justify-center gap-2 rounded-xl bg-[#7652D9] px-3 py-3 text-xs font-black text-white"
                        >
                          <Square size={15} />
                          Detener
                        </button>
                      </div>
                    </section>
                  )}

                </aside>
              </div>
            </section>
          ) : (
            <section className="mt-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">
                    Mis resúmenes
                  </h2>

                  <p className="text-sm text-[#6085A5]">
                    Resúmenes creados desde tus materiales.
                  </p>
                </div>

                <span className="rounded-full bg-[#EAF1FF] px-4 py-2 text-sm font-bold text-[#1769E0]">
                  {
                    resumenesFiltrados.length
                  }{" "}
                  resultados
                </span>
              </div>

              {cargandoResumenes ? (
                <div className="flex h-72 items-center justify-center rounded-[28px] bg-white dark:bg-[#182437]">
                  <LoaderCircle className="animate-spin" />
                </div>
              ) : resumenesFiltrados.length ===
                0 ? (
                <div className="flex h-72 flex-col items-center justify-center rounded-[28px] bg-white dark:bg-[#182437]">
                  <FileText
                    size={50}
                    className="text-[#7990B3]"
                  />

                  <h2 className="mt-5 text-xl font-black">
                    No tienes resúmenes
                  </h2>
                </div>
              ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                  {resumenesFiltrados.map(
                    (resumen) => (
                      <article
                        key={resumen.id}
                        className="rounded-[26px] bg-white p-6 shadow-sm dark:bg-[#182437]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-2xl bg-[#E9E2FF] p-4 text-[#7652D9]">
                            <FileText />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-[#7652D9]">
                              {resumen.materia}
                            </p>

                            <h3 className="font-black">
                              {resumen.titulo}
                            </h3>
                          </div>
                        </div>

                        <p className="mt-5 line-clamp-4 leading-7 text-[#6085A5]">
                          {
                            resumen.resumen_general
                          }
                        </p>

                        <div className="mt-5 flex items-center justify-between border-t pt-5 dark:border-slate-700">
                          <span className="flex items-center gap-2 text-sm">
                            <Clock3 size={16} />
                            {
                              resumen.tiempo_lectura
                            }
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                crearQuiz(
                                  resumen
                                )
                              }
                              className="rounded-xl bg-[#F3EDFF] px-4 py-3 font-bold text-[#7652D9]"
                            >
                              Quiz
                            </button>

                            <button
                              onClick={() =>
                                setResumenSeleccionado(
                                  resumen
                                )
                              }
                              className="flex items-center gap-2 rounded-xl bg-[#EAF1FF] px-4 py-3 font-bold text-[#1769E0]"
                            >
                              Ver
                              <ArrowRight size={17} />
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* PREMIUM */}

      {mostrarPremium && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="relative w-full max-w-md rounded-[28px] bg-white p-7 dark:bg-[#182437]">
            <button
              onClick={() =>
                setMostrarPremium(false)
              }
              className="absolute right-5 top-5"
            >
              <X />
            </button>

            <Crown
              size={45}
              className="text-[#7652D9]"
            />

            <h2 className="mt-5 text-2xl font-black">
              Función Premium
            </h2>

            <p className="mt-3 text-[#6085A5]">
              Desbloquea resúmenes completos, modo examen, mayor profundidad y herramientas avanzadas.
            </p>

            <Link
              href="/suscripcion"
              className="mt-6 block rounded-xl bg-[#7652D9] py-4 text-center font-black text-white"
            >
              Descubrir Premium
            </Link>
          </div>
        </div>
      )}

      <audio
        ref={audioGratisElementRef}
        onPlay={() =>
          setMusicaGratisActiva(true)
        }
        onPause={() =>
          setMusicaGratisActiva(false)
        }
        onEnded={() =>
          setMusicaGratisActiva(false)
        }
      />

      <audio
        ref={audioPremiumRef}
        onPlay={() =>
          setMusicaPremiumActiva(true)
        }
        onPause={() =>
          setMusicaPremiumActiva(false)
        }
        onEnded={() =>
          setMusicaPremiumActiva(false)
        }
      />
    </main>
  );
}