import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Comments.css';
import { ToastContainer, toast } from 'react-toastify';
import { showSuccess, showError } from '../utils/notification';

const Comments = ({ movieId, currentUserId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const fetchComments = async () => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.get(`http://localhost:5000/api/user/comments/${movieId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setComments(response.data);
        } catch (err) {
            setError('Failed to fetch comments. Please try again.');
            console.error('Error fetching comments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (movieId) {
            fetchComments();
        } else {
            setError('Invalid movie ID');
        }
    }, [movieId]);

    const handleAddComment = async () => {
        if (newComment.trim() === '') {
            setError('Comment cannot be empty.');
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('You need to log in to add a comment.');
            return;
        }

        if (!movieId) {
            setError('Invalid movie ID.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/user/comments', {
                movieId,
                text: newComment,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data) {
                fetchComments(); 

                setNewComment('');
                setError('');
                showSuccess("Comment added successfully!");
            } else {
                throw new Error('Unexpected response from the server.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add comment. Please try again.');
            console.error('Error adding comment:', err);
            showError("Failed to add comment.");
        }
    };

    return (
        <div className="comments-container">
            <h2 className="comments-title">Comments</h2>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading-message">Loading comments...</div>
            ) : (
                <>
                    <div className="add-comment">
                        <textarea
                            className="comment-input"
                            placeholder="Write your comment here..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <button className="add-comment-btn" onClick={handleAddComment}>
                            Add Comment
                        </button>
                    </div>

                    <div className="comments-list">
                        {comments.map((comment) => (
                            <div key={comment._id} className="comment-item">
                                <div className="comment-header">
                                    <span className="username">{comment.username}</span>
                                    <span className="timestamp">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="comment-text">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <ToastContainer />
        </div>
    );
};

export default Comments;