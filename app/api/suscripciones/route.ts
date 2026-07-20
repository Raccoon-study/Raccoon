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

type PlanType =
  | "year"
  | "month"
  | "free";

interface SolicitudPlan {
  plan?: unknown;
}

interface SuscripcionBD {
  id: string;
  usuario_id: string;
  plan: PlanType;
  amount: number;
  status: string;
}

/* =====================================================
   PRECIOS
===================================================== */

const PRECIOS: Record<
  PlanType,
  number
> = {
  free: 0,
  month: 0.99,
  year: 9,
};

/* =====================================================
   CLIENTE SUPABASE DEL SERVIDOR
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
        autoRefreshToken: false,
        persistSession: false,
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
): valor is Record<
  string,
  unknown
> {
  return (
    typeof valor === "object" &&
    valor !== null
  );
}

function esPlanValido(
  valor: unknown
): valor is PlanType {
  return (
    valor === "free" ||
    valor === "month" ||
    valor === "year"
  );
}

function normalizarPlan(
  valor: unknown
): PlanType {
  const texto = String(
    valor || ""
  )
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

  return "free";
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

  const [
    tipo,
    token,
  ] = autorizacion.split(" ");

  if (
    tipo?.toLowerCase() !==
      "bearer" ||
    !token
  ) {
    return null;
  }

  return token.trim();
}

/* =====================================================
   OBTENER USUARIO AUTENTICADO
===================================================== */

async function obtenerUsuarioAutenticado(
  request: NextRequest,
  supabaseAdmin: ReturnType<
    typeof crearSupabaseAdmin
  >
) {
  const token =
    obtenerToken(request);

  if (!token) {
    return {
      user: null,
      error:
        "Debes iniciar sesión para administrar tu suscripción.",
    };
  }

  /*
    getUser(token) verifica el JWT directamente
    con Supabase Auth.
  */

  const {
    data: { user },
    error,
  } =
    await supabaseAdmin.auth.getUser(
      token
    );

  if (error || !user) {
    return {
      user: null,
      error:
        "La sesión no es válida o ha expirado.",
    };
  }

  return {
    user,
    error: null,
  };
}

/* =====================================================
   GET: CONSULTAR PLAN ACTUAL
===================================================== */

export async function GET(
  request: NextRequest
) {
  try {
    const supabaseAdmin =
      crearSupabaseAdmin();

    const {
      user,
      error: errorUsuario,
    } =
      await obtenerUsuarioAutenticado(
        request,
        supabaseAdmin
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            errorUsuario ||
            "Usuario no autenticado.",
        },
        {
          status: 401,
        }
      );
    }

    /*
      Busca la suscripción del usuario.
      Utilizamos limit(1) para evitar errores
      si existen registros duplicados antiguos.
    */

    const {
      data: suscripciones,
      error: errorSuscripcion,
    } = await supabaseAdmin
      .from("subscriptions")
      .select(
        "id, usuario_id, plan, amount, status"
      )
      .eq(
        "usuario_id",
        user.id
      )
      .eq("status", "active")
      .limit(1);

    if (errorSuscripcion) {
      console.error(
        "Error consultando suscripción:",
        errorSuscripcion
      );

      return NextResponse.json(
        {
          success: false,
          error:
            errorSuscripcion.message,
        },
        {
          status: 500,
        }
      );
    }

    const suscripcion =
      suscripciones?.[0] as
        | SuscripcionBD
        | undefined;

    /*
      Si todavía no existe un registro,
      revisa app_metadata como respaldo.
    */

    const planMetadata =
      normalizarPlan(
        user.app_metadata?.plan ||
          user.app_metadata
            ?.subscription ||
          user.app_metadata
            ?.tipo_plan ||
          user.user_metadata?.plan
      );

    const planActual =
      suscripcion?.plan &&
      esPlanValido(
        suscripcion.plan
      )
        ? suscripcion.plan
        : planMetadata;

    const premium =
      planActual === "month" ||
      planActual === "year";

    return NextResponse.json(
      {
        success: true,
        plan: planActual,
        subscription: planActual,
        tipo_plan: planActual,
        premium,
        is_premium: premium,
        es_premium: premium,
        amount:
          suscripcion?.amount ??
          PRECIOS[planActual],
        status:
          suscripcion?.status ??
          "active",
        data:
          suscripcion || null,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Error GET suscripciones:",
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
  }
}

/* =====================================================
   POST: CREAR O CAMBIAR PLAN
===================================================== */

export async function POST(
  request: NextRequest
) {
  try {
    const supabaseAdmin =
      crearSupabaseAdmin();

    const {
      user,
      error: errorUsuario,
    } =
      await obtenerUsuarioAutenticado(
        request,
        supabaseAdmin
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            errorUsuario ||
            "Usuario no autenticado.",
        },
        {
          status: 401,
        }
      );
    }

    let cuerpo: unknown;

    try {
      cuerpo =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "El cuerpo de la solicitud no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    if (!esObjeto(cuerpo)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La solicitud no contiene información válida.",
        },
        {
          status: 400,
        }
      );
    }

    const solicitud =
      cuerpo as SolicitudPlan;

    if (
      !esPlanValido(
        solicitud.plan
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Plan no válido. Debe ser free, month o year.",
        },
        {
          status: 400,
        }
      );
    }

    const plan =
      solicitud.plan;

    const amount =
      PRECIOS[plan];

    const premium =
      plan === "month" ||
      plan === "year";

    /*
      Busca si el usuario ya tiene
      una suscripción registrada.
    */

    const {
      data: suscripcionesExistentes,
      error: errorBusqueda,
    } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq(
        "usuario_id",
        user.id
      )
      .limit(1);

    if (errorBusqueda) {
      throw new Error(
        `No se pudo consultar la suscripción: ${errorBusqueda.message}`
      );
    }

    const suscripcionExistente =
      suscripcionesExistentes?.[0];

    let suscripcionGuardada:
      | SuscripcionBD
      | null = null;

    /*
      Si existe, actualiza el mismo registro.
      Así no crea una suscripción nueva
      cada vez que el usuario cambia de plan.
    */

    if (
      suscripcionExistente?.id
    ) {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from("subscriptions")
        .update({
          plan,
          amount,
          status: "active",
        })
        .eq(
          "id",
          suscripcionExistente.id
        )
        .eq(
          "usuario_id",
          user.id
        )
        .select(
          "id, usuario_id, plan, amount, status"
        )
        .single();

      if (error) {
        throw new Error(
          `No se pudo actualizar la suscripción: ${error.message}`
        );
      }

      suscripcionGuardada =
        data as SuscripcionBD;
    } else {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          usuario_id: user.id,
          plan,
          amount,
          status: "active",
        })
        .select(
          "id, usuario_id, plan, amount, status"
        )
        .single();

      if (error) {
        throw new Error(
          `No se pudo crear la suscripción: ${error.message}`
        );
      }

      suscripcionGuardada =
        data as SuscripcionBD;
    }

    /*
      Guarda el plan en app_metadata.

      De esta manera las demás páginas
      pueden reconocer si el usuario
      es Premium después de actualizar
      su sesión.
    */

    const appMetadataAnterior =
      esObjeto(
        user.app_metadata
      )
        ? user.app_metadata
        : {};

    const {
      error: errorMetadata,
    } =
      await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          app_metadata: {
            ...appMetadataAnterior,

            plan,
            subscription: plan,
            tipo_plan: plan,

            premium,
            is_premium: premium,
            es_premium: premium,
          },
        }
      );

    if (errorMetadata) {
      console.error(
        "Error actualizando metadata:",
        errorMetadata
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "El plan fue guardado, pero no se pudo actualizar el estado Premium del usuario. Intenta nuevamente.",
          plan,
          premium,
          data:
            suscripcionGuardada,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,

        message: premium
          ? `Plan ${
              plan === "year"
                ? "Premium anual"
                : "Premium mensual"
            } activado correctamente.`
          : "Plan gratuito activado correctamente.",

        plan,
        subscription: plan,
        tipo_plan: plan,

        premium,
        is_premium: premium,
        es_premium: premium,

        amount,
        status: "active",

        data:
          suscripcionGuardada,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Error POST suscripciones:",
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
  }
}