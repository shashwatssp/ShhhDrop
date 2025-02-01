import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "./MainPage.css";

const MainPage: React.FC = () => {
  const [userLink, setUserLink] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          setUserLink(userSnapshot.data().link);
          const querySnapshot = await getDocs(collection(db, "users", user.uid, "messages"));
          const fetchedMessages: string[] = [];
          querySnapshot.forEach((doc) => {
            fetchedMessages.push(doc.data().text);
          });
          setMessages(fetchedMessages);
          setVisibleMessages(fetchedMessages.slice(0, 3)); // Show the first 3 messages initially

          if (fetchedMessages.length === 0) {
            navigate("/"); // Redirect to home if no messages are available
          }
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleShowMore = () => {
    setVisibleMessages(messages);
    setShowMore(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="main-container">
      <h4>Welcome, {auth.currentUser?.displayName}</h4>

      <div className="messages-section">
        <div className="messages-list">
          {visibleMessages.length > 0 ? (
            visibleMessages.map((msg, index) => (
              <div key={index} className="message-bubble">
                {msg}
              </div>
            ))
          ) : (
            <p className="no-messages">No messages yet.</p>
          )}
        </div>
        {messages.length > visibleMessages.length && (
          <button className="show-more-btn" onClick={handleShowMore}>
            Show More
          </button>
        )}
      </div>

      <div className="user-link-section">
        <h2>Your Link:</h2>
        {userLink && (
          <div className="link-box">
            <div className="link-visible">{`${window.location.origin}/${userLink}`}</div>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/${userLink}`);
                alert("Link copied!");
              }}
            >
              Click Here to Copy Link
            </button>
          </div>
        )}
      </div>

      <button onClick={handleSignOut} className="signout-btn">
        Sign Out
      </button>
    </div>
  );
};

export default MainPage;
