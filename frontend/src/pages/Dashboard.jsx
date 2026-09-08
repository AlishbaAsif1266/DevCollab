import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, FolderGit2, Sparkles, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { initSocket } from '../services/socket';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?._id) {
      const socket = initSocket();
      socket.emit('setup_user', user._id);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-slate-900 border border-slate-800 rounded-3xl p-8 mb-8 backdrop-blur-xl shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Developer Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Welcome back, {user?.name || 'Developer'}! 👋
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Collaborate on projects, manage tasks with real-time updates, and discover developers in your workspace.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/developers"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Users className="w-4 h-4" />
                <span>Explore Developers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* User Profile Card Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Role & Level</span>
              <h3 className="text-xl font-bold text-white mt-1 capitalize">
                {user?.role === 'project_owner' ? 'Project Owner' : user?.experienceLevel || 'Developer'}
              </h3>
              <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Verified Developer
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Shield className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Primary Skills</span>
              <h3 className="text-xl font-bold text-white mt-1">
                {user?.skills?.length ? `${user.skills.length} Skills Listed` : 'No skills set'}
              </h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {user?.skills?.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Database Status</span>
              <h3 className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Connected
              </h3>
              <p className="text-xs text-slate-400 mt-1">MongoDB `devcollab` Active</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
