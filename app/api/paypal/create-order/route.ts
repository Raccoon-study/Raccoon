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
    description: string;
    referenceId: string;
  }
> = {
  month: {
    amount: "5.99",
    description:
      "Raccoon Study Premium mensual",
    referenceId:
      "RACCOON_PREMIUM_MONTH",
  },
  year: {
    amount: "69.99",
    description:
      "Raccoon Study Premium anual",
    referenceId:
      "RACCOON_PREMIUM_YEAR",
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
            "Debes iniciar sesión para pagar.",
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

    const plan =
      body?.plan;

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

    const order = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id:
            config.referenceId,
          description:
            config.description,
          custom_id:
            `raccoon:${user.id}:${plan}`,
          amount: {
            currency_code: "USD",
            value: config.amount,
          },
        },
      ],
    };

    const response = await fetch(
      `${PAYPAL_API}/v2/checkout/orders`,
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
            crypto.randomUUID(),
        },
        body: JSON.stringify(
          order
        ),
        cache: "no-store",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        "PayPal create order error:",
        data
      );

      return NextResponse.json(
        {
          error:
            "PayPal no pudo crear la orden.",
          details: data,
        },
        {
          status:
            response.status,
        }
      );
    }

    return NextResponse.json(
      data,
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create PayPal order error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error interno al crear la orden.",
      },
      { status: 500 }
    );
  }
}
