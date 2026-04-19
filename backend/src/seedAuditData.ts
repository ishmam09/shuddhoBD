import mongoose from 'mongoose';
import { ENV } from './config/env';
import Project from './models/Project';
import { Seat } from './models/Seat';

const seedAuditData = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(ENV.mongoUri);

        const seats = await Seat.find();
        console.log(`Seeding audit projects for ${seats.length} seats...`);

        // Clear all projects to avoid duplicates
        await Project.deleteMany({});

        const allProjects: any[] = [];

        seats.forEach((seat, index) => {
            const seatId = seat.order;
            // Create 2-3 projects per seat
            allProjects.push({
                projectId: `P-${seatId}-001`,
                seatId: seatId,
                name: `Infrastructure Development - ${seat.seatName} Phase 1`,
                manager: "Local Engineering Dept",
                status: index % 3 === 0 ? "Ongoing" : "Completed",
                startDate: new Date("2023-01-15"),
                endDate: new Date("2025-12-30"),
                location: seat.seatName,
                budget: 25000000 + (index * 100000),
                actualCompletion: index % 3 === 0 ? 45 : 100,
                milestone: "Ongoing construction",
                phases: [
                    { name: "Initial Work", start: new Date("2023-01-15"), end: new Date("2023-03-15"), status: "past", spent: 5000000 }
                ]
            });

            if (index % 2 === 0) {
                allProjects.push({
                    projectId: `P-${seatId}-002`,
                    seatId: seatId,
                    name: `Public Health Center Modernization`,
                    manager: "Ministry of Health",
                    status: "Delayed",
                    startDate: new Date("2022-06-10"),
                    endDate: new Date("2024-05-15"),
                    location: seat.seatName,
                    budget: 15000000,
                    actualCompletion: 30,
                    milestone: "Foundation laid",
                    phases: [
                        { name: "Survey", start: new Date("2022-06-10"), end: new Date("2022-08-10"), status: "past", spent: 1000000 },
                        { name: "Excavation", start: new Date("2022-09-01"), end: new Date("2023-12-01"), status: "current", spent: 4000000 }
                    ],
                    challenges: [
                        { description: "Resource bottleneck", status: "valid", createdAt: new Date() }
                    ]
                });
            }
        });

        await Project.insertMany(allProjects);
        console.log(`Successfully seeded ${allProjects.length} projects across ${seats.length} seats.`);
        console.log("Sample projects seeded successfully.");

        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedAuditData();
