import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto pb-12">
            <header className="mb-10 w-full">
                <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                <p className="text-slate-400 mt-1">
                    Welcome back, {user?.name}. Here's what's happening today.
                </p>
            </header>

            {user?.role === 'citizen' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
                    <div className="bg-shuddho-card p-6 rounded-2xl border border-shuddho-border shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">My Reports</h3>
                        <span className="text-4xl font-bold text-white">0</span>
                    </div>
                    <div className="bg-shuddho-card p-6 rounded-2xl border border-shuddho-border shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Projects Followed</h3>
                        <span className="text-4xl font-bold text-white">0</span>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-md text-white flex flex-col items-start justify-between border border-indigo-800">
                        <div>
                            <h3 className="text-indigo-200 text-sm font-medium mb-1">Make an Impact</h3>
                            <p className="text-lg font-semibold leading-tight mb-4">Report an issue in your constituency.</p>
                        </div>
                        <button className="bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium px-4 py-2 rounded-lg w-full text-left flex justify-between items-center backdrop-blur-sm border border-white/10">
                            Submit Report <span className="text-lg">&rarr;</span>
                        </button>
                    </div>
                </div>
            )}

            {(user?.role === 'analyst' || user?.role === 'admin') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
                    <div className="bg-shuddho-card p-6 rounded-2xl border border-shuddho-red/30 shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-shuddho-red text-sm font-medium mb-2">High Severity Reports</h3>
                        <span className="text-4xl font-bold text-shuddho-red">0</span>
                    </div>
                    <div className="bg-shuddho-card p-6 rounded-2xl border border-shuddho-green/30 shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-shuddho-green text-sm font-medium mb-2">Verified Claims</h3>
                        <span className="text-4xl font-bold text-shuddho-green">0</span>
                    </div>
                    <div className="bg-shuddho-card p-6 rounded-2xl border border-shuddho-border shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Pending Reviews</h3>
                        <span className="text-4xl font-bold text-white">0</span>
                    </div>
                </div>
            )}

            <div className="bg-shuddho-card rounded-2xl border border-shuddho-border p-6 shadow-sm min-h-[400px] w-full">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                <div className="flex flex-col items-center justify-center h-full text-slate-500 mt-20">
                    <p>No recent activities found.</p>
                </div>
            </div>
        </div>
    );
}
