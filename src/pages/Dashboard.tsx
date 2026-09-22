import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useSearchParams, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import DashboardHome from "@/components/dashboard/DashboardHome";
import DashboardDocuments from "@/components/dashboard/DashboardDocuments";
import DashboardBanking from "@/components/dashboard/DashboardBanking";
import DashboardAccounting from "@/components/dashboard/DashboardAccounting";

import DashboardInvoices from "@/components/dashboard/DashboardInvoices";
import DashboardGrants from "@/components/dashboard/DashboardGrants";
import DashboardAssets from "@/components/dashboard/DashboardAssets";
import DashboardDeFi from "@/components/dashboard/DashboardDeFi";
import DashboardCompliance from "@/components/dashboard/DashboardCompliance";
import DashboardOrganization from "@/components/dashboard/DashboardOrganization";
import FormationDialog from "@/components/onboarding/FormationDialog";
import { useActiveOrg } from "@/contexts/ActiveOrgContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building2, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import BankingOnboardingDialog from "@/components/onboarding/BankingOnboardingDialog";
import confetti from "canvas-confetti";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshCompanies, companies } = useActiveOrg();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [completingFormation, setCompletingFormation] = useState(false);
  const isBankingFlow = searchParams.get("flow") === "banking" || sessionStorage.getItem("onboarding_intent") === "banking";
  const [showFormation, setShowFormation] = useState(false);
  const [bankingOpen, setBankingOpen] = useState(false);

  // Resolve onboarding intent on mount
  useEffect(() => {
    if (isBankingFlow) {
      setShowFormation(false);
      setBankingOpen(true);
      sessionStorage.removeItem("onboarding_intent");
    } else if (companies.length === 0) {
      const storedIntent = sessionStorage.getItem("onboarding_intent");
      if (storedIntent === "banking") {
        setShowFormation(false);
        setBankingOpen(true);
      } else {
        setShowFormation(true);
      }
      sessionStorage.removeItem("onboarding_intent");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear the flow param after reading it
  useEffect(() => {
    if (searchParams.get("flow") === "banking") {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("flow");
      setSearchParams(newParams, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const completeFormation = useCallback(async (sessionId: string) => {
    setCompletingFormation(true);
    try {
      const { data, error } = await supabase.functions.invoke("complete-formation", {
        body: { session_id: sessionId },
      });
      if (error) throw new Error(error.message || "Formation completion failed");
      if (data?.error) throw new Error(data.error);

      await refreshCompanies();

      // 🎉 Confetti!
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } }), 300);

      toast({
        title: "🎉 Company Created!",
        description: data?.already_existed
          ? "Your company was already set up."
          : "Your Series LLC has been formed, NFT minted, and documents stored on IPFS.",
      });
      navigate("/dashboard/organization", { replace: true });
    } catch (err: any) {
      toast({
        title: "Formation Error",
        description: err.message || "Something went wrong completing your formation.",
        variant: "destructive",
      });
    } finally {
      setCompletingFormation(false);
    }
  }, [refreshCompanies, toast, navigate]);

  useEffect(() => {
    const formation = searchParams.get("formation");
    const sessionId = searchParams.get("session_id");
    if (formation === "success" && sessionId) {
      setSearchParams({}, { replace: true });
      completeFormation(sessionId);
    } else if (formation === "cancelled") {
      setSearchParams({}, { replace: true });
      toast({ title: "Payment Cancelled", description: "You can try again anytime." });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-3" />
              <span className="text-sm text-muted-foreground">Dashboard</span>
            </div>
            <DashboardTopBar />
          </header>

          <main className="flex-1 p-4 sm:p-6 max-w-5xl overflow-y-auto relative">
            {completingFormation && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">Creating your company…</p>
                    <p className="text-sm text-muted-foreground mt-1">Minting NFT, generating documents, and storing on IPFS.</p>
                  </div>
                </div>
              </div>
            )}
            {companies.length === 0 && !completingFormation && !showFormation ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-8">
                <div className="space-y-2 max-w-lg">
                  <h2 className="text-2xl font-bold text-foreground">Get Started</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose how you'd like to begin. Create a new company or open a banking account for an existing one.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl">
                  {/* Card 1: Start Fresh */}
                  <Card className="hover:border-primary/50 transition-all cursor-pointer" onClick={() => { sessionStorage.removeItem("onboarding_intent"); setShowFormation(true); }}>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Start Fresh</h3>
                      <p className="text-sm text-muted-foreground mb-6 flex-1">
                        Register a US entity and open your global spend account. Includes Wyoming Series LLC, Visa card & USDC account.
                      </p>
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                        onClick={(e) => { e.stopPropagation(); sessionStorage.removeItem("onboarding_intent"); setShowFormation(true); }}
                      >
                        Get started
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Card 2: Already Incorporated */}
                  <Card className="hover:border-primary/30 transition-all cursor-pointer relative" onClick={() => { setShowFormation(false); setBankingOpen(true); }}>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Already Incorporated?</h3>
                      <p className="text-sm text-muted-foreground mb-6 flex-1">
                        Just open the global spend account. Digital dollars, Visa card & global transfers for your existing company.
                      </p>
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                        onClick={(e) => { e.stopPropagation(); setShowFormation(false); setBankingOpen(true); }}
                      >
                        Open my global account →
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="documents" element={<DashboardDocuments />} />
                <Route path="banking" element={<DashboardBanking />} />
                <Route path="accounting" element={<DashboardAccounting />} />
                
                <Route path="invoices" element={<DashboardInvoices />} />
                <Route path="grants" element={<DashboardGrants />} />
                <Route path="assets" element={<DashboardAssets />} />
                <Route path="defi" element={<DashboardDeFi />} />
                <Route path="compliance" element={<DashboardCompliance />} />
                <Route path="organization" element={<DashboardOrganization />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
      {companies.length === 0 && !completingFormation && showFormation && (
        <FormationDialog open={true} onOpenChange={(v) => { if (!v) setShowFormation(false); }} forceOpen={true} />
      )}
      <BankingOnboardingDialog open={bankingOpen} onOpenChange={setBankingOpen} />
    </SidebarProvider>
  );
};

export default Dashboard;
