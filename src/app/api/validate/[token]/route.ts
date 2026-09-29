import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const req = await prisma.request.findUnique({
      where: { token },
      include: {
        employee: { select: { nomina: true, name: true, department: true } },
        approver: { select: { nomina: true, name: true } },
        validator: { select: { nomina: true, name: true } },
      },
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
    const { comment } = await request.json();
    const req = await prisma.request.findUnique({ where: { token } });
    if (!req) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    if (req.status !== "APPROVED") return NextResponse.json({ error: "No esta aprobada" }, { status: 400 });
    let validator = req.securityEmail ? await prisma.employee.findFirst({ where: { email: req.securityEmail } }) : null;
    const updated = await prisma.request.update({
      where: { id: req.id },
      data: { status: "VALIDATED", validatedById: validator?.id || null, validatedAt: new Date(), comment: comment || req.comment },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: "Error: " + error.message }, { status: 500 });
  }
}
