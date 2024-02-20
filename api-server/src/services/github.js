// // import { App } from "@octokit/app";
// // import { request } from "@octokit/request";
const axios = require("axios");

// // // Replace these values with your app's information
// // const APP_ID = "831124";
// // const PRIVATE_KEY_PATH =
// //   "api-server/src/cloud-deployment-by-mukul.2024-02-17.private-key.pem";
// // const INSTALLATION_ID = "installation_id";
// // // client_id = Iv1.37f366abede313b4
// // // Authenticate as GitHub App
// // const app = new App({
// //   id: APP_ID,
// //   privateKey: require("fs").readFileSync(PRIVATE_KEY_PATH),
// // });
// // const installationAccessToken = await app.getInstallationAccessToken({
// //   installationId: parseInt(INSTALLATION_ID, 10),
// // });

// // // Use the installation token to interact with the GitHub API
// // const octokit = request.defaults({
// //   headers: {
// //     authorization: `token ${installationAccessToken}`,
// //   },
// // });

// // // Example: List repositories
// // const repos = await octokit.repos.listForAuthenticatedUser();
// // repos.data.forEach((repo) => {
// //   console.log(repo.name);
// // });

// const express = require("express");
// const axios = require("axios");

// // Example: Create webhook for a repository
// app.post("/api/create-webhook", async (req, res) => {
//   const { accessToken, repoFullName } = req.body;

//   try {
//     const webhook = await createWebhook(accessToken, repoFullName);
//     res.status(200).json({ webhook });
//   } catch (error) {
//     console.error("Error creating webhook:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Example: Handle incoming webhook events
// app.post("/webhook-endpoint", (req, res) => {
//   const payload = req.body;
//   handleWebhookEvent(payload);
//   res.status(200).send("Webhook received");
// });

// // Example deployment function
// const deployRepository = (repoFullName) => {
//   // Implement your deployment logic here
//   console.log(`Deploying repository: ${repoFullName}`);
// };

const getUserRepos = async (accessToken) => {
  const response = await axios.get("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

// const createWebhook = async (accessToken, repoFullName) => {
//   const response = await axios.post(
//     `https://api.github.com/repos/${repoFullName}/hooks`,
//     {
//       name: "web",
//       config: {
//         url: "YOUR_WEBHOOK_ENDPOINT",
//         content_type: "json",
//       },
//       events: ["pull_request"],
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     }
//   );
//   return response.data;
// };

// const handleWebhookEvent = (payload) => {
//   // Extract information from the payload and trigger deployment
//   // Example: Deploy when a pull request is closed and merged
//   if (payload.action === "closed" && payload.pull_request.merged) {
//     const repoFullName = payload.repository.full_name;
//     // Trigger deployment for the specified repository
//     deployRepository(repoFullName);
//   }
// };

module.exports = { getUserRepos };
