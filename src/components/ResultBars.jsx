import React from "react";

export default function ResultBars({ options, tallies, total }){
  const max = Math.max(1, ...tallies);
  const sum = tallies.reduce((a,b)=>a+b,0);
  return (
    <div>
      {options.map((opt, i)=>{
        const pct = total ? Math.round((tallies[i] / (total||1)) * 100) : 0;
        return (
          <div key={i} style={{marginBottom:12}}>
            <div className="row" style={{justifyContent:"space-between"}}>
              <strong>{String.fromCharCode(65+i)}. {opt}</strong>
              <span className="badge">{tallies[i]} • {pct}%</span>
            </div>
            <div className="progress"><div style={{ width: `${(tallies[i] / (max||1))*100}%` }} /></div>
          </div>
        )
      })}
    </div>
  )
}
