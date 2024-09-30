import connection from "../config/db.js";
import _ from "lodash";
import * as XLSX from 'xlsx';
import * as fs from 'fs';

import Graph from "node-dijkstra";

class Graphing {
    // **************************************
    // Utils
    // **************************************
    static routeGraph = new Graph();

    static saveToExcel = (data) => {
        // Convert array of objects to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);
        
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        
        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Intersections');

        // Define the filename and write the file
        const fileName = 'intersections.xlsx';
        XLSX.writeFile(workbook, fileName);

        console.log(`Data saved to ${fileName}`);
    };

    static saveToJsonFile = (data) => {
        const jsonString = JSON.stringify(data, null, 2);  // Pretty-print the JSON with 2-space indentation
        const fileName = 'routes_with_intersections.json';  // Define the output filename

        try {
            fs.writeFile(fileName, jsonString, 'utf8');  // Write the JSON data to a file
            console.log(`Data successfully saved to ${fileName}`);
        } catch (error) {
            console.error('Error writing JSON file:', error);
        } finally {
            console.log('writing to file finished');
        }
    };

    // Function to print the graph
    static printGraph = (graph) => {
        // Access the internal graph structure (which is a Map)
        const internalGraph = graph.graph;
        console.log(internalGraph)

        const graphObject = {};
        internalGraph.forEach((edges, node) => {
            graphObject[node] = Object.fromEntries(edges); // Convert Map to a plain object
        });

        // Convert the object to a JSON string
        const graphString = JSON.stringify(graphObject, null, 2); // Pretty print with 2 spaces indentation

        // Write the stringified graph to a file
        fs.writeFile('graph.txt', graphString, (err) => {
            if (err) {
                console.error('Error writing the graph to file:', err);
            } else {
                console.log('Graph written successfully');
            }
        });
    };

    static fetchData = async () => {
        const query = `
        SELECT
            id,
            name,
            route,
            bound_type,
            SEQUENCE,
            station_code,
            lat,
            lng
        FROM
            poi_location
        ORDER BY
            route,
            bound_type,
            SEQUENCE;
        `;

        try {
            // Execute the query using the promise-based connection
            const [results] = await connection.execute(query);

            // Group the results by the 'bound_type' field
            const groupedRoutes = _.groupBy(results, route => `${route.route}_${route.bound_type}`);

            // Log the results and fields
            // console.log('Results:', groupedRoutes);

            return groupedRoutes;
        } catch (error) {
            // Handle any errors that occur during query execution
            console.error('Error executing query: ', error);
        }
    };

    // **************************************
    // Single / V1
    // **************************************

    static calculateDistance = async (fromLat, fromLong, toLat, toLong) => {
        const locationFrom = `${fromLong},${fromLat}` ;
        const locationTo = `${toLong},${toLat}` ;

        const url = `http://127.0.0.1:1331/table/v1/foot/${locationFrom};${locationTo}?annotations=distance,duration`;

        try {
            // Call the OSRM API using fetch
            const response = await fetch(url);
            
            // Check if the response is ok (status code 200)
            if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
            }
            
            // Parse the JSON response
            const data = await response.json();
            
            // The OSRM response contains the distance matrix; extract the first element
            const distance = data.distances[0][1];  // First to second location
            const duration = data.durations[0][1];  // Travel time in seconds

            // Log or return the result
            // console.log(`Distance: ${distance} meters`);
            // console.log(`Duration: ${duration} seconds`);

            return { distance, duration };
        } catch (error) {
            console.error('Error fetching OSRM data: ', error);
        }
    }

    // Function to compare all stops in one route with stops in another route
    static compareRoutes = async (routeA, routeB) => {
        const distanceTreshold = 250;
        const intersections = [];

        for (const stopA of routeA) {
            for (const stopB of routeB) {
                const {distance, duration} = await calculateDistance(stopA.lat, stopA.lng, stopB.lat, stopB.lng);
                
                if (distance !== null && distance <= distanceTreshold) {
                    // console.log(`Connection found between stop ${stopA.name} and stop ${stopB.name}. Distance: ${distance} meters`);
                    
                    const inter = {
                        from: stopA.name,
                        to: stopB.name,
                        fromRoute: stopA.route,
                        toRoute: stopB.route,
                        distance: distance
                    };

                    intersections.push(inter);
                } else {
                    // console.log(`No connection between stop ${stopA.name} and stop ${stopB.name}. Distance: ${distance} meters`);
                }

                // console.log();
            }
        }

        return intersections;
    };

    static main = async() => {
        const data = await fetchData();
        const keys = Object.keys(data);

        const intersections = [];

        console.log('Calculating...')
        console.time('calculate');
        for (let i=0;i < keys.length; i++) {
            for (let j = i + 1; j < keys.length; j++) {
                const routeA = data[keys[i]];
                const routeB = data[keys[j]];
                
                // console.log(`Checking connectivity between ${keys[i]} and ${keys[j]}...\n`);
                const result = await compareRoutes(routeA, routeB);  // Compare two different routes

                if (result && result.length > 0) {
                    intersections.push(result);
                }
            }
        }
        console.timeEnd('calculate');

        console.log(intersections);
    }

    // **************************************
    // Batches / V2
    // **************************************

    static calculateDistanceBatches = async (locationsA, locationsB) => {
        const allLocations = [...locationsA, ...locationsB]; // Combine Route A and Route B locations
        
        // Format the locations into the OSRM URL
        const locationString = allLocations.map(loc => `${loc.lng},${loc.lat}`).join(';');
        
        // OSRM batch request URL (many-to-many, for walking 'foot')
        const url = `http://127.0.0.1:1331/table/v1/foot/${locationString}?annotations=distance`;
    
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
        
            const data = await response.json();
            
            // Extract distances between Route A and Route B
            const distances = data.distances;
        
            // Slice the matrix to only include distances between Route A and Route B
            const relevantDistances = distances.slice(0, locationsA.length).map(row => row.slice(locationsA.length));
        
            return relevantDistances;
        } catch (error) {
            console.error('Error fetching OSRM data:', error);
        }
    };

    static calculateRoutesBatches = async (routeA, routeB) => {
        const distanceThreshold = 250;  // 250 meters
        const intersections = [];

        const locationsA = routeA.map(stop => ({ lat: stop.lat, lng: stop.lng }));
        const locationsB = routeB.map(stop => ({ lat: stop.lat, lng: stop.lng }));
    
        // Fetch distance matrix between all stops in Route A and Route B
        const distances = await this.calculateDistanceBatches(locationsA, locationsB);
    
        // Loop through the distance matrix and check if any stop pair is within the threshold
        for (let i = 0; i < distances.length; i++) {
            for (let j = 0; j < distances[i].length; j++) {
                const distance = distances[i][j];

                // skip if still contains data for same route
                const fromRoute = `${routeA[i].route} Bound: ${routeA[i].bound_type}`;
                const toRoute = `${routeB[j].route} Bound: ${routeB[j].bound_type}`;
                
                if (distance !== null && distance <= distanceThreshold) {

                    const origin = `${routeA[i].lat},${routeA[i].lng}`;
                    const destination = `${routeB[j].lat},${routeB[j].lng}`;

                    intersections.push({
                        fromStopId: routeA[i].id,
                        toStopId: routeB[j].id,
                        from: routeA[i].name,
                        to: routeB[j].name,
                        fromRoute: routeA[i].route,
                        toRoute: routeB[j].route,
                        fromBoundtype: routeA[i].bound_type,
                        toBoundtype: routeB[j].bound_type,
                        fromSequence: routeA[i].sequence,
                        toSequence:  routeB[j].sequence,
                        originLocation: origin,
                        destinationLocation: destination,
                        distance: distance
                    });
                }
            }
        }
    
        return intersections;
    };

    static calculateBatches = async (data) => {
        const routeKeys = Object.keys(data);
        const allIntersections = [];

        console.log('Calculating distances');
        console.time('batch');
        for (let i = 0; i < routeKeys.length; i++) {
            for (let j = i + 1; j < routeKeys.length; j++) {
                const routeA = data[routeKeys[i]];
                const routeB = data[routeKeys[j]];

                // Use batch comparison for each route pair
                const intersections = await this.calculateRoutesBatches(routeA, routeB);

                if (intersections.length > 0) {
                    allIntersections.push(...intersections);
                    this.appendIntersectionsToStops(routeA, routeB, intersections);
                }
            }
        }
        console.timeEnd('batch');

        // this.saveToJsonFile(data);
        // this.saveToExcel(allIntersections);

        return data;
    }

    static appendIntersectionsToStops = (routeA, routeB, intersections) => {
        intersections.forEach(intersection => {
            const fromStopId = intersection.fromStopId;
            const toStopId = intersection.toStopId;
            const distance = intersection.distance;

            // Find the stop in routeA that matches the fromStopId
            const fromStop = routeA.find(stop => stop.id === fromStopId);
            if (fromStop) {
                // Initialize intersections array if it doesn't exist
                if (!fromStop.intersections) {
                    fromStop.intersections = [];
                }
                // Add the intersection info to the stop in routeA
                fromStop.intersections.push({
                    withRoute: intersection.toRoute,
                    stopId: toStopId,
                    distance: distance
                });
            }

            // Find the stop in routeB that matches the toStopId
            const toStop = routeB.find(stop => stop.id === toStopId);
            if (toStop) {
                // Initialize intersections array if it doesn't exist
                if (!toStop.intersections) {
                    toStop.intersections = [];
                }
                // Add the intersection info to the stop in routeB
                toStop.intersections.push({
                    withRoute: intersection.fromRoute,
                    stopId: fromStopId,
                    distance: distance
                });
            }
        });
    }

    // const sampleRoutes = {
    //     "BP001_1": [
    //       {
    //         "id": 727,
    //         "name": "Terminal Bas Express Batu Pahat",
    //         "route": "BP001",
    //         "bound_type": 1,
    //         "SEQUENCE": 1,
    //         "station_code": "BP001, BP002",
    //         "lat": "1.85336979",
    //         "lng": "102.92666980",
    //         "intersections": [
    //           {
    //             "withRoute": "BP002",
    //             "stopId": 1137,
    //             "distance": 120
    //           }
    //         ]
    //       },
    //       {
    //         "id": 726,
    //         "name": "Balai Polis Batu Pahat,Jalan Rahmat",
    //         "route": "BP001",
    //         "bound_type": 1,
    //         "SEQUENCE": 2,
    //         "station_code": "BP001, BP002",
    //         "lat": "1.84783893",
    //         "lng": "102.93475030"
    //       }
    //       // More stops...
    //     ],
    //     "BP002_0": [
    //       {
    //         "id": 2636,
    //         "name": "TAMAN UNIVERSITI",
    //         "route": "BP002",
    //         "bound_type": 0,
    //         "SEQUENCE": 12,
    //         "station_code": null,
    //         "lat": "1.84814100",
    //         "lng": "103.07251500"
    //       },
    //       {
    //         "id": 2637,
    //         "name": "KKTM SRI GADING",
    //         "route": "BP002",
    //         "bound_type": 0,
    //         "SEQUENCE": 13,
    //         "station_code": null,
    //         "lat": "1.85019000",
    //         "lng": "103.07996400"
    //       }
    //     ]
    // };

    // Initialize the Dijkstra graph
    // const routeGraph = new Graph();

    static createConnectionWIthinRoute = (route) => {
        try {
            for (let i = 0; i < route.length - 1; i++) {
                const currentStop = route[i];
                const nextStop = route[i + 1];
    
                const nodes = {};
    
                // Create node names for each stop (format: routeName_stopId)
                // Create node for the next stop in sequence
                const currentNode = `${currentStop.route}_${currentStop.id}`;
                const nextNode = `${nextStop.route}_${nextStop.id}`;
    
                nodes[nextNode] = 1;
    
                // Create node for intersection
                if (currentStop.intersections) {
                    console.log('intersection found for: ', currentStop.name)
                    currentStop.intersections.forEach(intersection => {
                        const fromNode = `${currentStop.route}_${currentStop.id}`;
                        const toNode = `${intersection.withRoute}_${intersection.stopId}`;
                        const distance = intersection.distance; // Use the distance from the intersection data
                        
                        nodes[toNode] = distance;
                    });
                }
                
                this.routeGraph.addNode(currentNode, nodes);
            }
        } catch (error) {
            console.error("Unable to create connection: ", error);
        }
    }

    static drawGraph = (routes) => {
        // Add all routes to the graph
        Object.keys(routes).forEach(routeKey => {
            const route = routes[routeKey];
        
            // Add connections within the same route
            this.createConnectionWIthinRoute(route);
        });

        this.printGraph(this.routeGraph);
    }

    // calculateBatches();
    // drawGraph();
}

export default Graphing;