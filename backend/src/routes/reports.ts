import express from 'express';
import Report from '../models/Report';
import { authMiddleware } from '../middleware/auth';

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

// GET all reports
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 }).populate('author', 'name role profileImage');
        res.json(reports);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// POST new report (Requires Auth)
// @ts-ignore
router.post('/', authMiddleware, async (req: any, res) => {
    try {
        const { title, description, location } = req.body;

        if (!title || !description || !location) {
            return res.status(400).json({ error: 'Title, description, and location are required' });
        }

        const combinedText = `${title} ${description}`;
        const analysis = analyzeReport(combinedText);

        const newReport = new Report({
            author: req.user._id,
            title,
            description,
            location,
            category: analysis.category,
            severity: analysis.severity,
            severityScore: analysis.severityScore
        });

        await newReport.save();
        res.status(201).json(newReport);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to create report' });
    }
});

export default router;
