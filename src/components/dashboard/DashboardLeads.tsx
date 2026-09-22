import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, UserPlus, Filter } from "lucide-react";

const pipelineStages = [
  { stage: "Prospect", count: 12, value: "$180,000" },
  { stage: "Qualified", count: 5, value: "$95,000" },
  { stage: "Proposal", count: 3, value: "$72,000" },
  { stage: "Negotiation", count: 1, value: "$40,000" },
];

const recentLeads = [
  { name: "Sarah Chen", company: "Web3 Ventures", stage: "Qualified", value: "$25,000", lastActivity: "2 hours ago" },
  { name: "Marcus Johnson", company: "DeFi Capital", stage: "Proposal", value: "$50,000", lastActivity: "1 day ago" },
  { name: "Elena Petrova", company: "Blockchain Labs", stage: "Prospect", value: "$15,000", lastActivity: "3 days ago" },
  { name: "James Wright", company: "Crypto Partners", stage: "Negotiation", value: "$40,000", lastActivity: "5 hours ago" },
];

const stageBadge = (stage: string) => {
  const map: Record<string, string> = {
    Prospect: "text-muted-foreground",
    Qualified: "text-primary bg-primary/10 border-primary/20",
    Proposal: "text-warning bg-warning/10 border-warning/20",
    Negotiation: "text-accent bg-accent/10 border-accent/20",
  };
  return <Badge variant="outline" className={`text-[10px] ${map[stage] || ""}`}>{stage}</Badge>;
};

const DashboardLeads = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Leads & Opportunities</h1>
        <p className="text-sm text-muted-foreground">Track your sales pipeline and deals</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
        <UserPlus className="h-4 w-4" /> Add Lead
      </button>
    </div>

    {/* Pipeline Summary */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {pipelineStages.map((s) => (
        <Card key={s.stage}>
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">{s.stage}</p>
            <p className="text-2xl font-semibold text-foreground">{s.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.value} potential</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Pipeline Value */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Pipeline Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pipelineStages.map((s) => (
          <div key={s.stage} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">{s.stage}</span>
              <span className="text-muted-foreground">{s.count} deals · {s.value}</span>
            </div>
            <Progress value={(s.count / 12) * 100} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Recent Leads */}
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Recent Leads
          </CardTitle>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentLeads.map((l, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
            <div>
              <p className="text-sm font-medium text-foreground">{l.name}</p>
              <p className="text-xs text-muted-foreground">{l.company} · {l.lastActivity}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">{l.value}</span>
              {stageBadge(l.stage)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default DashboardLeads;
