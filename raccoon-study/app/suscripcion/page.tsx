"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  CheckCircle2,
  Circle,
} from "lucide-react";

type PlanType = "year" | "month" | "free";

export default function Page() {
  const router = useRouter();

  const [plan, setPlan] = useState<PlanType>("year");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/suscripciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      console.log("✅ Guardado:", data);

      alert("Suscripción guardada ✅");

      // ✅ opcional: redirigir
      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Error ❌");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center">

      {/* CONTENEDOR */}
      <div className="w-full max-w-2xl px-4 sm:px-6 pb-24">

        {/* HEADER */}
        <header className="flex items-center gap-4 py-6">
          <ArrowLeft
            className="cursor-pointer"
            onClick={() => router.back()}
          />

          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              Suscribirse
              <Crown className="text-yellow-500" size={18} />
            </h1>
            <p className="text-sm text-slate-400">
              Elige el plan perfecto para ti
            </p>
          </div>
        </header>

        {/* PLANES */}
        <div className="space-y-4">

          <PlanCard
            title="Premium Anual"
            price="$9"
            extra="/año"
            selected={plan === "year"}
            onClick={() => setPlan("year")}
            badge="Mejor valor"
          />

          <PlanCard
            title="Premium Mensual"
            price="$0.99"
            extra="/mes"
            selected={plan === "month"}
            onClick={() => setPlan("month")}
          />

          <PlanCard
            title="Plan Gratuito"
            price="$0"
            extra="/mes"
            selected={plan === "free"}
            onClick={() => setPlan("free")}
            muted
          />

          {/* BOTÓN */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow transition"
          >
            {loading ? "Procesando..." : "Continuar"}
          </button>

          {/* RESTAURAR */}
          <p className="text-center text-sm text-blue-600 cursor-pointer">
            Restaurar compras
          </p>

          {/* IMAGEN */}
          <div className="flex justify-center pt-8">
            <img
              src="/raccoon.png"
              alt="Mascota"
              className="w-56 h-56 object-contain"
            />
          </div>

        </div>
      </div>
    </div>
  );
}

/* ✅ CARD */
function PlanCard({
  title,
  price,
  extra,
  selected,
  onClick,
  badge,
  muted,
}: any) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border cursor-pointer transition
      ${selected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}
      `}
    >
      <div className="flex justify-between items-center">

        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{title}</span>

            {badge && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                {badge}
              </span>
            )}
          </div>

          <ul
            className={`mt-2 space-y-1 text-xs ${
              muted ? "text-slate-400" : "text-slate-600"
            }`}
          >
            <li className="flex items-center gap-2">
              {muted ? (
                <Circle size={14} />
              ) : (
                <CheckCircle2 size={14} className="text-green-500" />
              )}
              {muted ? "Acceso limitado" : "Acceso ilimitado"}
            </li>

            <li className="flex items-center gap-2">
              {muted ? (
                <Circle size={14} />
              ) : (
                <CheckCircle2 size={14} className="text-green-500" />
              )}
              {muted ? "Con anuncios" : "Sin anuncios"}
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-bold">{price}</span>
            <span className="text-xs text-slate-400 ml-1">{extra}</span>
          </div>

          {selected ? (
            <CheckCircle2 className="text-blue-600" />
          ) : (
            <Circle className="text-slate-300" />
          )}
        </div>

      </div>
    </div>
  );
}