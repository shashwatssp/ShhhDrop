import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where, doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { Send, MessageSquare } from "lucide-react";
import "./MessagePage.css";
import { encryptMessage } from '../utils/encryptionUtils';

const MessagePage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state added

  const { link } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!link) return;

      const q = query(collection(db, "users"), where("link", "==", link));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid Link. Please check again.");
        setIsLoading(false); // Stop loading if link is invalid
        return;
      }

      querySnapshot.forEach(async (doc) => {
        const userIdToken = doc.id;
        const userDoc = await getDoc(doc.ref);

        if (userDoc.exists()) {
          const fullName = userDoc.data().name || "User";
          const firstName = fullName.split(" ")[0]; // Extracts the first name
          setUserName(firstName);
        }

        const userMessagesSnapshot = await getDocs(collection(db, "users", userIdToken, "messages"));

        const fetchedMessages: string[] = [];
        userMessagesSnapshot.forEach((messageDoc) => {
          fetchedMessages.push(messageDoc.data().text);
        });

        setMessages(fetchedMessages);
        setError("");
        setIsLoading(false); // Stop loading after data is fetched
      });
    };

    fetchMessages();
  }, [link]);

  

  // Inside handleSendMessage
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
      
      const encryptedMessage = encryptMessage(message);

      for (const document of querySnapshot.docs) {
        const userIdToken = document.id;
        await addDoc(collection(db, "users", userIdToken, "messages"), {
          text: encryptedMessage,
        });
      }
  
      // Increment messagesCount in stats document
      const statsRef = doc(db, "stats", "BJGzWb3UL7hqN5aCMCGZ");
      await updateDoc(statsRef, { messagesCount: increment(1) });
  
      setMessage("");
      setMessages((prev) => [...prev, message]);
  
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
    navigate("/main");
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="shhdrop-message-page">
      <div className="shhdrop-message-container">
        <div className="shhdrop-message-header">
          <h1 className="shhdrop-message-title">ShhhDrop</h1>
          <p className="shhdrop-message-subtitle">
            Drop anonymous message to {userName || "User"}
          </p>
        </div>

        <div className="shhdrop-message-form">
          <div className="shhdrop-textarea-wrapper">
            <textarea
              className="shhdrop-message-input"
              placeholder="Write here..."
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
              <p>Message Dropped successfully!!</p>
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
