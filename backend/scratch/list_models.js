const axios = require('axios');
require('dotenv').config({ path: './.env' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await axios.get(url);
    console.log("Available models:");
    res.data.models.forEach(m => console.log(m.name));
  } catch (err) {
    console.log("Failed to list models:", err.response?.status, err.response?.data);
  }
}

listModels();
