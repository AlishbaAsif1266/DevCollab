import React, { useState, useEffect } from 'react';
import { X, FolderGit2, Github, ExternalLink, Terminal, Loader2, AlertCircle } from 'lucide-react';
import API from '../services/api';

export default function EditProjectModal({ isOpen, onClose, project, onProjectUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    repositoryUrl: '',
    demoUrl: '',
    techStack: '',
    status: 'Active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        category: project.category || 'Web Development',
        repositoryUrl: project.repositoryUrl || '',
        demoUrl: project.demoUrl || '',
        techStack: project.techStack ? project.techStack.join(', ') : '',
        status: project.status || 'Active',
      });
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await API.put(`/projects/${project._id}`, formData);
      if (res.data.success) {
        if (onProjectUpdated) onProjectUpdated(res.data.project);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project workspace settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#181d28] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Edit Workspace Settings</h2>
            <p className="text-xs text-slate-400">Update project details, external links, and status</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg flex items-center space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition"
              >
                <option value="Web Development">Web Development</option>
                <option value="Mobile App">Mobile App</option>
                <option value="AI / ML">AI / ML</option>
                <option value="DevOps">DevOps</option>
                <option value="Cloud & Infra">Cloud & Infra</option>
                <option value="Open Source">Open Source</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition"
              >
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg p-3 text-xs text-slate-200 focus:outline-none transition resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>GitHub Repository URL {['Active', 'Completed', 'On Hold'].includes(formData.status) && <span className="text-rose-400">*</span>}</span>
              {['Active', 'Completed', 'On Hold'].includes(formData.status) && (
                <span className="text-[10px] text-rose-400 font-mono">Required</span>
              )}
            </label>
            <div className="relative">
              <Github className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="url"
                name="repositoryUrl"
                required={['Active', 'Completed', 'On Hold'].includes(formData.status)}
                value={formData.repositoryUrl}
                onChange={handleChange}
                placeholder="https://github.com/org/repo"
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-200 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Live Demo URL {['Active', 'Completed', 'On Hold'].includes(formData.status) && <span className="text-rose-400">*</span>}</span>
              {['Active', 'Completed', 'On Hold'].includes(formData.status) && (
                <span className="text-[10px] text-rose-400 font-mono">Required</span>
              )}
            </label>
            <div className="relative">
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="url"
                name="demoUrl"
                required={['Active', 'Completed', 'On Hold'].includes(formData.status)}
                value={formData.demoUrl}
                onChange={handleChange}
                placeholder="https://myproject.app"
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-200 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tech Stack (comma separated)
            </label>
            <div className="relative">
              <Terminal className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleChange}
                placeholder="React, Node.js, Socket.IO, MongoDB"
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-200 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-4 py-2 rounded-lg transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Settings</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
