import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { banksApi } from './api';
import type { Bank, BankListResponse, PaginationParams } from './types';

export function BankList() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
  });
  const [filterName, setFilterName] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const params: PaginationParams = {
    page: pagination.page,
    page_size: pagination.page_size,
    name: filterName || undefined,
  };
  
  async function fetchBanks() {
    setLoading(true);
    setError(null);
    try {
      const data: BankListResponse = await banksApi.list(params);
      setBanks(data.items);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        total_pages: data.total_pages,
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load banks');
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchBanks();
  }, [pagination.page, pagination.page_size, filterName]);
  
  async function handleDelete(id: number) {
    if (!window.confirm('Delete this memory bank? This action cannot be undone.')) return;
    
    setDeletingId(id);
    try {
      await banksApi.delete(id);
      await fetchBanks();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete bank');
    } finally {
      setDeletingId(null);
    }
  }
  
  if (loading && banks.length === 0) {
    return <div className="loading">Loading memory banks...</div>;
  }
  
  return (
    <div className="bank-list-container">
      <header className="page-header">
        <h1 className="page-title">Memory Banks</h1>
        <Link to="/banks/new" className="btn btn-primary">
          Create Bank
        </Link>
      </header>
      
      {error && <div className="error alert">{error}</div>}
      
      <div className="card">
        <div className="toolbar">
          <div className="search-box">
            <label htmlFor="bank-filter" className="visually-hidden">Filter by name</label>
            <input
              id="bank-filter"
              type="text"
              placeholder="Filter by name..."
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchBanks()}
              className="input"
            />
          </div>
        </div>
        
        {banks.length === 0 ? (
          <div className="empty-state">
            <p>No memory banks found.</p>
            <Link to="/banks/new" className="btn btn-primary">
              Create Your First Bank
            </Link>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table" role="grid">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Description</th>
                    <th scope="col">Config</th>
                    <th scope="col">Created</th>
                    <th scope="col">Updated</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banks.map(bank => (
                    <tr key={bank.id}>
                      <td>
                        <Link to={`/banks/${bank.id}`} className="bank-name-link">
                          {bank.name}
                        </Link>
                      </td>
                      <td className="description-cell">
                        {bank.description || <span className="text-muted">—</span>}
                      </td>
                      <td className="config-cell">
                        <pre>{JSON.stringify(bank.config, null, 2)}</pre>
                      </td>
                      <td className="date-cell">{new Date(bank.created_at).toLocaleDateString()}</td>
                      <td className="date-cell">{new Date(bank.updated_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/banks/${bank.id}/edit`}
                            className="btn btn-sm btn-secondary"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(bank.id)}
                            disabled={deletingId === bank.id}
                            className="btn btn-sm btn-danger"
                          >
                            {deletingId === bank.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pagination.total_pages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.total_pages} ({pagination.total} total)
                </span>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page >= pagination.total_pages}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}