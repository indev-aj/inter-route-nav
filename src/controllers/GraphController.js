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
        const { origin, destination } = req.query;

        GraphServiceInstance.generateGraphFromFile("output/graph.json");
        console.log("Finding path between " + origin + " and " + destination);
        const shortest = GraphServiceInstance.findShortestPath(origin, destination);
        const allPossibleRoutes = GraphServiceInstance.findAllPaths(origin, destination);

        const result = {
            shortest: shortest,
            paths: allPossibleRoutes
        }

        if (allPossibleRoutes.length > 1) {
            console.log("Multiple routes found!");
        } else if (shortest){
            console.log("Only 1 route found!");
        } else {
            console.log("No route found!")
        }

        return res.ok(result);
    }
}


export default GraphController;