import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../src/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { idioma, user_id } = await req.json();

    // ✅ si ya existe → update
    const { data: existing } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (existing) {
      await supabase
        .from("user_settings")
        .update({ idioma })
        .eq("user_id", user_id);
    } else {
      await supabase
        .from("user_settings")
        .insert([{ user_id, idioma }]);
    }

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ error: "Error servidor" });
  }
}