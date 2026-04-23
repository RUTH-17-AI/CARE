import { useState, useEffect, useCallback, useRef } from "react";

// ─── API BASE (change this if your backend runs on a different port) ────────
const API = import.meta.env.VITE_API_URL;

// ─── API HELPERS ────────────────────────────────────────────────────────────
const api = {
  get:    (url) => fetch(`${API}${url}`).then(r => r.json()),
  post:   (url, body) => fetch(`${API}${url}`, { method:"POST",   headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) }).then(r => r.json()),
  put:    (url, body) => fetch(`${API}${url}`, { method:"PUT",    headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) }).then(r => r.json()),
  delete: (url)       => fetch(`${API}${url}`, { method:"DELETE" }).then(r => r.json()),
};

// ─── THEME ──────────────────────────────────────────────────────────────────
const C = {
  navy:"#0F2044", blue:"#1D4ED8", blueLight:"#3B82F6",
  red:"#DC2626",  redBg:"#FEE2E2",
  amber:"#D97706",amberBg:"#FEF3C7",
  green:"#16A34A",greenBg:"#DCFCE7",
  slate:"#64748B",slateLight:"#F1F5F9",
  white:"#FFFFFF",border:"#E2E8F0",text:"#1E293B",
  purple:"#7C3AED",purpleBg:"#EDE9FE",
};
const riskCfg = {
  High:   { dot:C.red,   bg:C.redBg,   text:C.red   },
  Medium: { dot:C.amber, bg:C.amberBg, text:C.amber  },
  Low:    { dot:C.green, bg:C.greenBg, text:C.green  },
};
const statusIcon = { "Alert Needed":"⚠️","Follow-up Call":"📞","Monitoring":"📈" };
const apptTypeColor = { Urgent:C.red,"Follow-up":C.blue,Consultation:C.purple,Therapy:"#0891B2",Routine:C.green,"Check-up":C.amber };

// ─── TOAST ──────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type==="error" ? C.red : type==="success" ? C.green : C.blue;
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:999, background:bg, color:C.white,
      padding:"12px 20px", borderRadius:10, fontWeight:600, fontSize:14,
      boxShadow:"0 4px 20px rgba(0,0,0,0.25)", display:"flex", alignItems:"center", gap:10 }}>
      {type==="error"?"❌":type==="success"?"✅":"ℹ️"} {msg}
      <button onClick={onClose} style={{ background:"none",border:"none",color:C.white,cursor:"pointer",fontSize:16 }}>✕</button>
    </div>
  );
}

// ─── LOADER ──────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      height:"100%", gap:16, color:C.slate }}>
      <div style={{ width:40,height:40,border:`4px solid ${C.border}`,borderTop:`4px solid ${C.blue}`,
        borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ fontSize:14 }}>Loading from MongoDB...</span>
    </div>
  );
}

// ─── SMALL COMPONENTS ───────────────────────────────────────────────────────
function RiskBadge({ risk, size=13 }) {
  const cfg = riskCfg[risk] || riskCfg.Low;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",
      borderRadius:20,fontSize:size,fontWeight:700,background:cfg.bg,color:cfg.text }}>
      <span style={{ width:7,height:7,borderRadius:"50%",background:cfg.dot,display:"inline-block" }}/>
      {risk}
    </span>
  );
}
function InfoRow({ label, value }) {
  return (
    <div style={{ display:"flex",borderBottom:`1px solid ${C.border}`,padding:"9px 0" }}>
      <span style={{ width:150,color:C.slate,fontSize:13,fontWeight:600 }}>{label}</span>
      <span style={{ flex:1,color:C.text,fontSize:13 }}>{value||"—"}</span>
    </div>
  );
}
function VitalCard({ label,value,icon }) {
  return (
    <div style={{ background:C.slateLight,borderRadius:10,padding:"12px 14px",textAlign:"center",flex:1 }}>
      <div style={{ fontSize:20 }}>{icon}</div>
      <div style={{ fontSize:17,fontWeight:800,color:C.navy,margin:"4px 0" }}>{value||"—"}</div>
      <div style={{ fontSize:11,color:C.slate }}>{label}</div>
    </div>
  );
}

// ─── MODAL WRAPPER ───────────────────────────────────────────────────────────
function Modal({ children, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
      <div style={{ background:C.white,borderRadius:16,maxWidth:540,width:"100%",
        maxHeight:"92vh",overflowY:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.3)" }}
        onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── NOTIFICATION MODAL ──────────────────────────────────────────────────────
function NotifModal({ patient, onClose, onConfirm }) {
  return (
    <Modal onClose={onClose}>
      <div style={{ background:C.navy,padding:"28px 28px 0",borderRadius:"16px 16px 0 0",textAlign:"center",color:C.white }}>
        <div style={{ fontSize:48,fontWeight:200,letterSpacing:-2 }}>9:41</div>
        <div style={{ color:"#94A3B8",fontSize:13,marginBottom:24 }}>Tuesday, 20 May</div>
      </div>
      <div style={{ padding:28 }}>
        <div style={{ textAlign:"center",marginBottom:16 }}>
          <div style={{ width:52,height:52,background:C.blue,borderRadius:"50%",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 10px" }}>🔔</div>
          <div style={{ fontWeight:800,color:C.blue,fontSize:18 }}>Notification</div>
        </div>
        <div style={{ color:C.slate,fontSize:14,lineHeight:1.9,textAlign:"center",marginBottom:24 }}>
          Dear <strong>{patient.name?.split(" ")[0]}</strong>,<br/>
          Please visit hospital within <strong>3 days</strong><br/>
          for your follow-up checkup.<br/>
          Your health is important to us.
        </div>
        <button onClick={onConfirm} style={{ width:"100%",padding:14,background:C.blue,
          color:C.white,border:"none",borderRadius:10,fontWeight:700,fontSize:16,cursor:"pointer" }}>
          Confirm
        </button>
      </div>
    </Modal>
  );
}

// ─── PATIENT FORM ────────────────────────────────────────────────────────────
function PatientForm({ initial, onSave, onClose, title }) {
  const blank = { name:"",age:"",gender:"Male",blood:"O+",phone:"",email:"",address:"",
    diagnosis:"",risk:"Low",status:"Monitoring",doctor:"Dr. Reddy",ward:"General",
    admitted:new Date().toISOString().split("T")[0],weight:"",height:"",bp:"",pulse:"",temp:"",
    riskFactors:"",recommendations:"" };
  const [f, setF] = useState(initial ? {
    ...initial,
    riskFactors: Array.isArray(initial.riskFactors) ? initial.riskFactors.join("; ") : initial.riskFactors||"",
    recommendations: Array.isArray(initial.recommendations) ? initial.recommendations.join("; ") : initial.recommendations||"",
  } : blank);
  const [saving, setSaving] = useState(false);
  const u = k => e => setF(p=>({...p,[k]:e.target.value}));
  const iStyle = { background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:13,width:"100%",boxSizing:"border-box" };
  const handleSave = async () => {
    if (!f.name||!f.age) return;
    setSaving(true);
    await onSave({
      ...f, age:Number(f.age),
      riskFactors: f.riskFactors ? f.riskFactors.split(";").map(s=>s.trim()).filter(Boolean) : [],
      recommendations: f.recommendations ? f.recommendations.split(";").map(s=>s.trim()).filter(Boolean) : [],
    });
    setSaving(false);
  };
  const sStyle = { ...iStyle };
  return (
    <Modal onClose={onClose}>
      <div style={{ padding:24 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <h3 style={{ margin:0,color:C.navy,fontSize:18 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {[["Full Name","name"],["Age","age"],["Phone","phone"],["Email","email"]].map(([l,k])=>(
            <div key={k}><label style={{ fontSize:12,color:C.slate,fontWeight:600,display:"block",marginBottom:4 }}>{l}</label>
            <input value={f[k]} onChange={u(k)} style={iStyle}/></div>
          ))}
          {[["Gender","gender",["Male","Female","Other"]],
            ["Blood Group","blood",["A+","A-","B+","B-","O+","O-","AB+","AB-"]],
            ["Risk Level","risk",["High","Medium","Low"]],
            ["Status","status",["Alert Needed","Follow-up Call","Monitoring"]],
            ["Doctor","doctor",["Dr. Sharma","Dr. Mehta","Dr. Reddy","Dr. Gupta"]],
            ["Ward","ward",["Cardiology","General","Nephrology","Pulmonology","Endocrinology","Physiotherapy"]],
          ].map(([l,k,opts])=>(
            <div key={k}><label style={{ fontSize:12,color:C.slate,fontWeight:600,display:"block",marginBottom:4 }}>{l}</label>
            <select value={f[k]} onChange={u(k)} style={sStyle}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>
          ))}
        </div>
        {[["Address","address"],["Diagnosis","diagnosis"]].map(([l,k])=>(
          <div key={k} style={{ marginTop:10 }}>
            <label style={{ fontSize:12,color:C.slate,fontWeight:600,display:"block",marginBottom:4 }}>{l}</label>
            <input value={f[k]} onChange={u(k)} style={iStyle}/>
          </div>
        ))}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:10 }}>
          {[["Weight","weight"],["Height","height"],["BP","bp"],["Pulse","pulse"]].map(([l,k])=>(
            <div key={k}><label style={{ fontSize:12,color:C.slate,fontWeight:600,display:"block",marginBottom:4 }}>{l}</label>
            <input value={f[k]} onChange={u(k)} style={iStyle}/></div>
          ))}
        </div>
        {[["Risk Factors (semicolon separated)","riskFactors"],["Recommendations (semicolon separated)","recommendations"]].map(([l,k])=>(
          <div key={k} style={{ marginTop:10 }}>
            <label style={{ fontSize:12,color:C.slate,fontWeight:600,display:"block",marginBottom:4 }}>{l}</label>
            <textarea value={f[k]} onChange={u(k)} rows={2} style={{ ...iStyle,resize:"none" }}/>
          </div>
        ))}
        <button onClick={handleSave} disabled={saving} style={{ marginTop:20,width:"100%",padding:13,
          background:saving?"#93C5FD":C.blue,color:C.white,border:"none",borderRadius:10,
          fontWeight:700,fontSize:15,cursor:saving?"not-allowed":"pointer" }}>
          {saving?"Saving...":"Save Patient"}
        </button>
      </div>
    </Modal>
  );
}

// ─── APPOINTMENT FORM ────────────────────────────────────────────────────────
function ApptForm({ patients, initial, onSave, onClose, title }) {
  const blank = { patientId:"",doctor:"Dr. Sharma",department:"Cardiology",
    date:new Date().toISOString().split("T")[0],time:"10:00 AM",type:"Follow-up",status:"Confirmed",notes:"" };
  const [f, setF] = useState(initial||blank);
  const [saving, setSaving] = useState(false);
  const u = k => e => setF(p=>({...p,[k]:e.target.value}));
  const iStyle = { background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:13,width:"100%",boxSizing:"border-box" };
  const handleSave = async () => {
    const pt = patients.find(p=>p.patientId===f.patientId);
    if (!pt) return;
    setSaving(true);
    await onSave({ ...f, patientName:pt.name });
    setSaving(false);
  };
  return (
    <Modal onClose={onClose}>
      <div style={{ padding:24 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <h3 style={{ margin:0,color:C.navy,fontSize:18 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ marginBottom:10 }}>
          <label style={{ fontSize:12,color:C.slate,fontWeight:600,display:"block",marginBottom:4 }}>Patient</label>
          <select value={f.patientId} onChange={u("patientId")} style={iStyle}>
            <option value="">-- Select Patient --</option>
            {patients.map(p=><option key={p.patientId} value={p.patientId}>{p.name} ({p.patientId})</option>)}
          </select>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {[["Doctor","doctor",["Dr. Sharma","Dr. Mehta","Dr. Reddy","Dr. Gupta"]],
            ["Department","department",["Cardiology","General","Nephrology","Pulmonology","Endocrinology","Physiotherapy","Diabetology"]],
            ["Type","type",["Follow-up","Consultation","Urgent","Therapy","Routine","Check-up"]],
            ["Status","status",["Confirmed","Pending","Cancelled"]],
          ].map(([l,k,opts])=>(
            <div key={k}><label style={{ fontSize:12,color:C.slate,fontWeight:600,display:"block",marginBottom:4 }}>{l}</label>
            <select value={f[k]} onChange={u(k)} style={iStyle}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>
          ))}
          <div><label style={{ fontSize:12,color:C.slate,fontWeight:600,display:"block",marginBottom:4 }}>Date</label>
            <input type="date" value={f.date} onChange={u("date")} style={iStyle}/></div>
          <div><label style={{ fontSize:12,color:C.slate,fontWeight:600,display:"block",marginBottom:4 }}>Time</label>
            <input value={f.time} onChange={u("time")} style={iStyle} placeholder="10:00 AM"/></div>
        </div>
        <div style={{ marginTop:10 }}>
          <label style={{ fontSize:12,color:C.slate,fontWeight:600,display:"block",marginBottom:4 }}>Notes</label>
          <textarea value={f.notes} onChange={u("notes")} rows={2} style={{ ...iStyle,resize:"none" }}/>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ marginTop:20,width:"100%",padding:13,
          background:saving?"#93C5FD":C.blue,color:C.white,border:"none",borderRadius:10,
          fontWeight:700,fontSize:15,cursor:saving?"not-allowed":"pointer" }}>
          {saving?"Saving...":"Save Appointment"}
        </button>
      </div>
    </Modal>
  );
}

// ─── PATIENT DETAIL ──────────────────────────────────────────────────────────
function PatientDetail({ patientId, patients, appointments, onBack, onSendAlert, onSchedule, onEdit, onDelete, toast }) {
  const patient = patients.find(p=>p.patientId===patientId);
  const [tab, setTab] = useState("Overview");
  if (!patient) return <div style={{ padding:40,textAlign:"center",color:C.slate }}>Patient not found.</div>;
  const patAppts = appointments.filter(a=>a.patientId===patientId);
  return (
    <div style={{ flex:1,overflowY:"auto",background:C.slateLight }}>
      <div style={{ background:C.blue,padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <button onClick={onBack} style={{ background:"none",border:"none",color:C.white,fontSize:20,cursor:"pointer" }}>←</button>
          <h2 style={{ margin:0,color:C.white,fontSize:18,fontWeight:700 }}>Patient Details</h2>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={onEdit} style={{ padding:"6px 14px",background:"rgba(255,255,255,0.2)",color:C.white,border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13 }}>✏️ Edit</button>
          <button onClick={onDelete} style={{ padding:"6px 14px",background:"rgba(220,38,38,0.8)",color:C.white,border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13 }}>🗑 Delete</button>
        </div>
      </div>
      {/* Header Card */}
      <div style={{ background:C.white,margin:16,borderRadius:14,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:16 }}>
          <div style={{ width:64,height:64,borderRadius:"50%",background:riskCfg[patient.risk]?.bg||C.slateLight,
            color:riskCfg[patient.risk]?.text||C.slate,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:22 }}>
            {patient.name?.split(" ").map(w=>w[0]).join("").slice(0,2)}
          </div>
          <div>
            <div style={{ fontSize:20,fontWeight:800,color:C.navy }}>{patient.name}</div>
            <div style={{ color:C.slate,fontSize:13 }}>ID: {patient.patientId} &nbsp;|&nbsp; {patient.age}y &nbsp;|&nbsp; {patient.gender}</div>
            <RiskBadge risk={patient.risk}/>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,marginBottom:16 }}>
          <VitalCard label="Blood Pressure" value={patient.bp} icon="💓"/>
          <VitalCard label="Pulse" value={patient.pulse} icon="🫀"/>
          <VitalCard label="Temperature" value={patient.temp} icon="🌡️"/>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
          {[["Blood Group",patient.blood],["Weight",patient.weight],["Height",patient.height],["Ward",patient.ward],["Doctor",patient.doctor],["Admitted",patient.admitted]].map(([l,v])=>(
            <div key={l} style={{ background:C.slateLight,borderRadius:8,padding:"10px 12px" }}>
              <div style={{ fontSize:11,color:C.slate,marginBottom:2 }}>{l}</div>
              <div style={{ fontSize:13,fontWeight:700,color:C.navy }}>{v||"—"}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Tabs */}
      <div style={{ background:C.white,marginInline:16,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
        <div style={{ display:"flex",borderBottom:`1px solid ${C.border}` }}>
          {["Overview","Medical","Appointments","History"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ flex:1,padding:"12px 0",background:"none",
              border:"none",cursor:"pointer",fontSize:13,fontWeight:600,
              color:tab===t?C.blue:C.slate,borderBottom:tab===t?`2px solid ${C.blue}`:"2px solid transparent" }}>{t}</button>
          ))}
        </div>
        <div style={{ padding:20 }}>
          {tab==="Overview" && <>
            <InfoRow label="📋 Diagnosis" value={patient.diagnosis}/>
            <InfoRow label="🏥 Doctor" value={patient.doctor}/>
            <InfoRow label="📱 Phone" value={patient.phone}/>
            <InfoRow label="📧 Email" value={patient.email}/>
            <InfoRow label="🏠 Address" value={patient.address}/>
            <InfoRow label="⚡ Status" value={patient.status}/>
          </>}
          {tab==="Medical" && <>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontWeight:700,color:C.red,fontSize:14,marginBottom:10 }}>📌 Risk Factors</div>
              {(patient.riskFactors||[]).length===0 ? <div style={{ color:C.slate,fontSize:13 }}>No risk factors recorded.</div> :
                (patient.riskFactors||[]).map(r=>(
                <div key={r} style={{ background:C.redBg,color:C.red,padding:"7px 12px",borderRadius:8,fontSize:13,marginBottom:6 }}>• {r}</div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight:700,color:C.blue,fontSize:14,marginBottom:10 }}>🤖 AI Recommendations</div>
              {(patient.recommendations||[]).length===0 ? <div style={{ color:C.slate,fontSize:13 }}>No recommendations recorded.</div> :
                (patient.recommendations||[]).map(r=>(
                <div key={r} style={{ background:"#EFF6FF",color:C.blue,padding:"7px 12px",borderRadius:8,fontSize:13,marginBottom:6 }}>• {r}</div>
              ))}
            </div>
          </>}
          {tab==="Appointments" && <>
            <div style={{ fontWeight:700,color:C.navy,marginBottom:12 }}>Appointments for {patient.name}</div>
            {patAppts.length===0 ? <div style={{ color:C.slate,fontSize:13 }}>No appointments found.</div> :
              patAppts.map(a=>(
              <div key={a.appointmentId} style={{ border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:10,borderLeft:`4px solid ${apptTypeColor[a.type]||C.blue}` }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ fontWeight:700,color:C.navy }}>{a.department}</div>
                  <span style={{ background:a.status==="Confirmed"?C.greenBg:C.amberBg,color:a.status==="Confirmed"?C.green:C.amber,padding:"2px 10px",borderRadius:20,fontSize:12,fontWeight:600 }}>{a.status}</span>
                </div>
                <div style={{ color:C.slate,fontSize:13,marginTop:4 }}>📅 {a.date} at {a.time} — {a.doctor}</div>
                <div style={{ color:C.slate,fontSize:12,marginTop:2 }}>📝 {a.notes}</div>
              </div>
            ))}
          </>}
          {tab==="History" && <>
            <InfoRow label="📅 Admitted" value={patient.admitted}/>
            <InfoRow label="🕐 Last Visit" value={patient.lastVisit}/>
            <InfoRow label="📆 Next Visit" value={patient.nextVisit}/>
            <div style={{ marginTop:16,padding:14,background:C.slateLight,borderRadius:10 }}>
              <div style={{ fontWeight:600,color:C.navy,fontSize:13 }}>Visit History Summary</div>
              <div style={{ color:C.slate,fontSize:13,marginTop:6 }}>Patient admitted on {patient.admitted}. Last seen on {patient.lastVisit||"N/A"}. Next scheduled visit: {patient.nextVisit||"Not scheduled"}.</div>
            </div>
          </>}
        </div>
      </div>
      <div style={{ padding:"16px 16px 24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        <button onClick={onSendAlert} style={{ padding:14,background:C.red,color:C.white,border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer" }}>🔔 Send Alert</button>
        <button onClick={onSchedule} style={{ padding:14,background:C.blue,color:C.white,border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer" }}>📅 Schedule</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function DashboardPage({ patients, stats, loading, onSelect, onAddPatient }) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const filtered = patients
    .filter(p=>riskFilter==="All"||p.risk===riskFilter)
    .filter(p=>p.name?.toLowerCase().includes(search.toLowerCase())||p.patientId?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ flex:1,overflowY:"auto",padding:24,background:C.slateLight }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h1 style={{ margin:0,fontSize:22,fontWeight:800,color:C.navy }}>🏥 Readmission Risk Dashboard</h1>
        <button onClick={onAddPatient} style={{ padding:"10px 18px",background:C.blue,color:C.white,border:"none",borderRadius:10,fontWeight:700,cursor:"pointer" }}>+ Add Patient</button>
      </div>
      {/* Stats row */}
      {stats && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
          {[["Total Patients",stats.totalPatients,C.blue,"👥"],["High Risk",stats.highRisk,C.red,"🔴"],["Appointments",stats.totalAppointments,C.green,"📅"],["Pending Alerts",stats.recentAlerts,C.amber,"🔔"]].map(([l,v,col,ic])=>(
            <div key={l} style={{ background:C.white,borderRadius:12,padding:"16px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize:24 }}>{ic}</div>
              <div style={{ fontSize:26,fontWeight:800,color:col,margin:"4px 0" }}>{v}</div>
              <div style={{ fontSize:12,color:C.slate,fontWeight:600 }}>{l}</div>
            </div>
          ))}
        </div>
      )}
      {/* Search & filter */}
      <div style={{ display:"flex",gap:10,marginBottom:14 }}>
        <div style={{ flex:1,display:"flex",alignItems:"center",gap:8,background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 14px" }}>
          <span>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient..."
            style={{ border:"none",outline:"none",flex:1,fontSize:14,color:C.slate }}/>
        </div>
        {["All","High","Medium","Low"].map(r=>(
          <button key={r} onClick={()=>setRiskFilter(r)} style={{ padding:"8px 14px",borderRadius:10,
            border:`1px solid ${riskFilter===r?C.blue:C.border}`,background:riskFilter===r?C.blue:C.white,
            color:riskFilter===r?C.white:C.slate,fontWeight:600,fontSize:13,cursor:"pointer" }}>{r}</button>
        ))}
      </div>
      {/* Table */}
      {loading ? <Loader/> : (
        <div style={{ background:C.white,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.07)",marginBottom:16 }}>
          <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1.2fr 1fr",padding:"12px 20px",background:"#F8FAFC",borderBottom:`1px solid ${C.border}` }}>
            {["Patient Name","Risk Level","Status","Doctor"].map(h=>(
              <span key={h} style={{ fontSize:12,fontWeight:700,color:C.slate,textTransform:"uppercase",letterSpacing:0.5 }}>{h}</span>
            ))}
          </div>
          {filtered.map(p=>(
            <div key={p.patientId} onClick={()=>onSelect(p.patientId)}
              style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1.2fr 1fr",padding:"14px 20px",
                borderBottom:`1px solid ${C.border}`,alignItems:"center",cursor:"pointer",transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#F1F5F9"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:38,height:38,borderRadius:"50%",background:riskCfg[p.risk]?.bg||C.slateLight,color:riskCfg[p.risk]?.text||C.slate,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13 }}>
                  {p.name?.split(" ").map(w=>w[0]).join("").slice(0,2)}
                </div>
                <div>
                  <div style={{ fontWeight:600,color:C.navy,fontSize:14 }}>{p.name}</div>
                  <div style={{ color:C.slate,fontSize:11 }}>{p.patientId}</div>
                </div>
              </div>
              <div><RiskBadge risk={p.risk}/></div>
              <div style={{ color:C.slate,fontSize:13 }}>{statusIcon[p.status]||""} {p.status}</div>
              <div style={{ color:C.slate,fontSize:13 }}>{p.doctor}</div>
            </div>
          ))}
          {filtered.length===0&&<div style={{ padding:24,textAlign:"center",color:C.slate }}>No patients found.</div>}
        </div>
      )}
      {/* Alert + Summary */}
      {stats && stats.highRisk>0 && (
        <div style={{ background:C.redBg,border:`1px solid #FECACA`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
          <span style={{ fontSize:26 }}>⚠️</span>
          <div>
            <div style={{ fontWeight:800,color:C.red }}>Alerts: {stats.highRisk} High Risk Patients</div>
            <div style={{ color:"#92400E",fontSize:12 }}>These patients need immediate attention</div>
          </div>
        </div>
      )}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
        {[["High Risk",stats?.highRisk||0,C.red,C.redBg],["Medium Risk",stats?.mediumRisk||0,C.amber,C.amberBg],["Low Risk",stats?.lowRisk||0,C.green,C.greenBg]].map(([l,v,col,bg])=>(
          <div key={l} style={{ background:bg,borderRadius:12,padding:"18px 16px",textAlign:"center" }}>
            <div style={{ fontSize:13,fontWeight:700,color:col }}>{l}</div>
            <div style={{ fontSize:34,fontWeight:900,color:col,lineHeight:1.1 }}>{v}</div>
            <div style={{ fontSize:12,color:col }}>Patients</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PATIENTS PAGE ────────────────────────────────────────────────────────────
function PatientsPage({ patients, loading, onSelect, onAdd }) {
  const [search, setSearch] = useState("");
  const filtered = patients.filter(p=>
    p.name?.toLowerCase().includes(search.toLowerCase())||
    p.patientId?.toLowerCase().includes(search.toLowerCase())||
    p.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ flex:1,overflowY:"auto",padding:24,background:C.slateLight }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h1 style={{ margin:0,fontSize:22,fontWeight:800,color:C.navy }}>👥 All Patients</h1>
        <button onClick={onAdd} style={{ padding:"10px 18px",background:C.blue,color:C.white,border:"none",borderRadius:10,fontWeight:700,cursor:"pointer" }}>+ Add Patient</button>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, ID, or diagnosis..."
        style={{ width:"100%",padding:"10px 14px",border:`1px solid ${C.border}`,borderRadius:10,fontSize:14,marginBottom:16,boxSizing:"border-box",background:C.white }}/>
      {loading ? <Loader/> : (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          {filtered.map(p=>(
            <div key={p.patientId} onClick={()=>onSelect(p.patientId)}
              style={{ background:C.white,borderRadius:14,padding:18,cursor:"pointer",
                boxShadow:"0 1px 4px rgba(0,0,0,0.07)",borderLeft:`4px solid ${riskCfg[p.risk]?.dot||C.slate}`,transition:"all 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.07)"; }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:44,height:44,borderRadius:"50%",background:riskCfg[p.risk]?.bg||C.slateLight,color:riskCfg[p.risk]?.text||C.slate,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15 }}>
                    {p.name?.split(" ").map(w=>w[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <div style={{ fontWeight:700,color:C.navy,fontSize:15 }}>{p.name}</div>
                    <div style={{ color:C.slate,fontSize:11 }}>{p.patientId} • {p.age}y • {p.gender}</div>
                  </div>
                </div>
                <RiskBadge risk={p.risk} size={11}/>
              </div>
              <div style={{ color:C.slate,fontSize:12,marginBottom:4 }}>🏥 {p.ward} — {p.doctor}</div>
              <div style={{ color:C.slate,fontSize:12,marginBottom:8 }}>📋 {p.diagnosis}</div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                <span style={{ fontSize:11,background:C.slateLight,color:C.slate,padding:"2px 8px",borderRadius:20 }}>💓 {p.bp||"N/A"}</span>
                <span style={{ fontSize:11,background:C.slateLight,color:C.slate,padding:"2px 8px",borderRadius:20 }}>📞 {p.phone}</span>
                <span style={{ fontSize:11,background:C.slateLight,color:C.slate,padding:"2px 8px",borderRadius:20 }}>🩸 {p.blood}</span>
              </div>
            </div>
          ))}
          {filtered.length===0&&<div style={{ gridColumn:"1/-1",textAlign:"center",padding:40,color:C.slate }}>No patients found.</div>}
        </div>
      )}
    </div>
  );
}

// ─── APPOINTMENTS PAGE ────────────────────────────────────────────────────────
function AppointmentsPage({ appointments, patients, loading, onAdd }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const filtered = appointments
    .filter(a=>filter==="All"?true:filter==="Urgent"?a.type==="Urgent":a.status===filter)
    .filter(a=>a.patientName?.toLowerCase().includes(search.toLowerCase())||a.department?.toLowerCase().includes(search.toLowerCase()));
  const upcoming = filtered.filter(a=>a.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
  const past     = filtered.filter(a=>a.date<today).sort((a,b)=>b.date.localeCompare(a.date));
  return (
    <div style={{ flex:1,overflowY:"auto",padding:24,background:C.slateLight }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h1 style={{ margin:0,fontSize:22,fontWeight:800,color:C.navy }}>📅 Appointments</h1>
        <button onClick={onAdd} style={{ padding:"10px 18px",background:C.blue,color:C.white,border:"none",borderRadius:10,fontWeight:700,cursor:"pointer" }}>+ New</button>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient or department..."
        style={{ width:"100%",padding:"10px 14px",border:`1px solid ${C.border}`,borderRadius:10,fontSize:14,marginBottom:14,boxSizing:"border-box",background:C.white }}/>
      <div style={{ display:"flex",gap:8,marginBottom:16 }}>
        {["All","Confirmed","Pending","Urgent"].map(t=>(
          <button key={t} onClick={()=>setFilter(t)} style={{ padding:"7px 16px",borderRadius:20,border:`1px solid ${filter===t?C.blue:C.border}`,background:filter===t?C.blue:C.white,color:filter===t?C.white:C.slate,fontWeight:600,fontSize:13,cursor:"pointer" }}>{t}</button>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
        {[["Total",appointments.length,C.blue],["Confirmed",appointments.filter(a=>a.status==="Confirmed").length,C.green],["Pending",appointments.filter(a=>a.status==="Pending").length,C.amber],["Urgent",appointments.filter(a=>a.type==="Urgent").length,C.red]].map(([l,v,col])=>(
          <div key={l} style={{ background:C.white,borderRadius:12,padding:"14px 16px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:24,fontWeight:800,color:col }}>{v}</div>
            <div style={{ fontSize:12,color:C.slate,fontWeight:600 }}>{l}</div>
          </div>
        ))}
      </div>
      {loading ? <Loader/> : <>
        {upcoming.length>0 && <><div style={{ fontWeight:700,color:C.navy,fontSize:15,marginBottom:10 }}>🗓 Upcoming</div>{upcoming.map(a=><ApptCard key={a.appointmentId} a={a}/>)}</>}
        {past.length>0 && <><div style={{ fontWeight:700,color:C.slate,fontSize:15,margin:"16px 0 10px" }}>🕐 Past</div>{past.map(a=><ApptCard key={a.appointmentId} a={a} past/>)}</>}
        {filtered.length===0&&<div style={{ textAlign:"center",padding:40,color:C.slate }}>No appointments found.</div>}
      </>}
    </div>
  );
}
function ApptCard({ a, past }) {
  const col = apptTypeColor[a.type]||C.blue;
  return (
    <div style={{ background:past?"#F8FAFC":C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:10,opacity:past?0.75:1,borderLeft:`4px solid ${col}` }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
        <div>
          <div style={{ fontWeight:700,color:C.navy,fontSize:15 }}>{a.patientName}</div>
          <div style={{ color:C.slate,fontSize:13 }}>{a.department} — {a.doctor}</div>
          <div style={{ color:C.slate,fontSize:12,marginTop:4 }}>📅 {a.date} &nbsp;🕐 {a.time}</div>
          {a.notes&&<div style={{ color:C.slate,fontSize:12,marginTop:4 }}>📝 {a.notes}</div>}
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <span style={{ display:"block",padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:700,background:col+"22",color:col }}>{a.type}</span>
          <span style={{ display:"block",marginTop:6,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600,background:a.status==="Confirmed"?C.greenBg:a.status==="Cancelled"?C.redBg:C.amberBg,color:a.status==="Confirmed"?C.green:a.status==="Cancelled"?C.red:C.amber }}>{a.status}</span>
        </div>
      </div>
    </div>
  );
}

// ─── ALERTS PAGE ──────────────────────────────────────────────────────────────
function AlertsPage({ patients, alerts, loading }) {
  const high = patients.filter(p=>p.risk==="High");
  return (
    <div style={{ flex:1,overflowY:"auto",padding:24,background:C.slateLight }}>
      <h1 style={{ margin:"0 0 20px",fontSize:22,fontWeight:800,color:C.navy }}>🚨 Alerts</h1>
      {loading?<Loader/>:<>
        <div style={{ background:C.redBg,border:`1px solid #FECACA`,borderRadius:14,padding:20,marginBottom:20 }}>
          <div style={{ fontWeight:800,color:C.red,fontSize:16 }}>⚠️ {high.length} High Risk Patients Require Immediate Attention</div>
          <div style={{ color:"#92400E",fontSize:13,marginTop:4 }}>Please review and take necessary action.</div>
        </div>
        {high.map(p=>(
          <div key={p.patientId} style={{ background:C.white,border:`1px solid ${C.border}`,borderLeft:`4px solid ${C.red}`,borderRadius:12,padding:16,marginBottom:12 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:700,color:C.navy,fontSize:15 }}>{p.name} <span style={{ color:C.slate,fontSize:12 }}>({p.patientId})</span></div>
                <div style={{ color:C.slate,fontSize:13 }}>Dr: {p.doctor} • Ward: {p.ward}</div>
                <div style={{ color:C.slate,fontSize:13,marginTop:4 }}>📋 {p.diagnosis}</div>
              </div>
              <RiskBadge risk={p.risk}/>
            </div>
            {(p.riskFactors||[]).length>0 && (
              <div style={{ marginTop:10,display:"flex",gap:8,flexWrap:"wrap" }}>
                {p.riskFactors.map(r=>(<span key={r} style={{ background:C.redBg,color:C.red,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600 }}>{r}</span>))}
              </div>
            )}
          </div>
        ))}
        {alerts.length>0 && <>
          <h2 style={{ margin:"20px 0 12px",fontSize:16,fontWeight:700,color:C.navy }}>📜 Alert History</h2>
          {alerts.slice(0,10).map(a=>(
            <div key={a._id} style={{ background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:10 }}>
              <div style={{ fontWeight:600,color:C.navy }}>{a.patientName} <span style={{ fontWeight:400,color:C.slate,fontSize:12 }}>— {new Date(a.sentAt).toLocaleString()}</span></div>
              <div style={{ color:C.slate,fontSize:13,marginTop:4 }}>{a.message}</div>
              {a.confirmed&&<span style={{ fontSize:12,color:C.green,fontWeight:600 }}>✅ Confirmed</span>}
            </div>
          ))}
        </>}
      </>}
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
function ReportsPage({ patients, appointments, stats }) {
  const doctors = [...new Set(patients.map(p=>p.doctor).filter(Boolean))];
  return (
    <div style={{ flex:1,overflowY:"auto",padding:24,background:C.slateLight }}>
      <h1 style={{ margin:"0 0 20px",fontSize:22,fontWeight:800,color:C.navy }}>📊 Reports & Analytics</h1>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20 }}>
        {[["Total Patients",stats?.totalPatients||patients.length,C.blue,"👥"],
          ["High Risk",stats?.highRisk||0,C.red,"🔴"],
          ["Appointments",stats?.totalAppointments||appointments.length,C.green,"📅"],
          ["Doctors",doctors.length,C.purple,"👨‍⚕️"]].map(([l,v,col,ic])=>(
          <div key={l} style={{ background:C.white,borderRadius:14,padding:"20px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:28,marginBottom:8 }}>{ic}</div>
            <div style={{ fontSize:30,fontWeight:800,color:col }}>{v}</div>
            <div style={{ color:C.slate,fontSize:13,fontWeight:600 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.white,borderRadius:14,padding:20,marginBottom:16 }}>
        <div style={{ fontWeight:700,color:C.navy,marginBottom:14 }}>Risk Distribution</div>
        {[["High Risk",stats?.highRisk||0,C.red,C.redBg],["Medium Risk",stats?.mediumRisk||0,C.amber,C.amberBg],["Low Risk",stats?.lowRisk||0,C.green,C.greenBg]].map(([l,v,col,bg])=>{
          const total = patients.length||1;
          const pct = Math.round((v/total)*100);
          return (
            <div key={l} style={{ marginBottom:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                <span style={{ fontSize:13,fontWeight:600,color:col }}>{l}</span>
                <span style={{ fontSize:13,color:C.slate }}>{v} patients ({pct}%)</span>
              </div>
              <div style={{ height:10,background:bg,borderRadius:10 }}>
                <div style={{ height:"100%",width:`${pct}%`,background:col,borderRadius:10,transition:"width 0.5s" }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background:C.white,borderRadius:14,padding:20 }}>
        <div style={{ fontWeight:700,color:C.navy,marginBottom:14 }}>Patients by Doctor</div>
        {doctors.map(d=>{
          const count = patients.filter(p=>p.doctor===d).length;
          const pct = Math.round((count/patients.length)*100);
          return (
            <div key={d} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                <span style={{ fontSize:13,fontWeight:600,color:C.navy }}>{d}</span>
                <span style={{ fontSize:13,color:C.slate }}>{count} patients</span>
              </div>
              <div style={{ height:8,background:C.slateLight,borderRadius:10 }}>
                <div style={{ height:"100%",width:`${pct}%`,background:C.blue,borderRadius:10 }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const NAV = [
  { key:"Dashboard",    icon:"🏠",label:"Dashboard"    },
  { key:"Patients",     icon:"👥",label:"Patients"     },
  { key:"Alerts",       icon:"🚨",label:"Alerts"       },
  { key:"Appointments", icon:"📅",label:"Appointments" },
  { key:"Reports",      icon:"📊",label:"Reports"      },
];

export default function App() {
  const [page, setPage]             = useState("Dashboard");
  const [patients, setPatients]     = useState([]);
  const [appointments, setAppts]    = useState([]);
  const [alerts, setAlerts]         = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [selectedPid, setSelectedPid] = useState(null);
  const [toast, setToast]           = useState(null);
  const [notifPatient, setNotifPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddAppt,    setShowAddAppt]    = useState(false);
  const [editPatient,    setEditPatient]    = useState(null);

  const showToast = useCallback((msg, type="info") => setToast({ msg, type }), []);

  // ── FETCH ALL ──
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a, al, s] = await Promise.all([
        api.get("/patients"),
        api.get("/appointments"),
        api.get("/alerts"),
        api.get("/stats"),
      ]);
      if (!p.error) setPatients(p);
      if (!a.error) setAppts(a);
      if (!al.error) setAlerts(al);
      if (!s.error) setStats(s);
    } catch {
      showToast("Cannot connect to backend. Is server.js running?", "error");
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── CRUD PATIENTS ──
  const addPatient = async (data) => {
    const res = await api.post("/patients", data);
    if (res.error) { showToast(res.error,"error"); return; }
    showToast("Patient added successfully!","success");
    setShowAddPatient(false); fetchAll();
  };
  const updatePatient = async (data) => {
    const res = await api.put(`/patients/${data.patientId}`, data);
    if (res.error) { showToast(res.error,"error"); return; }
    showToast("Patient updated!","success");
    setEditPatient(null); fetchAll();
  };
  const deletePatient = async (patientId) => {
    if (!window.confirm("Delete this patient and all their appointments?")) return;
    await api.delete(`/patients/${patientId}`);
    showToast("Patient deleted.","success");
    setPage("Patients"); setSelectedPid(null); fetchAll();
  };

  // ── CRUD APPOINTMENTS ──
  const addAppt = async (data) => {
    const res = await api.post("/appointments", data);
    if (res.error) { showToast(res.error,"error"); return; }
    showToast("Appointment scheduled!","success");
    setShowAddAppt(false); fetchAll();
  };

  // ── SEND ALERT ──
  const sendAlert = async (patient) => {
    await api.post("/alerts", {
      patientId: patient.patientId,
      patientName: patient.name,
      message: `Please visit hospital within 3 days for follow-up checkup.`,
      risk: patient.risk,
    });
    setNotifPatient(patient);
    fetchAll();
  };

  const highCount = patients.filter(p=>p.risk==="High").length;
  const selectedPatient = patients.find(p=>p.patientId===selectedPid);

  const goNav = (key) => { setPage(key); setSelectedPid(null); };

  return (
    <div style={{ display:"flex",height:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden" }}>
      {/* Sidebar */}
      <aside style={{ width:210,background:C.navy,display:"flex",flexDirection:"column",flexShrink:0 }}>
        <div style={{ padding:"22px 20px 18px",borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:22 }}>💙</span>
            <span style={{ color:C.white,fontWeight:800,fontSize:20,letterSpacing:-0.5 }}>CareAI</span>
          </div>
          <div style={{ color:"#94A3B8",fontSize:11,marginTop:2 }}>MongoDB Powered</div>
        </div>
        <nav style={{ flex:1,padding:"14px 0" }}>
          {NAV.map(n=>{
            const active = page===n.key||(page==="PatientDetail"&&n.key==="Patients");
            return (
              <button key={n.key} onClick={()=>goNav(n.key)}
                style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 20px",
                  background:active?"#2563EB":"none",border:"none",
                  color:active?C.white:"#94A3B8",cursor:"pointer",fontSize:14,fontWeight:600,textAlign:"left",
                  borderRadius:active?"0 24px 24px 0":0,marginRight:active?12:0,transition:"all 0.15s" }}>
                <span style={{ fontSize:16 }}>{n.icon}</span>
                <span>{n.label}</span>
                {n.key==="Alerts"&&highCount>0&&(
                  <span style={{ marginLeft:"auto",background:C.red,color:C.white,borderRadius:10,fontSize:11,fontWeight:700,padding:"1px 7px" }}>{highCount}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:"14px 20px 20px",borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ color:C.white,fontSize:13,fontWeight:600 }}>👨‍⚕️ Dr. Admin</div>
          <div style={{ color:"#94A3B8",fontSize:11 }}>Hospital Administrator</div>
          <button onClick={fetchAll} style={{ marginTop:10,padding:"6px 0",width:"100%",background:"rgba(255,255,255,0.1)",color:"#94A3B8",border:"none",borderRadius:8,cursor:"pointer",fontSize:12 }}>
            🔄 Refresh
          </button>
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Top bar */}
        <div style={{ background:C.white,borderBottom:`1px solid ${C.border}`,padding:"12px 24px",
          display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
          <div style={{ fontWeight:700,color:C.navy,fontSize:15 }}>
            {page==="PatientDetail"&&selectedPatient?`Patient: ${selectedPatient.name}`:NAV.find(n=>n.key===page)?.label||page}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:16 }}>
            <span style={{ fontSize:11,background:"#DCFCE7",color:C.green,padding:"4px 10px",borderRadius:20,fontWeight:700 }}>● MongoDB Connected</span>
            <span style={{ fontSize:13,color:C.slate }}>📅 {new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</span>
            <div style={{ width:36,height:36,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",color:C.white,fontWeight:700,fontSize:14 }}>A</div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1,display:"flex",overflow:"hidden" }}>
          {page==="Dashboard"&&<DashboardPage patients={patients} stats={stats} loading={loading} onSelect={id=>{setSelectedPid(id);setPage("PatientDetail");}} onAddPatient={()=>setShowAddPatient(true)}/>}
          {page==="Patients"&&<PatientsPage patients={patients} loading={loading} onSelect={id=>{setSelectedPid(id);setPage("PatientDetail");}} onAdd={()=>setShowAddPatient(true)}/>}
          {page==="PatientDetail"&&selectedPid&&(
            <PatientDetail patientId={selectedPid} patients={patients} appointments={appointments}
              onBack={()=>{setPage("Patients");setSelectedPid(null);}}
              onSendAlert={()=>sendAlert(selectedPatient)}
              onSchedule={()=>setShowAddAppt(true)}
              onEdit={()=>setEditPatient(selectedPatient)}
              onDelete={()=>deletePatient(selectedPid)}
              toast={showToast}/>
          )}
          {page==="Alerts"&&<AlertsPage patients={patients} alerts={alerts} loading={loading}/>}
          {page==="Appointments"&&<AppointmentsPage appointments={appointments} patients={patients} loading={loading} onAdd={()=>setShowAddAppt(true)}/>}
          {page==="Reports"&&<ReportsPage patients={patients} appointments={appointments} stats={stats}/>}
        </div>
      </div>

      {/* Modals */}
      {notifPatient&&<NotifModal patient={notifPatient} onClose={()=>setNotifPatient(null)} onConfirm={()=>setNotifPatient(null)}/>}
      {showAddPatient&&<PatientForm title="Add New Patient" onSave={addPatient} onClose={()=>setShowAddPatient(false)}/>}
      {editPatient&&<PatientForm title={`Edit: ${editPatient.name}`} initial={editPatient} onSave={updatePatient} onClose={()=>setEditPatient(null)}/>}
      {showAddAppt&&<ApptForm patients={patients} title="Schedule Appointment" onSave={addAppt} onClose={()=>setShowAddAppt(false)}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}