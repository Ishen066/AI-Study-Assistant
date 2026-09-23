import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function StudyMaterials() {
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [file, setFile] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [summarizingId, setSummarizingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [summary, setSummary] = useState("");
  const [summaryMaterial, setSummaryMaterial] = useState(null);

  const token = localStorage.getItem("access_token");

  const loadMaterials = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/materials",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMaterials(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load study materials.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadMaterials();
  }, []);

  // =========================
  // UPLOAD MATERIAL
  // =========================

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setMessage("");
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/materials/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Study material uploaded successfully!");
      setFile(null);

      const fileInput = document.getElementById("fileInput");

      if (fileInput) {
        fileInput.value = "";
      }

      loadMaterials();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to upload study material."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // GENERATE SUMMARY
  // =========================

  const handleSummarize = async (material) => {
    setMessage("");
    setError("");
    setSummary("");
    setSummaryMaterial(null);
    setSummarizingId(material.id);

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/materials/${material.id}/summarize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSummary(response.data.summary);
      setSummaryMaterial(material);

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to generate AI summary."
      );
    } finally {
      setSummarizingId(null);
    }
  };

  // =========================
  // TAKE QUIZ
  // =========================

  const handleQuiz = (material) => {
    navigate(`/quiz/${material.id}`);
  };

  // =========================
  // DELETE MATERIAL
  // =========================

  const handleDelete = async (material) => {
    const materialName =
      material.title ||
      material.filename ||
      `Material #${material.id}`;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${materialName}"?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");
    setDeletingId(material.id);

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/materials/${material.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Study material deleted successfully.");

      if (summaryMaterial?.id === material.id) {
        setSummary("");
        setSummaryMaterial(null);
      }

      await loadMaterials();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete study material."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // CLEAR SUMMARY
  // =========================

  const clearSummary = () => {
    setSummary("");
    setSummaryMaterial(null);
  };

  return (
    <div className="materials-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="materials-header">

        <div className="materials-title-area">

          <div className="materials-title-icon">
            📚
          </div>

          <div>
            <p className="page-label">
              STUDY MATERIALS
            </p>

            <h1>
              My Study Materials
            </h1>

            <p>
              Upload your lecture notes and PDFs and
              let AI help you study smarter.
            </p>
          </div>

        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </div>


      {/* =========================
          NOTIFICATIONS
      ========================= */}

      {message && (
        <div className="materials-alert success-alert">
          <span className="alert-icon">✓</span>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="materials-alert error-alert">
          <span className="alert-icon">!</span>
          <span>{error}</span>
        </div>
      )}


      {/* =========================
          UPLOAD CARD
      ========================= */}

      <section className="upload-card">

        <div className="upload-icon">
          📄
        </div>

        <div className="upload-content">

          <div className="upload-heading">

            <div>
              <span className="upload-badge">
                PDF
              </span>

              <h2>
                Upload Study Material
              </h2>

              <p>
                Add your lecture notes, slides, or other
                PDF study materials.
              </p>
            </div>

          </div>

          <form
            onSubmit={handleUpload}
            className="upload-form"
          >

            <div className="file-input-wrapper">

              <input
                id="fileInput"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setMessage("");
                  setError("");
                }}
              />

              <label htmlFor="fileInput">
                <span className="file-upload-icon">
                  ↑
                </span>

                <span>
                  {file
                    ? "Change PDF"
                    : "Choose PDF file"}
                </span>
              </label>

            </div>

            <button
              type="submit"
              className="upload-submit-button"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <span className="button-spinner"></span>
                  Uploading...
                </>
              ) : (
                <>
                  ↑ Upload PDF
                </>
              )}
            </button>

          </form>

          {file && (
            <div className="selected-file">

              <span className="selected-file-icon">
                📄
              </span>

              <div>
                <span className="selected-file-label">
                  Selected file
                </span>

                <strong>
                  {file.name}
                </strong>
              </div>

            </div>
          )}

          <p className="upload-hint">
            Supported format: PDF only
          </p>

        </div>

      </section>


      {/* =========================
          MATERIALS SECTION
      ========================= */}

      <section className="materials-section">

        <div className="section-heading">

          <div>
            <p className="section-label">
              YOUR LIBRARY
            </p>

            <h2>
              Your Materials
            </h2>

            <p>
              {materials.length} material
              {materials.length !== 1 ? "s" : ""} available
            </p>
          </div>

          <div className="material-count">
            <span>
              {materials.length}
            </span>
            <small>
              Files
            </small>
          </div>

        </div>


        {materials.length === 0 ? (

          <div className="materials-empty">

            <div className="empty-icon">
              📚
            </div>

            <h3>
              No study materials yet
            </h3>

            <p>
              Upload your first PDF above to begin your
              AI-powered study journey.
            </p>

          </div>

        ) : (

          <div className="materials-grid">

            {materials.map((material) => {

              const materialName =
                material.title ||
                material.filename ||
                `Material #${material.id}`;

              return (
                <div
                  className="material-card"
                  key={material.id}
                >

                  {/* CARD TOP */}

                  <div className="material-card-top">

                    <div className="material-icon">
                      📄
                    </div>

                    <span className="pdf-badge">
                      PDF
                    </span>

                  </div>


                  {/* MATERIAL INFO */}

                  <div className="material-info">

                    <h3 title={materialName}>
                      {materialName}
                    </h3>

                    <p>
                      Material #{material.id}
                    </p>

                  </div>


                  {/* ACTIONS */}

                  <div className="material-actions">

                    <button
                      className="material-button summary-material-button"
                      onClick={() =>
                        handleSummarize(material)
                      }
                      disabled={
                        summarizingId === material.id ||
                        deletingId === material.id
                      }
                    >
                      {summarizingId === material.id ? (
                        <>
                          <span className="button-spinner"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          ✨ AI Summary
                        </>
                      )}
                    </button>


                    <button
                      className="material-button quiz-material-button"
                      onClick={() =>
                        handleQuiz(material)
                      }
                      disabled={
                        deletingId === material.id
                      }
                    >
                      📝 Take Quiz
                    </button>


                    <button
                      className="material-button delete-material-button"
                      onClick={() =>
                        handleDelete(material)
                      }
                      disabled={
                        deletingId === material.id ||
                        summarizingId === material.id
                      }
                    >
                      {deletingId === material.id
                        ? "Deleting..."
                        : "🗑️ Delete"}
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </section>


      {/* =========================
          AI SUMMARY
      ========================= */}

      {summary && (

        <section className="summary-card">

          <div className="summary-header">

            <div className="summary-icon">
              ✨
            </div>

            <div className="summary-heading-content">

              <p className="page-label">
                AI GENERATED
              </p>

              <h2>
                Study Summary
              </h2>

              {summaryMaterial && (
                <p>
                  Based on:{" "}
                  <strong>
                    {summaryMaterial.title ||
                      summaryMaterial.filename ||
                      `Material #${summaryMaterial.id}`}
                  </strong>
                </p>
              )}

            </div>

          </div>


          <div className="summary-divider"></div>


          <div className="summary-content">
            {summary}
          </div>


          <div className="summary-actions">

            <button
              className="back-button"
              onClick={clearSummary}
            >
              ✕ Close Summary
            </button>

            {summaryMaterial && (
              <button
                className="generate-quiz-button"
                onClick={() =>
                  handleQuiz(summaryMaterial)
                }
              >
                📝 Take Quiz
              </button>
            )}

          </div>

        </section>

      )}

    </div>
  );
}

export default StudyMaterials;