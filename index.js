
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.get("/", (_, res) => res.send("Live Polling Server is running"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// ---- In-memory state (replace with DB for production) ----
const state = {
  teacherId: null,
  students: [], // {id, name, roll, className, section, email}
  currentPoll: null // {question, options, tallies, status, endAt, answers: Map}
};

function publicState() {
  const s = state.currentPoll;
  const phase = s ? s.status : "idle";
  return {
    phase,
    question: s?.question ?? null,
    options: s?.options ?? [],
    tallies: s?.tallies ?? [],
    totalStudents: state.students.length,
    timeRemaining: s?.endAt ? Math.max(0, Math.ceil((s.endAt - Date.now())/1000)) : 0,
    students: state.students.map(({id, name, roll, className, section, email}) => ({id, name, roll, className, section, email})),
    canAskNewQuestion: phase === "idle" || phase === "results"
  };
}

function broadcast() {
  io.emit("state:update", publicState());
}

function resetPoll() {
  state.currentPoll = null;
  broadcast();
}

function finalizePoll(reason="timer"){
  if(!state.currentPoll) return;
  state.currentPoll.status = "results";
  state.currentPoll.completedBecause = reason;
  broadcast();
}

io.on("connection", (socket) => {
  // Join as teacher or student with details
  socket.on("join", (payload={}) => {
    const { role, name, roll, className, section, email } = payload;
    if (role === "teacher") {
      state.teacherId = socket.id;
      socket.join("teachers");
    } else if (role === "student") {
      const exists = state.students.some(s => s.id === socket.id);
      if (!exists) {
        state.students.push({
          id: socket.id,
          name: name || "Student",
          roll: roll || "",
          className: className || "",
          section: section || "",
          email: email || ""
        });
      }
    }
    socket.emit("state:update", publicState());
    broadcast();
  });

  // Teacher starts a question
  socket.on("teacher:ask", ({question, options, duration=60}={}, cb) => {
    if (socket.id !== state.teacherId) { cb?.({ok:false,error:"Only teacher can start"}); return; }
    const opts = Array.isArray(options) ? options.filter(Boolean) : [];
    if (!question || opts.length < 2) { cb?.({ok:false,error:"Need question and at least 2 options"}); return; }
    const endAt = Date.now() + Math.max(5, Math.min(600, Number(duration)||60))*1000;
    state.currentPoll = {
      question,
      options: opts,
      tallies: new Array(opts.length).fill(0),
      status: "asking",
      endAt,
      answers: new Map() // studentId -> index
    };
    broadcast();
    cb?.({ok:true});
  });

  // Student submits an answer
  socket.on("student:answer", ({index}={}, cb) => {
    const poll = state.currentPoll;
    if (!poll || poll.status !== "asking") { cb?.({ok:false,error:"No active question"}); return; }
    if (typeof index !== "number" || index < 0 || index >= poll.options.length) { cb?.({ok:false,error:"Invalid option"}); return; }
    const prev = poll.answers.get(socket.id);
    if (typeof prev === "number") {
      // update vote
      poll.tallies[prev] = Math.max(0, poll.tallies[prev]-1);
    }
    poll.answers.set(socket.id, index);
    poll.tallies[index] += 1;
    broadcast();
    cb?.({ok:true});
  });

  // Teacher ends poll early
  socket.on("teacher:finish", (cb) => {
    if (socket.id !== state.teacherId) { cb?.({ok:false,error:"Only teacher can finish"}); return; }
    if (!state.currentPoll || state.currentPoll.status !== "asking") { cb?.({ok:false,error:"Nothing to finish"}); return; }
    finalizePoll("manual");
    cb?.({ok:true});
  });

  // Teacher clears results
  socket.on("teacher:reset", (cb) => {
    if (socket.id !== state.teacherId) { cb?.({ok:false,error:"Only teacher can reset"}); return; }
    resetPoll();
    cb?.({ok:true});
  });

  // Allow anyone to request current state
  socket.on("state:request", () => socket.emit("state:update", publicState()));

  socket.on("disconnect", () => {
    // remove student if exists
    const idx = state.students.findIndex(s => s.id === socket.id);
    if (idx !== -1) state.students.splice(idx,1);
    if (socket.id === state.teacherId) state.teacherId = null;
    broadcast();
  });
});

// Timer check loop
setInterval(() => {
  const s = state.currentPoll;
  if (s && s.status === "asking" && s.endAt && Date.now() >= s.endAt) {
    finalizePoll("timer");
  }
}, 500);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log("Live Polling server listening on http://localhost:" + PORT));
