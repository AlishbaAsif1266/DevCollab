import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      const res = await API.post('/auth/login', formData);
      if (res.data.success) {
        setAuth(res.data.user, res.data.accessToken || res.data.token, res.data.refreshToken);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400 mb-3">
            <Code2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-400 mt-1">Log in to access your projects and team workspace</p>
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
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
