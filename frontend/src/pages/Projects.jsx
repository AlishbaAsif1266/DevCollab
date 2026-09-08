import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, Plus, Search, Filter, Github, ExternalLink, Users, Shield, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <FolderGit2 className="w-8 h-8 text-indigo-400" />
              <span>Project Workspaces</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage developer projects, assign roles, and collaborate in centralized workspaces
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Project</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Categories Pill Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const categoryValue = cat === 'All' ? '' : cat;
              const isSelected = selectedCategory === categoryValue;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(categoryValue)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search project title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 animate-pulse h-64"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12">
            <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">No Projects Found</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">Create your first project workspace to start collaborating!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              Create Project Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between transition group shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                      {project.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        project.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : project.status === 'Completed'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <Link to={`/projects/${project._id}`}>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition mb-2">
                      {project.title}
                    </h3>
                  </Link>

                  <p className="text-slate-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.techStack?.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card footer */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2 overflow-hidden">
                      {project.members?.slice(0, 4).map((m, idx) => (
                        <div
                          key={idx}
                          title={m.user?.name}
                          className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase"
                        >
                          {m.user?.name ? m.user.name.charAt(0) : 'M'}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {project.members?.length} Member{project.members?.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <Link
                    to={`/projects/${project._id}`}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                  >
                    <span>Workspace</span>
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
