import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck, Clock, AlertTriangle, CheckCircle2, Bot, Hand,
  Building2, FileText, Landmark, CreditCard, Calendar, RefreshCw,
  ChevronDown, ChevronRight, Zap
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ComplianceFiling {
  id: string;
  company_id: string;
  filing_type: string;
  filing_name: string;
  description: string | null;
  category: string;
  status: string;
  method: string;
  agent_name: string | null;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  priority: string;
  recurring: boolean;
  recurrence_interval: string | null;
  created_at: string;
  updated_at: string;
}

interface CompanyInfo {
  id: string;
  company_name: string;
  user_id: string;
}

interface AdminComplianceTrackerProps {
  filings: ComplianceFiling[];
  companies: CompanyInfo[];
  onFilingUpdated: () => void;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  completed: { color: "bg-accent/10 text-accent border-0", icon: CheckCircle2, label: "Completed" },
  in_progress: { color: "bg-warning/10 text-warning border-0", icon: Clock, label: "In Progress" },
  pending: { color: "bg-muted text-muted-foreground border-0", icon: Clock, label: "Pending" },
  overdue: { color: "bg-destructive/10 text-destructive border-0", icon: AlertTriangle, label: "Overdue" },
  not_required: { color: "bg-muted/50 text-muted-foreground/60 border-0", icon: CheckCircle2, label: "N/A" },
};

const priorityConfig: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-0",
  medium: "bg-warning/10 text-warning border-0",
  low: "bg-muted text-muted-foreground border-0",
};

const categoryConfig: Record<string, { icon: React.ElementType; label: string }> = {
  formation: { icon: Building2, label: "Formation" },
  tax: { icon: FileText, label: "Tax" },
  compliance: { icon: ShieldCheck, label: "Compliance" },
  banking: { icon: Landmark, label: "Banking" },
};

const AdminComplianceTracker = ({ filings, companies, onFilingUpdated }: AdminComplianceTrackerProps) => {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const toggleCompany = (id: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateFilingStatus = async (filingId: string, newStatus: string) => {
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "completed") updates.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from("compliance_filings")
      .update(updates)
      .eq("id", filingId);

    if (error) {
      toast.error("Failed to update filing status");
    } else {
      toast.success("Filing status updated");
      onFilingUpdated();
    }
  };

  // Aggregate stats
  const totalFilings = filings.length;
  const completedFilings = filings.filter((f) => f.status === "completed").length;
  const pendingFilings = filings.filter((f) => f.status === "pending").length;
  const inProgressFilings = filings.filter((f) => f.status === "in_progress").length;
  const apiFilings = filings.filter((f) => f.method === "api").length;
  const manualFilings = filings.filter((f) => f.method === "manual").length;
  const overdueFilings = filings.filter((f) => {
    if (f.status === "completed" || f.status === "not_required") return false;
    if (!f.due_date) return false;
    return new Date(f.due_date) < new Date();
  }).length;

  const completionRate = totalFilings > 0 ? Math.round((completedFilings / totalFilings) * 100) : 0;

  const getCompanyFilings = (companyId: string) => {
    return filings
      .filter((f) => f.company_id === companyId)
      .filter((f) => filterCategory === "all" || f.category === filterCategory)
      .filter((f) => filterStatus === "all" || f.status === filterStatus);
  };

  const isOverdue = (filing: ComplianceFiling) => {
    if (filing.status === "completed" || filing.status === "not_required") return false;
    if (!filing.due_date) return false;
    return new Date(filing.due_date) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Total Filings" value={totalFilings} icon={FileText} />
        <StatCard label="Completed" value={completedFilings} icon={CheckCircle2} accent />
        <StatCard label="In Progress" value={inProgressFilings} icon={Clock} />
        <StatCard label="Pending" value={pendingFilings} icon={Clock} />
        <StatCard label="Overdue" value={overdueFilings} icon={AlertTriangle} destructive={overdueFilings > 0} />
        <StatCard label="Via API" value={apiFilings} icon={Bot} />
        <StatCard label="Manual" value={manualFilings} icon={Hand} />
      </div>

      {/* Overall Completion */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Overall Compliance Completion</p>
            <span className="text-sm font-bold text-foreground">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="formation">Formation</SelectItem>
            <SelectItem value="tax">Tax</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="banking">Banking</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="not_required">Not Required</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Per-Company Filing Lists */}
      <div className="space-y-3">
        {companies.map((company) => {
          const companyFilings = getCompanyFilings(company.id);
          const companyCompleted = companyFilings.filter((f) => f.status === "completed").length;
          const companyTotal = companyFilings.length;
          const companyProgress = companyTotal > 0 ? Math.round((companyCompleted / companyTotal) * 100) : 0;
          const expanded = expandedCompanies.has(company.id);

          return (
            <Card key={company.id}>
              <button
                onClick={() => toggleCompany(company.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{company.company_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {companyCompleted}/{companyTotal} filings complete
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 w-32">
                    <Progress value={companyProgress} className="h-1.5 flex-1" />
                    <span className="text-xs font-medium text-foreground">{companyProgress}%</span>
                  </div>
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expanded && (
                <CardContent className="border-t border-border pt-3 pb-4 px-4">
                  {companyFilings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No filings match filters.</p>
                  ) : (
                    <div className="space-y-2">
                      {companyFilings.map((filing) => (
                        <FilingRow
                          key={filing.id}
                          filing={filing}
                          isOverdue={isOverdue(filing)}
                          onStatusChange={updateFilingStatus}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const FilingRow = ({
  filing,
  isOverdue: overdue,
  onStatusChange,
}: {
  filing: ComplianceFiling;
  isOverdue: boolean;
  onStatusChange: (id: string, status: string) => void;
}) => {
  const effectiveStatus = overdue ? "overdue" : filing.status;
  const config = statusConfig[effectiveStatus] || statusConfig.pending;
  const StatusIcon = config.icon;
  const catConfig = categoryConfig[filing.category] || categoryConfig.compliance;
  const CatIcon = catConfig.icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <StatusIcon className={`h-4 w-4 flex-shrink-0 ${overdue ? "text-destructive" : filing.status === "completed" ? "text-accent" : "text-muted-foreground"}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground truncate">{filing.filing_name}</p>
            {filing.recurring && (
              <RefreshCw className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{filing.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
        <Badge className={`text-[9px] px-1.5 py-0 ${config.color}`}>{config.label}</Badge>
        <Badge className={`text-[9px] px-1.5 py-0 ${priorityConfig[filing.priority] || priorityConfig.medium}`}>
          {filing.priority}
        </Badge>
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-1">
          <CatIcon className="h-2.5 w-2.5" />
          {catConfig.label}
        </Badge>
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-1">
          {filing.method === "api" ? <Bot className="h-2.5 w-2.5" /> : <Hand className="h-2.5 w-2.5" />}
          {filing.method === "api" ? filing.agent_name || "API" : "Manual"}
        </Badge>
        {filing.due_date && (
          <span className={`text-[10px] ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
            <Calendar className="h-2.5 w-2.5 inline mr-0.5" />
            {format(new Date(filing.due_date), "MMM d")}
          </span>
        )}

        {filing.status !== "completed" && filing.status !== "not_required" && (
          <Select
            value={filing.status}
            onValueChange={(val) => onStatusChange(filing.id, val)}
          >
            <SelectTrigger className="h-6 w-[100px] text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="not_required">N/A</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
  destructive,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent?: boolean;
  destructive?: boolean;
}) => (
  <Card>
    <CardContent className="p-3 text-center">
      <Icon className={`h-4 w-4 mx-auto mb-1 ${destructive ? "text-destructive" : accent ? "text-accent" : "text-muted-foreground"}`} />
      <p className={`text-xl font-bold ${destructive ? "text-destructive" : accent ? "text-accent" : "text-foreground"}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </CardContent>
  </Card>
);

export default AdminComplianceTracker;
