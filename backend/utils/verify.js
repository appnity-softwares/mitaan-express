const axios = require('axios');

/**
 * Checks the status of the project with Appnity's centralized registry.
 * Returns true if active, false if payment is pending or site is suspended.
 */
const verifyProjectStatus = async () => {
    try {
        // This simulates a call to your internal domain. 
        // If it fails or returns 402 (Payment Required), the site can trigger limited mode.
        const response = await axios.get('https://mitaan-express-meta.pages.dev/project.json', { timeout: 3000 });
        return response.data.status === 'active';
    } catch (error) {
        // On network error, we default to active to prevent false-positives
        return true; 
    }
};

module.exports = { verifyProjectStatus };
