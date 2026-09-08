import { useState, useEffect } from 'react';
import { movieService } from '../../services/movieService';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Your AWS S3 Bucket details based on previous configuration
  const BUCKET_NAME = "video-streaming-114324232230-ap-south-1-an";
  const REGION = "ap-south-1";

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const data = await movieService.getAllMovies();
      setMovies(data);
    } catch (err) {
      console.error("Failed to load catalog:", err);
      setError("Failed to load movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamically resolve the thumbnail URL
  const getThumbnailUrl = (movie) => {
    // If your backend Content Service saves a specific URL, use it first
    if (movie.thumbnailUrl) return movie.thumbnailUrl;
    
    // Otherwise, construct the exact path where the Encoding Service saves it
    const movieId = movie.id || movie.movieId;
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/encoded/${movieId}/thumbnail.jpg`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="text-red-500 bg-red-950/30 p-4 rounded border border-red-900">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-red-600 pl-3">
          Latest Arrivals
        </h1>

        {movies.length === 0 ? (
          <div className="text-gray-400 text-center py-20">
            No movies available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <Link 
                to={`/watch/${movie.id || movie.movieId}`} 
                key={movie.id || movie.movieId}
                className="group relative rounded-md overflow-hidden bg-gray-900 transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-red-900/20 cursor-pointer"
              >
                {/* Thumbnail Container */}
                <div className="aspect-video w-full bg-gray-800 relative">
                  <img
                    src={getThumbnailUrl(movie)}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if thumbnail is still generating or missing
                      e.target.onerror = null; 
                      e.target.src = 'https://via.placeholder.com/640x360/1f2937/4b5563?text=Processing...';
                    }}
                  />
                  
                  {/* Play Button Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/50">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>

                {/* Movie Details */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg truncate mb-1">
                    {movie.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-400 space-x-2">
                    <span className="text-green-500 font-medium">98% Match</span>
                    <span>{movie.releaseYear}</span>
                    <span className="border border-gray-600 px-1 text-[10px]">
                      {movie.genre}
                    </span>
                    {movie.durationInMinutes && (
                      <span>{movie.durationInMinutes}m</span>
                    )}
                  </div>
                  
                  {movie.description && (
                    <p className="text-gray-500 text-xs mt-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto">
                      {movie.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}