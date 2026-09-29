import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { BASE_URL, SECURITY_EMAILS, DEFAULT_SECURITY } from "@/lib/config";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const req = await prisma.request.findUnique({
      where: { token },
      include: { employee: { select: { nomina: true, name: true, department: true } }, approver: { select: { nomina: true, name: true } } },
    });
    if (!req) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    return NextResponse.json(req);
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { action, comment } = await request.json();
    const req = await prisma.request.findUnique({ where: { token } });
    if (!req) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    if (req.status !== "PENDING") return NextResponse.json({ error: "Ya fue procesada" }, { status: 400 });
    let approver = await prisma.employee.findUnique({ where: { email: req.approverEmail } });
    if (action === "approve") {
      const secEmails = SECURITY_EMAILS.length > 0 ? SECURITY_EMAILS : [DEFAULT_SECURITY];
      const secEmail = secEmails[0];
      const updated = await prisma.request.update({
        where: { id: req.id },
        data: { status: "APPROVED", approvedById: approver?.id || null, approvedAt: new Date(), comment: comment || null, securityEmail: secEmail },
      });
      const validateUrl = BASE_URL + "/validate?token=" + token;
      const typeLabel = req.type === "MOLD" ? "Salida de Molde" : "Salida de Diversos";
      await sendEmail(secEmail,
        "[Kostal] " + req.ticketNumber + " APROBADA - Requiere validacion de seguridad",
        '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
        '<div style="background:#065f46;color:#fff;padding:20px;border-radius:8px 8px 0 0"><h2 style="margin:0">Solicitud Aprobada - Validacion Seguridad</h2></div>' +
        '<div style="border:1px solid #e2e8f0;padding:24px;border-radius:0 0 8px 8px">' +
        '<p>La solicitud <strong style="color:#10b981">' + req.ticketNumber + '</strong> fue APROBADA. Requiere tu validacion:</p>' +
        '<table style="width:100%;border-collapse:collapse;margin:16px 0">' +
        '<tr><td style="padding:8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:bold">Ticket</td><td style="padding:8px;border:1px solid #e2e8f0">' + req.ticketNumber + '</td></tr>' +
        '<tr><td style="padding:8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:bold">Tipo</td><td style="padding:8px;border:1px solid #e2e8f0">' + typeLabel + '</td></tr>' +
        '<tr><td style="padding:8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:bold">Aprobado por</td><td style="padding:8px;border:1px solid #e2e8f0">' + (approver?.name || req.approverEmail) + '</td></tr>' +
        '<tr><td style="padding:8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:bold">Razon</td><td style="padding:8px;border:1px solid #e2e8f0">' + req.reason + '</td></tr>' +
        '</table>' +
        '<div style="text-align:center;margin:24px 0"><a href="' + validateUrl + '" style="background:#10b981;color:#fff;padding:12px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px">Validar Salida</a></div>' +
        '</div></div>'
      );
      return NextResponse.json(updated);
    }
    if (action === "reject") {
      const updated = await prisma.request.update({
        where: { id: req.id },
        data: { status: "REJECTED", approvedById: approver?.id || null, rejectedAt: new Date(), comment: comment || null },
      });
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: "Accion no valida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Error: " + error.message }, { status: 500 });
  }
}
