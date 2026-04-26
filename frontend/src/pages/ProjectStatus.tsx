import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, AlertTriangle, ShieldCheck, X, ChevronDown, Search } from 'lucide-react';
import ChallengeModal from '../components/ChallengeModal';
import AdminReviewModal from '../components/AdminReviewModal';
import CreateProjectModal from '../components/CreateProjectModal';
import { constituenciesData } from '../data/constituencies';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

interface Project {
  _id: string;
  projectId: string;
  name: string;
  manager: string;
  status: string;
  startDate: string;
  endDate: string;
  location: string;
  budget: number;
  actualCompletion: number;
  milestone: string;
  phases: any[];
  challenges?: any[];
  seatId?: number;
}

export default function ProjectStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isAdminReviewModalOpen, setIsAdminReviewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(p => {
      const seat = constituenciesData.find(s => s.seatId === p.seatId);
      const seatName = seat ? seat.name.toLowerCase() : '';
      const seatIdStr = p.seatId ? p.seatId.toString() : '';
      const projName = p.name.toLowerCase();
      
      return projName.includes(q) || seatName.includes(q) || seatIdStr.includes(q);
    });
  }, [projects, searchQuery]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (selectedProject) {
          const updatedSelection = data.find((p: Project) => p._id === selectedProject._id);
          if (updatedSelection) setSelectedProject(updatedSelection);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 10000); // auto update every 10s
    return () => clearInterval(interval);
  }, [selectedProject?._id]);

  useEffect(() => {
    if (projects.length > 0 && location.state?.selectedProjectId) {
      const proj = projects.find(p => p._id === location.state.selectedProjectId);
      if (proj) {
        setSelectedProject(proj);
        // Clear state so it doesn't persist if user changes project later
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [projects, location.state, location.pathname, navigate]);



  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setSelectedProject(null);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!selectedProject || !window.confirm("Delete this verified challenge?")) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${selectedProject._id}/challenge/${challengeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Budget vs Actual Completion' },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const chartData = selectedProject ? {
    labels: [selectedProject.name],
    datasets: [
      {
        label: 'Budget',
        data: [selectedProject.budget],
        backgroundColor: 'rgba(53, 162, 235, 0.8)',
      },
      {
        label: 'Actual Completion',
        data: [selectedProject.actualCompletion],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
    ],
  } : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-row justify-between items-center bg-shuddho-card p-6 rounded-2xl border border-shuddho-border shadow-sm gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white text-glow">Project Status</h1>
          <p className="text-slate-400 text-sm mt-1">Select a project to monitor financial allocations, spending, and execution progress.</p>
        </div>

        <div className="flex flex-row items-center gap-4 relative z-20">
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-shuddho-neon text-slate-900 font-bold rounded-xl hover:bg-[#00dpr6] transition-all whitespace-nowrap"
            >
              + Add Project
            </button>
          )}
          <div className="relative z-20" ref={dropdownRef}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-auto min-w-[280px] max-w-[450px] bg-slate-800 border ${isDropdownOpen ? 'border-shuddho-neon' : 'border-slate-700'} text-white rounded-lg p-3 cursor-pointer flex items-center justify-between transition-colors`}
            >
              <div className="flex items-center gap-3 overflow-hidden truncate">
                {selectedProject ? (
                  (() => {
                    const seat = constituenciesData.find(s => s.seatId === selectedProject.seatId);
                    const seatPrefix = seat ? `[${seat.name}] ` : '';
                    return <span><span className="text-shuddho-neon font-bold">{seatPrefix}</span>{selectedProject.name}</span>;
                  })()
                ) : (
                  <span className="text-slate-400">-- Select a Project --</span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-[calc(100%+4px)] right-0 w-[450px] max-w-[90vw] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-800 bg-slate-800/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Search by seat, project name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-shuddho-neon transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((p) => {
                      const seat = constituenciesData.find(s => s.seatId === p.seatId);
                      const isSelected = selectedProject?._id === p._id;
                      return (
                        <div 
                          key={p._id}
                          onClick={() => {
                            setSelectedProject(p);
                            setIsDropdownOpen(false);
                            setSearchQuery("");
                          }}
                          className={`px-4 py-3 hover:bg-shuddho-neon/10 cursor-pointer flex items-center justify-between group transition-colors ${isSelected ? 'bg-shuddho-neon/5' : ''}`}
                        >
                          <div className="flex flex-col gap-1 overflow-hidden">
                            {seat && <span className="text-[10px] font-black text-shuddho-neon uppercase tracking-wider">{seat.name} (Seat {seat.seatId})</span>}
                            <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'} truncate`} title={p.name}>{p.name}</span>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-shuddho-neon shadow-[0_0_10px_rgba(0,255,204,0.5)] shrink-0 ml-3"></div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs italic">
                      No projects found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {selectedProject && chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Left side: Chart */}
          <div className="bg-shuddho-card rounded-2xl border border-shuddho-border p-6 shadow-sm min-h-[400px]">
            <Bar options={chartOptions} data={chartData} />
          </div>

          {/* Right side: Project Profile */}
          <div className="bg-shuddho-card rounded-2xl border border-shuddho-border p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-white">{selectedProject.name}</h2>
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${selectedProject.status.includes('completed') ? 'bg-shuddho-green/20 text-shuddho-green' : 'bg-amber-500/20 text-amber-400'}`}>
                  {selectedProject.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <p className="text-slate-500 mb-1 tracking-wide text-xs">Project ID</p>
                  <p className="font-medium text-slate-200">{selectedProject.projectId}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 tracking-wide text-xs">Manager</p>
                  <p className="font-medium text-slate-200">{selectedProject.manager}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 tracking-wide text-xs">Start Date</p>
                  <p className="font-medium text-slate-200">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 tracking-wide text-xs">End Date</p>
                  <p className="font-medium text-slate-200">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 mb-1 tracking-wide text-xs">Location</p>
                  <p className="font-medium text-slate-200">{selectedProject.location}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 mb-1 tracking-wide text-xs">Current Stage</p>
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 mt-1 font-bold text-shuddho-neon">
                    {selectedProject.status === 'completed' 
                      ? 'Completed' 
                      : (selectedProject.phases?.find(p => p.status === 'current')?.name || 'Not Started')}
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 tracking-wide text-xs">Budget</p>
                  <p className="font-bold text-indigo-400 text-lg">৳{selectedProject.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 tracking-wide text-xs">Actual Spent</p>
                  <p className={`font-bold text-lg ${selectedProject.actualCompletion > selectedProject.budget ? 'text-shuddho-red' : 'text-shuddho-green'}`}>
                    ৳{selectedProject.actualCompletion.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* implementing project timeline and challenge buttons */}
            <div className="mt-6 flex flex-col xl:flex-row gap-3">
                <button 
                  onClick={() => navigate(`/dashboard/project-timeline/${selectedProject._id}`)}
                  className="btn-timeline flex-1 justify-center"
                >
                  <Clock className="w-4 h-4" /> View Project Timeline
                </button>
                {user?.role === 'admin' ? (
                  <div className="flex flex-1 gap-2">
                    <button 
                      onClick={() => setIsAdminReviewModalOpen(true)}
                      className="btn-primary bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 flex-1 justify-center py-2.5 rounded-xl text-sm"
                    >
                      <ShieldCheck className="w-4 h-4" /> Review
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsChallengeModalOpen(true)}
                    className="btn-primary bg-rose-600 hover:bg-rose-500 shadow-rose-600/30 flex-1 justify-center py-2.5 rounded-xl text-sm"
                  >
                    <AlertTriangle className="w-4 h-4" /> Challenge Progress
                  </button>
                )}
            </div>

            {user?.role === 'admin' && (
              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleDelete(selectedProject._id)}
                  className="px-4 py-2 border border-shuddho-red/50 text-shuddho-red hover:bg-shuddho-red/10 font-medium rounded-lg transition-colors text-sm"
                >
                  Delete Project
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* implementing challenge rendering section */}
      {selectedProject && selectedProject.challenges && selectedProject.challenges.some(c => c.status === 'valid') && (
          <div id="challenge-review-section" className="mt-8 border-t border-slate-800 pt-8 animate-fade-in-up">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" /> 
                  Project Progress Challenges
              </h2>

              {/* Verified Challenges List */}
              <div className="grid grid-cols-1 gap-4">
                  {selectedProject.challenges.filter(c => c.status === 'valid').map((challenge, idx) => (
                      <div key={idx} className="chal-card relative">
                          {user?.role === 'admin' && (
                              <button 
                                  onClick={() => handleDeleteChallenge(challenge._id)}
                                  className="absolute top-4 right-4 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-lg transition-colors"
                                  title="Delete Challenge"
                              >
                                  <X className="w-4 h-4" />
                              </button>
                          )}
                          <p className="text-slate-300 text-sm leading-relaxed pr-10">{challenge.description}</p>
                          {challenge.mediaUrls?.length > 0 && (
                              <div className="chal-media-grid">
                                  {challenge.mediaUrls.map((url: string, i: number) => (
                                      <img key={i} src={url} alt={`evidence-${i}`} className="chal-media-item" />
                                  ))}
                              </div>
                          )}
                          {challenge.adminNote && (
                              <div className="chal-note-box">
                                  <p className="chal-note-label">
                                      <ShieldCheck className="w-3 h-3" /> Official Response
                                  </p>
                                  <p className="text-sm text-indigo-100">{challenge.adminNote}</p>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Admin Modal Overlay */}
      {isAdminReviewModalOpen && selectedProject && (
          <AdminReviewModal 
              project={selectedProject}
              onClose={() => setIsAdminReviewModalOpen(false)}
              onRefresh={fetchProjects}
          />
      )}

      {/* Challenge Modal Overlay */}
      {isChallengeModalOpen && selectedProject && (
          <ChallengeModal 
              projectId={selectedProject._id}
              onClose={() => setIsChallengeModalOpen(false)}
              onSuccess={() => { fetchProjects(); }}
          />
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
          <CreateProjectModal 
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={() => { fetchProjects(); }}
          />
      )}

    </div>
  );
}
