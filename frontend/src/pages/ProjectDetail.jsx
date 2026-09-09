import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  Github,
  ExternalLink,
  Shield,
  Plus,
  Trash2,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
} from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import { initSocket, getSocket } from '../services/socket';
import Navbar from '../components/Navbar';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Member Invite State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.project);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();

    // Socket.IO Room Joining
    const socket = initSocket();
    socket.emit('join_project', id);

    return () => {
      const sock = getSocket();
      if (sock) {
        sock.emit('leave_project', id);
      }
    };
  }, [id]);

  const isOwner = project?.owner?._id === user?._id;
  const userMember = project?.members?.find((m) => m.user._id === user?._id);
  const isOwnerOrLead = isOwner || ['Owner', 'Lead'].includes(userMember?.role);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await API.post(`/invitations/projects/${id}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setInviteEmail('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await API.delete(`/projects/${id}/members/${memberUserId}`);
      if (res.data.success) {
        setProject(res.data.project);
        setMessage('Member removed from project');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleRoleChange = async (memberUserId, newRole) => {
    try {
      const res = await API.put(`/projects/${id}/members/${memberUserId}`, {
        role: newRole,
      });
      if (res.data.success) {
        setProject(res.data.project);
        setMessage('Member role updated successfully');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update member role');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project workspace? This action cannot be undone.'))
      return;
    try {
      const res = await API.delete(`/projects/${id}`);
      if (res.data.success) {
        navigate('/projects');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto my-12 text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Project Not Found</h3>
          <p className="text-slate-400 text-sm mb-6">{error || 'You may not have permission to view this project.'}</p>
          <Link to="/projects" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Back Link */}
        <Link
          to="/projects"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white text-xs font-medium mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        {/* Project Header Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-lg">
                  {project.category}
                </span>
                <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  {project.status}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-white mb-2">{project.title}</h1>
              <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">{project.description}</p>
            </div>

            {/* Actions & External Links */}
            <div className="flex flex-wrap items-center gap-3">
              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center space-x-2 transition"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}

              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-indigo-500/30 flex items-center space-x-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Demo</span>
                </a>
              )}

              {isOwner && (
                <button
                  onClick={handleDeleteProject}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center space-x-2 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {message && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center space-x-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Workspace Tabs */}
        <div className="border-b border-slate-800 mb-8 flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`pb-4 text-sm font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'members'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Members ({project.members?.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">Project Description</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">Tech Stack & Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack?.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-800 text-slate-200 px-3 py-1 rounded-xl border border-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Owner Details */}
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Project Owner
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                    {project.owner?.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{project.owner?.name}</h4>
                    <p className="text-xs text-slate-400">{project.owner?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Team Members & RBAC */}
        {activeTab === 'members' && (
          <div className="space-y-8">
            {/* Invite Form (Owner or Lead only) */}
            {isOwnerOrLead && (
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  <span>Invite Developer to Team</span>
                </h3>

                <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="Enter developer's email address..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                    />
                  </div>

                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Lead">Lead</option>
                    <option value="Viewer">Viewer</option>
                  </select>

                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {inviteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Add Member</span>}
                  </button>
                </form>
              </div>
            )}

            {/* Members List */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Team Members</h3>

              <div className="divide-y divide-slate-800">
                {project.members?.map((m) => (
                  <div key={m._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                        {m.user?.name ? m.user.name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{m.user?.name}</h4>
                        <p className="text-xs text-slate-400">{m.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Role selection for owner */}
                      {isOwner && m.user._id !== project.owner._id ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.user._id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-indigo-400 font-semibold focus:outline-none"
                        >
                          <option value="Lead">Lead</option>
                          <option value="Developer">Developer</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full">
                          {m.role}
                        </span>
                      )}

                      {/* Remove member button */}
                      {isOwnerOrLead && m.user._id !== project.owner._id && (
                        <button
                          onClick={() => handleRemoveMember(m.user._id)}
                          className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                          title="Remove Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
