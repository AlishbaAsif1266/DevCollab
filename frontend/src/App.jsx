import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Code2, Terminal, Users, LayoutDashboard } from 'lucide-react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl">
          <Code2 className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          DevCollab
        </h1>
      </div>
      
      <p className="max-w-xl text-lg text-slate-400 mb-8 leading-relaxed">
        Developer Collaboration Platform — Unified real-time workspace for software teams to build, manage tasks, track progress, and communicate seamlessly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-10 text-left">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl w-fit mb-4 text-indigo-400">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-slate-200">Interactive Kanban</h3>
          <p className="text-sm text-slate-400">Manage tasks with priorities, status transitions, and discussions.</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
          <div className="p-2.5 bg-purple-500/10 rounded-xl w-fit mb-4 text-purple-400">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-slate-200">Real-Time Chat</h3>
          <p className="text-sm text-slate-400">Collaborate with project rooms powered by Socket.IO instant messaging.</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
          <div className="p-2.5 bg-pink-500/10 rounded-xl w-fit mb-4 text-pink-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-slate-200">Developer Directory</h3>
          <p className="text-sm text-slate-400">Showcase tech skills, GitHub profiles, and discover collaborators.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <span className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition cursor-pointer shadow-lg shadow-indigo-600/25">
          Phase 1 Complete: Core Architecture & Foundations Ready
        </span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}
