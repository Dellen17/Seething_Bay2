import React, { useState, useEffect, useCallback } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { moods } from './MoodSelector';
import '../styles/MoodTracker.css';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const MoodTracker = () => {
  const [moodTrends, setMoodTrends] = useState([]);
  const [sentimentTrends, setSentimentTrends] = useState([]);
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [sentimentDistribution, setSentimentDistribution] = useState([]);
  const [timeRange, setTimeRange] = useState('7');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const navigate = useNavigate();

  const fetchMoodData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/mood-tracker/`, {
        params: { start_date: getStartDate(timeRange) },
        headers: { Authorization: `Bearer ${token}` },
      });

      setMoodTrends(response.data.mood_trends);
      setSentimentTrends(response.data.sentiment_trends);
      setMoodDistribution(response.data.mood_distribution);
      setSentimentDistribution(response.data.sentiment_distribution);
    } catch (error) {
      setError('Failed to load mood data. Please try again.');
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [timeRange, navigate]);

  const getStartDate = (range) => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - parseInt(range));
    return startDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  const fetchSummary = async () => {
    setIsSummaryLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/generate-summary/`, {
        params: { start_date: getStartDate(timeRange) },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(response.data.summary);
      setIsSummaryOpen(true);
    } catch (error) {
      setError('Failed to load summary. Please try again.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const moodColors = moods.reduce((acc, mood) => {
    acc[mood.label] = mood.color;
    return acc;
  }, {});

  const moodLineChartData = {
    labels: [...new Set(moodTrends.map((entry) => entry.date))],
    datasets: Object.keys(moodColors).map((mood) => ({
      label: mood.charAt(0).toUpperCase() + mood.slice(1),
      data: moodTrends
        .filter((entry) => entry.mood === mood)
        .map((entry) => ({ x: entry.date, y: entry.count })),
      borderColor: moodColors[mood],
      backgroundColor: `${moodColors[mood]}33`,
      tension: 0.4,
      fill: false,
    })),
  };

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

  const moodPieChartData = {
    labels: moodDistribution.map((entry) => entry.mood),
    datasets: [
      {
        data: moodDistribution.map((entry) => entry.count),
        backgroundColor: moodDistribution.map((entry) => moodColors[entry.mood] || '#9E9E9E'),
      },
    ],
  };

  const sentimentPieChartData = {
    labels: sentimentDistribution.map((entry) => entry.sentiment),
    datasets: [
      {
        data: sentimentDistribution.map((entry) => entry.count),
        backgroundColor: ['#4CAF50', '#F44336', '#9E9E9E'],
      },
    ],
  };

  // Responsive Chart Options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: window.innerWidth < 576 ? 'bottom' : 'top',
        labels: {
          color: '#fff',
          font: {
            size: window.innerWidth < 576 ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Mood and Sentiment Trends Over Time',
        color: '#fff',
        font: {
          size: window.innerWidth < 576 ? 14 : 16,
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        title: { display: true, text: 'Date', color: '#fff' },
        ticks: {
          color: '#bbb',
          font: {
            size: window.innerWidth < 576 ? 10 : 12,
          },
          maxRotation: window.innerWidth < 576 ? 45 : 0,
          minRotation: window.innerWidth < 576 ? 45 : 0,
          maxTicksLimit: window.innerWidth < 576 ? 5 : 10,
          autoSkip: true,
        },
      },
      y: {
        title: { display: true, text: 'Count', color: '#fff' },
        ticks: {
          color: '#bbb',
          font: {
            size: window.innerWidth < 576 ? 10 : 12,
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: window.innerWidth < 576 ? 'bottom' : 'bottom',
        labels: {
          color: '#fff',
          font: {
            size: window.innerWidth < 576 ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Distribution',
        color: '#fff',
        font: {
          size: window.innerWidth < 576 ? 14 : 16,
        },
      },
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
            <div className="chart-wrapper">
              <Line data={moodLineChartData} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-container">
            <h3>Sentiment Trends</h3>
            <div className="chart-wrapper">
              <Line data={sentimentLineChartData} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-container">
            <h3>Mood Distribution</h3>
            <div className="chart-wrapper">
              <Pie data={moodPieChartData} options={pieChartOptions} />
            </div>
          </div>

          <div className="chart-container">
            <h3>Sentiment Distribution</h3>
            <div className="chart-wrapper sentiment-pie-chart">
              <Pie data={sentimentPieChartData} options={pieChartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;