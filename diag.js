const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function diag() {
  try {
    const emp = await prisma.employee.findFirst({ where: { nomina: "40003" } });
    console.log("1. Empleado encontrado:", emp ? emp.name : "NO");

    const year = new Date().getFullYear();
    const count = await prisma.moldRequest.count({
      where: { createdAt: { gte: new Date(year, 0, 1) } }
    });
    console.log("2. Count OK:", count);

    const ticket = "K3-" + year + "-" + String(count + 1).padStart(4, "0");
    console.log("3. Ticket:", ticket);

    const req = await prisma.moldRequest.create({
      data: {
        ticketNumber: ticket,
        moldNumber: "PRUEBA",
        reason: "Test",
        employeeId: emp.id,
        priority: "NORMAL"
      },
      include: { employee: true }
    });
    console.log("4. Creada:", req.ticketNumber, "ID:", req.id);

    await prisma.moldRequest.delete({ where: { id: req.id } });
    console.log("5. Eliminada - TODO BIEN");
  } catch(e) {
    console.error("ERROR:", e.message);
    console.error("CODE:", e.code);
  }
  await prisma.$disconnect();
}
diag();