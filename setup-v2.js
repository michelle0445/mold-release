const fs = require("fs");
const path = require("path");
const base = "C:\\Users\\Moral033\\mold-release";

// ── 1. SCHEMA ──
fs.writeFileSync(path.join(base, "prisma", "schema.prisma"), `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Employee {
  id         Int           @id @default(autoincrement())
  nomina     String        @unique
  name       String
  department String
  isApprover Boolean       @default(false)
  requests   MoldRequest[]
  approvals  MoldRequest[] @relation("Approvals")
}

model MoldRequest {
  id             Int       @id @default(autoincrement())
  ticketNumber   String    @unique
  moldNumber     String
  reason         String
  status         String    @default("PENDING")
  priority       String    @default("NORMAL")
  shift          String?
  productionLine String?
  createdAt      DateTime  @default(now())
  approvedAt     DateTime?
  rejectedAt     DateTime?
  employeeId     Int
  approvedById   Int?
  comment        String?
  employee       Employee  @relation(fields: [employeeId], references: [id])
  approver       Employee? @relation("Approvals", fields: [approvedById], references: [id])
}
`, "utf8");
console.log("1/7 schema.prisma OK");

// ── 2. API REQUESTS ──
fs.mkdirSync(path.join(base, "src", "app", "api", "requests", "approve"), { recursive: true });
fs.mkdirSync(path.join(base, "src", "app", "api", "requests", "reject"), { recursive: true });
fs.mkdirSync(path.join(base, "src", "app", "api", "requests", "stats"), { recursive: true });
fs.mkdirSync(path.join(base, "src", "app", "api", "molds"), { recursive: true });

fs.writeFileSync(path.join(base, "src", "app", "api", "requests", "route.ts"), `import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const where: any = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (search) {
    where.OR = [
      { moldNumber: { contains: search } },
      { ticketNumber: { contains: search } },
      { reason: { contains: search } },
      { employee: { name: { contains: search } } },
    ];
  }
  const requests = await prisma.moldRequest.findMany({
    where, include: { employee: true, approver: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const { moldNumber, reason, employeeId, priority, shift, productionLine } = await req.json();
  if (!moldNumber || !reason || !employeeId) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }
  const year = new Date().getFullYear();
  const count = await prisma.moldRequest.count({
    where: { createdAt: { gte: new Date(year, 0, 1) } },
  });
  const ticketNumber = "K3-" + year + "-" + String(count + 1).padStart(4, "0");
  const request = await prisma.moldRequest.create({
    data: {
      ticketNumber, moldNumber: moldNumber.trim(), reason: reason.trim(),
      employeeId, priority: priority || "NORMAL",
      shift: shift || null, productionLine: productionLine || null,
    },
    include: { employee: true },
  });
  return NextResponse.json(request, { status: 201 });
}
`, "utf8");
console.log("2/7 api/requests OK");

// ── 3. API APPROVE ──
fs.writeFileSync(path.join(base, "src", "app", "api", "requests", "approve", "route.ts"), `import { NextRequest, NextResponse } from "next/server";
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
`, "utf8");
console.log("3/7 api/approve OK");

// ── 4. API REJECT ──
fs.writeFileSync(path.join(base, "src", "app", "api", "requests", "reject", "route.ts"), `import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const { requestId, approvedById, comment } = await req.json();
  const request = await prisma.moldRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", approvedById, comment, rejectedAt: new Date() },
    include: { employee: true, approver: true },
  });
  return NextResponse.json(request);
}
`, "utf8");
console.log("4/7 api/reject OK");

// ── 5. API STATS ──
fs.writeFileSync(path.join(base, "src", "app", "api", "requests", "stats", "route.ts"), `import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, pending, approvedToday, approvedWeek, rejectedWeek, totalMonth, urgentPending, criticalPending] = await Promise.all([
    prisma.moldRequest.count(),
    prisma.moldRequest.count({ where: { status: "PENDING" } }),
    prisma.moldRequest.count({ where: { status: "APPROVED", approvedAt: { gte: todayStart } } }),
    prisma.moldRequest.count({ where: { status: "APPROVED", approvedAt: { gte: weekStart } } }),
    prisma.moldRequest.count({ where: { status: "REJECTED", rejectedAt: { gte: weekStart } } }),
    prisma.moldRequest.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.moldRequest.count({ where: { status: "PENDING", priority: "URGENTE" } }),
    prisma.moldRequest.count({ where: { status: "PENDING", priority: "CRITICO" } }),
  ]);

  return NextResponse.json({
    total, pending, approvedToday, approvedWeek, rejectedWeek, totalMonth, urgentPending, criticalPending,
  });
}
`, "utf8");
console.log("5/7 api/stats OK");

// ── 6. API MOLDS ──
fs.writeFileSync(path.join(base, "src", "app", "api", "molds", "route.ts"), `import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const molds = await prisma.moldRequest.findMany({
    select: { moldNumber: true }, distinct: ["moldNumber"], orderBy: { moldNumber: "asc" }, take: 100,
  });
  return NextResponse.json(molds.map((m: any) => m.moldNumber));
}
`, "utf8");
console.log("6/7 api/molds OK");

console.log("7/7 Archivos de API listos. Ahora ejecuta: npx prisma db push");