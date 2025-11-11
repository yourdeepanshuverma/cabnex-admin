import { GalleryVerticalEnd, LogOutIcon, Settings2Icon } from "lucide-react";
import logo from "../assets/logo.png";

import { SearchForm } from "@/components/search-form";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { sidebarLinks } from "@/constants/sidebar";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { useAdminLogoutMutation } from "@/store/services/adminApi";

export function AppSidebar({ ...props }) {
  const [logout] = useAdminLogoutMutation();

  const handleLogout = async () => {
    await logout()
      .unwrap()
      .then(() => {
        window.location.href = "/login";
      });
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 p-4">
            <img
              className="h-10 w-10 rounded-md object-cover"
              src={logo}
              alt="logo"
            />
            <Link
              to="/"
              className="text-2xl font-bold text-black md:text-white"
            >
              Cabnex
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {sidebarLinks.map(({ title, href, icon: Icon }, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton
                  asChild
                  tooltip={title}
                  className={cn(
                    "md:hover:bg-muted/10 md:hover:text-foreground rounded-lg",
                    props?.pathname?.startsWith(href) &&
                      "bg-muted-foreground/20 font-medium",
                  )}
                >
                  <Link
                    className="flex items-center gap-2 text-black md:text-white"
                    to={href}
                  >
                    {Icon && <Icon />}
                    {title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="flex flex-row justify-evenly gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="sm"
              asChild
              className="hover:bg-muted/10 rounded-lg"
            >
              <Link
                to="/settings"
                className="flex items-center gap-2 text-sm text-black md:text-white md:hover:text-white"
              >
                <Settings2Icon className="h-4 w-4" />
                Settings
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="sm"
              className="hover:bg-muted/10 rounded-lg text-black md:text-white md:hover:text-white"
              onClick={handleLogout}
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
