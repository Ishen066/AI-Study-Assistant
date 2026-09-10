import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        return response.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">AI</div>

          <div>
            <h2>Study Assistant</h2>
            <span>AI Powered Learning</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button className="nav-item active">
            <span>🏠</span>
            Dashboard
          </button>

          <button className="nav-item">
            <span>📚</span>
            Study Materials
          </button>

          <button className="nav-item">
            <span>📝</span>
            Quizzes
          </button>

          <button className="nav-item">
            <span>📊</span>
            Progress
          </button>

          <button className="nav-item">
            <span>🧠</span>
            Weak Topics
          </button>

          <button className="nav-item">
            <span>📅</span>
            Study Planner
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-help">
            <span>💡</span>
            <div>
              <strong>Need help?</strong>
              <p>Ask your AI Study Assistant.</p>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* Main Content */}
      <main className="dashboard-main">

        {/* Top bar */}
        <header className="dashboard-topbar">

          <div>
            <p className="page-label">STUDENT DASHBOARD</p>
            <h1>Good to see you, {user.name} 👋</h1>
            <p className="topbar-subtitle">
              Keep learning, keep improving.
            </p>
          </div>

          <div className="user-profile">

            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>

          </div>

        </header>


        {/* Welcome Banner */}
        <section className="welcome-banner">

          <div className="welcome-content">

            <span className="banner-tag">
              ✨ AI LEARNING
            </span>

            <h2>
              Your learning journey,
              <br />
              <span>made smarter.</span>
            </h2>

            <p>
              Upload your study materials, generate AI summaries,
              practice with quizzes, and track your progress.
            </p>

            <button className="primary-banner-button">
              Start Studying →
            </button>

          </div>

          <div className="banner-visual">
            <div className="brain-circle">
              🧠
            </div>

            <div className="floating-card card-one">
              📚
              <span>Study</span>
            </div>

            <div className="floating-card card-two">
              ✓
              <span>Quiz</span>
            </div>

            <div className="floating-card card-three">
              📈
              <span>Progress</span>
            </div>
          </div>

        </section>


        {/* Stats */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue">
              📚
            </div>

            <div>
              <span>Study Materials</span>
              <h3>0</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              📝
            </div>

            <div>
              <span>Quizzes Completed</span>
              <h3>0</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              🎯
            </div>

            <div>
              <span>Average Score</span>
              <h3>0%</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              🔥
            </div>

            <div>
              <span>Study Streak</span>
              <h3>0 days</h3>
            </div>
          </div>

        </section>


        {/* Main Cards */}
        <section className="dashboard-section">

          <div className="section-heading">
            <div>
              <h2>Learning Tools</h2>
              <p>Everything you need for smarter studying.</p>
            </div>
          </div>


          <div className="tools-grid">

            <div className="tool-card">
              <div className="tool-icon blue-icon">
                📚
              </div>

              <h3>Study Materials</h3>

              <p>
                Upload lecture notes and PDFs to start
                your AI-powered learning experience.
              </p>

              <button>
                Explore →
              </button>
            </div>


            <div className="tool-card">
              <div className="tool-icon purple-icon">
                📝
              </div>

              <h3>AI Quizzes</h3>

              <p>
                Test your understanding with quizzes
                generated from your study materials.
              </p>

              <button>
                Take Quiz →
              </button>
            </div>


            <div className="tool-card">
              <div className="tool-icon green-icon">
                📊
              </div>

              <h3>Track Progress</h3>

              <p>
                Monitor your scores and understand
                how your learning is improving.
              </p>

              <button>
                View Progress →
              </button>
            </div>


            <div className="tool-card">
              <div className="tool-icon orange-icon">
                🧠
              </div>

              <h3>Weak Topics</h3>

              <p>
                Discover topics that need more practice
                and focus your study time effectively.
              </p>

              <button>
                View Topics →
              </button>
            </div>

          </div>

        </section>


        {/* Bottom section */}
        <section className="bottom-grid">

          <div className="recent-card">

            <div className="section-heading">
              <div>
                <h2>Recent Activity</h2>
                <p>Your latest learning activity.</p>
              </div>
            </div>

            <div className="empty-state">
              <div>📖</div>

              <h3>No activity yet</h3>

              <p>
                Upload your first study material
                to get started.
              </p>

              <button>
                Upload Material
              </button>
            </div>

          </div>


          <div className="quick-card">

            <div className="section-heading">
              <div>
                <h2>Quick Start</h2>
                <p>Start your next study session.</p>
              </div>
            </div>

            <div className="quick-list">

              <div className="quick-item">
                <span>📤</span>
                <div>
                  <strong>Upload Material</strong>
                  <p>Add a PDF or lecture note</p>
                </div>
              </div>

              <div className="quick-item">
                <span>✨</span>
                <div>
                  <strong>Generate Summary</strong>
                  <p>Let AI create short notes</p>
                </div>
              </div>

              <div className="quick-item">
                <span>🎯</span>
                <div>
                  <strong>Take a Quiz</strong>
                  <p>Test what you have learned</p>
                </div>
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;