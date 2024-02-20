const { PrismaClient } = require("@prisma/client");

let dbConnected = false;
let prisma = null;

function getPrisma() {
  if (!dbConnected) {
    prisma = new PrismaClient();
    dbConnected = true;
  }
  return prisma;
}

module.exports = { getPrisma };
