import React, { useState, useEffect } from 'react';
import { Cpu, ShieldAlert, Activity, CheckCircle, Database } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export default function CivicAnalyst() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<null | any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/projects`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setProjects(data))
      .catch(console.error);
  }, []);

  const handleAnalyze = () => {
    if (!selectedProjectId) return;
    const project = projects.find(p => p._id === selectedProjectId);
    if (!project) return;
    
    setAnalyzing(true);
    setReport(null);
    
    // Call Gemini AI API
    fetch(`${API_BASE}/ai/analyze-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project })
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data.error) {
           throw new Error(data.error || "Failed to analyze project");
        }
        setReport({
          riskLevel: data.riskLevel,
          explanation: data.explanation,
          indicators: data.indicators || [],
          recommendation: data.recommendation,
          isLocal: false
        });
        setAnalyzing(false);
      })
      .catch(err => {
        console.error("AI Analysis failed:", err);
        alert("AI Analysis service is currently unavailable. Please check your GEMINI_API_KEY.");
        setAnalyzing(false);
      });
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="flex flex-col bg-slate-900 overflow-hidden rounded-2xl border border-slate-800 shadow-xl relative">
        <div className="absolute inset-0 bg-shuddho-neon/5 opacity-50 pointer-events-none"></div>
        <div className="p-8 pb-10 flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-shuddho-neon flex items-center justify-center mb-4 neon-shadow">
            <Cpu className="text-shuddho-neon w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">AI Civic Transparency Analyst</h1>
          <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
            Harness automated intelligence to scan development projects and citizen reports. 
            Identify corruption risks, detect timeline inefficiencies, and surface structural anomalies objectively.
          </p>
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
              <Database className="w-4 h-4 inline-block mr-2 -mt-1" />
              Select Actionable Project
            </label>
            <select
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-shuddho-neon transition-colors"
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
            >
              <option value="">-- Choose a project dataset --</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.projectId} - {p.name} ({p.location})</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!selectedProjectId || analyzing}
            className="w-full md:w-auto px-8 py-3 bg-shuddho-neon text-slate-900 font-bold rounded-lg hover:bg-[#00dpr6] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent"></div>
                Analyzing Sequence...
              </>
            ) : (
              <>Run AI Analysis</>
            )}
          </button>
        </div>
      </div>


      {report && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
          <div className={`p-6 border-b ${
              report.riskLevel === 'HIGH' ? 'bg-rose-500/10 border-rose-500/20' : 
              report.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/20' : 
              'bg-emerald-500/10 border-emerald-500/20'
            }`}>
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
              {report.riskLevel === 'HIGH' ? <ShieldAlert className="text-rose-500" /> : 
               report.riskLevel === 'MEDIUM' ? <Activity className="text-amber-500" /> : 
               <CheckCircle className="text-emerald-500" />}
              Analysis Report Generated
            </h2>
          </div>
          
          <div className="p-8 space-y-8 text-slate-300 relative">
            {/* Strict Output Requirement Section */}
            
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-2">Risk Level</span>
              <p className={`text-2xl font-black ${
                  report.riskLevel === 'HIGH' ? 'text-rose-500' : 
                  report.riskLevel === 'MEDIUM' ? 'text-amber-500' : 
                  'text-emerald-500'
                }`}>
                {report.riskLevel} {report.riskLevel !== 'LOW' && 'RISK'}
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-6">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block">Explanation</span>
              <p className="leading-relaxed text-sm text-slate-200">
                {report.explanation}
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-6">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-3">Key Indicators</span>
              <ul className="space-y-3">
                {report.indicators.map((ind: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0"></span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-6">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block">Recommendation</span>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-shuddho-neon font-medium text-sm">
                {report.recommendation}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
