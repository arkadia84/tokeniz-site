import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Search, CheckCircle2, Circle, ExternalLink } from "lucide-react";

const stats = [
  { label: "Total Potential", value: "$250,000" },
  { label: "Eligible", value: "2" },
  { label: "Under Review", value: "2" },
  { label: "Applied", value: "0" },
];

const grants = [
  { name: "Ethereum Foundation Grant", org: "Ethereum Foundation", amount: "Up to $50,000", match: 85, status: "eligible" as const, deadline: "Apr 30, 2026" },
  { name: "Solana Ecosystem Fund", org: "Solana Foundation", amount: "Up to $100,000", match: 72, status: "eligible" as const, deadline: "May 15, 2026" },
  { name: "Web3 Builders Program", org: "Polygon Labs", amount: "Up to $25,000", match: 60, status: "review" as const, deadline: "Jun 01, 2026" },
  { name: "DeFi Innovation Grant", org: "Aave Grants DAO", amount: "Up to $75,000", match: 45, status: "review" as const, deadline: "Jul 15, 2026" },
];

const DashboardGrants = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Grants</h1>
        <p className="text-sm text-muted-foreground">Discover and apply to ecosystem grants</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
        <Search className="h-4 w-4" /> Discover Grants
      </button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-foreground">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Grant List */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          Matching Grants
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {grants.map((g, i) => (
          <div key={i} className="p-4 rounded-lg bg-secondary space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{g.name}</p>
                  <Badge
                    variant={g.status === "eligible" ? "default" : "secondary"}
                    className={
                      g.status === "eligible"
                        ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 text-[10px]"
                        : "text-[10px]"
                    }
                  >
                    {g.status === "eligible" ? "Eligible" : "Under Review"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{g.org} · {g.amount}</p>
              </div>
              <button className="text-primary hover:underline text-sm flex items-center gap-1">
                Apply <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-muted-foreground">Match</span>
                <Progress value={g.match} className="h-1.5 flex-1" />
                <span className="text-xs font-medium text-foreground w-8 text-right">{g.match}%</span>
              </div>
              <span className="text-xs text-muted-foreground">Deadline: {g.deadline}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default DashboardGrants;
