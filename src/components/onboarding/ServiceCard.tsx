import { LucideIcon, Lock, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

export type ServiceStatus = "locked" | "pending" | "in-progress" | "complete";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: ServiceStatus;
  progress?: number;
  onAction?: () => void;
  onCompleteClick?: () => void;
  completedContent?: ReactNode;
  className?: string;
}

const statusConfig: Record<ServiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: LucideIcon }> = {
  locked: { label: "Locked", variant: "secondary", icon: Lock },
  pending: { label: "Not Started", variant: "outline", icon: Clock },
  "in-progress": { label: "In Progress", variant: "default", icon: ArrowRight },
  complete: { label: "Complete", variant: "secondary", icon: CheckCircle2 },
};

const ServiceCard = ({ title, description, icon: Icon, status, progress = 0, onAction, onCompleteClick, completedContent, className }: ServiceCardProps) => {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const isLocked = status === "locked";
  const isComplete = status === "complete";

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300 relative overflow-hidden group",
        isLocked && "opacity-60 cursor-not-allowed",
        !isLocked && !isComplete && "hover:shadow-lg hover:border-primary/30 cursor-pointer",
        isComplete && "border-accent/40",
        isComplete && onCompleteClick && "hover:shadow-lg hover:border-accent/60 cursor-pointer",
        className
      )}
      onClick={isComplete ? onCompleteClick : (!isLocked ? onAction : undefined)}
    >
      {/* Gradient accent line */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 rounded-t-xl transition-all",
          isComplete && "bg-accent",
          status === "in-progress" && "bg-gradient-to-r from-primary to-[hsl(var(--secondary-purple))]",
          status === "pending" && "bg-muted",
          isLocked && "bg-muted"
        )}
      />

      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "h-11 w-11 rounded-lg flex items-center justify-center",
          isComplete ? "bg-accent/10" : "bg-primary/10"
        )}>
          <Icon size={22} className={cn(isComplete ? "text-accent" : "text-primary")} />
        </div>
        <Badge variant={config.variant} className={cn(
          "text-xs gap-1",
          isComplete && "bg-accent/10 text-accent border-accent/20"
        )}>
          <StatusIcon size={12} />
          {config.label}
        </Badge>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>

      {!isComplete && (
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
      )}

      {!isLocked && !isComplete && (
        <div className="space-y-3">
          <Progress value={progress} className="h-1.5" />
          <Button
            size="sm"
            variant={status === "in-progress" ? "default" : "outline"}
            className="w-full gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.();
            }}
          >
            {status === "in-progress" ? "Continue" : "Start"}
            <ArrowRight size={14} />
          </Button>
        </div>
      )}

      {isComplete && (
        <div className="mb-3">
          {completedContent || (
            <div className="flex items-center gap-2 text-sm text-accent font-medium">
              <CheckCircle2 size={16} />
              All steps completed
            </div>
          )}
        </div>
      )}

      {isComplete && onCompleteClick && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-accent transition-colors">
          <ArrowRight size={12} />
          View details
        </div>
      )}

      {isLocked && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock size={14} />
          Complete Formation first
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
