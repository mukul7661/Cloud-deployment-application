"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";

const Projects = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (session === null) {
    router.push("/");
  }

  const [projectList, setProjectList] = useState<[]>([]);

  useEffect(() => {
    async function fetchProjectDetails() {
      const res = await axios.get(
        `http://${process.env.NEXT_PUBLIC_API_SERVER_URL}:9000/projects`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(res);
      setProjectList(res?.data);
    }
    fetchProjectDetails();
  }, []);

  return (
    <>
      <div className="grid gap-10 md:grid-cols-4 lg:grid-cols-3 m-10">
        {projectList?.map((project) => (
          <Card
            onClick={() => router.push(`/projects/${project?.id}`)}
            key={project?.id}
            className="hover:ring-1 bg-[#151313] cursor-pointer hover:ring-white "
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl   font-medium">
                {project?.name}
              </CardTitle>
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg> */}
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default Projects;
