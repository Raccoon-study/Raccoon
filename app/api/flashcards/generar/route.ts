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

type ModoEstudio =
  | "normal"
  | "smart";

type DificultadTarjeta =
  | "easy"
  | "medium"
  | "hard";

interface TarjetaGenerada {
  id: string;
  frente: string;
  reverso: string;
  pista: string;
  ejemplo: string;
  categoria: string;
  dificultad: DificultadTarjeta;
}

interface MazoGenerado {
  titulo: string;
  materia: string;
  tarjetas: TarjetaGenerada[];
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
        detectSessionInUrl: false,
      },
    }
  );
}

function crearOpenAI() {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Falta OPENAI_API_KEY."
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

  return token.trim();
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
    texto === "premium_year" ||
    texto === "premium_anual"
  ) {
    return "year";
  }

  if (
    texto === "month" ||
    texto === "monthly" ||
    texto === "mensual" ||
    texto === "premium" ||
    texto === "premium_month" ||
    texto === "premium_mensual"
  ) {
    return "month";
  }

  return premium ? "month" : "free";
}

function esTipoFuente(
  valor: string
): valor is TipoFuente {
  return (
    valor === "archivo" ||
    valor === "texto" ||
    valor === "biblioteca"
  );
}

function esModoEstudio(
  valor: string
): valor is ModoEstudio {
  return (
    valor === "normal" ||
    valor === "smart"
  );
}

function esImagen(
  nombre: string,
  mime: string
): boolean {
  const extension =
    nombre
      .split(".")
      .pop()
      ?.toLowerCase() || "";

  return (
    mime.startsWith("image/") ||
    [
      "png",
      "jpg",
      "jpeg",
      "webp",
    ].includes(extension)
  );
}

function validarMazo(
  valor: unknown
): valor is MazoGenerado {
  if (
    typeof valor !== "object" ||
    valor === null
  ) {
    return false;
  }

  const mazo =
    valor as Record<
      string,
      unknown
    >;

  if (
    typeof mazo.titulo !==
      "string" ||
    typeof mazo.materia !==
      "string" ||
    !Array.isArray(
      mazo.tarjetas
    )
  ) {
    return false;
  }

  return mazo.tarjetas.every(
    (tarjeta) => {
      if (
        typeof tarjeta !==
          "object" ||
        tarjeta === null
      ) {
        return false;
      }

      const item =
        tarjeta as Record<
          string,
          unknown
        >;

      return (
        typeof item.id ===
          "string" &&
        typeof item.frente ===
          "string" &&
        typeof item.reverso ===
          "string" &&
        typeof item.pista ===
          "string" &&
        typeof item.ejemplo ===
          "string" &&
        typeof item.categoria ===
          "string" &&
        (
          item.dificultad ===
            "easy" ||
          item.dificultad ===
            "medium" ||
          item.dificultad ===
            "hard"
        )
      );
    }
  );
}

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
          Authorization:
            `Bearer ${apiKey}`,
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
          success: false,
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
          success: false,
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

    if (
      suscripcion?.plan
    ) {
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

    const modoValor =
      String(
        formulario.get(
          "modo_estudio"
        ) || ""
      );

    const cantidad =
      Number(
        formulario.get(
          "cantidad_tarjetas"
        )
      );

    if (
      !esTipoFuente(
        fuenteValor
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Fuente no válida.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !esModoEstudio(
        modoValor
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Modo de estudio no válido.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      ![
        10,
        20,
        30,
        40,
        50,
      ].includes(cantidad)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cantidad de tarjetas no válida.",
        },
        {
          status: 400,
        }
      );
    }

    /* RESTRICCIONES GRATIS */

    let mazosCreadosHoy = 0;

    if (!esPremium) {
      if (cantidad > 20) {
        return NextResponse.json(
          {
            success: false,
            error:
              "El plan gratuito permite hasta 20 tarjetas.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        modoValor === "smart"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "El repaso inteligente es una función Premium.",
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
        .from("flashcard_sets")
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

      mazosCreadosHoy =
        count || 0;

      if (
        mazosCreadosHoy >= 3
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Alcanzaste el límite de 3 mazos diarios del plan gratuito.",
          },
          {
            status: 403,
          }
        );
      }
    }

    /* PREPARAR MATERIAL */

    const contenidoEntrada: Array<
      Record<string, unknown>
    > = [];

    contenidoEntrada.push({
      type: "input_text",

      text: `
Crea un mazo educativo de flashcards utilizando exclusivamente el material proporcionado.

Configuración:
- Cantidad exacta: ${cantidad} tarjetas.
- Idioma: español.
- Cada tarjeta debe tratar una idea importante.
- El frente debe contener una pregunta, término o concepto breve.
- El reverso debe contener una respuesta clara, completa y fácil de estudiar.
- La pista debe ayudar sin revelar directamente la respuesta.
- El ejemplo debe mostrar una aplicación real o sencilla.
- La categoría debe ser una palabra o frase corta.
- La dificultad debe ser easy, medium o hard.
- No repitas tarjetas.
- No inventes información fuera del material.
- Detecta un título apropiado para el mazo.
- Detecta la materia principal.
      `.trim(),
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
      if (
        texto.length < 50
      ) {
        return NextResponse.json(
          {
            success: false,
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
        text:
          `Material del estudiante:\n\n${texto}`,
      });
    } else {
      let nombreArchivo = "";
      let tipoMime =
        "application/octet-stream";
      let buffer: Buffer;

      if (
        fuenteValor === "archivo"
      ) {
        if (
          !(
            archivoFormulario instanceof
            File
          )
        ) {
          return NextResponse.json(
            {
              success: false,
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
              success: false,

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
              success: false,
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
              success: false,
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
            success: false,
            error:
              "El archivo está vacío.",
          },
          {
            status: 400,
          }
        );
      }

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

      if (
        esImagen(
          nombreArchivo,
          tipoMime
        )
      ) {
        contenidoEntrada.push({
          type: "input_image",
          file_id:
            archivoOpenAI.id,
          detail: "high",
        });
      } else {
        contenidoEntrada.push({
          type: "input_file",
          file_id:
            archivoOpenAI.id,
        });
      }
    }

    /* GENERAR CON IA */

    const modelo =
      process.env
        .OPENAI_FLASHCARD_MODEL ||
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

              name:
                "flashcards_raccoon",

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

                  tarjetas: {
                    type: "array",

                    items: {
                      type: "object",

                      additionalProperties:
                        false,

                      properties: {
                        id: {
                          type: "string",
                        },

                        frente: {
                          type: "string",
                        },

                        reverso: {
                          type: "string",
                        },

                        pista: {
                          type: "string",
                        },

                        ejemplo: {
                          type: "string",
                        },

                        categoria: {
                          type: "string",
                        },

                        dificultad: {
                          type: "string",

                          enum: [
                            "easy",
                            "medium",
                            "hard",
                          ],
                        },
                      },

                      required: [
                        "id",
                        "frente",
                        "reverso",
                        "pista",
                        "ejemplo",
                        "categoria",
                        "dificultad",
                      ],
                    },
                  },
                },

                required: [
                  "titulo",
                  "materia",
                  "tarjetas",
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

    let mazoGenerado: unknown;

    try {
      mazoGenerado =
        JSON.parse(
          textoRespuesta
        );
    } catch {
      throw new Error(
        "La respuesta de la IA no contiene JSON válido."
      );
    }

    if (
      !validarMazo(
        mazoGenerado
      )
    ) {
      throw new Error(
        "La IA devolvió un mazo incompleto."
      );
    }

    if (
      mazoGenerado.tarjetas.length !==
      cantidad
    ) {
      throw new Error(
        `La IA generó ${mazoGenerado.tarjetas.length} tarjetas, pero se solicitaron ${cantidad}.`
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
      data: mazoGuardado,
      error: errorGuardar,
    } = await supabaseAdmin
      .from("flashcard_sets")
      .insert({
        usuario_id:
          user.id,

        material_id:
          materialId || null,

        titulo:
          mazoGenerado.titulo,

        materia:
          mazoGenerado.materia,

        cantidad_tarjetas:
          cantidad,

        modo_estudio:
          modoValor,

        tarjetas:
          mazoGenerado.tarjetas,

        estado:
          "creado",

        tarjetas_estudiadas:
          0,

        tarjetas_dominadas:
          0,

        progreso:
          0,
      })
      .select("*")
      .single();

    if (errorGuardar) {
      throw new Error(
        `Las tarjetas fueron generadas, pero no pudieron guardarse: ${errorGuardar.message}`
      );
    }

    const restantes =
      esPremium
        ? null
        : Math.max(
            3 -
              (
                mazosCreadosHoy +
                1
              ),
            0
          );

    return NextResponse.json(
      {
        success: true,

        mazo:
          mazoGuardado,

        premium:
          esPremium,

        mazos_restantes:
          restantes,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Error generando flashcards:",
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