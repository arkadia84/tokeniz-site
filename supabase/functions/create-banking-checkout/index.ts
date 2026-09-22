import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { application_id } = await req.json();
    if (!application_id) throw new Error("Missing application_id");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create the banking white-glove price
    let priceId: string | undefined;

    // Search for existing price with metadata
    const prices = await stripe.prices.search({
      query: `metadata["product_key"]:"banking-white-glove" active:"true"`,
    });

    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
    } else {
      // Create product + price on the fly
      const product = await stripe.products.create({
        name: "Banking White-Glove Setup",
        description: "One-time white-glove account opening with 24 months of fees waived",
        metadata: { product_key: "banking-white-glove" },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 49700,
        currency: "usd",
        metadata: { product_key: "banking-white-glove" },
      });

      priceId = price.id;
    }

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://app-tokeniz-ai.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      metadata: {
        user_id: user.id,
        application_id,
        product: "banking-white-glove",
      },
      success_url: `${origin}/dashboard?banking=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?banking=cancelled`,
    });

    // Update the application with stripe session id
    await supabaseAdmin
      .from("banking_applications")
      .update({ stripe_session_id: session.id })
      .eq("id", application_id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
