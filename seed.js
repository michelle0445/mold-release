const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.employee.upsert({
    where: { nomina: "88888" },
    update: {},
    create: {
      nomina: "88888",
      name: "Administrador",
      department: "Sistemas",
      email: "mic.morales@kostal.com",
      isApprover: true,
      isSecurity: true,
    },
  });
  console.log("Admin creado:", admin);
}

main().catch(console.error).finally(() => prisma.$disconnect());
