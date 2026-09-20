import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudyPlanner() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    topic: "",
    material_id: "",
    study_date: "",
    start_time: "",
    duration_minutes: 30,
    priority: "Medium",
    notes: "",
  });

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchPlans();
  }, [navigate, token]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/study-planner/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load study plans");
      }

      const data = await response.json();

      setPlans(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Unable to load study plans.");
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/study-planner/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            topic: formData.topic,
            material_id: formData.material_id
              ? Number(formData.material_id)
              : null,
            study_date: formData.study_date,
            start_time: formData.start_time
              ? `${formData.start_time}:00`
              : null,
            duration_minutes: Number(formData.duration_minutes),
            priority: formData.priority,
            notes: formData.notes || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create study plan");
      }

      setFormData({
        topic: "",
        material_id: "",
        study_date: "",
        start_time: "",
        duration_minutes: 30,
        priority: "Medium",
        notes: "",
      });

      setShowForm(false);
      setError("");

      fetchPlans();
    } catch (error) {
      console.error(error);
      setError("Unable to create study plan.");
    }
  };

  const markCompleted = async (plan) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/study-planner/${plan.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed: !plan.completed,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update study plan");
      }

      fetchPlans();
    } catch (error) {
      console.error(error);
      setError("Unable to update study plan.");
    }
  };

  const deletePlan = async (planId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this study task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/study-planner/${planId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete study plan");
      }

      fetchPlans();
    } catch (error) {
      console.error(error);
      setError("Unable to delete study plan.");
    }
  };

  if (loading) {
    return (
      <div className="study-planner-loading">
        <p>Loading study planner...</p>
      </div>
    );
  }

  return (
    <div className="study-planner-page">
      <header className="study-planner-header">
        <div>
          <p className="page-label">STUDY ORGANIZATION</p>

          <h1>Study Planner 📅</h1>

          <p>
            Plan your study sessions and stay consistent with your learning.
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
        <div className="study-planner-error">
          {error}
        </div>
      )}

      <div className="study-planner-actions">
        <button
          className="add-study-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Close Form" : "＋ Add Study Task"}
        </button>
      </div>

      {showForm && (
        <div className="study-plan-form-card">
          <h2>Create Study Task</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              <div className="form-group">
                <label>Topic</label>

                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g. Amdahl's Law"
                  required
                />
              </div>

              <div className="form-group">
                <label>Material ID</label>

                <input
                  type="number"
                  name="material_id"
                  value={formData.material_id}
                  onChange={handleChange}
                  placeholder="e.g. 6"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Study Date</label>

                <input
                  type="date"
                  name="study_date"
                  value={formData.study_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Time</label>

                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes)</label>

                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  min="1"
                  max="1440"
                  required
                />
              </div>

              <div className="form-group">
                <label>Priority</label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

            </div>

            <div className="form-group">
              <label>Notes</label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add some notes about this study session..."
                rows="4"
              />
            </div>

            <button
              type="submit"
              className="save-study-button"
            >
              Save Study Task
            </button>
          </form>
        </div>
      )}

      <div className="study-planner-content">

        <div className="planner-section">
          <div className="section-title-row">
            <h2>My Study Tasks</h2>

            <span className="task-count">
              {plans.length} task{plans.length !== 1 ? "s" : ""}
            </span>
          </div>

          {plans.length === 0 ? (
            <div className="study-planner-empty">
              <div className="empty-icon">📚</div>

              <h2>No study tasks yet</h2>

              <p>
                Create your first study task and start organizing
                your learning schedule.
              </p>

              <button
                onClick={() => setShowForm(true)}
              >
                ＋ Create Study Task
              </button>
            </div>
          ) : (
            <div className="study-plans-grid">

              {plans.map((plan) => (
                <div
                  className={`study-plan-card ${
                    plan.completed ? "completed" : ""
                  }`}
                  key={plan.id}
                >

                  <div className="study-plan-card-top">

                    <div className="study-plan-icon">
                      {plan.completed ? "✅" : "📖"}
                    </div>

                    <span
                      className={`priority-badge ${plan.priority.toLowerCase()}`}
                    >
                      {plan.priority}
                    </span>

                  </div>

                  <h3>{plan.topic}</h3>

                  <div className="study-plan-details">

                    <p>
                      📅 {plan.study_date}
                    </p>

                    {plan.start_time && (
                      <p>
                        🕐 {plan.start_time.slice(0, 5)}
                      </p>
                    )}

                    <p>
                      ⏱️ {plan.duration_minutes} minutes
                    </p>

                  </div>

                  {plan.notes && (
                    <div className="study-plan-notes">
                      <strong>Notes</strong>
                      <p>{plan.notes}</p>
                    </div>
                  )}

                  <div className="study-plan-actions">

                    <button
                      className={
                        plan.completed
                          ? "uncomplete-button"
                          : "complete-button"
                      }
                      onClick={() => markCompleted(plan)}
                    >
                      {plan.completed
                        ? "↩ Mark Pending"
                        : "✓ Mark Completed"}
                    </button>

                    <button
                      className="delete-plan-button"
                      onClick={() => deletePlan(plan.id)}
                    >
                      🗑️
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default StudyPlanner;