'use client';
import { useState, useEffect } from 'react';

interface Employee { nomina: string; name: string; department: string; }
interface Req { id: number; ticketNumber: string; status: string; movementType: string; category: string | null; reason: string; moldNumber: string | null; shift: string | null; productionLine: string | null; provider: string | null; plates: string | null; isMaquila: boolean; expectedReturnDate: string | null; createdAt: string; approvedAt: string | null; validatedAt: string | null; rejectedAt: string | null; approverEmail: string; comment: string | null; employee: Employee; approver: Employee | null; validator: Employee | null; }

const SL: Record<string,string> = { PENDING:'PENDIENTE', APPROVED:'APROBADA', VALIDATED:'VALIDADA', REJECTED:'RECHAZADA' };
const SC: Record<string,string> = { PENDING:'#f59e0b', APPROVED:'#22c55e', VALIDATED:'#3b82f6', REJECTED:'#ef4444' };
const MT: Record<string,string> = { SALIDA:'SALIDA', ENTRADA:'ENTRADA' };

export default function ValePage({ params }: { params: Promise<{ ticket: string }> }) {
  const [req, setReq] = useState<Req | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { params.then(p => { fetch('/api/requests?ticket=' + p.ticket).then(r => r.json()).then(data => { if (Array.isArray(data) && data.length > 0) setReq(data[0]); setLoading(false); }); }); }, [params]);

  if (loading) return <div style={{ padding: 40, fontFamily: 'Segoe UI, sans-serif' }}>Cargando...</div>;
  if (!req) return <div style={{ padding: 40, fontFamily: 'Segoe UI, sans-serif' }}>Solicitud no encontrada.</div>;

  const s = { body: { fontFamily: 'Segoe UI, sans-serif', maxWidth: 800, margin: '0 auto', padding: 20, color: '#1e293b' }, header: { background: '#0056a6', color: '#fff', padding: '24px 32px', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 22, fontWeight: 800, margin: 0 }, content: { padding: '24px 32px', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px' }, row: { display: 'flex', gap: 32, marginBottom: 8 }, field: { fontSize: 14 }, label: { fontWeight: 700, color: '#475569' }, th: { background: '#f8fafc', padding: '8px 12px', textAlign: 'left' as const, borderBottom: '2px solid #e2e8f0', fontWeight: 700, color: '#475569', fontSize: 13 }, td: { padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13 }, sigRow: { display: 'flex', justifyContent: 'space-between', marginTop: 48, paddingTop: 24, borderTop: '2px solid #e2e8f0' }, sigBlock: { textAlign: 'center' as const, flex: 1 }, sigLine: { borderTop: '1px solid #1e293b', marginTop: 48, paddingTop: 8, fontSize: 12, color: '#64748b' }, badge: { display: 'inline-block', padding: '4px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#fff' }, printBtn: { padding: '10px 24px', background: '#0056a6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 20 }, footer: { marginTop: 16, fontSize: 11, color: '#94a3b8', textAlign: 'center' as const } };

  const fmtDate = (d: string) => new Date(d).toLocaleString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});

  return (
    <div style={{ padding: 20, background: '#f3f4f6', minHeight: '100vh' }}>
      <button style={s.printBtn} onClick={() => window.print()}>Imprimir Vale</button>
      <div style={s.body}>
        <div style={s.header}>
          <div><div style={s.title}>KOSTAL Mexico</div><div style={{ fontSize: 13, opacity: 0.85 }}>Sistema de Moldes</div></div>
          <div style={{ display:'flex',gap:8 }}>
            <span style={{ ...s.badge, background: req.movementType==='SALIDA'?'#f97316':'#8b5cf6' }}>{MT[req.movementType]||'Movimiento'}</span>
            <span style={{ ...s.badge, background: SC[req.status] || '#6b7280' }}>{SL[req.status] || req.status}</span>
          </div>
        </div>
        <div style={s.content}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' as const, gap: 16 }}>
            <div><div style={{ fontSize: 22, fontWeight: 800, color: '#0056a6' }}>{req.ticketNumber}</div><div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{fmtDate(req.createdAt)}</div></div>
            <div style={{ textAlign: 'right' as const }}><div style={s.field}><span style={s.label}>Categoria: </span>{req.category || '-'}</div></div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0056a6', marginBottom: 12 }}>Molde: {req.moldNumber || '-'}</div>
            <div style={s.row}><div style={s.field}><span style={s.label}>Empleado: </span>{req.employee.name}</div><div style={s.field}><span style={s.label}>Nomina: </span>{req.employee.nomina}</div><div style={s.field}><span style={s.label}>Departamento: </span>{req.employee.department}</div></div>
            <div style={s.row}><div style={s.field}><span style={s.label}>Turno: </span>{req.shift || '-'}</div><div style={s.field}><span style={s.label}>Linea: </span>{req.productionLine || '-'}</div><div style={s.field}><span style={s.label}>Maquila: </span>{req.isMaquila ? 'Si' : 'No'}</div></div>
            <div style={s.row}><div style={s.field}><span style={s.label}>{req.movementType==='SALIDA'?'Proveedor/Destino':'Proviene de'}: </span>{req.provider || '-'}</div><div style={s.field}><span style={s.label}>Placas: </span>{req.plates || '-'}</div></div>
            {req.expectedReturnDate && <div style={s.row}><div style={s.field}><span style={s.label}>Fecha Esperada Retorno: </span><span style={{ color: '#f97316', fontWeight: 700 }}>{req.expectedReturnDate}</span></div></div>}
          </div>
          <div style={{ marginBottom: 8, fontWeight: 700, fontSize: 14, color: '#475569' }}>Motivo</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>{req.reason}</div>
          <div style={{ marginTop: 16, background: '#f8fafc', borderRadius: 8, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#475569', marginBottom: 8 }}>Trazabilidad</div>
            <div style={{ fontSize: 13 }}>
              <div style={{ marginBottom: 6 }}>{MT[req.movementType]||'Movimiento'}: {fmtDate(req.createdAt)} por {req.employee.name}</div>
              {req.approvedAt && <div style={{ marginBottom: 6 }}>Aprobada: {fmtDate(req.approvedAt)} por {req.approver?.name || req.approverEmail}</div>}
              {req.rejectedAt && <div style={{ marginBottom: 6, color: '#dc2626' }}>Rechazada: {fmtDate(req.rejectedAt)} {req.comment ? '- ' + req.comment : ''}</div>}
              {req.validatedAt && <div style={{ marginBottom: 6 }}>Validada por Seguridad: {fmtDate(req.validatedAt)} por {req.validator?.name || 'N/A'}</div>}
            </div>
          </div>
          <div style={s.sigRow}>
            <div style={s.sigBlock}><div style={s.sigLine}>Firma Empleado</div></div>
            <div style={s.sigBlock}><div style={s.sigLine}>Firma Aprobador</div></div>
            <div style={s.sigBlock}><div style={s.sigLine}>Firma Seguridad</div></div>
          </div>
        </div>
      </div>
      <div style={s.footer}>Documento generado por el Sistema de Moldes KOSTAL Mexico</div>
    </div>
  );
}