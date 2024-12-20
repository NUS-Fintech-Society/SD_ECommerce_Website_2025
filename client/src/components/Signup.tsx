import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../api/apiRequest";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const signupUser = async () => {
    if (!email || !name || !password || !confirmPassword) {
      setErrorMessage("Please enter all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "Passwords do not match. Please ensure both passwords are the same."
      );
      return;
    }
    console.log(name, email, password);
    try {
      const response = await apiRequest("users", "POST", "register", {
        username: name,
        email: email,
        password: password,
        isAdmin: false,
        isSuperAdmin: false,
      });
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
  };

  return (
    <div className="main-container">
      {/* Left Section: Logo */}
      <div className="logo-section">
        <div className="logo-box">"ELEOS"</div>
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
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button onClick={signupUser} className="button confirm-button">
          Confirm
        </button>
      </div>
    </div>
  );
};

export default Signup;
