import Redis from 'ioredis';
import ClickHouseClient from './ClickHouseClient';
import { v4 as uuidv4 } from 'uuid';
import PrismaManager from './PrismaManager';

class RedisManager {
  private static instance: RedisManager | null = null;
  private subscriber: Redis;
  private prisma: ReturnType<PrismaManager['getPrisma']>;
  private isClickhouseEnabled: boolean;
  private isInitialized: boolean;
  private clickhouseClient: ClickHouseClient | null = null;

  private constructor() {
    this.subscriber = new Redis(process.env.AIVEN_REDIS_URL as string);
    const prismaManager = new PrismaManager();
    this.prisma = prismaManager.getPrisma();

    this.isClickhouseEnabled = process.env.CLICKHOUSE_ENABLED === 'true';
    this.isInitialized = false;

    if (this.isClickhouseEnabled) {
      this.clickhouseClient = new ClickHouseClient();
    }
  }

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  public async initRedisSubscribe(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('Already subscribed to logs.');
        return;
      }

      console.log('Subscribed to logs and status....');
      this.subscriber.psubscribe('logs:*', 'status:*');

      this.subscriber.on(
        'pmessage',
        async (pattern: string, channel: string, message: string) => {
          try {
            console.log(message, channel, pattern);
            const deploymentId = channel.split(':')[1];
            console.log(deploymentId);
            if (pattern === 'logs:*') {
              if (this.isClickhouseEnabled && this.clickhouseClient) {
                await this.clickhouseClient.client.insert({
                  table: 'log_events',
                  values: [
                    {
                      event_id: uuidv4(),
                      deployment_id: deploymentId,
                      log: message,
                    },
                  ],
                  format: 'JSONEachRow',
                });
              } else {
                await this.prisma.eventLog.create({
                  data: {
                    deployment_id: deploymentId,
                    log: message,
                  },
                });
              }
            } else if (pattern === 'status:*') {
              const status = JSON.parse(message)?.status;
              await this.prisma.deployment.update({
                where: {
                  id: deploymentId,
                },
                data: {
                  status,
                },
              });
            }
          } catch (err) {
            console.error('Error: ', err);
          }
        },
      );

      this.isInitialized = true;
    } catch (err) {
      console.log('Error: ', err);
    }
  }
}

export default RedisManager;
