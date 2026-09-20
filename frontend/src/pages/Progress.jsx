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
      <div className="progress-loading">
        <div className="loading-spinner"></div>
        <p>Loading progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page">
        <div className="progress-error">
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
    <div className="progress-page">

      {/* Header */}
      <div className="progress-header">
        <div>
          <p className="page-label">LEARNING PROGRESS</p>

          <h1>Your Progress 📊</h1>

          <p>
            Track your quiz performance and learning progress.
          </p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {/* Main Stats */}
      <div className="progress-stats-grid">

        <div className="progress-stat-card">
          <div className="progress-stat-icon">🎯</div>

          <div>
            <span>Average Score</span>
            <strong>{averageScore}%</strong>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">📝</div>

          <div>
            <span>Quizzes Completed</span>
            <strong>{totalQuizzes}</strong>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">✅</div>

          <div>
            <span>Correct Answers</span>
            <strong>{totalCorrect}</strong>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">❌</div>

          <div>
            <span>Wrong Answers</span>
            <strong>{totalWrong}</strong>
          </div>
        </div>

      </div>

      {/* Overall Progress */}
      <div className="overall-progress-card">

        <div className="section-heading">
          <div>
            <h2>Overall Performance</h2>
            <p>Your average quiz performance</p>
          </div>

          <strong>{averageScore}%</strong>
        </div>

        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${averageScore}%` }}
          ></div>
        </div>

        <p className="progress-description">
          You have completed {totalQuizzes} quiz
          {totalQuizzes !== 1 ? "zes" : ""}.
        </p>

      </div>

      {/* Quiz History */}
      <div className="quiz-history-section">

        <div className="section-heading">
          <div>
            <h2>Quiz History</h2>
            <p>Review your previous quiz results</p>
          </div>
        </div>

        {progress?.quiz_results?.length === 0 ? (
          <div className="empty-progress">
            <div>📚</div>

            <h3>No quiz results yet</h3>

            <p>
              Complete your first quiz to start tracking
              your progress.
            </p>

            <button
              className="generate-quiz-button"
              onClick={() => navigate("/materials")}
            >
              Go to Study Materials
            </button>
          </div>
        ) : (
          <div className="quiz-history-list">

            {progress.quiz_results.map((quiz) => (
              <div
                className="progress-history-item"
                key={quiz.result_id}
              >

                <div className="history-left">
                  <div className="history-icon">
                    📝
                  </div>

                  <div>
                    <h3>
                      Quiz - Material #{quiz.material_id}
                    </h3>

                    <p>
                      {quiz.correct_answers} correct
                      {" • "}
                      {quiz.wrong_answers} wrong
                      {" • "}
                      {quiz.total_questions} questions
                    </p>
                  </div>
                </div>

                <div className="history-score">
                  <strong>{quiz.score}%</strong>

                  <span>
                    {quiz.score >= 70
                      ? "Good performance"
                      : "Keep practicing"}
                  </span>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Progress;