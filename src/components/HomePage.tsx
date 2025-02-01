import React from "react";
import { auth, provider, signInWithPopup, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore functions
import "./HomePage.css"; // Import your custom CSS styles

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

      // Reference to the user's Firestore document using their UID
      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // If the user exists, retrieve the existing link
        const existingLink = userDoc.data()?.link;
        if (existingLink) {
          console.log("Existing link found:", existingLink);
          // Navigate to the main page using the existing link
          navigate(`/main?link=${existingLink}`);
        } else {
          // If the user does not have a link, generate a new one
          const newLink = generateShortUID();
          await setDoc(userRef, { link: newLink }, { merge: true });
          console.log("Generated new link:", newLink);
          // Navigate to the main page with the new link
          navigate(`/main?link=${newLink}`);
        }
      } else {
        // If the user does not exist in the database, create a new document and generate a link
        const newLink = generateShortUID();
        await setDoc(userRef, { link: newLink });
        console.log("New user, generated link:", newLink);
        // Navigate to the main page with the new link
        navigate(`/main?link=${newLink}`);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="title">ShhhDrop</h1>
        <p className="tagline">Drop Anonymous Messages Silently</p>
        <button className="google-signin-btn" onClick={handleGoogleSignIn}>
          Continue with Google
        </button>
        <p className="message-count">{messages} messages sent and counting...</p>
      </div>
    </div>
  );
};

export default HomePage;
