import CONSTANTS from "../config/constants.js";
import Cache from "../config/cache.js";

class StopService {
    async findNearbyStops(latitude, longitude, radius = 250) {
        const nearbyStops = await Cache.getStopFromRoute(`${CONSTANTS.ALL_STOPS_LOCATION_SET}`, latitude, longitude, radius);

        return nearbyStops;
    }
}

const StopServiceInstance = new StopService();

export default StopServiceInstance;