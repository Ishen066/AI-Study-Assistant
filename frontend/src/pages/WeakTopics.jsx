import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function WeakTopics() {
  const navigate = useNavigate();

  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/weak-topics/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load weak topics");
        }

        return response.json();
      })
      .then((data) => {
        setWeakTopics(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load weak topics.");
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="weak-topics-loading">
        <p>Loading weak topics...</p>
      </div>
    );
  }

  return (
    <div className="weak-topics-page">

      <header className="weak-topics-header">
        <div>
          <p className="page-label">LEARNING ANALYSIS</p>

          <h1>Weak Topics 🧠</h1>

          <p>
            Focus on the topics where you need more practice.
          </p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      {error && (
        <div className="weak-topics-error">
          {error}
        </div>
      )}

      {!error && weakTopics.length === 0 && (
        <div className="weak-topics-empty">
          <div className="empty-icon">🎉</div>

          <h2>No weak topics yet</h2>

          <p>
            Complete some quizzes and your AI Study Assistant
            will identify topics that need more practice.
          </p>

          <button onClick={() => navigate("/materials")}>
            Go to Study Materials →
          </button>
        </div>
      )}

      {weakTopics.length > 0 && (
        <div className="weak-topics-grid">
          {weakTopics.map((topic) => (
            <div className="weak-topic-card" key={topic.id}>

              <div className="weak-topic-card-top">
                <div className="weak-topic-icon">
                  🧠
                </div>

                <span className="wrong-count">
                  {topic.wrong_count} wrong
                </span>
              </div>

              <h2>{topic.topic}</h2>

              <div className="topic-section">
                <h3>Why you need practice</h3>

                <p>
                  {topic.description}
                </p>
              </div>

              <div className="recommendation-box">
                <h3>💡 Recommendation</h3>

                <p>
                  {topic.recommendation}
                </p>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default WeakTopics;