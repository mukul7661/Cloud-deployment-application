"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { authInstance } from "@/lib/authInstance";
import { serialize } from "cookie";
import { Button } from "@/components/ui/button";
import { Github, Link } from "lucide-react";
import { formattedDate } from "@/utils/formatDate";
import { z } from "zod";
import { ProjectSchema } from "@/types/zod-types";

const ResponseSchema = z.object({
  data: z.array(ProjectSchema),
});

const Projects = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState<boolean>(true);

  const [projectList, setProjectList] = useState<
    z.infer<typeof ProjectSchema>[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filterProjects = (project: z.infer<typeof ProjectSchema>) => {
    return (
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.gitURL.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    if (session === null) {
      router.push("/");
    }
    if (session?.user?.token) {
      console.log("setting cookie");
      const cookieValue = serialize("access-token", session?.user?.token, {
        httpOnly: true,
        maxAge: 30 * 60 * 60 * 24,
        path: "/",
      });

      document.cookie = cookieValue;
    }
    async function fetchProjectDetails() {
      try {
        const response: z.infer<typeof ResponseSchema> = await authInstance.get(
          "/api/project/all",
          {
            withCredentials: true,
          }
        );

        const parsedResponse = ResponseSchema.safeParse(response);

        if (parsedResponse?.success) {
          setProjectList(parsedResponse?.data?.data);
        } else {
          console.error("Error: ", parsedResponse?.error);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }
    fetchProjectDetails();
    setLoading(false);
  }, [session, router]);

  return (
    <>
      {(status === "loading" || loading) && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}
      {!loading && !(status === "loading") && (
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
                      router.push(
                        `/projects/${project?.id}/${project?.Deployment[0]?.id}`
                      );
                    }}
                  >
                    See Logs
                  </Button>
                </CardHeader>
                <CardContent className="flex-col gap-y-4">
                  <a
                    href={`http://${project?.subDomain}.localhost:8000`}
                    className="flex gap-2 text-[14px] hover:underline  align-middle mb-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link className="w-[14px]" />
                    {`${project?.subDomain}.localhost:8000`}
                  </a>

                  <a
                    href={project?.gitURL.replace("git://", "https://")}
                    className="flex gap-2 text-[14px] hover:underline  align-middle mb-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github className="w-[14px]" />
                    {project?.gitURL.slice(17).replace(/\.git$/, "")}
                  </a>

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
      )}
    </>
  );
};

export default Projects;
