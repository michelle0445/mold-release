import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, approvedById, comment } = body;
    if (!["APPROVED", "REJECTED"].includes(status))
      return NextResponse.json({ error: "Estado invalido" }, { status: 400 });
    const updated = await prisma.moldRequest.update({
      where: { id: parseInt(id) },
      data: {
        status,
        approvedById: approvedById || null,
        comment: comment || null,
        approvedAt: status === "APPROVED" ? new Date() : null,
        rejectedAt: status === "REJECTED" ? new Date() : null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
