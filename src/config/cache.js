import redis from 'redis';
import CONSTANTS from './constants.js';

class Cache {
    constructor() {
        this.client = null;
        this.geo = null;
    }

    static async connect() {
        // Redis v4 client uses `createClient()` and `.connect()` must be awaited
        this.client = redis.createClient({ url: CONSTANTS.REDIS_URI });
        await this.client.connect();

        // Handle any Redis client errors
        this.client.on('error', (error) => {
            console.error('Redis Error:', error);
        });

        console.log('Connected to Redis');
    }

    static async set(key, value, isJson = false) {
        try {
            const result = await this.client.set(key, isJson ? JSON.stringify(value) : value);
            return result;
        } catch (error) {
            console.error('Redis SET Error:', error);
            throw error;
        }
    }

    static async setExp(key, seconds, value, isJson = false) {
        try {
            const result = await this.client.setEx(key, seconds, isJson ? JSON.stringify(value) : value);
            return result;
        } catch (error) {
            console.error('Redis SETEX Error:', error);
            throw error;
        }
    }

    static async get(key, isJson = false) {
        try {
            const result = await this.client.get(key);
            return isJson ? JSON.parse(result) : result;
        } catch (error) {
            console.error('Redis GET Error:', error);
            throw error;
        }
    }

    static async delete(key) {
        try {
            const result = await this.client.del(key);
            return result;
        } catch (error) {
            console.error('Redis DEL Error:', error);
            throw error;
        }
    }

    /**
     * Add stops to a geospatial set using Redis GEOADD
     * @param {string} name - The name of the geospatial set
     * @param {object} stops - An object with stop IDs as keys and lat/lng as values
     */
    static async addStopsToRoute(name, stops) {
        try {
            const pipeline = this.client.multi(); // Use pipeline for batch operations

            // Add each stop's geospatial data
            for (let stopId in stops) {
                const { latitude, longitude } = stops[stopId];
                pipeline.geoAdd(name, { longitude, latitude, member: stopId });
            }

            // Execute the pipeline
            await pipeline.exec();
            console.log('Stops added to geospatial set.');

            return true;
        } catch (error) {
            console.error('Error adding stops to geospatial set:', error);
            throw error;
        }
    }
    
    /**
     * Get stops within a radius using Redis GEORADIUS or GEOSEARCH
     * @param {string} name - The name of the geospatial set
     * @param {number} latitude - Latitude of the center point
     * @param {number} longitude - Longitude of the center point
     * @param {number} radius - The search radius in meters
     */
    static async getStopFromRoute(name, latitude, longitude, radius = 250) {
        try {
            const result = await this.client.geoRadius(name, {latitude, longitude}, radius, 'm');
            return result;
        } catch (error) {
            console.error('Error fetching stops from geospatial set:', error);
            throw error;
        }
    }
}

export default Cache;
