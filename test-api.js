const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  try {
    const year = new Date().getFullYear();
    const count = await prisma.moldRequest.count({
      where: { createdAt: { gte: new Date(year, 0, 1) } }
    });
    console.log("Count OK:", count);
    const ticket = "K3-" + year + "-" + String(count + 1).padStart(4, "0");
    console.log("Ticket:", ticket);
    const req = await prisma.moldRequest.create({
      data: {
        ticketNumber: ticket,
        moldNumber: "TEST-001",
        reason: "Prueba de conexion",
        employeeId: 1,
        priority: "NORMAL"
      }
    });
    console.log("Creada:", req.ticketNumber);
    await prisma.moldRequest.delete({ where: { id: req.id } });
    console.log("Eliminada - TODO OK");
  } catch(e) {
    console.error("ERROR:", e.message);
  }
  await prisma.$disconnect();
}
test();