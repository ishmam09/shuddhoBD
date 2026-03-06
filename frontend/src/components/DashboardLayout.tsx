import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, ChartBar, Map, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SidebarItem = ({ icon: Icon, label, href, active }: any) => (
    <Link
        to={href}
        className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
            ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
        <span className="font-medium text-sm">{label}</span>
    </Link>
);

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
            logout();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            {/* Sidebar */}
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 p-6 flex flex-col hidden md:flex">
                <div className="flex flex-col items-center gap-2 mb-10 px-2">
                    <img src="/assets/logo.png" alt="ShuddhoBD Logo" className="h-16 w-auto" />
                    <span className="text-xl font-bold tracking-tight text-slate-800">
                        ShuddhoBD
                    </span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" active={location.pathname === '/dashboard'} />
                    <SidebarItem icon={UserCircle} label="Profile" href="/dashboard/profile" active={location.pathname === '/dashboard/profile'} />
                    {user.role === 'citizen' && (
                        <>
                            <SidebarItem icon={FileText} label="My Reports" href="/dashboard/reports" active={location.pathname === '/dashboard/reports'} />
                            <SidebarItem icon={Map} label="Constituency Map" href="/dashboard/map" active={location.pathname === '/dashboard/map'} />
                        </>
                    )}
                    {(user.role === 'analyst' || user.role === 'admin') && (
                        <>
                            <SidebarItem icon={ChartBar} label="Analytics" href="/dashboard/analytics" active={location.pathname === '/dashboard/analytics'} />
                            <SidebarItem icon={FileText} label="All Reports" href="/dashboard/all-reports" active={location.pathname === '/dashboard/all-reports'} />
                        </>
                    )}
                </nav>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <Link
                        to="/dashboard/profile"
                        className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-100 group"
                    >
                        <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-medium shadow-sm transition-transform group-hover:scale-105">
                            {user.profileImage ? (
                                <img src={`${import.meta.env.VITE_SERVER_URL || "http://localhost:5000"}${user.profileImage}`} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name?.charAt(0).toUpperCase() || 'U'
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden text-left">
                            <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-emerald-700">{user.name || 'Citizen'}</p>
                            <p className="text-xs text-slate-400 truncate capitalize">View Profile</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-3 px-4 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
