import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EntryList from './EntryList';
import AddEntry from './AddEntry';
import EditEntry from './EditEntry';
import SearchForm from './SearchForm';
import Modal from './Modal'; // Import the Modal component
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filters, setFilters] = useState({ keyword: '', mediaType: [], date: '' });
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // Toggle modal
  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  // Fetch filtered entries based on search form inputs
  const handleSearch = async (filters) => {
    setIsSearchLoading(true);
    try {
      const params = {
        keyword: filters.keyword || '',
        date: filters.date || '',
        page: 1,
      };
      if (filters.mediaType.length > 0) {
        params['mediaType[]'] = filters.mediaType;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/search/`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });

      const { entries: fetchedEntries, totalPages } = response.data.results;
      setEntries(fetchedEntries); // Replace entries state with filtered results
      setTotalPages(totalPages);
      setCurrentPage(1);
      setHasMore(totalPages > 1);
      setIsFiltered(true);
    } catch (error) {
      console.error('Error fetching filtered entries:', error);
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Fetch unfiltered entries (initial load or infinite scroll)
  const fetchEntries = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.date) params.date = filters.date;
      if (filters.mediaType.length > 0) params['mediaType[]'] = filters.mediaType;

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/entries/`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });

      const { entries: fetchedEntries, totalPages } = response.data.results;
      setEntries((prevEntries) => [...prevEntries, ...fetchedEntries]); // Append entries for infinite scroll
      setTotalPages(totalPages);
      setCurrentPage(page);
      setHasMore(page < totalPages);
    } catch (err) {
      console.error('Failed to fetch entries', err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [filters, navigate]);

  // Initial fetch only on mount
  useEffect(() => {
    if (!isFiltered) {
      fetchEntries();
    }
  }, [fetchEntries, isFiltered]);

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchEntries(currentPage + 1);
        }
      },
      { threshold: 0.5 }
    );

    const target = document.querySelector('#load-more-trigger');
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [fetchEntries, currentPage, hasMore, loading]);

  // Re-fetch entries after adding a new one
  const handleEntryAdded = () => {
    setEntries([]);
    setCurrentPage(1);
    setHasMore(true);
    if (isFiltered) {
      handleSearch(filters);
    } else {
      fetchEntries();
    }
    toggleModal(); // Close the modal after adding an entry
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
          setFilters({ keyword: '', mediaType: [], date: '' });
          setEntries([]);
          setCurrentPage(1);
          setHasMore(true);
          fetchEntries(); // Fetch all entries when clearing filters
        }}
        isLoading={isSearchLoading}
      />

      {/* Floating "+" Button */}
      <button
        className="toggle-editor-button"
        onClick={toggleModal} // Open the modal
        title={isModalOpen ? 'Close Editor' : 'Add New Entry'}
      >
        {isModalOpen ? '✖' : '+'}
      </button>

      {/* Modal for AddEntry */}
      <Modal isOpen={isModalOpen} onClose={toggleModal}>
        <AddEntry
          onEntryAdded={handleEntryAdded}
          setShowEditor={() => toggleModal()} // Ensure modal closes when canceled
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