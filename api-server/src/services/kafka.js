const { Kafka } = require("kafkajs");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { client } = require("./clickHouse");
const prismaManager = require("./PrismaManager");

const kafka = new Kafka({
  clientId: `api-server`,
  brokers: [`${process.env.KAFKA_BROKER}`],
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, "kafka.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    mechanism: "plain",
  },
});

const consumer = kafka.consumer({ groupId: "api-server-logs-consumer" });

const prisma = prismaManager.getPrisma();

async function initkafkaConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topics: ["container-logs"], fromBeginning: true });

  await consumer.run({
    eachBatch: async function ({
      batch,
      heartbeat,
      commitOffsetsIfNecessary,
      resolveOffset,
    }) {
      const messages = batch.messages;
      console.log(`Recv. ${messages.length} messages..`);
      for (const message of messages) {
        if (!message.value) continue;
        const stringMessage = message.value.toString();
        const { PROJECT_ID, DEPLOYEMENT_ID, log } = JSON.parse(stringMessage);
        console.log({ log, DEPLOYEMENT_ID });
        try {
          if (process.env.CLICKHOUSE_ENABLED === "true") {
            await client.insert({
              table: "log_events",
              values: [
                { event_id: uuidv4(), deployment_id: DEPLOYEMENT_ID, log },
              ],
              format: "JSONEachRow",
            });
          } else {
            await prisma.eventLog.create({
              data: {
                deployment_id: DEPLOYEMENT_ID,
                log,
              },
            });
          }
          resolveOffset(message.offset);
          await commitOffsetsIfNecessary(message.offset);
          await heartbeat();
        } catch (err) {
          console.log(err);
        }
      }
    },
  });
}

module.exports = {
  initkafkaConsumer,
};

// const { Kafka } = require("kafkajs");
// const fs = require("fs");
// const path = require("path");
// const { v4: uuidv4 } = require("uuid");
// const { client } = require("./clickHouse");
// const { getPrisma } = require("./prisma");

// class KafkaConsumerManager {
//   constructor() {
//     this.kafka = new Kafka({
//       clientId: `api-server`,
//       brokers: [`${process.env.KAFKA_BROKER}`],
//       ssl: {
//         ca: [fs.readFileSync(path.join(__dirname, "kafka.pem"), "utf-8")],
//       },
//       sasl: {
//         username: process.env.KAFKA_USERNAME,
//         password: process.env.KAFKA_PASSWORD,
//         mechanism: "plain",
//       },
//     });

//     this.consumer = this.kafka.consumer({ groupId: "api-server-logs-consumer" });
//     this.prisma = getPrisma();
//     this.isClickhouseEnabled = process.env.CLICKHOUSE_ENABLED === "true";
//     this.isInitialized = false;
//   }

//   static getInstance() {
//     if (!this.instance) {
//       this.instance = new KafkaConsumerManager();
//     }
//     return this.instance;
//   }

//   async initKafkaConsumer() {
//     try {
//       if (this.isInitialized) {
//         console.log("Kafka consumer already initialized.");
//         return;
//       }

//       await this.consumer.connect();
//       await this.consumer.subscribe({ topics: ["container-logs"], fromBeginning: true });

//       await this.consumer.run({
//         eachBatch: async function ({
//           batch,
//           heartbeat,
//           commitOffsetsIfNecessary,
//           resolveOffset,
//         }) {
//           const messages = batch.messages;
//           console.log(`Received ${messages.length} messages..`);
//           for (const message of messages) {
//             if (!message.value) continue;
//             const stringMessage = message.value.toString();
//             const { PROJECT_ID, DEPLOYEMENT_ID, log } = JSON.parse(stringMessage);
//             console.log({ log, DEPLOYEMENT_ID });
//             try {
//               if (this.isClickhouseEnabled) {
//                 await client.insert({
//                   table: "log_events",
//                   values: [
//                     { event_id: uuidv4(), deployment_id: DEPLOYEMENT_ID, log },
//                   ],
//                   format: "JSONEachRow",
//                 });
//               } else {
//                 await this.prisma.eventLog.create({
//                   data: {
//                     deployment_id: DEPLOYEMENT_ID,
//                     log,
//                   },
//                 });
//               }
//               resolveOffset(message.offset);
//               await commitOffsetsIfNecessary(message.offset);
//               await heartbeat();
//             } catch (err) {
//               console.log(err);
//             }
//           }
//         },
//       });

//       this.isInitialized = true;
//     } catch (err) {
//       console.log("Error initializing Kafka consumer: ", err);
//     }
//   }
// }

// module.exports = KafkaConsumerManager;
