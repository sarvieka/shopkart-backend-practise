import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

/**
 * WishlistCard
 * Renders a single product in the Wishlist page.
 * Provides "View Details" navigation and "Remove from Wishlist" functionality.
 */
const WishlistCard = ({ product, onRemoved }) => {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  // Determine stock status label and CSS class
  const getStockBadge = (stock) => {
    if (stock === 0) return { label: "Out of Stock", cls: "out-of-stock" };
    if (stock <= 5) return { label: `Low — ${stock} left`, cls: "low-stock" };
    return { label: `${stock} in stock`, cls: "in-stock" };
  };

  const stockBadge = getStockBadge(product.stock);

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (removing) return;

    setRemoving(true);
    setError("");

    try {
      await api.delete(`/wishlist/${product._id}`);
      onRemoved(product._id);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(
        err.response?.data?.message || "Unable to remove product. Please try again."
      );
      setRemoving(false);
    }
  };

  return (
    <article className="wishlist-card">
      {/* Image */}
      <div className="wishlist-card-image-wrap">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="product-card-img-placeholder"
          style={{ display: product.image ? "none" : "flex" }}
        >
          No image
        </div>

        {/* Category label overlay */}
        <span className="product-card-category">{product.category}</span>
      </div>

      {/* Body */}
      <div className="wishlist-card-body">
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">
          ₹{product.price?.toLocaleString("en-IN")}
        </div>

        <span className={`stock-badge ${stockBadge.cls}`}>
          {stockBadge.label}
        </span>
      </div>

      {/* Footer actions */}
      <div className="wishlist-card-footer">
        <button
          className="view-details-btn"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          View Details
        </button>
        <button
          className="wishlist-remove-btn"
          onClick={handleRemove}
          disabled={removing}
        >
          {removing ? "Removing..." : "Remove ♡"}
        </button>
      </div>

      {/* Error feedback */}
      {error && <p className="wishlist-card-error">{error}</p>}
    </article>
  );
};

export default WishlistCard;
