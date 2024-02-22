import { z } from "zod";

const DeploymentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  gitURL: z.string(),
  subDomain: z.string(),
  customDomain: z.string().or(z.null()),
  createdAt: z.string(),
  updatedAt: z.string(),
  userId: z.string(),
  Deployment: z.array(DeploymentSchema),
});

export { DeploymentSchema, ProjectSchema };
