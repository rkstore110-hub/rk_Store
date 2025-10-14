const axios = require('axios');

// Replace with your Shiprocket API token
const API_TOKEN = process.env.SHIPROCKET_TOKEN ;

// Function to track an order
const trackOrder = async (req, res) => {
    const { awbCode } = req.body;

    if (!awbCode) {
        return res.status(400).json({ error: 'AWB Code required' });
    }

    try {
        const response = await axios.get(
            `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`,
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`
                }
            }
        );

        // Success response
        const trackingData = response.data;

        res.json({
            awb_code: trackingData.awb_code,
            courier_name: trackingData.courier_name,
            current_status: trackingData.current_status,
            delivered: trackingData.delivered,
            tracking_history: trackingData.track_status,
            estimated_delivery_date: trackingData.edd || 'Not Available'
        });

    } catch (error) {
        console.error('Tracking Error:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'AWB Code not found or tracking unavailable' });
        }

        res.status(500).json({ error: 'Something went wrong while tracking the order' });
    }
};

// Function to check delivery time by pincode
const checkDeliveryTime = async (req, res) => {
    const { pickupPincode, deliveryPincode, weight, cod } = req.body;

    if (!pickupPincode || !deliveryPincode || !weight || cod === undefined) {
        return res.status(400).json({ error: 'pickupPincode, deliveryPincode, weight, cod sab chahiye' });
    }

    try {
        const response = await axios.get('https://apiv2.shiprocket.in/v1/external/courier/serviceability/', {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            },
            params: {
                pickup_postcode: pickupPincode,
                delivery_postcode: deliveryPincode,
                weight: weight,
                cod: cod
            }
        });

        const data = response.data.data.available_courier_companies;

        if (data && data.length > 0) {
            const estimatedDays = data[0].estimated_delivery_days;

            res.json({
                courier_name: data[0].courier_name,
                estimated_delivery_days: estimatedDays,
                estimated_delivery_date: getEstimatedDate(estimatedDays)
            });
        } else {
            res.status(404).json({ error: 'Koi courier service available nahi hai' });
        }

    } catch (error) {
        console.error('Delivery check error:', error.response?.data || error.message);
        res.status(500).json({ error: 'API call failed' });
    }
};
// Estimated delivery date calculate karne ke liye helper function
function getEstimatedDate(days) {
    const now = new Date();
    now.setDate(now.getDate() + parseInt(days));
    return now.toISOString().split('T')[0]; // yyyy-mm-dd format
}


module.exports = {
    trackOrder,
    checkDeliveryTime
};