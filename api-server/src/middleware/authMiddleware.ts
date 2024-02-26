import { NextFunction, Response } from "express";
import { createGuestUser } from "../utils/createGuestUser";
import PrismaManager from "../services/PrismaManager";
import { CustomRequest, UserDTO } from "../dto/project.dto";

const authMiddleware = async (
  req,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    console.log(req.body.isGuest);
    const isGuest = req.cookies["is-guest"];

    let accessToken = "";
    if (req.body.isGuest) {
      accessToken = "";
      const guestUser = await createGuestUser();
      const user = {
        email: guestUser?.email,
        userId: guestUser?.id,
        accessToken: "guest",
      };

      req.user = user;
      // const parserUser = UserDTO.parse(user);
      // req.user = parserUser;

      return next();
    }

    accessToken = req.cookies["access-token"];
    if (!accessToken) {
      res
        .status(401)
        .json({ error: "Unauthorized - No access token provided" });
      return;
    }

    const prismaManager = PrismaManager.getInstance();
    const prisma = prismaManager.getPrisma();

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
      res.status(401).json({ error: "Unauthorized - User not found" });
      return;
    }

    req.user = user;
    // const parsedUser = UserDTO.parse(user);
    // req.user = parsedUser;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Unauthorized - Invalid access token" });
    return;
  }
};

export default authMiddleware;
