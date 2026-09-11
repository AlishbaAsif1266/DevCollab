import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Code2,
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  X,
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getSocket } from '../services/socket';

export default function ProjectResources({ projectId, isOwnerOrLead }) {
  const { user } = useAuthStore();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'link',
    url: '',
    content: '',
    language: 'javascript',
    description: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      let query = `/projects/${projectId}/resources?type=${filterType}`;
      if (search) query += `&search=${search}`;
      const res = await API.get(query);
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error('Failed to fetch project resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();

    const socket = getSocket();
    if (socket) {
      socket.on('resource_created', (newResource) => {
        setResources((prev) => [newResource, ...prev.filter((r) => r._id !== newResource._id)]);
      });

      socket.on('resource_deleted', (deletedId) => {
        setResources((prev) => prev.filter((r) => r._id !== deletedId));
      });
    }

    return () => {
      if (socket) {
        socket.off('resource_created');
        socket.off('resource_deleted');
      }
    };
  }, [projectId, filterType, search]);

  const handleCopyCode = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await API.post(`/projects/${projectId}/resources`, formData);
      if (res.data.success) {
        setResources([res.data.resource, ...resources]);
        setIsModalOpen(false);
        setFormData({
          title: '',
          type: 'link',
          url: '',
          content: '',
          language: 'javascript',
          description: '',
          tags: '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to remove this resource?')) return;
    try {
      const res = await API.delete(`/projects/${projectId}/resources/${id}`);
      if (res.data.success) {
        setResources((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete resource:', err);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'snippet':
        return <Code2 className="w-5 h-5 text-indigo-400" />;
      case 'document':
        return <FileText className="w-5 h-5 text-purple-400" />;
      case 'file':
        return <FileText className="w-5 h-5 text-emerald-400" />;
      default:
        return <LinkIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span>Project Resources Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Share API documentation, code snippets, environment links, and developer guides
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'link', label: 'Links' },
            { id: 'snippet', label: 'Code Snippets' },
            { id: 'document', label: 'Docs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search resource title or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 animate-pulse h-48"></div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
          <Code2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Resources Found</h3>
          <p className="text-slate-500 text-xs mt-1 mb-4">Add your first code snippet or documentation link.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            Create Resource Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((res) => {
            const isCreatorOrLead =
              res.createdBy?._id === user?._id || isOwnerOrLead;

            return (
              <div
                key={res._id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between transition group shadow-xl"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                        {getIconForType(res.type)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                          {res.type}
                        </span>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition mt-1">
                          {res.title}
                        </h3>
                      </div>
                    </div>

                    {isCreatorOrLead && (
                      <button
                        onClick={() => handleDeleteResource(res._id)}
                        className="text-slate-600 hover:text-rose-400 p-1.5 transition opacity-0 group-hover:opacity-100"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {res.description && (
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">{res.description}</p>
                  )}

                  {/* Snippet Code View */}
                  {res.type === 'snippet' && res.content && (
                    <div className="mb-4 bg-slate-950 border border-slate-800 rounded-2xl p-4 relative group/code font-mono text-xs overflow-x-auto max-h-56">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-500">
                        <span className="uppercase font-bold text-indigo-400">{res.language || 'code'}</span>
                        <button
                          onClick={() => handleCopyCode(res._id, res.content)}
                          className="flex items-center space-x-1 text-slate-400 hover:text-white transition"
                        >
                          {copiedId === res._id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-slate-200 leading-relaxed">
                        <code>{res.content}</code>
                      </pre>
                    </div>
                  )}

                  {/* External Link Button */}
                  {res.url && (
                    <div className="mb-4">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-2 rounded-xl transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="truncate max-w-xs">{res.url}</span>
                      </a>
                    </div>
                  )}

                  {/* Tags */}
                  {res.tags && res.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {res.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer metadata */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Shared by {res.createdBy?.name || 'Developer'}</span>
                  <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add Project Resource</h2>
                <p className="text-xs text-slate-400">Share documentation, links, or code snippets with team</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center space-x-3 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Authentication API Docs or Database Helper Snippet"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="link">Web Link</option>
                    <option value="snippet">Code Snippet</option>
                    <option value="document">Documentation</option>
                    <option value="file">File Resource</option>
                  </select>
                </div>

                {formData.type === 'snippet' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
                    >
                      <option value="javascript">JavaScript / Node</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="html">HTML / CSS</option>
                      <option value="json">JSON</option>
                      <option value="sql">SQL</option>
                      <option value="bash">Bash / Shell</option>
                    </select>
                  </div>
                )}
              </div>

              {formData.type !== 'snippet' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Resource URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://docs.myapi.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              )}

              {formData.type === 'snippet' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Code Content *
                  </label>
                  <textarea
                    rows="5"
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Paste code snippet here..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none"
                  ></textarea>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide context or instructions for using this resource..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="API, Auth, Database"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Save Resource</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
