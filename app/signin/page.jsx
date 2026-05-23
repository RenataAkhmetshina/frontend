"use client";

import { useState } from "react";
import { USER_SERVICE_URL } from "../lib/api";

export default function SignInPage() {
  const [isLogin, setIsLogin] = useState(true); 
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin 
      ? { username, password } 
      : { username, email, password }; 

    try {
      const res = await fetch(`${USER_SERVICE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something gone wrong");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("auth-change"));
        window.location.href = "/";
      } else {
        setMessage("Registration successfull");
        setIsLogin(true);
        setEmail("");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isLogin ? "Login" : "Register"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
        
        {!isLogin && (
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        )}

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)} style={styles.toggleBtn}>
        {isLogin ? "Do not have and account? Register" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}

const styles = {
  container: { maxWidth: "400px", margin: "4rem auto", padding: "2rem", border: "1px solid #ddd", borderRadius: "8px" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" },
  input: { padding: "0.5rem", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc" },
  button: { padding: "0.7rem", fontSize: "1rem", background: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  toggleBtn: { background: "none", border: "none", color: "#0070f3", marginTop: "1rem", cursor: "pointer", textDecoration: "underline" }
};