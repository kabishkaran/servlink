import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); setProfileOpen(false); };

  return (
    <nav className="bg-dark text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">ServLink</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className="text-gray-300 hover:text-white transition text-sm font-medium">Browse</Link>
            <Link to="/provider/register" className="text-gray-300 hover:text-white transition text-sm font-medium">Become a Provider</Link>
            {user ? (
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-dark-800 hover:bg-dark-600 px-3 py-1.5 rounded-full text-sm transition">
                  <div className="w-6 h-6 bg-primary-400 rounded-full flex items-center justify-center text-xs font-semibold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden z-50 text-gray-800">
                    <Link to={user.role === "provider" ? "/provider/dashboard" : "/profile"}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm text-red-600">
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium transition">Sign in</Link>
                <Link to="/register" className="bg-primary-400 hover:bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium transition">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu btn */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-dark-800 py-4 space-y-3">
            <Link to="/search" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white text-sm py-1">Browse</Link>
            <Link to="/provider/register" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white text-sm py-1">Become a Provider</Link>
            {user ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block text-red-400 text-sm py-1">Sign out</button>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-gray-300 text-sm">Sign in</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="bg-primary-400 text-white px-4 py-1.5 rounded-full text-sm">Sign up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
