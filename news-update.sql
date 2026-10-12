-- UK Driver Hub: news page update (12 October 2026)
-- Run this ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
-- Run it BEFORE publishing the new website code.

-- 1. New "What it means for drivers" box for each story
alter table public.news add column if not exists takeaway text;

-- 2. Tidy up spaces and fix spelling mistakes in source names
update public.news set source = trim(source) where source is not null and source <> trim(source);

update public.news set source = 'Wales Online'            where source in ('Walse Online', 'Wales online', 'WalesOnline');
update public.news set source = 'The Herald'              where source in ('The Herarld', 'Herald', 'The herald');
update public.news set source = 'Sky News'                where source in ('sky News', 'Sky news', 'sky news');
update public.news set source = 'BBC News'                where source in ('BBC NEWS', 'BBC news', 'bbc news', 'BBC');
update public.news set source = 'STV News'                where source in ('STV', 'stv', 'STV news');
update public.news set source = 'Cornwall Live'           where source in ('Cornwall live');
update public.news set source = 'Glasgow Times'           where source in ('Glasgow times');
update public.news set source = 'The Press and Journal'   where source in ('P&J', 'Press and Journal', 'The Press & Journal', 'Press & Journal');
update public.news set source = 'The Telegraph'           where source in ('Telegraph');
update public.news set source = 'Manchester Evening News' where source in ('Evening Manchester News');
update public.news set source = 'UK Parliament'           where source in ('UK Parlament');
update public.news set source = 'The Independent'         where source in ('The Independent News', 'Independent');
update public.news set source = 'Suzy Lamplugh Trust'     where source in ('Suzy Lumplugh Trust');
update public.news set source = 'Edinburgh Evening News'  where source in ('Edinburgh news', 'Edinburgh News');
update public.news set source = 'BreakingNews.ie'         where source in ('Breaking News. ie', 'Breaking News.ie');
update public.news set source = 'The Northern Echo'       where source in ('The Northen Echo', 'Northern Echo');
update public.news set source = 'Grimsby Live'            where source in ('Grimbsy Live');
update public.news set source = 'The Standard'            where source in ('standard', 'Standard');
update public.news set source = 'LocalGov'                where source in ('local Gov', 'Local Gov');
update public.news set source = 'Professional Driver'     where source in ('Proffesional Driver');
update public.news set source = 'Leicester Live'          where source in ('Lestister Live');
update public.news set source = 'The Westmorland Gazette' where source in ('The Westmoreland Gazette');
update public.news set source = 'Macclesfield Nub News'   where source in ('Maccisefield Nub News');
update public.news set source = 'Watford Observer'        where source in ('Watford Obsever');
update public.news set source = 'MSN'                     where source in ('msn');
update public.news set source = 'GOV.UK'                  where source in ('Gov.uk', 'gov.uk');
update public.news set source = 'The Mirror'              where source in ('Mirror');
update public.news set source = 'Stoke-on-Trent Live'     where source in ('Stoke On Trent Live');
update public.news set source = 'Unite the Union'         where source in ('Unite The Union');
update public.news set source = 'TheyWorkForYou'          where source in ('They Work For You');

-- 3. Make categories match the list in the admin page
update public.news set category = 'Safety'            where lower(category) = 'safety';
update public.news set category = 'Regulation Update' where lower(category) in ('government', 'regulation', 'regulation update', 'licensing');
update public.news set category = 'Technology'        where lower(category) in ('technology', 'tech');
update public.news set category = 'Industry News'
  where category is null
     or category not in ('Industry News', 'Regulation Update', 'Technology', 'Business Tips',
                         'Safety', 'Local News', 'Events', 'Announcements');

-- 4. Remove the duplicate "Knowledge test" story (keeps the earliest one)
delete from public.news
where title = 'Knowledge test for taxi drivers axed by council'
  and id not in (
    select id from public.news
    where title = 'Knowledge test for taxi drivers axed by council'
    order by created_at asc
    limit 1
  );

-- 5. Ten new stories (12 Aug – 11 Oct 2026). Summaries are written in our own words.
--    You can edit or delete any of these afterwards in Admin -> News.
--    (Safe to run twice: stories already on the site are skipped.)
insert into public.news (title, summary, takeaway, source, source_url, category, created_at)
select v.title, v.summary, v.takeaway, v.source, v.source_url, v.category, v.created_at::timestamptz
from (values
(
  'Uber and Wayve licensed to run supervised robotaxis in London',
  'Transport for London has granted Uber and British self-driving company Wayve private hire vehicle licences to operate Wayve''s autonomous cars in the capital. The vehicles are electric Ford Mustang Mach-Es fitted with cameras, radar and Wayve''s AI driving software. For now a trained, TfL-licensed private hire driver must be on board to supervise every trip and take over if needed. No firm launch date for passenger rides has been given.',
  'Driverless cars are coming to London, but for now every one still needs a licensed PHV driver on board. Keep an eye on how quickly that changes.',
  'Business Traveller',
  'https://www.businesstraveller.com/news/london-gives-uber-and-wayve-the-green-light-on-robotaxis/',
  'Technology',
  '2026-08-18 09:00:00+01'
),
(
  'Next Making Tax Digital deadline is 7 November',
  'More than 436,000 sole traders and landlords sent HMRC their first quarterly update under Making Tax Digital for Income Tax by the 7 August deadline. The rules apply to anyone earning over £50,000 a year from self-employment or property since April 2026, and the threshold drops to £30,000 from April 2027. The second quarter (6 July to 5 October) must be submitted by 7 November 2026. HMRC says it will not issue penalty points for late quarterly updates during 2026/27, but a points-based penalty system starts from April 2027.',
  'If your takings are over £50,000, your next quarterly update is due by 7 November. If you earn over £30,000, you will need to join from April 2027, so get set up now.',
  'TaxiPoint',
  'https://www.taxi-point.co.uk/post/four-quarterly-tax-reporting-dates-taxi-drivers-and-self-employed-workers-must-not-miss-under-new-di',
  'Business Tips',
  '2026-08-20 09:00:00+01'
),
(
  'Aberdeenshire taxi fares to rise by 5%',
  'Aberdeenshire Council''s licensing sub-committee has approved a 5% increase in regulated taxi fares, by five votes to three. The starting fare for the first 880 yards goes up from £3.15 to around £3.31. The rise takes effect once the statutory appeal period has passed, with council papers pointing to 1 October 2026. One local operator, which had asked for 10%, says its fleet has shrunk from around 100 cars to about 75 in two years.',
  'Aberdeenshire drivers can expect a small fare rise from around October. Check your meter has been updated to the new tariff.',
  'TaxiPoint',
  'https://www.taxi-point.co.uk/post/taxi-fares-to-jump-5-across-aberdeenshire-as-operator-warns-fleet-has-already-plunged-by-25-vehicle',
  'Local News',
  '2026-09-01 09:00:00+01'
),
(
  'Private hire operators must carry out right to work checks from 1 October',
  'From 1 October 2026, private hire operators have a clear legal duty to check that the drivers they use have the right to work in the UK. The Home Office says responsibility now sits with the organisation that engages the driver, alongside the checks councils already make when issuing licences. A minister said relying on licensing checks alone had left it unclear who was accountable, especially for app-based and subcontracting models.',
  'Expect your operator or app to ask you for right-to-work documents or a share code. Have your passport or eVisa share code ready.',
  'TaxiPoint',
  'https://www.taxi-point.co.uk/post/private-hire-operators-face-legal-duty-to-carry-out-driver-right-to-work-checks-from-october',
  'Regulation Update',
  '2026-09-04 09:00:00+01'
),
(
  'TfL tightens London licensing rules on debts and app account sharing',
  'Transport for London has published a new 130-page taxi and private hire driver licensing policy, which applies from 1 September 2026. Applicants must now declare they owe TfL nothing, including Congestion Charge, ULEZ charges and fines, and repeated non-payment can count against them. Sharing an app account can lead to a licence being refused or revoked, even if the other person never took a booking, and this now covers taxi drivers as well as PHV drivers. Serious cycling offences are now considered separately, and all London taxis must display new TfL signage from 4 January 2027.',
  'London drivers: clear any unpaid TfL charges before renewing, and never let anyone else use your app account.',
  'TaxiPoint',
  'https://www.taxi-point.co.uk/post/tfl-makes-several-london-taxi-and-private-hire-licensing-policy-changes-as-new-rules-target-driver-d',
  'Regulation Update',
  '2026-09-06 09:00:00+01'
),
(
  'Government confirms draft taxi bill will tackle disabled passenger access',
  'Transport minister Simon Lightwood has told Parliament that the Department for Transport will publish a draft Taxi and Private Hire Vehicle Bill for early scrutiny before it is formally introduced. Answering a question about accessible transport in rural and coastal areas, he said the aim is to strengthen existing protections and remove barriers to travel for disabled passengers. No publication date for the draft bill has been given yet.',
  'The biggest change to taxi law in decades is still on its way. When the draft bill is published, drivers will have a chance to have their say.',
  'TaxiPoint',
  'https://www.taxi-point.co.uk/post/government-confirms-draft-taxi-and-phv-bill-will-target-disabled-passenger-access',
  'Regulation Update',
  '2026-09-11 09:00:00+01'
),
(
  'LEVC confirms all-new electric London black cab for 2027',
  'LEVC has confirmed a new battery-electric black cab, designed to meet TfL licensing rules, will launch in the second half of 2027. The announcement comes as production of the current TX ends at LEVC''s Ansty factory after eight years and more than 12,000 cabs sold worldwide. Owner Geely is backing the new model, and early sketches show a shape that develops the TX design. Full specifications have not yet been released.',
  'Thinking of replacing your cab? A new model is due in late 2027, which could affect prices and part-exchange values of the current TX.',
  'Automotive World',
  'https://www.automotiveworld.com/news/levc-confirms-new-london-black-cab-for-2027-launch/',
  'Technology',
  '2026-09-16 09:00:00+01'
),
(
  'Gwynedd taxi fares set to rise from 1 October',
  'Gwynedd Council is set to raise its maximum taxi fares from 1 October 2026 after a public consultation received no objections. The fare for journeys under one mile goes up from £3.60 to £4. The late-night tariff will start earlier, at 10pm instead of midnight, running until 7am, while the late-night premium drops from 60% to 50% above the standard rate.',
  'Gwynedd drivers: new fares and night-time hours start in October, so make sure your meter is recalibrated.',
  'TaxiPoint',
  'https://www.taxi-point.co.uk/post/gwynedd-council-taxi-fare-rise-set-for-final-decision-after-consultation-receives-no-objections',
  'Local News',
  '2026-09-18 09:00:00+01'
),
(
  'Cumberland consults on £7 two-mile taxi fare',
  'Cumberland Council has opened a consultation on a single taxi tariff across the former Allerdale, Carlisle and Copeland areas. The maximum daytime fare for a two-mile journey would be set at £7, up from £6 in Allerdale and £6.20 in Copeland, matching Carlisle. The changes apply to hackney carriages only. Objections must be received by 4pm on Friday 23 October, and the new fares could start on 30 November.',
  'Cumberland hackney drivers have until 23 October to comment on the new fares.',
  'TaxiPoint',
  'https://taxi-point.co.uk/post/cumberland-opens-taxi-fare-consultation-as-7-two-mile-tariff-moves-closer-to-introduction',
  'Local News',
  '2026-10-11 09:00:00+01'
),
(
  'New Home Office guidance on right to work checks for taxi and PHV licences',
  'The Home Office has updated its guidance for councils on right to work checks for taxi, private hire and operator licences. It applies to checks from 1 October 2026 and replaces the August 2025 version. Councils must not issue, renew or extend a licence for anyone whose immigration status disqualifies them, and must complete the check before deciding. A licence cannot last longer than the holder''s permission to be in the UK, and eVisa share codes must be right-to-work codes beginning with "W".',
  'Renewing your licence? If you have an eVisa, get a right-to-work share code (it starts with W) from GOV.UK before you apply.',
  'TaxiPoint',
  'https://taxi-point.co.uk/post/fresh-rules-new-right-to-work-home-office-guidance-tells-councils-when-taxi-and-phv-licences-must-b',
  'Regulation Update',
  '2026-10-11 12:00:00+01'
)
) as v(title, summary, takeaway, source, source_url, category, created_at)
where not exists (select 1 from public.news n where n.title = v.title);
