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

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Verify caller is admin
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) throw new Error("Not authorized");

    const { product_id, name, description, price_amount, enabled } = await req.json();
    if (!product_id) throw new Error("product_id is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get current product from DB
    const { data: product, error: fetchErr } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single();
    if (fetchErr || !product) throw new Error("Product not found");

    let stripeProductId = product.stripe_product_id;
    let stripePriceId = product.stripe_price_id;

    // Create Stripe product if it doesn't exist
    if (!stripeProductId) {
      const stripeProduct = await stripe.products.create({
        name: name ?? product.name,
        description: description ?? product.description,
        active: enabled ?? product.enabled,
      });
      stripeProductId = stripeProduct.id;
    } else {
      // Update Stripe product name/description/active
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (enabled !== undefined) updates.active = enabled;
      if (Object.keys(updates).length > 0) {
        await stripe.products.update(stripeProductId, updates);
      }
    }

    // Handle price change — create new price, set as default, then archive old one when safe
    if (price_amount !== undefined && price_amount !== product.price_amount) {
      const oldPriceId = product.stripe_price_id;

      const newPrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: price_amount,
        currency: "usd",
        recurring: { interval: "year" },
      });

      // Make new price the default first
      await stripe.products.update(stripeProductId, { default_price: newPrice.id });
      stripePriceId = newPrice.id;

      // Archive old price only if it belongs to this product and is no longer default
      if (oldPriceId && oldPriceId !== newPrice.id) {
        try {
          const oldPrice = await stripe.prices.retrieve(oldPriceId);
          const oldPriceProductId = typeof oldPrice.product === "string" ? oldPrice.product : oldPrice.product?.id;

          if (oldPriceProductId === stripeProductId) {
            const refreshedProduct = await stripe.products.retrieve(stripeProductId);
            const currentDefaultPriceId =
              typeof refreshedProduct.default_price === "string"
                ? refreshedProduct.default_price
                : refreshedProduct.default_price?.id ?? null;

            if (currentDefaultPriceId !== oldPriceId && oldPrice.active) {
              await stripe.prices.update(oldPriceId, { active: false });
            }
          }
        } catch (archiveErr) {
          console.warn("Skipping old price archive", { oldPriceId, reason: archiveErr instanceof Error ? archiveErr.message : String(archiveErr) });
        }
      }
    }

    // Update DB
    const dbUpdates: Record<string, unknown> = {
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) dbUpdates.name = name;
    if (description !== undefined) dbUpdates.description = description;
    if (price_amount !== undefined) dbUpdates.price_amount = price_amount;
    if (enabled !== undefined) dbUpdates.enabled = enabled;

    const { error: updateErr } = await supabaseAdmin
      .from("products")
      .update(dbUpdates)
      .eq("id", product_id);
    if (updateErr) throw new Error(`DB update failed: ${updateErr.message}`);

    return new Response(JSON.stringify({ success: true, stripe_product_id: stripeProductId, stripe_price_id: stripePriceId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
