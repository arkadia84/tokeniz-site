
-- Add series_number column to companies
ALTER TABLE public.companies ADD COLUMN series_number integer;

-- Function to get the next series number (global across all companies under the master LLC)
CREATE OR REPLACE FUNCTION public.next_series_number()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(series_number), 0) + 1 FROM public.companies;
$$;

-- Storage bucket for formation document templates and generated docs
INSERT INTO storage.buckets (id, name, public)
VALUES ('formation-documents', 'formation-documents', false);

-- RLS: authenticated users can read their own company docs
CREATE POLICY "Users can read own formation docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'formation-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: service role can insert docs (for edge functions)
CREATE POLICY "Service role can manage formation docs"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'formation-documents')
WITH CHECK (bucket_id = 'formation-documents');
