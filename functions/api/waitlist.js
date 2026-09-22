// Cloudflare Pages Function — handles the Activation Framework Mastermind waitlist.
// Requires a D1 binding named "DB" on the Pages project (see setup guide).

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }

  const { email } = body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400 });
  }

  try {
    await env.DB.prepare(
      `INSERT INTO waitlist (email, source) VALUES (?, 'mastermind')`
    )
      .bind(email)
      .run();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Could not save your email" }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
