import { NextFunction, Response } from "express";
import { createGuestUser } from "../utils/createGuestUser";
import PrismaManager from "../services/PrismaManager";
import { CustomRequest, UserDTO } from "../dto/project.dto";

const authMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const isGuest = req.cookies["is-guest"];

    let accessToken = "";
    if (isGuest === "true") {
      accessToken = "";
      const guestUser = await createGuestUser();
      const user = {
        email: guestUser?.email,
        userId: guestUser?.id,
        accessToken: "guest",
      };

      const parserUser = UserDTO.parse(user);

      req.user = parserUser;

      return next();
    }

    accessToken = req.cookies["access-token"];
    if (!accessToken) {
      res
        .status(401)
        .json({ error: "Unauthorized - No access token provided" });
      return;
    }

    const prismaManager = new PrismaManager();
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

    const parserUser = UserDTO.parse(user);
    req.user = parserUser;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Unauthorized - Invalid access token" });
    return;
  }
};

export default authMiddleware;
