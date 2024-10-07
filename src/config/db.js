import dotenv from 'dotenv';
import mysql from 'mysql2/promise'; // Use the promise version of mysql2
import CONSTANT from './constants.js';

// Load environment variables from .env file
dotenv.config();

let connection;

try {
    console.log("Connecting to Database");
    // Create a connection using the promise-based mysql2
    connection = await mysql.createConnection({
        host: process.env.DB_HOST, // Use the correct DB host
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
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