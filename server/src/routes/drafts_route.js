const express = require("express");
const { Draft } = require("../models/drafts");
const router = express.Router();
const multer = require('multer');

// Set up multer for image file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where the images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use the current timestamp to prevent naming conflicts
  },
});

const upload = multer({ storage: storage }).array('images', 10); // Allows up to 10 images

// Get all drafts
router.get("/", async (req, res) => {
  try {
    const drafts = await Draft.find();
    res.status(200).json(drafts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching drafts." });
  }
});

// Get a single draft by ID
router.get("/:id", async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ error: "Draft not found." });
    res.status(200).json(draft);
  } catch (error) {
    res.status(500).json({ error: "Error fetching draft." });
  }
});

// Create a new draft
router.post("/create", async (req, res) => {
  try {
    const newDraft = new Draft(req.body.data);
    await newDraft.save();
    res.status(201).json({ message: "Draft created successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error creating draft." });
  }
});

// Update a draft
router.put("/update/:id", async (req, res) => {
  try {
    const updatedDraft = await Draft.findByIdAndUpdate(
      req.params.id,
      req.body.data,
      { new: true }
    );
    if (!updatedDraft) return res.status(404).json({ error: "Draft not found." });
    res.status(200).json({ message: "Draft updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error updating draft." });
  }
});

// Delete a draft
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedDraft = await Draft.findByIdAndDelete(req.params.id);
    if (!deletedDraft) return res.status(404).json({ error: "Draft not found." });
    res.status(200).json({ message: "Draft deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting draft." });
  }
});

module.exports = router;
