import React, { useState, useEffect } from "react";
import { useParams} from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import "./MessagePage.css";

const MessagePage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { link } = useParams();


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
        const userMessagesSnapshot = await getDocs(collection(db, "users", userIdToken, "messages"));

        const fetchedMessages: string[] = [];
        userMessagesSnapshot.forEach((messageDoc) => {
          fetchedMessages.push(messageDoc.data().text);
        });
        messages

        setMessages(fetchedMessages);
        setError("");
      });
    };

    fetchMessages();
  }, [link]);

  const handleSendMessage = async () => {
    if (!link || message.trim() === "") return;

    const q = query(collection(db, "users"), where("link", "==", link));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setError("Invalid Link. Please check again.");
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
      {error && <p className="error-message">❌ {error}</p>}
    </div>
  );
};

export default MessagePage;
