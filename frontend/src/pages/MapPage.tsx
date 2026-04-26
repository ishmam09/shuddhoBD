import { useState, useEffect, useMemo } from "react";
import { GoogleMap, Marker, InfoWindow, Circle } from "@react-google-maps/api";
import { useGoogleMapsLoad } from "../context/GoogleMapsContext";
import { MapPin } from "lucide-react";

export default function MapPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [selectedMarker, setSelectedMarker] = useState<any>(null);

    // Google maps setup
    const { isLoaded, loadError } = useGoogleMapsLoad();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // Fetch verified reports for mapping
                const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;
                const res = await fetch(`${API_BASE}/reports/public`, { credentials: 'omit' });
                // If public endpoint not existing, fallback to authenticated
                if (!res.ok) {
                    const fallbackRes = await fetch(`${API_BASE}/reports`, { credentials: 'include' });
                    const fallbackData = await fallbackRes.json();
                    setReports(fallbackData);
                    return;
                }
                const data = await res.json();
                setReports(data);
            } catch (err) {
                console.error("Failed to load map points", err);
            }
        };
        fetchReports();
    }, []);

    const center = useMemo(() => ({ lat: 23.6850, lng: 90.3563 }), []); // Center of Bangladesh

    if (loadError) return <div className="text-rose-400 p-8">Error loading maps. Make sure API key is correct.</div>;
    if (!isLoaded) {
        return (
            <div className="w-full h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
            </div>
        );
    }

    let totalValid = 0;
    const mappedIncidents: any[] = [];

    // Assign reports directly to exact precision coordinates
    reports.forEach(r => {
        if (!r.location) return;
        let lat, lng;
        if (r.location.match(/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/)) {
            const parts = r.location.split(',');
            lat = parseFloat(parts[0]);
            lng = parseFloat(parts[1]);
        } else {
            return;
        }
        if (isNaN(lat) || isNaN(lng)) return;

        totalValid++;
        mappedIncidents.push({ ...r, lat, lng });
    });

    return (
        <div className="w-full h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <MapPin className="text-indigo-500 w-8 h-8" />
                    National Map
                </h1>
                <p className="text-slate-400 mt-2">Visually explore {totalValid} reported incidents mapped exactly onto their submitted coordinates.</p>
            </div>

            <div
                className="w-full relative shadow-[0_0_50px_-15px_rgba(99,102,241,0.6)] rounded-3xl overflow-hidden border-4 border-indigo-500/40 outline outline-4 outline-offset-4 outline-slate-800"
                style={{ height: "75vh", minHeight: "500px" }}
            >
                {loadError && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-rose-500/90 text-white text-sm font-bold rounded-lg shadow-lg backdrop-blur-sm shadow-rose-500/20">
                        Map Error: {(loadError as any)?.message || "Failed to load"}
                    </div>
                )}
                {/* Debug info to verify key is actually being loaded in Vercel */}
                <div className="absolute bottom-2 right-2 z-10 px-2 py-1 bg-black/50 text-[8px] text-slate-400 rounded">
                    Key: {(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "MISSING").substring(0, 4)}...{(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "MISSING").slice(-4)}
                </div>
                <GoogleMap
                    zoom={7}
                    center={center}
                    mapContainerStyle={{ width: "100%", height: "100%", minHeight: "500px" }}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        restriction: {
                            latLngBounds: { north: 26.7, south: 20.7, west: 88.0, east: 92.7 },
                            strictBounds: true,
                        },
                        minZoom: 7,
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                            {
                                featureType: "administrative.locality",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }],
                            },
                            {
                                featureType: "administrative.province",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }],
                            },
                            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                        ],
                    }}
                >
                    {/* Precision Exact Location Heatmap Circles */}
                    {mappedIncidents.map((report, i) => {
                        // Scan explicitly 10km localized radius area natively to the report 
                        const localDensity = mappedIncidents.filter(other =>
                            Math.sqrt(Math.pow(other.lat - report.lat, 2) + Math.pow(other.lng - report.lng, 2)) < 0.1
                        ).length;

                        const percentage = totalValid > 0 ? (localDensity / totalValid) * 100 : 0;
                        let color = '#22c55e'; // Green < 25% (low severity)
                        if (percentage > 75) color = '#ef4444'; // Red > 75% (high severity mapping)
                        else if (percentage >= 50) color = '#f97316'; // Orange 50-75%
                        else if (percentage >= 25) color = '#eab308'; // Yellow 25-50%

                        return (
                            <Circle
                                key={`local-circle-${i}`}
                                center={{ lat: report.lat, lng: report.lng }}
                                radius={4000} // Precise small localized circle (4km)
                                options={{
                                    fillColor: color,
                                    fillOpacity: 0.4,
                                    strokeColor: color,
                                    strokeOpacity: 0.8,
                                    strokeWeight: 2,
                                    clickable: false
                                }}
                            />
                        );
                    })}

                    {/* Individual Incident Plot Pins */}
                    {mappedIncidents.map((report) => (
                        <Marker
                            key={report._id}
                            position={{ lat: report.lat, lng: report.lng }}
                            onClick={() => setSelectedMarker(report)}
                        />
                    ))}

                    {selectedMarker && (
                        <InfoWindow
                            position={{ lat: parseFloat(selectedMarker.location.split(',')[0]), lng: parseFloat(selectedMarker.location.split(',')[1]) }}
                            onCloseClick={() => setSelectedMarker(null)}
                        >
                            <div className="text-black font-sans p-2 max-w-[200px]">
                                <h3 className="font-bold text-sm mb-1">{selectedMarker.title}</h3>
                                <p className="text-xs text-slate-700 line-clamp-2 mb-2">{selectedMarker.description}</p>
                                <div className="text-[10px] font-bold uppercase text-rose-600 bg-rose-100 rounded px-2 py-0.5 inline-block">
                                    {selectedMarker.severityScore}% Risk - {selectedMarker.category}
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </div>

            {/* Severity Heatmap Legend */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm self-center">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#22c55e] border-2 border-[#22c55e]/20 shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-slate-300 text-sm font-bold tracking-wide">0% - 25%</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#eab308] border-2 border-[#eab308]/20 shadow-[0_0_15px_rgba(234,179,8,0.6)]"></div>
                    <span className="text-slate-300 text-sm font-bold tracking-wide">25% - 50%</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#f97316] border-2 border-[#f97316]/20 shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
                    <span className="text-slate-300 text-sm font-bold tracking-wide">50% - 75%</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#ef4444] border-2 border-[#ef4444]/20 shadow-[0_0_15px_rgba(239,68,68,0.6)]"></div>
                    <span className="text-slate-300 text-sm font-bold tracking-wide">75% - 100%</span>
                </div>
            </div>
        </div>
    );
}
