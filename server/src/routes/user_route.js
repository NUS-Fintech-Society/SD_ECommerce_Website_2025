const express = require("express");
const bcrypt = require("bcrypt");
const { UserVerification } = require("../models/userVerification");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { User } = require("../models/user");
const router = express.Router();

router.get("/", async (req, res) => {
    const users = await User.find();
    res.send(JSON.stringify(users));
});

router.get("/:id", async (req, res) => {
    const user_id = req.params.id;
    const user = await User.findById(user_id).populate("adminRequests");
    res.send(JSON.stringify(user));
});

router.post("/register", async (req, res) => {
    // Helper function to validate email format using regex
    const isValidEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };
    try {
        const {
            username,
            email,
            password,
            isAdmin,
            isSuperAdmin,
        } = req.body.data;

        // Check for missing fields
        if (!username || !email || !password) {
            return res.status(400).send({ message: "All fields are required" });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).send({ message: "Invalid email format" });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).send({
                message: "Password must be at least 8 characters long",
            });
        }

        // Check if the email or username already exists
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).send({ message: "Email already in use" });
        }

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).send({ message: "Username already taken" });
        }

        const newUser = new User({
            username,
            email,
            password,
            isAdmin,
            isSuperAdmin,
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);

        await newUser.save();
        // const token = newUser.generateAuthToken();

        // const data = {
        //     token: token,
        //     id: newUser.id,
        //     isAdmin: newUser.isAdmin,
        //     isSuperAdmin: newUser.isSuperAdmin,
        // };

        // res.send(data);
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const newUserVerification = new UserVerification({
            userId: newUser._id,
            email: newUser.email,
            verificationToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

        // Store pending email change in separate collection
        await newUserVerification.save();

        res.send({
            message: "Please check your email for verification.",
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                verificationToken: verificationToken,
            },
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send({
            message: "An error occurred while registering the user",
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.data.email });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        const validPassword = await bcrypt.compare(
            req.body.data.password,
            user.password
        );

        if (!validPassword) {
            return res
                .status(400)
                .send({ message: "Wrong password, please try again!" });
        }

        const userVerification = await UserVerification.findOne({
            userId: user._id,
        });
        if (userVerification) {
            return res.status(400).send({
                message: "Please verify your email before logging in",
            });
        }

        const token = user.generateAuthToken();
        const data = {
            token: token,
            userId: user.id,
            isAdmin: user.isAdmin,
            isSuperAdmin: user.isSuperAdmin,
        };
        res.send(data);
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).send({
            message: "An error occurred while logging in the user",
        });
    }
});

router.delete("/:id", async (req, res) => {
    console.log("DELETE request received for ID:", req.params.id); // Add this
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send({
            message: "User account deleted successfully",
            userId: req.params.id,
        });
    } catch (error) {
        console.error("Error in DELETE route:", error);
        res.status(500).send("An error occurred while deleting the user");
    }
});

router.post("/update/:id", async (req, res) => {
    try {
        const {
            data: { name, email, address, profilePicture },
        } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        const isEmailChange = email && email !== user.email;

        // Update non-email fields immediately
        user.username = name;
        user.address = address;
        user.profilePicture = profilePicture;
        await user.save();

        if (isEmailChange) {
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return res
                    .status(400)
                    .send({ message: "Email is already in use" });
            }
            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString("hex");

            const newUserVerification = new UserVerification({
                userId: user._id,
                email: email,
                verificationToken,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            });

            // Store pending email change in separate collection
            await newUserVerification.save();

            res.send({
                message: "Please check your new email for verification.",
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email, // Still the old email
                    verificationToken: verificationToken,
                },
            });
        } else {
            res.send({
                message: "Profile updated successfully",
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            });
        }
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("An error occurred while updating the user");
    }
});

module.exports = router;
