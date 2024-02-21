"use client";

import TabBar from "@/components/TabBar";
import { authInstance } from "@/lib/authInstance";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Project = () => {
  const router = useRouter();
  const session = useSession();

  if (session?.data === null) {
    router.push("/");
  }
  const path = usePathname();
  const pathArray = path.split("/");
  const projectId = pathArray[pathArray.length - 1];

  const [deployments, setDeployments] = useState([]);
  const [project, setProject] = useState(null);

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        const res = await authInstance.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/id?projectId=${projectId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (res?.data === "") {
          router.push("/");
        }
        console.log(res?.data);
        setProject(res?.data);

        setDeployments(res?.data?.Deployment);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
    fetchProjectDetails();
  }, []);

  return (
    <div>
      {project && (
        <TabBar
          deployments={deployments}
          projectId={projectId}
          project={project}
        />
      )}
    </div>
  );
};
export default Project;
