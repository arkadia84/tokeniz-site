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
    noteEl.classList.remove("note-error");

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
      noteEl.textContent = "Something went wrong — your submission was not saved. Please try again or email hello@tokeniz.ai directly.";
      noteEl.classList.add("note-error");
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
        const form = document.getElementById("apply-form");
        const success = document.getElementById("apply-success");
        const link = document.getElementById("apply-success-link");
        form.hidden = true;
        link.href = CALENDAR_URL;
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => { window.location.href = CALENDAR_URL; }, 2500);
      },
    }
  );

  handleForm(
    document.getElementById("waitlist-form"),
    "/api/waitlist",
    document.getElementById("waitlist-note"),
    {
      onSuccess: () => {
        const form = document.getElementById("waitlist-form");
        const success = document.getElementById("waitlist-success");
        form.hidden = true;
        success.hidden = false;
      },
    }
  );
});
