import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Company {
  id: string;
  company_name: string;
  series_name: string | null;
  master_llc_name: string | null;
  company_type: string | null;
  jurisdiction: string | null;
  formation_status: string | null;
  formation_type: string | null;
  ein_status: string | null;
  banking_status: string | null;
  banking_provider: string | null;
  banking_account_id: string | null;
  wallet_address: string | null;
  nft_id: string | null;
  ipfs_hash: string | null;
  ipfs_hash_oa: string | null;
  ipfs_hash_aoo: string | null;
  wyoming_filing_id: string | null;
  stripe_customer_id: string | null;
  plan: string | null;
  created_at: string;
  nft_explorer_url: string | null;
  smart_contract_address: string | null;
  archived_at: string | null;
  revocation_status: string | null;
  enabled_services: string[] | null;
}

interface ActiveOrgContextValue {
  companies: Company[];
  activeCompany: Company | null;
  setActiveCompanyId: (id: string) => void;
  refreshCompanies: () => Promise<void>;
  loading: boolean;
}

const ActiveOrgContext = createContext<ActiveOrgContextValue>({
  companies: [],
  activeCompany: null,
  setActiveCompanyId: () => {},
  refreshCompanies: async () => {},
  loading: true,
});

export const useActiveOrg = () => useContext(ActiveOrgContext);

export const ActiveOrgProvider = ({ children }: { children: React.ReactNode }) => {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => {
    return localStorage.getItem("activeCompanyId");
  });
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setAllCompanies([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("companies")
      .select("id, company_name, series_name, master_llc_name, company_type, jurisdiction, formation_status, formation_type, ein_status, banking_status, banking_provider, banking_account_id, wallet_address, nft_id, ipfs_hash, ipfs_hash_oa, ipfs_hash_aoo, wyoming_filing_id, stripe_customer_id, plan, created_at, nft_explorer_url, smart_contract_address, archived_at, revocation_status, enabled_services")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true });

    const list = (data || []) as unknown as Company[];
    setAllCompanies(list);

    // Filter out archived for active selection
    const activeList = list.filter((c) => !c.archived_at);

    if (activeList.length > 0 && (!activeId || !activeList.find((c) => c.id === activeId))) {
      const firstId = activeList[0].id;
      setActiveId(firstId);
      localStorage.setItem("activeCompanyId", firstId);
    }
    setLoading(false);
  }, [activeId]);

  useEffect(() => {
    fetchCompanies();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCompanies();
    });
    return () => subscription.unsubscribe();
  }, [fetchCompanies]);

  const setActiveCompanyId = (id: string) => {
    setActiveId(id);
    localStorage.setItem("activeCompanyId", id);
  };

  // Only show non-archived companies to users
  const companies = allCompanies.filter((c) => !c.archived_at);
  const activeCompany = companies.find((c) => c.id === activeId) || companies[0] || null;

  return (
    <ActiveOrgContext.Provider
      value={{ companies, activeCompany, setActiveCompanyId, refreshCompanies: fetchCompanies, loading }}
    >
      {children}
    </ActiveOrgContext.Provider>
  );
};
