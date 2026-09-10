import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  CheckSquare,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Shield,
  Mail,
  Check,
  X,
  Radio,
  Terminal,
  Activity,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { initSocket } from '../services/socket';
import API from '../services/api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [invitations, setInvitations] = useState([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchInvitations = async () => {
    try {
      const res = await API.get('/invitations/my-invitations');
      if (res.data.success) {
        setInvitations(res.data.invitations);
      }
    } catch (err) {
      console.error('Failed to fetch pending invitations:', err);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const projRes = await API.get('/projects');
      if (projRes.data.success) {
        setProjectsCount(projRes.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      const socket = initSocket();
      socket.emit('setup_user', user._id);

      socket.on('project_invite', () => {
        fetchInvitations();
      });
    }

    fetchInvitations();
    fetchStats();
  }, [user]);

  const handleAcceptInvite = async (token, projectId) => {
    try {
      const res = await API.post(`/invitations/accept/${token}`);
      if (res.data.success) {
        fetchInvitations();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to accept invitation:', err);
    }
  };

  const handleDeclineInvite = async (token) => {
    try {
      const res = await API.post(`/invitations/decline/${token}`);
      if (res.data.success) {
        fetchInvitations();
      }
    } catch (err) {
      console.error('Failed to decline invitation:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Pending Invitations Alert Banner */}
        {invitations.length > 0 && (
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>Pending Workspace Invites ({invitations.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((inv) => (
                <div
                  key={inv._id}
                  className="bg-[#090d16] border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">{inv.project?.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Invited by <span className="text-slate-200 font-medium">{inv.invitedBy?.name}</span> as{' '}
                      <span className="text-indigo-400 font-semibold">{inv.role}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeclineInvite(inv.token)}
                      className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
                      title="Decline"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAcceptInvite(inv.token, inv.project?._id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center space-x-1 shadow-md shadow-indigo-600/20"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Real-Time Workspace Session Active</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Developer Command Center
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Logged in as <span className="text-slate-200 font-semibold">{user?.name}</span> ({user?.email}). Manage code projects, track tasks, and collaborate.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-3 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Project Workspaces</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/developers"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-3 rounded-xl transition border border-slate-700 flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Developer Directory</span>
            </Link>
          </div>
        </div>

        {/* Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">My Workspaces</span>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                {loadingStats ? '...' : projectsCount}
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Invites</span>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                {invitations.length}
              </h3>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <Mail className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Experience Level</span>
              <h3 className="text-base font-bold text-white mt-1 font-mono capitalize">
                {user?.experienceLevel || 'Mid-Level'}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Database Node</span>
              <h3 className="text-base font-bold text-emerald-400 mt-1 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Active
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tech Stack Skills Badges */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>My Developer Tech Stack</span>
          </h2>

          <div className="flex flex-wrap gap-2">
            {user?.skills && user.skills.length > 0 ? (
              user.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono bg-slate-800/90 text-slate-200 px-3.5 py-1.5 rounded-xl border border-slate-700/70"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">
                No tech stack skills added yet. Update your profile to add skills!
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
