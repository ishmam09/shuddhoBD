import React, { useState } from 'react';
import { X, Save, TrendingUp, DollarSign } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

interface UpdateProgressModalProps {
  project: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateProgressModal({ project, onClose, onSuccess }: UpdateProgressModalProps) {
  const [spent, setSpent] = useState(project.actualCompletion.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/projects/${project._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ actualCompletion: Number(spent) }),
        credentials: 'include'
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update progress');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-shuddho-card border border-shuddho-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        <header className="p-6 border-b border-shuddho-border flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Update Financials</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Project Name</p>
            <p className="text-white font-medium">{project.name}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <DollarSign className="w-3 h-3" /> Actual Amount Spent (৳)
            </label>
            <input
              type="number"
              value={spent}
              onChange={(e) => setSpent(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-2xl font-bold text-shuddho-neon outline-none focus:border-shuddho-neon transition-colors"
                autoFocus
            />
            <p className="text-xs text-slate-500 mt-2">
                Original Budget: <span className="text-slate-300 font-bold">৳{project.budget.toLocaleString()}</span>
            </p>
          </div>

          {error && (
            <p className="text-rose-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 py-4 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : <><Save className="w-5 h-5" /> Update Record</>}
          </button>
        </form>
      </div>
    </div>
  );
}
