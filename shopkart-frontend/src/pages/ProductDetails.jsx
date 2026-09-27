import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

/**
 * ProductDetails Page
 *
 * Reads :id from the URL via useParams().
 * Calls GET /products/:id to fetch the product from the real backend.
 * Displays all real product fields from MongoDB.
 * "Add to Cart" is UI-only — there is no cart backend in this lab.
 */
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err.response?.data?.message || "Could not load this product."
          );
        }
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Quantity handlers
  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () =>
    setQuantity((q) => Math.min(product?.stock || 1, q + 1));

  // Stock badge
  const getStockInfo = (stock) => {
    if (stock === 0) return { label: "Out of Stock", cls: "out-of-stock" };
    if (stock <= 5) return { label: `Only ${stock} remaining`, cls: "low-stock" };
    return { label: `${stock} in stock`, cls: "in-stock" };
  };

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="details-page">
        <Navbar />
        <div className="state-container">
          <div className="loading-bar" />
          <p className="state-sub">Loading product...</p>
        </div>
      </div>
    );
  }

  // ── Not found state ───────────────────────────────────────
  if (notFound) {
    return (
      <div className="details-page">
        <Navbar />
        <div className="details-container">
          <Link to="/products" className="back-link">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Products
          </Link>
          <div className="state-container" style={{ minHeight: "300px" }}>
            <p className="state-eyebrow">404</p>
            <p className="state-title">Product not found.</p>
            <p className="state-sub">This product may have been removed or the ID is incorrect.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────
  if (error) {
    return (
      <div className="details-page">
        <Navbar />
        <div className="details-container">
          <Link to="/products" className="back-link">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Products
          </Link>
          <div className="state-container" style={{ minHeight: "300px" }}>
            <p className="state-eyebrow">Error</p>
            <p className="state-title">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Product loaded ────────────────────────────────────────
  const stockInfo = getStockInfo(product.stock);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="details-page">
      <Navbar />
      <main className="details-container">
        {/* Back link */}
        <Link to="/products" className="back-link">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Products
        </Link>

        {/* Two-column layout */}
        <div className="details-layout">
          {/* LEFT — Image */}
          <div className="details-image-wrap">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="details-image-placeholder">No image available</div>
            )}
          </div>

          {/* RIGHT — Info */}
          <div className="details-info">
            {/* Eyebrow / category */}
            <p className="details-eyebrow">{product.category}</p>

            {/* Name */}
            <h1 className="details-name">{product.name}</h1>

            {/* Price */}
            <p className="details-price">₹{product.price?.toLocaleString("en-IN")}</p>

            <hr className="details-divider" />

            {/* Description */}
            <p className="details-description-label">Description</p>
            <p className="details-description">{product.description}</p>

            {/* Metadata grid */}
            <div className="details-meta-grid">
              <div className="details-meta-item">
                <p className="details-meta-label">Category</p>
                <p className="details-meta-value">{product.category}</p>
              </div>
              <div className="details-meta-item">
                <p className="details-meta-label">Availability</p>
                <p className={`details-meta-value stock-badge ${stockInfo.cls}`} style={{ display: "inline-block" }}>
                  {stockInfo.label}
                </p>
              </div>
              <div className="details-meta-item">
                <p className="details-meta-label">Price</p>
                <p className="details-meta-value">₹{product.price?.toLocaleString("en-IN")}</p>
              </div>
              <div className="details-meta-item">
                <p className="details-meta-label">Product ID</p>
                <p className="details-meta-value code-font" style={{ fontSize: "11px", wordBreak: "break-all" }}>
                  {product._id}
                </p>
              </div>
            </div>

            <hr className="details-divider" />

            {/* Add to Cart — UI only, no backend */}
            <div className="add-to-cart-section">
              {/* Quantity selector */}
              {!isOutOfStock && (
                <div className="quantity-row">
                  <button className="qty-btn" onClick={decreaseQty} aria-label="Decrease quantity">−</button>
                  <input
                    className="qty-value"
                    type="number"
                    value={quantity}
                    readOnly
                    aria-label="Quantity"
                  />
                  <button className="qty-btn" onClick={increaseQty} aria-label="Increase quantity">+</button>
                </div>
              )}

              {/* Add to cart button — UI only */}
              <button
                className="add-to-cart-btn"
                disabled={isOutOfStock}
                onClick={() => {
                  /* Cart functionality not yet implemented */
                }}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              <p className="add-to-cart-note">
                {isOutOfStock
                  ? "This item is currently unavailable."
                  : "Cart functionality coming soon."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;
