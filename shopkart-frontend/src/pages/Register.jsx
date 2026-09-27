import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

/**
 * Register Page
 *
 * Fields: fullName, email, password, phone
 * Submits: POST /customers/register
 * On success: navigate to /login
 * On error: display server message
 */
const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: ""
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

    // Client-side validation
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.phone.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/customers/register", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim()
      });

      // On successful registration navigate to /login
      navigate("/login");
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again.";
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
          <p className="auth-eyebrow">New Account</p>
          <h1>Create Account</h1>
          <p>Join ShopKart to start browsing our catalog.</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

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
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="10-digit number"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
