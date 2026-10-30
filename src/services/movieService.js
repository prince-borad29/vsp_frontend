import axiosInstance from '../api/axiosInstance';

export const movieService = {
  // GET /api/v1/movies (Routed through Gateway -> Content Service)
  getAllMovies: async () => {
    const response = await axiosInstance.get('/movies');
    return response.data;
  },

  // GET /api/v1/movies/{movieId}
  getMovieById: async (movieId) => {
    const response = await axiosInstance.get(`/movies/${movieId}`);
    return response.data;
  },

  // GET /api/v1/movies/search?title={title}
  searchMovies: async (title) => {
    const response = await axiosInstance.get('/movies/search', { params: { title } });
    return response.data;
  },

  // GET /api/v1/movies/genre/{genre}
  getMoviesByGenre: async (genre) => {
    const response = await axiosInstance.get(`/movies/genre/${genre}`);
    return response.data;
  },

  // POST /api/v1/movies (Enforced ROLE_ADMIN at Gateway)
  createMovieRecord: async (movieData) => {
    const response = await axiosInstance.post('/movies', movieData);
    return response.data;
  },

  // PATCH /api/v1/movie (Enforced ROLE_ADMIN at Gateway)
  updateMovie: async (movieUpdate) => {
    const response = await axiosInstance.patch('/movies', movieUpdate);
    return response.data;
  },

  // DELETE /api/v1/movies/{movieId} (Enforced ROLE_ADMIN at Gateway)
  deleteMovie: async (movieId) => {
    const response = await axiosInstance.delete(`/movies/${movieId}`);
    return response.data;
  }
};