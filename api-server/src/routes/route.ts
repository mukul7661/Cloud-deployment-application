import express, { Router } from 'express';
import projectRoutes from './projectRoutes';
// import githubRoutes from './githubRoutes';
import authMiddleware from '../middleware/authMiddleware';

const router: Router = express.Router();

router.use('/project', authMiddleware, projectRoutes);
// router.use("/github", githubRoutes);

export default router;
