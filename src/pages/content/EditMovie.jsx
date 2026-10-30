import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { movieService } from '../../services/movieService';

const genres = [
  'ACTION',
  'COMEDY',
  'DRAMA',
  'HORROR',
  'THRILLER',
  'ROMANCE',
  'DOCUMENTRY',
  'ANIMATION',
  'SCI_FI'
];

export default function EditMovie() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      genre: 'ACTION'
    }
  });

  useEffect(() => {
    let active = true;

    const loadMovie = async () => {
      try {
        setLoading(true);
        setRequestError('');
        const movie = await movieService.getMovieById(movieId);

        if (active) {
          reset({
            title: movie.title ?? '',
            description: movie.description ?? '',
            genre: movie.genre ?? 'ACTION'
          });
        }
      } catch (error) {
        console.error('Failed to load movie:', error);
        if (active) setRequestError('Failed to load the movie details.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMovie();

    return () => {
      active = false;
    };
  }, [movieId, reset]);

  const onSubmit = async (data) => {
    try {
      setRequestError('');
      await movieService.updateMovie({
        id: movieId,
        title: data.title,
        description: data.description,
        genre: data.genre
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to update movie:', error);
      setRequestError('Failed to update the movie. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-sm text-gray-400 hover:text-white">
          &larr; Back to Browse
        </Link>

        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white">Edit Movie</h1>
          <p className="mt-2 text-sm text-gray-400">Update the title, description, and genre.</p>

          {requestError && (
            <div className="mt-6 rounded border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {requestError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                id="title"
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
              {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                rows="6"
                {...register('description')}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label htmlFor="genre" className="block mb-2 text-sm font-medium text-gray-300">
                Genre
              </label>
              <select
                id="genre"
                {...register('genre', { required: 'Genre is required' })}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              {errors.genre && <p className="mt-1 text-sm text-red-400">{errors.genre.message}</p>}
            </div>

            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
              <Link
                to="/"
                className="rounded-md border border-gray-700 px-5 py-3 text-center text-sm font-semibold text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
