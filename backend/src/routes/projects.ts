import express from 'express';
import Project from '../models/Project';
import { authMiddleware, requireRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET all projects (public or authenticated depending on needs, made public here for now)
router.get('/', async (req, res) => {
  try {
    // Sort names alphabetically
    const projects = await Project.find().sort({ name: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching projects' });
  }
});

// GET specific project details
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching project details' });
  }
});

// POST to create a project (Admin Only)
router.post('/', authMiddleware, requireRoles('admin'), async (req: AuthRequest, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating project' });
  }
});

// DELETE a project (Admin Only)
router.delete('/:id', authMiddleware, requireRoles('admin'), async (req: AuthRequest, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

// POST seed 10-15 projects automatically
router.post('/seed', async (req, res) => {
  try {
    await Project.deleteMany({}); // Start fresh

    const projectNames = [
      "Mohammadpur Primary School",
      "Nabinagar Bridge",
      "Zafrabad Mosque",
      "Dhanmondi Lake Park Renovation",
      "Gulshan Avenue Street Lights",
      "Mirpur Inner Circular Road",
      "Uttara Sector 11 Community Center",
      "Rajarbagh Police Quarter Drainage",
      "Motijheel Foot Overbridge",
      "Baily Road Sidewalk Expansion",
      "Tongi Canal Dredging Project",
      "Agargaon Passport Office Digitalization",
      "Khilgaon Flyover Extension",
      "Banani Graveyard Modernization",
      "Jatrabari Bus Terminal Upgradation"
    ];

    const sampleProjects = [];
    const numProjects = Math.floor(Math.random() * 6) + 10; // 10 to 15 projects
    
    // Pick unique names
    const selectedNames = projectNames.sort(() => 0.5 - Math.random()).slice(0, numProjects);

    for (let i = 0; i < numProjects; i++) {
        const budget = Math.floor(Math.random() * 50000000) + 10000000;
        const actualCompletion = Math.floor(budget * (Math.random() * 1.5));
        const statusPool = ["planning", "in progress (30%)", "in progress (70%)", "completed", "on hold"];

        sampleProjects.push({
            projectId: `PRJ-XYZ-${100 + i}`,
            name: selectedNames[i],
            manager: `Manager ${String.fromCharCode(65 + i)}`,
            status: statusPool[Math.floor(Math.random() * statusPool.length)],
            startDate: new Date(Date.now() - Math.random() * 10000000000),
            endDate: new Date(Date.now() + Math.random() * 10000000000),
            location: `Area ${i + 1}, Dhaka`,
            budget,
            actualCompletion,
            milestone: `Milestone ${Math.floor(Math.random() * 5) + 1} reached`
        });
    }

    await Project.insertMany(sampleProjects);
    res.status(201).json({ message: `Successfully seeded ${numProjects} realistic projects` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error seeding projects' });
  }
});

export default router;
