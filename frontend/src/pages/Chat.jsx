import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../css/Chat.css";

const socket = io("http://localhost:3000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const bottomRef = useRef();
  const navigate = useNavigate();
  const rooms = ["global", "tech", "gaming"];
  const [room, setRoom] = useState("global");

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

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

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
    setText(e.target.value);

    if (e.target.value.trim()) {
      socket.emit("typing", name);
    } else {
      socket.emit("stopTyping");
    }
  };

  const loadMessagesFromDB = async (roomSelected) => {
    const res = await API.get(`/api/v1/messages?room=${roomSelected}`);
    setMessages(res.data.data);
  };

  const handleRoomChange = (r) => {
    setRoom(r);
    socket.emit("joinRoom", r);
    setMessages([]);
    loadMessagesFromDB(r);
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="header-left">
          <h2>Chat</h2>
          <span className="room-badge">{room}</span>
        </div>
        <div className="header-right">
          <span className="online-count">{onlineUsers.length} online</span>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="chat-main">
        <aside className="sidebar">
          <h4>Rooms</h4>
          <nav className="rooms-nav">
            {rooms.map((r) => (
              <button
                key={r}
                className={`room-btn ${room === r ? "active" : ""}`}
                onClick={() => handleRoomChange(r)}
              >
                # {r}
              </button>
            ))}
          </nav>

          <h4>Online Users</h4>
          <ul className="users-list">
            {onlineUsers.map((u, i) => (
              <li key={i}>
                <span className="online-dot"></span>
                {u}
              </li>
            ))}
          </ul>
        </aside>

        <div className="chat-content">
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className="message">
                <span className="sender">{m.senderName}</span>
                <span className="text">{m.text}</span>
              </div>
            ))}
            {typingUser && <p className="typing-indicator">{typingUser}</p>}
            <div ref={bottomRef}></div>
          </div>

          <div className="input-area">
            <input
              type="text"
              value={text}
              onChange={handleTyping}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="message-input"
            />
            <button onClick={sendMessage} className="send-btn">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;