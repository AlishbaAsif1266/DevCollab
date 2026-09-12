import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  Github,
  ExternalLink,
  Plus,
  Trash2,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  CheckSquare,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Code2,
  Activity,
  Settings,
} from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import { initSocket, getSocket } from '../services/socket';
import Navbar from '../components/Navbar';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCommentsModal from '../components/TaskCommentsModal';
import ProjectChat from '../components/ProjectChat';
import ProjectResources from '../components/ProjectResources';
import ProjectActivityFeed from '../components/ProjectActivityFeed';
import EditProjectModal from '../components/EditProjectModal';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

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

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const res = await API.get(`/projects/${id}/tasks`);
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch project tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();

    // Real-time Socket.IO Connection & Listeners
    const socket = initSocket();
    socket.emit('join_project', id);

    socket.on('task_created', (newTask) => {
      setTasks((prevTasks) => [newTask, ...prevTasks.filter((t) => t._id !== newTask._id)]);
    });

    socket.on('task_updated', (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    });

    socket.on('task_deleted', (deletedTaskId) => {
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== deletedTaskId));
    });

    socket.on('task_comment_added', ({ taskId, task: updatedTask }) => {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === taskId ? updatedTask : t))
      );
      if (selectedTaskForComments && selectedTaskForComments._id === taskId) {
        setSelectedTaskForComments(updatedTask);
      }
    });

    return () => {
      const sock = getSocket();
      if (sock) {
        sock.off('task_created');
        sock.off('task_updated');
        sock.off('task_deleted');
        sock.off('task_comment_added');
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

  // Kanban status move handler
  const handleMoveTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await API.put(`/tasks/${taskId}`, { status: newStatus });
      if (res.data.success) {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === taskId ? res.data.task : t))
        );
      }
    } catch (err) {
      console.error('Failed to move task status:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await API.delete(`/tasks/${taskId}`);
      if (res.data.success) {
        setTasks((prevTasks) => prevTasks.filter((t) => t._id !== taskId));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const statusColumns = ['To Do', 'In Progress', 'In Review', 'Completed'];

  const getNextStatus = (currentStatus) => {
    const idx = statusColumns.indexOf(currentStatus);
    return idx < statusColumns.length - 1 ? statusColumns[idx + 1] : null;
  };

  const getPrevStatus = (currentStatus) => {
    const idx = statusColumns.indexOf(currentStatus);
    return idx > 0 ? statusColumns[idx - 1] : null;
  };

  const priorityColors = {
    Low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#090a0f] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[100dvh] bg-[#090a0f] text-slate-100 flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto my-12 text-center p-6 bg-[#0e1117] border border-[#1e2430] rounded-xl">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1.5">Project Not Found</h3>
          <p className="text-slate-400 text-xs mb-5">{error || 'You may not have permission to view this project.'}</p>
          <Link to="/projects" className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-4 py-2 rounded-lg transition inline-block">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#090a0f] text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Back Link */}
        <Link
          to="/projects"
          className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-white text-xs font-medium mb-5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>

        {/* Project Header Banner */}
        <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-medium bg-[#131720] text-slate-300 border border-[#1e2430] px-2.5 py-0.5 rounded-md">
                  {project.category}
                </span>
                <span className="text-[10px] font-mono font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {project.status}
                </span>
              </div>

              <h1 className="text-2xl font-semibold text-white tracking-tight mb-1.5">{project.title}</h1>
              <p className="text-slate-400 text-xs max-w-3xl leading-relaxed">{project.description}</p>
            </div>

            {/* Actions & External Links */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>

              {project.repositoryUrl ? (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#131720] hover:bg-[#181d28] text-slate-200 text-xs font-medium px-3 py-2 rounded-lg border border-[#1e2430] flex items-center space-x-1.5 transition"
                >
                  <Github className="w-3.5 h-3.5 text-slate-400" />
                  <span>GitHub</span>
                </a>
              ) : isOwnerOrLead ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-medium px-3 py-2 rounded-lg border border-blue-500/30 flex items-center space-x-1.5 transition"
                  title="Connect GitHub Repository"
                >
                  <Github className="w-3.5 h-3.5 text-blue-400" />
                  <span>+ Connect GitHub</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-500 bg-[#090a0f] border border-[#1e2430] px-2.5 py-1.5 rounded-md italic">
                  Repo Pending
                </span>
              )}

              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-medium px-3 py-2 rounded-lg border border-blue-500/30 flex items-center space-x-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Live Demo</span>
                </a>
              )}

              {isOwnerOrLead && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-[#131720] hover:bg-[#181d28] text-slate-200 text-xs font-medium px-3 py-2 rounded-lg border border-[#1e2430] flex items-center space-x-1.5 transition"
                  title="Edit Workspace Settings"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Settings</span>
                </button>
              )}

              {isOwner && (
                <button
                  onClick={handleDeleteProject}
                  className="bg-rose-950/40 hover:bg-rose-950/60 text-rose-400 border border-rose-800/40 text-xs font-medium px-3 py-2 rounded-lg flex items-center space-x-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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

        {/* Workspace Navigation Tabs */}
        <div className="border-b border-[#1e2430] mb-6 flex space-x-6 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`pb-3 text-xs font-medium flex items-center space-x-1.5 border-b-2 transition ${
              activeTab === 'kanban'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Kanban ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 text-xs font-medium flex items-center space-x-1.5 border-b-2 transition ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Team Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-3 text-xs font-medium flex items-center space-x-1.5 border-b-2 transition ${
              activeTab === 'resources'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Resources Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-xs font-medium flex items-center space-x-1.5 border-b-2 transition ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity Log</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-medium flex items-center space-x-1.5 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-xs font-medium flex items-center space-x-1.5 border-b-2 transition ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members ({project.members?.length})</span>
          </button>
        </div>

        {/* Tab: Project Resources Hub */}
        {activeTab === 'resources' && (
          <ProjectResources projectId={id} isOwnerOrLead={isOwnerOrLead} />
        )}

        {/* Tab: Workspace Activity Log */}
        {activeTab === 'activity' && <ProjectActivityFeed projectId={id} />}

        {/* Tab 1: Interactive Kanban Board */}
        {activeTab === 'kanban' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {statusColumns.map((colStatus) => {
              const columnTasks = tasks.filter((t) => t.status === colStatus);
              return (
                <div key={colStatus} className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-3.5 flex flex-col min-h-[480px]">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                      <span>{colStatus}</span>
                    </h3>
                    <span className="text-[11px] font-mono bg-[#131720] border border-[#1e2430] text-slate-400 px-2 py-0.5 rounded">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Task Cards */}
                  <div className="space-y-3 flex-1">
                    {columnTasks.map((task) => (
                      <div
                        key={task._id}
                        className="bg-[#131720] border border-[#1e2430] hover:border-[#2e374a] rounded-lg p-3.5 transition group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                                priorityColors[task.priority] || priorityColors.Medium
                              }`}
                            >
                              {task.priority}
                            </span>

                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-slate-600 hover:text-rose-400 p-1 transition opacity-0 group-hover:opacity-100"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition mb-1">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mb-2.5 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Task Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2.5">
                              {task.tags.map((tag, idx) => (
                                <span key={idx} className="text-[10px] font-mono bg-[#181d28] text-slate-400 px-1.5 py-0.5 rounded border border-[#1e2430]">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="pt-2.5 border-t border-[#1e2430] flex items-center justify-between text-xs">
                          {/* Assignees & Comments */}
                          <div className="flex items-center space-x-2.5">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {task.assignees?.map((a, idx) => (
                                <div
                                  key={idx}
                                  title={a.name}
                                  className="w-5 h-5 rounded-full bg-[#181d28] border border-[#2e374a] flex items-center justify-center text-[9px] font-mono font-medium text-slate-200 uppercase"
                                >
                                  {a.name ? a.name.charAt(0) : 'U'}
                                </div>
                              ))}
                            </div>

                            <button
                              onClick={() => {
                                setSelectedTaskForComments(task);
                                setIsCommentsModalOpen(true);
                              }}
                              className="flex items-center space-x-1 text-slate-400 hover:text-blue-400 transition"
                              title="View & Add Comments"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span className="font-mono text-[10px]">{task.comments?.length || 0}</span>
                            </button>
                          </div>

                          {/* Move Column Controls */}
                          <div className="flex items-center space-x-1">
                            {getPrevStatus(task.status) && (
                              <button
                                onClick={() => handleMoveTaskStatus(task._id, getPrevStatus(task.status))}
                                className="p-1 bg-[#181d28] hover:bg-[#1e2430] text-slate-400 hover:text-white rounded transition"
                                title={`Move to ${getPrevStatus(task.status)}`}
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            )}

                            {getNextStatus(task.status) && (
                              <button
                                onClick={() => handleMoveTaskStatus(task._id, getNextStatus(task.status))}
                                className="p-1 bg-[#181d28] hover:bg-[#1e2430] text-blue-400 hover:text-blue-300 rounded transition"
                                title={`Move to ${getNextStatus(task.status)}`}
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="h-28 border border-dashed border-[#1e2430] rounded-lg flex items-center justify-center text-slate-500 text-xs font-mono">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Real-Time Team Chat */}
        {activeTab === 'chat' && <ProjectChat projectId={id} />}

        {/* Tab 3: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-5">
                <h3 className="text-xs font-semibold text-white mb-2">Project Description</h3>
                <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-5">
                <h3 className="text-xs font-semibold text-white mb-3">Tech Stack & Tools</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack?.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono bg-[#131720] text-slate-300 px-2.5 py-1 rounded border border-[#1e2430]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Owner Details */}
            <div className="space-y-4">
              <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-5">
                <h3 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3">
                  Project Owner
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-[#181d28] border border-[#2e374a] flex items-center justify-center text-sm font-mono font-medium text-slate-200">
                    {project.owner?.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{project.owner?.name}</h4>
                    <p className="text-[11px] font-mono text-slate-400">{project.owner?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Team Members & RBAC */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Invite Form (Owner or Lead only) */}
            {isOwnerOrLead && (
              <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-5">
                <h3 className="text-xs font-semibold text-white mb-3 flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  <span>Invite Developer to Team</span>
                </h3>

                <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="Enter developer's email address..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
                    />
                  </div>

                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none transition"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Lead">Lead</option>
                    <option value="Viewer">Viewer</option>
                  </select>

                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-4 py-1.5 rounded-lg transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    {inviteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Send Invite</span>}
                  </button>
                </form>
              </div>
            )}

            {/* Members List */}
            <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-white mb-4">Team Members</h3>

              <div className="divide-y divide-[#1e2430]">
                {project.members?.map((m) => (
                  <div key={m._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#181d28] border border-[#2e374a] flex items-center justify-center text-xs font-mono font-medium text-slate-200">
                        {m.user?.name ? m.user.name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-white">{m.user?.name}</h4>
                        <p className="text-[11px] font-mono text-slate-400">{m.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {isOwner && m.user._id !== project.owner._id ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.user._id, e.target.value)}
                          className="bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-md px-2.5 py-1 text-xs text-blue-400 font-medium focus:outline-none transition"
                        >
                          <option value="Lead">Lead</option>
                          <option value="Developer">Developer</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="text-[11px] font-mono bg-[#131720] text-slate-300 border border-[#1e2430] px-2.5 py-0.5 rounded">
                          {m.role}
                        </span>
                      )}

                      {isOwnerOrLead && m.user._id !== project.owner._id && (
                        <button
                          onClick={() => handleRemoveMember(m.user._id)}
                          className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-950/30 transition"
                          title="Remove Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={id}
        members={project.members}
        onTaskCreated={(newTask) => {
          setTasks((prev) => [newTask, ...prev]);
        }}
      />

      {/* Task Comments Modal */}
      <TaskCommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        task={selectedTaskForComments}
        onTaskUpdated={(updatedTask) => {
          setTasks((prev) =>
            prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
          );
        }}
      />
      {/* Edit Project Settings Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
        onProjectUpdated={(updatedProject) => {
          setProject(updatedProject);
          setMessage('Project settings updated successfully!');
        }}
      />
    </div>
  );
}
