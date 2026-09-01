import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const resendApiKey =
  process.env.RESEND_API_KEY;

const fromEmail =
  process.env.RESEND_FROM_EMAIL ||
  "Raccoon Study <onboarding@resend.dev>";

function fechaPanamaActual(): string {
  const partes = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/Panama",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(new Date());

  const valor = (tipo: string) =>
    partes.find(
      (parte) => parte.type === tipo
    )?.value || "";

  return `${valor("year")}-${valor(
    "month"
  )}-${valor("day")}`;
}

function diferenciaDias(
  desdeISO: string,
  hastaISO: string
): number {
  const desde =
    new Date(
      `${desdeISO}T12:00:00Z`
    );

  const hasta =
    new Date(
      `${hastaISO}T12:00:00Z`
    );

  return Math.round(
    (
      hasta.getTime() -
      desde.getTime()
    ) /
      86400000
  );
}

function construirMensaje(
  titulo: string,
  dias: number
): string {
  if (dias === 0) {
    return `¡Hoy es "${titulo}"! Revisa lo importante y confía en lo que has estudiado.`;
  }

  if (dias === 1) {
    return `Te queda 1 día para "${titulo}". Es un buen momento para hacer un repaso final.`;
  }

  return `Te quedan ${dias} días para "${titulo}". Organiza una sesión de estudio y avanza con tiempo.`;
}

export async function GET(
  request: NextRequest
) {
  try {
    const cronSecret =
      process.env.CRON_SECRET;

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      cronSecret &&
      authorization !==
        `Bearer ${cronSecret}`
    ) {
      return NextResponse.json(
        {
          error: "No autorizado.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !resendApiKey
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan variables de entorno para recordatorios.",
        },
        {
          status: 500,
        }
      );
    }

    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

    const resend =
      new Resend(
        resendApiKey
      );

    const hoy =
      fechaPanamaActual();

    const limite =
      new Date(
        `${hoy}T12:00:00Z`
      );

    limite.setUTCDate(
      limite.getUTCDate() + 7
    );

    const limiteISO =
      limite
        .toISOString()
        .slice(0, 10);

    const {
      data: eventos,
      error: errorEventos,
    } =
      await supabase
        .from("calendar_events")
        .select(
          "id, usuario_id, titulo, tipo, fecha_evento, hora_evento, recordatorio_activo, recordatorio_dias_antes"
        )
        .eq(
          "recordatorio_activo",
          true
        )
        .gte(
          "fecha_evento",
          hoy
        )
        .lte(
          "fecha_evento",
          limiteISO
        );

    if (errorEventos) {
      throw errorEventos;
    }

    let enviados = 0;
    let omitidos = 0;

    for (const evento of eventos || []) {
      const diasRestantes =
        diferenciaDias(
          hoy,
          String(
            evento.fecha_evento
          )
        );

      const diasConfigurados =
        Number(
          evento.recordatorio_dias_antes
        );

      if (
        diasRestantes !==
        diasConfigurados
      ) {
        omitidos++;
        continue;
      }

      const {
        data: existente,
      } =
        await supabase
          .from(
            "calendar_reminder_log"
          )
          .select("id")
          .eq(
            "evento_id",
            evento.id
          )
          .eq(
            "dias_antes",
            diasConfigurados
          )
          .maybeSingle();

      if (existente) {
        omitidos++;
        continue;
      }

      const {
        data: usuarioData,
        error: errorUsuario,
      } =
        await supabase.auth.admin.getUserById(
          evento.usuario_id
        );

      if (
        errorUsuario ||
        !usuarioData.user?.email
      ) {
        console.warn(
          "Usuario sin correo:",
          evento.usuario_id
        );
        omitidos++;
        continue;
      }

      const mensaje =
        construirMensaje(
          evento.titulo,
          diasRestantes
        );

      const asunto =
        diasRestantes === 0
          ? `📚 Hoy: ${evento.titulo}`
          : `⏰ ${mensaje.split(".")[0]}`;

      const {
        error: errorEmail,
      } = await resend.emails.send({
        from: fromEmail,
        to: [
          usuarioData.user.email,
        ],
        subject: asunto,
        html: `
          <div style="font-family:Arial,sans-serif;background:#f4f8ff;padding:30px;color:#10233f">
            <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:24px;padding:30px;border:1px solid #e4edf7">
              <div style="font-size:26px;font-weight:800;margin-bottom:8px">
                🦝 Raccoon Study
              </div>
              <div style="display:inline-block;background:#efe9ff;color:#6d4bdd;font-weight:700;padding:7px 12px;border-radius:999px;font-size:12px;margin-bottom:18px">
                Recordatorio de estudio
              </div>
              <h1 style="font-size:24px;margin:0 0 12px">${evento.titulo}</h1>
              <p style="font-size:16px;line-height:1.7;color:#526b87">${mensaje}</p>
              <div style="margin-top:22px;background:#f4f8ff;border-radius:16px;padding:16px;color:#526b87">
                <strong>Fecha:</strong> ${evento.fecha_evento}
                ${
                  evento.hora_evento
                    ? `<br/><strong>Hora:</strong> ${String(
                        evento.hora_evento
                      ).slice(0, 5)}`
                    : ""
                }
              </div>
              <p style="font-size:12px;color:#8ba0b7;margin-top:26px">
                Este correo fue enviado porque activaste un recordatorio en tu calendario de Raccoon Study.
              </p>
            </div>
          </div>
        `,
      });

      if (errorEmail) {
        console.error(
          "Error enviando correo:",
          errorEmail
        );
        omitidos++;
        continue;
      }

      await supabase
        .from(
          "calendar_notifications"
        )
        .insert({
          usuario_id:
            evento.usuario_id,
          evento_id:
            evento.id,
          titulo:
            "Recordatorio de calendario",
          mensaje,
          leida: false,
        });

      await supabase
        .from(
          "calendar_reminder_log"
        )
        .insert({
          evento_id:
            evento.id,
          dias_antes:
            diasConfigurados,
        });

      enviados++;
    }

    return NextResponse.json({
      ok: true,
      fecha: hoy,
      revisados:
        eventos?.length || 0,
      enviados,
      omitidos,
    });
  } catch (error) {
    console.error(
      "Error en recordatorios:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error generando recordatorios.",
      },
      {
        status: 500,
      }
    );
  }
}
