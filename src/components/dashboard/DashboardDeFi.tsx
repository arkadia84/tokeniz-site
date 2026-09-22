import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  Landmark,
  ArrowRightLeft,
  TrendingUp,
  ShieldCheck,
  Wallet,
  PiggyBank,
} from "lucide-react";

const DashboardDeFi = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl font-semibold text-foreground">DeFi</h1>
      <p className="text-sm text-muted-foreground">Decentralized finance — raise capital, lend, borrow & earn yield</p>
    </div>

    {/* Raising */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Raising</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Raise capital by issuing tokens or borrowing against your assets.
        </p>
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Coins className="h-4 w-4" /> Issue Tokens
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors">
            <Landmark className="h-4 w-4" /> Borrow
          </button>
        </div>
      </CardContent>
    </Card>

    {/* Yield & Staking */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-primary" />
            Yield Farming
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { pool: "USDC Lending Pool", apy: "4.2%", deposited: "$0.00", protocol: "Aave" },
            { pool: "SOL Staking", apy: "7.1%", deposited: "$0.00", protocol: "Marinade" },
            { pool: "ETH/USDC LP", apy: "12.5%", deposited: "$0.00", protocol: "Uniswap" },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
              <div>
                <p className="text-sm font-medium text-foreground">{p.pool}</p>
                <p className="text-xs text-muted-foreground">{p.protocol}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-accent">{p.apy} APY</p>
                <p className="text-xs text-muted-foreground">{p.deposited} deposited</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            Swap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">From</span>
              <span className="text-xs text-muted-foreground">Balance: $0.00</span>
            </div>
            <div className="flex items-center justify-between">
              <input type="text" placeholder="0.00" className="bg-transparent text-lg font-semibold text-foreground outline-none w-24" readOnly />
              <Badge variant="outline" className="text-xs">USDC</Badge>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-secondary space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">To</span>
              <span className="text-xs text-muted-foreground">Balance: $0.00</span>
            </div>
            <div className="flex items-center justify-between">
              <input type="text" placeholder="0.00" className="bg-transparent text-lg font-semibold text-foreground outline-none w-24" readOnly />
              <Badge variant="outline" className="text-xs">SOL</Badge>
            </div>
          </div>
          <button className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Swap
          </button>
        </CardContent>
      </Card>
    </div>

    {/* Lending & Borrowing Positions */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Active Positions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          No active DeFi positions. Start by depositing into a yield pool or borrowing.
        </div>
      </CardContent>
    </Card>
  </div>
);

export default DashboardDeFi;
