import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Code2, Users, LayoutDashboard, LogOut, FolderGit2, Menu, X, User, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#090a0f]/95 backdrop-blur-md border-b border-[#1e2430]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2.5 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:border-blue-400/40 group-hover:bg-blue-500/15 transition-all">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="text-base font-semibold text-white tracking-tight">
              DevCollab
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 bg-[#0e1117] p-1 border border-[#1e2430] rounded-xl">
            <Link
              to="/developers"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive('/developers')
                  ? 'bg-[#181d28] text-white border border-[#2e374a]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131720]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Developers</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive('/dashboard')
                      ? 'bg-[#181d28] text-white border border-[#2e374a]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131720]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/projects"
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive('/projects')
                      ? 'bg-[#181d28] text-white border border-[#2e374a]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131720]'
                  }`}
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Projects</span>
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/admin')
                        ? 'bg-rose-950/50 text-rose-300 border border-rose-800/40'
                        : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-2.5">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2.5 bg-[#0e1117] hover:bg-[#131720] border border-[#1e2430] hover:border-[#2e374a] px-3 py-1.5 rounded-lg transition"
                >
                  <div className="relative">
                    <div className="w-6 h-6 rounded-md bg-[#1e2430] border border-[#2e374a] flex items-center justify-center text-[11px] font-mono font-medium text-slate-200 uppercase">
                      {user?.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-[#0e1117] rounded-full"></span>
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-medium text-slate-200 leading-none">{user?.name}</span>
                    <span className="block text-[10px] font-mono text-slate-400 capitalize leading-none mt-1">
                      {user?.role === 'project_owner' ? 'Owner' : user?.experienceLevel || 'Developer'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition border border-transparent hover:border-rose-900/40"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#131720] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-medium bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white px-3.5 py-1.5 rounded-lg transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-[#131720] rounded-lg transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090a0f] border-b border-[#1e2430] px-4 pt-2 pb-5 space-y-2">
          <Link
            to="/developers"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
              isActive('/developers')
                ? 'bg-[#181d28] text-white border border-[#2e374a]'
                : 'text-slate-300 hover:bg-[#131720]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Developer Directory</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/dashboard')
                    ? 'bg-[#181d28] text-white border border-[#2e374a]'
                    : 'text-slate-300 hover:bg-[#131720]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/projects')
                    ? 'bg-[#181d28] text-white border border-[#2e374a]'
                    : 'text-slate-300 hover:bg-[#131720]'
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                <span>Projects</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/profile')
                    ? 'bg-[#181d28] text-white border border-[#2e374a]'
                    : 'text-slate-300 hover:bg-[#131720]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile ({user?.name})</span>
              </Link>

              <div className="pt-2 border-t border-[#1e2430]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-[#1e2430] flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-sm font-medium text-slate-300 hover:text-white py-2 rounded-lg bg-[#0e1117] border border-[#1e2430]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
