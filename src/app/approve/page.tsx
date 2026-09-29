"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ApproveContent() {
  const sp = useSearchParams();
  const token = sp.get("token") || "";
  const [req, setReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [action, setAction] = useState("");

  useEffect(() => {
    if (!token) { setError("Token no proporcionado"); setLoading(false); return; }
    fetch("/api/approve/" + token)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setReq(d); })
      .catch(() => setError("Error de conexion"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = async (act: string) => {
    setProcessing(true); setError("");
    try {
      const r = await fetch("/api/approve/" + token, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: act, comment: comment || null }),
      });
      const d = await r.json();
      if (d.error) { setError(d.error); setProcessing(false); return; }
      setDone(true); setAction(act);
    } catch { setError("Error de conexion"); }
    setProcessing(false);
  };

  if (loading) return <div style={S.wrap}><div style={S.card}><p style={{textAlign:"center",padding:40,color:"#64748b"}}>Cargando solicitud...</p></div></div>;
  if (error && !req) return <div style={S.wrap}><div style={S.card}><p style={{textAlign:"center",padding:40,color:"#ef4444"}}>{error}</p></div></div>;
  if (done) return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={{textAlign:"center",padding:48}}>
          <div style={{fontSize:72,marginBottom:16}}>{action==="approve"?"OK":"X"}</div>
          <h2 style={{margin:"0 0 8px",color:action==="approve"?"#065f46":"#991b1b",fontSize:24}}>
            {action==="approve"?"Solicitud Aprobada":"Solicitud Rechazada"}
          </h2>
          <p style={{color:"#64748b",fontSize:15}}>{req.ticketNumber} &mdash; Se notifico al solicitante.{action==="approve"?" Se envio correo a Seguridad.":""}</p>
        </div>
      </div>
      <p style={{textAlign:"center",color:"#94a3b8",fontSize:12,marginTop:16}}>Kostal Mexicana &mdash; Sistema de Salidas</p>
    </div>
  );

  const ST: any = { PENDING:{l:"Pendiente",c:"#92400e",b:"#fef3c7"}, APPROVED:{l:"Aprobada",c:"#065f46",b:"#d1fae5"}, REJECTED:{l:"Rechazada",c:"#991b1b",b:"#fee2e2"}, VALIDATED:{l:"Validada",c:"#1e40af",b:"#dbeafe"} };
  const st = ST[req.status]||ST.PENDING;

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.header}><h2 style={{margin:0,color:"#fff",fontSize:18}}>Revision de Solicitud</h2></div>
        {req.status!=="PENDING"?(
          <div style={{textAlign:"center",padding:48}}>
            <p style={{color:st.c,fontWeight:600,fontSize:18}}>Esta solicitud ya fue procesada</p>
            <p style={{color:"#64748b",marginTop:8}}>Estado: <span style={{background:st.b,color:st.c,padding:"2px 12px",borderRadius:6,fontWeight:600}}>{st.l}</span></p>
          </div>
        ):(
          <div style={{padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <span style={{fontSize:22,fontWeight:700,color:"#0f172a"}}>{req.ticketNumber}</span>
              <span style={{padding:"4px 14px",borderRadius:6,background:st.b,color:st.c,fontWeight:600}}>{st.l}</span>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <tbody>
                <tr><td style={S.tdL}>Tipo</td><td style={S.tdV}>{req.type==="MOLD"?"Salida de Molde":"Salida de Diversos"}</td></tr>
                <tr><td style={S.tdL}>Solicita</td><td style={S.tdV}>{req.employee?.name} ({req.employee?.nomina})</td></tr>
                <tr><td style={S.tdL}>Departamento</td><td style={S.tdV}>{req.employee?.department}</td></tr>
                {req.moldNumber&&<tr><td style={S.tdL}>Molde</td><td style={S.tdV}>{req.moldNumber}</td></tr>}
                {req.shift&&<tr><td style={S.tdL}>Turno</td><td style={S.tdV}>{req.shift}</td></tr>}
                {req.productionLine&&<tr><td style={S.tdL}>Linea</td><td style={S.tdV}>{req.productionLine}</td></tr>}
                {req.plates&&<tr><td style={S.tdL}>Placas</td><td style={S.tdV}>{req.plates}</td></tr>}
                <tr><td style={S.tdL}>Razon</td><td style={S.tdV}>{req.reason}</td></tr>
                <tr><td style={S.tdL}>Fecha</td><td style={S.tdV}>{new Date(req.createdAt).toLocaleString("es-MX")}</td></tr>
              </tbody>
            </table>
            {req.items&&(
              <div style={{marginTop:20}}>
                <p style={{fontWeight:600,marginBottom:8,fontSize:14}}>Articulos:</p>
                <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr>
                    {["Cant","No. Parte","Descripcion","Precio Unit.","Importe"].map(h=>(
                      <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:600,color:"#64748b",borderBottom:"2px solid #e2e8f0",textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{JSON.parse(req.items).map((it:any,i:number)=>(
                    <tr key={i}>
                      <td style={{padding:"8px 10px",borderBottom:"1px solid #f1f5f9"}}>{it.quantity}</td>
                      <td style={{padding:"8px 10px",borderBottom:"1px solid #f1f5f9"}}>{it.partNumber}</td>
                      <td style={{padding:"8px 10px",borderBottom:"1px solid #f1f5f9"}}>{it.description}</td>
                      <td style={{padding:"8px 10px",borderBottom:"1px solid #f1f5f9"}}>${it.unitPrice}</td>
                      <td style={{padding:"8px 10px",borderBottom:"1px solid #f1f5f9",fontWeight:600}}>${it.total}</td>
                    </tr>
                  ))}</tbody>
                </table>
                </div>
              </div>
            )}
            <div style={{marginTop:24}}>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>Comentario (opcional)</label>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder="Agrega un comentario..." style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #d1d5db",fontSize:14,boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}/>
            </div>
            {error&&<p style={{color:"#ef4444",marginTop:12,fontSize:14}}>{error}</p>}
            <div style={{display:"flex",gap:12,marginTop:24,justifyContent:"center"}}>
              <button onClick={()=>handleAction("approve")} disabled={processing} style={{padding:"14px 48px",borderRadius:10,border:"none",background:processing?"#6ee7b7":"#10b981",color:"#fff",fontSize:16,fontWeight:700,cursor:processing?"not-allowed":"pointer",letterSpacing:"0.5px"}}>
                {processing?"Procesando...":"APROBAR"}
              </button>
              <button onClick={()=>handleAction("reject")} disabled={processing} style={{padding:"14px 48px",borderRadius:10,border:"none",background:processing?"#fca5a5":"#ef4444",color:"#fff",fontSize:16,fontWeight:700,cursor:processing?"not-allowed":"pointer",letterSpacing:"0.5px"}}>
                {processing?"Procesando...":"RECHAZAR"}
              </button>
            </div>
          </div>
        )}
      </div>
      <p style={{textAlign:"center",color:"#64748b",fontSize:12,marginTop:16,opacity:0.7}}>Kostal Mexicana &mdash; Sistema de Salidas</p>
    </div>
  );
}

const S: any = {
  wrap:{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 40%,#312e81 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif"},
  card:{background:"#fff",borderRadius:16,maxWidth:660,width:"100%",boxShadow:"0 25px 50px rgba(0,0,0,0.25)",overflow:"hidden"},
  header:{background:"linear-gradient(135deg,#1e3a5f,#312e81)",padding:"20px 24px"},
  tdL:{padding:"10px 14px",fontSize:13,fontWeight:600,color:"#64748b",borderBottom:"1px solid #f1f5f9",width:130,verticalAlign:"top"},
  tdV:{padding:"10px 14px",fontSize:14,color:"#1e293b",borderBottom:"1px solid #f1f5f9"},
};

export default function ApprovePage() {
  return <Suspense fallback={<div style={S.wrap}><div style={S.card}><p style={{textAlign:"center",padding:40,color:"#64748b"}}>Cargando...</p></div></div>}><ApproveContent/></Suspense>;
}
