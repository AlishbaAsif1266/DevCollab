import React, { useState, useEffect } from 'react';
import { Shield, Users, FolderGit2, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

export default function AdminModeration() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, statsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/stats'),
      ]);

      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch administration telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await API.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setMessage('Role updated successfully.');
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) {
      return;
    }

    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setMessage('User deleted successfully.');
        setUsers(users.filter((u) => u._id !== userId));
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#090a0f] text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Banner Header */}
        <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-mono text-[11px] font-medium uppercase tracking-wider mb-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Administration & Governance</span>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Platform Moderation</h1>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              Oversee platform users, manage permissions and role hierarchy, and monitor workspace telemetry.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-300 bg-[#131720] border border-[#1e2430] px-3.5 py-1.5 rounded-lg self-start md:self-auto">
            Admin: {user?.name}
          </span>
        </div>

        {/* Status Feedback */}
        {message && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center space-x-2.5 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-center space-x-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Platform Stat Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-4.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Users</span>
                <h3 className="text-2xl font-semibold text-white mt-1 font-mono">{stats.totalUsers}</h3>
              </div>
              <div className="p-2.5 bg-[#131720] border border-[#1e2430] rounded-lg text-slate-300">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-4.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Workspaces</span>
                <h3 className="text-2xl font-semibold text-white mt-1 font-mono">{stats.totalProjects}</h3>
              </div>
              <div className="p-2.5 bg-[#131720] border border-[#1e2430] rounded-lg text-slate-300">
                <FolderGit2 className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-4.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Project Owners</span>
                <h3 className="text-2xl font-semibold text-white mt-1 font-mono">{stats.roleDistribution?.project_owner || 0}</h3>
              </div>
              <div className="p-2.5 bg-[#131720] border border-[#1e2430] rounded-lg text-slate-300">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-4.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Engineers</span>
                <h3 className="text-2xl font-semibold text-white mt-1 font-mono">{stats.roleDistribution?.developer || 0}</h3>
              </div>
              <div className="p-2.5 bg-[#131720] border border-[#1e2430] rounded-lg text-slate-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* User Roster Table */}
        <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Platform User Directory</span>
          </h2>

          {loading ? (
            <div className="py-12 flex items-center justify-center space-x-2 text-slate-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span>Loading telemetry...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#131720] text-slate-400 uppercase font-mono text-[11px] border-b border-[#1e2430]">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Role Hierarchy</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2430]">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-[#131720]/60 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 rounded-md bg-[#181d28] border border-[#2e374a] flex items-center justify-center font-mono font-medium text-slate-200 uppercase text-[11px]">
                            {u.name ? u.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-white">{u.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="bg-[#131720] text-slate-300 border border-[#1e2430] px-2 py-0.5 rounded text-[11px] font-mono">
                          {u.experienceLevel || 'Mid-Level'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-md px-2.5 py-1 text-xs text-blue-400 font-medium focus:outline-none transition"
                        >
                          <option value="developer">Developer</option>
                          <option value="project_owner">Project Owner</option>
                          <option value="admin">Platform Admin</option>
                        </select>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {u._id !== user._id && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-md transition"
                            title="Remove User Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
