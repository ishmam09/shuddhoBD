import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

type AuthMode = "login" | "register";

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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#fefce8] to-[#e0f2fe] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="relative max-w-5xl w-full">
                <div className="absolute -top-20 -left-10 h-40 w-40 rounded-full bg-[#f97316]/20 blur-3xl" />
                <div className="absolute -bottom-24 -right-6 h-36 w-36 rounded-full bg-[#22c55e]/30 blur-3xl" />

                <div className="relative mx-auto flex flex-col items-center">
                    <div className="mb-8 flex flex-col items-center gap-2">
                        <img src="/assets/logo.png" alt="ShuddhoBD" className="h-20 w-auto mb-2" />
                        <span className="text-xl font-bold tracking-tight text-slate-800">
                            ShuddhoBD
                        </span>
                    </div>

                    <div className="w-full max-w-xl rounded-3xl bg-white/90 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.15)] backdrop-blur">
                        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 text-center">
                            {isLogin ? "Good to see you again" : "Create your ShuddhoBD account"}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 text-center">
                            {isLogin
                                ? "Sign in with your civic account to continue."
                                : "Join as a citizen. Analyst and admin access are granted separately."}
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            {!isLogin && step === 1 && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-700" htmlFor="name">Full name</label>
                                        <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="e.g. Ayesha Rahman" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-700" htmlFor="nid">NID / Passport</label>
                                            <input id="nid" name="nid" type="text" required value={form.nid} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="Your NID" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-700" htmlFor="phone">Phone Number</label>
                                            <input id="phone" name="phone" type="text" required value={form.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="+8801XXXXXXXXX" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 md:col-span-1">
                                            <label className="text-xs font-medium text-slate-700" htmlFor="gender">Gender</label>
                                            <select id="gender" name="gender" required value={form.gender} onChange={handleChange as any} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                                                <option value="" disabled>Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5 md:col-span-1">
                                            <label className="text-xs font-medium text-slate-700" htmlFor="address">Address</label>
                                            <input id="address" name="address" type="text" required value={form.address} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="House, Street, City" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {(isLogin || step === 1) && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-700" htmlFor="email">Your email</label>
                                        <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="e.g. citizen@shuddhobd.com" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-700" htmlFor="password">Your password</label>
                                        <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="At least 6 characters" />
                                    </div>

                                    {!isLogin && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-700" htmlFor="confirmPassword">Confirm password</label>
                                            <input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} value={form.confirmPassword} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="Type password again" />
                                        </div>
                                    )}
                                </>
                            )}

                            {!isLogin && step === 2 && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700" htmlFor="otp">Verification Code (OTP)</label>
                                    <p className="text-xs text-slate-500 mb-2">We sent a 6-digit code to <span className="font-semibold">{form.email}</span></p>
                                    <input id="otp" name="otp" type="text" required value={form.otp} onChange={handleChange} className="w-full text-center tracking-[0.5em] font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-lg text-slate-900 placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="6-digit code" maxLength={6} />
                                </div>
                            )}

                            {error && (
                                <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-300/60 transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? isLogin
                                        ? "Signing in..."
                                        : step === 1 ? "Sending OTP..." : "Creating account..."
                                    : isLogin
                                        ? "Sign in"
                                        : step === 1 ? "Continue" : "Verify & Create Account"}
                            </button>

                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                <button type="button" className="text-[11px] text-slate-500 hover:text-slate-700">
                                    Forgot password?
                                </button>
                                <div className="text-[11px]">
                                    {isLogin ? (
                                        <>
                                            Don't have an account?{" "}
                                            <button type="button" onClick={() => { setMode("register"); setStep(1); setError(null); }} className="font-medium text-emerald-600 hover:text-emerald-700">
                                                Sign up
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            Already registered?{" "}
                                            <button type="button" onClick={() => { setMode("login"); setStep(1); setError(null); }} className="font-medium text-emerald-600 hover:text-emerald-700">
                                                Sign in
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <p className="mt-2 text-[11px] text-slate-400 text-center">
                                You'll join as a <span className="font-semibold">citizen</span>.{" "}
                                Analyst and admin roles are assigned by authorized staff only.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
