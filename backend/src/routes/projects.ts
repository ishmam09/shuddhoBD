import express from 'express';
import Project from '../models/Project';
import { authMiddleware, requireRoles, AuthRequest } from '../middleware/auth';
import { uploadMemory, cloudinary } from '../utils/cloudinary';
import { Readable } from 'stream';

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

// PUT update a project (Admin Only)
router.put('/:id', authMiddleware, requireRoles('admin'), async (req: AuthRequest, res) => {
  try {
    const updateData = { ...req.body };
    
    // implementing auto-update of total spent based on phases
    if (updateData.phases && Array.isArray(updateData.phases)) {
      updateData.actualCompletion = updateData.phases.reduce((sum: number, p: any) => sum + (p.spent || 0), 0);
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating project' });
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
            projectId: `PRJ-XYZ-${100 + i}`,
            name: selectedNames[i],
            manager: `Manager ${String.fromCharCode(65 + i)}`,
            status: statusPool[Math.floor(Math.random() * statusPool.length)],
            startDate: start,
            endDate: end,
            location: `Area ${i + 1}, Dhaka`,
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
router.post('/:id/challenge', authMiddleware, uploadMemory.array('media', 5), async (req: AuthRequest, res: express.Response) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Challenge description is required' });
    }

    const mediaUrls: string[] = [];
    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      const uploadPromises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'shuddhoBD/project_challenges',
              resource_type: 'auto',
              quality: 'auto',
              fetch_format: 'auto'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve((result as any).secure_url);
            }
          );
          Readable.from(file.buffer).pipe(uploadStream);
        });
      });

      try {
        const results = await Promise.all(uploadPromises);
        mediaUrls.push(...results);
      } catch (uploadErr: any) {
        console.error("Cloudinary Upload Process Failed:", uploadErr);
        throw new Error(`Cloudinary media upload failed: ${uploadErr.message}`);
      }
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const newChallenge = {
      description,
      mediaUrls,
      status: 'pending',
      adminNote: '',
      createdAt: new Date()
    };

    project.challenges.push(newChallenge as any);
    await project.save();

    res.status(201).json({ message: 'Challenge submitted successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting challenge' });
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

    const challenge = project.challenges.id(req.params.challengeId);
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

    project.challenges.pull({ _id: req.params.challengeId });
    await project.save();

    res.json({ message: 'Challenge deleted successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting challenge' });
  }
});

export default router;
