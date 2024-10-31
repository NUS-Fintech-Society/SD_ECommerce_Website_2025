import React from 'react';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { apiRequest } from '../api/apiRequest';

const Signup = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const signupUser = async () => {
        
        if(password !== confirmPassword){
            setErrorMessage("Passwords do not match. Please ensure both passwords are the same.");
            return;
        }

        if (!email || !name || !password || !confirmPassword) {
          setErrorMessage("Please enter all fields.");
          return;
        }
    
        try {
          const response = await apiRequest("users", "POST", "signup", { email, name, password, confirmPassword });
          if (response.success) {
            console.log("User registered successfully:", response.data);
            navigate("/login");
          } else {
            console.error("Signup error:", response.message);
          }
        } catch (error) {
          console.error("Signup error:", error);
          setErrorMessage("An error occurred during signup. Please try again.");
        }
      }

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

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button onClick={signupUser} className="button confirm-button">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;