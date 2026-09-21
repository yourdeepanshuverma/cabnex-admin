import {
  LogOutIcon,
  Settings2Icon,
  ShieldCheckIcon,
  ChevronRightIcon,
} from "lucide-react";
import logo from "../assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { sidebarGroups } from "@/constants/sidebar";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { useAdminLogoutMutation } from "@/store/services/adminApi";

export function AppSidebar({ pathname = "", ...props }) {
  const [logout] = useAdminLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <Sidebar {...props} className="border-r border-slate-800">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-slate-800/80 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1 shadow-xs transition-transform group-hover:scale-105">
              <img
                className="h-full w-full object-contain"
                src={logo}
                alt="Cabnex"
              />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">
                Cabnex
              </span>
              <span className="text-[11px] font-medium text-slate-400 block tracking-wide">
                Admin Console
              </span>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      {/* Categorized Navigation */}
      <SidebarContent className="px-2 py-2 space-y-3">
        {sidebarGroups.map((group, groupIdx) => (
          <SidebarGroup key={groupIdx} className="p-0">
            <SidebarGroupLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400/90 flex items-center justify-between">
              <span>{group.label}</span>
              {group.badge && (
                <span className="text-[9px] font-medium tracking-normal text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded">
                  {group.badge}
                </span>
              )}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5 mt-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-primary"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      )}
                    >
                      <Link to={item.href} className="flex items-center gap-2.5 w-full">
                        {Icon && (
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isActive ? "text-primary" : "text-slate-400 group-hover:text-white"
                            )}
                          />
                        )}
                        <span className="truncate flex-1">{item.title}</span>
                        {item.badge ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                            {item.badge}
                          </span>
                        ) : isActive ? (
                          <ChevronRightIcon className="h-3.5 w-3.5 text-slate-500" />
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Admin Footer */}
      <SidebarFooter className="border-t border-slate-800/80 p-2">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-slate-800/40 px-3 py-2 border border-slate-800/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary border border-primary/30 text-xs font-bold">
            <ShieldCheckIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              Super Administrator
            </p>
            <p className="truncate text-[10px] text-slate-400">
              admin@cabnex.com
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1">
          <Link
            to="/settings"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings2Icon className="h-3.5 w-3.5" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors"
          >
            <LogOutIcon className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
