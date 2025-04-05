import React, { useState } from 'react';
import { FaSearch, FaFile, FaImage, FaVideo, FaMicrophone } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import '../styles/SearchForm.css';

const SearchForm = ({ filters, setFilters, onSearch, onClear, isLoading }) => {
  const [showFilters, setShowFilters] = useState(false);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(filters, 1); // Always reset to page 1 when searching
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Clear all filters and fetch unfiltered entries
  const clearSearch = () => {
    setFilters({ keyword: '', mediaType: [], date: '' }); // Reset filters
    if (onClear) onClear(); // Trigger unfiltered fetch
  };

  // Handle keyword change
  const handleKeywordChange = (e) => {
    const { value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, keyword: value }));
  };

  // Handle media type filter change (single selection)
  const handleMediaTypeChange = (value) => {
    setFilters((prevFilters) => {
      const mediaType = prevFilters.mediaType.includes(value) ? [] : [value]; // Toggle single selection
      return { ...prevFilters, mediaType };
    });
  };

  return (
    <div className="search-form-container">
      <form onSubmit={handleSearch} className="search-form">
        {/* Search Bar */}
        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="Search your entries"
            value={filters.keyword}
            onChange={handleKeywordChange}
            className="search-input"
          />
          {(filters.keyword || filters.mediaType.length > 0) && (
            <button
              type="button"
              onClick={clearSearch}
              className="clear-button"
            >
              ✖
            </button>
          )}
        </div>

        {/* Search Button */}
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

      {/* Filters Section */}
      {showFilters && (
        <div className="filters-container">
          <h4 className="filters-heading">Filters</h4>

          {/* Documents Filter */}
          <div className="filter-option">
            <label>
              <input
                type="radio"
                name="mediaType"
                value="document"
                checked={filters.mediaType.includes('document')}
                onChange={() => handleMediaTypeChange('document')}
              />
              <FaFile className="filter-icon" />
              <span>Documents</span>
            </label>
          </div>

          {/* Images Filter */}
          <div className="filter-option">
            <label>
              <input
                type="radio"
                name="mediaType"
                value="image"
                checked={filters.mediaType.includes('image')}
                onChange={() => handleMediaTypeChange('image')}
              />
              <FaImage className="filter-icon" />
              <span>Images</span>
            </label>
          </div>

          {/* Videos Filter */}
          <div className="filter-option">
            <label>
              <input
                type="radio"
                name="mediaType"
                value="video"
                checked={filters.mediaType.includes('video')}
                onChange={() => handleMediaTypeChange('video')}
              />
              <FaVideo className="filter-icon" />
              <span>Videos</span>
            </label>
          </div>

          {/* Voice Notes Filter */}
          <div className="filter-option">
            <label>
              <input
                type="radio"
                name="mediaType"
                value="voice_note"
                checked={filters.mediaType.includes('voice_note')}
                onChange={() => handleMediaTypeChange('voice_note')}
              />
              <FaMicrophone className="filter-icon" />
              <span>Voice Notes</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchForm;