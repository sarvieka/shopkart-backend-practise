import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import api from "../services/api";

/**
 * Products Page
 *
 * Loads products from GET /products.
 * Search: GET /products?search=...
 * Category filter: GET /products?category=...
 * Combined: GET /products?search=...&category=...
 *
 * The backend is responsible for all filtering logic.
 * This page only sends the query params and renders results.
 */
const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products whenever search or category changes
  const fetchProducts = useCallback(async (searchTerm, categoryTerm) => {
    setLoading(true);
    setError("");

    try {
      // Build query params object — only include non-empty values
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (categoryTerm)      params.category = categoryTerm;

      const response = await api.get("/products", { params });
      const fetched = response.data.products || [];
      setProducts(fetched);

      // If this is the initial "all products" load, extract unique categories for the filter dropdown
      if (!searchTerm && !categoryTerm) {
        const unique = [...new Set(fetched.map((p) => p.category).filter(Boolean))].sort();
        setCategories(unique);
      }
    } catch (err) {
      // 401 → redirect to login, any other error → show message
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("Could not load products. Please try again.");
      console.error("Products fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial load
  useEffect(() => {
    fetchProducts("", "");
  }, [fetchProducts]);

  // Called by SearchBar when user changes search text or category
  const handleSearch = (newSearch, newCategory) => {
    setSearch(newSearch);
    setCategory(newCategory);
    fetchProducts(newSearch, newCategory);
  };

  // Clear both filters
  const handleClear = () => {
    setSearch("");
    setCategory("");
    fetchProducts("", "");
  };

  // ── Render ────────────────────────────────────────────────

  const renderContent = () => {
    if (loading) {
      return (
        <div className="state-container">
          <div className="loading-bar" />
          <p className="state-sub">Loading products...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-container">
          <p className="state-eyebrow">Error</p>
          <p className="state-title">{error}</p>
          <p className="state-sub">Check your connection and try again.</p>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="state-container">
          <p className="state-eyebrow">No Results</p>
          <p className="state-title">No products found.</p>
          <p className="state-sub">
            {search || category
              ? "Try adjusting your search or clearing the filters."
              : "No products are available at this time."}
          </p>
        </div>
      );
    }

    return (
      <>
        <p className="results-meta">
          {products.length} {products.length === 1 ? "product" : "products"}
          {search && ` matching "${search}"`}
          {category && ` in ${category}`}
        </p>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="products-page">
      <Navbar />
      <main className="products-container">
        {/* Page header */}
        <header className="page-header">
          <p className="page-eyebrow">ShopKart — Catalog</p>
          <h1>Products</h1>
          <p>Browse our full product range.</p>
        </header>

        {/* Search + filter */}
        <SearchBar
          search={search}
          category={category}
          categories={categories}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        {/* Product grid / states */}
        {renderContent()}
      </main>
    </div>
  );
};

export default Products;
