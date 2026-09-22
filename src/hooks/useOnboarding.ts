import { useMemo, useCallback } from "react";
import { useActiveOrg, Company } from "@/contexts/ActiveOrgContext";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceStatus } from "@/components/onboarding/ServiceCard";

export type ServiceType = "formation" | "ein" | "crypto-bank" | "fiat-bank";

export interface ServiceState {
  type: ServiceType;
  status: ServiceStatus;
  progress: number;
}

function deriveStatus(field: string | null): { status: ServiceStatus; progress: number } {
  if (field === "complete" || field === "approved" || field === "active") return { status: "complete", progress: 100 };
  if (field === "in_progress" || field === "processing") return { status: "in-progress", progress: 50 };
  if (field === "pending" || field === "not_started") return { status: "pending", progress: 0 };
  return { status: "pending", progress: 0 };
}

export function useOnboarding() {
  const { activeCompany, refreshCompanies } = useActiveOrg();

  const services: ServiceState[] = useMemo(() => {
    if (!activeCompany) {
      return [
        { type: "formation", status: "pending", progress: 0 },
        { type: "ein", status: "locked", progress: 0 },
        { type: "crypto-bank", status: "locked", progress: 0 },
        { type: "fiat-bank", status: "locked", progress: 0 },
      ];
    }

    const formation = deriveStatus(activeCompany.formation_status);
    const formationComplete = formation.status === "complete";

    const ein = formationComplete
      ? deriveStatus(activeCompany.ein_status)
      : { status: "locked" as ServiceStatus, progress: 0 };

    // Crypto bank: complete if wallet_address exists
    const cryptoBank = formationComplete
      ? activeCompany.wallet_address
        ? { status: "complete" as ServiceStatus, progress: 100 }
        : { status: "pending" as ServiceStatus, progress: 0 }
      : { status: "locked" as ServiceStatus, progress: 0 };

    // Fiat bank: uses banking_status + banking_provider
    const fiatBank = formationComplete
      ? activeCompany.banking_account_id
        ? { status: "complete" as ServiceStatus, progress: 100 }
        : deriveStatus(activeCompany.banking_status)
      : { status: "locked" as ServiceStatus, progress: 0 };

    return [
      { type: "formation", ...formation },
      { type: "ein", ...ein },
      { type: "crypto-bank", ...cryptoBank },
      { type: "fiat-bank", ...fiatBank },
    ];
  }, [activeCompany]);

  const startService = useCallback(async (type: ServiceType) => {
    if (!activeCompany) return;

    // Crypto banking: generate a random USDC wallet address (placeholder for Privy MPC)
    if (type === "crypto-bank") {
      const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const walletAddress = `0x${randomHex}`;

      await supabase
        .from("companies")
        .update({ wallet_address: walletAddress })
        .eq("id", activeCompany.id);

      await refreshCompanies();
      return;
    }

    const fieldMap: Record<ServiceType, Record<string, string>> = {
      formation: { formation_status: "in_progress" },
      ein: { ein_status: "in_progress" },
      "crypto-bank": { banking_status: "in_progress" },
      "fiat-bank": { banking_status: "in_progress" },
    };

    await supabase
      .from("companies")
      .update(fieldMap[type])
      .eq("id", activeCompany.id);

    await refreshCompanies();
  }, [activeCompany, refreshCompanies]);

  const overallProgress = useMemo(() => {
    const completedCount = services.filter((s) => s.status === "complete").length;
    return Math.round((completedCount / services.length) * 100);
  }, [services]);

  const companyMeta = useMemo(() => {
    if (!activeCompany) return null;
    return {
      seriesName: activeCompany.series_name || activeCompany.company_name,
      masterLLC: activeCompany.master_llc_name || "Tokenizio RWA LLC",
      formationType: activeCompany.formation_type || "referral",
      nftId: activeCompany.nft_id,
      ipfsOA: activeCompany.ipfs_hash_oa,
      ipfsAOO: activeCompany.ipfs_hash_aoo,
      wyomingFilingId: activeCompany.wyoming_filing_id,
      bankingProvider: activeCompany.banking_provider,
      stripeCustomerId: activeCompany.stripe_customer_id,
    };
  }, [activeCompany]);

  return { services, startService, overallProgress, activeCompany, companyMeta };
}
