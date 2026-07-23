import {
  NextRequest,
  NextResponse,
} from "next/server";

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

interface AtribucionGoogle {
  displayName?: string;
  uri?: string;
  photoUri?: string;
}

interface FotoGoogle {
  name?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: AtribucionGoogle[];
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

interface RespuestaBusqueda {
  places?: LugarGoogle[];

  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

/* =====================================================
   CONFIGURACIÓN
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
    "cafeterías bibliotecas universidades parques lugares para estudiar en Santiago de Veraguas Panamá",

  cafeterias:
    "cafeterías en Santiago de Veraguas Panamá",

  bibliotecas:
    "bibliotecas en Santiago de Veraguas Panamá",

  parques:
    "parques en Santiago de Veraguas Panamá",

  universidades:
    "universidades en Santiago de Veraguas Panamá",

  otros:
    "lugares educativos para estudiar en Santiago de Veraguas Panamá",
};

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

function normalizarCategoria(
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
    tipos.includes("bakery")
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
   FOTOS
===================================================== */

function crearFotos(
  fotos: FotoGoogle[] | undefined
): string[] {
  if (!Array.isArray(fotos)) {
    return [];
  }

  return fotos
    .filter(
      (foto) =>
        typeof foto.name === "string" &&
        foto.name.trim().length > 0
    )
    .slice(0, 8)
    .map(
      (foto) =>
        `/api/lugares/foto?name=${encodeURIComponent(
          String(foto.name)
        )}&width=1400`
    );
}

function obtenerAtribucionFoto(
  fotos: FotoGoogle[] | undefined
): string {
  const foto = fotos?.[0];

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
        typeof nombre === "string" &&
        nombre.trim().length > 0
    )
    .join(", ");
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
      return `${nombre} es una cafetería ubicada en Santiago de Veraguas. Revisa su calificación, horario y características para decidir si es adecuada para estudiar.`;

    case "bibliotecas":
      return `${nombre} es un espacio que puede ser utilizado para leer, investigar, realizar tareas y desarrollar actividades académicas.`;

    case "parques":
      return `${nombre} ofrece un espacio al aire libre en Santiago de Veraguas para leer, descansar o estudiar.`;

    case "universidades":
      return `${nombre} es un espacio académico ubicado en Santiago de Veraguas.`;

    default:
      return `${nombre} es un lugar ubicado en Santiago de Veraguas que puede resultar útil para estudiar o realizar actividades académicas.`;
  }
}

/* =====================================================
   CARACTERÍSTICAS
===================================================== */

function obtenerCaracteristicas(
  lugar: LugarGoogle,
  categoria: CategoriaLugar
): string[] {
  const caracteristicas: string[] = [];

  if (
    categoria === "cafeterias"
  ) {
    caracteristicas.push("Café");
  }

  if (
    categoria === "bibliotecas"
  ) {
    caracteristicas.push(
      "Biblioteca",
      "Espacio académico"
    );
  }

  if (
    categoria === "parques"
  ) {
    caracteristicas.push(
      "Aire libre"
    );
  }

  if (
    categoria === "universidades"
  ) {
    caracteristicas.push(
      "Universidad",
      "Entorno académico"
    );
  }

  if (
    lugar.servesCoffee === true &&
    !caracteristicas.includes("Café")
  ) {
    caracteristicas.push("Café");
  }

  if (
    lugar.outdoorSeating === true
  ) {
    caracteristicas.push(
      "Mesas exteriores"
    );
  }

  if (
    lugar.restroom === true
  ) {
    caracteristicas.push(
      "Baños"
    );
  }

  if (
    lugar.goodForGroups === true
  ) {
    caracteristicas.push(
      "Ideal para grupos"
    );
  }

  if (
    lugar.accessibilityOptions
      ?.wheelchairAccessibleEntrance ===
    true
  ) {
    caracteristicas.push(
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
    caracteristicas.push(
      "Estacionamiento"
    );
  }

  return [
    ...new Set(
      caracteristicas
    ),
  ].slice(0, 6);
}

/* =====================================================
   RESEÑAS
===================================================== */

function normalizarResenas(
  resenas: ResenaGoogle[] | undefined,
  lugarId: string
) {
  if (!Array.isArray(resenas)) {
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
          resena.authorAttribution
            ?.displayName ||
          "Usuario de Google",

        fotoAutor:
          resena.authorAttribution
            ?.photoUri ||
          "",

        calificacion:
          numeroSeguro(
            resena.rating
          ),

        comentario:
          resena.text?.text ||
          resena.originalText?.text ||
          "",

        fecha:
          resena.relativePublishTimeDescription ||
          resena.publishTime ||
          "",

        enlaceAutor:
          resena.authorAttribution
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

  const nombre =
    String(
      lugar.displayName?.text ||
      ""
    ).trim();

  if (
    !id ||
    !nombre
  ) {
    return null;
  }

  const tipos =
    Array.isArray(lugar.types)
      ? lugar.types
      : [];

  const categoria =
    obtenerCategoria(
      tipos
    );

  const fotos =
    crearFotos(
      lugar.photos
    );

  const abiertoAhora =
    lugar.currentOpeningHours
      ?.openNow ??
    lugar.regularOpeningHours
      ?.openNow ??
    null;

  const horario =
    lugar.currentOpeningHours
      ?.weekdayDescriptions ||
    lugar.regularOpeningHours
      ?.weekdayDescriptions ||
    [];

  return {
    id,

    nombre,

    direccion:
      lugar.formattedAddress ||
      "Santiago de Veraguas, Panamá",

    latitud:
      typeof lugar.location
        ?.latitude === "number"
        ? lugar.location.latitude
        : null,

    longitud:
      typeof lugar.location
        ?.longitude === "number"
        ? lugar.location.longitude
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
      lugar.primaryTypeDisplayName
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
      lugar.nationalPhoneNumber ||
      "",

    descripcion:
      lugar.editorialSummary
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
  };
}

/* =====================================================
   ERROR GOOGLE
===================================================== */

function obtenerErrorGoogle(
  valor: unknown
): string {
  if (
    esObjeto(valor) &&
    esObjeto(valor.error) &&
    typeof valor.error.message ===
      "string"
  ) {
    return valor.error.message;
  }

  return "Google Places rechazó la solicitud.";
}

/* =====================================================
   BUSCAR LUGARES
===================================================== */

async function buscarLugares(
  apiKey: string,
  consulta: string,
  categoria: CategoriaBusqueda
): Promise<NextResponse> {
  const textoBusqueda =
    consulta.trim()
      ? `${consulta.trim()}, Santiago de Veraguas, Panamá`
      : CONSULTAS[categoria];

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

          "X-Goog-FieldMask": [
            "places.id",
            "places.displayName",
            "places.formattedAddress",
            "places.location",
            "places.rating",
            "places.userRatingCount",
            "places.primaryType",
            "places.primaryTypeDisplayName",
            "places.types",

            /*
              ESTA LÍNEA HACE QUE GOOGLE
              DEVUELVA LAS FOTOS
            */
            "places.photos",

            "places.googleMapsUri",
            "places.businessStatus",
            "places.regularOpeningHours",
            "places.currentOpeningHours",
          ].join(","),
        },

        body: JSON.stringify({
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
      | RespuestaBusqueda
      | null;

  if (
    !respuesta.ok
  ) {
    return NextResponse.json(
      {
        success: false,

        error:
          datos?.error?.message ||
          "No se pudieron buscar los lugares.",
      },
      {
        status:
          respuesta.status,
      }
    );
  }

  const lugares =
    (datos?.places || [])
      .map(
        normalizarLugar
      )
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
   DETALLE DE UN LUGAR
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

  const respuesta =
    await fetch(
      url.toString(),
      {
        method: "GET",

        headers: {
          "X-Goog-Api-Key":
            apiKey,

          "X-Goog-FieldMask": [
            "id",
            "displayName",
            "formattedAddress",
            "location",
            "rating",
            "userRatingCount",
            "primaryType",
            "primaryTypeDisplayName",
            "types",

            /*
              FOTOS
            */
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
          ].join(","),
        },

        cache:
          "no-store",
      }
    );

  const datos: unknown =
    await respuesta
      .json()
      .catch(
        () => null
      );

  if (!respuesta.ok) {
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

  const lugar =
    normalizarLugar(
      datos as LugarGoogle
    );

  if (!lugar) {
    return NextResponse.json(
      {
        success: false,
        error:
          "No se pudo obtener la información del lugar.",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json({
    success: true,
    lugar,
  });
}

/* =====================================================
   GET /api/lugares
===================================================== */

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const apiKey =
      process.env
        .GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Falta GOOGLE_PLACES_API_KEY en .env.local.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      SOLO EN CASO DE:

      /api/lugares?id=PLACE_ID

      SE CARGA DETALLE.
    */

    const lugarId =
      request.nextUrl.searchParams
        .get("id")
        ?.trim();

    if (lugarId) {
      return obtenerDetalleLugar(
        apiKey,
        lugarId
      );
    }

    /*
      /api/lugares?categoria=todos

      NO NECESITA NAME DE FOTOGRAFÍA.
    */

    const consulta =
      request.nextUrl.searchParams
        .get("q") || "";

    const categoria =
      normalizarCategoria(
        request.nextUrl.searchParams
          .get("categoria")
      );

    return buscarLugares(
      apiKey,
      consulta,
      categoria
    );
  } catch (error) {
    console.error(
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