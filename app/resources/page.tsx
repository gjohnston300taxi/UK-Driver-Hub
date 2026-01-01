'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Profile {
  id: string
  name: string
  region: string
}

// Top 50 Cities Data
const top50Cities = [
  { name: "London", url: "https://tfl.gov.uk/info-for/taxis-and-private-hire/" },
  { name: "Birmingham", url: "https://www.birmingham.gov.uk/info/20107/taxi_and_private_hire/294/information_for_taxi_drivers_private_hire_drivers_and_operators" },
  { name: "Manchester", url: "https://www.manchester.gov.uk/directory_record/451881/new_driver_application_-_hackney_carriageprivate_hire" },
  { name: "Glasgow", url: "https://glasgow.gov.uk/article/4720/Application-Form-for-Grant-or-Renewal-of-Taxi-or-Private-Hire-Car-Licence" },
  { name: "Leeds", url: "https://www.leeds.gov.uk/licensing/taxi-and-private-hire-licensing/applying-for-a-hackney-carriage-or-private-hire-drivers-licence" },
  { name: "Sheffield", url: "https://www.sheffield.gov.uk/business/licences-permits-registrations/taxi-licensing" },
  { name: "Liverpool", url: "https://liverpool.gov.uk/business/licences-and-permits/taxi-licences/" },
  { name: "Bradford", url: "https://www.bradford.gov.uk/transport-and-travel/hackney-carriages-and-private-hire/how-do-i-become-a-hackney-carriage-or-private-hire-driver/" },
  { name: "Bristol", url: "https://www.bristol.gov.uk/business/licences-and-permits/taxis-and-private-hire-licensing" },
  { name: "Edinburgh", url: "https://www.edinburgh.gov.uk/directory-record/1099589/taxi-driver-licence" },
  { name: "Leicester", url: "https://www.leicester.gov.uk/business/licences-and-permits/transport-and-street-licences-and-permits/taxi-licensing/" },
  { name: "Coventry", url: "https://www.coventry.gov.uk/hackney-carriage-ie-taxi-private-hire-licensing" },
  { name: "Hull", url: "https://www.hull.gov.uk/downloads/download/64/taxi-licensing" },
  { name: "Stoke-on-Trent", url: "https://www.stoke.gov.uk/info/20030/taxis" },
  { name: "Nottingham", url: "https://www.nottinghamcity.gov.uk/information-for-business/business-information-and-support/business-and-trading-licences-and-permits/contact-licensing/" },
  { name: "Newcastle upon Tyne", url: "https://www.newcastle.gov.uk/services/licences-and-permits/taxi-and-private-hire" },
  { name: "Sunderland", url: "https://www.sunderland.gov.uk/article/16391/Hackney-Carriage-and-Private-Hire-Licensing" },
  { name: "Southampton", url: "https://www.southampton.gov.uk/business-licensing/licensing/taxis-private-hire/" },
  { name: "Derby", url: "https://www.derby.gov.uk/licensing/taxis/taxi-drivers/" },
  { name: "Portsmouth", url: "https://www.portsmouth.gov.uk/services/licensing/vehicles-and-driving/private-hire-drivers-licence/" },
  { name: "Brighton and Hove", url: "https://www.brighton-hove.gov.uk/taxi-licences" },
  { name: "Plymouth", url: "https://www.plymouth.gov.uk/taxi-licensing" },
  { name: "Wolverhampton", url: "https://www.wolverhampton.gov.uk/licences/taxi-licences" },
  { name: "Reading", url: "https://www.reading.gov.uk/business/licences/taxi-and-private-hire-licensing/" },
  { name: "Aberdeen", url: "https://www.aberdeencity.gov.uk/services/services-business/licences-and-permits/taxi-licence" },
  { name: "Milton Keynes", url: "https://www.milton-keynes.gov.uk/environmental-health/licensing/taxi-licensing" },
  { name: "Swansea", url: "https://www.swansea.gov.uk/taxi?lang=en" },
  { name: "Luton", url: "https://m.luton.gov.uk/Page/Show/Business/Business_support_and_advice/licensing-and-regulation/Permits%20Authorisations%20and%20Licences/taxiandprivatehire/Pages/default.aspx" },
  { name: "Middlesbrough", url: "https://www.middlesbrough.gov.uk/business-and-licensing/licences/taxi-licensing/" },
  { name: "Belfast", url: "https://www.nidirect.gov.uk/services/apply-or-renew-taxi-driver-licence" },
  { name: "Northampton", url: "https://www.northnorthants.gov.uk/taxi-licensing" },
  { name: "York", url: "https://www.york.gov.uk/taxi-private-hire-vehicles/hackney-carriage-private-hire-drivers-licences" },
  { name: "Blackpool", url: "https://www.blackpool.gov.uk/Business/Licensing-and-permits/Taxis-landaus-and-private-hire/Hackney-carriage-and-private-hire-driver.aspx" },
  { name: "Peterborough", url: "https://www.peterborough.gov.uk/business/licences-and-permits/taxis-and-private-hire/private-hire" },
  { name: "Norwich", url: "https://new.norwich.gov.uk/licensing/taxi-and-private-hire" },
  { name: "Cambridge", url: "https://www.cambridge.gov.uk/taxi-licensing" },
  { name: "Doncaster", url: "https://www.doncaster.gov.uk/services/business-investment/taxi-licensing" },
  { name: "Ipswich", url: "https://www.ipswich.gov.uk/licences-and-permits/taxi-licensing" },
  { name: "Exeter", url: "https://exeter.gov.uk/licensing/taxis-and-private-hire/taxi-services/" },
  { name: "Dundee", url: "https://www.dundeecity.gov.uk/licensing/taxis-and-private-hire-cars" },
  { name: "Chelmsford", url: "https://www.chelmsford.gov.uk/business/licensing/taxis/" },
  { name: "Colchester", url: "https://www.colchester.gov.uk/licensing/taxi-private-hire/?id=&page=taxis--and--private--hire" },
  { name: "Gloucester", url: "https://www.gloucester.gov.uk/licensing-regulations/hackney-carriage-private-hire/hackney-carriage-or-private-hire-licensing/" },
  { name: "Warrington", url: "https://www.warrington.gov.uk/taxi" },
  { name: "Basildon", url: "https://www.basildon.gov.uk/article/4654/Licences-Hackney-Carriage-and-Private-Hire-Vehicle" },
  { name: "Huddersfield", url: "https://www.kirklees.gov.uk/beta/licensing/apply-for-a-private-hire-vehicle-licence.aspx" },
  { name: "Woking", url: "https://www.woking.gov.uk/business-licences-permits/licences-permits/taxi-private-hire-licences" },
  { name: "Inverness", url: "https://www.highland.gov.uk/directory_record/738739/taxi_and_private_hire/category/501/taxi_and_private_hire" },
  { name: "Bath", url: "https://www.bathnes.gov.uk/apply-private-hire-vehicle-licence" },
  { name: "Chester", url: "https://www.cheshirewestandchester.gov.uk/business/licensing-and-permits/taxi-licensing/hackney-and-private-hire-licence/apply-to-licence-a-private-hire-vehicle-or-renew-your-existing-licence" }
]

// Main Apps Data
const mainApps = [
  {
    name: "Uber",
    rating: 3.5,
    description: "Uber is one of the largest ride-hailing platforms in the UK. Drivers use the Uber Driver app to accept rides and earn money on their own schedule.",
    pros: [
      "Very large user base → high demand and good ride volume potential (especially in big cities)",
      "Flexibility: many drivers mention being able to \"pick your own hours\"",
      "Relatively easy sign-up, so entry barrier is low"
    ],
    cons: [
      "Many drivers report low fares after deductions",
      "Earnings instability — pay varies widely depending on demand",
      "Work-life balance can be poor: to make \"good money,\" many have to work long hours",
      "Little \"job security\": as a self-employed driver, you're responsible for all costs"
    ]
  },
  {
    name: "Bolt",
    rating: 3.7,
    description: "Bolt is a growing ride-hailing platform offering competitive commission rates and driver-friendly features.",
    pros: [
      "Lower commission rates",
      "Growing platform",
      "Driver-friendly features"
    ],
    cons: [
      "Smaller market share",
      "Fewer rides available",
      "Income is unpredictable and highly depends on ride availability, surge demand, times of day"
    ]
  }
]

// Regional Companies Data
const regionalCompanies: { [key: string]: { name: string; rating: number; description: string; pros?: string[]; cons?: string[] }[] } = {
  "Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿": [
    { name: "Glasgow Taxis", rating: 4.2, description: "One of Glasgow's largest and most established taxi companies, operating a fleet of over 1,000 vehicles serving the Greater Glasgow area." },
    { name: "TOA Taxis Glasgow", rating: 4.3, description: "Traditional hackney cab operator with strong presence in Glasgow city centre and West End. Known for reliable dispatch and good driver support." },
    { name: "Network Private Hire Glasgow", rating: 4.0, description: "Major private hire operator covering Glasgow and surrounding areas. Modern fleet with app and account work available." },
    { name: "City Cabs Glasgow", rating: 4.1, description: "Well-established private hire company with strong local reputation and loyal customer base across Glasgow." },
    { name: "Central Taxis Edinburgh", rating: 4.4, description: "Edinburgh's largest taxi company with over 600 vehicles. Excellent coverage of the city, airport, and major events." },
    { name: "City Cabs Edinburgh", rating: 4.3, description: "Major Edinburgh hackney and private hire operator with strong presence throughout the city and excellent dispatch system." },
    { name: "Capital Cars Edinburgh", rating: 4.2, description: "Long-established private hire firm known for corporate and account work throughout Edinburgh and Lothians." },
    { name: "ComCab Edinburgh", rating: 4.1, description: "Modern taxi operator with good mix of hackney and private hire work, known for efficient dispatch and driver facilities." },
    { name: "Ace Taxis Perth", rating: 4.0, description: "Established Perth operator providing taxi services throughout the city and Perthshire, known for reliable service." },
    { name: "Tele Taxis Dundee", rating: 4.1, description: "Dundee's premier taxi company with comprehensive coverage of the city and surrounding areas, strong local reputation." },
    { name: "Central Taxis Stirling", rating: 4.0, description: "Well-regarded operator serving Stirling and the surrounding region, combining local and tourist trade." },
    { name: "Kingdom Taxis Dunfermline", rating: 4.0, description: "Leading operator in Dunfermline and West Fife, providing taxi services throughout the Kingdom of Fife." },
    { name: "Inverness Taxis", rating: 4.3, description: "An Inverness taxi company that provides safe and sustainable travel in Inverness and Scotland at large." },
    { name: "Aberdeen Taxis", rating: 3.8, description: "At Aberdeen Taxis, we offer reliable service 24 hours a day, seven days a week, every day of the year." }
  ],
  "Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿": [
    { name: "Dragon Taxis Cardiff", rating: 4.3, description: "Cardiff's largest taxi operator with extensive city coverage and a large fleet serving the capital and surrounding areas." },
    { name: "Capital Cars Cardiff", rating: 4.2, description: "Modern Cardiff-based private hire company with app booking and corporate accounts." },
    { name: "Premier Taxis Swansea", rating: 4.1, description: "Well-established Swansea operator providing comprehensive service across the city and Swansea Bay area." },
    { name: "Abertawe Taxis Swansea", rating: 4.0, description: "Bilingual taxi service operating throughout Swansea and West Wales with local knowledge." },
    { name: "Coastal Cabs Aberystwyth", rating: 4.0, description: "Serving Aberystwyth and Mid Wales coastal region, popular with students and tourists." },
    { name: "Wrexham Taxis", rating: 3.9, description: "Leading operator in North Wales serving Wrexham and surrounding areas with reliable service." },
    { name: "Newport Taxis", rating: 3.8, description: "Major Newport-based operator serving the city and surrounding Gwent region with modern fleet." },
    { name: "Carmarthen Cabs", rating: 3.8, description: "Leading operator in Carmarthenshire serving the town and wider rural areas of South West Wales." },
    { name: "Blue Riband Taxis Bangor", rating: 3.7, description: "Established Bangor operator covering North West Wales including Anglesey and Gwynedd." },
    { name: "Rhyl Taxis", rating: 3.6, description: "Serving the North Wales coast including Rhyl, Prestatyn and Colwyn Bay areas." }
  ],
  "London 🏴󠁧󠁢󠁥󠁮󠁧󠁿": [
    { name: "Addison Lee", rating: 4.2, description: "One of London's largest and most prestigious private hire operators with premium service focus." },
    { name: "Gett", rating: 4.0, description: "Major London operator focusing on corporate and business travel." },
    { name: "Green Tomato Cars", rating: 3.9, description: "Environmentally focused London operator with hybrid/electric fleet." },
    { name: "Sherbet London", rating: 3.8, description: "Growing London operator with focus on technology and customer service." },
    { name: "Minicabit", rating: 3.7, description: "Platform connecting drivers with minicab firms across London." },
    { name: "Kabbee", rating: 3.7, description: "London aggregator app connecting passengers with multiple operators." }
  ],
  "North East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿": [
    { name: "Blueline Taxis Newcastle", rating: 4.1, description: "One of the largest private hire operators in the North East, serving Newcastle and surrounding areas with a modern fleet." },
    { name: "Noda Taxis Newcastle", rating: 3.9, description: "Popular Newcastle-based operator with app and phone booking system." },
    { name: "Durham Private Hire", rating: 3.9, description: "Serves Durham city and county with focus on quality service." },
    { name: "Premier Taxis Middlesbrough", rating: 3.8, description: "Major operator in Teesside area serving Middlesbrough and surrounding towns." },
    { name: "A2B Radio Cars Sunderland", rating: 3.7, description: "Well-established Sunderland operator with decades of experience." },
    { name: "City Cabs Newcastle", rating: 3.7, description: "Independent Newcastle operator focused on city center trade." },
    { name: "Streamline Taxis Gateshead", rating: 3.6, description: "Gateshead-based operator with modern fleet and technology." }
  ],
  "North West England 🏴󠁧󠁢󠁥󠁮󠁧󠁿": [
    { name: "Street Cars Manchester", rating: 4.0, description: "One of Manchester's largest private hire operators with extensive fleet and customer base." },
    { name: "Arrow Cars Liverpool", rating: 3.9, description: "Liverpool's leading private hire company with decades of service." },
    { name: "Bee Cars Manchester", rating: 3.9, description: "Well-known Manchester private hire with focus on reliability." },
    { name: "Mantax Manchester", rating: 3.8, description: "Large Manchester operator known for airport and city work." },
    { name: "Halton Borough Taxis", rating: 3.8, description: "Serves Halton borough with local focus and community ties." },
    { name: "Delta Taxis Liverpool", rating: 3.7, description: "Major Liverpool operator with strong local presence." },
    { name: "Skyline Taxis Preston", rating: 3.6, description: "Lancashire operator serving Preston and surrounding areas." }
  ],
  "Yorkshire & Humber 🏴󠁧󠁢󠁥󠁮󠁧󠁿": [
    { name: "Amber Cars Leeds", rating: 4.1, description: "One of the largest private hire operators in Yorkshire, serving Leeds and West Yorkshire." },
    { name: "A2B Radio Cars Sheffield", rating: 3.9, description: "Major Sheffield operator with strong city presence and regional coverage." },
    { name: "Streamline Taxis Leeds", rating: 3.8, description: "Popular Leeds operator with modern technology and growing market share." },
    { name: "Huddersfield Private Hire", rating: 3.8, description: "Huddersfield operator with focus on quality service and customer satisfaction." },
    { name: "City Taxis Sheffield", rating: 3.7, description: "Sheffield-based company with focus on city center and local areas." },
    { name: "Ridings Taxis Wakefield", rating: 3.7, description: "Serves Wakefield and Five Towns area with established customer base." },
    { name: "A-Line Taxis Bradford", rating: 3.6, description: "Bradford operator serving the city and surrounding West Yorkshire areas." }
  ],
  "East Midlands 🏴󠁧󠁢󠁥󠁮󠁧󠁿": [
    { name: "DG Cars Nottingham", rating: 4.0, description: "One of Nottingham's leading private hire operators with strong city presence." },
    { name: "Blue Line Taxis Leicester", rating: 3.9, description: "Major Leicester operator with extensive coverage across the city." },
    { name: "Castle Taxis Nottingham", rating: 3.8, description: "Nottingham operator with focus on reliability and customer service." },
    { name: "Northampton Taxi Services", rating: 3.8, description: "Northampton operator with modern fleet and growing presence." },
    { name: "Trent Cars Derby", rating: 3.7, description: "Derby-based operator serving the city and surrounding areas." },
    { name: "Lincoln Private Hire", rating: 3.7, description: "Serves Lincoln city with focus on local community and service quality." },
    { name: "ABC Taxis Leicester", rating: 3.6, description: "Well-established Leicester company with decades of service." }
  ],
  "West Midlands 🏴󠁧󠁢󠁥󠁮󠁧󠁿": [
    { name: "TOA Taxis Birmingham", rating: 4.0, description: "One of Birmingham's largest private hire operators with extensive fleet." },
    { name: "A2B Radio Cars Birmingham", rating: 3.9, description: "Major Birmingham operator with regional coverage across West Midlands." },
    { name: "Five Star Taxis Coventry", rating: 3.8, description: "Coventry-based operator with good reputation and modern fleet." },
    { name: "Castle Cars Birmingham", rating: 3.8, description: "Birmingham operator with focus on quality and reliability." },
    { name: "Central Taxis Wolverhampton", rating: 3.7, description: "Leading Wolverhampton operator serving the Black Country area." },
    { name: "Stoke Taxis", rating: 3.7, description: "Stoke-on-Trent operator serving the Potteries area." },
    { name: "Walsall Private Hire", rating: 3.6, description: "Serves Walsall and surrounding areas with focus on local service." }
  ],
  "East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿": [
    { name: "Panther Taxis Cambridge", rating: 4.0, description: "Cambridge's leading private hire operator serving the city and surrounding areas." },
    { name: "Ace Taxis Chelmsford", rating: 3.9, description: "Chelmsford-based company serving Essex with good reputation." },
    { name: "ABC Taxis Norwich", rating: 3.8, description: "Major Norwich operator with extensive city and regional coverage." },
    { name: "Goldline Taxis Peterborough", rating: 3.8, description: "Peterborough operator with modern fleet and growing customer base." },
    { name: "Luton Airport Cars", rating: 3.8, description: "Specialized in airport transfers and local Luton service." },
    { name: "Ipswich Taxis", rating: 3.7, description: "Leading Ipswich operator with strong local presence." },
    { name: "Colchester Taxis", rating: 3.6, description: "Serves Colchester and North Essex with established customer base." }
  ],
  "South East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿": [
    { name: "Checker Cars Brighton", rating: 4.0, description: "Brighton's leading private hire operator serving the city and coastal areas." },
    { name: "Reading Taxis", rating: 3.9, description: "Leading Reading operator with strong commuter and corporate presence." },
    { name: "Oxford Private Hire", rating: 3.9, description: "Oxford operator serving the university city and surrounding areas." },
    { name: "Gatwick Area Cars", rating: 3.8, description: "Specialized in Gatwick Airport transfers and surrounding areas." },
    { name: "Canterbury Cars", rating: 3.7, description: "Major Canterbury operator serving the historic city and Kent region." },
    { name: "Guildford Taxis", rating: 3.7, description: "Serves Guildford and Surrey with focus on quality service." },
    { name: "Eastbourne Taxis", rating: 3.6, description: "Coastal operator serving Eastbourne and East Sussex." }
  ],
  "South West England 🏴󠁧󠁢󠁥󠁮󠁧󠁿": [
    { name: "V Cars Bristol", rating: 4.0, description: "Bristol's leading private hire operator with extensive city coverage." },
    { name: "Wessex Cars Bath", rating: 3.9, description: "Serves Bath and surrounding areas with focus on quality and heritage tourism." },
    { name: "Streamline Taxis Bristol", rating: 3.8, description: "Major Bristol operator with growing market share and modern technology." },
    { name: "Exeter Taxis", rating: 3.7, description: "Leading Exeter operator serving Devon's county town and region." },
    { name: "Plymouth City Taxis", rating: 3.7, description: "Major Plymouth operator with strong naval and maritime market." },
    { name: "Swindon Cab Company", rating: 3.7, description: "Swindon operator with modern fleet serving North Wiltshire." },
    { name: "Bournemouth Streamline", rating: 3.6, description: "Serves Bournemouth and Poole with focus on coastal tourism." }
  ],
  "Northern Ireland 🇬🇧": [
    { name: "FonaCab", rating: 4.5, description: "Northern Ireland's largest taxi company, based in Belfast. Operating since 1986, they offer both traditional dispatch and app-based booking.", pros: ["Established reputation", "Large customer base", "App and phone booking", "24/7 support", "Reliable work flow", "Driver welfare programs"], cons: ["Commission on bookings", "Vehicle standards required", "May require company affiliation", "Peak time competition"] },
    { name: "Belfast Black Taxi Tours", rating: 4.3, description: "Traditional black cab service offering tours and private hire. Well-known for city tours and airport transfers." },
    { name: "Value Cabs", rating: 4.2, description: "One of Belfast's major taxi operators with a large fleet and extensive customer base across Northern Ireland." },
    { name: "Bolt Belfast", rating: 4.0, description: "Bolt provides ride-hailing services in Belfast with lower commission rates than competitors.", pros: ["Lower commission (15%)", "Growing customer base", "Quick payments", "Driver-friendly app", "Active promotions"], cons: ["Smaller than Uber", "Limited area coverage", "Building customer base", "Peak time dependent"] },
    { name: "Derry Cabs", rating: 3.9, description: "Leading taxi service in Derry/Londonderry area, providing comprehensive coverage across the northwest region." },
    { name: "Uber Belfast", rating: 3.8, description: "Uber operates in Belfast and surrounding areas, offering flexible driving opportunities through their app platform.", pros: ["Flexible schedule", "Weekly payments", "Well-known brand", "Easy to start", "Insurance included"], cons: ["25% commission", "Limited to Belfast area", "Competitive market", "Fuel and maintenance costs"] }
  ],
  "Republic of Ireland 🇮🇪": [
    { name: "FREE NOW Dublin", rating: 4.2, description: "FREE NOW (formerly Hailo and mytaxi) is Ireland's leading taxi app, connecting passengers with licensed taxi drivers across Dublin and other Irish cities.", pros: ["Most popular in Ireland", "Large driver community", "Reliable payment system", "Weekly earnings", "Professional support"], cons: ["Commission fees", "Peak time competition", "App dependency", "Rating system pressure"] },
    { name: "Dublin Airport Taxis", rating: 4.1, description: "Specialist airport taxi service with exclusive rank access at Dublin Airport, Ireland's busiest airport." },
    { name: "Cork Taxi Co-op", rating: 4.0, description: "Cork's premier taxi cooperative serving Cork City and County with over 500 drivers providing reliable transport services." },
    { name: "Bolt Ireland", rating: 3.9, description: "European ride-hailing platform now operating across major Irish cities with competitive commission rates.", pros: ["Lower commission than competitors", "Growing market share", "Modern app interface", "Quick payments", "Driver incentives"], cons: ["Smaller customer base than FREE NOW", "Limited rural coverage", "Building reputation", "App-only bookings"] },
    { name: "National Radio Cabs Dublin", rating: 3.9, description: "One of Dublin's largest and most established taxi companies, operating 24/7 with a fleet of over 1,000 vehicles across the city." },
    { name: "Galway Taxis", rating: 3.8, description: "Galway's leading taxi service covering the city and surrounding areas, known for excellent service during festivals and events." },
    { name: "Limerick Cabs", rating: 3.7, description: "Reliable taxi service in Limerick City and County, serving both local residents and university students." },
    { name: "Waterford Taxis", rating: 3.6, description: "Waterford's established taxi company providing comprehensive coverage across Ireland's oldest city." }
  ]
}

// FAQ Data
const faqData = [
  {
    question: "What's the Difference Between a Taxi Driver and a Private Hire Driver?",
    answer: `**Taxi Driver (Hackney Carriage / Black Cab)**
• Can pick up passengers from the street (hail work)
• Can wait at taxi ranks
• Taximeter required by law
• Fares are set by the local council
• Local Knowledge Test is usually harder

**Private Hire Driver (PHV / Minicab / App Driver)**
• Cannot pick up customers from the street
• All journeys must be pre-booked
• No taxi ranks
• Fares are not regulated — apps or operators set prices
• Licensing tests are usually easier`
  },
  {
    question: "Do I need to sit a knowledge test to get my licence?",
    answer: `In most areas, yes — but it depends on your local council and the type of licence you are applying for.

**Taxi Drivers:** Almost every council requires a knowledge or locality test.

**Private Hire Drivers:** Most councils do require a knowledge test — but it is usually much easier than the taxi (hackney) test.

It's best to check with your local licensing authority.`
  },
  {
    question: "What is a PCO license and do I need one?",
    answer: `A PCO (Private Hire Operator) license is required in London if you want to work as a private hire driver for companies like Uber, Bolt, or traditional minicab firms.

You need three licenses:
• A PCO driver license from Transport for London (TfL)
• Vehicle insurance for private hire
• Your vehicle must be licensed as a private hire vehicle

Outside London, requirements vary by local authority.`
  },
  {
    question: "How much does private hire insurance cost?",
    answer: `Private hire insurance is more expensive than standard car insurance because your vehicle is being used commercially.

On average, expect to pay between £1,500-£5,000 per year.

You can reduce costs by:
• Shopping around using comparison sites
• Choosing pay-as-you-go insurance
• Increasing your voluntary excess
• Installing a dashcam
• Building up a no-claims bonus

Remember: Standard car insurance does NOT cover you for private hire work.`
  },
  {
    question: "Am I self-employed or employed?",
    answer: `Most taxi and private hire drivers in the UK are classified as self-employed, which means:
• You are responsible for your own taxes
• You must pay National Insurance contributions
• You must keep records of your income and expenses
• You must register with HMRC as self-employed
• You must submit an annual Self Assessment tax return

Being self-employed means you can claim tax deductions for legitimate business expenses like fuel, vehicle maintenance, insurance, and licensing fees.`
  },
  {
    question: "What type of vehicle do I need?",
    answer: `Vehicle requirements depend on your local area and which platforms you want to work for.

**For London PCO licensing:**
• Less than 15 years old
• Right-hand drive
• 4 doors and 4 passenger seats minimum
• Meet Euro 6 emissions standards (or be electric/hybrid)

**For Uber (most areas):**
• Less than 10 years old
• 4 doors and 5 seats
• Excellent condition with no cosmetic damage

Electric and hybrid vehicles often have advantages including lower running costs and lower emissions charges.`
  },
  {
    question: "How much can I earn as a private hire driver?",
    answer: `Earnings vary significantly based on location, hours worked, and platform(s) used.

**Typical weekly earnings (before expenses):**
• London: £500-£800+
• Major cities: £400-£600
• Smaller towns: £300-£500

Remember to deduct expenses including:
• Fuel (typically £100-£200/week)
• Insurance (£30-£100/week)
• Vehicle maintenance
• Platform commission (typically 20-25%)

Peak earning times: Friday/Saturday nights, early mornings, special events, bad weather.`
  },
  {
    question: "What are the main costs of being a private hire driver?",
    answer: `**Fixed costs (monthly/annual):**
• Insurance (£125-£400/month)
• Vehicle rental or finance (£200-£500/month)
• Licensing fees
• Phone contracts

**Variable costs:**
• Fuel (25-35% of gross earnings)
• Vehicle maintenance
• Cleaning supplies
• Platform commissions (20-25%)

Many drivers find that total costs represent 40-60% of gross earnings.`
  },
  {
    question: "Do I need to pay the London Congestion Charge and ULEZ?",
    answer: `**Congestion Charge (£15/day):**
• Monday-Friday 7am-6pm, weekends 12pm-6pm
• Private hire vehicles are NOT exempt unless fully electric

**ULEZ (£12.50/day):**
• Operates 24/7 across all London boroughs
• Petrol vehicles must meet Euro 4
• Diesel must meet Euro 6
• Fully electric vehicles are exempt

These charges can add up to £135-£200 per week. Many London drivers are switching to electric or compliant hybrid vehicles.`
  },
  {
    question: "How do I handle taxes as a self-employed driver?",
    answer: `As a self-employed driver, you must:
• Register with HMRC as self-employed
• File a Self Assessment tax return each year (deadline: 31 January)
• Pay Income Tax on profits
• Pay Class 2 and Class 4 National Insurance

**You can deduct expenses including:**
• Fuel costs
• Insurance
• Vehicle maintenance
• Licensing fees
• Phone and data costs

Set aside approximately 20-30% of your profit for taxes.`
  },
  {
    question: "What are the best tips for new drivers?",
    answer: `**Learn your area:** Use quiet times to learn routes, shortcuts, and popular locations.

**Maintain high standards:**
• Keep your car spotlessly clean
• Be polite and professional
• Offer phone chargers and water
• Drive smoothly and safely

**Maximize earnings:**
• Work peak times initially
• Track expenses from day one
• Consider multiple platforms

**Stay safe:**
• Trust your instincts
• Install a dashcam
• Keep emergency numbers saved

Join driver communities online to share tips and learn from experienced drivers.`
  },
  {
    question: "Can I work for multiple platforms at once?",
    answer: `Yes, most drivers work for multiple platforms to maximize earnings.

**Benefits:**
• Reduce empty time between jobs
• Choose the best-paying jobs
• Protection against platform deactivation

**Things to check:**
• Your licence allows it
• Each company's terms allow multi-apping
• Your insurance covers multiple operators
• Keep clear records of income from each platform

**Tax reminder:** All income counts — you must declare total income from all companies.`
  },
  {
    question: "Can I refuse to take a passenger?",
    answer: `**Yes, but only in certain situations:**

**You may refuse if:**
• The passenger is abusive, threatening, or unsafe
• The passenger is too intoxicated to travel safely
• The passenger asks you to break the law
• The passenger cannot pay
• A hazard would make the journey unsafe

**You CANNOT refuse based on:**
• Disability
• Race or ethnicity
• Religion
• Gender or sexuality
• The journey being too short

Refusing without valid reason can lead to licence review.`
  },
  {
    question: "What is MTD (Making Tax Digital)?",
    answer: `MTD stands for Making Tax Digital — an HMRC change that affects self-employed drivers based on gross income.

**If your gross income is over the MTD threshold, you must:**
• Keep digital records of income and expenses
• Send quarterly updates to HMRC using approved software
• Still submit a final yearly tax return

**When does this apply?**
From April 2026 for drivers with gross income over £50,000.

**Our advice:** Start getting used to digital records now. Use our Finance page to keep your digital records and download a CSV file to submit to HMRC or your accountant.`
  }
]

// Best Practice Guides
const bestPracticeGuides = [
  {
    region: "London (TfL)",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    resources: [
      { title: "TfL Taxi & Private Hire Licensing Hub", description: "Main TfL hub for everything taxi and private hire related", url: "https://tfl.gov.uk/info-for/taxis-and-private-hire/" },
      { title: "London Taxi Driver Handbook (PDF)", description: "Official driver handbook covering licensing and regulatory guidance", url: "https://content.tfl.gov.uk/taxi-driver-handbook.pdf" },
      { title: "TfL Guidance for Developers", description: "Policy and regulatory approach for taxi and private hire services", url: "https://tfl.gov.uk/cdn/static/cms/documents/tph-guidance-for-developers.pdf" }
    ]
  },
  {
    region: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    resources: [
      { title: "Taxi & Private Hire Licensing: Best Practice Guidance", description: "Department for Transport guidance on licensing policies and standards", url: "https://www.gov.uk/government/publications/taxi-and-private-hire-vehicle-licensing-best-practice-guidance" },
      { title: "Statutory Taxi & Private Hire Vehicle Standards", description: "Standards focusing on protecting children and vulnerable adults", url: "https://www.gov.uk/government/publications/statutory-taxi-and-private-hire-vehicle-standards" }
    ]
  },
  {
    region: "Scotland",
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    resources: [
      { title: "Taxi & Private Hire Car Licensing: Best Practice Guidance", description: "Scottish Government guidance for licensing authorities and operators", url: "https://www.gov.scot/publications/taxi-private-hire-car-licensing-best-practice-licensing-authorities/" }
    ]
  },
  {
    region: "Northern Ireland",
    flag: "🇬🇧",
    resources: [
      { title: "Taxi Manual: Official Guide for Taxi Drivers", description: "Department for Infrastructure publication covering practical requirements", url: "https://www.infrastructure-ni.gov.uk/publications/taxi-manual" }
    ]
  }
]

export default function ResourcesPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'cities' | 'companies' | 'faq' | 'guides'>('cities')
  const [selectedRegion, setSelectedRegion] = useState<string>('Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      window.location.href = '/signin'
      return
    }

    setUser(user)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData || !profileData.name || !profileData.region) {
      window.location.href = '/onboarding'
      return
    }

    setProfile(profileData)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signin'
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5
    const stars = []
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} style={{ color: '#eab308' }}>★</span>)
    }
    if (hasHalf) {
      stars.push(<span key="half" style={{ color: '#eab308' }}>★</span>)
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} style={{ color: '#d1d5db' }}>★</span>)
    }
    
    return stars
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
              🚕 Driver Hub
            </h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
          
          <a
            href="/profile"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#eab308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: 'black',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
            title={profile?.name}
          >
            {profile?.name?.charAt(0).toUpperCase() || '?'}
          </a>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 99
          }}>
            <nav style={{ 
              display: 'flex', 
              flexDirection: 'column',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <a href="/feed" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>📰 Feed</a>
              <a href="/news" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>📢 News</a>
              <a href="/marketplace" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>🏪 Marketplace</a>
              <a href="/finance" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>💰 Finance</a>
              <a href="/resources" style={{ padding: '16px', color: '#eab308', textDecoration: 'none', fontSize: '16px', fontWeight: '600', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>📚 Resources</a>
              <a href="/assistant" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>🤖 Driver AI Assistant</a>
              <a href="/profile" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>👤 Profile</a>
              <button onClick={() => { setMobileMenuOpen(false); handleSignOut() }} style={{ padding: '16px', backgroundColor: 'transparent', border: 'none', color: '#dc2626', fontSize: '16px', textAlign: 'left', cursor: 'pointer' }}>🚪 Sign Out</button>
            </nav>
          </div>
        )}
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
        {/* Page Title */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>📚 Driver Resources</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Everything you need to succeed as a UK taxi or private hire driver
          </p>
        </div>

        {/* AI Assistant Card */}
        <a
          href="/assistant"
          style={{
            display: 'block',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            color: 'inherit',
            border: '2px solid #eab308'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#eab308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🤖
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#333' }}>Driver AI Assistant</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Ask Me Anything - Get instant answers to your driver questions</p>
            </div>
          </div>
        </a>

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {[
            { id: 'cities', label: '🏙️ Top 50 Cities' },
            { id: 'companies', label: '🚕 Who to Work For' },
            { id: 'faq', label: '❓ FAQ' },
            { id: 'guides', label: '📖 Best Practice' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '10px 8px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                backgroundColor: activeTab === tab.id ? '#eab308' : 'transparent',
                color: activeTab === tab.id ? 'black' : '#666'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          
          {/* Top 50 Cities Tab */}
          {activeTab === 'cities' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>🏙️ Top 50 UK Cities to Work</h3>
              <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
                Click on a city to apply for your taxi/private hire badge
              </p>
              
              <div style={{ display: 'grid', gap: '8px' }}>
                {top50Cities.map((city, index) => (
                  <a
                    key={city.name}
                    href={city.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#eab308',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'black'
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ fontWeight: '500' }}>{city.name}</span>
                    <span style={{ marginLeft: 'auto', color: '#2563eb', fontSize: '14px' }}>Apply →</span>
                  </a>
                ))}
              </div>

              {/* Find Other Cities Link */}
              <a
                href="https://www.gov.uk/find-local-council"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: '#eab308',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'black',
                  textAlign: 'center',
                  fontWeight: '600'
                }}
              >
                🔍 Find Other Cities or Towns
              </a>
            </div>
          )}

          {/* Who to Work For Tab */}
          {activeTab === 'companies' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>🚕 Who to Work For</h3>
              
              {/* Main Apps */}
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#666' }}>📱 Major Platforms</h4>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {mainApps.map(app => (
                  <div
                    key={app.name}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#eab308',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {getInitials(app.name)}
                      </div>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '16px' }}>{app.name}</h5>
                        <div style={{ fontSize: '14px' }}>{renderStars(app.rating)} ({app.rating})</div>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>{app.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <strong style={{ color: '#16a34a', fontSize: '13px' }}>✓ Pros</strong>
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '13px' }}>
                          {app.pros.map((pro, i) => <li key={i} style={{ marginBottom: '2px' }}>{pro}</li>)}
                        </ul>
                      </div>
                      <div>
                        <strong style={{ color: '#dc2626', fontSize: '13px' }}>✗ Cons</strong>
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '13px' }}>
                          {app.cons.map((con, i) => <li key={i} style={{ marginBottom: '2px' }}>{con}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Regional Companies */}
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#666' }}>🏢 Regional Companies</h4>
              
              {/* Region Selector */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  marginBottom: '16px',
                  backgroundColor: 'white'
                }}
              >
                {Object.keys(regionalCompanies).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>

              {/* Companies List */}
              <div style={{ display: 'grid', gap: '12px' }}>
                {regionalCompanies[selectedRegion]?.map(company => (
                  <div
                    key={company.name}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: 'white'
                      }}>
                        {getInitials(company.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: 0, fontSize: '15px' }}>{company.name}</h5>
                        <div style={{ fontSize: '14px' }}>{renderStars(company.rating)} ({company.rating})</div>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>{company.description}</p>
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        display: 'inline-block',
                        padding: '8px 12px', 
                        backgroundColor: '#eab308', 
                        color: 'black', 
                        textDecoration: 'none', 
                        borderRadius: '6px', 
                        fontSize: '13px', 
                        fontWeight: '500',
                        marginBottom: company.pros && company.cons ? '12px' : '0'
                      }}
                    >
                      🌐 Visit Website
                    </a>
                    {company.pros && company.cons && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                        <div>
                          <strong style={{ color: '#16a34a', fontSize: '13px' }}>✓ Pros</strong>
                          <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px' }}>
                            {company.pros.map((pro, i) => <li key={i} style={{ marginBottom: '2px' }}>{pro}</li>)}
                          </ul>
                        </div>
                        <div>
                          <strong style={{ color: '#dc2626', fontSize: '13px' }}>✗ Cons</strong>
                          <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px' }}>
                            {company.cons.map((con, i) => <li key={i} style={{ marginBottom: '2px' }}>{con}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>❓ Industry FAQ</h3>
              <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
                Frequently asked questions about working in the taxi and private hire industry
              </p>

              <div style={{ display: 'grid', gap: '8px' }}>
                {faqData.map((faq, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'left',
                        fontSize: '15px',
                        fontWeight: '500'
                      }}
                    >
                      <span>Q{index + 1}: {faq.question}</span>
                      <span style={{ fontSize: '18px', color: '#666' }}>
                        {expandedFaq === index ? '−' : '+'}
                      </span>
                    </button>
                    {expandedFaq === index && (
                      <div style={{
                        padding: '0 16px 16px 16px',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: '#333',
                        whiteSpace: 'pre-line'
                      }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Practice Guides Tab */}
          {activeTab === 'guides' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>📖 Best Practice Guides</h3>
              <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
                Official guidance documents for taxi and private hire drivers
              </p>

              <div style={{ display: 'grid', gap: '16px' }}>
                {bestPracticeGuides.map(guide => (
                  <div
                    key={guide.region}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
                      {guide.flag} {guide.region}
                    </h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {guide.resources.map((resource, i) => (
                        <a
                          key={i}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'block',
                            padding: '12px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            color: 'inherit',
                            border: '1px solid #e5e7eb'
                          }}
                        >
                          <div style={{ fontWeight: '500', color: '#2563eb', marginBottom: '4px' }}>
                            📄 {resource.title}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            {resource.description}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Wales Note */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  border: '1px solid #eab308'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                    🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    Wales currently does not have a dedicated best practice guide. Welsh drivers should refer to the England guidance where applicable, and check with their local licensing authority for specific requirements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
