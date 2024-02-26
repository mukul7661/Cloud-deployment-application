import PrismaManager from "../services/PrismaManager";

const prismaManager = PrismaManager.getInstance();

const prisma = prismaManager.getPrisma();

async function createGuestUser() {
  const user = await prisma.user.upsert({
    where: {
      email: "guest@gmail.com",
    },
    update: {},
    create: {
      email: "guest@gmail.com",
      name: "Guest",
    },
  });

  return user;
}

export { createGuestUser };
