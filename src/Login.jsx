import React, { useState } from "react";
import "./Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "anurag" && password === "anurag") {
      localStorage.setItem("session", "anurag");
      onLogin();
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">

        {/* Top Icon */}
        <div className="login-icon">
          <span>💊</span>
        </div>

        {/* Title */}
        <h1 className="login-title">Pharmacy Sidekick</h1>
        <p className="login-subtitle">Secure access to your store</p>

        {/* Username */}
        <label className="label">Username</label>
        <div className="input-box">
          <FontAwesomeIcon icon={faUser} />
          <input
            type="text"
            placeholder="Enter your username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Password */}
        <label className="label">Password</label>
        <div className="input-box">
          <FontAwesomeIcon icon={faLock} />
          <input
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="forgot">Forgot password?</div>

        {/* Login Button */}
        <button className="login-btn" onClick={handleLogin}>
          Login <FontAwesomeIcon icon={faArrowRight} />
        </button>

        {/* Footer */}
        <div className="footer-text">
          Need help accessing your account? <br />
          <span>Contact IT Support</span>
        </div>

      </div>
    </div>
  );
}

