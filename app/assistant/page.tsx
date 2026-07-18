'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Profile {
  id: string
  name: string
  region: string
}

export default function AssistantPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])
  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
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
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: inputValue.trim() }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Guests: let them ask, then invite them to sign up (their question is NOT sent to the AI)
    if (!user) {
      setShowSignupPrompt(true)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      })
      if (!response.ok) throw new Error('Failed to get response')
      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.content }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    "What are my legal rights if a passenger refuses to pay?",
    "Do I need a separate licence to work in another council area?",
    "What should I do legally after a road accident?",
    "How can I improve my knowledge of private hire regulations?",
    "Can I pick up passengers in a council area I'm not licensed in?",
    "My licence has been suspended or revoked — how do I appeal?",
    "A passenger has made a false complaint against me — what are my rights?"
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, maxWidth: '680px', width: '100%', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>⚖️ Legal & Industry Assistant</h2>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Ask your legal questions and build your industry knowledge — licensing, tax, the Highway Code, driver issues and more</p>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>General information only — not formal legal advice. For serious matters, check with your licensing authority or a solicitor.</p>
        </div>

        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '400px' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#666', marginBottom: '20px' }}>👋 Hello{profile?.name ? `, ${profile.name}` : ''}! Ask me any legal or industry question.</p>
                <p style={{ color: '#999', fontSize: '14px', marginBottom: '16px' }}>Try asking:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {suggestedQuestions.map((question, index) => (
                    <button key={index} onClick={() => setInputValue(question)} style={{ padding: '12px 16px', backgroundColor: '#fef3c7', border: '1px solid #eab308', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', textAlign: 'left', color: '#333' }}>{question}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div key={index} style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '85%', padding: '12px 16px', borderRadius: '12px', backgroundColor: message.role === 'user' ? '#eab308' : '#f3f4f6', color: message.role === 'user' ? 'black' : '#333' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: message.role === 'user' ? 'rgba(0,0,0,0.6)' : '#666' }}>{message.role === 'user' ? 'You' : '⚖️ Assistant'}</div>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '15px' }}>{message.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#f3f4f6' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#666' }}>⚖️ Assistant</div>
                      <div style={{ color: '#666' }}>Thinking...</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', gap: '8px' }}>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ask a legal or industry question..." disabled={isLoading} style={{ flex: 1, padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', outline: 'none' }} />
            <button type="submit" disabled={isLoading || !inputValue.trim()} style={{ padding: '12px 20px', backgroundColor: isLoading || !inputValue.trim() ? '#d1d5db' : '#eab308', color: 'black', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer', fontSize: '14px' }}>{isLoading ? '...' : 'Send'}</button>
          </form>
        </div>
      </main>

      {showSignupPrompt && (
        <div onClick={() => setShowSignupPrompt(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px 24px', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>⚖️</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700 }}>Sign up free to see your answer</h3>
            <p style={{ color: '#666', margin: '0 0 20px 0', fontSize: '15px', lineHeight: 1.5 }}>Create a free account to get your answer and ask the Legal & Industry Assistant anything you like.</p>
            <a href="/signup" style={{ display: 'block', padding: '13px', backgroundColor: '#eab308', color: 'black', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', marginBottom: '10px' }}>Sign up free</a>
            <a href="/signin" style={{ display: 'block', padding: '13px', backgroundColor: '#f3f4f6', color: '#333', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', marginBottom: '10px', border: '1px solid #d1d5db' }}>I already have an account</a>
            <button onClick={() => setShowSignupPrompt(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px' }}>Back to chat</button>
          </div>
        </div>
      )}
    </div>
  )
}
