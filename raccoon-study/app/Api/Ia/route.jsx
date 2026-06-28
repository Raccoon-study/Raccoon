import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request){

try{

const {texto}=await req.json();

const respuesta=
await openai.chat.completions.create({

model:"gpt-4.1-mini",

messages:[

{
role:"system",
content:`
Eres una IA educativa.

Debes responder exactamente en JSON:

{
"resumen":"",
"flashcards":[
{
"pregunta":"",
"respuesta":""
}
],
"quiz":[
{
"pregunta":"",
"opciones":[],
"correcta":""
}
],
"mapaMental":"",
"metodos":[]
}
`
},

{
role:"user",
content:texto
}

],

temperature:0.7

});

const contenido=
respuesta.choices[0].message.content;

return NextResponse.json(
JSON.parse(contenido||"{}")
);

}catch(error){

return NextResponse.json(
{
error:"Error IA"
}
);

}

}