import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * ProductCard
 * Receives a product object from the backend and renders it as an editorial card.
 * Navigates to /products/:id on "View Details" click.
 */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();

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
    </article>
  );
};

export default ProductCard;
