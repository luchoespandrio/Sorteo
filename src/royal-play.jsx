import { useState, useEffect, useCallback } from "react";

const USERS_INIT = [
  {id:1,username:"admin",    password:"admin",credits:9999,isAdmin:true, avatar:"👑",color:"#4ECDC4"},
  {id:2,username:"jugador1", password:"1234", credits:500, isAdmin:false,avatar:"🎰",color:"#C9A84C"},
  {id:3,username:"jugador2", password:"1234", credits:350, isAdmin:false,avatar:"🃏",color:"#FF6B6B"},
  {id:4,username:"jugador3", password:"1234", credits:600, isAdmin:false,avatar:"🎲",color:"#95E1D3"},
  {id:5,username:"jugador4", password:"1234", credits:200, isAdmin:false,avatar:"🎯",color:"#F38181"},
  {id:6,username:"jugador5", password:"1234", credits:450, isAdmin:false,avatar:"🎪",color:"#A8E6CF"},
  {id:7,username:"jugador6", password:"1234", credits:320, isAdmin:false,avatar:"🌟",color:"#FFD93D"},
  {id:8,username:"jugador7", password:"1234", credits:580, isAdmin:false,avatar:"💎",color:"#6BCB77"},
  {id:9,username:"jugador8", password:"1234", credits:410, isAdmin:false,avatar:"🔥",color:"#FF6B6B"},
  {id:10,username:"jugador9", password:"1234", credits:290, isAdmin:false,avatar:"⚡",color:"#4D96FF"},
  {id:11,username:"jugador10",password:"1234", credits:650, isAdmin:false,avatar:"🎭",color:"#C77DFF"},
];

const GAMES_INIT = [
  {id:1,name:"Ruleta de Oro",     description:"Gira la ruleta y desafiá al destino. El número correcto te da el trono.",  cost:50, icon:"🎡",maxPlayers:10,accent:"#C9A84C",participants:[]},
  {id:2,name:"Tragamonedas",      description:"Tres símbolos iguales y el jackpot es tuyo. La suerte nunca duerme.",      cost:30, icon:"🎰",maxPlayers:10,accent:"#FF6B6B",participants:[]},
  {id:3,name:"Poker Express",     description:"Mesa rápida, decisiones rápidas. Solo los valientes se llevan el pozo.",   cost:80, icon:"♠️",maxPlayers:8, accent:"#4ECDC4",participants:[]},
  {id:4,name:"Dados de la Suerte",description:"Un lanzamiento que puede cambiarlo todo. El azar es tu aliado.",          cost:20, icon:"🎲",maxPlayers:12,accent:"#95E1D3",participants:[]},
  {id:5,name:"Blackjack Veloz",   description:"Llegá a 21 o reventás. El dealer no perdona a los que dudan.",            cost:60, icon:"🃏",maxPlayers:6, accent:"#F38181",participants:[]},
  {id:6,name:"Gran Sorteo VIP",   description:"El evento de la noche. Todos entran, uno se lleva el pozo acumulado.",    cost:100,icon:"🏆",maxPlayers:10,accent:"#A8E6CF",participants:[]},
];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ notif }) {
  if (!notif) return null;
  const colors = { success:"#00FF88", error:"#FF6464", warn:"#FFD700", info:"#4ECDC4" };
  const c = colors[notif.type] || colors.info;
  return (
    <div className="slide-up" style={{
      position:"fixed",top:20,right:20,zIndex:9999,
      padding:"11px 22px",background:"rgba(8,8,18,.95)",
      border:`1px solid ${c}66`,borderRadius:10,color:"#fff",
      fontFamily:"var(--font-ui)",fontSize:14,letterSpacing:.5,
      backdropFilter:"blur(12px)",display:"flex",alignItems:"center",gap:10,
      boxShadow:`0 4px 24px ${c}33`,
    }}>
      <span style={{color:c,fontSize:16}}>{notif.type==="success"?"✓":notif.type==="error"?"✗":"!"}</span>
      {notif.msg}
    </div>
  );
}

// ─── Badges ───────────────────────────────────────────────────────────────────
function CreditsBadge({ credits }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.28)",borderRadius:24,padding:"5px 14px"}}>
      <span style={{fontSize:16}}>💰</span>
      <span style={{color:"var(--gold-bright)",fontWeight:700,fontSize:17,letterSpacing:.5}}>{credits.toLocaleString()}</span>
      <span style={{color:"rgba(255,255,255,.35)",fontSize:12}}>cr.</span>
    </div>
  );
}

function UserBadge({ user }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:20}}>{user.avatar}</span>
      <span style={{color:"rgba(255,255,255,.75)",fontSize:14,letterSpacing:.5}}>{user.username}</span>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ form, setForm, onLogin, error }) {
  const [particles] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 5 + 2,
      dur: `${Math.random() * 14 + 8}s`,
      delay: `${Math.random() * 10}s`,
      color: ["#C9A84C","#FFD700","#00FF88","#FF6B6B","#4ECDC4","#A8E6CF"][i % 6],
    }))
  );

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",fontFamily:"var(--font-ui)"}}>
      <div style={{position:"absolute",inset:0,opacity:.025,backgroundImage:"linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)",backgroundSize:"64px 64px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:700,height:700,background:"radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 65%)",borderRadius:"50%",pointerEvents:"none"}}/>
      {particles.map(p => (
        <div key={p.id} style={{position:"absolute",left:p.left,bottom:"-8px",width:p.size,height:p.size,borderRadius:"50%",background:p.color,boxShadow:`0 0 ${p.size*3}px ${p.color}`,animation:`floatUp ${p.dur} ${p.delay} linear infinite`,pointerEvents:"none"}}/>
      ))}
      <div className="card-in pulse-gold" style={{width:"min(420px,92vw)",background:"rgba(13,13,26,.85)",border:"1px solid rgba(201,168,76,.35)",borderRadius:20,backdropFilter:"blur(24px)",padding:"48px 40px",position:"relative",zIndex:10,textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:"radial-gradient(circle at 40% 35%,rgba(201,168,76,.25),rgba(201,168,76,.05))",border:"1px solid rgba(201,168,76,.45)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 22px",position:"relative"}}>
          🎰
          <div style={{position:"absolute",inset:-4,borderRadius:"50%",border:"1px dashed rgba(201,168,76,.2)",animation:"spinSlow 18s linear infinite"}}/>
        </div>
        <h1 className="shimmer-text" style={{fontFamily:"var(--font-title)",fontSize:34,fontWeight:900,letterSpacing:8,marginBottom:4}}>ROYAL PLAY</h1>
        <p style={{color:"rgba(255,255,255,.3)",fontSize:12,letterSpacing:4,marginBottom:38,textTransform:"uppercase"}}>Sistema de Juegos</p>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",textAlign:"left",color:"rgba(201,168,76,.75)",fontSize:12,letterSpacing:2,marginBottom:7,textTransform:"uppercase"}}>Usuario</label>
          <input className="input-field" type="text" value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&onLogin()} placeholder="Ingresá tu usuario" style={{padding:"12px 16px",borderRadius:9}}/>
        </div>
        <div style={{marginBottom:22}}>
          <label style={{display:"block",textAlign:"left",color:"rgba(201,168,76,.75)",fontSize:12,letterSpacing:2,marginBottom:7,textTransform:"uppercase"}}>Contraseña</label>
          <input className="input-field" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&onLogin()} placeholder="••••••••" style={{padding:"12px 16px",borderRadius:9}}/>
        </div>
        {error && <p style={{color:"#FF6464",fontSize:13,marginBottom:14,letterSpacing:.5}}>⚠ {error}</p>}
        <button className="btn-gold" onClick={onLogin} style={{width:"100%",padding:"14px",borderRadius:10,fontSize:14,fontWeight:700,color:"#06060e",letterSpacing:4,textTransform:"uppercase"}}>
          Ingresar
        </button>
        <div style={{marginTop:22,padding:"12px 16px",background:"rgba(255,255,255,.025)",borderRadius:9,border:"1px solid rgba(255,255,255,.07)"}}>
          <p style={{color:"rgba(255,255,255,.25)",fontSize:11,letterSpacing:.5,lineHeight:1.9}}>
            Admin: <span style={{color:"rgba(201,168,76,.65)"}}>admin / admin</span><br/>
            Jugadores: <span style={{color:"rgba(201,168,76,.65)"}}>jugador1–10 / 1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Game Card ────────────────────────────────────────────────────────────────
function GameCard({ game, currentUser, users, onSelect, delay }) {
  const isJoined = game.participants.includes(currentUser.id);
  const canAfford = currentUser.credits >= game.cost;
  const prize = game.cost * game.participants.length;
  const pUsers = game.participants.map(id => users.find(u => u.id === id)).filter(Boolean);

  return (
    <div className="game-card card-in" onClick={onSelect} style={{
      background: isJoined ? `radial-gradient(ellipse at top right,${game.accent}0d,rgba(13,13,26,.9))` : "rgba(255,255,255,.025)",
      border: `1px solid ${isJoined ? game.accent+"55" : "rgba(255,255,255,.08)"}`,
      borderRadius:16,padding:24,cursor:"pointer",position:"relative",overflow:"hidden",
      animationDelay:`${delay}s`,animationFillMode:"both",opacity:0,
    }}>
      {isJoined && <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${game.accent},transparent)`}}/>}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
        <div style={{width:54,height:54,borderRadius:12,background:`${game.accent}18`,border:`1px solid ${game.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{game.icon}</div>
        <div style={{background:`${game.accent}18`,border:`1px solid ${game.accent}44`,borderRadius:20,padding:"4px 12px",display:"flex",alignItems:"center",gap:4}}>
          <span style={{color:game.accent,fontWeight:700,fontSize:15}}>{game.cost}</span>
          <span style={{color:"rgba(255,255,255,.4)",fontSize:11}}>cr.</span>
        </div>
      </div>
      <h3 style={{fontFamily:"var(--font-title)",color:"#fff",fontSize:18,fontWeight:700,letterSpacing:.5,marginBottom:7}}>{game.name}</h3>
      <p style={{color:"rgba(255,255,255,.4)",fontSize:13,lineHeight:1.65,marginBottom:16,minHeight:42}}>{game.description}</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,padding:"9px 13px",background:"rgba(0,0,0,.25)",borderRadius:8,border:"1px solid rgba(255,255,255,.05)"}}>
        <div>
          <div style={{color:"rgba(255,255,255,.28)",fontSize:10,letterSpacing:1.5,textTransform:"uppercase",marginBottom:1}}>Jugadores</div>
          <div style={{color:"#fff",fontSize:15,fontWeight:600}}>{game.participants.length}<span style={{color:"rgba(255,255,255,.3)",fontSize:12}}>/{game.maxPlayers}</span></div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"rgba(255,255,255,.28)",fontSize:10,letterSpacing:1.5,textTransform:"uppercase",marginBottom:1}}>Pozo</div>
          <div style={{color:"var(--gold-bright)",fontSize:15,fontWeight:700}}>💰 {prize.toLocaleString()}</div>
        </div>
      </div>
      {pUsers.length > 0 && (
        <div style={{display:"flex",gap:3,marginBottom:11,flexWrap:"wrap"}}>
          {pUsers.map(u => <span key={u.id} title={u.username} style={{fontSize:18,lineHeight:1}}>{u.avatar}</span>)}
        </div>
      )}
      <div style={{padding:"7px 13px",borderRadius:8,textAlign:"center",fontSize:12,letterSpacing:.5,fontWeight:600,
        background:isJoined?`${game.accent}18`:!canAfford?"rgba(255,100,100,.08)":"rgba(201,168,76,.08)",
        border:`1px solid ${isJoined?game.accent+"44":!canAfford?"rgba(255,100,100,.28)":"rgba(201,168,76,.28)"}`,
        color:isJoined?game.accent:!canAfford?"#FF6464":"#C9A84C",
      }}>
        {isJoined ? "✓ Participando — click para sortear" : !canAfford ? "✗ Créditos insuficientes" : "→ Click para unirse"}
      </div>
    </div>
  );
}

// ─── Lobby ────────────────────────────────────────────────────────────────────
function GameLobby({ currentUser, games, users, onSelectGame, onLogout, onAdmin }) {
  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",fontFamily:"var(--font-ui)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,opacity:.022,backgroundImage:"linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)",backgroundSize:"64px 64px",pointerEvents:"none"}}/>
      <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(7,7,15,.85)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(201,168,76,.18)",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
        <h2 className="shimmer-text" style={{fontFamily:"var(--font-title)",fontSize:20,fontWeight:900,letterSpacing:5}}>ROYAL PLAY</h2>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <CreditsBadge credits={currentUser.credits}/>
          <UserBadge user={currentUser}/>
          {currentUser.isAdmin && (
            <button className="btn-outline" onClick={onAdmin} style={{border:"1px solid rgba(78,205,196,.4)",color:"#4ECDC4",padding:"6px 16px",borderRadius:7,fontSize:13,letterSpacing:.5}}>⚙ Admin</button>
          )}
          <button className="btn-outline" onClick={onLogout} style={{border:"1px solid rgba(255,100,100,.35)",color:"#FF6464",padding:"6px 16px",borderRadius:7,fontSize:13,letterSpacing:.5}}>Salir</button>
        </div>
      </header>
      <main style={{maxWidth:1200,margin:"0 auto",padding:"44px 32px"}}>
        <div style={{marginBottom:44,textAlign:"center"}}>
          <h1 style={{fontFamily:"var(--font-title)",fontSize:38,fontWeight:900,color:"#fff",letterSpacing:4,marginBottom:8}}>
            Mesa de <span className="shimmer-text">Juegos</span>
          </h1>
          <p style={{color:"rgba(255,255,255,.35)",fontSize:15,letterSpacing:2}}>Pagá la entrada · Participá · Ganá el pozo</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:22}}>
          {games.map((game, i) => (
            <GameCard key={game.id} game={game} currentUser={currentUser} users={users} onSelect={() => onSelectGame(game)} delay={i * .08}/>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─── Game Modal ───────────────────────────────────────────────────────────────
function GameModal({ game, currentUser, users, onJoin, onDraw, onClose }) {
  const isJoined = game.participants.includes(currentUser.id);
  const canAfford = currentUser.credits >= game.cost;
  const prize = game.cost * game.participants.length;
  const pUsers = game.participants.map(id => users.find(u => u.id === id)).filter(Boolean);

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.88)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"var(--font-ui)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="card-in" style={{width:"min(560px,100%)",background:"#0a0a17",border:`1px solid ${game.accent}44`,borderRadius:20,overflow:"hidden",boxShadow:`0 0 80px ${game.accent}18`}}>
        <div style={{background:`linear-gradient(135deg,${game.accent}10,transparent)`,borderBottom:`1px solid ${game.accent}28`,padding:"22px 26px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:56,height:56,borderRadius:13,background:`${game.accent}18`,border:`1px solid ${game.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{game.icon}</div>
            <div>
              <h2 style={{fontFamily:"var(--font-title)",color:"#fff",fontSize:22,fontWeight:700,marginBottom:4}}>{game.name}</h2>
              <p style={{color:"rgba(255,255,255,.38)",fontSize:13,lineHeight:1.4}}>{game.description}</p>
            </div>
          </div>
          <button onClick={onClose} style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"22px 26px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:22}}>
            {[
              {label:"Entrada", val:`${game.cost} cr.`, color:game.accent},
              {label:"Jugadores", val:`${game.participants.length}/${game.maxPlayers}`, color:"#4ECDC4"},
              {label:"Pozo", val:`${prize} cr.`, color:"var(--gold-bright)"},
            ].map(s => (
              <div key={s.label} style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                <div style={{color:"rgba(255,255,255,.3)",fontSize:10,letterSpacing:1.5,textTransform:"uppercase",marginBottom:3}}>{s.label}</div>
                <div style={{color:s.color,fontSize:17,fontWeight:700}}>{s.val}</div>
              </div>
            ))}
          </div>
          <div style={{marginBottom:18}}>
            <h4 style={{color:"rgba(255,255,255,.35)",fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Participantes ({pUsers.length})</h4>
            {pUsers.length === 0 ? (
              <p style={{color:"rgba(255,255,255,.18)",fontSize:14,textAlign:"center",padding:"18px 0"}}>Nadie se unió todavía — ¡sé el primero!</p>
            ) : (
              <div style={{display:"flex",flexWrap:"wrap",gap:7,maxHeight:110,overflowY:"auto"}} className="scrollbar-thin">
                {pUsers.map(u => (
                  <div key={u.id} style={{display:"flex",alignItems:"center",gap:6,background:u.id===currentUser.id?`${game.accent}18`:"rgba(255,255,255,.04)",border:`1px solid ${u.id===currentUser.id?game.accent+"44":"rgba(255,255,255,.09)"}`,borderRadius:20,padding:"4px 12px"}}>
                    <span style={{fontSize:16}}>{u.avatar}</span>
                    <span style={{color:u.id===currentUser.id?game.accent:"rgba(255,255,255,.65)",fontSize:13}}>{u.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {!isJoined ? (
              <button className={canAfford ? "btn-gold" : ""} onClick={canAfford ? onJoin : undefined} style={{
                padding:"13px",borderRadius:10,fontSize:14,fontWeight:700,letterSpacing:3,textTransform:"uppercase",
                cursor:canAfford?"pointer":"not-allowed",
                background:canAfford?undefined:"rgba(255,255,255,.04)",
                border:canAfford?"none":"1px solid rgba(255,255,255,.08)",
                color:canAfford?"#06060e":"rgba(255,255,255,.2)",
              }}>
                {canAfford ? `Unirse · ${game.cost} créditos` : "Créditos insuficientes"}
              </button>
            ) : (
              <div style={{padding:"11px",borderRadius:10,textAlign:"center",background:`${game.accent}12`,border:`1px solid ${game.accent}38`,color:game.accent,fontSize:13,letterSpacing:.5}}>
                ✓ Ya estás participando en este juego
              </div>
            )}
            {game.participants.length > 0 && (
              <button onClick={onDraw} style={{
                padding:"13px",borderRadius:10,fontSize:14,fontWeight:700,letterSpacing:3,textTransform:"uppercase",
                fontFamily:"var(--font-title)",cursor:"pointer",
                background:"rgba(255,215,0,.1)",border:"2px solid rgba(255,215,0,.45)",
                color:"var(--gold-bright)",transition:"all .2s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,215,0,.18)";e.currentTarget.style.boxShadow="0 0 24px rgba(255,215,0,.28)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,215,0,.1)";e.currentTarget.style.boxShadow="none";}}>
                🏆 Sortear Ganador ({game.participants.length} participante{game.participants.length !== 1 ? "s" : ""})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Winner Modal ─────────────────────────────────────────────────────────────
function WinnerModal({ data, currentUser, onClose }) {
  const isWinner = data.user.id === currentUser?.id;
  const [confetti] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i, left: `${Math.random() * 100}%`,
      color: ["#FFD700","#FF6B6B","#4ECDC4","#00FF88","#C9A84C","#F38181"][i % 6],
      delay: `${Math.random() * .8}s`, dur: `${Math.random() * 1.4 + 1.2}s`,
      size: Math.random() * 10 + 5, round: Math.random() > .5,
    }))
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,.94)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-ui)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      {confetti.map(c => (
        <div key={c.id} style={{position:"fixed",left:c.left,top:"-10px",width:c.size,height:c.size,background:c.color,borderRadius:c.round?"50%":2,animation:`confettiFall ${c.dur} ${c.delay} ease-in both`}}/>
      ))}
      <div style={{width:"min(480px,92vw)",background:"#09091a",border:`2px solid ${isWinner?"#FFD700":"rgba(201,168,76,.4)"}`,borderRadius:24,padding:"46px 38px",textAlign:"center",boxShadow:`0 0 100px ${isWinner?"rgba(255,215,0,.28)":"rgba(201,168,76,.15)"}`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at top,${isWinner?"rgba(255,215,0,.07)":"rgba(201,168,76,.04)"},transparent 55%)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${isWinner?"#FFD700":"#C9A84C"},transparent)`}}/>
        <div style={{fontSize:66,lineHeight:1,marginBottom:14}}>{isWinner ? "🎉" : "🏆"}</div>
        <p style={{color:"rgba(255,255,255,.35)",fontSize:12,letterSpacing:4,textTransform:"uppercase",marginBottom:7}}>{isWinner ? "¡Felicitaciones!" : "Tenemos un ganador"}</p>
        <h1 style={{fontFamily:"var(--font-title)",fontSize:32,fontWeight:900,color:"#fff",letterSpacing:2,marginBottom:5}}>
          {data.user.avatar} {data.user.username}
        </h1>
        <p style={{color:"rgba(255,255,255,.38)",fontSize:15,marginBottom:24}}>
          ganó el sorteo de <strong style={{color:"rgba(255,255,255,.7)"}}>{data.game.name}</strong>
        </p>
        <div style={{background:"rgba(255,215,0,.09)",border:"2px solid rgba(255,215,0,.35)",borderRadius:14,padding:"18px",marginBottom:24}}>
          <p style={{color:"rgba(255,255,255,.35)",fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>Premio acumulado</p>
          <p className="shimmer-text" style={{fontFamily:"var(--font-title)",fontSize:46,fontWeight:900}}>{data.prize.toLocaleString()}</p>
          <p style={{color:"rgba(255,255,255,.35)",fontSize:13,letterSpacing:2}}>CRÉDITOS</p>
        </div>
        {isWinner && <p style={{color:"#00FF88",fontSize:13,marginBottom:18,letterSpacing:.5}}>✓ Créditos acreditados a tu cuenta</p>}
        <button className="btn-gold" onClick={onClose} style={{padding:"12px 40px",borderRadius:10,fontSize:13,fontWeight:700,letterSpacing:3,color:"#06060e",textTransform:"uppercase"}}>
          Continuar
        </button>
      </div>
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────
function AdminPanel({ users, setUsers, games, setGames, onLogout, onLobby }) {
  const [tab, setTab] = useState("users");
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");

  const saveCredits = (userId) => {
    const v = parseInt(editVal);
    if (!isNaN(v) && v >= 0) setUsers(prev => prev.map(u => u.id === userId ? {...u, credits: v} : u));
    setEditId(null); setEditVal("");
  };

  const resetGame = (gameId) => {
    setGames(prev => prev.map(g => g.id === gameId ? {...g, participants: []} : g));
  };

  const totalCr = users.reduce((s, u) => s + u.credits, 0);
  const activeGames = games.filter(g => g.participants.length > 0).length;

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",fontFamily:"var(--font-ui)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,opacity:.018,backgroundImage:"linear-gradient(rgba(78,205,196,1) 1px,transparent 1px),linear-gradient(90deg,rgba(78,205,196,1) 1px,transparent 1px)",backgroundSize:"64px 64px",pointerEvents:"none"}}/>
      <header style={{background:"rgba(7,7,15,.9)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(78,205,196,.18)",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>⚙️</span>
          <h2 style={{fontFamily:"var(--font-title)",fontSize:17,fontWeight:700,color:"#4ECDC4",letterSpacing:3}}>ADMINISTRACIÓN</h2>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn-outline" onClick={onLobby} style={{border:"1px solid rgba(201,168,76,.35)",color:"#C9A84C",padding:"6px 16px",borderRadius:7,fontSize:13,letterSpacing:.5}}>← Lobby</button>
          <button className="btn-outline" onClick={onLogout} style={{border:"1px solid rgba(255,100,100,.35)",color:"#FF6464",padding:"6px 16px",borderRadius:7,fontSize:13,letterSpacing:.5}}>Salir</button>
        </div>
      </header>
      <main style={{maxWidth:1100,margin:"0 auto",padding:"30px 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:28}}>
          {[
            {label:"Total Usuarios", val:users.length, icon:"👥", c:"#4ECDC4"},
            {label:"Créditos en circulación", val:totalCr.toLocaleString(), icon:"💰", c:"#FFD700"},
            {label:"Juegos con jugadores", val:activeGames, icon:"🎮", c:"#C9A84C"},
            {label:"Participaciones activas", val:games.reduce((s,g)=>s+g.participants.length,0), icon:"🎯", c:"#00FF88"},
          ].map(c => (
            <div key={c.label} className="card-in" style={{background:"rgba(255,255,255,.025)",border:`1px solid ${c.c}28`,borderRadius:12,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontSize:28}}>{c.icon}</span>
              <div>
                <p style={{color:"rgba(255,255,255,.32)",fontSize:11,letterSpacing:1.5,textTransform:"uppercase",marginBottom:1}}>{c.label}</p>
                <p style={{color:c.c,fontSize:22,fontWeight:700}}>{c.val}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:4,marginBottom:18}}>
          {["users","games"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:"8px 22px",borderRadius:8,fontSize:13,letterSpacing:1,fontWeight:600,cursor:"pointer",textTransform:"uppercase",fontFamily:"var(--font-ui)",transition:"all .2s",
              background:tab===t?"rgba(78,205,196,.13)":"transparent",
              border:`1px solid ${tab===t?"#4ECDC4":"rgba(255,255,255,.1)"}`,
              color:tab===t?"#4ECDC4":"rgba(255,255,255,.38)",
            }}>
              {t === "users" ? "👥 Usuarios" : "🎮 Juegos"}
            </button>
          ))}
        </div>
        {tab === "users" && (
          <div style={{background:"rgba(255,255,255,.018)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                  {["","Usuario","Rol","Créditos","Juegos activos","Acciones"].map(h => (
                    <th key={h} style={{padding:"12px 18px",textAlign:"left",color:"rgba(255,255,255,.3)",fontSize:11,letterSpacing:2,textTransform:"uppercase",fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const actGames = games.filter(g => g.participants.includes(user.id)).length;
                  return (
                    <tr key={user.id} className="tr-row" style={{borderBottom:"1px solid rgba(255,255,255,.04)",background:i%2?"rgba(255,255,255,.01)":"transparent",animationDelay:`${i*.04}s`,animationFillMode:"both"}}>
                      <td style={{padding:"10px 18px",fontSize:22}}>{user.avatar}</td>
                      <td style={{padding:"10px 18px"}}><span style={{color:"#fff",fontWeight:600,fontSize:14}}>{user.username}</span></td>
                      <td style={{padding:"10px 18px"}}>
                        <span style={{padding:"2px 10px",borderRadius:12,fontSize:11,letterSpacing:.5,
                          background:user.isAdmin?"rgba(78,205,196,.14)":"rgba(255,255,255,.05)",
                          border:`1px solid ${user.isAdmin?"rgba(78,205,196,.35)":"rgba(255,255,255,.1)"}`,
                          color:user.isAdmin?"#4ECDC4":"rgba(255,255,255,.45)"}}>
                          {user.isAdmin ? "Admin" : "Jugador"}
                        </span>
                      </td>
                      <td style={{padding:"10px 18px"}}>
                        {editId === user.id ? (
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveCredits(user.id)} className="input-field" style={{width:90,padding:"4px 9px",borderRadius:6,fontSize:13}} autoFocus/>
                            <button onClick={()=>saveCredits(user.id)} style={{background:"rgba(78,205,196,.12)",border:"1px solid rgba(78,205,196,.4)",color:"#4ECDC4",padding:"4px 9px",borderRadius:6,cursor:"pointer",fontSize:13,fontFamily:"var(--font-ui)"}}>✓</button>
                            <button onClick={()=>{setEditId(null);setEditVal("");}} style={{background:"rgba(255,100,100,.1)",border:"1px solid rgba(255,100,100,.3)",color:"#FF6464",padding:"4px 9px",borderRadius:6,cursor:"pointer",fontSize:13,fontFamily:"var(--font-ui)"}}>✕</button>
                          </div>
                        ) : (
                          <span style={{color:"var(--gold-bright)",fontWeight:700,fontSize:15}}>{user.credits.toLocaleString()}</span>
                        )}
                      </td>
                      <td style={{padding:"10px 18px"}}>
                        <span style={{color:actGames>0?"#00FF88":"rgba(255,255,255,.2)",fontSize:13}}>
                          {actGames > 0 ? `${actGames} activo${actGames>1?"s":""}` : "—"}
                        </span>
                      </td>
                      <td style={{padding:"10px 18px"}}>
                        <button onClick={()=>{setEditId(user.id);setEditVal(String(user.credits));}} style={{background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.3)",color:"#C9A84C",padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"var(--font-ui)",letterSpacing:.5}}>
                          ✏ Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {tab === "games" && (
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {games.map((game, i) => {
              const pUsers = game.participants.map(id => users.find(u => u.id === id)).filter(Boolean);
              return (
                <div key={game.id} className="card-in" style={{background:"rgba(255,255,255,.02)",border:`1px solid ${pUsers.length>0?game.accent+"3a":"rgba(255,255,255,.07)"}`,borderRadius:13,padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,animationDelay:`${i*.05}s`,animationFillMode:"both"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,flex:1,minWidth:0}}>
                    <span style={{fontSize:28,flexShrink:0}}>{game.icon}</span>
                    <div style={{minWidth:0}}>
                      <h4 style={{fontFamily:"var(--font-title)",color:"#fff",fontSize:15,marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{game.name}</h4>
                      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                        <span style={{color:"rgba(255,255,255,.35)",fontSize:12}}>Entrada: <strong style={{color:game.accent}}>{game.cost} cr.</strong></span>
                        <span style={{color:"rgba(255,255,255,.35)",fontSize:12}}>Pozo: <strong style={{color:"var(--gold-bright)"}}>{(game.cost*game.participants.length).toLocaleString()} cr.</strong></span>
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                    {pUsers.length > 0 && (
                      <div style={{display:"flex",gap:3}}>
                        {pUsers.map(u => <span key={u.id} title={u.username} style={{fontSize:18}}>{u.avatar}</span>)}
                      </div>
                    )}
                    <span style={{color:pUsers.length>0?"#00FF88":"rgba(255,255,255,.2)",fontSize:13,minWidth:70,textAlign:"right"}}>
                      {game.participants.length}/{game.maxPlayers} jug.
                    </span>
                    {pUsers.length > 0 && (
                      <button onClick={() => resetGame(game.id)} style={{background:"rgba(255,100,100,.09)",border:"1px solid rgba(255,100,100,.3)",color:"#FF6464",padding:"5px 13px",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"var(--font-ui)",letterSpacing:.5}}>
                        Reset
                      </button>
                    )}
                    {pUsers.length === 0 && <span style={{color:"rgba(255,255,255,.15)",fontSize:12,fontStyle:"italic"}}>Sin participantes</span>}
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

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function RoyalPlay() {
  const [users, setUsers]           = useState(USERS_INIT);
  const [games, setGames]           = useState(GAMES_INIT);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView]             = useState("login");
  const [selectedGame, setSelectedGame] = useState(null);
  const [winnerData, setWinnerData] = useState(null);
  const [loginForm, setLoginForm]   = useState({username:"",password:""});
  const [loginError, setLoginError] = useState("");
  const [notif, setNotif]           = useState(null);

  const toast = useCallback((msg, type = "info") => {
    setNotif({msg, type});
    setTimeout(() => setNotif(null), 2800);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fresh = users.find(u => u.id === currentUser.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) setCurrentUser(fresh);
    }
  }, [users]);

  useEffect(() => {
    if (selectedGame) {
      const fresh = games.find(g => g.id === selectedGame.id);
      if (fresh) setSelectedGame(fresh);
    }
  }, [games]);

  const handleLogin = () => {
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) { setCurrentUser(user); setView(user.isAdmin ? "admin" : "lobby"); setLoginError(""); }
    else setLoginError("Usuario o contraseña incorrectos");
  };

  const handleLogout = () => { setCurrentUser(null); setView("login"); setLoginForm({username:"",password:""}); };

  const handleJoin = (game) => {
    if (!currentUser) return;
    if (game.participants.includes(currentUser.id)) { toast("Ya estás participando en este juego","warn"); return; }
    const fresh = users.find(u => u.id === currentUser.id);
    if (fresh.credits < game.cost) { toast("Créditos insuficientes","error"); return; }
    setUsers(prev => prev.map(u => u.id === currentUser.id ? {...u, credits: u.credits - game.cost} : u));
    setGames(prev => prev.map(g => g.id === game.id ? {...g, participants: [...g.participants, currentUser.id]} : g));
    toast(`¡Te uniste a ${game.name}!`, "success");
  };

  const handleDraw = (game) => {
    if (game.participants.length === 0) return;
    const winnerId = game.participants[Math.floor(Math.random() * game.participants.length)];
    const winnerUser = users.find(u => u.id === winnerId);
    const prize = game.cost * game.participants.length;
    setUsers(prev => prev.map(u => u.id === winnerId ? {...u, credits: u.credits + prize} : u));
    setGames(prev => prev.map(g => g.id === game.id ? {...g, participants: []} : g));
    setSelectedGame(null);
    setWinnerData({user: winnerUser, prize, game});
  };

  return (
    <>
      <Toast notif={notif}/>
      {view === "login"  && <LoginScreen form={loginForm} setForm={setLoginForm} onLogin={handleLogin} error={loginError}/>}
      {view === "lobby"  && currentUser && <GameLobby currentUser={currentUser} games={games} users={users} onSelectGame={setSelectedGame} onLogout={handleLogout} onAdmin={() => setView("admin")}/>}
      {view === "admin"  && currentUser && <AdminPanel users={users} setUsers={setUsers} games={games} setGames={setGames} onLogout={handleLogout} onLobby={() => setView("lobby")}/>}
      {selectedGame && <GameModal game={selectedGame} currentUser={currentUser} users={users} onJoin={() => handleJoin(selectedGame)} onDraw={() => handleDraw(selectedGame)} onClose={() => setSelectedGame(null)}/>}
      {winnerData && <WinnerModal data={winnerData} currentUser={currentUser} onClose={() => setWinnerData(null)}/>}
    </>
  );
}