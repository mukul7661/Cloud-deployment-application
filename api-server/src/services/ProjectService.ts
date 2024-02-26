import prismaManager from './PrismaManager';
import { getUserRepos } from './github';
import { generateSlug } from 'random-word-slugs';
import { RunTaskCommand } from '@aws-sdk/client-ecs';
import ClickHouseClient from './ClickHouseClient';
import ECSManager from './AWSManager';
import PrismaManager from './PrismaManager';

class ProjectService {
  private clickhouseClient: ClickHouseClient | null = null;
  private ecsClient: ReturnType<ECSManager['getECSClient']> | null = null;
  private prisma: ReturnType<PrismaManager['getPrisma']>;
  private isClickhouseEnabled: boolean;
  private config;

  constructor() {
    const prismaManager = new PrismaManager();
    this.prisma = prismaManager.getPrisma();

    this.isClickhouseEnabled = process.env.CLICKHOUSE_ENABLED === 'true';

    if (this.isClickhouseEnabled) {
      this.clickhouseClient = new ClickHouseClient();
    }

    const ecsManager = new ECSManager();

    this.ecsClient = ecsManager.getECSClient();
    this.config = ecsManager.getConfig();
  }

  async getAllProjects(user: any) {
    try {
      const projects = await this.prisma.project.findMany({
        where: {
          userId: user?.userId,
        },
        include: {
          Deployment: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return projects;
    } catch (err) {
      console.log('Error: ', err);
      throw new Error('Error fetching projects from the database');
    }
  }

  async getProjectById(projectId: string, user: any) {
    try {
      const project = await this.prisma.project.findUnique({
        where: {
          id: projectId,
          userId: user?.userId,
        },
        include: {
          Deployment: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
      return project;
    } catch (err) {
      console.log('Error: ', err);
      throw new Error('Error fetching project from the database');
    }
  }

  async fetchGithubRepos(user: any) {
    try {
      const result = await this.prisma.account.findFirst({
        where: {
          user: {
            email: user?.email,
          },
        },
        select: {
          access_token: true,
        },
      });

      console.log(result?.access_token);

      if (result) {
        const accessToken = result.access_token;
        const userRepos = await getUserRepos(result.access_token as string);
        const userReposFiltered = userRepos?.map((repo: any) => ({
          name: repo?.name,
          id: repo?.id,
          gitURL: repo?.git_url,
        }));
        return userReposFiltered;
      }
      console.log('User not found or no associated project.');
      return null;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Error fetching repos from the github');
    }
  }

  async fetchDeploymentLogs(deploymentId: string) {
    try {
      const status = await this.prisma.deployment.findUnique({
        where: {
          id: deploymentId,
        },
        select: {
          status: true,
        },
      });

      if (process.env.CLICKHOUSE_ENABLED === 'true') {
        if (this.clickhouseClient) {
          const logs = await this.clickhouseClient.client.query({
            query: `SELECT event_id, deployment_id, log, timestamp from log_events where deployment_id = {deployment_id:String}`,
            query_params: {
              deployment_id: deploymentId,
            },
            format: 'JSONEachRow',
          });

          const rawLogs = await logs.json();

          return [rawLogs, status?.status];
        }
      }

      const logs = await this.prisma.eventLog.findMany({
        where: {
          deployment_id: deploymentId,
        },
        orderBy: {
          timestamp: 'asc',
        },
        select: {
          log: true,
        },
      });

      const filteredLogs = logs?.map((log: any) => {
        return JSON.parse(log?.log)?.log;
      });

      return [filteredLogs, status?.status];
    } catch (err) {
      console.error('Error:', err);
      throw new Error('Error fetching logs from DB');
    }
  }

  async createProject(name: string, gitURL: string, user: any) {
    try {
      const project = await this.prisma.project.create({
        data: {
          name,
          gitURL,
          subDomain: generateSlug(),
          userId: user?.userId,
        },
      });

      return project;
    } catch (err) {
      console.log('Error: ', err);
      throw new Error('Error creating project in the database');
    }
  }

  async deployProject(projectId: string, user: any) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
        userId: user?.userId,
      },
    });

    if (!project) return null;

    const deployment = await this.prisma.deployment.create({
      data: {
        project: { connect: { id: projectId } },
        status: 'QUEUED',
      },
    });

    let modifiedUrl = project?.gitURL.replace('git://', 'https://');

    console.log(projectId, deployment.id);

    const command = new RunTaskCommand({
      cluster: this.config.CLUSTER,
      taskDefinition: this.config.TASK,
      launchType: 'FARGATE',
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: 'ENABLED',
          subnets: [
            'subnet-0cb401b73f812753d',
            'subnet-0920ef9e787b6e502',
            'subnet-057cd2a2e2f0faab4',
          ],
          securityGroups: ['sg-08cfda151d157bab5'],
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: 'builder-image',
            environment: [
              { name: 'GIT_REPOSITORY__URL', value: modifiedUrl },
              { name: 'PROJECT_ID', value: projectId },
              { name: 'DEPLOYEMENT_ID', value: deployment.id },
              { name: 'KAFKA_ENABLED', value: process.env.KAFKA_ENABLED },
            ],
          },
        ],
      },
    });
    if (this.ecsClient) {
      await this.ecsClient.send(command);
    }

    return deployment;
  }
}

export default ProjectService;
