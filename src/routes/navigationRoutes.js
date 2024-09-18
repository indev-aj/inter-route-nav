import { NavigationController } from '../controllers';

const express = require('express');
const router = express.Router();

// Define routes
router.get('/', NavigationController.findPossibleRoute);

module.exports = router;
