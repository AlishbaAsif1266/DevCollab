import React, { useState, useEffect } from 'react';
import { Search, Terminal, Github, Linkedin, Globe, Shield, UserCheck, Layers } from 'lucide-react';
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
    <div className="min-h-[100dvh] bg-[#090a0f] text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2.5">
              <Terminal className="w-6 h-6 text-blue-400" />
              <span>Developer Directory</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Discover software developers, technical skills, and potential project collaborators
            </p>
          </div>

          {/* Search bar & filter */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name or bio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0e1117] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
              />
            </div>

            <div className="relative sm:w-44">
              <Layers className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by skill..."
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full bg-[#0e1117] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Developer List Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-5 animate-pulse h-52"></div>
            ))}
          </div>
        ) : developers.length === 0 ? (
          <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-10 text-center max-w-md mx-auto my-10">
            <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No Developers Found</h3>
            <p className="text-slate-500 text-xs mt-1">Try adjusting your search criteria or skill filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {developers.map((dev) => (
              <div
                key={dev._id}
                className="bg-[#0e1117] border border-[#1e2430] hover:border-[#2e374a] rounded-xl p-5 flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[#181d28] border border-[#2e374a] flex items-center justify-center text-sm font-mono font-medium text-slate-200 uppercase">
                        {dev.name ? dev.name.charAt(0) : 'D'}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition">
                          {dev.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 mt-0.5">
                          <Shield className="w-3 h-3 text-blue-400" />
                          {dev.role === 'project_owner' ? 'Project Owner' : dev.experienceLevel || 'Developer'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">
                    {dev.bio || 'No developer bio provided.'}
                  </p>

                  {/* Skills Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {dev.skills && dev.skills.length > 0 ? (
                      dev.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-mono bg-[#131720] text-slate-300 px-2 py-0.5 rounded border border-[#1e2430]"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-600 italic">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* Social Links & Actions */}
                <div className="pt-3.5 border-t border-[#1e2430] flex items-center justify-between text-slate-400 text-xs">
                  <div className="flex items-center space-x-2.5">
                    {dev.githubUrl && (
                      <a
                        href={dev.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white transition p-1 hover:bg-[#131720] rounded"
                        title="GitHub Profile"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {dev.linkedinUrl && (
                      <a
                        href={dev.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-blue-400 transition p-1 hover:bg-[#131720] rounded"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {dev.portfolioUrl && (
                      <a
                        href={dev.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-blue-400 transition p-1 hover:bg-[#131720] rounded"
                        title="Portfolio Website"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
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
