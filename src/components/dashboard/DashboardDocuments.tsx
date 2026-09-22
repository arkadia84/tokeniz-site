import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, ExternalLink, Link2, Shield, Clock, Hexagon, Wallet } from "lucide-react";
import { useActiveOrg } from "@/contexts/ActiveOrgContext";

interface DocEntry {
  title: string;
  description: string;
  ipfsHash: string | null;
  ipfsPlaceholder: boolean;
}

const ipfsGatewayUrl = (hash: string) => `https://gateway.pinata.cloud/ipfs/${hash}`;

const DashboardDocuments = () => {
  const { activeCompany } = useActiveOrg();

  if (!activeCompany) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-foreground">Company Formation</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No company selected. Create a company first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const docs: DocEntry[] = [
    {
      title: "Series Operating Agreement",
      description: "Governs the rights, obligations, and assets of this Protected Series under the Master LLC.",
      ipfsHash: activeCompany.ipfs_hash_oa,
      ipfsPlaceholder: !activeCompany.ipfs_hash_oa || activeCompany.ipfs_hash_oa.startsWith("pending"),
    },
    {
      title: "Master Operating Agreement",
      description: "Governs the overall structure of Tokenizio RWA LLC and the creation of protected series.",
      ipfsHash: activeCompany.ipfs_hash_aoo,
      ipfsPlaceholder: !activeCompany.ipfs_hash_aoo || activeCompany.ipfs_hash_aoo.startsWith("pending"),
    },
    {
      title: "Articles of Organization",
      description: "Filed with the Wyoming Secretary of State. Reference copy generated at formation.",
      ipfsHash: activeCompany.ipfs_hash ?? null,
      ipfsPlaceholder: !activeCompany.ipfs_hash || activeCompany.ipfs_hash.startsWith("pending"),
    },
  ];

  const hasAnyIpfs = docs.some((d) => !d.ipfsPlaceholder);
  const formationDate = new Date(activeCompany.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const nftId = activeCompany.nft_id;
  const nftExplorerUrl = activeCompany.nft_explorer_url;
  const smartContractAddress = activeCompany.smart_contract_address;
  const walletAddress = activeCompany.wallet_address;
  const hasNft = !!nftId && !nftId.startsWith("pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Company Formation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Legal documents for {activeCompany.company_name}
        </p>
      </div>

      {/* Company summary card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-4 px-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Entity Type</p>
              <p className="font-medium text-foreground">Protected Series LLC</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Jurisdiction</p>
              <p className="font-medium text-foreground">Wyoming, USA</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Formed</p>
              <p className="font-medium text-foreground">{formationDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <Badge
                variant={activeCompany.formation_status === "complete" ? "default" : "outline"}
                className={
                  activeCompany.formation_status === "complete"
                    ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
                    : ""
                }
              >
                {activeCompany.formation_status === "complete" ? "Active" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT & Blockchain section */}
      {hasNft && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Hexagon className="h-4 w-4 text-primary" />
              Membership NFT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Token ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-foreground">{nftId}</span>
                  {nftExplorerUrl && (
                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => window.open(nftExplorerUrl, "_blank")}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              {smartContractAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contract</span>
                  <span className="font-mono text-xs text-foreground truncate max-w-[200px]" title={smartContractAddress}>
                    {smartContractAddress}
                  </span>
                </div>
              )}
              {walletAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Wallet className="h-3 w-3" /> Wallet
                  </span>
                  <span className="font-mono text-xs text-foreground truncate max-w-[200px]" title={walletAddress}>
                    {walletAddress}
                  </span>
                </div>
              )}
            </div>
            {nftId?.startsWith("demo") && (
              <p className="text-[11px] text-muted-foreground italic">
                Demo mode — NFT will be minted on Base mainnet when Thirdweb Engine is connected.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document cards */}
      <div className="space-y-4">
        {docs.map((doc) => {
          const available = !doc.ipfsPlaceholder && doc.ipfsHash;
          const gatewayUrl = doc.ipfsHash ? ipfsGatewayUrl(doc.ipfsHash) : null;
          return (
            <Card key={doc.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {doc.title}
                  </CardTitle>
                  {available ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 text-[10px]">
                      Generated
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{doc.description}</p>

                {available && gatewayUrl && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => window.open(gatewayUrl, "_blank")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5" asChild>
                        <a href={gatewayUrl} download>
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </Button>
                      <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Link2 className="h-3 w-3" />
                        <span className="font-mono truncate max-w-[120px]" title={doc.ipfsHash!}>
                          {doc.ipfsHash!.slice(0, 12)}…
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {!available && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Document will be generated after formation is complete.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* IPFS status banner */}
      <Card className="bg-muted/50">
        <CardContent className="py-4 px-5">
          <div className="flex items-start gap-3">
            <Link2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              {hasAnyIpfs ? (
                <>
                  <p className="text-sm font-medium text-foreground">On-Chain Storage Active</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formation documents are pinned to IPFS and linked to your membership NFT on the Base network. Document hashes are immutable and verifiable on-chain.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">On-Chain Storage (Pending)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Documents will be stored on IPFS and linked to your membership NFT on the Base network once formation is complete.
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardDocuments;
