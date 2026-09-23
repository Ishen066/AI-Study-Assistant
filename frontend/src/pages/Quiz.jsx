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

  // =========================
  // LOAD QUIZ
  // =========================

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

  // =========================
  // GENERATE NEW QUIZ
  // =========================

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

  // =========================
  // SELECT ANSWER
  // =========================

  const handleAnswer = (questionId, answer) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  // =========================
  // SUBMIT QUIZ
  // =========================

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

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner"></div>

        <h3>Loading your quiz...</h3>

        <p>
          Preparing your questions
        </p>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  const progressPercentage =
    questions.length > 0
      ? Math.round(
          (answeredCount / questions.length) * 100
        )
      : 0;

  // =========================
  // RESULT VIEW
  // =========================

  if (result) {
    return (
      <div className="quiz-page">

        {/* Header */}

        <div className="quiz-header">

          <div className="quiz-title-area">

            <div className="quiz-title-icon">
              🎯
            </div>

            <div>
              <p className="page-label">
                QUIZ RESULT
              </p>

              <h1>
                Quiz Completed
              </h1>

              <p>
                Here is your performance from this quiz.
              </p>
            </div>

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
            <span>!</span>
            {error}
          </div>
        )}


        {/* Result Card */}

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

          <p className="result-message">
            {result.score >= 80
              ? "Great work! Keep it up."
              : result.score >= 50
              ? "Good effort! Keep practicing."
              : "Keep practicing and review your weak areas."}
          </p>


          {/* Statistics */}

          <div className="result-stats">

            <div className="result-stat">
              <span>Total Questions</span>
              <strong>
                {result.total_questions}
              </strong>
            </div>

            <div className="result-stat result-correct">
              <span>Correct Answers</span>
              <strong>
                {result.correct_answers}
              </strong>
            </div>

            <div className="result-stat result-wrong">
              <span>Wrong Answers</span>
              <strong>
                {result.wrong_answers}
              </strong>
            </div>

          </div>


          {/* Actions */}

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


  // =========================
  // QUIZ PAGE
  // =========================

  return (
    <div className="quiz-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="quiz-header">

        <div className="quiz-title-area">

          <div className="quiz-title-icon">
            📝
          </div>

          <div>
            <p className="page-label">
              AI QUIZ
            </p>

            <h1>
              Test Your Knowledge
            </h1>

            <p>
              Answer the questions based on your study material.
            </p>
          </div>

        </div>

        <button
          className="back-button"
          onClick={() => navigate("/materials")}
        >
          ← Materials
        </button>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="quiz-error">
          <span>!</span>
          {error}
        </div>
      )}


      {/* =========================
          EMPTY STATE
      ========================= */}

      {questions.length === 0 ? (

        <div className="quiz-empty">

          <div className="empty-icon">
            📝
          </div>

          <p className="page-label">
            READY TO LEARN?
          </p>

          <h2>
            No Quiz Available
          </h2>

          <p>
            Generate an AI-powered quiz from this
            study material and test your knowledge.
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

          {/* =========================
              QUIZ PROGRESS CARD
          ========================= */}

          <div className="quiz-info-card">

            <div className="quiz-info-item">

              <span>
                QUESTIONS
              </span>

              <strong>
                {questions.length}
              </strong>

            </div>


            <div className="quiz-info-item">

              <span>
                ANSWERED
              </span>

              <strong>
                {answeredCount}
              </strong>

            </div>


            <div className="quiz-progress-area">

              <div className="quiz-progress-header">

                <span>
                  Your Progress
                </span>

                <strong>
                  {progressPercentage}%
                </strong>

              </div>

              <div className="quiz-progress-bar">

                <div
                  className="quiz-progress-fill"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                ></div>

              </div>

            </div>


            <button
              className="new-quiz-button"
              onClick={generateQuiz}
              disabled={generating || submitting}
            >
              {generating
                ? "Generating..."
                : "🔄 New Quiz"}
            </button>

          </div>


          {/* =========================
              QUESTIONS
          ========================= */}

          <div className="questions-list">

            {questions.map((question, index) => (

              <div
                className="question-card"
                key={question.id}
              >

                <div className="question-top">

                  <span className="question-number">
                    Question {index + 1}
                  </span>

                  <span className="question-status">
                    {answers[question.id]
                      ? "Answered ✓"
                      : "Not answered"}
                  </span>

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

                      {answers[question.id] === letter && (
                        <span className="selected-check">
                          ✓
                        </span>
                      )}

                    </label>

                  ))}

                </div>

              </div>

            ))}

          </div>


          {/* =========================
              SUBMIT SECTION
          ========================= */}

          <div className="quiz-submit-card">

            <div className="submit-info">

              <div className="submit-icon">
                🚀
              </div>

              <div>

                <h3>
                  Ready to submit?
                </h3>

                <p>
                  {answeredCount === questions.length
                    ? "All questions have been answered."
                    : `Answer all ${questions.length} questions before submitting.`}
                </p>

              </div>

            </div>

            <button
              className="submit-quiz-button"
              onClick={handleSubmit}
              disabled={
                submitting ||
                answeredCount !== questions.length
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