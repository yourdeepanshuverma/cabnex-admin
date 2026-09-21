import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { sidebarGroups } from "@/constants/sidebar";
import { ExternalLinkIcon } from "lucide-react";
import { Outlet, useLocation, Link } from "react-router";

const getBreadcrumbInfo = (pathname) => {
  if (!pathname || pathname === "/" || pathname === "/dashboard") {
    return { group: "Overview", title: "Dashboard" };
  }

  for (const group of sidebarGroups) {
    for (const item of group.items) {
      if (item.href === pathname) {
        return { group: group.label, title: item.title };
      }
      if (item.href !== "/dashboard" && pathname.startsWith(item.href)) {
        return { group: group.label, title: item.title };
      }
    }
  }

  // Fallback prettification
  const segment = pathname.split("/").filter(Boolean)[0] || "";
  const title = segment
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  return { group: "Console", title: title || "Overview" };
};

const AdminLayout = () => {
  const { pathname } = useLocation();
  const breadcrumb = getBreadcrumbInfo(pathname);

  return (
    <SidebarProvider>
      <AppSidebar pathname={pathname} />
      <SidebarInset className="bg-muted/15 min-h-screen">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-card/90 px-4 md:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-1 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb className="hidden sm:block">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                      Cabnex
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {breadcrumb.group && (
                  <>
                    <BreadcrumbItem>
                      <span className="text-muted-foreground text-sm font-medium">
                        {breadcrumb.group}
                      </span>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-foreground">
                    {breadcrumb.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="sm:hidden font-semibold text-sm text-foreground">
              {breadcrumb.title}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-2xs"
            >
              <span>Customer Site</span>
              <ExternalLinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
