import express from 'express';
import Report from '../models/Report';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { uploadMemory, cloudinary } from '../utils/cloudinary';
import { Readable } from 'stream';
import crypto from 'crypto';

const router = express.Router();

// Classification Algorithm Rules
const CATEGORY_RULES = [
    {
        name: 'Budget Misuse',
        keywords: ['fund', 'money', 'bribe', 'payment', 'invoice', 'allocation', 'embezzlement', 'cash', 'budget']
    },
    {
        name: 'Infrastructure Delay',
        keywords: ['bridge', 'road', 'delay', 'construct', 'build', 'timeline', 'schedule', 'contractor', 'project']
    },
    {
        name: 'Asset Discrepancy',
        keywords: ['missing', 'equipment', 'inventory', 'theft', 'stolen', 'computer', 'supply', 'materials']
    },
    {
        name: 'Power Theft',
        keywords: ['electricity', 'power', 'meter', 'illegal connection', 'bypass']
    }
];

// Helper to analyze text and determine category and severity
const analyzeReport = (text: string) => {
    const lowerText = text.toLowerCase();

    let bestCategory = 'Other';
    let maxMatches = 0;
    let totalSeverityScore = 0;

    CATEGORY_RULES.forEach(rule => {
        let matches = 0;
        rule.keywords.forEach(kw => {
            if (lowerText.includes(kw.toLowerCase())) {
                matches++;
                totalSeverityScore += 15; // Each keyword match increases severity score
            }
        });

        if (matches > maxMatches) {
            maxMatches = matches;
            bestCategory = rule.name;
        }
    });

    // Base severity based on text length (just as a simple heuristic)
    if (lowerText.length > 500) totalSeverityScore += 20;

    // Cap the score at 100
    const finalScore = Math.min(100, totalSeverityScore);

    let severityLabel = 'Low';
    if (finalScore >= 75) severityLabel = 'High';
    else if (finalScore >= 40) severityLabel = 'Medium';

    return {
        category: maxMatches > 0 ? bestCategory : 'Uncategorized',
        severity: severityLabel,
        severityScore: finalScore
    };
};

// GET all verified reports (Public)
router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const query = { status: 'Verified' };
        const reports = await (Report as any).find(query).sort({ createdAt: -1 }).populate('author', 'name role profileImage');
        res.json(reports);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// GET all reports for moderation (Admin only)
// @ts-ignore
router.get('/moderation', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        console.log(`[MODERATION] Fetch request by user: ${req.user?._id} (${(req.user as any).role})`);
        if ((req.user as any).role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        const reports = await (Report as any).find({ status: 'Pending' }).sort({ createdAt: -1 }).populate('author', 'name role profileImage');
        res.json(reports);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch moderation reports' });
    }
});

// GET Dashboard stats
// @ts-ignore
router.get('/stats', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = (req.user as any)._id;
        const role = (req.user as any).role;

        if (role === 'citizen') {
            const myReportsCount = await (Report as any).countDocuments({ author: userId });
            // You could also add other citizen specific stats here
            res.json({
                myReports: myReportsCount,
                projectsFollowed: 0 // Placeholder for future feature
            });
        } else {
            // Admin/Analyst stats
            const highSeverityCount = await (Report as any).countDocuments({ severity: 'High' });
            const verifiedCount = await (Report as any).countDocuments({ status: 'Verified' });
            const pendingCount = await (Report as any).countDocuments({ status: 'Pending' });

            res.json({
                highSeverity: highSeverityCount,
                verified: verifiedCount,
                pending: pendingCount
            });
        }
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// PATCH moderate report (Admin only)
// @ts-ignore
router.patch('/moderate/:id', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        console.log(`[MODERATION] Update request for ID: ${req.params.id}`);
        console.log(`[MODERATION] User: ${req.user?._id} Role: ${(req.user as any).role}`);
        console.log(`[MODERATION] Body:`, req.body);
        if ((req.user as any).role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { status, category, severity, severityScore } = req.body;
        const updateData: any = {};

        if (status) updateData.status = status;
        if (category) updateData.category = category;
        if (severity) updateData.severity = severity;
        if (severityScore !== undefined) updateData.severityScore = severityScore;

        const updatedReport = await (Report as any).findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(updatedReport);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to moderate report' });
    }
});

// POST new report (Requires Auth)
// @ts-ignore
router.post('/', authMiddleware, uploadMemory.array('images', 5), async (req: AuthRequest, res: express.Response) => {
    try {
        console.log("Standard Report Submission Started");
        const { title, description, location } = req.body;

        if (!title || !description || !location) {
            return res.status(400).json({ error: 'Title, description, and location are required' });
        }

        const imageUrls: string[] = [];
        const files = req.files as Express.Multer.File[];

        if (files && files.length > 0) {
            console.log(`Uploading ${files.length} media files to Cloudinary...`);

            const uploadPromises = files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'shuddhoBD/reports',
                            resource_type: 'auto', // Handles both images and videos
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
                imageUrls.push(...results);
                console.log("Successfully uploaded to Cloudinary:", imageUrls);
            } catch (uploadErr: any) {
                console.error("Standard Report Cloudinary Error:", uploadErr);
                throw uploadErr;
            }
        }

        const combinedText = `${title} ${description}`;
        const analysis = analyzeReport(combinedText);

        const newReport = new (Report as any)({
            author: (req.user as any)._id,
            title,
            description,
            location,
            images: imageUrls,
            category: analysis.category,
            severity: analysis.severity,
            severityScore: analysis.severityScore,
            isAnonymous: false
        });

        await newReport.save();
        res.status(201).json(newReport);
    } catch (err: any) {
        console.error("Standard Report Failure:", err);
        res.status(500).json({ error: 'Failed to create report', details: err.message });
    }
});


// ... categorization code ...

// @ts-ignore
router.post('/anonymous', authMiddleware, uploadMemory.array('images', 5), async (req: AuthRequest, res: express.Response) => {
    try {
        console.log("Anonymous Report Submission Started (Manual Upload Mode)");
        console.log("User:", req.user?._id);
        console.log("Body:", req.body);
        const files = req.files as Express.Multer.File[];
        console.log("Files detected:", files ? `${files.length} files` : "0 files");

        const { title, description, location } = req.body;

        if (!title || !description || !location) {
            console.log("Missing fields:", { title, description, location });
            return res.status(400).json({ error: 'Title, description, and location are required' });
        }

        const imageUrls: string[] = [];

        if (files && files.length > 0) {
            console.log(`Starting Cloudinary upload for ${files.length} secure files...`);

            const uploadPromises = files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'shuddhoBD/reports',
                            resource_type: 'auto', // Handles both videos and images seamlessly
                            quality: 'auto',
                            fetch_format: 'auto'
                        },
                        (error, result) => {
                            if (error) {
                                console.error("Cloudinary Stream Error:", error);
                                reject(error);
                            } else {
                                resolve((result as any).secure_url);
                            }
                        }
                    );
                    Readable.from(file.buffer).pipe(uploadStream);
                });
            });

            try {
                const results = await Promise.all(uploadPromises);
                imageUrls.push(...results);
                console.log("Cloudinary Upload Success:", imageUrls);
            } catch (uploadErr: any) {
                console.error("Cloudinary Upload Process Failed:", uploadErr);
                throw new Error(`Cloudinary media upload failed: ${uploadErr.message}`);
            }
        }

        const combinedText = `${title} ${description}`;
        const analysis = analyzeReport(combinedText);
        const trackingId = crypto.randomBytes(8).toString('hex').toUpperCase();

        const newReport = new (Report as any)({
            title,
            description,
            location,
            images: imageUrls,
            category: analysis.category,
            severity: analysis.severity,
            severityScore: analysis.severityScore,
            isAnonymous: true,
            trackingId
        });

        await newReport.save();
        console.log("Report saved successfully with tracking ID:", trackingId);

        res.status(201).json({
            message: 'Report submitted autonomously and securely via Cloudinary.',
            trackingId,
            category: analysis.category,
            severity: analysis.severity,
            imageUrls
        });
    } catch (err: any) {
        console.error("Anonymous Report Failure Details:", err);
        res.status(500).json({
            error: 'Failed to submit anonymous report',
            details: err.message
        });
    }
});

// DELETE report (Admin only)
// @ts-ignore
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        if ((req.user as any).role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const deletedReport = await (Report as any).findByIdAndDelete(req.params.id);

        if (!deletedReport) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ message: 'Report deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

export default router;
