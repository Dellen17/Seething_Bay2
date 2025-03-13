import React from 'react';
import '../styles/Pagination.css';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  const maxVisiblePages = 5; // Number of visible page buttons
  const halfVisiblePages = Math.floor(maxVisiblePages / 2);

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

  const handleFirstPage = () => {
    handlePageClick(1);
  };

  const handleLastPage = () => {
    handlePageClick(totalPages);
  };

  const renderPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - halfVisiblePages);
    let endPage = Math.min(totalPages, currentPage + halfVisiblePages);

    // Adjust startPage and endPage if we're near the edges
    if (currentPage <= halfVisiblePages) {
      endPage = Math.min(maxVisiblePages, totalPages);
    } else if (currentPage >= totalPages - halfVisiblePages) {
      startPage = Math.max(totalPages - maxVisiblePages + 1, 1);
    }

    // Add "First" and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="pagination-button"
          onClick={() => handlePageClick(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis-start" className="pagination-ellipsis">...</span>);
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
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

    // Add ellipsis and "Last" if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis-end" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          className="pagination-button"
          onClick={() => handlePageClick(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-nav-button"
        onClick={handleFirstPage}
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
        &lt; {/* Left arrow */}
      </button>
      {renderPageNumbers()}
      <button
        className="pagination-nav-button"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        &gt; {/* Right arrow */}
      </button>
      <button
        className="pagination-nav-button"
        onClick={handleLastPage}
        disabled={currentPage === totalPages}
        aria-label="Go to last page"
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;