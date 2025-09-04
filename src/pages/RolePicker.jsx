
import React from "react";
import { Link } from "react-router-dom";

export default function RolePicker(){
  return (
    <div className="center">
      <h1>Live Polling System</h1>
      <p>Pick your role to continue.</p>
      <div className="row" style={{justifyContent:"center", marginTop: 20}}>
        <Link className="btn" to="/teacher"><button className="primary">I'm a Teacher</button></Link>
        <Link className="btn" to="/student"><button className="secondary">I'm a Student</button></Link>
      </div>
      <small>Extensible demo with name, roll, class, section & email.</small>
    </div>
  );
}
