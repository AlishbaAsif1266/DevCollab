import React, { useState } from 'react';
import { User, Sparkles, Github, Linkedin, Globe, Shield, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import API from '../services/api';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user, updateUser } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills ? user.skills.join(', ') : '',
    githubUrl: user?.githubUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    experienceLevel: user?.experienceLevel || 'Mid-Level',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await API.put('/auth/profile', formData);
      if (res.data.success) {
        updateUser(res.data.user);
        setSuccess('Profile updated successfully in MongoDB database!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Header card */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/80 border border-slate-800 rounded-3xl p-8 mb-8 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                {user?.role === 'project_owner' ? 'Project Owner' : user?.experienceLevel || 'Developer'}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Status Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center space-x-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <span>Edit Developer Profile</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Experience Level
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
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
                Technical Skills (Comma separated)
              </label>
              <div className="relative">
                <Sparkles className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, MongoDB, Express, Socket.IO"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Developer Bio
              </label>
              <textarea
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Share your experience, preferred tech stack, and what kind of projects you want to build..."
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  GitHub Profile URL
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <Linkedin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Portfolio / Website
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://myportfolio.dev"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
