// const { getPrisma } = require("../services/prisma");
const prismaManager = require("../services/PrismaManager");

// const prisma = getPrisma();
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

  console.log(user);
  return user;
}

module.exports = { createGuestUser };
