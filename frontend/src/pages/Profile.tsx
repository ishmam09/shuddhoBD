import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { User as UserIcon, Phone, MapPin, Trash2, ShieldAlert, CheckCircle2, AlertCircle, Camera, Mail } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export default function Profile() {
    const { user, setUser, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Deletion state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });

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
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update profile");

            setUser(data.user);
            setMessage({ type: 'success', text: "Profile updated successfully!" });
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

    const userImageUrl = user?.profileImage ? `${SERVER_URL}${user.profileImage}` : null;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile Settings</h1>
                <p className="text-slate-500 mt-1">Manage your account details, photo, and security preferences.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information update section */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-6 text-slate-800 font-semibold">
                            <UserIcon className="w-5 h-5 text-emerald-500" />
                            <h2>Personal Information</h2>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        Full Name <span className="text-[10px] lowercase font-normal">(Read-only)</span>
                                    </label>
                                    <input
                                        value={user?.name || ""}
                                        disabled
                                        className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        Gender <span className="text-[10px] lowercase font-normal">(Read-only)</span>
                                    </label>
                                    <input
                                        value={user?.gender || "Not specified"}
                                        disabled
                                        className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed capitalize font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        NID Number <span className="text-[10px] lowercase font-normal">(Read-only)</span>
                                    </label>
                                    <input
                                        value={user?.nid || "N/A"}
                                        disabled
                                        className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50"
                            >
                                {loading ? "Updating..." : "Save Changes"}
                            </button>
                        </form>
                    </section>
                </div>

                {/* Account info and photo upload */}
                <div className="space-y-6">
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
                        <div className="text-center relative">
                            <div className="relative group mx-auto w-24 h-24 mb-4">
                                <div className="h-full w-full rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-100 transition-transform group-hover:scale-105">
                                    {userImageUrl ? (
                                        <img src={userImageUrl} alt={user?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-emerald-600 transition-colors"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg">{user?.name}</h3>
                            <p className="text-xs text-slate-400 capitalize bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100 mt-1">{user?.role}</p>
                        </div>
                        <div className="space-y-3 pt-6 mt-6 border-t border-slate-50">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Account status</span>
                                <span className="text-emerald-500 font-medium flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Member since</span>
                                <span className="text-slate-700 font-medium">Mar 2024</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50">
                            <button
                                onClick={(e) => { e.preventDefault(); logout(); fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }); }}
                                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 rounded-xl py-2.5 font-semibold text-sm hover:bg-slate-200 transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Log Out
                            </button>
                        </div>
                    </section>

                    <section className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100 border-dashed">
                        <div className="flex items-center gap-2 mb-3 text-rose-800 font-bold text-sm">
                            <ShieldAlert className="w-4 h-4" />
                            <h2>Danger Zone</h2>
                        </div>
                        <p className="text-[11px] text-rose-600 mb-4 leading-relaxed whitespace-pre-wrap">
                            Deleting your account is permanent and cannot be undone. All your reports and data will be cleared from ShuddhoBD.
                        </p>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full flex items-center justify-center gap-2 bg-white text-rose-600 border border-rose-200 rounded-xl py-2 text-xs font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Account
                            </button>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <input
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none shadow-inner"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="flex-1 bg-rose-600 text-white rounded-lg py-2 text-[11px] font-bold hover:bg-rose-700 transition-colors"
                                    >
                                        Yes, Delete
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 bg-white text-slate-600 border border-slate-200 rounded-lg py-2 text-[11px] font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
