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
import { authInstance } from "@/lib/authInstance";
import { serialize } from "cookie";
import { Button } from "@/components/ui/button";

export const formattedDate = (inputDate: string) => {
  const dateObject = new Date(inputDate);
  const day = dateObject.getDate().toString().padStart(2, "0");
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObject.getFullYear().toString().slice(-2);

  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};

const Projects = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  console.log(session);

  if (session === null) {
    router.push("/");
  }
  if (session?.user?.token) {
    console.log("setting cookie");
    const cookieValue = serialize("access-token", session?.user?.token, {
      // httpOnly: true,
      maxAge: 30 * 60 * 60 * 24,
      path: "/",
    });

    document.cookie = cookieValue;
  }

  const [projectList, setProjectList] = useState<[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filterProjects = (project) => {
    return (
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.gitURL.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        const res = await authInstance.get("/api/project/all", {
          withCredentials: true,
        });

        console.log(res);
        setProjectList(res?.data);
      } catch (err) {
        console.log("Error:", err);
      }
    }
    fetchProjectDetails();
  }, []);

  return (
    <>
      <div className="flex items-center justify-end w-full">
        <input
          type="text"
          placeholder="🔍  Search Projects or Repositories"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-white bg-[#151313] px-4 py-2 rounded-md border focus:ring-1 focus:ring-white  focus:outline-none  mt-6 ml-10 mr-10"
        />
        <Button
          onClick={() => router.push("/projects/create")}
          className="mt-6 mr-10"
        >
          Add new Project
        </Button>
        {/* <SearchIcon className="absolute top-1/2 right-4 transform -translate-y-1/2 h-5 w-5 text-gray-500" /> */}
      </div>
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 m-10">
        {projectList?.filter(filterProjects)?.map((project) => (
          <Card
            onClick={() => {
              console.log("div");
              router.push(`/projects/${project?.id}`);
            }}
            key={project?.id}
            className="hover:ring-1 bg-[#151313] cursor-pointer hover:ring-white "
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-medium">
                {project?.name}
              </CardTitle>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(
                    `/projects/${project?.id}/${project?.Deployment[0]?.id}`
                  );
                  router.push(
                    `/projects/${project?.id}/${project?.Deployment[0]?.id}`
                  );
                }}
              >
                See Logs
              </Button>
            </CardHeader>
            <CardContent className="flex-col">
              <a
                href={`http://${project?.subDomain}.localhost:8000`}
                className="text-[14px] hover:underline"
                target="_blank" // If you want to open the link in a new tab
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {`${project?.subDomain}.localhost:8000`}
              </a>
              <p>
                <a
                  href={project?.gitURL.replace("git://", "https://")}
                  className="text-[14px] hover:underline"
                  target="_blank" // If you want to open the link in a new tab
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {project?.gitURL.slice(17).replace(/\.git$/, "")}
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                {`Last Updated at: ${formattedDate(
                  project?.Deployment[0]?.createdAt
                )}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default Projects;
