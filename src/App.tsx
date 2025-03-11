import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import HomePage from "./components/HomePage";
import MainPage from "./components/MainPage";
import MessagePage from "./components/MessagePage";
import AuthPage from "./components/AuthPage";
import EmailVerificationPendingPage from "./components/EmailVerificationPendingPage";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userIdToken, setuserIdToken] = useState<string | null>(localStorage.getItem("userIdToken"));

  useEffect(() => {
    if (userIdToken) {
      setIsAuthenticated(true);
      setLoading(false);
      return; // Skip Firebase check if cached
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        setuserIdToken(user.uid);
        localStorage.setItem("userIdToken", user.uid); // Store in localStorage
      } else {
        setIsAuthenticated(false);
        setuserIdToken(null);
        localStorage.removeItem("userIdToken"); // Clear on logout
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [userIdToken]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/main" /> : <HomePage />} 
        />
        <Route path="/homepage" element={<HomePage />} />
        <Route 
          path="/email-signin" 
          element={<AuthPage />} 
        />
        <Route 
          path="/main" 
          element={isAuthenticated ? <MainPage /> : <HomePage/>} 
        />
      <Route path="/email-verification-pending" element={<HomePage />} />
      <Route path="/:link" element={<MessagePage/>} />
      </Routes>
    </Router>
  );
};

export default App;