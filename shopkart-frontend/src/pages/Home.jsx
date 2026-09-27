import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

/**
 * Home Page
 *
 * On mount, calls GET /customers/me to verify authentication
 * and retrieve the real customer profile.
 * If the response is 401 Unauthorized, redirects to /login.
 *
 * Displays real customer data: fullName, email, phone.
 * Includes a CTA to navigate to /products.
 */
const Home = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        const response = await api.get("/customers/me");
        setCustomer(response.data.customer);
      } catch (error) {
        console.error("Failed to fetch customer profile:", error);
        // Any error (including 401 Unauthorized) → redirect to /login
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerProfile();
  }, [navigate]);

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="home-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // ── Authenticated ─────────────────────────────────────────
  return (
    <div className="home-page">
      <Navbar />
      <main className="home-container">

        {/* Welcome section */}
        <section className="home-welcome">
          <p className="home-eyebrow">ShopKart — Customer Account</p>
          <h1>
            Welcome back,{" "}
            <strong>{customer?.fullName}</strong>.
          </h1>
          <p className="home-welcome-sub">
            You are signed in to your ShopKart account. Browse the product
            catalog to find what you need.
          </p>
        </section>

        {/* Profile details */}
        <section>
          <p className="home-profile-title">Account Details</p>
          <div className="profile-details">
            <div className="detail-item">
              <p className="detail-label">Full Name</p>
              <p className="detail-value">{customer?.fullName}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Email Address</p>
              <p className="detail-value">{customer?.email}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Phone Number</p>
              <p className="detail-value">{customer?.phone}</p>
            </div>
            {customer?.id && (
              <div className="detail-item">
                <p className="detail-label">Customer ID</p>
                <p className="detail-value code-font">{customer.id}</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <div className="home-cta">
          <Link to="/products" className="btn-primary">
            Explore Product Catalog
          </Link>
        </div>

      </main>
    </div>
  );
};

export default Home;
