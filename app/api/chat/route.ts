import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {

  try {

    const {
      mensaje,
      historial = []
    } = await req.json();

    const completion =
    await openai.chat.completions.create({

      model:"gpt-4o-mini",

      messages:[

        {
          role:"system",
          content:`
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
`
        },

        ...historial,

        {
          role:"user",
          content:mensaje
        }

      ],

      temperature:0.8,
      max_tokens:900

    });

    return NextResponse.json({

      respuesta:
      completion.choices[0].message.content

    });

  }

  catch(error){

    console.error(error);

    return NextResponse.json({

      respuesta:
      "❌ No pude responder en este momento."

    });

  }

}