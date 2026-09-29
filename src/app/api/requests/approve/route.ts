import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const { requestId, approvedById } = await req.json();
  const request = await prisma.moldRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", approvedById, approvedAt: new Date() },
    include: { employee: true, approver: true },
  });
  return NextResponse.json(request);
}
