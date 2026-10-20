import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { BankList } from './banks/BankList'
import { BankForm } from './banks/BankForm'
import { BankDetail } from './banks/BankDetail'
import './App.css'

function Nav() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/banks', label: 'Memory Banks' },
    { path: '/memories', label: 'Memories' },
    { path: '/recall', label: 'Recall' },
    { path: '/consolidation', label: 'Consolidation' },
  ]
  
  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <Link to="/" className="nav-brand">Signal Console</Link>
      <div className="nav-links">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)) ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function Dashboard() {
  const [health, setHealth] = useState<{ status: string; database: string; version: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/health')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setHealth(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchHealth()
  }, [])
  
  if (loading) return <div className="loading">Loading health status...</div>
  if (error) return <div className="error">Failed to load health: {error}</div>
  if (!health) return <div className="empty">No health data</div>
  
  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </header>
      
      <div className="card">
        <h2>System Health</h2>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className={`status-dot ${health.status === 'ok' ? 'healthy' : 'unhealthy'}`}></span>
            <strong>API Status:</strong> {health.status}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className={`status-dot ${health.database === 'healthy' ? 'healthy' : 'unhealthy'}`}></span>
            <strong>Database:</strong> {health.database}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <strong>Version:</strong> {health.version}
          </div>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Quick Actions</h2>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/banks" className="btn btn-primary">Manage Memory Banks</Link>
          <Link to="/memories" className="btn btn-secondary">View Memories</Link>
          <Link to="/recall" className="btn btn-secondary">Search Memories</Link>
          <Link to="/consolidation" className="btn btn-secondary">Consolidation</Link>
        </div>
      </div>
      
      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        Signal Console — Agent Memory That Learns<br />
        Ryan Vo ryandtvo@gmail.com | AI & Machine Learning
      </footer>
    </div>
  )
}

function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">{title}</h1>
      </header>
      <div className="card">
        <p style={{ color: 'var(--color-text-muted)' }}>{description}</p>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          This feature is planned. See <a href="/PLAN.md">PLAN.md</a> for roadmap.
        </p>
      </div>
    </div>
  )
}

function BanksPage() {
  return <BankList />
}

function BankNewPage() {
  return <BankForm isEditing={false} />
}

function BankEditPage() {
  return <BankForm isEditing={true} />
}

function BankDetailPage() {
  return <BankDetail />
}

function MemoriesPage() {
  return <Placeholder title="Memories" description="Memory retention and ingestion workflow." />
}

function RecallPage() {
  return <Placeholder title="Recall" description="Semantic search and recall with timestamp display." />
}

function ConsolidationPage() {
  return <Placeholder title="Consolidation" description="Memory consolidation workflow with status polling." />
}

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/banks" element={<BanksPage />} />
          <Route path="/banks/new" element={<BankNewPage />} />
          <Route path="/banks/:id" element={<BankDetailPage />} />
          <Route path="/banks/:id/edit" element={<BankEditPage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/recall" element={<RecallPage />} />
          <Route path="/consolidation" element={<ConsolidationPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App