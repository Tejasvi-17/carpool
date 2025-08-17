import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (p) => (pathname === p ? "underline font-semibold" : "");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/rides" className="text-xl font-bold">
          Carpool
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/rides"
                className={`hover:opacity-90 ${isActive("/rides")}`}
              >
                My Rides
              </Link>
              <Link
                to="/find"
                className={`hover:opacity-90 ${isActive("/find")}`}
              >
                Find a Ride
              </Link>
              <Link
                to="/profile"
                className={`hover:opacity-90 ${isActive("/profile")}`}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`hover:opacity-90 ${isActive("/login")}`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-500 px-3 py-2 rounded hover:bg-green-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
