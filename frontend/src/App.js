import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Rides from './pages/Rides';
import Search from './pages/Search';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/rides" element={<PrivateRoute><Rides /></PrivateRoute>} />
        <Route path="/find" element={<PrivateRoute><Search /></PrivateRoute>} />

        <Route path="/" element={<Navigate to="/rides" replace />} />
        <Route path="*" element={<Navigate to="/rides" replace />} />
      </Routes>
    </>
  );
}
