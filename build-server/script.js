const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const Redis = require("ioredis");
const { Kafka } = require("kafkajs");

require("dotenv").config();

const publisher = new Redis(process.env.AIVEN_REDIS_URL);

const isKafkaEnabled = process.env.KAFKA_ENABLED === "true";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const PROJECT_ID = process.env.PROJECT_ID;
const DEPLOYEMENT_ID = process.env.DEPLOYEMENT_ID;

let producer = null;

if (isKafkaEnabled === true) {
  const kafka = new Kafka({
    clientId: `docker-build-server-${DEPLOYEMENT_ID}`,
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

  producer = kafka.producer();
}

async function publishStatus(status) {
  if (isKafkaEnabled === true) {
    await producer.send({
      topic: `container-status`,
      messages: [
        {
          key: "status",
          value: JSON.stringify({ PROJECT_ID, DEPLOYEMENT_ID, status }),
        },
      ],
    });
  } else {
    publisher.publish(`status:${DEPLOYEMENT_ID}`, JSON.stringify({ status }));
  }
}

async function publishLog(log) {
  if (isKafkaEnabled === true) {
    await producer.send({
      topic: `container-logs`,
      messages: [
        {
          key: "log",
          value: JSON.stringify({ PROJECT_ID, DEPLOYEMENT_ID, log }),
        },
      ],
    });
  } else {
    publisher.publish(`logs:${DEPLOYEMENT_ID}`, JSON.stringify({ log }));
  }
}

async function init() {
  if (isKafkaEnabled === true) {
    await producer.connect();
  }

  console.log("Executing script.js");
  await publishLog("Build Started...");
  await publishStatus("IN_PROGRESS");
  const outDirPath = path.join(__dirname, "output");

  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  p.stdout.on("data", async function (data) {
    console.log(data.toString());
    await publishLog(data.toString());
  });

  p.stderr.on("data", async function (data) {
    console.error(data.toString());
    await publishLog(data.toString());
  });
  p.on("close", async function (code) {
    if (code !== 0) {
      await publishStatus("FAILED");
      process.exit(1);
    }
    console.log(code, "code");
    console.log("Build Complete");
    await publishLog(`Build Complete`);
    const distFolderPath = path.join(__dirname, "output", "dist");
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    await publishLog(`Starting to upload`);
    for (const file of distFolderContents) {
      const filePath = path.join(distFolderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) continue;

      console.log("uploading", filePath);
      await publishLog(`uploading ${file}`);

      const command = new PutObjectCommand({
        Bucket: "vercel-outputs",
        Key: `__outputs/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath),
      });

      await s3Client.send(command);
      await publishLog(`uploaded ${file}`);
      console.log("uploaded", filePath);
    }
    await publishLog(`Done`);
    await publishStatus("READY");

    setTimeout(() => {
      console.log("Done...");
      process.exit(0);
    }, 500);
  });
}

init();
