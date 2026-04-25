import mongoose from "mongoose";
import { User } from "../models/User";
import { ENV } from "../config/env";
import dns from "dns";

// Force DNS fix for Windows SRV issues
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) { console.warn("Could not set DNS servers"); }

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(ENV.mongoUri);
    console.log("Connected.");

    const email = "user2@gmail.com";
    const password = "user123";
    const name = "Citizen User Two";

    // Delete existing if any (to be safe)
    await User.deleteOne({ email });

    const user = await User.create({
      name,
      email,
      password,
      role: "citizen"
    });

    console.log(`Successfully created user: ${user.email}`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating user:", error);
    process.exit(1);
  }
}

run();
