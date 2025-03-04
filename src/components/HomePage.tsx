import React from "react";
import { auth, provider, signInWithPopup, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { LogIn } from "lucide-react";
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

  const handleGoogleSignIn = async () => {
    try {
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
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="brand-name">ShhhDrop</h1>
        <p className="tagline">Drop Anonymous Messages Silently</p>
        <button className="google-signin-btn" onClick={handleGoogleSignIn}>
          <LogIn className="icon" />
          <span>Continue with Google</span>
        </button>
        <p className="message-count">{messages} messages sent and counting...</p>
      </div>
    </div>
  );
};

export default HomePage;
