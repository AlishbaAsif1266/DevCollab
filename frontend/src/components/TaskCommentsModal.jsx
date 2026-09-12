import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, User, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#181d28] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-5 pb-3.5 border-b border-[#1e2430] pr-8">
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                priorityColors[taskData.priority] || priorityColors.Medium
              }`}
            >
              {taskData.priority} Priority
            </span>
            <span className="text-[11px] font-mono bg-[#131720] text-slate-300 border border-[#1e2430] px-2 py-0.5 rounded">
              {taskData.status}
            </span>
          </div>

          <h2 className="text-base font-semibold text-white">{taskData.title}</h2>
          {taskData.description && (
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed whitespace-pre-line">
              {taskData.description}
            </p>
          )}

          {/* Assignees */}
          {taskData.assignees && taskData.assignees.length > 0 && (
            <div className="flex items-center space-x-2 mt-3 pt-2.5 border-t border-[#1e2430]">
              <span className="text-[11px] font-mono text-slate-500">Assignees:</span>
              <div className="flex flex-wrap gap-1">
                {taskData.assignees.map((assignee) => (
                  <span
                    key={assignee._id}
                    className="text-[11px] font-mono bg-[#131720] text-slate-300 px-2 py-0.5 rounded border border-[#1e2430] flex items-center space-x-1"
                  >
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{assignee.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comment Thread */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 no-scrollbar min-h-[160px]">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>Comments ({taskData.comments?.length || 0})</span>
          </h3>

          {taskData.comments && taskData.comments.length > 0 ? (
            taskData.comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-[#131720] border border-[#1e2430] rounded-lg p-3 flex items-start space-x-2.5"
              >
                <div className="w-7 h-7 rounded-md bg-[#181d28] border border-[#2e374a] flex items-center justify-center text-xs font-mono font-medium text-slate-200 flex-shrink-0">
                  {comment.author?.name ? comment.author.name.charAt(0) : 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{comment.author?.name || 'Developer'}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 bg-[#090a0f] rounded-lg border border-[#1e2430]">
              <MessageSquare className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs text-slate-500">No comments yet. Start the discussion.</p>
            </div>
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSendComment} className="flex items-center space-x-2 pt-3 border-t border-[#1e2430]">
          <input
            type="text"
            required
            placeholder="Write a comment or technical update..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={loading || !commentText.trim()}
            className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white p-2 rounded-lg transition flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
