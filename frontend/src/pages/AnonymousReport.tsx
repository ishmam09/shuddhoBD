import { useState, useRef } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Shield, MapPin, FileText, Camera, UploadCloud, X, Lock, CheckCircle2, Plus } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export default function AnonymousReport() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
    });
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ trackingId: string; message: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 5) {
            alert("You can only upload up to 5 files.");
            return;
        }

        const newImages = [...images, ...files].slice(0, 5);
        setImages(newImages);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews].slice(0, 5));

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const clearImages = () => {
        setImages([]);
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("location", form.location);
            images.forEach((image) => {
                formData.append("images", image);
            });

            const res = await fetch(`${API_BASE}/reports/anonymous`, {
                method: "POST",
                credentials: "include", // Requires the auth cookie since user must be logged in
                body: formData, // Sending FormData instead of JSON to handle the file
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || data?.message || "Failed to submit anonymous report");
            }

            const data = await res.json();
            setSuccessData({
                trackingId: data.trackingId,
                message: data.message || "Report submitted anonymously and securely.",
            });

            // Reset form
            setForm({ title: "", description: "", location: "" });
            clearImages();
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 h-full flex flex-col">
            <header className="mb-10 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-full mb-4 border border-indigo-500/20">
                    <Shield className="w-8 h-8 text-indigo-400" />
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Secure Anonymous Reporting</h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Expose corruption safely. Your identity is structurally severed from your submission before saving.
                </p>
            </header>

            {successData ? (
                <div className="max-w-2xl mx-auto w-full">
                    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-10 text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
                        {/* Decorative background blur */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

                        <div className="relative z-10 space-y-8">
                            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-indigo-500/10 mb-2">
                                <CheckCircle2 className="w-10 h-10 text-indigo-400" />
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-indigo-400 mb-2">Submission Encrypted & Sent</h2>
                                <p className="text-indigo-200/70 text-lg">{successData.message}</p>
                            </div>

                            <div className="bg-black/60 rounded-2xl p-8 border border-indigo-500/20 shadow-inner">
                                <p className="text-indigo-300 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Your Secure Reference Code</p>
                                <div className="text-4xl sm:text-5xl font-mono text-white font-bold tracking-widest bg-gradient-to-r from-indigo-500/20 to-purple-500/20 py-4 rounded-xl border border-indigo-500/30">
                                    {successData.trackingId}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-left bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                                <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-rose-200/90 leading-relaxed">
                                    <strong>CRITICAL:</strong> Save this code immediately. Because your report is strictly anonymous, this is the <em>only</em> way you or anyone else can track this submission. It cannot be recovered if lost.
                                </p>
                            </div>

                            <button
                                onClick={() => setSuccessData(null)}
                                className="mt-8 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/25 w-full sm:w-auto"
                            >
                                Submit Another Report
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Info & Trust */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-teal-400" />
                                How Anonymity Works
                            </h3>
                            <ul className="space-y-4 text-sm text-slate-300">
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-500/20 flex flex-shrink-0 flex-col items-center justify-center text-teal-400 font-bold text-xs border border-teal-500/30">1</div>
                                    <p>Your account verifies you are a real person to prevent spam attacks.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-500/20 flex flex-shrink-0 flex-col items-center justify-center text-teal-400 font-bold text-xs border border-teal-500/30">2</div>
                                    <p>Upon submission, the server explicitly separates your user ID from the report data.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-500/20 flex flex-shrink-0 flex-col items-center justify-center text-teal-400 font-bold text-xs border border-teal-500/30">3</div>
                                    <p>IP addresses and browser fingerprints are discarded entirely.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-500/20 flex flex-shrink-0 flex-col items-center justify-center text-teal-400 font-bold text-xs border border-teal-500/30">4</div>
                                    <p>A mathematically random tracking ID is generated for your eyes only.</p>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 backdrop-blur-sm">
                            <h4 className="text-sm font-bold text-amber-500 mb-2">Safety Tip</h4>
                            <p className="text-xs text-amber-200/80 leading-relaxed">
                                Ensure your description or uploaded images do not contain metadata, reflections, or context clues that could indirectly reveal your identity.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: the Form */}
                    <div className="lg:col-span-8 bg-slate-900/60 border border-slate-700/80 shadow-2xl rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full"></div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            {/* Layout chunk 1: Text details */}
                            <div className="space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-indigo-300 mb-2 uppercase tracking-wider" htmlFor="title">
                                        <FileText className="w-4 h-4" /> Report Title
                                    </label>
                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        required
                                        value={form.title}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 px-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all"
                                        placeholder="e.g. Unexplained delays in Ward 4 Bridge construction"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-indigo-300 mb-2 uppercase tracking-wider" htmlFor="location">
                                        <MapPin className="w-4 h-4" /> Specific Location
                                    </label>
                                    <input
                                        id="location"
                                        name="location"
                                        type="text"
                                        required
                                        value={form.location}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 px-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all"
                                        placeholder="e.g. Intersection of Road 12 & Main Avenue, Dhaka"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-indigo-300 mb-2 uppercase tracking-wider" htmlFor="description">
                                        <Shield className="w-4 h-4" /> Detailed Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        required
                                        rows={6}
                                        value={form.description}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border-2 border-slate-700/50 bg-black/40 px-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none transition-all resize-none"
                                        placeholder="Provide as much detailed evidence as possible. Do not include your name or contact information."
                                    />
                                </div>
                            </div>

                            <hr className="border-t border-slate-700/50" />

                            {/* Layout chunk 2: Image Upload */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-indigo-300 mb-4 uppercase tracking-wider">
                                    <Camera className="w-4 h-4" /> Evidence Files (Max 5, Image/Video)
                                </label>

                                <div className="mt-2 text-center w-full">
                                    {imagePreviews.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-4 justify-center">
                                                {imagePreviews.map((url, index) => {
                                                    const isVideo = images[index]?.type.startsWith("video/");
                                                    return (
                                                        <div key={index} className="relative inline-block rounded-2xl overflow-hidden border-2 border-indigo-500/50 outline outline-4 outline-black/20 shadow-xl group w-32 h-32">
                                                            {isVideo ? (
                                                                <video src={url} className="w-full h-full object-cover align-bottom" />
                                                            ) : (
                                                                <img src={url} alt={`Evidence ${index}`} className="w-full h-full object-cover align-bottom" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newImages = [...images];
                                                                        newImages.splice(index, 1);
                                                                        setImages(newImages);

                                                                        const newPreviews = [...imagePreviews];
                                                                        URL.revokeObjectURL(newPreviews[index]);
                                                                        newPreviews.splice(index, 1);
                                                                        setImagePreviews(newPreviews);
                                                                    }}
                                                                    className="bg-rose-600 text-white rounded-full p-2 hover:bg-rose-500 transform hover:scale-110 transition-all shadow-lg"
                                                                    title="Remove item"
                                                                >
                                                                    <X className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {imagePreviews.length < 5 && (
                                                    <div
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 border-2 border-slate-700 border-dashed rounded-2xl hover:bg-slate-800/50 hover:border-indigo-500/50 transition-colors group shadow-xl"
                                                    >
                                                        <Plus className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 mb-2 transition-colors" />
                                                        <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-300">Add More</span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={clearImages}
                                                className="mt-4 bg-rose-600/20 border border-rose-500/50 text-rose-400 rounded-xl px-6 py-2 hover:bg-rose-600 hover:text-white transform transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
                                                title="Remove all media"
                                            >
                                                <X className="w-4 h-4" /> Clear All
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="cursor-pointer flex flex-col items-center justify-center w-full h-40 border-2 border-slate-700 border-dashed rounded-2xl hover:bg-slate-800/50 hover:border-indigo-500/50 transition-colors group"
                                        >
                                            <div className="p-4 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 transition-colors mb-3">
                                                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-400" />
                                            </div>
                                            <p className="text-sm text-slate-400 font-medium group-hover:text-indigo-300">
                                                Click to upload secure evidence (Max 5)
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">Images/Videos Supported • <span className="text-indigo-400/80">Powered by Cloudinary</span></p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*,video/*"
                                        multiple
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-4 mx-2">
                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                    <UploadCloud className="w-5 h-5 text-indigo-400" />
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    <span className="text-indigo-400 font-bold">Cloud Security:</span> Your evidence is handled via Cloudinary's secure upload stream, ensuring no local traces are left on the server.
                                </p>
                            </div>

                            {error && (
                                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 flex items-center gap-2">
                                    <X className="w-4 h-4" /> {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Encrypting & Dispatching...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                                        Submit Secure Report
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
