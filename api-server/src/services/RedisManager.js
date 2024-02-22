const Redis = require("ioredis");
// const { getPrisma } = require("./prisma");
const prismaManager = require("./PrismaManager");

const { client } = require("./clickHouse");
const { v4: uuidv4 } = require("uuid");

class LogManager {
  constructor() {
    this.subscriber = new Redis(process.env.AIVEN_REDIS_URL);
    this.prisma = prismaManager.getPrisma();

    this.isClickhouseEnabled = process.env.CLICKHOUSE_ENABLED === "true";
    this.isInitialized = false;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new LogManager();
    }
    return this.instance;
  }

  async initRedisSubscribe() {
    try {
      if (this.isInitialized) {
        console.log("Already subscribed to logs.");
        return;
      }

      console.log("Subscribed to logs....");
      this.subscriber.psubscribe("logs:*");
      this.subscriber.on("pmessage", async (pattern, channel, message) => {
        console.log(message, channel, pattern);
        const deploymentId = channel.split(":")[1];
        if (this.isClickhouseEnabled) {
          await client.insert({
            table: "log_events",
            values: [
              { event_id: uuidv4(), deployment_id: deploymentId, log: message },
            ],
            format: "JSONEachRow",
          });
        } else {
          await this.prisma.eventLog.create({
            data: {
              deployment_id: deploymentId,
              log: message,
            },
          });
        }
      });

      this.isInitialized = true;
    } catch (err) {
      console.log("Error: ", err);
    }
  }
}

module.exports = LogManager;
