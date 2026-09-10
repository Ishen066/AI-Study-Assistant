import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        {
          email,
          password,
        }
      );

      // Save JWT token
      localStorage.setItem(
        "access_token",
        response.data.access_token
      );

      setMessage("Login successful! 🎉");

      console.log(response.data);

      // Temporary navigation
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      if (err.response) {
        setError(
          err.response.data.detail || "Login failed"
        );
      } else {
        setError("Cannot connect to backend.");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="logo">
          AI Study Assistant
        </div>

        <h1>
          Welcome Back 👋
        </h1>

        <p className="subtitle">
          Continue your learning journey
        </p>

        <form onSubmit={handleLogin}>

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        {message && (
          <p style={{ color: "green", marginTop: "15px" }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{ color: "red", marginTop: "15px" }}>
            {error}
          </p>
        )}

        <p className="switch-text">
          Don't have an account?{" "}
          <Link to="/register">
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;