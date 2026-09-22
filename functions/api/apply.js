// Cloudflare Pages Function — handles the Strategy Session application form.
// Requires a D1 binding named "DB" on the Pages project (see setup guide).

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

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
