import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, Plus, Search, ArrowRight } from 'lucide-react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import CreateProjectModal from '../components/CreateProjectModal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let queryStr = `/projects?search=${search}`;
      if (selectedCategory) queryStr += `&category=${selectedCategory}`;
      const res = await API.get(queryStr);
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, selectedCategory]);

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
  };

  const categories = [
    'All',
    'Web Development',
    'Mobile App',
    'AI / ML',
    'DevOps',
    'Cloud & Infra',
    'Open Source',
  ];

  return (
    <div className="min-h-[100dvh] bg-[#090a0f] text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2.5">
              <FolderGit2 className="w-6 h-6 text-blue-400" />
              <span>Project Workspaces</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Manage developer projects, assign roles, and collaborate in centralized workspaces
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-4 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
          {/* Categories Pill Filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const categoryValue = cat === 'All' ? '' : cat;
              const isSelected = selectedCategory === categoryValue;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(categoryValue)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-[#181d28] text-white border border-[#2e374a]'
                      : 'bg-[#0e1117] border border-[#1e2430] text-slate-400 hover:text-slate-200 hover:bg-[#131720]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-68">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search project title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0e1117] border border-[#1e2430] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-5 animate-pulse h-56"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-10 text-center max-w-md mx-auto my-10">
            <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No Projects Found</h3>
            <p className="text-slate-500 text-xs mt-1 mb-5">Create your first project workspace to start collaborating.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition"
            >
              Create Project Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-[#0e1117] border border-[#1e2430] hover:border-[#2e374a] rounded-xl p-5 flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[11px] font-medium bg-[#131720] text-slate-300 border border-[#1e2430] px-2 py-0.5 rounded-md">
                      {project.category}
                    </span>
                    <span
                      className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        project.status === 'Active'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                          : project.status === 'Completed'
                          ? 'bg-blue-950/40 text-blue-400 border border-blue-800/40'
                          : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <Link to={`/projects/${project._id}`}>
                    <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition mb-1.5">
                      {project.title}
                    </h3>
                  </Link>

                  <p className="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.techStack?.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono bg-[#131720] text-slate-400 px-2 py-0.5 rounded border border-[#1e2430]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card footer */}
                <div className="pt-3.5 border-t border-[#1e2430] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {project.members?.slice(0, 4).map((m, idx) => (
                        <div
                          key={idx}
                          title={m.user?.name}
                          className="w-6 h-6 rounded-full bg-[#1e2430] border border-[#2e374a] flex items-center justify-center text-[10px] font-mono font-medium text-slate-200 uppercase"
                        >
                          {m.user?.name ? m.user.name.charAt(0) : 'M'}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {project.members?.length} member{project.members?.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <Link
                    to={`/projects/${project._id}`}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
