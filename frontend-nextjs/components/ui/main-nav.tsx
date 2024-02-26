import Link from "next/link";

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger } from "./tabs";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const session = useSession();
  const path = usePathname();

  const [navbarValue, setNavbarValue] = useState("projects");
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {session?.data && (
        <>
          <Link
            href="/projects"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              path === "/projects" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Projects
          </Link>
          <Link
            href="/projects/create"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              path === "/projects/create"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Create project
          </Link>
        </>
      )}
      {!session?.data && (
        <>
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              path === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Home
          </Link>
          <Link
            href="/projects/guest"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              path === "/projects/guest"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Deploy as guest
          </Link>
        </>
      )}
    </nav>
    // <Tabs defaultValue="projects">
    //   <TabsList className="w-full">
    //     <TabsTrigger value={value}>Projects</TabsTrigger>
    //     <TabsTrigger value={value}>Projects</TabsTrigger>
    //   </TabsList>
    // </Tabs>
  );
}
