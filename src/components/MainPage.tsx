import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { Copy, Share, LogOut, MessageSquare } from "lucide-react";

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
      localStorage.removeItem("userId"); // Ensure user data is cleared
      navigate("/", { replace: true }); // Redirect to home page
      window.location.reload(); // Force a fresh login session
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const copyLinkToClipboard = async () => {
    if (!userLink) return;
  
    const fullLink = `${window.location.origin}/${userLink}`;
    console.log(fullLink);
  
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
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6 py-10 text-white">
      {/* Floating Logout Button */}
      <button
        onClick={handleSignOut}
        className="absolute top-6 right-6 flex items-center text-gray-500 hover:text-white transition-opacity"
        aria-label="Sign out"
      >
        <LogOut className="h-5 w-5 mr-2" />
        <span className="font-semibold">Logout</span>
      </button>

      {/* Share Link Section */}
      <div className="w-full max-w-md mb-10">
        <div className="flex items-center mb-3">
          <Share className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold">Share Your Link</h2>
        </div>

        {userLink && (
          <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <div className="flex-1 px-4 py-3 text-gray-300 font-mono text-sm truncate">
              {`${window.location.origin}/${userLink}`}
            </div>
            <button
              className={`px-5 py-3 font-medium transition ${
                copying ? "bg-gray-600 text-gray-300" : "bg-gray-700 hover:bg-gray-500"
              }`}
              onClick={copyLinkToClipboard}
            >
              {copying ? "Copied!" : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Messages Section */}
      <div className="w-full max-w-md">
        <div className="flex items-center mb-3">
          <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold">Messages</h2>
          <span className="ml-2 text-sm text-gray-400">{messages.length}</span>
        </div>

        <div className="space-y-3">
          {visibleMessages.length > 0 ? (
            visibleMessages.map((msg, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg px-5 py-3 text-gray-100 text-base leading-relaxed shadow"
              >
                {msg}
              </div>
            ))
          ) : (
            <p className="text-center py-6 text-gray-500 text-base font-light">No messages yet</p>
          )}
        </div>

        {messages.length > visibleMessages.length && (
          <button
            className="mt-6 text-sm text-gray-400 hover:text-white transition"
            onClick={handleShowMore}
          >
            Show more messages
          </button>
        )}
      </div>
    </div>
  );
};

export default MainPage;
