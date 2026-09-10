import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      setMessage("Account created successfully! 🎉");

      console.log(response.data);

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      if (err.response) {
        setError(
          err.response.data.detail || "Registration failed"
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
          Create Account 🚀
        </h1>

        <p className="subtitle">
          Start your personalized learning journey
        </p>

        <form onSubmit={handleRegister}>

          <label>
            Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Create Account
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
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;