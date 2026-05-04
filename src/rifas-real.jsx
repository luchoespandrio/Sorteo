import { useState, useEffect, useCallback } from "react";
 
const YELLOW  = "#FFD700";
const YELLOW2 = "#F0B90B";
const BG      = "#0a0a0f";
 
// ─── DB en localStorage ────────────────────────────────────────────────────────
// Todo el estado vive en localStorage para que sea compartido entre sesiones
const DB_KEY = "rifasreal_db_v2";
 
const USERS_INIT = [
  {id:1, username:"admin",    password:"admin", credits:12430,isAdmin:true, name:"Admin",        avatar:"👑"},
  {id:2, username:"juanperez",password:"1234",  credits:500,  isAdmin:false,name:"Juan Pérez",   avatar:"🎯"},
  {id:3, username:"maria",    password:"1234",  credits:350,  isAdmin:false,name:"María García", avatar:"🌟"},
  {id:4, username:"carlos",   password:"1234",  credits:600,  isAdmin:false,name:"Carlos López", avatar:"💎"},
  {id:5, username:"ana",      password:"1234",  credits:200,  isAdmin:false,name:"Ana Torres",   avatar:"🎪"},
  {id:6, username:"pablo",    password:"1234",  credits:450,  isAdmin:false,name:"Pablo Ruiz",   avatar:"🔥"},
  {id:7, username:"lucia",    password:"1234",  credits:320,  isAdmin:false,name:"Lucía Soto",   avatar:"⚡"},
  {id:8, username:"diego",    password:"1234",  credits:750,  isAdmin:false,name:"Diego Silva",  avatar:"🎭"},
  {id:9, username:"sofia",    password:"1234",  credits:410,  isAdmin:false,name:"Sofía Pérez",  avatar:"🃏"},
  {id:10,username:"marcos",   password:"1234",  credits:290,  isAdmin:false,name:"Marcos Díaz",  avatar:"🎲"},
];
 
const RIFAS_INIT = [
  {
    id:1, name:"Moto 0KM", subtitle:"Yamaha FZ 150cc 0km",
    icon:"🏍️", pricePerNumber:150, prize:"$150,000", totalNumbers:100,
    status:"active", numbers:{}, winner:null
  },
  {
    id:2, name:'Smart TV 50"', subtitle:'Samsung 50" 4K UHD',
    icon:"📺", pricePerNumber:80, prize:"$80,000", totalNumbers:50,
    status:"active", numbers:{}, winner:null
  },
  {
    id:3, name:"Celular iPhone 15", subtitle:"iPhone 15 128Gb",
    icon:"📱", pricePerNumber:100, prize:"$100,000", totalNumbers:75,
    status:"active", numbers:{}, winner:null
  },
  {
    id:4, name:"Orden de Compra", subtitle:"$50,000 en compras libres",
    icon:"🛍️", pricePerNumber:40, prize:"$50,000", totalNumbers:30,
    status:"active", numbers:{}, winner:null
  },
];
 
function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  const initial = { users: USERS_INIT, rifas: RIFAS_INIT, creditRequests: [] };
  localStorage.setItem(DB_KEY, JSON.stringify(initial));
  return initial;
}
 
function saveDB(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch(e) {}
}
 
// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({notif}){
  if(!notif) return null;
  const c={success:"#00C853",error:"#FF3D00",warn:YELLOW,info:"#4ECDC4"}[notif.type]||"#4ECDC4";
  return(
    <div style={{position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",
      background:"#1a1a24",border:`1px solid ${c}`,borderRadius:8,color:"#fff",
      fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,
      display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 20px rgba(0,0,0,.5)"}}>
      <span style={{color:c}}>{notif.type==="success"?"✓":notif.type==="error"?"✗":"!"}</span>
      {notif.msg}
    </div>
  );
}
 
// ─── Header ────────────────────────────────────────────────────────────────────
function Header({currentUser, onLogout, onProfile, onLobby, onHowItWorks}){
  return(
    <header style={{background:"#0d0d14",borderBottom:"1px solid rgba(255,215,0,.15)",
      padding:"0 24px",height:60,display:"flex",alignItems:"center",
      justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={onLobby}>
        <span style={{fontSize:22}}>👑</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:900,color:YELLOW,letterSpacing:3}}>RIFAS</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:400,color:"#fff",letterSpacing:3}}>REAL</span>
      </div>
      <nav style={{display:"flex",gap:4,alignItems:"center"}}>
        {[["Rifas",onLobby],["Mis Jugadas",onProfile],["Cómo funciona",onHowItWorks]].map(([label,fn])=>(
          <button key={label} onClick={fn} style={{background:"transparent",border:"none",
            color:"rgba(255,255,255,.6)",cursor:"pointer",fontSize:13,letterSpacing:.5,
            padding:"6px 12px",borderRadius:6,fontFamily:"'Barlow Condensed',sans-serif"}}
          onMouseEnter={e=>e.currentTarget.style.color="#fff"}
          onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.6)"}>
            {label}
          </button>
        ))}
      </nav>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,215,0,.1)",
          border:"1px solid rgba(255,215,0,.3)",borderRadius:20,padding:"4px 12px"}}>
          <span style={{color:YELLOW,fontWeight:700,fontSize:15}}>{currentUser.credits.toLocaleString()}</span>
          <span style={{color:"rgba(255,255,255,.4)",fontSize:12}}>cr.</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}} onClick={onProfile}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,215,0,.12)",
            border:"1px solid rgba(255,215,0,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
            {currentUser.avatar}
          </div>
          <span style={{color:"rgba(255,255,255,.7)",fontSize:13}}>{currentUser.name}</span>
        </div>
        <button onClick={onLogout} style={{background:"transparent",border:"1px solid rgba(255,100,100,.3)",
          color:"#FF6464",padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:12,
          fontFamily:"'Barlow Condensed',sans-serif"}}>Salir</button>
      </div>
    </header>
  );
}
 
// ─── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({form, setForm, onLogin, error}){
  return(
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",
      justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,opacity:.03,
        backgroundImage:"linear-gradient(rgba(255,215,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,1) 1px,transparent 1px)",
        backgroundSize:"50px 50px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:600,height:600,background:"radial-gradient(circle,rgba(255,215,0,.05) 0%,transparent 65%)",
        borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{width:"min(380px,90vw)",background:"#0d0d14",border:"1px solid rgba(255,215,0,.22)",
        borderRadius:16,padding:"44px 36px",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
        <div style={{marginBottom:28}}>
          <div style={{fontSize:36,marginBottom:8}}>👑</div>
          <div>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:900,color:YELLOW,letterSpacing:4}}>RIFAS</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:400,color:"#fff",letterSpacing:4}}> REAL</span>
          </div>
          <p style={{color:"rgba(255,255,255,.3)",fontSize:11,letterSpacing:4,marginTop:4,textTransform:"uppercase"}}>Sistema de Rifas</p>
        </div>
        {[
          {key:"username",label:"USUARIO",   type:"text",    placeholder:"Ingresá tu usuario",    icon:"👤"},
          {key:"password",label:"CONTRASEÑA",type:"password",placeholder:"Ingresá tu contraseña", icon:"🔒"},
        ].map(f=>(
          <div key={f.key} style={{marginBottom:14,textAlign:"left"}}>
            <label style={{color:"rgba(255,255,255,.5)",fontSize:11,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:6}}>{f.label}</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,.3)",fontSize:14}}>{f.icon}</span>
              <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&onLogin()} placeholder={f.placeholder}
                style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",
                  borderRadius:8,padding:"11px 12px 11px 36px",color:"#fff",fontSize:14,outline:"none",
                  fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,boxSizing:"border-box"}}/>
            </div>
          </div>
        ))}
        {error && <p style={{color:"#FF6464",fontSize:13,marginBottom:14}}>⚠ {error}</p>}
        <button onClick={onLogin} style={{width:"100%",padding:"13px",
          background:`linear-gradient(135deg,${YELLOW2},${YELLOW})`,border:"none",borderRadius:8,
          color:"#000",fontSize:14,fontWeight:700,letterSpacing:2,cursor:"pointer",
          fontFamily:"'Cinzel',serif",textTransform:"uppercase",marginBottom:16}}>
          INGRESAR
        </button>
        <div style={{background:"rgba(255,255,255,.025)",borderRadius:8,padding:"10px 14px",border:"1px solid rgba(255,255,255,.06)"}}>
          <p style={{color:"rgba(255,255,255,.25)",fontSize:11,lineHeight:1.9}}>
            Admin: <span style={{color:"rgba(255,215,0,.6)"}}>admin / admin</span><br/>
            Jugadores: <span style={{color:"rgba(255,215,0,.6)"}}>juanperez / 1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
 
// ─── Cómo funciona ─────────────────────────────────────────────────────────────
function HowItWorksView({currentUser, onBack, onLogout, onProfile, onLobby}){
  const steps = [
    {
      icon:"💰", title:"1. Conseguí créditos",
      desc:"Los créditos son la moneda del sistema. Podés solicitarlos al administrador desde tu perfil. Una vez aprobada tu solicitud, se acreditarán automáticamente en tu cuenta y los verás reflejados en el balance superior.",
      color:"#4ECDC4"
    },
    {
      icon:"🎫", title:"2. Elegí una rifa",
      desc:"Explorá las rifas disponibles en el lobby. Cada rifa tiene un precio por número, un premio y una cantidad limitada de boletos. Hacé click en 'Elegir números' para ver el tablero de números disponibles.",
      color:YELLOW
    },
    {
      icon:"🔢", title:"3. Seleccioná tus números",
      desc:"En el tablero de la rifa podés ver en tiempo real qué números están disponibles, reservados o vendidos. Elegí uno o más números disponibles y confirmá tu jugada. Los créditos se descuentan automáticamente.",
      color:"#00C853"
    },
    {
      icon:"🏆", title:"4. El sorteo es automático",
      desc:"¡No hay fecha de sorteo fija! El sorteo se realiza automáticamente en el momento en que se venden todos los números de una rifa. El ganador se elige al azar entre todos los participantes y se anuncia de inmediato.",
      color:"#FF8C00"
    },
    {
      icon:"📊", title:"5. Seguí tus jugadas",
      desc:"En la sección 'Mis Jugadas' podés ver todas las rifas en las que participás, cuántos números tenés en cada una, el monto invertido y el estado actual del sorteo.",
      color:"#FF6464"
    },
  ];
 
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Barlow Condensed',sans-serif"}}>
      <Header currentUser={currentUser} onLogout={onLogout} onProfile={onProfile} onLobby={onLobby} onHowItWorks={()=>{}}/>
      <main style={{maxWidth:800,margin:"0 auto",padding:"40px 24px"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <h1 style={{fontFamily:"'Cinzel',serif",fontSize:30,fontWeight:900,color:"#fff",marginBottom:8}}>¿Cómo funciona?</h1>
          <p style={{color:"rgba(255,255,255,.38)",fontSize:15}}>Todo lo que necesitás saber para participar en RIFAS REAL</p>
        </div>
 
        <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:40}}>
          {steps.map(step=>(
            <div key={step.title} style={{background:"#0d0d14",border:`1px solid ${step.color}22`,borderRadius:12,
              padding:"20px 24px",display:"flex",gap:20,alignItems:"flex-start"}}>
              <div style={{width:52,height:52,borderRadius:12,background:`${step.color}14`,
                border:`1px solid ${step.color}33`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:26,flexShrink:0}}>
                {step.icon}
              </div>
              <div>
                <h3 style={{fontFamily:"'Cinzel',serif",color:step.color,fontSize:16,fontWeight:700,marginBottom:6}}>{step.title}</h3>
                <p style={{color:"rgba(255,255,255,.55)",fontSize:14,lineHeight:1.6}}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
 
        <div style={{background:"rgba(255,215,0,.05)",border:"1px solid rgba(255,215,0,.18)",borderRadius:12,padding:"24px"}}>
          <h3 style={{fontFamily:"'Cinzel',serif",color:YELLOW,fontSize:16,fontWeight:700,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span>💡</span> Estados de los números
          </h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
            {[
              {color:"rgba(255,255,255,.06)",border:"rgba(255,255,255,.1)",textColor:"rgba(255,255,255,.7)",label:"Disponible",desc:"Libre para comprar"},
              {color:"rgba(255,215,0,.18)",border:"rgba(255,215,0,.55)",textColor:YELLOW,label:"Seleccionado",desc:"Lo elegiste vos, pendiente de confirmar"},
              {color:"rgba(0,200,83,.14)",border:"rgba(0,200,83,.38)",textColor:"#00C853",label:"Tuyo",desc:"Ya lo compraste"},
              {color:"rgba(255,140,0,.13)",border:"rgba(255,140,0,.28)",textColor:"#FF8C00",label:"Reservado",desc:"Comprado por otro jugador"},
              {color:"rgba(255,50,50,.1)",border:"rgba(255,50,50,.18)",textColor:"rgba(255,100,100,.5)",label:"Vendido",desc:"Vendido y confirmado"},
            ].map(s=>(
              <div key={s.label} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",
                background:"rgba(255,255,255,.02)",borderRadius:8}}>
                <div style={{width:28,height:28,borderRadius:5,background:s.color,border:`1px solid ${s.border}`,
                  display:"flex",alignItems:"center",justifyContent:"center",color:s.textColor,fontSize:11,fontWeight:700,flexShrink:0}}>00</div>
                <div>
                  <p style={{color:"#fff",fontSize:12,fontWeight:600}}>{s.label}</p>
                  <p style={{color:"rgba(255,255,255,.35)",fontSize:11}}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        <div style={{marginTop:20,background:"rgba(78,205,196,.05)",border:"1px solid rgba(78,205,196,.18)",borderRadius:12,padding:"20px 24px"}}>
          <h3 style={{fontFamily:"'Cinzel',serif",color:"#4ECDC4",fontSize:15,fontWeight:700,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            <span>🙋</span> Solicitar créditos
          </h3>
          <p style={{color:"rgba(255,255,255,.55)",fontSize:14,lineHeight:1.6}}>
            Si no tenés créditos suficientes para participar, podés enviar una solicitud al administrador desde la sección <strong style={{color:"#fff"}}>"Mis Jugadas"</strong>. 
            El admin la verá en su panel y puede aprobarla o rechazarla. Si la aprueba, los créditos se suman automáticamente a tu cuenta.
          </p>
        </div>
 
        <div style={{textAlign:"center",marginTop:28}}>
          <button onClick={onBack} style={{background:`linear-gradient(135deg,${YELLOW2},${YELLOW})`,border:"none",
            borderRadius:8,padding:"12px 32px",color:"#000",fontSize:13,fontWeight:700,
            cursor:"pointer",fontFamily:"'Cinzel',serif",letterSpacing:1,textTransform:"uppercase"}}>
            ¡Quiero participar!
          </button>
        </div>
      </main>
    </div>
  );
}
 
// ─── Rifa Card ─────────────────────────────────────────────────────────────────
function RifaCard({rifa, currentUser, onSelect, delay}){
  const total    = rifa.totalNumbers || 100;
  const sold     = Object.values(rifa.numbers).filter(n=>n.status==="vendido"||n.status==="reservado").length;
  const pct      = Math.round(sold / total * 100);
  const myNums   = Object.entries(rifa.numbers).filter(([,v])=>v.userId===currentUser.id);
  const isFinished = rifa.status === "finished";
 
  return(
    <div onClick={()=>!isFinished&&onSelect(rifa)} style={{
      background:"#0d0d14",border:`1px solid ${isFinished?"rgba(255,215,0,.25)":"rgba(255,255,255,.08)"}`,borderRadius:12,
      overflow:"hidden",cursor:isFinished?"default":"pointer",transition:"transform .2s,box-shadow .2s",
      opacity:isFinished?.75:1}}
    onMouseEnter={e=>{if(!isFinished){e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 12px 40px rgba(255,215,0,.1)`;e.currentTarget.style.borderColor="rgba(255,215,0,.2)";}}}
    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=isFinished?"rgba(255,215,0,.25)":"rgba(255,255,255,.08)";}}>
      <div style={{height:130,background:isFinished?"linear-gradient(135deg,#1a1408,#111)":"linear-gradient(135deg,#1a1a28,#111)",
        display:"flex",alignItems:"center",justifyContent:"center",
        borderBottom:"1px solid rgba(255,255,255,.05)",position:"relative"}}>
        <span style={{fontSize:60}}>{rifa.icon}</span>
        {isFinished && (
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{background:"rgba(255,215,0,.9)",borderRadius:8,padding:"6px 16px",
              fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:13,color:"#000",letterSpacing:1}}>
              🏆 SORTEADA
            </div>
          </div>
        )}
        <div style={{position:"absolute",top:10,right:10,background:"rgba(255,215,0,.12)",
          border:"1px solid rgba(255,215,0,.35)",borderRadius:16,padding:"3px 10px",color:YELLOW,fontSize:12,fontWeight:700}}>
          {rifa.pricePerNumber} cr.
        </div>
        {myNums.length>0 && (
          <div style={{position:"absolute",top:10,left:10,background:"rgba(0,200,83,.12)",
            border:"1px solid rgba(0,200,83,.35)",borderRadius:16,padding:"3px 10px",color:"#00C853",fontSize:11}}>
            ✓ {myNums.length} núm.
          </div>
        )}
      </div>
      <div style={{padding:"14px 16px"}}>
        <h3 style={{fontFamily:"'Cinzel',serif",color:"#fff",fontSize:15,fontWeight:700,marginBottom:2}}>{rifa.name}</h3>
        <p style={{color:"rgba(255,255,255,.38)",fontSize:12,marginBottom:12}}>{rifa.subtitle}</p>
        {isFinished && rifa.winner && (
          <div style={{background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.2)",borderRadius:8,
            padding:"8px 12px",marginBottom:10,textAlign:"center"}}>
            <p style={{color:"rgba(255,255,255,.4)",fontSize:10,textTransform:"uppercase",letterSpacing:1}}>Ganador · Nro {rifa.winner.number}</p>
            <p style={{color:YELLOW,fontWeight:700,fontSize:14}}>{rifa.winner.name}</p>
          </div>
        )}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{color:"rgba(255,255,255,.38)",fontSize:11}}>{sold}/{total} números</span>
            <span style={{color:YELLOW,fontSize:11,fontWeight:600}}>{pct}%</span>
          </div>
          <div style={{height:4,background:"rgba(255,255,255,.07)",borderRadius:2}}>
            <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${YELLOW2},${YELLOW})`,borderRadius:2}}/>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{color:"rgba(255,255,255,.28)",fontSize:10,letterSpacing:1,textTransform:"uppercase"}}>Premio</p>
            <p style={{color:"#fff",fontSize:14,fontWeight:600}}>{rifa.prize}</p>
          </div>
          {!isFinished && (
            <button style={{background:`linear-gradient(135deg,${YELLOW2},${YELLOW})`,border:"none",
              borderRadius:7,padding:"8px 16px",color:"#000",fontSize:12,fontWeight:700,
              cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,pointerEvents:"none"}}>
              Elegir números
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
 
// ─── Lobby ─────────────────────────────────────────────────────────────────────
function GameLobby({currentUser, rifas, onSelectRifa, onLogout, onProfile, onAdmin, onHowItWorks}){
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todas");
  const filtered = rifas.filter(r=>{
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="todas" || (filter==="active" && r.status==="active") || (filter==="finished" && r.status==="finished");
    return matchSearch && matchFilter;
  });
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Barlow Condensed',sans-serif"}}>
      <Header currentUser={currentUser} onLogout={onLogout} onProfile={onProfile} onLobby={()=>{}} onHowItWorks={onHowItWorks}/>
      <main style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{marginBottom:24}}>
          <h1 style={{fontFamily:"'Cinzel',serif",fontSize:26,fontWeight:900,color:"#fff",marginBottom:4}}>Rifas Disponibles</h1>
          <p style={{color:"rgba(255,255,255,.35)",fontSize:14}}>Elegí tu favorita y participá con increíbles premios</p>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:24}}>
          <div style={{flex:1,position:"relative"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,.3)",fontSize:14}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar rifa..."
              style={{width:"100%",background:"#0d0d14",border:"1px solid rgba(255,255,255,.09)",
                borderRadius:8,padding:"10px 12px 10px 36px",color:"#fff",fontSize:14,outline:"none",
                fontFamily:"'Barlow Condensed',sans-serif",boxSizing:"border-box"}}/>
          </div>
          <select value={filter} onChange={e=>setFilter(e.target.value)}
            style={{background:"#0d0d14",border:"1px solid rgba(255,255,255,.09)",borderRadius:8,
              padding:"10px 16px",color:"rgba(255,255,255,.5)",fontSize:13,outline:"none",cursor:"pointer",
              fontFamily:"'Barlow Condensed',sans-serif"}}>
            <option value="todas">Todas las rifas</option>
            <option value="active">Activas</option>
            <option value="finished">Sorteadas</option>
          </select>
          {currentUser.isAdmin && (
            <button onClick={onAdmin} style={{background:"rgba(78,205,196,.08)",border:"1px solid rgba(78,205,196,.25)",
              color:"#4ECDC4",borderRadius:8,padding:"10px 18px",cursor:"pointer",fontSize:13,
              fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
              ⚙ Admin
            </button>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:18}}>
          {filtered.map((rifa,i)=>(
            <RifaCard key={rifa.id} rifa={rifa} currentUser={currentUser} onSelect={onSelectRifa} delay={i*.07}/>
          ))}
        </div>
      </main>
    </div>
  );
}
 
// ─── Number Grid ──────────────────────────────────────────────────────────────
const NUM_COLORS = {
  disponible:{bg:"rgba(255,255,255,.06)",  color:"rgba(255,255,255,.7)", border:"rgba(255,255,255,.1)"},
  selected:  {bg:"rgba(255,215,0,.18)",    color:YELLOW,                 border:"rgba(255,215,0,.55)"},
  mine:      {bg:"rgba(0,200,83,.14)",     color:"#00C853",              border:"rgba(0,200,83,.38)"},
  reservado: {bg:"rgba(255,140,0,.13)",    color:"#FF8C00",              border:"rgba(255,140,0,.28)"},
  vendido:   {bg:"rgba(255,50,50,.1)",     color:"rgba(255,100,100,.5)", border:"rgba(255,50,50,.18)"},
};
 
function StatRow({label,value,highlight,dim}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{color:"rgba(255,255,255,.38)",fontSize:12}}>{label}</span>
      <span style={{color:highlight?YELLOW:dim?"rgba(255,255,255,.28)":"#fff",fontWeight:highlight?700:500,fontSize:13}}>
        {value}
      </span>
    </div>
  );
}
 
function NumberGrid({rifa, currentUser, onConfirm, onBack}){
  const [selected, setSelected] = useState([]);
  const total    = rifa.totalNumbers || 100;
 
  // Generamos el pad según totalNumbers
  const padLen = total >= 100 ? 2 : total >= 10 ? 2 : 1;
  const pad = (i) => i.toString().padStart(padLen, "0");
 
  const getStatus = (i) => {
    const p = pad(i);
    if(selected.includes(p)) return "selected";
    const e = rifa.numbers[p];
    if(!e) return "disponible";
    if(e.userId===currentUser.id) return "mine";
    return e.status;
  };
 
  const toggle = (i) => {
    const p = pad(i);
    const st = getStatus(i);
    if(st==="vendido"||st==="reservado"||st==="mine") return;
    setSelected(prev=>prev.includes(p)?prev.filter(n=>n!==p):[...prev,p]);
  };
 
  const cost = selected.length * rifa.pricePerNumber;
  const canAfford = currentUser.credits >= cost;
 
  // Columnas responsivas según cantidad de números
  const cols = total <= 20 ? 5 : total <= 50 ? 10 : 10;
 
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Barlow Condensed',sans-serif"}}>
      <Header currentUser={currentUser} onLogout={()=>{}} onProfile={()=>{}} onLobby={onBack} onHowItWorks={()=>{}}/>
      <main style={{maxWidth:1100,margin:"0 auto",padding:"24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",
            color:"rgba(255,255,255,.6)",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:13,
            fontFamily:"'Barlow Condensed',sans-serif"}}>← Volver</button>
          <div>
            <h2 style={{fontFamily:"'Cinzel',serif",color:"#fff",fontSize:20,fontWeight:700}}>{rifa.name}</h2>
            <p style={{color:"rgba(255,255,255,.38)",fontSize:13}}>{rifa.subtitle} · Premio: {rifa.prize} · {total} números en juego</p>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,
            background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.28)",borderRadius:20,padding:"5px 14px"}}>
            <span style={{color:YELLOW,fontWeight:700}}>{currentUser.credits.toLocaleString()}</span>
            <span style={{color:"rgba(255,255,255,.38)",fontSize:12}}>cr.</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:20}}>
          <div style={{background:"#0d0d14",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"20px"}}>
            <h3 style={{color:"rgba(255,255,255,.45)",fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>
              Seleccioná tus números ({total} disponibles)
            </h3>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:5,marginBottom:18}}>
              {Array.from({length:total},(_,i)=>{
                const st = getStatus(i);
                const c  = NUM_COLORS[st];
                const clickable = st==="disponible"||st==="selected";
                return(
                  <div key={i} onClick={()=>toggle(i)} style={{
                    aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",
                    background:c.bg,border:`1px solid ${c.border}`,borderRadius:6,
                    color:c.color,fontSize:11,fontWeight:600,
                    cursor:clickable?"pointer":"default",transition:"transform .12s",
                    textDecoration:st==="vendido"?"line-through":"none",
                  }}
                  onMouseEnter={e=>{if(clickable)e.currentTarget.style.transform="scale(1.12)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}>
                    {pad(i)}
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              {[
                {st:"disponible",label:"Disponible"},
                {st:"selected",  label:"Seleccionado"},
                {st:"mine",      label:"Tuyo"},
                {st:"reservado", label:"Reservado"},
                {st:"vendido",   label:"Vendido"},
              ].map(l=>(
                <div key={l.label} style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:13,height:13,borderRadius:3,background:NUM_COLORS[l.st].bg,border:`1px solid ${NUM_COLORS[l.st].border}`}}/>
                  <span style={{color:"rgba(255,255,255,.4)",fontSize:11}}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:"#0d0d14",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"18px"}}>
              <h4 style={{color:"rgba(255,255,255,.38)",fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Tu selección</h4>
              {selected.length===0?(
                <p style={{color:"rgba(255,255,255,.18)",fontSize:13,textAlign:"center",padding:"16px 0"}}>Hacé click en los números</p>
              ):(
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
                  {[...selected].sort().map(n=>(
                    <span key={n} onClick={()=>setSelected(prev=>prev.filter(x=>x!==n))} title="Click para quitar"
                      style={{background:"rgba(255,215,0,.12)",border:"1px solid rgba(255,215,0,.35)",
                        borderRadius:5,padding:"3px 9px",color:YELLOW,fontSize:13,fontWeight:600,cursor:"pointer"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,50,50,.12)";e.currentTarget.style.color="#FF6464";e.currentTarget.style.borderColor="rgba(255,50,50,.35)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,215,0,.12)";e.currentTarget.style.color=YELLOW;e.currentTarget.style.borderColor="rgba(255,215,0,.35)";}}>
                      {n}
                    </span>
                  ))}
                </div>
              )}
              <div style={{borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:12,display:"flex",flexDirection:"column",gap:7}}>
                <StatRow label="Costo por número"     value={`${rifa.pricePerNumber} cr.`}/>
                <StatRow label="Cantidad de números"  value={selected.length}/>
                <StatRow label="Total a pagar"        value={`${cost} cr.`} highlight/>
                <StatRow label="Créditos disponibles" value={`${currentUser.credits} cr.`} dim/>
              </div>
            </div>
            <button onClick={()=>selected.length>0&&canAfford&&onConfirm(selected)} style={{
              padding:"14px",borderRadius:10,fontSize:14,fontWeight:700,letterSpacing:2,
              textTransform:"uppercase",fontFamily:"'Cinzel',serif",
              cursor:selected.length>0&&canAfford?"pointer":"not-allowed",
              background:selected.length>0&&canAfford?`linear-gradient(135deg,${YELLOW2},${YELLOW})`:"rgba(255,255,255,.04)",
              border:selected.length>0&&canAfford?"none":"1px solid rgba(255,255,255,.08)",
              color:selected.length>0&&canAfford?"#000":"rgba(255,255,255,.2)",
              opacity:selected.length>0?1:.6,transition:"all .2s"}}>
              {selected.length>0?"Confirmar jugada":"Seleccioná números"}
            </button>
            {selected.length>0 && !canAfford && (
              <p style={{color:"#FF6464",fontSize:12,textAlign:"center"}}>⚠ Créditos insuficientes</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
 
// ─── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({rifa, numbers, currentUser, onConfirm, onCancel}){
  const total     = numbers.length * rifa.pricePerNumber;
  const canAfford = currentUser.credits >= total;
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.85)",
      backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:"'Barlow Condensed',sans-serif",padding:20}}>
      <div style={{width:"min(420px,100%)",background:"#0d0d14",border:"1px solid rgba(255,215,0,.2)",
        borderRadius:16,padding:"32px",boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(0,200,83,.1)",
            border:"1px solid rgba(0,200,83,.3)",display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:26,margin:"0 auto 12px"}}>✅</div>
          <h2 style={{fontFamily:"'Cinzel',serif",color:"#fff",fontSize:20,fontWeight:700}}>Confirmá tu jugada</h2>
          <p style={{color:"rgba(255,255,255,.38)",fontSize:13,marginTop:4}}>Revisá los detalles antes de confirmar</p>
        </div>
        <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",
          borderRadius:10,padding:"12px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:28}}>{rifa.icon}</span>
          <div>
            <p style={{color:"#fff",fontSize:14,fontWeight:600}}>{rifa.name}</p>
            <p style={{color:"rgba(255,255,255,.38)",fontSize:12}}>{rifa.subtitle}</p>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <p style={{color:"rgba(255,255,255,.38)",fontSize:11,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Números seleccionados</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {[...numbers].sort().map(n=>(
              <span key={n} style={{background:"rgba(255,215,0,.12)",border:"1px solid rgba(255,215,0,.3)",
                borderRadius:5,padding:"3px 9px",color:YELLOW,fontSize:13,fontWeight:600}}>{n}</span>
            ))}
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",
          borderRadius:10,padding:"12px",marginBottom:18,display:"flex",flexDirection:"column",gap:7}}>
          <StatRow label="Cantidad de números" value={numbers.length}/>
          <div style={{height:1,background:"rgba(255,255,255,.05)"}}/>
          <StatRow label="Costo por número"    value={`${rifa.pricePerNumber} cr.`}/>
          <div style={{height:1,background:"rgba(255,255,255,.05)"}}/>
          <StatRow label="Total a pagar"       value={`${total} cr.`} highlight/>
        </div>
        {!canAfford && <p style={{color:"#FF6464",fontSize:13,textAlign:"center",marginBottom:12}}>⚠ No tenés créditos suficientes</p>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"11px",background:"rgba(255,255,255,.04)",
            border:"1px solid rgba(255,255,255,.09)",borderRadius:8,color:"rgba(255,255,255,.5)",
            fontSize:13,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>Cancelar</button>
          <button onClick={canAfford?onConfirm:undefined} style={{flex:2,padding:"11px",
            background:canAfford?`linear-gradient(135deg,${YELLOW2},${YELLOW})`:"rgba(255,255,255,.04)",
            border:canAfford?"none":"1px solid rgba(255,255,255,.08)",borderRadius:8,
            color:canAfford?"#000":"rgba(255,255,255,.2)",fontSize:13,fontWeight:700,
            cursor:canAfford?"pointer":"not-allowed",fontFamily:"'Cinzel',serif",letterSpacing:1,
            textTransform:"uppercase"}}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
 
// ─── Winner Modal ──────────────────────────────────────────────────────────────
function WinnerModal({winner, rifa, onClose}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,.92)",
      backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:"'Barlow Condensed',sans-serif",padding:20}}>
      <div style={{width:"min(460px,100%)",background:"#0d0d14",border:"2px solid rgba(255,215,0,.5)",
        borderRadius:20,padding:"40px 32px",boxShadow:"0 0 60px rgba(255,215,0,.15)",textAlign:"center"}}>
        <div style={{fontSize:60,marginBottom:12}}>🏆</div>
        <h2 style={{fontFamily:"'Cinzel',serif",color:YELLOW,fontSize:24,fontWeight:900,marginBottom:4}}>¡TENEMOS GANADOR!</h2>
        <p style={{color:"rgba(255,255,255,.38)",fontSize:14,marginBottom:24}}>El sorteo de <strong style={{color:"#fff"}}>{rifa.name}</strong> finalizó</p>
        <div style={{background:"rgba(255,215,0,.07)",border:"1px solid rgba(255,215,0,.25)",borderRadius:12,padding:"20px",marginBottom:24}}>
          <p style={{color:"rgba(255,255,255,.4)",fontSize:11,textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>Número ganador</p>
          <div style={{fontSize:48,fontWeight:900,color:YELLOW,fontFamily:"'Cinzel',serif",marginBottom:10}}>{winner.number}</div>
          <p style={{color:"rgba(255,255,255,.4)",fontSize:11,textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>Ganador</p>
          <p style={{color:"#fff",fontSize:20,fontWeight:700}}>{winner.name}</p>
          <p style={{color:YELLOW,fontSize:14,marginTop:6}}>Premio: {rifa.prize}</p>
        </div>
        <button onClick={onClose} style={{background:`linear-gradient(135deg,${YELLOW2},${YELLOW})`,border:"none",
          borderRadius:8,padding:"12px 32px",color:"#000",fontSize:14,fontWeight:700,
          cursor:"pointer",fontFamily:"'Cinzel',serif",letterSpacing:1,textTransform:"uppercase"}}>
          ¡Felicitaciones!
        </button>
      </div>
    </div>
  );
}
 
// ─── Profile / Mis Jugadas ─────────────────────────────────────────────────────
function ProfileView({currentUser, rifas, creditRequests, onBack, onLogout, onHowItWorks, onRequestCredit}){
  const [tab, setTab] = useState("todas");
  const jugadas = rifas.flatMap(rifa=>{
    const myNums = Object.entries(rifa.numbers).filter(([,v])=>v.userId===currentUser.id).map(([n])=>n);
    if(!myNums.length) return [];
    return [{rifaId:rifa.id,rifaName:rifa.name,rifaIcon:rifa.icon,
      numbers:myNums,amount:myNums.length*rifa.pricePerNumber,
      status:rifa.status, winner:rifa.winner}];
  });
  const filtered = tab==="todas"?jugadas:jugadas.filter(j=>j.status===tab);
 
  // Mis solicitudes de crédito
  const myRequests = creditRequests.filter(r=>r.userId===currentUser.id);
 
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Barlow Condensed',sans-serif"}}>
      <Header currentUser={currentUser} onLogout={onLogout} onProfile={()=>{}} onLobby={onBack} onHowItWorks={onHowItWorks}/>
      <main style={{maxWidth:900,margin:"0 auto",padding:"28px 24px"}}>
        <div style={{background:"#0d0d14",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,
          padding:"18px 22px",marginBottom:22,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(255,215,0,.08)",
            border:"2px solid rgba(255,215,0,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
            {currentUser.avatar}
          </div>
          <div style={{flex:1}}>
            <h2 style={{fontFamily:"'Cinzel',serif",color:"#fff",fontSize:17,fontWeight:700}}>{currentUser.name}</h2>
            <p style={{color:"rgba(255,255,255,.38)",fontSize:13}}>jugador#{currentUser.id}</p>
          </div>
          <div style={{textAlign:"right",marginRight:16}}>
            <p style={{color:"rgba(255,255,255,.38)",fontSize:10,textTransform:"uppercase",letterSpacing:1}}>Créditos</p>
            <p style={{color:YELLOW,fontWeight:700,fontSize:20}}>{currentUser.credits.toLocaleString()} cr.</p>
          </div>
          <button onClick={onRequestCredit}
            style={{background:"rgba(78,205,196,.08)",border:"1px solid rgba(78,205,196,.25)",color:"#4ECDC4",
              borderRadius:8,padding:"9px 16px",cursor:"pointer",fontSize:13,
              fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,whiteSpace:"nowrap"}}>
            + Pedir créditos
          </button>
        </div>
 
        {/* Mis solicitudes */}
        {myRequests.length > 0 && (
          <div style={{background:"#0d0d14",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"16px 20px",marginBottom:18}}>
            <h3 style={{color:"rgba(255,255,255,.45)",fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Mis solicitudes de crédito</h3>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {myRequests.map(req=>(
                <div key={req.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"8px 12px",background:"rgba(255,255,255,.02)",borderRadius:8,border:"1px solid rgba(255,255,255,.05)"}}>
                  <span style={{color:"rgba(255,255,255,.55)",fontSize:13}}>{req.date}</span>
                  <span style={{color:YELLOW,fontWeight:700,fontSize:14}}>{req.amount} cr.</span>
                  <span style={{
                    padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:600,
                    background:req.status==="pending"?"rgba(255,140,0,.1)":req.status==="approved"?"rgba(0,200,83,.1)":"rgba(255,50,50,.08)",
                    border:`1px solid ${req.status==="pending"?"rgba(255,140,0,.3)":req.status==="approved"?"rgba(0,200,83,.28)":"rgba(255,50,50,.22)"}`,
                    color:req.status==="pending"?"#FF8C00":req.status==="approved"?"#00C853":"#FF6464"
                  }}>
                    {req.status==="pending"?"⏳ Pendiente":req.status==="approved"?"✓ Aprobada":"✗ Rechazada"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
 
        <h2 style={{fontFamily:"'Cinzel',serif",color:"#fff",fontSize:17,fontWeight:700,marginBottom:6}}>Mis Jugadas</h2>
        <p style={{color:"rgba(255,255,255,.35)",fontSize:13,marginBottom:18}}>Acá podés ver todas las rifas en las que estás participando.</p>
        <div style={{display:"flex",gap:6,marginBottom:18}}>
          {[["todas","Todas"],["active","Activas"],["finished","Finalizadas"]].map(([val,label])=>(
            <button key={val} onClick={()=>setTab(val)} style={{
              padding:"6px 16px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",
              textTransform:"uppercase",letterSpacing:.5,fontFamily:"'Barlow Condensed',sans-serif",
              background:tab===val?"rgba(255,215,0,.1)":"transparent",
              border:`1px solid ${tab===val?YELLOW:"rgba(255,255,255,.1)"}`,
              color:tab===val?YELLOW:"rgba(255,255,255,.38)",transition:"all .2s"}}>
              {label}
            </button>
          ))}
        </div>
        {filtered.length===0?(
          <div style={{textAlign:"center",padding:"40px",color:"rgba(255,255,255,.2)",fontSize:14}}>
            No tenés jugadas todavía.
          </div>
        ):(
          <div style={{background:"#0d0d14",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                  {["Rifa","Números","Monto","Estado","Resultado"].map(h=>(
                    <th key={h} style={{padding:"11px 16px",textAlign:"left",color:"rgba(255,255,255,.3)",
                      fontSize:10,letterSpacing:2,textTransform:"uppercase",fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((j,i)=>(
                  <tr key={j.rifaId} style={{borderBottom:"1px solid rgba(255,255,255,.04)",
                    background:i%2?"rgba(255,255,255,.01)":"transparent"}}>
                    <td style={{padding:"11px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:18}}>{j.rifaIcon}</span>
                        <span style={{color:"#fff",fontSize:13,fontWeight:600}}>{j.rifaName}</span>
                      </div>
                    </td>
                    <td style={{padding:"11px 16px"}}>
                      <div style={{display:"flex",gap:3,flexWrap:"wrap",maxWidth:180}}>
                        {[...j.numbers].sort().map(n=>(
                          <span key={n} style={{background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.2)",
                            borderRadius:4,padding:"1px 6px",color:YELLOW,fontSize:11}}>{n}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{padding:"11px 16px",color:"#fff",fontWeight:600,fontSize:13}}>{j.amount} cr.</td>
                    <td style={{padding:"11px 16px"}}>
                      <span style={{padding:"2px 9px",borderRadius:10,fontSize:11,
                        background:j.status==="active"?"rgba(0,200,83,.1)":"rgba(255,215,0,.08)",
                        border:`1px solid ${j.status==="active"?"rgba(0,200,83,.28)":"rgba(255,215,0,.2)"}`,
                        color:j.status==="active"?"#00C853":YELLOW}}>
                        {j.status==="active"?"Activa":"🏆 Sorteada"}
                      </span>
                    </td>
                    <td style={{padding:"11px 16px"}}>
                      {j.winner ? (
                        j.winner.userId===currentUser.id ?
                          <span style={{color:YELLOW,fontWeight:700,fontSize:13}}>🎉 ¡Ganaste! Nro {j.winner.number}</span> :
                          <span style={{color:"rgba(255,255,255,.35)",fontSize:12}}>Ganó {j.winner.name}</span>
                      ) : <span style={{color:"rgba(255,255,255,.2)",fontSize:12}}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
 
// ─── Request Credit Modal ──────────────────────────────────────────────────────
function RequestCreditModal({currentUser, onSubmit, onCancel}){
  const [amount, setAmount] = useState("");
  const [note,   setNote]   = useState("");
  return(
    <div style={{position:"fixed",inset:0,zIndex:1500,background:"rgba(0,0,0,.85)",
      backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:"'Barlow Condensed',sans-serif",padding:20}}>
      <div style={{width:"min(400px,100%)",background:"#0d0d14",border:"1px solid rgba(78,205,196,.25)",
        borderRadius:16,padding:"32px",boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{fontSize:36,marginBottom:8}}>💰</div>
          <h2 style={{fontFamily:"'Cinzel',serif",color:"#fff",fontSize:18,fontWeight:700}}>Solicitar créditos</h2>
          <p style={{color:"rgba(255,255,255,.38)",fontSize:13,marginTop:4}}>El administrador revisará tu solicitud</p>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{color:"rgba(255,255,255,.4)",fontSize:11,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:6}}>Cantidad de créditos</label>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Ej: 500"
            style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",
              borderRadius:8,padding:"11px 12px",color:"#fff",fontSize:14,outline:"none",
              fontFamily:"'Barlow Condensed',sans-serif",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{color:"rgba(255,255,255,.4)",fontSize:11,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:6}}>Nota (opcional)</label>
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="¿Para qué los necesitás?"
            rows={3} style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",
              borderRadius:8,padding:"11px 12px",color:"#fff",fontSize:13,outline:"none",resize:"none",
              fontFamily:"'Barlow Condensed',sans-serif",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"11px",background:"rgba(255,255,255,.04)",
            border:"1px solid rgba(255,255,255,.09)",borderRadius:8,color:"rgba(255,255,255,.5)",
            fontSize:13,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>Cancelar</button>
          <button onClick={()=>parseInt(amount)>0&&onSubmit(parseInt(amount),note)}
            style={{flex:2,padding:"11px",
              background:parseInt(amount)>0?`linear-gradient(135deg,${YELLOW2},${YELLOW})`:"rgba(255,255,255,.04)",
              border:"none",borderRadius:8,color:parseInt(amount)>0?"#000":"rgba(255,255,255,.2)",
              fontSize:13,fontWeight:700,cursor:parseInt(amount)>0?"pointer":"not-allowed",
              fontFamily:"'Cinzel',serif",letterSpacing:1,textTransform:"uppercase"}}>
            Enviar solicitud
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ─── Admin Panel ───────────────────────────────────────────────────────────────
function AdminPanel({db, setDb, onLogout, onLobby, toast}){
  const {users, rifas, creditRequests} = db;
  const setUsers          = fn => setDb(prev=>{ const next={...prev,users:fn(prev.users)}; saveDB(next); return next; });
  const setRifas          = fn => setDb(prev=>{ const next={...prev,rifas:fn(prev.rifas)}; saveDB(next); return next; });
  const setCreditRequests = fn => setDb(prev=>{ const next={...prev,creditRequests:fn(prev.creditRequests)}; saveDB(next); return next; });
 
  const [tab,          setTab]          = useState("dashboard");
  const [newRifa,      setNewRifa]      = useState({name:"",subtitle:"",icon:"🎁",pricePerNumber:50,prize:"",totalNumbers:100});
  const [editCredits,  setEditCredits]  = useState({id:null,val:""});
  const [editUser,     setEditUser]     = useState(null);
  const [editRifa,     setEditRifa]     = useState(null);
  const [deleteConfirm,setDeleteConfirm]= useState(null);
 
  const approveCredit = id => {
    const req = creditRequests.find(r=>r.id===id);
    if(!req) return;
    setUsers(prev=>prev.map(u=>u.id===req.userId?{...u,credits:u.credits+req.amount}:u));
    setCreditRequests(prev=>prev.map(r=>r.id===id?{...r,status:"approved"}:r));
    toast(`Solicitud de ${req.userName} aprobada: +${req.amount} cr.`, "success");
  };
  const rejectCredit = id => {
    setCreditRequests(prev=>prev.map(r=>r.id===id?{...r,status:"rejected"}:r));
    toast("Solicitud rechazada","warn");
  };
 
  const createRifa = () => {
    if(!newRifa.name||!newRifa.prize) return;
    const id = rifas.length>0 ? Math.max(...rifas.map(r=>r.id))+1 : 1;
    setRifas(prev=>[...prev,{id,...newRifa,totalNumbers:parseInt(newRifa.totalNumbers)||100,status:"active",numbers:{},winner:null}]);
    setNewRifa({name:"",subtitle:"",icon:"🎁",pricePerNumber:50,prize:"",totalNumbers:100});
    toast("Rifa creada correctamente","success");
  };
 
  const saveEditUser = () => {
    if(!editUser) return;
    setUsers(prev=>prev.map(u=>u.id===editUser.id?{...u,...editUser}:u));
    setEditUser(null);
    toast("Usuario actualizado","success");
  };
 
  const deleteUser = id => {
    setUsers(prev=>prev.filter(u=>u.id!==id));
    setDeleteConfirm(null);
    toast("Usuario eliminado","warn");
  };
 
  const saveEditRifa = () => {
    if(!editRifa) return;
    setRifas(prev=>prev.map(r=>r.id===editRifa.id?{...r,...editRifa,totalNumbers:parseInt(editRifa.totalNumbers)||100}:r));
    setEditRifa(null);
    toast("Rifa actualizada","success");
  };
 
  const deleteRifa = id => {
    setRifas(prev=>prev.filter(r=>r.id!==id));
    setDeleteConfirm(null);
    toast("Rifa eliminada","warn");
  };
 
  const pending  = creditRequests.filter(r=>r.status==="pending");
  const totalCr  = users.reduce((s,u)=>s+u.credits,0);
  const totalPart= rifas.reduce((s,r)=>s+Object.keys(r.numbers).length,0);
 
  const inputStyle = {
    background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",
    borderRadius:7,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",
    fontFamily:"'Barlow Condensed',sans-serif",width:"100%",boxSizing:"border-box"
  };
  const modalOverlay = {
    position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,.85)",
    backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",
    fontFamily:"'Barlow Condensed',sans-serif",padding:20
  };
  const modalBox = {
    width:"min(420px,100%)",background:"#0d0d14",border:"1px solid rgba(255,255,255,.12)",
    borderRadius:14,padding:"28px",boxShadow:"0 20px 60px rgba(0,0,0,.6)"
  };
 
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Barlow Condensed',sans-serif"}}>
 
      {/* Modal: Editar usuario */}
      {editUser && (
        <div style={modalOverlay} onClick={e=>e.target===e.currentTarget&&setEditUser(null)}>
          <div style={modalBox}>
            <h3 style={{fontFamily:"'Cinzel',serif",color:"#fff",fontSize:16,marginBottom:18}}>Editar Usuario</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {label:"Nombre completo",key:"name",    type:"text"},
                {label:"Usuario",        key:"username",type:"text"},
                {label:"Contraseña",     key:"password",type:"text"},
              ].map(f=>(
                <div key={f.key}>
                  <label style={{color:"rgba(255,255,255,.4)",fontSize:11,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:5}}>{f.label}</label>
                  <input type={f.type} value={editUser[f.key]} onChange={e=>setEditUser(p=>({...p,[f.key]:e.target.value}))} style={inputStyle}/>
                </div>
              ))}
              <div>
                <label style={{color:"rgba(255,255,255,.4)",fontSize:11,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:5}}>Créditos</label>
                <input type="number" value={editUser.credits} onChange={e=>setEditUser(p=>({...p,credits:parseInt(e.target.value)||0}))} style={inputStyle}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button onClick={()=>setEditUser(null)} style={{flex:1,padding:"10px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:8,color:"rgba(255,255,255,.5)",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13}}>Cancelar</button>
              <button onClick={saveEditUser} style={{flex:2,padding:"10px",background:`linear-gradient(135deg,${YELLOW2},${YELLOW})`,border:"none",borderRadius:8,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Cinzel',serif",letterSpacing:1}}>Guardar</button>
            </div>
          </div>
        </div>
      )}
 
      {/* Modal: Editar rifa */}
      {editRifa && (
        <div style={modalOverlay} onClick={e=>e.target===e.currentTarget&&setEditRifa(null)}>
          <div style={modalBox}>
            <h3 style={{fontFamily:"'Cinzel',serif",color:"#fff",fontSize:16,marginBottom:18}}>Editar Rifa</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {label:"Nombre",      key:"name",     type:"text"},
                {label:"Descripción", key:"subtitle", type:"text"},
                {label:"Premio",      key:"prize",    type:"text"},
              ].map(f=>(
                <div key={f.key}>
                  <label style={{color:"rgba(255,255,255,.4)",fontSize:11,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:5}}>{f.label}</label>
                  <input type={f.type} value={editRifa[f.key]||""} onChange={e=>setEditRifa(p=>({...p,[f.key]:e.target.value}))} style={inputStyle}/>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div>
                  <label style={{color:"rgba(255,255,255,.4)",fontSize:11,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:5}}>Ícono</label>
                  <input value={editRifa.icon||""} onChange={e=>setEditRifa(p=>({...p,icon:e.target.value}))} style={inputStyle}/>
                </div>
                <div>
                  <label style={{color:"rgba(255,255,255,.4)",fontSize:11,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:5}}>Precio/nro</label>
                  <input type="number" value={editRifa.pricePerNumber||0} onChange={e=>setEditRifa(p=>({...p,pricePerNumber:+e.target.value}))} style={inputStyle}/>
                </div>
                <div>
                  <label style={{color:"rgba(255,255,255,.4)",fontSize:11,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:5}}>Total nros</label>
                  <input type="number" min="5" max="500" value={editRifa.totalNumbers||100} onChange={e=>setEditRifa(p=>({...p,totalNumbers:+e.target.value}))} style={inputStyle}/>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button onClick={()=>setEditRifa(null)} style={{flex:1,padding:"10px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:8,color:"rgba(255,255,255,.5)",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13}}>Cancelar</button>
              <button onClick={saveEditRifa} style={{flex:2,padding:"10px",background:`linear-gradient(135deg,${YELLOW2},${YELLOW})`,border:"none",borderRadius:8,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Cinzel',serif",letterSpacing:1}}>Guardar</button>
            </div>
          </div>
        </div>
      )}
 
      {/* Modal: Confirmar borrado */}
      {deleteConfirm && (
        <div style={modalOverlay} onClick={e=>e.target===e.currentTarget&&setDeleteConfirm(null)}>
          <div style={{...modalBox,textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:12}}>⚠️</div>
            <h3 style={{fontFamily:"'Cinzel',serif",color:"#fff",fontSize:16,marginBottom:8}}>
              {deleteConfirm.type==="user"?"¿Eliminar usuario?":"¿Eliminar rifa?"}
            </h3>
            <p style={{color:"rgba(255,255,255,.38)",fontSize:13,marginBottom:22}}>Esta acción no se puede deshacer.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setDeleteConfirm(null)} style={{flex:1,padding:"10px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:8,color:"rgba(255,255,255,.5)",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13}}>Cancelar</button>
              <button onClick={()=>deleteConfirm.type==="user"?deleteUser(deleteConfirm.id):deleteRifa(deleteConfirm.id)}
                style={{flex:1,padding:"10px",background:"rgba(255,50,50,.12)",border:"1px solid rgba(255,50,50,.35)",borderRadius:8,color:"#FF6464",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Header admin */}
      <header style={{background:"#0d0d14",borderBottom:"1px solid rgba(78,205,196,.18)",
        padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",
        position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span>⚙️</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,color:"#4ECDC4",letterSpacing:3}}>PANEL ADMIN</span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onLobby} style={{background:"rgba(255,215,0,.07)",border:"1px solid rgba(255,215,0,.22)",color:YELLOW,padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>← Rifas</button>
          <button onClick={onLogout} style={{background:"transparent",border:"1px solid rgba(255,100,100,.28)",color:"#FF6464",padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>Salir</button>
        </div>
      </header>
 
      <main style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px"}}>
 
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:22}}>
          {[
            {label:"Jugadores",         val:users.filter(u=>!u.isAdmin).length,              icon:"👥",c:"#4ECDC4"},
            {label:"Rifas activas",     val:rifas.filter(r=>r.status==="active").length,      icon:"🎫",c:YELLOW},
            {label:"Créditos emitidos", val:totalCr.toLocaleString(),                         icon:"💰",c:"#00C853"},
            {label:"Participaciones",   val:totalPart,                                         icon:"🎯",c:"#FF8C00"},
          ].map(s=>(
            <div key={s.label} style={{background:"#0d0d14",border:`1px solid ${s.c}22`,borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:24}}>{s.icon}</span>
              <div>
                <p style={{color:"rgba(255,255,255,.32)",fontSize:10,letterSpacing:1.5,textTransform:"uppercase",marginBottom:1}}>{s.label}</p>
                <p style={{color:s.c,fontSize:21,fontWeight:700}}>{s.val}</p>
              </div>
            </div>
          ))}
        </div>
 
        {/* Tabs */}
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {[["dashboard","Dashboard"],["users","👥 Usuarios"],["rifas","🎫 Rifas"]].map(([val,label])=>(
            <button key={val} onClick={()=>setTab(val)} style={{
              padding:"7px 18px",borderRadius:7,fontSize:12,cursor:"pointer",textTransform:"uppercase",
              letterSpacing:.5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,
              background:tab===val?"rgba(78,205,196,.09)":"transparent",
              border:`1px solid ${tab===val?"#4ECDC4":"rgba(255,255,255,.09)"}`,
              color:tab===val?"#4ECDC4":"rgba(255,255,255,.38)",transition:"all .2s"}}>
              {label}{val==="dashboard"&&pending.length>0?` (${pending.length})` : ""}
            </button>
          ))}
        </div>
 
        {/* ── Tab: Dashboard ── */}
        {tab==="dashboard" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {/* Solicitudes de crédito */}
            <div style={{background:"#0d0d14",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <h3 style={{color:"#fff",fontSize:14,fontFamily:"'Cinzel',serif"}}>Solicitudes de crédito</h3>
                {pending.length>0&&<span style={{background:"rgba(255,140,0,.12)",border:"1px solid rgba(255,140,0,.28)",borderRadius:10,padding:"2px 8px",color:"#FF8C00",fontSize:11}}>{pending.length} pendientes</span>}
              </div>
              <p style={{color:"rgba(255,255,255,.3)",fontSize:11,marginBottom:12,lineHeight:1.5}}>
                Los jugadores pueden pedir créditos desde su perfil. Aprobá o rechazá cada solicitud aquí.
              </p>
              {creditRequests.length===0?(
                <p style={{color:"rgba(255,255,255,.18)",fontSize:13,textAlign:"center",padding:"20px 0"}}>Sin solicitudes</p>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {creditRequests.map(req=>(
                    <div key={req.id} style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"9px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:req.note?6:0}}>
                        <div style={{flex:1}}>
                          <p style={{color:"#fff",fontSize:13,fontWeight:600}}>{req.userName}</p>
                          <p style={{color:"rgba(255,255,255,.35)",fontSize:11}}>{req.date}</p>
                        </div>
                        <span style={{color:YELLOW,fontWeight:700,fontSize:14}}>{req.amount} cr.</span>
                        {req.status==="pending"?(
                          <div style={{display:"flex",gap:5}}>
                            <button onClick={()=>approveCredit(req.id)} style={{background:"rgba(0,200,83,.1)",border:"1px solid rgba(0,200,83,.28)",color:"#00C853",padding:"4px 9px",borderRadius:5,cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>✓ Aprobar</button>
                            <button onClick={()=>rejectCredit(req.id)} style={{background:"rgba(255,50,50,.08)",border:"1px solid rgba(255,50,50,.22)",color:"#FF6464",padding:"4px 9px",borderRadius:5,cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>✗</button>
                          </div>
                        ):<span style={{fontSize:12,color:req.status==="approved"?"#00C853":"#FF6464",fontWeight:600}}>{req.status==="approved"?"✓ Aprobada":"✗ Rechazada"}</span>}
                      </div>
                      {req.note && <p style={{color:"rgba(255,255,255,.35)",fontSize:11,fontStyle:"italic"}}>"{req.note}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
 
            {/* Crear rifa */}
            <div style={{background:"#0d0d14",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"18px"}}>
              <h3 style={{color:"#fff",fontSize:14,fontFamily:"'Cinzel',serif",marginBottom:14}}>Crear rifa</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <input value={newRifa.name} onChange={e=>setNewRifa(p=>({...p,name:e.target.value}))} placeholder="Nombre de la rifa" style={inputStyle}/>
                <input value={newRifa.subtitle} onChange={e=>setNewRifa(p=>({...p,subtitle:e.target.value}))} placeholder="Descripción corta" style={inputStyle}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <input value={newRifa.prize} onChange={e=>setNewRifa(p=>({...p,prize:e.target.value}))} placeholder="Premio (ej: $50,000)" style={inputStyle}/>
                  <input type="number" value={newRifa.pricePerNumber} onChange={e=>setNewRifa(p=>({...p,pricePerNumber:+e.target.value}))} placeholder="Costo/número" style={inputStyle}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <input value={newRifa.icon} onChange={e=>setNewRifa(p=>({...p,icon:e.target.value}))} placeholder="Ícono (emoji)" style={inputStyle}/>
                  <div style={{position:"relative"}}>
                    <input type="number" min="5" max="500" value={newRifa.totalNumbers}
                      onChange={e=>setNewRifa(p=>({...p,totalNumbers:+e.target.value}))}
                      placeholder="Cant. de números" style={inputStyle}/>
                  </div>
                </div>
                <p style={{color:"rgba(255,255,255,.25)",fontSize:11}}>💡 El sorteo ocurre automáticamente cuando se venden todos los números</p>
                <button onClick={createRifa} style={{
                  background:newRifa.name&&newRifa.prize?`linear-gradient(135deg,${YELLOW2},${YELLOW})`:"rgba(255,255,255,.04)",
                  border:"none",borderRadius:8,padding:"10px",
                  color:newRifa.name&&newRifa.prize?"#000":"rgba(255,255,255,.28)",
                  fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Cinzel',serif",
                  letterSpacing:1,textTransform:"uppercase"}}>
                  Crear nueva rifa
                </button>
              </div>
            </div>
 
            {/* Estado de rifas */}
            <div style={{gridColumn:"1/-1",background:"#0d0d14",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"18px"}}>
              <h3 style={{color:"#fff",fontSize:14,fontFamily:"'Cinzel',serif",marginBottom:14}}>Estado de rifas</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                {[
                  {label:"Activas",    val:rifas.filter(r=>r.status==="active").length,   c:"#00C853"},
                  {label:"Sorteadas",  val:rifas.filter(r=>r.status==="finished").length, c:YELLOW},
                  {label:"Números vendidos", val:rifas.reduce((s,r)=>s+Object.values(r.numbers).filter(n=>n.status==="reservado").length,0), c:"#4ECDC4"},
                  {label:"Totales",    val:rifas.length,                                   c:"rgba(255,255,255,.55)"},
                ].map(s=>(
                  <div key={s.label} style={{background:"rgba(255,255,255,.02)",border:`1px solid ${s.c}18`,borderRadius:8,padding:"12px",textAlign:"center"}}>
                    <p style={{color:s.c,fontSize:22,fontWeight:700,marginBottom:2}}>{s.val}</p>
                    <p style={{color:"rgba(255,255,255,.32)",fontSize:10,textTransform:"uppercase",letterSpacing:1}}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
 
        {/* ── Tab: Usuarios ── */}
        {tab==="users" && (
          <div style={{background:"#0d0d14",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                  {["","Nombre","Usuario","Rol","Créditos","Acciones"].map(h=>(
                    <th key={h} style={{padding:"11px 16px",textAlign:"left",color:"rgba(255,255,255,.3)",fontSize:10,letterSpacing:2,textTransform:"uppercase",fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user,i)=>(
                  <tr key={user.id} style={{borderBottom:"1px solid rgba(255,255,255,.04)",background:i%2?"rgba(255,255,255,.01)":"transparent"}}>
                    <td style={{padding:"10px 16px",fontSize:18}}>{user.avatar}</td>
                    <td style={{padding:"10px 16px",color:"#fff",fontSize:13,fontWeight:600}}>{user.name}</td>
                    <td style={{padding:"10px 16px",color:"rgba(255,255,255,.45)",fontSize:12}}>{user.username}</td>
                    <td style={{padding:"10px 16px"}}>
                      <span style={{padding:"2px 8px",borderRadius:10,fontSize:10,
                        background:user.isAdmin?"rgba(78,205,196,.1)":"rgba(255,255,255,.04)",
                        border:`1px solid ${user.isAdmin?"rgba(78,205,196,.28)":"rgba(255,255,255,.09)"}`,
                        color:user.isAdmin?"#4ECDC4":"rgba(255,255,255,.38)"}}>
                        {user.isAdmin?"Admin":"Jugador"}
                      </span>
                    </td>
                    <td style={{padding:"10px 16px"}}>
                      {editCredits.id===user.id?(
                        <div style={{display:"flex",gap:5,alignItems:"center"}}>
                          <input type="number" value={editCredits.val}
                            onChange={e=>setEditCredits(p=>({...p,val:e.target.value}))}
                            onKeyDown={e=>{if(e.key==="Enter"){const v=parseInt(editCredits.val);if(!isNaN(v)&&v>=0){setUsers(prev=>prev.map(u=>u.id===user.id?{...u,credits:v}:u));toast("Créditos actualizados","success");}setEditCredits({id:null,val:""});}}}
                            style={{...inputStyle,width:80,padding:"3px 8px",fontSize:12}} autoFocus/>
                          <button onClick={()=>{const v=parseInt(editCredits.val);if(!isNaN(v)&&v>=0){setUsers(prev=>prev.map(u=>u.id===user.id?{...u,credits:v}:u));toast("Créditos actualizados","success");}setEditCredits({id:null,val:""});}}
                            style={{background:"rgba(0,200,83,.1)",border:"1px solid rgba(0,200,83,.28)",color:"#00C853",padding:"3px 7px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>✓</button>
                          <button onClick={()=>setEditCredits({id:null,val:""})}
                            style={{background:"rgba(255,50,50,.08)",border:"1px solid rgba(255,50,50,.22)",color:"#FF6464",padding:"3px 7px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>✗</button>
                        </div>
                      ):(
                        <span style={{color:YELLOW,fontWeight:700,fontSize:14}}>{user.credits.toLocaleString()}</span>
                      )}
                    </td>
                    <td style={{padding:"10px 16px"}}>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>setEditCredits({id:user.id,val:String(user.credits)})}
                          title="Editar créditos"
                          style={{background:"rgba(255,215,0,.07)",border:"1px solid rgba(255,215,0,.2)",color:YELLOW,padding:"5px 10px",borderRadius:5,cursor:"pointer",fontSize:13}}>
                          💰
                        </button>
                        <button onClick={()=>setEditUser({...user})}
                          title="Editar usuario"
                          style={{background:"rgba(78,205,196,.07)",border:"1px solid rgba(78,205,196,.2)",color:"#4ECDC4",padding:"5px 10px",borderRadius:5,cursor:"pointer",fontSize:13}}>
                          ✏
                        </button>
                        {!user.isAdmin && (
                          <button onClick={()=>setDeleteConfirm({type:"user",id:user.id})}
                            title="Eliminar usuario"
                            style={{background:"rgba(255,50,50,.07)",border:"1px solid rgba(255,50,50,.2)",color:"#FF6464",padding:"5px 10px",borderRadius:5,cursor:"pointer",fontSize:13}}>
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
 
        {/* ── Tab: Rifas ── */}
        {tab==="rifas" && (
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {rifas.map(rifa=>{
              const sold     = Object.values(rifa.numbers).filter(n=>n.status==="reservado").length;
              const total    = rifa.totalNumbers || 100;
              return(
                <div key={rifa.id} style={{background:"#0d0d14",border:`1px solid ${rifa.status==="finished"?"rgba(255,215,0,.2)":"rgba(255,255,255,.07)"}`,borderRadius:10,padding:"13px 18px",display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontSize:24}}>{rifa.icon}</span>
                  <div style={{flex:1}}>
                    <h4 style={{fontFamily:"'Cinzel',serif",color:"#fff",fontSize:13,marginBottom:2}}>{rifa.name}</h4>
                    <p style={{color:"rgba(255,255,255,.38)",fontSize:12}}>{rifa.pricePerNumber} cr./número · {rifa.prize} · {total} números</p>
                  </div>
                  {[
                    {label:"Vendidos",  val:sold,         c:"#00C853"},
                    {label:"Libres",    val:total-sold,   c:"rgba(255,255,255,.5)"},
                    {label:"Estado",    val:rifa.status==="active"?"Activa":"🏆 Sorteada", c:rifa.status==="active"?"#4ECDC4":YELLOW},
                  ].map(s=>(
                    <div key={s.label} style={{textAlign:"center",minWidth:70}}>
                      <p style={{color:s.c,fontWeight:700,fontSize:15}}>{s.val}</p>
                      <p style={{color:"rgba(255,255,255,.28)",fontSize:10}}>{s.label}</p>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:6}}>
                    {rifa.status==="active" && (
                      <button onClick={()=>setEditRifa({...rifa})}
                        style={{background:"rgba(78,205,196,.07)",border:"1px solid rgba(78,205,196,.2)",color:"#4ECDC4",padding:"5px 11px",borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:"'Barlow Condensed',sans-serif"}}>
                        ✏ Editar
                      </button>
                    )}
                    <button onClick={()=>setDeleteConfirm({type:"rifa",id:rifa.id})}
                      style={{background:"rgba(255,50,50,.07)",border:"1px solid rgba(255,50,50,.2)",color:"#FF6464",padding:"5px 11px",borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:"'Barlow Condensed',sans-serif"}}>
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
 
// ─── Root ──────────────────────────────────────────────────────────────────────
export default function RifasReal(){
  const [db,          setDb]          = useState(()=>loadDB());
  const [currentUser, setCurrentUser] = useState(null);
  const [view,        setView]        = useState("login");
  const [selectedRifa,setSelectedRifa]= useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [winnerData,  setWinnerData]  = useState(null);
  const [loginForm,   setLoginForm]   = useState({username:"",password:""});
  const [loginError,  setLoginError]  = useState("");
  const [notif,       setNotif]       = useState(null);
  const [showReqCredit, setShowReqCredit] = useState(false);
 
  // Helper para modificar DB y guardar en localStorage en un solo paso
  const updateDB = useCallback((fn) => {
    setDb(prev => {
      const next = fn(prev);
      saveDB(next);
      return next;
    });
  }, []);
 
  const toast = useCallback((msg,type="info")=>{
    setNotif({msg,type});
    setTimeout(()=>setNotif(null),3000);
  },[]);
 
  // Mantener currentUser sincronizado con la DB
  useEffect(()=>{
    if(currentUser){
      const fresh = db.users.find(u=>u.id===currentUser.id);
      if(fresh && JSON.stringify(fresh)!==JSON.stringify(currentUser)){
        setCurrentUser(fresh);
      }
    }
  },[db.users]);
 
  const handleLogin = () => {
    const user = db.users.find(u=>u.username===loginForm.username && u.password===loginForm.password);
    if(user){
      setCurrentUser(user);
      setView(user.isAdmin?"admin":"lobby");
      setLoginError("");
    } else {
      setLoginError("Usuario o contraseña incorrectos");
    }
  };
 
  const handleLogout = () => {
    setCurrentUser(null);
    setView("login");
    setLoginForm({username:"",password:""});
  };
 
  // Lógica de sorteo automático: se dispara cuando todos los números están vendidos
  const checkAndDraw = (rifa, updatedNumbers) => {
    const total = rifa.totalNumbers || 100;
    const sold  = Object.values(updatedNumbers).filter(n=>n.status==="reservado").length;
    if(sold < total) return null;
 
    // Sortear: elegir un número al azar entre los participantes
    const entries = Object.entries(updatedNumbers);
    const randIdx = Math.floor(Math.random() * entries.length);
    const [winNum, winEntry] = entries[randIdx];
    const winUser = db.users.find(u=>u.id===winEntry.userId);
    return {
      number: winNum,
      userId: winEntry.userId,
      name:   winUser ? winUser.name : "Desconocido"
    };
  };
 
  const handleConfirmNumbers = (rifa, numbers) => {
    const total = numbers.length * rifa.pricePerNumber;
    if(currentUser.credits < total){ toast("Créditos insuficientes","error"); return; }
 
    // Construir números actualizados
    const padLen = (rifa.totalNumbers || 100) >= 100 ? 2 : 2;
    let updatedNumbers = {...rifa.numbers};
    numbers.forEach(n=>{ updatedNumbers[n] = {status:"reservado", userId:currentUser.id}; });
 
    // Verificar sorteo automático
    const winner = checkAndDraw(rifa, updatedNumbers);
 
    updateDB(prev => {
      const newUsers = prev.users.map(u=>
        u.id===currentUser.id ? {...u, credits:u.credits-total} : u
      );
      const newRifas = prev.rifas.map(r=>{
        if(r.id!==rifa.id) return r;
        return {
          ...r,
          numbers: updatedNumbers,
          status: winner ? "finished" : "active",
          winner: winner || null
        };
      });
      return {...prev, users:newUsers, rifas:newRifas};
    });
 
    setConfirmData(null);
    setSelectedRifa(null);
    toast(`¡${numbers.length} número${numbers.length>1?"s":""} reservado${numbers.length>1?"s":""}!`,"success");
 
    if(winner){
      setTimeout(()=>setWinnerData({winner, rifa:{...rifa, winner}}), 500);
    } else {
      setView("profile");
    }
  };
 
  const handleRequestCredit = (amount, note) => {
    const req = {
      id: Date.now(),
      userId:   currentUser.id,
      userName: currentUser.name,
      amount,
      note,
      date: new Date().toLocaleDateString("es-AR"),
      status: "pending"
    };
    updateDB(prev=>({...prev, creditRequests:[...prev.creditRequests, req]}));
    setShowReqCredit(false);
    toast("Solicitud enviada al administrador","success");
  };
 
  const liveRifa = selectedRifa ? db.rifas.find(r=>r.id===selectedRifa.id)||selectedRifa : null;
 
  const commonHeaderProps = {
    currentUser,
    onLogout: handleLogout,
    onProfile: ()=>setView("profile"),
    onLobby:   ()=>setView("lobby"),
    onHowItWorks: ()=>setView("howItWorks"),
  };
 
  return(
    <>
      <Toast notif={notif}/>
 
      {showReqCredit && (
        <RequestCreditModal
          currentUser={currentUser}
          onSubmit={handleRequestCredit}
          onCancel={()=>setShowReqCredit(false)}
        />
      )}
 
      {winnerData && (
        <WinnerModal
          winner={winnerData.winner}
          rifa={winnerData.rifa}
          onClose={()=>{setWinnerData(null); setView("lobby");}}
        />
      )}
 
      {view==="login" && (
        <LoginScreen form={loginForm} setForm={setLoginForm} onLogin={handleLogin} error={loginError}/>
      )}
 
      {view==="lobby" && currentUser && (
        <GameLobby
          currentUser={currentUser}
          rifas={db.rifas}
          onSelectRifa={r=>{setSelectedRifa(r);setView("rifa-detail");}}
          onLogout={handleLogout}
          onProfile={()=>setView("profile")}
          onAdmin={()=>setView("admin")}
          onHowItWorks={()=>setView("howItWorks")}
        />
      )}
 
      {view==="rifa-detail" && currentUser && liveRifa && (
        <NumberGrid
          rifa={liveRifa}
          currentUser={currentUser}
          onConfirm={nums=>setConfirmData({rifa:liveRifa, numbers:nums})}
          onBack={()=>setView("lobby")}
        />
      )}
 
      {view==="profile" && currentUser && (
        <ProfileView
          currentUser={currentUser}
          rifas={db.rifas}
          creditRequests={db.creditRequests}
          onBack={()=>setView("lobby")}
          onLogout={handleLogout}
          onHowItWorks={()=>setView("howItWorks")}
          onRequestCredit={()=>setShowReqCredit(true)}
        />
      )}
 
      {view==="howItWorks" && currentUser && (
        <HowItWorksView
          currentUser={currentUser}
          onBack={()=>setView("lobby")}
          onLogout={handleLogout}
          onProfile={()=>setView("profile")}
          onLobby={()=>setView("lobby")}
          onHowItWorks={()=>{}}
        />
      )}
 
      {view==="admin" && currentUser && (
        <AdminPanel
          db={db}
          setDb={setDb}
          onLogout={handleLogout}
          onLobby={()=>setView("lobby")}
          toast={toast}
        />
      )}
 
      {confirmData && (
        <ConfirmModal
          rifa={confirmData.rifa}
          numbers={confirmData.numbers}
          currentUser={currentUser}
          onConfirm={()=>handleConfirmNumbers(confirmData.rifa, confirmData.numbers)}
          onCancel={()=>setConfirmData(null)}
        />
      )}
    </>
  );
}