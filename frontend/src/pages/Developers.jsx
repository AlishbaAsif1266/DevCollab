import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Github, Linkedin, Globe, Shield, Terminal, UserCheck } from 'lucide-react';
import API from '../services/api';
import Navbar from '../components/Navbar';

export default function Developers() {
  const [developers, setDevelopers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDevelopers = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/auth/developers?search=${search}&skill=${selectedSkill}`);
      if (res.data.success) {
        setDevelopers(res.data.developers);
      }
    } catch (err) {
      console.error('Failed to fetch developers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, [search, selectedSkill]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Terminal className="w-8 h-8 text-indigo-400" />
              <span>Developer Directory</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Discover software developers, technical skills, and potential project collaborators
            </p>
          </div>

          {/* Search bar & filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search name or bio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none"
              />
            </div>

            <div className="relative sm:w-48">
              <Sparkles className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Filter by skill..."
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Developer List Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-pulse h-56"></div>
            ))}
          </div>
        ) : developers.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">No Developers Found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria or skill filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developers.map((dev) => (
              <div
                key={dev._id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                        {dev.name ? dev.name.charAt(0) : 'D'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">
                          {dev.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-400 font-medium bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                          <Shield className="w-3 h-3" />
                          {dev.role === 'project_owner' ? 'Project Owner' : dev.experienceLevel || 'Developer'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {dev.bio || 'No bio provided.'}
                  </p>

                  {/* Skills Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {dev.skills && dev.skills.length > 0 ? (
                      dev.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/50"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-600 italic">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* Social Links & Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
                  <div className="flex items-center space-x-3">
                    {dev.githubUrl && (
                      <a
                        href={dev.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white transition"
                        title="GitHub Profile"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {dev.linkedinUrl && (
                      <a
                        href={dev.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-indigo-400 transition"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {dev.portfolioUrl && (
                      <a
                        href={dev.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-purple-400 transition"
                        title="Portfolio Website"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 font-mono">
                    Joined {new Date(dev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
