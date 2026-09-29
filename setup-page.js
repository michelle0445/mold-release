const fs = require("fs");
const path = require("path");
const out = path.join("C:\\Users\\Moral033\\mold-release", "src", "app", "page.tsx");

const tsx = `\'use client\'

import { useState, useEffect, useCallback } from \'react\'
import { Toaster, toast } from \'sonner\'
import {
  LogIn, FilePlus, ClipboardList, CheckCircle, XCircle,
  LogOut, Factory, User, Clock, AlertTriangle,
  Menu, X, Shield, Send, Inbox, History,
  LayoutDashboard, Search, Filter, Download,
  TrendingUp, AlertOctagon, Zap, ChevronDown
} from \'lucide-react\'

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
type Screen = \'login\' | \'dashboard\' | \'new-request\' | \'my-requests\' | \'pending-approvals\' | \'history\'

const C = {
  sidebarBg: \'#0f2a44\', sidebarHover: \'#1a3d5c\', sidebarActive: \'#153859\',
  sidebarText: \'#c8d8e8\', sidebarTextBright: \'#ffffff\', sidebarBorder: \'#1e4a6e\',
  accent: \'#153859\', accentLight: \'#1e5a8a\',
  approved: \'#16a34a\', approvedBg: \'#f0fdf4\',
  rejected: \'#dc2626\', rejectedBg: \'#fef2f2\',
  pending: \'#d97706\', pendingBg: \'#fffbeb\',
  urgent: \'#ea580c\', urgentBg: \'#fff7ed\',
  critical: \'#dc2626\', criticalBg: \'#fef2f2\',
  normal: \'#2563eb\', normalBg: \'#eff6ff\',
  bg: \'#f1f5f9\', white: \'#ffffff\',
  text: \'#1e293b\', textSecondary: \'#64748b\', border: \'#e2e8f0\',
  inputBg: \'#f8fafc\', kostalRed: \'#e30613\',
}

const PRI = {
  NORMAL: { label: \'Normal\', bg: C.normalBg, color: C.normal, icon: null, order: 0 },
  URGENTE: { label: \'Urgente\', bg: C.urgentBg, color: C.urgent, icon: <AlertTriangle size={12} />, order: 1 },
  CRITICO: { label: \'Critico\', bg: C.criticalBg, color: C.critical, icon: <AlertOctagon size={12} />, order: 2 },
}

const fmtDate = (d: string) => new Date(d).toLocaleString(\'es-MX\', { day: \'2-digit\', month: \'short\', year: \'numeric\', hour: \'2-digit\', minute: \'2-digit\' })

const StatusBadge = ({ status }: { status: string }) => {
  const cfg: any = {
    PENDING: { bg: C.pendingBg, color: C.pending, label: \'Pendiente\', icon: <Clock size={12} /> },
    APPROVED: { bg: C.approvedBg, color: C.approved, label: \'Aprobada\', icon: <CheckCircle size={12} /> },
    REJECTED: { bg: C.rejectedBg, color: C.rejected, label: \'Rechazada\', icon: <XCircle size={12} /> },
  }
  const s = cfg[status] || cfg.PENDING
  return (
    <span style={{ background: s.bg, color: s.color, padding: \'3px 10px\', borderRadius: \'20px\',
      fontSize: \'11px\', fontWeight: 600, display: \'inline-flex\', alignItems: \'center\', gap: \'4px\' }}>
      {s.icon}{s.label}
    </span>
  )
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const p = PRI[priority as keyof typeof PRI] || PRI.NORMAL
  return (
    <span style={{ background: p.bg, color: p.color, padding: \'3px 10px\', borderRadius: \'20px\',
      fontSize: \'11px\', fontWeight: 600, display: \'inline-flex\', alignItems: \'center\', gap: \'4px\' }}>
      {p.icon}{p.label}
    </span>
  )
}

const SidebarItem = ({ icon, label, active, onClick, badge }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number
}) => (
  <button onClick={onClick} style={{
    display: \'flex\', alignItems: \'center\', gap: \'12px\', width: \'100%\', padding: \'11px 16px\',
    background: active ? C.sidebarActive : \'transparent\', border: \'none\', borderRadius: \'8px\',
    color: active ? C.sidebarTextBright : C.sidebarText, cursor: \'pointer\', fontSize: \'14px\',
    transition: \'all 0.2s\', borderLeft: active ? \'3px solid #3b82f6\' : \'3px solid transparent\', marginLeft: \'-3px\'
  }}
    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = C.sidebarHover }}
    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = \'transparent\' }}>
    {icon}<span style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
    {badge !== undefined && badge > 0 && (
      <span style={{ marginLeft: \'auto\', background: badge > 5 ? C.kostalRed : C.pending, color: C.white,
        fontSize: \'11px\', fontWeight: 700, borderRadius: \'10px\', padding: \'2px 8px\', minWidth: \'22px\', textAlign: \'center\' }}>
        {badge}
      </span>
    )}
  </button>
)

const StatCard = ({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: number; color: string; bg: string
}) => (
  <div style={{ background: C.white, borderRadius: \'12px\', padding: \'20px\', border: \'1px solid \' + C.border,
    display: \'flex\', alignItems: \'center\', gap: \'16px\' }}>
    <div style={{ width: \'48px\', height: \'48px\', borderRadius: \'12px\', background: bg,
      display: \'flex\', alignItems: \'center\', justifyContent: \'center\', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: \'26px\', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: \'12px\', color: C.textSecondary, marginTop: \'2px\' }}>{label}</div>
    </div>
  </div>
)

export default function Home() {
  const [screen, setScreen] = useState<Screen>(\'login\')
  const [user, setUser] = useState<Employee | null>(null)
  const [requests, setRequests] = useState<MoldRequest[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [molds, setMolds] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [nomina, setNomina] = useState(\'\')
  const [moldNumber, setMoldNumber] = useState(\'\')
  const [reason, setReason] = useState(\'\')
  const [priority, setPriority] = useState(\'NORMAL\')
  const [shift, setShift] = useState(\'\')
  const [productionLine, setProductionLine] = useState(\'\')
  const [submitting, setSubmitting] = useState(false)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectComment, setRejectComment] = useState(\'\')
  const [search, setSearch] = useState(\'\')
  const [filterStatus, setFilterStatus] = useState(\'\')
  const [filterPriority, setFilterPriority] = useState(\'\')
  const [showMoldSugg, setShowMoldSugg] = useState(false)

  const loadRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set(\'search\', search)
      if (filterStatus) params.set(\'status\', filterStatus)
      if (filterPriority) params.set(\'priority\', filterPriority)
      const res = await fetch(\'/api/requests?\' + params.toString())
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch {}
  }, [search, filterStatus, filterPriority])

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(\'/api/requests/stats\')
      setStats(await res.json())
    } catch {}
  }, [])

  const loadMolds = useCallback(async () => {
    try {
      const res = await fetch(\'/api/molds\')
      setMolds(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    if (!user) return
    loadRequests()
    loadStats()
    loadMolds()
  }, [user, loadRequests, loadStats, loadMolds])

  useEffect(() => {
    if (user) { loadRequests(); loadStats() }
  }, [search, filterStatus, filterPriority, user])

  const pendingCount = stats?.pending ?? requests.filter(r => r.status === \'PENDING\').length
  const filteredMolds = molds.filter(m => m.toLowerCase().includes(moldNumber.toLowerCase()) && moldNumber.length > 0)

  const handleLogin = async () => {
    if (!nomina.trim()) { toast.error(\'Ingresa tu numero de nomina\'); return }
    setLoading(true)
    try {
      const res = await fetch(\'/api/login\', {
        method: \'POST\', headers: { \'Content-Type\': \'application/json\' },
        body: JSON.stringify({ nomina: nomina.trim() })
      })
      if (!res.ok) { toast.error(\'Nomina no encontrada\'); return }
      const employee = await res.json()
      setUser(employee)
      setScreen(\'dashboard\')
      toast.success(\'Bienvenido, \' + employee.name)
    } catch { toast.error(\'Error de conexion\') }
    finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    if (!moldNumber.trim()) { toast.error(\'Ingresa el numero de molde\'); return }
    if (!reason.trim()) { toast.error(\'Ingresa el motivo\'); return }
    setSubmitting(true)
    try {
      const res = await fetch(\'/api/requests\', {
        method: \'POST\', headers: { \'Content-Type\': \'application/json\' },
        body: JSON.stringify({ moldNumber: moldNumber.trim(), reason: reason.trim(), employeeId: user!.id, priority, shift: shift || null, productionLine: productionLine || null })
      })
      if (res.ok) {
        toast.success(\'Solicitud \' + (await res.json()).ticketNumber + \' creada\')
        setMoldNumber(\'\'); setReason(\'\'); setPriority(\'NORMAL\'); setShift(\'\'); setProductionLine(\'\')
        loadRequests(); loadStats(); setScreen(\'my-requests\')
      } else toast.error(\'Error al crear\')
    } catch { toast.error(\'Error de conexion\') }
    finally { setSubmitting(false) }
  }

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(\'/api/requests/approve\', {
        method: \'POST\', headers: { \'Content-Type\': \'application/json\' },
        body: JSON.stringify({ requestId: id, approvedById: user!.id })
      })
      if (res.ok) { toast.success(\'Solicitud aprobada\'); loadRequests(); loadStats() }
    } catch { toast.error(\'Error\') }
  }

  const handleReject = async () => {
    if (!rejectComment.trim()) { toast.error(\'Agrega un comentario\'); return }
    try {
      const res = await fetch(\'/api/requests/reject\', {
        method: \'POST\', headers: { \'Content-Type\': \'application/json\' },
        body: JSON.stringify({ requestId: rejectingId, approvedById: user!.id, comment: rejectComment.trim() })
      })
      if (res.ok) { toast.success(\'Solicitud rechazada\'); setRejectingId(null); setRejectComment(\'\'); loadRequests(); loadStats() }
    } catch {}
  }

  const handleLogout = () => {
    setUser(null); setScreen(\'login\'); setNomina(\'\'); setRequests([]); setStats(null)
    setMoldNumber(\'\'); setReason(\'\'); setPriority(\'NORMAL\'); setShift(\'\'); setProductionLine(\'\')
    setSearch(\'\'); setFilterStatus(\'\'); setFilterPriority(\'\')
  }

  const exportCSV = () => {
    const rows = [[\'Folio\',\'Molde\',\'Empleado\',\'Departamento\',\'Estatus\',\'Prioridad\',\'Turno\',\'Linea\',\'Motivo\',\'Creada\',\'Aprobada/Rechazada\',\'Aprobador\',\'Comentario\']]
    requests.forEach(r => {
      rows.push([r.ticketNumber, r.moldNumber, r.employee?.name || \'\', r.employee?.department || \'\',
        r.status, r.priority, r.shift || \'\', r.productionLine || \'\', r.reason,
        fmtDate(r.createdAt),
        r.approvedAt ? fmtDate(r.approvedAt) : r.rejectedAt ? fmtDate(r.rejectedAt) : \'\',
        r.approver?.name || \'\', r.comment || \'\'])
    })
    const csv = rows.map(r => r.map(c => \'\"\' + (c + \'\').replace(/\"/g, \'\"\') + \'\"\').join(\',\')).join(\'\\n\')
    const blob = new Blob([\'\\uFEFF\' + csv], { type: \'text/csv;charset=utf-8;\' })
    const a = document.createElement(\'a\')
    a.href = URL.createObjectURL(blob)
    a.download = \'solicitudes_k3_\' + new Date().toISOString().slice(0, 10) + \'.csv\'
    a.click()
  }

  /* ═══ LOGIN ═══ */
  if (screen === \'login\') {
    return (
      <div style={{ minHeight: \'100vh\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\',
        background: \'linear-gradient(135deg, #0f2a44 0%, #153859 50%, #1e5a8a 100%)\' }}>
        <div style={{ width: \'100%\', maxWidth: \'420px\', padding: \'0 20px\' }}>
          <div style={{ background: C.white, borderRadius: \'16px\', padding: \'40px 36px\', boxShadow: \'0 25px 60px rgba(0,0,0,0.3)\' }}>
            <div style={{ textAlign: \'center\', marginBottom: \'32px\' }}>
              <div style={{ width: \'64px\', height: \'64px\', borderRadius: \'14px\', margin: \'0 auto 16px\',
                background: \'linear-gradient(135deg, #153859, #1e5a8a)\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\',
                boxShadow: \'0 8px 24px rgba(21,56,89,0.3)\' }}><Factory size={32} color={C.white} /></div>
              <h1 style={{ fontSize: \'24px\', fontWeight: 800, color: C.accent, margin: \'0 0 4px\', letterSpacing: \'1px\' }}>KOSTAL</h1>
              <p style={{ fontSize: \'13px\', color: C.textSecondary, margin: 0 }}>Mold Release Approval Form</p>
              <p style={{ fontSize: \'11px\', color: C.textSecondary, margin: \'4px 0 0\', opacity: 0.7 }}>Nave 1 - Inyeccion Mould K3</p>
            </div>
            <div style={{ marginBottom: \'20px\' }}>
              <label style={{ display: \'block\', fontSize: \'13px\', fontWeight: 600, color: C.text, marginBottom: \'6px\' }}>Numero de Nomina</label>
              <input type="text" value={nomina} onChange={(e) => setNomina(e.target.value)}
                onKeyDown={(e) => e.key === \'Enter\' && handleLogin()} placeholder="Ej: 40003"
                style={{ width: \'100%\', padding: \'12px 16px\', border: \'1.5px solid \' + C.border, borderRadius: \'10px\',
                  fontSize: \'16px\', color: C.text, background: C.inputBg, outline: \'none\', textAlign: \'center\',
                  letterSpacing: \'2px\', fontWeight: 500 }}
                onFocus={(e) => { e.currentTarget.style.borderColor = C.accent }}
                onBlur={(e) => { e.currentTarget.style.borderColor = C.border }} />
            </div>
            <button onClick={handleLogin} disabled={loading}
              style={{ width: \'100%\', background: loading ? \'#94a3b8\' : \'linear-gradient(135deg, #153859, #1e5a8a)\',
                color: C.white, border: \'none\', borderRadius: \'10px\', padding: \'12px\', fontSize: \'15px\',
                fontWeight: 600, cursor: loading ? \'not-allowed\' : \'pointer\', display: \'flex\', alignItems: \'center\',
                justifyContent: \'center\', gap: \'8px\', boxShadow: \'0 4px 14px rgba(21,56,89,0.3)\' }}>
              <LogIn size={16} />{loading ? \'Ingresando...\' : \'Ingresar\'}
            </button>
            <div style={{ textAlign: \'center\', marginTop: \'20px\', padding: \'12px\', background: \'#f0f4f8\', borderRadius: \'8px\' }}>
              <p style={{ fontSize: \'11px\', color: C.textSecondary, margin: 0 }}>
                <strong>Empleado:</strong> nomina 40003, 6041902, etc.<br/><strong>Aprobador Demo:</strong> 99999</p>
            </div>
          </div>
        </div>
        <Toaster position="top-right" richColors />
      </div>
    )
  }

  /* ═══ MAIN APP ═══ */
  const myRequests = requests.filter(r => r.employeeId === user?.id)
  const pendingReqs = requests.filter(r => r.status === \'PENDING\')
  const historyReqs = requests.filter(r => r.status !== \'PENDING\')

  return (
    <div style={{ display: \'flex\', height: \'100vh\', overflow: \'hidden\' }}>
      <aside style={{ width: sidebarOpen ? \'260px\' : \'72px\', background: C.sidebarBg,
        transition: \'width 0.3s\', display: \'flex\', flexDirection: \'column\',
        borderRight: \'1px solid \' + C.sidebarBorder, flexShrink: 0, overflow: \'hidden\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'12px\', padding: \'24px 20px 20px\' }}>
          <div style={{ width: \'42px\', height: \'42px\', borderRadius: \'10px\', flexShrink: 0,
            background: \'linear-gradient(135deg, #153859, #1e5a8a)\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\' }}>
            <Factory size={22} color={C.white} /></div>
          {sidebarOpen && <div>
            <div style={{ color: C.sidebarTextBright, fontSize: \'16px\', fontWeight: 700, letterSpacing: \'0.5px\' }}>KOSTAL</div>
            <div style={{ color: C.sidebarText, fontSize: \'11px\', opacity: 0.7 }}>Mold Release System</div>
          </div>}
        </div>
        <div style={{ padding: \'0 20px\', marginTop: \'8px\', marginBottom: \'4px\' }}>
          {sidebarOpen && <span style={{ fontSize: \'10px\', fontWeight: 700, color: C.sidebarText,
            textTransform: \'uppercase\', letterSpacing: \'1.5px\', opacity: 0.5 }}>
            {user?.isApprover ? \'Administracion\' : \'Operaciones\'}</span>}
        </div>
        <nav style={{ padding: \'0 12px\', flex: 1, display: \'flex\', flexDirection: \'column\', gap: \'2px\' }}>
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={screen === \'dashboard\'} onClick={() => setScreen(\'dashboard\')} />
          {!user?.isApprover ? (
            <>
              <SidebarItem icon={<FilePlus size={18} />} label="Nueva Solicitud" active={screen === \'new-request\'} onClick={() => setScreen(\'new-request\')} />
              <SidebarItem icon={<ClipboardList size={18} />} label="Mis Solicitudes" active={screen === \'my-requests\'}
                onClick={() => setScreen(\'my-requests\')} badge={myRequests.filter(r => r.status === \'PENDING\').length} />
            </>
          ) : (
            <>
              <SidebarItem icon={<Inbox size={18} />} label="Pendientes" active={screen === \'pending-approvals\'}
                onClick={() => setScreen(\'pending-approvals\')} badge={pendingCount} />
              <SidebarItem icon={<History size={18} />} label="Historial" active={screen === \'history\'} onClick={() => setScreen(\'history\')} />
            </>
          )}
        </nav>
        <div style={{ padding: \'16px\', borderTop: \'1px solid \' + C.sidebarBorder }}>
          <div style={{ display: \'flex\', alignItems: \'center\', gap: \'10px\', marginBottom: \'12px\', overflow: \'hidden\' }}>
            <div style={{ width: \'36px\', height: \'36px\', borderRadius: \'8px\', flexShrink: 0,
              background: user?.isApprover ? \'linear-gradient(135deg, #153859, #3b82f6)\' : \'linear-gradient(135deg, #153859, #1e5a8a)\',
              display: \'flex\', alignItems: \'center\', justifyContent: \'center\' }}>
              {user?.isApprover ? <Shield size={16} color={C.white} /> : <User size={16} color={C.white} />}
            </div>
            {sidebarOpen && <div style={{ overflow: \'hidden\' }}>
              <div style={{ color: C.sidebarTextBright, fontSize: \'13px\', fontWeight: 600,
                whiteSpace: \'nowrap\', overflow: \'hidden\', textOverflow: \'ellipsis\' }}>{user?.name}</div>
              <div style={{ color: C.sidebarText, fontSize: \'11px\', opacity: 0.6 }}>
                {user?.isApprover ? \'Aprobador\' : user?.department} - #{user?.nomina}</div>
            </div>}
          </div>
          <button onClick={handleLogout} style={{ display: \'flex\', alignItems: \'center\', gap: \'10px\', width: \'100%\',
            padding: \'8px 12px\', background: \'transparent\', border: \'none\', borderRadius: \'8px\', color: C.sidebarText,
            cursor: \'pointer\', fontSize: \'13px\', transition: \'all 0.2s\' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = \'rgba(220,38,38,0.15)\'
              (e.currentTarget as HTMLButtonElement).style.color = \'#fca5a5\' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = \'transparent\'
              (e.currentTarget as HTMLButtonElement).style.color = C.sidebarText }}>
            <LogOut size={16} />{sidebarOpen && <span>Cerrar Sesion</span>}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: \'auto\', background: C.bg }}>
        <header style={{ background: C.white, borderBottom: \'1px solid \' + C.border,
          padding: \'16px 32px\', display: \'flex\', alignItems: \'center\', gap: \'16px\', position: \'sticky\', top: 0, zIndex: 50 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: \'none\', border: \'none\',
            cursor: \'pointer\', color: C.textSecondary, padding: \'4px\', display: \'flex\', borderRadius: \'6px\' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.bg }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = \'none\' }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: \'18px\', fontWeight: 700, color: C.text }}>
              {screen === \'dashboard\' && \'Dashboard\'}
              {screen === \'new-request\' && \'Nueva Solicitud de Liberacion\'}
              {screen === \'my-requests\' && \'Mis Solicitudes\'}
              {screen === \'pending-approvals\' && \'Solicitudes Pendientes\'}
              {screen === \'history\' && \'Historial de Solicitudes\'}
            </h2>
            <p style={{ margin: \'2px 0 0\', fontSize: \'12px\', color: C.textSecondary }}>Nave 1 - Inyeccion Mould K3 - Kostal</p>
          </div>
          {user?.isApprover && pendingCount > 0 && (
            <div style={{ background: C.kostalRed, color: C.white, padding: \'6px 14px\', borderRadius: \'20px\',
              fontSize: \'12px\', fontWeight: 700, display: \'flex\', alignItems: \'center\', gap: \'6px\' }}>
              <AlertTriangle size={14} />{pendingCount} pendiente{pendingCount > 1 ? \'s\' : \'\'}
            </div>
          )}
        </header>

        <div style={{ padding: \'28px 32px\' }}>

          {/* ══ DASHBOARD ══ */}
          {screen === \'dashboard\' && stats && (
            <div>
              <div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fit, minmax(200px, 1fr))\', gap: \'16px\', marginBottom: \'28px\' }}>
                {!user?.isApprover ? (
                  <>
                    <StatCard icon={<Clock size={22} color={C.pending} />} label="Mis Pendientes" value={myRequests.filter(r => r.status === \'PENDING\').length} color={C.pending} bg={C.pendingBg} />
                    <StatCard icon={<CheckCircle size={22} color={C.approved} />} label="Aprobadas (mes)" value={stats.approvedWeek} color={C.approved} bg={C.approvedBg} />
                    <StatCard icon={<XCircle size={22} color={C.rejected} />} label="Rechazadas (semana)" value={stats.rejectedWeek} color={C.rejected} bg={C.rejectedBg} />
                    <StatCard icon={<TrendingUp size={22} color={C.accent} />} label="Total (mes)" value={stats.totalMonth} color={C.accent} bg={"#e8f0fe"} />
                  </>
                ) : (
                  <>
                    <StatCard icon={<Clock size={22} color={C.pending} />} label="Pendientes" value={stats.pending} color={C.pending} bg={C.pendingBg} />
                    <StatCard icon={<AlertTriangle size={22} color={C.urgent} />} label="Urgentes" value={stats.urgentPending} color={C.urgent} bg={C.urgentBg} />
                    <StatCard icon={<AlertOctagon size={22} color={C.critical} />} label="Criticos" value={stats.criticalPending} color={C.critical} bg={C.criticalBg} />
                    <StatCard icon={<CheckCircle size={22} color={C.approved} />} label="Aprobadas Hoy" value={stats.approvedToday} color={C.approved} bg={C.approvedBg} />
                    <StatCard icon={<TrendingUp size={22} color={C.accent} />} label="Total (mes)" value={stats.totalMonth} color={C.accent} bg={"#e8f0fe"} />
                  </>
                )}
              </div>
              <div style={{ background: C.white, borderRadius: \'12px\', padding: \'24px\', border: \'1px solid \' + C.border }}>
                <h3 style={{ margin: \'0 0 16px\', fontSize: \'15px\', fontWeight: 700, color: C.text }}>
                  Actividad Reciente</h3>
                {requests.slice(0, 8).map(r => (
                  <div key={r.id} style={{ display: \'flex\', alignItems: \'center\', gap: \'12px\', padding: \'10px 0\',
                    borderBottom: \'1px solid \' + C.border }}>
                    <div style={{ width: \'8px\', height: \'8px\', borderRadius: \'50%\', flexShrink: 0,
                      background: r.status === \'PENDING\' ? C.pending : r.status === \'APPROVED\' ? C.approved : C.rejected }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: \'13px\', fontWeight: 600, color: C.text }}>{r.ticketNumber}</span>
                      <span style={{ fontSize: \'12px\', color: C.textSecondary, marginLeft: \'8px\' }}>{r.moldNumber}</span>
                    </div>
                    <StatusBadge status={r.status} />
                    <span style={{ fontSize: \'11px\', color: C.textSecondary, flexShrink: 0 }}>{fmtDate(r.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ NEW REQUEST ══ */}
          {screen === \'new-request\' && (
            <div style={{ maxWidth: \'640px\' }}>
              <div style={{ background: C.white, borderRadius: \'12px\', padding: \'28px\', border: \'1px solid \' + C.border }}>
                <div style={{ display: \'flex\', alignItems: \'center\', gap: \'10px\', marginBottom: \'24px\' }}>
                  <div style={{ width: \'40px\', height: \'40px\', borderRadius: \'10px\',
                    background: \'linear-gradient(135deg, #153859, #1e5a8a)\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\' }}>
                    <Send size={18} color={C.white} /></div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: \'16px\', fontWeight: 700, color: C.text }}>Datos de la Solicitud</h3>
                    <p style={{ margin: \'2px 0 0\', fontSize: \'12px\', color: C.textSecondary }}>Completa los campos para solicitar la liberacion</p>
                  </div>
                </div>
                <div style={{ marginBottom: \'20px\' }}>
                  <label style={{ display: \'block\', fontSize: \'13px\', fontWeight: 600, color: C.text, marginBottom: \'6px\' }}>Numero de Molde</label>
                  <div style={{ position: \'relative\' }}>
                    <input type="text" value={moldNumber} onChange={(e) => { setMoldNumber(e.target.value); setShowMoldSugg(true) }}
                      onBlur={() => setTimeout(() => setShowMoldSugg(false), 200)} placeholder="Ej: K3-MOLD-001"
                      style={{ width: \'100%\', padding: \'10px 14px\', border: \'1.5px solid \' + C.border, borderRadius: \'8px\',
                        fontSize: \'14px\', color: C.text, background: C.inputBg, outline: \'none\' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; setShowMoldSugg(true) }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = C.border }} />
                    {showMoldSugg && filteredMolds.length > 0 && (
                      <div style={{ position: \'absolute\', top: \'100%\', left: 0, right: 0, background: C.white,
                        border: \'1px solid \' + C.border, borderRadius: \'0 0 8px 8px\', borderTop: \'none\', zIndex: 100, maxHeight: \'150px\', overflow: \'auto\' }}>
                        {filteredMolds.slice(0, 6).map(m => (
                          <div key={m} onMouseDown={() => { setMoldNumber(m); setShowMoldSugg(false) }}
                            style={{ padding: \'8px 14px\', fontSize: \'13px\', color: C.text, cursor: \'pointer\',
                              borderBottom: \'1px solid \' + C.border }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.bg }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.white }}>{m}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: \'20px\' }}>
                  <label style={{ display: \'block\', fontSize: \'13px\', fontWeight: 600, color: C.text, marginBottom: \'6px\' }}>Motivo</label>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe por que necesitas la liberacion..." rows={4}
                    style={{ width: \'100%\', padding: \'10px 14px\', border: \'1.5px solid \' + C.border, borderRadius: \'8px\',
                      fontSize: \'14px\', color: C.text, background: C.inputBg, resize: \'vertical\', outline: \'none\', fontFamily: \'inherit\' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = C.accent }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = C.border }} />
                </div>
                <div style={{ display: \'grid\', gridTemplateColumns: \'1fr 1fr 1fr\', gap: \'12px\', marginBottom: \'20px\' }}>
                  <div>
                    <label style={{ display: \'block\', fontSize: \'13px\', fontWeight: 600, color: C.text, marginBottom: \'6px\' }}>Prioridad</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}
                      style={{ width: \'100%\', padding: \'10px 14px\', border: \'1.5px solid \' + C.border, borderRadius: \'8px\',
                        fontSize: \'14px\', color: C.text, background: C.inputBg, outline: \'none\', cursor: \'pointer\' }}>
                      <option value="NORMAL">Normal</option>
                      <option value="URGENTE">Urgente</option>
                      <option value="CRITICO">Critico</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: \'block\', fontSize: \'13px\', fontWeight: 600, color: C.text, marginBottom: \'6px\' }}>Turno</label>
                    <select value={shift} onChange={(e) => setShift(e.target.value)}
                      style={{ width: \'100%\', padding: \'10px 14px\', border: \'1.5px solid \' + C.border, borderRadius: \'8px\',
                        fontSize: \'14px\', color: C.text, background: C.inputBg, outline: \'none\', cursor: \'pointer\' }}>
                      <option value="">Seleccionar</option>
                      <option value="1">Turno 1</option>
                      <option value="2">Turno 2</option>
                      <option value="3">Turno 3</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: \'block\', fontSize: \'13px\', fontWeight: 600, color: C.text, marginBottom: \'6px\' }}>Linea</label>
                    <input type="text" value={productionLine} onChange={(e) => setProductionLine(e.target.value)} placeholder="Ej: Linea 5"
                      style={{ width: \'100%\', padding: \'10px 14px\', border: \'1.5px solid \' + C.border, borderRadius: \'8px\',
                        fontSize: \'14px\', color: C.text, background: C.inputBg, outline: \'none\' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = C.accent }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = C.border }} />
                  </div>
                </div>
                <div style={{ display: \'flex\', gap: \'12px\', justifyContent: \'flex-end\' }}>
                  <button onClick={() => { setMoldNumber(\'\'); setReason(\'\'); setPriority(\'NORMAL\'); setShift(\'\'); setProductionLine(\'\') }}
                    style={{ background: \'transparent\', border: \'1.5px solid \' + C.border, borderRadius: \'8px\',
                      padding: \'10px 20px\', fontSize: \'14px\', fontWeight: 500, color: C.textSecondary, cursor: \'pointer\' }}>Limpiar</button>
                  <button onClick={handleSubmit} disabled={submitting}
                    style={{ background: submitting ? \'#94a3b8\' : \'linear-gradient(135deg, #153859, #1e5a8a)\', color: C.white, border: \'none\',
                      borderRadius: \'8px\', padding: \'10px 24px\', fontSize: \'14px\', fontWeight: 600,
                      cursor: submitting ? \'not-allowed\' : \'pointer\', display: \'inline-flex\', alignItems: \'center\', gap: \'8px\' }}>
                    <Send size={15} />{submitting ? \'Enviando...\' : \'Enviar Solicitud\'}</button>
                </div>
              </div>
            </div>
          )}

          {/* ══ MY REQUESTS / PENDING / HISTORY (shared list with filters) ══ */}
          {(screen === \'my-requests\' || screen === \'pending-approvals\' || screen === \'history\') && (
            <div>
              {/* Filters bar */}
              <div style={{ display: \'flex\', gap: \'12px\', marginBottom: \'20px\', flexWrap: \'wrap\', alignItems: \'center\' }}>
                <div style={{ flex: 1, minWidth: \'200px\', position: \'relative\' }}>
                  <Search size={16} color={C.textSecondary} style={{ position: \'absolute\', left: \'12px\', top: \'50%\', transform: \'translateY(-50%)\' }} />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por folio, molde, nombre..."
                    style={{ width: \'100%\', padding: \'10px 14px 10px 38px\', border: \'1.5px solid \' + C.border, borderRadius: \'8px\',
                      fontSize: \'13px\', color: C.text, background: C.white, outline: \'none\' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = C.accent }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = C.border }} />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: \'10px 14px\', border: \'1.5px solid \' + C.border, borderRadius: \'8px\',
                    fontSize: \'13px\', color: C.text, background: C.white, outline: \'none\', cursor: \'pointer\' }}>
                  <option value="">Todos los estatus</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="APPROVED">Aprobada</option>
                  <option value="REJECTED">Rechazada</option>
                </select>
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
                  style={{ padding: \'10px 14px\', border: \'1.5px solid \' + C.border, borderRadius: \'8px\',
                    fontSize: \'13px\', color: C.text, background: C.white, outline: \'none\', cursor: \'pointer\' }}>
                  <option value="">Todas las prioridades</option>
                  <option value="NORMAL">Normal</option>
                  <option value="URGENTE">Urgente</option>
                  <option value="CRITICO">Critico</option>
                </select>
                {screen === \'history\' && (
                  <button onClick={exportCSV}
                    style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', padding: \'10px 16px\',
                      background: \'linear-gradient(135deg, #153859, #1e5a8a)\', color: C.white, border: \'none\',
                      borderRadius: \'8px\', fontSize: \'13px\', fontWeight: 600, cursor: \'pointer\' }}>
                    <Download size={14} />Exportar CSV
                  </button>
                )}
              </div>

              {/* List */}
              {requests.length === 0 ? (
                <div style={{ background: C.white, borderRadius: \'12px\', padding: \'60px 40px\', textAlign: \'center\', border: \'1px solid \' + C.border }}>
                  <ClipboardList size={48} color={C.border} style={{ margin: \'0 auto 16px\' }} />
                  <p style={{ fontSize: \'16px\', fontWeight: 600, color: C.text, margin: \'0 0 4px\' }}>Sin resultados</p>
                  <p style={{ fontSize: \'13px\', color: C.textSecondary, margin: 0 }}>No se encontraron solicitudes con los filtros actuales</p>
                </div>
              ) : (
                <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'10px\' }}>
                  {requests.sort((a, b) => {
                    const pa = PRI[a.priority as keyof typeof PRI]?.order ?? 0
                    const pb = PRI[b.priority as keyof typeof PRI]?.order ?? 0
                    if (screen === \'pending-approvals\' && pa !== pb) return pb - pa
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  }).map(req => (
                    <div key={req.id} style={{
                      background: C.white, borderRadius: \'10px\', padding: \'20px 24px\', border: \'1px solid \' + C.border,
                      borderLeft: screen === \'pending-approvals\'
                        ? \'4px solid \' + (req.priority === \'CRITICO\' ? C.critical : req.priority === \'URGENTE\' ? C.urgent : C.pending)
                        : \'4px solid \' + (req.status === \'PENDING\' ? C.pending : req.status === \'APPROVED\' ? C.approved : C.rejected)
                    }}>
                      <div style={{ display: \'flex\', justifyContent: \'space-between\', alignItems: \'flex-start\', marginBottom: \'10px\' }}>
                        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\', flexWrap: \'wrap\' }}>
                          <span style={{ fontSize: \'11px\', fontWeight: 700, color: C.white, background: C.accent,
                            padding: \'2px 8px\', borderRadius: \'4px\', letterSpacing: \'0.5px\' }}>{req.ticketNumber}</span>
                          <span style={{ fontSize: \'16px\', fontWeight: 700, color: C.text }}>{req.moldNumber}</span>
                          <PriorityBadge priority={req.priority} />
                          <StatusBadge status={req.status} />
                          {req.shift && <span style={{ fontSize: \'11px\', color: C.textSecondary, background: C.bg,
                            padding: \'2px 8px\', borderRadius: \'4px\' }}>Turno {req.shift}</span>}
                          {req.productionLine && <span style={{ fontSize: \'11px\', color: C.textSecondary, background: C.bg,
                            padding: \'2px 8px\', borderRadius: \'4px\' }}>{req.productionLine}</span>}
                        </div>
                        <span style={{ fontSize: \'11px\', color: C.textSecondary, flexShrink: 0 }}>{fmtDate(req.createdAt)}</span>
                      </div>
                      <p style={{ margin: \'0 0 8px\', fontSize: \'13px\', color: C.text }}>{req.reason}</p>
                      <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\', marginBottom: req.status !== \'PENDING\' ? \'4px\' : \'14px\', flexWrap: \'wrap\' }}>
                        <User size={13} color={C.textSecondary} />
                        <span style={{ fontSize: \'12px\', color: C.textSecondary }}>{req.employee?.name} - {req.employee?.department} - #{req.employee?.nomina}</span>
                      </div>
                      {req.approvedAt && (
                        <div style={{ fontSize: \'11px\', color: C.approved, marginBottom: \'4px\' }}>
                          <CheckCircle size={11} style={{ verticalAlign: \'middle\' }} /> Aprobada: {fmtDate(req.approvedAt)} por {req.approver?.name}
                        </div>
                      )}
                      {req.rejectedAt && (
                        <div style={{ fontSize: \'11px\', color: C.rejected, marginBottom: \'4px\' }}>
                          <XCircle size={11} style={{ verticalAlign: \'middle\' }} /> Rechazada: {fmtDate(req.rejectedAt)} por {req.approver?.name}
                          {req.comment && \' - \"\' + req.comment + \'\"\'}
                        </div>
                      )}
                      {screen === \'pending-approvals\' && req.status === \'PENDING\' && (
                        <div style={{ display: \'flex\', gap: \'10px\', justifyContent: \'flex-end\', marginTop: \'10px\' }}>
                          <button onClick={() => { setRejectingId(req.id); setRejectComment(\'\') }}
                            style={{ background: C.rejected, color: C.white, border: \'none\', borderRadius: \'8px\',
                              padding: \'8px 16px\', fontSize: \'13px\', fontWeight: 600, cursor: \'pointer\',
                              display: \'inline-flex\', alignItems: \'center\', gap: \'6px\' }}>
                            <XCircle size={14} />Rechazar</button>
                          <button onClick={() => handleApprove(req.id)}
                            style={{ background: C.approved, color: C.white, border: \'none\', borderRadius: \'8px\',
                              padding: \'8px 16px\', fontSize: \'13px\', fontWeight: 600, cursor: \'pointer\',
                              display: \'inline-flex\', alignItems: \'center\', gap: \'6px\' }}>
                            <CheckCircle size={14} />Aprobar</button>
                        </div>
                      )}
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
        <div style={{ position: \'fixed\', inset: 0, background: \'rgba(0,0,0,0.5)\',
          display: \'flex\', alignItems: \'center\', justifyContent: \'center\', zIndex: 1000 }}>
          <div style={{ background: C.white, borderRadius: \'14px\', padding: \'28px\', width: \'100%\', maxWidth: \'440px\',
            margin: \'0 20px\', boxShadow: \'0 25px 50px rgba(0,0,0,0.25)\' }}>
            <div style={{ display: \'flex\', alignItems: \'center\', gap: \'10px\', marginBottom: \'20px\' }}>
              <div style={{ width: \'40px\', height: \'40px\', borderRadius: \'10px\', background: C.rejectedBg,
                display: \'flex\', alignItems: \'center\', justifyContent: \'center\' }}>
                <XCircle size={20} color={C.rejected} /></div>
              <div>
                <h3 style={{ margin: 0, fontSize: \'16px\', fontWeight: 700, color: C.text }}>Rechazar Solicitud</h3>
                <p style={{ margin: \'2px 0 0\', fontSize: \'12px\', color: C.textSecondary }}>Agrega un comentario para el empleado</p>
              </div>
            </div>
            <div style={{ marginBottom: \'20px\' }}>
              <label style={{ display: \'block\', fontSize: \'13px\', fontWeight: 600, color: C.text, marginBottom: \'6px\' }}>Comentario</label>
              <textarea value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} placeholder="Razon del rechazo..." rows={3}
                style={{ width: \'100%\', padding: \'10px 14px\', border: \'1.5px solid \' + C.border, borderRadius: \'8px\',
                  fontSize: \'14px\', color: C.text, background: C.inputBg, resize: \'vertical\', outline: \'none\', fontFamily: \'inherit\' }} />
            </div>
            <div style={{ display: \'flex\', gap: \'10px\', justifyContent: \'flex-end\' }}>
              <button onClick={() => setRejectingId(null)}
                style={{ background: \'transparent\', border: \'1.5px solid \' + C.border, borderRadius: \'8px\',
                  padding: \'10px 20px\', fontSize: \'14px\', fontWeight: 500, color: C.textSecondary, cursor: \'pointer\' }}>Cancelar</button>
              <button onClick={handleReject} disabled={!rejectComment.trim()}
                style={{ background: C.rejected, color: C.white, border: \'none\', borderRadius: \'8px\', padding: \'10px 20px\',
                  fontSize: \'14px\', fontWeight: 600, cursor: rejectComment.trim() ? \'pointer\' : \'not-allowed\',
                  opacity: rejectComment.trim() ? 1 : 0.6 }}>Confirmar Rechazo</button>
            </div>
          </div>
        </div>
      )}
      <Toaster position="top-right" richColors />
    </div>
  )
}
`;

fs.writeFileSync(out, tsx, "utf8");
console.log("page.tsx creado correctamente (" + tsx.length + " chars)");