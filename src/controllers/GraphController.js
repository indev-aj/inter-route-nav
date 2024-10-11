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
        const { origin, destination, simple = false, showCost = false } = req.query;

        if (GraphServiceInstance.graphSize=== 0)
            GraphServiceInstance.generateGraphFromFile("output/graph.json");

        console.log("Finding path between " + origin + " and " + destination);

        // implement finding nearby bus stops
        // for origin, 400m radius, for destination 400m walking distance

        const options = { cost: showCost };
        const shortest = GraphServiceInstance.findShortestPath(origin, destination, options);
        const allPossiblePaths = GraphServiceInstance.findAllPaths(origin, destination);

        const result = {
            shortest: shortest,
            paths: allPossiblePaths
        };

        return res.ok(result);
    }
}


export default GraphController;