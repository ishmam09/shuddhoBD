export const PARTY_DATA = [
    { name: "Bangladesh Awami League", color: "#16a34a", symbol: "⛵", abbr: "AL" },
    { name: "Bangladesh Nationalist Party", color: "#2563eb", symbol: "🌾", abbr: "BNP" },
    { name: "Jatiya Party", color: "#eab308", symbol: "🚜", abbr: "JP" },
    { name: "Independent", color: "#64748b", symbol: "🧍", abbr: "IND" }
];

export const PROJECTS_LIST = [
    "Building or upgrading local hospitals and health clinics",
    "Ensuring 24/7 clean drinking water supply for the community",
    "Developing modern drainage systems to reduce flooding",
    "Establishing emergency ambulance services in the area",
    "Creating employment programs for unemployed youth",
    "Building safe roads and traffic management systems",
    "Installing solar-powered street lights to save energy",
    "Providing free education materials for poor students",
    "Developing women safety programs and helplines",
    "Setting up disaster shelters for floods or cyclones",
    "Improving public transportation facilities",
    "Launching anti-corruption and transparency initiatives",
    "Creating digital service centers for government services",
    "Supporting farmers with training and modern equipment",
    "Developing local markets and business zones to boost the economy",
    "Providing housing support for low-income families",
    "Building sports complexes and youth development centers",
    "Establishing recycling and environmental protection programs",
    "Improving internet and digital connectivity in rural areas",
    "Creating public libraries and learning centers",
    "Building or repairing local roads",
    "Installing street lights in dark areas",
    "Improving drainage systems to prevent waterlogging",
    "Providing clean drinking water facilities",
    "Renovating public schools",
    "Building new classrooms for overcrowded schools",
    "Organizing free medical camps",
    "Establishing community health clinics",
    "Creating parks and playgrounds",
    "Planting trees and promoting green areas",
    "Improving waste management and garbage collection",
    "Building public toilets in crowded areas",
    "Setting up community centers",
    "Providing scholarships for underprivileged students",
    "Organizing job training programs for youth",
    "Supporting small businesses and local markets",
    "Developing flood protection systems",
    "Repairing bridges and culverts",
    "Creating safe pedestrian walkways",
    "Installing CCTV cameras for security",
    "Organizing cultural and community events",
    "Improving public transportation stops or shelters",
    "Setting up digital learning centers",
    "Providing internet access in public spaces",
    "Supporting women empowerment programs",
    "Developing sports facilities for youth",
    "Renovating religious or historical community sites",
    "Establishing emergency disaster response systems",
    "Creating programs for elderly care",
    "Launching awareness campaigns on health and hygiene"
];

export const SECTORS_LIST = [
    "Public Services",
    "Interest Payments",
    "Education & Tech",
    "Transport",
    "Agriculture",
    "Social Security",
    "Health",
    "Defense"
];

export const generateConstituencies = () => {
    const list = [];
    const prefixes = [
        { name: "Panchagarh", count: 2 },
        { name: "Thakurgaon", count: 3 },
        { name: "Dinajpur", count: 6 },
        { name: "Nilphamari", count: 4 },
        { name: "Rangpur", count: 6 },
        { name: "Kurigram", count: 4 },
        { name: "Gaibandha", count: 5 },
        { name: "Joypurhat", count: 2 },
        { name: "Bogra", count: 7 },
        { name: "Chapainawabganj", count: 3 },
        { name: "Naogaon", count: 6 },
        { name: "Rajshahi", count: 6 },
        { name: "Natore", count: 4 },
        { name: "Sirajganj", count: 6 },
        { name: "Pabna", count: 5 },
        { name: "Meherpur", count: 2 },
        { name: "Kushtia", count: 4 },
        { name: "Chuadanga", count: 2 },
        { name: "Jhenaidah", count: 4 },
        { name: "Jessore", count: 6 },
        { name: "Magura", count: 2 },
        { name: "Narail", count: 2 },
        { name: "Bagerhat", count: 4 },
        { name: "Khulna", count: 6 },
        { name: "Satkhira", count: 4 },
        { name: "Barguna", count: 2 },
        { name: "Patuakhali", count: 4 },
        { name: "Bhola", count: 4 },
        { name: "Barishal", count: 6 },
        { name: "Jhalokati", count: 2 },
        { name: "Pirojpur", count: 3 },
        { name: "Tangail", count: 8 },
        { name: "Jamalpur", count: 5 },
        { name: "Sherpur", count: 3 },
        { name: "Mymensingh", count: 11 },
        { name: "Netrokona", count: 5 },
        { name: "Kishoreganj", count: 6 },
        { name: "Manikganj", count: 3 },
        { name: "Munshiganj", count: 3 },
        { name: "Dhaka", count: 20 },
        { name: "Gazipur", count: 5 },
        { name: "Narsingdi", count: 5 },
        { name: "Narayanganj", count: 5 },
        { name: "Rajbari", count: 2 },
        { name: "Faridpur", count: 4 },
        { name: "Gopalganj", count: 3 },
        { name: "Madaripur", count: 3 },
        { name: "Shariatpur", count: 3 },
        { name: "Sunamganj", count: 5 },
        { name: "Sylhet", count: 6 },
        { name: "Moulvibazar", count: 4 },
        { name: "Habiganj", count: 4 },
        { name: "Brahmanbaria", count: 6 },
        { name: "Comilla", count: 11 },
        { name: "Chandpur", count: 5 },
        { name: "Feni", count: 3 },
        { name: "Noakhali", count: 6 },
        { name: "Lakshmipur", count: 4 },
        { name: "Chittagong", count: 16 },
        { name: "Cox's Bazar", count: 4 },
        { name: "Khagrachari", count: 1 },
        { name: "Rangamati", count: 1 },
        { name: "Bandarban", count: 1 }
    ];

    let currentNo = 1;

    // Use a fixed seed logic so the random party doesn't change on every render
    const getMockParty = (seatNo: number) => {
        // deterministic pseudo-random for stable party assignment
        const index = (seatNo * 13) % PARTY_DATA.length;
        return PARTY_DATA[index];
    };

    const getMockExtraData = (seatNo: number) => {
        // pseudo-random logic
        const experience = (seatNo * 7) % 30 + 1; // 1 to 30 years
        const budgetPercent = 40 + ((seatNo * 11) % 50); // 40% to 90% allocation

        // 8 Sectors that must sum to 100
        let remaining = 100;
        const mappedSectors: Record<string, number> = {};

        SECTORS_LIST.forEach((sector, idx) => {
            if (idx === SECTORS_LIST.length - 1) {
                mappedSectors[sector] = remaining; // Last one gets the rest
            } else {
                // Determine a piece between 5 and max allowable to ensure some spread
                const max = Math.max(5, remaining - (SECTORS_LIST.length - idx - 1) * 5);
                const val = 5 + ((seatNo * (idx + 3)) % Math.max(1, max - 5));
                mappedSectors[sector] = val;
                remaining -= val;
            }
        });

        // Pick 8 to 15 random priority projects
        const numProjects = 8 + ((seatNo * 5) % 8);
        const projectsObj = [];
        let availableProjects = [...PROJECTS_LIST];
        for (let i = 0; i < numProjects; i++) {
            const pullIdx = (seatNo * (i + 7)) % availableProjects.length;
            projectsObj.push(availableProjects[pullIdx]);
            // Remove it so it doesn't get picked twice
            availableProjects.splice(pullIdx, 1);
        }

        return {
            experience,
            budgetAllocation: budgetPercent,
            sectors: mappedSectors,
            projects: projectsObj
        };
    };

    prefixes.forEach(p => {
        for (let i = 1; i <= p.count; i++) {
            const party = getMockParty(currentNo);
            const extra = getMockExtraData(currentNo);
            list.push({
                id: currentNo,
                name: `${p.name}-${i}`,
                seatId: currentNo,
                representative: {
                    name: `MP of ${p.name}-${i}`,
                    party: party,
                    photo: `https://i.pravatar.cc/150?u=${currentNo}`,
                    ...extra
                }
            });
            currentNo++;
        }
    });

    while (list.length < 300) {
        const party = getMockParty(list.length + 1);
        const extra = getMockExtraData(list.length + 1);
        list.push({
            id: list.length + 1,
            name: `Seat-${list.length + 1}`,
            seatId: list.length + 1,
            representative: {
                name: `MP of Seat-${list.length + 1}`,
                party: party,
                photo: `https://i.pravatar.cc/150?u=${list.length + 1}`,
                ...extra
            }
        });
    }
    return list.slice(0, 300);
};

export const constituenciesData = generateConstituencies();
