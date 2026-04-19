import express from 'express';
import { Seat } from '../models/Seat';
import { authMiddleware, requireRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET all seats (Publicly restricted view)
router.get('/', async (req, res) => {
    try {
        const seats = await Seat.find({}).select('-fiveYearBackAsset').sort({ order: 1 });
        res.json(seats);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// GET single seat (Admin unstripped access)
router.get('/admin/:id', authMiddleware, requireRoles('admin'), async (req, res) => {
    try {
        const seat = await Seat.findById(req.params.id);
        if (!seat) return res.status(404).json({ message: "Seat not found" });
        res.json(seat);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

import { uploadProfile } from '../utils/cloudinary';

// POST image upload for seat candidate
router.post('/:id/image', authMiddleware, requireRoles('admin'), uploadProfile.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No image uploaded" });

        const seat = await Seat.findById(req.params.id);
        if (!seat) return res.status(404).json({ message: "Seat not found" });

        seat.candidateImage = req.file.path;
        await seat.save();

        res.json({ message: "Uploaded successfully", candidateImage: req.file.path });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// PUT update a seat (Admin only)
router.put('/:id', authMiddleware, requireRoles('admin'), async (req: any, res) => {
    try {
        const user = req.user;

        const seat = await Seat.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!seat) {
            return res.status(404).json({ message: "Seat not found" });
        }
        res.json(seat);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// POST add a new seat (Admin only)
router.post('/', authMiddleware, requireRoles('admin'), async (req: any, res) => {
    try {
        const user = req.user;

        const seat = new Seat(req.body);
        await seat.save();
        res.status(201).json(seat);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

export default router;
