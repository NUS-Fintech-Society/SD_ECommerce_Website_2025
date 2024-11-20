const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { User } = require("../models/user");
const router = express.Router();

router.get("/", async (req, res) => {
  const users = await User.find();
  res.send(JSON.stringify(users));
});


router.get("/:id", async (req, res) => {
  const user_id = req.params.id;
  const user = await User.findById(user_id);
  res.send(JSON.stringify(user));
});

router.post("/register", async (req, res) => {
  console.log(req.body);
  const newUser = new User({
    username: req.body.data.username,
    email: req.body.data.email,
    password: req.body.data.password,
    isAdmin: req.body.data.isAdmin,
    isSuperAdmin: req.body.data.isSuperAdmin,
  });

  const user = await User.findOne({ email: newUser.email });
  if (user) {
    throw new Error("Already in db");
  }

  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(newUser.password, salt);

  await newUser.save();
  const token = newUser.generateAuthToken();

  const data = {
    token: token,
    id: newUser.id,
    isAdmin: newUser.isAdmin,
    isSuperAdmin: newUser.isSuperAdmin,
  };
  res.send(data);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.data.email });
  if (!user) {
    throw new Error("Not user with that email");
  }
  const validPassword = await bcrypt.compare(
    req.body.data.password,
    user.password
  );

  if (!validPassword) {
    throw new Error("Invalid password");
  }
  const token = user.generateAuthToken();
  const data = {
    token: token,
    userId: user.id,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
  };
  res.send(data);
});

router.delete("/:id", async (req, res) => {
  console.log("DELETE request received for ID:", req.params.id); // Add this
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send({ message: "User account deleted successfully", userId: req.params.id });
  } catch (error) {
    console.error("Error in DELETE route:", error);
    res.status(500).send("An error occurred while deleting the user");
  }
});

module.exports = router;