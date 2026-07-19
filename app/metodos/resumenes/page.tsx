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
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Crown,
  FilePlus2,
  FileText,
  Headphones,
  Home,
  Library,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  Lock,
  LogOut,
  MapPin,
  Menu,
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

  const audioGratisRef =
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
        audioGratisRef.current;

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

      audioGratisRef.current?.pause();

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
    if (!esPremium) {
      setMostrarPremium(true);
      return;
    }

    window.speechSynthesis.cancel();

    const voz =
      new SpeechSynthesisUtterance(
        obtenerTextoCompleto(resumen)
      );

    voz.lang = "es-ES";

    voz.onstart = () => {
      setLeyendo(true);
      setLecturaPausada(false);
    };

    voz.onend = () => {
      setLeyendo(false);
      setLecturaPausada(false);
    };

    window.speechSynthesis.speak(
      voz
    );
  };

  const detenerLectura = () => {
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
      audioGratisRef.current?.pause();
      audioPremiumRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (audioGratisRef.current) {
      audioGratisRef.current.volume =
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

          {/* HERO */}

          <section className="rounded-[28px] bg-gradient-to-br from-[#F1EEFF] to-[#EAF6FF] p-7 dark:from-[#28243E] dark:to-[#1C304D]">
            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#E9E2FF] px-4 py-2 text-sm font-bold text-[#7652D9]">
                  <Sparkles size={16} />
                  Aprendizaje inteligente
                </span>

                <h1 className="mt-4 text-4xl font-black">
                  Resúmenes con IA
                </h1>

                <p className="mt-4 max-w-xl leading-7 text-[#4169A1] dark:text-slate-300">
                  Convierte tus materiales en guías de estudio completas.
                </p>
              </div>

              <Image
                src="/raccoon.png"
                alt="Raccoon"
                width={220}
                height={220}
              />
            </div>
          </section>

          {/* SUBIDA / GENERACIÓN AUTOMÁTICA */}

          <section className="mt-6 rounded-[28px] bg-white p-6 shadow-sm dark:bg-[#182437]">
            <h2 className="text-2xl font-black">
              Crear nuevo resumen
            </h2>

            <label
              htmlFor="archivo-resumen"
              className={`
                mt-6 flex min-h-[240px] flex-col items-center justify-center
                rounded-[24px] border-2 border-dashed p-6 text-center
                ${
                  subiendo
                    ? "cursor-wait border-[#7652D9] bg-[#F4F0FF] dark:bg-[#28243E]"
                    : "cursor-pointer border-[#AFCBE3] bg-gradient-to-br from-[#F6FCFF] to-[#F5F1FF] dark:from-[#182A42] dark:to-[#28243E]"
                }
              `}
            >
              {subiendo ? (
                <>
                  <LoaderCircle
                    size={48}
                    className="animate-spin text-[#7652D9]"
                  />

                  <h3 className="mt-5 text-xl font-black">
                    Raccoon está trabajando
                  </h3>

                  <p className="mt-2 text-[#6085A5]">
                    {estadoGeneracion}
                  </p>

                  <div className="mt-5 h-3 w-full max-w-md rounded-full bg-white dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#55A8E8] to-[#7652D9]"
                      style={{
                        width: `${progresoGeneracion}%`,
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Upload
                    size={45}
                    className="text-[#55A8E8]"
                  />

                  <h3 className="mt-4 text-xl font-black">
                    Sube tu material
                  </h3>

                  <p className="mt-2 text-sm text-[#6085A5]">
                    PDF, DOCX, PPTX o TXT
                  </p>

                  <div className="mt-5 rounded-xl bg-gradient-to-r from-[#4169A1] to-[#7652D9] px-6 py-3 font-black text-white">
                    Seleccionar archivo
                  </div>
                </>
              )}
            </label>

            <input
              id="archivo-resumen"
              type="file"
              className="hidden"
              disabled={subiendo}
              accept=".pdf,.docx,.pptx,.txt"
              onChange={subirArchivo}
            />
          </section>

          {/* MÚSICA */}

          <section className="mt-7">
            <h2 className="text-2xl font-black">
              Música para estudiar
            </h2>

            <div className="mt-5 grid gap-6 xl:grid-cols-2">
              {/* JAMENDO */}

              <article className="rounded-[28px] bg-white p-6 shadow-sm dark:bg-[#182437]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black">
                      Jamendo Relax
                    </h3>

                    <p className="text-sm font-bold text-green-600">
                      Gratis
                    </p>
                  </div>

                  <Headphones className="text-[#55A8E8]" />
                </div>

                {cargandoMusicaGratis ? (
                  <div className="flex h-64 items-center justify-center">
                    <LoaderCircle className="animate-spin" />
                  </div>
                ) : (
                  <div className="mt-5 max-h-[320px] space-y-3 overflow-y-auto">
                    {tracksGratis.map(
                      (track) => {
                        const activo =
                          trackGratisActual?.id ===
                          track.id;

                        return (
                          <button
                            key={track.id}
                            onClick={() =>
                              void reproducirGratis(
                                track
                              )
                            }
                            className={`
                              flex w-full items-center gap-3 rounded-2xl border p-3 text-left
                              ${
                                activo
                                  ? "border-[#55A8E8] bg-[#EFF8FF] dark:bg-[#1D3558]"
                                  : "border-[#E7EDF5] dark:border-slate-700"
                              }
                            `}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                track.portada ||
                                "/raccoon.png"
                              }
                              alt={track.titulo}
                              className="h-11 w-11 rounded-xl object-cover"
                            />

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-black">
                                {track.titulo}
                              </p>

                              <p className="truncate text-xs text-[#6085A5]">
                                {track.artista}
                              </p>
                            </div>

                            {activo &&
                            musicaGratisActiva ? (
                              <Pause size={17} />
                            ) : (
                              <Play size={17} />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <Volume2 size={18} />

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volumenGratis}
                    onChange={(evento) =>
                      setVolumenGratis(
                        Number(
                          evento.target.value
                        )
                      )
                    }
                    className="w-full"
                  />
                </div>
              </article>

              {/* DEEZER */}

              <article className="rounded-[28px] bg-gradient-to-br from-[#F1EDFF] to-[#EAF6FF] p-6 dark:from-[#28243E] dark:to-[#1C304D]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black">
                      Deezer Playlist
                    </h3>

                    <p className="text-sm font-bold text-[#7652D9]">
                      Premium
                    </p>
                  </div>

                  {!esPremium ? (
                    <Lock />
                  ) : (
                    <Music2 />
                  )}
                </div>

                {!esPremium ? (
                  <button
                    onClick={() =>
                      setMostrarPremium(true)
                    }
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] py-4 font-black text-white"
                  >
                    Desbloquear playlist
                  </button>
                ) : tracksPremium.length ===
                  0 ? (
                  <button
                    onClick={cargarDeezer}
                    disabled={
                      cargandoPlaylist
                    }
                    className="mt-6 w-full rounded-xl bg-[#7652D9] py-4 font-black text-white"
                  >
                    {cargandoPlaylist
                      ? "Cargando..."
                      : "Cargar playlist"}
                  </button>
                ) : (
                  <div className="mt-5 max-h-[320px] space-y-3 overflow-y-auto">
                    {playlistPremium && (
                      <p className="font-black">
                        {
                          playlistPremium.titulo
                        }
                      </p>
                    )}

                    {tracksPremium.map(
                      (track) => (
                        <button
                          key={track.id}
                          onClick={() =>
                            void reproducirPremium(
                              track
                            )
                          }
                          className="flex w-full items-center gap-3 rounded-2xl bg-white/70 p-3 text-left dark:bg-slate-800"
                        >
                          <Music2 />

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-black">
                              {track.titulo}
                            </p>

                            <p className="truncate text-xs">
                              {track.artista}
                            </p>
                          </div>

                          {trackPremiumActual?.id ===
                            track.id &&
                          musicaPremiumActiva ? (
                            <Pause size={17} />
                          ) : (
                            <Play size={17} />
                          )}
                        </button>
                      )
                    )}

                    <div className="flex items-center gap-3">
                      <Volume2 size={18} />

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                          volumenPremium
                        }
                        onChange={(evento) =>
                          setVolumenPremium(
                            Number(
                              evento.target
                                .value
                            )
                          )
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </article>
            </div>
          </section>

          {/* DETALLE O LISTA */}

          {resumenSeleccionado ? (
            <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
              <div>
                <button
                  onClick={() => {
                    setResumenSeleccionado(
                      null
                    );

                    detenerLectura();
                  }}
                  className="mb-5 flex items-center gap-2 font-bold text-[#4169A1]"
                >
                  <ArrowLeft />
                  Volver
                </button>

                <article className="rounded-[28px] bg-white p-7 dark:bg-[#182437]">
                  <span className="rounded-full bg-[#E9E2FF] px-4 py-2 text-sm font-bold text-[#7652D9]">
                    {
                      resumenSeleccionado.materia
                    }
                  </span>

                  <h1 className="mt-5 text-3xl font-black">
                    {
                      resumenSeleccionado.titulo
                    }
                  </h1>

                  <section className="mt-8">
                    <div className="flex items-center gap-3">
                      <BookOpen className="text-[#1687D9]" />

                      <h2 className="text-2xl font-black">
                        Resumen general
                      </h2>
                    </div>

                    <p className="mt-4 whitespace-pre-line leading-8 text-[#506C88] dark:text-slate-300">
                      {
                        resumenSeleccionado.resumen_general
                      }
                    </p>
                  </section>

                  <section className="mt-10">
                    <div className="flex items-center gap-3">
                      <FileText className="text-[#7652D9]" />

                      <h2 className="text-2xl font-black">
                        Desarrollo
                      </h2>
                    </div>

                    <div className="mt-5 space-y-4">
                      {resumenSeleccionado.secciones_desarrollo.map(
                        (
                          seccion,
                          indice
                        ) => (
                          <div
                            key={indice}
                            className="rounded-2xl border p-5 dark:border-slate-700"
                          >
                            <h3 className="font-black text-[#4169A1]">
                              {
                                seccion.titulo
                              }
                            </h3>

                            <p className="mt-3 leading-7 text-[#506C88] dark:text-slate-300">
                              {
                                seccion.contenido
                              }
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  <section className="mt-10">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="text-yellow-500" />

                      <h2 className="text-2xl font-black">
                        Ideas principales
                      </h2>
                    </div>

                    <div className="mt-5 space-y-3">
                      {resumenSeleccionado.ideas_principales.map(
                        (idea, indice) => (
                          <div
                            key={indice}
                            className="rounded-2xl bg-[#F8FBFD] p-4 dark:bg-slate-800"
                          >
                            {indice + 1}.{" "}
                            {idea}
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  <section className="mt-10">
                    <div className="flex items-center gap-3">
                      <BrainCircuit className="text-[#7652D9]" />

                      <h2 className="text-2xl font-black">
                        Conceptos clave
                      </h2>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {resumenSeleccionado.conceptos_clave.map(
                        (
                          concepto,
                          indice
                        ) => (
                          <div
                            key={indice}
                            className="rounded-2xl border p-5 dark:border-slate-700"
                          >
                            <h3 className="font-black text-[#7652D9]">
                              {
                                concepto.concepto
                              }
                            </h3>

                            <p className="mt-2 text-sm leading-6">
                              {
                                concepto.definicion
                              }
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  <section className="mt-10">
                    <div className="flex items-center gap-3">
                      <ListChecks className="text-green-600" />

                      <h2 className="text-2xl font-black">
                        Datos importantes
                      </h2>
                    </div>

                    <div className="mt-5 space-y-3">
                      {resumenSeleccionado.datos_importantes.map(
                        (dato, indice) => (
                          <div
                            key={indice}
                            className="flex gap-3 rounded-2xl bg-[#F2FBF6] p-4 dark:bg-slate-800"
                          >
                            <CheckCircle2 className="text-green-600" />
                            {dato}
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  <section className="mt-10 rounded-2xl bg-gradient-to-r from-[#F0ECFF] to-[#EEF8FF] p-6 dark:from-[#28243E] dark:to-[#1C304D]">
                    <h2 className="text-xl font-black">
                      Conclusión
                    </h2>

                    <p className="mt-3 leading-7">
                      {
                        resumenSeleccionado.conclusion
                      }
                    </p>
                  </section>
                </article>
              </div>

              <aside className="h-fit rounded-[25px] bg-white p-6 dark:bg-[#182437] xl:sticky xl:top-[95px]">
                <h2 className="text-xl font-black">
                  Estudiar resumen
                </h2>

                <button
                  onClick={() =>
                    crearQuiz(
                      resumenSeleccionado
                    )
                  }
                  className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#4169A1] to-[#7652D9] py-4 font-black text-white"
                >
                  Crear quiz
                </button>

                {!esPremium ? (
                  <button
                    onClick={() =>
                      setMostrarPremium(true)
                    }
                    className="mt-3 flex w-full items-center justify-between rounded-xl border p-4 dark:border-slate-700"
                  >
                    <span>
                      Lector en voz alta
                    </span>

                    <Lock size={18} />
                  </button>
                ) : !leyendo ? (
                  <button
                    onClick={() =>
                      leerResumen(
                        resumenSeleccionado
                      )
                    }
                    className="mt-3 w-full rounded-xl bg-[#F3EDFF] py-4 font-bold text-[#7652D9]"
                  >
                    Escuchar resumen
                  </button>
                ) : (
                  <div className="mt-3 rounded-xl bg-[#F3EDFF] p-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={pausarLectura}
                        className="rounded-full bg-[#7652D9] p-3 text-white"
                      >
                        {lecturaPausada ? (
                          <Play />
                        ) : (
                          <Pause />
                        )}
                      </button>

                      <button
                        onClick={
                          detenerLectura
                        }
                        className="rounded-full bg-white p-3 text-[#7652D9]"
                      >
                        <Square />
                      </button>
                    </div>
                  </div>
                )}
              </aside>
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
              Desbloquea Deezer y el lector en voz alta.
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
        ref={audioGratisRef}
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