import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, subtitle = "", color = "primary", onClick }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border p-5 transition-all duration-300",
        onClick && "cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98] group"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
        {onClick && (
          <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      {subtitle && <p className="text-xs text-muted-foreground/60 mt-1">{subtitle}</p>}
    </div>
  );
}
