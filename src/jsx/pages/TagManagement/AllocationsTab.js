import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import {
  CompanySelect, Field, Pagination, RangeLabel, StatusBadge, TableMessage, TypeSelect, UNCLASSIFIED_CODE,
  formatDate, formatNumber, parseCodeList,
} from './shared';
import {
  DateRangeFilter, ExportButtons, FilterPanel, MultiSelect, PageSize, SelectFilter, SortTh, TextFilter, TotalsBar,
  resolveRange, toQuery, useUrlFilters,
} from './reports';
import { tr } from './i18n';

const ALLOCATION_DEFAULTS = {
  page: '1', limit: '25', sort: '', dir: 'desc',
  companyId: '', tagTypeId: '', status: '', range: '', from: '', to: '',
  assignedBy: '', usage: '', slow: '', batchId: '',
};
const STATUS_OPTIONS = [{ value: 'ACTIVE', label: 'Active' }, { value: 'RETURNED', label: 'Returned' }];
const USAGE_OPTIONS = [
  ['', 'Any usage'], ['unused', 'Not used yet'], ['partial', 'Partly used'], ['remaining', 'Has unused tags'], ['full', 'Nothing left'],
];
// Slow moving = given at least N days ago, still has unused tags, and at most 10% used
const SLOW_OPTIONS = [['', 'All allocations'], ['30', 'Given 30+ days ago, ≤10% used'], ['60', 'Given 60+ days ago, ≤10% used'], ['90', 'Given 90+ days ago, ≤10% used']];

const AssignTagsModal = ({ show, types, companies, onClose, onAssigned }) => {
  const [companyId, setCompanyId] = useState('');
  const [tagTypeId, setTagTypeId] = useState('');
  const [mode, setMode] = useState('quantity');
  const [quantity, setQuantity] = useState('');
  const [ranges, setRanges] = useState([]);
  const [rangeIndex, setRangeIndex] = useState('');
  const [startNo, setStartNo] = useState('');
  const [endNo, setEndNo] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show) return;
    setCompanyId('');
    setTagTypeId(types[0] ? String(types[0].id) : '');
    setMode('quantity');
    setQuantity('');
    setNote('');
    setError(null);
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  // Available stock for the selected type, as continuous ranges
  useEffect(() => {
    if (!show || !tagTypeId) return;
    setRanges([]);
    setRangeIndex('');
    tagApi.availableRanges(tagTypeId).then(setRanges).catch((err) => setError(errorMessage(err)));
  }, [show, tagTypeId]);

  const range = ranges[Number(rangeIndex)];
  const totalAvailable = ranges.reduce((sum, r) => sum + r.quantity, 0);
  const largestBlock = ranges.reduce((max, r) => Math.max(max, r.quantity), 0);

  const pickRange = (index) => {
    setRangeIndex(index);
    const r = ranges[Number(index)];
    setStartNo(r ? String(r.startNo) : '');
    setEndNo(r ? String(r.endNo) : '');
  };

  const s = Number(startNo);
  const e = Number(endNo);
  const rangeValid = range && s >= range.startNo && e <= range.endNo && e >= s;
  const quantityValid = Number(quantity) > 0 && Number.isInteger(Number(quantity));
  const canSubmit = companyId && tagTypeId && !saving && (mode === 'quantity' ? quantityValid : rangeValid);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = { companyId, tagTypeId: Number(tagTypeId), ...(note.trim() ? { note: note.trim() } : {}) };
      if (mode === 'quantity') body.quantity = Number(quantity);
      else Object.assign(body, { batchId: range.batchId, startNo: s, endNo: e });
      const allocation = await tagApi.assignTags(body);
      toast.success(
        tr('{code}: {n} tags ({first} → {last}) assigned to {company}', { code: allocation.allocationCode, n: formatNumber(allocation.quantity), first: allocation.firstTagCode, last: allocation.lastTagCode, company: allocation.companyName || allocation.companyId })
      );
      onAssigned();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={() => !saving && onClose()} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{tr('Assign tags to a company')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Field label="Company">
          <CompanySelect companies={companies} value={companyId} onChange={setCompanyId} />
        </Field>
        <div className="row">
          <div className="col-md-6">
            <Field label="Tag type" hint={tr('{n} available', { n: formatNumber(totalAvailable) })}>
              <TypeSelect types={types} value={tagTypeId} onChange={setTagTypeId} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="How">
              <select className="form-control" value={mode} onChange={(ev) => setMode(ev.target.value)}>
                <option value="quantity">{tr('By quantity (next free tags)')}</option>
                <option value="range">{tr('Choose an exact range')}</option>
              </select>
            </Field>
          </div>
        </div>

        {totalAvailable === 0 ? (
          <div className="alert alert-warning">{tr('No tags of this type are available. Generate a batch first.')}</div>
        ) : mode === 'quantity' ? (
          <Field label="Quantity" hint={tr('The lowest continuous block is used. Largest free block: {n}', { n: formatNumber(largestBlock) })}>
            <input type="number" min={1} className="form-control" value={quantity} onChange={(ev) => setQuantity(ev.target.value)} />
          </Field>
        ) : (
          <>
            <Field label="Available range">
              <select className="form-control" value={rangeIndex} onChange={(ev) => pickRange(ev.target.value)}>
                <option value="">{tr('Select a range…')}</option>
                {ranges.map((r, i) => (
                  <option key={`${r.batchId}-${r.startNo}`} value={i}>
                    {r.firstTagCode} → {r.lastTagCode} ({tr('{n} tags, batch {batch}', { n: formatNumber(r.quantity), batch: r.batchCode })})
                  </option>
                ))}
              </select>
            </Field>
            {range && (
              <div className="row">
                <div className="col-md-6">
                  <Field label="From number">
                    <input type="number" className="form-control" min={range.startNo} max={range.endNo} value={startNo} onChange={(ev) => setStartNo(ev.target.value)} />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="To number">
                    <input type="number" className="form-control" min={range.startNo} max={range.endNo} value={endNo} onChange={(ev) => setEndNo(ev.target.value)} />
                  </Field>
                </div>
                <div className="col-12">
                  <div className={`alert ${rangeValid ? 'alert-info' : 'alert-warning'}`}>
                    {rangeValid
                      ? tr('{n} tags will be assigned.', { n: formatNumber(e - s + 1) })
                      : tr('Choose numbers between {from} and {to}, with “To” not lower than “From”.', { from: range.startNo, to: range.endNo })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <Field label="Note (optional)">
          <input className="form-control" maxLength={500} value={note} onChange={(ev) => setNote(ev.target.value)} />
        </Field>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>{tr('Cancel')}</button>
        <button type="button" className="btn btn-primary" onClick={submit} disabled={!canSubmit}>
          {saving ? tr('Assigning…') : tr('Assign tags')}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

/** Search the allocation's unused tags and tick the ones to return (or paste codes). */
const ChooseTags = ({ allocation, chosen, setChosen, pasted, setPasted }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!allocation) return undefined;
    setLoading(true);
    const timer = setTimeout(() => {
      tagApi.listTags({ allocationId: allocation.id, status: 'ASSIGNED', search: search.trim(), sort: 'tagCode', dir: 'asc', limit: 50 })
        .then(setResults)
        .catch((err) => toast.error(errorMessage(err)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [allocation, search]);

  const toggle = (code) => setChosen((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  const shown = results.items.map((t) => t.tagCode);
  const allShown = shown.length > 0 && shown.every((c) => chosen.includes(c));
  const toggleShown = () => setChosen((prev) => (allShown ? prev.filter((c) => !shown.includes(c)) : [...new Set([...prev, ...shown])]));

  return (
    <>
      <Field label="Search unused tags of this allocation" hint={tr('{n} unused tag(s) match. Showing up to 50.', { n: formatNumber(results.total) })}>
        <input className="form-control" value={search} placeholder={tr('Tag code starts with…')} onChange={(ev) => setSearch(ev.target.value)} />
      </Field>
      <div className="table-responsive mb-3" style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid #2a3a4a', borderRadius: 6 }}>
        <table className="table table-sm mb-0">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" checked={allShown} onChange={toggleShown} disabled={shown.length === 0} aria-label={tr('Select all shown')} />
              </th>
              <th>{tr('Tag code')}</th>
              <th>{tr('Type')}</th>
            </tr>
          </thead>
          <tbody>
            {loading && <TableMessage colSpan={3} loading />}
            {!loading && results.items.length === 0 && <TableMessage colSpan={3}>No unused tags match</TableMessage>}
            {!loading && results.items.map((t) => (
              <tr key={t.id} onClick={() => toggle(t.tagCode)} style={{ cursor: 'pointer' }}>
                <td><input type="checkbox" checked={chosen.includes(t.tagCode)} onChange={() => toggle(t.tagCode)} onClick={(ev) => ev.stopPropagation()} aria-label={tr('Return {code}', { code: t.tagCode })} /></td>
                <td style={{ fontFamily: 'monospace' }}>{t.tagCode}</td>
                <td>{t.tagTypeName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {chosen.length > 0 && (
        <div className="mb-3">
          <small className="text-muted">{tr('Chosen ({n}):', { n: chosen.length })} </small>
          {chosen.slice(0, 30).map((code) => (
            <span key={code} className="badge light badge-info me-1 mb-1" style={{ fontFamily: 'monospace', cursor: 'pointer' }} onClick={() => toggle(code)} title={tr('Click to remove')}>
              {code} ✕
            </span>
          ))}
          {chosen.length > 30 && <small className="text-muted">{tr('… and {n} more', { n: chosen.length - 30 })}</small>}
          <button type="button" className="btn btn-link btn-sm p-0 ms-2" onClick={() => setChosen([])}>{tr('Clear')}</button>
        </div>
      )}
      <Field label="Or paste tag codes" hint="One per line, or separated by commas or spaces">
        <textarea className="form-control" rows={3} value={pasted} style={{ fontFamily: 'monospace' }} onChange={(ev) => setPasted(ev.target.value)} />
      </Field>
    </>
  );
};

const ReturnTagsModal = ({ allocation, onClose, onReturned }) => {
  const [mode, setMode] = useState('all');
  const [startNo, setStartNo] = useState('');
  const [endNo, setEndNo] = useState('');
  const [chosen, setChosen] = useState([]);
  const [pasted, setPasted] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!allocation) return;
    setMode('all');
    setStartNo(String(allocation.startNo));
    setEndNo(String(allocation.endNo));
    setChosen([]);
    setPasted('');
    setReason('');
    setError(null);
  }, [allocation]);

  const s = Number(startNo);
  const e = Number(endNo);
  const rangeValid = allocation && s >= allocation.startNo && e <= allocation.endNo && e >= s;
  const tagCodes = [...new Set([...chosen, ...parseCodeList(pasted)])];

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await tagApi.returnTags(allocation.id, {
        ...(mode === 'range' ? { startNo: s, endNo: e } : {}),
        ...(mode === 'choose' ? { tagCodes } : {}),
        reason: reason.trim(),
      });
      toast.success(tr('{n} unused tags returned to stock from {code}', { n: formatNumber(result.returned), code: result.allocationCode }));
      const skipped = [...(result.notInAllocation || []), ...(result.notUnused || [])];
      if (skipped.length > 0) {
        toast.warning(`${tr('Not returned (not unused tags of this allocation):')} ${skipped.slice(0, 10).join(', ')}${skipped.length > 10 ? ` ${tr('and {n} more', { n: skipped.length - 10 })}` : ''}`);
      }
      onReturned();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={Boolean(allocation)} onHide={() => !saving && onClose()} centered size={mode === 'choose' ? 'lg' : undefined}>
      <Modal.Header closeButton>
        <Modal.Title>{tr('Return tags')} — {allocation?.allocationCode}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <p className="mb-3">
          {tr('{company} holds {n} unused tags in', { company: allocation?.companyName || '', n: formatNumber(allocation?.remainingCount) })}{' '}
          <RangeLabel first={allocation?.firstTagCode} last={allocation?.lastTagCode} />. {tr('Used and void tags are never returned.')}
        </p>
        <Field label="Return">
          <select className="form-control" value={mode} onChange={(ev) => setMode(ev.target.value)}>
            <option value="all">{tr('All unused tags')}</option>
            <option value="range">{tr('Only a range')}</option>
            <option value="choose">{tr('Choose tags (search or paste)')}</option>
          </select>
        </Field>
        {mode === 'choose' && (
          <ChooseTags allocation={allocation} chosen={chosen} setChosen={setChosen} pasted={pasted} setPasted={setPasted} />
        )}
        {mode === 'range' && (
          <div className="row">
            <div className="col-6">
              <Field label="From number">
                <input type="number" className="form-control" value={startNo} onChange={(ev) => setStartNo(ev.target.value)} />
              </Field>
            </div>
            <div className="col-6">
              <Field label="To number">
                <input type="number" className="form-control" value={endNo} onChange={(ev) => setEndNo(ev.target.value)} />
              </Field>
            </div>
            {!rangeValid && (
              <div className="col-12">
                <div className="alert alert-warning">{tr('Choose numbers between {from} and {to}.', { from: allocation?.startNo, to: allocation?.endNo })}</div>
              </div>
            )}
          </div>
        )}
        <Field label="Reason (optional)">
          <input className="form-control" maxLength={255} value={reason} onChange={(ev) => setReason(ev.target.value)} />
        </Field>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>{tr('Cancel')}</button>
        <button
          type="button"
          className="btn btn-warning"
          onClick={submit}
          disabled={saving || (mode === 'range' && !rangeValid) || (mode === 'choose' && tagCodes.length === 0)}
        >
          {saving ? tr('Returning…') : mode === 'choose' ? tr('Return {n} tag(s)', { n: formatNumber(tagCodes.length) }) : tr('Return to stock')}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const AllocationsTab = ({ types, companies: allCompanies, isAdmin, onChanged, onShowTags, refreshKey }) => {
  // Tags are only allocated to DRC companies
  const companies = useMemo(() => allCompanies.filter((c) => String(c.country || '').trim().toUpperCase() === 'DRC'), [allCompanies]);
  const [filters, setFilters, clearFilters, active] = useUrlFilters('alloc', ALLOCATION_DEFAULTS);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 25, totals: {} });
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [toReturn, setToReturn] = useState(null);

  const given = resolveRange(filters.range, filters.from, filters.to);
  const query = {
    ...toQuery(filters, ['range', 'from', 'to', 'slow']),
    from: given.from,
    to: given.to,
    ...(filters.slow ? { staleDays: filters.slow, maxUsedPct: 10 } : {}),
  };
  const queryKey = JSON.stringify(query);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await tagApi.listAllocations(JSON.parse(queryKey)));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load, refreshKey]);

  const afterChange = () => { load(); onChanged(); };
  const sortProps = { filters, onSort: setFilters };
  const companyOptions = (isAdmin ? companies : allCompanies).map((c) => ({ value: c.id, label: c.name || c.id }));
  const typeOptions = types.map((t) => ({ value: String(t.id), label: t.name }));

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h4 className="card-title mb-0">{tr('Allocations')}</h4>
        <div className="d-flex gap-2 flex-wrap">
          <ExportButtons report="allocations" params={query} disabled={data.total === 0} />
          {isAdmin && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAssign(true)}>
              <i className="fa fa-share me-2" />{tr('Assign tags')}
            </button>
          )}
        </div>
      </div>
      <div className="card-body">
        {filters.batchId && (
          <div className="alert alert-info d-flex justify-content-between align-items-center py-2">
            <span>{tr('Showing allocations of batch #{id}', { id: filters.batchId })}</span>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setFilters({ batchId: '' })}>{tr('Show all')}</button>
          </div>
        )}
        <FilterPanel
          active={active}
          onClear={clearFilters}
          more={(
            <>
              <div className="col-md-3">
                <SelectFilter label="Usage" value={filters.usage} onChange={(v) => setFilters({ usage: v })} options={USAGE_OPTIONS} />
              </div>
              <div className="col-md-3">
                <SelectFilter label="Slow moving" value={filters.slow} onChange={(v) => setFilters({ slow: v })} options={SLOW_OPTIONS} />
              </div>
              <div className="col-md-3">
                <TextFilter label="Given by" value={filters.assignedBy} onChange={(v) => setFilters({ assignedBy: v })} placeholder="Starts with…" />
              </div>
            </>
          )}
        >
          <div className="col-md-3">
            <MultiSelect label="Company" options={companyOptions} value={filters.companyId} onChange={(v) => setFilters({ companyId: v })} placeholder="All companies" />
          </div>
          <div className="col-md-3">
            <MultiSelect label="Tag type" options={typeOptions} value={filters.tagTypeId} onChange={(v) => setFilters({ tagTypeId: v })} placeholder="All types" />
          </div>
          <div className="col-md-3">
            <MultiSelect label="Status" options={STATUS_OPTIONS} value={filters.status} onChange={(v) => setFilters({ status: v })} placeholder="All statuses" />
          </div>
          <div className="col-md-3">
            <DateRangeFilter label="Date given" value={{ range: filters.range, from: filters.from, to: filters.to }}
              onChange={(v) => setFilters({ range: v.range, from: v.from, to: v.to })} />
          </div>
        </FilterPanel>

        <TotalsBar items={[
          ['Allocations', data.total],
          ['Tags given', data.totals?.quantity || 0],
          ['Remaining', data.totals?.remaining || 0, '#38bdf8'],
          ['Used', data.totals?.used || 0, '#a78bfa'],
          ['Void', data.totals?.void || 0, '#f87171'],
          ['Returned', data.totals?.returned || 0, '#fbbf24'],
        ]} />

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <SortTh label="Allocation" sortKey="allocationCode" {...sortProps} />
                <SortTh label="Company" sortKey="companyName" {...sortProps} />
                <SortTh label="Type" sortKey="tagTypeName" {...sortProps} />
                <th>{tr('Range')}</th>
                <SortTh label="Qty" sortKey="quantity" {...sortProps} />
                <SortTh label="Remaining" sortKey="remainingCount" {...sortProps} />
                <SortTh label="Used" sortKey="usedCount" {...sortProps} />
                <SortTh label="% used" sortKey="usedPct" {...sortProps} style={{ minWidth: 140 }} />
                <th>{tr('Void')}</th>
                <th>{tr('Returned')}</th>
                <SortTh label="Last used" sortKey="lastUsedAt" {...sortProps} />
                <th>{tr('Status')}</th>
                <SortTh label="Given" sortKey="assignedAt" {...sortProps} />
                <th className="text-end">{tr('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.items.length === 0 && <TableMessage colSpan={14} loading />}
              {!loading && data.items.length === 0 && <TableMessage colSpan={14}>No allocations match these filters</TableMessage>}
              {data.items.map((a) => (
                <tr key={a.id}>
                  <td className="fw-bold">{a.allocationCode}</td>
                  <td>{a.companyName || a.companyId}</td>
                  <td>{a.tagTypeName}</td>
                  <td><RangeLabel first={a.firstTagCode} last={a.lastTagCode} /></td>
                  <td>{formatNumber(a.quantity)}</td>
                  <td>{formatNumber(a.remainingCount)}</td>
                  <td>{formatNumber(a.usedCount)}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                        <div style={{ width: `${a.usedPct}%`, height: '100%', background: '#a78bfa', borderRadius: 3 }} />
                      </div>
                      <small className="text-muted">{a.usedPct}%</small>
                    </div>
                  </td>
                  <td>{formatNumber(a.voidCount)}</td>
                  <td>{formatNumber(a.returnedQuantity)}</td>
                  <td className="text-nowrap"><small>{a.lastUsedAt ? formatDate(a.lastUsedAt) : tr('Never')}</small></td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-nowrap">
                    <small>{formatDate(a.assignedAt)}<br /><span className="text-muted">{tr('{n} days ago', { n: a.daysSinceAssigned })} · {a.assignedBy}</span></small>
                  </td>
                  <td className="text-end text-nowrap">
                    <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => onShowTags({ allocationId: a.id })}>{tr('Tags')}</button>
                    {isAdmin && a.remainingCount > 0 && (
                      <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => setToReturn(a)}>{tr('Return')}</button>
                    )}
                  </td>
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

      <AssignTagsModal
        show={showAssign}
        types={types.filter((t) => t.isActive && t.code !== UNCLASSIFIED_CODE)}
        companies={companies}
        onClose={() => setShowAssign(false)}
        onAssigned={() => { setShowAssign(false); afterChange(); }}
      />
      <ReturnTagsModal
        allocation={toReturn}
        onClose={() => setToReturn(null)}
        onReturned={() => { setToReturn(null); afterChange(); }}
      />
    </div>
  );
};

export default AllocationsTab;
