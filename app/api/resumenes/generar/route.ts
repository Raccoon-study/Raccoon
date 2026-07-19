import OpenAI, {
  toFile,
} from "openai";

import {
  createClient,
} from "@supabase/supabase-js";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env
    .NEXT_PUBLIC_SUPABASE_ANON_KEY;

const esquemaResumen = {
  type: "object",

  properties: {
    titulo: {
      type: "string",
    },

    materia: {
      type: "string",
    },

    tiempo_lectura: {
      type: "string",
    },

    resumen_general: {
      type: "string",
    },

    secciones_desarrollo: {
      type: "array",

      items: {
        type: "object",

        properties: {
          titulo: {
            type: "string",
          },

          contenido: {
            type: "string",
          },
        },

        required: [
          "titulo",
          "contenido",
        ],

        additionalProperties: false,
      },
    },

    ideas_principales: {
      type: "array",

      items: {
        type: "string",
      },
    },

    conceptos_clave: {
      type: "array",

      items: {
        type: "object",

        properties: {
          concepto: {
            type: "string",
          },

          definicion: {
            type: "string",
          },
        },

        required: [
          "concepto",
          "definicion",
        ],

        additionalProperties: false,
      },
    },

    ejemplos: {
      type: "array",

      items: {
        type: "string",
      },
    },

    datos_importantes: {
      type: "array",

      items: {
        type: "string",
      },
    },

    conclusion: {
      type: "string",
    },
  },

  required: [
    "titulo",
    "materia",
    "tiempo_lectura",
    "resumen_general",
    "secciones_desarrollo",
    "ideas_principales",
    "conceptos_clave",
    "ejemplos",
    "datos_importantes",
    "conclusion",
  ],

  additionalProperties: false,
};

export async function POST(
  request: Request
) {
  let archivoTemporalId:
    | string
    | null = null;

  try {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Falta configurar OPENAI_API_KEY en .env.local.",
        },
        {
          status: 500,
        }
      );
    }

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

    /* VERIFICAR SESIÓN */

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
            "Tu sesión venció. Inicia sesión nuevamente.",
        },
        {
          status: 401,
        }
      );
    }

    /* ARCHIVO */

    const formulario =
      await request.formData();

    const archivo =
      formulario.get("archivo");

    if (!(archivo instanceof File)) {
      return NextResponse.json(
        {
          error:
            "La API no recibió el archivo.",
        },
        {
          status: 400,
        }
      );
    }

    if (archivo.size === 0) {
      return NextResponse.json(
        {
          error:
            "El archivo seleccionado está vacío.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      archivo.size >
      10 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          error:
            "El archivo supera el límite de 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    const extension =
      archivo.name
        .split(".")
        .pop()
        ?.toLowerCase() || "";

    const extensionesPermitidas = [
      "pdf",
      "docx",
      "pptx",
      "txt",
    ];

    if (
      !extensionesPermitidas.includes(
        extension
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Solo se pueden analizar archivos PDF, DOCX, PPTX o TXT.",
        },
        {
          status: 400,
        }
      );
    }

    /* OPENAI */

    const openai = new OpenAI({
      apiKey,
    });

    const buffer = Buffer.from(
      await archivo.arrayBuffer()
    );

    const archivoPreparado =
      await toFile(
        buffer,
        archivo.name,
        {
          type:
            archivo.type ||
            "application/octet-stream",
        }
      );

    const archivoSubido =
      await openai.files.create({
        file: archivoPreparado,
        purpose: "user_data",
      });

    archivoTemporalId =
      archivoSubido.id;

    const respuesta =
      await openai.responses.create({
        model:
          process.env
            .OPENAI_SUMMARY_MODEL ||
          "gpt-4.1-mini",

        store: false,

        instructions: `
Eres un tutor académico experto en crear guías de estudio.

Analiza únicamente el contenido del documento proporcionado.

No inventes información, autores, fechas, acontecimientos, definiciones, ejemplos o fórmulas que no estén sustentados por el documento.

El resultado debe estar escrito completamente en español.

El resumen debe ser elaborado, explicativo, organizado y útil para preparar una evaluación.

Evita repetir exactamente la misma información en diferentes secciones.
        `,

        input: [
          {
            role: "user",

            content: [
              {
                type: "input_file",
                file_id:
                  archivoSubido.id,
              },

              {
                type: "input_text",

                text: `
Analiza cuidadosamente el archivo "${archivo.name}".

Crea una guía de estudio completa.

REQUISITOS:

1. TÍTULO
Crea un título académico claro y representativo.

2. MATERIA
Identifica la asignatura o área de conocimiento.

3. TIEMPO DE LECTURA
Calcula el tiempo aproximado necesario para leer y estudiar el resumen.

4. RESUMEN GENERAL
Escribe entre 3 y 6 párrafos desarrollados.
Explica:
- el tema central;
- el propósito del contenido;
- las ideas fundamentales;
- la relación entre los elementos explicados.

No escribas solamente una introducción breve.

5. DESARROLLO DEL TEMA
Divide el contenido en entre 3 y 7 secciones temáticas.

Cada sección debe contener:
- un subtítulo claro;
- una explicación desarrollada;
- información fiel al documento;
- relación con el tema general.

6. IDEAS PRINCIPALES
Incluye entre 5 y 10 ideas principales.

Cada idea debe:
- estar escrita como una oración completa;
- ser explicativa;
- representar información importante del documento.

7. CONCEPTOS CLAVE
Incluye entre 4 y 10 conceptos importantes.

Cada concepto debe tener una definición clara y basada en el documento.

8. EJEMPLOS Y APLICACIONES
Incluye ejemplos, casos, procedimientos, fórmulas o aplicaciones únicamente cuando aparezcan en el documento.

Si el material no contiene ejemplos, devuelve un arreglo vacío.

9. DATOS IMPORTANTES
Incluye entre 4 y 10 datos que el estudiante debería recordar para una evaluación.

10. CONCLUSIÓN
Escribe una conclusión desarrollada que conecte las ideas principales y explique la importancia del tema.

No devuelvas texto fuera de la estructura solicitada.
                `,
              },
            ],
          },
        ],

        max_output_tokens: 8000,

        text: {
          format: {
            type: "json_schema",
            name: "resumen_academico",
            description:
              "Guía de estudio completa y elaborada.",
            strict: true,
            schema: esquemaResumen,
          },
        },
      });

    const contenido =
      respuesta.output_text;

    if (!contenido) {
      return NextResponse.json(
        {
          error:
            "La IA no devolvió contenido. Intenta con otro archivo.",
        },
        {
          status: 500,
        }
      );
    }

    let resumen;

    try {
      resumen = JSON.parse(
        contenido
      );
    } catch {
      console.error(
        "Respuesta inválida:",
        contenido
      );

      return NextResponse.json(
        {
          error:
            "La IA respondió, pero el resumen no pudo organizarse correctamente.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      resumen,
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error(
      "Error generando resumen:",
      error
    );

    let mensaje =
      "No se pudo generar el resumen.";

    let estado = 500;

    if (error instanceof Error) {
      mensaje = error.message;
    }

    if (
      typeof error === "object" &&
      error !== null
    ) {
      const errorApi = error as {
        status?: number;
        code?: string;
        message?: string;
        error?: {
          code?: string;
          message?: string;
        };
      };

      if (errorApi.status) {
        estado =
          errorApi.status >= 400 &&
          errorApi.status < 600
            ? errorApi.status
            : 500;
      }

      if (
        errorApi.error?.message
      ) {
        mensaje =
          errorApi.error.message;
      } else if (
        errorApi.message
      ) {
        mensaje =
          errorApi.message;
      }

      const codigo =
        errorApi.error?.code ||
        errorApi.code;

      if (
        codigo ===
        "insufficient_quota"
      ) {
        mensaje =
          "La cuenta de OpenAI no tiene saldo disponible.";
      }

      if (
        codigo ===
        "invalid_api_key"
      ) {
        mensaje =
          "La clave OPENAI_API_KEY no es válida.";
      }
    }

    return NextResponse.json(
      {
        error: mensaje,
      },
      {
        status: estado,
      }
    );
  } finally {
    if (archivoTemporalId) {
      try {
        const openai =
          new OpenAI({
            apiKey:
              process.env
                .OPENAI_API_KEY,
          });

        await openai.files.delete(
          archivoTemporalId
        );
      } catch (error) {
        console.error(
          "No se eliminó el archivo temporal:",
          error
        );
      }
    }
  }
}