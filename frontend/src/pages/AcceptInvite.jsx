import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FolderGit2, CheckCircle2, XCircle, Shield, User, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        const res = await API.get(`/invitations/token/${token}`);
        if (res.data.success) {
          setInvitation(res.data.invitation);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation link');
      } finally {
        setLoading(false);
      }
    };

    fetchInviteDetails();
  }, [token]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/invitations/accept/${token}`);
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const res = await API.post(`/invitations/accept/${token}`);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setTimeout(() => {
          navigate(`/projects/${res.data.projectId}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      const res = await API.post(`/invitations/decline/${token}`);
      if (res.data.success) {
        navigate('/projects');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline invitation');
    } finally {
      setActionLoading(false);
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

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Invitation Error</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Link
            to="/projects"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition"
          >
            Go to Projects
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-lg mx-auto my-12 px-4 flex-1 w-full">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="p-3.5 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400 w-fit mx-auto mb-4">
            <FolderGit2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
            Project Invitation
          </span>

          <h1 className="text-2xl font-extrabold text-white mt-2 mb-2">
            Join "{invitation?.project?.title}"
          </h1>

          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            <strong className="text-slate-200">{invitation?.invitedBy?.name}</strong> has invited you to collaborate as a{' '}
            <span className="text-indigo-400 font-semibold">{invitation?.role}</span>.
          </p>

          {/* Project Details Teaser */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold uppercase">Category</span>
              <span className="text-slate-300 font-medium">{invitation?.project?.category}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold uppercase">Status</span>
              <span className="text-emerald-400 font-semibold">{invitation?.project?.status}</span>
            </div>
            {invitation?.project?.description && (
              <p className="text-slate-400 text-xs line-clamp-2 pt-2 border-t border-slate-800">
                {invitation.project.description}
              </p>
            )}
          </div>

          {/* Alert messages */}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center space-x-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          {!isAuthenticated ? (
            <div className="space-y-3">
              <p className="text-xs text-amber-400 mb-2">Please sign in to your DevCollab account to accept this invitation.</p>
              <Link
                to={`/login?redirect=/invitations/accept/${token}`}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition block shadow-lg shadow-indigo-600/20"
              >
                Sign In to Accept
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDecline}
                disabled={actionLoading}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Decline</span>
              </button>

              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept & Join</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
