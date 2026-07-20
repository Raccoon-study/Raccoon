"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

/* =====================================================
   TIPOS DE GOOGLE BOOKS
===================================================== */

interface GoogleBooksViewerInstance {
  load: (
    identifiers: string | string[],
    notFoundCallback?: () => void,
    successCallback?: () => void
  ) => void;

  nextPage: () => void;
  previousPage: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resize: () => void;
  getPageNumber: () => string;
  isLoaded?: () => boolean;
}

interface GoogleBooksNamespace {
  load: (
    opciones?: {
      language?: string;
    }
  ) => void;

  setOnLoadCallback: (
    callback: () => void
  ) => void;

  DefaultViewer: new (
    elemento: HTMLElement
  ) => GoogleBooksViewerInstance;
}

declare global {
  interface Window {
    google?: {
      books?: GoogleBooksNamespace;
    };
  }
}

/* =====================================================
   CARGAR API
===================================================== */

let promesaGoogleBooks:
  Promise<void> | null = null;

function esperarGoogleBooks(
  intentos = 100
): Promise<void> {
  return new Promise(
    (resolver, rechazar) => {
      let intento = 0;

      const intervalo =
        window.setInterval(() => {
          intento++;

          if (
            window.google?.books
              ?.DefaultViewer
          ) {
            window.clearInterval(
              intervalo
            );

            resolver();
            return;
          }

          if (intento >= intentos) {
            window.clearInterval(
              intervalo
            );

            rechazar(
              new Error(
                "Google Books tardó demasiado en cargar."
              )
            );
          }
        }, 50);
    }
  );
}

function inicializarGoogleBooks(): Promise<void> {
  return new Promise(
    (resolver, rechazar) => {
      const books =
        window.google?.books;

      if (!books) {
        rechazar(
          new Error(
            "No se encontró el visor de Google Books."
          )
        );

        return;
      }

      try {
        books.load({
          language: "es",
        });

        let resuelto = false;

        const terminar = () => {
          if (resuelto) {
            return;
          }

          resuelto = true;
          resolver();
        };

        books.setOnLoadCallback(
          terminar
        );

        window.setTimeout(() => {
          if (
            window.google?.books
              ?.DefaultViewer
          ) {
            terminar();
          }
        }, 1500);
      } catch (error) {
        rechazar(error);
      }
    }
  );
}

function cargarGoogleBooks(): Promise<void> {
  if (
    typeof window === "undefined"
  ) {
    return Promise.reject(
      new Error(
        "El visor solo funciona en el navegador."
      )
    );
  }

  if (
    window.google?.books
      ?.DefaultViewer
  ) {
    return Promise.resolve();
  }

  if (promesaGoogleBooks) {
    return promesaGoogleBooks;
  }

  promesaGoogleBooks =
    new Promise<void>(
      (resolver, rechazar) => {
        const scriptExistente =
          document.querySelector<HTMLScriptElement>(
            'script[data-raccoon-books="true"]'
          );

        const activar = async () => {
          try {
            await esperarGoogleBooks();

            await inicializarGoogleBooks();

            resolver();
          } catch (error) {
            promesaGoogleBooks =
              null;

            rechazar(error);
          }
        };

        if (scriptExistente) {
          void activar();
          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://www.google.com/books/jsapi.js";

        script.async = true;

        script.dataset.raccoonBooks =
          "true";

        script.onload = () => {
          void activar();
        };

        script.onerror = () => {
          promesaGoogleBooks =
            null;

          rechazar(
            new Error(
              "No se pudo cargar el lector de Google Books."
            )
          );
        };

        document.head.appendChild(
          script
        );
      }
    );

  return promesaGoogleBooks;
}

/* =====================================================
   COMPONENTE
===================================================== */

export default function GoogleBooksViewer({
  libroId,
  titulo,
  isbn,
}: {
  libroId: string;
  titulo: string;
  isbn?: string;
}) {
  const contenedorRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const visorRef =
    useRef<GoogleBooksViewerInstance | null>(
      null
    );

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    cargado,
    setCargado,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    paginaActual,
    setPaginaActual,
  ] = useState("");

  const actualizarPagina = () => {
    window.setTimeout(() => {
      try {
        const pagina =
          visorRef.current?.getPageNumber();

        setPaginaActual(
          pagina || ""
        );
      } catch {
        setPaginaActual("");
      }
    }, 250);
  };

  const iniciarVisor = async () => {
    try {
      setCargando(true);
      setCargado(false);
      setError("");
      setPaginaActual("");

      await cargarGoogleBooks();

      if (
        !contenedorRef.current ||
        !window.google?.books
          ?.DefaultViewer
      ) {
        throw new Error(
          "No se pudo preparar el lector."
        );
      }

      contenedorRef.current.innerHTML =
        "";

      const visor =
        new window.google.books.DefaultViewer(
          contenedorRef.current
        );

      visorRef.current = visor;

      const identificadores:
        string[] = [
        libroId,
      ];

      if (isbn) {
        identificadores.push(
          `ISBN:${isbn}`
        );
      }

      visor.load(
        identificadores,

        () => {
          setCargando(false);
          setCargado(false);

          setError(
            "Google Books no permite mostrar este libro dentro de la aplicación."
          );
        },

        () => {
          setCargando(false);
          setCargado(true);
          setError("");

          actualizarPagina();
        }
      );
    } catch (errorVisor) {
      setCargando(false);
      setCargado(false);

      setError(
        errorVisor instanceof Error
          ? errorVisor.message
          : "No se pudo abrir el libro."
      );
    }
  };

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      if (!activo) {
        return;
      }

      await iniciarVisor();
    };

    void cargar();

    return () => {
      activo = false;
      visorRef.current = null;

      if (
        contenedorRef.current
      ) {
        contenedorRef.current.innerHTML =
          "";
      }
    };
  }, [libroId, isbn]);

  useEffect(() => {
    const elemento =
      contenedorRef.current;

    if (!elemento) {
      return;
    }

    const observador =
      new ResizeObserver(() => {
        try {
          visorRef.current?.resize();
        } catch {
          // El visor todavía no está listo.
        }
      });

    observador.observe(elemento);

    return () => {
      observador.disconnect();
    };
  }, []);

  const paginaAnterior = () => {
    try {
      visorRef.current?.previousPage();
      actualizarPagina();
    } catch {
      // No existe una página anterior.
    }
  };

  const paginaSiguiente = () => {
    try {
      visorRef.current?.nextPage();
      actualizarPagina();
    } catch {
      // No existe una página siguiente.
    }
  };

  const acercar = () => {
    try {
      visorRef.current?.zoomIn();
    } catch {
      // El visor todavía no está listo.
    }
  };

  const alejar = () => {
    try {
      visorRef.current?.zoomOut();
    } catch {
      // El visor todavía no está listo.
    }
  };

  const ajustar = () => {
    try {
      visorRef.current?.resize();
    } catch {
      // El visor todavía no está listo.
    }
  };

  return (
    <div className="flex h-full min-h-[580px] w-full flex-col bg-[#E9EEF5] dark:bg-[#0F1725]">
      {/* CONTROLES */}

      <div className="flex min-h-[58px] flex-wrap items-center justify-between gap-3 border-b border-[#DDE6F0] bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#151F30] sm:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={paginaAnterior}
            disabled={!cargado}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F5FA] text-[#506C88] transition hover:bg-[#EAF1FF] hover:text-[#1769E0] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200"
            aria-label="Página anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={paginaSiguiente}
            disabled={!cargado}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F5FA] text-[#506C88] transition hover:bg-[#EAF1FF] hover:text-[#1769E0] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200"
            aria-label="Página siguiente"
          >
            <ChevronRight size={20} />
          </button>

          <div className="hidden h-7 w-px bg-[#DDE6F0] dark:bg-slate-700 sm:block" />

          <button
            type="button"
            onClick={alejar}
            disabled={!cargado}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F5FA] text-[#506C88] transition hover:bg-[#EDE9FF] hover:text-[#7652D9] disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200"
            aria-label="Alejar"
          >
            <Minus size={18} />
          </button>

          <button
            type="button"
            onClick={acercar}
            disabled={!cargado}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F5FA] text-[#506C88] transition hover:bg-[#EDE9FF] hover:text-[#7652D9] disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200"
            aria-label="Acercar"
          >
            <Plus size={18} />
          </button>

          <button
            type="button"
            onClick={ajustar}
            disabled={!cargado}
            className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#F1F5FA] text-[#506C88] transition hover:bg-[#EDE9FF] hover:text-[#7652D9] disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200 sm:flex"
            aria-label="Ajustar visor"
          >
            <Maximize2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {paginaActual && (
            <span className="rounded-xl bg-[#F1F5FA] px-4 py-2 text-xs font-black text-[#506C88] dark:bg-slate-700 dark:text-slate-200">
              Página {paginaActual}
            </span>
          )}

          <span className="hidden items-center gap-2 text-xs font-bold text-[#6085A5] sm:flex dark:text-slate-400">
            <BookOpen size={15} />
            Lector Raccoon
          </span>
        </div>
      </div>

      {/* VISOR */}

      <div className="relative min-h-0 flex-1">
        {cargando && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#F8FBFE] px-6 text-center dark:bg-[#101827]">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#EAF8FF] to-[#EFEAFF] dark:from-[#1C304D] dark:to-[#28243E]">
              <LoaderCircle
                size={38}
                className="animate-spin text-[#7652D9]"
              />
            </div>

            <h3 className="mt-5 text-xl font-black">
              Preparando tu libro
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#6085A5] dark:text-slate-400">
              Estamos cargando la vista previa de{" "}
              <strong>{titulo}</strong>.
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#F8FBFE] p-6 text-center dark:bg-[#101827]">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-red-50 text-red-500 dark:bg-red-950/30">
              <AlertCircle size={38} />
            </div>

            <h3 className="mt-5 text-xl font-black">
              Vista interna no disponible
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#6085A5] dark:text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void iniciarVisor()
              }
              className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] px-6 py-3 font-black text-white"
            >
              <RotateCcw size={18} />
              Intentar nuevamente
            </button>
          </div>
        )}

        <div
          ref={contenedorRef}
          className={`
            h-full
            min-h-[520px]
            w-full
            transition-opacity
            duration-300
            ${
              cargado
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        />
      </div>
    </div>
  );
}