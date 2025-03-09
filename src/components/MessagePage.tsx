import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { Send, MessageSquare } from "lucide-react";
import "./MessagePage.css";

const MessagePage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { link } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchMessages = async () => {
      if (!link) return;
      const q = query(collection(db, "users"), where("link", "==", link));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid Link. Please check again.");
        return;
      }

      querySnapshot.forEach(async (doc) => {
        const userIdToken = doc.id;
        const userMessagesSnapshot = await getDocs(
          collection(db, "users", userIdToken, "messages")
        );

        const fetchedMessages: string[] = [];
        userMessagesSnapshot.forEach((messageDoc) => {
          fetchedMessages.push(messageDoc.data().text);
        });

        setMessages(fetchedMessages);
        setError("");
      });
    };

    fetchMessages();
  }, [link]);

  const handleSendMessage = async () => {
    if (!link || message.trim() === "") return;

    setIsSending(true);

    try {
      const q = query(collection(db, "users"), where("link", "==", link));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid Link. Please check again.");
        setIsSending(false);
        return;
      }

      querySnapshot.forEach(async (doc) => {
        const userIdToken = doc.id;
        await addDoc(collection(db, "users", userIdToken, "messages"), { text: message });
        setMessage("");
        setMessages((prev) => [...prev, message]);
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleTryItOut = () => {
    navigate("/main"); // Navigate to MainPage
  };

  return (
    <div className="shhdrop-message-page">
      <div className="shhdrop-message-container">
        <div className="shhdrop-message-header">
          <h1 className="shhdrop-message-title">ShhhDrop</h1>
          <p className="shhdrop-message-subtitle">Send an anonymous message</p>
        </div>

        <div className="shhdrop-message-form">
          <div className="shhdrop-textarea-wrapper">
            <textarea
              className="shhdrop-message-input"
              placeholder="Write your anonymous message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
            <div className="shhdrop-character-count">
              {message.length > 0 ? `${message.length} characters` : ""}
            </div>
          </div>

          <div className="shhdrop-button-group">
            <button
              className="shhdrop-send-btn"
              onClick={handleSendMessage}
              disabled={isSending || message.trim() === ""}
            >
              <Send size={18} />
              {isSending ? "Sending..." : "Drop Anonymous Message!!!"}
            </button>

            <button className="shhdrop-try-btn" onClick={handleTryItOut}>
              <MessageSquare size={18} />
              Want to try it out???
            </button>
          </div>

          {showSuccess && (
            <div className="shhdrop-success-message">
              <div className="shhdrop-success-icon">✓</div>
              <p>Message sent successfully!</p>
            </div>
          )}

          {error && (
            <div className="shhdrop-error-message">
              <div className="shhdrop-error-icon">✗</div>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
