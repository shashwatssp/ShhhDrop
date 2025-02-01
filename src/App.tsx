import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig"; // Import firebase auth
import HomePage from "./components/HomePage";
import MainPage from "./components/MainPage";
import MessagePage from "./components/MessagePage"; // Corrected route

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        // Redirect to the main page if signed in
        if (window.location.pathname === "/") {
          navigate(`/main?link=${user.uid}`);
        }
      } else {
        setIsAuthenticated(false);
        // Redirect to home if not signed in
        if (window.location.pathname !== "/") {
          navigate("/");
        }
      }
    });

    return unsubscribe;
  }, [navigate]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/main" element={isAuthenticated ? <MainPage /> : <HomePage />} />
        <Route path="/:link" element={<MessagePage />} />
      </Routes>
    </Router>
  );
};

export default App;
