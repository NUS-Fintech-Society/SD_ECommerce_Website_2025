import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/apiRequest";
import "../Signup_Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      const response = await apiRequest("login", "POST", "", { email, password });
      if (response.success) {
        localStorage.setItem("token", response.data.token); //Ensure JWT bearer token is stored in the local storage after logging in
        console.log("Login successful:", response.data);
        navigate("/home");
      } else {
        setErrorMessage(response.message || "An unknown error occurred.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="home-container">
      <div className="flex-container">
        {/* Left Section: Logo */}
        <div className="logo-section">
          <div className="logo-box">
            "Landing Page Content"
          </div>
        </div>
  
        {/* Right Section: Form */}
        <div className="form-section">
          <div className="tab-buttons">
            <button
              className="button button-tab-login"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
            <button
              className="button button-tab-signup"
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
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button onClick={handleLogin} className="button confirm-button">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default Login;
