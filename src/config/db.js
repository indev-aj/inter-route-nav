import dotenv from 'dotenv';
import mysql from 'mysql2/promise'; // Use the promise version of mysql2
import CONSTANT from './constants.js';

// Load environment variables from .env file
dotenv.config();

// Create a connection using the promise-based mysql2
const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'PAJ_MYJT',
});

// Log the connection status
console.log('Connected to the database');

// Export the promise-based connection
export default connection;
