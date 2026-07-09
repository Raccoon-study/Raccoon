import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request){

try{

const {texto}=await req.json();

const respuesta=
await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[

{
role:"system",
content:`
Eres un profesor experto.

Debes crear un resumen limpio.

Organízalo así:

📌 Idea principal

📖 Explicación

⭐ Conceptos importantes

✅ Conclusión

No uses listas enormes.
`
},

{
role:"user",
content:texto
}

],

temperature:0.5

});

return NextResponse.json({

resumen:
respuesta.choices[0].message.content

});

}

catch{

return NextResponse.json({

resumen:"Error al generar resumen."

});

}

}