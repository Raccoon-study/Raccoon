import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PlanType =
  | "free"
  | "month"
  | "year";

interface SuscripcionBD {
  id: string;
  usuario_id: string;
  plan: PlanType;
  amount: number;
  status: string;
}

const PRECIOS: Record<
  PlanType,
  number
> = {
  free: 0,
  month: 5.99,
  year: 69.99,
};

function crearSupabaseAdmin() {
  const url =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan variables de Supabase."
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl:
        false,
    },
  });
}

function normalizarPlan(
  value: unknown
): PlanType {
  const text =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    text === "year" ||
    text === "annual" ||
    text === "anual" ||
    text ===
      "premium_year" ||
    text ===
      "premium_anual"
  ) {
    return "year";
  }

  if (
    text === "month" ||
    text === "monthly" ||
    text === "mensual" ||
    text ===
      "premium_month" ||
    text ===
      "premium_mensual" ||
    text === "premium"
  ) {
    return "month";
  }

  return "free";
}

function esPlanValido(
  value: unknown
): value is PlanType {
  return (
    value === "free" ||
    value === "month" ||
    value === "year"
  );
}

function obtenerBearer(
  request: NextRequest
) {
  const header =
    request.headers.get(
      "authorization"
    );

  if (!header) {
    return null;
  }

  const [tipo, token] =
    header.split(" ");

  if (
    tipo?.toLowerCase() !==
      "bearer" ||
    !token
  ) {
    return null;
  }

  return token.trim();
}

async function obtenerUsuario(
  request: NextRequest,
  supabaseAdmin:
    ReturnType<
      typeof crearSupabaseAdmin
    >
) {
  const token =
    obtenerBearer(request);

  if (!token) {
    return null;
  }

  const {
    data: { user },
  } =
    await supabaseAdmin.auth.getUser(
      token
    );

  return user ?? null;
}

function premiumNoExpirado(
  user: {
    app_metadata?: Record<
      string,
      unknown
    >;
  }
) {
  const raw =
    user.app_metadata
      ?.premium_expires_at;

  if (
    typeof raw !==
      "string" ||
    !raw
  ) {
    return true;
  }

  const timestamp =
    Date.parse(raw);

  if (
    Number.isNaN(timestamp)
  ) {
    return true;
  }

  return timestamp >
    Date.now();
}

export async function GET(
  request: NextRequest
) {
  try {
    const supabaseAdmin =
      crearSupabaseAdmin();

    const user =
      await obtenerUsuario(
        request,
        supabaseAdmin
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Usuario no autenticado.",
        },
        { status: 401 }
      );
    }

    const {
      data: subscriptions,
      error,
    } =
      await supabaseAdmin
        .from("subscriptions")
        .select(
          "id, usuario_id, plan, amount, status"
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

    if (error) {
      throw new Error(
        error.message
      );
    }

    const subscription =
      subscriptions?.[0] as
        | SuscripcionBD
        | undefined;

    const metadataPlan =
      normalizarPlan(
        user.app_metadata?.plan ||
          user.app_metadata
            ?.subscription ||
          user.app_metadata
            ?.tipo_plan
      );

    let planActual: PlanType =
      subscription?.plan &&
      esPlanValido(
        subscription.plan
      )
        ? subscription.plan
        : metadataPlan;

    if (
      planActual !== "free" &&
      !premiumNoExpirado(
        user
      )
    ) {
      planActual = "free";

      await supabaseAdmin
        .from("subscriptions")
        .update({
          plan: "free",
          amount: 0,
          status: "active",
        })
        .eq(
          "usuario_id",
          user.id
        );

      const previousMetadata =
        user.app_metadata &&
        typeof user.app_metadata ===
          "object"
          ? user.app_metadata
          : {};

      await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          app_metadata: {
            ...previousMetadata,
            plan: "free",
            subscription:
              "free",
            tipo_plan:
              "free",
            premium: false,
            is_premium:
              false,
            es_premium:
              false,
            premium_expires_at:
              null,
          },
        }
      );
    }

    const premium =
      planActual === "month" ||
      planActual === "year";

    return NextResponse.json(
      {
        success: true,
        plan: planActual,
        subscription:
          planActual,
        tipo_plan:
          planActual,
        premium,
        is_premium:
          premium,
        es_premium:
          premium,
        amount:
          planActual ===
            "free"
            ? 0
            : subscription
                ?.amount ??
              PRECIOS[
                planActual
              ],
        status: "active",
        expiresAt:
          premium
            ? user
                .app_metadata
                ?.premium_expires_at ??
              null
            : null,
        data:
          subscription ??
          null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET suscripciones:",
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
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const supabaseAdmin =
      crearSupabaseAdmin();

    const user =
      await obtenerUsuario(
        request,
        supabaseAdmin
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Usuario no autenticado.",
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const requestedPlan =
      body?.plan;

    if (
      requestedPlan !== "free" &&
      requestedPlan !== "month"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Premium anual solo puede activarse después de un pago confirmado por PayPal.",
        },
        { status: 403 }
      );
    }

    const nuevoPlan: PlanType =
      requestedPlan === "month"
        ? "month"
        : "free";

    const nuevoMonto =
      PRECIOS[nuevoPlan];

    const nuevoPremium =
      nuevoPlan === "month";

    const {
      data: existing,
      error: searchError,
    } =
      await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq(
          "usuario_id",
          user.id
        )
        .limit(1);

    if (searchError) {
      throw new Error(
        searchError.message
      );
    }

    if (
      existing?.[0]?.id
    ) {
      const {
        error: updateError,
      } =
        await supabaseAdmin
          .from(
            "subscriptions"
          )
          .update({
            plan: nuevoPlan,
            amount: nuevoMonto,
            status:
              "active",
          })
          .eq(
            "id",
            existing[0].id
          )
          .eq(
            "usuario_id",
            user.id
          );

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }
    } else {
      const {
        error: insertError,
      } =
        await supabaseAdmin
          .from(
            "subscriptions"
          )
          .insert({
            usuario_id:
              user.id,
            plan: nuevoPlan,
            amount: nuevoMonto,
            status:
              "active",
          });

      if (insertError) {
        throw new Error(
          insertError.message
        );
      }
    }

    const previousMetadata =
      user.app_metadata &&
      typeof user.app_metadata ===
        "object"
        ? user.app_metadata
        : {};

    const {
      error: metadataError,
    } =
      await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          app_metadata: {
            ...previousMetadata,
            plan: nuevoPlan,
            subscription:
              nuevoPlan,
            tipo_plan:
              nuevoPlan,
            premium:
              nuevoPremium,
            is_premium:
              nuevoPremium,
            es_premium:
              nuevoPremium,
            premium_started_at:
              null,
            premium_expires_at:
              null,
          },
        }
      );

    if (metadataError) {
      throw new Error(
        metadataError.message
      );
    }

    return NextResponse.json(
      {
        success: true,
        plan: nuevoPlan,
        premium:
          nuevoPremium,
        amount:
          nuevoMonto,
        status: "active",
        message:
          nuevoPremium
            ? "Premium mensual activado."
            : "Plan gratuito activado.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "POST suscripciones:",
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
      { status: 500 }
    );
  }
}
