import React, { useState, useRef, useMemo, useEffect } from 'react';
import { X, Plus, Save, Briefcase, User, MapPin, Calendar, DollarSign, Flag, ChevronDown, Search } from 'lucide-react';
import { constituenciesData } from '../data/constituencies';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialSeatId?: string;
}

export default function CreateProjectModal({ onClose, onSuccess, initialSeatId }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    manager: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    location: '',
    budget: '',
    actualCompletion: '0',
    milestone: 'Project Initialized',
    seatId: initialSeatId || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [isSeatDropdownOpen, setIsSeatDropdownOpen] = useState(false);
  const [seatSearch, setSeatSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredSeats = useMemo(() => {
      if (!seatSearch) return constituenciesData;
      const query = seatSearch.toLowerCase();
      return constituenciesData.filter(s => 
          s.name.toLowerCase().includes(query) || 
          s.seatId.toString().includes(query)
      );
  }, [seatSearch]);

  const selectedSeat = useMemo(() => 
      constituenciesData.find(s => s.seatId.toString() === formData.seatId),
  [formData.seatId]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsSeatDropdownOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Basic validation
      if (!formData.projectId || !formData.name || !formData.manager || !formData.startDate || !formData.endDate || !formData.budget || !formData.seatId) {
        throw new Error("Please fill in all required fields (including Seat ID).");
      }

      // Define 4 default phases
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const duration = end.getTime() - start.getTime();

      const phaseTemplates = [
        { name: "Design & Planning", weight: 0.15 },
        { name: "Foundation & Dev", weight: 0.45 },
        { name: "Testing & QA", weight: 0.25 },
        { name: "Final Deployment", weight: 0.15 }
      ];

      let accumulatedTime = start.getTime();
      const phases = phaseTemplates.map((p, idx) => {
        const pStart = new Date(accumulatedTime);
        const pEnd = new Date(accumulatedTime + (duration * p.weight));
        accumulatedTime = pEnd.getTime();

        return {
          name: p.name,
          start: pStart,
          end: pEnd,
          status: idx === 0 ? 'current' : 'future',
          spent: 0
        };
      });

      const body = {
        ...formData,
        budget: Number(formData.budget),
        actualCompletion: Number(formData.actualCompletion),
        seatId: Number(formData.seatId),
        phases: phases
      };

      const res = await fetch(`${API_BASE}/projects`, {

        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        const detailMsg = data.error || data.message || 'Failed to create project';
        throw new Error(detailMsg);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-shuddho-card border border-shuddho-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up">
        <header className="p-6 border-b border-shuddho-border flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-shuddho-neon/10 border border-shuddho-neon/20">
              <Plus className="w-5 h-5 text-shuddho-neon" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Create New Project</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Flag className="w-3 h-3" /> Project ID
              </label>
              <input
                type="text"
                name="projectId"
                placeholder="e.g. PRJ-105"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-shuddho-neon transition-colors"
                required
              />
            </div>

            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Flag className="w-3 h-3" /> Seat ID
              </label>
              <div 
                  onClick={() => setIsSeatDropdownOpen(!isSeatDropdownOpen)}
                  className={`w-full bg-slate-800 border ${isSeatDropdownOpen ? 'border-shuddho-neon' : 'border-slate-700'} rounded-xl p-3 text-white cursor-pointer flex items-center justify-between transition-colors`}
              >
                  <div className="flex items-center gap-3 overflow-hidden">
                      {selectedSeat ? (
                          <>
                              <span className="text-xs font-black px-2 py-1 bg-shuddho-neon/20 text-shuddho-neon rounded-md whitespace-nowrap">Seat #{selectedSeat.seatId}</span>
                              <span className="text-white font-bold truncate" title={selectedSeat.name}>{selectedSeat.name}</span>
                          </>
                      ) : (
                          <span className="text-slate-400">Select a Constituency...</span>
                      )}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${isSeatDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isSeatDropdownOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3 border-b border-slate-800 bg-slate-800/50">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <input 
                                  autoFocus
                                  type="text"
                                  placeholder="Search by name or seat number..."
                                  value={seatSearch}
                                  onChange={(e) => setSeatSearch(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-shuddho-neon transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                              />
                          </div>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                          {filteredSeats.length > 0 ? (
                              filteredSeats.map((seat) => (
                                  <div 
                                      key={seat.id}
                                      onClick={() => {
                                          setFormData({ ...formData, seatId: seat.seatId.toString() });
                                          setIsSeatDropdownOpen(false);
                                          setSeatSearch("");
                                      }}
                                      className={`px-4 py-3 hover:bg-shuddho-neon/10 cursor-pointer flex items-center justify-between group transition-colors ${formData.seatId === seat.seatId.toString() ? 'bg-shuddho-neon/5' : ''}`}
                                  >
                                      <div className="flex items-center gap-3 overflow-hidden">
                                          <span className="text-[10px] font-black text-slate-500 group-hover:text-shuddho-neon whitespace-nowrap">#{seat.seatId}</span>
                                          <span className={`text-sm font-bold ${formData.seatId === seat.seatId.toString() ? 'text-shuddho-neon' : 'text-slate-300 group-hover:text-white'} truncate`} title={seat.name}>{seat.name}</span>
                                      </div>
                                      {formData.seatId === seat.seatId.toString() && (
                                          <div className="w-2 h-2 rounded-full bg-shuddho-neon shadow-[0_0_10px_rgba(0,255,204,0.5)] shrink-0"></div>
                                      )}
                                  </div>
                              ))
                          ) : (
                              <div className="p-6 text-center text-slate-500 text-xs italic">
                                  No constituencies found for "{seatSearch}"
                              </div>
                          )}
                      </div>
                  </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-3 h-3" /> Project Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. New Bridge Construction"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-shuddho-neon transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> Manager Name
              </label>
              <input
                type="text"
                name="manager"
                placeholder="Enter manager name"
                value={formData.manager}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-shuddho-neon transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Dhanmondi, Dhaka"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-shuddho-neon transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-shuddho-neon transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3" /> End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-shuddho-neon transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3 h-3" /> Budget (৳)
              </label>
              <input
                type="number"
                name="budget"
                placeholder="5000000"
                value={formData.budget}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-shuddho-neon transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-3 h-3" /> Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-shuddho-neon transition-colors"
              >
                <option value="planning">Planning</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on hold">On Hold</option>
              </select>
            </div>
          </div>
        </form>

        <footer className="p-6 border-t border-shuddho-border bg-slate-900/50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-medium hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary px-8 py-2.5 rounded-xl text-sm justify-center disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : <><Save className="w-4 h-4" /> Save Project</>}
          </button>
        </footer>
      </div>
    </div>
  );
}
