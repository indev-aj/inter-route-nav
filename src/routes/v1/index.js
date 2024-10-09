import express from 'express';
import GraphController from '../../controllers/GraphController.js';
import StopController from '../../controllers/StopController.js';

const router = express.Router();

// Graph Routes
router.route('/paths').get(GraphController.findPaths);
router.route('/generate-graph').post(GraphController.generateGraph);

// Stops / POILocation Routes
router.route('/stops').get(StopController.findAll);
router.route('/stops/update-cache').post(StopController.updateStopCache);
router.route('/stops/nearby').get(StopController.findNearbyStops);

export default router;