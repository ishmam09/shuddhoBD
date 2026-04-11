import { useState, useEffect } from "react";
import { Search, ListFilter, Plus } from "lucide-react";
import SeatCard from "../components/SeatCard";
import AdminSeatModal from "../components/AdminSeatModal";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export default function AssetData() {
    const { user } = useAuth();
    const [seats, setSeats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("default");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState<any>(null);

    const fetchSeats = async () => {
        try {
            const res = await fetch(`${API_BASE}/seats`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setSeats(data);
            }
        } catch (error) {
            console.error("Failed to fetch seats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeats();
    }, []);

    const handleEdit = (seat: any) => {
        setSelectedSeat(seat);
        setModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedSeat(null);
        setModalOpen(true);
    };

    const handleSaved = () => {
        setModalOpen(false);
        fetchSeats();
    };

    // Filter and sort
    const filtered = seats.filter(s =>
        s.seatName.toLowerCase().includes(search.toLowerCase()) ||
        s.mpName.toLowerCase().includes(search.toLowerCase()) ||
        s.party.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'default') {
        filtered.sort((a, b) => a.order - b.order);
    } else if (sortBy === 'name_desc') {
        filtered.sort((a, b) => b.seatName.localeCompare(a.seatName));
    } else if (sortBy === 'growth_high') {
        filtered.sort((a, b) => b.fiveYearGrowthPercentage - a.fiveYearGrowthPercentage);
    } else if (sortBy === 'growth_low') {
        filtered.sort((a, b) => a.fiveYearGrowthPercentage - b.fiveYearGrowthPercentage);
    }

    // Group by division while maintaining the sequential order using arrays
    const groupedArray = filtered.reduce((acc: any[], seat) => {
        let div = acc.find(d => d.division === seat.division);
        if (!div) {
            div = { division: seat.division, seats: [] };
            acc.push(div);
        }
        div.seats.push(seat);
        return acc;
    }, []);

    return (
        <div className="w-full flex flex-col gap-8 pb-12">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Public Asset Records</h1>
                    <p className="page-description">
                        Explore the declared wealth and 5-year asset growth of parliamentary candidates across all divisions.
                        Records are fetched securely from public civic archives.
                    </p>
                </div>
                {user?.role === 'admin' && (
                    <button onClick={handleAdd} className="btn-primary">
                        <Plus className="w-5 h-5" />
                        Add New Seat
                    </button>
                )}
            </header>

            {/* Two Separate Filter Bars */}
            <div className="filter-bar-wrapper">

                {/* Search Segment (~75%) */}
                <div className="filter-box-search">
                    <Search className="filter-icon-search" />
                    <input
                        type="text"
                        placeholder=" Search by seat name, candidate, or party..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="filter-input"
                    />
                </div>

                {/* Sort Segment (~25%) */}
                <div className="filter-box-sort">
                    <ListFilter className="filter-icon-sort" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="default" className="bg-slate-900 text-white">Default Order</option>
                        <option value="name_desc" className="bg-slate-900 text-white">Seat Name (Z-A)</option>
                        <option value="growth_high" className="bg-slate-900 text-white">Highest Asset Growth</option>
                        <option value="growth_low" className="bg-slate-900 text-white">Lowest Asset Growth</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : groupedArray.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <p className="text-lg font-medium text-slate-400">No seats found matching your criteria</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {groupedArray.map((group: any) => (
                        <div key={group.division} className="relative">
                            <div className="flex items-center gap-4 mb-8 sticky top-48 z-20 bg-shuddho-bg/90 backdrop-blur-xl py-3 rounded-2xl px-2">
                                <h2 className="text-2xl font-black text-white tracking-tight">{group.division}</h2>
                                <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{group.seats.length} Seats</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {group.seats.map((seat: any) => (
                                    <SeatCard key={seat._id} seat={seat} onEdit={handleEdit} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <AdminSeatModal
                    seat={selectedSeat}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
