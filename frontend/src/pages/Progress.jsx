import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Progress() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/materials/progress",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProgress(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load progress."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pg-loading-page">
        <div className="pg-spinner"></div>
        <p>Loading your progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pg-page">
        <div className="pg-error">
          {error}
        </div>
      </div>
    );
  }

  const averageScore = progress?.average_score || 0;
  const totalQuizzes = progress?.total_quizzes || 0;
  const totalCorrect = progress?.total_correct_answers || 0;
  const totalWrong = progress?.total_wrong_answers || 0;

  return (
    <div className="pg-page">

      {/* ================= HEADER ================= */}

      <div className="pg-header">

        <div className="pg-header-content">

          <span className="pg-label">
            LEARNING PROGRESS
          </span>

          <h1>Your Progress</h1>

          <p>
            Track your quiz performance and see how your
            learning is progressing.
          </p>

        </div>

        <button
          className="pg-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </div>


      {/* ================= STATS ================= */}

      <div className="pg-stats">

        <div className="pg-stat-card">

          <div className="pg-stat-icon purple">
            🎯
          </div>

          <div className="pg-stat-text">
            <span>Average Score</span>
            <strong>{averageScore}%</strong>
            <small>Overall performance</small>
          </div>

        </div>


        <div className="pg-stat-card">

          <div className="pg-stat-icon blue">
            📝
          </div>

          <div className="pg-stat-text">
            <span>Quizzes Completed</span>
            <strong>{totalQuizzes}</strong>
            <small>Total attempts</small>
          </div>

        </div>


        <div className="pg-stat-card">

          <div className="pg-stat-icon green">
            ✅
          </div>

          <div className="pg-stat-text">
            <span>Correct Answers</span>
            <strong>{totalCorrect}</strong>
            <small>Questions answered correctly</small>
          </div>

        </div>


        <div className="pg-stat-card">

          <div className="pg-stat-icon red">
            ❌
          </div>

          <div className="pg-stat-text">
            <span>Wrong Answers</span>
            <strong>{totalWrong}</strong>
            <small>Questions to review</small>
          </div>

        </div>

      </div>


      {/* ================= OVERALL PERFORMANCE ================= */}

      <section className="pg-card">

        <div className="pg-section-header">

          <div>
            <span className="pg-label">
              OVERALL PERFORMANCE
            </span>

            <h2>Learning Overview</h2>

            <p>
              Your average score across completed quizzes.
            </p>
          </div>

          <div className="pg-big-score">
            {averageScore}%
          </div>

        </div>


        <div className="pg-progress-track">
          <div
            className="pg-progress-fill"
            style={{
              width: `${Math.min(averageScore, 100)}%`,
            }}
          ></div>
        </div>


        <div className="pg-progress-scale">
          <span>0%</span>

          <span>
            {averageScore >= 70
              ? "Good Progress"
              : "Keep Practicing"}
          </span>

          <span>100%</span>
        </div>


        <div className="pg-learning-message">

          <div className="pg-message-icon">
            💡
          </div>

          <div>
            <strong>
              {averageScore >= 70
                ? "Great work!"
                : "Keep learning!"}
            </strong>

            <p>
              You have completed {totalQuizzes} quiz
              {totalQuizzes !== 1 ? "zes" : ""} so far.
            </p>
          </div>

        </div>

      </section>


      {/* ================= QUIZ HISTORY ================= */}

      <section className="pg-card">

        <div className="pg-section-title-row">

          <div>
            <span className="pg-label">
              ACTIVITY
            </span>

            <h2>Quiz History</h2>

            <p>
              Review your previous quiz results.
            </p>
          </div>

          <span className="pg-result-count">
            {progress?.quiz_results?.length || 0} results
          </span>

        </div>


        {progress?.quiz_results?.length === 0 ? (

          <div className="pg-empty">

            <div className="pg-empty-icon">
              📚
            </div>

            <h3>No quiz results yet</h3>

            <p>
              Complete your first quiz to start tracking
              your progress.
            </p>

            <button
              className="pg-primary-button"
              onClick={() => navigate("/materials")}
            >
              📚 Go to Study Materials
            </button>

          </div>

        ) : (

          <div className="pg-history">

            {progress.quiz_results.map((quiz) => (

              <div
                className="pg-history-item"
                key={quiz.result_id}
              >

                <div className="pg-history-left">

                  <div className="pg-history-icon">
                    📝
                  </div>

                  <div>

                    <h3>
                      Quiz - Material #{quiz.material_id}
                    </h3>

                    <p>
                      {quiz.correct_answers} correct
                      <span>•</span>
                      {quiz.wrong_answers} wrong
                      <span>•</span>
                      {quiz.total_questions} questions
                    </p>

                  </div>

                </div>


                <div className="pg-history-right">

                  <strong>
                    {quiz.score}%
                  </strong>

                  <span
                    className={
                      quiz.score >= 70
                        ? "pg-good"
                        : "pg-needs-practice"
                    }
                  >
                    {quiz.score >= 70
                      ? "Good performance"
                      : "Needs Practice"}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* ================= CONTINUE ================= */}

      <section className="pg-continue">

        <div>

          <span className="pg-label">
            KEEP GOING
          </span>

          <h2>
            Continue Your Learning
          </h2>

          <p>
            Practice more quizzes or review your study
            materials to improve your performance.
          </p>

        </div>

        <div className="pg-continue-buttons">

          <button
            className="pg-primary-button"
            onClick={() => navigate("/materials")}
          >
            📚 Study Materials
          </button>

          <button
            className="pg-secondary-button"
            onClick={() => navigate("/weak-topics")}
          >
            💡 Weak Topics
          </button>

        </div>

      </section>

    </div>
  );
}

export default Progress;