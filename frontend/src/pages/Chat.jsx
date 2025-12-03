import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef();
  const navigate = useNavigate();

  const name = localStorage.getItem("name");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    // fetch old messages
    const loadMessages = async () => {
      const res = await API.get("/api/v1/messages");
      setMessages(res.data.data);
    };

    loadMessages();

    // listen real-time incoming message
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", { text, senderName: name });

    await API.post("/api/v1/messages", { text });

    setText("");
  };

  return (
    <div>
      <h3>Welcome, {name}</h3>
      <div style={{ height: "300px", overflowY: "scroll", border:"1px solid gray" }}>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.senderName}:</strong> {m.text}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type message"/>
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;