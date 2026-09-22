import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Landmark,
  FileText,
  ShieldCheck,
  Wallet,
  FileSpreadsheet,
  Gem,
  Receipt,
  ArrowRightLeft,
  Gift,
  BarChart3,
  Globe,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronDown,
  ScrollText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActiveOrg } from "@/contexts/ActiveOrgContext";
import { getShortName } from "@/lib/companyUtils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const EIN_URL =
  "https://register.fileforms.com/partner-file-now-cta-v2/?REFERRALCODE=recM4mmc9COERzwg5";

/* ── Compact Highlights (4 mini cards) ──────────── */

interface HighlightDef {
  icon: React.ElementType;
  title: string;
  getStatus: (c: NonNullable<ReturnType<typeof useActiveOrg>["activeCompany"]>) => string;
  onClick: (navigate: ReturnType<typeof useNavigate>) => void;
}

const HIGHLIGHTS: HighlightDef[] = [
  {
    icon: ScrollText,
    title: "Formation",
    getStatus: (c) => c.formation_status || "pending",
    onClick: (nav) => nav("/dashboard/organization"),
  },
  {
    icon: Landmark,
    title: "Bank Account",
    getStatus: (c) => c.banking_status || "not started",
    onClick: (nav) => nav("/dashboard/banking"),
  },
  {
    icon: FileText,
    title: "EIN",
    getStatus: (c) => c.ein_status || "not started",
    onClick: () => window.open(EIN_URL, "_blank", "noopener"),
  },
  {
    icon: Wallet,
    title: "MPC Wallet",
    getStatus: (c) => (c.wallet_address ? "active" : "not started"),
    onClick: (nav) => nav("/dashboard/banking"),
  },
];

const statusDot = (s: string) => {
  const lower = s.toLowerCase();
  if (["complete", "completed", "active", "approved"].includes(lower))
    return "bg-emerald-500";
  if (["pending", "in_progress", "processing"].includes(lower))
    return "bg-amber-500";
  return "bg-muted-foreground/40";
};

/* ── Service Grid (icon + title squares) ─────────── */

interface ServiceGridItem {
  icon: React.ElementType;
  title: string;
  url: string;
}

const SERVICE_GRID: ServiceGridItem[] = [
  { icon: Building2, title: "Organization", url: "/dashboard/documents" },
  { icon: ShieldCheck, title: "Compliance", url: "/dashboard/compliance" },
  { icon: Landmark, title: "Banking", url: "/dashboard/banking" },
  { icon: FileSpreadsheet, title: "Accounting", url: "/dashboard/accounting" },
  { icon: Gem, title: "RWA", url: "/dashboard/assets" },
  { icon: Receipt, title: "Invoices", url: "/dashboard/invoices" },
  { icon: ArrowRightLeft, title: "DeFi", url: "/dashboard/defi" },
  { icon: Gift, title: "Grants", url: "/dashboard/grants" },
  { icon: BarChart3, title: "Analytics", url: "/dashboard/documents" },
  { icon: Globe, title: "Website", url: "/dashboard/documents" },
];

/* ── Action Items ────────────────────────────────── */

interface ActionItem {
  label: string;
  cta: string;
  isDone: (c: NonNullable<ReturnType<typeof useActiveOrg>["activeCompany"]>) => boolean;
  onClick: (navigate: ReturnType<typeof useNavigate>) => void;
}

const ACTION_ITEMS: ActionItem[] = [
  {
    label: "Apply for your FIAT account",
    cta: "Apply",
    isDone: (c) => c.banking_status === "active" || c.banking_status === "approved",
    onClick: (nav) => nav("/dashboard/banking"),
  },
  {
    label: "Deposit USDC",
    cta: "Deposit",
    isDone: () => false,
    onClick: (nav) => nav("/dashboard/banking"),
  },
  {
    label: "Request Credit Card",
    cta: "Apply",
    isDone: () => false,
    onClick: (nav) => nav("/dashboard/banking"),
  },
  {
    label: "EIN Application",
    cta: "Apply",
    isDone: (c) => c.ein_status === "completed" || c.ein_status === "approved",
    onClick: () => window.open(EIN_URL, "_blank", "noopener"),
  },
];

/* ── Main Export ──────────────────────────────────── */

const DashboardHome = () => {
  const navigate = useNavigate();
  const { activeCompany } = useActiveOrg();
  const shortName = activeCompany ? getShortName(activeCompany) : "Your Company";
  const [nextStepsOpen, setNextStepsOpen] = useState(true);

  const doneCount = activeCompany
    ? ACTION_ITEMS.filter((a) => a.isDone(activeCompany)).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">{shortName}</p>
      </div>

      {/* Highlights — compact */}
      {activeCompany && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {HIGHLIGHTS.map((h) => {
            const status = h.getStatus(activeCompany);
            const done = ["complete", "completed", "active", "approved"].includes(status.toLowerCase());
            return (
              <button
                key={h.title}
                onClick={() => h.onClick(navigate)}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all text-left ${
                  done
                    ? "border-emerald-500/30 bg-emerald-500/5 opacity-60"
                    : "border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 shadow-sm"
                }`}
              >
                <h.icon className={`h-4 w-4 shrink-0 ${done ? "text-emerald-500" : "text-primary"}`} />
                <span className={`text-xs font-medium truncate ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {h.title}
                </span>
                <span className={`h-2 w-2 rounded-full shrink-0 ml-auto ${statusDot(status)}`} />
              </button>
            );
          })}
        </div>
      )}

      {/* Action Required — Next Steps (before services) */}
      {activeCompany && (
        <Collapsible open={nextStepsOpen} onOpenChange={setNextStepsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left group">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Action Required</span>
            <Badge variant="outline" className="text-[10px] ml-1 border-2">
              {doneCount}/{ACTION_ITEMS.length}
            </Badge>
            <ChevronDown
              className={`h-3.5 w-3.5 text-muted-foreground ml-auto transition-transform ${
                nextStepsOpen ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {ACTION_ITEMS.map((item) => {
              const done = activeCompany ? item.isDone(activeCompany) : false;
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                    done
                      ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
                      : "bg-primary/5 border-primary/30 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-primary/40 shrink-0" />
                    )}
                    <span className={`text-sm ${done ? "text-muted-foreground line-through" : "font-medium text-foreground"}`}>
                      {item.label}
                    </span>
                  </div>
                  {!done && (
                    <Button
                      size="sm"
                      className="h-7 text-xs border-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm"
                      onClick={() => item.onClick(navigate)}
                    >
                      {item.cta}
                    </Button>
                  )}
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Service Grid — icon squares */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {SERVICE_GRID.map((svc) => (
          <button
            key={svc.title}
            onClick={() => navigate(svc.url)}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border p-4 aspect-square transition-all hover:bg-primary/5 hover:border-primary/40 hover:shadow-sm cursor-pointer"
          >
            <svc.icon className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium text-foreground text-center leading-tight">{svc.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
