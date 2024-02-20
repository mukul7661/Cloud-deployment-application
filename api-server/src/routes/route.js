// routes/index.js

const express = require("express");
const projectRoutes = require("./projectRoutes");
const githubRoutes = require("./githubRoutes");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use("/project", authMiddleware, projectRoutes);
// router.use("/github", githubRoutes);

module.exports = router;
