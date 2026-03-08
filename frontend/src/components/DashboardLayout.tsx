import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

const NavItem = ({ label, href, active }: any) => (
    <Link
        to={href}
        className={`px-1 py-2 text-sm font-medium transition-colors ${
            active ? 'text-white border-b-2 border-shuddho-neon' : 'text-slate-400 hover:text-slate-200'
        }`}
    >
        {label}
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
        <div className="min-h-screen bg-shuddho-bg font-sans text-white flex flex-col">
            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-shuddho-bg/95 backdrop-blur-md z-50 flex items-center px-8">
                <div className="flex-1 flex items-center gap-2">
                    {/* Logo (Approximating SHUDDHOBD with alternating font weights or simple text) */}
                    <Link to="/dashboard" className="text-xl tracking-[0.2em] flex items-center text-white">
                        <span className="font-bold">S</span>
                        <span className="font-light">H</span>
                        <span className="font-bold">U</span>
                        <span className="font-light">D</span>
                        <span className="font-bold">D</span>
                        <span className="font-light">H</span>
                        <span className="font-bold">O</span>
                        <span className="font-light">B</span>
                        <span className="font-bold">D</span>
                    </Link>
                </div>

                <nav className="flex items-center justify-center gap-8">
                    <NavItem label="Dashboard" href="/dashboard" active={location.pathname === '/dashboard'} />
                    <NavItem label="Reports" href="/dashboard/reports" active={location.pathname === '/dashboard/reports'} />
                    <NavItem label="Anonymous Report" href="/dashboard/anonymous-report" active={location.pathname === '/dashboard/anonymous-report'} />
                    <NavItem label="Map" href="/dashboard/map" active={location.pathname === '/dashboard/map'} />
                    <NavItem label="News" href="/dashboard/news" active={location.pathname === '/dashboard/news'} />
                </nav>

                <div className="flex-1 flex items-center justify-end gap-6">
                    {/* Dark Mode Toggle (Visual Only) */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-400">Dark Mode</span>
                        <div className="w-12 h-6 rounded-full bg-slate-700 p-1 flex items-center relative cursor-pointer pt-[2px]">
                            <div className="w-4 h-4 rounded-full bg-shuddho-neon absolute right-1 transition-all"></div>
                        </div>
                    </div>

                    {/* User Profile Avatar / Dropdown trigger */}
                    <Link to="/dashboard/profile" className="w-10 h-10 rounded-full bg-slate-700 border-2 border-transparent hover:border-shuddho-neon transition-colors overflow-hidden flex items-center justify-center relative group">
                        {user.profileImage ? (
                            <img src={`${import.meta.env.VITE_SERVER_URL || "http://localhost:5000"}${user.profileImage}`} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white font-medium">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                        )}
                        {/* Simple tooltip logout */}
                        <div className="absolute right-0 top-12 mt-2 w-32 bg-shuddho-card border border-shuddho-border rounded-lg shadow-xl py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                           <button onClick={(e) => { e.preventDefault(); handleLogout(); }} className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-slate-800">Logout</button>
                        </div>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-20 overflow-auto">
                <div className="max-w-7xl mx-auto px-8 py-10 w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
