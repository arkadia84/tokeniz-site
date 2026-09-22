ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS is_api_integrated boolean DEFAULT false;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS ipfs_hash text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS external_provider_id text;