import axiosInstance from '../api/axiosInstance';

export const streamingService = {
  getStreamingUrl: async (movieId) => {
    // Routes through API Gateway (Port 8080) -> Streaming Service (Port 8084)
    const response = await axiosInstance.get(`/stream/${movieId}`);
    return response.data;
  }
};