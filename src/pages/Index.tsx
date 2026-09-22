import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoginDialog from "@/components/auth/LoginDialog";
import FormationDialog from "@/components/onboarding/FormationDialog";
import BankingOnboardingDialog from "@/components/onboarding/BankingOnboardingDialog";
import { Building2, CreditCard, Zap, Globe, Shield, Clock } from "lucide-react";

const PARTNERS = ["CUSTODY PROVIDERS", "PAYMENT RAILS", "COMPLIANCE PARTNERS", "DIGITAL IDENTITY"];
const FEATURES = [
  { icon: Zap, label: "Send in seconds" },
  { icon: Shield, label: "Near-zero fees" },
  { icon: Globe, label: "100+ countries" },
  { icon: CreditCard, label: "0% FX on USD" },
  { icon: Clock, label: "Always open" },
];

const Index = () => {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [formationOpen, setFormationOpen] = useState(false);
  const [bankingOpen, setBankingOpen] = useState(false);
  const [pendingFlow, setPendingFlow] = useState<"formation" | "banking" | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
      if (session) {
          if (loginOpen) {
            // Handled by onAuthenticated callback
          } else {
            const storedIntent = sessionStorage.getItem("onboarding_intent") as "formation" | "banking" | null;
            if (storedIntent === "banking") {
              navigate("/dashboard?flow=banking", { replace: true });
            } else {
              navigate("/dashboard", { replace: true });
            }
          }
          setCheckingSession(false);
        } else if (event === "INITIAL_SESSION") {
          setCheckingSession(false);
        }
      } else if (event === "SIGNED_OUT") {
        setCheckingSession(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, loginOpen, pendingFlow]);

  const handlePathClick = async (flow: "formation" | "banking") => {
    // Persist intent immediately so it survives auth redirects
    sessionStorage.setItem("onboarding_intent", flow);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      if (flow === "banking") {
        navigate("/dashboard?flow=banking", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      setPendingFlow(flow);
      setLoginOpen(true);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B1120" }}>
        <div className="h-8 w-8 rounded-full border-2 border-[hsl(224,80%,63%)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white" style={{ background: "#0B1120" }}>
      {/* ── Nav ─────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-5">
        <a href="https://tokeniz.ai" target="_blank" rel="noopener noreferrer" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">Tokeniz</a>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
          onClick={() => setLoginOpen(true)}
        >
          Sign In
        </Button>
      </header>

      {/* ── Partner bar ────────────────────────────── */}
      <div className="mx-auto mt-8 sm:mt-14 px-6">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] sm:text-xs tracking-widest font-mono text-white/30 border border-white/10 rounded-xl px-6 py-3">
          {PARTNERS.map((p, i) => (
            <span key={p}>
              {p}
              {i < PARTNERS.length - 1 && <span className="ml-6 hidden sm:inline">·</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 -mt-4">
        <Badge className="mb-4 bg-white/10 text-white/70 border-white/10 text-xs tracking-[0.2em] font-mono">
          GLOBAL · INSTANT · VERIFIABLE
        </Badge>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight max-w-3xl"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          Your business account.{" "}
          <span className="text-[hsl(224,80%,63%)]">Instant. Global. Yours.</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-white/50 max-w-lg" style={{ textWrap: "pretty" } as React.CSSProperties}>
          Experience tokenized ownership infrastructure firsthand.
        </p>

        {/* ── Two Path Cards ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12 w-full max-w-2xl">
          {/* Card 1: Start Fresh */}
          <Card className="bg-white/[0.06] border-white/10 hover:border-[hsl(224,80%,63%)]/50 transition-all cursor-pointer group" onClick={() => handlePathClick("formation")}>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="rounded-full bg-[hsl(224,80%,63%)]/15 p-3 w-fit mb-4">
                <Building2 className="h-6 w-6 text-[hsl(224,80%,63%)]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Start Fresh</h3>
              <p className="text-sm text-white/50 mb-6 flex-1">
                Register a US entity and open your global spend account. Includes Wyoming Series LLC, Visa card & USDC account.
              </p>
              <Button
                className="w-full bg-[hsl(224,80%,63%)] hover:bg-[hsl(224,80%,55%)] text-white font-semibold"
                onClick={(e) => { e.stopPropagation(); handlePathClick("formation"); }}
              >
                Get started
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Already Incorporated */}
          <Card className="bg-white/[0.06] border-white/10 hover:border-amber-500/30 transition-all cursor-pointer group relative" onClick={() => handlePathClick("banking")}>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="rounded-full bg-amber-500/15 p-3 w-fit mb-4">
                <CreditCard className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Already Incorporated?</h3>
              <p className="text-sm text-white/50 mb-6 flex-1">
                Just open the global spend account. Digital dollars, Visa card & global transfers for your existing company.
              </p>
              <Button
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                onClick={(e) => { e.stopPropagation(); handlePathClick("banking"); }}
              >
                Open my global account →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Feature bar ─────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-10 text-white/40 text-sm">
          {FEATURES.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
          ))}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="py-6 text-center text-xs text-white/30">
        <a href="#" className="hover:text-white/50 transition-colors">Terms of Service</a>
        <span className="mx-2">·</span>
        <a href="#" className="hover:text-white/50 transition-colors">Privacy Policy</a>
      </footer>

      {/* ── Dialogs ────────────────────────────────── */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onAuthenticated={() => {
          setLoginOpen(false);
          const resolvedFlow = pendingFlow || sessionStorage.getItem("onboarding_intent") as "formation" | "banking" | null;
          if (resolvedFlow === "banking") {
            navigate("/dashboard?flow=banking", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          setPendingFlow(null);
        }}
      />
      <FormationDialog open={formationOpen} onOpenChange={setFormationOpen} />
      <BankingOnboardingDialog open={bankingOpen} onOpenChange={setBankingOpen} />
    </div>
  );
};

export default Index;
