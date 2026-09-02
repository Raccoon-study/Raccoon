import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function crearSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function precioPorCantidad(cantidad: number) {
  if (cantidad >= 500) {
    return 1.99;
  }

  if (cantidad >= 200) {
    return 2.49;
  }

  return 2.99;
}

function textoSeguro(valor: unknown) {
  return typeof valor === "string"
    ? valor.trim()
    : "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const institucion = textoSeguro(body.institucion);
    const responsable = textoSeguro(body.responsable);
    const correo = textoSeguro(body.correo);
    const cantidadEstudiantes = Math.max(
      50,
      Number(body.cantidad_estudiantes) || 50
    );

    if (!institucion || !responsable || !correo) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Institución, responsable y correo son obligatorios.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El correo institucional no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = crearSupabaseAdmin();

    let usuarioId: string | null = null;

    const authorization =
      request.headers.get("authorization");

    if (
      authorization?.startsWith("Bearer ")
    ) {
      const token =
        authorization.slice(7);

      const {
        data: { user },
      } =
        await supabase.auth.getUser(token);

      usuarioId = user?.id || null;
    }

    const precioUnitario =
      precioPorCantidad(
        cantidadEstudiantes
      );

    const estimadoMensual =
      Number(
        (
          cantidadEstudiantes *
          precioUnitario
        ).toFixed(2)
      );

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "institution_requests"
        )
        .insert({
          usuario_id:
            usuarioId,
          institucion,
          responsable,
          correo,
          cantidad_estudiantes:
            cantidadEstudiantes,
          precio_unitario:
            precioUnitario,
          estimado_mensual:
            estimadoMensual,
          estado:
            "pendiente",
        })
        .select(
          "id, institucion, correo, cantidad_estudiantes, precio_unitario, estimado_mensual, estado, creado_en"
        )
        .single();

    if (error) {
      throw new Error(
        error.message
      );
    }

    const resendKey =
      process.env.RESEND_API_KEY;

    const from =
      process.env.RESEND_FROM_EMAIL;

    const ventas =
      process.env
        .INSTITUTION_SALES_EMAIL;

    if (
      resendKey &&
      from &&
      ventas
    ) {
      const resend =
        new Resend(
          resendKey
        );

      await resend.emails.send({
        from,
        to: [ventas],
        replyTo: correo,
        subject:
          `Nueva solicitud institucional · ${institucion}`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;color:#10233f">
            <h2>Nueva solicitud institucional</h2>
            <p><b>Institución:</b> ${institucion}</p>
            <p><b>Responsable:</b> ${responsable}</p>
            <p><b>Correo:</b> ${correo}</p>
            <p><b>Estudiantes:</b> ${cantidadEstudiantes}</p>
            <p><b>Precio por estudiante:</b> $${precioUnitario.toFixed(2)}/mes</p>
            <p><b>Estimado mensual:</b> $${estimadoMensual.toFixed(2)}</p>
          </div>
        `,
      });

      await resend.emails.send({
        from,
        to: [correo],
        subject:
          "Recibimos tu solicitud · Raccoon Study",
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;color:#10233f">
            <h2>¡Gracias por contactar a Raccoon Study!</h2>
            <p>Hola ${responsable}, recibimos la solicitud para <b>${institucion}</b>.</p>
            <p>La propuesta estimada para ${cantidadEstudiantes} estudiantes es de <b>$${precioUnitario.toFixed(2)} por estudiante/mes</b>.</p>
            <p>Estimado mensual: <b>$${estimadoMensual.toFixed(2)}</b>.</p>
            <p>Nuestro equipo podrá contactarte para confirmar condiciones, implementación y soporte.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      ok: true,
      solicitud: data,
    });
  } catch (error) {
    console.error(
      "Error creando solicitud institucional:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo procesar la solicitud.",
      },
      {
        status: 500,
      }
    );
  }
}
