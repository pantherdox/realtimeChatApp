import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/v1/auth/register", data);
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("name", res.data.data.name);
      navigate("/chat");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <h2>Register</h2>
      <input placeholder="Name" onChange={(e)=>setData({...data,name:e.target.value})}/>
      <input placeholder="Email" type="email" onChange={(e)=>setData({...data,email:e.target.value})}/>
      <input placeholder="Password" type="password" onChange={(e)=>setData({...data,password:e.target.value})}/>
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;