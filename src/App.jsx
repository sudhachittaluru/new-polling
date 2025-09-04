import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import RolePicker from "./pages/RolePicker.jsx";
import Teacher from "./pages/Teacher.jsx";
import Student from "./pages/Student.jsx";

export default function App(){
  return (
    <div className="card">
      <Routes>
        <Route path="/" element={<RolePicker />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/student" element={<Student />} />
        <Route path="*" element={<div><h2>404</h2><Link to="/">Go home</Link></div>} />
      </Routes>
    </div>
  );
}
