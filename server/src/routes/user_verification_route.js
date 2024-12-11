const express = require('express');
const { UserVerification } = require("../models/userVerification");
const { User } = require("../models/user");
const router = express.Router();

router.post("/email/:token", async (req, res) => {
    try {
      const pendingEmail = await UserVerification.findOne({
        verificationToken: req.params.token
      });
  
      if (!pendingEmail) {
        return res.status(400).send("Invalid or expired verification token");
      }
  
      // First find the user
      const user = await User.findById(pendingEmail.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Update the email
      user.email = pendingEmail.email;
      await user.save();
  
      // Delete the pending email record
      await UserVerification.deleteOne({ _id: pendingEmail._id });
  
      res.send({
        message: "Email verified successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).send("An error occurred while verifying email");
    }
  });       

module.exports = router;