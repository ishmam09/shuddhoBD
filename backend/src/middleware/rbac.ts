import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { UserRole } from "../models/User";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this route` });
        }

        next();
    };
};
