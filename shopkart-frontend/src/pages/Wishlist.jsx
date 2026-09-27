import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import api from "../services/api";

/**
 * Wishlist Page
 *
 * Fetches the authenticated user's wishlist from GET /wishlist.
 * Renders each product using the WishlistCard component.
 * Handles loading, empty, and error states.
 */
const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/wishlist");
      const items = response.data.wishlist || [];
      setWishlist(items);
      setCount(response.data.count || items.length);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("Unable to load wishlist.");
      console.error("Wishlist fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Called by WishlistCard after a successful removal
  const handleRemoved = (productId) => {
    setWishlist((prev) => prev.filter((item) => item._id !== productId));
    setCount((prev) => Math.max(0, prev - 1));
  };

  // ── Render helpers ───────────────────────────────────────

  const renderContent = () => {
    if (loading) {
      return (
        <div className="state-container">
          <div className="loading-bar" />
          <p className="state-sub">Loading your wishlist...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-container">
          <p className="state-eyebrow">Error</p>
          <p className="state-title">{error}</p>
          <button className="btn-primary" onClick={fetchWishlist} style={{ marginTop: "16px" }}>
            Try Again
          </button>
        </div>
      );
    }

    if (wishlist.length === 0) {
      return (
        <div className="state-container">
          <p className="state-title">Your wishlist is empty ❤️</p>
          <p className="state-sub">
            Start saving products you love.
          </p>
          <Link to="/products" className="btn-primary" style={{ marginTop: "16px" }}>
            Browse Products
          </Link>
        </div>
      );
    }

    return (
      <>
        <p className="results-meta">
          {count} {count === 1 ? "item" : "items"} in your wishlist
        </p>
        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemoved={handleRemoved}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="wishlist-page">
      <Navbar wishlistCount={count} />
      <main className="wishlist-container">
        {/* Page header */}
        <header className="page-header">
          <p className="page-eyebrow">ShopKart — Wishlist</p>
          <h1>Wishlist</h1>
          <p>Products you have saved for later.</p>
        </header>

        {/* Wishlist grid / states */}
        {renderContent()}
      </main>
    </div>
  );
};

export default Wishlist;
