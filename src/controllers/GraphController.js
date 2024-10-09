import Utils from "../helpers/utils.js";
import PoiLocation from "../models/PoiLocation.js";
import GraphServiceInstance from "../services/GraphService.js";

class GraphController {
    static async generateGraph(req, res) {
        const data = await PoiLocation.findAllForGraph();
        const calculatedDistances = await GraphServiceInstance.calculateBatches(data);

        GraphServiceInstance.drawGraph(calculatedDistances);

        return res.ok("Graph Generated Successfully");
    }

    static async findPaths(req, res) {
        const { origin, destination, simple = false } = req.query;

        if (GraphServiceInstance.graph.size === 0)
            GraphServiceInstance.generateGraphFromFile("output/graph.json");

        console.log("Finding path between " + origin + " and " + destination);
        const shortest = GraphServiceInstance.findShortestPath(origin, destination);
        const allPossiblePaths = GraphServiceInstance.findAllPaths(origin, destination);

        const shortestPathStopIds = shortest.map((stop) => {
            return stop.split("_").pop();
        });

        let allPossiblePathsStopIds = [];
        for (const path of allPossiblePaths) {
            const ids = path.map((stop) => {
                return stop.split("_").pop();
            });

            allPossiblePathsStopIds.push(ids)
        }

        let allPossiblePathsDetailed = [];
        let shortestPath;
        for (const pathIds of allPossiblePathsStopIds) {
            let stops = await PoiLocation.findBatchByStopIds(pathIds);
        
            
            // Initialize an empty array to hold detailed stops, including dropOff and hopOn info
            let detailedStops = [];
            
            for (let i = 0; i < stops.length; i++) {
                let stop = { ...stops[i] }; // Clone the stop to avoid mutating the original object
                let nextStop = stops[i + 1];
                
                // By default, dropOff and hopOn are not present (only append if needed)
                delete stop.dropOff;
                delete stop.hopOn;
                
                // Check if there's a next stop and if the route or bound changes
                if (nextStop && (stop.route !== nextStop.route || stop.bound !== nextStop.bound)) {
                    // Mark this stop as a drop-off point and the next stop as a hop-on point
                    stop.dropOff = true;
                    nextStop = { ...nextStop, hopOn: true }; // Ensure we don't modify the original nextStop object
                    
                    // Append the nextStop with hopOn to detailedStops
                    detailedStops.push(stop);
                    detailedStops.push(nextStop);
                    
                    // Skip incrementing to the next stop manually since we already handled it
                    i++;
                } else {
                    // Just add the stop if no interchange occurs
                    detailedStops.push(stop);
                }
            }
            
            if (Utils.identicalArray(shortestPathStopIds, pathIds)) shortestPath = stops;
            // Add this route's detailed stops (including dropOff and hopOn info) to the full list
            allPossiblePathsDetailed.push(detailedStops);
        }
        
        

        const result = {
            shortest: simple ? shortest : shortestPath,
            paths: simple ? allPossiblePaths :  allPossiblePathsDetailed
        };

        return res.ok(result);
    }
}


export default GraphController;