import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[COMPLETE-FORMATION] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

// TODO: Replace with real Thirdweb Engine API call when keys are configured
function mintNftDemo(seriesNumber: number, companyName: string) {
  const tokenId = `demo-${1000 + seriesNumber}`;
  const contractAddress = "0xDEMO_BASE_CONTRACT_ADDRESS";
  const walletAddress = "0xDEMO_WALLET_" + seriesNumber.toString().padStart(4, "0");
  const explorerUrl = `https://basescan.org/token/${contractAddress}?a=${tokenId}`;
  return { tokenId, contractAddress, walletAddress, explorerUrl };
}

// TODO: Replace with real Pinata API call when PINATA_API_KEY is configured
function pinToIpfsDemo(docType: string) {
  const hash = `QmDEMO${docType.replace(/\s/g, "")}${Date.now().toString(36)}`;
  return { IpfsHash: hash, gatewayUrl: `https://gateway.pinata.cloud/ipfs/${hash}` };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");
    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id required");

    // Verify Stripe payment
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Stripe session retrieved", { status: session.payment_status, id: session.id });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const meta = session.metadata || {};
    const companyName = meta.company_name;
    const seriesNumber = parseInt(meta.series_number, 10);
    const plan = meta.plan;
    const sessionUserId = meta.user_id;

    if (!companyName || !seriesNumber || !plan) {
      throw new Error("Missing formation metadata on Stripe session");
    }

    // Verify the session belongs to this user
    if (sessionUserId !== userId) {
      throw new Error("Session does not belong to authenticated user");
    }

    // Check idempotency — don't create duplicate companies
    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", userId)
      .eq("company_name", companyName)
      .maybeSingle();

    if (existing) {
      logStep("Company already exists, returning existing", { id: existing.id });
      return new Response(JSON.stringify({ company_id: existing.id, already_existed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mint NFT (demo mode)
    logStep("Minting NFT (demo mode)");
    const nft = mintNftDemo(seriesNumber, companyName);
    logStep("NFT minted", nft);

    // Insert company
    const seriesName = `Series ${String(seriesNumber).padStart(3, "0")}`;
    const { data: company, error: insertErr } = await supabase
      .from("companies")
      .insert({
        user_id: userId,
        company_name: companyName,
        series_name: seriesName,
        series_number: seriesNumber,
        master_llc_name: "Tokenizio RWA LLC",
        jurisdiction: "Wyoming, USA",
        company_type: "Series LLC",
        plan,
        formation_status: "complete",
        formation_type: "platform",
        nft_id: nft.tokenId,
        smart_contract_address: nft.contractAddress,
        nft_explorer_url: nft.explorerUrl,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      })
      .select("id")
      .single();

    if (insertErr) throw insertErr;
    logStep("Company inserted", { id: company.id });

    // Generate formation docs (non-blocking)
    try {
      const funcUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-formation-docs`;
      await fetch(funcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ company_id: company.id }),
      });
      logStep("Document generation triggered");
    } catch (docErr) {
      logStep("Document generation error (non-fatal)", { error: String(docErr) });
    }

    // Pin to IPFS (demo mode)
    logStep("Pinning to IPFS (demo mode)");
    const ipfsOa = pinToIpfsDemo("OperatingAgreement");
    const ipfsAoo = pinToIpfsDemo("ArticlesOfOrganization");
    const ipfsBundle = pinToIpfsDemo("FormationBundle");

    // Update company with IPFS hashes
    await supabase
      .from("companies")
      .update({
        ipfs_hash_oa: ipfsOa.IpfsHash,
        ipfs_hash_aoo: ipfsAoo.IpfsHash,
        ipfs_hash: ipfsBundle.IpfsHash,
        operating_agreement_status: "complete",
      })
      .eq("id", company.id);
    logStep("IPFS hashes updated");

    // Queue AoO amendment
    await supabase.from("aoo_amendment_queue").insert({
      company_id: company.id,
      series_number: seriesNumber,
      company_name: companyName,
      status: "pending",
    });
    logStep("AoO amendment queued");

    // Send onboarding confirmation email (fire-and-forget)
    try {
      const emailFuncUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-onboarding-confirmation`;
      fetch(emailFuncUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          companyName,
          plan,
          walletAddress: nft.walletAddress,
          targetUserId: userId,
        }),
      }).then((res) => {
        logStep("Onboarding confirmation email response", { status: res.status });
      }).catch((err) => {
        logStep("Onboarding confirmation email error (non-fatal)", { error: String(err) });
      });
      logStep("Onboarding confirmation email triggered");
    } catch (emailErr) {
      logStep("Onboarding confirmation email trigger error (non-fatal)", { error: String(emailErr) });
    }

    return new Response(
      JSON.stringify({
        company_id: company.id,
        nft: nft,
        ipfs: { oa: ipfsOa.gatewayUrl, aoo: ipfsAoo.gatewayUrl, bundle: ipfsBundle.gatewayUrl },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
