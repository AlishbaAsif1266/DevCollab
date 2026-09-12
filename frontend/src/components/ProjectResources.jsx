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
  X,
  Loader2,
  AlertCircle,
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
      setError(err.response?.data?.message || 'Failed to create resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Delete this project resource?')) return;

    try {
      const res = await API.delete(`/projects/${projectId}/resources/${resourceId}`);
      if (res.data.success) {
        setResources(resources.filter((r) => r._id !== resourceId));
      }
    } catch (err) {
      console.error('Failed to delete resource:', err);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'snippet':
        return <Code2 className="w-4 h-4 text-blue-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-slate-300" />;
      case 'file':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      default:
        return <LinkIcon className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1117] border border-[#1e2430] rounded-xl p-5">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>Project Resources Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Share API documentation, code snippets, environment links, and developer guides
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'link', label: 'Links' },
            { id: 'snippet', label: 'Snippets' },
            { id: 'document', label: 'Docs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterType === tab.id
                  ? 'bg-[#181d28] text-white border border-[#2e374a]'
                  : 'bg-[#0e1117] border border-[#1e2430] text-slate-400 hover:text-slate-200 hover:bg-[#131720]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search resource or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0e1117] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-5 animate-pulse h-44"></div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-10 text-center max-w-md mx-auto my-6">
          <Code2 className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
          <h3 className="text-sm font-semibold text-slate-300">No Resources Found</h3>
          <p className="text-slate-500 text-xs mt-0.5 mb-4">Add your first code snippet or documentation link.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition"
          >
            Create Resource Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res) => {
            const isCreatorOrLead =
              res.createdBy?._id === user?._id || isOwnerOrLead;

            return (
              <div
                key={res._id}
                className="bg-[#0e1117] border border-[#1e2430] hover:border-[#2e374a] rounded-xl p-5 flex flex-col justify-between transition group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-[#131720] border border-[#1e2430] rounded-lg">
                        {getIconForType(res.type)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                          {res.type}
                        </span>
                        <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition mt-1">
                          {res.title}
                        </h3>
                      </div>
                    </div>

                    {isCreatorOrLead && (
                      <button
                        onClick={() => handleDeleteResource(res._id)}
                        className="text-slate-600 hover:text-rose-400 p-1 transition opacity-0 group-hover:opacity-100"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {res.description && (
                    <p className="text-xs text-slate-400 mb-3.5 leading-relaxed">{res.description}</p>
                  )}

                  {/* Snippet Code View */}
                  {res.type === 'snippet' && res.content && (
                    <div className="mb-3.5 bg-[#090a0f] border border-[#1e2430] rounded-lg p-3 relative font-mono text-xs overflow-x-auto max-h-52">
                      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#1e2430] text-[10px] text-slate-500">
                        <span className="uppercase font-mono font-medium text-blue-400">{res.language || 'code'}</span>
                        <button
                          onClick={() => handleCopyCode(res._id, res.content)}
                          className="flex items-center space-x-1 text-slate-400 hover:text-white transition"
                        >
                          {copiedId === res._id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-slate-300 leading-relaxed font-mono text-[11px]">
                        <code>{res.content}</code>
                      </pre>
                    </div>
                  )}

                  {/* External Link Button */}
                  {res.url && (
                    <div className="mb-3.5">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-2.5 py-1.5 rounded-lg transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-xs">{res.url}</span>
                      </a>
                    </div>
                  )}

                  {/* Tags */}
                  {res.tags && res.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3.5">
                      {res.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono bg-[#131720] text-slate-400 px-1.5 py-0.5 rounded border border-[#1e2430]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer metadata */}
                <div className="pt-2.5 border-t border-[#1e2430] flex items-center justify-between text-[11px] font-mono text-slate-500">
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#181d28] transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Add Project Resource</h2>
                <p className="text-xs text-slate-400">Share documentation, links, or code snippets with team</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg flex items-center space-x-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateResource} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Authentication API Docs or Database Helper Snippet"
                  className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition"
                  >
                    <option value="link">Web Link</option>
                    <option value="snippet">Code Snippet</option>
                    <option value="document">Documentation</option>
                    <option value="file">File Resource</option>
                  </select>
                </div>

                {formData.type === 'snippet' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition"
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
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Resource URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://docs.myapi.com"
                    className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              )}

              {formData.type === 'snippet' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Code Content *
                  </label>
                  <textarea
                    rows="5"
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Paste code snippet here..."
                    className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg p-3 font-mono text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition resize-none"
                  ></textarea>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide context or instructions for using this resource..."
                  className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="API, Auth, Database"
                  className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-4 py-2 rounded-lg transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Resource</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
