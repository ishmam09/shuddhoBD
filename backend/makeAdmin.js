const mongoose = require('mongoose');
require('dotenv').config();

const email = process.argv[2];

if (!email) {
  console.error("Please provide the email address you registered with.");
  console.error("Usage: node makeAdmin.js <your-email@example.com>");
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/shuddhobd';

async function makeAdmin() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to database...");
    
    const db = mongoose.connection.db;
    const result = await db.collection("users").updateOne(
      { email: email },
      { $set: { role: "admin" } }
    );
    
    if (result.matchedCount === 0) {
      console.log(`No user found with email: ${email}`);
      console.log("Please make sure you have signed up on the website first.");
    } else {
      console.log(`Success! User ${email} has been granted the 'admin' role.`);
      console.log("You may need to log out and log back in for the changes to take effect.");
    }
  } catch (err) {
    console.error("Error updating user role:", err);
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin();
