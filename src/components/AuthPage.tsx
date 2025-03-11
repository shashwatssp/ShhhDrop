import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Mail, Loader, Lock, User, ArrowRight, CheckCircle } from "lucide-react";
import "./AuthPage.css";

// Function to generate a random 4-character UID
const generateShortUID = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

enum AuthMode {
  SIGN_IN = 'sign_in',
  SIGN_UP = 'sign_up',
  FORGOT_PASSWORD = 'forgot_password',
  EMAIL_VERIFICATION_SENT = 'email_verification_sent',
  EMAIL_VERIFICATION_REQUIRED = 'email_verification_required'
}

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.SIGN_IN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      switch (authMode) {
        case AuthMode.SIGN_UP:
          if (password !== confirmPassword) {
            throw new Error("Passwords don't match");
          }
          
          if (password.length < 6) {
            throw new Error("Password must be at least 6 characters");
          }
          
          // Create user with email and password
          const signUpCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = signUpCredential.user;
          
          if (!newUser) return;
          
          // Update profile with display name if provided
          if (displayName) {
            await updateProfile(newUser, {
              displayName: displayName
            });
          }
          
          // Send email verification
          await sendEmailVerification(newUser);
          
          // Store user temporarily for verification resend functionality
          setCurrentUser(newUser);
          
          // Important: We do NOT create the Firestore document here
          // We'll only create it after email verification
          
          // Switch to verification sent mode
          setAuthMode(AuthMode.EMAIL_VERIFICATION_SENT);
          break;
          
        case AuthMode.SIGN_IN:
          const signInCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = signInCredential.user;
          
          if (!user) return;
          
          // Check if email is verified - strict enforcement
          if (!user.emailVerified) {
            // Store user for potential resend
            setCurrentUser(user);
            // Switch to verification required mode
            setAuthMode(AuthMode.EMAIL_VERIFICATION_REQUIRED);
            setLoading(false);
            return;
          }
          
          // Only proceed with database operations after confirming email is verified
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            // User exists in Firestore, update verification status if needed
            const existingLink = userDoc.data()?.link;
            if (existingLink) {
              await setDoc(userRef, { emailVerified: true }, { merge: true });
              navigate(`/main?link=${existingLink}`);
            } else {
              const newLink = generateShortUID();
              await setDoc(userRef, { 
                link: newLink,
                emailVerified: true 
              }, { merge: true });
              navigate(`/main?link=${newLink}`);
            }
          } else {
            // First time login after verification, create user document
            const newLink = generateShortUID();
            await setDoc(userRef, { 
              link: newLink, 
              name: user.displayName || user.email || "User",
              createdAt: new Date(),
              emailVerified: true
            });
            navigate(`/main?link=${newLink}`);
          }
          break;
          
        case AuthMode.FORGOT_PASSWORD:
          await sendPasswordResetEmail(auth, email);
          setSuccessMessage("Password reset email sent! Check your inbox for instructions.");
          break;
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      // Handle specific Firebase errors with more user-friendly messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError("Invalid email or password");
      } else if (error.code === 'auth/email-already-in-use') {
        setError("This email is already registered");
      } else if (error.code === 'auth/invalid-email') {
        setError("Invalid email format");
      } else if (error.code === 'auth/weak-password') {
        setError("Password is too weak");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later or reset your password.");
      } else {
        setError(error.message || "Authentication failed. Please try again.");
      }
    } finally {
      if (authMode !== AuthMode.EMAIL_VERIFICATION_SENT && authMode !== AuthMode.EMAIL_VERIFICATION_REQUIRED) {
        setLoading(false);
      }
    }
  };

  const resendVerificationEmail = async () => {
    setLoading(true);
    setError("");
    try {
      if (currentUser) {
        // Use the current user object if available
        await sendEmailVerification(currentUser);
      } else {
        // Try to sign in to get user object if not available
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setCurrentUser(userCredential.user);
      }
      setSuccessMessage("Verification email resent successfully!");
    } catch (error: any) {
      console.error("Error resending verification:", error);
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case AuthMode.SIGN_IN:
        return "Welcome Back";
      case AuthMode.SIGN_UP:
        return "Create Account";
      case AuthMode.FORGOT_PASSWORD:
        return "Reset Password";
      case AuthMode.EMAIL_VERIFICATION_SENT:
        return "Verify Your Email";
      case AuthMode.EMAIL_VERIFICATION_REQUIRED:
        return "Email Verification Required";
    }
  };

  const getSubmitButtonText = () => {
    switch (authMode) {
      case AuthMode.SIGN_IN:
        return "Sign In";
      case AuthMode.SIGN_UP:
        return "Sign Up";
      case AuthMode.FORGOT_PASSWORD:
        return "Send Reset Link";
      case AuthMode.EMAIL_VERIFICATION_SENT:
      case AuthMode.EMAIL_VERIFICATION_REQUIRED:
        return "Go to Sign In";
    }
  };

  const renderVerificationMessage = (isInitialVerification: boolean) => {
    return (
      <div className="shhdrop-verification-sent">
        <div className="shhdrop-verification-icon">
          <CheckCircle size={48} color="#10b981" />
        </div>
        <h2 className="shhdrop-verification-title">
          {isInitialVerification ? "Check Your Email" : "Email Verification Required"}
        </h2>
        <p className="shhdrop-verification-message">
          {isInitialVerification 
            ? `We've sent a verification link to `
            : `You need to verify your email address `}
          <strong>{email}</strong>
        </p>
        <p className="shhdrop-verification-instructions">
          {isInitialVerification
            ? "Please check your inbox and click the verification link to complete your registration."
            : "Please check your inbox and click the verification link before signing in. You cannot access your account until your email is verified."}
        </p>
        
        {error && <p className="shhdrop-error">{error}</p>}
        {successMessage && <p className="shhdrop-success-message">{successMessage}</p>}
        
        <div className="shhdrop-verification-actions">
          <button 
            className="shhdrop-submit-btn"
            onClick={resendVerificationEmail}
            disabled={loading}
          >
            {loading ? <Loader className="shhdrop-spinner" size={16} /> : "Resend Verification Email"}
          </button>
          
        </div>
      </div>
    );
  };

  return (
    <div className="shhdrop-auth-container">
      <div className="shhdrop-auth-card">
        <div className="shhdrop-auth-header">
          <h1 className="shhdrop-brand-name">ShhhDrop</h1>
          <p className="shhdrop-auth-title">{getTitle()}</p>
        </div>
        
        {authMode === AuthMode.EMAIL_VERIFICATION_SENT ? (
          renderVerificationMessage(true)
        ) : authMode === AuthMode.EMAIL_VERIFICATION_REQUIRED ? (
          renderVerificationMessage(false)
        ) : (
          <>
            {successMessage && (
              <div className="shhdrop-success-message">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="shhdrop-auth-form">
              {authMode === AuthMode.SIGN_UP && (
                <div className="shhdrop-input-wrapper">
                  <div className="shhdrop-input-icon">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="shhdrop-input"
                  />
                </div>
              )}
              
              <div className="shhdrop-input-wrapper">
                <div className="shhdrop-input-icon">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="shhdrop-input"
                />
              </div>
              
              {authMode !== AuthMode.FORGOT_PASSWORD && (
                <div className="shhdrop-input-wrapper">
                  <div className="shhdrop-input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="shhdrop-input"
                  />
                </div>
              )}
              
              {authMode === AuthMode.SIGN_UP && (
                <div className="shhdrop-input-wrapper">
                  <div className="shhdrop-input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="shhdrop-input"
                  />
                </div>
              )}
              
              {error && <p className="shhdrop-error">{error}</p>}
              
              <button
                type="submit"
                className="shhdrop-submit-btn"
                disabled={loading || !email || (authMode !== AuthMode.FORGOT_PASSWORD && !password)}
              >
                {loading ? (
                  <Loader className="shhdrop-spinner" />
                ) : (
                  <>
                    <span>{getSubmitButtonText()}</span>
                    <ArrowRight size={18} className="shhdrop-btn-icon" />
                  </>
                )}
              </button>
            </form>
            
            <div className="shhdrop-auth-options">
              {authMode === AuthMode.SIGN_IN && (
                <>
                  <button 
                    className="shhdrop-text-btn:forgot"
                    onClick={() => setAuthMode(AuthMode.FORGOT_PASSWORD)}
                  >
                    Forgot password?
                  </button>
                  <button 
                    className="shhdrop-text-btn shhdrop-text-btn-highlighted"
                    onClick={() => setAuthMode(AuthMode.SIGN_UP)}
                  >
                    Create an account
                  </button>
                </>
              )}
              
              {authMode === AuthMode.SIGN_UP && (
                <button 
                  className="shhdrop-text-btn"
                  onClick={() => setAuthMode(AuthMode.SIGN_IN)}
                >
                  Already have an account?
                </button>
              )}
              
              {authMode === AuthMode.FORGOT_PASSWORD && (
                <button 
                  className="shhdrop-text-btn"
                  onClick={() => setAuthMode(AuthMode.SIGN_IN)}
                >
                  Back to sign in
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;