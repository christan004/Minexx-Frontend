import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import {
  CompanySelect, Field, Pagination, PAGE_SIZE, RangeLabel, StatusBadge, TableMessage, TypeSelect, UNCLASSIFIED_CODE,
  formatDate, formatNumber,
} from './shared';

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
        `${allocation.allocationCode}: ${formatNumber(allocation.quantity)} tags (${allocation.firstTagCode} → ${allocation.lastTagCode}) assigned to ${allocation.companyName || allocation.companyId}`
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
        <Modal.Title>Assign tags to a company</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Field label="Company">
          <CompanySelect companies={companies} value={companyId} onChange={setCompanyId} />
        </Field>
        <div className="row">
          <div className="col-md-6">
            <Field label="Tag type" hint={`${formatNumber(totalAvailable)} available`}>
              <TypeSelect types={types} value={tagTypeId} onChange={setTagTypeId} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="How">
              <select className="form-control" value={mode} onChange={(ev) => setMode(ev.target.value)}>
                <option value="quantity">By quantity (next free tags)</option>
                <option value="range">Choose an exact range</option>
              </select>
            </Field>
          </div>
        </div>

        {totalAvailable === 0 ? (
          <div className="alert alert-warning">No tags of this type are available. Generate a batch first.</div>
        ) : mode === 'quantity' ? (
          <Field label="Quantity" hint={`The lowest continuous block is used. Largest free block: ${formatNumber(largestBlock)}`}>
            <input type="number" min={1} className="form-control" value={quantity} onChange={(ev) => setQuantity(ev.target.value)} />
          </Field>
        ) : (
          <>
            <Field label="Available range">
              <select className="form-control" value={rangeIndex} onChange={(ev) => pickRange(ev.target.value)}>
                <option value="">Select a range…</option>
                {ranges.map((r, i) => (
                  <option key={`${r.batchId}-${r.startNo}`} value={i}>
                    {r.firstTagCode} → {r.lastTagCode} ({formatNumber(r.quantity)} tags, batch {r.batchCode})
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
                      ? `${formatNumber(e - s + 1)} tags will be assigned.`
                      : `Choose numbers between ${range.startNo} and ${range.endNo}, with “To” not lower than “From”.`}
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
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>Cancel</button>
        <button type="button" className="btn btn-primary" onClick={submit} disabled={!canSubmit}>
          {saving ? 'Assigning…' : 'Assign tags'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const ReturnTagsModal = ({ allocation, onClose, onReturned }) => {
  const [mode, setMode] = useState('all');
  const [startNo, setStartNo] = useState('');
  const [endNo, setEndNo] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!allocation) return;
    setMode('all');
    setStartNo(String(allocation.startNo));
    setEndNo(String(allocation.endNo));
    setReason('');
    setError(null);
  }, [allocation]);

  const s = Number(startNo);
  const e = Number(endNo);
  const rangeValid = allocation && s >= allocation.startNo && e <= allocation.endNo && e >= s;

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await tagApi.returnTags(allocation.id, {
        ...(mode === 'range' ? { startNo: s, endNo: e } : {}),
        reason: reason.trim(),
      });
      toast.success(`${formatNumber(result.returned)} unused tags returned to stock from ${result.allocationCode}`);
      onReturned();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={Boolean(allocation)} onHide={() => !saving && onClose()} centered>
      <Modal.Header closeButton>
        <Modal.Title>Return tags — {allocation?.allocationCode}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <p className="mb-3">
          {allocation?.companyName} holds {formatNumber(allocation?.remainingCount)} unused tags in{' '}
          <RangeLabel first={allocation?.firstTagCode} last={allocation?.lastTagCode} />. Used and void tags are never returned.
        </p>
        <Field label="Return">
          <select className="form-control" value={mode} onChange={(ev) => setMode(ev.target.value)}>
            <option value="all">All unused tags</option>
            <option value="range">Only a range</option>
          </select>
        </Field>
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
                <div className="alert alert-warning">Choose numbers between {allocation?.startNo} and {allocation?.endNo}.</div>
              </div>
            )}
          </div>
        )}
        <Field label="Reason (optional)">
          <input className="form-control" maxLength={255} value={reason} onChange={(ev) => setReason(ev.target.value)} />
        </Field>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>Cancel</button>
        <button type="button" className="btn btn-warning" onClick={submit} disabled={saving || (mode === 'range' && !rangeValid)}>
          {saving ? 'Returning…' : 'Return to stock'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const AllocationsTab = ({ types, companies: allCompanies, isAdmin, onChanged, onShowTags, refreshKey }) => {
  // Tags are only allocated to DRC companies
  const companies = useMemo(() => allCompanies.filter((c) => String(c.country || '').trim().toUpperCase() === 'DRC'), [allCompanies]);
  const [filters, setFilters] = useState({ companyId: '', tagTypeId: '', status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [toReturn, setToReturn] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await tagApi.listAllocations({ ...filters, page, limit: PAGE_SIZE }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const setFilter = (patch) => { setFilters((prev) => ({ ...prev, ...patch })); setPage(1); };
  const afterChange = () => { load(); onChanged(); };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h4 className="card-title mb-0">Allocations</h4>
        {isAdmin && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAssign(true)}>
            <i className="fa fa-share me-2" />Assign tags
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-5 mb-2">
            <CompanySelect companies={companies} value={filters.companyId} onChange={(v) => setFilter({ companyId: v })} isClearable placeholder="All companies" />
          </div>
          <div className="col-md-4 mb-2">
            <TypeSelect types={types} value={filters.tagTypeId} onChange={(v) => setFilter({ tagTypeId: v })} allLabel="All tag types" />
          </div>
          <div className="col-md-3 mb-2">
            <select className="form-control" value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Allocation</th>
                <th>Company</th>
                <th>Type</th>
                <th>Range</th>
                <th>Qty</th>
                <th>Remaining</th>
                <th>Used</th>
                <th>Void</th>
                <th>Returned</th>
                <th>Status</th>
                <th>Assigned</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.items.length === 0 && <TableMessage colSpan={12} loading />}
              {!loading && data.items.length === 0 && <TableMessage colSpan={12}>No allocations found</TableMessage>}
              {data.items.map((a) => (
                <tr key={a.id}>
                  <td className="fw-bold">{a.allocationCode}</td>
                  <td>{a.companyName || a.companyId}</td>
                  <td>{a.tagTypeName}</td>
                  <td><RangeLabel first={a.firstTagCode} last={a.lastTagCode} /></td>
                  <td>{formatNumber(a.quantity)}</td>
                  <td>{formatNumber(a.remainingCount)}</td>
                  <td>{formatNumber(a.usedCount)}</td>
                  <td>{formatNumber(a.voidCount)}</td>
                  <td>{formatNumber(a.returnedQuantity)}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-nowrap"><small>{formatDate(a.assignedAt)}<br /><span className="text-muted">{a.assignedBy}</span></small></td>
                  <td className="text-end text-nowrap">
                    <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => onShowTags({ allocationId: a.id })}>Tags</button>
                    {isAdmin && a.remainingCount > 0 && (
                      <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => setToReturn(a)}>Return</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
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
