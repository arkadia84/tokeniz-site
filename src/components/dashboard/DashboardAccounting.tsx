import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Calendar,
} from "lucide-react";

const summaryCards = [
  { label: "Revenue (YTD)", value: "$0.00", icon: TrendingUp, change: null },
  { label: "Expenses (YTD)", value: "$0.00", icon: TrendingDown, change: null },
  { label: "Net Income", value: "$0.00", icon: DollarSign, change: null },
  { label: "Outstanding", value: "$0.00", icon: Receipt, change: null },
];

const recentEntries = [
  { date: "Mar 10", description: "Client Payment — Acme Corp", category: "Revenue", amount: "+$2,500.00" },
  { date: "Mar 08", description: "AWS Hosting", category: "Operating Expense", amount: "-$149.00" },
  { date: "Mar 05", description: "Contractor — Design Work", category: "Operating Expense", amount: "-$1,200.00" },
  { date: "Mar 01", description: "State Filing Fee", category: "Legal & Compliance", amount: "-$50.00" },
];

const DashboardAccounting = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl font-semibold text-foreground">Accounting</h1>
      <p className="text-sm text-muted-foreground">Bookkeeping, tax prep & financial statements</p>
    </div>

    {/* Summary Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((c) => (
        <Card key={c.label}>
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center gap-2 mb-2">
              <c.icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Tax Calendar */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Upcoming Tax Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {[
          { name: "Quarterly Estimated Tax (Q1)", date: "Apr 15, 2026", status: "upcoming" },
          { name: "Annual Report — Wyoming", date: "May 01, 2026", status: "upcoming" },
          { name: "1099 Filing Deadline", date: "Jan 31, 2027", status: "future" },
        ].map((d, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
            <div>
              <p className="text-sm font-medium text-foreground">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.date}</p>
            </div>
            <Badge variant={d.status === "upcoming" ? "outline" : "secondary"} className="text-[10px]">
              {d.status === "upcoming" ? "Upcoming" : "Future"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Recent Journal Entries */}
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            Recent Entries
          </CardTitle>
          <span className="text-sm text-primary font-medium cursor-pointer hover:underline">View All</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentEntries.map((e, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
            <div>
              <p className="text-sm font-medium text-foreground">{e.description}</p>
              <p className="text-xs text-muted-foreground">{e.date} · {e.category}</p>
            </div>
            <span className={`text-sm font-semibold ${e.amount.startsWith("+") ? "text-accent" : "text-foreground"}`}>
              {e.amount}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default DashboardAccounting;
