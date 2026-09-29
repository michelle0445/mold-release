import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const users = await prisma.employee.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nomina, name, department, email, isApprover, isSecurity } = await request.json();
    if (!nomina || !name) return NextResponse.json({ error: "Nomina y nombre requeridos" }, { status: 400 });
    const exists = await prisma.employee.findUnique({ where: { nomina } });
    if (exists) return NextResponse.json({ error: "Nomina ya registrada" }, { status: 409 });
    const employee = await prisma.employee.create({
      data: { nomina, name, department: department || "", email: email || null, isApprover: isApprover || false, isSecurity: isSecurity || false },
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
