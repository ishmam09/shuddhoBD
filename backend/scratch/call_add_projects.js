const axios = require('axios');

async function callRoute() {
    try {
        const res = await axios.post('http://localhost:5001/api/projects/add-test-projects');
        console.log(res.data.message);
    } catch (err) {
        console.error("Failed to add projects:", err.response?.data || err.message);
    }
}

callRoute();
