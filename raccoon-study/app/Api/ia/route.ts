import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { texto } = await req.json();

    let resultado = "";

    if (!texto) {
      resultado = "Escribe algo primero 📚";
    } else {
      const t = texto.toLowerCase();

      if (t.includes("memorizar")) {
        resultado = "Usa Flashcards 🪪";
      } else if (t.includes("entender")) {
        resultado = "Usa Feynman 📝";
      } else {
        resultado = "Usa Pomodoro 🍅";
      }
    }

    return NextResponse.json({ resultado });

  } catch {
    return NextResponse.json({ resultado: "Error IA ❌" });
  }
}