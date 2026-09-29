const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.employee.count().then(c => console.log("Empleados: " + c)).finally(() => p.$disconnect());