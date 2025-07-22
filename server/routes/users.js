// backend/routes/users.js

const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");

const {
  userDetails,
  syncUserData,
  getPublicUser,
  updateUser,
  specificUserProjects,
} = require("../controllers/users.controller");

const router = express.Router();

// Get the logged-in user's own profile
router.get("/profile", auth, userDetails);

// Sync user data from Clerk to Supabase
router.post("/sync", auth, syncUserData);

// Get a public user profile by username
router.get("/:username", getPublicUser);

// Create or Update the logged-in user's profile
router.post(
  "/profile",
  auth,
  uploadSingle,
  [
    body("displayName")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Display name is required"),
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),
  ],
  updateUser
);

// Get a specific user's public projects by their username
router.get("/:username/projects", specificUserProjects);

module.exports = router;
