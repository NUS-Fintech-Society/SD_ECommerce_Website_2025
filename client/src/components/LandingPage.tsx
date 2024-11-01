import React from "react";
import { useNavigate } from "react-router-dom";
import "../Landing.css";

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            {/* Navbar Section */}
            <nav className="navbar">
                {/* Logo on the left */}
                <div className="navbar-logo" onClick={() => navigate("/")}>
                    Landing Page Logo
                </div>
                {/* Login and Signup buttons on the right */}
                <div className="navbar-buttons">
                    <button onClick={() => navigate("/login")} className="button button-login">
                        Log In
                    </button>
                    <button onClick={() => navigate("/signup")} className="button button-signup">
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* Main Content Section */}
            <div className="flex-container">
                {/* Logo Section */}
                <div className="logo-section">
                <div className="logo-box">
                    <h1 className="logo-title"> NUS Fintech Society</h1>
                    <h2 className="logo-subtitle">Landing Page Content</h2>
                </div>
                </div>                  
            </div>
        </div>
    );   
};

export default Landing;
