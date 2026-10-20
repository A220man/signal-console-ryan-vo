import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { banksApi } from './api';
import type { Bank } from './types';

export function BankDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [bank, setBank] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    loadBank();
  }, [id]);
  
  async function loadBank() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await banksApi.get(Number(id));
      setBank(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bank');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleDelete() {
    if (!id || !window.confirm('Delete this memory bank? This action cannot be undone.')) return;
    
    setDeleting(true);
    try {
      await banksApi.delete(Number(id));
      navigate('/banks');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete bank');
    } finally {
      setDeleting(false);
    }
  }
  
  if (loading) return <div className="loading">Loading bank details...</div>;
  if (error && !bank) return <div className="error alert">{error}</div>;
  if (!bank) return <div className="error alert">Bank not found</div>;
  
  return (
    <div className="bank-detail-container">
      <header className="page-header">
        <h1 className="page-title">{bank.name}</h1>
        <div className="header-actions">
          <Link to={`/banks/${bank.id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-danger"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </header>
      
      {error && <div className="error alert">{error}</div>}
      
      <div className="card">
        <h2>Details</h2>
        <dl className="detail-list">
          <div className="detail-row">
            <dt>ID</dt>
            <dd>{bank.id}</dd>
          </div>
          <div className="detail-row">
            <dt>Description</dt>
            <dd>{bank.description || <span className="text-muted">—</span>}</dd>
          </div>
          <div className="detail-row">
            <dt>Created</dt>
            <dd>{new Date(bank.created_at).toLocaleString()}</dd>
          </div>
          <div className="detail-row">
            <dt>Updated</dt>
            <dd>{new Date(bank.updated_at).toLocaleString()}</dd>
          </div>
        </dl>
      </div>
      
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Configuration</h2>
        <pre className="config-display">{JSON.stringify(bank.config, null, 2)}</pre>
      </div>
      
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to={`/memories?bank=${bank.id}`} className="btn btn-primary">
            Manage Memories
          </Link>
          <Link to={`/recall?bank=${bank.id}`} className="btn btn-secondary">
            Search Memories
          </Link>
          <Link to={`/consolidation?bank=${bank.id}`} className="btn btn-secondary">
            Consolidation
          </Link>
        </div>
      </div>
    </div>
  );
}