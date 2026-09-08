import axiosInstance from '../api/axiosInstance';

export const videoService = {
  uploadVideo: async (movieId, videoFile, thumbnailFile, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', videoFile);
    
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    // Notice we DO NOT manually set Content-Type here.
    // Axios will automatically set it to multipart/form-data with the correct boundary.
    const response = await axiosInstance.post(`/videos/upload/${movieId}`, formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onUploadProgress) onUploadProgress(percentCompleted);
        }
      }
    });
    
    return response.data;
  }
};