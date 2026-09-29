import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const routes = await prisma.approvalRoute.findMany({ orderBy: { category: 'asc' } });
    return NextResponse.json(routes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener rutas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { category, approverEmail, approverName } = await req.json();
    if (!category || !approverEmail) {
      return NextResponse.json({ error: 'Categoria y correo del aprobador son requeridos' }, { status: 400 });
    }
    const route = await prisma.approvalRoute.upsert({
      where: { category },
      update: { approverEmail, approverName: approverName || null },
      create: { category, approverEmail, approverName: approverName || null },
    });
    return NextResponse.json(route);
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar ruta' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    await prisma.approvalRoute.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar ruta' }, { status: 500 });
  }
}