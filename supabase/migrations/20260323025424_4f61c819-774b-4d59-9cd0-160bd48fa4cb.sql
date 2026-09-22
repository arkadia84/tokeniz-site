
CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price_amount integer NOT NULL,
  period text NOT NULL DEFAULT '/year',
  stripe_product_id text,
  stripe_price_id text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.products (id, name, description, price_amount, period, stripe_price_id, enabled, display_order) VALUES
  ('essential', 'Essential', 'Series LLC formation with operating agreement.', 4900, '/year', 'price_1TCqtTBVeVwpYk9mXro4OO29', true, 1),
  ('growth', 'Growth', 'Essential + EIN filing + annual report.', 14900, '/year', 'price_1TCquzBVeVwpYk9miXd5NxJl', false, 2),
  ('unicorn', 'Unicorn', 'Growth + banking setup + priority support for startups.', 49900, '/year', 'price_1TCqwgBVeVwpYk9m7HquvBts', false, 3);
