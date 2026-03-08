import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { User } from "./models/User";
import { ENV } from "./config/env";

dotenv.config();

const seedUsers = async () => {
  try {
    if (!ENV.mongoUri) {
      throw new Error("MONGO_URI is not set");
    }
    await mongoose.connect(ENV.mongoUri);
    console.log("Connected to MongoDB...");

    const usersToCreate = [
      {
        name: "System Admin",
        email: "admin@shuddhobd.com",
        password: "adminpassword123",
        role: "admin",
      },
      {
        name: "Fait Nanjum",
        email: "faitnanjum18@gmail.com",
        password: "password123",
        role: "citizen",
      }
    ];

    for (const userData of usersToCreate) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists! Updating role to ${userData.role} if needed.`);
        if (existingUser.role !== userData.role) {
           existingUser.role = userData.role as "admin" | "citizen" | "analyst";
           await existingUser.save();
           console.log(`Updated role for ${userData.email} to ${userData.role}`);
        }
      } else {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`Successfully created user:`);
        console.log(`Email: ${userData.email}`);
        console.log(`Role: ${userData.role}`);
        console.log(`Password: ${userData.password}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed users:", error);
    process.exit(1);
  }
};

seedUsers();
