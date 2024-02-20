import Link from "next/link";

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const session = useSession();
  console.log(session);
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Logo
      </Link>
      <Link
        href="/projects/create"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Create project
      </Link>
      {!session?.data && (
        <Link
          href="/projects/guest"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Deploy as guest
        </Link>
      )}
    </nav>
  );
}
