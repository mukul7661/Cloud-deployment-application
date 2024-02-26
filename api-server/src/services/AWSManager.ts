import { ECSClient, CreateClusterCommand } from '@aws-sdk/client-ecs';

class ECSManager {
  private ecsClient: ECSClient;
  private config: { CLUSTER: string; TASK: string };

  constructor() {
    this.ecsClient = new ECSClient({
      region: process.env.AWS_S3_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_KEY as string,
      },
    });

    this.config = {
      CLUSTER: 'vercel-builder-cluster',
      TASK: 'builder-task',
    };
  }

  getECSClient(): ECSClient {
    return this.ecsClient;
  }

  getConfig(): { CLUSTER: string; TASK: string } {
    return this.config;
  }

  async createCluster(): Promise<void> {
    const command = new CreateClusterCommand({
      clusterName: this.config.CLUSTER,
    });
    await this.ecsClient.send(command);
  }
}

export default ECSManager;
