// const { getPrisma } = require("../services/prisma");
const prismaManager = require("../services/PrismaManager.js");

const { createGuestUser } = require("../utils/createGuestUser.js");
const authMiddleware = async (req, res, next) => {
  try {
    // Get the session information from the request headers or body
    console.log(req.cookies["is-guest"], "guest");

    const isGuest = req.cookies["is-guest"];

    let accessToken = "";
    if (isGuest === "true") {
      accessToken = "";
      const guestUser = await createGuestUser();
      const user = {
        email: guestUser?.email,
        userId: guestUser?.id,
      };

      req.user = user;

      return next();
    }

    console.log(req.cookies["access-token"], "token");
    // const accessToken =
    //   req.headers.authorization && req.headers.authorization.split(" ")[1];
    // if (!accessToken) {
    //   return res
    //     .status(401)
    //     .json({ error: "Unauthorized - No access token provided" });
    // }

    accessToken = req.cookies["access-token"];
    if (!accessToken) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No access token provided" });
    }

    // Verify the token from the session
    // const decoded = jwt.verify(accessToken, process.env.NEXTAUTH_JWT_SECRET);
    // const prisma = getPrisma();
    const prisma = prismaManager.getPrisma();

    // Find the user in the database using the decoded email
    const account = await prisma.account.findUnique({
      where: {
        access_token: accessToken,
      },
      include: {
        user: true,
      },
    });

    const user = {
      email: account?.user?.email,
      accessToken: account?.access_token,
      userId: account?.userId,
    };

    if (!user) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ error: "Unauthorized - Invalid access token" });
  }
};

module.exports = authMiddleware;
