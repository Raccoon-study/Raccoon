"use client";

import type {
  FormEvent,
  ReactNode,
} from "react";

import type {
  User,
} from "@supabase/supabase-js";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Laptop,
  LoaderCircle,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from "lucide-react";

import {
  supabase,
} from "../lib/supabase";

/* =====================================================
   TIPOS
===================================================== */

type TipoMensaje =
  | "error"
  | "success"
  | "info";

type ProveedorSocial =
  | "google"
  | "microsoft"
  | null;

/* =====================================================
   PÁGINA
===================================================== */

export default function LoginPage() {
  const router =
    useRouter();

  /* =====================================================
     LOGIN
  ===================================================== */

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false);

  const [
    recordarCorreo,
    setRecordarCorreo,
  ] = useState(false);

  const [
    cargandoLogin,
    setCargandoLogin,
  ] = useState(false);

  const [
    cargandoSocial,
    setCargandoSocial,
  ] =
    useState<ProveedorSocial>(
      null
    );

  /* =====================================================
     RECUPERACIÓN
  ===================================================== */

  const [
    modalOlvido,
    setModalOlvido,
  ] = useState(false);

  const [
    emailRecuperacion,
    setEmailRecuperacion,
  ] = useState("");

  const [
    enviandoRecuperacion,
    setEnviandoRecuperacion,
  ] = useState(false);

  const [
    correoRecuperacionEnviado,
    setCorreoRecuperacionEnviado,
  ] = useState(false);

  /* =====================================================
     NUEVA CONTRASEÑA
  ===================================================== */

  const [
    modalNuevaPassword,
    setModalNuevaPassword,
  ] = useState(false);

  const [
    nuevaPassword,
    setNuevaPassword,
  ] = useState("");

  const [
    confirmarPassword,
    setConfirmarPassword,
  ] = useState("");

  const [
    mostrarNuevaPassword,
    setMostrarNuevaPassword,
  ] = useState(false);

  const [
    actualizandoPassword,
    setActualizandoPassword,
  ] = useState(false);

  /* =====================================================
     INTERFAZ
  ===================================================== */

  const [
    modoOscuro,
    setModoOscuro,
  ] = useState(false);

  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
    tipoMensaje,
    setTipoMensaje,
  ] =
    useState<TipoMensaje>(
      "info"
    );

  /* =====================================================
     MENSAJES
  ===================================================== */

  function mostrarMensaje(
    texto: string,
    tipo: TipoMensaje =
      "info"
  ) {
    setMensaje(texto);
    setTipoMensaje(tipo);
  }

  function limpiarMensaje() {
    setMensaje("");
  }

  /* =====================================================
     TEMA
  ===================================================== */

  function inicializarTema() {
    const temaGuardado =
      localStorage.getItem(
        "raccoon-theme"
      );

    const sistemaOscuro =
      window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches ?? false;

    const oscuro =
      temaGuardado ===
        "dark" ||
      (
        !temaGuardado &&
        sistemaOscuro
      );

    setModoOscuro(
      oscuro
    );

    document.documentElement.classList.toggle(
      "dark",
      oscuro
    );

    document.documentElement.style.colorScheme =
      oscuro
        ? "dark"
        : "light";
  }

  function cambiarTema() {
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
  }

  /* =====================================================
     DATOS DEL PERFIL
  ===================================================== */

  async function sincronizarPerfil(
    user: User
  ) {
    try {
      const metadata =
        user.user_metadata ||
        {};

      const provider =
        String(
          user.app_metadata
            ?.provider ||
            user.identities?.[0]
              ?.provider ||
            "email"
        );

      const nombre =
        String(
          metadata.nombre ||
            metadata.full_name ||
            metadata.name ||
            metadata.preferred_username ||
            user.email?.split(
              "@"
            )[0] ||
            "Usuario"
        );

      const avatarUrl =
        String(
          metadata.avatar_url ||
            metadata.picture ||
            ""
        );

      const ahora =
        new Date().toISOString();

      const {
        error,
      } =
        await supabase
          .from("profiles")
          .upsert(
            {
              id:
                user.id,

              email:
                user.email ||
                "",

              nombre,

              avatar_url:
                avatarUrl,

              provider,

              ultimo_acceso:
                ahora,

              updated_at:
                ahora,
            },
            {
              onConflict:
                "id",
            }
          );

      if (error) {
        console.warn(
          "No se pudo sincronizar profiles:",
          error.message
        );
      }
    } catch (error) {
      console.warn(
        "Error sincronizando perfil:",
        error
      );
    }
  }

  /* =====================================================
     INICIAR SESIÓN EMAIL
  ===================================================== */

  async function iniciarSesion(
    evento:
      FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    limpiarMensaje();

    const correo =
      email
        .trim()
        .toLowerCase();

    if (
      !correo ||
      !password
    ) {
      mostrarMensaje(
        "Completa tu correo y contraseña.",
        "error"
      );

      return;
    }

    if (
      !correo.includes("@")
    ) {
      mostrarMensaje(
        "Escribe un correo electrónico válido.",
        "error"
      );

      return;
    }

    try {
      setCargandoLogin(
        true
      );

      const {
        data,
        error,
      } =
        await supabase.auth
          .signInWithPassword({
            email:
              correo,

            password,
          });

      if (error) {
        throw error;
      }

      if (
        !data.user ||
        !data.session
      ) {
        throw new Error(
          "No se pudo crear la sesión."
        );
      }

      /*
        Recordar correo.
        La sesión de Supabase se sigue manejando
        normalmente por el cliente.
      */

      if (
        recordarCorreo
      ) {
        localStorage.setItem(
          "raccoon-login-email",
          correo
        );
      } else {
        localStorage.removeItem(
          "raccoon-login-email"
        );
      }

      await sincronizarPerfil(
        data.user
      );

      mostrarMensaje(
        "¡Bienvenido de nuevo!",
        "success"
      );

      router.replace(
        "/Dashboard"
      );
    } catch (error) {
      console.error(
        "Error login:",
        error
      );

      const mensajeError =
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión.";

      /*
        Mensajes más amigables.
      */

      if (
        mensajeError
          .toLowerCase()
          .includes(
            "invalid login credentials"
          )
      ) {
        mostrarMensaje(
          "El correo o la contraseña son incorrectos.",
          "error"
        );
      } else if (
        mensajeError
          .toLowerCase()
          .includes(
            "email not confirmed"
          )
      ) {
        mostrarMensaje(
          "Debes confirmar tu correo antes de iniciar sesión.",
          "error"
        );
      } else {
        mostrarMensaje(
          mensajeError,
          "error"
        );
      }
    } finally {
      setCargandoLogin(
        false
      );
    }
  }

  /* =====================================================
     GOOGLE
  ===================================================== */

  async function iniciarGoogle() {
    if (
      cargandoSocial
    ) {
      return;
    }

    try {
      limpiarMensaje();

      setCargandoSocial(
        "google"
      );

      const redirectTo =
        `${window.location.origin}/Login?oauth=1`;

      const {
        error,
      } =
        await supabase.auth
          .signInWithOAuth({
            provider:
              "google",

            options: {
              redirectTo,

              queryParams: {
                prompt:
                  "select_account",
              },
            },
          });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        "Google login:",
        error
      );

      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión con Google.",
        "error"
      );

      setCargandoSocial(
        null
      );
    }
  }

  /* =====================================================
     MICROSOFT
  ===================================================== */

  async function iniciarMicrosoft() {
    if (
      cargandoSocial
    ) {
      return;
    }

    try {
      limpiarMensaje();

      setCargandoSocial(
        "microsoft"
      );

      const redirectTo =
        `${window.location.origin}/Login?oauth=1`;

      const {
        error,
      } =
        await supabase.auth
          .signInWithOAuth({
            /*
              Microsoft en Supabase
              se llama "azure".
            */

            provider:
              "azure",

            options: {
              redirectTo,

              /*
                Supabase necesita que Azure
                entregue el correo.
              */

              scopes:
                "email",
            },
          });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        "Microsoft login:",
        error
      );

      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión con Microsoft.",
        "error"
      );

      setCargandoSocial(
        null
      );
    }
  }

  /* =====================================================
     OLVIDÉ MI CONTRASEÑA
  ===================================================== */

  function abrirRecuperacion() {
    limpiarMensaje();

    setEmailRecuperacion(
      email
    );

    setCorreoRecuperacionEnviado(
      false
    );

    setModalOlvido(
      true
    );
  }

  async function enviarRecuperacion(
    evento:
      FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    const correo =
      emailRecuperacion
        .trim()
        .toLowerCase();

    if (
      !correo ||
      !correo.includes("@")
    ) {
      mostrarMensaje(
        "Escribe un correo electrónico válido.",
        "error"
      );

      return;
    }

    try {
      setEnviandoRecuperacion(
        true
      );

      const redirectTo =
        `${window.location.origin}/Login?recovery=1`;

      const {
        error,
      } =
        await supabase.auth
          .resetPasswordForEmail(
            correo,
            {
              redirectTo,
            }
          );

      if (error) {
        throw error;
      }

      setCorreoRecuperacionEnviado(
        true
      );
    } catch (error) {
      console.error(
        "Recuperación:",
        error
      );

      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo enviar el correo de recuperación.",
        "error"
      );
    } finally {
      setEnviandoRecuperacion(
        false
      );
    }
  }

  /* =====================================================
     CAMBIAR CONTRASEÑA
  ===================================================== */

  async function actualizarPassword(
    evento:
      FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    limpiarMensaje();

    if (
      nuevaPassword.length <
      8
    ) {
      mostrarMensaje(
        "La nueva contraseña debe tener al menos 8 caracteres.",
        "error"
      );

      return;
    }

    if (
      nuevaPassword !==
      confirmarPassword
    ) {
      mostrarMensaje(
        "Las contraseñas no coinciden.",
        "error"
      );

      return;
    }

    try {
      setActualizandoPassword(
        true
      );

      const {
        data,
        error,
      } =
        await supabase.auth
          .updateUser({
            password:
              nuevaPassword,
          });

      if (error) {
        throw error;
      }

      if (data.user) {
        await sincronizarPerfil(
          data.user
        );
      }

      setModalNuevaPassword(
        false
      );

      setNuevaPassword(
        ""
      );

      setConfirmarPassword(
        ""
      );

      window.history.replaceState(
        {},
        "",
        "/Login"
      );

      mostrarMensaje(
        "Contraseña actualizada correctamente.",
        "success"
      );

      router.replace(
        "/Dashboard"
      );
    } catch (error) {
      console.error(
        "Cambio de contraseña:",
        error
      );

      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la contraseña.",
        "error"
      );
    } finally {
      setActualizandoPassword(
        false
      );
    }
  }

  /* =====================================================
     CARGAR SESIÓN
  ===================================================== */

  useEffect(() => {
    inicializarTema();

    const emailGuardado =
      localStorage.getItem(
        "raccoon-login-email"
      );

    if (
      emailGuardado
    ) {
      setEmail(
        emailGuardado
      );

      setRecordarCorreo(
        true
      );
    }

    const parametros =
      new URLSearchParams(
        window.location.search
      );

    const oauth =
      parametros.get(
        "oauth"
      ) === "1";

    const recovery =
      parametros.get(
        "recovery"
      ) === "1";

    /*
      También revisamos si OAuth devolvió
      un error en el fragmento de URL.
    */

    const hash =
      new URLSearchParams(
        window.location.hash.replace(
          /^#/,
          ""
        )
      );

    const errorDescripcion =
      hash.get(
        "error_description"
      );

    if (
      errorDescripcion
    ) {
      mostrarMensaje(
        decodeURIComponent(
          errorDescripcion
        ),
        "error"
      );
    }

    if (
      recovery
    ) {
      setModalNuevaPassword(
        true
      );
    }

    /*
      Escuchar cambios de autenticación.
    */

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth
        .onAuthStateChange(
          (
            evento,
            session
          ) => {
            if (
              evento ===
              "PASSWORD_RECOVERY"
            ) {
              setModalOlvido(
                false
              );

              setModalNuevaPassword(
                true
              );

              return;
            }

            if (
              evento ===
                "SIGNED_IN" &&
              session?.user &&
              !recovery
            ) {
              window.setTimeout(
                () => {
                  void (async () => {
                    await sincronizarPerfil(
                      session.user
                    );

                    if (
                      oauth
                    ) {
                      router.replace(
                        "/Dashboard"
                      );
                    }
                  })();
                },
                0
              );
            }
          }
        );

    /*
      Usuario que ya tiene sesión.
    */

    void (async () => {
      const {
        data: {
          session,
        },
      } =
        await supabase.auth
          .getSession();

      if (
        !session?.user
      ) {
        return;
      }

      if (
        recovery
      ) {
        setModalNuevaPassword(
          true
        );

        return;
      }

      await sincronizarPerfil(
        session.user
      );

      /*
        Si volvió desde Google/Microsoft
        o simplemente ya tenía sesión,
        entra al Dashboard.
      */

      router.replace(
        "/Dashboard"
      );
    })();

    return () => {
      subscription.unsubscribe();
    };
  }, [
    router,
  ]);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main
      className="
        relative min-h-screen
        overflow-hidden
        bg-[#F5F8FF]
        text-[#08142D]
        transition-colors
        dark:bg-[#0D1626]
        dark:text-white
      "
    >
      {/* =====================================================
          FONDO
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div
          className="
            absolute -left-32 -top-32
            h-[500px] w-[500px]
            rounded-full
            bg-[#BFD9FF]/45
            blur-3xl
            dark:bg-[#2D4D7D]/25
          "
        />

        <div
          className="
            absolute bottom-[-180px] right-[-100px]
            h-[520px] w-[520px]
            rounded-full
            bg-[#DCD6FF]/50
            blur-3xl
            dark:bg-[#493A77]/20
          "
        />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          relative z-30
          flex h-[82px]
          items-center
          justify-between
          px-5
          sm:px-8
          lg:px-12
        "
      >
        <div className="flex items-center gap-3">
          <Image
            src="/raccoon.png"
            alt="Raccoon Study"
            width={46}
            height={46}
            priority
            className="h-11 w-11 object-contain"
          />

          <h1 className="text-lg font-black sm:text-xl">
            Raccoon
            <span className="text-[#4169FF]">
              Study
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="
              hidden items-center gap-2
              rounded-full
              border border-[#DDE6F5]
              bg-white/70
              px-4 py-2
              text-sm font-bold
              text-[#536988]
              backdrop-blur
              transition
              hover:bg-white
              dark:border-slate-700
              dark:bg-slate-800/70
              dark:text-slate-200
              sm:flex
            "
          >
            <ArrowLeft size={16} />

            Volver
          </Link>

          <button
            type="button"
            onClick={cambiarTema}
            className="
              flex items-center gap-2
              rounded-full
              border border-[#DDE6F5]
              bg-white/70
              px-4 py-2
              text-sm font-bold
              text-[#536988]
              backdrop-blur
              transition
              hover:bg-white
              dark:border-slate-700
              dark:bg-slate-800/70
              dark:text-slate-200
            "
          >
            {modoOscuro ? (
              <Sun size={16} />
            ) : (
              <Moon size={16} />
            )}

            <span className="hidden sm:block">
              {modoOscuro
                ? "Modo claro"
                : "Modo oscuro"}
            </span>
          </button>
        </div>
      </header>

      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <div
        className="
          relative z-10
          mx-auto
          grid min-h-[calc(100vh-82px)]
          max-w-[1500px]
          items-center
          gap-10
          px-5
          pb-10
          pt-4
          sm:px-8
          lg:grid-cols-[1.05fr_0.95fr]
          lg:px-12
          xl:gap-16
        "
      >
        {/* =====================================================
            PARTE IZQUIERDA
        ===================================================== */}

        <section
          className="
            relative
            flex flex-col
            justify-center
            lg:min-h-[720px]
          "
        >
          <div className="relative z-10 max-w-xl">
            <span
              className="
                inline-flex
                items-center gap-2
                rounded-full
                bg-white/70
                px-4 py-2
                text-xs font-black
                text-[#4169FF]
                shadow-sm
                backdrop-blur
                dark:bg-slate-800/60
                dark:text-[#92BFFF]
              "
            >
              <Sparkles size={15} />

              Tu espacio inteligente de estudio
            </span>

            <h2
              className="
                mt-6
                text-4xl font-black
                leading-[1.05]
                sm:text-5xl
                xl:text-6xl
              "
            >
              Bienvenido
              <br />

              <span className="text-[#4169FF]">
                de nuevo
              </span>
              <span className="ml-2 text-[#4EA6F2]">
                ✦
              </span>
            </h2>

            <p
              className="
                mt-5 max-w-md
                text-base
                leading-7
                text-[#526988]
                dark:text-slate-300
              "
            >
              Continúa aprendiendo de forma más
              inteligente con Raccoon Study y
              nuestro asistente de IA.
            </p>
          </div>

          {/* =====================================================
              ILUSTRACIÓN
          ===================================================== */}

          <div
            className="
              relative mx-auto
              mt-8
              flex w-full
              max-w-[620px]
              items-end
              justify-center
              lg:mt-3
            "
          >
            {/* RESPLANDOR */}

            <div
              className="
                absolute
                bottom-14
                h-[330px]
                w-[330px]
                rounded-full
                border border-white/70
                bg-[#C7DFFF]/45
                shadow-[0_0_80px_rgba(78,153,255,0.35)]
                dark:border-[#4B668A]/40
                dark:bg-[#254368]/30
              "
            />

            {/* PDF */}

            <div
              className="
                absolute left-[4%] top-[20%]
                z-20
                flex h-16 w-16
                rotate-[-12deg]
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-[#7668FF]
                to-[#536BFF]
                text-white
                shadow-xl
                sm:left-[10%]
              "
            >
              <FileText size={27} />
            </div>

            {/* IA */}

            <div
              className="
                absolute right-[5%] top-[8%]
                z-20
                flex h-20 w-20
                rotate-[8deg]
                flex-col
                items-center
                justify-center
                rounded-[24px]
                bg-gradient-to-br
                from-[#3B7AFF]
                to-[#57BAF6]
                text-white
                shadow-xl
                sm:right-[12%]
              "
            >
              <Sparkles size={24} />

              <span className="mt-1 text-xs font-black">
                IA
              </span>
            </div>

            {/* ESTRELLAS */}

            <div className="absolute left-[15%] top-[5%] text-3xl text-[#FFDF76]">
              ★
            </div>

            <div className="absolute right-[25%] top-[0%] text-xl text-[#B9C9FF]">
              ✦
            </div>

            <div className="absolute right-[3%] top-[36%] text-2xl text-[#FFDF76]">
              ★
            </div>

            {/* MAPACHE */}

            <div className="relative z-10">
              <Image
                src="/raccoon.png"
                alt="Raccoon estudiando"
                width={430}
                height={430}
                priority
                className="
                  h-auto
                  w-[280px]
                  drop-shadow-[0_25px_25px_rgba(25,70,130,0.20)]
                  sm:w-[350px]
                  lg:w-[410px]
                "
              />
            </div>

            {/* LIBROS */}

            <div
              className="
                absolute
                bottom-5 left-[2%]
                z-20
                hidden
                sm:block
              "
            >
              <div className="h-7 w-32 -rotate-2 rounded-md bg-[#20395E] shadow-lg" />
              <div className="mt-1 h-7 w-36 rotate-1 rounded-md bg-[#5276AB] shadow-lg" />
              <div className="mt-1 h-7 w-32 -rotate-1 rounded-md bg-[#7559C9] shadow-lg" />
            </div>
          </div>

          {/* =====================================================
              BENEFICIOS
          ===================================================== */}

          <div
            className="
              relative z-20
              mt-4
              grid gap-3
              rounded-2xl
              border border-white/60
              bg-white/65
              p-4
              shadow-lg
              backdrop-blur-xl
              dark:border-slate-700
              dark:bg-slate-800/55
              sm:grid-cols-3
            "
          >
            <MiniBeneficio
              icono={
                <FileText size={18} />
              }
              titulo="Resume archivos"
              descripcion="PDF y documentos"
            />

            <MiniBeneficio
              icono={
                <BrainCircuit size={18} />
              }
              titulo="Estudia con IA"
              descripcion="Ayuda personalizada"
            />

            <MiniBeneficio
              icono={
                <BookOpen size={18} />
              }
              titulo="Mejora tus hábitos"
              descripcion="Métodos de estudio"
            />
          </div>
        </section>

        {/* =====================================================
            TARJETA LOGIN
        ===================================================== */}

        <section
          className="
            mx-auto w-full
            max-w-[560px]
            rounded-[30px]
            border border-white/70
            bg-white/90
            p-6
            shadow-[0_25px_70px_rgba(47,79,140,0.16)]
            backdrop-blur-xl
            dark:border-slate-700
            dark:bg-[#172235]/95
            sm:p-8
            lg:p-10
          "
        >
          {/* ICONO */}

          <div
            className="
              mx-auto
              flex h-[74px] w-[74px]
              items-center justify-center
              rounded-full
              border-8 border-[#F3F6FF]
              bg-[#EEF3FF]
              text-[#4169FF]
              shadow-sm
              dark:border-slate-800
              dark:bg-[#24324A]
              dark:text-[#8AB8FF]
            "
          >
            <Lock size={30} />
          </div>

          <div className="mt-5 text-center">
            <h1 className="text-2xl font-black sm:text-3xl">
              Iniciar sesión
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-[#70809B]
                dark:text-slate-400
              "
            >
              Nos alegra verte de nuevo 🦝
            </p>
          </div>

          {/* MENSAJE */}

          {mensaje && (
            <div
              className={`
                mt-5
                flex items-start gap-3
                rounded-xl
                border
                p-3
                text-sm font-semibold
                ${
                  tipoMensaje ===
                  "error"
                    ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                    : tipoMensaje ===
                        "success"
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300"
                      : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                }
              `}
            >
              {tipoMensaje ===
              "success" ? (
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0"
                />
              ) : (
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0"
                />
              )}

              <span>
                {mensaje}
              </span>
            </div>
          )}

          {/* =====================================================
              FORMULARIO
          ===================================================== */}

          <form
            onSubmit={iniciarSesion}
            className="mt-7"
          >
            {/* CORREO */}

            <label className="block">
              <span
                className="
                  text-sm font-black
                  text-[#1B2944]
                  dark:text-slate-200
                "
              >
                Correo electrónico
              </span>

              <div
                className="
                  mt-2 flex
                  h-[58px]
                  items-center gap-3
                  rounded-xl
                  border border-[#D9E0EC]
                  bg-white
                  px-4
                  transition
                  focus-within:border-[#4169FF]
                  focus-within:ring-4
                  focus-within:ring-[#4169FF]/10
                  dark:border-slate-600
                  dark:bg-[#111C2D]
                "
              >
                <Mail
                  size={19}
                  className="shrink-0 text-[#8795AB]"
                />

                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(evento) =>
                    setEmail(
                      evento.target.value
                    )
                  }
                  placeholder="ejemplo@correo.com"
                  className="
                    w-full
                    bg-transparent
                    text-sm
                    outline-none
                    placeholder:text-[#A2ACBC]
                  "
                />
              </div>
            </label>

            {/* CONTRASEÑA */}

            <label className="mt-5 block">
              <span
                className="
                  text-sm font-black
                  text-[#1B2944]
                  dark:text-slate-200
                "
              >
                Contraseña
              </span>

              <div
                className="
                  mt-2 flex
                  h-[58px]
                  items-center gap-3
                  rounded-xl
                  border border-[#D9E0EC]
                  bg-white
                  px-4
                  transition
                  focus-within:border-[#4169FF]
                  focus-within:ring-4
                  focus-within:ring-[#4169FF]/10
                  dark:border-slate-600
                  dark:bg-[#111C2D]
                "
              >
                <Lock
                  size={19}
                  className="shrink-0 text-[#8795AB]"
                />

                <input
                  type={
                    mostrarPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  value={password}
                  onChange={(evento) =>
                    setPassword(
                      evento.target.value
                    )
                  }
                  placeholder="••••••••"
                  className="
                    w-full flex-1
                    bg-transparent
                    text-sm
                    outline-none
                    placeholder:text-[#A2ACBC]
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarPassword(
                      !mostrarPassword
                    )
                  }
                  className="
                    flex h-9 w-9
                    items-center
                    justify-center
                    rounded-lg
                    text-[#7C8CA5]
                    transition
                    hover:bg-[#F2F5FA]
                    dark:hover:bg-slate-700
                  "
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </label>

            {/* OPCIONES */}

            <div
              className="
                mt-4
                flex flex-wrap
                items-center
                justify-between
                gap-3
              "
            >
              <label
                className="
                  flex cursor-pointer
                  items-center gap-2
                  text-sm
                  text-[#687B97]
                  dark:text-slate-300
                "
              >
                <input
                  type="checkbox"
                  checked={recordarCorreo}
                  onChange={(evento) =>
                    setRecordarCorreo(
                      evento.target.checked
                    )
                  }
                  className="
                    h-4 w-4
                    rounded
                    accent-[#4169FF]
                  "
                />

                Recordarme
              </label>

              <button
                type="button"
                onClick={abrirRecuperacion}
                className="
                  text-sm font-black
                  text-[#3374CF]
                  transition
                  hover:text-[#4169FF]
                  hover:underline
                "
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* LOGIN */}

            <button
              type="submit"
              disabled={
                cargandoLogin ||
                cargandoSocial !==
                  null
              }
              className="
                mt-7 flex
                h-[58px] w-full
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-gradient-to-r
                from-[#2468F2]
                via-[#347CF4]
                to-[#399BEF]
                font-black
                text-white
                shadow-[0_10px_25px_rgba(36,104,242,0.28)]
                transition
                hover:-translate-y-0.5
                hover:shadow-[0_14px_30px_rgba(36,104,242,0.34)]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {cargandoLogin ? (
                <>
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
                  />

                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar sesión

                  <ArrowRight
                    size={20}
                  />
                </>
              )}
            </button>
          </form>

          {/* =====================================================
              DIVISOR
          ===================================================== */}

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E2E7EF] dark:bg-slate-700" />

            <span className="text-xs font-semibold text-[#8D99AC]">
              o continúa con
            </span>

            <div className="h-px flex-1 bg-[#E2E7EF] dark:bg-slate-700" />
          </div>

          {/* =====================================================
              GOOGLE
          ===================================================== */}

          <button
            type="button"
            onClick={() =>
              void iniciarGoogle()
            }
            disabled={
              cargandoLogin ||
              cargandoSocial !==
                null
            }
            className="
              flex h-[56px] w-full
              items-center
              justify-center gap-3
              rounded-xl
              border border-[#DDE3ED]
              bg-white
              px-4
              font-black
              text-[#263550]
              shadow-sm
              transition
              hover:-translate-y-0.5
              hover:bg-[#F9FBFE]
              hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-slate-600
              dark:bg-[#111C2D]
              dark:text-white
              dark:hover:bg-slate-800
            "
          >
            {cargandoSocial ===
            "google" ? (
              <LoaderCircle
                size={20}
                className="animate-spin text-[#4285F4]"
              />
            ) : (
              <Image
                src="/google.png"
                alt="Google"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            )}

            Continuar con Google
          </button>

          {/* =====================================================
              MICROSOFT
          ===================================================== */}

          <button
            type="button"
            onClick={() =>
              void iniciarMicrosoft()
            }
            disabled={
              cargandoLogin ||
              cargandoSocial !==
                null
            }
            className="
              mt-3 flex
              h-[56px] w-full
              items-center
              justify-center gap-3
              rounded-xl
              border border-[#DDE3ED]
              bg-white
              px-4
              font-black
              text-[#263550]
              shadow-sm
              transition
              hover:-translate-y-0.5
              hover:bg-[#F9FBFE]
              hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-slate-600
              dark:bg-[#111C2D]
              dark:text-white
              dark:hover:bg-slate-800
            "
          >
            {cargandoSocial ===
            "microsoft" ? (
              <LoaderCircle
                size={20}
                className="animate-spin text-[#2583D8]"
              />
            ) : (
              <Image
                src="/microsoft.png"
                alt="Microsoft"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            )}

            Continuar con Microsoft
          </button>

          {/* =====================================================
              REGISTRO
          ===================================================== */}

          <p
            className="
              mt-7 text-center
              text-sm
              text-[#77869D]
              dark:text-slate-400
            "
          >
            ¿No tienes una cuenta?

            <Link
              href="/Registro"
              className="
                ml-2 font-black
                text-[#3374CF]
                hover:underline
              "
            >
              Crear cuenta
            </Link>
          </p>

          <div
            className="
              mt-6
              flex items-center
              justify-center gap-2
              text-[11px]
              text-[#9AA5B5]
            "
          >
            <ShieldCheck size={14} />

            Tus datos están protegidos con Raccoon Study.
          </div>
        </section>
      </div>

      {/* =====================================================
          MODAL OLVIDÉ CONTRASEÑA
      ===================================================== */}

      {modalOlvido && (
        <div
          className="
            fixed inset-0 z-[500]
            flex items-center
            justify-center
            bg-[#061126]/60
            p-4
            backdrop-blur-sm
          "
        >
          <button
            type="button"
            onClick={() =>
              setModalOlvido(
                false
              )
            }
            className="absolute inset-0"
            aria-label="Cerrar"
          />

          <section
            className="
              relative z-10
              w-full max-w-md
              rounded-[28px]
              bg-white
              p-7
              shadow-2xl
              dark:bg-[#172235]
            "
          >
            <button
              type="button"
              onClick={() =>
                setModalOlvido(
                  false
                )
              }
              className="
                absolute
                right-5 top-5
                flex h-10 w-10
                items-center
                justify-center
                rounded-full
                bg-[#F2F5FA]
                dark:bg-slate-700
              "
            >
              <X size={20} />
            </button>

            {correoRecuperacionEnviado ? (
              <div className="text-center">
                <div
                  className="
                    mx-auto flex
                    h-16 w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-green-100
                    text-green-600
                    dark:bg-green-950/40
                    dark:text-green-400
                  "
                >
                  <CheckCircle2
                    size={31}
                  />
                </div>

                <h2 className="mt-5 text-2xl font-black">
                  Revisa tu correo
                </h2>

                <p
                  className="
                    mt-3
                    leading-7
                    text-[#667993]
                    dark:text-slate-300
                  "
                >
                  Si existe una cuenta asociada a
                  ese correo, recibirás un enlace
                  para cambiar tu contraseña.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setModalOlvido(
                      false
                    )
                  }
                  className="
                    mt-6 w-full
                    rounded-xl
                    bg-[#4169FF]
                    py-4
                    font-black
                    text-white
                  "
                >
                  Entendido
                </button>
              </div>
            ) : (
              <>
                <div
                  className="
                    flex h-16 w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#EDF3FF]
                    text-[#4169FF]
                    dark:bg-[#24324A]
                    dark:text-[#8AB8FF]
                  "
                >
                  <KeyRound
                    size={30}
                  />
                </div>

                <h2 className="mt-5 text-2xl font-black">
                  Recuperar contraseña
                </h2>

                <p
                  className="
                    mt-2
                    text-sm leading-6
                    text-[#667993]
                    dark:text-slate-300
                  "
                >
                  Escribe el correo con el que
                  creaste tu cuenta. Te enviaremos
                  un enlace seguro para establecer
                  una nueva contraseña.
                </p>

                <form
                  onSubmit={
                    enviarRecuperacion
                  }
                  className="mt-6"
                >
                  <label className="text-sm font-black">
                    Correo electrónico
                  </label>

                  <div
                    className="
                      mt-2 flex
                      h-[56px]
                      items-center gap-3
                      rounded-xl
                      border border-[#D9E0EC]
                      px-4
                      focus-within:border-[#4169FF]
                      dark:border-slate-600
                      dark:bg-[#111C2D]
                    "
                  >
                    <Mail
                      size={19}
                      className="text-[#8795AB]"
                    />

                    <input
                      type="email"
                      value={
                        emailRecuperacion
                      }
                      onChange={(evento) =>
                        setEmailRecuperacion(
                          evento.target.value
                        )
                      }
                      placeholder="tu@correo.com"
                      className="w-full bg-transparent outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      enviandoRecuperacion
                    }
                    className="
                      mt-5 flex
                      w-full
                      items-center
                      justify-center gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-[#2468F2]
                      to-[#399BEF]
                      py-4
                      font-black
                      text-white
                      disabled:opacity-60
                    "
                  >
                    {enviandoRecuperacion ? (
                      <>
                        <LoaderCircle
                          size={19}
                          className="animate-spin"
                        />

                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail size={19} />

                        Enviar enlace
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}

      {/* =====================================================
          MODAL NUEVA CONTRASEÑA
      ===================================================== */}

      {modalNuevaPassword && (
        <div
          className="
            fixed inset-0 z-[600]
            flex items-center
            justify-center
            bg-[#061126]/65
            p-4
            backdrop-blur-sm
          "
        >
          <section
            className="
              relative
              w-full max-w-md
              rounded-[28px]
              bg-white
              p-7
              shadow-2xl
              dark:bg-[#172235]
            "
          >
            <div
              className="
                flex h-16 w-16
                items-center
                justify-center
                rounded-2xl
                bg-[#EDF3FF]
                text-[#4169FF]
                dark:bg-[#24324A]
                dark:text-[#8AB8FF]
              "
            >
              <Lock size={30} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Crea una nueva contraseña
            </h2>

            <p
              className="
                mt-2
                text-sm leading-6
                text-[#667993]
                dark:text-slate-300
              "
            >
              Escribe una contraseña nueva para tu
              cuenta de Raccoon Study.
            </p>

            <form
              onSubmit={
                actualizarPassword
              }
              className="mt-6"
            >
              <label className="text-sm font-black">
                Nueva contraseña
              </label>

              <div
                className="
                  mt-2 flex
                  h-[56px]
                  items-center gap-3
                  rounded-xl
                  border border-[#D9E0EC]
                  px-4
                  focus-within:border-[#4169FF]
                  dark:border-slate-600
                  dark:bg-[#111C2D]
                "
              >
                <Lock
                  size={19}
                  className="text-[#8795AB]"
                />

                <input
                  type={
                    mostrarNuevaPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    nuevaPassword
                  }
                  onChange={(evento) =>
                    setNuevaPassword(
                      evento.target.value
                    )
                  }
                  placeholder="Mínimo 8 caracteres"
                  className="w-full flex-1 bg-transparent outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarNuevaPassword(
                      !mostrarNuevaPassword
                    )
                  }
                >
                  {mostrarNuevaPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <label className="mt-5 block text-sm font-black">
                Confirmar contraseña
              </label>

              <div
                className="
                  mt-2 flex
                  h-[56px]
                  items-center gap-3
                  rounded-xl
                  border border-[#D9E0EC]
                  px-4
                  focus-within:border-[#4169FF]
                  dark:border-slate-600
                  dark:bg-[#111C2D]
                "
              >
                <ShieldCheck
                  size={19}
                  className="text-[#8795AB]"
                />

                <input
                  type={
                    mostrarNuevaPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmarPassword
                  }
                  onChange={(evento) =>
                    setConfirmarPassword(
                      evento.target.value
                    )
                  }
                  placeholder="Repite tu contraseña"
                  className="w-full bg-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={
                  actualizandoPassword
                }
                className="
                  mt-6 flex
                  w-full
                  items-center
                  justify-center gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-[#2468F2]
                  to-[#399BEF]
                  py-4
                  font-black
                  text-white
                  disabled:opacity-60
                "
              >
                {actualizandoPassword ? (
                  <>
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />

                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={19}
                    />

                    Guardar nueva contraseña
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

/* =====================================================
   BENEFICIOS
===================================================== */

function MiniBeneficio({
  icono,
  titulo,
  descripcion,
}: {
icono:
  React.ReactNode;

  titulo:
    string;

  descripcion:
    string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex h-9 w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#EDF3FF]
          text-[#4169FF]
          dark:bg-[#24324A]
          dark:text-[#8AB8FF]
        "
      >
        {icono}
      </div>

      <div>
        <p className="text-xs font-black">
          {titulo}
        </p>

        <p className="mt-0.5 text-[10px] text-[#8492A7]">
          {descripcion}
        </p>
      </div>
    </div>
  );
}