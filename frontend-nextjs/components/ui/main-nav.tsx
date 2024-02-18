import Link from "next/link";

import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
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
      <Link
        href="/projects/guest/123"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Deploy as guest
      </Link>
    </nav>
  );
}
