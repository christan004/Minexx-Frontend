import React, { useState } from 'react';
import { tagApi, errorMessage } from './api';
import { CompanySelect, Field, formatNumber } from './shared';
import { TagSummary } from './TagDetailModal';

const STAT_ROWS = [
  { key: 'availableCount', label: 'Available', color: '#22c55e' },
  { key: 'assignedCount', label: 'Assigned', color: '#0ea5e9' },
  { key: 'usedCount', label: 'Used', color: '#a78bfa' },
  { key: 'voidCount', label: 'Void', color: '#ef4444' },
];

const ICONS = { MINE_BAG: 'fa-cube', COMPTOIR_TAG: 'fa-industry', EXPORT_TAG: 'fa-ship' };

const SummaryCard = ({ row, minimum, low }) => (
  <div className="col-xl-4 col-lg-6 mb-3">
    <div className="card h-100 mb-0" style={{ backgroundColor: '#1A2228', ...(low ? { border: '1px solid #ef4444' } : {}) }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="text-muted mb-1">
              {row.tagTypeName}
              {low && <span className="badge badge-danger ms-2">Low stock</span>}
            </h6>
            <h2 className="text-primary mb-0" style={{ fontSize: '2.2rem', fontWeight: 700 }}>
              {formatNumber(row.total)}
            </h2>
            <small className="text-muted">
              tags generated{minimum > 0 ? ` · alert at ${formatNumber(minimum)} available` : ''}
            </small>
          </div>
          <div
            style={{
              width: 50, height: 50, borderRadius: 8, backgroundColor: '#1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}
          >
            <i className={`fa ${ICONS[row.tagTypeCode] || 'fa-tags'}`} style={{ color: '#007bff' }} />
          </div>
        </div>
        {STAT_ROWS.map(({ key, label, color }) => {
          const pct = row.total ? (row[key] / row.total) * 100 : 0;
          return (
            <div key={key} className="mb-2">
              <div className="d-flex justify-content-between" style={{ fontSize: 13 }}>
                <span className="text-muted">{label}</span>
                <span>{formatNumber(row[key])}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

/** Look a tag up and, if a company is chosen, check whether it may use the tag (no data is changed). */
const TagCheck = ({ companies, onOpenTag }) => {
  const [code, setCode] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    setResult(null);
    try {
      const tagCode = code.trim();
      const [tag, usage] = await Promise.all([
        tagApi.getTag(tagCode),
        companyId ? tagApi.validateTag({ tagCode, companyId }) : null,
      ]);
      setResult({ tag, usage });
    } catch (err) {
      setResult({ error: errorMessage(err) });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title mb-0">Find or check a tag</h4>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-4">
            <Field label="Tag code">
              <input
                className="form-control"
                value={code}
                onChange={(e) => { setCode(e.target.value); setResult(null); }}
                placeholder="e.g. MB000123"
              />
            </Field>
          </div>
          <div className="col-md-5">
            <Field label="Company (optional, to check if it can use the tag)">
              <CompanySelect companies={companies} value={companyId} onChange={(v) => { setCompanyId(v); setResult(null); }} isClearable />
            </Field>
          </div>
          <div className="col-md-3 d-flex align-items-end gap-2 mb-3">
            <button type="button" className="btn btn-outline-primary" disabled={!code.trim()} onClick={() => onOpenTag(code.trim())}>
              History
            </button>
            <button type="button" className="btn btn-primary" disabled={!code.trim() || checking} onClick={check}>
              {checking ? 'Checking…' : 'Check'}
            </button>
          </div>
        </div>
        {result?.error && <div className="alert alert-warning mb-0">✕ {result.error}</div>}
        {result?.usage && (
          <div className={`alert ${result.usage.valid ? 'alert-success' : 'alert-warning'}`}>
            {result.usage.valid ? '✓ ' : '✕ '}
            {result.usage.message}
          </div>
        )}
        {result?.tag && <TagSummary tag={result.tag} />}
      </div>
    </div>
  );
};

const OverviewTab = ({ summary, types = [], stockAlerts, companies, onOpenTag }) => (
  <>
    <div className="row">
      {summary.map((row) => (
        <SummaryCard
          key={row.tagTypeId}
          row={row}
          minimum={types.find((t) => t.id === row.tagTypeId)?.minAvailable || 0}
          low={Boolean(stockAlerts?.system.some((a) => a.tagTypeId === row.tagTypeId))}
        />
      ))}
    </div>
    <TagCheck companies={companies} onOpenTag={onOpenTag} />
  </>
);

export default OverviewTab;
