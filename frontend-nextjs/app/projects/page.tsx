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
  const [projectStatus, setProjectStatus] = useState<string>("");

  const filterProjects = (project: z.infer<typeof ProjectSchema>) => {
    return (
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.gitURL.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  useEffect(() => {
    // const serverSession = fetchServerSession();
    // console.log(serverSession, "server");

    if (session !== null) {
      if (session?.user?.token) {
        const cookieValue = serialize("access-token", session?.user?.token, {
          // httpOnly: true,
          maxAge: 30 * 60 * 60 * 24,
          path: "/",
          domain: ".mukulyadav.com",
        });

        document.cookie = cookieValue;
      }
    }
    setLoading(false);
  }, [session, router]);

  useEffect(() => {
    if (session === null) {
      router.push("/");
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
          switch (parsedResponse?.data?.data[0]?.Deployment[0]?.status) {
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
              onClick={() => {
                setLoading(true);
                router.push("/projects/create");
              }}
              className="mt-6 mr-10"
            >
              Add new Project
            </Button>
          </div>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 m-10">
            {projectList?.filter(filterProjects)?.map((project) => (
              <Card
                onClick={() => {
                  setLoading(true);
                  router.push(`/projects/${project?.id}`);
                }}
                key={project?.id}
                className="hover:ring-1 bg-[#151313] cursor-pointer hover:ring-white "
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex flex-col">
                    <CardTitle className="text-2xl font-medium">
                      {project?.name}
                    </CardTitle>
                    <a
                      href={`http://${project?.subDomain}.mukulyadav.com:8000`}
                      className="flex gap-2 text-[12px] hover:underline  align-middle mb-2"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link className="w-[12px]" />
                      {`${project?.subDomain}.mukulyadav.com:8000`}
                    </a>
                  </div>
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
                <CardContent className="flex items-center justify-between mt-4">
                  <div className="flex-col gap-y-4">
                    <a
                      href={project?.gitURL.replace("git://", "https://")}
                      className="flex gap-2 text-[14px] hover:underline  align-middle mb-2 border-2 rounded-full py-1 px-2"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github className="w-[12px]" />
                      {project?.gitURL.slice(17).replace(/\.git$/, "")}
                    </a>

                    <p className="text-xs text-muted-foreground">
                      {`Last Updated at: ${formattedDate(
                        project?.Deployment[0]?.createdAt
                      )}`}
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className=""
                    variant={"secondary"}
                  >
                    <span className="text-xs mr-1">Status:</span>
                    <span>{projectStatus}</span>
                  </Button>
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
