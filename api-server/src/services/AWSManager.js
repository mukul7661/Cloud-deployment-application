// const { ECSClient } = require("@aws-sdk/client-ecs");

// const ecsClient = new ECSClient({
//   region: process.env.AWS_S3_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
//   },
// });

// const config = {
//   CLUSTER: "vercel-builder-cluster",
//   TASK: "builder-task",
// };

// module.exports = { ecsClient, config };
const { ECSClient } = require("@aws-sdk/client-ecs");

class ECSManager {
  constructor() {
    this.ecsClient = new ECSClient({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });

    this.config = {
      CLUSTER: "vercel-builder-cluster",
      TASK: "builder-task",
    };
  }

  getECSClient() {
    return this.ecsClient;
  }

  getConfig() {
    return this.config;
  }
}

// Export a single instance of ECSManager
module.exports = new ECSManager();
