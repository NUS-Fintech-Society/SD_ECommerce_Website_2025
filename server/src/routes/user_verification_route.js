const express = require('express');
const { UserVerification } = require("../models/userVerification");
const { User } = require("../models/user");
const router = express.Router();

router.get("/email/:token", async (req, res) => {
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
  
      res.send(`
        <html>
          <head>
            <title>Email Verification Success</title>
            <style>
              body { 
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .success {
                color: #4CAF50;
                font-size: 24px;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="success">Email Verified Successfully!</h1>
              <p>Your email has been verified. You can now close this window and return to the application.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).send("An error occurred while verifying email");
    }
  });       

module.exports = router;