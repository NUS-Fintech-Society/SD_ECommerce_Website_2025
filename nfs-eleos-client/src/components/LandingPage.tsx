import React from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/apiRequest"; // Import the API request function if needed
import "../Landing.css"; // Import the CSS file

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <div className="flex-container">
                {/* Logo section */}
                <div className="logo-section">
                    <div className="logo-box">
                        "Landing Page Content"
                    </div>
                </div>
    
                {/* Log In and Sign Up Buttons */}
                <div className="button-section">
                    <button
                        onClick={() => navigate("/Login")}
                        className="button button-login"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => navigate("/signup")}
                        className="button button-signup"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );   
};

export default Landing;
