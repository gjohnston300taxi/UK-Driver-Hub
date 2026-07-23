-- Keep the legacy fields nullable so existing rows continue to work.
ALTER TABLE public.insurance_enquiries
  ALTER COLUMN date_of_birth DROP NOT NULL,
  ALTER COLUMN years_licensed DROP NOT NULL,
  ALTER COLUMN vehicle_make DROP NOT NULL,
  ALTER COLUMN vehicle_model DROP NOT NULL,
  ALTER COLUMN vehicle_year DROP NOT NULL,
  ALTER COLUMN vehicle_value DROP NOT NULL;

-- Add the new lead-capture columns that the current payload can send.
ALTER TABLE public.insurance_enquiries
  ADD COLUMN IF NOT EXISTS years_held_taxi_badge text,
  ADD COLUMN IF NOT EXISTS years_held_full_licence text,
  ADD COLUMN IF NOT EXISTS best_time_to_call text,
  ADD COLUMN IF NOT EXISTS vehicle_make_model text,
  ADD COLUMN IF NOT EXISTS cover_start_date date,
  ADD COLUMN IF NOT EXISTS estimated_annual_mileage integer,
  ADD COLUMN IF NOT EXISTS consent boolean,
  ADD COLUMN IF NOT EXISTS consent_given_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_text text;
