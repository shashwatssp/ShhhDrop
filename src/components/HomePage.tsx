import React, { useState } from "react";
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
  const messages = 17;
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const result = await signInWithPopup(auth, provider);
      console.log("User signed in:", result.user);

      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const existingLink = userDoc.data()?.link;
        if (existingLink) {
          navigate(`/main?link=${existingLink}`);
        } else {
          const newLink = generateShortUID();
          await setDoc(userRef, { link: newLink }, { merge: true });
          navigate(`/main?link=${newLink}`);
        }
      } else {
        const newLink = generateShortUID();
        await setDoc(userRef, { link: newLink });
        navigate(`/main?link=${newLink}`);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      setIsSigningIn(false);
    }
  };

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
        
        <p className="shhdrop-message-count">{messages} messages sent and counting...</p>
      </div>
    </div>
  );
};

export default HomePage;