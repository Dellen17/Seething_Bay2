import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import '../styles/SearchForm.css';

const SearchForm = ({ filters, setFilters, onSearch, onClear, isLoading }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  // Clear the search input and fetch unfiltered entries
  const clearSearch = () => {
    setFilters({ keyword: '' });
    if (onClear) onClear();
  };

  // Handle keyword change
  const handleKeywordChange = (e) => {
    const { value } = e.target;
    setFilters({ keyword: value });
  };

  return (
    <div className="search-form-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="Search your entries"
            value={filters.keyword}
            onClick={() => setShowFilters(false)}
            onChange={handleKeywordChange}
            className="search-input"
          />
          {filters.keyword && (
            <button
              type="button"
              onClick={clearSearch}
              className="clear-button"
            >
              ✖
            </button>
          )}
        </div>
        <button type="submit" className="search-button" disabled={isLoading}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <FaSearch className="search-icon" />
              <span>Search</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;