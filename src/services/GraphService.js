import Graph from "node-dijkstra";
import * as fs from 'fs';
import Helper from "../helpers/helpers.js";

class GraphService {
    #routeGraph = new Graph();

    get graph() {
        return this.#routeGraph.graph;
    }

    /* ****************
    ** Private Methods
    **************** */
    #getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return; // Remove cyclic reference
                }
                seen.add(value);
            }
            return value;
        };
    }

    async #calculateDistanceBatches(locationsA, locationsB) {
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
            const distances = data.distances;
        
            return distances;
        } catch (error) {
            console.error('Error fetching OSRM data:', error);
        }
    }

    async #calculateRoutesBatches(routeA, routeB) {
        const distanceThreshold = 250;  // 250 meters
        const intersections = [];

        const locationsA = routeA.map(stop => ({ lat: stop.lat, lng: stop.lng }));
        const locationsB = routeB.map(stop => ({ lat: stop.lat, lng: stop.lng }));
    
        const distances = await this.#calculateDistanceBatches(locationsA, locationsB);
    
        // Append within-route distances for Route A
        for (let i = 0; i < locationsA.length - 1; i++) {
            const distance = distances[i][i + 1];  // Distance between stops in routeA
            routeA[i + 1].distance = distance;    // Append distance to the next stop
        }

        // Append within-route distances for Route B
        for (let i = 0; i < locationsB.length - 1; i++) {
            const distance = distances[locationsA.length + i][locationsA.length + i + 1]; // Distance in routeB
            routeB[i + 1].distance = distance;  // Append distance to the next stop
        }

        // Loop through the distance matrix and check if any stop pair is within the distance threshold
        for (let i = 0; i < locationsA.length; i++) {
            for (let j = 0; j < locationsB.length; j++) {
                const distance = distances[i][locationsA.length + j];
                
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
    }

    #loadGraph(filePath) {
        try {
            // Correct use of fs.readFileSync (synchronously reads the file with UTF-8 encoding)
            const fileData = fs.readFileSync(filePath, 'utf8');  // No callback function needed
            
            // Parse the JSON data
            const graphData = JSON.parse(fileData);
            
            // Loop through the nodes and add them back into the graph
            Object.keys(graphData).forEach(nodeKey => {
              const neighbors = graphData[nodeKey];
              this.#routeGraph.addNode(nodeKey, neighbors);
            });
            
            console.log('Graph loaded successfully from file');

            return this.#routeGraph;
        } catch (error) {
            console.error('Error loading graph:', error);
        }
    }

    #createConnectionWithinRoute(route) {
        let currentStop;
        let currentNode;
        let nextStop;
        let nextNode;
    
        try {
            for (let i = 0; i < route.length; i++) {
                currentStop = route[i];
                currentNode = `${currentStop.route}_${currentStop.id}`;
    
                // Get existing connections for the current node, if it exists
                let existingConnections = this.#routeGraph.graph.get(currentNode) || {};
    
                // Check if this is the last stop in the route
                if (i === route.length - 1) {
                    // Handle the last stop, which doesn't have a "next" stop
                    
    
                    // Add any intersections for the last stop, if available
                    if (currentStop.intersections) {
                        currentStop.intersections.forEach(intersection => {
                            const toNode = `${intersection.withRoute}_${intersection.stopId}`;
                            let distance = intersection.distance;
    
                            // Force distance cost to be at least 1 
                            if (!distance || distance <= 0) distance = 1;
                            existingConnections[toNode] = distance;
                        });
                    }
    
                    // Add the last stop to the graph with its intersections (if any)
                    this.#routeGraph.addNode(currentNode, existingConnections);
                } else {
                    // Handle stops that have a "next" stop
                    nextStop = route[i + 1];
                    nextNode = `${nextStop.route}_${nextStop.id}`;
    
                    let distance = nextStop.distance;
    
                    // Force distance cost to be at least 1
                    if (!distance || distance <= 0) distance = 1;
    
                    const neighbors = { ...existingConnections, [nextNode]: distance };
    
                    // Add intersections, if any
                    if (currentStop.intersections) {
                        currentStop.intersections.forEach(intersection => {
                            const toNode = `${intersection.withRoute}_${intersection.stopId}`;
                            let distance = intersection.distance;
    
                            // Force distance cost to be at least 1 
                            if (!distance || distance <= 0) distance = 1;
                            neighbors[toNode] = distance;
                        });
                    }
    
                    // Add the current stop and its neighbors to the graph
                    this.#routeGraph.addNode(currentNode, neighbors);
                }
            }
        } catch (error) {
            console.error("Unable to create connection: ", error);
            console.error("Attempted to create node: ", currentNode);
        }
    }

    #appendIntersectionsToStops(routeA, routeB, intersections) {
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

    // Recursive DFS to find all possible routes
    #findAllPathsRecursive(currentNode, endNode, visited, path, allPaths, startTime, depth = 0, maxDepth = 100) {
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
        // process.stdout.write(`Time elapsed: ${elapsedTime}s - Visiting node: ${currentNode}\r`);
        
        if (elapsedTime > 10) {
            return;
        }
    
        // Mark the current node as visited
        visited.add(currentNode);
        path.push(currentNode);
    
        // If the destination is reached, store the path
        if (currentNode === endNode) {
            allPaths.push([...path]); // Make a copy of the path
        } else {
            // Get the neighbors of the current node
            let neighbors = this.#routeGraph.graph.get(currentNode);
    
            if (neighbors) {
                for (let neighbor of neighbors.keys()) {
                    if (!visited.has(neighbor)) {
                        this.#findAllPathsRecursive(neighbor, endNode, visited, path, allPaths, startTime, depth + 1, maxDepth);
                    }
                }
            }
        }
    
        // Backtrack: unmark the current node and remove it from the path
        path.pop();
        visited.delete(currentNode);
    }

    /* ****************
    ** Public Methods
    **************** */
    printGraph(graph, log = true) {
        // Access the internal graph structure (which is a Map)
        const internalGraph = graph.graph;
        if (log) console.log(internalGraph)

        const graphObject = {};
        internalGraph.forEach((edges, node) => {
            graphObject[node] = Object.fromEntries(edges); // Convert Map to a plain object
        });

        // Convert the object to a JSON string
        let graphString;
        try {
            graphString = JSON.stringify(graphObject, this.#getCircularReplacer(), 2); // Pretty print with 2 spaces indentation
            console.log('Graph stringified successfully.');
        } catch (error) {
            console.error('Error stringifying the graph:', error);
            return;
        }

        // Write the stringified graph to a file
        fs.writeFile('output/graph.json', graphString, (err) => {
            if (err) {
                console.error('Error writing the graph to file:', err);
            } else {
                console.log('Graph written successfully');
            }
        });
    }

    drawGraph (routes) {
        // Add all routes to the graph
        Object.keys(routes).forEach(routeKey => {
            const route = routes[routeKey];
            
            Helper.saveToJsonFile("routes/" + routeKey, route);
            this.#createConnectionWithinRoute(route);
        });

        this.printGraph(this.#routeGraph, false);
    }

    generateGraphFromFile(file) {
        console.log("Generating graph from file");
        this.#loadGraph(file);
        console.log("---------------------------------------\n");
    }

    async calculateBatches(data) {
        const routeKeys = Object.keys(data);
        const allIntersections = [];

        console.log('Calculating distances');
        console.time('batch');
        for (let i = 0; i < routeKeys.length; i++) {
            for (let j = i + 1; j < routeKeys.length; j++) {
                const routeA = data[routeKeys[i]];
                const routeB = data[routeKeys[j]];

                // Use batch comparison for each route pair
                const intersections = await this.#calculateRoutesBatches(routeA, routeB);

                if (intersections.length > 0) {
                    allIntersections.push(...intersections);
                    this.#appendIntersectionsToStops(routeA, routeB, intersections);
                }
            }
        }
        console.timeEnd('batch');
        console.log('');
        return data;
    }

    findShortestPath(origin, destination, options = { cost: false }) {
        return this.#routeGraph.path(origin, destination, options);
    }

    findAllPaths(startNode, endNode) {
        let allPaths = [];
        let path = [];
        let visited = new Set();
    
        const startTime = Date.now(); // Start the timer
        console.log("Finding all possible routes. This might take up to 10 seconds...");
        this.#findAllPathsRecursive(startNode, endNode, visited, path, allPaths, startTime);
        
        return allPaths;
    }
}

const GraphServiceInstance = new GraphService();

export default GraphServiceInstance;