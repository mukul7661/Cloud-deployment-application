const prismaManager = require("./PrismaManager");
const { getUserRepos } = require("./github");
const { generateSlug } = require("random-word-slugs");
const { RunTaskCommand } = require("@aws-sdk/client-ecs");
const { client } = require("./clickHouse");
const ecsManager = require("./AWSManager");

const ecsClient = ecsManager.getECSClient();

const config = ecsManager.getConfig();

const prisma = prismaManager.getPrisma();

class ProjectService {
  async getAllProjects(user) {
    try {
      const projects = await prisma.project.findMany({
        where: {
          userId: user?.userId,
        },
        include: {
          Deployment: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
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
          Deployment: {
            orderBy: {
              createdAt: "desc",
            },
          },
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
        const userRepos = await getUserRepos(accessToken);
        const userReposFiltered = userRepos?.map((repo) => ({
          name: repo?.name,
          id: repo?.id,
          gitURL: repo?.git_url,
        }));
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
      if (process.env.CLICKHOUSE_ENABLED === "true") {
        const logs = await client.query({
          query: `SELECT event_id, deployment_id, log, timestamp from log_events where deployment_id = {deployment_id:String}`,
          query_params: {
            deployment_id: deploymentId,
          },
          format: "JSONEachRow",
        });

        const rawLogs = await logs.json();

        console.log(rawLogs, "logs");

        return rawLogs;
      }

      const logs = await prisma.eventLog.findMany({
        where: {
          deployment_id: deploymentId,
        },
        orderBy: {
          timestamp: "asc",
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

    const deployment = await prisma.deployment.create({
      data: {
        project: { connect: { id: projectId } },
        status: "QUEUED",
      },
    });

    let modifiedUrl = project?.gitURL.replace("git://", "https://");

    console.log(projectId, deployment.id);

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
              { name: "KAFKA_ENABLED", value: process.env.KAFKA_ENABLED },
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
