import { useState, useEffect } from "react";
import { movieService } from "../../services/movieService";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const BUCKET_NAME = "video-streaming-114324232230-ap-south-1-an";
  const TBUCKET_NAME = "vsp-thumbnail-images";
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

  const getThumbnailUrl = (movie) => {
    if (movie.thumbnailUrl) return movie.thumbnailUrl;
    const movieId = movie.id || movie.movieId;
    return `https://${TBUCKET_NAME}.s3.${REGION}.amazonaws.com/thumbnails/${movieId}/thumbnail.jpg`;
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
            {movies.map((movie) => {
              const status = movie.status || movie.video_status || movie.videoStatus || "AVAILABLE";
              const isPlayable = status === "AVAILABLE" || status === "READY";

              return (
                <div
                  key={movie.id || movie.movieId}
                  className={`group relative rounded-md overflow-hidden bg-gray-900 transition-transform duration-300 ${isPlayable ? "hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-red-900/20 cursor-pointer" : "opacity-75"}`}
                >
                  {isPlayable ? (
                    <Link
                      to={`/watch/${movie.id || movie.movieId}`}
                      className="block h-full w-full absolute inset-0 z-20"
                    ></Link>
                  ) : null}

                  {/* Thumbnail Container */}
                  <div className="aspect-video w-full bg-gray-800 relative">
                    <img
                      src={getThumbnailUrl(movie)}
                      alt={movie.title}
                      className={`w-full h-full object-cover ${!isPlayable ? "grayscale blur-sm" : ""}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/640x360/1f2937/4b5563?text=Processing...";
                      }}
                    />

                    {!isPlayable && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-2"></div>
                        <span className="text-white text-xs font-bold tracking-widest uppercase">
                          Processing
                        </span>
                      </div>
                    )}

                    {isPlayable && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/50">
                          <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Movie Details */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg truncate mb-2">
                      {movie.title}
                    </h3>
                    
                    {/* UPDATED: Nicely formatted metadata and rating */}
                    <div className="flex items-center text-xs text-gray-400 space-x-2">
                      <span>{movie.releaseYear}</span>
                      <span className="text-gray-600">•</span>
                      <span className="border border-gray-600 px-1.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider">
                        {movie.genre}
                      </span>
                      <span className="text-gray-600">•</span>
                      
                      {/* Rating UI */}
                      <div className={`flex items-center gap-1 font-semibold ${movie.rating > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {movie.rating > 0 && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span>{movie.rating > 0 ? movie.rating.toFixed(1) : 'NEW'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  {isAuthenticated && user?.role === "ROLE_ADMIN" && (
                    <div className="px-4 pb-4 flex justify-between relative z-30 mt-2 border-t border-gray-800 pt-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/edit-movie/${movie.id || movie.movieId}`);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium tracking-wide transition-colors"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          const movieId = movie.id || movie.movieId;

                          if (
                            window.confirm(
                              `Are you sure you want to delete "${movie.title}"? This cannot be undone.`,
                            )
                          ) {
                            try {
                              await movieService.deleteMovie(movieId);
                              setMovies((prevMovies) =>
                                prevMovies.filter(
                                  (m) => (m.id || m.movieId) !== movieId,
                                ),
                              );
                            } catch (err) {
                              console.error("Delete error:", err);
                              alert("Failed to delete movie. Please check your connection or permissions.");
                            }
                          }
                        }}
                        className="text-xs text-red-500 hover:text-red-400 font-medium tracking-wide transition-colors"
                      >
                        DELETE
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}