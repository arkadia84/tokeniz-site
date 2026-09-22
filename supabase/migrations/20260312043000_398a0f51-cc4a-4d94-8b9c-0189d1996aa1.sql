
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_name text NOT NULL,
  company_type text DEFAULT 'Series LLC',
  jurisdiction text DEFAULT 'Wyoming, USA',
  formation_status text DEFAULT 'pending',
  plan text DEFAULT 'essential',
  payment_method text DEFAULT 'crypto',
  deposit_amount numeric DEFAULT 0,
  revenue_generated numeric DEFAULT 0,
  potential_revenue numeric DEFAULT 0,
  ein_status text DEFAULT 'pending',
  operating_agreement_status text DEFAULT 'pending',
  banking_status text DEFAULT 'pending',
  kyc_status text DEFAULT 'pending',
  wallet_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own companies" ON public.companies
  FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies" ON public.companies
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies" ON public.companies
  FOR UPDATE TO public USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all companies" ON public.companies
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
