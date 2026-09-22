
CREATE TABLE public.aoo_amendment_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  series_number integer NOT NULL,
  company_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  batch_sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.aoo_amendment_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage amendment queue"
  ON public.aoo_amendment_queue
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
