import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ratingEnumToNumber = {
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    'FOUR': 4,
    'FIVE': 5
};

export default function MovieReviews({ movieId, currentUser }) {
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState('FIVE');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [movieId]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/review/movie/${movieId}`);
            setReviews(response.data);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8080/api/v1/review', 
                { 
                    movieId: movieId, 
                    comment: comment, 
                    rating: rating, 
                    reviewerId: currentUser.id,
                    reviewerName: currentUser.name
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setReviews([response.data, ...reviews]);
            setComment('');
            setRating('FIVE');
        } catch (error) {
            console.error("Failed to add review", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/v1/review/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setReviews(reviews.filter(review => review.id !== reviewId));
        } catch (error) {
            console.error("Failed to delete review", error);
        }
    };

    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'ROLE_ADMIN';

    // Helper to format the date nicely
    const formatDate = (dateString) => {
        if (!dateString) return 'Just now';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="mt-12 mb-16 max-w-4xl mx-auto text-white">
            <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
                <h3 className="text-3xl font-extrabold tracking-tight">User Reviews</h3>
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                    {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </span>
            </div>

            {/* Add Review Form */}
            {currentUser ? (
                <div className="mb-10 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                    <form onSubmit={handleAddReview}>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full flex items-center justify-center font-bold shadow-md">
                                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-200">Rate this movie</span>
                                <select 
                                    value={rating} 
                                    onChange={(e) => setRating(e.target.value)}
                                    className="bg-transparent text-yellow-400 font-bold focus:outline-none cursor-pointer mt-1"
                                >
                                    <option value="FIVE">★★★★★ (5/5)</option>
                                    <option value="FOUR">★★★★☆ (4/5)</option>
                                    <option value="THREE">★★★☆☆ (3/5)</option>
                                    <option value="TWO">★★☆☆☆ (2/5)</option>
                                    <option value="ONE">★☆☆☆☆ (1/5)</option>
                                </select>
                            </div>
                        </div>
                        <textarea
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you think of the movie?"
                            className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-4 rounded-lg mb-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition resize-none placeholder-gray-500"
                            rows="3"
                        ></textarea>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isLoading || !comment.trim()}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-8 py-2.5 rounded-lg font-semibold tracking-wide transition-colors shadow-md"
                            >
                                {isLoading ? 'Posting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="mb-10 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center shadow-lg">
                    <h4 className="text-xl font-semibold mb-2">Have you seen this movie?</h4>
                    <p className="text-gray-400 mb-4">Log in to share your thoughts with the community.</p>
                    {/* You can replace this with an actual Link to your login page */}
                    <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold transition">
                        Sign In to Review
                    </button>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-lg">No reviews yet. Be the first to review this movie!</p>
                    </div>
                ) : (
                    reviews.map((review) => {
                        const starCount = ratingEnumToNumber[review.rating] || 0;
                        const emptyStarCount = 5 - starCount;
                        const initial = (review.reviewerName || 'A').charAt(0).toUpperCase();

                        return (
                            <div key={review.id} className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex gap-5 hover:bg-gray-800 transition-colors">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-300 text-lg shadow-inner">
                                        {initial}
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-100 text-lg">
                                                {review.reviewerName || 'Anonymous'}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1 mb-3">
                                                <div className="flex text-sm">
                                                    <span className="text-yellow-400">{'★'.repeat(starCount)}</span>
                                                    <span className="text-gray-600">{'★'.repeat(emptyStarCount)}</span>
                                                </div>
                                                <span className="text-gray-500 text-xs font-medium">
                                                    {formatDate(review.posted_at)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Admin Delete Icon */}
                                        {isAdmin && (
                                            <button 
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Review"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    
                                    <p className="text-gray-300 leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}