import React from "react";

/**
 * SearchBar
 * Controlled component. Receives current search/category state from parent (Products.jsx).
 * Emits onSearch(newSearch, newCategory) on any change.
 * onClear resets both filters.
 */
const SearchBar = ({ search, category, categories, onSearch, onClear }) => {
  const hasFilters = search.trim() !== "" || category !== "";

  return (
    <div className="search-bar">
      {/* Text search */}
      <div className="search-input-wrap">
        <input
          id="product-search"
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearch(e.target.value, category)}
        />
      </div>

      {/* Category filter */}
      <select
        id="category-filter"
        className="category-select"
        value={category}
        onChange={(e) => onSearch(search, e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Clear — only shown when filters are active */}
      {hasFilters && (
        <button className="clear-filters-btn" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
};

export default SearchBar;
