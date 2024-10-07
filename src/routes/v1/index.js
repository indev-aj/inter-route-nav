import express from 'express';
import GraphController from '../../controllers/GraphController.js';

const router = express.Router();

// Graph Routes
router.route('/paths').get(GraphController.findPaths);
router.route('/generate-graph').post(GraphController.generateGraph);


export default router;