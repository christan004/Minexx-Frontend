import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import { CompanySelect, TableMessage, TypeSelect, formatNumber } from './shared';

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const downloadCsv = (rows) => {
  const header = ['Company', 'Company ID', 'Tag type', 'Assigned', 'Used', 'Void', 'Remaining'];
  const lines = rows.map((r) =>
    [r.companyName, r.companyId, r.tagTypeName, r.assignedTotal, r.usedCount, r.voidCount, r.remainingCount].map(csvCell).join(',')
  );
  const blob = new Blob([[header.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tag-balances-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const BalancesTab = ({ types, companies, refreshKey, stockAlerts }) => {
  // companyId-tagTypeId -> alert, for rows at or below their minimum
  const lowByKey = new Map((stockAlerts?.companies || []).map((a) => [`${a.companyId}-${a.tagTypeId}`, a]));
  const [filters, setFilters] = useState({ companyId: '', tagTypeId: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    tagApi.balances(filters)
      .then(setRows)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [filters, refreshKey]);

  const totals = rows.reduce(
    (sum, r) => ({
      assignedTotal: sum.assignedTotal + r.assignedTotal,
      usedCount: sum.usedCount + r.usedCount,
      voidCount: sum.voidCount + r.voidCount,
      remainingCount: sum.remainingCount + r.remainingCount,
    }),
    { assignedTotal: 0, usedCount: 0, voidCount: 0, remainingCount: 0 }
  );

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h4 className="card-title mb-0">Balances per company</h4>
        <button type="button" className="btn btn-outline-primary btn-sm" disabled={rows.length === 0} onClick={() => downloadCsv(rows)}>
          <i className="fa fa-download me-2" />Export CSV
        </button>
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <CompanySelect companies={companies} value={filters.companyId} onChange={(v) => setFilters((f) => ({ ...f, companyId: v }))} isClearable placeholder="All companies" />
          </div>
          <div className="col-md-4 mb-2">
            <TypeSelect types={types} value={filters.tagTypeId} onChange={(v) => setFilters((f) => ({ ...f, tagTypeId: v }))} allLabel="All tag types" />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Tag type</th>
                <th>Assigned (total)</th>
                <th>Used</th>
                <th>Void</th>
                <th>Remaining</th>
                <th style={{ width: '20%' }}>Usage</th>
              </tr>
            </thead>
            <tbody>
              {(loading || rows.length === 0) && (
                <TableMessage colSpan={7} loading={loading}>No tags have been assigned to companies yet</TableMessage>
              )}
              {!loading && rows.map((r) => {
                const usedPct = r.assignedTotal ? Math.round((r.usedCount / r.assignedTotal) * 100) : 0;
                const low = lowByKey.get(`${r.companyId}-${r.tagTypeId}`);
                return (
                  <tr key={`${r.companyId}-${r.tagTypeId}`} style={low ? { background: 'rgba(239,68,68,0.12)' } : undefined}>
                    <td>{r.companyName || r.companyId}</td>
                    <td>{r.tagTypeName}</td>
                    <td>{formatNumber(r.assignedTotal)}</td>
                    <td>{formatNumber(r.usedCount)}</td>
                    <td>{formatNumber(r.voidCount)}</td>
                    <td className="fw-bold">
                      {formatNumber(r.remainingCount)}
                      {low && (
                        <span className="badge badge-danger ms-2" title={`Minimum ${formatNumber(low.minimum)}`}>
                          Low (min {formatNumber(low.minimum)})
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{ width: `${usedPct}%`, height: '100%', background: '#a78bfa', borderRadius: 3 }} />
                        </div>
                        <small className="text-muted">{usedPct}%</small>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {!loading && rows.length > 1 && (
              <tfoot>
                <tr className="fw-bold">
                  <td colSpan={2}>Total</td>
                  <td>{formatNumber(totals.assignedTotal)}</td>
                  <td>{formatNumber(totals.usedCount)}</td>
                  <td>{formatNumber(totals.voidCount)}</td>
                  <td>{formatNumber(totals.remainingCount)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalancesTab;
