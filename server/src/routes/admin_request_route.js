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

router.get("/pending", async (req, res) => {
    const requests = await AdminRequest.find({status: "pending"});
    res.send(JSON.stringify(requests));
});

router.put("/reject/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const rejectedRequest = await AdminRequest.findById(req.params.id);

    if (!rejectedRequest) return res.status(404).send({ message: "Request not found" });

    rejectedRequest.status = 'rejected';
    rejectedRequest.save();

    res.status(200).send({ message: "Request rejected successfully" });
  } catch (err) {
    res.status(500).send({ message: "Error deleting Request", error: err });
  }
})

router.put("/accept/:id", async (req, res) => {
    try {
      console.log(req.params.id);
      const acceptedRequest = await AdminRequest.findById(req.params.id);
  
      if (!acceptedRequest) return res.status(404).send({ message: "Request not found" });
  
      acceptedRequest.status = 'accepted';
      const acceptedUser = await User.findById(acceptedRequest.user);

      if (acceptedRequest.role === 'admin') {
        acceptedUser.isAdmin = true;
      } else {
        acceptedUser.isAdmin = true;
        acceptedUser.isSuperAdmin = true;
      }

      acceptedRequest.save();
      acceptedUser.save();
  
      res.status(200).send({ message: "Request accepted successfully" });
    } catch (err) {
      res.status(500).send({ message: "Error accepting Request", error: err });
    }
})

module.exports = router;