"use client";

import TabBar from "@/components/TabBar";
import axios from "axios";
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
  console.log(projectId, "projectId");

  const [deployments, setDeployments] = useState([{ id: "1" }]);

  useEffect(() => {
    async function fetchProjectDetails() {
      const res = await axios.get(
        `http://${process.env.NEXT_PUBLIC_API_SERVER_URL}:9000/project?projectId=${projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (res?.data === "") {
        router.push("/");
      }
      console.log(res?.data);

      setDeployments(res?.data?.Deployment);
    }
    fetchProjectDetails();
  }, []);

  return (
    <div>
      <TabBar deployments={deployments} projectId={projectId} />
    </div>
  );
};
export default Project;
