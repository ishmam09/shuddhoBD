import dotenv from "dotenv";

dotenv.config({ override: true });

export const ENV = {
  port: 5001,
  mongoUri: (process.env.MONGO_URI || "").trim(),
  jwtSecret: (process.env.JWT_SECRET || "change_me_in_prod").trim(),
  nodeEnv: (process.env.NODE_ENV || "development").trim(),
  clientUrl: (process.env.CLIENT_URL || "http://localhost:5173").trim(),
  smtpHost: (process.env.SMTP_HOST || "smtp.gmail.com").trim(),
  smtpPort: parseInt(process.env.SMTP_PORT || "587"),
  smtpUser: (process.env.SMTP_USER || "").trim(),
  smtpPass: (process.env.SMTP_PASS || "").trim(),
  cloudinaryCloudName: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
  cloudinaryApiKey: (process.env.CLOUDINARY_API_KEY || "").trim(),
  cloudinaryApiSecret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || "7d").trim(),
  newsApiKey: (process.env.NEWS_API_KEY || "").trim(),
};

