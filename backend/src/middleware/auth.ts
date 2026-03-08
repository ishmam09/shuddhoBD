import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { User, IUser, UserRole } from "../models/User";

export interface AuthRequest extends Request {
  user?: Pick<IUser, "_id" | "email" | "role" | "name">;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, ENV.jwtSecret) as JwtPayload;

    const user = await User.findById(decoded.sub).select("name email role");
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRoles =
  (...roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

