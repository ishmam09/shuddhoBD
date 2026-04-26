import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET all notifications for the requester
// @ts-ignore
router.get('/', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = req.user?._id;
        const role = (req.user as any).role;

        console.log(`[DEBUG_NOTIF] Fetch Request - UserID: ${userId}, Role: ${role}`);

        const orConditions: any[] = [];
        
        // 1. Role-based notifications (Broadcasting)
        if (role) {
            orConditions.push({ recipientRole: role });
        }

        // 2. Personal notifications (Recipient-specific)
        // Check if userId is a valid MongoDB ObjectId to prevent CastError
        if (userId && mongoose.Types.ObjectId.isValid(userId.toString())) {
            orConditions.push({ recipient: userId });
        }

        // 3. Global notifications (Legacy)
        if (role === 'admin') {
            orConditions.push({ recipient: null });
        }

        // Ensure we always have at least one condition to avoid empty $or
        // If no conditions match, we query for a random non-existent ObjectId to safely return 0 results
        const query = orConditions.length > 0 ? { $or: orConditions } : { _id: new mongoose.Types.ObjectId() };

        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PATCH mark notification as read
// @ts-ignore
router.patch('/:id/read', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = req.user?._id;
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Check ownership (only if not a global admin notification)
        if (notification.recipient && notification.recipient.toString() !== userId?.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// DELETE notification
// @ts-ignore
router.patch('/read-all', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = req.user?._id;
        const role = (req.user as any).role;

        const orConditions: any[] = [];
        if (role) orConditions.push({ recipientRole: role });
        if (userId && mongoose.Types.ObjectId.isValid(userId.toString())) {
            orConditions.push({ recipient: userId });
        }
        if (role === 'admin') orConditions.push({ recipient: null });

        const query = orConditions.length > 0 ? { $or: orConditions } : { _id: new mongoose.Types.ObjectId() };

        await Notification.updateMany(query, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

export default router;
