import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import {
  Field, Pagination, PAGE_SIZE, RangeLabel, StatusBadge, TableMessage, TypeSelect, UNCLASSIFIED_CODE,
  formatDate, formatNumber,
} from './shared';
import { ClassifyModal, OpeningStockModal } from './OpeningStock';

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
      toast.success(`Batch ${batch.batchCode} created: ${formatNumber(batch.quantity)} tags (${batch.firstTagCode} → ${batch.lastTagCode})`);
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
        <Modal.Title>Generate a batch of tags</Modal.Title>
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
                        Default is {type.defaultPrefix}.{' '}
                        <button type="button" className="btn btn-link btn-sm p-0 align-baseline"
                          onClick={() => set({ prefix: type.defaultPrefix, serialLength: type.serialLength || 0 })}>
                          Use default
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
                placeholder="e.g. MB"
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
                <option value="quantity">Quantity</option>
                <option value="end">Last number</option>
              </select>
            </Field>
          </div>
          <div className="col-md-4">
            {mode === 'quantity' ? (
              <Field label="Quantity" hint={`At most ${formatNumber(MAX_BATCH_QUANTITY)}`}>
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
            {tooMany && `A batch can contain at most ${formatNumber(MAX_BATCH_QUANTITY)} tags.`}
            {tooShort && `${serialLength} digits is too short for the number ${endNo}.`}
            {!tooMany && !tooShort && (
              <>
                {formatNumber(quantity)} tags:{' '}
                <RangeLabel first={formatTagCode(form.prefix, startNo, serialLength)} last={formatTagCode(form.prefix, endNo, serialLength)} />
              </>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>Cancel</button>
        <button type="button" className="btn btn-primary" onClick={submit} disabled={!canSubmit}>
          {saving ? 'Generating…' : 'Generate tags'}
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
      toast.success(`Batch ${batch.batchCode} cancelled`);
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
        <Modal.Title>Cancel batch {batch?.batchCode}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <p>
          All {formatNumber(batch?.quantity)} tags of this batch are deleted. This is only possible while none of them
          has been assigned, used or voided.
        </p>
        <Field label="Reason">
          <input className="form-control" value={reason} maxLength={255} onChange={(e) => setReason(e.target.value)} placeholder="At least 3 characters" />
        </Field>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>Keep batch</button>
        <button type="button" className="btn btn-danger" onClick={submit} disabled={saving || reason.trim().length < 3}>
          {saving ? 'Cancelling…' : 'Cancel batch'}
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
        <Modal.Title>Batch {batch?.batchCode}</Modal.Title>
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
                  <small className="text-muted">{label}</small>
                </div>
              ))}
            </div>
            <p className="mb-1">
              <span className="text-muted">Type:</span> {batch.tagTypeName} &nbsp;·&nbsp;
              <span className="text-muted">Range:</span>{' '}
              <RangeLabel first={formatTagCode(batch.prefix, batch.startNo, batch.serialLength)} last={formatTagCode(batch.prefix, batch.endNo, batch.serialLength)} />
            </p>
            <p className="mb-1"><span className="text-muted">Created:</span> {formatDate(batch.createdAt)} by {batch.createdBy}</p>
            {batch.status === 'CANCELLED' && (
              <p className="mb-1"><span className="text-muted">Cancelled:</span> {formatDate(batch.cancelledAt)} by {batch.cancelledBy}</p>
            )}
            {batch.note && <p className="mb-1"><span className="text-muted">Note:</span> {batch.note}</p>}

            <h5 className="mt-4 mb-2">Assigned to</h5>
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead>
                  <tr><th>Allocation</th><th>Company</th><th>Range</th><th>Qty</th><th>Remaining</th><th>Status</th></tr>
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
                    <tr><td colSpan={6} className="text-center text-muted">Not assigned to any company yet</td></tr>
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
            View tags of this batch
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={onClose}>Close</button>
      </Modal.Footer>
    </Modal>
  );
};

const BatchesTab = ({ types, companies, isAdmin, onChanged, onShowTags, refreshKey }) => {
  // Real tag types (Unclassified is only for opening stock waiting to be classified)
  const usableTypes = types.filter((t) => t.isActive && t.code !== UNCLASSIFIED_CODE);
  const [showOpening, setShowOpening] = useState(false);
  const [classify, setClassify] = useState(null); // { batch } when open
  const [filters, setFilters] = useState({ tagTypeId: '', status: '', search: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [toCancel, setToCancel] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await tagApi.listBatches({ ...filters, page, limit: PAGE_SIZE }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const timer = setTimeout(load, 250); // debounce typing in the search box
    return () => clearTimeout(timer);
  }, [load, refreshKey]);

  const setFilter = (patch) => { setFilters((prev) => ({ ...prev, ...patch })); setPage(1); };
  const afterChange = () => { load(); onChanged(); };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h4 className="card-title mb-0">Batches</h4>
        {isAdmin && (
          <div className="d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setClassify({ batch: null })}>
              <i className="fa fa-tags me-2" />Classify tags
            </button>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setShowOpening(true)}>
              <i className="fa fa-box-open me-2" />Register opening stock
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowGenerate(true)} disabled={usableTypes.length === 0}>
              <i className="fa fa-plus me-2" />Generate batch
            </button>
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-4 mb-2">
            <TypeSelect types={types} value={filters.tagTypeId} onChange={(v) => setFilter({ tagTypeId: v })} allLabel="All tag types" />
          </div>
          <div className="col-md-3 mb-2">
            <select className="form-control" value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="col-md-5 mb-2">
            <input className="form-control" placeholder="Search batch code, prefix or a tag number…" value={filters.search} onChange={(e) => setFilter({ search: e.target.value })} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Type</th>
                <th>Range</th>
                <th>Qty</th>
                <th>Available</th>
                <th>Assigned</th>
                <th>Used</th>
                <th>Void</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.items.length === 0 && <TableMessage colSpan={11} loading />}
              {!loading && data.items.length === 0 && (
                <TableMessage colSpan={11}>
                  No batches yet.{isAdmin ? ' Use “Generate batch” to create the first range of tags.' : ''}
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
                      {b.source === 'OPENING' && <div><span className="badge light badge-warning">Opening stock</span></div>}
                    </td>
                    <td>{b.tagTypeName}</td>
                    <td>
                      <RangeLabel first={formatTagCode(b.prefix, b.startNo, b.serialLength)} last={formatTagCode(b.prefix, b.endNo, b.serialLength)} />
                      {gaps && <div><small className="text-muted">not continuous</small></div>}
                    </td>
                    <td>{formatNumber(b.quantity)}</td>
                    <td>{formatNumber(b.availableCount)}</td>
                    <td>{formatNumber(b.assignedCount)}</td>
                    <td>{formatNumber(b.usedCount)}</td>
                    <td>{formatNumber(b.voidCount)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="text-nowrap"><small>{formatDate(b.createdAt)}<br /><span className="text-muted">{b.createdBy}</span></small></td>
                    <td className="text-end text-nowrap">
                      <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => setDetailId(b.id)}>View</button>
                      {isAdmin && unclassified && (
                        <button type="button" className="btn btn-sm btn-outline-info me-1" onClick={() => setClassify({ batch: b })}>Classify</button>
                      )}
                      {isAdmin && cancellable && (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setToCancel(b)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
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
