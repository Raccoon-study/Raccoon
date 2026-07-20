import {
  createClient,
} from "@supabase/supabase-js";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLAYLIST_ID =
  "908622995";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env
    .NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface TrackDeezerOriginal {
  id: number;
  title: string;
  preview: string;
  link: string;

  artist?: {
    name?: string;
  };

  album?: {
    cover_medium?: string;
    cover_small?: string;
  };
}

interface PlaylistDeezerOriginal {
  id: number;
  title: string;
  description?: string;
  picture_medium?: string;
  picture_big?: string;
  link?: string;
  nb_tracks?: number;

  error?: {
    message?: string;
  };

  tracks?: {
    data?: TrackDeezerOriginal[];
  };
}

export async function GET(
  request: Request
) {
  try {
    if (
      !supabaseUrl ||
      !supabaseAnonKey
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan las variables de Supabase.",
        },
        {
          status: 500,
        }
      );
    }

    /* VALIDAR SESIÓN */

    const autorizacion =
      request.headers.get(
        "authorization"
      );

    const token =
      autorizacion?.startsWith("Bearer ")
        ? autorizacion.slice(7)
        : null;

    if (!token) {
      return NextResponse.json(
        {
          error:
            "No se encontró una sesión válida.",
        },
        {
          status: 401,
        }
      );
    }

    const supabaseServidor =
      createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );

    const {
      data: { user },
      error: errorUsuario,
    } =
      await supabaseServidor.auth.getUser(
        token
      );

    if (errorUsuario || !user) {
      return NextResponse.json(
        {
          error:
            "Tu sesión venció.",
        },
        {
          status: 401,
        }
      );
    }

    /* VALIDAR PREMIUM */

    const metadata = {
      ...(user.user_metadata || {}),
      ...(user.app_metadata || {}),
    };

    const plan = String(
      metadata.plan ||
        metadata.subscription ||
        metadata.tipo_plan ||
        metadata.role ||
        ""
    ).toLowerCase();

    const esPremium =
      metadata.premium === true ||
      metadata.is_premium === true ||
      plan === "premium" ||
      plan.includes("premium");

    if (!esPremium) {
      return NextResponse.json(
        {
          error:
            "Esta playlist está disponible únicamente para usuarios Premium.",
        },
        {
          status: 403,
        }
      );
    }

    /* DEEZER */

    const respuesta = await fetch(
      `https://api.deezer.com/playlist/${PLAYLIST_ID}`,
      {
        cache: "no-store",
      }
    );

    if (!respuesta.ok) {
      return NextResponse.json(
        {
          error:
            "Deezer no respondió correctamente.",
        },
        {
          status: 502,
        }
      );
    }

    const datos =
      (await respuesta.json()) as PlaylistDeezerOriginal;

    if (datos.error) {
      return NextResponse.json(
        {
          error:
            datos.error.message ||
            "Deezer devolvió un error.",
        },
        {
          status: 502,
        }
      );
    }

    const tracks = (
      datos.tracks?.data || []
    )
      .filter(
        (track) =>
          Boolean(track.preview)
      )
      .slice(0, 15)
      .map((track) => ({
        id: track.id,

        titulo:
          track.title ||
          "Canción sin título",

        artista:
          track.artist?.name ||
          "Artista desconocido",

        preview:
          track.preview,

        portada:
          track.album
            ?.cover_medium ||
          track.album
            ?.cover_small ||
          datos.picture_medium ||
          "",

        enlace:
          track.link || "",
      }));

    return NextResponse.json(
      {
        playlist: {
          id: datos.id,

          titulo:
            datos.title ||
            "Playlist Premium",

          descripcion:
            datos.description || "",

          portada:
            datos.picture_big ||
            datos.picture_medium ||
            "",

          enlace:
            datos.link || "",

          total:
            datos.nb_tracks ||
            tracks.length,
        },

        tracks,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Error cargando Deezer:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo cargar la playlist.",
      },
      {
        status: 500,
      }
    );
  }
}