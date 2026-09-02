import type {
  NextRequest,
} from "next/server";

import {
  NextResponse,
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* =====================================================
   DIMENSIONES
===================================================== */

function limitarDimension(
  valor: string | null,
  respaldo: number
): number {
  const numero =
    Number(valor);

  if (
    !Number.isFinite(numero)
  ) {
    return respaldo;
  }

  return Math.max(
    1,
    Math.min(
      4800,
      Math.floor(numero)
    )
  );
}

/* =====================================================
   NORMALIZAR NOMBRE
===================================================== */

function normalizarNombre(
  valor: string
): string {
  let nombre =
    valor.trim();

  if (!nombre) {
    return "";
  }

  /*
    URLSearchParams normalmente
    ya decodifica %2F.

    Esto cubre una doble codificación.
  */

  try {
    if (
      nombre.includes("%2F") ||
      nombre.includes("%2f")
    ) {
      nombre =
        decodeURIComponent(
          nombre
        );
    }
  } catch {
    // Continuamos.
  }

  /*
    Soportar URL completa accidental.
  */

  nombre =
    nombre.replace(
      /^https:\/\/places\.googleapis\.com\/v1\//i,
      ""
    );

  nombre =
    nombre.replace(
      /^\/?v1\//i,
      ""
    );

  nombre =
    nombre.replace(
      /^\/+/,
      ""
    );

  /*
    photos[].name viene SIN /media.
  */

  nombre =
    nombre.replace(
      /\/media\/?$/i,
      ""
    );

  nombre =
    nombre.split("?")[0];

  return nombre;
}

/* =====================================================
   VALIDAR
===================================================== */

function nombreValido(
  nombre: string
): boolean {
  return /^places\/[^/?#]+\/photos\/[^/?#]+$/.test(
    nombre
  );
}

/* =====================================================
   ERROR
===================================================== */

function respuestaError(
  mensaje: string,
  status: number
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: mensaje,
    },
    {
      status,

      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}

/* =====================================================
   GET PLACE PHOTO
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
      return respuestaError(
        "GOOGLE_PLACES_API_KEY no está configurada.",
        500
      );
    }

    const referencia =
      request.nextUrl
        .searchParams
        .get("name") ||
      "";

    const nombre =
      normalizarNombre(
        referencia
      );

    const width =
      limitarDimension(
        request.nextUrl
          .searchParams
          .get("width"),
        1200
      );

    const height =
      limitarDimension(
        request.nextUrl
          .searchParams
          .get("height"),
        800
      );

    if (!nombre) {
      return respuestaError(
        "No se recibió el nombre de la fotografía.",
        400
      );
    }

    if (
      !nombreValido(nombre)
    ) {
      console.warn(
        "Nombre de fotografía inválido:",
        nombre
      );

      return respuestaError(
        "La referencia de fotografía no es válida.",
        400
      );
    }

    /*
      FORMATO OFICIAL:

      https://places.googleapis.com/v1/
      places/PLACE_ID/photos/PHOTO_RESOURCE/media
    */

    const googleUrl =
      new URL(
        `https://places.googleapis.com/v1/${nombre}/media`
      );

    googleUrl.searchParams.set(
      "key",
      apiKey
    );

    googleUrl.searchParams.set(
      "maxWidthPx",
      String(width)
    );

    googleUrl.searchParams.set(
      "maxHeightPx",
      String(height)
    );

    /*
      No usamos skipHttpRedirect.

      Google redirige a la imagen real
      y nuestro servidor sigue la redirección.
    */

    const respuestaGoogle =
      await fetch(
        googleUrl.toString(),
        {
          method: "GET",

          redirect:
            "follow",

          cache:
            "no-store",

          headers: {
            Accept:
              "image/avif,image/webp,image/jpeg,image/png,image/*,*/*;q=0.8",
          },
        }
      );

    if (
      !respuestaGoogle.ok
    ) {
      const tipo =
        respuestaGoogle.headers.get(
          "content-type"
        ) || "";

      let detalle = "";

      if (
        tipo.includes(
          "application/json"
        )
      ) {
        detalle =
          JSON.stringify(
            await respuestaGoogle
              .json()
              .catch(
                () => null
              )
          );
      } else {
        detalle =
          await respuestaGoogle
            .text()
            .catch(
              () => ""
            );
      }

      console.warn(
        "Google Place Photos:",
        respuestaGoogle.status,
        detalle.slice(0, 500)
      );

      return respuestaError(
        `Google Place Photos devolvió ${respuestaGoogle.status}.`,
        respuestaGoogle.status
      );
    }

    const contentType =
      respuestaGoogle.headers.get(
        "content-type"
      ) ||
      "image/jpeg";

    if (
      !contentType
        .toLowerCase()
        .startsWith("image/")
    ) {
      console.warn(
        "Place Photos no devolvió imagen:",
        contentType
      );

      return respuestaError(
        "Google Places no devolvió una imagen válida.",
        502
      );
    }

    const imagen =
      await respuestaGoogle
        .arrayBuffer();

    if (
      imagen.byteLength ===
      0
    ) {
      return respuestaError(
        "Google devolvió una fotografía vacía.",
        502
      );
    }

    return new NextResponse(
      imagen,
      {
        status: 200,

        headers: {
          "Content-Type":
            contentType,

          /*
            Los nombres de las fotos
            pueden expirar.
          */

          "Cache-Control":
            "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );
  } catch (error) {
    console.warn(
      "Error /api/lugares/foto:",
      error
    );

    return respuestaError(
      error instanceof Error
        ? error.message
        : "No se pudo cargar la fotografía.",
      500
    );
  }
}