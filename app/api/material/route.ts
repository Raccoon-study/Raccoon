import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {

    const {
      usuario_id,
      tipo
    } = await req.json();

    // ==========================
    // Buscar último material
    // ==========================

    const { data, error } = await supabase
      .from("materiales")
      .select("*")
      .eq("usuario_id", usuario_id)
      .order("fecha_subida", {
        ascending: false,
      })
      .limit(1)
      .single();

    if (error || !data) {

      return NextResponse.json({
        error: "No existe material."
      });

    }

    const texto = data.texto;

    if (!texto) {

      return NextResponse.json({
        error: "El PDF todavía no tiene texto."
      });

    }

    // ==========================
    // Prompt según el método
    // ==========================

    let prompt = "";

    switch (tipo) {

      case "resumen":

        prompt = `
Resume este documento.

Hazlo claro.

Usa títulos.

Usa viñetas.

Máximo 500 palabras.

Documento:

${texto}
`;

        break;

      case "flashcards":

        prompt = `
Genera 15 flashcards.

Formato:

Pregunta:
Respuesta:

Documento:

${texto}
`;

        break;

      case "quiz":

        prompt = `
Genera 10 preguntas tipo quiz.

Cada una con:

Pregunta

4 opciones

Respuesta correcta

Documento:

${texto}
`;

        break;

      case "feynman":

        prompt = `
Explícalo como si fuera un estudiante de 12 años.

Usa ejemplos.

Documento:

${texto}
`;

        break;

      case "blurting":

        prompt = `
Extrae únicamente las ideas principales.

Documento:

${texto}
`;

        break;

      case "active":

        prompt = `
Haz preguntas abiertas para Active Recall.

Documento:

${texto}
`;

        break;

      default:

        prompt = texto;

    }

    // ==========================
    // OpenAI
    // ==========================

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [

        {

          role: "system",

          content:
            "Eres Raccoon IA, un tutor inteligente.",

        },

        {

          role: "user",

          content: prompt,

        },

      ],

      temperature: 0.5,

      max_tokens: 1800,

    });

    return NextResponse.json({

      resultado:
        completion.choices[0].message.content,

    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({

      error: "Error interno.",

    });

  }
}