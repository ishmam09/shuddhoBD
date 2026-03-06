import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import { ENV } from "./config/env";
import { authMiddleware, requireRoles, AuthRequest } from "./middleware/auth";

const app = express();

const allowedOrigins = [
  ENV.clientUrl || "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ShuddhoBD backend" });
});

app.use("/api/auth", authRoutes);

app.get("/api/protected/citizen", authMiddleware, requireRoles("citizen", "analyst", "admin"), (req: AuthRequest, res) => {
  res.json({ message: "Citizen-level access granted", user: req.user });
});

app.get("/api/protected/analyst", authMiddleware, requireRoles("analyst", "admin"), (req: AuthRequest, res) => {
  res.json({ message: "Analyst-level access granted", user: req.user });
});

app.get("/api/protected/admin", authMiddleware, requireRoles("admin"), (req: AuthRequest, res) => {
  res.json({ message: "Admin-level access granted", user: req.user });
});

const start = async () => {
  try {
    if (!ENV.mongoUri) {
      throw new Error("MONGO_URI is not set");
    }
    await mongoose.connect(ENV.mongoUri);
    console.log("Connected to MongoDB");

    app.listen(ENV.port, () => {
      console.log(`ShuddhoBD backend running on port ${ENV.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();

