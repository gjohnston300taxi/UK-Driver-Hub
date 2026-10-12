'use client'

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
            UK Driver Hub – Privacy Policy
          </h1>
          
          <p style={{ marginBottom: '16px', color: '#666' }}>
            This Privacy Policy explains how UK Driver Hub collects, uses, and protects your personal data in accordance with UK GDPR and applicable data protection laws.
          </p>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>1. Information We Collect</h2>
          <p style={{ marginBottom: '8px' }}>We may collect:</p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '4px' }}>Name and contact details</li>
            <li style={{ marginBottom: '4px' }}>Account and profile information</li>
            <li style={{ marginBottom: '4px' }}>Location or region (if provided)</li>
            <li style={{ marginBottom: '4px' }}>Content you submit to the Platform</li>
            <li style={{ marginBottom: '4px' }}>Insurance quote details, if you request a quote (see section 5)</li>
            <li style={{ marginBottom: '4px' }}>Technical and usage data (IP address, browser type, interactions)</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            We only collect data that is necessary and proportionate.
          </p>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>2. How We Use Your Data</h2>
          <p style={{ marginBottom: '8px' }}>We use your data to:</p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '4px' }}>Operate and improve the Platform</li>
            <li style={{ marginBottom: '4px' }}>Provide features and functionality</li>
            <li style={{ marginBottom: '4px' }}>Communicate updates or service messages</li>
            <li style={{ marginBottom: '4px' }}>Maintain platform security and integrity</li>
          </ul>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Lawful Basis for Processing</h3>
          <p style={{ marginBottom: '8px' }}>Our lawful basis for processing your personal data is:</p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '4px' }}><strong>Consent</strong> – where you have given clear consent for us to process your data for a specific purpose</li>
            <li style={{ marginBottom: '4px' }}><strong>Contractual necessity</strong> – where processing is necessary to provide the services you have requested</li>
            <li style={{ marginBottom: '4px' }}><strong>Legitimate interests</strong> – where processing is necessary for our legitimate business interests, provided these do not override your rights</li>
          </ul>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>3. Data Retention</h2>
          <p style={{ marginBottom: '16px' }}>
            We retain personal data for as long as your account is active, or as needed to provide our services to you.
          </p>
          <p style={{ marginBottom: '16px' }}>
            Data may be retained for up to 6 years after account closure for legal, regulatory, or legitimate business purposes (such as resolving disputes or enforcing our terms).
          </p>
          <p style={{ marginBottom: '16px' }}>
            You may request deletion of your data at any time, subject to legal retention requirements.
          </p>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>4. AI Assistant & Data Processing</h2>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '4px' }}>AI interactions may be processed to improve system performance</li>
            <li style={{ marginBottom: '4px' }}>AI outputs are automated and not human-reviewed by default</li>
            <li style={{ marginBottom: '4px' }}>AI is not used to provide personalised professional advice</li>
          </ul>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h2 id="insurance-quotes" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>5. Insurance Quote Requests</h2>
          <p style={{ marginBottom: '16px' }}>
            If you use our insurance quote form, we collect the details you enter so that our insurance partners can contact you with a quote. You do not need an account to request a quote.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>What we collect</h3>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '4px' }}>Your name, phone number, email address and postcode</li>
            <li style={{ marginBottom: '4px' }}>Licensing details: your licensing council, licence type, how long you have held your taxi or private hire badge and full driving licence</li>
            <li style={{ marginBottom: '4px' }}>Vehicle details: make, model, registration and estimated annual mileage</li>
            <li style={{ marginBottom: '4px' }}>Cover details: cover type, start date, no-claims years and how the vehicle is used</li>
            <li style={{ marginBottom: '4px' }}>Driving history: whether you have any penalty points, and whether you have had claims or convictions in the last 5 years (yes or no answers only, no details)</li>
            <li style={{ marginBottom: '4px' }}>A record of the consent you gave and when you gave it</li>
          </ul>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Why we collect it and our lawful basis</h3>
          <p style={{ marginBottom: '16px' }}>
            We use these details only to pass your quote request to our insurance partners so they can contact you by phone or email. Our lawful basis is your <strong>consent</strong>, which you give by ticking the consent box on the form.
          </p>
          <p style={{ marginBottom: '16px' }}>
            We only ask yes or no about penalty points, claims and convictions. We do not ask for details of any offence; if the insurer needs them, they will ask you directly. We only share these answers with the insurance partners named on the form, and we do not use them for anything else.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Who we share it with</h3>
          <p style={{ marginBottom: '8px' }}>We send your quote request to the insurance partners named on the form at the time you submit it (currently The Taxi Insurer and Gomigo). Once they receive it, they will handle your details under their own privacy policies.</p>
          <p style={{ marginBottom: '16px' }}>
            We also use trusted service providers to store your request securely (Supabase) and to send it by email (Resend).
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>How long we keep it</h3>
          <p style={{ marginBottom: '16px' }}>
            We keep quote requests for 1 month from the date you submit them, so we can deal with any follow-up questions. After that they are automatically deleted from our systems. You can ask us to delete your request sooner at any time. Our insurance partners keep their own copy under their own privacy policies.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Withdrawing consent</h3>
          <p style={{ marginBottom: '16px' }}>
            You can withdraw your consent at any time by emailing <a href="mailto:info@ukdriverhub.org" style={{ color: '#2563eb' }}>info@ukdriverhub.org</a>. We will delete your request and ask our partners to stop contacting you. This does not affect anything we did with your consent before you withdrew it.
          </p>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>6. Third-Party Processors</h2>
          <p style={{ marginBottom: '8px' }}>We may share limited data with trusted service providers for:</p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '4px' }}>Hosting and infrastructure</li>
            <li style={{ marginBottom: '4px' }}>Analytics and performance monitoring</li>
            <li style={{ marginBottom: '4px' }}>Sending emails</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            We do not sell personal data, and we are not paid for passing on insurance quote requests.
          </p>
          <p style={{ marginBottom: '16px' }}>
            If you request an insurance quote, we share your request with our insurance partners as explained in section 5.
          </p>
          <p style={{ marginBottom: '16px' }}>
            Third-party services linked or advertised operate under their own privacy policies.
          </p>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>7. Cookie Policy</h2>
          
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>What are cookies?</h3>
          <p style={{ marginBottom: '16px' }}>
            Cookies are small text files stored on your device to help websites function and improve user experience.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>How we use cookies</h3>
          <p style={{ marginBottom: '8px' }}>UK Driver Hub uses cookies to:</p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '4px' }}>Ensure the Platform functions correctly</li>
            <li style={{ marginBottom: '4px' }}>Analyse usage and performance</li>
            <li style={{ marginBottom: '4px' }}>Remember preferences</li>
          </ul>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Types of cookies used</h3>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '4px' }}><strong>Essential cookies</strong> – required for site operation</li>
            <li style={{ marginBottom: '4px' }}><strong>Analytics cookies</strong> – help us understand usage patterns</li>
            <li style={{ marginBottom: '4px' }}><strong>Preference cookies</strong> – remember settings</li>
          </ul>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Cookie consent</h3>
          <p style={{ marginBottom: '16px' }}>
            When you first visit the Platform, you will see a cookie consent notice allowing you to accept or manage cookies. You can change cookie settings at any time via your browser.
          </p>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>8. Data Security</h2>
          <p style={{ marginBottom: '16px' }}>
            We apply appropriate technical and organisational measures to protect personal data. However, no system can be guaranteed to be fully secure.
          </p>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>9. Your Rights</h2>
          <p style={{ marginBottom: '8px' }}>Under UK GDPR, you have the right to:</p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '4px' }}>Access your personal data</li>
            <li style={{ marginBottom: '4px' }}>Request correction or deletion</li>
            <li style={{ marginBottom: '4px' }}>Withdraw consent where applicable</li>
            <li style={{ marginBottom: '4px' }}>Object to processing based on legitimate interests</li>
            <li style={{ marginBottom: '4px' }}>Request data portability</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            Requests can be made via the Platform or by contacting us directly.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Right to Complain</h3>
          <p style={{ marginBottom: '16px' }}>
            You have the right to lodge a complaint with the Information Commissioner's Office (ICO) if you believe your data protection rights have been violated. You can contact the ICO at{' '}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
              ico.org.uk
            </a>
            {' '}or by phone on 0303 123 1113.
          </p>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>10. Policy Updates</h2>
          <p style={{ marginBottom: '16px' }}>
            We may update this Privacy Policy periodically. Continued use of the Platform indicates acceptance of the updated policy.
          </p>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>11. Contact</h2>
          <p style={{ marginBottom: '16px' }}>
            For privacy or data protection enquiries, including requests to see or delete your data, email us at{' '}
            <a href="mailto:info@ukdriverhub.org" style={{ color: '#2563eb' }}>info@ukdriverhub.org</a>.
          </p>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <div style={{
            backgroundColor: '#fef3c7',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #eab308'
          }}>
            <p style={{ margin: 0, fontWeight: '500', textAlign: 'center' }}>
              ⚠️ Important reminder: UK Driver Hub provides information and tools only. Always seek qualified legal, tax, or professional advice before making decisions that affect your business, compliance, or livelihood.
            </p>
          </div>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <p style={{ marginBottom: '16px', fontStyle: 'italic', color: '#666', textAlign: 'center' }}>
            Last updated: October 2026
          </p>
        </div>
      </main>
    </div>
  )
}
