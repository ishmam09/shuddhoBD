import express from 'express';
import Project from '../models/Project';
import { authMiddleware, requireRoles, AuthRequest } from '../middleware/auth';
import { uploadChallenge, cloudinary } from '../utils/cloudinary';
// Removed Readable import as it's no longer needed for manual streams

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
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error creating project', 
      error: error.message,
      details: error.errors // This contains Mongoose validation errors
    });
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

// PUT update a project (Admin Only)
router.put('/:id', authMiddleware, requireRoles('admin'), async (req: AuthRequest, res) => {
  try {
    const updateData = { ...req.body };
    const projectToUpdate = await Project.findById(req.params.id);
    if (!projectToUpdate) return res.status(404).json({ message: 'Project not found' });

    // Sanitize updateData by removing immutable or auto-generated fields
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    console.log(`[PROJECT UPDATE] Attempting to update project ${req.params.id}`);
    
    // implementing auto-update of phases if total spent is updated directly
    if (updateData.actualCompletion !== undefined && !updateData.phases) {
      const newTotal = Number(updateData.actualCompletion);
      const phases = [...projectToUpdate.phases];
      
      // Calculate how much was spent in past phases
      const pastSpent = phases
        .filter(p => p.status === 'past')
        .reduce((sum, p) => sum + (p.spent || 0), 0);
      
      // Find the current phase to dump the remaining spent amount into
      const currentPhaseIndex = phases.findIndex(p => p.status === 'current');
      
      if (currentPhaseIndex !== -1) {
        // Update the current phase's spent amount to match the new total
        phases[currentPhaseIndex].spent = Math.max(0, newTotal - pastSpent);
        updateData.phases = phases;
      }
    }
    
    // implementing auto-update of total spent based on phases (fallback if phases are provided)
    if (updateData.phases && Array.isArray(updateData.phases)) {
      updateData.actualCompletion = updateData.phases.reduce((sum: number, p: any) => sum + (Number(p.spent) || 0), 0);
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    console.log(`[PROJECT UPDATE] Successfully updated project ${req.params.id}`);
    res.json(project);
  } catch (error: any) {
    console.error(`[PROJECT UPDATE ERROR] ID: ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Server error updating project',
      error: error.message 
    });
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
        // implementing money spent
        const budget = Math.floor(Math.random() * 50000000) + 10000000;
        const totalSpent = Math.floor(budget * (Math.random() * 1.2));
        const statusPool = ["planning", "in progress", "completed", "on hold"];
        
        const start = new Date(Date.now() - Math.random() * 10000000000);
        const end = new Date(start.getTime() + (Math.random() * 10000000000 + 5000000000));
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
        const phases = phaseTemplates.map((p, idx) => {
            const phaseStart = new Date(accumulatedTime);
            const phaseEnd = new Date(accumulatedTime + (duration * p.weight));
            accumulatedTime = phaseEnd.getTime();

            let pStatus: 'past' | 'current' | 'future' = 'future';
            if (now > phaseEnd.getTime()) pStatus = 'past';
            else if (now > phaseStart.getTime()) pStatus = 'current';

            const pSpent = pStatus === 'future' ? 0 : 
                          pStatus === 'current' ? Math.floor(remainingSpent * 0.4) :
                          Math.floor(totalSpent * (p.weight + 0.1));
            
            remainingSpent -= pSpent;

            return {
                name: p.name,
                start: phaseStart,
                end: phaseEnd,
                status: pStatus,
                spent: Math.max(0, pSpent)
            };
        });

        sampleProjects.push({
            projectId: `PRJ-${100 + i}`,
            seatId: Math.floor(Math.random() * 200) + 100,
            name: selectedNames[i],
            manager: `Manager ${String.fromCharCode(65 + i)}`,
            status: statusPool[Math.floor(Math.random() * statusPool.length)],
            startDate: start,
            endDate: end,
            location: `Area ${i + i}, Dhaka`,
            budget,
            actualCompletion: totalSpent,
            milestone: `Milestone ${Math.floor(Math.random() * 5) + 1} reached`,
            phases
        });
    }

    await Project.insertMany(sampleProjects);
    res.status(201).json({ message: `Successfully seeded ${numProjects} realistic projects` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error seeding projects' });
  }
});

// POST a challenge for a project (Citizen/Public Anonymous via authMiddleware)
// @ts-ignore
router.post('/:id/challenge', authMiddleware, uploadChallenge.array('media', 5), async (req: AuthRequest, res: express.Response) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Challenge description is required' });
    }

    // With uploadChallenge, files are already uploaded to Cloudinary by the middleware
    const files = req.files as any[];
    const mediaUrls = files ? files.map(file => file.path || file.secure_url) : [];

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    console.log(`[CHALLENGE SUBMISSION] Adding challenge to project: ${project.name} (${project._id})`);

    const newChallenge = {
      description,
      mediaUrls: mediaUrls.filter(url => !!url), // Ensure no null/undefined urls
      status: 'pending',
      adminNote: '',
      createdAt: new Date()
    };

    if (!project.challenges) {
      project.challenges = [] as any;
    }

    project.challenges.push(newChallenge as any);
    await project.save();
    console.log(`[CHALLENGE SUBMISSION] Successfully saved challenge for project: ${project._id}`);

    res.status(201).json({ message: 'Challenge submitted successfully', project });
  } catch (error: any) {
    console.error("[CHALLENGE SUBMISSION ERROR]", error);
    res.status(500).json({ 
      message: 'Server error submitting challenge',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PATCH moderate a challenge (Admin Only)
// @ts-ignore
router.patch('/:id/challenge/:challengeId/moderate', authMiddleware, requireRoles('admin'), async (req: AuthRequest, res: express.Response) => {
  try {
    const { status, adminNote } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const challenge = (project.challenges as any).id(req.params.challengeId);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    challenge.status = status;
    if (adminNote !== undefined) {
      challenge.adminNote = adminNote;
    }

    await project.save();
    res.json({ message: 'Challenge moderated successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error moderating challenge' });
  }
});

// DELETE a challenge (Admin Only)
// @ts-ignore
router.delete('/:id/challenge/:challengeId', authMiddleware, requireRoles('admin'), async (req: AuthRequest, res: express.Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    (project.challenges as any).pull({ _id: req.params.challengeId });
    await project.save();

    res.json({ message: 'Challenge deleted successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting challenge' });
  }
});

export default router;






