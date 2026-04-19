import express from 'express';
import Notification from '../models/Notification';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET all notifications for the requester
// @ts-ignore
router.get('/', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = req.user?._id;
        const role = (req.user as any).role;

        let query: any = { recipient: userId };
        
        // Admins also see global admin notifications
        if (role === 'admin') {
            query = {
                $or: [
                    { recipient: userId },
                    { recipient: null } // Global admin notifications
                ]
            };
        }

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

        let query: any = { recipient: userId };
        if (role === 'admin') {
            query = {
                $or: [
                    { recipient: userId },
                    { recipient: null }
                ]
            };
        }

        await Notification.updateMany(query, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

export default router;
