import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Code2, Users, LayoutDashboard, LogOut, FolderGit2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-indigo-600/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-white tracking-tight">
                DevCollab
              </span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold">
                v1.0
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1.5 bg-slate-900/60 p-1 border border-slate-800/80 rounded-2xl">
            <Link
              to="/developers"
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                isActive('/developers')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Developers</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/dashboard')
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/projects"
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/projects')
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Projects</span>
                </Link>
              </>
            )}
          </div>

          {/* User Section / Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 px-3 py-1.5 rounded-xl transition"
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                      {user?.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-200 leading-none">{user?.name}</span>
                    <span className="block text-[10px] text-slate-500 capitalize leading-none mt-0.5">
                      {user?.role === 'project_owner' ? 'Owner' : user?.experienceLevel || 'Developer'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-2 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
