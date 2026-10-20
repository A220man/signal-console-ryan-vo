import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { banksApi } from './api';
import type { BankCreateRequest, BankUpdateRequest, Bank, BankConfig } from './types';

interface BankFormProps {
  initialData?: Bank;
  isEditing: boolean;
}

export function BankForm({ initialData, isEditing }: BankFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState<BankCreateRequest & { config: BankConfig }>({
    name: '',
    description: '',
    config: {
      retain_chunk_size: 1000,
      enable_auto_consolidation: false,
      consolidation_threshold: 100,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        config: initialData.config,
      });
    } else if (isEditing && id) {
      loadBank();
    }
  }, [initialData, isEditing, id]);
  
  async function loadBank() {
    setLoading(true);
    try {
      const bank = await banksApi.get(Number(id));
      setFormData({
        name: bank.name,
        description: bank.description || '',
        config: bank.config,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bank');
    } finally {
      setLoading(false);
    }
  }
  
  function handleChange(field: string, value: string | number | boolean) {
    if (field.startsWith('config.')) {
      const configKey = field.replace('config.', '') as keyof typeof formData.config;
      setFormData(prev => ({
        ...prev,
        config: { ...prev.config, [configKey]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      if (isEditing && id) {
        await banksApi.update(Number(id), formData as BankUpdateRequest);
      } else {
        await banksApi.create(formData as BankCreateRequest);
      }
      navigate('/banks');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save bank');
    } finally {
      setSubmitting(false);
    }
  }
  
  if (loading) return <div className="loading">Loading bank...</div>;
  
  return (
    <div className="bank-form-container">
      <header className="page-header">
        <h1 className="page-title">{isEditing ? 'Edit' : 'Create'} Memory Bank</h1>
      </header>
      
      {error && <div className="error alert">{error}</div>}
      
      <form onSubmit={handleSubmit} className="card form-card" noValidate>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name <span className="required">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            className="input"
            required
            pattern="^[a-zA-Z0-9_-]+$"
            placeholder="my-bank"
            disabled={isEditing}
            aria-describedby="name-help"
          />
          <p id="name-help" className="form-help">
            Alphanumeric, underscore, and hyphen only. Cannot be changed after creation.
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            className="input"
            rows={3}
            placeholder="Optional description of this memory bank"
            maxLength={500}
          />
        </div>
        
        <fieldset className="form-group config-fieldset">
          <legend className="form-label">Configuration</legend>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="retain_chunk_size" className="form-label">
                Retain Chunk Size
              </label>
              <input
                id="retain_chunk_size"
                type="number"
                value={formData.config.retain_chunk_size}
                onChange={e => handleChange('config.retain_chunk_size', Number(e.target.value))}
                className="input"
                min={100}
                max={10000}
                step={100}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="consolidation_threshold" className="form-label">
                Consolidation Threshold
              </label>
              <input
                id="consolidation_threshold"
                type="number"
                value={formData.config.consolidation_threshold}
                onChange={e => handleChange('config.consolidation_threshold', Number(e.target.value))}
                className="input"
                min={10}
                max={1000}
                step={10}
              />
            </div>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.config.enable_auto_consolidation}
                onChange={e => handleChange('config.enable_auto_consolidation', e.target.checked)}
                className="checkbox"
              />
              <span>Enable Auto Consolidation</span>
            </label>
          </div>
        </fieldset>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Update Bank' : 'Create Bank'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/banks')}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}