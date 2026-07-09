"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

      console.log(data);

      alert("Suscripción guardada");

      router.push("/Dashboard");

    } catch (err) {

      console.error(err);

      alert("Ocurrió un error");

    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#B9D1F8] via-[#DDEBFF] to-[#EEF5FF] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">

      <div className="max-w-3xl mx-auto px-5 py-8">

        {/* Header */}

        <div className="flex items-center gap-4">

          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/60 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft />
          </button>

          <div>

            <h1 className="text-3xl font-bold flex items-center gap-2 dark:text-white">

              Freemium

              <Crown
                className="text-yellow-500"
                size={24}
              />

            </h1>

            <p className="text-slate-500 dark:text-slate-400">

              Desbloquea todo el potencial de Raccoon Study

            </p>

          </div>

        </div>

        {/* Mascota */}

        <div className="flex justify-center py-8">

          <Image
            src="/raccoon.png"
            alt="Raccoon"
            width={180}
            height={180}
            priority
          />

        </div>

        {/* Planes */}

        <div className="space-y-5">

          <PlanCard
            title="Premium Anual"
            price="$69.99"
            extra="/año"
            selected={plan === "year"}
            badge="🔥 Mejor oferta"
            onClick={() => setPlan("year")}
          />

          <PlanCard
            title="Premium Mensual"
            price="$5.99"
            extra="/mes"
            selected={plan === "month"}
            onClick={() => setPlan("month")}
          />

          <PlanCard
            title="Plan Gratuito"
            price="$0"
            extra="/mes"
            selected={plan === "free"}
            muted
            onClick={() => setPlan("free")}
          />

        </div>

        {/* Botón */}

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition text-white font-bold py-4 shadow-xl disabled:opacity-70"
        >
          {loading ? "Procesando..." : "Continuar"}
        </button>

        <button className="mt-4 w-full text-blue-600 dark:text-cyan-400 font-medium">

          Restaurar compras

        </button>

      </div>

    </main>
  );
}

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

      className={`

      rounded-3xl

      p-6

      cursor-pointer

      transition-all

      shadow-lg

      border-2

      ${
        selected
          ? "border-blue-500 bg-blue-50 dark:bg-slate-800 dark:border-cyan-400"
          : "border-transparent bg-white dark:bg-slate-900"
      }

      hover:scale-[1.02]

      `}

    >

      <div className="flex justify-between items-start gap-4">

        <div>

          <div className="flex items-center gap-3 flex-wrap">

            <h2 className="text-xl font-bold dark:text-white">

              {title}

            </h2>

            {badge && (

              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-cyan-900 text-blue-700 dark:text-cyan-300 text-xs font-semibold">

                {badge}

              </span>

            )}

          </div>

          <div className="mt-5 space-y-3">

            <Feature
              active={!muted}
              text="Resúmenes ilimitados con IA"
            />

            <Feature
              active={!muted}
              text="Flashcards automáticas"
            />

            <Feature
              active={!muted}
              text="Quiz inteligentes"
            />

            <Feature
              active={!muted}
              text="Sin anuncios"
            />

            <Feature
              active={!muted}
              text="Soporte prioritario"
            />

          </div>

        </div>

        <div className="text-right">

          <h2 className="text-3xl font-bold dark:text-white">

            {price}

          </h2>

          <p className="text-slate-500 dark:text-slate-400">

            {extra}

          </p>

          <div className="mt-5">

            {selected ? (

              <CheckCircle2
                className="text-blue-600"
                size={28}
              />

            ) : (

              <Circle
                className="text-slate-300"
                size={28}
              />

            )}

          </div>

        </div>

      </div>

    </div>

  );
}

function Feature({
  active,
  text,
}: {
  active: boolean;
  text: string;
}) {

  return (

    <div className="flex items-center gap-3">

      {active ? (

        <CheckCircle2
          className="text-green-500"
          size={18}
        />

      ) : (

        <Circle
          className="text-slate-400"
          size={18}
        />

      )}

      <span
        className={`${
          active
            ? "text-slate-700 dark:text-slate-300"
            : "text-slate-400"
        }`}
      >
        {text}
      </span>

    </div>

  );
}