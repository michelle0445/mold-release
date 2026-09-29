import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import prisma from '@/lib/db';

function generateTicket() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const r = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `MOL${y}${m}-${r}`;
}

function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticket = searchParams.get('ticket');
    const all = searchParams.get('all');
    if (ticket) {
      const request = await prisma.request.findFirst({ where: { ticketNumber: ticket }, include: { employee: true, approver: true, validator: true } });
      if (!request) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
      return NextResponse.json([request]);
    }
    if (all === 'true') {
      const requests = await prisma.request.findMany({ include: { employee: true, approver: true, validator: true }, orderBy: { createdAt: 'desc' } });
      return NextResponse.json(requests);
    }
    const nomina = searchParams.get('nomina');
    if (!nomina) return NextResponse.json({ error: 'Nomina requerida' }, { status: 400 });
    const employee = await prisma.employee.findUnique({ where: { nomina } });
    if (!employee) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    const requests = await prisma.request.findMany({ where: { employeeId: employee.id }, include: { employee: true, approver: true, validator: true }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(requests);
  } catch (error) { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nomina, category, reason, movementType, moldNumber, shift, productionLine, provider, plates, isMaquila, expectedReturnDate } = body;
    if (!nomina || !category || !reason || !moldNumber) {
      return NextResponse.json({ error: 'Faltan datos requeridos (categoria, motivo, molde)' }, { status: 400 });
    }
    const route = await prisma.approvalRoute.findUnique({ where: { category } });
    if (!route) return NextResponse.json({ error: 'No hay ruta para: ' + category }, { status: 400 });
    const securitySetting = await prisma.settings.findUnique({ where: { key: 'security_email' } });
    const secEmail = securitySetting?.value || null;
    const employee = await prisma.employee.findUnique({ where: { nomina } });
    if (!employee) return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    let approverId: number | null = null;
    const approverEmp = await prisma.employee.findFirst({ where: { email: route.approverEmail } });
    if (approverEmp) approverId = approverEmp.id;
    const ticketNumber = generateTicket();
    const token = generateToken();
    const request = await prisma.request.create({
      data: {
        ticketNumber, type: 'MOLD', movementType: movementType || 'SALIDA', status: 'PENDING', token,
        approverEmail: route.approverEmail, securityEmail: secEmail,
        reason, moldNumber, category,
        shift: shift || null, productionLine: productionLine || null,
        provider: provider || null, plates: plates || null,
        isMaquila: !!isMaquila, expectedReturnDate: expectedReturnDate || null,
        employeeId: employee.id, approvedById: approverId,
      },
    });
    const tipoLabel = (movementType || 'SALIDA') === 'SALIDA' ? 'Salida' : 'Entrada';
    try {
      const html = '<div style="font-family:Segoe UI,sans-serif;max-width:600px;margin:0 auto"><div style="background:#0056a6;color:#fff;padding:20px;border-radius:8px 8px 0 0"><h2 style="margin:0">' + tipoLabel + ' de Molde</h2></div><div style="padding:20px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px"><p><b>Ticket:</b> ' + ticketNumber + '</p><p><b>Tipo:</b> ' + tipoLabel + '</p><p><b>Empleado:</b> ' + employee.name + ' (' + employee.nomina + ')</p><p><b>Departamento:</b> ' + employee.department + '</p><p><b>Molde:</b> ' + moldNumber + '</p><p><b>Turno:</b> ' + (shift || '-') + '</p><p><b>Linea:</b> ' + (productionLine || '-') + '</p><p><b>Categoria:</b> ' + category + '</p><p><b>Motivo:</b> ' + reason + '</p>' + (provider ? '<p><b>Proveedor/Destino:</b> ' + provider + '</p>' : '') + (plates ? '<p><b>Placas:</b> ' + plates + '</p>' : '') + (isMaquila ? '<p><b>Maquila:</b> Si</p>' : '') + (expectedReturnDate ? '<p><b>Fecha esperada retorno:</b> ' + expectedReturnDate + '</p>' : '') + '<div style="margin-top:24px;text-align:center"><a href="http://10.112.56.79:3000/approve?token=' + token + '&action=approve" style="background:#22c55e;color:#fff;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:bold;margin-right:12px">APROBAR</a><a href="http://10.112.56.79:3000/approve?token=' + token + '&action=reject" style="background:#dc2626;color:#fff;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:bold">RECHAZAR</a></div></div></div>';
      await sendEmail(route.approverEmail, tipoLabel + ' de Molde ' + ticketNumber + ' - ' + employee.name, html);
    } catch (emailError) { console.error('Error sending email:', emailError); }
    return NextResponse.json({ ticketNumber, status: 'PENDING' }, { status: 201 });
  } catch (error) { console.error('Error:', error); return NextResponse.json({ error: 'Error al crear' }, { status: 500 }); }
}