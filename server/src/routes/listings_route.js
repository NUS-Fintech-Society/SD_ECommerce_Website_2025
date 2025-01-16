const express = require("express");
const { Listing } = require("../models/listings");
const { ObjectId } = require("mongodb");
const router = express.Router();
const multer = require('multer');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {r
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Middleware for handling multiple files
const upload = multer({ storage }).array('images', 20); // Field name: 'images'


// Get all listings
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find();
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ error: "Error fetching listings." });
  }
});

// Get a single listing by ID
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found." });
    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ error: "Error fetching listing." });
  }
});

// Route to create a listing and handle image upload
router.post("/create", upload, async (req, res) => {
  try {
    // If files are uploaded, add their paths to the listing data
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    // Create a new listing, adding the images array to the data
    const newListing = new Listing({
      ...req.body.data,
      images: imagePaths,  // Add the image file paths to the listing data
    });

    // Save the new listing to the database
    await newListing.save();
    console.log(imagePaths)

    res.status(201).json({ message: "Listing created successfully!" });
    console.log("5")
  } catch (error) {
    console.error(error);
    console.log("6")
    res.status(500).json({ error: "Error creating listing." });
  }
});

// Update a listing
router.put("/update/:id", async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body.data,
      { new: true }
    );
    if (!updatedListing) return res.status(404).json({ error: "Listing not found." });
    res.status(200).json({ message: "Listing updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error updating listing." });
  }
});

// Delete a listing
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedListing = await Listing.findByIdAndDelete(req.params.id);
    if (!deletedListing) return res.status(404).json({ error: "Listing not found." });
    res.status(200).json({ message: "Listing deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting listing." });
  }
});

module.exports = router;
