import { useEffect, useState, useRef, use } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([])
  const bottomRef = useRef();
  const navigate = useNavigate();
  const rooms = ["global", "tech", "gaming"]
  const [room, setRoom] = useState("global")

  const name = localStorage.getItem("name");

  useEffect(() => {
  if (!localStorage.getItem("token")) {
    navigate("/");
    return;
  }
 
  const loadMessages = async () => {
    const res = await API.get("/api/v1/messages");
    setMessages(res.data.data);
  };
  loadMessages();
 
  socket.emit("joinUser", name);
 
  socket.on("receiveMessage", (msg) => {
    setMessages((prev) => [...prev, msg]);
    scrollToBottom();
  });
 
  socket.on("showTyping", (user) => {
    setTypingUser(`${user} is typing...`);
  });
 
  socket.on("hideTyping", () => {
    setTypingUser("");
  });

  //online Users count
  socket.on("onlineUsers", (users) => {
    setOnlineUsers(users)
  })
 
  return () => {
    socket.off("receiveMessage");
    socket.off("showTyping");
    socket.off("hideTyping");
  };
 
}, []);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", { text, senderName: name, room });

    await API.post("/api/v1/messages", { text, room });

    setText("");
  };

  const handleTyping = (e) => {
    setText(e.target.value)

    if(e.target.value.trim()){
      socket.emit("typing", name)
    } else {
      socket.emit("stopTyping")
    }
  }

  const loadMessagesFromDB = async(roomSelected) => {
    const res = await API.get(`/api/v1/messages?room=${roomSelected}`)
    setMessages(res.data.data)
  }

  return (
    <div>
      <h3>Welcome, {name}</h3>
      <div style={{ border: "1px solid black", width:"150px", height:"300px"}}>
        <h4>Users Online</h4>
        {onlineUsers.map((u, i) => <p key={i}>{u}</p>)}
      </div>
      <button
      onClick={()=>{
        localStorage.clear();
        navigate('/')
      }}
      >Logout</button>
      {rooms.map((r) => (
        <button
        key={r}
        onClick={()=>{
          setRoom(r);
          socket.emit("joinRoom", r)
          setMessages([]);
          loadMessagesFromDB(r)
        }}
        >
        {r}
        </button>
      ))}
      <div style={{ height: "300px", overflowY: "scroll", border:"1px solid gray" }}>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.senderName}:</strong> {m.text}
          </div>
        ))}
        <div ref={bottomRef}></div>
        <p style={{ color: "gray", fontStyle: "italic" }}>{typingUser}</p>
      </div>

      <input value={text} onChange={handleTyping} placeholder="Type message"/>
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;