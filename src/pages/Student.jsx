
import React, { useEffect, useState } from "react";
import { socket, join } from "../socket";
import ResultBars from "../components/ResultBars.jsx";

function DetailsGate({ onSave }){
  const [form, setForm] = useState({ name:"", roll:"", className:"", section:"", email:"" });
  const canGo = form.name.trim().length > 0 && form.roll.trim().length > 0;
  return (
    <div className="center">
      <h2>Let's Get Started</h2>
      <p>Enter your details to join the live poll.</p>
      <label>Name</label>
      <input placeholder="Your full name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
      <div className="row">
        <div style={{flex:1}}>
          <label>Roll No</label>
          <input placeholder="e.g., 21A51A0001" value={form.roll} onChange={e=>setForm({...form, roll:e.target.value})}/>
        </div>
        <div style={{flex:1}}>
          <label>Class</label>
          <input placeholder="e.g., 3rd Year CSE" value={form.className} onChange={e=>setForm({...form, className:e.target.value})}/>
        </div>
      </div>
      <div className="row">
        <div style={{flex:1}}>
          <label>Section</label>
          <input placeholder="e.g., A" value={form.section} onChange={e=>setForm({...form, section:e.target.value})}/>
        </div>
        <div style={{flex:1}}>
          <label>Email (optional)</label>
          <input placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        </div>
      </div>
      <div style={{height:10}} />
      <button className="primary" disabled={!canGo} onClick={()=>onSave(form)}>Continue</button>
    </div>
  );
}

export default function Student(){
  const [connected, setConnected] = useState(socket.connected);
  const [joined, setJoined] = useState(false);
  const [state, setState] = useState({ phase:"idle", options:[], tallies:[], totalStudents:0, timeRemaining:0 });

  useEffect(()=>{
    if(!connected){
      socket.connect();
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

  function saveDetails(d){
    join("student", d);
    setJoined(true);
  }

  function answer(i){
    socket.emit("student:answer", { index:i });
  }

  return (
    <div>
      {!joined ? (
        <DetailsGate onSave={saveDetails} />
      ) : (
        <div className="center">
          <h2>Student Panel</h2>
          {state.phase === "idle" && (
            <p>Wait for the teacher to ask a question…</p>
          )}

          {state.phase === "asking" && (
            <div>
              <p><strong>Question</strong></p>
              <p style={{marginTop:-6}}>{state.question}</p>
              {state.options.map((o, i)=>(
                <div key={i} className="option">
                  <input id={"opt"+i} name="ans" type="radio" onChange={()=>answer(i)} />
                  <label htmlFor={"opt"+i}>{String.fromCharCode(65+i)}. {o}</label>
                </div>
              ))}
              <small>{state.timeRemaining}s remaining</small>
            </div>
          )}

          {state.phase === "results" && (
            <div>
              <p><strong>Results</strong></p>
              <ResultBars options={state.options} tallies={state.tallies || []} total={state.totalStudents} />
              <small>Waiting for the next question…</small>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
