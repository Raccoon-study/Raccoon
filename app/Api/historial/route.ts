import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export async function GET() {

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({
      error: error.message,
    });
  }

  return NextResponse.json(data);
}