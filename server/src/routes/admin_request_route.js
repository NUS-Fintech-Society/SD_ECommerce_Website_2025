const express = require('express');
const { AdminRequest } = require('../models/adminRequest');
const { User } = require('../models/user');
const router = express.Router();

router.post("/:id", async (req, res) => {
    
    try {
        // First, check if the user exists
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create a new admin request and link to the user
        const newAdminRequest = new AdminRequest({
            name: req.body.data.name,
            role: req.body.data.role,
            mobileNumber: req.body.data.mobileNumber,
            organisation: req.body.data.organisation,
            user: req.params.id, // Link the request to the user
        });

        // Save the admin request
        await newAdminRequest.save();

        // Add the new request to the user's adminRequests array
        user.adminRequests.push(newAdminRequest);
        await user.save();

        // Respond with success
        res.status(201).json({
            success: true,
            message: 'Admin request created successfully',
            data: newAdminRequest
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error, could not create admin request'
        });
    }
});

module.exports = router;