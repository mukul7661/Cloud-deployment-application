const express = require("express");
const cors = require("cors");
const { initRedisSubscribe } = require("./services/redis");
const apiRoutes = require("./routes/route");
const cookieParser = require("cookie-parser");
const { initkafkaConsumer } = require("./services/kafka");

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

app.listen(PORT, () => {
  console.log(process.env.KAFKA_ENABLED);
  if (process.env.KAFKA_ENABLED === "true") {
    initkafkaConsumer();
  } else {
    initRedisSubscribe();
  }

  console.log(`API Server Running..${process.env.PORT}`);
});
