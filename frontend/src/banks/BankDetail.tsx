import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { banksApi } from './api';
import type { Bank, AuditLog, AuditLogListResponse } from './types';

export function BankDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [bank, setBank] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const AUDIT_PAGE_SIZE = 10;
  
  useEffect(() => {
    loadBank();
  }, [id]);
  
  useEffect(() => {
    if (id) {
      loadAuditLogs();
    }
  }, [id, auditPage]);
  
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
  
  async function loadAuditLogs() {
    if (!id) return;
    setAuditLoading(true);
    setAuditError(null);
    try {
      const data = await banksApi.getAuditLogs(Number(id), auditPage, AUDIT_PAGE_SIZE);
      setAuditLogs(data.items);
      setAuditTotalPages(data.total_pages);
    } catch (e) {
      setAuditError(e instanceof Error ? e.message : 'Failed to load audit logs');
    } finally {
      setAuditLoading(false);
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
  
  const formatChanges = (changes: string | null) => {
    if (!changes) return <span className="text-muted">—</span>;
    try {
      const parsed = JSON.parse(changes);
      return <pre className="changes-display">{JSON.stringify(parsed, null, 2)}</pre>;
    } catch {
      return <span>{changes}</span>;
    }
  };
  
  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'CREATE': return 'badge-create';
      case 'UPDATE': return 'badge-update';
      case 'DELETE': return 'badge-delete';
      default: return '';
    }
  };
  
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
        <h2>Audit Logs</h2>
        {auditLoading && auditLogs.length === 0 ? (
          <div className="loading">Loading audit logs...</div>
        ) : auditError ? (
          <div className="error alert">{auditError}</div>
        ) : auditLogs.length === 0 ? (
          <div className="text-muted">No audit logs found</div>
        ) : (
          <>
            <div className="audit-log-table">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log: AuditLog) => (
                    <tr key={log.id}>
                      <td>
                        <span className={`badge ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>{log.user_id || <span className="text-muted">—</span>}</td>
                      <td>{formatChanges(log.changes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {auditTotalPages > 1 && (
              <div className="pagination" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                  disabled={auditPage === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  Page {auditPage} of {auditTotalPages}
                </span>
                <button
                  onClick={() => setAuditPage(p => Math.min(auditTotalPages, p + 1))}
                  disabled={auditPage === auditTotalPages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
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

