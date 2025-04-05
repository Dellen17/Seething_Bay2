import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EntryList from './EntryList';
import AddEntry from './AddEntry';
import EditEntry from './EditEntry';
import SearchForm from './SearchForm';
import Modal from './Modal';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filters, setFilters] = useState({ keyword: '' }); // Simplified filters
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // Toggle modal
  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  // Fetch entries (for initial load or infinite scroll)
  const fetchEntries = useCallback(async (page = 1, keyword = '') => {
    setLoading(true);
    try {
      const params = { page };
      if (keyword) params.keyword = keyword;

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/entries/`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });

      const { entries: fetchedEntries, totalPages } = response.data.results;
      if (page === 1) {
        setEntries(fetchedEntries); // Reset entries on first page
      } else {
        setEntries((prevEntries) => {
          // Avoid duplicates by filtering out entries that already exist
          const existingIds = new Set(prevEntries.map((entry) => entry.id));
          const newEntries = fetchedEntries.filter((entry) => !existingIds.has(entry.id));
          return [...prevEntries, ...newEntries];
        });
      }
      setTotalPages(totalPages);
      setCurrentPage(page);
      setHasMore(page < totalPages);
    } catch (err) {
      console.error('Failed to fetch entries', err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Fetch filtered entries based on keyword
  const handleSearch = async (filters) => {
    setIsSearchLoading(true);
    setEntries([]); // Reset entries before search
    setCurrentPage(1); // Reset to first page
    setHasMore(true); // Reset hasMore
    try {
      const params = { keyword: filters.keyword || '', page: 1 };

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/search/`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });

      const { entries: fetchedEntries, totalPages } = response.data.results;
      setEntries(fetchedEntries);
      setTotalPages(totalPages);
      setCurrentPage(1);
      setHasMore(totalPages > 1);
    } catch (error) {
      console.error('Error fetching filtered entries:', error);
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchEntries(1, filters.keyword);
  }, [fetchEntries]);

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchEntries(currentPage + 1, filters.keyword);
        }
      },
      { threshold: 0.5 }
    );

    const target = document.querySelector('#load-more-trigger');
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [fetchEntries, currentPage, hasMore, loading, filters.keyword]);

  // Re-fetch entries after adding a new one
  const handleEntryAdded = () => {
    setEntries([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchEntries(1, filters.keyword);
    toggleModal();
  };

  // Update an entry in the state
  const handleUpdateEntry = (updatedEntry) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
    );
    setEditingEntry(null);
  };

  return (
    <div className="dashboard-content">
      <SearchForm
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
        onClear={() => {
          setFilters({ keyword: '' });
          setEntries([]);
          setCurrentPage(1);
          setHasMore(true);
          fetchEntries(1);
        }}
        isLoading={isSearchLoading}
      />

      {/* Floating "+" Button */}
      <button
        className="toggle-editor-button"
        onClick={toggleModal}
        title={isModalOpen ? 'Close Editor' : 'Add New Entry'}
      >
        {isModalOpen ? '✖' : '+'}
      </button>

      {/* Modal for AddEntry */}
      <Modal isOpen={isModalOpen} onClose={toggleModal}>
        <AddEntry
          onEntryAdded={handleEntryAdded}
          setShowEditor={() => toggleModal()}
        />
      </Modal>

      {editingEntry ? (
        <EditEntry
          entry={editingEntry}
          onUpdateEntry={handleUpdateEntry}
          onCancel={() => setEditingEntry(null)}
        />
      ) : (
        <EntryList
          entries={entries}
          handleDelete={async (entryId) => {
            const token = localStorage.getItem('access_token');
            try {
              await axios.delete(`${process.env.REACT_APP_API_URL}/api/entries/${entryId}/delete/`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== entryId));
            } catch (err) {
              console.error('Failed to delete entry', err);
            }
          }}
          handleEdit={(entry) => setEditingEntry(entry)}
        />
      )}

      {/* Load More Trigger */}
      {hasMore && !loading && <div id="load-more-trigger" style={{ height: '10px' }}></div>}

      {/* Loading Indicator */}
      {loading && <p>Loading more entries...</p>}
    </div>
  );
};

export default Dashboard;