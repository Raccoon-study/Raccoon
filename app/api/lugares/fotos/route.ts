import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =====================================================
   TIPOS
===================================================== */

interface RespuestaFotoGoogle {
  name?: string;

  photoUri?: string;

  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

/* =====================================================
   FUNCIONES
===================================================== */

function limitarAncho(
  valor: string | null
): number {
  const numero =
    Number(valor);

  if (
    !Number.isFinite(
      numero
    )
  ) {
    return 1200;
  }

  return Math.min(
    4800,
    Math.max(
      1,
      Math.floor(numero)
    )
  );
}

function limpiarNombre(
  valor: string
): string {
  return valor
    .trim()
    .replace(
      /\/media$/i,
      ""
    );
}

function nombreValido(
  nombre: string
): boolean {
  /*
    Formato esperado:

    places/PLACE_ID/photos/PHOTO_REFERENCE
  */

  return /^places\/[^/]+\/photos\/[^/]+$/.test(
    nombre
  );
}

/* =====================================================
   GET /api/lugares/foto
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

    const referencia =
      request.nextUrl.searchParams
        .get("name") || "";

    const nombre =
      limpiarNombre(
        referencia
      );

    const ancho =
      limitarAncho(
        request.nextUrl.searchParams
          .get("width")
      );

    if (!nombre) {
      return NextResponse.json(
        {
          success: false,

          error:
            "No se recibió la referencia de la fotografía.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !nombreValido(
        nombre
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "La referencia de la fotografía no tiene un formato válido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Google espera:

      places/PLACE_ID/photos/PHOTO_REFERENCE/media
    */

    const url =
      new URL(
        `https://places.googleapis.com/v1/${nombre}/media`
      );

    url.searchParams.set(
      "maxWidthPx",
      String(ancho)
    );

    /*
      CON TRUE:
      Google responde JSON:
      {
        name: "...",
        photoUri: "..."
      }
    */

    url.searchParams.set(
      "skipHttpRedirect",
      "true"
    );

    const respuestaGoogle =
      await fetch(
        url.toString(),
        {
          method: "GET",

          headers: {
            "X-Goog-Api-Key":
              apiKey,

            Accept:
              "application/json",
          },

          cache:
            "no-store",
        }
      );

    const datos =
      (await respuestaGoogle
        .json()
        .catch(
          () => null
        )) as
        | RespuestaFotoGoogle
        | null;

    if (
      !respuestaGoogle.ok
    ) {
      console.error(
        "Error Google Photos:",
        respuestaGoogle.status,
        datos
      );

      return NextResponse.json(
        {
          success: false,

          error:
            datos?.error?.message ||
            `Google Places devolvió ${respuestaGoogle.status}.`,
        },
        {
          status:
            respuestaGoogle.status,
        }
      );
    }

    const photoUri =
      datos?.photoUri;

    if (
      typeof photoUri !==
        "string" ||
      !photoUri.trim()
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Google Places no devolvió la URL de la fotografía.",
        },
        {
          status: 404,
        }
      );
    }

    /*
      DESCARGAMOS LA FOTO REAL
    */

    const respuestaImagen =
      await fetch(
        photoUri,
        {
          method: "GET",

          redirect:
            "follow",

          cache:
            "no-store",
        }
      );

    if (
      !respuestaImagen.ok
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            `No se pudo descargar la fotografía (${respuestaImagen.status}).`,
        },
        {
          status:
            respuestaImagen.status,
        }
      );
    }

    const contentType =
      respuestaImagen.headers
        .get(
          "content-type"
        ) ||
      "image/jpeg";

    if (
      !contentType.startsWith(
        "image/"
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "El contenido recibido no es una imagen.",
        },
        {
          status: 502,
        }
      );
    }

    const imagen =
      await respuestaImagen
        .arrayBuffer();

    if (
      imagen.byteLength ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "La fotografía está vacía.",
        },
        {
          status: 502,
        }
      );
    }

    /*
      DEVOLVEMOS LA IMAGEN DIRECTAMENTE
      A <img src="/api/lugares/foto?...">
    */

    return new NextResponse(
      imagen,
      {
        status: 200,

        headers: {
          "Content-Type":
            contentType,

          "Cache-Control":
            "private, max-age=1800",

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error /api/lugares/foto:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "No se pudo cargar la fotografía.",
      },
      {
        status: 500,
      }
    );
  }
}