
import React, { useEffect, useMemo, useState } from "react";
import { socket, join } from "../socket";
import ResultBars from "../components/ResultBars.jsx";

export default function Teacher(){
  const [connected, setConnected] = useState(socket.connected);
  const [state, setState] = useState({ phase:"idle", options:[], tallies:[], totalStudents:0, timeRemaining:0, canAskNewQuestion:true, students:[] });
  const [form, setForm] = useState({ question:"", options:["",""], duration:60 });

  useEffect(()=>{
    if(!connected){
      socket.connect();
      join("teacher");
    }
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onUpdate = (s) => setState(s);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("state:update", onUpdate);
    socket.emit("state:request");
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("state:update", onUpdate);
    };
  }, [connected]);

  function addOption(){ setForm(f => ({...f, options:[...f.options, ""]})); }
  function removeOption(i){
    setForm(f => ({...f, options: f.options.filter((_,idx)=>idx!==i)}));
  }
  function ask(){
    const payload = {
      question: form.question.trim(),
      options: form.options.map(o=>o.trim()).filter(Boolean),
      duration: Math.max(5, Math.min(600, Number(form.duration)||60))
    };
    socket.emit("teacher:ask", payload, (res)=>{
      if(!res?.ok) alert(res?.error || "Failed to start");
    });
  }
  function finish(){ socket.emit("teacher:finish"); }
  function reset(){ socket.emit("teacher:reset"); }

  const canAsk = state.canAskNewQuestion && form.question.trim() && form.options.filter(o=>o.trim()).length >= 2;

  return (
    <div className="center">
      <h2>Teacher Panel</h2>
      <div className="row">
        <div style={{flex:2, minWidth:280}}>
          <label>Enter your question</label>
          <textarea rows={3} placeholder="Type your question…" value={form.question} onChange={e=>setForm({...form, question:e.target.value})}></textarea>
          <div className="row" style={{marginTop:8}}>
            <label>Duration (seconds)</label>
            <input type="number" value={form.duration} onChange={e=>setForm({...form, duration:e.target.value})} />
          </div>
          <div style={{marginTop:10}}>
            <label>Options</label>
            {form.options.map((o, i)=>(
              <div key={i} className="row option" style={{marginTop:6}}>
                <span>{String.fromCharCode(65+i)}.</span>
                <input value={o} placeholder={"Option " + (i+1)} onChange={e=>{
                  const v = e.target.value; setForm(f=>({ ...f, options: f.options.map((x,idx)=> idx===i?v:x) }));
                }}/>
                {form.options.length > 2 && <button onClick={()=>removeOption(i)}>Remove</button>}
              </div>
            ))}
            <div style={{height:8}} />
            <button onClick={addOption}>Add Option</button>
          </div>
          <div style={{height:12}} />
          <div className="row">
            <button className="primary" disabled={!canAsk} onClick={ask}>Start Question</button>
            <button onClick={finish} disabled={state.phase!=="asking"}>Finish Now</button>
            <button onClick={reset} disabled={state.phase==="asking"}>Reset</button>
          </div>
        </div>

        <div style={{flex:1}}>
          <h3>Live</h3>
          <p><strong>Phase:</strong> {state.phase}</p>
          {state.phase !== "idle" && <p><strong>Time left:</strong> {state.timeRemaining}s</p>}
          {state.phase !== "idle" && (
            <ResultBars options={state.options} tallies={state.tallies || []} total={state.totalStudents} />
          )}
          <h3 style={{marginTop:20}}>Students ({state.students?.length || 0})</h3>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%", borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th align="left">Name</th>
                  <th align="left">Roll</th>
                  <th align="left">Class</th>
                  <th align="left">Section</th>
                  <th align="left">Email</th>
                </tr>
              </thead>
              <tbody>
                {(state.students || []).map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.roll}</td>
                    <td>{s.className}</td>
                    <td>{s.section}</td>
                    <td>{s.email}</td>
                  </tr>
                ))}
                {(state.students || []).length === 0 && (
                  <tr><td colSpan={5}><small>No students connected.</small></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
