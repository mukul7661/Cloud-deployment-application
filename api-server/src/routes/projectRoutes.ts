import express, { Router } from 'express';
import ProjectController from '../controllers/ProjectController';

const router: Router = express.Router();
const projectController = new ProjectController();

router.get('/all', projectController.getAllProjects);
router.get('/id', projectController.getProjectById);
router.get('/user-repos', projectController.fetchGithubRepos);
router.get('/logs/:id', projectController.fetchDeploymentLogs);
router.post('/create', projectController.createProject);
router.post('/deploy', projectController.deployProject);

export default router;
