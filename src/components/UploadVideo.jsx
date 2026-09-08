import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { videoService } from '../services/videoService';

export default function UploadVideo({ movieId, onUploadComplete }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm();

  // Prevent accidental tab closure during a large video upload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitting]);

  const onSubmit = async (data) => {
    // React-hook-form stores files in FileList arrays
    const videoFile = data.videoFile[0];
    const thumbnailFile = data.thumbnailFile && data.thumbnailFile.length > 0 ? data.thumbnailFile[0] : null;

    try {
      setStatusMessage({ type: 'loading', text: 'Uploading media... Please keep this page open.' });
      
      await videoService.uploadVideo(
        movieId, 
        videoFile, 
        thumbnailFile, 
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setStatusMessage({ type: 'success', text: 'Upload complete! Encoding has started automatically.' });
      
      // Give the user a moment to see the 100% success state before redirecting
      setTimeout(() => {
        if (onUploadComplete) onUploadComplete();
      }, 2000);

    } catch (error) {
      console.error("Upload error:", error);
      const errorMsg = error.response?.data?.message || error.response?.data || 'Upload failed. Please check your connection and try again.';
      setStatusMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Step 2: Upload Media Files</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-1">Raw Video File (.mp4) *</label>
          <input 
            type="file" 
            accept="video/mp4,video/x-m4v"
            {...register('videoFile', { 
              required: 'A video file is required' 
            })}
            disabled={isSubmitting}
            className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {errors.videoFile && <p className="text-red-500 text-sm mt-1">{errors.videoFile.message}</p>}
        </div>

        <div>
          <label className="block text-gray-300 mb-1">
            Custom Thumbnail (.jpg, .png) <span className="text-gray-500 text-sm">- Optional</span>
          </label>
          <input 
            type="file" 
            accept="image/jpeg,image/png"
            {...register('thumbnailFile')}
            disabled={isSubmitting}
            className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-gray-500 text-xs mt-1">If left blank, the server will auto-generate one using FFmpeg.</p>
        </div>

        {isSubmitting && (
          <div className="w-full bg-gray-800 rounded-full h-5 mt-4 overflow-hidden border border-gray-700">
            <div 
              className="bg-blue-600 h-5 rounded-full transition-all duration-300 ease-out flex items-center justify-center text-[11px] text-white font-bold" 
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress > 5 ? `${uploadProgress}%` : ''}
            </div>
          </div>
        )}

        {statusMessage && (
          <div className={`p-4 rounded text-sm font-medium ${
            statusMessage.type === 'error' ? 'bg-red-900/30 text-red-400 border border-red-800' :
            statusMessage.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' :
            'bg-blue-900/30 text-blue-400 border border-blue-800'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Uploading to Server...' : 'Start Upload'}
        </button>
      </form>
    </div>
  );
}