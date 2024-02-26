import { Kafka, Consumer, EachMessagePayload, EachBatchPayload } from "kafkajs";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import ClickHouseClient from "./ClickHouseClient";
import PrismaManager from "./PrismaManager";

class KafkaManager {
  private kafka: Kafka;
  private consumer: Consumer;
  private prisma: ReturnType<PrismaManager["getPrisma"]>;
  private isClickhouseEnabled: boolean;
  private clickhouseClient: ClickHouseClient | null = null;
  private isInitialized: boolean;

  constructor() {
    this.kafka = new Kafka({
      clientId: `api-server`,
      brokers: [`${process.env.KAFKA_BROKER}`],
      ssl: {
        ca: [fs.readFileSync(path.join(__dirname, "kafka.pem"), "utf-8")],
      },
      sasl: {
        username: process.env.KAFKA_USERNAME as string,
        password: process.env.KAFKA_PASSWORD as string,
        mechanism: "plain",
      },
    });

    this.consumer = this.kafka.consumer({
      groupId: "api-server-logs-consumer",
    });
    this.prisma = PrismaManager.getInstance().getPrisma();
    this.isClickhouseEnabled = process.env.CLICKHOUSE_ENABLED === "true";
    this.isInitialized = false;

    if (this.isClickhouseEnabled) {
      this.clickhouseClient = new ClickHouseClient();
    }
  }

  public async initKafkaConsumer(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log("Kafka consumer already initialized.");
        return;
      }

      await this.consumer.connect();
      await this.consumer.subscribe({
        topics: ["container-logs"],
        fromBeginning: true,
      });

      await this.consumer.run({
        eachBatch: this.handleEachBatch.bind(this),
      });

      this.isInitialized = true;
    } catch (err) {
      console.log("Error initializing Kafka consumer: ", err);
    }
  }

  private async handleEachBatch({
    batch,
    heartbeat,
    commitOffsetsIfNecessary,
    resolveOffset,
  }: EachBatchPayload): Promise<void> {
    try {
      const messages = batch.messages;
      console.log(`Received ${messages.length} messages..`);
      for (const message of messages) {
        if (!message.value) continue;
        const stringMessage = message.value.toString();
        const { PROJECT_ID, DEPLOYEMENT_ID, log } = JSON.parse(stringMessage);
        console.log({ log, DEPLOYEMENT_ID });
        try {
          if (this.isClickhouseEnabled) {
            await this.clickhouseClient?.client.insert({
              table: "log_events",
              values: [
                { event_id: uuidv4(), deployment_id: DEPLOYEMENT_ID, log },
              ],
              format: "JSONEachRow",
            });
          } else {
            await this.prisma.eventLog.create({
              data: {
                deployment_id: DEPLOYEMENT_ID,
                log,
              },
            });
          }
          resolveOffset(message.offset);
          // await commitOffsetsIfNecessary(message.offset);
          await heartbeat();
        } catch (err) {
          console.log(err);
        }
      }
    } catch (error) {
      console.log("Error handling batch:", error);
    }
  }
}

export default KafkaManager;

// import { Kafka, EachBatchPayload } from 'kafkajs';
// import fs from 'fs';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import ClickHouseClient from './ClickHouseClient';
// import PrismaManager from './PrismaManager';

// class KafkaConsumerManager {
//   private kafka: Kafka;
//   private consumer: ReturnType<Kafka['consumer']>;
//   private prisma: ReturnType<PrismaManager['getPrisma']>;
//   private isClickhouseEnabled: boolean;
//   private isInitialized: boolean;

//   constructor() {
//     this.kafka = new Kafka({
//       clientId: `api-server`,
//       brokers: [`${process.env.KAFKA_BROKER}`],
//       ssl: {
//         ca: [fs.readFileSync(path.join(__dirname, 'kafka.pem'), 'utf-8')],
//       },
//       sasl: {
//         username: process.env.KAFKA_USERNAME as string,
//         password: process.env.KAFKA_PASSWORD as string,
//         mechanism: 'plain',
//       },
//     });

//     this.consumer = this.kafka.consumer({
//       groupId: 'api-server-logs-consumer',
//     });
//     this.prisma = new PrismaManager().getPrisma();
//     this.isClickhouseEnabled = process.env.CLICKHOUSE_ENABLED === 'true';
//     this.isInitialized = false;
//   }

//   public async initKafkaConsumer(): Promise<void> {
//     try {
//       if (this.isInitialized) {
//         console.log('Kafka consumer already initialized.');
//         return;
//       }

//       await this.consumer.connect();
//       await this.consumer.subscribe({
//         topics: ['container-logs'],
//         fromBeginning: true,
//       });

//       await this.consumer.run({
//         eachBatch: this.handleEachBatch.bind(this),
//       });

//       this.isInitialized = true;
//     } catch (err) {
//       console.log('Error initializing Kafka consumer: ', err);
//     }
//   }

//   private async handleEachBatch({
//     batch,
//     heartbeat,
//     commitOffsetsIfNecessary,
//     resolveOffset,
//   }: EachBatchPayload): Promise<void> {
//     try {
//       const messages = batch.messages;
//       console.log(`Received ${messages.length} messages..`);
//       for (const message of messages) {
//         if (!message.value) continue;
//         const stringMessage = message.value.toString();
//         const { PROJECT_ID, DEPLOYEMENT_ID, log } = JSON.parse(stringMessage);
//         console.log({ log, DEPLOYEMENT_ID });
//         try {
//           if (this.isClickhouseEnabled) {
//             await ClickHouseClient.insert({
//               table: 'log_events',
//               values: [
//                 { event_id: uuidv4(), deployment_id: DEPLOYEMENT_ID, log },
//               ],
//               format: 'JSONEachRow',
//             });
//           } else {
//             await this.prisma.eventLog.create({
//               data: {
//                 deployment_id: DEPLOYEMENT_ID,
//                 log,
//               },
//             });
//           }
//           resolveOffset(message.offset);
//           await commitOffsetsIfNecessary(message.offset);
//           await heartbeat();
//         } catch (err) {
//           console.log(err);
//         }
//       }
//     } catch (error) {
//       console.log('Error handling batch:', error);
//     }
//   }
// }

// export default KafkaConsumerManager;
