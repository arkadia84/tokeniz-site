
-- Fix search_path on prevent_onchain_delete (the other warnings are pre-existing)
CREATE OR REPLACE FUNCTION public.prevent_onchain_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.nft_id IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot delete a company that has been minted on-chain (nft_id: %)', OLD.nft_id;
  END IF;
  RETURN OLD;
END;
$$;
