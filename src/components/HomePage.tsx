import React, { useState, useEffect } from "react";
import { auth, provider, signInWithPopup, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { LogIn, Zap } from "lucide-react";
import "./HomePage.css";

// Function to generate a random 4-character UID
const generateShortUID = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const HomePage: React.FC = () => {
  const [messagesCount, setMessagesCount] = useState<number | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  // Fetch the messages count from Firestore
  useEffect(() => {
    const fetchMessagesCount = async () => {
      const statsRef = doc(db, "stats", "BJGzWb3UL7hqN5aCMCGZ"); // Correct path
      try {
        const statsDoc = await getDoc(statsRef);
        if (statsDoc.exists()) {
          setMessagesCount(statsDoc.data()?.messagesCount || 0);
        } else {
          setMessagesCount(0);
        }
      } catch (error) {
        console.error("Error fetching message count:", error);
        setMessagesCount(0);
      }
    };

    fetchMessagesCount();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const existingLink = userDoc.data()?.link;
        if (existingLink) {
          navigate(`/main?link=${existingLink}`);
        } else {
          const newLink = generateShortUID();
          await setDoc(userRef, { link: newLink, name: user.displayName || "User" }, { merge: true });
          navigate(`/main?link=${newLink}`);
        }
      } else {
        const newLink = generateShortUID();
        await setDoc(userRef, { link: newLink, name: user.displayName || "User" });
        navigate(`/main?link=${newLink}`);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      setIsSigningIn(false);
    }
  };

  if (messagesCount === null) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="shhdrop-home-container">
      <div className="shhdrop-home-content">
        <h1 className="shhdrop-brand-name">ShhhDrop</h1>
        <p className="shhdrop-tagline">Drop Anonymous Messages Silently</p>
        
        <button 
          className="shhdrop-google-signin-btn" 
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
        >
          <LogIn className="shhdrop-icon" />
          <span>{isSigningIn ? "Signing in..." : "Continue with Google"}</span>
        </button>
        
        <div className="shhdrop-quick-signin">
          <Zap className="shhdrop-flash-icon" />
          <span>Takes &lt;5 seconds</span>
        </div>
        
        <p className="shhdrop-message-count">
          {messagesCount} messages Dropped so far...
        </p>
      </div>
    </div>
  );
};

export default HomePage;
