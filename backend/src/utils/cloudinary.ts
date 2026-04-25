import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { ENV } from '../config/env';

cloudinary.config({
    cloud_name: ENV.cloudinaryCloudName.trim(),
    api_key: ENV.cloudinaryApiKey.trim(),
    api_secret: ENV.cloudinaryApiSecret.trim(),
});

console.log(`[CLOUDINARY] Initialized with Cloud Name: ${ENV.cloudinaryCloudName.trim()}`);

export const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'shuddhoBD/profiles',
            allowed_formats: ['jpg', 'png', 'jpeg'],
            transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }],
            resource_type: 'auto',
        };
    },
});

export const reportStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'shuddhoBD/reports',
            resource_type: 'auto',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        };
    },
});

export const challengeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'shuddhoBD/project_challenges',
            resource_type: 'auto',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        };
    },
});

export const uploadProfile = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const uploadReport = multer({
    storage: reportStorage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

export const uploadChallenge = multer({
    storage: challengeStorage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

export const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

export { cloudinary };
