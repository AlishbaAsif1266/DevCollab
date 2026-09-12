import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FolderGit2, CheckCircle2, AlertCircle, Loader2, XCircle } from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get(`/invitations/verify/${token}`);
        if (res.data.success) {
          setInvitation(res.data.invitation);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation token.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitationDetails();
    }
  }, [token]);

  const handleAccept = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await API.post(`/invitations/accept/${token}`);
      if (res.data.success) {
        setSuccessMsg('You have successfully joined the workspace.');
        setTimeout(() => {
          navigate(`/projects/${res.data.projectId}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await API.post(`/invitations/decline/${token}`);
      if (res.data.success) {
        setSuccessMsg('Invitation declined.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline invitation.');
    } finally {
      setActionLoading(false);
    }
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

  if (error && !invitation) {
    return (
      <div className="min-h-[100dvh] bg-[#090a0f] text-slate-100 flex flex-col">
        <Navbar />
        <main className="max-w-md mx-auto my-16 p-6 bg-[#0e1117] border border-[#1e2430] rounded-xl text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-white mb-1.5">Invitation Error</h2>
          <p className="text-slate-400 text-xs mb-5">{error}</p>
          <Link
            to="/projects"
            className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-4 py-2 rounded-lg transition inline-block"
          >
            Go to Projects
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#090a0f] text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-md mx-auto my-12 px-4 flex-1 w-full">
        <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <FolderGit2 className="w-6 h-6" />
          </div>

          <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-2 inline-block">
            Project Invitation
          </span>

          <h1 className="text-lg font-semibold text-white mt-1.5 mb-1.5">
            Join "{invitation?.project?.title}"
          </h1>

          <p className="text-slate-400 text-xs mb-5 leading-relaxed">
            <strong className="text-slate-200">{invitation?.invitedBy?.name}</strong> has invited you to collaborate as a{' '}
            <span className="text-blue-400 font-medium">{invitation?.role}</span>.
          </p>

          {/* Project Details Teaser */}
          <div className="bg-[#131720] border border-[#1e2430] rounded-lg p-4 mb-5 text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">Category</span>
              <span className="text-slate-300 font-medium">{invitation?.project?.category}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">Status</span>
              <span className="text-emerald-400 font-mono text-[11px]">{invitation?.project?.status}</span>
            </div>
            {invitation?.project?.description && (
              <p className="text-slate-400 text-xs line-clamp-2 pt-2 border-t border-[#1e2430]">
                {invitation.project.description}
              </p>
            )}
          </div>

          {/* Alert messages */}
          {successMsg && (
            <div className="mb-5 p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-lg flex items-center space-x-2 text-emerald-400 text-xs text-left">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg flex items-center space-x-2 text-rose-300 text-xs text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          {!isAuthenticated ? (
            <div className="space-y-2.5">
              <p className="text-xs text-amber-400 mb-2">Please sign in to your DevCollab account to accept this invitation.</p>
              <Link
                to={`/login?redirect=/invitations/accept/${token}`}
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium py-2.5 px-4 rounded-lg transition block"
              >
                Sign In to Accept
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleDecline}
                disabled={actionLoading}
                className="flex-1 bg-[#131720] hover:bg-[#181d28] border border-[#1e2430] text-slate-300 text-xs font-medium py-2 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Decline</span>
              </button>

              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium py-2 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
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
