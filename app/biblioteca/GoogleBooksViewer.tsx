"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

/* =====================================================
   TIPOS
===================================================== */

interface GoogleBooksViewerInstance {
  load: (
    identifiers:
      | string
      | string[],
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

  DefaultViewer?: new (
    elemento: HTMLElement
  ) => GoogleBooksViewerInstance;
}

type WindowGoogleBooks =
  Window & {
    google?: {
      books?:
        GoogleBooksNamespace;
    };
  };

/* =====================================================
   CONSTANTES
===================================================== */

const GOOGLE_BOOKS_SCRIPT =
  "https://www.google.com/books/jsapi.js";

let promesaGoogleBooks:
  Promise<GoogleBooksNamespace> | null =
  null;

/* =====================================================
   OBTENER GOOGLE BOOKS
===================================================== */

function obtenerGoogleBooks():
  GoogleBooksNamespace | undefined {
  if (
    typeof window ===
    "undefined"
  ) {
    return undefined;
  }

  return (
    window as
      WindowGoogleBooks
  ).google?.books;
}

/* =====================================================
   ESPERAR SOLO AL LOADER

   IMPORTANTE:
   Aquí NO esperamos DefaultViewer.

   Primero debe existir:
   google.books.load()
===================================================== */

function esperarLoaderGoogleBooks(
  intentos = 160
): Promise<GoogleBooksNamespace> {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      let intento = 0;

      const revisar =
        () => {
          const books =
            obtenerGoogleBooks();

          if (
            books &&
            typeof books.load ===
              "function" &&
            typeof books.setOnLoadCallback ===
              "function"
          ) {
            resolve(
              books
            );

            return;
          }

          intento += 1;

          if (
            intento >=
            intentos
          ) {
            reject(
              new Error(
                "No se pudo iniciar Google Books."
              )
            );

            return;
          }

          window.setTimeout(
            revisar,
            50
          );
        };

      revisar();
    }
  );
}

/* =====================================================
   INICIALIZAR EMBEDDED VIEWER

   ORDEN:

   google.books.load()
          ↓
   setOnLoadCallback()
          ↓
   DefaultViewer
===================================================== */

function inicializarEmbeddedViewer(
  books: GoogleBooksNamespace
): Promise<GoogleBooksNamespace> {
  /*
    Si ya fue cargado,
    terminamos inmediatamente.
  */

  if (
    typeof books.DefaultViewer ===
    "function"
  ) {
    return Promise.resolve(
      books
    );
  }

  return new Promise(
    (
      resolve,
      reject
    ) => {
      let terminado =
        false;

      const finalizar =
        () => {
          if (
            terminado
          ) {
            return;
          }

          const booksListos =
            obtenerGoogleBooks();

          if (
            typeof booksListos
              ?.DefaultViewer !==
            "function"
          ) {
            return;
          }

          terminado =
            true;

          window.clearTimeout(
            timeout
          );

          resolve(
            booksListos
          );
        };

      const timeout =
        window.setTimeout(
          () => {
            if (
              terminado
            ) {
              return;
            }

            terminado =
              true;

            reject(
              new Error(
                "El lector de Google Books no terminó de inicializarse."
              )
            );
          },
          15000
        );

      try {
        /*
          Google recomienda cargar
          primero la API.
        */

        books.load({
          language:
            "es",
        });

        /*
          Y después esperar a que
          Embedded Viewer esté listo.
        */

        books.setOnLoadCallback(
          finalizar
        );

        /*
          Respaldo por si la API ya
          terminó de cargar antes de
          registrar el callback.
        */

        const comprobar =
          () => {
            if (
              terminado
            ) {
              return;
            }

            const actual =
              obtenerGoogleBooks();

            if (
              typeof actual
                ?.DefaultViewer ===
              "function"
            ) {
              finalizar();

              return;
            }

            window.setTimeout(
              comprobar,
              100
            );
          };

        comprobar();
      } catch (
        error
      ) {
        terminado =
          true;

        window.clearTimeout(
          timeout
        );

        reject(
          error instanceof
            Error
            ? error
            : new Error(
                "No se pudo inicializar Google Books."
              )
        );
      }
    }
  );
}

/* =====================================================
   CARGAR SCRIPT
===================================================== */

function cargarGoogleBooks():
  Promise<GoogleBooksNamespace> {
  if (
    typeof window ===
    "undefined"
  ) {
    return Promise.reject(
      new Error(
        "Google Books solo puede utilizarse en el navegador."
      )
    );
  }

  /*
    Ya completamente cargado.
  */

  const existente =
    obtenerGoogleBooks();

  if (
    typeof existente
      ?.DefaultViewer ===
    "function"
  ) {
    return Promise.resolve(
      existente
    );
  }

  /*
    Ya existe una carga
    global en curso.
  */

  if (
    promesaGoogleBooks
  ) {
    return promesaGoogleBooks;
  }

  promesaGoogleBooks =
    new Promise<
      GoogleBooksNamespace
    >(
      (
        resolve,
        reject
      ) => {
        const comenzar =
          async () => {
            try {
              /*
                Esperamos a google.books.load,
                NO a DefaultViewer.
              */

              const books =
                await esperarLoaderGoogleBooks();

              const listo =
                await inicializarEmbeddedViewer(
                  books
                );

              resolve(
                listo
              );
            } catch (
              error
            ) {
              promesaGoogleBooks =
                null;

              reject(
                error
              );
            }
          };

        /*
          Puede existir porque Next.js
          hizo una recarga en caliente.
        */

        const scriptExistente =
          document.querySelector<HTMLScriptElement>(
            'script[data-raccoon-google-books="true"]'
          ) ||
          document.querySelector<HTMLScriptElement>(
            'script[src*="google.com/books/jsapi.js"]'
          );

        if (
          scriptExistente
        ) {
          /*
            Si google.books ya existe,
            continuamos directamente.
          */

          if (
            obtenerGoogleBooks()
          ) {
            void comenzar();

            return;
          }

          /*
            El script existe pero todavía
            está descargándose.
          */

          scriptExistente.addEventListener(
            "load",
            () => {
              void comenzar();
            },
            {
              once: true,
            }
          );

          scriptExistente.addEventListener(
            "error",
            () => {
              promesaGoogleBooks =
                null;

              reject(
                new Error(
                  "No se pudo descargar Google Books."
                )
              );
            },
            {
              once: true,
            }
          );

          /*
            También empezamos a comprobar,
            porque el evento load pudo haber
            ocurrido antes.
          */

          void comenzar();

          return;
        }

        /*
          Primera carga.
        */

        const script =
          document.createElement(
            "script"
          );

        script.src =
          GOOGLE_BOOKS_SCRIPT;

        script.async =
          true;

        script.defer =
          true;

        script.dataset
          .raccoonGoogleBooks =
          "true";

        script.onload =
          () => {
            void comenzar();
          };

        script.onerror =
          () => {
            promesaGoogleBooks =
              null;

            reject(
              new Error(
                "No se pudo descargar el lector de Google Books."
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
   ISBN
===================================================== */

function limpiarISBN(
  isbn?: string
): string {
  if (
    !isbn
  ) {
    return "";
  }

  return isbn
    .replace(
      /[^0-9Xx]/g,
      ""
    )
    .trim();
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

  /*
    Nos permite ignorar una carga vieja
    si el usuario cambia de libro.
  */

  const identificadorCargaRef =
    useRef(0);

  const [
    cargando,
    setCargando,
  ] = useState(
    true
  );

  const [
    cargado,
    setCargado,
  ] = useState(
    false
  );

  const [
    error,
    setError,
  ] = useState(
    ""
  );

  const [
    paginaActual,
    setPaginaActual,
  ] = useState(
    ""
  );

  /* =====================================================
     ENLACE GOOGLE BOOKS
  ===================================================== */

  const enlaceGoogle =
    libroId.trim()
      ? `https://books.google.com/books?id=${encodeURIComponent(
          libroId.trim()
        )}`
      : isbn
        ? `https://books.google.com/books?vid=ISBN${encodeURIComponent(
            limpiarISBN(
              isbn
            )
          )}`
        : "https://books.google.com/";

  /* =====================================================
     PÁGINA ACTUAL
  ===================================================== */

  const actualizarPagina =
    useCallback(
      () => {
        window.setTimeout(
          () => {
            try {
              const pagina =
                visorRef.current
                  ?.getPageNumber();

              setPaginaActual(
                pagina ||
                  ""
              );
            } catch {
              setPaginaActual(
                ""
              );
            }
          },
          250
        );
      },
      []
    );

  /* =====================================================
     INICIAR VISOR
  ===================================================== */

  const iniciarVisor =
    useCallback(
      async () => {
        const cargaActual =
          ++identificadorCargaRef.current;

        try {
          setCargando(
            true
          );

          setCargado(
            false
          );

          setError(
            ""
          );

          setPaginaActual(
            ""
          );

          visorRef.current =
            null;

          /*
            Limpiar cualquier visor
            anterior.
          */

          if (
            contenedorRef.current
          ) {
            contenedorRef.current.innerHTML =
              "";
          }

          const id =
            libroId.trim();

          const isbnLimpio =
            limpiarISBN(
              isbn
            );

          if (
            !id &&
            !isbnLimpio
          ) {
            throw new Error(
              "Este libro no tiene un identificador válido."
            );
          }

          /*
            1. Cargar correctamente
               Google Books.
          */

          const books =
            await cargarGoogleBooks();

          /*
            El usuario pudo cerrar o
            cambiar de libro mientras
            esperaba.
          */

          if (
            cargaActual !==
            identificadorCargaRef.current
          ) {
            return;
          }

          const contenedor =
            contenedorRef.current;

          const Constructor =
            books.DefaultViewer;

          if (
            !contenedor ||
            typeof Constructor !==
              "function"
          ) {
            throw new Error(
              "Google Books no pudo preparar el lector."
            );
          }

          contenedor.innerHTML =
            "";

          /*
            2. Crear DefaultViewer SOLO
               después del callback.
          */

          const visor =
            new Constructor(
              contenedor
            );

          visorRef.current =
            visor;

          /*
            3. Google permite enviar
               varios identificadores.

               Probamos:
               - Volume ID
               - ISBN
               - URL de Google Books
          */

          const identificadores:
            string[] = [];

          if (
            id
          ) {
            identificadores.push(
              id
            );

            identificadores.push(
              `https://books.google.com/books?id=${id}`
            );
          }

          if (
            isbnLimpio
          ) {
            identificadores.push(
              `ISBN:${isbnLimpio}`
            );
          }

          const unicos =
            [
              ...new Set(
                identificadores
              ),
            ];

          if (
            unicos.length ===
            0
          ) {
            throw new Error(
              "No encontramos un identificador para este libro."
            );
          }

          /*
            4. Cargar el libro.
          */

          visor.load(
            unicos,

            /*
              NO SE PUDO MOSTRAR
            */

            () => {
              if (
                cargaActual !==
                identificadorCargaRef.current
              ) {
                return;
              }

              setCargando(
                false
              );

              setCargado(
                false
              );

              setError(
                "Google Books encontró el libro, pero esta vista previa no puede mostrarse dentro de Raccoon Study."
              );
            },

            /*
              ÉXITO
            */

            () => {
              if (
                cargaActual !==
                identificadorCargaRef.current
              ) {
                return;
              }

              setCargando(
                false
              );

              setCargado(
                true
              );

              setError(
                ""
              );

              actualizarPagina();

              /*
                Ajustar después de que el
                modal ya tenga tamaño.
              */

              window.setTimeout(
                () => {
                  try {
                    visor.resize();
                  } catch {
                    // Ya cargará con su tamaño actual.
                  }
                },
                250
              );
            }
          );
        } catch (
          errorVisor
        ) {
          if (
            cargaActual !==
            identificadorCargaRef.current
          ) {
            return;
          }

          console.error(
            "GoogleBooksViewer:",
            errorVisor
          );

          setCargando(
            false
          );

          setCargado(
            false
          );

          setError(
            errorVisor instanceof
              Error
              ? errorVisor.message
              : "No se pudo abrir el libro."
          );
        }
      },
      [
        libroId,
        isbn,
        actualizarPagina,
      ]
    );

  /* =====================================================
     CARGAR CUANDO CAMBIA EL LIBRO
  ===================================================== */

  useEffect(() => {
    void iniciarVisor();

    return () => {
      /*
        Invalidar callbacks
        del libro anterior.
      */

      identificadorCargaRef.current +=
        1;

      visorRef.current =
        null;

      if (
        contenedorRef.current
      ) {
        contenedorRef.current.innerHTML =
          "";
      }
    };
  }, [
    iniciarVisor,
  ]);

  /* =====================================================
     RESPONSIVE
  ===================================================== */

  useEffect(() => {
    const elemento =
      contenedorRef.current;

    if (
      !elemento ||
      typeof ResizeObserver ===
        "undefined"
    ) {
      return;
    }

    const observador =
      new ResizeObserver(
        () => {
          try {
            visorRef.current
              ?.resize();
          } catch {
            // Todavía no está listo.
          }
        }
      );

    observador.observe(
      elemento
    );

    return () => {
      observador.disconnect();
    };
  }, []);

  /* =====================================================
     CONTROLES
  ===================================================== */

  function paginaAnterior() {
    try {
      visorRef.current
        ?.previousPage();

      actualizarPagina();
    } catch {
      // Sin página anterior.
    }
  }

  function paginaSiguiente() {
    try {
      visorRef.current
        ?.nextPage();

      actualizarPagina();
    } catch {
      // Sin página siguiente.
    }
  }

  function acercar() {
    try {
      visorRef.current
        ?.zoomIn();
    } catch {
      // Visor no listo.
    }
  }

  function alejar() {
    try {
      visorRef.current
        ?.zoomOut();
    } catch {
      // Visor no listo.
    }
  }

  function ajustar() {
    try {
      visorRef.current
        ?.resize();
    } catch {
      // Visor no listo.
    }
  }

  /* =====================================================
     JSX
  ===================================================== */

  return (
    <div className="flex h-full min-h-[580px] w-full min-w-0 flex-col overflow-hidden bg-[#E9EEF5] dark:bg-[#0F1725]">
      {/* =================================================
          CONTROLES
      ================================================= */}

      <div className="flex min-h-[58px] flex-wrap items-center justify-between gap-2 border-b border-[#DDE6F0] bg-white px-2 py-2 dark:border-slate-700 dark:bg-[#151F30] sm:gap-3 sm:px-5">
        {/* IZQUIERDA */}

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={
              paginaAnterior
            }
            disabled={
              !cargado
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F5FA] text-[#506C88] transition hover:bg-[#EAF1FF] hover:text-[#1769E0] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200 sm:h-10 sm:w-10"
            aria-label="Página anterior"
          >
            <ChevronLeft
              size={20}
            />
          </button>

          <button
            type="button"
            onClick={
              paginaSiguiente
            }
            disabled={
              !cargado
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F5FA] text-[#506C88] transition hover:bg-[#EAF1FF] hover:text-[#1769E0] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200 sm:h-10 sm:w-10"
            aria-label="Página siguiente"
          >
            <ChevronRight
              size={20}
            />
          </button>

          <div className="hidden h-7 w-px bg-[#DDE6F0] dark:bg-slate-700 sm:block" />

          <button
            type="button"
            onClick={
              alejar
            }
            disabled={
              !cargado
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F5FA] text-[#506C88] transition hover:bg-[#EDE9FF] hover:text-[#7652D9] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200 sm:h-10 sm:w-10"
            aria-label="Alejar"
          >
            <Minus
              size={18}
            />
          </button>

          <button
            type="button"
            onClick={
              acercar
            }
            disabled={
              !cargado
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F5FA] text-[#506C88] transition hover:bg-[#EDE9FF] hover:text-[#7652D9] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200 sm:h-10 sm:w-10"
            aria-label="Acercar"
          >
            <Plus
              size={18}
            />
          </button>

          <button
            type="button"
            onClick={
              ajustar
            }
            disabled={
              !cargado
            }
            className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#F1F5FA] text-[#506C88] transition hover:bg-[#EDE9FF] hover:text-[#7652D9] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200 sm:flex"
            aria-label="Ajustar visor"
          >
            <Maximize2
              size={18}
            />
          </button>
        </div>

        {/* DERECHA */}

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {paginaActual && (
            <span className="rounded-xl bg-[#F1F5FA] px-3 py-2 text-[10px] font-black text-[#506C88] dark:bg-slate-700 dark:text-slate-200 sm:px-4 sm:text-xs">
              Página{" "}
              {paginaActual}
            </span>
          )}

          <a
            href={
              enlaceGoogle
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#EAF4FF] px-3 text-[10px] font-black text-[#1769E0] transition hover:bg-[#DCEEFF] dark:bg-[#1D3558] dark:text-[#70B7F0] sm:h-10 sm:text-xs"
          >
            <ExternalLink
              size={15}
            />

            <span className="hidden sm:inline">
              Google Books
            </span>
          </a>

          <span className="hidden items-center gap-2 text-xs font-bold text-[#6085A5] dark:text-slate-400 md:flex">
            <BookOpen
              size={15}
            />

            Lector Raccoon
          </span>
        </div>
      </div>

      {/* =================================================
          CONTENEDOR
      ================================================= */}

      <div className="relative min-h-[520px] flex-1 overflow-hidden">
        {/* CARGANDO */}

        {cargando && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#F8FBFE] px-5 text-center dark:bg-[#101827] sm:px-6">
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
              Estamos cargando
              la vista previa
              de{" "}
              <strong>
                {titulo}
              </strong>
              .
            </p>
          </div>
        )}

        {/* ERROR */}

        {!cargando &&
          error && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-y-auto bg-[#F8FBFE] p-5 text-center dark:bg-[#101827] sm:p-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-red-50 text-red-500 dark:bg-red-950/30">
                <AlertCircle
                  size={38}
                />
              </div>

              <h3 className="mt-5 text-xl font-black">
                Vista interna no disponible
              </h3>

              <p className="mt-3 max-w-lg text-sm leading-7 text-[#6085A5] dark:text-slate-400">
                {error}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    void iniciarVisor()
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55A8E8] to-[#7652D9] px-5 py-3 text-sm font-black text-white"
                >
                  <RotateCcw
                    size={18}
                  />

                  Intentar nuevamente
                </button>

                <a
                  href={
                    enlaceGoogle
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#D8DFF0] bg-white px-5 py-3 text-sm font-black text-[#1769E0] transition hover:bg-[#EEF6FF] dark:border-slate-600 dark:bg-slate-800 dark:text-[#70B7F0]"
                >
                  <BookOpen
                    size={18}
                  />

                  Abrir en Google Books

                  <ExternalLink
                    size={16}
                  />
                </a>
              </div>

              <p className="mt-5 max-w-lg text-xs leading-5 text-[#8295AA] dark:text-slate-500">
                Algunos libros
                tienen restricciones
                de vista previa o
                disponibilidad según
                la edición.
              </p>
            </div>
          )}

        {/* GOOGLE BOOKS */}

        <div
          ref={
            contenedorRef
          }
          className={`
            h-full
            min-h-[520px]
            w-full
            min-w-0
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