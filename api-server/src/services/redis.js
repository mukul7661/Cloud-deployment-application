const Redis = require("ioredis");
const { getPrisma } = require("./prisma");

const subscriber = new Redis(process.env.AIVEN_REDIS_URL);

const prisma = getPrisma();

async function initRedisSubscribe() {
  try {
    console.log("Subscribed to logs....");
    subscriber.psubscribe("logs:*");
    subscriber.on("pmessage", async (pattern, channel, message) => {
      console.log(message, channel, pattern);
      const deployementId = channel.split(":")[1];

      const newEventLog = await prisma.eventLog.create({
        data: {
          deployment_id: deployementId,
          log: message,
        },
      });
      // io.to(channel).emit("message", message);
    });
  } catch (err) {
    console.log("Error: ", err);
  }
}

module.exports = {
  initRedisSubscribe,
};
