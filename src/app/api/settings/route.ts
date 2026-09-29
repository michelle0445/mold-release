import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const security = await prisma.settings.findUnique({ where: { key: 'security_email' } });
    return NextResponse.json({ securityEmail: security?.value || '' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuracion' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { securityEmail } = await req.json();
    if (!securityEmail) {
      return NextResponse.json({ error: 'Correo de seguridad es requerido' }, { status: 400 });
    }
    await prisma.settings.upsert({
      where: { key: 'security_email' },
      update: { value: securityEmail },
      create: { key: 'security_email', value: securityEmail },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar configuracion' }, { status: 500 });
  }
}