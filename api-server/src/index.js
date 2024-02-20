const express = require("express");
const { generateSlug } = require("random-word-slugs");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const { initRedisSubscribe } = require("./services/redis");
const { ecsClient, config } = require("./services/aws");
const apiRoutes = require("./routes/route");
const { getUserRepos } = require("./services/github");
const cookieParser = require("cookie-parser");

const app = express();
require("dotenv").config();
const PORT = process.env.PORT;

app.use(cookieParser());
const prisma = new PrismaClient();

app.use(
  cors({
    origin: "http://localhost:3000",

    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", apiRoutes);

const io = new Server({ origin: "http://localhost:3000", credentials: true });

io.on("connection", (socket) => {
  socket.on("subscribe", (channel) => {
    socket.join(channel);
    socket.emit("message", `Joined ${channel}`);
  });
});

io.listen(9002, () => console.log("Socket Server 9002"));

// app.get("/project", async (req, res) => {
//   const projectId = req.query.projectId;
//   try {
//     const projects = await prisma.project.findUnique({
//       where: {
//         id: projectId,
//       },
//       include: {
//         Deployment: true,
//       },
//     });
//     console.log(projects, "projects");
//     res.send(projects);
//   } catch (err) {
//     console.log("Error: ", err);
//     res.status(400);
//   }
// });

// app.get("/projects", async (req, res) => {
//   const projects = await prisma.project.findMany({
//     where: {},
//   });
//   console.log(projects, "projects");
//   res.send(projects);
// });

// app.post("/project", async (req, res) => {
// console.log(req.body);
// const schema = z.object({
//   name: z.string(),
//   gitURL: z.string(),
//   email: z.string(),
// });
// const safeParseResult = schema.safeParse(req.body);

// if (safeParseResult.error)
//   return res.status(400).json({ error: safeParseResult.error });

// const { name, gitURL, email } = safeParseResult.data;

// const user = await prisma.user.findUnique({
//   where: {
//     email: email,
//   },
//   select: {
//     id: true,
//   },
// });

// if (!user) {
//   console.error("User not found.");
//   return;
// }

// const userId = user.id;
// const project = await prisma.project.create({
//   data: {
//     name,
//     gitURL,
//     subDomain: generateSlug(),
//     userId: user.id,
//   },
// });

// return res.json({ status: "success", data: { project } });
// });

// app.post("/deploy", async (req, res) => {
//   const { projectId } = req.body;

// const project = await prisma.project.findUnique({ where: { id: projectId } });

// if (!project) return res.status(404).json({ error: "Project not found" });

// // Check if there is no running deployement
// const deployment = await prisma.deployment.create({
//   data: {
//     project: { connect: { id: projectId } },
//     status: "QUEUED",
//   },
// });

// // Spin the container
// const command = new RunTaskCommand({
//   cluster: config.CLUSTER,
//   taskDefinition: config.TASK,
//   launchType: "FARGATE",
//   count: 1,
//   networkConfiguration: {
//     awsvpcConfiguration: {
//       assignPublicIp: "ENABLED",
//       subnets: [
//         "subnet-0cb401b73f812753d",
//         "subnet-0920ef9e787b6e502",
//         "subnet-057cd2a2e2f0faab4",
//       ],
//       securityGroups: ["sg-08cfda151d157bab5"],
//     },
//   },
//   overrides: {
//     containerOverrides: [
//       {
//         name: "builder-image",
//         environment: [
//           { name: "GIT_REPOSITORY__URL", value: project.gitURL },
//           { name: "PROJECT_ID", value: projectId },
//           { name: "DEPLOYEMENT_ID", value: deployment.id },
//         ],
//       },
//     ],
//   },
// });

// await ecsClient.send(command);

//   return res.json({ status: "queued", data: { deploymentId: deployment.id } });
// });

// app.get("/api/user-repos", async (req, res) => {
//   const email = req.query.email;

//   console.log(email);
//   try {
//     const result = await prisma.account.findFirst({
//       where: {
//         user: {
//           email,
//         },
//       },
//       select: {
//         access_token: true,
//       },
//     });

//     if (result) {
//       const accessToken = result.access_token;
//       console.log("Access Token:", accessToken);
//       const userRepos = await getUserRepos(accessToken);
//       console.log(userRepos);
//       const userReposFiltered = userRepos?.map((repo) => ({
//         name: repo?.name,
//         id: repo?.id,
//         gitURL: repo?.git_url,
//       }));
//       console.log(userReposFiltered, "repos");
//       res.status(200).json({ userReposFiltered });
//     } else {
//       console.log("User not found or no associated project.");
//     }
//   } catch (error) {
//     console.error("Error fetching user repositories:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.listen(PORT, () => {
  initRedisSubscribe();

  console.log(`API Server Running..${process.env.PORT}`);
});
