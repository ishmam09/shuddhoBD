import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for anonymous reports
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    trackingId: {
        type: String, // Encrypted unique ID given to the user
        sparse: true,
        unique: true
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
    images: [{
        type: String
    }],
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
