import React from 'react';
import '../styles/Pagination.css';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageClick(i)}
          aria-current={i === currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-nav-button"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="Go to first page"
      >
        First
      </button>
      <button
        className="pagination-nav-button"
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        Previous
      </button>
      {renderPageNumbers()}
      <button
        className="pagination-nav-button"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        Next
      </button>
      <button
        className="pagination-nav-button"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Go to last page"
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;