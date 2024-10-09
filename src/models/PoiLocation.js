import connection from "../config/db.js";
import _ from "lodash";

class PoiLocation {
    constructor(row) {
        this.id = row.id;
        this.route = row.route;
        this.name = row.name;
        this.lat = row.lat;
        this.lng = row.lng;
        this.boundType = row.bound_type;
        this.type = row.type;
        this.polygon = row.polygon;
        this.stationCode = row.station_code;
        this.sequence = row.sequence;
    }

    static async findAllForGraph() {
        const query = `
        SELECT
            id,
            name,
            route,
            bound_type,
            sequence,
            station_code,
            lat,
            lng
        FROM
            poi_location
        ORDER BY
            route,
            bound_type,
            sequence;
        `;

        try {
            const [results] = await connection.execute(query);
            const groupedRoutes = _.groupBy(results, route => `${route.route}_${route.bound_type}`);

            return groupedRoutes;
        } catch (error) {
            console.error('Error executing query: ', error);
        }
    }

    static async findAll() {
        const query = `
        SELECT * FROM
            poi_location
        ORDER BY
            route,
            bound_type,
            sequence;
        `;

        try {
            const [results] = await connection.execute(query);

            return results.map(row => new PoiLocation(row));
        } catch (error) {
            console.error('Error executing query: ', error);
        }
    }

    static async findBatchByStopIds(stopIds) {
        const sqlQuery = `
            SELECT * 
            FROM poi_location 
            WHERE id IN (${stopIds.map(() => '?').join(',')})
            ORDER BY FIELD(id, ${stopIds.map(() => '?').join(',')})
        `;
    
        // Pass stopIds twice, once for the IN clause and once for FIELD function
        const [results] = await connection.query(sqlQuery, [...stopIds, ...stopIds]);
    
        return results.map(row => new PoiLocation(row));
    }
}

export default PoiLocation;