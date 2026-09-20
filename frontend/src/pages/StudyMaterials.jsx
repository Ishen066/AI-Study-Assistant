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

      setMessage("Study material uploaded successfully! 🎉");
      setFile(null);

      document.getElementById("fileInput").value = "";

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

      setMessage("Study material deleted successfully. 🗑️");

      // If deleted material was showing summary
      if (summaryMaterial?.id === material.id) {
        setSummary("");
        setSummaryMaterial(null);
      }

      // Refresh materials
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
          HEADER
      ========================= */}

      <div className="materials-header">

        <div>

          <p className="page-label">
            STUDY MATERIALS
          </p>

          <h1>
            My Study Materials 📚
          </h1>

          <p>
            Upload your lecture notes and PDFs to start
            learning with AI.
          </p>

        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </div>


      {/* =========================
          UPLOAD
      ========================= */}

      <section className="upload-card">

        <div className="upload-icon">
          📄
        </div>

        <div className="upload-content">

          <h2>
            Upload Study Material
          </h2>

          <p>
            Select a PDF file containing your lecture notes
            or study material.
          </p>

          <form onSubmit={handleUpload}>

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

            <button
              type="submit"
              disabled={uploading}
            >
              {uploading
                ? "Uploading..."
                : "Upload PDF"}
            </button>

          </form>

          {file && (
            <p className="selected-file">
              Selected:{" "}
              <strong>
                {file.name}
              </strong>
            </p>
          )}

          {message && (
            <p className="success-message">
              {message}
            </p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

        </div>

      </section>


      {/* =========================
          MATERIALS
      ========================= */}

      <section className="materials-section">

        <div className="section-heading">

          <div>

            <h2>
              Your Materials
            </h2>

            <p>
              {materials.length} material
              {materials.length !== 1
                ? "s"
                : ""}
              {" "}uploaded
            </p>

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
              Upload your first PDF to begin your
              AI-powered study journey.
            </p>

          </div>

        ) : (

          <div className="materials-grid">

            {materials.map((material) => (

              <div
                className="material-card"
                key={material.id}
              >

                {/* Material Icon */}

                <div className="material-icon">
                  📄
                </div>


                {/* Material Information */}

                <div className="material-info">

                  <h3>
                    {material.title ||
                      material.filename ||
                      `Material #${material.id}`}
                  </h3>

                  <p>
                    Material ID: {material.id}
                  </p>

                </div>


                {/* Buttons */}

                <div className="material-actions">

                  {/* Summary */}

                  <button
                    className="material-button"
                    onClick={() =>
                      handleSummarize(material)
                    }
                    disabled={
                      summarizingId === material.id ||
                      deletingId === material.id
                    }
                  >
                    {summarizingId === material.id
                      ? "Generating..."
                      : "✨ Summary"}
                  </button>


                  {/* Quiz */}

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


                  {/* Delete */}

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

            ))}

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

            <div>

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


          {/* Summary Text */}

          <div className="summary-content">
            {summary}
          </div>


          {/* Summary Actions */}

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