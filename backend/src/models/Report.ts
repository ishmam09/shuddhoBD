import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'Uncategorized'
    },
    severity: {
        type: String, // 'Low', 'Medium', 'High'
        default: 'Low'
    },
    severityScore: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Verified', 'Resolved', 'Rejected'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Report', ReportSchema);
