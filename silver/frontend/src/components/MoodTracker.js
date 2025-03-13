import React, { useState, useEffect, useCallback } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { moods } from './MoodSelector'; // Import moods array
import '../styles/MoodTracker.css';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const MoodTracker = () => {
  const [moodTrends, setMoodTrends] = useState([]);
  const [sentimentTrends, setSentimentTrends] = useState([]);
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [sentimentDistribution, setSentimentDistribution] = useState([]);
  const [timeRange, setTimeRange] = useState('7'); // Default to last 7 days
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false); // For collapsible summary
  const navigate = useNavigate();

  // Fetch mood data
  const fetchMoodData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/mood-tracker/', {
        params: { start_date: getStartDate(timeRange) },
        headers: { Authorization: `Bearer ${token}` },
      });

      setMoodTrends(response.data.mood_trends);
      setSentimentTrends(response.data.sentiment_trends);
      setMoodDistribution(response.data.mood_distribution);
      setSentimentDistribution(response.data.sentiment_distribution);
    } catch (error) {
      console.error('Error fetching mood data:', error);
      setError('Failed to load mood data. Please try again.');
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [timeRange, navigate]);

  // Calculate start date based on time range
  const getStartDate = (range) => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - parseInt(range));
    return startDate.toISOString().split('T')[0];
  };

  // Fetch mood data on component mount or time range change
  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  // Fetch summary
  const fetchSummary = async () => {
    setIsSummaryLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/generate-summary/', {
        params: { start_date: getStartDate(timeRange) },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(response.data.summary);
      setIsSummaryOpen(true); // Open summary on fetch
    } catch (error) {
      console.error('Error fetching summary:', error);
      setError('Failed to load summary. Please try again.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Map mood colors from moods array
  const moodColors = moods.reduce((acc, mood) => {
    acc[mood.label] = mood.color;
    return acc;
  }, {});

  // Format data for Line Chart (Mood Trends)
  const moodLineChartData = {
    labels: [...new Set(moodTrends.map((entry) => entry.date))], // Unique dates
    datasets: Object.keys(moodColors).map((mood) => ({
      label: mood.charAt(0).toUpperCase() + mood.slice(1),
      data: moodTrends
        .filter((entry) => entry.mood === mood)
        .map((entry) => ({ x: entry.date, y: entry.count })),
      borderColor: moodColors[mood],
      backgroundColor: `${moodColors[mood]}33`, // 20% opacity
      tension: 0.4,
      fill: false,
    })),
  };

  // Format data for Line Chart (Sentiment Trends)
  const sentimentLineChartData = {
    labels: sentimentTrends.map((entry) => entry.date),
    datasets: [
      {
        label: 'Sentiment',
        data: sentimentTrends.map((entry) => entry.count),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // Format data for Pie Chart (Mood Distribution)
  const moodPieChartData = {
    labels: moodDistribution.map((entry) => entry.mood),
    datasets: [
      {
        data: moodDistribution.map((entry) => entry.count),
        backgroundColor: moodDistribution.map((entry) => moodColors[entry.mood] || '#9E9E9E'),
      },
    ],
  };

  // Format data for Pie Chart (Sentiment Distribution)
  const sentimentPieChartData = {
    labels: sentimentDistribution.map((entry) => entry.sentiment),
    datasets: [
      {
        data: sentimentDistribution.map((entry) => entry.count),
        backgroundColor: ['#4CAF50', '#F44336', '#9E9E9E'], // Positive, Negative, Neutral
      },
    ],
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Mood and Sentiment Trends Over Time', color: '#fff' },
      tooltip: { enabled: true }, // Enable tooltips
    },
    scales: {
      x: { title: { display: true, text: 'Date', color: '#fff' }, ticks: { color: '#bbb' } },
      y: { title: { display: true, text: 'Count', color: '#fff' }, ticks: { color: '#bbb' } },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom', labels: { color: '#fff' } },
      title: { display: true, text: 'Distribution', color: '#fff' },
    },
  };

  return (
    <div className="mood-tracker-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Dashboard
      </button>

      <h2>Mood Tracker</h2>

      <div className="time-range-filter">
        <label>Time Range:</label>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="7">Last 7 Days</option>
          <option value="14">Last 14 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      <button
        className="summary-button"
        onClick={fetchSummary}
        disabled={isSummaryLoading}
      >
        {isSummaryLoading ? <LoadingSpinner /> : 'View Summary'}
      </button>

      {error && <p className="error-message">{error}</p>}

      {summary && (
        <div className="summary-container">
          <h3 onClick={() => setIsSummaryOpen(!isSummaryOpen)} className="summary-toggle">
            Summary {isSummaryOpen ? '▲' : '▼'}
          </h3>
          {isSummaryOpen && <p>{summary}</p>}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner />
          <p>Loading mood data...</p>
        </div>
      ) : (
        <div className="charts-container">
          <div className="chart-container">
            <h3>Mood Trends</h3>
            <Line data={moodLineChartData} options={lineChartOptions} />
          </div>

          <div className="chart-container">
            <h3>Sentiment Trends</h3>
            <Line data={sentimentLineChartData} options={lineChartOptions} />
          </div>

          <div className="chart-container">
            <h3>Mood Distribution</h3>
            <Pie data={moodPieChartData} options={pieChartOptions} />
          </div>

          <div className="chart-container">
            <h3>Sentiment Distribution</h3>
            <div className="sentiment-pie-chart">
              <Pie data={sentimentPieChartData} options={pieChartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;