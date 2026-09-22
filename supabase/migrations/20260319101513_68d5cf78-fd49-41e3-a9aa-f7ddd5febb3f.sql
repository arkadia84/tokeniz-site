ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS master_llc_name text DEFAULT 'Tokenizio RWA LLC',
  ADD COLUMN IF NOT EXISTS series_name text,
  ADD COLUMN IF NOT EXISTS formation_type text DEFAULT 'referral',
  ADD COLUMN IF NOT EXISTS nft_id text,
  ADD COLUMN IF NOT EXISTS ipfs_hash_oa text,
  ADD COLUMN IF NOT EXISTS ipfs_hash_aoo text,
  ADD COLUMN IF NOT EXISTS wyoming_filing_id text,
  ADD COLUMN IF NOT EXISTS banking_provider text,
  ADD COLUMN IF NOT EXISTS banking_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Backfill series_name from company_name for existing rows
UPDATE public.companies SET series_name = company_name WHERE series_name IS NULL;