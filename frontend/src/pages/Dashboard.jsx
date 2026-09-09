import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, FolderGit2, Sparkles, CheckCircle2, ArrowRight, Shield, Mail, Check, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { initSocket } from '../services/socket';
import API from '../services/api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [invitations, setInvitations] = useState([]);

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

  useEffect(() => {
    if (user?._id) {
      const socket = initSocket();
      socket.emit('setup_user', user._id);

      socket.on('project_invite', (data) => {
        fetchInvitations();
      });
    }

    fetchInvitations();
  }, [user]);

  const handleAcceptInvite = async (token, projectId) => {
    try {
      const res = await API.post(`/invitations/accept/${token}`);
      if (res.data.success) {
        fetchInvitations();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Pending Invitations Banner */}
        {invitations.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              <span>Pending Project Workspace Invitations ({invitations.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((inv) => (
                <div
                  key={inv._id}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-base font-bold text-white">{inv.project?.title}</h3>
                    <p className="text-xs text-slate-400">
                      Invited by <span className="text-slate-200">{inv.invitedBy?.name}</span> as{' '}
                      <span className="text-indigo-400 font-semibold">{inv.role}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeclineInvite(inv.token)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
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

        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-slate-900 border border-slate-800 rounded-3xl p-8 mb-8 backdrop-blur-xl shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Developer Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Welcome back, {user?.name || 'Developer'}!
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
