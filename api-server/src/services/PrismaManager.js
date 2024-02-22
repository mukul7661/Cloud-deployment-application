// const { PrismaClient } = require("@prisma/client");

// let dbConnected = false;
// let prisma = null;

// function getPrisma() {
//   if (!dbConnected) {
//     prisma = new PrismaClient();
//     dbConnected = true;
//   }
//   return prisma;
// }

// module.exports = { getPrisma };

const { PrismaClient } = require("@prisma/client");

class PrismaManager {
  constructor() {
    this.dbConnected = false;
    this.prisma = null;
  }

  getPrisma() {
    if (!this.dbConnected) {
      this.prisma = new PrismaClient();
      this.dbConnected = true;
    }
    return this.prisma;
  }
}

// Export an instance of PrismaManager
module.exports = new PrismaManager();
