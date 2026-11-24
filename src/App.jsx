import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './redux/auth/authSlice'; 

import Home from './pages/home/Home';
import AddMovie from './pages/content/AddMovie';
import EditMovie from './pages/content/EditMovie';
import WatchMovie from './pages/stream/WatchMovie';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Profile from './components/Profile'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import ForgotPassword from './components/ForgotPassword';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <BrowserRouter>
      <nav className="bg-gray-950 border-b border-gray-800 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-extrabold text-red-600 tracking-wider">
              VSP
            </Link>
            {isAuthenticated && (
            <div className="hidden md:flex gap-6">
              <Link to="/" className="text-gray-300 hover:text-white font-semibold transition-colors">
                Browse
              </Link>
              {user?.role === 'ROLE_ADMIN' && (
                <Link to="/add-movie" className="text-gray-300 hover:text-white font-semibold transition-colors">
                  Upload
                </Link>
              )}
            </div>
            )}
          </div>
          
          <div>
            {isAuthenticated && (
              <div className="flex items-center gap-6">
                {/* Greeting */}
                <span className="text-gray-300 text-sm hidden sm:block">Hello, {user?.name}</span>
                
                {/* NEW: Profile Link */}
                <Link to="/profile" className="text-gray-300 hover:text-white font-semibold transition-colors">
                  Profile
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition-colors border border-gray-700"
                >
                  Logout
                </button>
              </div>
             )}
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/watch/:movieId" 
            element={
              <ProtectedRoute>
                <WatchMovie />
              </ProtectedRoute>
            } 
          />

          {/* NEW: Profile Protected Route */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/add-movie" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AddMovie />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/edit-movie/:movieId"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EditMovie />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <Link to="/" className="text-blue-500 hover:underline">Return Home</Link>
            </div>
          } />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;