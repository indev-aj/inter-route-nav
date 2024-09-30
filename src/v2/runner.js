import Graphing from "./graphing.js";

class Runner {
    static main = async () => {
        const data = await Graphing.fetchData();
        const calculatedDistances = await Graphing.calculateBatches(data);

        Graphing.drawGraph(calculatedDistances);
    }
}

Runner.main();