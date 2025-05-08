import React from "react";
import { useNavigate } from "react-router-dom";
import "../Landing.css";
import eleoslogo from "../assets/images/ELEOS.png";
import landingPage from "../assets/images/landingPage.png";

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            {/* Navbar Section */}
            <nav className="navbar">
                {/* Logo on the left */}
                <div className="navbar-logo" onClick={() => navigate("/")}>
                    <img
                        src={eleoslogo}
                        alt="Landing Page Logo"
                        className="h-20 cursor-pointer"
                        // style={{ height: "40px", cursor: "pointer" }}
                    />
                </div>
                {/* Login and Signup buttons on the right */}
                <div className="navbar-buttons">
                    <button
                        onClick={() => navigate("/login")}
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
            </nav>

            {/* Main Content Section */}
            <div
                className="flex flex-col md:flex-row items-center justify-between px-8 py-16 bg-white h-full w-full"
                style={{ backgroundColor: "#fffbf3" }}
            >
                {/* Text Content */}
                <div className="max-w-xl text-left">
                    <h1 className="text-5xl font-bold text-primary mb-4">
                        Shop with ELEOS
                    </h1>
                    <h2 className="text-2xl font-medium text-secondary">
                        NUS Fintech Society
                    </h2>
                </div>

                {/* Image Section */}
                <div className="mt-10 md:mt-0 md:ml-10 max-w-xl w-full">
                    <img
                        src={landingPage}
                        alt="ELEOS Landing"
                        className="w-full h-auto object-contain"
                    />
                </div>
            </div>
        </div>
    );
};

export default Landing;
