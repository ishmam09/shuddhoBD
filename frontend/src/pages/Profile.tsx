import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User as UserIcon, Phone, MapPin, Trash2, ShieldAlert, CheckCircle2, AlertCircle, Camera, Mail, Lock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5001";

export default function Profile() {
    const { user, setUser, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Deletion state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    // OTP state
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });

    // Sync form with user data when it loads
    useEffect(() => {
        if (user) {
            setForm({
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${API_BASE}/auth/profile`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ ...form, otp: otpSent ? otp : undefined }),
            });

            const data = await res.json();

            if (res.status === 202 && data.requiresOtp) {
                setOtpSent(true);
                setMessage({ type: 'success', text: data.message || "Please enter the OTP sent to your email." });
                return;
            }

            if (!res.ok) throw new Error(data.message || "Failed to update profile");

            setUser(data.user);
            setMessage({ type: 'success', text: "Profile updated successfully!" });
            setOtpSent(false);
            setOtp("");
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${API_BASE}/auth/profile-image`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to upload image");

            setUser({ ...user!, profileImage: data.profileImage });
            setMessage({ type: 'success', text: "Profile image updated!" });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) return;
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${API_BASE}/auth/profile`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ password: deletePassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete account");

            logout();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
            setLoading(false);
        }
    };

    const userImageUrl = user?.profileImage
        ? (user.profileImage.startsWith('http') ? user.profileImage : `${SERVER_URL}${user.profileImage}`)
        : null;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 h-full flex flex-col">
            <header className="mb-10 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-full mb-4 border border-indigo-500/20">
                    <UserIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Profile Settings</h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Manage your account details, photo, and security preferences.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Information update section */}
                <div className="lg:col-span-8 bg-slate-900/60 border border-slate-700/80 shadow-2xl rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full"></div>

                    <div className="flex items-center gap-2 mb-8 text-indigo-300 font-bold uppercase tracking-widest text-sm">
                        <ShieldAlert className="w-5 h-5" />
                        <h2>Personal Information</h2>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-8 relative z-10">
                        {otpSent && (
                            <div className="space-y-4 p-6 bg-indigo-500/5 border-2 border-indigo-500/20 rounded-2xl animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-3 text-indigo-300">
                                    <Lock className="w-5 h-5" />
                                    <h3 className="font-bold text-sm uppercase tracking-widest">Verify the change</h3>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enter 6-digit Verification Code</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="· · · · · ·"
                                        className="w-full bg-black/40 border-2 border-indigo-500/30 rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-white focus:border-indigo-500 focus:outline-none placeholder:text-slate-800"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 text-center">We've sent a code to your registered email address.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                    Full Name <span className="text-[10px] lowercase font-normal text-slate-500">(Read-only)</span>
                                </label>
                                <input
                                    value={user?.name || ""}
                                    readOnly
                                    className="w-full rounded-2xl border-2 border-slate-700/30 bg-black/20 px-5 py-4 text-slate-400 cursor-not-allowed font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                    Gender <span className="text-[10px] lowercase font-normal text-slate-500">(Read-only)</span>
                                </label>
                                <input
                                    value={user?.gender || "Not specified"}
                                    readOnly
                                    className="w-full rounded-2xl border-2 border-slate-700/30 bg-black/20 px-5 py-4 text-slate-400 cursor-not-allowed capitalize font-medium transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                    NID Number <span className="text-[10px] lowercase font-normal text-slate-500">(Read-only)</span>
                                </label>
                                <input
                                    value={user?.nid || "N/A"}
                                    readOnly
                                    className="w-full rounded-2xl border-2 border-slate-700/30 bg-black/20 px-5 py-4 text-slate-400 cursor-not-allowed font-medium transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (otpSent && otp.length !== 6)}
                            className="w-full group relative flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {otpSent ? "Verifying Code..." : "Syncing Profile..."}
                                </>
                            ) : (
                                otpSent ? "Confirm & Save Changes" : "Update Profile Details"
                            )}
                        </button>
                    </form>
                </div>

                {/* Account info and photo upload */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-slate-900/60 border border-slate-700/80 shadow-xl rounded-3xl p-8 backdrop-blur-md overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                        <div className="text-center relative pt-4">
                            <div className="relative group mx-auto w-32 h-32 mb-6">
                                <div className="h-full w-full rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl ring-4 ring-slate-800 transition-transform group-hover:scale-105 duration-300">
                                    {userImageUrl ? (
                                        <img src={userImageUrl} alt={user?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 p-2.5 bg-indigo-600 rounded-full shadow-lg border-2 border-slate-900 text-white hover:bg-indigo-500 hover:scale-110 transition-all z-10"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <h3 className="font-extrabold text-white text-2xl tracking-tight">{user?.name}</h3>
                            <p className="text-sm font-bold text-indigo-300 uppercase tracking-[0.2em] mt-2 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 inline-block">{user?.role}</p>
                        </div>

                        <div className="space-y-4 pt-8 mt-8 border-t border-slate-700/50">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Account status</span>
                                <span className="text-emerald-400 font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Verified Active
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Member since</span>
                                <span className="text-white font-medium">March 2024</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-700/50">
                            <button
                                onClick={(e) => { e.preventDefault(); logout(); fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }); }}
                                className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-2xl py-4 font-bold text-sm transition-all shadow-lg active:scale-95"
                            >
                                <LogOut className="w-5 h-5 text-slate-400" />
                                Sign Out Securely
                            </button>
                        </div>
                    </section>

                    <section className="bg-rose-500/5 rounded-3xl p-8 border-2 border-rose-500/20 border-dashed relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-rose-400 font-extrabold uppercase tracking-wider text-xs">
                                <ShieldAlert className="w-4 h-4" />
                                <h2>Danger Zone</h2>
                            </div>
                            <p className="text-xs text-rose-200/60 mb-6 leading-relaxed">
                                Permanent account deletion will erase all your reports, history, and personal data from our secure servers. This action is <strong className="text-rose-400">irreversible</strong>.
                            </p>

                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-2xl py-3 text-sm font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete My Account
                                </button>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <input
                                        type="password"
                                        placeholder="Enter password to confirm"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="w-full rounded-xl border-2 border-rose-500/30 bg-black/40 px-4 py-3 text-white text-sm focus:border-rose-500 focus:outline-none placeholder:text-rose-900/40"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="flex-1 bg-rose-600 text-white rounded-xl py-3 text-xs font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-900/40"
                                        >
                                            Confirm Delete
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="flex-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl py-3 text-xs font-bold hover:bg-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

const LogOut = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);
