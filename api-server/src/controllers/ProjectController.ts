import { Response } from "express";
import ProjectService from "../services/ProjectService";
import { z } from "zod";
import { CreateProjectRequestDTO, CustomRequest } from "../dto/project.dto";

class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  getAllProjects = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      const projects = await this.projectService.getAllProjects(user);
      res.json(projects);
    } catch (err) {
      console.error("Error in getAllProjects", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getProjectById = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      const paramsSchema = z.object({
        projectId: z.string(),
      });

      const { projectId } = paramsSchema.parse(req.query);

      const project = await this.projectService.getProjectById(projectId, user);
      res.json(project);
    } catch (err) {
      console.error("Error in getProjectById", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  fetchGithubRepos = async (
    req: CustomRequest,
    res: Response,
  ): Promise<void> => {
    const user = req.user;
    try {
      const userReposFiltered =
        await this.projectService.fetchGithubRepos(user);
      res.status(200).json({ userReposFiltered });
    } catch (err) {
      console.error("Error in fetchGithubRepos", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  fetchDeploymentLogs = async (
    req: CustomRequest,
    res: Response,
  ): Promise<void> => {
    const user = req.user;
    const deploymentId = req.params.id;

    try {
      const paramsSchema = z.object({
        id: z.string(),
      });
      const { id } = paramsSchema.parse(req.params);

      const [logs, status, subDomain] =
        await this.projectService.fetchDeploymentLogs(id);
      res.json({ logs, status, subDomain });
    } catch (err) {
      console.error("Error in fetchDeploymentLogs", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  createProject = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { name, gitURL } = CreateProjectRequestDTO.parse(req.body);

      const user = req.user;
      const project = await this.projectService.createProject(
        name,
        gitURL,
        user,
      );
      res.json({ project });
    } catch (err) {
      console.error("Error in createProject", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  deployProject = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const bodySchema = z.object({
        projectId: z.string(),
        isGuest: z.boolean().optional(),
      });
      const { projectId } = bodySchema.parse(req.body);

      const user = req.user;
      const deployment = await this.projectService.deployProject(
        projectId,
        user,
      );
      if (!deployment) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      res.json({
        status: "queued",
        data: { deploymentId: deployment.id },
      });
    } catch (err) {
      console.error("Error in deployProject", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

export default ProjectController;
