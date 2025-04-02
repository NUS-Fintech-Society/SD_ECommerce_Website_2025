import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeListings, { Listing } from "./HomeListings";
import "../Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  const [listings, setListings] = useState<Listing[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleItemClick = (event: React.MouseEvent) => {
    navigate("/login");
  };

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
      <div className="flex-container">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-box">
            {/* <HomeListings listings={dummyListings} /> */}
            <HomeListings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
