
-- Phase 1, Task 1: Unique constraint on series_number (partial - allow NULLs for companies not yet assigned)
ALTER TABLE public.companies ADD CONSTRAINT companies_series_number_unique UNIQUE (series_number);

-- Phase 1, Task 2: Trigger to prevent deletion of on-chain (minted) companies
CREATE OR REPLACE FUNCTION public.prevent_onchain_delete()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.nft_id IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot delete a company that has been minted on-chain (nft_id: %)', OLD.nft_id;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_prevent_onchain_delete
BEFORE DELETE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.prevent_onchain_delete();

-- Phase 1, Task 3: Add archived_at column
ALTER TABLE public.companies ADD COLUMN archived_at timestamptz DEFAULT NULL;

-- Phase 1, Task 4: Add revocation_status column
ALTER TABLE public.companies ADD COLUMN revocation_status text DEFAULT NULL;

-- Phase 2, Task 6: Add enabled_services jsonb column to companies
ALTER TABLE public.companies ADD COLUMN enabled_services jsonb DEFAULT '[]'::jsonb;

-- Phase 2, Task 7: Platform settings table for sidebar menu order
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Admins can read/write platform_settings
CREATE POLICY "Admins can manage platform settings"
ON public.platform_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- All authenticated users can read platform_settings
CREATE POLICY "Authenticated users can read platform settings"
ON public.platform_settings FOR SELECT TO authenticated
USING (true);

-- Admin update policy for companies (archive, toggle services)
CREATE POLICY "Admins can update all companies"
ON public.companies FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
