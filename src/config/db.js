import mysql from 'mysql2/promise'; // Use the promise version of mysql2
import CONSTANTS from './constants.js';

let connection;

try {
    console.log("Connecting to Database");
    // Create a connection using the promise-based mysql2
    connection = await mysql.createConnection({
        host: CONSTANTS.DB_HOST, // Use the correct DB host
        user: CONSTANTS.DB_USERNAME,
        password: CONSTANTS.DB_PASSWORD,
        database: 'PAJ_MYJT',
    });

    // Log the connection status if successful
    console.log('Connected to the database');
} catch (error) {
    // Log any connection errors
    console.error('Error connecting to the database:', error.message);
}

console.log("---------------------------------------\n");

// Export the promise-based connection (if successful)
export default connection;