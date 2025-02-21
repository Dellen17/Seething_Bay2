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

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch filtered entries based on search form inputs
  const handleSearch = async (filters) => {
    try {
      const params = {
        keyword: filters.keyword || '',
        date: filters.date || '',
      };

      filters.mediaType.forEach((type) => {
        params[`mediaType[]`] = type;
      });

      const response = await axios.get('http://127.0.0.1:8000/api/search/', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });

      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching filtered entries:', error);
    }
  };

  // Fetch entries for the current page
  const fetchEntries = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/entries/?page=${currentPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEntries(response.data.results.entries || []);
      setTotalPages(response.data.results.totalPages);
    } catch (err) {
      console.error('Failed to fetch entries', err);
      if (err.response?.status === 401) navigate('/login');
    }
  }, [currentPage, navigate]);

  // Fetch entries on component mount or page change
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

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
    fetchEntries();
    setShowEditor(false); // Close the form after adding an entry
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

  // Function to handle canceling the edit
  const handleCancelEdit = () => {
    setEditingEntry(null); // Reset the editing entry
  };

  // Handle pagination page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleEditor = () => {
    setShowEditor((prev) => !prev);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Add this line to scroll to the top
  };

  return (
    <div className="dashboard-content">
      <SearchForm
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
        onClear={fetchEntries}
      />

      {/* "+" Button to toggle editor */}
      <button
        className="toggle-editor-button"
        onClick={toggleEditor}
        title={showEditor ? 'Close Editor' : 'Add New Entry'}
      >
        {showEditor ? '✖' : '+'}
      </button>

      {/* Conditionally render the editor */}
      {showEditor && (
        <AddEntry 
          onEntryAdded={handleEntryAdded} 
          setShowEditor={setShowEditor} // Pass setShowEditor as a prop
        />
      )}

      {/* Conditionally render the edit form or entry list */}
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

      {/* Pagination component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Dashboard;