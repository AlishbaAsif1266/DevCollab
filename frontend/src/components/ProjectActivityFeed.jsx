import React, { useState, useEffect } from 'react';
import {
  Activity,
  PlusCircle,
  CheckCircle2,
  Trash2,
  UserPlus,
  MessageSquare,
  FileCode,
  ShieldAlert,
  Clock,
  Loader2,
} from 'lucide-react';
import API from '../services/api';
import { getSocket } from '../services/socket';

export default function ProjectActivityFeed({ projectId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/projects/${projectId}/activities`);
      if (res.data.success) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.error('Failed to fetch project activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    const socket = getSocket();
    if (socket) {
      socket.on('activity_logged', (newActivity) => {
        setActivities((prev) => [newActivity, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off('activity_logged');
      }
    };
  }, [projectId]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'task_created':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
            <PlusCircle className="w-3 h-3" />
            <span>Task Created</span>
          </span>
        );
      case 'task_updated':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Task Moved</span>
          </span>
        );
      case 'task_deleted':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
            <Trash2 className="w-3 h-3" />
            <span>Task Deleted</span>
          </span>
        );
      case 'resource_added':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            <FileCode className="w-3 h-3" />
            <span>Resource Added</span>
          </span>
        );
      case 'resource_deleted':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
            <Trash2 className="w-3 h-3" />
            <span>Resource Removed</span>
          </span>
        );
      case 'member_invited':
      case 'member_added':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
            <UserPlus className="w-3 h-3" />
            <span>Team Member</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full">
            <Activity className="w-3 h-3" />
            <span>Activity</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Workspace Activity Audit Log</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated audit log of task updates, resource shares, and member actions
          </p>
        </div>

        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full font-semibold">
          Live Audit Feed
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No recorded activity yet. Actions on Kanban tasks and resources will appear here automatically.
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {activities.map((act) => (
            <div key={act._id} className="relative group">
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-4 border-slate-950 shadow-sm"></div>

              <div className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 transition shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                    {act.user?.name ? act.user.name.charAt(0) : 'U'}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white">{act.user?.name || 'Developer'}</span>
                      {getActionBadge(act.action)}
                    </div>
                    <p className="text-xs text-slate-300">{act.details}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono self-end sm:self-center">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
