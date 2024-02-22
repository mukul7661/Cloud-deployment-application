const ProjectService = require("../services/ProjectService");
const { z } = require("zod");

class ProjectController {
  projectService = null;
  constructor() {
    this.projectService = new ProjectService();
  }

  getAllProjects = async (req, res) => {
    try {
      const user = req.user;
      const projects = await this.projectService.getAllProjects(user);
      res.json(projects);
    } catch (err) {
      console.log("Error in getAllProjects", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getProjectById = async (req, res) => {
    try {
      const user = req.user;
      const projectId = req.query.projectId;
      const project = await this.projectService.getProjectById(projectId);

      res.json(project);
    } catch (err) {
      console.log("Error in getProjectById", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  fetchGithubRepos = async (req, res) => {
    const user = req.user;
    try {
      const userReposFiltered = await this.projectService.fetchGithubRepos(
        user
      );
      res.status(200).json({ userReposFiltered });
    } catch (err) {
      console.log("Error in fetchGithubRepos", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  fetchDeploymentLogs = async (req, res) => {
    const user = req.user;
    const deploymentId = req.params.id;

    try {
      const logs = await this.projectService.fetchDeploymentLogs(deploymentId);
      res.json({ logs });
    } catch (err) {
      console.log("Error in fetchDeploymentLogs", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  createProject = async (req, res) => {
    // const schema = z.object({
    //   name: z.string(),
    //   gitURL: z.string(),
    //   email: z.string(),
    // });
    // const safeParseResult = schema.safeParse(req.body);

    // if (safeParseResult.error)
    //   return res.status(400).json({ error: safeParseResult.error });

    // const { name, gitURL } = safeParseResult.data;
    const { name, gitURL } = req.body;
    const user = req.user;

    const project = await this.projectService.createProject(name, gitURL, user);

    return res.json({ status: "success", data: { project } });
  };

  deployProject = async (req, res) => {
    const { projectId } = req.body;
    const user = req.user;

    const deployment = await this.projectService.deployProject(projectId, user);
    if (!deployment)
      return res.status(404).json({ error: "Project not found" });

    return res.json({
      status: "queued",
      data: { deploymentId: deployment.id },
    });
  };
}

module.exports = ProjectController;
