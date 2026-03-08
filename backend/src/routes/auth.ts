import { Router, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { OTP } from "../models/OTP";
import { sendOTPVerificationEmail } from "../utils/mailer";
import { ENV } from "../config/env";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { upload } from "../utils/upload";
import fs from "fs";
import path from "path";

const router = Router();

const setAuthCookie = (res: Response, token: string) => {
  const isProd = ENV.nodeEnv === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

router.post("/send-otp", async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });
    await sendOTPVerificationEmail(email, otp);

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP Error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/register", async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, nid, phone, address, gender, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "Name, email, password, and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (nid) {
      const existingNid = await User.findOne({ nid });
      if (existingNid) {
        return res.status(409).json({ message: "NID already registered" });
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({ message: "Phone number already registered" });
      }
    }

    // Public self-registration always creates a citizen account.
    // Elevated roles (analyst/admin) must be assigned separately by an admin.
    const user = await User.create({
      name,
      email,
      password,
      nid,
      phone,
      address,
      gender,
    });

    await OTP.deleteMany({ email });

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      ENV.jwtSecret,
      { expiresIn: ENV.jwtExpiresIn as any }
    );

    setAuthCookie(res, token);

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(409).json({ message: `${field.toUpperCase()} already in use` });
    }
    return res.status(500).json({ message: "Failed to register user" });
  }
});

router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      ENV.jwtSecret,
      { expiresIn: ENV.jwtExpiresIn as any }
    );

    setAuthCookie(res, token);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to login" });
  }
});

router.post("/logout", (req: AuthRequest, res: Response) => {
  const isProd = ENV.nodeEnv === "production";
  res.cookie("token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    expires: new Date(0),
  });
  return res.json({ message: "Logged out" });
});

router.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  return res.json({ user: req.user });
});

router.patch("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { email, phone, address } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Strictly enforce editable fields: email, phone, address
    // name, gender, nid are read-only as per user request
    const updateData: any = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        nid: updatedUser.nid,
        gender: updatedUser.gender,
        profileImage: updatedUser.profileImage
      }
    });
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(409).json({ message: `${field.toUpperCase()} already in use` });
    }
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

router.post("/profile-image", authMiddleware, upload.single("image"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const userId = req.user?._id;
    const imageUrl = `/uploads/${req.file.filename}`;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old image if it exists
    if (user.profileImage) {
      const oldPath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profileImage = imageUrl;
    await user.save();

    return res.json({
      message: "Profile image updated",
      profileImage: imageUrl
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ message: "Failed to upload image" });
  }
});

router.delete("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body;
    const userId = req.user?._id;

    if (!userId || !password) {
      return res.status(400).json({ message: "Password is required for account deletion" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    await User.findByIdAndDelete(userId);

    // Clear the auth cookie
    const isProd = ENV.nodeEnv === "production";
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      expires: new Date(0),
    });

    return res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Account Deletion Error:", error);
    return res.status(500).json({ message: "Failed to delete account" });
  }
});

export default router;

