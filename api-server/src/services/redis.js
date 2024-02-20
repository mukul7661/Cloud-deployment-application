const Redis = require("ioredis");
const { getPrisma } = require("./prisma");
const { client } = require("./clickHouse");

const subscriber = new Redis(process.env.AIVEN_REDIS_URL);

const prisma = getPrisma();

async function initRedisSubscribe() {
  try {
    console.log("Subscribed to logs....");
    subscriber.psubscribe("logs:*");
    subscriber.on("pmessage", async (pattern, channel, message) => {
      console.log(message, channel, pattern);
      const deployementId = channel.split(":")[1];
      if (process.env.CLICKHOUSE_ENABLED === "true") {
        await client.insert({
          table: "log_events",
          values: [
            { event_id: uuidv4(), deployment_id: deployementId, log: message },
          ],
          format: "JSONEachRow",
        });
      } else {
        await prisma.eventLog.create({
          data: {
            deployment_id: deployementId,
            log: message,
          },
        });
      }

      // io.to(channel).emit("message", message);
    });
  } catch (err) {
    console.log("Error: ", err);
  }
}

module.exports = {
  initRedisSubscribe,
};
