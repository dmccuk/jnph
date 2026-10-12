// Stripe Payment Links (test mode). Leave blank to run in demo mode.
// Create one per option in the Stripe dashboard and paste the URLs here.
const STRIPE_LINKS = {
  monthly: "",
  monthlyAircon: "",
  annual: "",
  annualAircon: "",
};

const PLAN = {
  monthly: { base: 18.99, aircon: 6, period: "a month" },
  annual: { base: 199, aircon: 69, period: "a year" },
};
const DISCOUNT_RATE = 0.1;
const DISCOUNT_CAP = 1500;
const pct = DISCOUNT_RATE * 100 + "%";

// Whole pounds stay whole (£199); pence show when there are any (£18.99)
const gbp = (n) =>
  "£" + n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: n % 1 ? 2 : 0 });

const addon = document.getElementById("addon-aircon");
const total = (billing) => PLAN[billing].base + (addon.checked ? PLAN[billing].aircon : 0);

function renderPrice() {
  document.getElementById("price-monthly").textContent = gbp(total("monthly"));
  document.getElementById("price-annual").textContent = gbp(total("annual"));
  const saving = Math.floor(total("monthly") * 12 - total("annual"));
  document.getElementById("annual-saving").textContent = `Save ${gbp(saving)} compared with paying monthly.`;
}
addon.addEventListener("change", renderPrice);

// Savings calculator
const quote = document.getElementById("quote");
function renderCalc() {
  const value = Number(quote.value);
  const raw = value * DISCOUNT_RATE;
  const save = Math.round(Math.min(raw, DISCOUNT_CAP));
  document.getElementById("quote-out").textContent = gbp(value);
  document.getElementById("calc-quote").textContent = gbp(value);
  document.getElementById("calc-save").textContent = "−" + gbp(save);
  document.getElementById("calc-pay").textContent = gbp(value - save);
  document.getElementById("calc-note").textContent =
    raw > DISCOUNT_CAP
      ? `${pct} of ${gbp(value)} is ${gbp(raw)}, so the ${gbp(DISCOUNT_CAP)} limit applies.`
      : `${pct} off the quote.`;
}
quote.addEventListener("input", renderCalc);

// Join dialog
const dialog = document.getElementById("join-dialog");
const demoNote = document.getElementById("demo-note");

let billing = "monthly";
document.querySelectorAll("[data-join]").forEach((btn) => btn.addEventListener("click", () => {
  billing = btn.dataset.join;
  const p = PLAN[billing];
  const rows = [["Boiler service plan", `${gbp(p.base)} ${p.period}`]];
  if (addon.checked) rows.push(["Air con servicing", `${gbp(p.aircon)} ${p.period}`]);
  rows.push(["Total", `${gbp(total(billing))} ${p.period}`]);

  document.getElementById("join-summary").innerHTML = rows
    .map(([k, v], i) => `<div${i === rows.length - 1 ? ' class="total"' : ""}><dt>${k}</dt><dd>${v}</dd></div>`)
    .join("");
  document.getElementById("join-terms").textContent =
    billing === "monthly"
      ? `Billed monthly with a 12-month minimum (${gbp(total(billing) * 12)} in total). ${pct} off one job a year, up to ${gbp(DISCOUNT_CAP)}, after 3 months.`
      : `Billed once a year and renews automatically. ${pct} off one job a year, up to ${gbp(DISCOUNT_CAP)}, after 3 months.`;
  demoNote.hidden = true;
  dialog.showModal();
}));

document.getElementById("checkout-btn").addEventListener("click", () => {
  const key = billing + (addon.checked ? "Aircon" : "");
  const link = STRIPE_LINKS[key];
  if (link) {
    window.location.href = link;
  } else {
    demoNote.hidden = false;
  }
});

// Quote form (demo only)
document.getElementById("quote-form").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("form-msg").textContent =
    "Enquiry sent. We'll be in touch within one working day. (Demo: nothing was actually sent.)";
  e.target.reset();
});

renderPrice();
renderCalc();
