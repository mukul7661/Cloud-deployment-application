// routes/index.js

const express = require("express");
const projectRoutes = require("./projectRoutes");
const githubRoutes = require("./githubRoutes");

const router = express.Router();

router.use("/project", projectRoutes);
router.use("/github", githubRoutes);

module.exports = router;
