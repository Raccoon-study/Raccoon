import {
  NextRequest,
  NextResponse,
} from "next/server";

import OpenAI from "openai";

/* =========================================================
   OPENAI
========================================================= */

const openai =
  new OpenAI({
    apiKey:
      process.env
        .OPENAI_API_KEY,
  });

/* =========================================================
   TIPOS
========================================================= */

type PlanType =
  | "free"
  | "month"
  | "year";

type TipoOrganizador =
  | "mapa-mental"
  | "mapa-conceptual"
  | "cuadro-comparativo"
  | "linea-tiempo"
  | "diagrama-flujo"
  | "esquema-llaves";

type NivelDetalle =
  | "basico"
  | "intermedio"
  | "profundo";

/* =========================================================
   VALIDACIONES
========================================================= */

const TIPOS_VALIDOS: TipoOrganizador[] =
  [
    "mapa-mental",
    "mapa-conceptual",
    "cuadro-comparativo",
    "linea-tiempo",
    "diagrama-flujo",
    "esquema-llaves",
  ];

const NIVELES_VALIDOS: NivelDetalle[] =
  [
    "basico",
    "intermedio",
    "profundo",
  ];

function esTipoOrganizador(
  valor: unknown
): valor is TipoOrganizador {
  return TIPOS_VALIDOS.includes(
    String(
      valor
    ) as TipoOrganizador
  );
}

function esNivelDetalle(
  valor: unknown
): valor is NivelDetalle {
  return NIVELES_VALIDOS.includes(
    String(
      valor
    ) as NivelDetalle
  );
}

/* =========================================================
   PLAN
========================================================= */

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

/* =========================================================
   TOKEN
========================================================= */

function obtenerBearerToken(
  request: NextRequest
) {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    !authorization ||
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

/* =========================================================
   COMPROBAR PREMIUM
========================================================= */

async function comprobarPremium(
  request: NextRequest
) {
  const token =
    obtenerBearerToken(
      request
    );

  if (!token) {
    return {
      ok: false as const,
      status: 401,
      error:
        "No hay una sesión válida.",
    };
  }

  try {
    /*
      IMPORTANTE:

      Estamos usando exactamente
      /api/suscripciones,
      igual que Dashboard.
    */

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
        ok: false as const,
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
        ok: false as const,
        status: 403,
        error:
          "Organizadores Visuales está disponible exclusivamente con Raccoon Premium.",
      };
    }

    return {
      ok: true as const,
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
      ok: false as const,
      status: 500,
      error:
        "No se pudo comprobar la suscripción.",
    };
  }
}

/* =========================================================
   LÍMITES SEGÚN NIVEL
========================================================= */

function instruccionesNivel(
  nivel: NivelDetalle
) {
  if (
    nivel === "basico"
  ) {
    return `
NIVEL BÁSICO:
- Prioriza únicamente la información esencial.
- Usa aproximadamente entre 5 y 8 elementos principales.
- Evita explicaciones largas.
- Cada descripción debe ser breve.
- El resultado debe poder entenderse rápidamente.
`;
  }

  if (
    nivel === "profundo"
  ) {
    return `
NIVEL PROFUNDO:
- Incluye información importante y secundaria útil.
- Usa aproximadamente entre 12 y 20 elementos cuando el material lo permita.
- Incluye relaciones, subtemas y detalles relevantes.
- Mantén claridad visual aunque exista más información.
- No inventes información que no esté presente en el material.
`;
  }

  return `
NIVEL INTERMEDIO:
- Incluye ideas principales y conceptos secundarios relevantes.
- Usa aproximadamente entre 8 y 13 elementos cuando sea apropiado.
- Mantén equilibrio entre detalle y claridad visual.
- Incluye relaciones importantes.
- No llenes el organizador con información innecesaria.
`;
}

/* =========================================================
   INSTRUCCIONES POR ORGANIZADOR
========================================================= */

function instruccionesTipo(
  tipo: TipoOrganizador
) {
  switch (
    tipo
  ) {
    case "mapa-mental":
      return `
VAS A GENERAR UN MAPA MENTAL.

Objetivo:
- Identifica un tema central.
- Crea ramas principales.
- Cada rama puede contener ideas secundarias.
- Las palabras deben ser breves y fáciles de recordar.
- Evita párrafos.
- Las conexiones deben partir principalmente del tema central o de sus ramas.

Los campos tabla, timeline y pasos deben quedar vacíos si no son necesarios.
`;

    case "mapa-conceptual":
      return `
VAS A GENERAR UN MAPA CONCEPTUAL.

Objetivo:
- Organiza los conceptos jerárquicamente.
- Usa un concepto principal.
- Relaciona conceptos mediante palabras de enlace.
- Las conexiones deben tener significado.
- Prioriza relaciones como:
  "se divide en",
  "incluye",
  "produce",
  "causa",
  "depende de",
  "se caracteriza por",
  "forma parte de".

Los campos tabla, timeline y pasos deben quedar vacíos si no son necesarios.
`;

    case "cuadro-comparativo":
      return `
VAS A GENERAR UN CUADRO COMPARATIVO.

Objetivo:
- Detecta los elementos que realmente pueden compararse.
- Crea columnas para los elementos.
- Crea filas con criterios de comparación.
- Los valores deben ser cortos, específicos y fáciles de leer.
- Evita repetir exactamente la misma información.

Debes llenar especialmente:
tabla.columnas
tabla.filas

Los nodos pueden contener solamente el tema principal y los elementos comparados.

timeline y pasos deben quedar vacíos.
`;

    case "linea-tiempo":
      return `
VAS A GENERAR UNA LÍNEA DE TIEMPO.

Objetivo:
- Detecta fechas, periodos, etapas o secuencias cronológicas.
- Ordena los eventos correctamente.
- Resume qué ocurrió en cada momento.
- No inventes fechas.
- Si el material no contiene una fecha exacta pero sí etapas claras, usa nombres como:
  "Primera etapa",
  "Etapa inicial",
  "Etapa final".

Debes llenar especialmente el arreglo timeline.

tabla y pasos deben quedar vacíos.
`;

    case "diagrama-flujo":
      return `
VAS A GENERAR UN DIAGRAMA DE FLUJO.

Objetivo:
- Identifica un proceso o procedimiento.
- Ordena correctamente cada paso.
- Detecta decisiones cuando existan.
- Los tipos permitidos para cada paso son:
  "inicio"
  "proceso"
  "decision"
  "fin"

Cada paso debe indicar mediante siguiente los IDs de los pasos que siguen.

Debes llenar especialmente el arreglo pasos.

tabla y timeline deben quedar vacíos.
`;

    case "esquema-llaves":
      return `
VAS A GENERAR UN ESQUEMA DE LLAVES.

Objetivo:
- Identifica el tema principal.
- Divide el tema en categorías.
- Divide cada categoría en subcategorías o conceptos.
- Usa jerarquías claras.
- Evita párrafos largos.
- Los niveles deben reflejar la profundidad de cada elemento.

Los campos tabla, timeline y pasos deben quedar vacíos si no son necesarios.
`;

    default:
      return "";
  }
}

/* =========================================================
   ESQUEMA STRUCTURED OUTPUT
========================================================= */

const esquemaOrganizador = {
  type: "object",

  additionalProperties:
    false,

  properties: {
    tipo: {
      type: "string",

      enum:
        TIPOS_VALIDOS,
    },

    titulo: {
      type: "string",
    },

    subtitulo: {
      type: "string",
    },

    temaCentral: {
      type: "string",
    },

    resumen: {
      type: "string",
    },

    nodos: {
      type: "array",

      items: {
        type: "object",

        additionalProperties:
          false,

        properties: {
          id: {
            type: "string",
          },

          titulo: {
            type: "string",
          },

          descripcion: {
            type: "string",
          },

          nivel: {
            type: "integer",
          },

          categoria: {
            type: "string",
          },

          orden: {
            type: "integer",
          },
        },

        required: [
          "id",
          "titulo",
          "descripcion",
          "nivel",
          "categoria",
          "orden",
        ],
      },
    },

    conexiones: {
      type: "array",

      items: {
        type: "object",

        additionalProperties:
          false,

        properties: {
          id: {
            type: "string",
          },

          origen: {
            type: "string",
          },

          destino: {
            type: "string",
          },

          etiqueta: {
            type: "string",
          },
        },

        required: [
          "id",
          "origen",
          "destino",
          "etiqueta",
        ],
      },
    },

    grupos: {
      type: "array",

      items: {
        type: "object",

        additionalProperties:
          false,

        properties: {
          titulo: {
            type: "string",
          },

          items: {
            type: "array",

            items: {
              type: "string",
            },
          },
        },

        required: [
          "titulo",
          "items",
        ],
      },
    },

    tabla: {
      type: "object",

      additionalProperties:
        false,

      properties: {
        columnas: {
          type: "array",

          items: {
            type: "string",
          },
        },

        filas: {
          type: "array",

          items: {
            type: "object",

            additionalProperties:
              false,

            properties: {
              criterio: {
                type: "string",
              },

              valores: {
                type: "array",

                items: {
                  type: "string",
                },
              },
            },

            required: [
              "criterio",
              "valores",
            ],
          },
        },
      },

      required: [
        "columnas",
        "filas",
      ],
    },

    timeline: {
      type: "array",

      items: {
        type: "object",

        additionalProperties:
          false,

        properties: {
          id: {
            type: "string",
          },

          fecha: {
            type: "string",
          },

          titulo: {
            type: "string",
          },

          descripcion: {
            type: "string",
          },

          orden: {
            type: "integer",
          },
        },

        required: [
          "id",
          "fecha",
          "titulo",
          "descripcion",
          "orden",
        ],
      },
    },

    pasos: {
      type: "array",

      items: {
        type: "object",

        additionalProperties:
          false,

        properties: {
          id: {
            type: "string",
          },

          titulo: {
            type: "string",
          },

          descripcion: {
            type: "string",
          },

          tipo: {
            type: "string",

            enum: [
              "inicio",
              "proceso",
              "decision",
              "fin",
            ],
          },

          siguiente: {
            type: "array",

            items: {
              type: "string",
            },
          },

          orden: {
            type: "integer",
          },
        },

        required: [
          "id",
          "titulo",
          "descripcion",
          "tipo",
          "siguiente",
          "orden",
        ],
      },
    },

    conceptosClave: {
      type: "array",

      items: {
        type: "string",
      },
    },

    sugerenciaEstudio: {
      type: "string",
    },
  },

  required: [
    "tipo",
    "titulo",
    "subtitulo",
    "temaCentral",
    "resumen",
    "nodos",
    "conexiones",
    "grupos",
    "tabla",
    "timeline",
    "pasos",
    "conceptosClave",
    "sugerenciaEstudio",
  ],
};

/* =========================================================
   PROMPT
========================================================= */

function crearPrompt(
  tipo: TipoOrganizador,
  nivel: NivelDetalle,
  nombreArchivo: string
) {
  return `
Eres Raccoon IA, el asistente educativo de Raccoon Study.

Tu trabajo es transformar materiales educativos en ORGANIZADORES VISUALES que realmente ayuden al estudiante a comprender, memorizar y conectar información.

ARCHIVO:
${nombreArchivo}

ORGANIZADOR SOLICITADO:
${tipo}

NIVEL:
${nivel}

${instruccionesNivel(
  nivel
)}

${instruccionesTipo(
  tipo
)}

REGLAS IMPORTANTES:

1. Utiliza ÚNICAMENTE información respaldada por el material proporcionado.

2. NO inventes nombres, fechas, conceptos, definiciones, relaciones ni ejemplos.

3. Resume la información antes de colocarla en nodos.

4. Los títulos de los nodos deben ser breves.

5. Las descripciones pueden ampliar el título, pero deben seguir siendo concisas.

6. Debe existir una jerarquía visual lógica.

7. Los IDs deben ser únicos y simples:
   nodo-1
   nodo-2
   evento-1
   paso-1
   etc.

8. En conexiones:
   - origen debe coincidir con un ID existente en nodos.
   - destino debe coincidir con un ID existente en nodos.

9. Para mapas conceptuales:
   usa etiquetas de relación significativas.

10. Para mapas mentales:
    usa conexiones simples y ramas claras.

11. Para cuadros comparativos:
    la cantidad de valores de cada fila debe coincidir con la cantidad de columnas.

12. Para líneas de tiempo:
    respeta estrictamente el orden cronológico respaldado por el material.

13. Para diagramas de flujo:
    cada ID incluido en "siguiente" debe corresponder a un paso existente.

14. Si un campo no aplica al tipo seleccionado:
    devuelve el arreglo vacío correspondiente.

15. El resultado debe estar escrito en español, excepto cuando el material requiera mantener términos originales.

16. No conviertas el organizador en un resumen gigante.

17. El resultado debe ser visual, claro y fácil de estudiar.

18. temaCentral debe representar la idea que iría en el centro o nivel superior del organizador.

19. conceptosClave debe incluir únicamente términos realmente importantes.

20. sugerenciaEstudio debe ser una recomendación corta sobre cómo estudiar usando el organizador generado.
`;
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: NextRequest
) {
  let archivoOpenAIId:
    | string
    | null =
    null;

  try {
    /* =====================================================
       1. PREMIUM
    ===================================================== */

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

    /* =====================================================
       2. FORM DATA
    ===================================================== */

    const formData =
      await request.formData();

    const archivo =
      formData.get(
        "archivo"
      );

    const tipoEntrada =
      formData.get(
        "tipo"
      );

    const nivelEntrada =
      formData.get(
        "nivel"
      );

    /* =====================================================
       3. VALIDAR ARCHIVO
    ===================================================== */

    if (
      !(
        archivo instanceof
        File
      )
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
      archivo.size <=
      0
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

    /* =====================================================
       4. VALIDAR TIPO
    ===================================================== */

    if (
      !esTipoOrganizador(
        tipoEntrada
      )
    ) {
      return NextResponse.json(
        {
          error:
            "El tipo de organizador no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       5. VALIDAR NIVEL
    ===================================================== */

    if (
      !esNivelDetalle(
        nivelEntrada
      )
    ) {
      return NextResponse.json(
        {
          error:
            "El nivel de detalle no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    const tipo =
      tipoEntrada;

    const nivel =
      nivelEntrada;

    /* =====================================================
       6. PROMPT
    ===================================================== */

    const prompt =
      crearPrompt(
        tipo,
        nivel,
        archivo.name
      );

    let respuesta;

    /* =====================================================
       7. TXT
    ===================================================== */

    if (
      archivo.name
        .toLowerCase()
        .endsWith(
          ".txt"
        )
    ) {
      const contenido =
        await archivo.text();

      if (
        !contenido.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "El archivo no contiene texto.",
          },
          {
            status: 400,
          }
        );
      }

      respuesta =
        await openai.responses.create(
          {
            model:
              "gpt-4.1-mini",

            input: [
              {
                role:
                  "system",

                content:
                  prompt,
              },

              {
                role:
                  "user",

                content: `
MATERIAL DEL ESTUDIANTE:

${contenido.slice(
  0,
  90000
)}
                `,
              },
            ],

            text: {
              format: {
                type:
                  "json_schema",

                name:
                  "organizador_visual",

                strict:
                  true,

                schema:
                  esquemaOrganizador,
              },
            },
          }
        );
    }

    /* =====================================================
       8. PDF / DOCX / PPTX
    ===================================================== */

    else {
      /*
        Subimos el documento temporalmente.

        El endpoint Files permite subir archivos
        que posteriormente pueden usarse como
        entrada en otros endpoints. :contentReference[oaicite:1]{index=1}
      */

      const archivoSubido =
        await openai.files.create(
          {
            file:
              archivo,

            purpose:
              "user_data",
          }
        );

      archivoOpenAIId =
        archivoSubido.id;

      respuesta =
        await openai.responses.create(
          {
            model:
              "gpt-4.1-mini",

            input: [
              {
                role:
                  "system",

                content:
                  prompt,
              },

              {
                role:
                  "user",

                content: [
                  {
                    type:
                      "input_file",

                    file_id:
                      archivoSubido.id,
                  },

                  {
                    type:
                      "input_text",

                    text:
                      `
Analiza cuidadosamente este material.

Genera un organizador visual de tipo "${tipo}" con nivel "${nivel}".

Usa solamente información presente o claramente respaldada por el documento.
                      `,
                  },
                ],
              },
            ],

            text: {
              format: {
                type:
                  "json_schema",

                name:
                  "organizador_visual",

                strict:
                  true,

                schema:
                  esquemaOrganizador,
              },
            },
          }
        );
    }

    /* =====================================================
       9. LEER OUTPUT
    ===================================================== */

    const texto =
      respuesta.output_text;

    if (
      !texto
    ) {
      throw new Error(
        "La IA no devolvió contenido."
      );
    }

    let organizador:
      unknown;

    try {
      organizador =
        JSON.parse(
          texto
        );
    } catch (
      error
    ) {
      console.error(
        "Respuesta no válida:",
        texto
      );

      throw new Error(
        "No se pudo interpretar el organizador generado."
      );
    }

    /* =====================================================
       10. ELIMINAR TEMPORAL
    ===================================================== */

    if (
      archivoOpenAIId
    ) {
      try {
        await openai.files.delete(
          archivoOpenAIId
        );

        archivoOpenAIId =
          null;
      } catch (
        error
      ) {
        console.warn(
          "No se pudo eliminar el archivo temporal:",
          error
        );
      }
    }

    /* =====================================================
       11. RESPUESTA AL FRONTEND
    ===================================================== */

    return NextResponse.json(
      {
        ok: true,

        generadoCon:
          "Raccoon IA",

        plan:
          premium.plan,

        archivo: {
          nombre:
            archivo.name,

          tamaño:
            archivo.size,

          tipo:
            archivo.type ||
            "desconocido",
        },

        configuracion: {
          tipo,
          nivel,
        },

        organizador,

        generadoEn:
          new Date().toISOString(),
      },
      {
        status: 200,
      }
    );
  } catch (
    error
  ) {
    console.error(
      "ERROR /api/organizadores/generar:",
      error
    );

    /* =====================================================
       LIMPIAR ARCHIVO SI FALLÓ
    ===================================================== */

    if (
      archivoOpenAIId
    ) {
      try {
        await openai.files.delete(
          archivoOpenAIId
        );
      } catch (
        errorEliminar
      ) {
        console.warn(
          "No se pudo eliminar el archivo temporal después del error:",
          errorEliminar
        );
      }
    }

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof
          Error
            ? error.message
            : "No se pudo generar el organizador visual.",
      },
      {
        status: 500,
      }
    );
  }
}