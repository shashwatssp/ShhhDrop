import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { query, orderBy } from "firebase/firestore";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { Copy, Share2, LogOut, MessageSquare, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { decryptMessage } from '../utils/encryptionUtils'; 
import "./MainPage.css";

const MainPage: React.FC = () => {
  const [userLink, setUserLink] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [copying, setCopying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [length, setLength] = useState(0);

  
  // Pagination state
  const messagesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        const userDoc = doc(db, "users", user.uid);
        let userSnapshot = await getDoc(userDoc);

        // Retry logic for new users
        let retryCount = 0;
        const maxRetries = 3;

        while (!userSnapshot.exists() || !userSnapshot.data().link) {
          if (retryCount >= maxRetries) {
            console.error("Failed to retrieve link after multiple attempts.");
            navigate("/email-verification-pending"); // Redirect here
            setLoading(false); // Prevent infinite loading
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
          userSnapshot = await getDoc(userDoc);
          retryCount++;
        }

        const link = userSnapshot.data().link;
        if (link) {
          setUserLink(link);
        }

        const messagesQuery = query(
          collection(db, "users", user.uid, "messages"),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(messagesQuery);

        const fetchedMessages: string[] = querySnapshot.docs.map((doc) => {
          const encryptedText = doc.data().text;
          return decryptMessage(encryptedText);
        });

        setMessages(fetchedMessages);
        setTotalPages(Math.ceil(fetchedMessages.length / messagesPerPage));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
}, [navigate]);


  useEffect(() => {
  const currentPageMessages = getCurrentPageMessages();
  setLength(currentPageMessages.length);
}, [currentPage, messages]);
  
  

  // Get current page messages
  const getCurrentPageMessages = () => {
    const startIndex = (currentPage - 1) * messagesPerPage;
    const endIndex = startIndex + messagesPerPage;
    return messages.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Scroll to top of messages section
      const messagesSection = document.getElementById('messages-section');
      if (messagesSection) {
        messagesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Scroll to top of messages section
      const messagesSection = document.getElementById('messages-section');
      if (messagesSection) {
        messagesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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

  const currentMessages = getCurrentPageMessages();

  return (
    <div>
<div style={{ 
  height: `${totalPages > 1 
    ? (length === 0 ? 14 : (length >= 2 ? (length * 4) + 5 : 10)+3) 
    : (length === 0 ? 20 : (length >= 2 ? (length * 4)+5 : 10)) -5}rem` 
}}></div>
      <header >
        <h1 >ShhhDrop</h1>
        <button onClick={handleSignOut} className="signout-button" aria-label="Sign out">
          <LogOut className="icon" />
          <span>Logout</span>
        </button>
      </header>

      <section className="share-section">
        <div className="section-title">
          <Share2 className="icon" />
          <h2>Share Your Link </h2>
          <span className="section-subtitle">Share this link to receive anonymous messages</span>
        </div>

        {userLink && (
          <div className="link-container">
            <p className="link-text">{`${window.location.origin}/${userLink}`}</p>
            <button 
              className={`copy-button ${copying ? 'copied' : ''}`} 
              onClick={copyLinkToClipboard}
              aria-label="Copy link"
            >
              {copying ? (
                <>
                  <CheckCircle2 className="icon" />
                  <span className="copy-text">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="icon" />
                  <span className="copy-text">Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </section>

      <section id="messages-section" className="messages-section">
        <div className="section-title">
          <MessageSquare className="icon" />
          <h2>DropBox<span className="message-count">{messages.length+" Messages"}</span></h2>
          
        </div>

        {messages.length > 0 ? (
          <>
            <div className="messages-list">
              {currentMessages.map((msg, index) => {
                const messageIndex = (currentPage - 1) * messagesPerPage + index + 1;
                return (
                  <div key={index} className="message-bubble">
                    <div className="message-avatar">{messageIndex}</div>
                    <div className="message-content">{msg}</div>
                  </div>
                );
              })}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`} 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="icon" />
                  <span>Previous</span>
                </button>
                <div className="pagination-info">
                  <span>{currentPage}</span> of <span>{totalPages}</span>
                </div>
                <button 
                  className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`} 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="icon" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-messages">
            <div className="empty-icon-container">
              <MessageSquare className="empty-icon" />
            </div>
            <h3 className="empty-title">No messages yet</h3>
            <p className="empty-subtitle">Share your link to start receiving anonymous messages</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MainPage;
