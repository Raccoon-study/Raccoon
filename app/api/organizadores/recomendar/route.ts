import {
  NextRequest,
  NextResponse,
} from "next/server";

import OpenAI from "openai";

const openai =
  new OpenAI({
    apiKey:
      process.env
        .OPENAI_API_KEY,
  });

type TipoOrganizador =
  | "mapa-mental"
  | "mapa-conceptual"
  | "cuadro-comparativo"
  | "linea-tiempo"
  | "diagrama-flujo"
  | "esquema-llaves";

type PlanType =
  | "free"
  | "month"
  | "year";

function normalizarPlan(
  valor: unknown,
  premium = false
): PlanType {
  const texto =
    String(
      valor || ""
    )
      .trim()
      .toLowerCase();

  if (
    texto === "year" ||
    texto === "annual" ||
    texto === "anual" ||
    texto ===
      "premium_year" ||
    texto ===
      "premium_anual"
  ) {
    return "year";
  }

  if (
    texto === "month" ||
    texto === "monthly" ||
    texto === "mensual" ||
    texto === "premium" ||
    texto ===
      "premium_month" ||
    texto ===
      "premium_mensual"
  ) {
    return "month";
  }

  return premium
    ? "month"
    : "free";
}

function obtenerBearerToken(
  request: NextRequest
) {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    !authorization
  ) {
    return null;
  }

  if (
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  return authorization
    .slice(7)
    .trim();
}

async function comprobarPremium(
  request: NextRequest
) {
  const token =
    obtenerBearerToken(
      request
    );

  if (!token) {
    return {
      ok: false,
      status: 401,
      error:
        "No hay una sesión válida.",
    };
  }

  try {
    const url =
      new URL(
        "/api/suscripciones",
        request.url
      );

    const respuesta =
      await fetch(
        url,
        {
          method:
            "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          cache:
            "no-store",
        }
      );

    if (
      !respuesta.ok
    ) {
      return {
        ok: false,
        status:
          respuesta.status,
        error:
          "No se pudo comprobar la suscripción.",
      };
    }

    const datos =
      await respuesta.json();

    const premium =
      datos?.premium ===
        true ||
      datos?.is_premium ===
        true ||
      datos?.es_premium ===
        true;

    const plan =
      normalizarPlan(
        datos?.plan ||
          datos?.subscription ||
          datos?.tipo_plan,
        premium
      );

    const esPremium =
      plan === "month" ||
      plan === "year";

    if (
      !esPremium
    ) {
      return {
        ok: false,
        status: 403,
        error:
          "Organizadores Visuales es una función Premium.",
      };
    }

    return {
      ok: true,
      token,
      plan,
    };
  } catch (
    error
  ) {
    console.error(
      "Error comprobando Premium:",
      error
    );

    return {
      ok: false,
      status: 500,
      error:
        "No se pudo comprobar la suscripción.",
    };
  }
}

function validarTipo(
  valor: unknown
): valor is TipoOrganizador {
  return [
    "mapa-mental",
    "mapa-conceptual",
    "cuadro-comparativo",
    "linea-tiempo",
    "diagrama-flujo",
    "esquema-llaves",
  ].includes(
    String(valor)
  );
}

function extraerTextoSimple(
  archivo: File
) {
  const nombre =
    archivo.name.toLowerCase();

  if (
    nombre.endsWith(
      ".txt"
    )
  ) {
    return archivo.text();
  }

  return null;
}

export async function POST(
  request: NextRequest
) {
  try {
    /* ==========================================
       1. VALIDAR PREMIUM
    ========================================== */

    const premium =
      await comprobarPremium(
        request
      );

    if (
      !premium.ok
    ) {
      return NextResponse.json(
        {
          error:
            premium.error,
          code:
            premium.status ===
            403
              ? "PREMIUM_REQUIRED"
              : "AUTH_ERROR",
        },
        {
          status:
            premium.status,
        }
      );
    }

    /* ==========================================
       2. FORM DATA
    ========================================== */

    const formData =
      await request.formData();

    const archivo =
      formData.get(
        "archivo"
      );

    if (
      !(archivo instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            "Debes subir un archivo.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      archivo.size === 0
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

    const maximo =
      20 *
      1024 *
      1024;

    if (
      archivo.size >
      maximo
    ) {
      return NextResponse.json(
        {
          error:
            "El archivo supera el límite de 20 MB.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==========================================
       3. SUBIR ARCHIVO A OPENAI
    ========================================== */

    let contenido:
      | string
      | null =
      null;

    if (
      archivo.name
        .toLowerCase()
        .endsWith(
          ".txt"
        )
    ) {
      contenido =
        await archivo.text();
    }

    let respuestaTexto =
      "";

    /* ==========================================
       4A. TXT
    ========================================== */

    if (
      contenido
    ) {
      const respuesta =
        await openai.responses.create(
          {
            model:
              "gpt-4o-mini",

            input: [
              {
                role:
                  "system",

                content:
                  `
Eres Raccoon IA, un asistente educativo experto en organización visual del aprendizaje.

Tu tarea es analizar un material de estudio y elegir UN SOLO organizador visual entre estas opciones:

- mapa-mental
- mapa-conceptual
- cuadro-comparativo
- linea-tiempo
- diagrama-flujo
- esquema-llaves

Criterios:

MAPA MENTAL:
Úsalo cuando el contenido tenga un tema central con ideas relacionadas, lluvia de ideas, características o asociaciones.

MAPA CONCEPTUAL:
Úsalo cuando existan conceptos relacionados jerárquicamente, definiciones, categorías, causas, funciones o relaciones entre conceptos.

CUADRO COMPARATIVO:
Úsalo cuando el contenido compare dos o más elementos, características, ventajas, diferencias, semejanzas, tipos o categorías.

LÍNEA DE TIEMPO:
Úsala cuando el contenido tenga fechas, periodos, etapas históricas, evolución o eventos en orden cronológico.

DIAGRAMA DE FLUJO:
Úsalo cuando el material describa un proceso, procedimiento, pasos consecutivos, decisiones o secuencias operativas.

ESQUEMA DE LLAVES:
Úsalo cuando el contenido sea principalmente jerárquico y pueda dividirse en tema, categorías, subcategorías y detalles.

Devuelve solamente JSON válido.

Formato:

{
  "tipo": "mapa-conceptual",
  "razon": "Explicación breve",
  "confianza": 0.92
}

No agregues Markdown.
No agregues texto fuera del JSON.
                  `,
              },

              {
                role:
                  "user",

                content:
                  `Analiza el siguiente material:\n\n${contenido.slice(
                    0,
                    50000
                  )}`,
              },
            ],
          }
        );

      respuestaTexto =
        respuesta.output_text;
    } else {
      /* ========================================
         4B. PDF / DOCX / PPTX
      ======================================== */

      const archivoOpenAI =
        await openai.files.create(
          {
            file:
              archivo,

            purpose:
              "user_data",
          }
        );

      const respuesta =
        await openai.responses.create(
          {
            model:
              "gpt-4o-mini",

            input: [
              {
                role:
                  "system",

                content:
                  `
Eres Raccoon IA, un asistente educativo experto en organización visual del aprendizaje.

Analiza el archivo entregado y recomienda UN SOLO organizador visual.

Opciones permitidas:

mapa-mental
mapa-conceptual
cuadro-comparativo
linea-tiempo
diagrama-flujo
esquema-llaves

Usa estas reglas:

Mapa mental:
tema central con ideas relacionadas.

Mapa conceptual:
conceptos jerárquicos y relaciones entre conceptos.

Cuadro comparativo:
comparaciones entre dos o más elementos.

Línea de tiempo:
fechas, etapas, periodos y eventos cronológicos.

Diagrama de flujo:
procesos, pasos, decisiones y procedimientos.

Esquema de llaves:
tema principal dividido en categorías y subcategorías.

Devuelve exclusivamente:

{
  "tipo": "...",
  "razon": "...",
  "confianza": 0.0
}

No escribas Markdown.
                  `,
              },

              {
                role:
                  "user",

                content: [
                  {
                    type:
                      "input_file",

                    file_id:
                      archivoOpenAI.id,
                  },

                  {
                    type:
                      "input_text",

                    text:
                      "Analiza este material y recomienda el mejor organizador visual para estudiarlo.",
                  },
                ],
              },
            ],
          }
        );

      respuestaTexto =
        respuesta.output_text;

      try {
        await openai.files.delete(
          archivoOpenAI.id
        );
      } catch (
        error
      ) {
        console.warn(
          "No se pudo borrar el archivo temporal:",
          error
        );
      }
    }

    /* ==========================================
       5. PARSEAR RESPUESTA
    ========================================== */

    let resultado: {
      tipo:
        TipoOrganizador;
      razon: string;
      confianza: number;
    };

    try {
      const limpio =
        respuestaTexto
          .replace(
            /```json/gi,
            ""
          )
          .replace(
            /```/g,
            ""
          )
          .trim();

      const datos =
        JSON.parse(
          limpio
        );

      if (
        !validarTipo(
          datos.tipo
        )
      ) {
        throw new Error(
          "Tipo inválido"
        );
      }

      resultado = {
        tipo:
          datos.tipo,

        razon:
          typeof datos.razon ===
          "string"
            ? datos.razon
            : "Este formato se adapta mejor a la estructura del material.",

        confianza:
          typeof datos.confianza ===
          "number"
            ? Math.min(
                1,
                Math.max(
                  0,
                  datos.confianza
                )
              )
            : 0.8,
      };
    } catch (
      error
    ) {
      console.error(
        "No se pudo interpretar la recomendación:",
        respuestaTexto,
        error
      );

      resultado = {
        tipo:
          "mapa-conceptual",

        razon:
          "El contenido presenta conceptos que pueden organizarse y relacionarse visualmente.",

        confianza:
          0.7,
      };
    }

    /* ==========================================
       6. RESPUESTA
    ========================================== */

    return NextResponse.json(
      {
        ok: true,
        tipo:
          resultado.tipo,
        razon:
          resultado.razon,
        confianza:
          resultado.confianza,
      },
      {
        status: 200,
      }
    );
  } catch (
    error
  ) {
    console.error(
      "Error en /api/organizadores/recomendar:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo analizar el material.",
      },
      {
        status: 500,
      }
    );
  }
}