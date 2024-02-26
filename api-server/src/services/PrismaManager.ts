import { PrismaClient } from "@prisma/client";

class PrismaManager {
  private static instance: PrismaManager | null = null;
  private dbConnected: boolean;
  private prisma: PrismaClient | null;

  private constructor() {
    this.dbConnected = false;
    this.prisma = null;
  }

  static getInstance(): PrismaManager {
    if (!PrismaManager.instance) {
      PrismaManager.instance = new PrismaManager();
    }

    return PrismaManager.instance;
  }

  getPrisma() {
    if (!this.dbConnected) {
      this.prisma = new PrismaClient();

      this.dbConnected = true;
    }

    if (!this.prisma) {
      throw new Error("PrismaClient is not initialized");
    }

    return this.prisma;
  }
}

export default PrismaManager;
