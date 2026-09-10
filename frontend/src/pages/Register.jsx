import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Mail, Lock, User, Briefcase, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400 mb-3">
            <Code2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Join DevCollab
          </h2>
          <p className="text-sm text-slate-400 mt-1">Create your developer account & start collaborating</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center space-x-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Mercer"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@example.com"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                required
                minlength="6"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none transition"
              >
                <option value="developer">Developer</option>
                <option value="project_owner">Project Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Experience
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none transition"
              >
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Technical Skills (comma separated)
            </label>
            <div className="relative">
              <Sparkles className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB, Socket.IO"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Developer Bio
            </label>
            <textarea
              name="bio"
              rows="2"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell other developers about your projects & stack..."
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-slate-200 focus:outline-none transition"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
