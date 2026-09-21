import React from "react";
import { Badge } from "@/components/ui/badge";

export default function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  badgeVariant = "secondary",
  actions,
  children,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {badge && (
              <Badge variant={badgeVariant} className="text-xs font-semibold">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {(actions || children) && (
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
