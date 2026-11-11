/**
 * Balances → click a row: the tags behind the numbers of one company (and tag type).
 * Given = every tag the company holds (remaining + used + void); each card lists its tags.
 * Uses the same tag list as the Tags tab, so company users only see their own tags.
 */
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import { Pagination, StatusBadge, TableMessage, formatDate, formatNumber } from './shared';
import { ExportButtons, PageSize } from './reports';
import { tr } from './i18n';

// key, label, statuses sent to the API, balance field, colour
const VIEWS = [
  ['given', 'Given', 'ASSIGNED,USED,VOID', 'assignedTotal', '#e2e8f0'],
  ['remaining', 'Remaining', 'ASSIGNED', 'remainingCount', '#38bdf8'],
  ['used', 'Used', 'USED', 'usedCount', '#a78bfa'],
  ['void', 'Voided', 'VOID', 'voidCount', '#f87171'],
];

const BalanceDetailModal = ({ row, initialView = 'given', onClose, onOpenTag }) => {
  const [view, setView] = useState(initialView);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState('25');
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 25 });
  const [loading, setLoading] = useState(false);

  // A new row starts on its own view, first page, no search
  useEffect(() => { setView(initialView); setSearch(''); setPage(1); }, [row, initialView]);
  useEffect(() => { setPage(1); }, [view, search, limit]);

  const status = (VIEWS.find(([key]) => key === view) || VIEWS[0])[2];
  const filters = {
    ...(row?.companyId ? { companyId: row.companyId } : {}),
    ...(row?.tagTypeId ? { tagTypeId: String(row.tagTypeId) } : {}),
    status,
    ...(search.trim() ? { search: search.trim() } : {}),
  };
  const queryKey = JSON.stringify({ ...filters, page, limit });

  useEffect(() => {
    if (!row) return undefined;
    setLoading(true);
    const timer = setTimeout(() => {
      tagApi.listTags(JSON.parse(queryKey))
        .then(setData)
        .catch((err) => toast.error(errorMessage(err)))
        .finally(() => setLoading(false));
    }, 250); // debounce typing
    return () => clearTimeout(timer);
  }, [queryKey, row]);

  if (!row) return null;
  const title = row.companyName || row.companyId || tr('All companies');
  const subtitle = row.tagTypeName || tr('All tag types');
  const showType = !row.tagTypeId;
  const showCompany = !row.companyId;

  return (
    <Modal show onHide={onClose} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {title} <small className="text-muted ms-2">{subtitle}</small>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row g-2 mb-3">
          {VIEWS.map(([key, label, , field, color]) => (
            <div key={key} className="col-6 col-md-3">
              <button
                type="button"
                className={`btn w-100 text-start p-3 ${view === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setView(key)}
                aria-pressed={view === key}
              >
                <small className="d-block" style={{ opacity: 0.8 }}>{tr(label)}</small>
                <span className="fs-4 fw-bold" style={view === key ? undefined : { color }}>{formatNumber(row[field])}</span>
              </button>
            </div>
          ))}
        </div>
        {row.low && (
          <div className="alert alert-danger py-2">
            {tr('Low stock: {n} remaining, minimum is {min}.', { n: formatNumber(row.remainingCount), min: formatNumber(row.minimum) })}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
          <input
            className="form-control form-control-sm" style={{ maxWidth: 260 }} value={search}
            onChange={(e) => setSearch(e.target.value)} placeholder={tr('Find a tag code (starts with)…')} aria-label={tr('Find a tag code')}
          />
          <div className="d-flex align-items-center gap-2">
            <PageSize value={limit} onChange={setLimit} />
            <ExportButtons report="tags" params={filters} disabled={data.total === 0} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>{tr('Tag code')}</th>
                {showType && <th>{tr('Type')}</th>}
                {showCompany && <th>{tr('Company')}</th>}
                <th>{tr('Status')}</th>
                <th>{tr('Allocation')}</th>
                <th>{tr('Used in / void reason')}</th>
                <th>{tr('Used at')}</th>
                <th>{tr('Used by')}</th>
              </tr>
            </thead>
            <tbody>
              {(loading || data.items.length === 0) && (
                <TableMessage colSpan={6 + (showType ? 1 : 0) + (showCompany ? 1 : 0)} loading={loading}>No tags here</TableMessage>
              )}
              {!loading && data.items.map((t) => (
                <tr key={t.tagCode}>
                  <td>
                    <button type="button" className="btn btn-link p-0 fw-bold" style={{ fontFamily: 'monospace' }} onClick={() => onOpenTag(t.tagCode)}>
                      {t.tagCode}
                    </button>
                  </td>
                  {showType && <td>{t.tagTypeName}</td>}
                  {showCompany && <td>{t.companyName || t.companyId || '—'}</td>}
                  <td><StatusBadge status={t.status} /></td>
                  <td>{t.allocationCode || '—'}</td>
                  <td>
                    {t.usedRefTable ? <>{t.usedRefTable}<br /><small className="text-muted">{t.usedRefId}</small></>
                      : t.status === 'VOID' ? <small className="text-muted">{t.voidReason || '—'}</small> : '—'}
                  </td>
                  <td className="text-nowrap"><small>{t.usedAt ? formatDate(t.usedAt) : '—'}</small></td>
                  <td><small>{t.usedBy || '—'}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
      </Modal.Body>
    </Modal>
  );
};

export default BalanceDetailModal;
