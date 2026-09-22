import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, CheckCircle2, Clock, AlertTriangle, Bot, Hand,
  Calendar, RefreshCw, Building2, FileText, Landmark, Zap
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface Filing {
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
  priority: string;
  recurring: boolean;
  recurrence_interval: string | null;
}

interface Company {
  id: string;
  company_name: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  completed: { color: "bg-accent/10 text-accent border-0", icon: CheckCircle2, label: "Done" },
  in_progress: { color: "bg-warning/10 text-warning border-0", icon: Clock, label: "In Progress" },
  pending: { color: "bg-muted text-muted-foreground border-0", icon: Clock, label: "Pending" },
  overdue: { color: "bg-destructive/10 text-destructive border-0", icon: AlertTriangle, label: "Overdue" },
  not_required: { color: "bg-muted/50 text-muted-foreground/60 border-0", icon: CheckCircle2, label: "N/A" },
};

const categoryIcons: Record<string, React.ElementType> = {
  formation: Building2,
  tax: FileText,
  compliance: ShieldCheck,
  banking: Landmark,
};

const DashboardCompliance = () => {
  const [filings, setFilings] = useState<Filing[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [companiesRes, filingsRes] = await Promise.all([
      supabase.from("companies").select("id, company_name").eq("user_id", user.id),
      supabase.from("compliance_filings").select("*"),
    ]);

    setCompanies(companiesRes.data || []);
    setFilings((filingsRes.data as unknown as Filing[]) || []);
    setLoading(false);
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading compliance data…</p>;
  }

  const totalFilings = filings.length;
  const completedFilings = filings.filter((f) => f.status === "completed").length;
  const completionRate = totalFilings > 0 ? Math.round((completedFilings / totalFilings) * 100) : 0;

  const actionItems = filings.filter(
    (f) => f.status !== "completed" && f.status !== "not_required"
  ).sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const overdueItems = actionItems.filter(
    (f) => f.due_date && new Date(f.due_date) < new Date()
  );

  const getCompanyName = (companyId: string) =>
    companies.find((c) => c.id === companyId)?.company_name || "Unknown";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Compliance Tracker</h2>
        <p className="text-sm text-muted-foreground">Track filings, registrations, and regulatory obligations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={FileText} label="Total Filings" value={totalFilings} />
        <SummaryCard icon={CheckCircle2} label="Completed" value={completedFilings} accent />
        <SummaryCard icon={Clock} label="Action Items" value={actionItems.length} />
        <SummaryCard icon={AlertTriangle} label="Overdue" value={overdueItems.length} destructive={overdueItems.length > 0} />
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Overall Compliance</p>
            <span className="text-sm font-bold text-foreground">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </CardContent>
      </Card>

      {/* Action Items */}
      {actionItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" /> Action Required ({actionItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {actionItems.map((filing) => {
              const isOverdue = filing.due_date && new Date(filing.due_date) < new Date();
              const effectiveStatus = isOverdue ? "overdue" : filing.status;
              const config = statusConfig[effectiveStatus] || statusConfig.pending;
              const StatusIcon = config.icon;
              const CatIcon = categoryIcons[filing.category] || ShieldCheck;

              return (
                <div
                  key={filing.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isOverdue ? "bg-destructive/5 border border-destructive/20" : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <StatusIcon className={`h-4 w-4 flex-shrink-0 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{filing.filing_name}</p>
                        {filing.recurring && <RefreshCw className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {getCompanyName(filing.company_id)} • {filing.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`text-[9px] px-1.5 py-0 ${config.color}`}>{config.label}</Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-1">
                      {filing.method === "api" ? <Bot className="h-2.5 w-2.5" /> : <Hand className="h-2.5 w-2.5" />}
                      {filing.method === "api" ? "Auto" : "Manual"}
                    </Badge>
                    {filing.due_date && (
                      <span className={`text-[10px] flex items-center gap-0.5 ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        <Calendar className="h-2.5 w-2.5" />
                        {format(new Date(filing.due_date), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* All Filings by Company */}
      {companies.map((company) => {
        const companyFilings = filings.filter((f) => f.company_id === company.id);
        if (companyFilings.length === 0) return null;

        const completed = companyFilings.filter((f) => f.status === "completed").length;
        const progress = Math.round((completed / companyFilings.length) * 100);

        return (
          <Card key={company.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> {company.company_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="w-20 h-1.5" />
                  <span className="text-xs font-medium text-foreground">{progress}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {companyFilings.map((filing) => {
                  const config = statusConfig[filing.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <div key={filing.id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-3.5 w-3.5 ${filing.status === "completed" ? "text-accent" : "text-muted-foreground"}`} />
                        <span className={`text-sm ${filing.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {filing.filing_name}
                        </span>
                      </div>
                      <Badge className={`text-[9px] px-1.5 py-0 ${config.color}`}>{config.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {filings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No compliance filings yet.</p>
            <p className="text-xs text-muted-foreground">Filings will appear here once your company formation begins.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  accent,
  destructive,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
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

export default DashboardCompliance;
