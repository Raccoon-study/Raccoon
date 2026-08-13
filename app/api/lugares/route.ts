import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =====================================================
   TIPOS
===================================================== */

type CategoriaLugar =
  | "cafeterias"
  | "bibliotecas"
  | "parques"
  | "universidades"
  | "otros";

type CategoriaBusqueda =
  | "todos"
  | CategoriaLugar;

interface TextoGoogle {
  text?: string;
  languageCode?: string;
}

interface UbicacionGoogle {
  latitude?: number;
  longitude?: number;
}

interface AutorFotoGoogle {
  displayName?: string;
  uri?: string;
  photoUri?: string;
}

interface FotoGoogle {
  name?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: AutorFotoGoogle[];
}

interface HorarioGoogle {
  openNow?: boolean;
  weekdayDescriptions?: string[];
}

interface ResenaGoogle {
  name?: string;
  rating?: number;

  text?: TextoGoogle;
  originalText?: TextoGoogle;

  relativePublishTimeDescription?: string;
  publishTime?: string;

  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
}

interface LugarGoogle {
  id?: string;
  name?: string;

  displayName?: TextoGoogle;

  formattedAddress?: string;

  location?: UbicacionGoogle;

  rating?: number;
  userRatingCount?: number;

  primaryType?: string;
  primaryTypeDisplayName?: TextoGoogle;

  types?: string[];

  photos?: FotoGoogle[];

  googleMapsUri?: string;

  websiteUri?: string;
  nationalPhoneNumber?: string;

  businessStatus?: string;

  regularOpeningHours?: HorarioGoogle;
  currentOpeningHours?: HorarioGoogle;

  reviews?: ResenaGoogle[];

  editorialSummary?: TextoGoogle;

  servesCoffee?: boolean;
  outdoorSeating?: boolean;
  restroom?: boolean;
  goodForGroups?: boolean;

  accessibilityOptions?: {
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };

  parkingOptions?: {
    freeParkingLot?: boolean;
    paidParkingLot?: boolean;

    freeStreetParking?: boolean;
    paidStreetParking?: boolean;

    valetParking?: boolean;

    freeGarageParking?: boolean;
    paidGarageParking?: boolean;
  };
}

interface RespuestaBusquedaGoogle {
  places?: LugarGoogle[];

  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

interface ErrorGoogle {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

/* =====================================================
   SANTIAGO DE VERAGUAS
===================================================== */

const CENTRO_SANTIAGO = {
  latitude: 8.1004,
  longitude: -80.9832,
};

const CONSULTAS: Record<
  CategoriaBusqueda,
  string
> = {
  todos:
    "lugares para estudiar en Santiago de Veraguas Panamá",

  cafeterias:
    "cafeterías en Santiago de Veraguas Panamá",

  bibliotecas:
    "bibliotecas en Santiago de Veraguas Panamá",

  parques:
    "parques en Santiago de Veraguas Panamá",

  universidades:
    "universidades en Santiago de Veraguas Panamá",

  otros:
    "lugares educativos en Santiago de Veraguas Panamá",
};

/* =====================================================
   HELPERS
===================================================== */

function numeroSeguro(
  valor: unknown,
  respaldo = 0
): number {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : respaldo;
}

function categoriaPermitida(
  valor: string | null
): CategoriaBusqueda {
  const categorias: CategoriaBusqueda[] = [
    "todos",
    "cafeterias",
    "bibliotecas",
    "parques",
    "universidades",
    "otros",
  ];

  if (
    categorias.includes(
      valor as CategoriaBusqueda
    )
  ) {
    return valor as CategoriaBusqueda;
  }

  return "todos";
}

/* =====================================================
   CATEGORÍA
===================================================== */

function obtenerCategoria(
  tipos: string[]
): CategoriaLugar {
  if (
    tipos.includes("library")
  ) {
    return "bibliotecas";
  }

  if (
    tipos.includes("cafe") ||
    tipos.includes("coffee_shop") ||
    tipos.includes("bakery") ||
    tipos.includes("restaurant")
  ) {
    return "cafeterias";
  }

  if (
    tipos.includes("park") ||
    tipos.includes("garden")
  ) {
    return "parques";
  }

  if (
    tipos.includes("university") ||
    tipos.includes("college") ||
    tipos.includes("school")
  ) {
    return "universidades";
  }

  return "otros";
}

/* =====================================================
   CORREGIR NOMBRE ISAE
===================================================== */

function corregirNombre(
  nombre: string,
  categoria: CategoriaLugar
): string {
  const limpio =
    nombre.trim();

  if (
    categoria === "universidades" &&
    limpio === "1"
  ) {
    return "ISAE Universidad";
  }

  return limpio;
}

/* =====================================================
   FOTOS
===================================================== */

function crearFotos(
  fotos:
    | FotoGoogle[]
    | undefined
): string[] {
  if (
    !Array.isArray(fotos)
  ) {
    return [];
  }

  return fotos
    .filter((foto) => {
      return (
        typeof foto.name ===
          "string" &&
        foto.name.trim().length >
          0
      );
    })
    .slice(0, 10)
    .map((foto) => {
      const params =
        new URLSearchParams();

      params.set(
        "name",
        String(foto.name).trim()
      );

      params.set(
        "width",
        "1400"
      );

      params.set(
        "height",
        "1000"
      );

      return (
        `/api/lugares/foto?` +
        params.toString()
      );
    });
}

/* =====================================================
   ATRIBUCIÓN FOTO
===================================================== */

function obtenerAtribucionFoto(
  fotos:
    | FotoGoogle[]
    | undefined
): string {
  const foto =
    fotos?.[0];

  if (
    !foto ||
    !Array.isArray(
      foto.authorAttributions
    )
  ) {
    return "";
  }

  return foto.authorAttributions
    .map(
      (autor) =>
        autor.displayName
    )
    .filter(
      (
        nombre
      ): nombre is string =>
        typeof nombre ===
          "string" &&
        nombre.trim().length >
          0
    )
    .join(", ");
}

/* =====================================================
   PLACE DETAILS:
   BUSCAR FOTOS DE UN LUGAR
===================================================== */

async function obtenerFotosDesdeDetalles(
  apiKey: string,
  placeId: string
): Promise<FotoGoogle[]> {
  if (!placeId) {
    return [];
  }

  try {
    const url =
      new URL(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(
          placeId
        )}`
      );

    /*
      IMPORTANTE:

      Pedimos solamente:
      - id
      - photos

      Google clasifica photos como
      Place Details Essentials IDs Only.
    */

    const respuesta =
      await fetch(
        url.toString(),
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            "X-Goog-Api-Key":
              apiKey,

            "X-Goog-FieldMask":
              "id,photos",
          },

          cache:
            "no-store",
        }
      );

    const datos =
      (await respuesta
        .json()
        .catch(
          () => null
        )) as
        | LugarGoogle
        | ErrorGoogle
        | null;

    if (
      !respuesta.ok
    ) {
      console.warn(
        "Place Details Photos:",
        placeId,
        respuesta.status,
        datos
      );

      return [];
    }

    const lugar =
      datos as LugarGoogle;

    if (
      !Array.isArray(
        lugar.photos
      )
    ) {
      console.warn(
        "Google no devolvió photos para:",
        placeId
      );

      return [];
    }

    return lugar.photos.filter(
      (foto) =>
        typeof foto.name ===
          "string" &&
        foto.name.trim().length >
          0
    );
  } catch (error) {
    console.warn(
      "Error obteniendo fotos:",
      placeId,
      error
    );

    return [];
  }
}

/* =====================================================
   COMPLETAR FOTOS FALTANTES

   ESTE ES EL ARREGLO QUE FALTABA.
===================================================== */

async function completarFotos(
  apiKey: string,
  lugares: LugarGoogle[]
): Promise<LugarGoogle[]> {
  const resultado:
    LugarGoogle[] = [];

  /*
    Procesamos solo 4 simultáneamente.
  */

  const tamanoLote = 4;

  for (
    let inicio = 0;
    inicio < lugares.length;
    inicio += tamanoLote
  ) {
    const lote =
      lugares.slice(
        inicio,
        inicio + tamanoLote
      );

    const completados =
      await Promise.all(
        lote.map(
          async (
            lugar
          ): Promise<LugarGoogle> => {
            /*
              Text Search ya mandó fotos.
            */

            if (
              Array.isArray(
                lugar.photos
              ) &&
              lugar.photos.length >
                0
            ) {
              return lugar;
            }

            /*
              Text Search NO mandó fotos.
              Hacemos Place Details.
            */

            const id =
              String(
                lugar.id || ""
              ).trim();

            if (!id) {
              return lugar;
            }

            const fotos =
              await obtenerFotosDesdeDetalles(
                apiKey,
                id
              );

            return {
              ...lugar,

              photos: fotos,
            };
          }
        )
      );

    resultado.push(
      ...completados
    );
  }

  return resultado;
}

/* =====================================================
   DESCRIPCIÓN
===================================================== */

function crearDescripcion(
  categoria: CategoriaLugar,
  nombre: string
): string {
  switch (categoria) {
    case "cafeterias":
      return `${nombre} es una cafetería ubicada en Santiago de Veraguas. Puede ser una buena opción para estudiar, trabajar o reunirse.`;

    case "bibliotecas":
      return `${nombre} es un espacio de lectura, investigación y estudio ubicado en Santiago de Veraguas.`;

    case "parques":
      return `${nombre} ofrece un espacio al aire libre en Santiago de Veraguas para leer, descansar o estudiar.`;

    case "universidades":
      return `${nombre} es un espacio académico ubicado en Santiago de Veraguas.`;

    default:
      return `${nombre} es un lugar ubicado en Santiago de Veraguas.`;
  }
}

/* =====================================================
   CARACTERÍSTICAS
===================================================== */

function obtenerCaracteristicas(
  lugar: LugarGoogle,
  categoria:
    CategoriaLugar
): string[] {
  const lista:
    string[] = [];

  if (
    categoria === "cafeterias"
  ) {
    lista.push("Café");
  }

  if (
    categoria === "bibliotecas"
  ) {
    lista.push(
      "Biblioteca",
      "Espacio académico"
    );
  }

  if (
    categoria === "parques"
  ) {
    lista.push(
      "Aire libre"
    );
  }

  if (
    categoria === "universidades"
  ) {
    lista.push(
      "Universidad",
      "Entorno académico"
    );
  }

  if (
    lugar.servesCoffee ===
      true &&
    !lista.includes("Café")
  ) {
    lista.push("Café");
  }

  if (
    lugar.outdoorSeating ===
    true
  ) {
    lista.push(
      "Mesas exteriores"
    );
  }

  if (
    lugar.restroom === true
  ) {
    lista.push("Baños");
  }

  if (
    lugar.goodForGroups ===
    true
  ) {
    lista.push(
      "Ideal para grupos"
    );
  }

  if (
    lugar
      .accessibilityOptions
      ?.wheelchairAccessibleEntrance ===
    true
  ) {
    lista.push(
      "Entrada accesible"
    );
  }

  if (
    lugar.parkingOptions &&
    Object.values(
      lugar.parkingOptions
    ).some(
      (valor) =>
        valor === true
    )
  ) {
    lista.push(
      "Estacionamiento"
    );
  }

  return [
    ...new Set(lista),
  ].slice(0, 6);
}

/* =====================================================
   RESEÑAS
===================================================== */

function normalizarResenas(
  resenas:
    | ResenaGoogle[]
    | undefined,
  lugarId: string
) {
  if (
    !Array.isArray(resenas)
  ) {
    return [];
  }

  return resenas
    .map(
      (
        resena,
        indice
      ) => ({
        id:
          resena.name ||
          `${lugarId}-${indice}`,

        autor:
          resena
            .authorAttribution
            ?.displayName ||
          "Usuario de Google",

        fotoAutor:
          resena
            .authorAttribution
            ?.photoUri ||
          "",

        calificacion:
          numeroSeguro(
            resena.rating
          ),

        comentario:
          resena.text?.text ||
          resena
            .originalText
            ?.text ||
          "",

        fecha:
          resena
            .relativePublishTimeDescription ||
          resena.publishTime ||
          "",

        enlaceAutor:
          resena
            .authorAttribution
            ?.uri ||
          "",
      })
    )
    .filter(
      (resena) =>
        resena.comentario
          .trim()
          .length > 0
    );
}

/* =====================================================
   NORMALIZAR LUGAR
===================================================== */

function normalizarLugar(
  lugar: LugarGoogle
) {
  const id =
    String(
      lugar.id || ""
    ).trim();

  const nombreOriginal =
    String(
      lugar
        .displayName
        ?.text ||
        ""
    ).trim();

  if (
    !id ||
    !nombreOriginal
  ) {
    return null;
  }

  const tipos =
    Array.isArray(
      lugar.types
    )
      ? lugar.types
      : [];

  const categoria =
    obtenerCategoria(tipos);

  const nombre =
    corregirNombre(
      nombreOriginal,
      categoria
    );

  const fotos =
    crearFotos(
      lugar.photos
    );

  const abiertoAhora =
    lugar
      .currentOpeningHours
      ?.openNow ??
    lugar
      .regularOpeningHours
      ?.openNow ??
    null;

  const horario =
    lugar
      .currentOpeningHours
      ?.weekdayDescriptions ||
    lugar
      .regularOpeningHours
      ?.weekdayDescriptions ||
    [];

  return {
    id,

    nombre,

    direccion:
      lugar.formattedAddress ||
      "Santiago de Veraguas, Panamá",

    latitud:
      typeof lugar
        .location
        ?.latitude ===
      "number"
        ? lugar.location
            .latitude
        : null,

    longitud:
      typeof lugar
        .location
        ?.longitude ===
      "number"
        ? lugar.location
            .longitude
        : null,

    calificacion:
      numeroSeguro(
        lugar.rating
      ),

    cantidadResenas:
      numeroSeguro(
        lugar.userRatingCount
      ),

    categoria,

    tipo:
      lugar
        .primaryTypeDisplayName
        ?.text ||
      categoria,

    foto:
      fotos[0] || "",

    fotos,

    fotoAtribucion:
      obtenerAtribucionFoto(
        lugar.photos
      ),

    abiertoAhora,

    horario,

    mapaUrl:
      lugar.googleMapsUri ||
      "",

    web:
      lugar.websiteUri ||
      "",

    telefono:
      lugar
        .nationalPhoneNumber ||
      "",

    descripcion:
      lugar
        .editorialSummary
        ?.text ||
      crearDescripcion(
        categoria,
        nombre
      ),

    caracteristicas:
      obtenerCaracteristicas(
        lugar,
        categoria
      ),

    estado:
      lugar.businessStatus ||
      "",

    resenasGoogle:
      normalizarResenas(
        lugar.reviews,
        id
      ),

    /*
      Esto solo sirve para comprobar
      rápidamente si ya llegaron fotos.
      Tu page.tsx lo ignorará.
    */

    cantidadFotosGoogle:
      Array.isArray(
        lugar.photos
      )
        ? lugar.photos.length
        : 0,
  };
}

/* =====================================================
   ERROR GOOGLE
===================================================== */

function obtenerErrorGoogle(
  valor: unknown
): string {
  if (
    typeof valor !==
      "object" ||
    valor === null
  ) {
    return "Google Places rechazó la solicitud.";
  }

  if (
    "error" in valor
  ) {
    const error =
      (
        valor as ErrorGoogle
      ).error;

    if (
      typeof error?.message ===
        "string"
    ) {
      return error.message;
    }
  }

  return "Google Places rechazó la solicitud.";
}

/* =====================================================
   BUSCAR LUGARES
===================================================== */

async function buscarLugares(
  apiKey: string,
  consulta: string,
  categoria:
    CategoriaBusqueda
): Promise<NextResponse> {
  const textoBusqueda =
    consulta.trim()
      ? `${consulta.trim()} en Santiago de Veraguas Panamá`
      : CONSULTAS[categoria];

  const fieldMask = [
    "places.id",
    "places.name",

    "places.displayName",

    "places.formattedAddress",

    "places.location",

    "places.rating",

    "places.userRatingCount",

    "places.primaryType",

    "places.primaryTypeDisplayName",

    "places.types",

    /*
      Primer intento:
      Text Search.
    */

    "places.photos",

    "places.googleMapsUri",

    "places.businessStatus",

    "places.regularOpeningHours",

    "places.currentOpeningHours",

    "places.servesCoffee",

    "places.outdoorSeating",

    "places.restroom",

    "places.goodForGroups",

    "places.accessibilityOptions",

    "places.parkingOptions",
  ].join(",");

  const respuesta =
    await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          "X-Goog-Api-Key":
            apiKey,

          "X-Goog-FieldMask":
            fieldMask,
        },

        body:
          JSON.stringify({
            textQuery:
              textoBusqueda,

            languageCode:
              "es",

            regionCode:
              "PA",

            pageSize:
              20,

            rankPreference:
              "RELEVANCE",

            locationBias: {
              circle: {
                center:
                  CENTRO_SANTIAGO,

                radius:
                  18000,
              },
            },
          }),

        cache:
          "no-store",
      }
    );

  const datos =
    (await respuesta
      .json()
      .catch(
        () => null
      )) as
      | RespuestaBusquedaGoogle
      | null;

  if (
    !respuesta.ok
  ) {
    return NextResponse.json(
      {
        success: false,

        error:
          datos?.error?.message ||
          `Google Places devolvió ${respuesta.status}.`,
      },
      {
        status:
          respuesta.status,
      }
    );
  }

  /*
    AQUÍ ESTÁ EL CAMBIO PRINCIPAL.

    Antes:
      datos.places
        .map(normalizarLugar)

    Ahora:
      Text Search
      ↓
      detectar los que no tienen photos
      ↓
      consultar Place Details
      ↓
      añadir photos
      ↓
      normalizar
  */

  const lugaresGoogle =
    await completarFotos(
      apiKey,
      datos?.places || []
    );

  const lugares =
    lugaresGoogle
      .map(normalizarLugar)
      .filter(
        (
          lugar
        ): lugar is NonNullable<
          ReturnType<
            typeof normalizarLugar
          >
        > =>
          lugar !== null
      );

  return NextResponse.json(
    {
      success: true,

      consulta:
        textoBusqueda,

      total:
        lugares.length,

      lugares,
    },
    {
      status: 200,

      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}

/* =====================================================
   DETALLE
===================================================== */

async function obtenerDetalleLugar(
  apiKey: string,
  lugarId: string
): Promise<NextResponse> {
  const url =
    new URL(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(
        lugarId
      )}`
    );

  url.searchParams.set(
    "languageCode",
    "es"
  );

  url.searchParams.set(
    "regionCode",
    "PA"
  );

  const fieldMask = [
    "id",
    "name",

    "displayName",

    "formattedAddress",

    "location",

    "rating",

    "userRatingCount",

    "primaryType",

    "primaryTypeDisplayName",

    "types",

    "photos",

    "googleMapsUri",

    "websiteUri",

    "nationalPhoneNumber",

    "businessStatus",

    "regularOpeningHours",

    "currentOpeningHours",

    "reviews",

    "editorialSummary",

    "servesCoffee",

    "outdoorSeating",

    "restroom",

    "goodForGroups",

    "accessibilityOptions",

    "parkingOptions",
  ].join(",");

  const respuesta =
    await fetch(
      url.toString(),
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",

          "X-Goog-Api-Key":
            apiKey,

          "X-Goog-FieldMask":
            fieldMask,
        },

        cache:
          "no-store",
      }
    );

  const datos =
    (await respuesta
      .json()
      .catch(
        () => null
      )) as
      | LugarGoogle
      | ErrorGoogle
      | null;

  if (
    !respuesta.ok
  ) {
    return NextResponse.json(
      {
        success: false,

        error:
          obtenerErrorGoogle(
            datos
          ),
      },
      {
        status:
          respuesta.status,
      }
    );
  }

  let lugarGoogle =
    datos as LugarGoogle;

  /*
    Seguridad adicional:
    si el detalle completo tampoco
    contiene photos, hacemos una consulta
    específica de id,photos.
  */

  if (
    !Array.isArray(
      lugarGoogle.photos
    ) ||
    lugarGoogle.photos.length ===
      0
  ) {
    const fotos =
      await obtenerFotosDesdeDetalles(
        apiKey,
        lugarId
      );

    lugarGoogle = {
      ...lugarGoogle,
      photos: fotos,
    };
  }

  const lugar =
    normalizarLugar(
      lugarGoogle
    );

  if (!lugar) {
    return NextResponse.json(
      {
        success: false,

        error:
          "No se pudo procesar el lugar.",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(
    {
      success: true,
      lugar,
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
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
        .GOOGLE_PLACES_API_KEY
        ?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,

          error:
            "GOOGLE_PLACES_API_KEY no está configurada.",
        },
        {
          status: 500,
        }
      );
    }

    const lugarId =
      request.nextUrl
        .searchParams
        .get("id")
        ?.trim();

    if (lugarId) {
      return obtenerDetalleLugar(
        apiKey,
        lugarId
      );
    }

    const consulta =
      request.nextUrl
        .searchParams
        .get("q") ||
      "";

    const categoria =
      categoriaPermitida(
        request.nextUrl
          .searchParams
          .get("categoria")
      );

    return buscarLugares(
      apiKey,
      consulta,
      categoria
    );
  } catch (error) {
    console.warn(
      "Error /api/lugares:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los lugares.",
      },
      {
        status: 500,
      }
    );
  }
}