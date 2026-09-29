import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const { nomina } = await req.json();
  const employee = await prisma.employee.findUnique({ where: { nomina } });
  if (!employee) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(employee);
}