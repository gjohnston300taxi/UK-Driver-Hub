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

interface Company {
  id: string
  name: string
  region: string
  rating: number
  description: string
  website_url: string
  pros: string[]
  cons: string[]
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

// Region order for display
const REGION_ORDER = [
  'National 🇬🇧',
  'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Northern Ireland 🇬🇧',
  'London 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'North East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'North West England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Yorkshire & Humber 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'East Midlands 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'West Midlands 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'South East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'South West England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Republic of Ireland 🇮🇪'
]

export default function ResourcesPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'cities' | 'companies' | 'faq' | 'guides' | 'useful'>('cities')
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [showRegionalCompanies, setShowRegionalCompanies] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  
  // Companies from database
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)

  useEffect(() => {
    loadUser()
    loadCompanies()
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

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('rating', { ascending: false })

    if (!error && data) {
      setCompanies(data)
    }
    setLoadingCompanies(false)
  }

  // Group companies by region
  const companiesByRegion = companies.reduce((acc, company) => {
    if (!acc[company.region]) {
      acc[company.region] = []
    }
    acc[company.region].push(company)
    return acc
  }, {} as { [key: string]: Company[] })

  // Get sorted regions
  const sortedRegions = REGION_ORDER.filter(region => companiesByRegion[region])

  // Get national/major platforms
  const nationalCompanies = companiesByRegion['National 🇬🇧'] || []

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    setShowRegionalCompanies(true)
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
            { id: 'guides', label: '📖 Best Practice' },
            { id: 'useful', label: '🎓 Be Useful' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                minWidth: '100px',
                padding: '10px 8px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px',
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
              
              {loadingCompanies ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Loading companies...</p>
              ) : (
                <>
                  {/* Major Platforms (National) */}
                  {nationalCompanies.length > 0 && (
                    <>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#666' }}>📱 Major Platforms</h4>
                      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                        {nationalCompanies.map(company => (
                          <div
                            key={company.id}
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
                                {getInitials(company.name)}
                              </div>
                              <div>
                                <h5 style={{ margin: 0, fontSize: '16px' }}>{company.name}</h5>
                                <div style={{ fontSize: '14px' }}>{renderStars(company.rating)} ({company.rating})</div>
                              </div>
                            </div>
                            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>{company.description}</p>
                            
                            {company.website_url && (
                              <a 
                                href={company.website_url} 
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
                                  marginBottom: (company.pros?.length > 0 || company.cons?.length > 0) ? '12px' : '0'
                                }}
                              >
                                🌐 Visit Website
                              </a>
                            )}
                            
                            {(company.pros?.length > 0 || company.cons?.length > 0) && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                {company.pros?.length > 0 && (
                                  <div>
                                    <strong style={{ color: '#16a34a', fontSize: '13px' }}>✓ Pros</strong>
                                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '13px' }}>
                                      {company.pros.map((pro, i) => <li key={i} style={{ marginBottom: '2px' }}>{pro}</li>)}
                                    </ul>
                                  </div>
                                )}
                                {company.cons?.length > 0 && (
                                  <div>
                                    <strong style={{ color: '#dc2626', fontSize: '13px' }}>✗ Cons</strong>
                                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '13px' }}>
                                      {company.cons.map((con, i) => <li key={i} style={{ marginBottom: '2px' }}>{con}</li>)}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Regional Companies */}
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#666' }}>🏢 Regional Companies</h4>
                  
                  {/* Region Selector Button */}
                  <button
                    onClick={() => setShowRegionalCompanies(!showRegionalCompanies)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: showRegionalCompanies ? '#eab308' : '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: showRegionalCompanies ? '12px' : '0'
                    }}
                  >
                    <span>{selectedRegion || 'Select a region to see local companies'}</span>
                    <span style={{ fontSize: '18px' }}>{showRegionalCompanies ? '▲' : '▼'}</span>
                  </button>

                  {/* Region List */}
                  {showRegionalCompanies && !selectedRegion && (
                    <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                      {sortedRegions.filter(r => r !== 'National 🇬🇧').map(region => (
                        <button
                          key={region}
                          onClick={() => handleRegionSelect(region)}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '15px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>{region}</span>
                          <span style={{ color: '#666', fontSize: '13px' }}>
                            {companiesByRegion[region]?.length || 0} companies
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Region Companies */}
                  {showRegionalCompanies && selectedRegion && (
                    <>
                      <button
                        onClick={() => setSelectedRegion('')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          marginBottom: '12px'
                        }}
                      >
                        ← Back to regions
                      </button>

                      <div style={{ display: 'grid', gap: '12px' }}>
                        {companiesByRegion[selectedRegion]?.map(company => (
                          <div
                            key={company.id}
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
                            
                            {company.website_url && (
                              <a 
                                href={company.website_url} 
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
                                  marginBottom: (company.pros?.length > 0 || company.cons?.length > 0) ? '12px' : '0'
                                }}
                              >
                                🌐 Visit Website
                              </a>
                            )}
                            
                            {(company.pros?.length > 0 || company.cons?.length > 0) && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                {company.pros?.length > 0 && (
                                  <div>
                                    <strong style={{ color: '#16a34a', fontSize: '13px' }}>✓ Pros</strong>
                                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px' }}>
                                      {company.pros.map((pro, i) => <li key={i} style={{ marginBottom: '2px' }}>{pro}</li>)}
                                    </ul>
                                  </div>
                                )}
                                {company.cons?.length > 0 && (
                                  <div>
                                    <strong style={{ color: '#dc2626', fontSize: '13px' }}>✗ Cons</strong>
                                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px' }}>
                                      {company.cons.map((con, i) => <li key={i} style={{ marginBottom: '2px' }}>{con}</li>)}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
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

          {/* Be a Useful Driver Tab */}
          {activeTab === 'useful' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>🎓 Be a Useful Driver</h3>
              <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
                Learn how to provide excellent service and stand out from the crowd
              </p>

              {/* YouTube Video Embed */}
              <div style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
                borderRadius: '12px',
                backgroundColor: '#000'
              }}>
                <iframe
                  src="https://www.youtube.com/embed/ZbyqL2zoX54"
                  title="Be a Useful Driver"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                />
              </div>

              {/* Additional Info Below Video */}
              <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
                  💡 Key Takeaways
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '14px', lineHeight: '1.8' }}>
                  <li>First impressions matter - keep your vehicle clean and tidy</li>
                  <li>Be professional and courteous with every passenger</li>
                  <li>Know your area well to provide efficient routes</li>
                  <li>Small touches like phone chargers and water can make a big difference</li>
                  <li>Good reviews lead to more bookings and better earnings</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
