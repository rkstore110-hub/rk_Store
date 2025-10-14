const express = require('express');
const { trackOrder, checkDeliveryTime } = require('../controllers/shiprocket');

const ShipRocketrouter = express.Router();

// Route to track an order
ShipRocketrouter.post('/track-order', trackOrder);

// Route to check delivery time by pincode
ShipRocketrouter.post('/check-delivery-time', checkDeliveryTime);

module.exports = ShipRocketrouter;