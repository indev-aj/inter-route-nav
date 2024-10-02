import Graphing from "./graphing.js";

class Runner {
    static main = async () => {
        const data = await Graphing.fetchData();
        const calculatedDistances = await Graphing.calculateBatches(data);

        Graphing.drawGraph(calculatedDistances);
    }

    static findPath = (origin, destination, options) => {
        console.log("Finding path between " + origin + " and " + destination);
        const path = Graphing.findPath(origin, destination, options);

        console.log("Path: ", path);
    }
}

// await Runner.main();
Graphing.generateGraphFromFile("output/graph.txt");

Runner.findPath("BP001_727", "BP002_2628", { cost: true });
Runner.findPath("BP002_1137", "BP001_727", { cost: true });