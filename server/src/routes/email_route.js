const express = require('express');
const { sendEmail } = require('../services/email_service');
const router = express.Router();


router.post('/send', async (req, res) => {
    try {
        const { data: {to, subject, text} } = req.body;

        if (!to || !subject || !text) {
            return res.status(400).json({message: "All fields are required"});
        }

        await sendEmail(to, subject, text);
        res.status(200).json({message: `Email sent to ${to}`});
    } catch (error) {
        res.status(500).send({ message: "Error occurred when sending email", error: error });
    }
});

module.exports = router;
