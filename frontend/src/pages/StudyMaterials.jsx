import { useEffect, useState } from "react";
import axios from "axios";

function StudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [file, setFile] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [summarizingId, setSummarizingId] = useState(null);

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
      window.location.href = "/login";
      return;
    }

    loadMaterials();
  }, []);

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

  return (
    <div className="materials-page">

      {/* Header */}

      <div className="materials-header">
        <div>
          <p className="page-label">STUDY MATERIALS</p>

          <h1>My Study Materials 📚</h1>

          <p>
            Upload your lecture notes and PDFs to start
            learning with AI.
          </p>
        </div>

        <button
          className="back-button"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          ← Dashboard
        </button>
      </div>


      {/* Upload */}

      <section className="upload-card">

        <div className="upload-icon">
          📄
        </div>

        <div className="upload-content">

          <h2>Upload Study Material</h2>

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
              Selected: <strong>{file.name}</strong>
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


      {/* Materials */}

      <section className="materials-section">

        <div className="section-heading">

          <div>
            <h2>Your Materials</h2>

            <p>
              {materials.length} material
              {materials.length !== 1 ? "s" : ""}
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

                <div className="material-icon">
                  📄
                </div>


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


                <button
                  className="material-button"
                  onClick={() =>
                    handleSummarize(material)
                  }
                  disabled={
                    summarizingId === material.id
                  }
                >
                  {summarizingId === material.id
                    ? "Generating..."
                    : "✨ Summary"}
                </button>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* AI Summary */}

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


          <div className="summary-content">
            {summary}
          </div>

        </section>

      )}

    </div>
  );
}

export default StudyMaterials;