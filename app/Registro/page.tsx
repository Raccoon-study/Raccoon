"use client";

import type {
  FormEvent,
  ReactNode,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Trophy,
  User,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";

import { supabase } from "../lib/supabase";

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
   URL DE RACCOON
===================================================== */

function obtenerSiteUrl(): string {
  if (
    typeof window === "undefined"
  ) {
    return "";
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    window.location.origin
  ).replace(/\/$/, "");
}

/* =====================================================
   PÁGINA
===================================================== */

export default function RegistroPage() {
  const router = useRouter();

  /* =====================================================
     FORMULARIO
  ===================================================== */

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmarPassword,
    setConfirmarPassword,
  ] = useState("");

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false);

  const [
    mostrarConfirmacion,
    setMostrarConfirmacion,
  ] = useState(false);

  const [
    aceptaTerminos,
    setAceptaTerminos,
  ] = useState(false);

  /* =====================================================
     ESTADOS
  ===================================================== */

  const [
    cargandoRegistro,
    setCargandoRegistro,
  ] = useState(false);

  const [
    cargandoSocial,
    setCargandoSocial,
  ] =
    useState<ProveedorSocial>(
      null
    );

  const [
    registroEnviado,
    setRegistroEnviado,
  ] = useState(false);

  const [
    correoRegistrado,
    setCorreoRegistrado,
  ] = useState("");

  const [
    reenviandoCorreo,
    setReenviandoCorreo,
  ] = useState(false);

  /* =====================================================
     TEMA
  ===================================================== */

  const [
    modoOscuro,
    setModoOscuro,
  ] = useState(false);

  /* =====================================================
     MENSAJES
  ===================================================== */

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
     VALIDACIONES
  ===================================================== */

  const passwordMinima =
    password.length >= 8;

  const passwordsCoinciden =
    password.length > 0 &&
    confirmarPassword.length > 0 &&
    password ===
      confirmarPassword;

  /* =====================================================
     MENSAJE
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
      temaGuardado === "dark" ||
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
     CREAR CUENTA CON CORREO
  ===================================================== */

  async function crearCuenta(
    evento:
      FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (
      cargandoRegistro
    ) {
      return;
    }

    limpiarMensaje();

    const nombreLimpio =
      nombre.trim();

    const correo =
      email
        .trim()
        .toLowerCase();

    /* VALIDAR NOMBRE */

    if (
      nombreLimpio.length < 2
    ) {
      mostrarMensaje(
        "Escribe tu nombre completo.",
        "error"
      );

      return;
    }

    /* VALIDAR EMAIL */

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

    /* VALIDAR PASSWORD */

    if (
      password.length < 8
    ) {
      mostrarMensaje(
        "La contraseña debe tener al menos 8 caracteres.",
        "error"
      );

      return;
    }

    /* VALIDAR CONFIRMACIÓN */

    if (
      password !==
      confirmarPassword
    ) {
      mostrarMensaje(
        "Las contraseñas no coinciden.",
        "error"
      );

      return;
    }

    /* TÉRMINOS */

    if (!aceptaTerminos) {
      mostrarMensaje(
        "Debes aceptar los términos y la política de privacidad para continuar.",
        "error"
      );

      return;
    }

    try {
      setCargandoRegistro(
        true
      );

      const siteUrl =
        obtenerSiteUrl();

      /*
        IMPORTANTE:

        Después de confirmar el correo,
        Supabase llevará al usuario a:

        /registro_exitoso
      */

      const emailRedirectTo =
        `${siteUrl}/registro_exitoso`;

      const {
        data,
        error,
      } =
        await supabase.auth.signUp({
          email:
            correo,

          password,

          options: {
            emailRedirectTo,

            /*
              Estos datos se guardan en
              auth.users.user_metadata.

              Nuestro trigger de profiles
              también los utiliza.
            */

            data: {
              nombre:
                nombreLimpio,

              full_name:
                nombreLimpio,

              name:
                nombreLimpio,
            },
          },
        });

      if (error) {
        throw error;
      }

      /*
        Si Email Confirmation está desactivado,
        Supabase puede entregar una sesión
        inmediatamente.

        En ese caso entramos al Dashboard.
      */

      if (
        data.session &&
        data.user
      ) {
        router.replace(
          "/Dashboard"
        );

        return;
      }

      /*
        Con confirmación de correo activada:
        mostramos nuestra propia pantalla.
      */

      setCorreoRegistrado(
        correo
      );

      setRegistroEnviado(
        true
      );

      setPassword("");
      setConfirmarPassword("");

      mostrarMensaje(
        "",
        "success"
      );
    } catch (error) {
      console.error(
        "Error creando cuenta:",
        error
      );

      const texto =
        error instanceof Error
          ? error.message
          : "No se pudo crear tu cuenta.";

      const minuscula =
        texto.toLowerCase();

      if (
        minuscula.includes(
          "password"
        )
      ) {
        mostrarMensaje(
          "La contraseña no cumple con los requisitos de seguridad.",
          "error"
        );
      } else if (
        minuscula.includes(
          "rate limit"
        )
      ) {
        mostrarMensaje(
          "Has realizado demasiados intentos. Espera un momento y vuelve a intentarlo.",
          "error"
        );
      } else {
        mostrarMensaje(
          texto,
          "error"
        );
      }
    } finally {
      setCargandoRegistro(
        false
      );
    }
  }

  /* =====================================================
     REENVIAR CONFIRMACIÓN
  ===================================================== */

  async function reenviarConfirmacion() {
    if (
      !correoRegistrado ||
      reenviandoCorreo
    ) {
      return;
    }

    try {
      setReenviandoCorreo(
        true
      );

      const siteUrl =
        obtenerSiteUrl();

      const {
        error,
      } =
        await supabase.auth.resend({
          type:
            "signup",

          email:
            correoRegistrado,

          options: {
            emailRedirectTo:
              `${siteUrl}/registro_exitoso`,
          },
        });

      if (error) {
        throw error;
      }

      mostrarMensaje(
        "Te enviamos un nuevo correo de confirmación.",
        "success"
      );
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo reenviar el correo.",
        "error"
      );
    } finally {
      setReenviandoCorreo(
        false
      );
    }
  }

  /* =====================================================
     VALIDAR SOCIAL
  ===================================================== */

  function validarTerminosSocial():
    boolean {
    if (!aceptaTerminos) {
      mostrarMensaje(
        "Acepta los términos y la política de privacidad antes de continuar.",
        "error"
      );

      return false;
    }

    return true;
  }

  /* =====================================================
     GOOGLE
  ===================================================== */

  async function continuarGoogle() {
    if (
      cargandoSocial ||
      !validarTerminosSocial()
    ) {
      return;
    }

    try {
      limpiarMensaje();

      setCargandoSocial(
        "google"
      );

      const siteUrl =
        obtenerSiteUrl();

      const {
        error,
      } =
        await supabase.auth
          .signInWithOAuth({
            provider:
              "google",

            options: {
              /*
                Google vuelve a nuestro Login,
                y Login termina de sincronizar
                el usuario y lo envía al Dashboard.
              */

              redirectTo:
                `${siteUrl}/Login?oauth=1`,

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
        "Google:",
        error
      );

      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo continuar con Google.",
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

  async function continuarMicrosoft() {
    if (
      cargandoSocial ||
      !validarTerminosSocial()
    ) {
      return;
    }

    try {
      limpiarMensaje();

      setCargandoSocial(
        "microsoft"
      );

      const siteUrl =
        obtenerSiteUrl();

      const {
        error,
      } =
        await supabase.auth
          .signInWithOAuth({
            /*
              Microsoft se llama Azure
              dentro de Supabase.
            */

            provider:
              "azure",

            options: {
              redirectTo:
                `${siteUrl}/Login?oauth=1`,

              scopes:
                "email",
            },
          });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        "Microsoft:",
        error
      );

      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo continuar con Microsoft.",
        "error"
      );

      setCargandoSocial(
        null
      );
    }
  }

  /* =====================================================
     INICIO
  ===================================================== */

  useEffect(() => {
    inicializarTema();

    void (async () => {
      const {
        data: {
          session,
        },
      } =
        await supabase.auth
          .getSession();

      /*
        No mostramos Registro a un
        usuario que ya inició sesión.
      */

      if (
        session?.user
      ) {
        router.replace(
          "/Dashboard"
        );
      }
    })();
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
        bg-[#F4F7FF]
        text-[#07142D]
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
            absolute
            -left-[180px]
            -top-[140px]
            h-[620px]
            w-[620px]
            rounded-full
            bg-[#C4D9FF]/55
            blur-3xl
            dark:bg-[#294D7D]/20
          "
        />

        <div
          className="
            absolute
            right-[-170px]
            top-[100px]
            h-[600px]
            w-[600px]
            rounded-full
            bg-[#DDD8FF]/55
            blur-3xl
            dark:bg-[#4B367E]/20
          "
        />

        <div
          className="
            absolute
            bottom-[-250px]
            left-[30%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-[#D7EDFF]/60
            blur-3xl
            dark:bg-[#234562]/15
          "
        />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          relative z-30
          flex min-h-[86px]
          items-center
          justify-between
          px-5
          sm:px-8
          lg:px-12
        "
      >
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <Image
            src="/raccoon.png"
            alt="Raccoon Study"
            width={52}
            height={52}
            priority
            className="h-12 w-12 object-contain"
          />

          <div>
            <h1 className="text-xl font-black">
              Raccoon
              <span className="text-[#3174F5]">
                Study
              </span>
            </h1>

            <p
              className="
                hidden text-[11px]
                font-semibold
                text-[#6E819D]
                sm:block
                dark:text-slate-400
              "
            >
              Estudia más inteligente, no más duro.
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={cambiarTema}
          className="
            flex items-center gap-2
            rounded-full
            border border-[#DCE5F2]
            bg-white/70
            px-4 py-2
            text-sm font-bold
            text-[#566C89]
            backdrop-blur-xl
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
      </header>

      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <div
        className="
          relative z-10
          mx-auto
          grid
          min-h-[calc(100vh-86px)]
          max-w-[1550px]
          items-center
          gap-10
          px-5
          pb-10
          sm:px-8
          lg:grid-cols-[1.1fr_0.9fr]
          lg:px-12
          xl:gap-16
        "
      >
        {/* =====================================================
            IZQUIERDA
        ===================================================== */}

        <section
          className="
            hidden
            min-h-[760px]
            flex-col
            justify-center
            lg:flex
          "
        >
          {/* TEXTO */}

          <div className="relative z-20 max-w-xl">
            <h2
              className="
                text-5xl
                font-black
                leading-[1.04]
                xl:text-[64px]
              "
            >
              Comienza tu
              <br />

              mejor versión
              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-[#2475F4]
                  to-[#50A7F1]
                  bg-clip-text
                  text-transparent
                "
              >
                hoy
              </span>

              <span className="ml-3 text-[#FFD45A]">
                ✦
              </span>
            </h2>

            <p
              className="
                mt-6 max-w-lg
                text-lg
                leading-8
                text-[#30445F]
                dark:text-slate-300
              "
            >
              Únete a Raccoon Study y descubre una
              nueva forma de aprender, organizarte y
              estudiar con inteligencia artificial.
            </p>
          </div>

          {/* ZONA CENTRAL */}

          <div className="relative mt-8 min-h-[430px]">
            {/* BENEFICIOS IZQUIERDOS */}

            <div
              className="
                absolute left-0
                top-3 z-20
                w-[285px]
                space-y-3
              "
            >
              <BeneficioGrande
                icono={
                  <FileText size={20} />
                }
                titulo="Resume cualquier PDF"
                descripcion="Extrae lo más importante al instante."
              />

              <BeneficioGrande
                icono={
                  <BrainCircuit size={20} />
                }
                titulo="Explicaciones con IA"
                descripcion="Entiende temas difíciles fácilmente."
              />

              <BeneficioGrande
                icono={
                  <Trophy size={20} />
                }
                titulo="Organiza y alcanza tus objetivos"
                descripcion="Planifica, estudia y mejora cada día."
              />

              <BeneficioGrande
                icono={
                  <Zap size={20} />
                }
                titulo="Ahorra tiempo"
                descripcion="Estudia de forma más eficiente."
              />
            </div>

            {/* RESPLANDOR */}

            <div
              className="
                absolute
                bottom-5
                right-[3%]
                h-[390px]
                w-[390px]
                rounded-full
                bg-[#D0E3FF]/70
                blur-[2px]
                shadow-[0_0_90px_rgba(83,144,255,0.28)]
                dark:bg-[#28466E]/30
              "
            />

            {/* PDF FLOTANTE */}

            <div
              className="
                absolute
                right-[25%]
                top-[-25px]
                z-30
                flex h-[92px]
                w-[82px]
                rotate-[11deg]
                items-center
                justify-center
                rounded-[20px]
                bg-gradient-to-br
                from-[#8F82FF]
                to-[#6964E9]
                text-2xl
                font-black
                text-white
                shadow-2xl
              "
            >
              PDF
            </div>

            {/* IA FLOTANTE */}

            <div
              className="
                absolute
                right-[1%]
                top-[190px]
                z-30
                flex h-[88px]
                w-[88px]
                rotate-[8deg]
                flex-col
                items-center
                justify-center
                rounded-[25px]
                bg-gradient-to-br
                from-[#2875F1]
                to-[#4CAAF5]
                text-white
                shadow-2xl
              "
            >
              <Sparkles size={23} />

              <span className="mt-1 text-xl font-black">
                IA
              </span>
            </div>

            {/* MAPACHE */}

            <div
              className="
                absolute
                bottom-0
                right-[2%]
                z-20
              "
            >
              <Image
                src="/raccoon.png"
                alt="Raccoon estudiando"
                width={470}
                height={470}
                priority
                className="
                  h-auto
                  w-[420px]
                  object-contain
                  drop-shadow-[0_30px_35px_rgba(32,79,145,0.22)]
                  xl:w-[470px]
                "
              />
            </div>

            {/* LIBROS */}

            <div
              className="
                absolute
                bottom-2
                left-[20%]
                z-30
              "
            >
              <div className="h-8 w-44 -rotate-2 rounded-md bg-[#30466F] shadow-md" />
              <div className="mt-1 h-8 w-48 rotate-1 rounded-md bg-[#4F73AE] shadow-md" />
              <div className="mt-1 h-8 w-44 -rotate-1 rounded-md bg-[#7867BE] shadow-md" />
              <div className="mt-1 h-8 w-48 rounded-md bg-[#355FA0] shadow-md" />
            </div>
          </div>

          {/* TRUST */}

          <div
            className="
              relative z-30
              mt-6
              grid grid-cols-3
              rounded-[22px]
              border border-white/80
              bg-white/70
              p-5
              shadow-lg
              backdrop-blur-xl
              dark:border-slate-700
              dark:bg-slate-800/60
            "
          >
            <TrustItem
              icono={
                <ShieldCheck size={21} />
              }
              titulo="Seguro y privado"
              texto="Tus datos están protegidos"
            />

            <TrustItem
              icono={
                <Users size={21} />
              }
              titulo="Únete a estudiantes"
              texto="Aprende a tu propio ritmo"
            />

            <TrustItem
              icono={
                <Trophy size={21} />
              }
              titulo="Mejora tus resultados"
              texto="Cada día cuenta"
            />
          </div>
        </section>

        {/* =====================================================
            REGISTRO
        ===================================================== */}

        <section
          className="
            mx-auto
            w-full
            max-w-[570px]
            rounded-[30px]
            border border-white/80
            bg-white/92
            p-6
            shadow-[0_25px_80px_rgba(37,75,135,0.16)]
            backdrop-blur-2xl
            dark:border-slate-700
            dark:bg-[#172235]/95
            sm:p-8
            lg:p-9
            xl:p-10
          "
        >
          {registroEnviado ? (
            /* =================================================
               CONFIRMACIÓN ENVIADA
            ================================================= */

            <div className="py-5 text-center">
              <div
                className="
                  mx-auto
                  flex h-20 w-20
                  items-center
                  justify-center
                  rounded-[24px]
                  bg-gradient-to-br
                  from-[#E6F8EE]
                  to-[#E8F1FF]
                  text-green-600
                  shadow-sm
                  dark:from-green-950/40
                  dark:to-[#24324A]
                  dark:text-green-400
                "
              >
                <CheckCircle2 size={38} />
              </div>

              <span
                className="
                  mt-6
                  inline-flex
                  items-center gap-2
                  rounded-full
                  bg-[#EEF3FF]
                  px-4 py-2
                  text-xs font-black
                  text-[#3374CF]
                  dark:bg-[#24324A]
                  dark:text-[#88B9FF]
                "
              >
                <Sparkles size={15} />

                ¡Ya casi terminamos!
              </span>

              <h1
                className="
                  mt-5
                  text-3xl
                  font-black
                  leading-tight
                "
              >
                Raccoon Study
                <br />

                <span className="text-[#3174F5]">
                  te da la bienvenida
                </span>
                🦝
              </h1>

              <p
                className="
                  mx-auto
                  mt-4
                  max-w-md
                  leading-7
                  text-[#657792]
                  dark:text-slate-300
                "
              >
                Enviamos un correo de confirmación a:
              </p>

              <p
                className="
                  mt-2
                  break-all
                  font-black
                  text-[#163C75]
                  dark:text-[#9FC5FF]
                "
              >
                {correoRegistrado}
              </p>

              <div
                className="
                  mt-6
                  rounded-2xl
                  border border-[#DDE7F6]
                  bg-[#F8FBFF]
                  p-5
                  text-left
                  dark:border-slate-700
                  dark:bg-[#111C2D]
                "
              >
                <p className="font-black">
                  Ahora haz lo siguiente:
                </p>

                <div className="mt-4 space-y-3">
                  <Paso
                    numero="1"
                    texto="Abre el correo que acabamos de enviarte."
                  />

                  <Paso
                    numero="2"
                    texto="Pulsa el botón Confirmar mi cuenta."
                  />

                  <Paso
                    numero="3"
                    texto="Regresa a Raccoon Study y comienza a estudiar."
                  />
                </div>
              </div>

              {mensaje && (
                <Mensaje
                  texto={mensaje}
                  tipo={tipoMensaje}
                />
              )}

              <button
                type="button"
                onClick={() =>
                  void reenviarConfirmacion()
                }
                disabled={reenviandoCorreo}
                className="
                  mt-6
                  flex h-[54px]
                  w-full
                  items-center
                  justify-center gap-2
                  rounded-xl
                  border border-[#CEDCF0]
                  bg-white
                  font-black
                  text-[#3374CF]
                  transition
                  hover:bg-[#F4F8FF]
                  disabled:opacity-60
                  dark:border-slate-600
                  dark:bg-[#111C2D]
                  dark:text-[#91BCFF]
                "
              >
                {reenviandoCorreo ? (
                  <>
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />

                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail size={19} />

                    Reenviar correo
                  </>
                )}
              </button>

              <Link
                href="/Login"
                className="
                  mt-3
                  flex h-[54px]
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-r
                  from-[#2468F2]
                  to-[#2E9CF1]
                  font-black
                  text-white
                  shadow-lg
                "
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              {/* ICONO */}

              <div
                className="
                  mx-auto
                  flex h-[74px] w-[74px]
                  items-center
                  justify-center
                  rounded-full
                  border-8
                  border-[#F2F5FF]
                  bg-[#E8EEFF]
                  text-[#3174F5]
                  dark:border-slate-800
                  dark:bg-[#24324A]
                  dark:text-[#91BCFF]
                "
              >
                <UserPlus size={31} />
              </div>

              <div className="mt-5 text-center">
                <h1 className="text-3xl font-black">
                  Crear cuenta
                </h1>

                <p
                  className="
                    mt-2
                    text-sm
                    text-[#71809A]
                    dark:text-slate-400
                  "
                >
                  Es rápido, fácil y gratis 🦝
                </p>
              </div>

              {/* MENSAJE */}

              {mensaje && (
                <Mensaje
                  texto={mensaje}
                  tipo={tipoMensaje}
                />
              )}

              {/* FORM */}

              <form
                onSubmit={crearCuenta}
                className="mt-7"
              >
                {/* NOMBRE */}

                <label className="block">
                  <span className="text-sm font-black">
                    Nombre completo
                  </span>

                  <div
                    className="
                      mt-2
                      flex h-[56px]
                      items-center gap-3
                      rounded-xl
                      border border-[#D7E0EC]
                      bg-white
                      px-4
                      transition
                      focus-within:border-[#3174F5]
                      focus-within:ring-4
                      focus-within:ring-[#3174F5]/10
                      dark:border-slate-600
                      dark:bg-[#111C2D]
                    "
                  >
                    <User
                      size={19}
                      className="text-[#8795AA]"
                    />

                    <input
                      type="text"
                      value={nombre}
                      onChange={(evento) =>
                        setNombre(
                          evento.target.value
                        )
                      }
                      autoComplete="name"
                      placeholder="Tu nombre completo"
                      maxLength={80}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>

                {/* EMAIL */}

                <label className="mt-5 block">
                  <span className="text-sm font-black">
                    Correo electrónico
                  </span>

                  <div
                    className="
                      mt-2
                      flex h-[56px]
                      items-center gap-3
                      rounded-xl
                      border border-[#D7E0EC]
                      bg-white
                      px-4
                      transition
                      focus-within:border-[#3174F5]
                      focus-within:ring-4
                      focus-within:ring-[#3174F5]/10
                      dark:border-slate-600
                      dark:bg-[#111C2D]
                    "
                  >
                    <Mail
                      size={19}
                      className="text-[#8795AA]"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(evento) =>
                        setEmail(
                          evento.target.value
                        )
                      }
                      autoComplete="email"
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>

                {/* PASSWORD */}

                <label className="mt-5 block">
                  <span className="text-sm font-black">
                    Contraseña
                  </span>

                  <div
                    className="
                      mt-2
                      flex h-[56px]
                      items-center gap-3
                      rounded-xl
                      border border-[#D7E0EC]
                      bg-white
                      px-4
                      transition
                      focus-within:border-[#3174F5]
                      focus-within:ring-4
                      focus-within:ring-[#3174F5]/10
                      dark:border-slate-600
                      dark:bg-[#111C2D]
                    "
                  >
                    <Lock
                      size={19}
                      className="text-[#8795AA]"
                    />

                    <input
                      type={
                        mostrarPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(evento) =>
                        setPassword(
                          evento.target.value
                        )
                      }
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      className="w-full flex-1 bg-transparent text-sm outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarPassword(
                          !mostrarPassword
                        )
                      }
                      className="text-[#71809A]"
                    >
                      {mostrarPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>

                  {password && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <CheckCircle2
                        size={14}
                        className={
                          passwordMinima
                            ? "text-green-500"
                            : "text-[#9BA8BA]"
                        }
                      />

                      <span
                        className={
                          passwordMinima
                            ? "text-green-600"
                            : "text-[#8492A7]"
                        }
                      >
                        Mínimo 8 caracteres
                      </span>
                    </div>
                  )}
                </label>

                {/* CONFIRMAR */}

                <label className="mt-5 block">
                  <span className="text-sm font-black">
                    Confirmar contraseña
                  </span>

                  <div
                    className="
                      mt-2
                      flex h-[56px]
                      items-center gap-3
                      rounded-xl
                      border border-[#D7E0EC]
                      bg-white
                      px-4
                      transition
                      focus-within:border-[#3174F5]
                      focus-within:ring-4
                      focus-within:ring-[#3174F5]/10
                      dark:border-slate-600
                      dark:bg-[#111C2D]
                    "
                  >
                    <Lock
                      size={19}
                      className="text-[#8795AA]"
                    />

                    <input
                      type={
                        mostrarConfirmacion
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
                      autoComplete="new-password"
                      placeholder="Repite tu contraseña"
                      className="w-full flex-1 bg-transparent text-sm outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarConfirmacion(
                          !mostrarConfirmacion
                        )
                      }
                      className="text-[#71809A]"
                    >
                      {mostrarConfirmacion ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>

                  {confirmarPassword && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <CheckCircle2
                        size={14}
                        className={
                          passwordsCoinciden
                            ? "text-green-500"
                            : "text-red-400"
                        }
                      />

                      <span
                        className={
                          passwordsCoinciden
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {passwordsCoinciden
                          ? "Las contraseñas coinciden"
                          : "Las contraseñas no coinciden"}
                      </span>
                    </div>
                  )}
                </label>

                {/* TÉRMINOS */}

                <label
                  className="
                    mt-5
                    flex cursor-pointer
                    items-start gap-3
                    text-sm
                    leading-6
                    text-[#64758F]
                    dark:text-slate-300
                  "
                >
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(evento) =>
                      setAceptaTerminos(
                        evento.target.checked
                      )
                    }
                    className="
                      mt-1
                      h-4 w-4
                      shrink-0
                      accent-[#3174F5]
                    "
                  />

                  <span>
                    Acepto los{" "}
                    <strong className="text-[#3374CF]">
                      términos y condiciones
                    </strong>{" "}
                    y la{" "}
                    <strong className="text-[#3374CF]">
                      política de privacidad
                    </strong>
                    .
                  </span>
                </label>

                {/* CREAR */}

                <button
                  type="submit"
                  disabled={
                    cargandoRegistro ||
                    cargandoSocial !==
                      null
                  }
                  className="
                    mt-6
                    flex h-[58px]
                    w-full
                    items-center
                    justify-center gap-3
                    rounded-xl
                    bg-gradient-to-r
                    from-[#2169F2]
                    via-[#277AF4]
                    to-[#289BEF]
                    font-black
                    text-white
                    shadow-[0_10px_25px_rgba(35,109,241,0.26)]
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-[0_15px_30px_rgba(35,109,241,0.30)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {cargandoRegistro ? (
                    <>
                      <LoaderCircle
                        size={20}
                        className="animate-spin"
                      />

                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear cuenta

                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              {/* DIVISOR */}

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#E1E7EF] dark:bg-slate-700" />

                <span className="text-xs text-[#8A97AA]">
                  o continúa con
                </span>

                <div className="h-px flex-1 bg-[#E1E7EF] dark:bg-slate-700" />
              </div>

              {/* GOOGLE */}

              <button
                type="button"
                onClick={() =>
                  void continuarGoogle()
                }
                disabled={
                  cargandoRegistro ||
                  cargandoSocial !==
                    null
                }
                className="
                  flex h-[56px]
                  w-full
                  items-center
                  justify-center gap-3
                  rounded-xl
                  border border-[#DCE3EC]
                  bg-white
                  font-black
                  text-[#26354D]
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:bg-[#FAFBFD]
                  hover:shadow-md
                  disabled:opacity-60
                  dark:border-slate-600
                  dark:bg-[#111C2D]
                  dark:text-white
                "
              >
                {cargandoSocial ===
                "google" ? (
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
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

              {/* MICROSOFT */}

              <button
                type="button"
                onClick={() =>
                  void continuarMicrosoft()
                }
                disabled={
                  cargandoRegistro ||
                  cargandoSocial !==
                    null
                }
                className="
                  mt-3
                  flex h-[56px]
                  w-full
                  items-center
                  justify-center gap-3
                  rounded-xl
                  border border-[#DCE3EC]
                  bg-white
                  font-black
                  text-[#26354D]
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:bg-[#FAFBFD]
                  hover:shadow-md
                  disabled:opacity-60
                  dark:border-slate-600
                  dark:bg-[#111C2D]
                  dark:text-white
                "
              >
                {cargandoSocial ===
                "microsoft" ? (
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
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

              {/* LOGIN */}

              <p
                className="
                  mt-7
                  text-center
                  text-sm
                  text-[#71809A]
                  dark:text-slate-400
                "
              >
                ¿Ya tienes una cuenta?

                <Link
                  href="/Login"
                  className="
                    ml-2
                    font-black
                    text-[#3374CF]
                    hover:underline
                  "
                >
                  Inicia sesión
                </Link>
              </p>
            </>
          )}
        </section>
      </div>

      {/* FOOTER */}

      <footer
        className="
          relative z-20
          pb-6
          text-center
          text-xs
          text-[#8896AA]
          dark:text-slate-500
        "
      >
        © 2026 Raccoon Study. Todos los derechos reservados.
      </footer>
    </main>
  );
}

/* =====================================================
   MENSAJE
===================================================== */

function Mensaje({
  texto,
  tipo,
}: {
  texto: string;
  tipo: TipoMensaje;
}) {
  return (
    <div
      className={`
        mt-5
        flex items-start gap-3
        rounded-xl
        border
        p-3
        text-sm
        font-semibold
        ${
          tipo === "error"
            ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
            : tipo === "success"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300"
              : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
        }
      `}
    >
      {tipo === "success" ? (
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
        {texto}
      </span>
    </div>
  );
}

/* =====================================================
   BENEFICIO GRANDE
===================================================== */

function BeneficioGrande({
  icono,
  titulo,
  descripcion,
}: {
  icono: ReactNode;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div
      className="
        flex items-center
        gap-3
        rounded-2xl
        border border-white/80
        bg-white/75
        p-4
        shadow-sm
        backdrop-blur-xl
        dark:border-slate-700
        dark:bg-slate-800/60
      "
    >
      <div
        className="
          flex h-11 w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#EAF2FF]
          text-[#3174F5]
          dark:bg-[#24324A]
          dark:text-[#91BCFF]
        "
      >
        {icono}
      </div>

      <div>
        <p className="text-sm font-black">
          {titulo}
        </p>

        <p
          className="
            mt-1
            text-[11px]
            leading-4
            text-[#71809A]
            dark:text-slate-400
          "
        >
          {descripcion}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   TRUST
===================================================== */

function TrustItem({
  icono,
  titulo,
  texto,
}: {
  icono: ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <div
      className="
        flex items-center
        gap-3
        border-r
        border-[#E3E8F1]
        px-4
        last:border-r-0
        dark:border-slate-700
      "
    >
      <div
        className="
          flex h-10 w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#EAF2FF]
          text-[#3174F5]
          dark:bg-[#24324A]
          dark:text-[#91BCFF]
        "
      >
        {icono}
      </div>

      <div>
        <p className="text-xs font-black">
          {titulo}
        </p>

        <p className="mt-1 text-[10px] text-[#8592A6]">
          {texto}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   PASO
===================================================== */

function Paso({
  numero,
  texto,
}: {
  numero: string;
  texto: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="
          flex h-7 w-7
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#3174F5]
          text-xs
          font-black
          text-white
        "
      >
        {numero}
      </span>

      <p
        className="
          pt-1
          text-sm
          leading-5
          text-[#61738D]
          dark:text-slate-300
        "
      >
        {texto}
      </p>
    </div>
  );
}