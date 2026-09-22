import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Landmark,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  ArrowRightLeft,
  Clock,
  Bitcoin,
} from "lucide-react";
import { FIAT_BALANCE, CRYPTO_BALANCE, BTC_EQUIVALENT, fmt, fmtBtc } from "@/lib/balances";

const recentTransactions = [
  { description: "Wire from Acme Corp", amount: "+$2,500.00", date: "Mar 10, 2026", type: "inflow" as const },
  { description: "Subscription — AWS", amount: "-$149.00", date: "Mar 08, 2026", type: "outflow" as const },
  { description: "USDC Deposit", amount: "+$5,000.00", date: "Mar 05, 2026", type: "inflow" as const },
  { description: "Contractor Payment", amount: "-$1,200.00", date: "Mar 03, 2026", type: "outflow" as const },
];

const DashboardBanking = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl font-semibold text-foreground">Banking</h1>
      <p className="text-sm text-muted-foreground">Manage your fiat and crypto accounts</p>
    </div>

    {/* BTC banner */}
    <Card className="bg-gradient-to-r from-warning/5 to-warning/10 border-warning/20">
      <CardContent className="pt-4 pb-3 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="animate-spin-slow" style={{ perspective: "100px" }}>
            <Bitcoin className="h-8 w-8 text-warning" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Portfolio in equivalent BTC</p>
            <p className="text-xl font-semibold text-foreground">₿ {fmtBtc(BTC_EQUIVALENT)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Combined</p>
          <p className="text-sm font-semibold text-foreground">${fmt(FIAT_BALANCE + CRYPTO_BALANCE)}</p>
        </div>
      </CardContent>
    </Card>

    {/* Balances */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center gap-2 mb-3">
            <Landmark className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">USD Account</span>
          </div>
          <p className="text-3xl font-semibold text-foreground">${fmt(FIAT_BALANCE)}</p>
          <div className="mt-2 text-xs text-muted-foreground">Account ****4821 · Routing 021000021</div>
          <div className="flex gap-3 mt-4">
            <button className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
              <ArrowDownLeft className="h-4 w-4" /> Add Money
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium hover:underline">
              <ArrowUpRight className="h-4 w-4" /> Send
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">USDC Wallet</span>
          </div>
          <p className="text-3xl font-semibold text-foreground">${fmt(CRYPTO_BALANCE)}</p>
          <div className="mt-2 text-xs text-muted-foreground">Solana · On-chain</div>
          <div className="flex gap-3 mt-4">
            <button className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
              <ArrowDownLeft className="h-4 w-4" /> Receive
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium hover:underline">
              <ArrowRightLeft className="h-4 w-4" /> Swap
            </button>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Card Management */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          Card Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
          <div>
            <p className="text-sm font-medium text-foreground">Business Debit Card</p>
            <p className="text-xs text-muted-foreground">Visa · ****7832</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">$0.00 / $500.00</p>
            <p className="text-xs text-muted-foreground">Monthly limit</p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Recent Transactions */}
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Recent Transactions
          </CardTitle>
          <span className="text-sm text-primary font-medium cursor-pointer hover:underline">View All</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentTransactions.map((tx, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
            <div>
              <p className="text-sm font-medium text-foreground">{tx.description}</p>
              <p className="text-xs text-muted-foreground">{tx.date}</p>
            </div>
            <span className={`text-sm font-semibold ${tx.type === "inflow" ? "text-accent" : "text-foreground"}`}>
              {tx.amount}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default DashboardBanking;
