// Tokeniz.ai — form handling
// Both forms POST as JSON to Pages Functions (/functions/api/*), which write to D1.

const CALENDAR_URL = "https://calendar.app.google/KMwzK4HQn6zo4Mmm7";

function handleForm(formEl, endpoint, noteEl, { onSuccess } = {}) {
  if (!formEl) return;
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = formEl.querySelector("button[type=submit]");
    const originalText = button ? button.textContent : "";
    if (button) { button.disabled = true; button.textContent = "Sending…"; }
    noteEl.textContent = "";

    const data = Object.fromEntries(new FormData(formEl).entries());

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      formEl.reset();
      if (onSuccess) onSuccess();
      else noteEl.textContent = "Got it — thank you.";
    } catch (err) {
      noteEl.textContent = "Something went wrong. Please try again or email hello@tokeniz.ai directly.";
    } finally {
      if (button) { button.disabled = false; button.textContent = originalText; }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  handleForm(
    document.getElementById("apply-form"),
    "/api/apply",
    document.getElementById("apply-note"),
    {
      onSuccess: () => {
        document.getElementById("apply-note").textContent = "Thanks — redirecting you to book your session…";
        setTimeout(() => { window.location.href = CALENDAR_URL; }, 1200);
      },
    }
  );

  handleForm(
    document.getElementById("waitlist-form"),
    "/api/waitlist",
    document.getElementById("waitlist-note"),
    {
      onSuccess: () => {
        document.getElementById("waitlist-note").textContent = "You're on the list — I'll be in touch when it opens.";
      },
    }
  );
});
