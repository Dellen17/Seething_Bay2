import React, { useState } from 'react';
import '../styles/SearchForm.css';

const SearchForm = ({ onSearch }) => {
    const [keyword, setKeyword] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch({ keyword });
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    return (
        <div className="search-form-container">
            <form onSubmit={handleSearch} className="search-form">
                {showFilters && (
                    <button 
                        type="button" 
                        onClick={toggleFilters} 
                        className="filter-toggle-button">
                        Back
                    </button>
                )}
                <input
                    type="text"
                    placeholder="Search your entries"
                    value={keyword}
                    onClick={toggleFilters}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="search-input"
                />
                <button 
                    type="submit" 
                    className="search-button">
                    Search
                </button>
            </form>

            {showFilters && (
                <div className="filters-container">
                    <h4 className="filters-heading">Filters</h4>
                    <div className="filter-option">
                        <label>
                            <input type="checkbox" name="mediaType" value="videos" />
                            Videos
                        </label>
                    </div>
                    <div className="filter-option">
                        <label>
                            <input type="checkbox" name="mediaType" value="documents" />
                            Documents
                        </label>
                    </div>
                    <div className="filter-option">
                        <label>
                            <input type="date" name="date" />
                            Select Date
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchForm;