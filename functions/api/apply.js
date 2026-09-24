// Cloudflare Pages Function — handles the Strategy Session application form.
// Requires a D1 binding named "DB" on the Pages project (see setup guide).
//
// Email notifications (optional): set a RESEND_API_KEY secret in Cloudflare Pages
// (Settings → Environment variables) to get an email every time someone applies.
// Without it, the form still works exactly the same — you just won't get notified.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendNotificationEmail(env, subject, html) {
  if (!env.RESEND_API_KEY) return; // not configured yet — skip silently
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.NOTIFY_FROM || "Tokeniz Notifications <notifications@mail.tokeniz.ai>",
        to: env.NOTIFY_EMAIL || "hello@tokeniz.ai",
        subject,
        html,
      }),
    });
  } catch (err) {
    // Never fail the form submission just because the email failed.
    console.error("Email notification failed:", err);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }

  const { name, email, asset_type, stage, timeline } = body;

  if (!name || !email || !asset_type) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400 });
  }

  try {
    await env.DB.prepare(
      `INSERT INTO applications (name, email, asset_type, stage, timeline) VALUES (?, ?, ?, ?, ?)`
    )
      .bind(name, email, asset_type, stage || null, timeline || null)
      .run();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Could not save your application" }), { status: 500 });
  }

  await sendNotificationEmail(
    env,
    `New Strategy Session application — ${name}`,
    `<h2>New Strategy Session application</h2>
     <p><strong>Name:</strong> ${escapeHtml(name)}</p>
     <p><strong>Email:</strong> ${escapeHtml(email)}</p>
     <p><strong>Asset / business type:</strong> ${escapeHtml(asset_type)}</p>
     <p><strong>Stage:</strong> ${escapeHtml(stage || "—")}</p>
     <p><strong>Timeline:</strong> ${escapeHtml(timeline || "—")}</p>`
  );

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
