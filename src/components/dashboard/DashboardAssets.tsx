import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gem, FileText, Coins, Image, ArrowUpRight, Tag, Plus, Home, Wheat, Bitcoin } from "lucide-react";

interface Asset {
  name: string;
  type: "NFT" | "Token" | "IP" | "Domain" | "Deed" | "Real Estate" | "Commodity" | "Crypto";
  image: string;
  value: string;
  chain?: string;
  quantity?: string;
  description: string;
}

const assets: Asset[] = [
  { name: "NomadLabs Genesis #001", type: "NFT", image: "🖼️", value: "$1,200", chain: "Solana", description: "Founding membership NFT" },
  { name: "NomadLabs Genesis #002", type: "NFT", image: "🎨", value: "$950", chain: "Solana", description: "Founding membership NFT" },
  { name: "NOMAD Token", type: "Token", image: "🪙", value: "$0.00", chain: "Solana", quantity: "1,000,000", description: "Governance & utility token" },
  { name: "USDC", type: "Token", image: "💵", value: "$0.00", chain: "Solana", quantity: "0", description: "Circle USD stablecoin" },
  { name: "Bitcoin", type: "Crypto", image: "₿", value: "$0.00", chain: "Bitcoin", quantity: "0", description: "BTC holdings" },
  { name: "Miami Studio Apt #4B", type: "Real Estate", image: "🏢", value: "$285,000", description: "Tokenized deed — Miami-Dade, FL" },
  { name: "Wyoming Ranch Parcel", type: "Real Estate", image: "🏡", value: "$120,000", description: "Tokenized deed — Sheridan County, WY" },
  { name: "Commercial Lease — Unit 12", type: "Deed", image: "📜", value: "$45,000", description: "Tokenized lease contract — Austin, TX" },
  { name: "Gold (PAXG)", type: "Commodity", image: "🥇", value: "$0.00", chain: "Ethereum", quantity: "0", description: "Tokenized gold — Paxos" },
  { name: "Oil Futures Token", type: "Commodity", image: "🛢️", value: "$0.00", chain: "Ethereum", quantity: "0", description: "Tokenized crude oil futures" },
  { name: "NomadLabs™ Trademark", type: "IP", image: "™️", value: "—", description: "Registered trademark — USPTO" },
  { name: "Operating Agreement", type: "IP", image: "📄", value: "—", description: "Series LLC legal document" },
  { name: "nomadlabs.co", type: "Domain", image: "🌐", value: "$120/yr", description: "Primary domain name" },
  { name: "Brand Kit & Logo", type: "IP", image: "🎯", value: "—", description: "Logo, colors & brand guidelines" },
];

const typeIcon = (type: Asset["type"]) => {
  switch (type) {
    case "NFT": return <Image className="h-3.5 w-3.5" />;
    case "Token": return <Coins className="h-3.5 w-3.5" />;
    case "Crypto": return <Bitcoin className="h-3.5 w-3.5" />;
    case "IP": return <FileText className="h-3.5 w-3.5" />;
    case "Domain": return <Gem className="h-3.5 w-3.5" />;
    case "Real Estate": return <Home className="h-3.5 w-3.5" />;
    case "Deed": return <FileText className="h-3.5 w-3.5" />;
    case "Commodity": return <Wheat className="h-3.5 w-3.5" />;
  }
};

const typeBadgeClass = (type: Asset["type"]) => {
  switch (type) {
    case "NFT": return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10";
    case "Token": return "bg-accent/10 text-accent border-accent/20 hover:bg-accent/10";
    case "Crypto": return "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10";
    case "IP": return "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10";
    case "Domain": return "bg-muted text-muted-foreground";
    case "Real Estate": return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10";
    case "Deed": return "bg-accent/10 text-accent border-accent/20 hover:bg-accent/10";
    case "Commodity": return "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10";
  }
};

const DashboardAssets = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
      <h1 className="text-xl font-semibold text-foreground">RWA</h1>
      <p className="text-sm text-muted-foreground">Real World Assets — digital & non-digital assets owned by your company</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
        <Plus className="h-4 w-4" /> Add Asset
      </button>
    </div>

    {/* Summary */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "NFTs", count: assets.filter(a => a.type === "NFT").length },
        { label: "Tokens", count: assets.filter(a => a.type === "Token").length },
        { label: "IP & Legal", count: assets.filter(a => a.type === "IP").length },
        { label: "Domains", count: assets.filter(a => a.type === "Domain").length },
      ].map((s) => (
        <Card key={s.label}>
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-foreground">{s.count}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Asset Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset, i) => (
        <Card key={i} className="overflow-hidden group hover:shadow-md transition-shadow">
          {/* Visual / Emoji placeholder */}
          <div className="h-36 bg-secondary flex items-center justify-center text-5xl select-none">
            {asset.image}
          </div>

          <CardContent className="pt-4 pb-4 px-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`text-[10px] gap-1 ${typeBadgeClass(asset.type)}`}>
                {typeIcon(asset.type)} {asset.type}
              </Badge>
              {asset.chain && (
                <span className="text-[10px] text-muted-foreground">{asset.chain}</span>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">{asset.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{asset.description}</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">{asset.value}</p>
                {asset.quantity && (
                  <p className="text-[10px] text-muted-foreground">{asset.quantity} units</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                <ArrowUpRight className="h-3.5 w-3.5" /> Send
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-foreground text-xs font-medium hover:bg-secondary transition-colors">
                <Tag className="h-3.5 w-3.5" /> Sell
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default DashboardAssets;
