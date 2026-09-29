"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ValidateContent() {
  const sp = useSearchParams();
  const token = sp.get("token") || "";
  const [req, setReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setError("Token no proporcionado"); setLoading(false); return; }
    fetch("/api/validate/" + token)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setReq(d); })
      .catch(() => setError("Error de conexion"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleValidate = async () => {
    setProcessing(true); setError("");
    try {
      const r = await fetch("/api/validate/" + token, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: null }),
      });
      const d = await r.json();
      if (d.error) { setError(d.error); setProcessing(false); return; }
      setDone(true);
    } catch { setError("Error de conexion"); }
    setProcessing(false);
  };

  if (loading) return <div style={S.wrap}><div style={S.card}><p style={{textAlign:"center",padding:40,color:"#64748b"}}>Cargando...</p></div></div>;
  if (error && !req) return <div style={S.wrap}><div style={S.card}><p style={{textAlign:"center",padding:40,color:"#ef4444"}}>{error}</p></div></div>;
  if (done) return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={{textAlign:"center",padding:48}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:36,fontWeight:700,color:"#065f46"}}>OK</div>
          <h2 style={{margin:"0 0 8px",color:"#065f46",fontSize:24}}>Salida Validada</h2>
          <p style={{color:"#64748b",fontSize:15}}>{req.ticketNumber} &mdash; La solicitud esta lista para salida.</p>
        </div>
      </div>
      <p style={{textAlign:"center",color:"#64748b",fontSize:12,marginTop:16,opacity:0.7}}>Kostal Mexicana &mdash; Sistema de Salidas</p>
    </div>
  );

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.headerSec}><h2 style={{margin:0,color:"#fff",fontSize:18}}>Validacion de Seguridad</h2></div>
        <div style={{padding:24}}>
          <div style={{background:"#d1fae5",borderRadius:10,padding:16,marginBottom:24,textAlign:"center"}}>
            <p style={{margin:0,color:"#065f46",fontWeight:600,fontSize:15}}>Esta solicitud fue APROBADA y requiere tu validacion para salida</p>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <span style={{fontSize:22,fontWeight:700,color:"#0f172a"}}>{req.ticketNumber}</span>
            <span style={{padding:"4px 14px",borderRadius:6,background:"#d1fae5",color:"#065f46",fontWeight:600}}>Aprobada</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <tbody>
              <tr><td style={S.tdL}>Tipo</td><td style={S.tdV}>{req.type==="MOLD"?"Salida de Molde":"Salida de Diversos"}</td></tr>
              <tr><td style={S.tdL}>Solicita</td><td style={S.tdV}>{req.employee?.name} ({req.employee?.nomina})</td></tr>
              <tr><td style={S.tdL}>Departamento</td><td style={S.tdV}>{req.employee?.department}</td></tr>
              <tr><td style={S.tdL}>Aprobado por</td><td style={S.tdV}>{req.approver?.name||"N/A"} {req.approvedAt?"&mdash; "+new Date(req.approvedAt).toLocaleString("es-MX"):""}</td></tr>
              {req.moldNumber&&<tr><td style={S.tdL}>Molde</td><td style={S.tdV}>{req.moldNumber}</td></tr>}
              {req.plates&&<tr><td style={S.tdL}>Placas</td><td style={S.tdV}>{req.plates}</td></tr>}
              <tr><td style={S.tdL}>Razon</td><td style={S.tdV}>{req.reason}</td></tr>
              <tr><td style={S.tdL}>Fecha solicitud</td><td style={S.tdV}>{new Date(req.createdAt).toLocaleString("es-MX")}</td></tr>
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
          {error&&<p style={{color:"#ef4444",marginTop:16,fontSize:14,textAlign:"center"}}>{error}</p>}
          <div style={{textAlign:"center",marginTop:28}}>
            <button onClick={handleValidate} disabled={processing} style={{padding:"14px 56px",borderRadius:10,border:"none",background:processing?"#6ee7b7":"#10b981",color:"#fff",fontSize:16,fontWeight:700,cursor:processing?"not-allowed":"pointer",letterSpacing:"0.5px"}}>
              {processing?"Procesando...":"VALIDAR SALIDA"}
            </button>
          </div>
        </div>
      </div>
      <p style={{textAlign:"center",color:"#64748b",fontSize:12,marginTop:16,opacity:0.7}}>Kostal Mexicana &mdash; Sistema de Salidas</p>
    </div>
  );
}

const S: any = {
  wrap:{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#064e3b 40%,#1e3a5f 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif"},
  card:{background:"#fff",borderRadius:16,maxWidth:660,width:"100%",boxShadow:"0 25px 50px rgba(0,0,0,0.25)",overflow:"hidden"},
  headerSec:{background:"linear-gradient(135deg,#065f46,#047857)",padding:"20px 24px"},
  tdL:{padding:"10px 14px",fontSize:13,fontWeight:600,color:"#64748b",borderBottom:"1px solid #f1f5f9",width:140,verticalAlign:"top"},
  tdV:{padding:"10px 14px",fontSize:14,color:"#1e293b",borderBottom:"1px solid #f1f5f9"},
};

export default function ValidatePage() {
  return <Suspense fallback={<div style={S.wrap}><div style={S.card}><p style={{textAlign:"center",padding:40,color:"#64748b"}}>Cargando...</p></div></div>}><ValidateContent/></Suspense>;
}
