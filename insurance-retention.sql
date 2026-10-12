-- UK Driver Hub: insurance quote requests – clean-up rules
-- Run this ONCE in Supabase: SQL Editor -> New query -> paste -> Run.

-- 1. Automatically delete quote requests older than 1 month, every night at 3am.
--    (This matches the promise in the privacy policy, section 5.)
create extension if not exists pg_cron;

select cron.schedule(
  'delete-old-insurance-enquiries',
  '0 3 * * *',
  $$ delete from public.insurance_enquiries where created_at < now() - interval '1 month' $$
);

-- 2. The form no longer asks for details of penalty points, so remove any
--    details already saved on older requests.
update public.insurance_enquiries set points_details = null where points_details is not null;

-- 3. Remove the "Drivers can submit enquiries" rule.
--    The website's server now saves quote requests itself, so this rule is not
--    needed, and removing it stops anyone adding rows to the table directly.
drop policy if exists "Drivers can submit enquiries" on public.insurance_enquiries;
