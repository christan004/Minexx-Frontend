import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import {
  CompanySelect, EVENT_TYPES, Pagination, PAGE_SIZE, StatusBadge, TableMessage, formatDate, formatNumber,
} from './shared';

const describe = (e) => {
  const parts = [];
  if (e.startNo != null && e.endNo != null) parts.push(e.startNo === e.endNo ? `#${e.startNo}` : `${e.startNo}–${e.endNo}`);
  if (e.details?.tagType) parts.push(e.details.tagType);
  if (e.details?.mode) parts.push(`by ${e.details.mode}`);
  if (e.details?.reason) parts.push(`reason: ${e.details.reason}`);
  if (e.details?.refTable) parts.push(`${e.details.refTable} ${e.details.refId || ''}`.trim());
  if (e.details?.note) parts.push(`note: ${e.details.note}`);
  return parts.join(' · ');
};

/** Audit trail (admin only on the API). */
const EventsTab = ({ companies, onOpenTag, refreshKey }) => {
  const [filters, setFilters] = useState({ event: '', companyId: '', tagCode: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await tagApi.events({ ...filters, tagCode: filters.tagCode.trim(), page, limit: PAGE_SIZE }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load, refreshKey]);

  const setFilter = (patch) => { setFilters((prev) => ({ ...prev, ...patch })); setPage(1); };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title mb-0">Audit log</h4>
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-2 mb-2">
            <select className="form-control" value={filters.event} onChange={(e) => setFilter({ event: e.target.value })}>
              <option value="">All events</option>
              {EVENT_TYPES.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <CompanySelect companies={companies} value={filters.companyId} onChange={(v) => setFilter({ companyId: v })} isClearable placeholder="All companies" />
          </div>
          <div className="col-md-2 mb-2">
            <input className="form-control" placeholder="Exact tag code" value={filters.tagCode} onChange={(e) => setFilter({ tagCode: e.target.value })} />
          </div>
          <div className="col-md-2 mb-2">
            <input type="date" className="form-control" value={filters.from} onChange={(e) => setFilter({ from: e.target.value })} aria-label="From date" />
          </div>
          <div className="col-md-2 mb-2">
            <input type="date" className="form-control" value={filters.to} onChange={(e) => setFilter({ to: e.target.value })} aria-label="To date" />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Event</th>
                <th>Batch</th>
                <th>Allocation</th>
                <th>Tag</th>
                <th>Company</th>
                <th>Qty</th>
                <th>Details</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.items.length === 0 && <TableMessage colSpan={9} loading />}
              {!loading && data.items.length === 0 && <TableMessage colSpan={9}>No events found</TableMessage>}
              {data.items.map((e) => (
                <tr key={e.id}>
                  <td className="text-nowrap"><small>{formatDate(e.createdAt)}</small></td>
                  <td><StatusBadge status={e.event} /></td>
                  <td>{e.batchCode || '—'}</td>
                  <td>{e.allocationCode || '—'}</td>
                  <td>
                    {e.tagCode ? (
                      <button type="button" className="btn btn-link p-0" style={{ fontFamily: 'monospace' }} onClick={() => onOpenTag(e.tagCode)}>
                        {e.tagCode}
                      </button>
                    ) : '—'}
                  </td>
                  <td>{e.companyName || e.companyId || '—'}</td>
                  <td>{e.quantity != null ? formatNumber(e.quantity) : '—'}</td>
                  <td><small>{describe(e)}</small></td>
                  <td><small>{e.performedBy}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
      </div>
    </div>
  );
};

export default EventsTab;
