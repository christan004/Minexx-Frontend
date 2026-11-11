import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import {
  Field, Pagination, StatusBadge, TableMessage, TAG_STATUSES,
  formatDate, formatNumber, parseCodeList,
} from './shared';
import {
  DateRangeFilter, ExportButtons, FilterPanel, MultiSelect, PageSize, SortTh, TextFilter, TotalsBar,
  resolveRange, toQuery, useUrlFilters,
} from './reports';
import { tr } from './i18n';

const MAX_VOID_CODES = 1000;
const MAX_LOOKUP_CODES = 5000;
const VOIDABLE = ['AVAILABLE', 'ASSIGNED'];
const USED_IN = ['Bags', 'Proc Bags', 'Processing', 'Production', 'Drum'];
const STATUS_COLORS = { AVAILABLE: '#22c55e', ASSIGNED: '#38bdf8', USED: '#a78bfa', VOID: '#f87171' };

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
      if (result.voided.length > 0) toast.success(tr('{n} tag(s) voided', { n: result.voided.length }));
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
        <Modal.Title>{tr('Void tags')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        {rejected.length > 0 && (
          <div className="alert alert-warning">
            {tr('These tags were not voided:')}
            <ul className="mb-0 mt-1">
              {rejected.map((r) => <li key={r.tagCode}><code>{r.tagCode}</code> — {tr(r.reason)}</li>)}
            </ul>
          </div>
        )}
        <p className="text-muted">{tr('Lost or damaged tags can be voided while they are available or assigned. Voiding cannot be undone.')}</p>
        <Field label={tr('Tag codes ({n})', { n: codes.length })} hint="One per line, or separated by commas or spaces">
          <textarea className="form-control" rows={6} value={codesText} onChange={(e) => setCodesText(e.target.value)} style={{ fontFamily: 'monospace' }} />
        </Field>
        <Field label="Reason">
          <input className="form-control" maxLength={255} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={tr('e.g. damaged during transport')} />
        </Field>
        {codes.length > MAX_VOID_CODES && <div className="alert alert-warning mb-0">{tr('At most {n} tags can be voided at once.', { n: MAX_VOID_CODES })}</div>}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>{tr('Close')}</button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={submit}
          disabled={saving || codes.length === 0 || codes.length > MAX_VOID_CODES || reason.trim().length < 3}
        >
          {saving ? tr('Voiding…') : tr('Void {n} tag(s)', { n: codes.length })}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

/** Paste or load many codes and see the status of each one. */
const BulkLookupModal = ({ show, onClose, onOpenTag }) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { if (show) { setText(''); setResult(null); setError(null); } }, [show]);

  const codes = parseCodeList(text);
  const loadFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setText((prev) => `${prev ? `${prev}\n` : ''}${reader.result}`); setResult(null); };
    reader.readAsText(file);
    event.target.value = '';
  };

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      setResult(await tagApi.lookupTags(codes));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    const header = ['Tag code', 'Status', 'Tag type', 'Company', 'Batch', 'Used in', 'Record ID', 'Used at'].map((h) => tr(h));
    const lines = [
      ...result.items.map((t) => [t.tagCode, tr(t.status), t.tagTypeName, t.companyName || t.companyId || '', t.batchCode,
        t.usedRefTable || '', t.usedRefId || '', t.usedAt ? formatDate(t.usedAt) : '']),
      ...result.notFound.map((code) => [code, tr('NOT FOUND'), '', '', '', '', '', '']),
    ];
    const blob = new Blob([`﻿${[header, ...lines].map((row) => row.map(csvCell).join(',')).join('\r\n')}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tag-lookup-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal show={show} onHide={() => !busy && onClose()} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{tr('Look up many tags')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Field label={tr('Tag codes ({n})', { n: formatNumber(codes.length) })} hint={tr('One per line, or separated by commas or spaces. At most {n}.', { n: formatNumber(MAX_LOOKUP_CODES) })}>
          <textarea className="form-control" rows={5} value={text} style={{ fontFamily: 'monospace' }}
            onChange={(e) => { setText(e.target.value); setResult(null); }} />
          <input type="file" accept=".csv,.txt" className="form-control form-control-sm mt-2" onChange={loadFile} />
        </Field>
        {result && (
          <>
            <TotalsBar items={[
              ['Found', result.items.length],
              ...TAG_STATUSES.map((s) => [s, result.totals[s], STATUS_COLORS[s]]),
              ['Not found', result.notFound.length, '#fbbf24'],
            ]} />
            {result.notFound.length > 0 && (
              <div className="alert alert-warning" style={{ maxHeight: 90, overflowY: 'auto' }}>
                {tr('Not found')}: <span style={{ fontFamily: 'monospace' }}>{result.notFound.join(', ')}</span>
              </div>
            )}
            <div className="table-responsive" style={{ maxHeight: 360, overflowY: 'auto' }}>
              <table className="table table-sm mb-0">
                <thead><tr><th>{tr('Tag code')}</th><th>{tr('Status')}</th><th>{tr('Type')}</th><th>{tr('Company')}</th><th>{tr('Used in')}</th><th>{tr('Used at')}</th></tr></thead>
                <tbody>
                  {result.items.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <button type="button" className="btn btn-link p-0" style={{ fontFamily: 'monospace' }} onClick={() => onOpenTag(t.tagCode)}>{t.tagCode}</button>
                      </td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>{t.tagTypeName}</td>
                      <td>{t.companyName || t.companyId || '—'}</td>
                      <td>{t.usedRefTable ? `${t.usedRefTable} ${t.usedRefId || ''}` : '—'}</td>
                      <td className="text-nowrap"><small>{t.usedAt ? formatDate(t.usedAt) : '—'}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {result && <button type="button" className="btn btn-outline-primary" onClick={download}><i className="fa fa-download me-2" />{tr('Download results')}</button>}
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={busy}>{tr('Close')}</button>
        <button type="button" className="btn btn-primary" onClick={run} disabled={busy || codes.length === 0 || codes.length > MAX_LOOKUP_CODES}>
          {busy ? tr('Looking up…') : tr('Look up')}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const DEFAULTS = {
  page: '1', limit: '25', sort: '', dir: 'desc',
  search: '', status: '', tagTypeId: '', companyId: '', usedIn: '',
  usedRange: '', usedFrom: '', usedTo: '', usedBy: '', refId: '', codeFrom: '', codeTo: '', voidReason: '',
  batchId: '', allocationId: '',
};

const TagsTab = ({ types, companies, isAdmin, onChanged, onOpenTag, refreshKey }) => {
  const [filters, setFilters, clearFilters, active] = useUrlFilters('tags', DEFAULTS);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 25, totals: {} });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showVoid, setShowVoid] = useState(false);
  const [showLookup, setShowLookup] = useState(false);

  const used = resolveRange(filters.usedRange, filters.usedFrom, filters.usedTo);
  const query = { ...toQuery(filters, ['usedRange', 'usedFrom', 'usedTo']), usedFrom: used.from, usedTo: used.to };
  const queryKey = JSON.stringify(query);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await tagApi.listTags(JSON.parse(queryKey)));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    const timer = setTimeout(load, 300); // debounce typing
    return () => clearTimeout(timer);
  }, [load, refreshKey]);
  useEffect(() => { setSelected([]); }, [queryKey]);

  const voidableOnPage = data.items.filter((t) => VOIDABLE.includes(t.status)).map((t) => t.tagCode);
  const allSelected = voidableOnPage.length > 0 && voidableOnPage.every((c) => selected.includes(c));
  const toggle = (code) => setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  const toggleAll = () => setSelected(allSelected ? selected.filter((c) => !voidableOnPage.includes(c)) : [...new Set([...selected, ...voidableOnPage])]);

  const typeOptions = types.map((t) => ({ value: String(t.id), label: t.name }));
  const companyOptions = companies.map((c) => ({ value: c.id, label: c.name || c.id }));
  const statusOptions = TAG_STATUSES.map((s) => ({ value: s, label: s }));
  const usedInOptions = USED_IN.map((t) => ({ value: t, label: t }));
  const presetLabel = filters.batchId ? tr('batch #{id}', { id: filters.batchId }) : filters.allocationId ? tr('allocation #{id}', { id: filters.allocationId }) : null;
  const sortProps = { filters, onSort: setFilters };
  const colSpan = isAdmin ? 10 : 9;

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h4 className="card-title mb-0">{tr('Tags')}</h4>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setShowLookup(true)}>
            <i className="fa fa-search me-2" />{tr('Look up many tags')}
          </button>
          <ExportButtons report="tags" params={query} disabled={data.total === 0} />
          {isAdmin && (
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setShowVoid(true)}>
              <i className="fa fa-ban me-2" />
              {selected.length > 0 ? tr('Void {n} selected', { n: selected.length }) : tr('Void tags')}
            </button>
          )}
        </div>
      </div>
      <div className="card-body">
        {presetLabel && (
          <div className="alert alert-info d-flex justify-content-between align-items-center py-2">
            <span>{tr('Showing tags of {what}', { what: presetLabel })}</span>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setFilters({ batchId: '', allocationId: '' })}>{tr('Show all tags')}</button>
          </div>
        )}

        <FilterPanel
          active={active}
          onClear={clearFilters}
          more={(
            <>
              <div className="col-md-3">
                <DateRangeFilter label="Used date" value={{ range: filters.usedRange, from: filters.usedFrom, to: filters.usedTo }}
                  onChange={(v) => setFilters({ usedRange: v.range, usedFrom: v.from, usedTo: v.to })} />
              </div>
              <div className="col-md-3">
                <MultiSelect label="Used in" options={usedInOptions} value={filters.usedIn} onChange={(v) => setFilters({ usedIn: v })} placeholder="Any table" />
              </div>
              <div className="col-md-3">
                <TextFilter label="Used by" value={filters.usedBy} onChange={(v) => setFilters({ usedBy: v })} placeholder="Starts with…" />
              </div>
              <div className="col-md-3">
                <TextFilter label="Record ID" value={filters.refId} onChange={(v) => setFilters({ refId: v })} placeholder="Exact record ID" />
              </div>
              <div className="col-md-3">
                <TextFilter label="Tag range from" value={filters.codeFrom} onChange={(v) => setFilters({ codeFrom: v.trim() })} placeholder="e.g. MB000100" />
              </div>
              <div className="col-md-3">
                <TextFilter label="Tag range to" value={filters.codeTo} onChange={(v) => setFilters({ codeTo: v.trim() })} placeholder="e.g. MB000200" />
              </div>
              <div className="col-md-3">
                <TextFilter label="Void reason" value={filters.voidReason} onChange={(v) => setFilters({ voidReason: v })} placeholder="Contains…" />
              </div>
            </>
          )}
        >
          <div className="col-md-3">
            <TextFilter label="Tag code" value={filters.search} onChange={(v) => setFilters({ search: v })} placeholder="Starts with…" />
          </div>
          <div className="col-md-3">
            <MultiSelect label="Status" options={statusOptions} value={filters.status} onChange={(v) => setFilters({ status: v })} placeholder="All statuses" />
          </div>
          <div className="col-md-3">
            <MultiSelect label="Tag type" options={typeOptions} value={filters.tagTypeId} onChange={(v) => setFilters({ tagTypeId: v })} placeholder="All types" />
          </div>
          <div className="col-md-3">
            <MultiSelect label="Company" options={companyOptions} value={filters.companyId} onChange={(v) => setFilters({ companyId: v })} placeholder="All companies" />
          </div>
        </FilterPanel>

        <TotalsBar items={[
          ['Matching tags', data.total],
          ...TAG_STATUSES.map((s) => [s, data.totals?.[s] || 0, STATUS_COLORS[s]]),
        ]} />

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                {isAdmin && (
                  <th style={{ width: 36 }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={voidableOnPage.length === 0} aria-label={tr('Select all on this page')} />
                  </th>
                )}
                <SortTh label="Tag code" sortKey="tagCode" {...sortProps} />
                <SortTh label="Type" sortKey="tagTypeName" {...sortProps} />
                <SortTh label="Status" sortKey="status" {...sortProps} />
                <SortTh label="Company" sortKey="companyName" {...sortProps} />
                <SortTh label="Batch" sortKey="batchCode" {...sortProps} />
                <th>{tr('Allocation')}</th>
                <SortTh label="Used in" sortKey="usedRefTable" {...sortProps} />
                <SortTh label="Used at" sortKey="usedAt" {...sortProps} />
                <th>{tr('Used by')}</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.items.length === 0 && <TableMessage colSpan={colSpan} loading />}
              {!loading && data.items.length === 0 && <TableMessage colSpan={colSpan}>No tags match these filters</TableMessage>}
              {data.items.map((t) => (
                <tr key={t.id}>
                  {isAdmin && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(t.tagCode)}
                        onChange={() => toggle(t.tagCode)}
                        disabled={!VOIDABLE.includes(t.status)}
                        aria-label={tr('Select {code}', { code: t.tagCode })}
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
                  <td>
                    {t.usedRefTable ? <>{t.usedRefTable}<br /><small className="text-muted">{t.usedRefId}</small></>
                      : t.status === 'VOID' ? <small className="text-muted">{tr('Void')}: {t.voidReason}</small> : '—'}
                  </td>
                  <td className="text-nowrap"><small>{t.usedAt ? formatDate(t.usedAt) : '—'}</small></td>
                  <td><small>{t.usedBy || '—'}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <PageSize value={filters.limit} onChange={(v) => setFilters({ limit: v })} />
          <div className="flex-grow-1">
            <Pagination page={data.page} limit={data.limit} total={data.total} onChange={(p) => setFilters({ page: String(p) })} />
          </div>
        </div>
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
      <BulkLookupModal show={showLookup} onClose={() => setShowLookup(false)} onOpenTag={onOpenTag} />
    </div>
  );
};

export default TagsTab;
