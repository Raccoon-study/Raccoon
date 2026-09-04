import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE ?? "sandbox";

const PAYPAL_API =
  PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error(
      "Faltan NEXT_PUBLIC_PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET."
    );
  }

  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error("PayPal OAuth error:", data);
    throw new Error("No se pudo autenticar con PayPal.");
  }

  return data.access_token as string;
}

export async function POST() {
  try {
    const accessToken = await getPayPalAccessToken();

    // IMPORTANTE:
    // El precio se fija en el servidor para impedir que alguien lo cambie
    // desde las herramientas del navegador.
    const order = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: "RACCOON_PREMIUM_ANNUAL",
          description: "Raccoon Study Premium anual",
          custom_id: "raccoon-premium-annual",
          amount: {
            currency_code: "USD",
            value: "49.99",
          },
        },
      ],
    };

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify(order),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal create order error:", data);

      return NextResponse.json(
        {
          error: "PayPal no pudo crear la orden.",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create PayPal order error:", error);

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
