// Nifty Founder / Atomise Instagram card renderer — fixed branding, only words change.
// Usage: node render.js spec.json out.png
//   spec = { brand: "nifty"|"atomise", variant: "headline"|"quote",
//            kicker, headline (use *word* to colour a word), sub, quote, who, role, num }
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const BRANDS = {
  nifty: {
    wordmark: 'the <span class="hi">nifty</span> founder',
    logo: '',
    pill: 'tokenization for non-techies',
    handle: '@nifty.founder',
    site: 'niftyfounder.com',
  },
  atomise: {
    wordmark: 'atomise',
    logo: `<svg class="logo" viewBox="0 0 64 64" fill="none" stroke="#34d399" stroke-width="3.5">
      <ellipse cx="32" cy="32" rx="28" ry="11"/>
      <ellipse cx="32" cy="32" rx="28" ry="11" transform="rotate(60 32 32)"/>
      <ellipse cx="32" cy="32" rx="28" ry="11" transform="rotate(120 32 32)"/>
      <circle cx="32" cy="32" r="5" fill="#34d399" stroke="none"/></svg>`,
    pill: 'companies, born on-chain',
    handle: '@atomise_fun',
    site: 'atomise.fun',
  },
};

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
function hl(s) { return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>'); }

function body(spec) {
  if (spec.variant === 'quote') {
    return `<div class="mark">“</div><h1>${hl(spec.quote)}</h1>
      <div class="who">${esc(spec.who || '')}<span>${esc(spec.role || '')}</span></div>`;
  }
  const len = (spec.headline || '').replace(/\*/g, '').length;
  const size = len > 80 ? 'xs' : len > 50 ? 'sm' : '';
  return `${spec.kicker ? `<div class="kicker">${esc(spec.kicker)}</div>` : ''}
    <h1 class="${size}">${hl(spec.headline)}</h1>
    ${spec.sub ? `<div class="bar"></div><div class="sub">${esc(spec.sub)}</div>` : ''}`;
}

async function render(spec, out) {
  const b = BRANDS[spec.brand];
  if (!b) throw new Error('brand must be nifty|atomise');
  let html = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  const map = { brand: spec.brand, variant: spec.variant || 'headline', logo: b.logo, wordmark: b.wordmark,
    pill: b.pill, body: body(spec), handle: b.handle, site: b.site, num: esc(spec.num || '') };
  for (const [k, v] of Object.entries(map)) html = html.split(`{{${k}}}`).join(v);
  const tmp = path.join(__dirname, `.tmp-${process.pid}.html`);
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto('file://' + tmp);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, type: 'png' });
  await browser.close();
  fs.unlinkSync(tmp);
}

if (require.main === module) {
  const [specPath, out] = process.argv.slice(2);
  render(JSON.parse(fs.readFileSync(specPath, 'utf8')), out).then(() => console.log('wrote', out));
}
module.exports = { render };
