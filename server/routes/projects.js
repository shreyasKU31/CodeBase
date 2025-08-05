// backend/routes/projects.js

const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const { uploadMultiple } = require("../middleware/upload");
const {
  getAllPublicProjects,
  getUserProject,
  getSingleProjectByID,
  createNewProject,
  updateProject,
  like,
  unlike,
  deleteProject,
  getProjectComments,
  addProjectComment,
  updateProjectComment,
  deleteProjectComment,
} = require("../controllers/projects.controller");

const router = express.Router();

// Get all public projects (discover feed)
router.get("/discover", getAllPublicProjects);

// Get user's own projects
router.get("/my-projects", auth, getUserProject);

// Get a single project by ID
router.get("/:id", getSingleProjectByID);

// Create a new project
router.post(
  "/",
  auth,
  uploadMultiple,
  [
    body("title")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Title is required"),
    body("description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required"),
    body("story").trim().isLength({ min: 1 }).withMessage("Story is required"),
  ],
  createNewProject
);

// Update a project
router.put(
  "/:id",
  auth,
  uploadMultiple,
  [
    body("title")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Title is required"),
    body("description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required"),
    body("story").trim().isLength({ min: 1 }).withMessage("Story is required"),
  ],
  updateProject
);

// Like a project
router.post("/:id/like", auth, like);

// Unlike a project
router.delete("/:id/like", auth, unlike);

// Delete a project
router.delete("/:id", auth, deleteProject);

// Comments routes
router.get("/:id/comments", getProjectComments);
router.post("/:id/comments", auth, [
  body("text").trim().isLength({ min: 1 }).withMessage("Comment text is required"),
], addProjectComment);
router.put("/:id/comments/:commentId", auth, [
  body("text").trim().isLength({ min: 1 }).withMessage("Comment text is required"),
], updateProjectComment);
router.delete("/:id/comments/:commentId", auth, deleteProjectComment);

module.exports = router;
