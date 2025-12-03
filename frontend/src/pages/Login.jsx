import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/v1/auth/login", data);
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("name", res.data.data.name);
      navigate("/chat");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <h2>Login</h2>
      <input placeholder="Email" type="email" onChange={(e)=>setData({...data,email:e.target.value})}/>
      <input placeholder="Password" type="password" onChange={(e)=>setData({...data,password:e.target.value})}/>
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;