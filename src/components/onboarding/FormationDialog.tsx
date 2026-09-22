import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowLeft, Building2, Loader2, CreditCard, Info, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActiveOrg } from "@/contexts/ActiveOrgContext";
import FormationNameInput, { validateName, MASTER_LLC } from "./FormationNameInput";

interface FormationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forceOpen?: boolean;
}

type Step = "name" | "plan" | "summary";

interface Plan {
  id: string;
  name: string;
  description: string;
  price_amount: number;
  period: string;
  enabled: boolean;
}


const FormationDialog = ({ open, onOpenChange, forceOpen = false }: FormationDialogProps) => {
  const [step, setStep] = useState<Step>("name");
  const [companyName, setCompanyName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("essential");
  const [seriesNumber, setSeriesNumber] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const { toast } = useToast();
  const { companies } = useActiveOrg();
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!open) return;
    setStep("name");
    setCompanyName("");
    setSelectedPlan("essential");

    Promise.all([
      supabase.rpc("next_series_number"),
      supabase.from("products").select("id, name, description, price_amount, period, enabled").order("display_order", { ascending: true }),
    ]).then(([seriesRes, productsRes]) => {
      setSeriesNumber(seriesRes.error ? 1 : (seriesRes.data as number));
      if (productsRes.data) {
        setPlans(productsRes.data as unknown as Plan[]);
      }
    });
  }, [open]);

  const fullSeriesName = companyName.trim() && seriesNumber
    ? `${MASTER_LLC} - ${companyName.trim()} - Series ${String(seriesNumber).padStart(3, "0")}`
    : "";

  const nameValid = validateName(companyName).valid;

  const handleSubmit = useCallback(async () => {
    if (!seriesNumber || !nameValid) return;
    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-formation-checkout", {
        body: {
          plan: selectedPlan,
          company_name: fullSeriesName,
          series_number: seriesNumber,
        },
      });

      if (error) throw new Error(error.message || "Failed to create checkout session");
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Checkout Failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }, [seriesNumber, nameValid, fullSeriesName, selectedPlan, toast]);

  return (
    <Dialog open={open} onOpenChange={forceOpen ? () => {} : onOpenChange}>
      <DialogContent className={cn("sm:max-w-lg", forceOpen && "[&>button]:hidden")} onPointerDownOutside={forceOpen ? (e) => e.preventDefault() : undefined} onEscapeKeyDown={forceOpen ? (e) => e.preventDefault() : undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            {step === "name" ? "Pick a Name" : step === "plan" ? "Choose a Plan" : "Confirm & Pay"}
          </DialogTitle>
          <DialogDescription>
            {step === "name" && "You are about to create a new Series LLC under Tokenizio RWA LLC in Wyoming, USA, 100% owned by you."}
            {step === "plan" && "Select a plan for your company."}
            {step === "summary" && "Review and confirm your company details."}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-2">
          {(["name", "plan", "summary"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "h-2 w-2 rounded-full transition-colors",
                step === s ? "bg-primary" : (["name", "plan", "summary"].indexOf(step) > i ? "bg-accent" : "bg-muted")
              )} />
              {i < 2 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        <Separator />

        {/* Step: Name */}
        {step === "name" && (
          <div className="py-2 space-y-4">
            <FormationNameInput value={companyName} onChange={setCompanyName} seriesNumber={seriesNumber} />

            {/* Existing companies */}
            {companies.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Your Existing Companies</p>
                <div className="space-y-1.5">
                  {companies.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-md bg-muted/50">
                      <span className="truncate font-medium text-foreground">{c.company_name}</span>
                      <Badge variant="outline" className="text-[10px] capitalize shrink-0 ml-2">
                        {c.formation_status || "pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Plan */}
        {step === "plan" && (
          <div className="grid gap-3 py-2">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => plan.enabled && setSelectedPlan(plan.id)}
                disabled={!plan.enabled}
                className={cn(
                  "text-left rounded-lg border p-4 transition-all",
                  !plan.enabled
                    ? "border-border opacity-50 cursor-not-allowed"
                    : selectedPlan === plan.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-foreground">{plan.name}</span>
                  <div className="flex items-center gap-2">
                    {!plan.enabled && (
                      <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
                    )}
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-bold text-foreground">${(plan.price_amount / 100).toFixed(0)}</span>
                      <span className="text-xs text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step: Summary */}
        {step === "summary" && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/50 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entity Name</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">{fullSeriesName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-foreground">Protected Series LLC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jurisdiction</span>
                <span className="font-medium text-foreground">Wyoming, USA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <Badge variant="outline" className="capitalize">{selectedPlan}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Formation Fee</span>
                <span className="font-medium text-foreground">
                  ${(plans.find((p) => p.id === selectedPlan)?.price_amount ?? 0) / 100}/year
                </span>
              </div>
            </div>
            <Alert className="border-primary/30 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs">
                <span className="font-semibold">Test Mode</span> — You will not be charged. Use test card:{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">4242 4242 4242 4242</code>{" "}
                Exp. <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">01/31</code>{" "}
                CVV <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">124</code>
              </AlertDescription>
            </Alert>
            <p className="text-xs text-muted-foreground leading-relaxed">
              By proceeding you agree to the Series Operating Agreement and acknowledge the formation of a Wyoming Protected Series LLC under {MASTER_LLC}. You will be redirected to Stripe to complete payment.
            </p>
          </div>
        )}

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          {step !== "name" && (
            <Button
              variant="outline"
              onClick={() => setStep(step === "summary" ? "plan" : "name")}
              disabled={submitting}
            >
              <ArrowLeft size={14} className="mr-1" /> Back
            </Button>
          )}
          {forceOpen && step === "name" && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Later
            </Button>
          )}
          {step === "name" && (
            <Button onClick={() => setStep("plan")} disabled={!nameValid} className="ml-auto gap-1">
              Continue <ArrowRight size={14} />
            </Button>
          )}
          {step === "plan" && (
            <Button onClick={() => setStep("summary")} className="ml-auto gap-1">
              Continue <ArrowRight size={14} />
            </Button>
          )}
          {step === "summary" && (
            <Button onClick={handleSubmit} disabled={submitting} className="ml-auto gap-1">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
              {submitting ? "Redirecting…" : "Pay & Create"}
            </Button>
          )}
        </DialogFooter>

        {forceOpen && (
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto pt-1"
          >
            <LogOut size={12} />
            Sign out
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FormationDialog;
