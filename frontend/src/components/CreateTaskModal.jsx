import React, { useState } from 'react';
import { X, CheckSquare, User, Loader2, AlertCircle } from 'lucide-react';
import API from '../services/api';

export default function CreateTaskModal({ isOpen, onClose, projectId, members, onTaskCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    assignees: [],
    tags: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAssigneeToggle = (memberUserId) => {
    if (formData.assignees.includes(memberUserId)) {
      setFormData({
        ...formData,
        assignees: formData.assignees.filter((id) => id !== memberUserId),
      });
    } else {
      setFormData({
        ...formData,
        assignees: [...formData.assignees, memberUserId],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await API.post(`/projects/${projectId}/tasks`, formData);
      if (res.data.success) {
        if (onTaskCreated) onTaskCreated(res.data.task);
        onClose();
        setFormData({
          title: '',
          description: '',
          status: 'To Do',
          priority: 'Medium',
          dueDate: '',
          assignees: [],
          tags: '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
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
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Create New Task</h2>
            <p className="text-xs text-slate-400">Add task to the Kanban board with assignees and priority</p>
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
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Implement User Authentication JWT Middleware"
              className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Status Column
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Task Description
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide technical instructions or acceptance criteria..."
              className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Assign Team Members
            </label>
            <div className="flex flex-wrap gap-1.5 bg-[#090a0f] border border-[#1e2430] rounded-lg p-2.5 max-h-28 overflow-y-auto">
              {members?.map((m) => {
                const isAssigned = formData.assignees.includes(m.user._id);
                return (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => handleAssigneeToggle(m.user._id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1.5 transition ${
                      isAssigned
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#131720] border border-[#1e2430] text-slate-400 hover:text-white'
                    }`}
                  >
                    <User className="w-3 h-3" />
                    <span>{m.user.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Backend, API, Auth"
                className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Task</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
