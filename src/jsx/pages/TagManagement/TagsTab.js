import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import {
  CompanySelect, Field, Pagination, PAGE_SIZE, StatusBadge, TableMessage, TAG_STATUSES, TypeSelect,
  formatDate,
} from './shared';

const MAX_VOID_CODES = 1000;
const VOIDABLE = ['AVAILABLE', 'ASSIGNED'];

const parseCodes = (text) => [...new Set(text.split(/[\s,;]+/).map((c) => c.trim()).filter(Boolean))];

const VoidTagsModal = ({ show, initialCodes, onClose, onVoided }) => {
  const [codesText, setCodesText] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [rejected, setRejected] = useState([]);

  // Reset only when the modal opens; the parent clears its selection after a partial void
  useEffect(() => {
    if (!show) return;
    setCodesText(initialCodes.join('\n'));
    setReason('');
    setError(null);
    setRejected([]);
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  const codes = parseCodes(codesText);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await tagApi.voidTags(codes, reason.trim());
      if (result.voided.length > 0) toast.success(`${result.voided.length} tag(s) voided`);
      if (result.rejected.length > 0) {
        // Keep the modal open so the user sees which codes were skipped
        setRejected(result.rejected);
        setCodesText(result.rejected.map((r) => r.tagCode).join('\n'));
        if (result.voided.length > 0) onVoided(false);
      } else {
        onVoided(true);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={() => !saving && onClose()} centered>
      <Modal.Header closeButton>
        <Modal.Title>Void tags</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        {rejected.length > 0 && (
          <div className="alert alert-warning">
            These tags were not voided:
            <ul className="mb-0 mt-1">
              {rejected.map((r) => <li key={r.tagCode}><code>{r.tagCode}</code> — {r.reason}</li>)}
            </ul>
          </div>
        )}
        <p className="text-muted">Lost or damaged tags can be voided while they are available or assigned. Voiding cannot be undone.</p>
        <Field label={`Tag codes (${codes.length})`} hint="One per line, or separated by commas or spaces">
          <textarea className="form-control" rows={6} value={codesText} onChange={(e) => setCodesText(e.target.value)} style={{ fontFamily: 'monospace' }} />
        </Field>
        <Field label="Reason">
          <input className="form-control" maxLength={255} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. damaged during transport" />
        </Field>
        {codes.length > MAX_VOID_CODES && <div className="alert alert-warning mb-0">At most {MAX_VOID_CODES} tags can be voided at once.</div>}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>Close</button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={submit}
          disabled={saving || codes.length === 0 || codes.length > MAX_VOID_CODES || reason.trim().length < 3}
        >
          {saving ? 'Voiding…' : `Void ${codes.length} tag(s)`}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

/** `preset` ({ batchId } or { allocationId }) comes from the Batches / Allocations tabs. */
const TagsTab = ({ types, companies, isAdmin, preset, onClearPreset, onChanged, onOpenTag, refreshKey }) => {
  const [filters, setFilters] = useState({ status: '', tagTypeId: '', companyId: '', search: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showVoid, setShowVoid] = useState(false);

  useEffect(() => { setPage(1); setSelected([]); }, [preset]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await tagApi.listTags({ ...filters, ...(preset || {}), page, limit: PAGE_SIZE }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, preset, page]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load, refreshKey]);

  const setFilter = (patch) => { setFilters((prev) => ({ ...prev, ...patch })); setPage(1); setSelected([]); };

  const voidableOnPage = data.items.filter((t) => VOIDABLE.includes(t.status)).map((t) => t.tagCode);
  const allSelected = voidableOnPage.length > 0 && voidableOnPage.every((c) => selected.includes(c));
  const toggle = (code) => setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  const toggleAll = () => setSelected(allSelected ? selected.filter((c) => !voidableOnPage.includes(c)) : [...new Set([...selected, ...voidableOnPage])]);

  const presetLabel = preset?.batchId
    ? `batch #${preset.batchId}`
    : preset?.allocationId ? `allocation #${preset.allocationId}` : null;

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h4 className="card-title mb-0">Tags</h4>
        {isAdmin && (
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setShowVoid(true)}>
            <i className="fa fa-ban me-2" />
            {selected.length > 0 ? `Void ${selected.length} selected` : 'Void tags'}
          </button>
        )}
      </div>
      <div className="card-body">
        {presetLabel && (
          <div className="alert alert-info d-flex justify-content-between align-items-center py-2">
            <span>Showing tags of {presetLabel}</span>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={onClearPreset}>Show all tags</button>
          </div>
        )}
        <div className="row mb-3">
          <div className="col-md-3 mb-2">
            <input className="form-control" placeholder="Search tag code…" value={filters.search} onChange={(e) => setFilter({ search: e.target.value })} />
          </div>
          <div className="col-md-2 mb-2">
            <select className="form-control" value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
              <option value="">All statuses</option>
              {TAG_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <TypeSelect types={types} value={filters.tagTypeId} onChange={(v) => setFilter({ tagTypeId: v })} allLabel="All tag types" />
          </div>
          <div className="col-md-4 mb-2">
            <CompanySelect companies={companies} value={filters.companyId} onChange={(v) => setFilter({ companyId: v })} isClearable placeholder="All companies" />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                {isAdmin && (
                  <th style={{ width: 36 }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={voidableOnPage.length === 0} aria-label="Select all on this page" />
                  </th>
                )}
                <th>Tag code</th>
                <th>Type</th>
                <th>Status</th>
                <th>Company</th>
                <th>Batch</th>
                <th>Allocation</th>
                <th>Used on</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.items.length === 0 && <TableMessage colSpan={isAdmin ? 9 : 8} loading />}
              {!loading && data.items.length === 0 && <TableMessage colSpan={isAdmin ? 9 : 8}>No tags found</TableMessage>}
              {data.items.map((t) => (
                <tr key={t.id}>
                  {isAdmin && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(t.tagCode)}
                        onChange={() => toggle(t.tagCode)}
                        disabled={!VOIDABLE.includes(t.status)}
                        aria-label={`Select ${t.tagCode}`}
                      />
                    </td>
                  )}
                  <td>
                    <button type="button" className="btn btn-link p-0 fw-bold" style={{ fontFamily: 'monospace' }} onClick={() => onOpenTag(t.tagCode)}>
                      {t.tagCode}
                    </button>
                  </td>
                  <td>{t.tagTypeName}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>{t.companyName || t.companyId || '—'}</td>
                  <td>{t.batchCode}</td>
                  <td>{t.allocationCode || '—'}</td>
                  <td>{t.usedRefTable ? `${t.usedRefTable} ${t.usedRefId || ''}` : t.status === 'VOID' ? <small className="text-muted">{t.voidReason}</small> : '—'}</td>
                  <td className="text-nowrap"><small>{formatDate(t.updatedAt)}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
      </div>

      <VoidTagsModal
        show={showVoid}
        initialCodes={selected}
        onClose={() => setShowVoid(false)}
        onVoided={(close) => {
          setSelected([]);
          if (close) setShowVoid(false);
          load();
          onChanged();
        }}
      />
    </div>
  );
};

export default TagsTab;
