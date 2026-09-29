import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({ where: { id: parseInt(id) } });
    if (!employee) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (employee.nomina === "88888") return NextResponse.json({ error: "No se puede eliminar al admin" }, { status: 403 });
    await prisma.request.deleteMany({ where: { employeeId: employee.id } });
    await prisma.employee.delete({ where: { id: employee.id } });
    return NextResponse.json({ message: "Eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
