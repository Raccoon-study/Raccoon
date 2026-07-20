import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

import OpenAI, {
  toFile,
} from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =====================================================
   TIPOS
===================================================== */

type PlanType =
  | "free"
  | "month"
  | "year";

type TipoFuente =
  | "archivo"
  | "texto"
  | "biblioteca";

type TipoPregunta =
  | "multiple"
  | "true_false"
  | "short"
  | "mixed";

type Dificultad =
  | "easy"
  | "medium"
  | "hard";

interface PreguntaGenerada {
  id: string;
  tipo:
    | "multiple"
    | "true_false"
    | "short";
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
  explicacion: string;
}

interface QuizGenerado {
  titulo: string;
  materia: string;
  preguntas: PreguntaGenerada[];
}

/* =====================================================
   CLIENTES
===================================================== */

function crearSupabaseAdmin() {
  const url =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const serviceRole =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  if (!serviceRole) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(
    url,
    serviceRole,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function crearOpenAI() {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Falta OPENAI_API_KEY en .env.local."
    );
  }

  return new OpenAI({
    apiKey,
  });
}

/* =====================================================
   AUXILIARES
===================================================== */

function obtenerToken(
  request: NextRequest
): string | null {
  const autorizacion =
    request.headers.get(
      "authorization"
    );

  if (!autorizacion) {
    return null;
  }

  const [tipo, token] =
    autorizacion.split(" ");

  if (
    tipo?.toLowerCase() !==
      "bearer" ||
    !token
  ) {
    return null;
  }

  return token;
}

function normalizarPlan(
  valor: unknown,
  premium = false
): PlanType {
  const texto = String(valor || "")
    .trim()
    .toLowerCase();

  if (
    texto === "year" ||
    texto === "annual" ||
    texto === "anual" ||
    texto === "premium_year"
  ) {
    return "year";
  }

  if (
    texto === "month" ||
    texto === "monthly" ||
    texto === "mensual" ||
    texto === "premium"
  ) {
    return "month";
  }

  return premium ? "month" : "free";
}

function esTipoFuente(
  valor: string
): valor is TipoFuente {
  return [
    "archivo",
    "texto",
    "biblioteca",
  ].includes(valor);
}

function esTipoPregunta(
  valor: string
): valor is TipoPregunta {
  return [
    "multiple",
    "true_false",
    "short",
    "mixed",
  ].includes(valor);
}

function esDificultad(
  valor: string
): valor is Dificultad {
  return [
    "easy",
    "medium",
    "hard",
  ].includes(valor);
}

function esImagen(
  nombre: string,
  tipoMime: string
): boolean {
  const extension =
    nombre
      .split(".")
      .pop()
      ?.toLowerCase() || "";

  return (
    tipoMime.startsWith("image/") ||
    [
      "png",
      "jpg",
      "jpeg",
      "webp",
    ].includes(extension)
  );
}

function bufferADataUrl(
  buffer: Buffer,
  tipoMime: string
): string {
  return `data:${
    tipoMime || "image/jpeg"
  };base64,${buffer.toString(
    "base64"
  )}`;
}

function nombreTipo(
  tipo: TipoPregunta
): string {
  if (tipo === "true_false") {
    return "verdadero o falso";
  }

  if (tipo === "short") {
    return "respuesta corta";
  }

  if (tipo === "mixed") {
    return "una combinación equilibrada de opción múltiple, verdadero o falso y respuesta corta";
  }

  return "opción múltiple";
}

function nombreDificultad(
  dificultad: Dificultad
): string {
  if (dificultad === "hard") {
    return "avanzada";
  }

  if (dificultad === "medium") {
    return "intermedia";
  }

  return "fácil";
}

function validarQuiz(
  valor: unknown
): valor is QuizGenerado {
  if (
    typeof valor !== "object" ||
    valor === null
  ) {
    return false;
  }

  const quiz =
    valor as Record<
      string,
      unknown
    >;

  if (
    typeof quiz.titulo !==
      "string" ||
    typeof quiz.materia !==
      "string" ||
    !Array.isArray(
      quiz.preguntas
    )
  ) {
    return false;
  }

  return quiz.preguntas.every(
    (pregunta) => {
      if (
        typeof pregunta !==
          "object" ||
        pregunta === null
      ) {
        return false;
      }

      const item =
        pregunta as Record<
          string,
          unknown
        >;

      return (
        typeof item.id ===
          "string" &&
        typeof item.tipo ===
          "string" &&
        typeof item.pregunta ===
          "string" &&
        Array.isArray(
          item.opciones
        ) &&
        item.opciones.every(
          (opcion) =>
            typeof opcion ===
            "string"
        ) &&
        typeof item.respuesta_correcta ===
          "string" &&
        typeof item.explicacion ===
          "string"
      );
    }
  );
}

/* =====================================================
   ELIMINAR ARCHIVO TEMPORAL OPENAI
===================================================== */

async function eliminarArchivoOpenAI(
  fileId: string
) {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return;
  }

  try {
    await fetch(
      `https://api.openai.com/v1/files/${fileId}`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
  } catch (error) {
    console.warn(
      "No se eliminó el archivo temporal:",
      error
    );
  }
}

/* =====================================================
   POST
===================================================== */

export async function POST(
  request: NextRequest
) {
  let archivoOpenAIId:
    | string
    | null = null;

  try {
    const supabaseAdmin =
      crearSupabaseAdmin();

    const openai =
      crearOpenAI();

    const token =
      obtenerToken(request);

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: { user },
      error: errorUsuario,
    } =
      await supabaseAdmin.auth.getUser(
        token
      );

    if (
      errorUsuario ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "La sesión no es válida.",
        },
        {
          status: 401,
        }
      );
    }

    /* PLAN */

    const metadata = {
      ...(user.user_metadata || {}),
      ...(user.app_metadata || {}),
    };

    const premiumMetadata =
      metadata.premium === true ||
      metadata.is_premium === true ||
      metadata.es_premium === true;

    let planActual =
      normalizarPlan(
        metadata.plan ||
          metadata.subscription ||
          metadata.tipo_plan,
        premiumMetadata
      );

    const {
      data: suscripcion,
    } = await supabaseAdmin
      .from("subscriptions")
      .select("plan, status")
      .eq(
        "usuario_id",
        user.id
      )
      .eq("status", "active")
      .maybeSingle();

    if (suscripcion?.plan) {
      planActual =
        normalizarPlan(
          suscripcion.plan
        );
    }

    const esPremium =
      planActual === "month" ||
      planActual === "year";

    /* FORMULARIO */

    const formulario =
      await request.formData();

    const fuenteValor =
      String(
        formulario.get("fuente") ||
          ""
      );

    const tipoValor =
      String(
        formulario.get(
          "tipo_preguntas"
        ) || ""
      );

    const dificultadValor =
      String(
        formulario.get(
          "dificultad"
        ) || ""
      );

    const cantidad =
      Number(
        formulario.get(
          "cantidad_preguntas"
        )
      );

    if (
      !esTipoFuente(
        fuenteValor
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Fuente no válida.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !esTipoPregunta(
        tipoValor
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Tipo de preguntas no válido.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !esDificultad(
        dificultadValor
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Dificultad no válida.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      ![5, 10, 15, 20, 25].includes(
        cantidad
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Cantidad de preguntas no válida.",
        },
        {
          status: 400,
        }
      );
    }

    /* RESTRICCIONES GRATIS */

    if (!esPremium) {
      if (
        tipoValor === "short" ||
        tipoValor === "mixed"
      ) {
        return NextResponse.json(
          {
            error:
              "Respuesta corta y modo mixto son funciones Premium.",
          },
          {
            status: 403,
          }
        );
      }

      if (cantidad > 10) {
        return NextResponse.json(
          {
            error:
              "El plan gratuito permite hasta 10 preguntas.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        dificultadValor ===
        "hard"
      ) {
        return NextResponse.json(
          {
            error:
              "La dificultad avanzada es Premium.",
          },
          {
            status: 403,
          }
        );
      }

      const inicioDia =
        new Date();

      inicioDia.setHours(
        0,
        0,
        0,
        0
      );

      const {
        count,
        error: errorConteo,
      } = await supabaseAdmin
        .from("quizzes")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "usuario_id",
          user.id
        )
        .gte(
          "fecha_creacion",
          inicioDia.toISOString()
        );

      if (errorConteo) {
        throw new Error(
          `No se pudo comprobar el límite diario: ${errorConteo.message}`
        );
      }

      if ((count || 0) >= 3) {
        return NextResponse.json(
          {
            error:
              "Alcanzaste el límite de 3 quizzes diarios del plan gratuito.",
          },
          {
            status: 403,
          }
        );
      }
    }

    /* PREPARAR CONTENIDO */

    const contenidoEntrada: Array<
      Record<string, unknown>
    > = [];

    const instrucciones = `
Genera un quiz educativo usando exclusivamente el material proporcionado.

Configuración:
- Cantidad exacta: ${cantidad} preguntas.
- Tipo: ${nombreTipo(tipoValor)}.
- Dificultad: ${nombreDificultad(dificultadValor)}.
- Idioma: español.
- Cada pregunta debe ser clara y tener una sola respuesta correcta.
- No inventes información que no aparezca en el material.
- En opción múltiple crea exactamente cuatro opciones.
- En verdadero o falso usa las opciones "Verdadero" y "Falso".
- En respuesta corta devuelve un arreglo de opciones vacío.
- Incluye una explicación educativa y breve para cada respuesta.
- Detecta un título apropiado y la materia principal.
`;

    contenidoEntrada.push({
      type: "input_text",
      text: instrucciones,
    });

    const archivoFormulario =
      formulario.get("archivo");

    const texto =
      String(
        formulario.get("texto") ||
          ""
      ).trim();

    const materialUrl =
      String(
        formulario.get(
          "material_url"
        ) || ""
      ).trim();

    const materialNombre =
      String(
        formulario.get(
          "material_nombre"
        ) || "material"
      ).trim();

    if (
      fuenteValor === "texto"
    ) {
      if (texto.length < 50) {
        return NextResponse.json(
          {
            error:
              "El texto debe tener al menos 50 caracteres.",
          },
          {
            status: 400,
          }
        );
      }

      contenidoEntrada.push({
        type: "input_text",
        text: `Material del estudiante:\n\n${texto}`,
      });
    } else {
      let nombreArchivo = "";
      let tipoMime =
        "application/octet-stream";
      let buffer: Buffer;

      if (
        fuenteValor ===
        "archivo"
      ) {
        if (
          !(archivoFormulario instanceof File)
        ) {
          return NextResponse.json(
            {
              error:
                "No se recibió el archivo.",
            },
            {
              status: 400,
            }
          );
        }

        const limite =
          esPremium
            ? 25 * 1024 * 1024
            : 10 * 1024 * 1024;

        if (
          archivoFormulario.size >
          limite
        ) {
          return NextResponse.json(
            {
              error: esPremium
                ? "El archivo supera los 25 MB."
                : "El plan gratuito permite archivos de hasta 10 MB.",
            },
            {
              status: 400,
            }
          );
        }

        nombreArchivo =
          archivoFormulario.name;

        tipoMime =
          archivoFormulario.type ||
          tipoMime;

        buffer = Buffer.from(
          await archivoFormulario.arrayBuffer()
        );
      } else {
        if (!materialUrl) {
          return NextResponse.json(
            {
              error:
                "El material no contiene una URL válida.",
            },
            {
              status: 400,
            }
          );
        }

        const respuestaMaterial =
          await fetch(
            materialUrl,
            {
              cache: "no-store",
            }
          );

        if (
          !respuestaMaterial.ok
        ) {
          return NextResponse.json(
            {
              error:
                "No se pudo obtener el material guardado.",
            },
            {
              status: 400,
            }
          );
        }

        nombreArchivo =
          materialNombre;

        tipoMime =
          respuestaMaterial.headers.get(
            "content-type"
          ) ||
          tipoMime;

        buffer = Buffer.from(
          await respuestaMaterial.arrayBuffer()
        );
      }

      if (
        buffer.length === 0
      ) {
        return NextResponse.json(
          {
            error:
              "El archivo está vacío.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        esImagen(
          nombreArchivo,
          tipoMime
        )
      ) {
        contenidoEntrada.push({
          type: "input_image",
          image_url:
            bufferADataUrl(
              buffer,
              tipoMime
            ),
          detail: "high",
        });
      } else {
        const archivoOpenAI =
          await openai.files.create({
            file: await toFile(
              buffer,
              nombreArchivo,
              {
                type: tipoMime,
              }
            ),

            purpose: "user_data",
          });

        archivoOpenAIId =
          archivoOpenAI.id;

        contenidoEntrada.push({
          type: "input_file",
          file_id:
            archivoOpenAI.id,
        });
      }
    }

    /* GENERAR */

    const modelo =
      process.env
        .OPENAI_QUIZ_MODEL ||
      "gpt-5-mini";

    const respuestaIA =
      await openai.responses.create(
        {
          model: modelo,

          store: false,

          input: [
            {
              role: "user",

              content:
                contenidoEntrada,
            },
          ],

          text: {
            format: {
              type: "json_schema",

              name: "quiz_raccoon",

              strict: true,

              schema: {
                type: "object",

                additionalProperties:
                  false,

                properties: {
                  titulo: {
                    type: "string",
                  },

                  materia: {
                    type: "string",
                  },

                  preguntas: {
                    type: "array",

                    items: {
                      type: "object",

                      additionalProperties:
                        false,

                      properties: {
                        id: {
                          type: "string",
                        },

                        tipo: {
                          type: "string",

                          enum: [
                            "multiple",
                            "true_false",
                            "short",
                          ],
                        },

                        pregunta: {
                          type: "string",
                        },

                        opciones: {
                          type: "array",

                          items: {
                            type: "string",
                          },
                        },

                        respuesta_correcta:
                          {
                            type: "string",
                          },

                        explicacion: {
                          type: "string",
                        },
                      },

                      required: [
                        "id",
                        "tipo",
                        "pregunta",
                        "opciones",
                        "respuesta_correcta",
                        "explicacion",
                      ],
                    },
                  },
                },

                required: [
                  "titulo",
                  "materia",
                  "preguntas",
                ],
              },
            },
          },
        } as never
      );

    const textoRespuesta =
      respuestaIA.output_text;

    if (!textoRespuesta) {
      throw new Error(
        "La IA no devolvió contenido."
      );
    }

    let quizGenerado: unknown;

    try {
      quizGenerado =
        JSON.parse(
          textoRespuesta
        );
    } catch {
      throw new Error(
        "La respuesta de la IA no contiene JSON válido."
      );
    }

    if (
      !validarQuiz(
        quizGenerado
      )
    ) {
      throw new Error(
        "La IA devolvió un quiz incompleto."
      );
    }

    if (
      quizGenerado.preguntas.length !==
      cantidad
    ) {
      throw new Error(
        `La IA generó ${quizGenerado.preguntas.length} preguntas, pero se solicitaron ${cantidad}.`
      );
    }

    /* GUARDAR */

    const materialId =
      String(
        formulario.get(
          "material_id"
        ) || ""
      );

    const {
      data: quizGuardado,
      error: errorGuardar,
    } = await supabaseAdmin
      .from("quizzes")
      .insert({
        usuario_id: user.id,

        material_id:
          materialId || null,

        titulo:
          quizGenerado.titulo,

        materia:
          quizGenerado.materia,

        tipo_preguntas:
          tipoValor,

        cantidad_preguntas:
          cantidad,

        dificultad:
          dificultadValor,

        preguntas:
          quizGenerado.preguntas,

        estado: "creado",

        respuestas_correctas: 0,

        preguntas_respondidas: 0,

        precision: 0,
      })
      .select("*")
      .single();

    if (errorGuardar) {
      throw new Error(
        `El quiz se generó, pero no pudo guardarse: ${errorGuardar.message}`
      );
    }

    return NextResponse.json(
      {
        success: true,

        quiz:
          quizGuardado,

        premium:
          esPremium,

        quizzes_restantes:
          esPremium
            ? null
            : 2,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Error generando quiz:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Error del servidor.",
      },
      {
        status: 500,
      }
    );
  } finally {
    if (archivoOpenAIId) {
      await eliminarArchivoOpenAI(
        archivoOpenAIId
      );
    }
  }
}