import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface JamendoTrackOriginal {
  id?: string;
  name?: string;
  artist_name?: string;
  audio?: string;
  image?: string;
  shareurl?: string;
  duration?: number | string;
}

interface JamendoRespuestaOriginal {
  headers?: {
    status?: string;
    error_message?: string;
  };

  results?: JamendoTrackOriginal[];
}

export async function GET() {
  try {
    const clientId =
      process.env.JAMENDO_CLIENT_ID ||
      "b49a735b";

    const parametros =
      new URLSearchParams({
        client_id: clientId,
        format: "json",
        tags: "relax",
        limit: "12",
        imagesize: "300",
        audioformat: "mp32",
      });

    const respuesta = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?${parametros.toString()}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!respuesta.ok) {
      return NextResponse.json(
        {
          error:
            "Jamendo no respondió correctamente.",
        },
        {
          status: 502,
        }
      );
    }

    const datos =
      (await respuesta.json()) as JamendoRespuestaOriginal;

    if (
      datos.headers?.status === "failed"
    ) {
      return NextResponse.json(
        {
          error:
            datos.headers.error_message ||
            "Jamendo devolvió un error.",
        },
        {
          status: 502,
        }
      );
    }

    const tracks = (
      datos.results || []
    )
      .filter(
        (track) =>
          Boolean(track.id) &&
          Boolean(track.audio)
      )
      .map((track) => ({
        id: String(track.id),

        titulo:
          track.name ||
          "Canción sin título",

        artista:
          track.artist_name ||
          "Artista desconocido",

        audio:
          track.audio || "",

        portada:
          track.image || "",

        enlace:
          track.shareurl || "",

        duracion:
          Number(track.duration || 0),
      }));

    if (tracks.length === 0) {
      return NextResponse.json(
        {
          error:
            "Jamendo no encontró canciones relajantes disponibles.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        tracks,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Error cargando Jamendo:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo cargar la música de Jamendo.",
      },
      {
        status: 500,
      }
    );
  }
}