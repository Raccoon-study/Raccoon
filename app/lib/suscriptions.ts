export type PlanType =
  | "free"
  | "month"
  | "year"
  | "group";

export function normalizarPlan(
  valor: unknown
): PlanType {
  const plan = String(valor || "")
    .trim()
    .toLowerCase();

  if (
    plan === "group" ||
    plan === "grupo" ||
    plan === "group_plan" ||
    plan === "premium_group"
  ) {
    return "group";
  }

  if (
    plan === "year" ||
    plan === "annual" ||
    plan === "anual" ||
    plan === "premium_year" ||
    plan === "premium_anual"
  ) {
    return "year";
  }

  if (
    plan === "month" ||
    plan === "monthly" ||
    plan === "mensual" ||
    plan === "premium" ||
    plan === "premium_month" ||
    plan === "premium_mensual"
  ) {
    return "month";
  }

  return "free";
}

export function esPlanPremium(
  plan: unknown
): boolean {
  const planNormalizado =
    normalizarPlan(plan);

  return (
    planNormalizado === "month" ||
    planNormalizado === "year" ||
    planNormalizado === "group"
  );
}

export function esPlanGrupal(
  plan: unknown
): boolean {
  return normalizarPlan(plan) === "group";
}

export function nombrePlan(
  plan: unknown
): string {
  switch (normalizarPlan(plan)) {
    case "month":
      return "Premium mensual";

    case "year":
      return "Premium anual";

    case "group":
      return "Raccoon Grupo";

    default:
      return "Gratuito";
  }
}