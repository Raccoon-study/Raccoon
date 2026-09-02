"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Crown,
  FileText,
  Gamepad2,
  Home,
  Library,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Plus,
  Search,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Upload,
  User,
  X,
  Zap,
} from "lucide-react";

import { supabase } from "@/app/lib/supabase";

type PlanType = "free" | "month" | "year";

type Material = {
  id: string;
  usuario_id: string;
  nombre_archivo: string;
  url_archivo: string;
  progreso: number;
  fecha_subida: string;
};

type TipoJuego =
  | "memoria"
  | "crucigrama"
  | "ahorcado"
  | "relaciona"
  | "verdadero_falso";

type JuegoItem = {
  tipo: TipoJuego;
  titulo: string;
  descripcion: string;
  icono: string;
  fondo: string;
  fondoOscuro: string;
  borde: string;
};

const juegos: JuegoItem[] = [
  {
    tipo: "memoria",
    titulo: "Memoria",
    descripcion: "Encuentra conceptos y definiciones que pertenecen juntos.",
    icono: "🧠",
    fondo: "bg-[#ECF8FF]",
    fondoOscuro: "dark:bg-[#18324A]",
    borde: "border-[#C9EAFB]",
  },
  {
    tipo: "crucigrama",
    titulo: "Crucigrama",
    descripcion: "Completa pistas usando las palabras importantes del tema.",
    icono: "✏️",
    fondo: "bg-[#F2EEFF]",
    fondoOscuro: "dark:bg-[#2C2949]",
    borde: "border-[#DDD3FF]",
  },
  {
    tipo: "ahorcado",
    titulo: "Ahorcado",
    descripcion: "Descubre palabras clave antes de agotar tus intentos.",
    icono: "🪢",
    fondo: "bg-[#FFF6E9]",
    fondoOscuro: "dark:bg-[#3B2E20]",
    borde: "border-[#FFE2B9]",
  },
  {
    tipo: "relaciona",
    titulo: "Relaciona",
    descripcion: "Une cada término con su explicación correcta.",
    icono: "🎯",
    fondo: "bg-[#EAFBF5]",
    fondoOscuro: "dark:bg-[#193B35]",
    borde: "border-[#C9F0E2]",
  },
  {
    tipo: "verdadero_falso",
    titulo: "Verdadero o falso",
    descripcion: "Comprueba cuánto recuerdas de tu material.",
    icono: "✅",
    fondo: "bg-[#FFF0F4]",
    fondoOscuro: "dark:bg-[#3D2630]",
    borde: "border-[#FFD5E1]",
  },
];

function normalizarPlan(valor: unknown): PlanType {
  const plan = String(valor ?? "").toLowerCase().trim();

  if (
    plan === "year" ||
    plan === "annual" ||
    plan === "anual" ||
    plan === "premium_year" ||
    plan === "premium_anual"
  ) {
    return "year";
  }

  if (
    plan === "month" ||
    plan === "monthly" ||
    plan === "mensual" ||
    plan === "premium" ||
    plan === "premium_month" ||
    plan === "premium_mensual"
  ) {
    return "month";
  }

  return "free";
}

function detectarPremium(
  datos: Record<string, unknown>
): {
  premium: boolean;
  plan: PlanType;
} {
  const plan = normalizarPlan(
    datos.plan ??
      datos.tipo_plan ??
      datos.subscription ??
      datos.subscription_plan
  );

  const premium =
    datos.premium === true ||
    datos.is_premium === true ||
    datos.es_premium === true ||
    plan === "month" ||
    plan === "year";

  return {
    premium,
    plan: premium && plan === "free" ? "month" : plan,
  };
}

export default function JuegosPage() {
  const router = useRouter();
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);

  const [nombreUsuario, setNombreUsuario] = useState("Usuario");
  const [fotoPerfil, setFotoPerfil] = useState("/raccoon.png");

  const [cargandoPagina, setCargandoPagina] = useState(true);
  const [premium, setPremium] = useState(false);
  const [plan, setPlan] = useState<PlanType>("free");

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [materialSeleccionado, setMaterialSeleccionado] =
    useState<string>("");
  const [busqueda, setBusqueda] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  const [tipoJuego, setTipoJuego] =
    useState<TipoJuego>("memoria");
  const [dificultad, setDificultad] = useState<
    "facil" | "medio" | "dificil"
  >("medio");

  const [generando, setGenerando] = useState(false);
  const [notificacion, setNotificacion] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const temaGuardado = localStorage.getItem("raccoon-theme");

    if (temaGuardado === "dark") {
      setModoOscuro(true);
      document.documentElement.classList.add("dark");
    }

    void iniciar();
  }, []);

  async function iniciar() {
    try {
      setCargandoPagina(true);

      const { data: sessionData } =
        await supabase.auth.getSession();

      const session = sessionData.session;

      if (!session) {
        router.replace("/Login");
        return;
      }

      const user = session.user;

      setNombreUsuario(
        user.user_metadata?.nombre ||
          user.email?.split("@")[0] ||
          "Usuario"
      );

      setFotoPerfil(
        user.user_metadata?.avatar_url || "/raccoon.png"
      );

      const respuestaPlan = await fetch(
        "/api/suscripciones",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const datosPlan =
        (await respuestaPlan.json()) as Record<
          string,
          unknown
        >;

      if (!respuestaPlan.ok) {
        throw new Error(
          String(
            datosPlan.error ||
              "No se pudo comprobar tu suscripción."
          )
        );
      }

      const estado = detectarPremium(datosPlan);

      setPremium(estado.premium);
      setPlan(estado.plan);

      if (estado.premium) {
        await obtenerMateriales(user.id);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar Juegos."
      );
    } finally {
      setCargandoPagina(false);
    }
  }

  async function obtenerMateriales(userId: string) {
    const { data, error } = await supabase
      .from("materiales")
      .select(
        "id, usuario_id, nombre_archivo, url_archivo, progreso, fecha_subida"
      )
      .eq("usuario_id", userId)
      .order("fecha_subida", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    const lista = (data || []) as Material[];

    setMateriales(lista);

    const recordado = localStorage.getItem(
      "raccoon-material-seleccionado"
    );

    if (recordado) {
      try {
        const guardado = JSON.parse(recordado) as {
          id?: string;
          material_id?: string;
        };

        const id =
          guardado.material_id || guardado.id || "";

        if (
          id &&
          lista.some((material) => material.id === id)
        ) {
          setMaterialSeleccionado(id);
          return;
        }
      } catch {
        // Si el valor guardado no es válido, usamos el último material.
      }
    }

    if (lista[0]) {
      setMaterialSeleccionado(lista[0].id);
    }
  }

  function mostrarNotificacion(mensaje: string) {
    setNotificacion(mensaje);

    setTimeout(() => {
      setNotificacion("");
    }, 3000);
  }

  function cambiarTema() {
    const nuevoModo = !modoOscuro;

    setModoOscuro(nuevoModo);

    if (nuevoModo) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("raccoon-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("raccoon-theme", "light");
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/Login");
  }

  function guardarMaterialSeleccionado(
    material: Material
  ) {
    setMaterialSeleccionado(material.id);

    localStorage.setItem(
      "raccoon-material-seleccionado",
      JSON.stringify({
        id: material.id,
        material_id: material.id,
        titulo: material.nombre_archivo,
        nombre_archivo: material.nombre_archivo,
        url_archivo: material.url_archivo,
        progreso: material.progreso,
        fecha_subida: material.fecha_subida,
        origen: "juegos",
      })
    );
  }

  async function subirArchivo(
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const archivo = evento.target.files?.[0];

    if (!archivo) {
      return;
    }

    if (!premium) {
      evento.target.value = "";
      router.push("/suscripcion");
      return;
    }

    if (archivo.size > 25 * 1024 * 1024) {
      setError("El archivo no puede superar los 25 MB.");
      evento.target.value = "";
      return;
    }

    let rutaStorage = "";

    try {
      setSubiendo(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/Login");
        return;
      }

      const nombreSeguro = archivo.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_");

      const id =
        typeof crypto !== "undefined" &&
        "randomUUID" in crypto
          ? crypto.randomUUID()
          : Date.now().toString();

      rutaStorage = `${user.id}/${id}-${nombreSeguro}`;

      const { error: storageError } =
        await supabase.storage
          .from("materiales")
          .upload(rutaStorage, archivo, {
            upsert: false,
            cacheControl: "3600",
            contentType:
              archivo.type ||
              "application/octet-stream",
          });

      if (storageError) {
        throw storageError;
      }

      const { data: urlData } = supabase.storage
        .from("materiales")
        .getPublicUrl(rutaStorage);

      const {
        data: materialInsertado,
        error: dbError,
      } = await supabase
        .from("materiales")
        .insert({
          usuario_id: user.id,
          nombre_archivo: archivo.name,
          url_archivo: urlData.publicUrl,
          progreso: 0,
        })
        .select(
          "id, usuario_id, nombre_archivo, url_archivo, progreso, fecha_subida"
        )
        .single();

      if (dbError) {
        await supabase.storage
          .from("materiales")
          .remove([rutaStorage]);

        throw dbError;
      }

      const nuevo =
        materialInsertado as Material;

      setMateriales((anteriores) => [
        nuevo,
        ...anteriores,
      ]);

      guardarMaterialSeleccionado(nuevo);

      mostrarNotificacion(
        "Material subido y seleccionado."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo subir el archivo."
      );
    } finally {
      setSubiendo(false);
      evento.target.value = "";
    }
  }

  const materialesFiltrados = useMemo(() => {
    const termino = busqueda
      .trim()
      .toLowerCase();

    if (!termino) {
      return materiales;
    }

    return materiales.filter((material) =>
      material.nombre_archivo
        .toLowerCase()
        .includes(termino)
    );
  }, [materiales, busqueda]);

  const juegoActual =
    juegos.find(
      (juego) => juego.tipo === tipoJuego
    ) || juegos[0];

  async function generarJuego() {
    if (!premium) {
      router.push("/suscripcion");
      return;
    }

    if (!materialSeleccionado) {
      setError(
        "Selecciona o sube un material primero."
      );
      return;
    }

    try {
      setGenerando(true);
      setError("");

      const { data: sessionData } =
        await supabase.auth.getSession();

      const accessToken =
        sessionData.session?.access_token;

      if (!accessToken) {
        router.replace("/Login");
        return;
      }

      const respuesta = await fetch(
        "/api/juegos/generar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            materialId: materialSeleccionado,
            tipo: tipoJuego,
            dificultad,
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado?.error ||
            "No se pudo crear el juego."
        );
      }

      sessionStorage.setItem(
        "raccoon_juego_actual",
        JSON.stringify(resultado.juego)
      );

      router.push("/juegos/jugar");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear el juego."
      );
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FBFE] text-[#20334B] transition-colors dark:bg-[#0F1724] dark:text-slate-100">
      <input
        ref={inputArchivoRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(evento) =>
          void subirArchivo(evento)
        }
      />

      {notificacion && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-2xl bg-[#55A8E8] px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {notificacion}
        </div>
      )}

      {/* MOBILE MENU */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setMenuAbierto(false)}
          />

          <aside className="relative flex h-full w-[270px] flex-col bg-white shadow-2xl dark:bg-[#151F30]">
            <div className="flex h-[78px] items-center justify-between border-b border-[#E7F0F8] px-5 dark:border-slate-700">
              <Link
                href="/Dashboard"
                className="flex items-center gap-3"
              >
                <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-[#E7F6FF]">
                  <Image
                    src="/raccoon.png"
                    alt="Raccoon Study"
                    fill
                    className="object-contain p-1"
                  />
                </div>

                <span className="text-lg font-black">
                  Raccoon{" "}
                  <span className="text-[#55A8E8]">
                    Study
                  </span>
                </span>
              </Link>

              <button
                onClick={() => setMenuAbierto(false)}
              >
                <X size={22} />
              </button>
            </div>

            <Navigation
              mobile
              onNavigate={() =>
                setMenuAbierto(false)
              }
            />

            <div className="mt-auto p-4">
              <PremiumSidebarCard
                premium={premium}
                plan={plan}
              />
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] flex-col border-r border-[#DDEAF7] bg-white dark:border-slate-700 dark:bg-[#151F30] lg:flex">
        <Link
          href="/Dashboard"
          className="flex h-[78px] items-center gap-3 border-b border-[#E7F0F8] px-5 dark:border-slate-700"
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-[#E7F6FF]">
            <Image
              src="/raccoon.png"
              alt="Raccoon Study"
              fill
              className="object-contain p-1"
              priority
            />
          </div>

          <div>
            <p className="text-[19px] font-black leading-none">
              Raccoon{" "}
              <span className="text-[#55A8E8]">
                Study
              </span>
            </p>

            <p className="mt-1 text-[10px] font-semibold text-[#8AA4BE]">
              Tu compañero de estudio
            </p>
          </div>
        </Link>

        <Navigation />

        <div className="space-y-2 px-3 pb-5">
          <button
            onClick={() => void cerrarSesion()}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>

          <PremiumSidebarCard
            premium={premium}
            plan={plan}
          />
        </div>
      </aside>

      <div className="lg:ml-[250px]">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-[#DDEAF7] bg-white/90 px-4 backdrop-blur-xl dark:border-slate-700 dark:bg-[#151F30]/90 sm:px-6 lg:px-9">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuAbierto(true)}
              className="lg:hidden"
            >
              <Menu
                size={24}
                className="text-[#55A8E8]"
              />
            </button>

            <div>
              <h1 className="text-[20px] font-black">
                Juegos
              </h1>
              <p className="hidden text-[11px] font-semibold text-[#8AA4BE] sm:block">
                Aprende jugando con tu material
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-3 rounded-full bg-[#F1F8FD] px-4 py-2.5 md:flex dark:bg-slate-800">
              <Search
                size={18}
                className="text-[#8AA4BE]"
              />

              <input
                value={busqueda}
                onChange={(evento) =>
                  setBusqueda(evento.target.value)
                }
                placeholder="Buscar material..."
                className="w-36 bg-transparent text-sm outline-none placeholder:text-[#8AA4BE] lg:w-44"
              />
            </div>

            <button
              onClick={() =>
                mostrarNotificacion(
                  "No tienes notificaciones nuevas"
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#55A8E8] transition hover:bg-[#EFF8FF] dark:hover:bg-slate-800"
            >
              <Bell size={21} />
            </button>

            <div className="relative">
              <button
                onClick={() =>
                  setPerfilAbierto(!perfilAbierto)
                }
                className="flex items-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#DDF3FF]">
                  <Image
                    src={fotoPerfil}
                    alt="Perfil"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
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
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-9">
          {cargandoPagina ? (
            <LoadingState />
          ) : !premium ? (
            <PremiumLocked />
          ) : (
            <>
              {/* HERO */}
              <section className="relative overflow-hidden rounded-[28px] border border-[#D8EAF7] bg-gradient-to-br from-[#EAF8FF] via-[#F7FBFF] to-[#F0EDFF] px-6 py-7 shadow-sm dark:border-slate-700 dark:from-[#172536] dark:via-[#182334] dark:to-[#25233D] sm:px-8 lg:px-10">
                <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#7BCBF3]/15" />
                <div className="absolute -bottom-20 left-[45%] h-52 w-52 rounded-full bg-[#8D78E8]/10" />

                <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_300px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F6FF] px-3 py-1.5 text-[11px] font-black text-[#1687D9] dark:bg-[#203950] dark:text-[#78C8F1]">
                        <Gamepad2 size={14} />
                        RACCOON GAMES
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF2C8] px-3 py-1.5 text-[11px] font-black text-[#B57A00] dark:bg-amber-950/40 dark:text-amber-300">
                        <Crown size={13} />
                        PREMIUM ACTIVO
                      </span>
                    </div>

                    <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-[#24364E] dark:text-white sm:text-[38px]">
                      Aprende el tema.
                      <span className="block text-[#55A8E8]">
                        Después juégalo con Raccoon.
                      </span>
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#68829C] dark:text-slate-300 sm:text-base">
                      Convierte los materiales que ya subiste
                      en el Dashboard en actividades rápidas
                      para practicar, recordar y divertirte.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          document
                            .getElementById("crear-juego")
                            ?.scrollIntoView({
                              behavior: "smooth",
                            })
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#55A8E8] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#55A8E8]/20 transition hover:-translate-y-0.5 hover:bg-[#459CD9]"
                      >
                        <Sparkles size={18} />
                        Crear juego
                      </button>

                      <button
                        disabled={subiendo}
                        onClick={() =>
                          inputArchivoRef.current?.click()
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-[#CFE3F3] bg-white px-5 py-3 text-sm font-bold text-[#31506F] transition hover:bg-[#F4FAFE] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                      >
                        {subiendo ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <Upload size={18} />
                        )}

                        {subiendo
                          ? "Subiendo..."
                          : "Subir material"}
                      </button>
                    </div>
                  </div>

                  <div className="relative mx-auto h-[240px] w-full max-w-[285px]">
                    <div className="absolute bottom-5 left-1/2 h-14 w-[220px] -translate-x-1/2 rounded-full bg-[#55A8E8]/15 blur-xl" />

                    <Image
                      src="/raccoon.png"
                      alt="Mascota Raccoon Study"
                      fill
                      className="object-contain drop-shadow-xl"
                      priority
                    />

                    <div className="absolute right-0 top-3 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg backdrop-blur dark:border-slate-600 dark:bg-slate-800/90">
                      <p className="text-[10px] font-black text-[#55A8E8]">
                        RETO DE HOY
                      </p>
                      <p className="text-xs font-bold">
                        ¡Vamos a jugar! ✨
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* MINI STATS */}
              <section className="mt-5 grid gap-4 sm:grid-cols-3">
                <MiniStat
                  icon={<Star size={21} />}
                  titulo="+25"
                  texto="estrellas por reto"
                  color="bg-[#FFF7E8] text-[#F1A631] dark:bg-[#3A3020]"
                />

                <MiniStat
                  icon={<Trophy size={21} />}
                  titulo="5"
                  texto="formas de practicar"
                  color="bg-[#EBFAF5] text-[#35B291] dark:bg-[#18362F]"
                />

                <MiniStat
                  icon={<Zap size={21} />}
                  titulo="IA"
                  texto="usando tu material"
                  color="bg-[#ECF8FF] text-[#55A8E8] dark:bg-[#193247]"
                />
              </section>

              {/* GAME CARDS */}
              <section className="mt-9">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-[#55A8E8]">
                      Elige tu juego
                    </p>
                    <h3 className="mt-1 text-2xl font-black">
                      Practica de una forma diferente
                    </h3>
                  </div>

                  <p className="max-w-md text-sm font-medium text-[#7890A8] dark:text-slate-400">
                    Cada juego se genera con el contenido
                    del material que elijas.
                  </p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {juegos.map((juego) => {
                    const seleccionado =
                      juego.tipo === tipoJuego;

                    return (
                      <button
                        key={juego.tipo}
                        onClick={() => {
                          setTipoJuego(juego.tipo);

                          document
                            .getElementById("crear-juego")
                            ?.scrollIntoView({
                              behavior: "smooth",
                            });
                        }}
                        className={`group relative overflow-hidden rounded-[24px] border p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
                          seleccionado
                            ? "border-[#8FD3F3] bg-white shadow-md shadow-[#55A8E8]/10 dark:border-[#55A8E8] dark:bg-[#18283B]"
                            : "border-[#E0ECF5] bg-white dark:border-slate-700 dark:bg-[#151F30]"
                        }`}
                      >
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${juego.fondo} ${juego.fondoOscuro} ${juego.borde} text-2xl dark:border-slate-600`}
                        >
                          {juego.icono}
                        </div>

                        <h4 className="mt-4 text-[17px] font-black">
                          {juego.titulo}
                        </h4>

                        <p className="mt-2 min-h-[66px] text-[13px] font-medium leading-5 text-[#7890A8] dark:text-slate-400">
                          {juego.descripcion}
                        </p>

                        <div className="mt-4 flex items-center gap-1 text-xs font-black text-[#55A8E8]">
                          Elegir
                          <ArrowRight
                            size={14}
                            className="transition group-hover:translate-x-1"
                          />
                        </div>

                        {seleccionado && (
                          <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#55A8E8] text-white">
                            <CheckCircle2 size={15} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* GENERATOR */}
              <section
                id="crear-juego"
                className="mt-9 scroll-mt-28 pb-10"
              >
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
                  <div className="rounded-[26px] border border-[#DFEBF5] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#151F30] sm:p-6">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#E7F0F8] pb-5 dark:border-slate-700 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#7A71E8]">
                          Crea tu partida
                        </p>

                        <h3 className="mt-1 text-2xl font-black">
                          ¿Con qué quieres practicar?
                        </h3>

                        <p className="mt-1 text-sm text-[#7890A8] dark:text-slate-400">
                          Tus materiales del Dashboard aparecen aquí.
                        </p>
                      </div>

                      <button
                        disabled={subiendo}
                        onClick={() =>
                          inputArchivoRef.current?.click()
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EFF8FE] px-4 py-3 text-sm font-black text-[#1687D9] transition hover:bg-[#E2F3FC] dark:bg-[#203349] dark:text-[#78C8F1]"
                      >
                        {subiendo ? (
                          <Loader2
                            className="animate-spin"
                            size={17}
                          />
                        ) : (
                          <Plus size={17} />
                        )}
                        Nuevo material
                      </button>
                    </div>

                    {error && (
                      <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                        {error}
                      </div>
                    )}

                    <div className="mt-6">
                      <StepTitle
                        numero="1"
                        titulo="Selecciona un material"
                        subtitulo="Puedes usar uno existente o subir uno nuevo."
                      />

                      <div className="relative mt-3 md:hidden">
                        <Search
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8AA4BE]"
                        />

                        <input
                          value={busqueda}
                          onChange={(evento) =>
                            setBusqueda(
                              evento.target.value
                            )
                          }
                          placeholder="Buscar material..."
                          className="w-full rounded-xl border border-[#DFEBF5] bg-[#F7FBFE] py-3 pl-11 pr-4 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>

                      <div className="mt-3 max-h-[290px] space-y-2 overflow-y-auto pr-1">
                        {materialesFiltrados.length ===
                        0 ? (
                          <button
                            onClick={() =>
                              inputArchivoRef.current?.click()
                            }
                            className="w-full rounded-2xl border-2 border-dashed border-[#D5E7F4] bg-[#FBFDFF] p-7 text-center transition hover:border-[#8CCFEB] hover:bg-[#F4FAFE] dark:border-slate-700 dark:bg-slate-800/30"
                          >
                            <Upload
                              size={28}
                              className="mx-auto text-[#55A8E8]"
                            />

                            <p className="mt-3 text-sm font-black">
                              Sube tu primer material
                            </p>

                            <p className="mt-1 text-xs text-[#7890A8]">
                              PDF, Word, PowerPoint,
                              imágenes o texto.
                            </p>
                          </button>
                        ) : (
                          materialesFiltrados.map(
                            (material) => {
                              const activo =
                                material.id ===
                                materialSeleccionado;

                              return (
                                <button
                                  key={material.id}
                                  onClick={() =>
                                    guardarMaterialSeleccionado(
                                      material
                                    )
                                  }
                                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                                    activo
                                      ? "border-[#8ACFF0] bg-[#F0F9FE] dark:border-[#55A8E8] dark:bg-[#193149]"
                                      : "border-[#E3EDF5] bg-white hover:bg-[#F8FBFD] dark:border-slate-700 dark:bg-[#101A29] dark:hover:bg-slate-800"
                                  }`}
                                >
                                  <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                      activo
                                        ? "bg-white text-[#55A8E8] shadow-sm dark:bg-[#213A51]"
                                        : "bg-[#F3F8FC] text-[#7D98AF] dark:bg-slate-800"
                                    }`}
                                  >
                                    <FileText size={19} />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold">
                                      {
                                        material.nombre_archivo
                                      }
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-[#8AA4BE]">
                                      {material.fecha_subida
                                        ? new Date(
                                            material.fecha_subida
                                          ).toLocaleDateString(
                                            "es-PA",
                                            {
                                              day: "numeric",
                                              month: "short",
                                              year: "numeric",
                                            }
                                          )
                                        : "Material guardado"}
                                    </p>
                                  </div>

                                  <div
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                      activo
                                        ? "border-[#55A8E8] bg-[#55A8E8]"
                                        : "border-[#CBDDEB] dark:border-slate-600"
                                    }`}
                                  >
                                    {activo && (
                                      <CheckCircle2
                                        size={14}
                                        className="text-white"
                                      />
                                    )}
                                  </div>
                                </button>
                              );
                            }
                          )
                        )}
                      </div>
                    </div>

                    <div className="mt-7">
                      <StepTitle
                        numero="2"
                        titulo="Escoge el juego"
                        subtitulo="Raccoon adaptará el contenido al formato."
                      />

                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {juegos.map((juego) => (
                          <button
                            key={juego.tipo}
                            onClick={() =>
                              setTipoJuego(juego.tipo)
                            }
                            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                              tipoJuego === juego.tipo
                                ? "border-[#9DD9F4] bg-[#F0F9FE] text-[#1687D9] dark:border-[#55A8E8] dark:bg-[#193149] dark:text-[#78C8F1]"
                                : "border-[#E2ECF4] bg-white text-[#516A83] hover:bg-[#F8FBFD] dark:border-slate-700 dark:bg-[#101A29] dark:text-slate-300"
                            }`}
                          >
                            <span className="text-lg">
                              {juego.icono}
                            </span>
                            {juego.titulo}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-7">
                      <StepTitle
                        numero="3"
                        titulo="Elige la dificultad"
                        subtitulo="Ajusta el reto a tu nivel."
                      />

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {(
                          [
                            "facil",
                            "medio",
                            "dificil",
                          ] as const
                        ).map((nivel) => (
                          <button
                            key={nivel}
                            onClick={() =>
                              setDificultad(nivel)
                            }
                            className={`rounded-xl border py-3 text-sm font-black transition ${
                              dificultad === nivel
                                ? "border-[#8AD9C5] bg-[#EEFBF7] text-[#22997B] dark:border-[#41B89A] dark:bg-[#18382F] dark:text-[#73D7BF]"
                                : "border-[#E2ECF4] bg-white text-[#7890A8] dark:border-slate-700 dark:bg-[#101A29]"
                            }`}
                          >
                            {nivel === "facil"
                              ? "Fácil"
                              : nivel === "medio"
                              ? "Medio"
                              : "Difícil"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      disabled={
                        !materialSeleccionado ||
                        generando ||
                        subiendo
                      }
                      onClick={() =>
                        void generarJuego()
                      }
                      className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#55A8E8]/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {generando ? (
                        <Loader2
                          className="animate-spin"
                          size={19}
                        />
                      ) : (
                        <Gamepad2 size={19} />
                      )}

                      {generando
                        ? "Creando tu juego..."
                        : `Jugar ${juegoActual.titulo}`}
                    </button>
                  </div>

                  {/* RIGHT CARD */}
                  <aside className="h-fit rounded-[26px] border border-[#DDEBF5] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#151F30]">
                    <div className="rounded-[22px] bg-gradient-to-br from-[#EAF8FF] to-[#F0EDFF] p-4 dark:from-[#193149] dark:to-[#282542]">
                      <div className="relative mx-auto h-[160px] w-full">
                        <Image
                          src="/raccoon.png"
                          alt="Raccoon"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center gap-2">
                        <Sparkles
                          size={16}
                          className="text-[#55A8E8]"
                        />
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#55A8E8]">
                          Consejo Raccoon
                        </p>
                      </div>

                      <h4 className="mt-2 text-lg font-black">
                        No tienes que subirlo dos veces.
                      </h4>

                      <p className="mt-2 text-sm font-medium leading-6 text-[#7890A8] dark:text-slate-400">
                        Los materiales guardados en tu
                        Dashboard aparecen automáticamente
                        aquí. También recordamos el último
                        material que seleccionaste.
                      </p>
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#F6FAFD] p-4 dark:bg-[#101A29]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wide text-[#8AA4BE]">
                            Tu plan
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <Crown
                              size={17}
                              className="text-[#E5A935]"
                            />

                            <p className="text-sm font-black">
                              {plan === "year"
                                ? "Premium anual"
                                : "Premium mensual"}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-[#EAF9F3] px-2.5 py-1 text-[10px] font-black text-[#2C9C7D] dark:bg-emerald-950/40 dark:text-emerald-300">
                          ACTIVO
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {[
                        "Memoria",
                        "Crucigrama",
                        "Ahorcado",
                        "Relaciona",
                        "Verdadero o falso",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 text-xs font-semibold text-[#647E98] dark:text-slate-400"
                        >
                          <CheckCircle2
                            size={14}
                            className="text-[#55A8E8]"
                          />
                          {item}
                        </div>
                      ))}
                    </div>
                  </aside>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Navigation({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const links = [
    {
      href: "/Dashboard",
      label: "Inicio",
      icon: Home,
    },
    {
      href: "/metodos",
      label: "Métodos de estudio",
      icon: Brain,
    },
    {
      href: "/quizzes",
      label: "Quizzes",
      icon: ClipboardCheck,
    },
    {
      href: "/juegos",
      label: "Juegos",
      icon: Gamepad2,
      active: true,
    },
    {
      href: "/biblioteca",
      label: "Biblioteca",
      icon: Library,
    },
    {
      href: "/perfil",
      label: "Perfil",
      icon: User,
    },
    {
      href: "/lugares",
      label: "Lugares",
      icon: MapPin,
    },
  ];

  return (
    <nav
      className={`flex-1 space-y-1 px-3 py-5 ${
        mobile ? "overflow-y-auto" : ""
      }`}
    >
      {links.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              item.active
                ? "bg-[#EAF6FE] text-[#1687D9] dark:bg-[#203349] dark:text-[#78C8F1]"
                : "text-[#253650] hover:bg-[#F0F8FF] hover:text-[#1687D9] dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Icon size={19} />
            {item.label}

            {item.active && (
              <span className="ml-auto h-2 w-2 rounded-full bg-[#55A8E8]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function PremiumSidebarCard({
  premium,
  plan,
}: {
  premium: boolean;
  plan: PlanType;
}) {
  return (
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
            {premium
              ? "Premium activo"
              : "Raccoon Premium"}
          </p>

          <p className="mt-1 text-[11px] text-white/80">
            {premium
              ? plan === "year"
                ? "Plan anual"
                : "Plan mensual"
              : "Lleva tu estudio al siguiente nivel"}
          </p>
        </div>
      </div>

      <div className="relative mt-3 flex items-center gap-1 text-xs font-bold">
        <Sparkles size={13} />

        {premium
          ? "Administrar Premium"
          : "Descubrir Premium"}

        <ArrowRight size={13} />
      </div>
    </Link>
  );
}

function MiniStat({
  icon,
  titulo,
  texto,
  color,
}: {
  icon: React.ReactNode;
  titulo: string;
  texto: string;
  color: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#E0ECF5] bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#151F30]">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xl font-black">
            {titulo}
          </p>
          <p className="text-xs font-semibold text-[#8AA4BE]">
            {texto}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepTitle({
  numero,
  titulo,
  subtitulo,
}: {
  numero: string;
  titulo: string;
  subtitulo: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF6FE] text-xs font-black text-[#1687D9] dark:bg-[#203349] dark:text-[#78C8F1]">
        {numero}
      </div>

      <div>
        <p className="text-sm font-black">
          {titulo}
        </p>
        <p className="mt-0.5 text-xs font-medium text-[#8AA4BE]">
          {subtitulo}
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[68vh] items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto h-28 w-28">
          <Image
            src="/raccoon.png"
            alt="Raccoon"
            fill
            className="object-contain"
          />
        </div>

        <Loader2 className="mx-auto mt-3 animate-spin text-[#55A8E8]" />

        <p className="mt-3 text-sm font-semibold text-[#7890A8] dark:text-slate-400">
          Preparando tus juegos...
        </p>
      </div>
    </div>
  );
}

function PremiumLocked() {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-[#DDEAF7] bg-gradient-to-br from-[#EDF9FF] via-white to-[#F1EEFF] p-6 shadow-sm dark:border-slate-700 dark:from-[#172536] dark:via-[#151F30] dark:to-[#25233D] sm:p-9 lg:p-11">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#55A8E8]/10" />
      <div className="absolute -bottom-24 left-[40%] h-64 w-64 rounded-full bg-[#7771E8]/10" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF1BD] px-3 py-1.5 text-[11px] font-black text-[#A86E00] dark:bg-amber-950/40 dark:text-amber-300">
            <Crown size={14} />
            EXCLUSIVO DE PREMIUM
          </span>

          <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight text-[#24364E] dark:text-white sm:text-[40px]">
            Convierte tus materiales
            <span className="block text-[#55A8E8]">
              en juegos para estudiar.
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-[#68829C] dark:text-slate-300 sm:text-base">
            Raccoon Games usa tus propios archivos
            para crear memoria, crucigramas,
            ahorcado, relaciones y retos de
            verdadero o falso.
          </p>

          <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
            {[
              "Usa tus materiales del Dashboard",
              "Generación de juegos con IA",
              "Dificultad personalizada",
              "Cinco tipos de práctica",
            ].map((texto) => (
              <div
                key={texto}
                className="flex items-center gap-2 rounded-xl border border-[#DFEBF5] bg-white/70 px-4 py-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800/50"
              >
                <CheckCircle2
                  size={17}
                  className="shrink-0 text-[#55A8E8]"
                />
                {texto}
              </div>
            ))}
          </div>

          <Link
            href="/suscripcion"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7771E8] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#55A8E8]/20 transition hover:-translate-y-0.5"
          >
            <Crown size={18} />
            Obtener Premium
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="relative mx-auto h-[310px] w-full max-w-[350px]">
          <div className="absolute bottom-8 left-1/2 h-20 w-[260px] -translate-x-1/2 rounded-full bg-[#55A8E8]/15 blur-2xl" />

          <Image
            src="/raccoon.png"
            alt="Mascota Raccoon Study"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />

          <div className="absolute right-0 top-5 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-xl dark:border-slate-600 dark:bg-slate-800/90">
            <div className="flex items-center gap-2">
              <Crown
                size={16}
                className="text-[#E3A532]"
              />

              <span className="text-xs font-black">
                Premium
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
