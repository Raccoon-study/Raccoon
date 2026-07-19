import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("Falta la variable OPENAI_API_KEY");

      return NextResponse.json(
        {
          respuesta: "❌ La inteligencia artificial no está configurada.",
        },
        {
          status: 500,
        }
      );
    }

    // Se crea dentro del POST para evitar errores durante el build
    const openai = new OpenAI({
      apiKey,
    });

    const {
      mensaje,
      historial = [],
    } = await req.json();

    if (!mensaje || typeof mensaje !== "string") {
      return NextResponse.json(
        {
          respuesta: "❌ Escribe un mensaje válido.",
        },
        {
          status: 400,
        }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",
          content: `
Eres Raccoon IA de Raccoon Study.

Recuerda todo el contexto recibido en los mensajes anteriores.

Si el usuario responde algo corto como:

"Sí"
"No"
"A"
"B"
"56"

debes interpretar que probablemente responde al último tema de conversación.

Nunca actúes como si fuera una conversación nueva si existe contexto previo.
          `,
        },

        ...historial,

        {
          role: "user",
          content: mensaje,
        },
      ],

      temperature: 0.8,
      max_tokens: 900,
    });

    return NextResponse.json({
      respuesta:
        completion.choices[0]?.message?.content ??
        "No pude generar una respuesta.",
    });
  } catch (error) {
    console.error("Error de Raccoon IA:", error);

    return NextResponse.json(
      {
        respuesta: "❌ No pude responder en este momento.",
      },
      {
        status: 500,
      }
    );
  }
}