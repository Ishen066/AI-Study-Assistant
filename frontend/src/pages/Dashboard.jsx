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

    // Load logged-in user
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

    // Load study materials
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

    // Load quiz progress
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

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  // Navigation
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

  const goToProgress = () => {
    navigate("/progress");
  };

  const goToWeakTopics = () => {
    navigate("/weak-topics");
  };

  const goToStudyPlanner = () => {
    navigate("/study-planner");
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

      {/* =========================
          SIDEBAR
      ========================== */}

      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">AI</div>

          <div>
            <h2>Study Assistant</h2>
            <span>AI Powered Learning</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() => navigate("/dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={goToMaterials}
          >
            <span>▣</span>
            Study Materials
          </button>

          <button
            className="nav-item"
            onClick={goToQuiz}
          >
            <span>✓</span>
            Quizzes
          </button>

          <button
            className="nav-item"
            onClick={goToProgress}
          >
            <span>◫</span>
            Progress
          </button>

          <button
            className="nav-item"
            onClick={goToWeakTopics}
          >
            <span>◈</span>
            Weak Topics
          </button>

          <button
            className="nav-item"
            onClick={goToStudyPlanner}
          >
            <span>□</span>
            Study Planner
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-help">
            <div className="help-icon">?</div>

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


      {/* =========================
          MAIN CONTENT
      ========================== */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-topbar">

          <div>
            <p className="page-label">
              STUDENT DASHBOARD
            </p>

            <h1>
              Good to see you, {user.name}
            </h1>

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


        {/* =========================
            HERO BANNER
        ========================== */}

        <section className="welcome-banner">

          <div className="welcome-content">

            <span className="banner-tag">
              AI POWERED LEARNING
            </span>

            <h2>
              Your learning journey,
              <br />
              <span>made smarter.</span>
            </h2>

            <p>
              Upload your study materials, generate AI
              summaries, practice with quizzes, and
              track your learning progress.
            </p>

            <button
              className="primary-banner-button"
              onClick={goToMaterials}
            >
              Start Studying
              <span>→</span>
            </button>

          </div>

          <div className="banner-visual">

            <div className="brain-circle">
              ✦
            </div>

            <div className="floating-card card-one">
              <span>📚</span>
              Study
            </div>

            <div className="floating-card card-two">
              <span>✓</span>
              Quiz
            </div>

            <div className="floating-card card-three">
              <span>↗</span>
              Progress
            </div>

          </div>

        </section>


        {/* =========================
            STATISTICS
        ========================== */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              📚
            </div>

            <div>
              <span>Study Materials</span>

              <h3>
                {loadingStats
                  ? "..."
                  : dashboardStats.totalMaterials}
              </h3>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon purple">
              ✓
            </div>

            <div>
              <span>Quizzes Completed</span>

              <h3>
                {loadingStats
                  ? "..."
                  : dashboardStats.totalQuizzes}
              </h3>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon green">
              %
            </div>

            <div>
              <span>Average Score</span>

              <h3>
                {loadingStats
                  ? "..."
                  : `${dashboardStats.averageScore}%`}
              </h3>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon orange">
              ✓
            </div>

            <div>
              <span>Correct Answers</span>

              <h3>
                {loadingStats
                  ? "..."
                  : dashboardStats.totalCorrect}
              </h3>
            </div>

          </div>

        </section>


        {/* =========================
            LEARNING PROGRESS
        ========================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>Learning Progress</h2>

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

            <div className="progress-main-card">

              <div className="progress-main-icon">
                %
              </div>

              <div>
                <span>Overall Average Score</span>

                <strong>
                  {dashboardStats.averageScore}%
                </strong>
              </div>

            </div>


            <div className="progress-small-card">

              <span>Quizzes Completed</span>

              <strong>
                {dashboardStats.totalQuizzes}
              </strong>

              <p>
                Total quiz attempts
              </p>

            </div>


            <div className="progress-small-card">

              <span>Correct Answers</span>

              <strong>
                {dashboardStats.totalCorrect}
              </strong>

              <p>
                Answers answered correctly
              </p>

            </div>


            <div className="progress-small-card">

              <span>Wrong Answers</span>

              <strong>
                {dashboardStats.totalWrong}
              </strong>

              <p>
                Answers that need more practice
              </p>

            </div>

          </div>

        </section>


        {/* =========================
            LEARNING TOOLS
        ========================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>Learning Tools</h2>

              <p>
                Everything you need for smarter studying.
              </p>
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

              <button onClick={goToMaterials}>
                Explore →
              </button>

            </div>


            <div className="tool-card">

              <div className="tool-icon purple-icon">
                ✓
              </div>

              <h3>AI Quizzes</h3>

              <p>
                Test your understanding with quizzes
                generated from your study materials.
              </p>

              <button onClick={goToQuiz}>
                Take Quiz →
              </button>

            </div>


            <div className="tool-card">

              <div className="tool-icon green-icon">
                ↗
              </div>

              <h3>Track Progress</h3>

              <p>
                Monitor your scores and understand
                how your learning is improving.
              </p>

              <button onClick={goToProgress}>
                View Progress →
              </button>

            </div>


            <div className="tool-card">

              <div className="tool-icon orange-icon">
                ◈
              </div>

              <h3>Weak Topics</h3>

              <p>
                Discover topics that need more practice
                and focus your study time effectively.
              </p>

              <button onClick={goToWeakTopics}>
                View Topics →
              </button>

            </div>


            <div className="tool-card">

              <div className="tool-icon pink-icon">
                □
              </div>

              <h3>Study Planner</h3>

              <p>
                Organize your study sessions and build
                a consistent learning routine.
              </p>

              <button onClick={goToStudyPlanner}>
                Plan Study →
              </button>

            </div>

          </div>

        </section>


        {/* =========================
            BOTTOM AREA
        ========================== */}

        <section className="bottom-grid">


          {/* =========================
              QUIZ HISTORY
          ========================== */}

          <div className="recent-card">

            <div className="section-heading">

              <div>
                <h2>Quiz History</h2>

                <p>
                  Your latest quiz performance.
                </p>
              </div>

              {dashboardStats.quizResults.length > 0 && (
                <span className="history-count">
                  {dashboardStats.quizResults.length} quizzes
                </span>
              )}

            </div>


            {dashboardStats.quizResults.length === 0 ? (

              <div className="empty-state">

                <div className="empty-state-icon">
                  📖
                </div>

                <h3>
                  No quiz history yet
                </h3>

                <p>
                  Complete your first quiz to start
                  tracking your progress.
                </p>

                <button onClick={goToMaterials}>
                  Start Studying
                </button>

              </div>

            ) : (

              <div className="recent-activity-list">

                {dashboardStats.quizResults
                  .slice(0, 5)
                  .map((result) => {

                    const score = Number(result.score) || 0;

                    return (
                      <div
                        className="recent-activity-item"
                        key={result.result_id}
                        onClick={() =>
                          goToQuizResult(result.material_id)
                        }
                      >

                        <div
                          className={`activity-icon ${
                            score >= 70
                              ? "score-good"
                              : score >= 40
                              ? "score-medium"
                              : "score-low"
                          }`}
                        >
                          ✓
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
                            {score}%
                          </strong>

                          <span>
                            {result.correct_answers} /{" "}
                            {result.total_questions} correct
                          </span>

                        </div>

                        <span className="activity-arrow">
                          →
                        </span>

                      </div>
                    );
                  })}

              </div>

            )}

          </div>


          {/* =========================
              QUICK START
          ========================== */}

          <div className="quick-card">

            <div className="section-heading">

              <div>
                <h2>Quick Start</h2>

                <p>
                  Start your next study session.
                </p>
              </div>

            </div>


            <div className="quick-list">

              <div
                className="quick-item"
                onClick={goToMaterials}
              >

                <div className="quick-icon">
                  ↑
                </div>

                <div>
                  <strong>
                    Upload Material
                  </strong>

                  <p>
                    Add a PDF or lecture note
                  </p>
                </div>

                <span className="quick-arrow">
                  →
                </span>

              </div>


              <div
                className="quick-item"
                onClick={goToMaterials}
              >

                <div className="quick-icon">
                  ✦
                </div>

                <div>
                  <strong>
                    Generate Summary
                  </strong>

                  <p>
                    Let AI create short notes
                  </p>
                </div>

                <span className="quick-arrow">
                  →
                </span>

              </div>


              <div
                className="quick-item"
                onClick={goToQuiz}
              >

                <div className="quick-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Take a Quiz
                  </strong>

                  <p>
                    Test what you have learned
                  </p>
                </div>

                <span className="quick-arrow">
                  →
                </span>

              </div>


              <div
                className="quick-item"
                onClick={goToStudyPlanner}
              >

                <div className="quick-icon">
                  □
                </div>

                <div>
                  <strong>
                    Plan Study Session
                  </strong>

                  <p>
                    Organize your study time
                  </p>
                </div>

                <span className="quick-arrow">
                  →
                </span>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;