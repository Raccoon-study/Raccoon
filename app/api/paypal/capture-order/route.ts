import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaidPlan =
  | "month"
  | "year";

const PLANES: Record<
  PaidPlan,
  {
    amount: string;
    days: number;
  }
> = {
  month: {
    amount: "5.99",
    days: 30,
  },
  year: {
    amount: "69.99",
    days: 365,
  },
};

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

const PAYPAL_CLIENT_SECRET =
  process.env.PAYPAL_CLIENT_SECRET;

const PAYPAL_MODE =
  process.env.PAYPAL_MODE ??
  process.env.NEXT_PUBLIC_PAYPAL_MODE ??
  "sandbox";

const PAYPAL_API =
  PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

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
    },
  });
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

function esPaidPlan(
  value: unknown
): value is PaidPlan {
  return (
    value === "month" ||
    value === "year"
  );
}

async function getPayPalAccessToken() {
  if (
    !PAYPAL_CLIENT_ID ||
    !PAYPAL_CLIENT_SECRET
  ) {
    throw new Error(
      "Faltan las credenciales de PayPal."
    );
  }

  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(
    `${PAYPAL_API}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials",
      cache: "no-store",
    }
  );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.access_token
  ) {
    console.error(
      "PayPal OAuth error:",
      data
    );

    throw new Error(
      "No se pudo autenticar con PayPal."
    );
  }

  return data.access_token as string;
}

function sumarDias(
  date: Date,
  days: number
) {
  const result =
    new Date(date);

  result.setUTCDate(
    result.getUTCDate() +
      days
  );

  return result;
}

export async function POST(
  request: NextRequest
) {
  try {
    const token =
      obtenerBearer(request);

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión para confirmar el pago.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin =
      crearSupabaseAdmin();

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        token
      );

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "Tu sesión no es válida o expiró.",
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const orderId =
      body?.orderId;

    const plan =
      body?.plan;

    if (
      typeof orderId !==
        "string" ||
      orderId.length < 5 ||
      !/^[A-Za-z0-9]+$/.test(
        orderId
      )
    ) {
      return NextResponse.json(
        {
          error:
            "orderId de PayPal inválido.",
        },
        { status: 400 }
      );
    }

    if (!esPaidPlan(plan)) {
      return NextResponse.json(
        {
          error:
            "Plan de PayPal inválido.",
        },
        { status: 400 }
      );
    }

    const config =
      PLANES[plan];

    const accessToken =
      await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(
        orderId
      )}/capture`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          "Content-Type":
            "application/json",
          Prefer:
            "return=representation",
          "PayPal-Request-Id":
            `capture-${orderId}`,
        },
        cache: "no-store",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        "PayPal capture order error:",
        data
      );

      return NextResponse.json(
        {
          error:
            "PayPal no pudo confirmar el pago.",
          details: data,
        },
        {
          status:
            response.status,
        }
      );
    }

    if (
      data.status !==
        "COMPLETED"
    ) {
      return NextResponse.json(
        {
          error:
            `El pago no quedó completado. Estado: ${data.status}`,
          details: data,
        },
        { status: 409 }
      );
    }

    const purchaseUnit =
      data.purchase_units?.[0];

    const customId =
      purchaseUnit?.custom_id;

    const paidAmount =
      purchaseUnit?.payments
        ?.captures?.[0]
        ?.amount?.value ??
      purchaseUnit?.amount
        ?.value;

    const paidCurrency =
      purchaseUnit?.payments
        ?.captures?.[0]
        ?.amount
        ?.currency_code ??
      purchaseUnit?.amount
        ?.currency_code;

    const expectedCustomId =
      `raccoon:${user.id}:${plan}`;

    if (
      customId !==
        expectedCustomId ||
      String(paidAmount) !==
        config.amount ||
      paidCurrency !== "USD"
    ) {
      console.error(
        "Validación de pago fallida:",
        {
          customId,
          expectedCustomId,
          paidAmount,
          expectedAmount:
            config.amount,
          paidCurrency,
        }
      );

      return NextResponse.json(
        {
          error:
            "El pago fue recibido, pero sus datos no coinciden con el plan seleccionado. Contacta soporte con tu ID de orden.",
          orderId,
        },
        { status: 409 }
      );
    }

    const {
      data: existentes,
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
        `No se pudo consultar la suscripción: ${searchError.message}`
      );
    }

    const existingId =
      existentes?.[0]?.id;

    if (existingId) {
      const {
        error: updateError,
      } =
        await supabaseAdmin
          .from(
            "subscriptions"
          )
          .update({
            plan,
            amount:
              Number(
                config.amount
              ),
            status:
              "active",
          })
          .eq(
            "id",
            existingId
          )
          .eq(
            "usuario_id",
            user.id
          );

      if (updateError) {
        throw new Error(
          `El pago se completó, pero no se pudo actualizar la suscripción: ${updateError.message}`
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
            plan,
            amount:
              Number(
                config.amount
              ),
            status:
              "active",
          });

      if (insertError) {
        throw new Error(
          `El pago se completó, pero no se pudo crear la suscripción: ${insertError.message}`
        );
      }
    }

    const now =
      new Date();

    const expiresAt =
      sumarDias(
        now,
        config.days
      ).toISOString();

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
            plan,
            subscription: plan,
            tipo_plan: plan,
            premium: true,
            is_premium: true,
            es_premium: true,
            premium_started_at:
              now.toISOString(),
            premium_expires_at:
              expiresAt,
            paypal_order_id:
              orderId,
          },
        }
      );

    if (metadataError) {
      throw new Error(
        `El pago se completó y la suscripción se guardó, pero no se pudo actualizar el perfil Premium: ${metadataError.message}`
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: "COMPLETED",
        plan,
        premium: true,
        amount:
          Number(
            config.amount
          ),
        currency: "USD",
        orderId,
        expiresAt,
        message:
          plan === "year"
            ? "Premium anual activado."
            : "Premium mensual activado.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Capture PayPal order error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error interno al confirmar la orden.",
      },
      { status: 500 }
    );
  }
}
