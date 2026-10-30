import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { movieService } from '../../services/movieService';
import { videoService } from '../../services/videoService';

export default function AddMovie() {
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      genre: 'ACTION',
      releaseYear: new Date().getFullYear(),
      durationInMinutes: 0
    }
  });

  const genres = ["ACTION", "COMEDY", "DRAMA", "HORROR", "THRILLER", "ROMANCE", "DOCUMENTRY", "ANIMATION", "SCI_FI"];

  // Warn user if they try to close the tab during a massive video upload
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
    try {
      const videoFile = data.videoFile[0];
      const thumbnailFile = data.thumbnailFile && data.thumbnailFile.length > 0 ? data.thumbnailFile[0] : null;

      // ADD THE MISSING FIELDS HERE
      const metadata = {
        title: data.title,
        description: data.description,
        genre: data.genre,
        releaseYear: data.releaseYear,
        durationInMinutes: data.durationInMinutes,
        rating: 0.0,         // <-- Prevents the 'null' to 'double' crash
        director: data.director || "Unknown", 
        cast: data.cast || "Unknown"
      };

      setStatusMessage({ type: 'loading', text: 'Step 1/2: Saving movie details to database...' });
      const movieResponse = await movieService.createMovieRecord(metadata);
      
      // Extract ID (adjust if your backend wraps it differently, e.g., movieResponse.data.id)
      const createdMovieId = movieResponse.id; 
      
      if (!createdMovieId) {
        throw new Error("Backend did not return a valid Movie ID.");
      }

      // 3. Step 2: Upload Video to Video Service
      setStatusMessage({ type: 'loading', text: `Step 2/2: Uploading media... Please keep page open.` });
      await videoService.uploadVideo(
        createdMovieId, 
        videoFile, 
        thumbnailFile, 
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // CHANGE HERE: Make the message explicit about the background process
      setStatusMessage({ type: 'success', text: '✅ Upload complete! The video is now processing in the background. It will appear on the Home screen shortly.' });
      
      // Redirect to Home after success
      setTimeout(() => navigate('/'), 3000);

    } catch (error) {
      console.error("Submission error:", error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to complete process.';
      setStatusMessage({ type: 'error', text: `❌ ${errorMsg}` });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gray-950 min-h-screen mt-8 border border-gray-800 rounded-lg shadow-2xl">
      <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-red-600 pl-4">Add New Movie</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* METADATA SECTION */}
        <div className="bg-gray-900 p-6 rounded-md border border-gray-800 space-y-4">
          <h2 className="text-red-500 font-semibold mb-4 text-sm tracking-widest uppercase">Movie Details</h2>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Title *</label>
            <input 
              type="text" 
              {...register('title', { required: 'Title is required' })}
              disabled={isSubmitting}
              className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-red-500 outline-none" 
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Description *</label>
            <textarea 
              {...register('description', { required: 'Description is required' })}
              disabled={isSubmitting}
              className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 h-24 focus:border-red-500 outline-none" 
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Genre *</label>
              <select 
                {...register('genre')}
                disabled={isSubmitting}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-red-500 outline-none"
              >
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Release Year *</label>
              <input 
                type="number" 
                {...register('releaseYear', { 
                  required: 'Required',
                  valueAsNumber: true,
                  min: { value: 1888, message: "Invalid year" }
                })}
                disabled={isSubmitting}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-red-500 outline-none" 
              />
              {errors.releaseYear && <p className="text-red-500 text-xs mt-1">{errors.releaseYear.message}</p>}
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Duration (Min) *</label>
              <input 
                type="number" 
                {...register('durationInMinutes', { 
                  required: 'Required',
                  valueAsNumber: true,
                  min: { value: 1, message: "Too short" }
                })}
                disabled={isSubmitting}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-red-500 outline-none" 
              />
              {errors.durationInMinutes && <p className="text-red-500 text-xs mt-1">{errors.durationInMinutes.message}</p>}
            </div>
          </div>
        </div>

        {/* MEDIA UPLOAD SECTION */}
        <div className="bg-gray-900 p-6 rounded-md border border-gray-800 space-y-4">
          <h2 className="text-red-500 font-semibold mb-4 text-sm tracking-widest uppercase">Media Files</h2>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Raw Video File (.mp4) *</label>
            <input 
              type="file" 
              accept="video/mp4,video/x-m4v"
              {...register('videoFile', { required: 'A video file is required' })}
              disabled={isSubmitting}
              className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer disabled:opacity-50"
            />
            {errors.videoFile && <p className="text-red-500 text-xs mt-1">{errors.videoFile.message}</p>}
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Custom Thumbnail <span className="text-gray-500">- Optional</span>
            </label>
            <input 
              type="file" 
              accept="image/jpeg,image/png"
              {...register('thumbnailFile')}
              disabled={isSubmitting}
              className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer disabled:opacity-50"
            />
            <p className="text-gray-500 text-[10px] mt-1">If blank, FFmpeg generates one automatically.</p>
          </div>
        </div>

        {/* STATUS & PROGRESS */}
        {statusMessage && (
          <div className={`p-4 rounded-md text-sm font-medium ${
            statusMessage.type === 'error' ? 'bg-red-950/50 text-red-400 border border-red-900' :
            statusMessage.type === 'success' ? 'bg-green-950/50 text-green-400 border border-green-900' :
            'bg-blue-950/50 text-blue-400 border border-blue-900'
          }`}>
            {statusMessage.text}
          </div>
        )}

        {isSubmitting && uploadProgress > 0 && (
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700">
            <div 
              className="bg-red-600 h-4 rounded-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] text-white font-bold" 
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress > 5 ? `${uploadProgress}%` : ''}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-md transition-colors disabled:opacity-50 shadow-lg hover:shadow-red-900/50"
        >
          {isSubmitting ? 'Processing Upload...' : 'Add Movie & Upload'}
        </button>
      </form>
    </div>
  );
}