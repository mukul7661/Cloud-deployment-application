const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/route");
const cookieParser = require("cookie-parser");
const { initkafkaConsumer } = require("./services/kafka");
const LogManager = require("./services/RedisManager");

const app = express();
require("dotenv").config();
const PORT = process.env.PORT;

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", apiRoutes);

app.listen(PORT, async () => {
  console.log(process.env.KAFKA_ENABLED);
  if (process.env.KAFKA_ENABLED === "true") {
    await initkafkaConsumer();
  } else {
    // await initRedisSubscribe();

    // Create an instance of LogManager using the getInstance method
    const logManagerInstance = LogManager.getInstance();

    // Initialize Redis subscription
    logManagerInstance.initRedisSubscribe();
  }

  console.log(`API Server Running..${process.env.PORT}`);
});
