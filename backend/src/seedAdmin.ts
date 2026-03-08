import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { User } from "./models/User";
import { ENV } from "./config/env";

dotenv.config();

const seedAdmin = async () => {
  try {
    if (!ENV.mongoUri) {
      throw new Error("MONGO_URI is not set");
    }
    await mongoose.connect(ENV.mongoUri);
    console.log("Connected to MongoDB...");

    const adminEmail = "admin@shuddhobd.com";
    const adminPassword = "adminpassword123";

    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`Admin account ${adminEmail} already exists!`);
    } else {
      const adminUser = new User({
        name: "System Admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });

      await adminUser.save();
      console.log(`Successfully created admin account:`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
