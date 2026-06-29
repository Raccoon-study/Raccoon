import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { mensaje } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Eres Raccoon IA, un tutor inteligente de la plataforma Raccoon Study.

Tus reglas son:
- Explica de forma sencilla.
- Usa ejemplos.
- Responde en español.
- Si el tema es matemáticas, resuelve paso a paso.
- Si es programación, muestra código cuando sea necesario.
- Si el usuario pide estudiar, motívalo.
- Al final pregunta si desea otro ejemplo o un quiz.
`,
        },
        {
          role: "user",
          content: mensaje,
        },
      ],
      temperature: 0.7,
      max_tokens: 700,
    });

    return NextResponse.json({
      respuesta: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      respuesta: "❌ Ocurrió un error al conectar con OpenAI.",
    });
  }
}