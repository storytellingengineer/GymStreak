import React,{useEffect,useMemo,useState}from"react";
import{createRoot}from"react-dom/client";
import{Activity,ArrowLeft,ArrowRight,BarChart3,Brain,CalendarDays,Check,ChevronRight,Clock3,Dumbbell,Flame,History as HistoryIcon,Info,Play,RotateCcw,Settings as SettingsIcon,Sparkles,Timer,Trophy,TrendingUp,UserRound,Weight,Plus}from"lucide-react";
import"./styles.css";

const PLAN={Push:[["Bench Press",3,8],["Incline Dumbbell Press",3,10],["Shoulder Press",3,10],["Lateral Raise",3,12],["Triceps Pushdown",3,12]],Pull:[["Lat Pulldown",3,10],["Seated Cable Row",3,10],["Dumbbell Row",3,10],["Face Pull",3,12],["Dumbbell Curl",3,12]],Legs:[["Squat",3,8],["Leg Press",3,10],["Romanian Deadlift",3,10],["Leg Curl",3,12],["Calf Raise",3,15]]};
const ORDER=["Push","Pull","Legs"],HKEY="gymstreak_history_v2",PKEY="gymstreak_profile_v1";
const date=()=>{const d=new Date();return[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const shift=(s,n)=>{const d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const fmt=s=>new Date(s+"T12:00:00").toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
const short=s=>new Date(s+"T12:00:00").toLocaleDateString(undefined,{day:"numeric",month:"short"});
const volume=w=>(w.sets||[]).reduce((n,s)=>n+(Number(s.weight)||0)*(Number(s.reps)||0),0);
const streak=h=>{const ds=new Set(h.map(x=>x.date));let d=date();if(!ds.has(d))d=shift(d,-1);let n=0;while(ds.has(d)){n++;d=shift(d,-1)}return n};
const nextType=h=>{if(!h.length)return"Push";const x=h.slice().sort((a,b)=>a.date.localeCompare(b.date)).at(-1);return ORDER[(ORDER.indexOf(x.type)+1+3)%3]};
const week=()=>{const n=new Date(),day=n.getDay(),m=new Date(n);m.setDate(n.getDate()-(day===0?6:day-1));return Array.from({length:7},(_,i)=>{const d=new Date(m);d.setDate(m.getDate()+i);return{date:[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-"),label:d.toLocaleDateString(undefined,{weekday:"narrow"})}})};
const previous=(h,name)=>{for(const w of h.slice().sort((a,b)=>b.date.localeCompare(a.date))){const s=(w.sets||[]).find(x=>x.exercise===name&&Number(x.weight)>0);if(s)return s}return null};

function App(){
 const[h,setH]=useState(()=>{const x=JSON.parse(localStorage.getItem(HKEY)||"[]");return Array.isArray(x)?x:[]});
 const[p,setP]=useState(()=>JSON.parse(localStorage.getItem(PKEY)||'{"name":"","goal":"Build consistency","unit":"kg"}'));
 const[tab,setTab]=useState("home"),[session,setSession]=useState(null),[seconds,setSeconds]=useState(0),[install,setInstall]=useState(null),[online,setOnline]=useState(navigator.onLine);
 useEffect(()=>localStorage.setItem(HKEY,JSON.stringify(h)),[h]);useEffect(()=>localStorage.setItem(PKEY,JSON.stringify(p)),[p]);
 useEffect(()=>{const a=e=>{e.preventDefault();setInstall(e)},on=()=>setOnline(true),off=()=>setOnline(false);addEventListener("beforeinstallprompt",a);addEventListener("online",on);addEventListener("offline",off);if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{});return()=>{removeEventListener("beforeinstallprompt",a);removeEventListener("online",on);removeEventListener("offline",off)}},[]);
 useEffect(()=>{if(!session)return;const id=setInterval(()=>setSeconds(x=>x+1),1000);return()=>clearInterval(id)},[session]);
 const type=useMemo(()=>nextType(h),[h]),today=date(),done=h.some(x=>x.date===today),st=streak(h),stats={workouts:h.length,minutes:h.reduce((n,x)=>n+(x.duration||0),0),volume:h.reduce((n,x)=>n+volume(x),0),week:h.filter(x=>x.date>=shift(today,-6)).length};
 const start=(kind=type)=>{setSeconds(0);setSession({type:kind,exercises:PLAN[kind].map(([name,sets,reps])=>{const old=previous(h,name);return{name,targetSets:sets,targetReps:reps,sets:Array.from({length:sets},()=>({weight:old?.weight||"",reps:old?.reps||reps,logged:false}))}})});setTab("workout")};
 const edit=(ei,si,key,value)=>setSession(s=>({...s,exercises:s.exercises.map((e,i)=>i===ei?{...e,sets:e.sets.map((x,j)=>j===si?{...x,[key]:value}:x)}:e)}));
 const toggle=(ei,si)=>setSession(s=>({...s,exercises:s.exercises.map((e,i)=>i===ei?{...e,sets:e.sets.map((x,j)=>j===si?{...x,logged:!x.logged}:x)}:e)}));
 const finish=()=>{const sets=session.exercises.flatMap(e=>e.sets.filter(s=>s.logged).map(s=>({exercise:e.name,weight:Number(s.weight)||0,reps:Number(s.reps)||0})));if(!sets.length)return;setH(x=>[...x,{id:Date.now(),date:today,type:session.type,duration:Math.max(1,Math.round(seconds/60)),sets}]);setSession(null);setTab("home")};
 const reset=()=>{localStorage.removeItem(HKEY);localStorage.removeItem(PKEY);setH([]);setP({name:"",goal:"Build consistency",unit:"kg"});setSession(null);setTab("home")};
 async function installApp(){if(!install)return;install.prompt();await install.userChoice;setInstall(null)}
 return <div className="app"><header className="topbar"><div className="brand"><div className="brandMark"><Flame size={19}/></div>GymStreak</div><div className="topActions">{!online&&<span className="offline">Offline</span>}{install&&<button className="install" onClick={installApp}>Install</button>}</div></header><main>
 {tab==="home"&&<Home h={h} st={st} type={type} done={done} start={start} stats={stats} p={p}/>}
 {tab==="workout"&&session&&<Workout s={session} sec={seconds} edit={edit} toggle={toggle} finish={finish} back={()=>{setSession(null);setTab("home")}} unit={p.unit}/>}
 {tab==="history"&&<History h={h}/>}
 {tab==="progress"&&<Progress h={h} unit={p.unit}/>}
 {tab==="coach"&&<Coach type={type} h={h} start={start}/>}
 {tab==="settings"&&<Settings p={p} setP={setP} reset={reset} install={installApp}/>}
 </main><nav className="nav"><N a={tab==="home"} c={()=>setTab("home")} i={<Activity/>} t="Today"/><N a={tab==="history"} c={()=>setTab("history")} i={<HistoryIcon/>} t="History"/><N a={tab==="progress"} c={()=>setTab("progress")} i={<TrendingUp/>} t="Progress"/><N a={tab==="coach"} c={()=>setTab("coach")} i={<Brain/>} t="Coach"/><N a={tab==="settings"} c={()=>setTab("settings")} i={<SettingsIcon/>} t="Settings"/></nav></div>
}
function N({a,c,i,t}){return <button className={a?"active":""} onClick={c}>{i}<span>{t}</span></button>}
function Stat({i,v,t}){return <div className="stat card">{i}<strong>{v}</strong><span>{t}</span></div>}

function Home({h,st,type,done,start,stats,p}){
 const ds=new Set(h.map(x=>x.date));
 return <section className="stack"><div className="hero card"><div className="heroHead"><div><div className="eyebrow"><Flame size={15}/>CONSISTENCY</div><div className="streak">{st}<span> day streak</span></div></div><div className="avatar"><UserRound size={18}/></div></div><div className="week">{week().map(x=><div className={ds.has(x.date)?"day done":"day"} key={x.date}><span>{x.label}</span><b>{ds.has(x.date)?"✓":"·"}</b></div>)}</div></div>
 <div className="welcome"><span className="eyebrow">TODAY'S MISSION</span><h1>{p.name?"Ready, "+p.name.split(" ")[0]+"?":"Build the streak."}</h1><p>{done?"Today's workout is logged. Come back tomorrow for the next mission.":"One session. One check. Keep moving."}</p></div>
 <div className="sectionTitle"><div><span className="eyebrow">RECOMMENDED</span><h2>{type} Day</h2></div><span className="pill">{done?"DONE":"READY"}</span></div>
 <button className="workoutCard card clickable" onClick={()=>!done&&start()}><div className="workoutIcon"><Dumbbell/></div><div className="grow"><strong>{type} Day</strong><p>{PLAN[type].length} exercises · {PLAN[type].reduce((n,x)=>n+x[1],0)} target sets · ~45 min</p></div><ChevronRight/></button>{!done&&<button className="primary" onClick={()=>start()}><Play size={18} fill="currentColor"/>Start workout<ArrowRight size={18}/></button>}
 <div className="grid2"><Stat i={<Trophy/>} v={stats.workouts} t="workouts"/><Stat i={<Clock3/>} v={stats.minutes} t="minutes"/><Stat i={<Weight/>} v={Math.round(stats.volume).toLocaleString()} t={p.unit+" volume"}/><Stat i={<CalendarDays/>} v={stats.week} t="last 7 days"/></div>
 <div className="widget card"><div><div className="widgetTitle">GymStreak <Flame size={14}/></div><b>🔥 {st} DAY STREAK</b><span>{done?"Workout complete":type+" · Start today's mission"}</span></div><div className="widgetButton">WIDGET</div></div></section>
}
function Workout({s,sec,edit,toggle,finish,back,unit}){
 const total=s.exercises.reduce((n,e)=>n+e.targetSets,0);
 const done=s.exercises.reduce((n,e)=>n+e.sets.filter(x=>x.logged).length,0);
 const pct=Math.round(done/Math.max(1,total)*100);
 return (
  <section className="stack">
   <div className="sectionTitle">
    <button className="back" onClick={back}><ArrowLeft/>Back</button>
    <div className="workoutTitle"><span className="eyebrow">WORKOUT</span><h1>{s.type} Day</h1></div>
    <span className="timer"><Timer size={15}/>{String(Math.floor(sec/60)).padStart(2,"0")}:{String(sec%60).padStart(2,"0")}</span>
   </div>
   <div className="progress card">
    <div><b>{done}/{total} sets</b><span>{pct}%</span></div>
    <div className="bar"><i style={{width:pct+"%"}}/></div>
   </div>
   {s.exercises.map((e,ei)=>(
    <div className="exercise card" key={e.name}>
     <div className="exerciseTop">
      <div><strong>{e.name}</strong><p>{e.targetSets} × {e.targetReps} reps · working weight</p></div>
      <span>{e.sets.filter(x=>x.logged).length}/{e.targetSets}</span>
     </div>
     <div className="setHeader"><span>SET</span><span>WEIGHT ({unit})</span><span>REPS</span><span/></div>
     {e.sets.map((x,si)=>(
      <div className={x.logged?"setRow logged":"setRow"} key={si}>
       <b>{si+1}</b>
       <input inputMode="decimal" value={x.weight} onChange={ev=>edit(ei,si,"weight",ev.target.value)} placeholder="0"/>
       <input inputMode="numeric" value={x.reps} onChange={ev=>edit(ei,si,"reps",ev.target.value)} placeholder={String(e.targetReps)}/>
       <button className="setCheck" onClick={()=>toggle(ei,si)}>{x.logged?<Check/>:<Plus/>}</button>
      </div>
     ))}
    </div>
   ))}
   <button className="primary" onClick={finish} disabled={!done}><Check/>Finish workout · {done} sets</button>
  </section>
 );
}
function History({h}){return <section className="stack"><div className="sectionTitle"><div><span className="eyebrow">YOUR JOURNEY</span><h1>Workout history</h1></div></div>{h.length?h.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(x=><div className="historyRow card" key={x.id}><div className="historyIcon"><Dumbbell/></div><div className="grow"><strong>{x.type} Day</strong><p>{fmt(x.date)} · {(x.sets||[]).length} sets · {x.duration} min</p><span className="volume">{volume(x)?Math.round(volume(x)).toLocaleString()+" volume":"No weight logged"}</span></div><Check/></div>):<div className="empty card"><Dumbbell size={30}/><strong>No workouts yet</strong><p>Start your first mission and your training history will appear here.</p></div>}</section>}
function Progress({h,unit}){const names=[...new Set(h.flatMap(w=>(w.sets||[]).map(x=>x.exercise).filter(Boolean)))],bests=names.map(name=>{const rows=h.flatMap(w=>(w.sets||[]).filter(x=>x.exercise===name).map(x=>({...x,date:w.date}))).filter(x=>Number(x.weight)>0).sort((a,b)=>b.date.localeCompare(a.date));return{name,max:rows.reduce((m,x)=>Math.max(m,Number(x.weight)||0),0),last:rows[0]}}).sort((a,b)=>b.max-a.max),mx=Math.max(1,...h.map(volume));return <section className="stack"><div className="sectionTitle"><div><span className="eyebrow">PERFORMANCE</span><h1>Progress</h1></div><BarChart3/></div><div className="grid2"><div className="metric card"><span>Total volume</span><strong>{Math.round(h.reduce((n,x)=>n+volume(x),0)).toLocaleString()}</strong><small>{unit} lifted</small></div><div className="metric card"><span>Sessions</span><strong>{h.length}</strong><small>all time</small></div></div><div className="card chartCard"><div className="cardTitle"><strong>Session volume</strong><span>recent</span></div>{h.slice().sort((a,b)=>a.date.localeCompare(b.date)).slice(-8).map(w=><div className="chartRow" key={w.id}><span>{short(w.date)}</span><div><i style={{width:Math.round(volume(w)/mx*100)+"%"}}/></div><b>{Math.round(volume(w)).toLocaleString()}</b></div>)}{!h.length&&<div className="emptyMini">Complete workouts to see your trend.</div>}</div><div className="card listCard"><div className="cardTitle"><strong>Personal bests</strong><span>{unit}</span></div>{bests.length?bests.slice(0,8).map(x=><div className="pbRow" key={x.name}><div><strong>{x.name}</strong><small>Latest: {x.last.weight} {unit} × {x.last.reps}</small></div><b>{x.max} {unit}</b></div>):<div className="emptyMini">Your logged weights will create progression data.</div>}</div></section>}
function Coach({type,h,start}){const last=h.slice().sort((a,b)=>b.date.localeCompare(a.date))[0],s=streak(h);return <section className="stack"><div className="sectionTitle"><div><span className="eyebrow">COACH</span><h1>Training guidance</h1></div><Sparkles/></div><div className="coach card"><div className="coachIcon"><Brain/></div><h2>{type} Day</h2><p>{last?"Your last logged session was "+last.type+" on "+short(last.date)+".":"No training history yet. Start with a simple push session."}</p><div className="reason"><strong>Current signal</strong><span>{s?"You have a "+s+"-day streak. Keep the next session simple and consistent.":"Your priority is establishing the first repeatable workout habit."}</span></div><button className="primary" onClick={()=>start(type)}>Start recommendation<ArrowRight/></button></div><div className="card tips"><strong>Coach roadmap</strong><p>Next: recovery-aware recommendations, progressive overload, exercise substitutions, and an optional LLM coach through a secure backend.</p></div></section>}
function Settings({p,setP,reset,install}){return <section className="stack"><div className="sectionTitle"><div><span className="eyebrow">PREFERENCES</span><h1>Settings</h1></div><SettingsIcon/></div><div className="card settings"><div className="settingBlock"><label><UserRound/>Name</label><input value={p.name} onChange={e=>setP({...p,name:e.target.value})} placeholder="Your name"/></div><div className="settingBlock"><label><Trophy/>Primary goal</label><select value={p.goal} onChange={e=>setP({...p,goal:e.target.value})}><option>Build consistency</option><option>Build strength</option><option>Lose fat</option><option>Build muscle</option></select></div><div className="settingBlock"><label><Weight/>Weight unit</label><select value={p.unit} onChange={e=>setP({...p,unit:e.target.value})}><option>kg</option><option>lb</option></select></div></div><div className="card appInfo"><div><strong>GymStreak</strong><p>Local-first PWA. Data stays in this browser until cloud sync is added.</p></div><button className="secondary" onClick={install}>Install app</button></div><button className="danger" onClick={reset}><RotateCcw size={16}/>Reset all local data</button><div className="note"><Info size={16}/><span>A real Android home-screen widget needs a native Android layer; Vercel alone cannot create one. We will add that in the mobile phase.</span></div></section>}
createRoot(document.getElementById("root")).render(<App/>);