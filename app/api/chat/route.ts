import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =====================================================
   TIPOS
===================================================== */

type PlanUsuario =
  | "free"
  | "month"
  | "year";

type TipoMensaje =
  | "user"
  | "ia";

interface MensajeHistorial {
  tipo: TipoMensaje;
  texto: string;
}

interface Material {
  id: string;
  nombre_archivo: string;
  url_archivo: string;
}

interface CuerpoChat {
  mensaje?: unknown;
  historial?: unknown;
  material_ids?: unknown;
  chat_id?: unknown;
}

interface ContenidoTexto {
  type: "input_text";
  text: string;
}

interface ContenidoImagen {
  type: "input_image";
  image_url: string;
  detail: "low" | "high" | "auto";
}

interface ContenidoArchivo {
  type: "input_file";
  file_url: string;
  filename: string;
}

type ContenidoEntrada =
  | ContenidoTexto
  | ContenidoImagen
  | ContenidoArchivo;

interface MensajeEntradaTexto {
  role: "user" | "assistant";
  content: string;
}

interface MensajeEntradaMultimedia {
  role: "user";
  content: ContenidoEntrada[];
}

type MensajeEntrada =
  | MensajeEntradaTexto
  | MensajeEntradaMultimedia;

/* =====================================================
   SUPABASE ADMIN
===================================================== */

function crearSupabaseAdmin() {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL en las variables de entorno."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */

function esObjeto(
  valor: unknown
): valor is Record<string, unknown> {
  return (
    typeof valor === "object" &&
    valor !== null
  );
}

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

  const partes =
    autorizacion.split(" ");

  if (
    partes.length !== 2 ||
    partes[0].toLowerCase() !==
      "bearer"
  ) {
    return null;
  }

  const token =
    partes[1].trim();

  return token || null;
}

function normalizarPlan(
  valor: unknown,
  premium = false
): PlanUsuario {
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

  return premium
    ? "month"
    : "free";
}

/*
  Esta función evita el error:

  Type '{ tipo: string; texto: string; }[]'
  is not assignable to type 'MensajeHistorial[]'
*/

function normalizarHistorial(
  valor: unknown
): MensajeHistorial[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  const historial:
    MensajeHistorial[] = [];

  for (const elemento of valor) {
    if (!esObjeto(elemento)) {
      continue;
    }

    const texto =
      typeof elemento.texto ===
        "string"
        ? elemento.texto.trim()
        : "";

    if (!texto) {
      continue;
    }

    const tipo: TipoMensaje =
      elemento.tipo === "ia"
        ? "ia"
        : "user";

    historial.push({
      tipo,
      texto,
    });
  }

  return historial.slice(-12);
}

function normalizarIds(
  valor: unknown
): string[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  const ids = valor
    .filter(
      (
        elemento
      ): elemento is string =>
        typeof elemento ===
        "string"
    )
    .map((elemento) =>
      elemento.trim()
    )
    .filter(Boolean);

  return [
    ...new Set(ids),
  ];
}

function obtenerExtension(
  nombreArchivo: string
): string {
  return (
    nombreArchivo
      .split(".")
      .pop()
      ?.toLowerCase() || ""
  );
}

function esImagen(
  nombreArchivo: string
): boolean {
  const extension =
    obtenerExtension(
      nombreArchivo
    );

  return [
    "png",
    "jpg",
    "jpeg",
    "webp",
    "gif",
  ].includes(extension);
}

function esArchivoPermitido(
  nombreArchivo: string
): boolean {
  const extension =
    obtenerExtension(
      nombreArchivo
    );

  return [
    "pdf",
    "doc",
    "docx",
    "rtf",
    "odt",
    "ppt",
    "pptx",
    "txt",
    "md",
    "json",
    "html",
    "xml",
    "csv",
    "xls",
    "xlsx",
    "png",
    "jpg",
    "jpeg",
    "webp",
    "gif",
  ].includes(extension);
}

function obtenerMensajeErrorOpenAI(
  valor: unknown
): string {
  if (!esObjeto(valor)) {
    return "OpenAI no devolvió una respuesta válida.";
  }

  if (
    esObjeto(valor.error) &&
    typeof valor.error.message ===
      "string"
  ) {
    return valor.error.message;
  }

  if (
    typeof valor.message ===
      "string"
  ) {
    return valor.message;
  }

  return "No se pudo generar la respuesta.";
}

function extraerTextoRespuesta(
  valor: unknown
): string {
  if (!esObjeto(valor)) {
    return "";
  }

  /*
    Algunas respuestas pueden incluir output_text.
  */

  if (
    typeof valor.output_text ===
      "string" &&
    valor.output_text.trim()
  ) {
    return valor.output_text.trim();
  }

  if (!Array.isArray(valor.output)) {
    return "";
  }

  const fragmentos: string[] = [];

  for (const salida of valor.output) {
    if (!esObjeto(salida)) {
      continue;
    }

    if (!Array.isArray(salida.content)) {
      continue;
    }

    for (
      const contenido of salida.content
    ) {
      if (!esObjeto(contenido)) {
        continue;
      }

      if (
        contenido.type ===
          "output_text" &&
        typeof contenido.text ===
          "string"
      ) {
        fragmentos.push(
          contenido.text
        );
      }
    }
  }

  return fragmentos
    .join("\n\n")
    .trim();
}

/* =====================================================
   POST
===================================================== */

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const openaiApiKey =
      process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Falta OPENAI_API_KEY en las variables de entorno.",
        },
        {
          status: 500,
        }
      );
    }

    const supabaseAdmin =
      crearSupabaseAdmin();

    const token =
      obtenerToken(request);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Debes iniciar sesión para usar Raccoon IA.",
        },
        {
          status: 401,
        }
      );
    }

    /* =================================================
       VERIFICAR USUARIO
    ================================================= */

    const {
      data: usuarioRespuesta,
      error: errorUsuario,
    } =
      await supabaseAdmin.auth.getUser(
        token
      );

    const user =
      usuarioRespuesta.user;

    if (
      errorUsuario ||
      !user
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La sesión no es válida o ha expirado.",
        },
        {
          status: 401,
        }
      );
    }

    /* =================================================
       LEER CUERPO
    ================================================= */

    let cuerpo: CuerpoChat;

    try {
      cuerpo =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "El cuerpo de la solicitud no contiene JSON válido.",
        },
        {
          status: 400,
        }
      );
    }

    const mensaje =
      typeof cuerpo.mensaje ===
        "string"
        ? cuerpo.mensaje.trim()
        : "";

    if (!mensaje) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Escribe una pregunta.",
        },
        {
          status: 400,
        }
      );
    }

    if (mensaje.length > 4000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La pregunta no puede superar los 4000 caracteres.",
        },
        {
          status: 400,
        }
      );
    }

    const historial =
      normalizarHistorial(
        cuerpo.historial
      );

    const idsSolicitados =
      normalizarIds(
        cuerpo.material_ids
      );

    /* =================================================
       COMPROBAR PLAN
    ================================================= */

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
          metadata.tipo_plan ||
          metadata.subscription_plan,
        premiumMetadata
      );

    try {
      const {
        data: suscripciones,
        error: errorSuscripcion,
      } = await supabaseAdmin
        .from("subscriptions")
        .select(
          "plan, status"
        )
        .eq(
          "usuario_id",
          user.id
        )
        .eq(
          "status",
          "active"
        )
        .limit(1);

      if (
        !errorSuscripcion &&
        suscripciones &&
        suscripciones.length > 0
      ) {
        planActual =
          normalizarPlan(
            suscripciones[0].plan
          );
      }
    } catch (error) {
      console.warn(
        "No se pudo consultar la suscripción:",
        error
      );
    }

    const esPremium =
      planActual === "month" ||
      planActual === "year";

    const limiteMateriales =
      esPremium ? 5 : 1;

    if (
      idsSolicitados.length >
      limiteMateriales
    ) {
      return NextResponse.json(
        {
          success: false,

          error: esPremium
            ? "Premium permite un máximo de cinco documentos por conversación."
            : "El plan gratuito permite un documento por conversación.",
        },
        {
          status: 403,
        }
      );
    }

    const idsPermitidos =
      idsSolicitados.slice(
        0,
        limiteMateriales
      );

    /* =================================================
       OBTENER DOCUMENTOS DEL USUARIO
    ================================================= */

    let materiales:
      Material[] = [];

    if (
      idsPermitidos.length > 0
    ) {
      const {
        data: materialesData,
        error: errorMateriales,
      } = await supabaseAdmin
        .from("materiales")
        .select(
          "id, nombre_archivo, url_archivo"
        )
        .eq(
          "usuario_id",
          user.id
        )
        .in(
          "id",
          idsPermitidos
        );

      if (errorMateriales) {
        return NextResponse.json(
          {
            success: false,

            error:
              `No se pudieron cargar los documentos: ${errorMateriales.message}`,
          },
          {
            status: 500,
          }
        );
      }

      materiales =
        (materialesData || [])
          .map((material) => ({
            id: String(
              material.id
            ),

            nombre_archivo:
              String(
                material.nombre_archivo ||
                  "Material sin nombre"
              ),

            url_archivo:
              String(
                material.url_archivo ||
                  ""
              ),
          }))
          .filter(
            (material) =>
              material.url_archivo &&
              esArchivoPermitido(
                material.nombre_archivo
              )
          );

      /*
        Mantener el orden seleccionado
        en la interfaz.
      */

      materiales.sort(
        (materialA, materialB) =>
          idsPermitidos.indexOf(
            materialA.id
          ) -
          idsPermitidos.indexOf(
            materialB.id
          )
      );
    }

    if (
      idsPermitidos.length > 0 &&
      materiales.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Los documentos seleccionados no existen, no pertenecen a tu cuenta o tienen un formato incompatible.",
        },
        {
          status: 400,
        }
      );
    }

    /* =================================================
       PREPARAR HISTORIAL
    ================================================= */

    const entrada:
      MensajeEntrada[] = [];

    for (
      const elemento of historial
    ) {
      entrada.push({
        role:
          elemento.tipo === "ia"
            ? "assistant"
            : "user",

        content:
          elemento.texto,
      });
    }

    /* =================================================
       PREPARAR PREGUNTA Y DOCUMENTOS
    ================================================= */

    const contenidoActual:
      ContenidoEntrada[] = [];

    const nombresDocumentos =
      materiales
        .map(
          (
            material,
            indice
          ) =>
            `${indice + 1}. ${material.nombre_archivo}`
        )
        .join("\n");

    contenidoActual.push({
      type: "input_text",

      text:
        materiales.length > 0
          ? `
Pregunta del estudiante:

${mensaje}

Documentos seleccionados:

${nombresDocumentos}

Responde usando principalmente la información de los documentos adjuntos.
Cuando utilices información de un archivo, menciona su nombre.
          `.trim()
          : mensaje,
    });

    for (
      const material of materiales
    ) {
      contenidoActual.push({
        type: "input_text",

        text:
          `Documento adjunto: ${material.nombre_archivo}`,
      });

      if (
        esImagen(
          material.nombre_archivo
        )
      ) {
        contenidoActual.push({
          type: "input_image",

          image_url:
            material.url_archivo,

          detail: "high",
        });

        continue;
      }

      contenidoActual.push({
        type: "input_file",

        file_url:
          material.url_archivo,

        filename:
          material.nombre_archivo,
      });
    }

    entrada.push({
      role: "user",
      content: contenidoActual,
    });

    /* =================================================
       SOLICITAR RESPUESTA A OPENAI
    ================================================= */

    const modelo =
      process.env
        .OPENAI_CHAT_MODEL ||
      "gpt-5-mini";

    const respuestaOpenAI =
      await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${openaiApiKey}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            model: modelo,

            store: false,

            instructions: `
Eres Raccoon IA, el tutor inteligente de Raccoon Study.

Debes seguir estas reglas:

- Responde normalmente en español.
- Explica los temas de forma clara y organizada.
- Ten en cuenta el historial de la conversación.
- Cuando existan documentos adjuntos, utilízalos como fuente principal.
- No inventes contenido que no se encuentre en los documentos.
- Si la respuesta no aparece en los archivos, indícalo claramente.
- Cuando uses información de un archivo, menciona su nombre entre paréntesis.
- Puedes crear resúmenes, guías, explicaciones, ejemplos y preguntas de práctica.
- Utiliza Markdown para organizar la respuesta.
            `.trim(),

            input: entrada,
          }),
        }
      );

    const datosOpenAI: unknown =
      await respuestaOpenAI
        .json()
        .catch(() => null);

    if (!respuestaOpenAI.ok) {
      const mensajeError =
        obtenerMensajeErrorOpenAI(
          datosOpenAI
        );

      console.error(
        "Error de OpenAI:",
        datosOpenAI
      );

      return NextResponse.json(
        {
          success: false,
          error:
            `OpenAI rechazó la solicitud: ${mensajeError}`,
        },
        {
          status:
            respuestaOpenAI.status >= 400 &&
            respuestaOpenAI.status < 600
              ? respuestaOpenAI.status
              : 500,
        }
      );
    }

    const textoRespuesta =
      extraerTextoRespuesta(
        datosOpenAI
      );

    if (!textoRespuesta) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Raccoon IA no devolvió contenido.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,

        respuesta:
          textoRespuesta,

        materiales_usados:
          materiales.map(
            (material) => ({
              id: material.id,

              nombre:
                material.nombre_archivo,
            })
          ),

        premium:
          esPremium,

        plan:
          planActual,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Error interno en Raccoon IA:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Error interno del servidor.",
      },
      {
        status: 500,
      }
    );
  }
}