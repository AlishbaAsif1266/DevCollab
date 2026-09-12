import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  ArrowRight,
  Shield,
  Mail,
  Check,
  X,
  Terminal,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { initSocket } from '../services/socket';
import API from '../services/api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [invitations, setInvitations] = useState([]);
  const [projectsCount, setProjectsCount] = useState(0);
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

  const handleAcceptInvite = async (token) => {
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
    <div className="min-h-[100dvh] bg-[#090a0f] text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Pending Invitations Alert Banner */}
        {invitations.length > 0 && (
          <div className="bg-[#0e1117] border border-blue-500/30 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-white flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Pending Workspace Invitations</span>
              </h2>
              <span className="text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                {invitations.length} pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {invitations.map((inv) => (
                <div
                  key={inv._id}
                  className="bg-[#131720] border border-[#1e2430] rounded-lg p-3.5 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-xs font-medium text-white">{inv.project?.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      From <span className="text-slate-300 font-medium">{inv.invitedBy?.name}</span> as{' '}
                      <span className="text-blue-400 font-medium">{inv.role}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleDeclineInvite(inv.token)}
                      className="p-1.5 bg-[#181d28] hover:bg-[#1e2430] text-slate-400 hover:text-white rounded-md transition"
                      title="Decline"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAcceptInvite(inv.token)}
                      className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-2.5 py-1.5 rounded-md transition flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overview Header */}
        <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Developer Workspace
            </h1>
            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              Logged in as <span className="text-slate-200 font-medium">{user?.name}</span> ({user?.email}). Manage code projects, track tasks, and collaborate with team members.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/projects"
              className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-4 py-2 rounded-lg transition flex items-center space-x-1.5"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Project Workspaces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/developers"
              className="bg-[#131720] hover:bg-[#181d28] text-slate-200 text-xs font-medium px-3.5 py-2 rounded-lg transition border border-[#1e2430] flex items-center space-x-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Developer Directory</span>
            </Link>
          </div>
        </div>

        {/* Stat Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-4.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Workspaces</span>
              <h3 className="text-2xl font-semibold text-white mt-1 font-mono">
                {loadingStats ? '...' : projectsCount}
              </h3>
            </div>
            <div className="p-2.5 bg-[#131720] border border-[#1e2430] rounded-lg text-slate-300">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-4.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Pending Invites</span>
              <h3 className="text-2xl font-semibold text-white mt-1 font-mono">
                {invitations.length}
              </h3>
            </div>
            <div className="p-2.5 bg-[#131720] border border-[#1e2430] rounded-lg text-slate-300">
              <Mail className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-4.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Experience Level</span>
              <h3 className="text-sm font-semibold text-white mt-1.5 capitalize">
                {user?.experienceLevel || 'Mid-Level'}
              </h3>
            </div>
            <div className="p-2.5 bg-[#131720] border border-[#1e2430] rounded-lg text-slate-300">
              <Shield className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-4.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Session Status</span>
              <h3 className="text-xs font-medium text-emerald-400 mt-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Online & Connected
              </h3>
            </div>
            <div className="p-2.5 bg-[#131720] border border-[#1e2430] rounded-lg text-slate-300">
              <Activity className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Tech Stack Skills Badges */}
        <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-white mb-3.5 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>Developer Tech Stack</span>
          </h2>

          <div className="flex flex-wrap gap-2">
            {user?.skills && user.skills.length > 0 ? (
              user.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono bg-[#131720] text-slate-300 px-2.5 py-1 rounded-md border border-[#1e2430]"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">
                No tech stack skills added yet. Update your profile to add skills.
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
