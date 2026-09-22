import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight, ArrowLeft, CreditCard, Loader2, Info, CheckCircle2,
  Copy, Check, ExternalLink, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface BankingOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type VolumeRange = "low" | "mid" | "high";
type PathChoice = "white-glove" | "self-serve";

const REFERRAL_LINK = "elephants.inc/?ref=PROPEX";

const VOLUME_CARDS: { key: VolumeRange; label: string; desc: string; badge?: string }[] = [
  { key: "low", label: "Under $10K / month", desc: "Getting started or early-stage business" },
  { key: "mid", label: "$10K – $50K / month", desc: "Growing business with regular international payments", badge: "Unlock $100 cashback" },
  { key: "high", label: "Over $50K / month", desc: "Established business with high transaction volume", badge: "Unlock $250 cashback" },
];

const RECOMMENDATIONS: Record<VolumeRange, { tier: string; headline: string; benefits: string[]; savings: string }> = {
  low: {
    tier: "Explorer",
    headline: "Save ~$200 a year on fees you're paying right now",
    benefits: [
      "0% FX on USD transfers (your bank charges ~2%)",
      "$5 flat fee for international transfers vs $25–45 SWIFT fees",
      "Digital dollars + local currency in one account",
    ],
    savings: "At your volume, the white-glove setup pays for itself within 3 months of fee savings alone.",
  },
  mid: {
    tier: "Explorer",
    headline: "Save up to $1,200 a year vs your current setup",
    benefits: [
      "0% FX on USD — at $30K/mo that's ~$600/yr back in your pocket",
      "Send to 100+ countries at $5 flat — not 1.5–3% of the transfer",
      "Earn $100–$250 cashback when you hit your first spend milestones",
    ],
    savings: "The $497 white-glove fee pays for itself in approximately 2 transactions at your volume.",
  },
  high: {
    tier: "Elite",
    headline: "Save $6,000+ a year — and earn cashback on top",
    benefits: [
      "0% FX on USD, 0.3% on other currencies vs 2–3% bank standard",
      "At $50K+/mo that's $1,000–$1,500 saved every single month",
      "Earn $250 cashback on your first $10K in deposits or spend",
    ],
    savings: "At your volume, the white-glove fee pays for itself on day one. This is a no-brainer.",
  },
};

const volumeToString = (v: VolumeRange | null) => {
  if (v === "low") return "< $10K/mo";
  if (v === "mid") return "$10K–$50K/mo";
  if (v === "high") return "$50K+/mo";
  return "";
};

const BankingOnboardingDialog = ({ open, onOpenChange }: BankingOnboardingDialogProps) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [volumeRange, setVolumeRange] = useState<VolumeRange | null>(null);
  const [selectedPath, setSelectedPath] = useState<PathChoice | null>(null);
  const [contactHandle, setContactHandle] = useState("");
  const [contactError, setContactError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("banking") === "success") {
      setStep(4);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setVolumeRange(null);
      setSelectedPath(null);
      setContactHandle("");
      setContactError("");
      setSubmitting(false);
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    }
  }, [open]);

  const totalSteps = selectedPath === "self-serve" ? 3 : 4;
  const currentStepDisplay = step === 4 ? null : step;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`https://${REFERRAL_LINK}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handlePay = useCallback(async () => {
    if (!contactHandle.trim()) {
      setContactError("Please enter your WhatsApp number or Telegram handle.");
      return;
    }
    setContactError("");
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: app, error: insertErr } = await supabase
        .from("banking_applications")
        .insert({
          user_id: user.id,
          needs_fiat_payouts: true,
          needs_fiat_deposits: true,
          annual_revenue: volumeToString(volumeRange),
          status: "pending_payment",
          payment_status: "unpaid",
          website: `contact:${contactHandle.trim()}`,
        })
        .select("id")
        .single();

      if (insertErr) throw new Error(insertErr.message);

      const { data, error } = await supabase.functions.invoke("create-banking-checkout", {
        body: { application_id: app.id },
      });

      if (error) throw new Error(error.message || "Failed to create checkout");
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Checkout Failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }, [contactHandle, volumeRange, toast]);

  const canContinueStep1 = !!volumeRange;
  const canContinueStep2 = !!selectedPath;

  const rec = volumeRange ? RECOMMENDATIONS[volumeRange] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            {step === 1 && "How much does your business move each month?"}
            {step === 2 && "Here's what fits your business"}
            {step === 3 && selectedPath === "white-glove" && "Almost there"}
            {step === 3 && selectedPath === "self-serve" && "Your referral link is ready"}
            {step === 4 && "Payment confirmed"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "We'll show you exactly how much you could save."}
            {step === 2 && "Based on your volume — here's what you'd save."}
            {step === 3 && selectedPath === "white-glove" && "One detail so we can reach you after payment."}
            {step === 3 && selectedPath === "self-serve" && "Sign up with this link for 6 months of fees waived — plus cashback when you hit volume."}
            {step === 4 && "We'll message you on WhatsApp or Telegram within a few hours. Our team handles everything from here."}
          </DialogDescription>
        </DialogHeader>

        {currentStepDisplay && (
          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  i + 1 === currentStepDisplay ? "bg-primary" : (i + 1 < currentStepDisplay ? "bg-primary/40" : "bg-muted")
                )} />
                {i < totalSteps - 1 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>
        )}

        <Separator className="shrink-0" />

        <div className="flex-1 overflow-y-auto min-h-0">
        {/* ── STEP 1 — Volume selector ──────────────── */}
        {step === 1 && (
          <div className="grid gap-3 py-2">
            {VOLUME_CARDS.map(({ key, label, desc, badge }) => (
              <button
                key={key}
                onClick={() => {
                  setVolumeRange(key);
                  if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
                  autoAdvanceTimer.current = setTimeout(() => setStep(2), 350);
                }}
                className={cn(
                  "text-left rounded-lg border p-4 transition-all",
                  volumeRange === key
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    volumeRange === key ? "border-primary" : "border-muted-foreground/40"
                  )}>
                    {volumeRange === key && <Circle className="h-2.5 w-2.5 fill-primary text-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground">{label}</p>
                      {badge && (
                        <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px] shrink-0">{badge}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── STEP 2 — Recommendation + path choice ── */}
        {step === 2 && rec && (
          <div className="space-y-3 md:space-y-5 py-2">
            {/* Recommendation card */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 md:p-4 space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Recommended Account</p>
                <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px]">
                  {rec.tier}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-foreground">{rec.headline}</p>
              <div className="space-y-2">
                {rec.benefits.map((text) => (
                  <div key={text} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">{rec.savings}</p>
              </div>
            </div>

            {/* Path choice */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">How would you like to proceed?</p>
              <div className="grid gap-3">
                <button
                  onClick={() => {
                    setSelectedPath("white-glove");
                    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
                    autoAdvanceTimer.current = setTimeout(() => setStep(3), 350);
                  }}
                  className={cn(
                    "text-left rounded-lg border p-3 md:p-4 transition-all",
                    selectedPath === "white-glove"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      selectedPath === "white-glove" ? "border-primary" : "border-muted-foreground/40"
                    )}>
                      {selectedPath === "white-glove" && <Circle className="h-2.5 w-2.5 fill-primary text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-foreground">We handle everything — you just do KYB once</span>
                        <Badge variant="outline" className="text-[10px] shrink-0 ml-2">$497 · one-time</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We coordinate your account opening with our financial partner. You complete identity verification once, inside their app. No duplicate forms.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedPath("self-serve");
                    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
                    autoAdvanceTimer.current = setTimeout(() => setStep(3), 350);
                  }}
                  className={cn(
                    "text-left rounded-lg border p-3 md:p-4 transition-all",
                    selectedPath === "self-serve"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      selectedPath === "self-serve" ? "border-primary" : "border-muted-foreground/40"
                    )}>
                      {selectedPath === "self-serve" && <Circle className="h-2.5 w-2.5 fill-primary text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-foreground">Give me the referral link — I'll do it myself</span>
                        <Badge variant="outline" className="text-[10px] shrink-0 ml-2">Free</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Sign up directly and handle onboarding on your own. Free, takes 3–5 days.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3A — White-glove ──────────────────── */}
        {step === 3 && selectedPath === "white-glove" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="contact">Your WhatsApp number or Telegram handle</Label>
              <Input
                id="contact"
                placeholder="+65 9000 0000 or @yourusername"
                value={contactHandle}
                onChange={(e) => { setContactHandle(e.target.value); setContactError(""); }}
              />
              {contactError && <p className="text-xs text-destructive">{contactError}</p>}
              <p className="text-xs text-muted-foreground">We'll message you within a few hours — no calls, no long forms.</p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-medium text-primary">What's included in your $497</p>
              {[
                "We coordinate your full account opening with our financial partner",
                "You complete identity verification once — inside their app. No duplicate forms.",
                "24 months of account fees waived ($424 value)",
                "Digital dollars + USD/EUR · Visa card · global transfers · 0% FX on USD",
                "Deposit $10K+ within 3 months → earn up to $250 cashback",
              ].map((text) => (
                <div key={text} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">100% refund if your application is unsuccessful.</p>

            <Alert className="border-primary/30 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs">
                <span className="font-semibold">Test Mode</span> — You will not be charged. Use test card:{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">4242 4242 4242 4242</code>{" "}
                Exp. <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">01/31</code>{" "}
                CVV <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">124</code>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* ── STEP 3B — Self-serve ───────────────────── */}
        {step === 3 && selectedPath === "self-serve" && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground mb-2">What you get</p>
              {[
                "6 months of account fees waived when you sign up via our link",
                "Spend or deposit $1,000 within 3 months → earn $100",
                "Spend or deposit $10,000 within 3 months → earn $250",
                "Digital dollars + USD/EUR · Visa card · global transfers",
              ].map((text) => (
                <div key={text} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground">{text}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-between gap-2">
              <code className="text-sm font-mono text-primary truncate">{REFERRAL_LINK}</code>
              <Button variant="outline" size="sm" className="shrink-0 gap-1" onClick={handleCopy}>
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy link</>}
              </Button>
            </div>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">Need help along the way?</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <p className="text-xs text-muted-foreground text-center">
              If you get stuck or prefer us to handle it, you can upgrade to white-glove setup for $497.{" "}
              <button
                className="text-primary hover:text-primary/80 font-medium underline-offset-2 hover:underline"
                onClick={() => { setSelectedPath("white-glove"); setStep(2); }}
              >
                Upgrade to white-glove →
              </button>
            </p>
          </div>
        )}

        {/* ── STEP 4 — Success ───────────────────────── */}

        {step === 4 && (
          <div className="space-y-5 py-4 text-center">
            <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs text-muted-foreground">
                A confirmation email is on its way with a summary of your purchase and exactly what to expect next.
              </p>
            </div>

            <div className="text-left space-y-3">
              <p className="text-sm font-semibold text-foreground">What happens next</p>
              {[
                { num: 1, text: "We reach out on WhatsApp or Telegram to get started", time: "Within a few hours" },
                { num: 2, text: "You complete identity verification once — inside our partner's app", time: "~10 minutes" },
                { num: 3, text: "Your account is live: Visa card, digital dollars, global transfers", time: "3–5 business days" },
              ].map(({ num, text, time }) => (
                <div key={num} className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/15 h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{num}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{text}</p>
                    <p className="text-xs text-muted-foreground">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <DialogFooter className="shrink-0 flex-row gap-2 sm:gap-2">
          {step === 2 && (
            isMobile ? (
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setStep(1)}>
                <ArrowLeft size={16} />
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft size={14} className="mr-1" /> Back
              </Button>
            )
          )}
          {step === 3 && (
            isMobile ? (
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setStep(2)} disabled={submitting}>
                <ArrowLeft size={16} />
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setStep(2)} disabled={submitting}>
                <ArrowLeft size={14} className="mr-1" /> Back
              </Button>
            )
          )}

          {step === 3 && selectedPath === "white-glove" && (
            <Button onClick={handlePay} disabled={submitting} className="ml-auto gap-1">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
              {submitting ? "Redirecting…" : "Pay $497 and get started →"}
            </Button>
          )}
          {step === 3 && selectedPath === "self-serve" && (
            <Button className="ml-auto gap-1" onClick={() => window.open(`https://${REFERRAL_LINK}`, "_blank")}>
              Open my account <ExternalLink size={14} />
            </Button>
          )}
          {step === 4 && (
            <Button onClick={() => { onOpenChange(false); navigate("/dashboard"); }} className="ml-auto gap-1">
              Go to dashboard <ArrowRight size={14} />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BankingOnboardingDialog;
