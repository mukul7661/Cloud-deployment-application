import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

let isConnected = false;

let prisma = null;
if (isConnected === false) {
  prisma = new PrismaClient();
  isConnected = true;
}
export { prisma };

export default PrismaAdapter(prisma);
