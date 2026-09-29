
const fs = require("fs");
const path = require("path");
const base = "C:\\Users\\Moral033\\mold-release";

const tsx = `'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Toaster, toast } from 'sonner'
import {
  LogIn, FilePlus, ClipboardList, CheckCircle, XCircle,
  LogOut, Factory, User, Clock, AlertTriangle,
  Menu, X, Shield, Send, Inbox, History,
  LayoutDashboard, Search, Download, TrendingUp,
  AlertOctagon, ChevronDown, ChevronRight, Filter,
  Bell, Settings, UserCircle, BarChart3
} from 'lucide-react'

interface Employee { id: number; nomina: string; name: string; department: string; isApprover: boolean }
interface MoldRequest {
  id: number; ticketNumber: string; moldNumber: string; reason: string; status: string;
  priority: string; shift: string | null; productionLine: string | null;
  createdAt: string; approvedAt: string | null; rejectedAt: string | null;
  employeeId: number; approvedById: number | null; comment: string | null;
  employee?: Employee; approver?: Employee | null
}
interface Stats {
  total: number; pending: number; approvedToday: number; approvedWeek: number;
  rejectedWeek: number; totalMonth: number; urgentPending: number; criticalPending: number
}
type Screen = 'login' | 'dashboard' | 'new-request' | 'my-requests' | 'pending-approvals' | 'history'

const C = {
  sidebarBg: '#0c1f33', sidebarItem: 'rgba(255,255,255,0.06)', sidebarHover: 'rgba(255,255,255,0.1)',
  sidebarActive: 'rgba(59,130,246,0.15)', sidebarText: '#94a3b8', sidebarTextBright: '#f1f5f9',
  sidebarBorder: 'rgba(255,255,255,0.08)', accent: '#153859', accentHover: '#1e5a8a',
  approved: '#22c55e', approvedBg: '#f0fdf4', rejected: '#ef4444', rejectedBg: '#fef2f2',
  pending: '#f59e0b', pendingBg: '#fffbeb', urgent: '#f97316', urgentBg: '#fff7ed',
  critical: '#ef4444', criticalBg: '#fef2f2', normal: '#3b82f6', normalBg: '#eff6ff',
  bg: '#f8fafc', white: '#ffffff', text: '#0f172a', textMuted: '#64748b', border: '#e2e8f0',
  surface: '#f1f5f9', kostalRed: '#e30613', cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardShadowHover: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
}

const PRI = {
  NORMAL: { label: 'Normal', bg: C.normalBg, color: C.normal, order: 0 },
  URGENTE: { label: 'Urgente', bg: C.urgentBg, color: C.urgent, order: 1 },
  CRITICO: { label: 'Critico', bg: C.criticalBg, color: C.critical, order: 2 },
}

const fmt = (d: string) => new Date(d).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const StatusBadge = ({ status }: { status: string }) => {
  const m: any = { PENDING: { bg: C.pendingBg, color: C.pending, l: 'Pendiente', i: <Clock size={11}/> }, APPROVED: { bg: C.approvedBg, color: C.approved, l: 'Aprobada', i: <CheckCircle size={11}/> }, REJECTED: { bg: C.rejectedBg, color: C.rejected, l: 'Rechazada', i: <XCircle size={11}/> } }
  const s = m[status] || m.PENDING
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{s.i}{s.l}</span>
}

const PriBadge = ({ p }: { p: string }) => { const x = PRI[p as keyof typeof PRI] || PRI.NORMAL
  return <span style={{ background: x.bg, color: x.color, padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{x.label}</span>
}

const StatCard = ({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) => (
  <div style={{ background: C.white, borderRadius: '12px', padding: '20px 24px', border: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: C.cardShadow, transition: 'all 0.2s', cursor: 'default' }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadowHover; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadow; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    <div><div style={{ fontSize: '28px', fontWeight: 800, color, lineHeight: 1, fontFamily: "'Inter', system-ui, sans-serif" }}>{value}</div><div style={{ fontSize: '12px', color: C.textMuted, marginTop: '4px', fontWeight: 500 }}>{label}</div></div>
  </div>
)

export default function Home() {
  const [screen, setScreen] = useState<Screen>('login')
  const [user, setUser] = useState<Employee | null>(null)
  const [requests, setRequests] = useState<MoldRequest[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [molds, setMolds] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [nomina, setNomina] = useState('')
  const [moldNumber, setMoldNumber] = useState('')
  const [reason, setReason] = useState('')
  const [priority, setPriority] = useState('NORMAL')
  const [shift, setShift] = useState('')
  const [productionLine, setProductionLine] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectComment, setRejectComment] = useState('')
  const [search, setSearch] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fPri, setFPri] = useState('')
  const [showMoldSugg, setShowMoldSugg] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false)
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  const loadReqs = useCallback(async () => {
    try { const p = new URLSearchParams(); if (search) p.set('search', search); if (fStatus) p.set('status', fStatus); if (fPri) p.set('priority', fPri)
      const r = await fetch('/api/requests?' + p); setRequests(Array.isArray(await r.json()) ? await r.clone().json() : []) } catch {}
  }, [search, fStatus, fPri])

  const loadStats = useCallback(async () => { try { setStats(await (await fetch('/api/requests/stats')).json()) } catch {} }, [])
  const loadMolds = useCallback(async () => { try { setMolds(await (await fetch('/api/molds')).json()) } catch {} }, [])

  useEffect(() => { if (user) { loadReqs(); loadStats(); loadMolds() } }, [user, loadReqs, loadStats, loadMolds])
  const pCount = stats?.pending ?? 0
  const fMolds = molds.filter(m => m.toLowerCase().includes(moldNumber.toLowerCase()) && moldNumber.length > 0)

  const handleLogin = async () => {
    if (!nomina.trim()) { toast.error('Ingresa tu nomina'); return }; setLoading(true)
    try { const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nomina: nomina.trim() }) })
      if (!r.ok) { toast.error('Nomina no encontrada'); return }; const e = await r.json(); setUser(e); setScreen('dashboard'); toast.success('Bienvenido, ' + e.name) } catch { toast.error('Error') } finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    if (!moldNumber.trim()) { toast.error('Numero de molde requerido'); return }
    if (!reason.trim()) { toast.error('Motivo requerido'); return }; setSubmitting(true)
    try { const r = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moldNumber: moldNumber.trim(), reason: reason.trim(), employeeId: user!.id, priority, shift: shift || null, productionLine: productionLine || null }) })
      if (r.ok) { const d = await r.json(); toast.success('Solicitud ' + d.ticketNumber + ' creada'); setMoldNumber(''); setReason(''); setPriority('NORMAL'); setShift(''); setProductionLine(''); loadReqs(); loadStats(); setScreen('my-requests') } else toast.error('Error al crear') } catch { toast.error('Error') } finally { setSubmitting(false) }
  }

  const handleApprove = async (id: number) => {
    try { await fetch('/api/requests/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: id, approvedById: user!.id }) }); toast.success('Aprobada'); loadReqs(); loadStats() } catch {}
  }

  const handleReject = async () => {
    if (!rejectComment.trim()) { toast.error('Agrega comentario'); return }
    try { await fetch('/api/requests/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: rejectingId, approvedById: user!.id, comment: rejectComment.trim() }) }); toast.success('Rechazada'); setRejectingId(null); setRejectComment(''); loadReqs(); loadStats() } catch {}
  }

  const handleLogout = () => { setUser(null); setScreen('login'); setNomina(''); setRequests([]); setStats(null); setSearch(''); setFStatus(''); setFPri('') }

  const exportCSV = () => {
    const h = ['Folio','Molde','Empleado','Depto','Estatus','Prioridad','Turno','Linea','Motivo','Creada','Resuelta','Aprobador','Comentario']
    const rows = [h, ...requests.map(r => [r.ticketNumber, r.moldNumber, r.employee?.name||'', r.employee?.department||'', r.status, r.priority, r.shift||'', r.productionLine||'', r.reason, fmt(r.createdAt), r.approvedAt?fmt(r.approvedAt):r.rejectedAt?fmt(r.rejectedAt):'', r.approver?.name||'', r.comment||''])]
    const csv = rows.map(r => r.map(c => '"' + (c+'').replace(/"/g,'""') + '"').join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'})); a.download = 'solicitudes_k3_'+new Date().toISOString().slice(0,10)+'.csv'; a.click()
  }

  const NavItem = ({ icon, label, active, onClick, badge, sub }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number; sub?: { icon: React.ReactNode; label: string; screen: Screen }[] }) => {
    const [open, setOpen] = useState(active && !!sub)
    return <div>
      <button onClick={() => { if (sub) setOpen(!open); else onClick() }} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 14px', background: active && !sub ? C.sidebarActive : 'transparent', border: 'none', borderRadius: '8px', color: active && !sub ? C.sidebarTextBright : C.sidebarText, cursor: 'pointer', fontSize: '13px', fontWeight: active && !sub ? 600 : 400, transition: 'all 0.15s' }}
        onMouseEnter={(e) => { if (!(active && !sub)) (e.currentTarget as HTMLButtonElement).style.background = C.sidebarHover }}
        onMouseLeave={(e) => { if (!(active && !sub)) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
        {icon}<span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
        {badge !== undefined && badge > 0 && <span style={{ background: badge > 5 ? C.kostalRed : C.pending, color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '10px', padding: '1px 7px' }}>{badge}</span>}
        {sub && <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
      </button>
      {sub && open && <div style={{ paddingLeft: '20px', paddingTop: '2px', paddingBottom: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {sub.map(s => (
          <button key={s.label} onClick={() => { onClick(); setOpen(true) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: screen === s.screen ? C.sidebarActive : 'transparent', border: 'none', borderRadius: '6px', color: screen === s.screen ? '#93c5fd' : C.sidebarText, cursor: 'pointer', fontSize: '12px', fontWeight: screen === s.screen ? 600 : 400, transition: 'all 0.15s' }}
            onMouseEnter={(e) => { if (screen !== s.screen) (e.currentTarget as HTMLButtonElement).style.background = C.sidebarHover }}
            onMouseLeave={(e) => { if (screen !== s.screen) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
            <ChevronRight size={10} />{s.label}
          </button>
        ))}
      </div>}
    </div>
  }

  /* ===== LOGIN ===== */
  if (screen === 'login') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a1628 0%, #153859 40%, #1e5a8a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(30,90,138,0.15)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(21,56,89,0.2)', filter: 'blur(60px)' }} />
        <div style={{ width: '100%', maxWidth: '420px', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: '20px', padding: '44px 40px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '16px', margin: '0 auto 18px', background: 'linear-gradient(135deg, #153859, #1e5a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px rgba(21,56,89,0.35)' }}>
                <Factory size={34} color="#fff" strokeWidth={1.8} /></div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: C.accent, margin: '0 0 6px', letterSpacing: '2px', fontFamily: "'Inter', system-ui, sans-serif" }}>KOSTAL</h1>
              <p style={{ fontSize: '14px', color: C.textMuted, margin: 0, fontWeight: 500 }}>Mold Release System</p>
              <div style={{ width: '40px', height: '3px', background: 'linear-gradient(90deg, #153859, #3b82f6)', borderRadius: '2px', margin: '12px auto 0' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Numero de Nomina</label>
              <input type="text" value={nomina} onChange={(e) => setNomina(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Ej: 40003"
                style={{ width: '100%', padding: '14px 18px', border: '2px solid ' + C.border, borderRadius: '12px', fontSize: '18px', color: C.text, background: '#fafbfc', outline: 'none', textAlign: 'center', letterSpacing: '3px', fontWeight: 600, transition: 'all 0.2s', fontFamily: "'Inter', system-ui, sans-serif" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }} />
            </div>
            <button onClick={handleLogin} disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700, color: '#fff', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #153859, #1e5a8a)', boxShadow: loading ? 'none' : '0 6px 20px rgba(21,56,89,0.35)' }}>
              <LogIn size={18} strokeWidth={2} />{loading ? 'Ingresando...' : 'Ingresar'}</button>
            <div style={{ textAlign: 'center', marginTop: '24px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed ' + C.border }}>
              <p style={{ fontSize: '11px', color: C.textMuted, margin: 0, lineHeight: '1.6' }}>
                <strong>Empleado:</strong> nomina 40003, 6041902, etc.<br/><strong>Aprobador Demo:</strong> 99999</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ===== MAIN APP ===== */
  const myR = requests.filter(r => r.employeeId === user?.id)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? '268px' : '76px', background: 'linear-gradient(180deg, #0c1f33 0%, #0f2a44 100%)', transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)', display: 'flex', flexDirection: 'column', borderRight: '1px solid ' + C.sidebarBorder, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
        {/* Logo */}
        <div style={{ padding: '22px 18px 18px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid ' + C.sidebarBorder }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #153859, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
            <Factory size={20} color="#fff" strokeWidth={2} /></div>
          {sidebarOpen && <div><div style={{ color: '#fff', fontSize: '15px', fontWeight: 800, letterSpacing: '1px' }}>KOSTAL</div>
            <div style={{ color: C.sidebarText, fontSize: '10px', fontWeight: 500, opacity: 0.6, marginTop: '1px' }}>Mold Release v2.0</div></div>}
        </div>
        {/* Nav */}
        <div style={{ padding: '16px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {sidebarOpen && <div style={{ padding: '0 14px 8px', fontSize: '10px', fontWeight: 700, color: C.sidebarText, textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.4 }}>{user?.isApprover ? 'Administracion' : 'Operaciones'}</div>}
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={screen === 'dashboard'} onClick={() => setScreen('dashboard')} />
          {!user?.isApprover ? (
            <NavItem icon={<FilePlus size={18} />} label="Solicitudes" active={['new-request','my-requests'].includes(screen)} onClick={() => setScreen('new-request')} badge={myR.filter(r=>r.status==='PENDING').length}
              sub={[{ icon: <Send size={12}/>, label: 'Nueva Solicitud', screen: 'new-request' }, { icon: <ClipboardList size={12}/>, label: 'Mis Solicitudes', screen: 'my-requests' }]} />
          ) : (
            <NavItem icon={<Inbox size={18} />} label="Aprobaciones" active={['pending-approvals','history'].includes(screen)} onClick={() => setScreen('pending-approvals')} badge={pCount}
              sub={[{ icon: <Clock size={12}/>, label: 'Pendientes', screen: 'pending-approvals' }, { icon: <History size={12}/>, label: 'Historial', screen: 'history' }]} />
          )}
        </div>
        {/* User */}
        {sidebarOpen && <div style={{ padding: '14px', borderTop: '1px solid ' + C.sidebarBorder }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', background: C.sidebarItem }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0, background: user?.isApprover ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'linear-gradient(135deg, #153859, #1e5a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.isApprover ? <Shield size={14} color="#fff"/> : <User size={14} color="#fff"/>}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ color: C.sidebarText, fontSize: '10px' }}>{user?.isApprover ? 'Aprobador' : user?.department} &middot; #{user?.nomina}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', marginTop: '6px', background: 'transparent', border: 'none', borderRadius: '6px', color: C.sidebarText, cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(239,68,68,0.1)'; b.style.color = '#fca5a5' }}
            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'transparent'; b.style.color = C.sidebarText }}>
            <LogOut size={14} />Cerrar Sesion</button>
        </div>}
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: 'auto', background: C.bg }}>
        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid ' + C.border, padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '6px', borderRadius: '8px', display: 'flex', transition: 'background 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.surface }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}>
            {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}</button>
          <div style={{ width: '1px', height: '28px', background: C.border }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.text }}>
              {screen==='dashboard'&&'Dashboard'}{screen==='new-request'&&'Nueva Solicitud'}{screen==='my-requests'&&'Mis Solicitudes'}{screen==='pending-approvals'&&'Pendientes de Aprobacion'}{screen==='history'&&'Historial'}</h2>
          </div>
          {user?.isApprover && pCount > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: C.kostalRed, color: '#fff', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
            <Bell size={13}/>{pCount} pendiente{pCount>1?'s':''}</div>}
          {/* User dropdown */}
          <div ref={userRef} style={{ position: 'relative' }}>
            <button onClick={() => setUserMenu(!userMenu)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: C.surface, border: '1px solid ' + C.border, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: user?.isApprover ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : 'linear-gradient(135deg,#153859,#1e5a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user?.isApprover ? <Shield size={13} color="#fff"/> : <User size={13} color="#fff"/>}</div>
              {sidebarOpen && <span style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{user?.name?.split(' ').slice(0,2).join(' ')}</span>}
              <ChevronDown size={14} color={C.textMuted} style={{ transition: 'transform 0.2s', transform: userMenu ? 'rotate(180deg)' : '' }}/>
            </button>
            {userMenu && <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid ' + C.border, borderRadius: '12px', boxShadow: '0 12px 36px rgba(0,0,0,0.12)', minWidth: '200px', padding: '6px', zIndex: 100 }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid ' + C.border }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: C.textMuted }}>{user?.isApprover?'Aprobador':user?.department} &middot; #{user?.nomina}</div>
              </div>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderRadius: '8px', color: C.rejected, cursor: 'pointer', fontSize: '13px', fontWeight: 500, marginTop: '4px' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}>
                <LogOut size={15}/>Cerrar Sesion</button>
            </div>}
          </div>
        </header>

        <div style={{ padding: '28px 32px' }}>
          {/* DASHBOARD */}
          {screen === 'dashboard' && stats && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {!user?.isApprover ? (
                  <><StatCard icon={<Clock size={22} color={C.pending}/>} label="Mis Pendientes" value={myR.filter(r=>r.status==='PENDING').length} color={C.pending} bg={C.pendingBg}/>
                  <StatCard icon={<CheckCircle size={22} color={C.approved}/>} label="Aprobadas (semana)" value={stats.approvedWeek} color={C.approved} bg={C.approvedBg}/>
                  <StatCard icon={<XCircle size={22} color={C.rejected}/>} label="Rechazadas (semana)" value={stats.rejectedWeek} color={C.rejected} bg={C.rejectedBg}/>
                  <StatCard icon={<TrendingUp size={22} color="#3b82f6"/>} label="Total (mes)" value={stats.totalMonth} color="#3b82f6" bg="#eff6ff"/></>
                ) : (
                  <><StatCard icon={<Clock size={22} color={C.pending}/>} label="Pendientes" value={stats.pending} color={C.pending} bg={C.pendingBg}/>
                  <StatCard icon={<AlertTriangle size={22} color={C.urgent}/>} label="Urgentes" value={stats.urgentPending} color={C.urgent} bg={C.urgentBg}/>
                  <StatCard icon={<AlertOctagon size={22} color={C.critical}/>} label="Criticos" value={stats.criticalPending} color={C.critical} bg={C.criticalBg}/>
                  <StatCard icon={<CheckCircle size={22} color={C.approved}/>} label="Aprobadas Hoy" value={stats.approvedToday} color={C.approved} bg={C.approvedBg}/>
                  <StatCard icon={<TrendingUp size={22} color="#3b82f6"/>} label="Total (mes)" value={stats.totalMonth} color="#3b82f6" bg="#eff6ff"/></>
                )}
              </div>
              <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid ' + C.border, boxShadow: C.cardShadow }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={18} color={C.accent}/>Actividad Reciente</h3>
                {requests.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: C.textMuted }}><Inbox size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }}/><p style={{ margin: 0, fontSize: '14px' }}>Sin actividad reciente</p></div> :
                requests.slice(0, 10).map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: r.status==='PENDING'?C.pending:r.status==='APPROVED'?C.approved:C.rejected }}/>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', background: C.accent, padding: '2px 8px', borderRadius: '4px' }}>{r.ticketNumber}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: C.text, flex: 1 }}>{r.moldNumber}</span>
                    <PriBadge p={r.priority}/><StatusBadge status={r.status}/>
                    <span style={{ fontSize: '11px', color: C.textMuted, flexShrink: 0 }}>{fmt(r.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW REQUEST */}
          {screen === 'new-request' && (
            <div style={{ maxWidth: '680px' }}>
              <div style={{ background: '#fff', borderRadius: '14px', padding: '32px', border: '1px solid ' + C.border, boxShadow: C.cardShadow }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #153859, #1e5a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(21,56,89,0.2)' }}><Send size={20} color="#fff"/></div>
                  <div><h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: C.text }}>Nueva Solicitud de Liberacion</h3>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: C.textMuted }}>Completa los campos para solicitar la liberacion del molde</p></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Numero de Molde</label>
                    <div style={{ position: 'relative' }}>
                      <input type="text" value={moldNumber} onChange={(e) => { setMoldNumber(e.target.value); setShowMoldSugg(true) }}
                        onBlur={() => setTimeout(() => setShowMoldSugg(false), 200)} placeholder="Ej: K3-MOLD-001"
                        style={{ width: '100%', padding: '11px 14px', border: '1.5px solid ' + C.border, borderRadius: '10px', fontSize: '14px', color: C.text, background: '#fafbfc', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }} />
                      {showMoldSugg && fMolds.length > 0 && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid ' + C.border, borderRadius: '0 0 10px 10px', borderTop: 'none', zIndex: 100, maxHeight: '140px', overflow: 'auto', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                        {fMolds.slice(0, 6).map(m => <div key={m} onMouseDown={() => { setMoldNumber(m); setShowMoldSugg(false) }} style={{ padding: '9px 14px', fontSize: '13px', color: C.text, cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f8fafc' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#fff' }}>{m}</div>)}</div>}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prioridad</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', border: '1.5px solid ' + C.border, borderRadius: '10px', fontSize: '14px', color: C.text, background: '#fafbfc', outline: 'none', cursor: 'pointer', transition: 'all 0.2s', appearance: 'auto', boxSizing: 'border-box' }}>
                      <option value="NORMAL">Normal</option><option value="URGENTE">Urgente</option><option value="CRITICO">Critico</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Turno</label>
                    <select value={shift} onChange={(e) => setShift(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', border: '1.5px solid ' + C.border, borderRadius: '10px', fontSize: '14px', color: C.text, background: '#fafbfc', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
                      <option value="">Seleccionar</option><option value="1">Turno 1</option><option value="2">Turno 2</option><option value="3">Turno 3</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Linea de Produccion</label>
                    <input type="text" value={productionLine} onChange={(e) => setProductionLine(e.target.value)} placeholder="Ej: Linea 5"
                      style={{ width: '100%', padding: '11px 14px', border: '1.5px solid ' + C.border, borderRadius: '10px', fontSize: '14px', color: C.text, background: '#fafbfc', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6' }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border }} />
                  </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Motivo de la Solicitud</label>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe por que necesitas la liberacion del molde..." rows={4}
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid ' + C.border, borderRadius: '10px', fontSize: '14px', color: C.text, background: '#fafbfc', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setMoldNumber(''); setReason(''); setPriority('NORMAL'); setShift(''); setProductionLine('') }}
                    style={{ padding: '11px 22px', fontSize: '14px', fontWeight: 500, color: C.textMuted, background: 'transparent', border: '1.5px solid ' + C.border, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' }}>Limpiar</button>
                  <button onClick={handleSubmit} disabled={submitting}
                    style={{ padding: '11px 28px', fontSize: '14px', fontWeight: 700, color: '#fff', border: 'none', borderRadius: '10px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                      background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #153859, #1e5a8a)', boxShadow: submitting ? 'none' : '0 4px 14px rgba(21,56,89,0.3)' }}>
                    <Send size={15}/>{submitting ? 'Enviando...' : 'Enviar Solicitud'}</button>
                </div>
              </div>
            </div>
          )}

          {/* LISTS (shared) */}
          {(screen === 'my-requests' || screen === 'pending-approvals' || screen === 'history') && (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                  <Search size={16} color={C.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}/>
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por folio, molde, nombre..."
                    style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1.5px solid ' + C.border, borderRadius: '10px', fontSize: '13px', color: C.text, background: '#fff', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6' }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border }} />
                </div>
                <div ref={filterRef} style={{ position: 'relative' }}>
                  <button onClick={() => setFilterOpen(!filterOpen)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#fff', border: '1.5px solid ' + C.border, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: (fStatus||fPri) ? C.accent : C.textMuted, transition: 'all 0.15s' }}>
                    <Filter size={14}/>{(fStatus||fPri) ? 'Filtrando' : 'Filtros'}<ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: filterOpen ? 'rotate(180deg)' : '' }}/></button>
                  {filterOpen && <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid ' + C.border, borderRadius: '12px', padding: '16px', boxShadow: '0 12px 36px rgba(0,0,0,0.12)', minWidth: '200px', zIndex: 100 }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: C.text, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estatus</label>
                      <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid ' + C.border, borderRadius: '8px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                        <option value="">Todos</option><option value="PENDING">Pendiente</option><option value="APPROVED">Aprobada</option><option value="REJECTED">Rechazada</option></select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: C.text, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prioridad</label>
                      <select value={fPri} onChange={(e) => setFPri(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid ' + C.border, borderRadius: '8px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                        <option value="">Todas</option><option value="NORMAL">Normal</option><option value="URGENTE">Urgente</option><option value="CRITICO">Critico</option></select>
                    </div>
                    {(fStatus||fPri) && <button onClick={() => { setFStatus(''); setFPri('') }} style={{ marginTop: '10px', width: '100%', padding: '6px', background: 'none', border: '1px dashed ' + C.border, borderRadius: '6px', color: C.textMuted, cursor: 'pointer', fontSize: '11px' }}>Limpiar filtros</button>}
                  </div>}
                </div>
                {screen === 'history' && <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(135deg,#153859,#1e5a8a)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(21,56,89,0.2)' }}>
                  <Download size={14}/>Exportar CSV</button>}
              </div>
              {requests.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '14px', padding: '60px 40px', textAlign: 'center', border: '1px solid ' + C.border, boxShadow: C.cardShadow }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><ClipboardList size={28} color={C.border}/></div>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: C.text, margin: '0 0 4px' }}>Sin resultados</p><p style={{ fontSize: '13px', color: C.textMuted, margin: 0 }}>No se encontraron solicitudes</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {requests.sort((a,b) => { const pa = PRI[a.priority as keyof typeof PRI]?.order??0, pb = PRI[b.priority as keyof typeof PRI]?.order??0; if (screen==='pending-approvals'&&pa!==pb) return pb-pa; return new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime() }).map(req => (
                    <div key={req.id} style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', border: '1px solid ' + C.border, boxShadow: C.cardShadow, transition: 'all 0.2s', borderLeft: '4px solid ' + (screen==='pending-approvals' ? (req.priority==='CRITICO'?C.critical:req.priority==='URGENTE'?C.urgent:C.pending) : (req.status==='PENDING'?C.pending:req.status==='APPROVED'?C.approved:C.rejected)) }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadowHover }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadow }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', background: C.accent, padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.3px' }}>{req.ticketNumber}</span>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>{req.moldNumber}</span>
                          <PriBadge p={req.priority}/><StatusBadge status={req.status}/>
                          {req.shift && <span style={{ fontSize: '11px', color: C.textMuted, background: C.surface, padding: '3px 10px', borderRadius: '6px', fontWeight: 500 }}>Turno {req.shift}</span>}
                          {req.productionLine && <span style={{ fontSize: '11px', color: C.textMuted, background: C.surface, padding: '3px 10px', borderRadius: '6px', fontWeight: 500 }}>{req.productionLine}</span>}
                        </div>
                        <span style={{ fontSize: '11px', color: C.textMuted }}>{fmt(req.createdAt)}</span>
                      </div>
                      <p style={{ margin: '0 0 10px', fontSize: '13px', color: C.text, lineHeight: '1.5' }}>{req.reason}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: req.status!=='PENDING'?'4px':'14px' }}>
                        <User size={12} color={C.textMuted}/><span style={{ fontSize: '12px', color: C.textMuted }}>{req.employee?.name} &middot; {req.employee?.department} &middot; #{req.employee?.nomina}</span>
                      </div>
                      {req.approvedAt && <div style={{ fontSize: '11px', color: C.approved, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={11}/>Aprobada: {fmt(req.approvedAt)} por {req.approver?.name}</div>}
                      {req.rejectedAt && <div style={{ fontSize: '11px', color: C.rejected, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={11}/>Rechazada: {fmt(req.rejectedAt)} por {req.approver?.name}{req.comment && ' - "'+req.comment+'"'}</div>}
                      {screen==='pending-approvals' && req.status==='PENDING' && <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <button onClick={() => { setRejectingId(req.id); setRejectComment('') }} style={{ padding: '9px 18px', background: C.rejected, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}><XCircle size={14}/>Rechazar</button>
                        <button onClick={() => handleApprove(req.id)} style={{ padding: '9px 18px', background: C.approved, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}><CheckCircle size={14}/>Aprobar</button>
                      </div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* REJECT MODAL */}
      {rejectingId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', margin: '0 20px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.rejectedBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={22} color={C.rejected}/></div>
              <div><h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.text }}>Rechazar Solicitud</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.textMuted }}>Este comentario se mostrara al empleado</p></div>
            </div>
            <textarea value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} placeholder="Explica la razon del rechazo..." rows={3}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid ' + C.border, borderRadius: '10px', fontSize: '14px', color: C.text, background: '#fafbfc', resize: 'vertical', outline: 'none', fontFamily: 'inherit', marginBottom: '20px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectingId(null)} style={{ padding: '10px 22px', background: 'transparent', border: '1.5px solid ' + C.border, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: C.textMuted, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleReject} disabled={!rejectComment.trim()} style={{ padding: '10px 22px', background: C.rejected, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: rejectComment.trim()?'pointer':'not-allowed', opacity: rejectComment.trim()?1:0.5 }}>Confirmar Rechazo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`;

fs.writeFileSync(path.join(base, "src", "app", "page.tsx"), tsx, "utf8");
console.log("page.tsx v2 profesional creado");
