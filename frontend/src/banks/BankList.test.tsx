import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { BankList } from './BankList'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'

const renderBankList = () => render(
  <BrowserRouter>
    <BankList />
  </BrowserRouter>
)

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  vi.stubGlobal('confirm', vi.fn(() => true))
})

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
})

describe('BankList', () => {
  it('shows loading state initially', () => {
    renderBankList()
    expect(screen.getByText('Loading memory banks...')).toBeInTheDocument()
  })

  it('displays empty state when no banks', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        items: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
      })
    })
    vi.stubGlobal('fetch', mockFetch)
    
    renderBankList()
    
    await waitFor(() => {
      expect(screen.getByText('No memory banks found.')).toBeInTheDocument()
      expect(screen.getByText('Create Your First Bank')).toBeInTheDocument()
    })
  })

  it('displays list of banks', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        items: [
          {
            id: 1,
            name: 'test-bank',
            description: 'Test bank',
            config: { retain_chunk_size: 1000, enable_auto_consolidation: false, consolidation_threshold: 100 },
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 2,
            name: 'another-bank',
            description: 'Another bank',
            config: { retain_chunk_size: 500, enable_auto_consolidation: true, consolidation_threshold: 50 },
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      })
    })
    vi.stubGlobal('fetch', mockFetch)
    
    renderBankList()
    
    await waitFor(() => {
      expect(screen.getByText('test-bank')).toBeInTheDocument()
      expect(screen.getByText('another-bank')).toBeInTheDocument()
      expect(screen.getByText('Test bank')).toBeInTheDocument()
      expect(screen.getByText('Another bank')).toBeInTheDocument()
    })
  })

  it('shows error when fetch fails', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.stubGlobal('fetch', mockFetch)
    
    renderBankList()
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('has create bank button', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        items: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
      })
    })
    vi.stubGlobal('fetch', mockFetch)
    
    renderBankList()
    
    await waitFor(() => {
      expect(screen.getByText('Create Bank')).toBeInTheDocument()
    })
  })
})