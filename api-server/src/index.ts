import express from "express";
import cors from "cors";
import apiRoutes from "./routes/route";
import cookieParser from "cookie-parser";
import KafkaManager from "./services/KafkaManager";
import RedisManager from "./services/RedisManager";

const app = express();
require("dotenv").config();
const PORT = process.env.PORT;

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api", apiRoutes);

app.listen(PORT, async () => {
  console.log(process.env.KAFKA_ENABLED);
  if (process.env.KAFKA_ENABLED === "true") {
    const kafkaConsumerManager = new KafkaManager();
    await kafkaConsumerManager.initKafkaConsumer();
  } else {
    const redisManagerInstance = RedisManager.getInstance();
    redisManagerInstance.initRedisSubscribe();
  }

  console.log(`API Server Running..${process.env.PORT}`);
});
