import React from "react";
import { Mail, AlertCircle } from 'lucide-react';
import "./EmailVerificationPendingPage.css";
import { useNavigate } from "react-router-dom";

const EmailVerificationPendingPage: React.FC = () => {

    const navigate = useNavigate();
    const handleReturnToLogin = () => {
        navigate("/homepage");
    };

    return (
        <div className="verification-container">
            <div className="verification-card">
                <div className="verification-icon">
                    <Mail size={64} />
                </div>

                <h1 className="verification-title">
                    Email Verification Required
                </h1>

                <div className="verification-status">
                    <AlertCircle className="status-icon" size={20} />
                    <span>Verification Pending</span>
                </div>

                <div className="verification-content">
                    <p className="verification-message">
                        We've sent a verification link to your email address
                    </p>

                    <div className="verification-instructions">
                        <p>Please check your inbox and click the verification link to activate your account.</p>
                        <p>If you don't see the email, please check your spam folder.</p>
                    </div>
                </div>

                <div className="verification-actions">
                    <button className="return-to-login-button" onClick={handleReturnToLogin}>
                        Return to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPendingPage;