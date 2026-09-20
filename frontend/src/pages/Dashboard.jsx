import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [dashboardStats, setDashboardStats] = useState({
    totalMaterials: 0,
    totalQuizzes: 0,
    averageScore: 0,
    totalCorrect: 0,
    totalWrong: 0,
    quizResults: [],
  });

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    // ==========================================
    // LOAD LOGGED-IN USER
    // ==========================================

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

    // ==========================================
    // LOAD STUDY MATERIALS
    // ==========================================

    fetch("http://127.0.0.1:8000/api/materials/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load materials");
        }

        return response.json();
      })
      .then((materials) => {
        setDashboardStats((previous) => ({
          ...previous,
          totalMaterials: materials.length,
        }));
      })
      .catch((error) => {
        console.error("Failed to load materials:", error);
      });

    // ==========================================
    // LOAD QUIZ PROGRESS
    // ==========================================

    fetch("http://127.0.0.1:8000/api/materials/progress", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load progress");
        }

        return response.json();
      })
      .then((progress) => {
        setDashboardStats((previous) => ({
          ...previous,
          totalQuizzes: progress.total_quizzes || 0,
          averageScore: progress.average_score || 0,
          totalCorrect: progress.total_correct_answers || 0,
          totalWrong: progress.total_wrong_answers || 0,
          quizResults: progress.quiz_results || [],
        }));
      })
      .catch((error) => {
        console.error("Failed to load progress:", error);
      })
      .finally(() => {
        setLoadingStats(false);
      });
  }, [navigate]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const goToMaterials = () => {
    navigate("/materials");
  };

  const goToQuiz = () => {
    if (dashboardStats.quizResults.length > 0) {
      const latestQuiz = dashboardStats.quizResults[0];

      navigate(`/quiz/${latestQuiz.material_id}`);
    } else {
      navigate("/materials");
    }
  };

  const goToQuizResult = (materialId) => {
    navigate(`/quiz/${materialId}`);
  };

  // ==========================================
  // GO TO SEPARATE PROGRESS PAGE
  // ==========================================

  const goToProgress = () => {
    navigate("/progress");
  };

  // ==========================================
  // LOADING
  // ==========================================

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

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside className="sidebar">

        {/* Logo */}

        <div className="sidebar-logo">

          <div className="logo-icon">
            AI
          </div>

          <div>
            <h2>Study Assistant</h2>
            <span>AI Powered Learning</span>
          </div>

        </div>


        {/* Navigation */}

        <nav className="sidebar-nav">

          {/* Dashboard */}

          <button
            className="nav-item active"
            onClick={() => navigate("/dashboard")}
          >
            <span>🏠</span>
            Dashboard
          </button>


          {/* Study Materials */}

          <button
            className="nav-item"
            onClick={goToMaterials}
          >
            <span>📚</span>
            Study Materials
          </button>


          {/* Quizzes */}

          <button
            className="nav-item"
            onClick={goToQuiz}
          >
            <span>📝</span>
            Quizzes
          </button>


          {/* Progress */}

          <button
            className="nav-item"
            onClick={goToProgress}
          >
            <span>📊</span>
            Progress
          </button>


          {/* Weak Topics */}

          <button
            className="nav-item"
            onClick={() => {
              alert(
                "Weak Topics feature will be available soon."
              );
            }}
          >
            <span>🧠</span>
            Weak Topics
          </button>


          {/* Study Planner */}

          <button
            className="nav-item"
            onClick={() => {
              alert(
                "Study Planner feature will be available soon."
              );
            }}
          >
            <span>📅</span>
            Study Planner
          </button>

        </nav>


        {/* Sidebar Bottom */}

        <div className="sidebar-bottom">

          <div className="sidebar-help">

            <span>💡</span>

            <div>
              <strong>Need help?</strong>

              <p>
                Ask your AI Study Assistant.
              </p>
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


      {/* ================================
          MAIN CONTENT
      ================================= */}

      <main className="dashboard-main">


        {/* Top Bar */}

        <header className="dashboard-topbar">

          <div>

            <p className="page-label">
              STUDENT DASHBOARD
            </p>

            <h1>
              Good to see you, {user.name} 👋
            </h1>

            <p className="topbar-subtitle">
              Keep learning, keep improving.
            </p>

          </div>


          {/* User Profile */}

          <div className="user-profile">

            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">

              <strong>
                {user.name}
              </strong>

              <span>
                {user.email}
              </span>

            </div>

          </div>

        </header>


        {/* ================================
            WELCOME BANNER
        ================================= */}

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
              Upload your study materials, generate AI
              summaries, practice with quizzes, and
              track your progress.
            </p>

            <button
              className="primary-banner-button"
              onClick={goToMaterials}
            >
              Start Studying →
            </button>

          </div>


          {/* Banner Visual */}

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


        {/* ================================
            STATS
        ================================= */}

        <section className="stats-grid">


          {/* Study Materials */}

          <div className="stat-card">

            <div className="stat-icon blue">
              📚
            </div>

            <div>

              <span>
                Study Materials
              </span>

              <h3>
                {loadingStats
                  ? "..."
                  : dashboardStats.totalMaterials}
              </h3>

            </div>

          </div>


          {/* Quizzes */}

          <div className="stat-card">

            <div className="stat-icon purple">
              📝
            </div>

            <div>

              <span>
                Quizzes Completed
              </span>

              <h3>
                {loadingStats
                  ? "..."
                  : dashboardStats.totalQuizzes}
              </h3>

            </div>

          </div>


          {/* Average Score */}

          <div className="stat-card">

            <div className="stat-icon green">
              🎯
            </div>

            <div>

              <span>
                Average Score
              </span>

              <h3>
                {loadingStats
                  ? "..."
                  : `${dashboardStats.averageScore}%`}
              </h3>

            </div>

          </div>


          {/* Correct Answers */}

          <div className="stat-card">

            <div className="stat-icon orange">
              ✅
            </div>

            <div>

              <span>
                Correct Answers
              </span>

              <h3>
                {loadingStats
                  ? "..."
                  : dashboardStats.totalCorrect}
              </h3>

            </div>

          </div>

        </section>


        {/* ================================
            PROGRESS OVERVIEW
        ================================= */}

        <section
          className="dashboard-section progress-overview"
        >

          <div className="section-heading">

            <div>

              <h2>
                Learning Progress
              </h2>

              <p>
                A quick overview of your quiz performance.
              </p>

            </div>

            <button
              className="view-progress-button"
              onClick={goToProgress}
            >
              View Full Progress →
            </button>

          </div>


          <div className="progress-overview-grid">

            {/* Average Score */}

            <div className="progress-main-card">

              <div className="progress-main-icon">
                🎯
              </div>

              <div>

                <span>
                  Overall Average Score
                </span>

                <strong>
                  {dashboardStats.averageScore}%
                </strong>

              </div>

            </div>


            {/* Quiz Count */}

            <div className="progress-small-card">

              <span>
                Quizzes Completed
              </span>

              <strong>
                {dashboardStats.totalQuizzes}
              </strong>

              <p>
                Total quiz attempts
              </p>

            </div>


            {/* Correct */}

            <div className="progress-small-card">

              <span>
                Correct Answers
              </span>

              <strong>
                {dashboardStats.totalCorrect}
              </strong>

              <p>
                Answers answered correctly
              </p>

            </div>


            {/* Wrong */}

            <div className="progress-small-card">

              <span>
                Wrong Answers
              </span>

              <strong>
                {dashboardStats.totalWrong}
              </strong>

              <p>
                Answers that need more practice
              </p>

            </div>

          </div>

        </section>


        {/* ================================
            LEARNING TOOLS
        ================================= */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                Learning Tools
              </h2>

              <p>
                Everything you need for smarter studying.
              </p>

            </div>

          </div>


          <div className="tools-grid">


            {/* Study Materials */}

            <div className="tool-card">

              <div className="tool-icon blue-icon">
                📚
              </div>

              <h3>
                Study Materials
              </h3>

              <p>
                Upload lecture notes and PDFs to start
                your AI-powered learning experience.
              </p>

              <button
                onClick={goToMaterials}
              >
                Explore →
              </button>

            </div>


            {/* AI Quizzes */}

            <div className="tool-card">

              <div className="tool-icon purple-icon">
                📝
              </div>

              <h3>
                AI Quizzes
              </h3>

              <p>
                Test your understanding with quizzes
                generated from your study materials.
              </p>

              <button
                onClick={goToQuiz}
              >
                Take Quiz →
              </button>

            </div>


            {/* Progress */}

            <div className="tool-card">

              <div className="tool-icon green-icon">
                📊
              </div>

              <h3>
                Track Progress
              </h3>

              <p>
                Monitor your scores and understand
                how your learning is improving.
              </p>

              <button
                onClick={goToProgress}
              >
                View Progress →
              </button>

            </div>


            {/* Weak Topics */}

            <div className="tool-card">

              <div className="tool-icon orange-icon">
                🧠
              </div>

              <h3>
                Weak Topics
              </h3>

              <p>
                Discover topics that need more practice
                and focus your study time effectively.
              </p>

              <button
                onClick={() => {
                  alert(
                    "Weak Topics feature will be available soon."
                  );
                }}
              >
                View Topics →
              </button>

            </div>

          </div>

        </section>


        {/* ================================
            QUIZ HISTORY
        ================================= */}

        <section className="bottom-grid">


          {/* Quiz History */}

          <div className="recent-card">

            <div className="section-heading">

              <div>

                <h2>
                  Quiz History
                </h2>

                <p>
                  Your latest quiz performance.
                </p>

              </div>

            </div>


            {dashboardStats.quizResults.length === 0 ? (

              <div className="empty-state">

                <div>
                  📖
                </div>

                <h3>
                  No quiz history yet
                </h3>

                <p>
                  Complete your first quiz to start
                  tracking your progress.
                </p>

                <button
                  onClick={goToMaterials}
                >
                  Start Studying
                </button>

              </div>

            ) : (

              <div className="recent-activity-list">

                {dashboardStats.quizResults
                  .slice(0, 5)
                  .map((result) => (

                    <div
                      className="recent-activity-item"
                      key={result.result_id}
                      onClick={() =>
                        goToQuizResult(
                          result.material_id
                        )
                      }
                      style={{
                        cursor: "pointer",
                      }}
                    >

                      <div className="activity-icon">
                        📝
                      </div>

                      <div className="activity-info">

                        <strong>
                          Quiz Completed
                        </strong>

                        <p>
                          Material #{result.material_id}
                        </p>

                      </div>

                      <div className="activity-score">

                        <strong>
                          {result.score}%
                        </strong>

                        <span>
                          {result.correct_answers}/
                          {result.total_questions}
                        </span>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>


          {/* Quick Start */}

          <div className="quick-card">

            <div className="section-heading">

              <div>

                <h2>
                  Quick Start
                </h2>

                <p>
                  Start your next study session.
                </p>

              </div>

            </div>


            <div className="quick-list">


              {/* Upload */}

              <div
                className="quick-item"
                onClick={goToMaterials}
                style={{
                  cursor: "pointer",
                }}
              >

                <span>
                  📤
                </span>

                <div>

                  <strong>
                    Upload Material
                  </strong>

                  <p>
                    Add a PDF or lecture note
                  </p>

                </div>

              </div>


              {/* Summary */}

              <div
                className="quick-item"
                onClick={goToMaterials}
                style={{
                  cursor: "pointer",
                }}
              >

                <span>
                  ✨
                </span>

                <div>

                  <strong>
                    Generate Summary
                  </strong>

                  <p>
                    Let AI create short notes
                  </p>

                </div>

              </div>


              {/* Quiz */}

              <div
                className="quick-item"
                onClick={goToQuiz}
                style={{
                  cursor: "pointer",
                }}
              >

                <span>
                  🎯
                </span>

                <div>

                  <strong>
                    Take a Quiz
                  </strong>

                  <p>
                    Test what you have learned
                  </p>

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