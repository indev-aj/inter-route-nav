import PoiLocation from "../models/PoiLocation.js";
import CONSTANTS from "../config/constants.js";
import Cache from "../config/cache.js";
import StopServiceInstance from "../services/StopService.js";

class StopController {
    static async findAll(req, res) {
        const data = await PoiLocation.findAll();

        return res.ok(data);
    }

    static async updateStopCache(req, res) {
        const stops = await PoiLocation.findAll();
        const locations = {};

        for (let i = 0; i < stops.length; i++) {
            let stop = stops[i];
            locations[`${CONSTANTS.STOP_PREFIX}${stop.id}`] = { latitude: stop.lat, longitude: stop.lng };
        }

        const result = await Cache.addStopsToRoute(`${CONSTANTS.ALL_STOPS_LOCATION_SET}`, locations);

        if (result) return res.ok("Cache updated successfully");
        else return res.status(500);
    }

    static async findNearbyStops(req, res) {
        const { latitude, longitude } = req.query;
     
        let nearbyStops = await StopServiceInstance.findNearbyStops(latitude, longitude);

        const stopIds = nearbyStops.map((stop) => {
            return stop.replace("STOP_", "");
        });

        nearbyStops = await PoiLocation.findBatchByStopIds(stopIds);
        return res.ok(nearbyStops);
    }
}

export default StopController;