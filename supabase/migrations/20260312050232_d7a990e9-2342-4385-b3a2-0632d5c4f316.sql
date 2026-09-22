
CREATE TABLE public.compliance_filings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  filing_type text NOT NULL,
  filing_name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'formation',
  status text NOT NULL DEFAULT 'pending',
  method text NOT NULL DEFAULT 'manual',
  agent_name text,
  due_date date,
  completed_at timestamp with time zone,
  notes text,
  priority text NOT NULL DEFAULT 'medium',
  recurring boolean NOT NULL DEFAULT false,
  recurrence_interval text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_filings ENABLE ROW LEVEL SECURITY;

-- Users can view filings for their own companies
CREATE POLICY "Users can view own company filings" ON public.compliance_filings
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()
    )
  );

-- Users can update filings for their own companies
CREATE POLICY "Users can update own company filings" ON public.compliance_filings
  FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()
    )
  );

-- Admins can view all filings
CREATE POLICY "Admins can view all filings" ON public.compliance_filings
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert filings
CREATE POLICY "Admins can insert filings" ON public.compliance_filings
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update filings
CREATE POLICY "Admins can update filings" ON public.compliance_filings
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_compliance_filings_updated_at
  BEFORE UPDATE ON public.compliance_filings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
