import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">AI Study Assistant</div>

        <h1>Create Account 🚀</h1>
        <p className="subtitle">
          Start your personalized learning journey
        </p>

        <form>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
          />

          <button type="submit">
            Create Account
          </button>
        </form>

        <p className="switch-text">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;