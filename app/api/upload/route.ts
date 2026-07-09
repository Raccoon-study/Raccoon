import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import mammoth from "mammoth";
import OpenAI from "openai";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const archivo = formData.get("archivo") as File;
    const usuario_id = formData.get("usuario_id") as string;

    if (!archivo) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo." },
        { status: 400 }
      );
    }

    if (!usuario_id) {
      return NextResponse.json(
        { error: "Usuario no autenticado." },
        { status: 401 }
      );
    }

    const extension = archivo.name
      .split(".")
      .pop()
      ?.toLowerCase();

    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let texto = "";
    async function extraerTextoPDF(buffer: Buffer) {

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
  }).promise;

  let texto = "";

  for (let i = 1; i <= pdf.numPages; i++) {

    const pagina = await pdf.getPage(i);

    const contenido = await pagina.getTextContent();

    texto += contenido.items
      .map((item: any) => item.str)
      .join(" ");

    texto += "\n";

  }

  return texto;

}

if (extension === "pdf") {

  texto = await extraerTextoPDF(buffer);

}

else if (extension === "docx") {

  const resultado = await mammoth.extractRawText({
    buffer,
  });

  texto = resultado.value;

}

else if (extension === "txt") {

  texto = buffer.toString("utf8");

}

else {

  return NextResponse.json(
    {
      error: "Formato no soportado.",
    },
    {
      status: 400,
    }
  );

}

    if (!texto.trim()) {

      return NextResponse.json(
        {
          error: "No fue posible extraer texto.",
        },
        {
          status: 400,
        }
      );

    }

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      response_format: {
        type: "json_object",
      },

      messages: [

        {
          role: "system",
          content: `
Eres Raccoon IA.

Analiza el documento.

Devuelve únicamente un JSON con este formato:

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
     "opciones":["","","",""],
     "correcta":""
   }
 ],
 "recomendacion":""
}
`
        },

        {
          role: "user",
          content: texto,
        },

      ],

      temperature: 0.4,

    });

    const respuestaIA = completion.choices[0].message.content;

    if (!respuestaIA) {
      throw new Error("La IA no devolvió respuesta.");
    }

    const analisis = JSON.parse(respuestaIA);
        // Subir archivo al Storage
    const nombreArchivo = `${Date.now()}-${archivo.name}`;

    const { error: storageError } = await supabase.storage
      .from("materiales")
      .upload(nombreArchivo, archivo);

    if (storageError) {
      throw storageError;
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from("materiales")
      .getPublicUrl(nombreArchivo);

    // Guardar en la base de datos
    const { error: dbError } = await supabase
      .from("materiales")
      .insert({
        usuario_id: usuario_id,
        nombre_archivo: archivo.name,
        url_archivo: urlData.publicUrl,
        tipo_archivo: extension,
        texto: texto,
        resumen: analisis.resumen,
        flashcards: analisis.flashcards,
        quiz: analisis.quiz,
        recomendacion: analisis.recomendacion,
        progreso: 0,
      });

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      mensaje: "Archivo procesado correctamente.",
      data: {
        nombre: archivo.name,
        resumen: analisis.resumen,
        flashcards: analisis.flashcards,
        quiz: analisis.quiz,
        recomendacion: analisis.recomendacion,
      },
    });

  } catch (error: any) {

    console.error("ERROR EN UPLOAD");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message ?? "Ocurrió un error.",
      },
      {
        status: 500,
      }
    );

  }
}