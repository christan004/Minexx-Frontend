import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import {
  Field, Pagination, RangeLabel, StatusBadge, TableMessage, TypeSelect, UNCLASSIFIED_CODE,
  formatDate, formatNumber,
} from './shared';
import { ClassifyModal, OpeningStockModal } from './OpeningStock';
import {
  DateRangeFilter, ExportButtons, FilterPanel, MultiSelect, PageSize, SelectFilter, SortTh, TextFilter, TotalsBar,
  resolveRange, toQuery, useUrlFilters,
} from './reports';
import { tr } from './i18n';

const BATCH_DEFAULTS = {
  page: '1', limit: '25', sort: '', dir: 'desc',
  search: '', tagTypeId: '', source: '', status: '', range: '', from: '', to: '', createdBy: '', usage: '',
};
const SOURCE_OPTIONS = [{ value: 'GENERATED', label: 'Generated' }, { value: 'OPENING', label: 'Opening stock' }];
const STATUS_OPTIONS = [{ value: 'ACTIVE', label: 'Active' }, { value: 'CANCELLED', label: 'Cancelled' }];
const USAGE_OPTIONS = [['', 'Any usage'], ['unused', 'Not used (all available)'], ['partial', 'Partly given out'], ['full', 'Nothing left to give']];

const MAX_BATCH_QUANTITY = 50000;

// Same formatting as the API: prefix + serial, zero-padded when serialLength > 0
const formatTagCode = (prefix, serial, serialLength) => {
  const text = String(serial);
  return `${prefix || ''}${serialLength > 0 ? text.padStart(serialLength, '0') : text}`;
};

const GenerateBatchModal = ({ show, types, onClose, onCreated }) => {
  const [form, setForm] = useState({});
  const [mode, setMode] = useState('quantity');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const type = types.find((t) => String(t.id) === String(form.tagTypeId));

  // Reset the form each time the modal opens
  useEffect(() => {
    if (!show || types.length === 0) return;
    const first = types[0];
    setForm({
      tagTypeId: String(first.id), prefix: first.defaultPrefix || '', serialLength: first.serialLength || 0,
      startNo: '', quantity: '', endNo: '', note: '',
    });
    setMode('quantity');
    setError(null);
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  // Suggest the next free start number for the prefix
  useEffect(() => {
    if (!show || form.prefix === undefined) return undefined;
    const timer = setTimeout(() => {
      tagApi.nextStart(form.prefix)
        .then(({ nextStart }) => set({ startNo: String(nextStart) }))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [show, form.prefix]);

  const startNo = Number(form.startNo);
  const endNo = mode === 'quantity' ? startNo + Number(form.quantity) - 1 : Number(form.endNo);
  const quantity = endNo - startNo + 1;
  const rangeValid = startNo > 0 && endNo >= startNo && Number.isInteger(startNo) && Number.isInteger(endNo);
  const tooMany = rangeValid && quantity > MAX_BATCH_QUANTITY;
  const serialLength = Number(form.serialLength) || 0;
  const tooShort = rangeValid && serialLength > 0 && String(endNo).length > serialLength;
  const canSubmit = type && rangeValid && !tooMany && !tooShort && !saving;

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const batch = await tagApi.generateBatch({
        tagTypeId: Number(form.tagTypeId),
        prefix: form.prefix,
        serialLength,
        startNo,
        ...(mode === 'quantity' ? { quantity } : { endNo }),
        ...(form.note.trim() ? { note: form.note.trim() } : {}),
      });
      toast.success(tr('Batch {code} created: {n} tags ({first} → {last})', { code: batch.batchCode, n: formatNumber(batch.quantity), first: batch.firstTagCode, last: batch.lastTagCode }));
      onCreated();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={() => !saving && onClose()} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{tr('Generate a batch of tags')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row">
          <div className="col-md-6">
            <Field label="Tag type">
              <TypeSelect
                types={types}
                value={form.tagTypeId || ''}
                onChange={(id) => {
                  const next = types.find((t) => String(t.id) === id);
                  set({ tagTypeId: id, prefix: next?.defaultPrefix || '', serialLength: next?.serialLength || 0 });
                }}
              />
            </Field>
          </div>
          <div className="col-md-3">
            <Field
              label="Prefix"
              hint={
                !type?.defaultPrefix ? 'No default yet: set one in Settings'
                  : form.prefix === type.defaultPrefix ? 'Default from Settings'
                    : (
                      <>
                        {tr('Default is {prefix}.', { prefix: type.defaultPrefix })}{' '}
                        <button type="button" className="btn btn-link btn-sm p-0 align-baseline"
                          onClick={() => set({ prefix: type.defaultPrefix, serialLength: type.serialLength || 0 })}>
                          {tr('Use default')}
                        </button>
                      </>
                    )
              }
            >
              <input
                className="form-control"
                value={form.prefix || ''}
                maxLength={20}
                onChange={(e) => set({ prefix: e.target.value.replace(/[^A-Za-z0-9-]/g, '') })}
                placeholder={tr('e.g. MB')}
              />
            </Field>
          </div>
          <div className="col-md-3">
            <Field label="Digits" hint="0 = no zero padding">
              <input
                type="number" min={0} max={18} className="form-control"
                value={form.serialLength ?? 0}
                onChange={(e) => set({ serialLength: e.target.value })}
              />
            </Field>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <Field label="First number" hint="Next free number is filled in">
              <input type="number" min={1} className="form-control" value={form.startNo || ''} onChange={(e) => set({ startNo: e.target.value })} />
            </Field>
          </div>
          <div className="col-md-4">
            <Field label="Size by">
              <select className="form-control" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="quantity">{tr('Quantity')}</option>
                <option value="end">{tr('Last number')}</option>
              </select>
            </Field>
          </div>
          <div className="col-md-4">
            {mode === 'quantity' ? (
              <Field label="Quantity" hint={tr('At most {n}', { n: formatNumber(MAX_BATCH_QUANTITY) })}>
                <input type="number" min={1} max={MAX_BATCH_QUANTITY} className="form-control" value={form.quantity || ''} onChange={(e) => set({ quantity: e.target.value })} />
              </Field>
            ) : (
              <Field label="Last number">
                <input type="number" min={1} className="form-control" value={form.endNo || ''} onChange={(e) => set({ endNo: e.target.value })} />
              </Field>
            )}
          </div>
        </div>

        <Field label="Note (optional)">
          <input className="form-control" maxLength={500} value={form.note || ''} onChange={(e) => set({ note: e.target.value })} />
        </Field>

        {rangeValid && (
          <div className={`alert mb-0 ${tooMany || tooShort ? 'alert-warning' : 'alert-info'}`}>
            {tooMany && tr('A batch can contain at most {n} tags.', { n: formatNumber(MAX_BATCH_QUANTITY) })}
            {tooShort && tr('{digits} digits is too short for the number {n}.', { digits: serialLength, n: endNo })}
            {!tooMany && !tooShort && (
              <>
                {tr('{n} tags:', { n: formatNumber(quantity) })}{' '}
                <RangeLabel first={formatTagCode(form.prefix, startNo, serialLength)} last={formatTagCode(form.prefix, endNo, serialLength)} />
              </>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>{tr('Cancel')}</button>
        <button type="button" className="btn btn-primary" onClick={submit} disabled={!canSubmit}>
          {saving ? tr('Generating…') : tr('Generate tags')}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const CancelBatchModal = ({ batch, onClose, onCancelled }) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { setReason(''); setError(null); }, [batch]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await tagApi.cancelBatch(batch.id, reason.trim());
      toast.success(tr('Batch {code} cancelled', { code: batch.batchCode }));
      onCancelled();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={Boolean(batch)} onHide={() => !saving && onClose()} centered>
      <Modal.Header closeButton>
        <Modal.Title>{tr('Cancel batch {code}', { code: batch?.batchCode || '' })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <p>
          {tr('All {n} tags of this batch are deleted. This is only possible while none of them has been assigned, used or voided.', { n: formatNumber(batch?.quantity) })}
        </p>
        <Field label="Reason">
          <input className="form-control" value={reason} maxLength={255} onChange={(e) => setReason(e.target.value)} placeholder={tr('At least 3 characters')} />
        </Field>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>{tr('Keep batch')}</button>
        <button type="button" className="btn btn-danger" onClick={submit} disabled={saving || reason.trim().length < 3}>
          {saving ? tr('Cancelling…') : tr('Cancel batch')}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const BatchDetailModal = ({ batchId, onClose, onShowTags }) => {
  const [batch, setBatch] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!batchId) return;
    setBatch(null);
    setError(null);
    tagApi.getBatch(batchId).then(setBatch).catch((err) => setError(errorMessage(err)));
  }, [batchId]);

  return (
    <Modal show={Boolean(batchId)} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{tr('Batch')} {batch?.batchCode}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger mb-0">{error}</div>}
        {!error && !batch && <div className="text-center py-4"><span className="spinner-border text-primary" role="status" /></div>}
        {batch && (
          <>
            <div className="row mb-3">
              {[
                ['Available', batch.availableCount, 'text-success'],
                ['Assigned', batch.assignedCount, 'text-info'],
                ['Used', batch.usedCount, 'text-primary'],
                ['Void', batch.voidCount, 'text-danger'],
              ].map(([label, value, cls]) => (
                <div className="col-3 text-center" key={label}>
                  <div className={`fs-3 fw-bold ${cls}`}>{formatNumber(value)}</div>
                  <small className="text-muted">{tr(label)}</small>
                </div>
              ))}
            </div>
            <p className="mb-1">
              <span className="text-muted">{tr('Type')}:</span> {batch.tagTypeName} &nbsp;·&nbsp;
              <span className="text-muted">{tr('Range')}:</span>{' '}
              <RangeLabel first={formatTagCode(batch.prefix, batch.startNo, batch.serialLength)} last={formatTagCode(batch.prefix, batch.endNo, batch.serialLength)} />
            </p>
            <p className="mb-1"><span className="text-muted">{tr('Created')}:</span> {formatDate(batch.createdAt)} {tr('by')} {batch.createdBy}</p>
            {batch.status === 'CANCELLED' && (
              <p className="mb-1"><span className="text-muted">{tr('Cancelled')}:</span> {formatDate(batch.cancelledAt)} {tr('by')} {batch.cancelledBy}</p>
            )}
            {batch.note && <p className="mb-1"><span className="text-muted">{tr('Note')}:</span> {batch.note}</p>}

            <h5 className="mt-4 mb-2">{tr('Assigned to')}</h5>
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead>
                  <tr><th>{tr('Allocation')}</th><th>{tr('Company')}</th><th>{tr('Range')}</th><th>{tr('Qty')}</th><th>{tr('Remaining')}</th><th>{tr('Status')}</th></tr>
                </thead>
                <tbody>
                  {batch.allocations.map((a) => (
                    <tr key={a.id}>
                      <td>{a.allocationCode}</td>
                      <td>{a.companyName || a.companyId}</td>
                      <td><RangeLabel first={a.firstTagCode} last={a.lastTagCode} /></td>
                      <td>{formatNumber(a.quantity)}</td>
                      <td>{formatNumber(a.remainingCount)}</td>
                      <td><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                  {batch.allocations.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-muted">{tr('Not assigned to any company yet')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {batch && batch.status === 'ACTIVE' && (
          <button type="button" className="btn btn-outline-primary" onClick={() => onShowTags({ batchId: batch.id })}>
            {tr('View tags of this batch')}
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={onClose}>{tr('Close')}</button>
      </Modal.Footer>
    </Modal>
  );
};

const BatchesTab = ({ types, companies, isAdmin, onChanged, onShowTags, refreshKey }) => {
  // Real tag types (Unclassified is only for opening stock waiting to be classified)
  const usableTypes = types.filter((t) => t.isActive && t.code !== UNCLASSIFIED_CODE);
  const [showOpening, setShowOpening] = useState(false);
  const [classify, setClassify] = useState(null); // { batch } when open
  const [filters, setFilters, clearFilters, active] = useUrlFilters('batches', BATCH_DEFAULTS);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 25, totals: {} });
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [toCancel, setToCancel] = useState(null);

  const created = resolveRange(filters.range, filters.from, filters.to);
  const query = { ...toQuery(filters, ['range', 'from', 'to']), from: created.from, to: created.to };
  const queryKey = JSON.stringify(query);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await tagApi.listBatches(JSON.parse(queryKey)));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    const timer = setTimeout(load, 300); // debounce typing in the search box
    return () => clearTimeout(timer);
  }, [load, refreshKey]);

  const afterChange = () => { load(); onChanged(); };
  const sortProps = { filters, onSort: setFilters };
  const typeOptions = types.map((t) => ({ value: String(t.id), label: t.name }));

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h4 className="card-title mb-0">{tr('Batches')}</h4>
        {isAdmin && (
          <div className="d-flex gap-2 flex-wrap">
            <ExportButtons report="batches" params={query} disabled={data.total === 0} />
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setClassify({ batch: null })}>
              <i className="fa fa-tags me-2" />{tr('Classify tags')}
            </button>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setShowOpening(true)}>
              <i className="fa fa-box-open me-2" />{tr('Register opening stock')}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowGenerate(true)} disabled={usableTypes.length === 0}>
              <i className="fa fa-plus me-2" />{tr('Generate batch')}
            </button>
          </div>
        )}
      </div>
      <div className="card-body">
        <FilterPanel
          active={active}
          onClear={clearFilters}
          more={(
            <>
              <div className="col-md-3">
                <SelectFilter label="Usage" value={filters.usage} onChange={(v) => setFilters({ usage: v })} options={USAGE_OPTIONS} />
              </div>
              <div className="col-md-3">
                <TextFilter label="Created by" value={filters.createdBy} onChange={(v) => setFilters({ createdBy: v })} placeholder="Starts with…" />
              </div>
            </>
          )}
        >
          <div className="col-md-3">
            <TextFilter label="Search" value={filters.search} onChange={(v) => setFilters({ search: v })} placeholder="Batch code, prefix or a number" />
          </div>
          <div className="col-md-3">
            <MultiSelect label="Tag type" options={typeOptions} value={filters.tagTypeId} onChange={(v) => setFilters({ tagTypeId: v })} placeholder="All types" />
          </div>
          <div className="col-md-2">
            <MultiSelect label="Source" options={SOURCE_OPTIONS} value={filters.source} onChange={(v) => setFilters({ source: v })} placeholder="All" />
          </div>
          <div className="col-md-2">
            <MultiSelect label="Status" options={STATUS_OPTIONS} value={filters.status} onChange={(v) => setFilters({ status: v })} placeholder="All" />
          </div>
          <div className="col-md-2">
            <DateRangeFilter label="Created" value={{ range: filters.range, from: filters.from, to: filters.to }}
              onChange={(v) => setFilters({ range: v.range, from: v.from, to: v.to })} />
          </div>
        </FilterPanel>

        <TotalsBar items={[
          ['Batches', data.total],
          ['Tags', data.totals?.quantity || 0],
          ['Available', data.totals?.available || 0, '#22c55e'],
          ['Assigned', data.totals?.assigned || 0, '#38bdf8'],
          ['Used', data.totals?.used || 0, '#a78bfa'],
          ['Void', data.totals?.void || 0, '#f87171'],
        ]} />

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <SortTh label="Batch" sortKey="batchCode" {...sortProps} />
                <SortTh label="Type" sortKey="tagTypeName" {...sortProps} />
                <th>{tr('Range')}</th>
                <SortTh label="Qty" sortKey="quantity" {...sortProps} />
                <SortTh label="Available" sortKey="availableCount" {...sortProps} />
                <SortTh label="Assigned" sortKey="assignedCount" {...sortProps} />
                <SortTh label="Used" sortKey="usedCount" {...sortProps} />
                <SortTh label="% used" sortKey="usedPct" {...sortProps} style={{ minWidth: 140 }} />
                <th>{tr('Void')}</th>
                <SortTh label="Status" sortKey="status" {...sortProps} />
                <SortTh label="Created" sortKey="createdAt" {...sortProps} />
                <th className="text-end">{tr('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.items.length === 0 && <TableMessage colSpan={12} loading />}
              {!loading && data.items.length === 0 && (
                <TableMessage colSpan={12}>
                  {active > 0 ? 'No batches match these filters' : 'No batches yet. Use “Generate batch” to create the first range of tags.'}
                </TableMessage>
              )}
              {data.items.map((b) => {
                const cancellable = b.status === 'ACTIVE' && b.availableCount === b.quantity;
                const unclassified = b.status === 'ACTIVE' && b.tagTypeCode === UNCLASSIFIED_CODE;
                const gaps = b.quantity !== b.endNo - b.startNo + 1;
                return (
                  <tr key={b.id}>
                    <td className="fw-bold">
                      {b.batchCode}
                      {b.source === 'OPENING' && <div><span className="badge light badge-warning">{tr('Opening stock')}</span></div>}
                    </td>
                    <td>{b.tagTypeName}</td>
                    <td>
                      <RangeLabel first={formatTagCode(b.prefix, b.startNo, b.serialLength)} last={formatTagCode(b.prefix, b.endNo, b.serialLength)} />
                      {gaps && <div><small className="text-muted">{tr('not continuous')}</small></div>}
                    </td>
                    <td>{formatNumber(b.quantity)}</td>
                    <td>{formatNumber(b.availableCount)}</td>
                    <td>{formatNumber(b.assignedCount)}</td>
                    <td>{formatNumber(b.usedCount)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{ width: `${b.quantity ? Math.round((b.usedCount / b.quantity) * 100) : 0}%`, height: '100%', background: '#a78bfa', borderRadius: 3 }} />
                        </div>
                        <small className="text-muted">{b.quantity ? Math.round((b.usedCount / b.quantity) * 100) : 0}%</small>
                      </div>
                    </td>
                    <td>{formatNumber(b.voidCount)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="text-nowrap"><small>{formatDate(b.createdAt)}<br /><span className="text-muted">{b.createdBy}</span></small></td>
                    <td className="text-end text-nowrap">
                      <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => setDetailId(b.id)}>{tr('View')}</button>
                      {isAdmin && unclassified && (
                        <button type="button" className="btn btn-sm btn-outline-info me-1" onClick={() => setClassify({ batch: b })}>{tr('Classify')}</button>
                      )}
                      {isAdmin && cancellable && (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setToCancel(b)}>{tr('Cancel')}</button>
                      )}
                    </td>
                  </tr>
                );
              })}
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

      <OpeningStockModal
        show={showOpening}
        types={usableTypes}
        companies={companies.filter((c) => String(c.country || '').trim().toUpperCase() === 'DRC')}
        onClose={() => setShowOpening(false)}
        onDone={() => { setShowOpening(false); afterChange(); }}
      />
      <ClassifyModal
        show={Boolean(classify)}
        types={usableTypes}
        allTypes={types}
        presetBatch={classify?.batch || null}
        onClose={() => setClassify(null)}
        onDone={() => { setClassify(null); afterChange(); }}
      />
      <GenerateBatchModal
        show={showGenerate}
        types={usableTypes}
        onClose={() => setShowGenerate(false)}
        onCreated={() => { setShowGenerate(false); afterChange(); }}
      />
      <BatchDetailModal
        batchId={detailId}
        onClose={() => setDetailId(null)}
        onShowTags={(filter) => { setDetailId(null); onShowTags(filter); }}
      />
      <CancelBatchModal
        batch={toCancel}
        onClose={() => setToCancel(null)}
        onCancelled={() => { setToCancel(null); afterChange(); }}
      />
    </div>
  );
};

export default BatchesTab;
