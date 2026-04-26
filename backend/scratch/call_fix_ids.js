const axios = require('axios');

async function callRoute() {
    try {
        const res = await axios.post('http://localhost:5001/api/projects/fix-test-ids');
        console.log(res.data.message);
    } catch (err) {
        console.error("Failed to update project IDs:", err.response?.data || err.message);
    }
}

callRoute();
