"use client";

import TabBar from "@/components/TabBar";
import { authInstance } from "@/lib/authInstance";
import { DeploymentSchema, ProjectSchema } from "@/types/zod-types";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

const ResponseSchema = z.object({
  data: ProjectSchema,
});

const Project = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const path = usePathname();
  const pathArray = path.split("/");
  const projectId = pathArray[pathArray.length - 1];

  const [deployments, setDeployments] = useState<
    z.infer<typeof DeploymentSchema>[]
  >([]);
  const [project, setProject] = useState<z.infer<typeof ProjectSchema> | null>(
    null
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [projectStatus, setProjectStatus] = useState<string>("");

  useEffect(() => {
    if (session === null) {
      router.push("/");
    }
    async function fetchProjectDetails() {
      try {
        const res: z.infer<typeof ResponseSchema> = await authInstance.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/id?projectId=${projectId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        // if (res?.data === "") {
        //   router.push("/");
        // }

        const parsedResponse = ResponseSchema.safeParse(res);

        if (!parsedResponse?.success) {
          console.error("Error: ", parsedResponse?.error);
          return;
        }
        console.log(res?.data);
        setProject(parsedResponse?.data?.data);

        setDeployments(parsedResponse?.data?.data?.Deployment);
        switch (parsedResponse?.data?.data?.Deployment[0]?.status) {
          case "QUEUED":
            setProjectStatus("In Queue");
            break;
          case "IN_PROGRESS":
            setProjectStatus("In Progress");
            break;
          case "READY":
            setProjectStatus("Ready");
            break;
          case "FAILED":
            setProjectStatus("Failed");
            break;
        }
      } catch (err) {
        console.log("Error: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectDetails();
  }, [projectId, session, router]);

  return (
    <>
      {(status === "loading" || loading) && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}
      {!loading && !(status === "loading") && (
        <>
          {project && (
            <TabBar
              deployments={deployments}
              projectId={projectId}
              project={project}
              setLoading={(e: boolean) => setLoading(e)}
              projectStatus={projectStatus}
            />
          )}
        </>
      )}
    </>
  );
};
export default Project;
