import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

/**
 * Login Page
 *
 * Fields: email, password
 * Submits: POST /customers/login
 * On success: backend sets HttpOnly "token" cookie; navigate to /home
 * On error: display server message
 *
 * JWT is NEVER stored in localStorage/sessionStorage/React state.
 * The HttpOnly cookie is managed entirely by the browser.
 */
const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/customers/login", {
        email: formData.email.trim(),
        password: formData.password
      });

      // Backend sets HttpOnly cookie "token"
      // On successful login navigate to /home
      navigate("/home");
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid credentials. Please try again.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Logo mark */}
      <div className="auth-logo">
        <p className="auth-logo-name">ShopKart</p>
        <p className="auth-logo-sub">Commerce Platform</p>
      </div>

      {/* Card */}
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-eyebrow">Customer Portal</p>
          <h1>Sign In</h1>
          <p>Enter your credentials to access your account.</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don&apos;t have an account?{" "}
            <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
