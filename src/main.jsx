import React,{useEffect,useMemo,useState}from"react";
import{createRoot}from"react-dom/client";
import{Activity,ArrowRight,Brain,Check,ChevronRight,Dumbbell,Flame,History as HistoryIcon,Play,RotateCcw,Sparkles,Timer,Trophy}from"lucide-react";
import"./styles.css";

const PLAN={
 Push:[["Bench Press",3,8],["Incline Dumbbell Press",3,10],["Shoulder Press",3,10],["Lateral Raise",3,12],["Triceps Pushdown",3,12]],
 Pull:[["Lat Pulldown",3,10],["Seated Cable Row",3,10],["Dumbbell Row",3,10],["Face Pull",3,12],["Dumbbell Curl",3,12]],
 Legs:[["Squat",3,8],["Leg Press",3,10],["Romanian Deadlift",3,10],["Leg Curl",3,12],["Calf Raise",3,15]]
};

const seed=[
 {id:1,date:"2026-09-25",type:"Push",duration:44,sets:15},
 {id:2,date:"2026-09-26",type:"Pull",duration:41,sets:15}
];

const today=()=>new Date().toISOString().slice(0,10);
const addDays=(date,days)=>{const d=new Date(date+"T00:00:00");d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)};

function calcStreak(history){
 const dates=new Set(history.map(x=>x.date));
 let cursor=today();
 if(!dates.has(cursor))cursor=addDays(cursor,-1);
 let count=0;
 while(dates.has(cursor)){count++;cursor=addDays(cursor,-1)}
 return count;
}

function recommend(history){
 if(!history.length)return"Push";
 const order=["Push","Pull","Legs"];
 const last=history[history.length-1].type;
 return order[(Math.max(0,order.indexOf(last))+1)%order.length];
}

function App(){
 const[history,setHistory]=useState(()=>JSON.parse(localStorage.getItem("gymstreak_history")||"null")||seed);
 const[tab,setTab]=useState("home");
 const[session,setSession]=useState(null);
 const[seconds,setSeconds]=useState(0);

 useEffect(()=>localStorage.setItem("gymstreak_history",JSON.stringify(history)),[history]);
 useEffect(()=>{
  if(!session)return;
  const timer=setInterval(()=>setSeconds(s=>s+1),1000);
  return()=>clearInterval(timer);
 },[session]);

 const type=useMemo(()=>recommend(history),[history]);
 const doneToday=history.some(x=>x.date===today());
 const streak=calcStreak(history);

 function start(){
  setSeconds(0);
  setSession({type,exercises:PLAN[type].map(([name,sets,reps])=>({name,sets,reps,done:0}))});
  setTab("workout");
 }

 function setDone(index){
  setSession(s=>({...s,exercises:s.exercises.map((e,i)=>i===index?{...e,done:Math.min(e.sets,e.done+1)}:e)}));
 }

 function finish(){
  const sets=session.exercises.reduce((n,e)=>n+e.done,0);
  if(!sets)return;
  setHistory(h=>[...h,{id:Date.now(),date:today(),type:session.type,duration:Math.max(1,Math.round(seconds/60)),sets}]);
  setSession(null);
  setTab("home");
 }

 function reset(){
  localStorage.removeItem("gymstreak_history");
  setHistory([]);
  setSession(null);
  setTab("home");
 }

 return <div className="app">
  <header className="topbar">
   <div className="brand"><div className="brandMark"><Flame size={19}/></div>GymStreak</div>
   <button className="ghost" onClick={reset}><RotateCcw size={15}/>Reset demo</button>
  </header>

  <main>
   {tab==="home"&&<Home streak={streak} history={history} type={type} doneToday={doneToday} start={start}/>}
   {tab==="workout"&&session&&<Workout session={session} seconds={seconds} setDone={setDone} finish={finish}/>}
   {tab==="history"&&<History history={history}/>}
   {tab==="coach"&&<Coach type={type} history={history} start={start}/>}
  </main>

  <nav className="nav">
   <button className={tab==="home"?"active":""} onClick={()=>setTab("home")}><Activity/>Home</button>
   <button className={tab==="history"?"active":""} onClick={()=>setTab("history")}><HistoryIcon/>History</button>
   <button className={tab==="coach"?"active":""} onClick={()=>setTab("coach")}><Brain/>AI Coach</button>
  </nav>
 </div>
}

function Home({streak,history,type,doneToday,start}){
 return <section className="stack">
  <div className="hero card">
   <div className="eyebrow"><Flame size={16}/>CONSISTENCY</div>
   <div className="streak">{streak}<span> day streak</span></div>
   <div className="week">{["M","T","W","T","F","S","S"].map((d,i)=><div className={i<Math.min(7,history.length)?"day done":"day"} key={i}><span>{d}</span><b>{i<Math.min(7,history.length)?"✓":"·"}</b></div>)}</div>
  </div>

  <div className="sectionTitle">
   <div><span className="eyebrow">TODAY'S MISSION</span><h1>{doneToday?"Workout complete":type}</h1></div>
   <span className="pill">{doneToday?"DONE":"READY"}</span>
  </div>

  <div className="workoutCard card">
   <div className="workoutIcon"><Dumbbell/></div>
   <div className="grow"><strong>{doneToday?"Nice work. Protect the streak.":type+" Day"}</strong><p>{PLAN[type].length} exercises · about 45 min</p></div>
   <ChevronRight/>
  </div>

  {!doneToday&&<button className="primary" onClick={start}><Play size={18} fill="currentColor"/>Start workout<ArrowRight size={18}/></button>}

  <div className="grid2">
   <div className="stat card"><Trophy/><strong>{history.length}</strong><span>workouts</span></div>
   <div className="stat card"><Timer/><strong>{history.reduce((a,b)=>a+b.duration,0)}</strong><span>minutes</span></div>
  </div>

  <div className="sectionTitle"><div><span className="eyebrow">WIDGET PREVIEW</span><h2>Phone home screen</h2></div></div>
  <div className="widget card">
   <div><div className="widgetTitle">GymStreak <Flame size={15}/></div><b>🔥 {streak} DAY STREAK</b><span>{doneToday?"Workout complete":type+" · Start today's mission"}</span></div>
   <div className="widgetButton">OPEN</div>
  </div>
 </section>
}

function Workout({session,seconds,setDone,finish}){
 const total=session.exercises.reduce((n,e)=>n+e.sets,0);
 const done=session.exercises.reduce((n,e)=>n+e.done,0);
 const pct=Math.round(done/Math.max(1,total)*100);

 return <section className="stack">
  <div className="sectionTitle">
   <div><span className="eyebrow">WORKOUT</span><h1>{session.type} Day</h1></div>
   <span className="timer"><Timer size={15}/>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</span>
  </div>

  <div className="progress card">
   <div><b>{done}/{total} sets</b><span>{pct}%</span></div>
   <div className="bar"><i style={{width:pct+"%"}}/></div>
  </div>

  {session.exercises.map((e,i)=><div className="exercise card" key={e.name}>
   <div className="exerciseTop"><div><strong>{e.name}</strong><p>{e.sets} × {e.reps} reps</p></div><span>{e.done}/{e.sets}</span></div>
   <button className={e.done===e.sets?"setBtn done":"setBtn"} disabled={e.done===e.sets} onClick={()=>setDone(i)}>
    {e.done===e.sets?<><Check/>Complete</>:<>Log set<ChevronRight/></>}
   </button>
  </div>)}

  <button className="primary" onClick={finish} disabled={!done}><Check/>Finish workout</button>
 </section>
}

function History({history}){
 return <section className="stack">
  <div className="sectionTitle"><div><span className="eyebrow">YOUR JOURNEY</span><h1>Workout history</h1></div></div>
  {history.length?history.slice().reverse().map(x=><div className="historyRow card" key={x.id}>
   <div className="historyIcon"><Dumbbell/></div><div className="grow"><strong>{x.type} Day</strong><p>{x.date} · {x.sets} sets · {x.duration} min</p></div><Check/>
  </div>):<div className="empty card">No workouts yet. Start your first mission.</div>}
 </section>
}

function Coach({type,history,start}){
 const last=history[history.length-1];
 return <section className="stack">
  <div className="sectionTitle"><div><span className="eyebrow">AI COACH</span><h1>Today's recommendation</h1></div><Sparkles/></div>
  <div className="coach card">
   <div className="coachIcon"><Brain/></div><h2>{type} Day</h2>
   <p>Based on your recent training history, this is the next session in your rotation.</p>
   <div className="reason"><strong>Why this?</strong><span>{last?"Last session was "+last.type+". The plan rotates muscle groups and keeps your training balanced.":"Start with a simple push session and build your history."}</span></div>
   <button className="primary" onClick={start}>Start recommended workout<ArrowRight/></button>
  </div>
  <div className="card tips"><strong>Next evolution</strong><p>Recovery-aware recommendations, progression targets, exercise substitutions and a real LLM coach come next.</p></div>
 </section>
}

createRoot(document.getElementById("root")).render(<App/>);
