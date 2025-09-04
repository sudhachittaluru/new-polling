
import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
export const socket = io(URL, { autoConnect: false });

export function join(role, details={}){
  if(!socket.connected) socket.connect();
  socket.emit("join", { role, ...details });
}
