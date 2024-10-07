import PoiLocation from "../models/PoiLocation.js";
import GraphingInstance from "./graphing.js";

class Runner {
    static main = async () => {
        const data = await PoiLocation.findAllForGraph();
        const calculatedDistances = await GraphingInstance.calculateBatches(data);

        GraphingInstance.drawGraph(calculatedDistances);
    }

    static findAllPaths = (origin, destination, options) => {
        console.log("Finding path between " + origin + " and " + destination);
        const shortest = GraphingInstance.findShortestPath(origin, destination, options);
        const allPossibleRoutes = GraphingInstance.findAllPaths(origin, destination);

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

        console.log(result);
    }
}

// await Runner.main();
GraphingInstance.generateGraphFromFile("output/graph.json");
// const shortest = Graphing.findShortestPath("HSA_2471", "HSA_2472");
// console.log("shortest: ", shortest)

Runner.findAllPaths("YP002_2833", "YP001_741");

// const y = Graphing.findAllPaths("YP002_2833", "YP001_741");
// console.log("result: \n", y);
