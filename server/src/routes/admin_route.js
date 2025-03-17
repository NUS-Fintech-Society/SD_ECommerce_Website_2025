const express = require("express");
const { User } = require("../models/user");
const router = express.Router();

router.get("/", async (req, res) => {
    const admins = await User.find({ isAdmin: true });
    res.send(JSON.stringify(admins));
});

router.put("/remove/:email", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email});

        if (!user) {
        return res.status(404).send({ message: "User not found"});
        }

        user.isAdmin = false;
        await user.save();

        res.status(200).send({
            message: "Successfully removed as Admin",
        });
    } catch (e) {
        console.error("Error removing admin access:", error);
        res.status(500).send("An error occurred while removing admin access");
    }
})

router.put("/add/:email", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email});
        if (!user) {
            return res.status(404).send({ message: "User not found"});
        }

        if (user.isAdmin) {
            return res.status(200).send({
                message: `${user.username} is already an admin.`,
            });
        }

        user.isAdmin = true;
        await user.save();

        res.status(200).send({
            message: "Successfully added as Admin",
        });
    } catch (e) {
        console.error("Error adding admin access:", error);
        res.status(500).send("An error occurred while adding admin access");
    }
})

module.exports = router;