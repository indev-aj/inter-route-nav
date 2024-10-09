// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const {
    DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, REDIS_URI, SERVER_PORT
} = process.env;

const CONSTANTS = {
    DB_HOST: DB_HOST,
    DB_USERNAME: DB_USERNAME,
    DB_PASSWORD: DB_PASSWORD,
    DB_NAME: DB_NAME,
    REDIS_URI: REDIS_URI || 'redis://localhost:6379',
    SERVER_PORT: SERVER_PORT,
    ALL_STOPS_LOCATION_SET: 'ALL_STOPS_LOCATION_SET',
    STOP_PREFIX: 'STOP_',
}

export default CONSTANTS;