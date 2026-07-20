import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =====================================================
   TIPOS DE GOOGLE BOOKS
===================================================== */

interface GoogleIndustryIdentifier {
  type?: string;
  identifier?: string;
}

interface GoogleImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
}

interface GoogleVolumeInfo {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;

  industryIdentifiers?:
    GoogleIndustryIdentifier[];

  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  imageLinks?: GoogleImageLinks;
  language?: string;
  previewLink?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
}

interface GoogleAccessInfo {
  viewability?: string;
  embeddable?: boolean;
  publicDomain?: boolean;
  webReaderLink?: string;
}

interface GooglePrice {
  amount?: number;
  currencyCode?: string;
}

interface GoogleSaleInfo {
  saleability?: string;
  listPrice?: GooglePrice;
  retailPrice?: GooglePrice;
  buyLink?: string;
}

interface GoogleVolume {
  id?: string;
  volumeInfo?: GoogleVolumeInfo;
  accessInfo?: GoogleAccessInfo;
  saleInfo?: GoogleSaleInfo;
}

interface GoogleBooksResponse {
  totalItems?: number;
  items?: GoogleVolume[];

  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

interface LibroNormalizado {
  id: string;
  titulo: string;
  subtitulo: string;
  autores: string[];
  descripcion: string;
  categorias: string[];
  fechaPublicacion: string;
  editorial: string;
  paginas: number;
  idioma: string;
  portada: string;
  miniatura: string;
  vistaPrevia: string;
  informacion: string;
  lectorWeb: string;
  comprable: boolean;
  enlaceCompra: string;
  precio: number | null;
  moneda: string;
  valoracion: number;
  cantidadValoraciones: number;
  isbn: string;
  vistaDisponible: boolean;
  embebible: boolean;
  accesoCompleto: boolean;
  dominioPublico: boolean;
}

interface ResultadoGoogle {
  ok: boolean;
  status: number;
  datos: unknown;
}

/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */

function esObjeto(
  valor: unknown
): valor is Record<string, unknown> {
  return (
    typeof valor === "object" &&
    valor !== null
  );
}

function numeroSeguro(
  valor: unknown,
  respaldo = 0
): number {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : respaldo;
}

function asegurarHttps(
  url: string | undefined
): string {
  if (!url) {
    return "";
  }

  return url.replace(
    /^http:\/\//i,
    "https://"
  );
}

function limpiarDescripcion(
  descripcion: string | undefined
): string {
  if (!descripcion) {
    return "Este libro no incluye una descripción disponible.";
  }

  return descripcion
    .replace(
      /<br\s*\/?>/gi,
      "\n"
    )
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

function obtenerIsbn(
  identificadores:
    | GoogleIndustryIdentifier[]
    | undefined
): string {
  if (!identificadores) {
    return "";
  }

  const isbn13 =
    identificadores.find(
      (elemento) =>
        elemento.type ===
        "ISBN_13"
    );

  if (isbn13?.identifier) {
    return isbn13.identifier;
  }

  const isbn10 =
    identificadores.find(
      (elemento) =>
        elemento.type ===
        "ISBN_10"
    );

  return isbn10?.identifier || "";
}

function normalizarLibro(
  volumen: GoogleVolume
): LibroNormalizado | null {
  const informacion =
    volumen.volumeInfo || {};

  const acceso =
    volumen.accessInfo || {};

  const venta =
    volumen.saleInfo || {};

  const id =
    String(
      volumen.id || ""
    ).trim();

  const titulo =
    String(
      informacion.title || ""
    ).trim();

  if (!id || !titulo) {
    return null;
  }

  const imagenes =
    informacion.imageLinks || {};

  const portada =
    asegurarHttps(
      imagenes.extraLarge ||
        imagenes.large ||
        imagenes.medium ||
        imagenes.small ||
        imagenes.thumbnail ||
        imagenes.smallThumbnail
    );

  const miniatura =
    asegurarHttps(
      imagenes.thumbnail ||
        imagenes.smallThumbnail ||
        imagenes.small ||
        imagenes.medium
    );

  const precio =
    venta.retailPrice?.amount ??
    venta.listPrice?.amount ??
    null;

  const moneda =
    venta.retailPrice
      ?.currencyCode ||
    venta.listPrice
      ?.currencyCode ||
    "";

  const viewability =
    String(
      acceso.viewability || ""
    ).toUpperCase();

  const accesoCompleto =
    viewability ===
    "ALL_PAGES";

  const embebible =
    acceso.embeddable === true;

  const vistaDisponible =
    Boolean(
      informacion.previewLink ||
        acceso.webReaderLink ||
        embebible ||
        accesoCompleto
    );

  return {
    id,
    titulo,

    subtitulo:
      informacion.subtitle || "",

    autores:
      informacion.authors
        ?.length
        ? informacion.authors
        : ["Autor desconocido"],

    descripcion:
      limpiarDescripcion(
        informacion.description
      ),

    categorias:
      informacion.categories
        ?.length
        ? informacion.categories
        : ["General"],

    fechaPublicacion:
      informacion.publishedDate ||
      "",

    editorial:
      informacion.publisher ||
      "Editorial no disponible",

    paginas:
      numeroSeguro(
        informacion.pageCount
      ),

    idioma:
      informacion.language ||
      "",

    portada,
    miniatura,

    vistaPrevia:
      asegurarHttps(
        informacion.previewLink
      ),

    informacion:
      asegurarHttps(
        informacion.infoLink ||
          informacion.canonicalVolumeLink
      ),

    lectorWeb:
      asegurarHttps(
        acceso.webReaderLink
      ),

    comprable:
      Boolean(
        venta.buyLink ||
          venta.saleability ===
            "FOR_SALE"
      ),

    enlaceCompra:
      asegurarHttps(
        venta.buyLink
      ),

    precio:
      typeof precio ===
      "number"
        ? precio
        : null,

    moneda,

    valoracion:
      numeroSeguro(
        informacion.averageRating
      ),

    cantidadValoraciones:
      numeroSeguro(
        informacion.ratingsCount
      ),

    isbn:
      obtenerIsbn(
        informacion.industryIdentifiers
      ),

    vistaDisponible,
    embebible,
    accesoCompleto,

    dominioPublico:
      acceso.publicDomain ===
      true,
  };
}

function limitarNumero(
  valor: string | null,
  minimo: number,
  maximo: number,
  respaldo: number
): number {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return respaldo;
  }

  return Math.min(
    maximo,
    Math.max(
      minimo,
      Math.floor(numero)
    )
  );
}

function obtenerMensajeGoogle(
  datos: unknown
): string {
  if (!esObjeto(datos)) {
    return "";
  }

  if (
    esObjeto(datos.error) &&
    typeof datos.error
      .message === "string"
  ) {
    return datos.error.message;
  }

  if (
    typeof datos.message ===
    "string"
  ) {
    return datos.message;
  }

  return "";
}

function debeReintentar(
  estado: number
): boolean {
  return [
    429,
    500,
    502,
    503,
    504,
  ].includes(estado);
}

function esperar(
  milisegundos: number
): Promise<void> {
  return new Promise(
    (resolver) => {
      setTimeout(
        resolver,
        milisegundos
      );
    }
  );
}

/* =====================================================
   CONSULTA CON REINTENTOS
===================================================== */

async function consultarGoogleBooks(
  url: URL
): Promise<ResultadoGoogle> {
  const maximoIntentos = 3;

  let ultimoResultado:
    ResultadoGoogle = {
    ok: false,
    status: 503,
    datos: null,
  };

  for (
    let intento = 1;
    intento <= maximoIntentos;
    intento++
  ) {
    const controlador =
      new AbortController();

    const temporizador =
      setTimeout(() => {
        controlador.abort();
      }, 15000);

    try {
      const respuesta =
        await fetch(
          url.toString(),
          {
            method: "GET",

            headers: {
              Accept:
                "application/json",
            },

            cache: "no-store",

            signal:
              controlador.signal,
          }
        );

      clearTimeout(
        temporizador
      );

      const datos: unknown =
        await respuesta
          .json()
          .catch(() => null);

      ultimoResultado = {
        ok:
          respuesta.ok &&
          !(
            esObjeto(datos) &&
            esObjeto(datos.error)
          ),

        status:
          respuesta.status,

        datos,
      };

      if (ultimoResultado.ok) {
        return ultimoResultado;
      }

      if (
        !debeReintentar(
          respuesta.status
        ) ||
        intento ===
          maximoIntentos
      ) {
        return ultimoResultado;
      }

      await esperar(
        1000 *
          2 ** (intento - 1)
      );
    } catch (error) {
      clearTimeout(
        temporizador
      );

      if (
        intento ===
        maximoIntentos
      ) {
        throw error;
      }

      await esperar(
        1000 *
          2 ** (intento - 1)
      );
    }
  }

  return ultimoResultado;
}

/* =====================================================
   GET
===================================================== */

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const apiKey =
      process.env
        .GOOGLE_BOOKS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Falta GOOGLE_BOOKS_API_KEY en el archivo .env.local.",
        },
        {
          status: 500,
        }
      );
    }

    const parametros =
      request.nextUrl.searchParams;

    const id =
      parametros
        .get("id")
        ?.trim();

    const consulta =
      parametros
        .get("q")
        ?.trim();

    const startIndex =
      limitarNumero(
        parametros.get(
          "startIndex"
        ),
        0,
        1000,
        0
      );

    const maxResults =
      limitarNumero(
        parametros.get(
          "maxResults"
        ),
        1,
        40,
        12
      );

    const orderBy =
      parametros.get(
        "orderBy"
      ) === "newest"
        ? "newest"
        : "relevance";

    const idioma =
      parametros.get(
        "langRestrict"
      );

    const filtroRecibido =
      parametros.get(
        "filter"
      );

    const filtrosPermitidos = [
      "partial",
      "full",
      "free-ebooks",
      "paid-ebooks",
      "ebooks",
    ];

    const filtro =
      filtroRecibido &&
      filtrosPermitidos.includes(
        filtroRecibido
      )
        ? filtroRecibido
        : "";

    /* DETALLE */

    if (id) {
      const url =
        new URL(
          `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(
            id
          )}`
        );

      url.searchParams.set(
        "key",
        apiKey
      );

      url.searchParams.set(
        "projection",
        "full"
      );

      const resultado =
        await consultarGoogleBooks(
          url
        );

      if (!resultado.ok) {
        return NextResponse.json(
          {
            success: false,

            error:
              obtenerMensajeGoogle(
                resultado.datos
              ) ||
              "No se pudo obtener el libro.",
          },
          {
            status:
              resultado.status,
          }
        );
      }

      const libro =
        normalizarLibro(
          resultado.datos as
            GoogleVolume
        );

      if (!libro) {
        return NextResponse.json(
          {
            success: false,

            error:
              "El libro no contiene información válida.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json({
        success: true,
        libro,
      });
    }

    /* BÚSQUEDA */

    if (!consulta) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Escribe un libro, autor o tema para buscar.",
        },
        {
          status: 400,
        }
      );
    }

    const url =
      new URL(
        "https://www.googleapis.com/books/v1/volumes"
      );

    url.searchParams.set(
      "q",
      consulta
    );

    url.searchParams.set(
      "startIndex",
      String(startIndex)
    );

    url.searchParams.set(
      "maxResults",
      String(maxResults)
    );

    url.searchParams.set(
      "orderBy",
      orderBy
    );

    url.searchParams.set(
      "printType",
      "books"
    );

    url.searchParams.set(
      "projection",
      "full"
    );

    url.searchParams.set(
      "key",
      apiKey
    );

    if (
      idioma &&
      idioma !== "todos"
    ) {
      url.searchParams.set(
        "langRestrict",
        idioma
      );
    }

    if (filtro) {
      url.searchParams.set(
        "filter",
        filtro
      );
    }

    const resultado =
      await consultarGoogleBooks(
        url
      );

    if (!resultado.ok) {
      const mensajeGoogle =
        obtenerMensajeGoogle(
          resultado.datos
        );

      return NextResponse.json(
        {
          success: false,

          error:
            resultado.status ===
            503
              ? "Google Books está temporalmente ocupado. Intenta nuevamente en unos segundos."
              : mensajeGoogle ||
                "Google Books rechazó la solicitud.",

          google_status:
            resultado.status,
        },
        {
          status:
            resultado.status,
        }
      );
    }

    const respuestaGoogle =
      resultado.datos as
        GoogleBooksResponse;

    const libros =
      (
        respuestaGoogle.items ||
        []
      )
        .map(normalizarLibro)
        .filter(
          (
            libro
          ): libro is LibroNormalizado =>
            libro !== null
        );

    return NextResponse.json({
      success: true,

      total:
        numeroSeguro(
          respuestaGoogle.totalItems
        ),

      startIndex,
      maxResults,
      libros,
    });
  } catch (error) {
    console.error(
      "Error consultando Google Books:",
      error
    );

    const mensaje =
      error instanceof Error
        ? error.message
        : "Error desconocido.";

    const timeout =
      mensaje.includes(
        "aborted"
      ) ||
      mensaje.includes(
        "AbortError"
      );

    return NextResponse.json(
      {
        success: false,

        error: timeout
          ? "Google Books tardó demasiado en responder. Intenta nuevamente."
          : `No se pudo conectar con Google Books: ${mensaje}`,
      },
      {
        status: 503,
      }
    );
  }
}