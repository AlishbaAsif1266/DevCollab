import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Mail, Lock, User, Terminal, AlertCircle, Loader2 } from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
    experienceLevel: 'Mid-Level',
    skills: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await API.post('/auth/register', formData);
      if (res.data.success) {
        setAuth(res.data.user, res.data.accessToken || res.data.token, res.data.refreshToken);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#090a0f] text-slate-100 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-[#0e1117] border border-[#1e2430] rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-7 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
            <Code2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Create DevCollab Account
          </h1>
          <p className="text-xs text-slate-400 mt-1">Connect with developers and manage project workspaces</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-center space-x-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Mercer"
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@example.com"
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                required
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition"
              >
                <option value="developer">Developer</option>
                <option value="project_owner">Project Owner</option>
                <option value="admin">Platform Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Experience
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition"
              >
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Technical Skills (comma separated)
            </label>
            <div className="relative">
              <Terminal className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, TypeScript, PostgreSQL"
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Developer Bio
            </label>
            <textarea
              name="bio"
              rows="2"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Full-stack engineer interested in distributed systems and devtools..."
              className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 text-xs"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
