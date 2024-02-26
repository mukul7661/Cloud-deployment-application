import { Request } from "express";
import { z } from "zod";

export interface CustomRequest extends Request {
  user?: {
    email?: string | null;
    accessToken?: string | null;
    userId?: string | null;
  };
}

export const UserDTO = z.object({
  email: z.string(),
  accessToken: z.string(),
  userId: z.string(),
});

export const CreateProjectRequestDTO = z.object({
  name: z.string(),
  gitURL: z.string(),
  isGuest: z.boolean().optional(),
});

export const DeployProjectRequestDTO = z.object({
  projectId: z.string(),
});

export const ProjectResponseDTO = z.object({
  id: z.string(),
  name: z.string(),
  gitURL: z.string(),
});
