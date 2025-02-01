import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { useNavigate, useParams } from "react-router-dom";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import "./MessagePage.css";

const MessagePage: React.FC = () => {
  const [message, setMessage] = useState("");
  // @ts-ignore
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const { link } = useParams();
  const navigate = useNavigate();

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
        const userId = doc.id;
        const userMessagesSnapshot = await getDocs(collection(db, "users", userId, "messages"));

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
    if (!link || !message.trim()) return;

    const q = query(collection(db, "users"), where("link", "==", link));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setError("Invalid Link. Please check again.");
      return;
    }

    querySnapshot.forEach(async (doc) => {
      const userId = doc.id;
      await addDoc(collection(db, "users", userId, "messages"), { text: message });
      setMessage("");
      setMessages((prev) => [...prev, message]); // Update state immediately
    });
  };

  return (
    <div className="message-container">
      <h1>Drop Your Message</h1>

      {error && <p className="error-message">{error}</p>}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your anonymous message..."
        className="message-input"
      />
      
      <div className="buttons">
        <button onClick={handleSendMessage} className="send-btn">
          Send Message
        </button>
        <button onClick={() => navigate("/")} className="try-btn">
          Try it Yourself
        </button>
      </div>
    </div>
  );
};

export default MessagePage;
