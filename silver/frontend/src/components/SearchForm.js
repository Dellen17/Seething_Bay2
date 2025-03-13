import React, { useState } from 'react';
import { FaSearch, FaFile, FaImage, FaVideo, FaMicrophone } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import '../styles/SearchForm.css';

const SearchForm = ({ filters, setFilters, onSearch, onClear, isLoading }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(filters, 1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Clear all filters and fetch unfiltered entries
  const clearSearch = () => {
    setFilters({ keyword: '', mediaType: [], date: '' });
    if (onClear) onClear(); // Trigger the unfiltered fetch
  };

  // Handle keyword change
  const handleKeywordChange = (e) => {
    const { value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, keyword: value }));
  };

  // Handle media type filter change (single selection)
  const handleMediaTypeChange = (e) => {
    const { value, checked } = e.target;
    setFilters((prevFilters) => {
      const mediaType = checked ? [value] : [];
      // If unchecking, trigger unfiltered fetch
      if (!checked && onClear) onClear();
      return { ...prevFilters, mediaType };
    });
  };

  return (
    <div className="search-form-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="Search your entries"
            value={filters.keyword}
            onClick={toggleFilters}
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

      {showFilters && (
        <div className="filters-container">
          <h4 className="filters-heading">Filters</h4>

          <div className="filter-option">
            <label>
              <input
                type="checkbox"
                name="mediaType"
                value="document"
                checked={filters.mediaType.includes('document')}
                onChange={handleMediaTypeChange}
              />
              <FaFile className="filter-icon" />
              <span>Documents</span>
            </label>
          </div>

          <div className="filter-option">
            <label>
              <input
                type="checkbox"
                name="mediaType"
                value="image"
                checked={filters.mediaType.includes('image')}
                onChange={handleMediaTypeChange}
              />
              <FaImage className="filter-icon" />
              <span>Images</span>
            </label>
          </div>

          <div className="filter-option">
            <label>
              <input
                type="checkbox"
                name="mediaType"
                value="video"
                checked={filters.mediaType.includes('video')}
                onChange={handleMediaTypeChange}
              />
              <FaVideo className="filter-icon" />
              <span>Videos</span>
            </label>
          </div>

          <div className="filter-option">
            <label>
              <input
                type="checkbox"
                name="mediaType"
                value="voice_note"
                checked={filters.mediaType.includes('voice_note')}
                onChange={handleMediaTypeChange}
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