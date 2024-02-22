const express = require("express");
const router = express.Router();

const ProjectController = require("../controllers/ProjectController");

const projectController = new ProjectController();

router.get("/all", projectController.getAllProjects);
router.get("/id", projectController.getProjectById);
router.get("/user-repos", projectController.fetchGithubRepos);
router.get("/logs/:id", projectController.fetchDeploymentLogs);
router.post("/create", projectController.createProject);
router.post("/deploy", projectController.deployProject);

module.exports = router;
