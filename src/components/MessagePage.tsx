import React, { useState } from "react";
import "./MessagePage.css";

const MessagePage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    // Simulate message sending
    console.log("Message sent:", message);

    // Show success message
    setShowSuccess(true);

    // Clear input after sending
    setMessage("");

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="apple-container">
      <h1 className="brand-name">ShhhDrop</h1>

      <textarea
        className="message-input"
        placeholder="Write your anonymous message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="buttons">
        <button className="send-btn" onClick={handleSendMessage}>
          Send Message
        </button>
        <button className="try-btn">Try It Yourself</button>
      </div>

      {showSuccess && <p className="success-message">✅ Message sent!</p>}
    </div>
  );
};

export default MessagePage;
