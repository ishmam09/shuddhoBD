const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Force Google/Cloudflare DNS to bypass local ISP SRV resolution bugs on Windows
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) { console.warn("Could not set DNS servers"); }

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
}

const ProjectSchema = new mongoose.Schema({
    projectId: String,
    seatId: Number,
    name: String,
    manager: String,
    status: String,
    startDate: Date,
    endDate: Date,
    location: String,
    budget: Number,
    actualCompletion: Number,
    milestone: String,
    phases: [{
        name: String,
        start: Date,
        end: Date,
        status: String,
        spent: Number
    }]
}, { timestamps: true });

const Project = mongoose.model('Project', ProjectSchema);

const fixPhases = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully.");

        const projects = await Project.find({
            $or: [
                { phases: { $exists: false } },
                { phases: { $size: 0 } },
                { phases: { $size: 1 } },
                { seatId: { $exists: false } }
            ]
        });

        console.log(`Found ${projects.length} projects to fix.`);

        for (const project of projects) {
            console.log(`Fixing project: ${project.name}`);
            
            // Assign defaults for missing required fields
            if (!project.seatId) project.seatId = 185;
            if (!project.projectId) project.projectId = `PRJ-${Math.floor(Math.random() * 9000) + 1000}`;
            if (!project.manager) project.manager = "Default Manager";
            if (!project.status) project.status = "in progress";
            if (!project.location) project.location = "Dhaka, Bangladesh";
            if (!project.budget) project.budget = 1000000;
            if (!project.milestone) project.milestone = "Initial stage";
            
            const start = project.startDate;
            const end = project.endDate;
            const totalSpent = project.actualCompletion || 0;
            const duration = end.getTime() - start.getTime();
            const now = Date.now();

            const phaseTemplates = [
                { name: "Design & Planning", weight: 0.15 },
                { name: "Foundation & Dev", weight: 0.45 },
                { name: "Testing & QA", weight: 0.25 },
                { name: "Final Deployment", weight: 0.15 }
            ];

            let accumulatedTime = start.getTime();
            let remainingSpent = totalSpent;
            
            const newPhases = phaseTemplates.map((p, idx) => {
                const pStart = new Date(accumulatedTime);
                const pEnd = new Date(accumulatedTime + (duration * p.weight));
                accumulatedTime = pEnd.getTime();

                let pStatus = 'future';
                if (now > pEnd.getTime()) pStatus = 'past';
                else if (now > pStart.getTime()) pStatus = 'current';

                const pSpent = pStatus === 'future' ? 0 : 
                              pStatus === 'current' ? Math.floor(remainingSpent * 0.4) :
                              Math.floor(totalSpent * (p.weight + 0.1));
                
                remainingSpent -= pSpent;

                return {
                    name: p.name,
                    start: pStart,
                    end: pEnd,
                    status: pStatus,
                    spent: Math.max(0, pSpent)
                };
            });

            project.phases = newPhases;
            await project.save();
        }

        console.log("All projects updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error fixing projects:", error);
        process.exit(1);
    }
};

fixPhases();
