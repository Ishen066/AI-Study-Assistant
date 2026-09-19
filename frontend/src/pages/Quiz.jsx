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
  const [submitting, setSubmitting] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuiz();
  }, [materialId]);

  // ==========================================
  // LOAD QUIZ
  // ==========================================

  const loadQuiz = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

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

  // ==========================================
  // GENERATE NEW QUIZ
  // ==========================================

  const generateQuiz = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setResult(null);

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

  // ==========================================
  // SELECT ANSWER
  // ==========================================

  const handleAnswer = (questionId, answer) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  // ==========================================
  // SUBMIT QUIZ
  // ==========================================

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const answerList = questions.map((question) => ({
        question_id: question.id,
        answer: answers[question.id],
      }));

      const response = await axios.post(
        `http://127.0.0.1:8000/api/materials/${materialId}/quiz/submit`,
        {
          answers: answerList,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to submit quiz."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  // ==========================================
  // RESULT VIEW
  // ==========================================

  if (result) {
    return (
      <div className="quiz-page">

        <div className="quiz-header">

          <div>
            <p className="page-label">
              QUIZ RESULT
            </p>

            <h1>
              Quiz Completed 🎉
            </h1>

            <p>
              Here is your quiz performance.
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

        <div className="quiz-result-card">

          <div className="result-icon">
            🎯
          </div>

          <p className="result-label">
            YOUR SCORE
          </p>

          <h2 className="result-score">
            {result.score}%
          </h2>

          <div className="result-stats">

            <div className="result-stat">
              <span>Total Questions</span>
              <strong>
                {result.total_questions}
              </strong>
            </div>

            <div className="result-stat">
              <span>Correct Answers</span>
              <strong>
                {result.correct_answers}
              </strong>
            </div>

            <div className="result-stat">
              <span>Wrong Answers</span>
              <strong>
                {result.wrong_answers}
              </strong>
            </div>

          </div>

          <div className="result-actions">

            <button
              className="generate-quiz-button"
              onClick={generateQuiz}
              disabled={generating}
            >
              {generating
                ? "Generating..."
                : "🔄 Try Again"}
            </button>

            <button
              className="back-button"
              onClick={() => navigate("/materials")}
            >
              Back to Materials
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // QUIZ PAGE
  // ==========================================

  return (
    <div className="quiz-page">

      <div className="quiz-header">

        <div>

          <p className="page-label">
            AI QUIZ
          </p>

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

          {/* Quiz information */}

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
              disabled={generating || submitting}
            >
              {generating
                ? "Generating..."
                : "🔄 New Quiz"}
            </button>

          </div>

          {/* Questions */}

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
                        disabled={submitting}
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

          {/* Submit */}

          <div className="quiz-submit-card">

            <p>
              {Object.keys(answers).length === questions.length
                ? "All questions answered. You can submit your quiz."
                : `Please answer all ${questions.length} questions.`}
            </p>

            <button
              className="submit-quiz-button"
              onClick={handleSubmit}
              disabled={
                submitting ||
                Object.keys(answers).length !==
                  questions.length
              }
            >
              {submitting
                ? "Submitting..."
                : "Submit Quiz →"}
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Quiz;