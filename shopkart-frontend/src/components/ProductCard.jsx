import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

/**
 * ProductCard
 * Receives a product object from the backend and renders it as an editorial card.
 * Navigates to /products/:id on "View Details" click.
 * Includes "Add to Wishlist" functionality connected to POST /wishlist/:productId.
 */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  // Wishlist action states: "idle" | "saving" | "saved" | "error"
  const [wishlistStatus, setWishlistStatus] = useState("idle");
  const [wishlistError, setWishlistError] = useState("");

  // Determine stock status label and CSS class
  const getStockBadge = (stock) => {
    if (stock === 0) return { label: "Out of Stock", cls: "out-of-stock" };
    if (stock <= 5) return { label: `Low — ${stock} left`, cls: "low-stock" };
    return { label: "In Stock", cls: "in-stock" };
  };

  const stockBadge = getStockBadge(product.stock);

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation(); // prevent card click navigation
    if (wishlistStatus === "saving" || wishlistStatus === "saved") return;

    setWishlistStatus("saving");
    setWishlistError("");

    try {
      await api.post(`/wishlist/${product._id}`);
      setWishlistStatus("saved");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      if (err.response?.status === 409) {
        // Product already in wishlist — treat as success
        setWishlistStatus("saved");
        return;
      }
      setWishlistStatus("error");
      setWishlistError(
        err.response?.data?.message || "Unable to save product. Please try again."
      );
    }
  };

  // Wishlist button label
  const getWishlistLabel = () => {
    switch (wishlistStatus) {
      case "saving": return "⌛ Saving...";
      case "saved":  return "♥ Added to Wishlist";
      case "error":  return "♡ Add to Wishlist";
      default:       return "♡ Add to Wishlist";
    }
  };

  return (
    <article className="product-card" onClick={handleCardClick}>
      {/* Image */}
      <div className="product-card-image-wrap">
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
      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">₹{product.price?.toLocaleString("en-IN")}</div>
      </div>

      {/* Footer */}
      <div className="product-card-footer">
        <span className={`stock-badge ${stockBadge.cls}`}>{stockBadge.label}</span>
        <button
          className="view-details-btn"
          onClick={(e) => {
            e.stopPropagation(); // prevent double-fire from article click
            navigate(`/products/${product._id}`);
          }}
        >
          View Details
        </button>
      </div>

      {/* Wishlist action */}
      <div className="product-card-wishlist">
        <button
          className={`wishlist-btn ${wishlistStatus === "saved" ? "wishlisted" : ""}`}
          onClick={handleAddToWishlist}
          disabled={wishlistStatus === "saving" || wishlistStatus === "saved"}
        >
          {getWishlistLabel()}
        </button>
        {wishlistStatus === "error" && wishlistError && (
          <p className="wishlist-error-msg">{wishlistError}</p>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
