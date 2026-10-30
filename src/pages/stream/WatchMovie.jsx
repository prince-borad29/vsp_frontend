
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../../components/VideoPlayer';
import MovieReviews from '../../components/MoviewReviews';

export default function WatchMovie() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setUser(null);
          return;
        }

        const response = await fetch(
          'http://localhost:8080/api/v1/auth/get-current-user',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },  
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`);
        }

        const currentUser = await response.json();

        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
      >
        ← Back to Browse
      </button>

      <div className="max-w-5xl mx-auto">
        <VideoPlayer movieId={movieId} />

        {!loadingUser && (
          <MovieReviews
            movieId={movieId}
            currentUser={user}
          />
        )}
      </div>
    </div>
  );
}
