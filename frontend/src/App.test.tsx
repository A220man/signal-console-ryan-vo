import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'

const renderApp = () => render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
})

describe('App', () => {
  it('renders navigation with brand', () => {
    renderApp()
    expect(screen.getByText('Signal Console')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderApp()
    const links = screen.getAllByRole('link', { name: /dashboard|memory banks|memories|recall|consolidation/i })
    expect(links.length).toBeGreaterThanOrEqual(5)
  })

  it('shows loading state initially on dashboard', () => {
    renderApp()
    expect(screen.getByText('Loading health status...')).toBeInTheDocument()
  })
})

describe('Dashboard', () => {
  it('displays health data when fetch succeeds', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'ok',
        database: 'healthy',
        version: '1.0.0'
      })
    })
    vi.stubGlobal('fetch', mockFetch)
    
    renderApp()
    
    await waitFor(() => {
      expect(screen.getByText('API Status:')).toBeInTheDocument()
      expect(screen.getByText('ok')).toBeInTheDocument()
      expect(screen.getByText('Database:')).toBeInTheDocument()
      expect(screen.getByText('healthy')).toBeInTheDocument()
      expect(screen.getByText('Version:')).toBeInTheDocument()
      expect(screen.getByText('1.0.0')).toBeInTheDocument()
    })
  })

  it('displays error when fetch fails', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.stubGlobal('fetch', mockFetch)
    
    renderApp()
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load health: Network error')).toBeInTheDocument()
    })
  })
})