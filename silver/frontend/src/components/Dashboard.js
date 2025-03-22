import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import EntryList from './EntryList';
import AddEntry from './AddEntry';
import EditEntry from './EditEntry';
import Pagination from './Pagination';
import SearchForm from './SearchForm';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [filters, setFilters] = useState({ keyword: '', mediaType: [], date: '' });
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch filtered entries based on search form inputs
  const handleSearch = async (filters, page = 1) => {
    setIsSearchLoading(true);
    try {
      const params = {
        keyword: filters.keyword || '',
        date: filters.date || '',
        page: page,
      };
      if (filters.mediaType.length > 0) {
        params['mediaType[]'] = filters.mediaType;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/search/', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });

      const { entries, currentPage, totalPages } = response.data.results;
      setEntries(entries);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
      setIsFiltered(true);
    } catch (error) {
      console.error('Error fetching filtered entries:', error);
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Fetch unfiltered entries (only for initial load)
  const fetchEntries = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/entries/?page=${currentPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEntries(response.data.results.entries || []);
      setTotalPages(response.data.results.totalPages);
      setIsFiltered(false);
    } catch (err) {
      console.error('Failed to fetch entries', err);
      if (err.response?.status === 401) navigate('/login');
    }
  }, [currentPage, navigate]);

  // Initial fetch only on mount (not on every page change)
  useEffect(() => {
    if (!isFiltered) {
      fetchEntries();
    }
  }, [fetchEntries, isFiltered]);

  // Set editing entry based on URL parameter
  useEffect(() => {
    if (id) {
      const entry = entries.find((entry) => entry.id === parseInt(id, 10));
      if (entry) setEditingEntry(entry);
    }
  }, [id, entries]);

  // Handle deleting an entry
  const handleDelete = async (entryId) => {
    const token = localStorage.getItem('access_token');
    try {
      await axios.delete(`http://127.0.0.1:8000/api/entries/${entryId}/delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(entries.filter((entry) => entry.id !== entryId));
    } catch (err) {
      console.error('Failed to delete entry', err);
    }
  };

  // Re-fetch entries after adding a new one
  const handleEntryAdded = () => {
    if (isFiltered) {
      handleSearch(filters, currentPage);
    } else {
      fetchEntries();
    }
    setShowEditor(false);
  };

  // Set the entry to be edited
  const handleEdit = (entry) => {
    setEditingEntry(entry);
  };

  // Update an entry in the state
  const handleUpdateEntry = (updatedEntry) => {
    setEntries(
      entries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
    setEditingEntry(null);
  };

  // Handle canceling the edit
  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  // Handle pagination page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (isFiltered) {
      handleSearch(filters, pageNumber);
    } else {
      fetchEntries();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleEditor = () => {
    setShowEditor((prev) => !prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-content">
      <SearchForm
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
        onClear={fetchEntries}
        isLoading={isSearchLoading}
      />

      <button
        className="toggle-editor-button"
        onClick={toggleEditor}
        title={showEditor ? 'Close Editor' : 'Add New Entry'}
      >
        {showEditor ? '✖' : '+'}
      </button>

      {showEditor && (
        <AddEntry 
          onEntryAdded={handleEntryAdded} 
          setShowEditor={setShowEditor}
        />
      )}

      {editingEntry ? (
        <EditEntry 
          entry={editingEntry} 
          onUpdateEntry={handleUpdateEntry}
          onCancel={handleCancelEdit} 
        />
      ) : (
        <EntryList
          entries={entries}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Dashboard;