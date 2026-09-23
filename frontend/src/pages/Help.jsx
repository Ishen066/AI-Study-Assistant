import { useNavigate } from "react-router-dom";

function Help() {
  const navigate = useNavigate();

  const goToMaterials = () => {
    navigate("/materials");
  };

  const goToQuizzes = () => {
    navigate("/materials");
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

  return (
    <div className="help-page">

      {/* HEADER */}
      <div className="help-header">
        <div>
          <span className="help-label">SUPPORT CENTER</span>

          <h1>Need Help?</h1>

          <p>
            Find answers and learn how to use your AI Study Assistant.
          </p>
        </div>

        <button
          className="help-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>


      {/* HELP CARDS */}
      <div className="help-grid">

        {/* Study Materials */}
        <button
          className="help-card"
          onClick={goToMaterials}
        >
          <div className="help-icon blue">
            📚
          </div>

          <h2>Study Materials</h2>

          <p>
            Learn how to upload PDFs, generate summaries, and manage
            your study materials.
          </p>

          <span className="help-card-arrow">
            Open Study Materials →
          </span>
        </button>


        {/* AI Quizzes */}
        <button
          className="help-card"
          onClick={goToQuizzes}
        >
          <div className="help-icon purple">
            📝
          </div>

          <h2>AI Quizzes</h2>

          <p>
            Learn how to generate quizzes, answer questions, and review
            your quiz results.
          </p>

          <span className="help-card-arrow">
            Open Quizzes →
          </span>
        </button>


        {/* Progress */}
        <button
          className="help-card"
          onClick={goToProgress}
        >
          <div className="help-icon green">
            📊
          </div>

          <h2>Progress</h2>

          <p>
            Check your quiz performance and track your learning progress.
          </p>

          <span className="help-card-arrow">
            View Progress →
          </span>
        </button>


        {/* Weak Topics */}
        <button
          className="help-card"
          onClick={goToWeakTopics}
        >
          <div className="help-icon orange">
            💡
          </div>

          <h2>Weak Topics</h2>

          <p>
            Understand how weak topics are identified and how you can
            review them.
          </p>

          <span className="help-card-arrow">
            View Weak Topics →
          </span>
        </button>


        {/* Study Planner */}
        <button
          className="help-card"
          onClick={goToStudyPlanner}
        >
          <div className="help-icon pink">
            📅
          </div>

          <h2>Study Planner</h2>

          <p>
            Create study plans, organize your tasks, and mark completed
            sessions.
          </p>

          <span className="help-card-arrow">
            Open Study Planner →
          </span>
        </button>


        {/* AI Assistant */}
        <button
          className="help-card"
          onClick={() => navigate("/dashboard")}
        >
          <div className="help-icon teal">
            🤖
          </div>

          <h2>AI Assistant</h2>

          <p>
            Get help with studying and use AI-powered features effectively.
          </p>

          <span className="help-card-arrow">
            Go to Dashboard →
          </span>
        </button>

      </div>


      {/* STILL NEED HELP */}
      <div className="help-contact">

        <div>
          <span className="help-label">
            STILL NEED HELP?
          </span>

          <h2>We're here to help</h2>

          <p>
            If you cannot find what you are looking for, check the
            available study features or return to your dashboard.
          </p>
        </div>

        <button
          className="help-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard →
        </button>

      </div>

    </div>
  );
}

export default Help;