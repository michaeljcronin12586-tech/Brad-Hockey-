import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MODES, MODE_ORDER, TOTAL_WEEKS, phaseForWeek, resolveBlock, FIELD_META } from "./program.js";

const K = { logs:"hockey-tracker:logs2", done:"hockey-tracker:done2", week:"hockey-tracker:week", mode:"hockey-tracker:mode", day:"hockey-tracker:day" };

function loadKey(k,f){ try{const r=localStorage.getItem(k);return r?JSON.parse(r):f;}catch{return f;} }
function saveKey(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch{} }

const logKey=(m,w,id)=>`${m}|${w}|${id}`;
const setHasData=(s)=> s && (s.weight||s.reps||s.time);
const entryHasData=(e)=> e && ((e.sets||[]).some(setHasData) || e.notes);

function summarize(entry){
  if(!entry) return "";
  const sets=(entry.sets||[]).filter(setHasData);
  if(!sets.length) return "";
  const parts=sets.map(s=>{
    if(s.weight&&s.reps) return `${s.weight}x${s.reps}`;
    if(s.weight) return `${s.weight}lb`;
    if(s.time) return s.time;
    if(s.reps) return `${s.reps}`;
    return "";
  }).filter(Boolean);
  return parts.join(", ");
}

function GoalLamp({checked,onClick,accent}){
  return <button onClick={onClick} aria-pressed={checked} aria-label={checked?"Mark incomplete":"Mark complete"}
    style={{width:28,height:28,borderRadius:"50%",flexShrink:0,cursor:"pointer",padding:0,transition:"all 160ms ease",
      border:`2px solid ${checked?accent:"rgba(255,255,255,0.25)"}`,
      background:checked?`radial-gradient(circle at 35% 30%, ${accent}, ${accent}CC 55%, ${accent}66 100%)`:"rgba(255,255,255,0.04)",
      boxShadow:checked?`0 0 12px 2px ${accent}99`:"none"}}/>;
}

function SetInput({field,value,onChange,accent}){
  const meta=FIELD_META[field]; const wide=field==="time";
  return <input type={meta.type} inputMode={meta.type==="number"?"decimal":"text"} value={value||""}
    onChange={e=>onChange(e.target.value)} placeholder={meta.ph}
    style={{width:wide?92:56,padding:"6px 6px",borderRadius:6,textAlign:"center",fontSize:14.5,
      fontFamily:"'Courier New',monospace",color:"#EAF3F7",background:"rgba(0,0,0,0.28)",
      border:`1px solid ${value?accent+"88":"rgba(255,255,255,0.18)"}`}}/>;
}

export default function App(){
  const [logs,setLogs]=useState(()=>loadKey(K.logs,{}));
  const [done,setDone]=useState(()=>loadKey(K.done,{}));
  const [week,setWeek]=useState(()=>loadKey(K.week,1));
  const [modeKey,setModeKey]=useState(()=>loadKey(K.mode,"offseason"));
  const [dayIdx,setDayIdx]=useState(()=>loadKey(K.day,0));
  const [histOpen,setHistOpen]=useState(null);

  useEffect(()=>saveKey(K.logs,logs),[logs]);
  useEffect(()=>saveKey(K.done,done),[done]);
  useEffect(()=>saveKey(K.week,week),[week]);
  useEffect(()=>saveKey(K.mode,modeKey),[modeKey]);
  useEffect(()=>saveKey(K.day,dayIdx),[dayIdx]);

  const mode=MODES[modeKey];
  const {block,content,inRange}=useMemo(()=>resolveBlock(mode,week),[mode,week]);
  const safeDay=Math.min(dayIdx,content.days.length-1);
  const day=content.days[safeDay];
  const accent=mode.accent;

  const dayItemIds=useMemo(()=>day.sections.flatMap(s=>s.items.map(i=>i.id)),[day]);
  const doneCount=dayItemIds.filter(id=>done[logKey(modeKey,week,id)]).length;
  const pct=dayItemIds.length?Math.round(doneCount/dayItemIds.length*100):0;

  const toggleDone=useCallback(id=>{const k=logKey(modeKey,week,id);setDone(p=>({...p,[k]:!p[k]}));},[modeKey,week]);

  const setSetField=useCallback((item,setIdx,field,value)=>{
    const k=logKey(modeKey,week,item.id);
    setLogs(p=>{
      const cur=p[k]||{sets:[],notes:""};
      const sets=cur.sets?[...cur.sets]:[];
      while(sets.length<item.sets) sets.push({});
      sets[setIdx]={...sets[setIdx],[field]:value};
      return {...p,[k]:{...cur,sets}};
    });
  },[modeKey,week]);

  const setNotes=useCallback((item,value)=>{
    const k=logKey(modeKey,week,item.id);
    setLogs(p=>{const cur=p[k]||{sets:[],notes:""};return {...p,[k]:{...cur,notes:value}};});
  },[modeKey,week]);

  const getEntry=id=>logs[logKey(modeKey,week,id)];

  const historyFor=id=>{const out=[];for(let w=1;w<=TOTAL_WEEKS;w++){const e=logs[logKey(modeKey,w,id)];if(entryHasData(e))out.push({week:w,entry:e});}return out;};

  const resetDay=()=>setDone(p=>{const n={...p};dayItemIds.forEach(id=>delete n[logKey(modeKey,week,id)]);return n;});

  const durTotal=day.durTotal;

  return (
    <div style={{minHeight:"100vh",color:"#EAF3F7",fontFamily:"'Helvetica Neue',Arial,sans-serif",paddingBottom:56,
      background:"radial-gradient(ellipse at 50% -10%, #16324A 0%, #0A1826 55%, #060F1A 100%)"}}>

      <header style={{padding:"calc(env(safe-area-inset-top,0px) + 32px) 20px 14px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{fontSize:11,letterSpacing:"0.28em",color:"#7FA1B5",fontWeight:700,marginBottom:5}}>FIRST STEP PROGRAM</div>
        <h1 style={{margin:0,fontSize:25,fontWeight:800,fontStretch:"condensed",letterSpacing:"-0.01em",lineHeight:1.05,textTransform:"uppercase"}}>Hockey Performance</h1>
        <div style={{display:"flex",gap:4,overflowX:"auto",marginTop:12,paddingBottom:2}}>
          {MODE_ORDER.map(mk=>{const m=MODES[mk];const on=mk===modeKey;return(
            <button key={mk} onClick={()=>{setModeKey(mk);setDayIdx(0);setHistOpen(null);}}
              style={{flex:"0 0 auto",border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:700,cursor:"pointer",
                background:on?m.accent:"rgba(255,255,255,0.05)",color:on?"#0A1826":"#9FBBCC",transition:"all 140ms ease"}}>{m.label}</button>);})}
        </div>
      </header>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px 0",gap:12}}>
        <button onClick={()=>setWeek(w=>Math.max(1,w-1))} disabled={week<=1}
          style={{width:42,height:42,borderRadius:12,flexShrink:0,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.04)",color:week<=1?"#3A5165":"#EAF3F7",fontSize:20,lineHeight:1,cursor:week<=1?"default":"pointer"}}>&#8249;</button>
        <div style={{textAlign:"center",flex:1}}>
          <div style={{fontSize:18,fontWeight:800}}>Week {week} <span style={{color:"#5C7E92",fontWeight:600}}>/ {TOTAL_WEEKS}</span></div>
          <div style={{fontSize:11.5,color:accent,fontWeight:700,letterSpacing:"0.06em",marginTop:2}}>BLOCK {block} · {phaseForWeek(week).toUpperCase()}</div>
        </div>
        <button onClick={()=>setWeek(w=>Math.min(TOTAL_WEEKS,w+1))} disabled={week>=TOTAL_WEEKS}
          style={{width:42,height:42,borderRadius:12,flexShrink:0,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.04)",color:week>=TOTAL_WEEKS?"#3A5165":"#EAF3F7",fontSize:20,lineHeight:1,cursor:week>=TOTAL_WEEKS?"default":"pointer"}}>&#8250;</button>
      </div>

      <div style={{margin:"14px 20px 0",padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",borderLeft:`3px solid ${accent}`}}>
        <div style={{fontSize:14,fontWeight:800,marginBottom:4}}>{content.name}</div>
        <div style={{fontSize:12.5,lineHeight:1.45,color:"#B7CEDB"}}>{content.focus}</div>
        {!inRange && <div style={{fontSize:11.5,color:"#F2C14E",marginTop:8,lineHeight:1.4}}>{mode.label} programming runs weeks {mode.range[0]}–{mode.range[1]}. Showing the nearest block for reference.</div>}
      </div>

      <div style={{display:"flex",gap:4,overflowX:"auto",padding:"14px 20px 0"}}>
        {content.days.map((d,idx)=>{const on=idx===safeDay;const ids=d.sections.flatMap(s=>s.items.map(i=>i.id));
          const dn=ids.filter(id=>done[logKey(modeKey,week,id)]).length;const complete=ids.length&&dn===ids.length;
          const short=d.title.split("·")[1]?d.title.split("·")[1].trim():d.title;
          return(<button key={idx} onClick={()=>{setDayIdx(idx);setHistOpen(null);}}
            style={{flex:"0 0 auto",borderRadius:9,padding:"8px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2,minWidth:96,
              border:on?`1px solid ${accent}`:"1px solid rgba(255,255,255,0.1)",background:on?`${accent}22`:"transparent",color:on?"#EAF3F7":"#7FA1B5"}}>
            <span style={{fontSize:12.5,fontWeight:800,display:"flex",alignItems:"center",gap:5}}>Day {idx+1}{complete&&<span style={{width:6,height:6,borderRadius:"50%",background:accent,boxShadow:`0 0 6px 1px ${accent}`}}/>}</span>
            <span style={{fontSize:9.5,letterSpacing:"0.04em",color:on?"#B7CEDB":"#5C7E92",whiteSpace:"nowrap"}}>{short}</span>
          </button>);})}
      </div>

      <div style={{padding:"16px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
          <span style={{fontSize:14,color:"#EAF3F7",fontWeight:700}}>{day.title}{durTotal?<span style={{color:"#7FA1B5",fontWeight:600,fontSize:12}}>  · ~{durTotal} min</span>:null}</span>
          <span style={{fontFamily:"'Courier New',monospace",fontVariantNumeric:"tabular-nums",fontSize:18,fontWeight:700,color:accent}}>{doneCount}/{dayItemIds.length}</span>
        </div>
        <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
          <div style={{width:`${pct}%`,height:"100%",background:accent,boxShadow:`0 0 8px ${accent}`,transition:"width 200ms ease"}}/>
        </div>
      </div>

      <main style={{padding:"20px 20px 0"}}>
        {day.sections.map(section=>(
          <section key={section.title} style={{marginBottom:22}}>
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"0 0 10px"}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:accent,boxShadow:`0 0 6px 1px ${accent}`}}/>
              <h2 style={{fontSize:12.5,letterSpacing:"0.14em",textTransform:"uppercase",color:"#9FBBCC",fontWeight:800,margin:0}}>{section.title}</h2>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {section.items.map(item=>{
                const dk=logKey(modeKey,week,item.id);const checked=!!done[dk];const entry=getEntry(item.id);
                const isHist=histOpen===item.id;const hist=isHist?historyFor(item.id):null;
                const nSets=item.sets||1;
                return(
                  <div key={item.id} style={{background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"10px 12px",opacity:checked?0.72:1,transition:"opacity 160ms ease"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:11}}>
                      <div style={{paddingTop:1}}><GoalLamp checked={checked} accent={accent} onClick={()=>toggleDone(item.id)}/></div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"baseline"}}>
                          <span style={{fontSize:14.5,fontWeight:600,textDecoration:checked?"line-through":"none"}}>{item.name}</span>
                          <span style={{fontFamily:"'Courier New',monospace",fontSize:12.5,fontWeight:700,color:"#9FBBCC",whiteSpace:"nowrap",flexShrink:0}}>{item.target}</span>
                        </div>
                        {item.sub&&<div style={{fontSize:11.5,color:"#5C7E92",marginTop:2}}>{item.sub}</div>}

                        {/* Per-set logging rows */}
                        <div style={{marginTop:9,display:"flex",flexDirection:"column",gap:6}}>
                          {Array.from({length:nSets}).map((_,si)=>{
                            const s=(entry&&entry.sets&&entry.sets[si])||{};
                            return(
                              <div key={si} style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                                <span style={{fontSize:10,fontWeight:800,color:"#5C7E92",width:34,letterSpacing:"0.04em"}}>{nSets>1?`SET ${si+1}`:"LOG"}</span>
                                {item.log.map(f=>(
                                  <div key={f} style={{display:"flex",flexDirection:"column",gap:2}}>
                                    <SetInput field={f} value={s[f]} accent={accent} onChange={v=>setSetField(item,si,f,v)}/>
                                  </div>
                                ))}
                                <span style={{fontSize:10,color:"#455C6E"}}>{item.log.map(f=>FIELD_META[f].label).join(" / ")}</span>
                              </div>
                            );
                          })}
                          <input type="text" value={(entry&&entry.notes)||""} onChange={e=>setNotes(item,e.target.value)} placeholder={FIELD_META.notes.ph}
                            style={{width:"100%",padding:"7px 8px",borderRadius:7,marginTop:2,border:"1px solid rgba(255,255,255,0.14)",background:"rgba(0,0,0,0.22)",color:"#EAF3F7",fontSize:13}}/>
                        </div>

                        <button onClick={()=>setHistOpen(isHist?null:item.id)} style={{marginTop:8,background:"transparent",border:"none",color:"#7FA1B5",fontSize:11.5,fontWeight:700,cursor:"pointer",padding:0,textDecoration:"underline",textUnderlineOffset:3}}>{isHist?"Hide history":"History"}</button>
                        {isHist&&(
                          <div style={{marginTop:8,background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 10px"}}>
                            {hist.length===0?<div style={{fontSize:12,color:"#5C7E92"}}>No entries yet — log a set above.</div>:
                              hist.map(h=>(<div key={h.week} style={{display:"flex",justifyContent:"space-between",gap:10,fontSize:12,padding:"3px 0",color:h.week===week?accent:"#B7CEDB"}}>
                                <span style={{fontWeight:700,whiteSpace:"nowrap"}}>Wk {h.week}</span>
                                <span style={{fontFamily:"'Courier New',monospace",textAlign:"right"}}>{summarize(h.entry)||"—"}{h.entry.notes?`  · ${h.entry.notes}`:""}</span>
                              </div>))}
                          </div>)}
                      </div>
                    </div>
                  </div>);
              })}
            </div>
          </section>
        ))}
        <button onClick={resetDay} style={{width:"100%",padding:"12px",marginTop:2,marginBottom:18,background:"transparent",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,color:"#7FA1B5",fontSize:13,fontWeight:600,cursor:"pointer"}}>Reset {day.title} · Week {week}</button>
      </main>

      <footer style={{padding:"6px 20px 0",fontSize:11.5,color:"#4A6578",lineHeight:1.5}}>
        Log each set — weight/reps or time can change set to set. A 4-week block keeps the same exercises (add a little each week), then they change at the next block.
        Numbers are a guide for a coach or parent; clean form beats the target. Youth loads stay submaximal. Drills follow USA Hockey ADM progressions.
      </footer>
    </div>
  );
}
