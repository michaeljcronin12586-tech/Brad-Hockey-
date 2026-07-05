import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MODES, MODE_ORDER, TOTAL_WEEKS, phaseForWeek, resolveContent, FIELD_META, targetReps } from "./program.js";

const K={logs:"ht3:logs",done:"ht3:done",week:"ht3:week",mode:"ht3:mode",day:"ht3:day"};
const load=(k,f)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):f;}catch{return f;}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};

// logs keyed by mode|week|trackId so history + recs follow the exercise across weeks
const lk=(m,w,tid)=>`${m}|${w}|${tid}`;
const setHas=(s)=>s&&(s.weight||s.reps||s.time);
const entryHas=(e)=>e&&(((e.sets||[]).some(setHas))||e.notes);
const parseTime=(t)=>{const m=/([\d.]+)/.exec(String(t||""));return m?parseFloat(m[1]):null;};

function summarize(e){
  const sets=(e&&e.sets||[]).filter(setHas);
  if(!sets.length)return "";
  return sets.map(s=>s.weight&&s.reps?`${s.weight}x${s.reps}`:s.weight?`${s.weight}lb`:s.time?s.time:s.reps?`${s.reps}`:"").filter(Boolean).join(", ");
}

// ---- RECOMMENDATION ENGINE ----
// weight/reps: if last logged week hit target reps on every set -> +inc lb; else repeat weight.
// time: show best (lowest) past time to beat.
function recommend(item, mode, week, logs){
  let lastW=null,lastE=null,bestTime=null;
  for(let w=week-1;w>=1;w--){
    const e=logs[lk(mode,w,item.trackId)];
    if(entryHas(e)){ if(!lastE){lastE=e;lastW=w;} 
      (e.sets||[]).forEach(s=>{const t=parseTime(s.time); if(t!=null&&(bestTime==null||t<bestTime))bestTime=t;});
    }
  }
  if(item.log.includes("time")){
    if(bestTime!=null)return {text:`Beat your best: ${bestTime}s`,tone:"beat"};
    return {text:"First timed session — set the baseline.",tone:"base"};
  }
  if(item.log.includes("weight")){
    if(!lastE)return {text:"No baseline yet — log a weight he owns with clean form.",tone:"base"};
    const sets=(lastE.sets||[]).filter(setHas);
    const tr=targetReps(item.target);
    const wts=sets.map(s=>parseFloat(s.weight)).filter(n=>!isNaN(n));
    const topW=wts.length?Math.max(...wts):null;
    const allHit=tr!=null&&sets.length>0&&sets.every(s=>parseFloat(s.reps)>=tr);
    const inc=item.inc||5;
    if(topW==null)return {text:`Last wk (${lastW}): ${summarize(lastE)}`,tone:"info"};
    if(allHit)return {text:`Hit all sets at ${topW} lb last wk — try ${topW+inc} lb`,tone:"up"};
    return {text:`Repeat ${topW} lb — hit every set of ${tr??"target"} reps first`,tone:"hold"};
  }
  if(lastE)return {text:`Last wk (${lastW}): ${summarize(lastE)}`,tone:"info"};
  return null;
}

function Lamp({checked,onClick,accent}){
  return <button onClick={onClick} aria-pressed={checked} aria-label="toggle done"
    style={{width:28,height:28,borderRadius:"50%",flexShrink:0,cursor:"pointer",padding:0,transition:"all 160ms ease",
      border:`2px solid ${checked?accent:"rgba(255,255,255,0.25)"}`,
      background:checked?`radial-gradient(circle at 35% 30%, ${accent}, ${accent}CC 55%, ${accent}66 100%)`:"rgba(255,255,255,0.04)",
      boxShadow:checked?`0 0 12px 2px ${accent}99`:"none"}}/>;
}

function Inp({field,value,onChange,accent}){
  const m=FIELD_META[field];
  return <input type={m.type} inputMode={m.type==="number"?"decimal":"text"} value={value||""} placeholder={m.ph}
    onChange={e=>onChange(e.target.value)}
    style={{width:field==="time"?84:58,padding:"7px 6px",borderRadius:6,textAlign:"center",fontSize:15,
      fontFamily:"'Courier New',monospace",color:"#EAF3F7",background:"rgba(0,0,0,0.28)",
      border:`1px solid ${value?accent+"88":"rgba(255,255,255,0.18)"}`}}/>;
}

export default function App(){
  const [logs,setLogs]=useState(()=>load(K.logs,{}));
  const [done,setDone]=useState(()=>load(K.done,{}));
  const [week,setWeek]=useState(()=>load(K.week,1));
  const [modeKey,setModeKey]=useState(()=>load(K.mode,"offseason"));
  const [dayIdx,setDayIdx]=useState(()=>load(K.day,0));
  const [histOpen,setHistOpen]=useState(null);

  useEffect(()=>save(K.logs,logs),[logs]);
  useEffect(()=>save(K.done,done),[done]);
  useEffect(()=>save(K.week,week),[week]);
  useEffect(()=>save(K.mode,modeKey),[modeKey]);
  useEffect(()=>save(K.day,dayIdx),[dayIdx]);

  const mode=MODES[modeKey];
  const {content,inRange,blockNum}=useMemo(()=>resolveContent(mode,week),[mode,week]);
  const safeDay=Math.min(dayIdx,content.days.length-1);
  const day=content.days[safeDay];
  const accent=mode.accent;
  const trackIds=useMemo(()=>day.sections.flatMap(s=>s.items.map(i=>i.trackId)),[day]);
  const doneCount=trackIds.filter(t=>done[lk(modeKey,week,t)]).length;
  const pct=trackIds.length?Math.round(doneCount/trackIds.length*100):0;

  const toggle=useCallback(t=>{const k=lk(modeKey,week,t);setDone(p=>({...p,[k]:!p[k]}));},[modeKey,week]);
  const setSet=useCallback((it,si,f,v)=>{const k=lk(modeKey,week,it.trackId);
    setLogs(p=>{const cur=p[k]||{sets:[],notes:""};const sets=cur.sets?[...cur.sets]:[];
      while(sets.length<it.sets)sets.push({});sets[si]={...sets[si],[f]:v};return {...p,[k]:{...cur,sets}};});},[modeKey,week]);
  const setNotes=useCallback((it,v)=>{const k=lk(modeKey,week,it.trackId);
    setLogs(p=>({...p,[k]:{...(p[k]||{sets:[]}),notes:v}}));},[modeKey,week]);

  const historyFor=(t)=>{const out=[];for(let w=1;w<=TOTAL_WEEKS;w++){const e=logs[lk(modeKey,w,t)];if(entryHas(e))out.push({week:w,entry:e});}return out;};

  const lastDay=safeDay>=content.days.length-1;
  const advance=()=>{
    if(!lastDay){setDayIdx(safeDay+1);}
    else if(week<TOTAL_WEEKS){setWeek(week+1);setDayIdx(0);}
    setHistOpen(null);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  return (
    <div style={{minHeight:"100vh",color:"#EAF3F7",fontFamily:"'Helvetica Neue',Arial,sans-serif",paddingBottom:56,
      background:"radial-gradient(ellipse at 50% -10%, #16324A 0%, #0A1826 55%, #060F1A 100%)"}}>

      <header style={{padding:"calc(env(safe-area-inset-top,0px) + 32px) 20px 14px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{fontSize:11,letterSpacing:"0.28em",color:"#7FA1B5",fontWeight:700,marginBottom:5}}>FIRST STEP PROGRAM</div>
        <h1 style={{margin:0,fontSize:25,fontWeight:800,letterSpacing:"-0.01em",lineHeight:1.05,textTransform:"uppercase"}}>Hockey Performance</h1>
        <div style={{display:"flex",gap:4,overflowX:"auto",marginTop:12,paddingBottom:2}}>
          {MODE_ORDER.map(mk=>{const m=MODES[mk];const on=mk===modeKey;return(
            <button key={mk} onClick={()=>{setModeKey(mk);setDayIdx(0);setHistOpen(null);}}
              style={{flex:"0 0 auto",border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:700,cursor:"pointer",
                background:on?m.accent:"rgba(255,255,255,0.05)",color:on?"#0A1826":"#9FBBCC"}}>{m.label}</button>);})}
        </div>
      </header>

      {/* Week nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px 0",gap:12}}>
        <button onClick={()=>{setWeek(w=>Math.max(1,w-1));setHistOpen(null);}} disabled={week<=1}
          style={{width:42,height:42,borderRadius:12,flexShrink:0,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.04)",color:week<=1?"#3A5165":"#EAF3F7",fontSize:20,lineHeight:1,cursor:week<=1?"default":"pointer"}}>&#8249;</button>
        <div style={{textAlign:"center",flex:1}}>
          <div style={{fontSize:18,fontWeight:800}}>Week {week} <span style={{color:"#5C7E92",fontWeight:600}}>/ {TOTAL_WEEKS}</span></div>
          <div style={{fontSize:11.5,color:accent,fontWeight:700,letterSpacing:"0.06em",marginTop:2}}>BLOCK {blockNum} · {phaseForWeek(week).toUpperCase()}</div>
        </div>
        <button onClick={()=>{setWeek(w=>Math.min(TOTAL_WEEKS,w+1));setHistOpen(null);}} disabled={week>=TOTAL_WEEKS}
          style={{width:42,height:42,borderRadius:12,flexShrink:0,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.04)",color:week>=TOTAL_WEEKS?"#3A5165":"#EAF3F7",fontSize:20,lineHeight:1,cursor:week>=TOTAL_WEEKS?"default":"pointer"}}>&#8250;</button>
      </div>

      <div style={{margin:"14px 20px 0",padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",borderLeft:`3px solid ${accent}`}}>
        <div style={{fontSize:14,fontWeight:800,marginBottom:4}}>{content.name}</div>
        <div style={{fontSize:12.5,lineHeight:1.45,color:"#B7CEDB"}}>{content.focus}</div>
        {!inRange&&<div style={{fontSize:11.5,color:"#F2C14E",marginTop:8}}>{mode.label} runs weeks {mode.range[0]}–{mode.range[1]}. Showing nearest plan for reference.</div>}
      </div>

      {/* Day tabs */}
      {content.days.length>1&&(
        <div style={{display:"flex",gap:4,overflowX:"auto",padding:"14px 20px 0"}}>
          {content.days.map((d,idx)=>{const on=idx===safeDay;
            const tids=d.sections.flatMap(s=>s.items.map(i=>i.trackId));
            const dn=tids.filter(t=>done[lk(modeKey,week,t)]).length;const complete=tids.length&&dn===tids.length;
            const short=d.title.includes("·")?d.title.split("·")[1].trim():d.title;
            return(<button key={idx} onClick={()=>{setDayIdx(idx);setHistOpen(null);}}
              style={{flex:"0 0 auto",borderRadius:9,padding:"8px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2,minWidth:104,
                border:on?`1px solid ${accent}`:"1px solid rgba(255,255,255,0.1)",background:on?`${accent}22`:"transparent",color:on?"#EAF3F7":"#7FA1B5"}}>
              <span style={{fontSize:12.5,fontWeight:800,display:"flex",alignItems:"center",gap:5}}>Day {idx+1}{complete&&<span style={{width:6,height:6,borderRadius:"50%",background:accent,boxShadow:`0 0 6px 1px ${accent}`}}/>}</span>
              <span style={{fontSize:9.5,color:on?"#B7CEDB":"#5C7E92",whiteSpace:"nowrap"}}>{short}</span>
            </button>);})}
        </div>)}

      {/* Day header + progress */}
      <div style={{padding:"16px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
          <span style={{fontSize:14,fontWeight:700}}>{day.title}{day.durTotal?<span style={{color:"#7FA1B5",fontWeight:600,fontSize:12}}> · ~{day.durTotal} min</span>:null}</span>
          <span style={{fontFamily:"'Courier New',monospace",fontSize:18,fontWeight:700,color:accent}}>{doneCount}/{trackIds.length}</span>
        </div>
        <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
          <div style={{width:`${pct}%`,height:"100%",background:accent,boxShadow:`0 0 8px ${accent}`,transition:"width 200ms ease"}}/>
        </div>
      </div>

      <main style={{padding:"20px 20px 0"}}>
        {day.sections.map(sec=>(
          <section key={sec.title} style={{marginBottom:22}}>
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"0 0 10px"}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:accent,boxShadow:`0 0 6px 1px ${accent}`}}/>
              <h2 style={{fontSize:12.5,letterSpacing:"0.14em",textTransform:"uppercase",color:"#9FBBCC",fontWeight:800,margin:0}}>{sec.title}</h2>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {sec.items.map(it=>{
                const checked=!!done[lk(modeKey,week,it.trackId)];
                const entry=logs[lk(modeKey,week,it.trackId)];
                const rec=recommend(it,modeKey,week,logs);
                const isHist=histOpen===it.trackId;
                const hist=isHist?historyFor(it.trackId):null;
                return(
                  <div key={it.id} style={{background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"10px 12px",opacity:checked?0.72:1}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:11}}>
                      <div style={{paddingTop:1}}><Lamp checked={checked} accent={accent} onClick={()=>toggle(it.trackId)}/></div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"baseline"}}>
                          <span style={{fontSize:14.5,fontWeight:600,textDecoration:checked?"line-through":"none"}}>{it.name}</span>
                          <span style={{fontFamily:"'Courier New',monospace",fontSize:12.5,fontWeight:700,color:"#9FBBCC",whiteSpace:"nowrap",flexShrink:0}}>{it.target}</span>
                        </div>
                        {it.sub&&<div style={{fontSize:11.5,color:"#5C7E92",marginTop:2}}>{it.sub}</div>}

                        {rec&&<div style={{marginTop:6,fontSize:12,fontWeight:700,
                          color:rec.tone==="up"?"#4C9F70":rec.tone==="beat"?accent:rec.tone==="hold"?"#F2C14E":"#7FA1B5"}}>
                          {rec.tone==="up"?"▲ ":rec.tone==="beat"?"⏱ ":""}{rec.text}</div>}

                        {/* Per-set rows */}
                        <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
                          {Array.from({length:it.sets}).map((_,si)=>{
                            const s=(entry&&entry.sets&&entry.sets[si])||{};
                            return(<div key={si} style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                              <span style={{fontSize:10,fontWeight:800,color:"#5C7E92",width:38}}>{it.sets>1?`SET ${si+1}`:"LOG"}</span>
                              {it.log.map(f=><Inp key={f} field={f} value={s[f]} accent={accent} onChange={v=>setSet(it,si,f,v)}/>)}
                              <span style={{fontSize:10,color:"#455C6E"}}>{it.log.map(f=>FIELD_META[f].label).join(" / ")}</span>
                            </div>);})}
                          <input type="text" value={(entry&&entry.notes)||""} onChange={e=>setNotes(it,e.target.value)} placeholder="notes…"
                            style={{width:"100%",padding:"7px 8px",borderRadius:7,marginTop:2,border:"1px solid rgba(255,255,255,0.14)",background:"rgba(0,0,0,0.22)",color:"#EAF3F7",fontSize:13}}/>
                        </div>

                        <button onClick={()=>setHistOpen(isHist?null:it.trackId)}
                          style={{marginTop:8,background:"transparent",border:"none",color:"#7FA1B5",fontSize:11.5,fontWeight:700,cursor:"pointer",padding:0,textDecoration:"underline",textUnderlineOffset:3}}>
                          {isHist?"Hide history":"History"}</button>
                        {isHist&&<div style={{marginTop:8,background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 10px"}}>
                          {hist.length===0?<div style={{fontSize:12,color:"#5C7E92"}}>No entries yet.</div>:
                            hist.map(h=>(<div key={h.week} style={{display:"flex",justifyContent:"space-between",gap:10,fontSize:12,padding:"3px 0",color:h.week===week?accent:"#B7CEDB"}}>
                              <span style={{fontWeight:700}}>Wk {h.week}</span>
                              <span style={{fontFamily:"'Courier New',monospace",textAlign:"right"}}>{summarize(h.entry)||"—"}{h.entry.notes?` · ${h.entry.notes}`:""}</span>
                            </div>))}
                        </div>}
                      </div>
                    </div>
                  </div>);})}
            </div>
          </section>))}

        {/* Sequential flow */}
        <button onClick={advance}
          style={{width:"100%",padding:"14px",marginTop:4,marginBottom:10,borderRadius:12,border:"none",cursor:"pointer",
            background:accent,color:"#0A1826",fontSize:14.5,fontWeight:800,boxShadow:`0 0 14px ${accent}66`}}>
          {lastDay
            ? (week<TOTAL_WEEKS?`Finish Week ${week} → Week ${week+1}, Day 1`:"Program complete — great season")
            : `Finish Day ${safeDay+1} → Day ${safeDay+2}`}
        </button>

        <button onClick={()=>setDone(p=>{const n={...p};trackIds.forEach(t=>delete n[lk(modeKey,week,t)]);return n;})}
          style={{width:"100%",padding:"11px",marginBottom:18,background:"transparent",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,color:"#7FA1B5",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          Reset this day's checkmarks</button>
      </main>

      <footer style={{padding:"6px 20px 0",fontSize:11.5,color:"#4A6578",lineHeight:1.5}}>
        Log every set — the app recommends next week's weight when he hits all his reps, and shows the time to beat on speed work.
        Same lifts for a 4-week block, then they change. Ice and off-ice drills rotate weekly. Loads stay submaximal at 12 — clean, fast reps win.
      </footer>
    </div>
  );
}
