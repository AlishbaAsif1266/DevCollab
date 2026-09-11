import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FolderGit2,
  CheckSquare,
  Code2,
  Trash2,
  UserCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

export default function AdminModeration() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin moderation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setMessage(null);
    setError(null);
    try {
      const res = await API.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        setMessage(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the platform?'))
      return;
    setMessage(null);
    setError(null);
    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setMessage('User removed from platform successfully.');
        fetchAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove user');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4" />
              <span>Platform Administration & Governance</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Platform Moderation Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Oversee platform users, manage permissions & role hierarchy, and monitor workspace telemetry.
            </p>
          </div>

          <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-xl">
            Admin Authenticated: {user?.name}
          </span>
        </div>

        {/* Status Feedback */}
        {message && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center space-x-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Platform Stat Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</span>
                <h3 className="text-2xl font-bold text-white mt-1 font-mono">{stats.totalUsers}</h3>
              </div>
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Workspaces</span>
                <h3 className="text-2xl font-bold text-white mt-1 font-mono">{stats.totalProjects}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                <FolderGit2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Kanban Tasks</span>
                <h3 className="text-2xl font-bold text-white mt-1 font-mono">{stats.totalTasks}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Resources Shared</span>
                <h3 className="text-2xl font-bold text-white mt-1 font-mono">{stats.totalResources}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Code2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Registered Users Table */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <span>User Accounts & Permissions ({users.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Role Hierarchy</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white uppercase text-xs">
                            {u.name ? u.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md font-medium">
                          {u.experienceLevel || 'Mid-Level'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-1 text-xs text-indigo-400 font-semibold focus:outline-none"
                        >
                          <option value="developer">Developer</option>
                          <option value="project_owner">Project Owner</option>
                          <option value="admin">Platform Admin</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {u._id !== user._id && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                            title="Remove User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
