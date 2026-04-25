import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // If null, it's for all users of recipientRole
    },
    recipientRole: {
        type: String,
        enum: ['admin', 'analyst', 'citizen'],
        required: false
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['high_severity', 'new_report', 'report_verified', 'system'],
        default: 'system'
    },
    link: {
        type: String,
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Notification', NotificationSchema);
