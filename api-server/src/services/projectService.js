const { getPrisma } = require("./prisma");
const { ecsClient, config } = require("./aws");
const { getUserRepos } = require("./github");
const { generateSlug } = require("random-word-slugs");
const { RunTaskCommand } = require("@aws-sdk/client-ecs");

const prisma = getPrisma();
class ProjectService {
  async getAllProjects(user) {
    try {
      const projects = await prisma.project.findMany({
        where: {
          userId: user?.userId,
        },
      });
      return projects;
    } catch (err) {
      console.log("Error: ", err);
      throw new Error("Error fetching projects from the database");
    }
  }

  async getProjectById(projectId, user) {
    try {
      const project = await prisma.project.findUnique({
        where: {
          id: projectId,
          userId: user?.userId,
        },
        include: {
          Deployment: true,
        },
      });
      return project;
    } catch (err) {
      console.log("Error: ", err);
      throw new Error("Error fetching project from the database");
    }
  }

  async fetchGithubRepos(user) {
    try {
      const result = await prisma.account.findFirst({
        where: {
          user: {
            email: user?.email,
          },
        },
        select: {
          access_token: true,
        },
      });

      if (result) {
        const accessToken = result.access_token;
        // console.log("Access Token:", accessToken);
        const userRepos = await getUserRepos(accessToken);
        // console.log(userRepos);
        const userReposFiltered = userRepos?.map((repo) => ({
          name: repo?.name,
          id: repo?.id,
          gitURL: repo?.git_url,
        }));
        // console.log(userReposFiltered, "repos");
        return userReposFiltered;
      }
      console.log("User not found or no associated project.");
      return null;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Error fetching repos from the github");
    }
  }

  async fetchDeploymentLogs(deploymentId) {
    try {
      console.log(deploymentId, "id");
      const logs = await prisma.eventLog.findMany({
        where: {
          deployment_id: deploymentId,
        },
        orderBy: {
          timestamp: "asc", // or 'desc' for descending order
        },
      });
      return logs;
    } catch (err) {
      console.error("Error:", err);
      throw new Error("Error fetching logs from DB");
    }
  }

  async createProject(name, gitURL, user) {
    try {
      const project = await prisma.project.create({
        data: {
          name,
          gitURL,
          subDomain: generateSlug(),
          userId: user?.userId,
        },
      });

      return project;
    } catch (err) {
      console.log("Error: ", err);
      throw new Error("Error creating project in the database");
    }
  }

  async deployProject(projectId, user) {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: user?.userId,
      },
    });

    if (!project) return null;

    // Check if there is no running deployement
    const deployment = await prisma.deployment.create({
      data: {
        project: { connect: { id: projectId } },
        status: "QUEUED",
      },
    });

    let modifiedUrl = project?.gitURL.replace("git://", "https://");

    // Spin the container
    const command = new RunTaskCommand({
      cluster: config.CLUSTER,
      taskDefinition: config.TASK,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: [
            "subnet-0cb401b73f812753d",
            "subnet-0920ef9e787b6e502",
            "subnet-057cd2a2e2f0faab4",
          ],
          securityGroups: ["sg-08cfda151d157bab5"],
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: "builder-image",
            environment: [
              { name: "GIT_REPOSITORY__URL", value: modifiedUrl },
              { name: "PROJECT_ID", value: projectId },
              { name: "DEPLOYEMENT_ID", value: deployment.id },
            ],
          },
        ],
      },
    });

    await ecsClient.send(command);

    return deployment;
  }
}

module.exports = ProjectService;
