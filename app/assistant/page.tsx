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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    "What expenses can I claim as a taxi driver?",
    "What should I do if a passenger refuses to pay?",
    "How do I report an accident?",
    "What do you need to know about the traffic laws?"
  ]

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
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
          maxWidth: '680px',
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

        {/* Mobile Menu Dropdown */}
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
              maxWidth: '680px',
              margin: '0 auto'
            }}>
              <a 
                href="/feed" 
                style={{ 
                  padding: '16px', 
                  color: '#333', 
                  textDecoration: 'none', 
                  fontSize: '16px',
                  borderBottom: '1px solid #f3f4f6'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                📰 Feed
              </a>
              <a 
                href="/news" 
                style={{ 
                  padding: '16px', 
                  color: '#333', 
                  textDecoration: 'none', 
                  fontSize: '16px',
                  borderBottom: '1px solid #f3f4f6'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                📢 News
              </a>
              <a 
                href="/marketplace" 
                style={{ 
                  padding: '16px', 
                  color: '#333', 
                  textDecoration: 'none', 
                  fontSize: '16px',
                  borderBottom: '1px solid #f3f4f6'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                🏪 Marketplace
              </a>
              <a 
                href="/finance" 
                style={{ 
                  padding: '16px', 
                  color: '#333', 
                  textDecoration: 'none', 
                  fontSize: '16px',
                  borderBottom: '1px solid #f3f4f6'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                💰 Finance
              </a>
              <a 
                href="/assistant" 
                style={{ 
                  padding: '16px', 
                  color: '#eab308', 
                  textDecoration: 'none', 
                  fontSize: '16px',
                  fontWeight: '600',
                  borderBottom: '1px solid #f3f4f6'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                🤖 Driver AI Assistant
              </a>
              <a 
                href="/profile" 
                style={{ 
                  padding: '16px', 
                  color: '#333', 
                  textDecoration: 'none', 
                  fontSize: '16px',
                  borderBottom: '1px solid #f3f4f6'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                👤 Profile
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleSignOut()
                }}
                style={{
                  padding: '16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '16px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                🚪 Sign Out
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        maxWidth: '680px', 
        width: '100%',
        margin: '0 auto', 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Page Title */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>🤖 Driver AI Assistant</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Ask me anything about licensing, tax, highway code, or driver issues
          </p>
        </div>

        {/* Chat Messages */}
        <div style={{
          flex: 1,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: '400px'
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  👋 Hello{profile?.name ? `, ${profile.name}` : ''}! How can I help you today?
                </p>
                <p style={{ color: '#999', fontSize: '14px', marginBottom: '16px' }}>
                  Try asking:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(question)}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#fef3c7',
                        border: '1px solid #eab308',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textAlign: 'left',
                        color: '#333'
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: message.role === 'user' ? '#eab308' : '#f3f4f6',
                      color: message.role === 'user' ? 'black' : '#333'
                    }}>
                      <div style={{ 
                        fontSize: '11px', 
                        fontWeight: '600',
                        marginBottom: '4px',
                        color: message.role === 'user' ? 'rgba(0,0,0,0.6)' : '#666'
                      }}>
                        {message.role === 'user' ? 'You' : '🤖 Driver AI'}
                      </div>
                      <div style={{ 
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.5',
                        fontSize: '15px'
                      }}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: '#f3f4f6'
                    }}>
                      <div style={{ 
                        fontSize: '11px', 
                        fontWeight: '600',
                        marginBottom: '4px',
                        color: '#666'
                      }}>
                        🤖 Driver AI
                      </div>
                      <div style={{ color: '#666' }}>Thinking...</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Form */}
          <form 
            onSubmit={handleSubmit}
            style={{
              borderTop: '1px solid #e5e7eb',
              padding: '12px 16px',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              style={{
                padding: '12px 20px',
                backgroundColor: isLoading || !inputValue.trim() ? '#d1d5db' : '#eab308',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
