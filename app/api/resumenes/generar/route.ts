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

    /*
      PLAN DEL USUARIO
      Se valida en servidor para impedir que un usuario
      gratuito solicite funciones Premium modificando
      manualmente el frontend.
    */
    const metadata = {
      ...(user.user_metadata || {}),
      ...(user.app_metadata || {}),
    };

    const plan = String(
      metadata.plan ||
        metadata.subscription ||
        metadata.tipo_plan ||
        ""
    ).toLowerCase();

    const esPremium =
      metadata.premium === true ||
      metadata.is_premium === true ||
      plan.includes("premium");

    /* ARCHIVO */

    const formulario =
      await request.formData();

    const archivo =
      formulario.get("archivo");

    const tipoSolicitado =
      String(
        formulario.get("tipo_resumen") ||
          "corto"
      ).toLowerCase();

    const detalleSolicitado =
      String(
        formulario.get("nivel_detalle") ||
          "basico"
      ).toLowerCase();

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

    /*
      CONFIGURACIÓN EFECTIVA
      Gratis: siempre corto + básico.
      Premium: respeta las opciones solicitadas.
    */
    const tiposPermitidos = [
      "corto",
      "completo",
      "examen",
    ];

    const detallesPermitidos = [
      "basico",
      "intermedio",
      "profundo",
    ];

    const tipoResumen =
      esPremium &&
      tiposPermitidos.includes(
        tipoSolicitado
      )
        ? tipoSolicitado
        : "corto";

    const nivelDetalle =
      esPremium &&
      detallesPermitidos.includes(
        detalleSolicitado
      )
        ? detalleSolicitado
        : "basico";

    const reglasPlan = esPremium
      ? `
PLAN: PREMIUM.

OBJETIVO DEL PLAN:
Entregar una guía de estudio claramente más completa, profunda y útil que la versión gratuita.

TIPO DE RESUMEN SOLICITADO: ${tipoResumen.toUpperCase()}.

REGLAS SEGÚN EL TIPO:
- CORTO:
  * resumen_general: 2 a 3 párrafos completos.
  * secciones_desarrollo: 3 a 4 secciones.
  * ideas_principales: 4 a 6.
  * conceptos_clave: 4 a 6.
  * datos_importantes: 4 a 6.
  * ejemplos: 0 a 2 si el archivo los permite.

- COMPLETO:
  * resumen_general: 4 a 6 párrafos.
  * secciones_desarrollo: 5 a 8 secciones bien diferenciadas.
  * ideas_principales: 7 a 10.
  * conceptos_clave: 6 a 10.
  * datos_importantes: 6 a 10.
  * ejemplos: 1 a 4 si están sustentados por el material.
  * conclusión: 2 párrafos cuando el contenido lo permita.

- EXAMEN:
  * resumen_general: 3 a 5 párrafos centrados en lo evaluable.
  * secciones_desarrollo: 4 a 7 secciones.
  * ideas_principales: 7 a 10.
  * conceptos_clave: 6 a 10.
  * datos_importantes: 8 a 12.
  * ejemplos: incluye procedimientos, casos, fórmulas o aplicaciones solamente si aparecen en el material.
  * prioriza definiciones, clasificaciones, etapas, relaciones, causas, consecuencias, procesos, fechas, cifras y comparaciones que puedan aparecer en una evaluación.

NIVEL DE DETALLE SOLICITADO: ${nivelDetalle.toUpperCase()}.

REGLAS SEGÚN EL NIVEL:
- BÁSICO:
  Explica los conceptos esenciales con lenguaje claro, pero sin omitir información importante.

- INTERMEDIO:
  Además de explicar, conecta conceptos, causas, etapas, componentes, semejanzas y diferencias cuando el documento las presente.

- PROFUNDO:
  Desarrolla relaciones, matices, procesos, detalles relevantes y conexiones entre distintas partes del documento.
  No agregues conocimiento externo.

IMPORTANTE:
La versión Premium debe sentirse notablemente más desarrollada que la gratuita.
No reduzcas el contenido Premium a tres ideas o tres conceptos salvo que el documento realmente no tenga más información.
`
      : `
PLAN: GRATUITO.

OBJETIVO DEL PLAN:
Entregar una vista previa útil y correcta del material, pero claramente más breve que Premium.

LÍMITES ESTRICTOS:
- resumen_general: 1 solo párrafo de máximo 90 palabras.
- secciones_desarrollo: máximo 2 secciones.
- cada sección: máximo 80 palabras.
- ideas_principales: exactamente 3.
- conceptos_clave: máximo 3.
- cada definición: máximo 25 palabras.
- ejemplos: siempre [].
- datos_importantes: máximo 2.
- conclusion: 1 párrafo de máximo 55 palabras.
- tiempo_lectura: debe reflejar un resumen corto.

PRIORIDAD:
1. Idea central.
2. Tres puntos imprescindibles.
3. Tres conceptos fundamentales.
4. Dos datos que conviene recordar.
5. Una conclusión muy breve.

NO HAGAS EN GRATUITO:
- análisis profundo;
- explicaciones extensas;
- comparaciones detalladas;
- desarrollo por muchas secciones;
- listas largas;
- ejemplos;
- contenido tipo guía completa para examen.

La versión gratuita debe ser suficiente para comprender lo básico, pero Premium debe ofrecer claramente más profundidad y cobertura.
`;

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
Eres Rocco y Riccie, tutor académico de Raccoon Study especializado en transformar materiales de estudio en resúmenes útiles.

REGLAS DE FIDELIDAD:
1. Analiza únicamente el contenido del documento proporcionado.
2. No inventes información, autores, fechas, acontecimientos, conceptos, fórmulas, ejemplos ni conclusiones que no estén sustentados por el archivo.
3. Si el documento no aporta información suficiente para una sección, mantenla breve o devuelve un arreglo vacío cuando corresponda.
4. Conserva la terminología académica importante del material.
5. Escribe completamente en español.
6. Evita repetir la misma idea en diferentes secciones.
7. Prioriza claridad, jerarquía y utilidad para estudiar.

${reglasPlan}
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

OBJETIVO:
Crear un resumen académico que pueda mostrarse en una interfaz de estudio por secciones.

ESTRUCTURA:

1. titulo
Título claro, específico y representativo del documento.

2. materia
Identifica la asignatura o área de conocimiento basándote únicamente en el contenido.

3. tiempo_lectura
Estima el tiempo aproximado de lectura del resumen generado.

4. resumen_general
Presenta la idea central, el propósito del contenido y las relaciones fundamentales.
No lo conviertas en una introducción vacía: debe explicar realmente el tema.

5. secciones_desarrollo
Organiza el tema en subtítulos claros.
Cada sección debe explicar una parte distinta del contenido y evitar repetir el resumen general.

6. ideas_principales
Cada elemento debe ser una oración completa, concreta y útil para estudiar.

7. conceptos_clave
Selecciona términos realmente importantes del documento.
Cada definición debe ser clara, breve y fiel al material.

8. ejemplos
Incluye únicamente ejemplos, casos, procedimientos, fórmulas o aplicaciones sustentados por el documento.
Si no hay ejemplos, devuelve [].

9. datos_importantes
Selecciona información que conviene recordar para una evaluación: características, clasificaciones, etapas, relaciones, cifras o hechos relevantes presentes en el archivo.

10. conclusion
Cierra conectando las ideas esenciales y explicando qué debe comprender el estudiante al terminar el tema.

No devuelvas markdown ni texto fuera del JSON solicitado.
                `,
              },
            ],
          },
        ],

        max_output_tokens:
          esPremium
            ? nivelDetalle === "profundo"
              ? 9000
              : tipoResumen === "completo" ||
                  tipoResumen === "examen"
                ? 7500
                : 5200
            : 1800,

        text: {
          format: {
            type: "json_schema",
            name: "resumen_academico",
            description:
              esPremium
                ? "Guía de estudio Premium, completa y elaborada."
                : "Resumen gratuito breve y esencial.",
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

    /*
      DIFERENCIA REAL ENTRE PLANES

      El prompt orienta al modelo, pero aquí también
      aplicamos límites en servidor para que un resumen
      gratuito nunca termine mostrando prácticamente lo
      mismo que uno Premium.
    */
    if (!esPremium) {
      const limitarPalabras = (
        valor: unknown,
        maximo: number
      ) => {
        const texto =
          typeof valor === "string"
            ? valor.trim()
            : "";

        if (!texto) {
          return "";
        }

        const palabras =
          texto.split(/\s+/);

        if (palabras.length <= maximo) {
          return texto;
        }

        return `${palabras
          .slice(0, maximo)
          .join(" ")}…`;
      };

      resumen = {
        ...resumen,

        resumen_general: limitarPalabras(
          resumen.resumen_general,
          90
        ),

        secciones_desarrollo:
          Array.isArray(
            resumen.secciones_desarrollo
          )
            ? resumen.secciones_desarrollo
                .slice(0, 2)
                .map(
                  (
                    seccion: {
                      titulo?: unknown;
                      contenido?: unknown;
                    }
                  ) => ({
                    titulo:
                      typeof seccion.titulo ===
                      "string"
                        ? seccion.titulo
                        : "Tema",
                    contenido:
                      limitarPalabras(
                        seccion.contenido,
                        80
                      ),
                  })
                )
            : [],

        ideas_principales:
          Array.isArray(
            resumen.ideas_principales
          )
            ? resumen.ideas_principales
                .slice(0, 3)
                .map((idea: unknown) =>
                  limitarPalabras(idea, 28)
                )
            : [],

        conceptos_clave:
          Array.isArray(
            resumen.conceptos_clave
          )
            ? resumen.conceptos_clave
                .slice(0, 3)
                .map(
                  (
                    concepto: {
                      concepto?: unknown;
                      definicion?: unknown;
                    }
                  ) => ({
                    concepto:
                      typeof concepto.concepto ===
                      "string"
                        ? concepto.concepto
                        : "Concepto",
                    definicion:
                      limitarPalabras(
                        concepto.definicion,
                        25
                      ),
                  })
                )
            : [],

        ejemplos: [],

        datos_importantes:
          Array.isArray(
            resumen.datos_importantes
          )
            ? resumen.datos_importantes
                .slice(0, 2)
                .map((dato: unknown) =>
                  limitarPalabras(dato, 24)
                )
            : [],

        conclusion: limitarPalabras(
          resumen.conclusion,
          55
        ),
      };
    }

    return NextResponse.json(
      resumen,
      {
        status: 200,
        headers: {
          "X-Raccoon-Plan": esPremium
            ? "premium"
            : "free",
          "X-Raccoon-Resumen-Tipo":
            tipoResumen,
          "X-Raccoon-Nivel":
            nivelDetalle,
        },
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