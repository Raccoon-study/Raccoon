"use client";

import Script from "next/script";
import { useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      createInstance: (options: {
        clientId: string;
        components: string[];
        pageType?: string;
      }) => Promise<{
        findEligibleMethods: (options?: {
          currencyCode?: string;
        }) => Promise<{
          isEligible: (method: string) => boolean;
        }>;
        createPayPalOneTimePaymentSession: (options: {
          onApprove: (data: { orderId: string }) => Promise<unknown>;
          onCancel: () => void;
          onError: (error: unknown) => void;
        }) => Promise<{
          start: (
            options: { presentationMode: string },
            createOrderPromise: Promise<{ orderId: string }>
          ) => Promise<void>;
        }>;
      }>;
    };
  }
}

const PRICE = "49.99";

export default function CheckoutPage() {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const [status, setStatus] = useState<
    "loading" | "ready" | "processing" | "success" | "cancelled" | "error"
  >("loading");
  const [message, setMessage] = useState("Cargando PayPal...");
  const [orderId, setOrderId] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE ?? "sandbox";

  const paypalScript =
    mode === "live"
      ? "https://www.paypal.com/web-sdk/v6/core"
      : "https://www.sandbox.paypal.com/web-sdk/v6/core";

  async function createOrder(): Promise<{ orderId: string }> {
    setStatus("processing");
    setMessage("Creando tu orden...");

    const response = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data.id) {
      throw new Error(data?.error || "No se pudo crear la orden de PayPal.");
    }

    return { orderId: data.id };
  }

  async function captureOrder(data: { orderId: string }) {
    setStatus("processing");
    setMessage("Confirmando tu pago...");

    const response = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId: data.orderId }),
    });

    const captureData = await response.json();

    if (!response.ok) {
      throw new Error(
        captureData?.error || "No se pudo confirmar el pago de PayPal."
      );
    }

    setOrderId(data.orderId);
    setStatus("success");
    setMessage("¡Pago completado! Premium anual activado.");
    return captureData;
  }

  async function initializePayPal() {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      if (!clientId || clientId === "TU_PAYPAL_CLIENT_ID") {
        throw new Error(
          "Falta NEXT_PUBLIC_PAYPAL_CLIENT_ID en tu archivo .env.local."
        );
      }

      if (!window.paypal) {
        throw new Error("No se pudo cargar el SDK de PayPal.");
      }

      const sdkInstance = await window.paypal.createInstance({
        clientId,
        components: ["paypal-payments"],
        pageType: "checkout",
      });

      const eligibility = await sdkInstance.findEligibleMethods({
        currencyCode: "USD",
      });

      if (!eligibility.isEligible("paypal")) {
        throw new Error("PayPal no está disponible para esta sesión.");
      }

      const paymentSession =
        await sdkInstance.createPayPalOneTimePaymentSession({
          onApprove: captureOrder,
          onCancel: () => {
            setStatus("cancelled");
            setMessage("Pago cancelado. No se realizó ningún cargo.");
          },
          onError: (error) => {
            console.error("PayPal error:", error);
            setStatus("error");
            setMessage("Ocurrió un error con PayPal. Inténtalo otra vez.");
          },
        });

      const container = buttonContainerRef.current;
      if (!container) return;

      container.innerHTML = "";

      const paypalButton = document.createElement("paypal-button");
      paypalButton.setAttribute("type", "pay");
      paypalButton.setAttribute("aria-label", "Pagar con PayPal");

      paypalButton.addEventListener("click", async () => {
        try {
          // PayPal v6 recomienda pasar la promesa sin esperarla antes de start().
          const createOrderPromise = createOrder();

          await paymentSession.start(
            { presentationMode: "auto" },
            createOrderPromise
          );
        } catch (error) {
          console.error("Checkout error:", error);
          setStatus("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "No se pudo iniciar el pago."
          );
        }
      });

      container.appendChild(paypalButton);
      setStatus("ready");
      setMessage("PayPal está listo.");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo inicializar PayPal."
      );
    }
  }

  return (
    <>
      <Script src={paypalScript} strategy="afterInteractive" onLoad={initializePayPal} />

      <main className="min-h-screen bg-[#f7f9ff] px-4 py-10">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl bg-gradient-to-br from-[#6f77f6] to-[#8573eb] p-8 text-white shadow-xl">
            <div className="mb-8 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              🦝 Raccoon Study Premium
            </div>

            <h1 className="text-4xl font-black leading-tight">
              Lleva tu estudio al siguiente nivel.
            </h1>

            <p className="mt-4 max-w-lg text-white/85">
              Desbloquea Premium anual y disfruta todas las funciones de
              Raccoon Study.
            </p>

            <div className="mt-8 space-y-3 text-sm font-medium">
              <p>✓ Acceso Premium durante 1 año</p>
              <p>✓ Herramientas de estudio con IA</p>
              <p>✓ Métodos, juegos y recursos Premium</p>
              <p>✓ Experiencia completa de Raccoon Study</p>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-7 shadow-xl">
            <p className="text-sm font-bold uppercase tracking-wider text-[#6f77f6]">
              Premium anual
            </p>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-black text-slate-900">${PRICE}</span>
              <span className="pb-1 text-slate-500">USD / año</span>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Pago seguro procesado por PayPal.
            </p>

            <div className="my-6 h-px bg-slate-200" />

            {status !== "success" && (
              <div ref={buttonContainerRef} className="min-h-14" />
            )}

            {status === "loading" && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                {message}
              </div>
            )}

            {status === "processing" && (
              <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
                {message}
              </div>
            )}

            {status === "cancelled" && (
              <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
                {message}
              </div>
            )}

            {status === "error" && (
              <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                {message}
              </div>
            )}

            {status === "success" && (
              <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-800">
                <p className="text-lg font-black">🎉 ¡Listo!</p>
                <p className="mt-1 text-sm font-semibold">{message}</p>
                {orderId && (
                  <p className="mt-3 break-all text-xs text-emerald-700">
                    Orden PayPal: {orderId}
                  </p>
                )}
              </div>
            )}

            <p className="mt-6 text-center text-xs text-slate-400">
              Tu información de pago se procesa directamente con PayPal.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
