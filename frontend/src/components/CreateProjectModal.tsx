import React, { useState } from 'react';
import { X, Plus, Save, Briefcase, User, MapPin, Calendar, DollarSign, Flag } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
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
    seatId: '185'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create project');
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Flag className="w-3 h-3" /> Seat ID
              </label>
              <input
                type="number"
                name="seatId"
                placeholder="e.g. 185"
                value={formData.seatId}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-shuddho-neon transition-colors"
                required
              />
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
