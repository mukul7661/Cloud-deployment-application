import Link from "next/link";

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger } from "./tabs";
import { useState } from "react";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const session = useSession();

  const [navbarValue, setNavbarValue] = useState("projects");
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/projects"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          navbarValue === "projects" ? "text-primary" : "text-muted-foreground"
        )}
        onClick={() => setNavbarValue("projects")}
      >
        Logo
      </Link>
      <Link
        href="/projects/create"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          navbarValue === "create" ? "text-primary" : "text-muted-foreground"
        )}
        onClick={() => setNavbarValue("create")}
      >
        Create project
      </Link>
      {!session?.data && (
        <Link
          href="/projects/guest"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            navbarValue === "guest" ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => setNavbarValue("guest")}
        >
          Deploy as guest
        </Link>
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
