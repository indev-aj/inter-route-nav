const routes = require('./routes');
const axios = require('axios');

// Google Distance Matrix API base URL
const API_KEY = 'AIzaSyALnmbpU-gu0sIfyDwg2rEEZ46kH9J3RqU';
const baseURL = `https://maps.googleapis.com/maps/api/distancematrix/json?key=${API_KEY}`;

function findStopLocation(stopName) {
    let result;
    
    // Iterate over all routes to check if the stop exists
    routes.forEach(route => {
        route.stops.forEach(stop => {
            if (stop.name === stopName) {
                const location = { 
                    lat: stop.lat, 
                    long: stop.long 
                };
                const res = { 
                    stop: stopName, 
                    route: route.route, 
                    location: location 
                };
                result = res;
            }
        });
    });

    return result;
}

// Function to batch the distance calculation between multiple stops
async function calculateDistances(origins, destinations) {
    // Construct the API request URL
    const originsParam = origins.map(loc => `${loc.lat},${loc.long}`).join('|');
    const destinationsParam = destinations.map(loc => `${loc.lat},${loc.long}`).join('|');
    const url = `${baseURL}&origins=${originsParam}&destinations=${destinationsParam}&mode=walking`;

    try {
        const response = await axios.get(url);
        return response.data.rows;
    } catch (error) {
        console.error(`Error fetching data from Google API:`, error);
        return [];
    }
}

// Function to find transfer points between two routes using Google API
async function findTransferPoint(fromRouteStops, toRouteStops) {
    const rows = await calculateDistances(
        fromRouteStops.map(stop => ({ lat: stop.lat, long: stop.long })),
        toRouteStops.map(stop => ({ lat: stop.lat, long: stop.long }))
    );

    let closestTransfer = { distance: Infinity, fromStop: null, toStop: null };
    
    rows.forEach((row, fromIndex) => {
        row.elements.forEach((element, toIndex) => {
            if (element.distance.value < closestTransfer.distance) {
                closestTransfer = {
                    distance: element.distance.value,
                    fromStop: fromRouteStops[fromIndex].name,
                    toStop: toRouteStops[toIndex].name
                };
            }
        });
    });

    return closestTransfer.distance <= 250 ? closestTransfer : null;
}

// Example usage of batching for `findRoutesForStop`
async function findRoutesForStopBatch(location, radius = 250) {
    let { lat, long } = location;
    let foundRoutes = [];

    const allStops = routes.flatMap(route => route.stops);

    const rows = await calculateDistances([{ lat, long }], allStops.map(stop => ({ lat: stop.lat, long: stop.long })));

    allStops.forEach((stop, index) => {
        const distance = rows[0].elements[index].distance.value; // Distance in meters

        if (distance <= radius) {
            foundRoutes.push({
                route: stop.route,
                stop: stop.name,
                distance: distance
            });
        }
    });

    return foundRoutes.length ? foundRoutes : `No routes found within ${radius} meters`;
}

// Main function to find possible routes between two stops
const findPossibleRoute = async (from, to) => {
    // Step 1: Find location of the stops
    const fromLocation = findStopLocation(from);
    const toLocation = findStopLocation(to);

    // Check if both fromLocation and toLocation exist
    if (!fromLocation || !toLocation) {
        console.log(`Could not find one or both locations: ${from}, ${to}`);
        return;
    }

    // Step 2: Find stops and routes for the "from" and "to" locations
    const fromRoutes = await findRoutesForStopBatch(fromLocation.location);
    const toRoutes = await findRoutesForStopBatch(toLocation.location);

    console.log('fromRoutes: ', fromRoutes)
    console.log('toRoutes: ', toRoutes)

    // Step 3: Check for direct routes
    const directRoute = fromRoutes.find(fr => toRoutes.some(tr => tr.route === fr.route));
    if (directRoute) {
        console.log(`Direct route found: Route ${directRoute.route}`);
    }

    // Step 4: Find intersection routes if no direct route exists
    let intersectionRoutes = [];
    for (let fromRoute of fromRoutes) {
        for (let toRoute of toRoutes) {
            if (fromRoute.route !== toRoute.route) {
                // Find potential transfer points between two routes
                const fromRouteStops = routes.find(route => route.route === fromRoute.route).stops;
                const toRouteStops = routes.find(route => route.route === toRoute.route).stops;
                
                const transferPoint = await findTransferPoint(fromRouteStops, toRouteStops);
                
                if (transferPoint) {
                    intersectionRoutes.push({
                        fromRoute: fromRoute.route,
                        toRoute: toRoute.route,
                        transferAt: transferPoint.fromStop,
                        takeAt: transferPoint.toStop,
                        distance: transferPoint.distance
                    });
                }
            }
        }
    }

    if (intersectionRoutes.length > 0) {
        console.log(`Intersection route found:`, intersectionRoutes);
    } else {
        console.log('No intersection routes found');
    }
}

// Steps
// 1. Find the routes for from and destination
// 2. If from and destination exist in one route, add the direct route into the array
// 3. If there are stops that are located near the destination stop (eg. let say radius of 250m / 5 minute walking)
// 3.1 Find a stop that can intersect with from route

const from = 'Station A';
const to = 'Station E';
findPossibleRoute(from, to);