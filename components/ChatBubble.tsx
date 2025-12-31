'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
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

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '16px',
          width: '340px',
          maxWidth: 'calc(100vw - 32px)',
          height: '450px',
          maxHeight: 'calc(100vh - 120px)',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            backgroundColor: '#eab308',
            color: 'black',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>🤖 Driver AI Assistant</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Ask me anything</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href="/assistant"
                style={{
                  padding: '6px 10px',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '6px',
                  color: 'black',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
                title="Open full page"
              >
                ↗
              </a>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: 'black'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px'
          }}>
            {messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                color: '#666'
              }}>
                <p style={{ marginBottom: '12px' }}>👋 Hi! How can I help?</p>
                <p style={{ fontSize: '13px', color: '#999' }}>
                  Ask about licensing, tax, highway code, or any driver issue.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: message.role === 'user' ? '#eab308' : '#f3f4f6',
                      color: message.role === 'user' ? 'black' : '#333',
                      fontSize: '14px',
                      lineHeight: '1.4',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#f3f4f6',
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form 
            onSubmit={handleSubmit}
            style={{
              borderTop: '1px solid #e5e7eb',
              padding: '12px',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              style={{
                padding: '10px 16px',
                backgroundColor: isLoading || !inputValue.trim() ? '#d1d5db' : '#eab308',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#eab308',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          zIndex: 999,
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Driver AI Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </>
  )
}
