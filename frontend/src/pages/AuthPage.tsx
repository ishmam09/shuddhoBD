import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, CreditCard, MapPin, ShieldAlert } from "lucide-react";

type AuthMode = "login" | "register" | "forgot_password";

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export default function AuthPage() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState<AuthMode>("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2>(1);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        nid: "",
        phone: "",
        address: "",
        gender: "",
        otp: "",
    });

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (mode === "forgot_password") {
            if (step === 1) {
                try {
                    const res = await fetch(`${API_BASE}/auth/forgot-password-otp`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: form.email }),
                    });
                    if (!res.ok) {
                        const data = await res.json().catch(() => null);
                        throw new Error(data?.message || "Failed to send reset OTP");
                    }
                    setStep(2);
                } catch (err: any) {
                    setError(err.message || "Failed to send reset OTP");
                } finally {
                    setLoading(false);
                }
                return;
            } else if (step === 2) {
                if (form.password !== form.confirmPassword) {
                    setError("Passwords do not match");
                    setLoading(false);
                    return;
                }
                try {
                    const res = await fetch(`${API_BASE}/auth/reset-password`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            email: form.email, 
                            otp: form.otp, 
                            newPassword: form.password 
                        }),
                    });
                    if (!res.ok) {
                        const data = await res.json().catch(() => null);
                        throw new Error(data?.message || "Failed to reset password");
                    }
                    setMode("login");
                    setStep(1);
                    setForm(prev => ({ ...prev, password: "", confirmPassword: "", otp: "" }));
                    alert("Password reset successfully. Please login with your new password.");
                } catch (err: any) {
                    setError(err.message || "Failed to reset password");
                } finally {
                    setLoading(false);
                }
                return;
            }
        }

        if (mode === "register" && step === 1) {
            if (form.password !== form.confirmPassword) {
                setError("Passwords do not match");
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/auth/send-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ email: form.email }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    throw new Error(data?.message || "Failed to send OTP");
                }

                setStep(2);
            } catch (err: any) {
                setError(err.message || "Failed to setup registration");
            } finally {
                setLoading(false);
            }
            return;
        }

        try {
            const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
            const body: any = {
                email: form.email,
                password: form.password,
            };
            if (mode === "register") {
                body.name = form.name;
                body.nid = form.nid;
                body.phone = form.phone;
                body.address = form.address;
                body.gender = form.gender;
                body.otp = form.otp;
            }

            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || "Something went wrong");
            }

            const data = await res.json();
            setUser(data.user);
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to authenticate");
        } finally {
            setLoading(false);
        }
    };

    const isLogin = mode === "login";
    const isRegister = mode === "register";
    const isForgot = mode === "forgot_password";

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative max-w-5xl w-full z-10">
                <div className="relative mx-auto flex flex-col items-center">
                    <div className="mb-8 flex flex-col items-center gap-2">
                        <img src="/assets/logo.png" alt="ShuddhoBD" className="h-20 w-auto mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                        <span className="text-xl font-bold tracking-tight text-white">
                            ShuddhoBD
                        </span>
                    </div>

                    <div className="w-full max-w-xl rounded-3xl bg-slate-900/60 p-8 shadow-2xl border border-slate-700/80 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                        <div className="text-center mb-8">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                                {isLogin ? "Good to see you again" : isForgot ? "Reset your password" : "Create your account"}
                            </h1>
                            <p className="mt-2 text-sm text-slate-400">
                                {isLogin
                                    ? "Sign in with your civic account to continue."
                                    : isForgot
                                        ? "Enter your email to receive a password reset code."
                                        : "Join as a citizen. Analyst and admin access are granted separately."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {isRegister && step === 1 && (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold uppercase tracking-widest text-xs">
                                        <ShieldAlert className="w-4 h-4" />
                                        <h2>Personal Information</h2>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider" htmlFor="name">Full name</label>
                                        <div className="relative">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all" placeholder="e.g. Ayesha Rahman" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider" htmlFor="nid">NID / Passport</label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input id="nid" name="nid" type="text" required value={form.nid} onChange={handleChange} className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all" placeholder="Your NID" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider" htmlFor="phone">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input id="phone" name="phone" type="text" required value={form.phone} onChange={handleChange} className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all" placeholder="+8801XXXXXXXXX" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2 md:col-span-1">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider" htmlFor="gender">Gender</label>
                                            <div className="relative">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <select id="gender" name="gender" required value={form.gender} onChange={handleChange} className="w-full appearance-none rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all">
                                                    <option value="" disabled className="text-slate-500 bg-slate-900">Select Gender</option>
                                                    <option value="male" className="bg-slate-900 text-white">Male</option>
                                                    <option value="female" className="bg-slate-900 text-white">Female</option>
                                                    <option value="other" className="bg-slate-900 text-white">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-1">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider" htmlFor="address">Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input id="address" name="address" type="text" required value={form.address} onChange={handleChange} className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all" placeholder="House, Street, City" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-slate-700/50 my-6"></div>
                                </div>
                            )}

                            {(isLogin || (isRegister && step === 1)) && (
                                <div className="space-y-5">
                                    {isRegister && (
                                        <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold uppercase tracking-widest text-xs">
                                            <Lock className="w-4 h-4" />
                                            <h2>Account Credentials</h2>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider" htmlFor="email">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all" placeholder="e.g. citizen@shuddhobd.com" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider" htmlFor="password">Your password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all" placeholder="At least 6 characters" />
                                        </div>
                                    </div>

                                    {isRegister && (
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider" htmlFor="confirmPassword">Confirm password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} value={form.confirmPassword} onChange={handleChange} className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all" placeholder="Type password again" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isRegister && step === 2 && (
                                <div className="space-y-4 p-6 bg-indigo-500/5 border-2 border-indigo-500/20 rounded-2xl animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-3 text-indigo-300">
                                        <Lock className="w-5 h-5" />
                                        <h3 className="font-bold text-[10px] uppercase tracking-widest">Verify Email</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" htmlFor="otp">Enter 6-digit Code</label>
                                        <input id="otp" name="otp" type="text" required value={form.otp} onChange={handleChange} className="w-full bg-black/40 border-2 border-indigo-500/30 rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-white focus:border-indigo-500 focus:outline-none placeholder:text-slate-800" placeholder="· · · · · ·" maxLength={6} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-center">We've sent a code to <span className="text-white font-medium">{form.email}</span></p>
                                </div>
                            )}

                            {isForgot && step === 1 && (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold uppercase tracking-widest text-xs">
                                        <Lock className="w-4 h-4" />
                                        <h2>Account Recovery</h2>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider" htmlFor="email">Registered Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all" placeholder="e.g. citizen@shuddhobd.com" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isForgot && step === 2 && (
                                <div className="space-y-5">
                                    <div className="space-y-4 p-6 bg-indigo-500/5 border-2 border-indigo-500/20 rounded-2xl animate-in zoom-in-95 duration-300">
                                        <div className="flex items-center gap-3 text-indigo-300">
                                            <Lock className="w-5 h-5" />
                                            <h3 className="font-bold text-[10px] uppercase tracking-widest">Verify Reset Code</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" htmlFor="otp">Enter 6-digit Code</label>
                                            <input id="otp" name="otp" type="text" required value={form.otp} onChange={handleChange} className="w-full bg-black/40 border-2 border-indigo-500/30 rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-white focus:border-indigo-500 focus:outline-none placeholder:text-slate-800" placeholder="· · · · · ·" maxLength={6} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 text-center">We've sent a code to <span className="text-white font-medium">{form.email}</span></p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider" htmlFor="password">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all" placeholder="At least 6 characters" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider" htmlFor="confirmPassword">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} value={form.confirmPassword} onChange={handleChange} className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 pl-12 pr-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all" placeholder="Type new password again" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {loading
                                    ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {isLogin ? "Signing in..." : isForgot ? "Processing..." : step === 1 ? "Sending OTP..." : "Creating account..."}
                                        </>
                                    )
                                    : isLogin
                                        ? "Sign in Securely"
                                        : isForgot
                                            ? (step === 1 ? "Send Reset Code" : "Update Password")
                                            : step === 1 ? "Continue" : "Verify & Create Account"}
                            </button>

                            <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400 border-t border-slate-700/50 mt-6">
                                {isLogin && (
                                    <button type="button" onClick={() => { setMode("forgot_password"); setStep(1); setError(null); setForm(prev => ({ ...prev, password: "", confirmPassword: "", otp: "" })) }} className="text-xs hover:text-white transition-colors">
                                        Forgot password?
                                    </button>
                                )}
                                <div className="text-xs ml-auto">
                                    {isLogin ? (
                                        <>
                                            Don't have an account?{" "}
                                            <button type="button" onClick={() => { setMode("register"); setStep(1); setError(null); }} className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                                Sign up
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            Already registered?{" "}
                                            <button type="button" onClick={() => { setMode("login"); setStep(1); setError(null); }} className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                                Sign in
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
