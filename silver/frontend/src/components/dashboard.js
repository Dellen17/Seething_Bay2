import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EntryList from './EntryList';
import AddEntry from './AddEntry';
import EditEntry from './EditEntry';  
import Pagination from './pagination';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingEntry, setEditingEntry] = useState(null); 
  const navigate = useNavigate();

  // Wrap fetchEntries in useCallback
  const fetchEntries = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/entries/?page=${currentPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEntries(response.data.results.entries || []);
      setTotalPages(response.data.results.totalPages);
    } catch (err) {
      console.error('Failed to fetch entries', err);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    }
  }, [currentPage, navigate]); // Dependencies

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDelete = async (entryId) => {
    const token = localStorage.getItem('access_token');
    try {
      await axios.delete(`http://127.0.0.1:8000/api/entries/${entryId}/delete/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEntries(entries.filter((entry) => entry.id !== entryId));
    } catch (err) {
      console.error('Failed to delete entry', err);
    }
  };

  const handleEntryAdded = (newEntry) => {
    fetchEntries();  // Refetch entries after adding a new one
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
  };

  return (
    <div>
      <h2>Welcome to Seething Bay!</h2>
      <AddEntry onEntryAdded={handleEntryAdded} />
      {editingEntry ? (
        <EditEntry entry={editingEntry} onUpdateEntry={handleUpdateEntry} />
      ) : (
        <EntryList entries={entries} handleDelete={handleDelete} handleEdit={handleEdit} />
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