ALTER TABLE public.insurance_enquiries
  ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE INDEX IF NOT EXISTS insurance_enquiries_user_id_idx
  ON public.insurance_enquiries (user_id);
