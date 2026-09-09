import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, User, Calendar, Flag, Shield, Loader2 } from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function TaskCommentsModal({ isOpen, onClose, task, onTaskUpdated }) {
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState(task);

  useEffect(() => {
    setTaskData(task);
  }, [task]);

  if (!isOpen || !taskData) return null;

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const res = await API.post(`/tasks/${taskData._id}/comments`, {
        text: commentText,
      });

      if (res.data.success) {
        setTaskData(res.data.task);
        if (onTaskUpdated) onTaskUpdated(res.data.task);
        setCommentText('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    Low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pb-4 border-b border-slate-800 pr-10">
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${
                priorityColors[taskData.priority] || priorityColors.Medium
              }`}
            >
              {taskData.priority} Priority
            </span>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-md font-semibold">
              {taskData.status}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white">{taskData.title}</h2>
          {taskData.description && (
            <p className="text-slate-400 text-sm mt-2 leading-relaxed whitespace-pre-line">
              {taskData.description}
            </p>
          )}

          {/* Assignees */}
          {taskData.assignees && taskData.assignees.length > 0 && (
            <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-800/60">
              <span className="text-xs text-slate-500 font-semibold uppercase">Assignees:</span>
              <div className="flex flex-wrap gap-1.5">
                {taskData.assignees.map((assignee) => (
                  <span
                    key={assignee._id}
                    className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-700 flex items-center space-x-1"
                  >
                    <User className="w-3 h-3 text-indigo-400" />
                    <span>{assignee.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comment Thread */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 no-scrollbar">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Task Comments ({taskData.comments?.length || 0})</span>
          </h3>

          {taskData.comments && taskData.comments.length > 0 ? (
            taskData.comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {comment.author?.name ? comment.author.name.charAt(0) : 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{comment.author?.name || 'Developer'}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-slate-800/50">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No comments yet. Start the discussion!</p>
            </div>
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSendComment} className="flex items-center space-x-3 pt-3 border-t border-slate-800">
          <input
            type="text"
            required
            placeholder="Write a comment or update..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !commentText.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-2.5 rounded-xl transition flex items-center justify-center shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
