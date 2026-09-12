import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Trash2,
  UserPlus,
  FileCode,
  Clock,
  PlusCircle,
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
      const res = await API.get(`/projects/${projectId}/activity`);
      if (res.data.success) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.error('Failed to fetch activity log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    const socket = getSocket();
    if (!socket) return;

    const handleNewActivity = (activity) => {
      if (activity.project === projectId) {
        setActivities((prev) => [activity, ...prev]);
      }
    };

    socket.on('project_activity', handleNewActivity);

    return () => {
      socket.off('project_activity', handleNewActivity);
    };
  }, [projectId]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'task_created':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
            <PlusCircle className="w-3 h-3" />
            <span>Task Created</span>
          </span>
        );
      case 'task_updated':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" />
            <span>Task Moved</span>
          </span>
        );
      case 'task_deleted':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
            <Trash2 className="w-3 h-3" />
            <span>Task Deleted</span>
          </span>
        );
      case 'resource_added':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            <FileCode className="w-3 h-3" />
            <span>Resource Added</span>
          </span>
        );
      case 'resource_deleted':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <Trash2 className="w-3 h-3" />
            <span>Resource Removed</span>
          </span>
        );
      case 'member_invited':
      case 'member_added':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-slate-300 bg-[#131720] border border-[#1e2430] px-2 py-0.5 rounded">
            <UserPlus className="w-3 h-3" />
            <span>Team Member</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-slate-300 bg-[#131720] border border-[#1e2430] px-2 py-0.5 rounded">
            <Activity className="w-3 h-3" />
            <span>Activity</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-[#1e2430] pb-3.5">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Workspace Activity Log</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated log of task updates, resource shares, and member actions
          </p>
        </div>

        <span className="text-[11px] font-mono text-slate-400 bg-[#131720] border border-[#1e2430] px-2.5 py-1 rounded">
          Live Log
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs">
          No recorded activity yet. Actions on Kanban tasks and resources will appear here automatically.
        </div>
      ) : (
        <div className="relative border-l border-[#1e2430] ml-3 pl-5 space-y-4">
          {activities.map((act) => (
            <div key={act._id} className="relative group">
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#090a0f]"></div>

              <div className="bg-[#131720] border border-[#1e2430] hover:border-[#2e374a] rounded-lg p-3 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#181d28] border border-[#2e374a] flex items-center justify-center text-[10px] font-mono font-medium text-slate-200 uppercase">
                    {act.user?.name ? act.user.name.charAt(0) : 'U'}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-white">{act.user?.name || 'Developer'}</span>
                      {getActionBadge(act.action)}
                    </div>
                    <p className="text-xs text-slate-300">{act.details}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono self-end sm:self-center">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(act.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
