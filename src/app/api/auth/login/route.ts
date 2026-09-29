import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { nomina } = await request.json()
    if (!nomina) {
      return NextResponse.json({ error: 'Nomina requerida' }, { status: 400 })
    }
    let employee = await prisma.employee.findUnique({
      where: { nomina: String(nomina) }
    })
    let isNew = false
    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          nomina: String(nomina),
          name: 'Empleado ' + String(nomina),
          department: 'Sin asignar',
          isApprover: false,
          isSecurity: false,
        }
      })
      isNew = true
    }
    return NextResponse.json({ user: employee, isNew })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}