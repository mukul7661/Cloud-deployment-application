"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authInstance } from "@/lib/authInstance";
import { z } from "zod";

const CreateDeploymentResponseSchema = z.object({
  data: z.object({
    data: z.object({ deploymentId: z.string() }),
  }),
});

const useDeployProject = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [id, setId] = useState<string>("");

  const deployProject = async (projectId: string) => {
    try {
      setLoading(true);

      const res: z.infer<typeof CreateDeploymentResponseSchema> =
        await authInstance.post(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/deploy`,
          {
            projectId,
          },
          { withCredentials: true }
        );

      const deploymentId = res?.data?.data?.deploymentId;
      setId(deploymentId);
      router.push(`/projects/${projectId}/${deploymentId}`);
    } catch (error) {
      console.error("Error deploying project: ", error);
      setError("Error deploying project");
    } finally {
      // setTimeout(() => {
      // setLoading(false);
      // }, 200);
    }
  };

  return { deployProject, loading, error, id };
};

export default useDeployProject;
