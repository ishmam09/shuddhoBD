const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const ProjectSchema = new mongoose.Schema({
    projectId: { type: String, required: true, unique: true },
    seatId: { type: Number, required: true },
    name: { type: String, required: true },
    manager: { type: String, required: true },
    status: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    actualCompletion: { type: Number, required: true },
    milestone: { type: String, required: true },
    phases: [Object],
    challenges: [Object]
});

const Project = mongoose.model('Project', ProjectSchema);

async function addProjects() {
    try {
        await mongoose.connect(process.env.MONGO_URI.trim());
        console.log("Connected to MongoDB");

        const lowRisk = {
            projectId: "PRJ-LOW-001",
            seatId: 101,
            name: "Community Clinic Renovation (Low Risk)",
            manager: "Shafiq Ahmed",
            status: "in progress",
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-12-31"),
            location: "Dhanmondi, Dhaka",
            budget: 10000000,
            actualCompletion: 4000000,
            milestone: "Painting completed",
            phases: [
                { name: "Planning", start: new Date("2026-01-01"), end: new Date("2026-02-01"), status: "past", spent: 1000000 },
                { name: "Renovation", start: new Date("2026-02-02"), end: new Date("2026-10-01"), status: "current", spent: 3000000 }
            ],
            challenges: []
        };

        const mediumRisk = {
            projectId: "PRJ-MED-001",
            seatId: 102,
            name: "Public Library Extension (Medium Risk)",
            manager: "Nusrat Jahan",
            status: "on hold",
            startDate: new Date("2025-06-01"),
            endDate: new Date("2026-06-01"),
            location: "Mirpur, Dhaka",
            budget: 20000000,
            actualCompletion: 21500000,
            milestone: "Structure 80% complete",
            phases: [
                { name: "Foundation", start: new Date("2025-06-01"), end: new Date("2025-12-01"), status: "past", spent: 10000000 },
                { name: "Structure", start: new Date("2025-12-02"), end: new Date("2026-04-01"), status: "current", spent: 11500000 }
            ],
            challenges: [
                { description: "Citizen report: Cracks appearing in northern wall", status: "pending", createdAt: new Date() }
            ]
        };

        await Project.create(lowRisk);
        await Project.create(mediumRisk);

        console.log("Projects added successfully!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

addProjects();
