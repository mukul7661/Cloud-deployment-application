import { PrismaClient } from '@prisma/client';

class PrismaManager {
  private dbConnected: boolean;
  private prisma: PrismaClient | null;
  private count = 0;

  constructor() {
    this.dbConnected = false;
    this.prisma = null;
  }

  getPrisma() {
    console.log(this.dbConnected);
    if (!this.dbConnected) {
      this.count++;
      console.log(this.count);
      this.prisma = new PrismaClient();

      this.dbConnected = true;

      console.log(this.dbConnected, 'heh');
    }
    if (!this.prisma) {
      throw new Error('PrismaClient is not initialized');
    }
    return this.prisma;
  }
}

export default PrismaManager;
