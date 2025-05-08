import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../api/apiRequest";
import ProfileModal from "./ProfileModal";
import ELEOS_clean from "../assets/images/ELEOS_clean.png";

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: "",
        message: "",
    });

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleCloseModal = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        if (modalState.title === "Success") {
            navigate("/login");
        }
    };

    const signupUser = async () => {
        if (!email || !name || !password || !confirmPassword) {
            setErrorMessage("Please enter all fields.");
            return;
        }

        if (!validateEmail(email)) {
            setErrorMessage("Invalid Email Format.");
            return;
        }

        if (password.length < 8) {
            setErrorMessage("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage(
                "Passwords do not match. Please ensure both passwords are the same."
            );
            return;
        }

        try {
            const response = await apiRequest("users", "POST", "register", {
                username: name,
                email: email,
                password: password,
                isAdmin: false,
                isSuperAdmin: false,
            });
            if (response.success) {
                // console.log("User registered successfully:", response.data);
                const emailVerificationToken =
                    response.data?.data?.verificationToken;
                console.log(
                    "Email Verification Token:",
                    emailVerificationToken
                );

                if (emailVerificationToken) {
                    const verificationUrl = `${process.env.REACT_APP_API_URL}/verify/email/${emailVerificationToken}`;

                    const emailResponse = await apiRequest(
                        "email",
                        "POST",
                        "send",
                        {
                            to: email,
                            subject: "Verify Your Email Address",
                            text: ` 
            Confirm Your Email Address
            --------------------------
            Click the button below to verify your new email address:
    
            Verify Email: ${verificationUrl}
    
            If the button doesn’t work, copy and paste this link into your browser:
            ${verificationUrl}
    
            Note: This link is valid for 24 hours.`,
                        }
                    );

                    if (!emailResponse.success) {
                        console.error("Error sending verification email.");
                    }

                    setModalState({
                        isOpen: true,
                        title: emailResponse.success ? "Success" : "Error",
                        message: emailResponse.success
                            ? `Please verify your new email address at ${email}`
                            : "Failed to send verification email. Please try again.",
                    });
                }
                // navigate("/login");
            } else {
                setErrorMessage(response.message || "An error occurred.");
                console.error("Signup error:", response.message);
            }
        } catch (error) {
            console.error("Signup error:", error);
            setErrorMessage(
                "An error occurred during signup. Please try again."
            );
        }
    };

    return (
        <div className="main-container">
            {/* Left Section: Logo */}
            <div className="logo-section">
                <div className="logo-box">
                    <img
                        src={ELEOS_clean}
                        alt="ELEOS Logo"
                        className="h-16 w-auto h-full" // adjust size as needed
                    />
                </div>
            </div>

            {/* Right Section: Form */}
            <div className="form-container">
                {" "}
                {/* New parent class */}
                <div className="tab-buttons">
                    <button
                        className="button button-tab-login-off"
                        onClick={() => navigate("/login")}
                    >
                        Log In
                    </button>
                    <button
                        className="button button-tab-signup-on"
                        onClick={() => navigate("/signup")}
                    >
                        Sign Up
                    </button>
                </div>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field"
                    />
                </div>
                {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                )}
                <button onClick={signupUser} className="button confirm-button">
                    Confirm
                </button>
            </div>

            <ProfileModal
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                title={modalState.title}
            >
                <p>{modalState.message}</p>
            </ProfileModal>
        </div>
    );
};

export default Signup;
