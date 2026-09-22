import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  ShieldCheck,
  Users,
  CheckCircle2,
  MapPin,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import { useActiveOrg } from "@/contexts/ActiveOrgContext";

const PINATA_GW = "https://gateway.pinata.cloud/ipfs/";

/* Static fallback document URLs */
const STATIC_DOCS = {
  series_oa: "/docs/Series_Operating_Agreement.docx",
  master_oa: "/docs/Master_Operating_Agreement.docx",
  articles: "/docs/Articles_of_Organization.pdf",
};

const DashboardOrganization = () => {
  const { activeCompany } = useActiveOrg();

  const shortName = activeCompany?.series_name || activeCompany?.company_name || "Your Company";
  const fullName = activeCompany?.company_name || "Your Company";
  const masterLLC = activeCompany?.master_llc_name || "Tokenizio RWA LLC";
  const jurisdiction = activeCompany?.jurisdiction || "Wyoming, USA";
  const seriesNumber = (activeCompany as any)?.series_number ?? null;

  const openDoc = (ipfsHash: string | null | undefined, fallback: string) => {
    if (ipfsHash) {
      window.open(`${PINATA_GW}${ipfsHash}`, "_blank", "noopener");
    } else {
      window.open(fallback, "_blank", "noopener");
    }
  };

  const documents = [
    {
      name: "Series Operating Agreement",
      status: activeCompany?.ipfs_hash_oa ? "Signed" : "Pending",
      hash: activeCompany?.ipfs_hash_oa,
      fallback: STATIC_DOCS.series_oa,
    },
    {
      name: "Master Operating Agreement",
      status: activeCompany?.ipfs_hash_aoo ? "Filed" : "Pending",
      hash: activeCompany?.ipfs_hash_aoo,
      fallback: STATIC_DOCS.master_oa,
    },
    {
      name: "Articles of Organization",
      status: activeCompany?.ipfs_hash ? "Filed" : "Pending",
      hash: activeCompany?.ipfs_hash,
      fallback: STATIC_DOCS.articles,
    },
    {
      name: "EIN Confirmation (SS-4)",
      status: activeCompany?.ein_status === "completed" || activeCompany?.ein_status === "approved" ? "Received" : "Pending",
      hash: null,
      fallback: "",
    },
  ];

  const members = [
    { name: shortName, role: "Founder & Sole Member", ownership: "100%", initials: shortName.charAt(0).toUpperCase() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Organization</h1>
        <p className="text-sm text-muted-foreground">Company details, documents & compliance</p>
      </div>

      {/* Company Info */}
      <Card>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{fullName}</p>
              <p className="text-sm text-muted-foreground">Series of {masterLLC}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {jurisdiction}</span>
                {activeCompany?.ein_status === "completed" && (
                  <span>EIN: 88-XXXXXXX</span>
                )}
                {seriesNumber && <span>Series #{seriesNumber}</span>}
              </div>
            </div>
          </div>

          {/* Address & Agent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Registered Address</p>
              <p className="text-sm text-foreground">30 N Gould St Ste R, Sheridan, WY 82801</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Registered Agent</p>
              <p className="text-sm text-foreground flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                Registered Agent Inc
              </p>
            </div>
          </div>

          {/* Wallet & NFT */}
          {(activeCompany?.wallet_address || activeCompany?.nft_explorer_url) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
              {activeCompany.wallet_address && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Wallet</p>
                  <p className="text-sm font-mono text-foreground">
                    {activeCompany.wallet_address.slice(0, 6)}…{activeCompany.wallet_address.slice(-4)}
                  </p>
                </div>
              )}
              {activeCompany.nft_explorer_url && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Membership NFT</p>
                  <a
                    href={activeCompany.nft_explorer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View on Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Legal Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <p className="text-sm font-medium text-foreground">{d.name}</p>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-[10px] ${
                      d.status === "Pending"
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
                    }`}
                  >
                    {d.status}
                  </Badge>
                  {(d.hash || d.fallback) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] px-2 border-2"
                      onClick={() => openDoc(d.hash, d.fallback)}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{m.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">{m.ownership}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Compliance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { item: "Registered Agent", status: "Active", due: "Ongoing" },
            { item: "Annual Report — Wyoming", status: "Not Due", due: "May 2027" },
            { item: "Franchise Tax", status: "Not Due", due: "2027" },
          ].map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">{c.item}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Due: {c.due}</span>
                <Badge variant="outline" className="text-[10px] border-2">{c.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOrganization;
