import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const summaryCards = [
  { label: "Total Outstanding", value: "$8,500.00", icon: Clock },
  { label: "Paid (This Month)", value: "$2,500.00", icon: CheckCircle2 },
  { label: "Overdue", value: "$4,800.00", icon: AlertCircle },
];

const invoices = [
  { id: "INV-001", client: "Acme Corp", amount: "$2,500.00", date: "Mar 01, 2026", due: "Mar 15, 2026", status: "paid" as const },
  { id: "INV-002", client: "Globex Inc", amount: "$1,200.00", date: "Mar 05, 2026", due: "Mar 22, 2026", status: "pending" as const },
  { id: "INV-003", client: "Initech LLC", amount: "$4,800.00", date: "Feb 15, 2026", due: "Mar 01, 2026", status: "overdue" as const },
  { id: "INV-004", client: "Wayne Enterprises", amount: "$3,200.00", date: "Mar 10, 2026", due: "Apr 10, 2026", status: "draft" as const },
];

const statusBadge = (status: string) => {
  const map: Record<string, { variant: "default" | "outline" | "secondary" | "destructive"; label: string }> = {
    paid: { variant: "default", label: "Paid" },
    pending: { variant: "outline", label: "Pending" },
    overdue: { variant: "destructive", label: "Overdue" },
    draft: { variant: "secondary", label: "Draft" },
  };
  const s = map[status] || map.draft;
  return <Badge variant={s.variant} className={`text-[10px] ${status === "paid" ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10" : ""}`}>{s.label}</Badge>;
};

const DashboardInvoices = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Invoices</h1>
        <p className="text-sm text-muted-foreground">Create and manage invoices</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
        <Plus className="h-4 w-4" /> New Invoice
      </button>
    </div>

    {/* Summary */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

    {/* Invoice List */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          All Invoices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {invoices.map((inv) => (
          <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-secondary">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-muted-foreground">{inv.id}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{inv.client}</p>
                <p className="text-xs text-muted-foreground">Issued {inv.date} · Due {inv.due}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">{inv.amount}</span>
              {statusBadge(inv.status)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default DashboardInvoices;
