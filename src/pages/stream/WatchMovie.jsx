import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../../components/VideoPlayer';

export default function WatchMovie() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <button 
        onClick={() => navigate('/')} 
        className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
      >
        ← Back to Browse
      </button>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-red-600 mb-8 text-center tracking-wider">NETFLIX CLONE</h1>
        
        <VideoPlayer movieId={movieId} />
      </div>
    </div>
  );
}