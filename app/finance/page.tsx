'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface EarningsDaily {
  id: string
  user_id: string
  date: string
  total_jobs: number
  cash_amount: number
  account_amount: number
  card_amount: number
  app_amount: number
  total_fares: number
  notes: string | null
  company: string | null
}

interface ExpenseEntry {
  id: string
  user_id: string
  date: string
  category: string
  description: string | null
  amount: number
  receipt_url: string | null
}

interface DailyData {
  date: string
  earnings: EarningsDaily | null
  expenses: ExpenseEntry[]
  dailyNet: number
}

const EXPENSE_CATEGORIES = [
  { id: 'fuel', label: '⛽ Fuel' },
  { id: 'maintenance', label: '🔧 Maintenance' },
  { id: 'car_cleaning', label: '🧽 Car Cleaning' },
  { id: 'tolls_parking', label: '🅿️ Tolls & Parking' },
  { id: 'insurance', label: '🛡️ Insurance' },
  { id: 'radio_commission', label: '📻 Radio/Commission' },
  { id: 'car_rental', label: '🚗 Car Rental' },
  { id: 'car_purchase_lease', label: '💰 Car Purchase/Lease' },
  { id: 'phone', label: '📱 Phone' },
  { id: 'license_fees', label: '📋 License Fees' },
  { id: 'legal_fees', label: '⚖️ Legal Fees' },
  { id: 'other', label: '📦 Other' }
]

// British Date Picker Component
function BritishDatePicker({ value, onChange, label }: { value: string, onChange: (date: string) => void, label?: string }) {
  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatForDisplay = (isoDate: string) => {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    return `${day}/${month}/${year}`
  }

  // Convert DD/MM/YYYY to YYYY-MM-DD for storage
  const parseFromDisplay = (britishDate: string) => {
    const parts = britishDate.split('/')
    if (parts.length === 3) {
      const [day, month, year] = parts
      if (day && month && year && year.length === 4) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
    }
    return ''
  }

  const [displayValue, setDisplayValue] = useState(formatForDisplay(value))

  useEffect(() => {
    setDisplayValue(formatForDisplay(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^\d/]/g, '')
    
    // Auto-add slashes
    if (input.length === 2 && !input.includes('/')) {
      input = input + '/'
    } else if (input.length === 5 && input.split('/').length === 2) {
      input = input + '/'
    }
    
    // Limit length
    if (input.length > 10) input = input.slice(0, 10)
    
    setDisplayValue(input)
    
    // Try to parse and update parent
    if (input.length === 10) {
      const isoDate = parseFromDisplay(input)
      if (isoDate) {
        onChange(isoDate)
      }
    }
  }

  const handleBlur = () => {
    // Validate on blur
    const isoDate = parseFromDisplay(displayValue)
    if (isoDate) {
      const date = new Date(isoDate)
      if (!isNaN(date.getTime())) {
        onChange(isoDate)
        setDisplayValue(formatForDisplay(isoDate))
      }
    }
  }

  // Also support native date picker as fallback
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value
    if (isoDate) {
      onChange(isoDate)
      setDisplayValue(formatForDisplay(isoDate))
    }
  }

  return (
    <div>
      {label && <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="DD/MM/YYYY"
          style={{
            width: '100%',
            padding: '10px 40px 10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        <input
          type="date"
          value={value}
          onChange={handleNativeDateChange}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            opacity: 0,
            cursor: 'pointer'
          }}
        />
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          fontSize: '16px'
        }}>📅</span>
      </div>
    </div>
  )
}

export default function FinancePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week')
  const [earnings, setEarnings] = useState<EarningsDaily[]>([])
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingEarning, setEditingEarning] = useState<EarningsDaily | null>(null)
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null)
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0])
  const [cashAmount, setCashAmount] = useState('')
  const [accountAmount, setAccountAmount] = useState('')
  const [cardAmount, setCardAmount] = useState('')
  const [appAmount, setAppAmount] = useState('')
  const [incomeNotes, setIncomeNotes] = useState('')
  const [incomeCompany, setIncomeCompany] = useState('')
  const [submittingIncome, setSubmittingIncome] = useState(false)
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [expenseCategory, setExpenseCategory] = useState('fuel')
  const [expenseDescription, setExpenseDescription] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseReceipt, setExpenseReceipt] = useState<File | null>(null)
  const [submittingExpense, setSubmittingExpense] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')
  const [showClaimsModal, setShowClaimsModal] = useState(false)
  const [showHighEarnerModal, setShowHighEarnerModal] = useState(false)

  useEffect(() => { loadUser() }, [])
  useEffect(() => { if (user) loadData() }, [user, timeframe])
  useEffect(() => { combineData() }, [earnings, expenses])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/signin'; return }
    setUser(user)
    const { data } = await supabase.from('profiles').select('name, is_admin').eq('id', user.id).single()
    setProfile(data)
    setLoading(false)
  }

  const getDateRange = () => {
    const now = new Date()
    let startDate: string
    if (timeframe === 'week') {
      const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
      startDate = weekAgo.toISOString().split('T')[0]
    } else if (timeframe === 'month') {
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    } else { startDate = '2020-01-01' }
    return { startDate, endDate: now.toISOString().split('T')[0] }
  }

  const loadData = async () => {
    const { startDate, endDate } = getDateRange()
    const { data: earningsData } = await supabase.from('earnings_daily').select('*').eq('user_id', user.id).gte('date', startDate).lte('date', endDate).order('date', { ascending: false })
    setEarnings(earningsData || [])
    const { data: expensesData } = await supabase.from('expense_entries').select('*').eq('user_id', user.id).gte('date', startDate).lte('date', endDate).order('date', { ascending: false })
    setExpenses(expensesData || [])
  }

  const combineData = () => {
    const allDates = new Set<string>()
    earnings.forEach(e => allDates.add(e.date))
    expenses.forEach(e => allDates.add(e.date))
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    const combined: DailyData[] = sortedDates.map(date => {
      const dayEarnings = earnings.find(e => e.date === date) || null
      const dayExpenses = expenses.filter(e => e.date === date)
      const totalEarnings = dayEarnings?.total_fares || 0
      const totalExp = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
      return { date, earnings: dayEarnings, expenses: dayExpenses, dailyNet: totalEarnings - totalExp }
    })
    setDailyData(combined)
  }

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.total_fares), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const netIncome = totalEarnings - totalExpenses
  const totalJobs = earnings.reduce((sum, e) => sum + e.total_jobs, 0)
  const cashAccountTotal = earnings.reduce((sum, e) => sum + Number(e.cash_amount) + Number(e.account_amount), 0)
  const cardAppTotal = earnings.reduce((sum, e) => sum + Number(e.card_amount) + Number(e.app_amount), 0)
  const cashAccountPercent = totalEarnings > 0 ? (cashAccountTotal / totalEarnings * 100).toFixed(1) : '0'
  const cardAppPercent = totalEarnings > 0 ? (cardAppTotal / totalEarnings * 100).toFixed(1) : '0'

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const formatCurrency = (a: number) => `£${a.toFixed(2)}`
  const getCategoryLabel = (id: string) => EXPENSE_CATEGORIES.find(c => c.id === id)?.label || id

  const openIncomeModal = (earning?: EarningsDaily) => {
    if (earning) {
      setEditingEarning(earning); setIncomeDate(earning.date)
      setCashAmount(earning.cash_amount.toString()); setAccountAmount(earning.account_amount.toString())
      setCardAmount(earning.card_amount.toString()); setAppAmount(earning.app_amount.toString())
      setIncomeNotes(earning.notes || '')
      setIncomeCompany(earning.company || '')
    } else {
      setEditingEarning(null); setIncomeDate(new Date().toISOString().split('T')[0])
      setCashAmount(''); setAccountAmount(''); setCardAmount(''); setAppAmount(''); setIncomeNotes(''); setIncomeCompany('')
    }
    setShowIncomeModal(true)
  }

  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmittingIncome(true)
    const cash = parseFloat(cashAmount) || 0, account = parseFloat(accountAmount) || 0
    const card = parseFloat(cardAmount) || 0, app = parseFloat(appAmount) || 0
    const totalFares = cash + account + card + app
    const { data: existing } = await supabase.from('earnings_daily').select('*').eq('user_id', user.id).eq('date', incomeDate).single()
    
    if (existing && !editingEarning) {
      await supabase.from('earnings_daily').update({
        total_jobs: existing.total_jobs + 1, cash_amount: Number(existing.cash_amount) + cash,
        account_amount: Number(existing.account_amount) + account, card_amount: Number(existing.card_amount) + card,
        app_amount: Number(existing.app_amount) + app, total_fares: Number(existing.total_fares) + totalFares,
        notes: incomeNotes || existing.notes, company: incomeCompany || existing.company, updated_at: new Date().toISOString()
      }).eq('id', existing.id)
    } else if (editingEarning) {
      await supabase.from('earnings_daily').update({
        cash_amount: cash, account_amount: account, card_amount: card, app_amount: app,
        total_fares: totalFares, notes: incomeNotes || null, company: incomeCompany || null, updated_at: new Date().toISOString()
      }).eq('id', editingEarning.id)
    } else {
      await supabase.from('earnings_daily').insert([{
        user_id: user.id, date: incomeDate, total_jobs: 1, cash_amount: cash,
        account_amount: account, card_amount: card, app_amount: app, total_fares: totalFares, notes: incomeNotes || null, company: incomeCompany || null
      }])
    }
    setShowIncomeModal(false); setSubmittingIncome(false); loadData()
  }

  const handleDeleteEarning = async (id: string) => {
    if (!confirm('Delete this earnings entry?')) return
    await supabase.from('earnings_daily').delete().eq('id', id); loadData()
  }

  const openExpenseModal = (expense?: ExpenseEntry) => {
    if (expense) {
      setEditingExpense(expense); setExpenseDate(expense.date); setExpenseCategory(expense.category)
      setExpenseDescription(expense.description || ''); setExpenseAmount(expense.amount.toString())
    } else {
      setEditingExpense(null); setExpenseDate(new Date().toISOString().split('T')[0])
      setExpenseCategory('fuel'); setExpenseDescription(''); setExpenseAmount('')
    }
    setExpenseReceipt(null); setShowExpenseModal(true)
  }

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmittingExpense(true)
    let receiptUrl = editingExpense?.receipt_url || null
    if (expenseReceipt) {
      const filePath = `${user.id}/${Date.now()}-${expenseReceipt.name}`
      const { error } = await supabase.storage.from('receipts').upload(filePath, expenseReceipt)
      if (error) { alert('Failed to upload receipt'); setSubmittingExpense(false); return }
      receiptUrl = filePath
    }
    if (editingExpense) {
      await supabase.from('expense_entries').update({
        date: expenseDate, category: expenseCategory, description: expenseDescription || null,
        amount: parseFloat(expenseAmount), receipt_url: receiptUrl
      }).eq('id', editingExpense.id)
    } else {
      await supabase.from('expense_entries').insert([{
        user_id: user.id, date: expenseDate, category: expenseCategory,
        description: expenseDescription || null, amount: parseFloat(expenseAmount), receipt_url: receiptUrl
      }])
    }
    setShowExpenseModal(false); setSubmittingExpense(false); loadData()
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    await supabase.from('expense_entries').delete().eq('id', id); loadData()
  }

  const viewReceipt = async (url: string) => {
    const { data } = await supabase.storage.from('receipts').createSignedUrl(url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const openExportModal = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    setExportStartDate(firstDay.toISOString().split('T')[0])
    setExportEndDate(now.toISOString().split('T')[0])
    setShowExportModal(true)
  }

  const exportCSV = async () => {
    const { data: earningsData } = await supabase.from('earnings_daily').select('*').eq('user_id', user.id).gte('date', exportStartDate).lte('date', exportEndDate).order('date', { ascending: true })
    const { data: expensesData } = await supabase.from('expense_entries').select('*').eq('user_id', user.id).gte('date', exportStartDate).lte('date', exportEndDate).order('date', { ascending: true })
    
    const exportEarnings = earningsData || []
    const exportExpenses = expensesData || []
    
    const expTotalEarnings = exportEarnings.reduce((sum, e) => sum + Number(e.total_fares), 0)
    const expTotalExpenses = exportExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const expNetIncome = expTotalEarnings - expTotalExpenses
    const expTotalJobs = exportEarnings.reduce((sum, e) => sum + e.total_jobs, 0)
    
    // Format dates as DD/MM/YYYY in CSV
    const formatDateForCSV = (isoDate: string) => {
      const [year, month, day] = isoDate.split('-')
      return `${day}/${month}/${year}`
    }
    
    let csv = `Taxi Finance Report\nPeriod: ${formatDateForCSV(exportStartDate)} to ${formatDateForCSV(exportEndDate)}\nGenerated: ${new Date().toLocaleDateString('en-GB')}\n\n`
    csv += 'Date,Type,Category,Description,Cash,Account,Card,App,Total Fares,Expense Amount,Jobs,Notes,Company\n'
    
    const allDates = new Set<string>()
    exportEarnings.forEach(e => allDates.add(e.date))
    exportExpenses.forEach(e => allDates.add(e.date))
    const sortedDates = Array.from(allDates).sort()
    
    sortedDates.forEach(date => {
      const dayEarning = exportEarnings.find(e => e.date === date)
      const dayExpenses = exportExpenses.filter(e => e.date === date)
      const formattedDate = formatDateForCSV(date)
      if (dayEarning) csv += `${formattedDate},Income,,,"${dayEarning.cash_amount}","${dayEarning.account_amount}","${dayEarning.card_amount}","${dayEarning.app_amount}","${dayEarning.total_fares}",,"${dayEarning.total_jobs}","${dayEarning.notes || ''}","${dayEarning.company || ''}"\n`
      dayExpenses.forEach(exp => csv += `${formattedDate},Expense,"${getCategoryLabel(exp.category)}","${exp.description || ''}",,,,,,"${exp.amount}",,,\n`)
    })
    
    csv += `\n--- SUMMARY ---\n`
    csv += `Total Earnings,£${expTotalEarnings.toFixed(2)}\n`
    csv += `Total Expenses,£${expTotalExpenses.toFixed(2)}\n`
    csv += `Net Income,£${expNetIncome.toFixed(2)}\n`
    csv += `Total Jobs,${expTotalJobs}\n`
    
    csv += `\n--- EXPENSES BY CATEGORY ---\n`
    EXPENSE_CATEGORIES.forEach(cat => {
      const catTotal = exportExpenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + Number(e.amount), 0)
      if (catTotal > 0) csv += `${cat.label},£${catTotal.toFixed(2)}\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `taxi-finance-${exportStartDate}-to-${exportEndDate}.csv`; a.click()
    setShowExportModal(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}><p>Loading...</p></div>

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>💰 Finance Tracker</h2>
            <p style={{ color: '#666', margin: 0 }}>Track your earnings and expenses • MTD Ready for April 2026</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => openIncomeModal()} style={{ padding: '10px 16px', backgroundColor: '#eab308', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', flex: '1 1 auto', minWidth: '120px' }}>+ Add Income</button>
            <button onClick={() => openExpenseModal()} style={{ padding: '10px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', flex: '1 1 auto', minWidth: '120px' }}>+ Add Expense</button>
            <button onClick={openExportModal} style={{ padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', flex: '1 1 auto', minWidth: '120px' }}>📥 Export CSV</button>
            <button onClick={() => setShowClaimsModal(true)} style={{ padding: '10px 16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', flex: '1 1 auto', minWidth: '120px' }}>❓ What to Claim</button>
            <button onClick={() => setShowHighEarnerModal(true)} style={{ padding: '10px 16px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', flex: '1 1 auto', minWidth: '120px' }}>💷 Over £50k</button>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '6px', marginBottom: '24px', display: 'inline-flex', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {(['week', 'month', 'all'] as const).map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', backgroundColor: timeframe === tf ? '#eab308' : 'transparent', color: timeframe === tf ? 'black' : '#666' }}>
              {tf === 'week' ? 'Last 7 Days' : tf === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>Total Earnings</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(totalEarnings)}</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>Total Expenses</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(totalExpenses)}</p>
          </div>
          <div style={{ backgroundColor: netIncome >= 0 ? '#dcfce7' : '#fee2e2', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>Net Income</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: netIncome >= 0 ? '#16a34a' : '#dc2626' }}>{formatCurrency(netIncome)}</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>Cash + Account</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(cashAccountTotal)}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>{cashAccountPercent}% of earnings</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>Card + App</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(cardAppTotal)}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>{cardAppPercent}% of earnings</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>Total Jobs</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{totalJobs}</p>
          </div>
        </div>

        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Daily Breakdown</h3>
        {dailyData.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#666', margin: 0 }}>No data for this period. Start by adding your income or expenses!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {dailyData.map(day => (
              <div key={day.date} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{formatDate(day.date)}</h4>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', backgroundColor: day.dailyNet >= 0 ? '#dcfce7' : '#fee2e2', color: day.dailyNet >= 0 ? '#16a34a' : '#dc2626' }}>Net: {formatCurrency(day.dailyNet)}</span>
                </div>
                {day.earnings && (
                  <div style={{ marginBottom: day.expenses.length > 0 ? '16px' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#16a34a' }}>💰 Earnings: {formatCurrency(day.earnings.total_fares)}</p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
                          <span>💵 Cash: {formatCurrency(Number(day.earnings.cash_amount))}</span>
                          <span>🏦 Account: {formatCurrency(Number(day.earnings.account_amount))}</span>
                          <span>💳 Card: {formatCurrency(Number(day.earnings.card_amount))}</span>
                          <span>📱 App: {formatCurrency(Number(day.earnings.app_amount))}</span>
                          <span>🚗 Jobs: {day.earnings.total_jobs}</span>
                        </div>
                        {day.earnings.company && <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#3b82f6', fontWeight: '500' }}>🏢 Company: {day.earnings.company}</p>}
                        {day.earnings.notes && <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>"{day.earnings.notes}"</p>}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openIncomeModal(day.earnings!)} style={{ padding: '6px 12px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => handleDeleteEarning(day.earnings!.id)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                )}
                {day.expenses.length > 0 && (
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#dc2626' }}>📤 Expenses: {formatCurrency(day.expenses.reduce((s, e) => s + Number(e.amount), 0))}</p>
                    {day.expenses.map(expense => (
                      <div key={expense.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px' }}>{getCategoryLabel(expense.category)}</span>
                          {expense.description && <span style={{ fontSize: '13px', color: '#666' }}>- {expense.description}</span>}
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>{formatCurrency(Number(expense.amount))}</span>
                          {expense.receipt_url && <button onClick={() => viewReceipt(expense.receipt_url!)} style={{ padding: '2px 8px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>📎 Receipt</button>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openExpenseModal(expense)} style={{ padding: '4px 8px', backgroundColor: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                          <button onClick={() => handleDeleteExpense(expense.id)} style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {showIncomeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>{editingEarning ? 'Edit Income' : 'Add Income'}</h3>
            <form onSubmit={handleSubmitIncome}>
              <div style={{ marginBottom: '16px' }}>
                <BritishDatePicker label="Date" value={incomeDate} onChange={setIncomeDate} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div><label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>💵 Cash</label><input type="number" step="0.01" value={cashAmount} onChange={e => setCashAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>🏦 Account</label><input type="number" step="0.01" value={accountAmount} onChange={e => setAccountAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>💳 Card</label><input type="number" step="0.01" value={cardAmount} onChange={e => setCardAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>📱 App</label><input type="number" step="0.01" value={appAmount} onChange={e => setAppAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} /></div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Notes (optional)</label>
                <textarea value={incomeNotes} onChange={e => setIncomeNotes(e.target.value)} rows={2} placeholder="Pickup address, Name or Job ID No. This is advisable for your records" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>🏢 Company (optional)</label>
                <input type="text" value={incomeCompany} onChange={e => setIncomeCompany(e.target.value)} placeholder="Enter here what company supplied you with the job" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>Total Fares: <strong>£{((parseFloat(cashAmount) || 0) + (parseFloat(accountAmount) || 0) + (parseFloat(cardAmount) || 0) + (parseFloat(appAmount) || 0)).toFixed(2)}</strong></p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowIncomeModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Cancel</button>
                <button type="submit" disabled={submittingIncome} style={{ flex: 1, padding: '12px', backgroundColor: submittingIncome ? '#9ca3af' : '#eab308', color: 'black', border: 'none', borderRadius: '8px', cursor: submittingIncome ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}>{submittingIncome ? 'Saving...' : (editingEarning ? 'Update' : 'Add Income')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h3>
            <form onSubmit={handleSubmitExpense}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <BritishDatePicker label="Date" value={expenseDate} onChange={setExpenseDate} />
                <div><label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Amount (£)</label><input type="number" step="0.01" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required placeholder="0.00" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} /></div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Category</label>
                <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}>
                  {EXPENSE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Description / Vendor (optional)</label>
                <input type="text" value={expenseDescription} onChange={e => setExpenseDescription(e.target.value)} placeholder="e.g. Shell petrol station" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Receipt (optional)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <label style={{ flex: 1, padding: '12px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    📷 Take Photo
                    <input type="file" accept="image/*" capture="environment" onChange={e => setExpenseReceipt(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                  </label>
                  <label style={{ flex: 1, padding: '12px', backgroundColor: '#6b7280', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    📁 Upload File
                    <input type="file" accept="image/*,.pdf" onChange={e => setExpenseReceipt(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                  </label>
                </div>
                {expenseReceipt && <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#16a34a', fontWeight: '500' }}>✓ {expenseReceipt.name}</p>}
                {editingExpense?.receipt_url && !expenseReceipt && <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>📎 Existing receipt attached</p>}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowExpenseModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Cancel</button>
                <button type="submit" disabled={submittingExpense} style={{ flex: 1, padding: '12px', backgroundColor: submittingExpense ? '#9ca3af' : '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: submittingExpense ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}>{submittingExpense ? 'Saving...' : (editingExpense ? 'Update' : 'Add Expense')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>📥 Export to CSV</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#666' }}>Select date range for your accountant or tax records</p>
            <div style={{ marginBottom: '16px' }}>
              <BritishDatePicker label="Start Date" value={exportStartDate} onChange={setExportStartDate} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <BritishDatePicker label="End Date" value={exportEndDate} onChange={setExportEndDate} />
            </div>
            <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>✓ Includes earnings, expenses, and category breakdown</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowExportModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Cancel</button>
              <button onClick={exportCSV} style={{ flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Download CSV</button>
            </div>
          </div>
        </div>
      )}

      {showClaimsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>❓ What Can Taxi Drivers Claim?</h3>
              <button onClick={() => setShowClaimsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>×</button>
            </div>
            
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666', backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px' }}>
              💡 You can claim expenses that are <strong>wholly and exclusively</strong> for your taxi work.
            </p>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>1️⃣ Vehicle & Driving Costs</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#166534' }}>
                  <li>Fuel</li>
                  <li>Insurance (hire & reward / business use)</li>
                  <li>Repairs and servicing</li>
                  <li>Tyres, MOT, Road tax</li>
                  <li>Vehicle rent or lease (business use)</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>2️⃣ Platform, Operator & Work Fees</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#166534' }}>
                  <li>Platform or app commission</li>
                  <li>Operator or dispatch fees</li>
                  <li>Card processing fees</li>
                  <li>Weekly vehicle rent (if applicable)</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>3️⃣ Licensing & Compliance</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#166534' }}>
                  <li>Taxi / PHV licence fees</li>
                  <li>Council badge renewals</li>
                  <li>DBS checks</li>
                  <li>Medical exams required for licensing</li>
                  <li>Compliance tests</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>4️⃣ Phone & Work Technology</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#166534' }}>
                  <li>Business portion of mobile phone bills & data plans</li>
                  <li>Dash cams</li>
                  <li>Sat nav</li>
                  <li>Phone mounts and chargers</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>5️⃣ Insurance</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#166534' }}>
                  <li>Hire & reward insurance</li>
                  <li>Public liability insurance</li>
                  <li>Other work-related insurance policies</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>6️⃣ Cleaning & Vehicle Supplies</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#166534' }}>
                  <li>Car washes & valeting</li>
                  <li>Cleaning products</li>
                  <li>Air fresheners</li>
                  <li>Protective mats or seat covers</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>7️⃣ Professional & Admin Costs</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#166534' }}>
                  <li>Accountant fees</li>
                  <li>Bookkeeping or MTD software</li>
                  <li>Business bank charges</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>8️⃣ Parking, Tolls & Road Charges</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#166534' }}>
                  <li>Parking fees while working</li>
                  <li>Toll charges</li>
                  <li>Congestion charges (business journeys only)</li>
                </ul>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#dc2626' }}>❌ Fines and penalties cannot be claimed</p>
              </div>

              <div style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>9️⃣ Overnight Stays (Important Exception)</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>You can claim accommodation and food <strong>only if</strong>:</p>
                <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', fontSize: '13px' }}>
                  <li>You are on a long-distance job</li>
                  <li>Driving home would be unsafe</li>
                  <li>Bad weather forces an overnight stay</li>
                </ul>
                <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>⚠️ Does not apply to normal long shifts where you return home</p>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>🔟 Home Working (Limited)</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#166534' }}>
                  <li>A small home-working allowance if you do admin at home</li>
                  <li>Must be reasonable and limited</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#dc2626' }}>❌ What You CANNOT Claim</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#dc2626' }}>
                  <li>Everyday clothes or shoes</li>
                  <li>Haircuts or grooming</li>
                  <li>Normal food and drinks</li>
                  <li>Household bills</li>
                  <li>Personal travel</li>
                  <li>Parking fines or penalties</li>
                </ul>
              </div>
            </div>

            <button onClick={() => setShowClaimsModal(false)} style={{ width: '100%', marginTop: '20px', padding: '14px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Got it!</button>
          </div>
        </div>
      )}

      {showHighEarnerModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>💷 Profit Over £50,000?</h3>
              <button onClick={() => setShowHighEarnerModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>×</button>
            </div>
            
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#666', backgroundColor: '#e0f2fe', padding: '12px', borderRadius: '8px' }}>
              💡 If your profit (after expenses) is over £50,000 a year, there are some important things you should know.
            </p>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #0ea5e9' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#0369a1' }}>1️⃣ Your Tax Matters More at This Level</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                  At this profit level, tax and National Insurance take a much bigger share. Small mistakes or missed expenses can cost you a lot of money.
                </p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #0ea5e9' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#0369a1' }}>2️⃣ Review How You're Set Up</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                  Most drivers start as sole traders, which is fine. But once profits go over £50,000, it's worth reviewing whether staying as a sole trader still makes sense or whether a <strong>Limited Company</strong> should be considered.
                </p>
              </div>

              <div style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#92400e' }}>3️⃣ Making Tax Digital (MTD) Will Apply to You</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#78350f' }}>
                  From <strong>April 2026</strong>, drivers with higher income will need to:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#78350f' }}>
                  <li>Keep digital records</li>
                  <li>Submit quarterly updates to HMRC</li>
                </ul>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#78350f' }}>
                  This means you'll need suitable software or professional help.
                </p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #0ea5e9' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#0369a1' }}>4️⃣ Cash Planning Becomes Important</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                  At this level, tax bills can be large. You should be setting money aside regularly and have a rough idea of what you'll owe before the bill arrives.
                </p>
              </div>

              <div style={{ backgroundColor: '#dcfce7', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #16a34a' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#166534' }}>5️⃣ Professional Advice is Strongly Recommended</h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#166534' }}>
                  If your profit is over £50,000, you should speak to a <strong>certified accountant</strong> before making any changes. An accountant can help you decide what's best for your situation and make sure everything is done correctly.
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#166534', fontWeight: '600' }}>
                  💼 If you don't already have an accountant, let us know and we can recommend one.
                </p>
              </div>
            </div>

            <button onClick={() => setShowHighEarnerModal(false)} style={{ width: '100%', marginTop: '20px', padding: '14px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Got it!</button>
          </div>
        </div>
      )}
    </div>
  )
}
