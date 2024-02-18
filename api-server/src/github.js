// import { App } from "@octokit/app";
// import { request } from "@octokit/request";

// // Replace these values with your app's information
// const APP_ID = "831124";
// const PRIVATE_KEY_PATH =
//   "api-server/src/cloud-deployment-by-mukul.2024-02-17.private-key.pem";
// const INSTALLATION_ID = "installation_id";
// // client_id = Iv1.37f366abede313b4
// // Authenticate as GitHub App
// const app = new App({
//   id: APP_ID,
//   privateKey: require("fs").readFileSync(PRIVATE_KEY_PATH),
// });
// const installationAccessToken = await app.getInstallationAccessToken({
//   installationId: parseInt(INSTALLATION_ID, 10),
// });

// // Use the installation token to interact with the GitHub API
// const octokit = request.defaults({
//   headers: {
//     authorization: `token ${installationAccessToken}`,
//   },
// });

// // Example: List repositories
// const repos = await octokit.repos.listForAuthenticatedUser();
// repos.data.forEach((repo) => {
//   console.log(repo.name);
// });

const express = require("express");
const axios = require("axios");
