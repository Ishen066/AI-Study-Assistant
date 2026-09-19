import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function Quiz() {
  const { materialId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuiz();
  }, [materialId]);

  const loadQuiz = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://127.0.0.1:8000/api/materials/${materialId}/quiz`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuestions(response.data.questions || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    const token = localStorage.getItem("access_token");

    try {
      setGenerating(true);
      setError("");

      const response = await axios.post(
        `http://127.0.0.1:8000/api/materials/${materialId}/quiz`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuestions(response.data.questions || []);
      setAnswers({});
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to generate quiz."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  return (
    <div className="quiz-page">

      <div className="quiz-header">

        <div>
          <p className="page-label">AI QUIZ</p>

          <h1>
            Test Your Knowledge 📝
          </h1>

          <p>
            Answer the questions based on your study material.
          </p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/materials")}
        >
          ← Materials
        </button>

      </div>

      {error && (
        <div className="quiz-error">
          {error}
        </div>
      )}

      {questions.length === 0 ? (

        <div className="quiz-empty">

          <div className="empty-icon">
            📝
          </div>

          <h2>
            No quiz available
          </h2>

          <p>
            Generate an AI quiz from this study material.
          </p>

          <button
            className="generate-quiz-button"
            onClick={generateQuiz}
            disabled={generating}
          >
            {generating
              ? "Generating..."
              : "✨ Generate AI Quiz"}
          </button>

        </div>

      ) : (

        <div className="quiz-container">

          <div className="quiz-info-card">

            <div>
              <span>Questions</span>
              <strong>
                {questions.length}
              </strong>
            </div>

            <div>
              <span>Answered</span>
              <strong>
                {Object.keys(answers).length}
              </strong>
            </div>

            <button
              onClick={generateQuiz}
              disabled={generating}
            >
              {generating
                ? "Generating..."
                : "🔄 New Quiz"}
            </button>

          </div>

          <div className="questions-list">

            {questions.map((question, index) => (

              <div
                className="question-card"
                key={question.id}
              >

                <div className="question-number">
                  Question {index + 1}
                </div>

                <h2>
                  {question.question}
                </h2>

                <div className="options">

                  {[
                    ["A", question.option_a],
                    ["B", question.option_b],
                    ["C", question.option_c],
                    ["D", question.option_d],
                  ].map(([letter, text]) => (

                    <label
                      className={
                        answers[question.id] === letter
                          ? "option selected"
                          : "option"
                      }
                      key={letter}
                    >

                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={letter}
                        checked={
                          answers[question.id] === letter
                        }
                        onChange={() =>
                          handleAnswer(
                            question.id,
                            letter
                          )
                        }
                      />

                      <span className="option-letter">
                        {letter}
                      </span>

                      <span className="option-text">
                        {text}
                      </span>

                    </label>

                  ))}

                </div>

              </div>

            ))}

          </div>

          <div className="quiz-submit-card">

            <p>
              Answer all questions and submit your quiz
              to see your score.
            </p>

            <button
              className="submit-quiz-button"
              disabled={
                Object.keys(answers).length !==
                questions.length
              }
            >
              Submit Quiz →
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Quiz;