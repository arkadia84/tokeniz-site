// Seeded random so balances stay stable during a session
const seed = Math.random();
const rand = (min: number, max: number) => min + (seed * 0.999999) * (max - min);
const rand2 = (min: number, max: number) => min + ((seed * 7.31) % 1) * (max - min);

const BTC_PRICE = 97_432; // approximate BTC price

export const FIAT_BALANCE = Math.round(rand(10_000, 85_000) * 100) / 100;
export const CRYPTO_BALANCE = Math.round(rand2(10_000, 65_000) * 100) / 100;
export const TOTAL_BALANCE = FIAT_BALANCE + CRYPTO_BALANCE;
export const BTC_EQUIVALENT = TOTAL_BALANCE / BTC_PRICE;

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtBtc = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
