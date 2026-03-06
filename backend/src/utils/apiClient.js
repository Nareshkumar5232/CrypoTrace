/**
 * apiClient.js
 * Configured Axios instance for external API calls with error handling.
 */
const axios = require('axios');

const apiClient = axios.create({
    timeout: 10000, // 10 second timeout
});

// Response interceptor for generic error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Format error so calling services get consistent error objects
        const formattedError = new Error();

        if (error.response) {
            // The request was made and server responded with a status outside 2xx
            formattedError.message = `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            formattedError.statusCode = error.response.status === 429 ? 429 : 502;
        } else if (error.request) {
            // The request was made but no response was received
            formattedError.message = 'API Error: No response received from server. Endpoint may be unavailable.';
            formattedError.statusCode = 503;
        } else {
            // Error setting up the request
            formattedError.message = `API Error: ${error.message}`;
            formattedError.statusCode = 500;
        }

        throw formattedError;
    }
);

module.exports = apiClient;
