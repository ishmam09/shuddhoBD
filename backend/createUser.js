const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dns = require('dns');
require('dotenv').config();

// Force Google/Cloudflare DNS to bypass local ISP SRV resolution bugs on Windows
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) { console.warn("Could not set DNS servers"); }

const email = "user2@gmail.com";
const password = "user123";
const name = "Citizen User Two";

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("MONGO_URI not found in .env");
  process.exit(1);
}

async function createUser() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to database...");
    
    // Hash the password manually since we are not using the Mongoose model here directly to avoid TS import issues
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const db = mongoose.connection.db;
    
    // Check if user already exists
    const existing = await db.collection("users").findOne({ email: email });
    if (existing) {
        console.log(`User ${email} already exists.`);
        process.exit(0);
    }

    const result = await db.collection("users").insertOne({
      name: name,
      email: email,
      password: hashedPassword,
      role: "citizen",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`Success! User ${email} has been created with 'citizen' role.`);
    console.log(`User ID: ${result.insertedId}`);
  } catch (err) {
    console.error("Error creating user:", err);
  } finally {
    await mongoose.disconnect();
  }
}

createUser();
