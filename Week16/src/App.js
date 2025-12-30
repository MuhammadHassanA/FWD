import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State management using React hooks
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // API base URL
  const API_URL = 'http://localhost:5000/api/feedback';

  // Fetch all feedbacks when component mounts
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Function to fetch all feedback from backend
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      
      if (response.data.success) {
        setFeedbacks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      showNotification('Failed to load feedbacks. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!name.trim() || !message.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (name.trim().length < 2) {
      showNotification('Name must be at least 2 characters', 'error');
      return;
    }

    if (message.trim().length < 5) {
      showNotification('Message must be at least 5 characters', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      // Send POST request to backend
      const response = await axios.post(API_URL, {
        name: name.trim(),
        message: message.trim()
      });

      if (response.data.success) {
        showNotification('Feedback submitted successfully! 🎉', 'success');
        
        // Clear form fields
        setName('');
        setMessage('');
        
        // Refresh feedback list
        fetchFeedbacks();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMsg = error.response?.data?.error || 'Failed to submit feedback. Please try again.';
      showNotification(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Function to show notification messages
  const showNotification = (msg, type) => {
    setNotification({ message: msg, type });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Student Feedback Hub</h1>
        <p>We value your thoughts and suggestions</p>
      </div>

      <div className="container">
        {/* Feedback Submission Form */}
        <section className="feedback-form">
          <h2 className="form-title">Share Your Feedback</h2>
          
          {/* Notification Message */}
          {notification.message && (
            <div className={`message ${notification.type}`}>
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Feedback</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your feedback here..."
                disabled={submitting}
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Submit'}
            </button>
          </form>
        </section>

        {/* Feedback List Display */}
        <section className="feedback-list">
          <h2 className="list-title">
            Recent Feedback
            <span className="feedback-count">{feedbacks.length}</span>
          </h2>

          {loading ? (
            <div className="loading">Loading feedback...</div>
          ) : feedbacks.length === 0 ? (
            <div className="no-feedback">
              No feedback submitted yet. Be the first to share!
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback._id} className="feedback-item">
                <div className="feedback-header">
                  <span className="feedback-name">{feedback.name}</span>
                  <span className="feedback-date">
                    {formatDate(feedback.createdAt)}
                  </span>
                </div>
                <p className="feedback-message">{feedback.message}</p>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
