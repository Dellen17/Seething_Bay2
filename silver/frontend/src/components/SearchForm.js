import React, { useState } from 'react';
import '../styles/SearchForm.css';

const SearchForm = ({ filters, setFilters, onSearch, onClear }) => {
    const [showFilters, setShowFilters] = useState(false);     

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(filters); // Use the filters state directly
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const clearSearch = () => {
        setFilters({ keyword: '', mediaType: [], date: '' }); // Reset all filters
        if (onClear) onClear();
    };

    // Handle keyword change
    const handleKeywordChange = (e) => {
        const { value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, keyword: value }));
    };

    // Handle media type filter change
    const handleMediaTypeChange = (e) => {
        const { value, checked } = e.target;
        setFilters((prevFilters) => {
            const mediaType = checked
                ? [...prevFilters.mediaType, value] // Add to list if checked
                : prevFilters.mediaType.filter((type) => type !== value); // Remove if unchecked
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
                        value={filters.keyword} // Bind to filters.keyword
                        onClick={toggleFilters}
                        onChange={handleKeywordChange} // Update filters.keyword
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
                <button type="submit" className="search-button">
                    Search
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
                                onChange={handleMediaTypeChange}
                            />
                            Documents
                        </label>
                    </div>
                    
                    <div className="filter-option">
                        <label>
                            <input
                                type="checkbox"
                                name="mediaType"
                                value="image"
                                onChange={handleMediaTypeChange}
                            />
                            Images
                        </label>
                    </div>
                    
                    <div className="filter-option">
                        <label>
                            <input
                                type="checkbox"
                                name="mediaType"
                                value="video"
                                onChange={handleMediaTypeChange}
                            />
                            Videos
                        </label>
                    </div>
                    
                    <div className="filter-option">
                        <label>
                            <input
                                type="checkbox"
                                name="mediaType"
                                value="voice_note"
                                onChange={handleMediaTypeChange}
                            />
                            Voice Notes
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchForm;