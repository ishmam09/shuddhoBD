const axios = require('axios');
require('dotenv').config({ path: './.env' });

async function testFetch() {
  const apiKey = process.env.GEMINI_API_KEY.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: "Hello" }] }]
    });
    console.log("Success with v1beta!");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("Failed with v1beta:", err.response?.status, err.response?.data);
    
    // Try v1
    const urlV1 = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    try {
        const resV1 = await axios.post(urlV1, {
          contents: [{ parts: [{ text: "Hello" }] }]
        });
        console.log("Success with v1!");
        console.log(JSON.stringify(resV1.data, null, 2));
    } catch (errV1) {
        console.log("Failed with v1:", errV1.response?.status, errV1.response?.data);
    }
  }
}

testFetch();
