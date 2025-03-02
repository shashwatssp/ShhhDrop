import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { Copy, Share2, LogOut, MessageSquare } from "lucide-react";
import "./MainPage.css";

const MainPage: React.FC = () => {
  const [userLink, setUserLink] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const [copying, setCopying] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const link = userSnapshot.data().link;
          setUserLink(link);

          const querySnapshot = await getDocs(collection(db, "users", user.uid, "messages"));
          const fetchedMessages: string[] = querySnapshot.docs.map((doc) => doc.data().text);

          setMessages(fetchedMessages);
          setVisibleMessages(fetchedMessages.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleShowMore = () => setVisibleMessages(messages);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userIdToken");
      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const copyLinkToClipboard = async () => {
    if (!userLink) return;
  
    const fullLink = `${window.location.origin}/${userLink}`;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullLink);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = fullLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      alert(`Copy failed! Please copy manually: ${fullLink}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="apple-container">
      <header className="apple-header">
        <h1 className="brand-name">ShhhDrop</h1>
        <button onClick={handleSignOut} className="logout-button" aria-label="Sign out">
          <LogOut className="icon" />
          <span>Logout</span>
        </button>
      </header>

      <section className="share-section">
        <div className="section-title">
          <Share2 className="icon" />
          <h2>Share Your Link</h2>
        </div>

        {userLink && (
          <div className="link-container">
            <p className="link-text">{`${window.location.origin}/${userLink}`}</p>
            <button 
              className={`copy-button ${copying ? 'copied' : ''}`} 
              onClick={copyLinkToClipboard}
            >
              {copying ? "Copied" : <Copy className="icon" />}
            </button>
          </div>
        )}
      </section>

      <section className="messages-section">
        <div className="section-title">
          <MessageSquare className="icon" />
          <h2>Messages</h2>
          <span className="message-count">{messages.length}</span>
        </div>

        <div className="messages-list">
          {visibleMessages.length > 0 ? (
            visibleMessages.map((msg, index) => (
              <div key={index} className="message-bubble">
                {msg}
              </div>
            ))
          ) : (
            <p className="no-messages">No messages yet</p>
          )}
        </div>

        {messages.length > visibleMessages.length && (
          <button className="show-more-button" onClick={handleShowMore}>
            Show More
          </button>
        )}
      </section>
    </div>
  );
};

export default MainPage;