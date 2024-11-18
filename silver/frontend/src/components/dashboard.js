import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import EntryList from './EntryList';
import AddEntry from './AddEntry';
import EditEntry from './EditEntry';
import Pagination from './Pagination';
import Logout from './Logout';
import SearchForm from './SearchForm';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEditor, setShowEditor] = useState(false); // New state for toggling editor visibility
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSearch = (searchParams) => {
    axios.get('http://127.0.0.1:8000/api/search/', { params: searchParams })
      .then(response => setEntries(response.data))
      .catch(error => console.error('Error fetching search results:', error));
  };

  const fetchEntries = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/entries/?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data.results.entries || []);
      setTotalPages(response.data.results.totalPages);
    } catch (err) {
      console.error('Failed to fetch entries', err);
      if (err.response?.status === 401) navigate('/login');
    }
  }, [currentPage, navigate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (id) {
      const entry = entries.find(entry => entry.id === parseInt(id, 10));
      if (entry) setEditingEntry(entry);
    }
  }, [id, entries]);

  const handleDelete = async (entryId) => {
    const token = localStorage.getItem('access_token');
    try {
      await axios.delete(`http://127.0.0.1:8000/api/entries/${entryId}/delete/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(entries.filter((entry) => entry.id !== entryId));
    } catch (err) {
      console.error('Failed to delete entry', err);
    }
  };

  const handleEntryAdded = () => {
    fetchEntries();
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
  };

  const handleUpdateEntry = (updatedEntry) => {
    setEntries(entries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)));
    setEditingEntry(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scrolls to the top of the page smoothly
  };

  const toggleEditor = () => {
    setShowEditor((prev) => !prev);
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-heading">Welcome to Ric'Ochat!</h2>
      <Navbar />
      <SearchForm onSearch={handleSearch} />

      {/* "+" Button */}
      <button 
        className="toggle-editor-button" 
        onClick={toggleEditor}
        title={showEditor ? "Close Editor" : "Add New Entry"}
      >
        {showEditor ? "✖" : "+"}
      </button>

      {/* Conditionally render the editor */}
      {showEditor && (
        <AddEntry onEntryAdded={handleEntryAdded} />
      )}

      {editingEntry ? (
        <EditEntry entry={editingEntry} onUpdateEntry={handleUpdateEntry} />
      ) : (
        <EntryList entries={entries} handleDelete={handleDelete} handleEdit={handleEdit} />
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      <Logout />
    </div>
  );
};

export default Dashboard;