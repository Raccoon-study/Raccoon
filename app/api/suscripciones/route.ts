import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";



type PlanType = "year" | "month" | "free";

export async function POST(req: NextRequest) {
  try {
    const { plan }: { plan: PlanType } = await req.json();

    const prices: Record<PlanType, number> = {
      year: 9,
      month: 0.99,
      free: 0,
    };

    const { data, error } = await supabase
      .from("subscriptions")
      .insert([
        {
          plan,
          amount: prices[plan],
          status: "active",
        },
      ]);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch {
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}