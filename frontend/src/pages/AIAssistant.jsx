import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AIAssistant() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    const userMessage = {
      role: "user",
      content: trimmedMessage,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/assistant/chat",
        {
          message: trimmedMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const assistantMessage = {
        role: "assistant",
        content: response.data.reply,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to get a response from the AI assistant."
      );
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown-style renderer
  const renderAIResponse = (content) => {
    const lines = content.split("\n");

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Empty line
      if (!trimmedLine) {
        return <div key={index} className="ai-response-space"></div>;
      }

      // Heading ###
      if (trimmedLine.startsWith("### ")) {
        return (
          <h4 key={index} className="ai-response-heading">
            {trimmedLine.replace("### ", "")}
          </h4>
        );
      }

      // Heading ##
      if (trimmedLine.startsWith("## ")) {
        return (
          <h3 key={index} className="ai-response-heading">
            {trimmedLine.replace("## ", "")}
          </h3>
        );
      }

      // Heading #
      if (trimmedLine.startsWith("# ")) {
        return (
          <h3 key={index} className="ai-response-heading">
            {trimmedLine.replace("# ", "")}
          </h3>
        );
      }

      // Bullet point
      if (
        trimmedLine.startsWith("- ") ||
        trimmedLine.startsWith("* ")
      ) {
        const bulletText = trimmedLine.substring(2);

        return (
          <div key={index} className="ai-response-bullet">
            <span>•</span>
            <span>{formatBoldText(bulletText)}</span>
          </div>
        );
      }

      // Numbered list
      if (/^\d+\.\s/.test(trimmedLine)) {
        const match = trimmedLine.match(/^(\d+)\.\s(.*)$/);

        return (
          <div key={index} className="ai-response-numbered">
            <span className="ai-response-number">
              {match[1]}
            </span>

            <span>
              {formatBoldText(match[2])}
            </span>
          </div>
        );
      }

      // Normal paragraph
      return (
        <p key={index} className="ai-response-paragraph">
          {formatBoldText(trimmedLine)}
        </p>
      );
    });
  };

  // Convert **text** into bold text
  const formatBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const handleSuggestion = (text) => {
    setMessage(text);
  };

  return (
    <div className="ai-assistant-page">

      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="ai-assistant-header">

        <div>
          <span className="ai-page-label">
            AI STUDY ASSISTANT
          </span>

          <h1>AI Assistant</h1>

          <p>
            Ask questions and get help with your studies.
          </p>
        </div>

        <button
          className="ai-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </div>


      {/* =========================
          CHAT CARD
      ========================== */}

      <div className="ai-chat-card">

        {/* Chat Header */}

        <div className="ai-chat-header">

          <div className="ai-header-avatar">
            🤖
          </div>

          <div className="ai-header-info">
            <h2>Study Assistant</h2>

            <div className="ai-online-status">
              <span></span>
              AI Assistant is ready
            </div>
          </div>

        </div>


        {/* Chat Messages */}

        <div className="ai-chat-messages">

          {/* Empty State */}

          {messages.length === 0 && !loading && (

            <div className="ai-empty-state">

              <div className="ai-empty-icon">
                🤖
              </div>

              <h3>
                How can I help you?
              </h3>

              <p>
                Ask me to explain a topic, simplify a
                concept, give examples, or help you
                understand something you are studying.
              </p>


              {/* Suggestions */}

              <div className="ai-suggestions">

                <button
                  type="button"
                  onClick={() =>
                    handleSuggestion(
                      "Explain Amdahl's Law in simple words."
                    )
                  }
                >
                  <span>💡</span>
                  Explain a concept
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSuggestion(
                      "Give me a simple example to understand a difficult topic."
                    )
                  }
                >
                  <span>📚</span>
                  Give me an example
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSuggestion(
                      "Help me understand this topic step by step."
                    )
                  }
                >
                  <span>🧠</span>
                  Explain step by step
                </button>

              </div>

            </div>

          )}


          {/* Messages */}

          {messages.map((chatMessage, index) => (

            <div
              key={index}
              className={`ai-message ${
                chatMessage.role === "user"
                  ? "ai-user-message"
                  : "ai-assistant-message"
              }`}
            >

              <div className="ai-message-avatar">
                {chatMessage.role === "user"
                  ? "👤"
                  : "🤖"}
              </div>

              <div className="ai-message-content">

                <span className="ai-message-name">
                  {chatMessage.role === "user"
                    ? "You"
                    : "AI Assistant"}
                </span>

                {chatMessage.role === "assistant" ? (
                  <div className="ai-response">
                    {renderAIResponse(
                      chatMessage.content
                    )}
                  </div>
                ) : (
                  <p className="ai-user-text">
                    {chatMessage.content}
                  </p>
                )}

              </div>

            </div>

          ))}


          {/* Loading */}

          {loading && (

            <div className="ai-message ai-assistant-message">

              <div className="ai-message-avatar">
                🤖
              </div>

              <div className="ai-message-content">

                <span className="ai-message-name">
                  AI Assistant
                </span>

                <div className="ai-typing">

                  <span></span>
                  <span></span>
                  <span></span>

                  <small>
                    AI is thinking...
                  </small>

                </div>

              </div>

            </div>

          )}

        </div>


        {/* Error */}

        {error && (
          <div className="ai-error">
            <span>⚠️</span>
            {error}
          </div>
        )}


        {/* Input Area */}

        <form
          className="ai-chat-input-area"
          onSubmit={sendMessage}
        >

          <input
            type="text"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Ask your study question..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading ||
              !message.trim()
            }
          >
            {loading ? "..." : "Send →"}
          </button>

        </form>

        <div className="ai-input-hint">
          AI Study Assistant • Ask questions about your studies
        </div>

      </div>

    </div>
  );
}

export default AIAssistant;