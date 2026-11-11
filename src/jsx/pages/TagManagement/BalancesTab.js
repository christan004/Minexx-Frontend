/**
 * Balances: three reports on companies' tag stock.
 * - Current balance: given, used, void, remaining, minimum, average use per month, months left.
 *   Click a row (or a number) to see the tags behind it.
 * - Stock movement: opening + received - used - void - returned (+/- reclassified) = closing, for a period.
 * - Monthly trend: tags received and used per month (chart).
 * Company users only see their own companies (the API limits it).
 */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import moment from 'moment';
import { tagApi, errorMessage } from './api';
import { TableMessage, formatDate, formatNumber } from './shared';
import BalanceDetailModal from './BalanceDetailModal';
import {
  DateRangeFilter, ExportButtons, FilterPanel, MultiSelect, SelectFilter, SortTh, TotalsBar,
  resolveRange, toQuery, useUrlFilters,
} from './reports';

const DEFAULTS = {
  view: 'current', companyId: '', tagTypeId: '', groupBy: 'both', lowOnly: '', sort: '', dir: 'desc',
  range: 'month', from: '', to: '', months: '12',
};

const VIEWS = [
  ['current', 'Current balance', 'fa-balance-scale'],
  ['movement', 'Stock movement', 'fa-exchange-alt'],
  ['trend', 'Monthly trend', 'fa-chart-bar'],
];
const GROUP_OPTIONS = [['both', 'Company and tag type'], ['company', 'Company'], ['type', 'Tag type']];
// The movement report always needs a period, so "Any time" is not offered
const MOVEMENT_RANGES = ['today', 'week', 'month', '3months', 'year', 'custom'];

const nameOf = (row) => row.companyName || row.companyId || 'All companies';

/* ── Current balance ─────────────────────────────────── */

// A number that opens the detail on its own list (the row click opens "Given")
const CountLink = ({ value, onClick, bold }) => (
  <button type="button" className={`btn btn-link p-0 text-reset ${bold ? 'fw-bold' : ''}`} style={{ textDecoration: 'underline dotted' }}
    onClick={(e) => { e.stopPropagation(); onClick(); }} disabled={!value}>
    {formatNumber(value)}
  </button>
);

const CurrentBalance = ({ filters, setFilters, refreshKey, onOpenTag }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null); // { row, view }
  const open = (row, view = 'given') => setDetail({ row, view });
  const query = toQuery({
    companyId: filters.companyId, tagTypeId: filters.tagTypeId, groupBy: filters.groupBy,
    lowOnly: filters.lowOnly, sort: filters.sort, dir: filters.dir,
  });
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    setLoading(true);
    tagApi.balances(JSON.parse(queryKey))
      .then(setRows)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [queryKey, refreshKey]);

  const sum = (key) => rows.reduce((s, r) => s + (r[key] || 0), 0);
  const sortProps = { filters, onSort: setFilters };
  const showCompany = filters.groupBy !== 'type';

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <TotalsBar items={[
          ['Rows', rows.length],
          ['Given', sum('assignedTotal')],
          ['Used', sum('usedCount'), '#a78bfa'],
          ['Void', sum('voidCount'), '#f87171'],
          ['Remaining', sum('remainingCount'), '#38bdf8'],
          ['Low stock', rows.filter((r) => r.low).length, '#fbbf24'],
        ]} />
        <ExportButtons report="balances" params={query} disabled={rows.length === 0} />
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {showCompany && <SortTh label="Company" sortKey="companyName" {...sortProps} />}
              <SortTh label="Tag type" sortKey="tagTypeName" {...sortProps} />
              <SortTh label="Given" sortKey="assignedTotal" {...sortProps} />
              <SortTh label="Used" sortKey="usedCount" {...sortProps} />
              <SortTh label="Void" sortKey="voidCount" {...sortProps} />
              <SortTh label="Remaining" sortKey="remainingCount" {...sortProps} />
              <th>Minimum</th>
              <SortTh label="Avg used / month" sortKey="avgMonthlyUse" {...sortProps} />
              <SortTh label="Months left" sortKey="monthsLeft" {...sortProps} />
              <SortTh label="Last given" sortKey="lastAssignedAt" {...sortProps} />
              <SortTh label="Last used" sortKey="lastUsedAt" {...sortProps} />
            </tr>
          </thead>
          <tbody>
            {(loading || rows.length === 0) && (
              <TableMessage colSpan={showCompany ? 11 : 10} loading={loading}>No tags have been given to companies for these filters</TableMessage>
            )}
            {!loading && rows.map((r) => (
              <tr key={`${r.companyId}-${r.tagTypeId}`} onClick={() => open(r)} title="Click to see the tags"
                style={{ cursor: 'pointer', ...(r.low ? { background: 'rgba(239,68,68,0.12)' } : {}) }}>
                {showCompany && <td className="text-primary">{nameOf(r)} <i className="fa fa-search ms-1" style={{ fontSize: 11, opacity: 0.6 }} /></td>}
                <td>{r.tagTypeName || '—'}</td>
                <td><CountLink value={r.assignedTotal} onClick={() => open(r, 'given')} /></td>
                <td><CountLink value={r.usedCount} onClick={() => open(r, 'used')} /></td>
                <td><CountLink value={r.voidCount} onClick={() => open(r, 'void')} /></td>
                <td>
                  <CountLink value={r.remainingCount} onClick={() => open(r, 'remaining')} bold />
                  {r.low && <span className="badge badge-danger ms-2">Low</span>}
                </td>
                <td>{r.minimum ? formatNumber(r.minimum) : '—'}</td>
                <td>{formatNumber(r.avgMonthlyUse)}</td>
                <td>
                  {r.monthsLeft === null ? <small className="text-muted">No recent use</small>
                    : <span style={{ color: r.monthsLeft < 1 ? '#f87171' : r.monthsLeft < 3 ? '#fbbf24' : undefined }}>
                      {formatNumber(r.monthsLeft)}{r.monthsLeft < 1 ? ' (under a month)' : ''}
                    </span>}
                </td>
                <td className="text-nowrap"><small>{r.lastAssignedAt ? formatDate(r.lastAssignedAt) : '—'}</small></td>
                <td className="text-nowrap"><small>{r.lastUsedAt ? formatDate(r.lastUsedAt) : 'Never'}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <small className="text-muted">
        Click a company to see its tags, or click a number to see those tags. Average use is measured over the last 3 months. Months left = remaining ÷ average use per month.
      </small>
      <BalanceDetailModal row={detail?.row} initialView={detail?.view} onClose={() => setDetail(null)} onOpenTag={onOpenTag} />
    </>
  );
};

/* ── Stock movement ──────────────────────────────────── */

const StockMovement = ({ filters, refreshKey }) => {
  const [data, setData] = useState({ items: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const period = resolveRange(MOVEMENT_RANGES.includes(filters.range) ? filters.range : 'month', filters.from, filters.to);
  const ready = Boolean(period.from && period.to);
  const query = toQuery({
    companyId: filters.companyId, tagTypeId: filters.tagTypeId, groupBy: filters.groupBy, from: period.from, to: period.to,
  });
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    tagApi.stockMovement(JSON.parse(queryKey))
      .then(setData)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [queryKey, refreshKey, ready]);

  const t = data.totals || {};
  const showCompany = filters.groupBy !== 'type';
  const reclassified = (r) => (r.reclassifiedIn || 0) - (r.reclassifiedOut || 0);

  if (!ready) return <div className="alert alert-info">Choose both dates of the period.</div>;
  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <span className="text-muted">
          Unused tags held by companies from <b>{moment(period.from).format('DD MMM YYYY')}</b> to <b>{moment(period.to).format('DD MMM YYYY')}</b>
        </span>
        <ExportButtons report="movement" params={query} disabled={data.items.length === 0} />
      </div>
      <TotalsBar items={[
        ['Opening', t.opening || 0],
        ['Received', t.received || 0, '#22c55e'],
        ['Used', t.used || 0, '#a78bfa'],
        ['Voided', t.voided || 0, '#f87171'],
        ['Returned', t.returned || 0, '#fbbf24'],
        ['Closing', t.closing || 0, '#38bdf8'],
      ]} />
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {showCompany && <th>Company</th>}
              <th>Tag type</th>
              <th>Opening</th>
              <th>+ Received</th>
              <th>± Reclassified</th>
              <th>− Returned</th>
              <th>− Used</th>
              <th>− Voided</th>
              <th>= Closing</th>
            </tr>
          </thead>
          <tbody>
            {(loading || data.items.length === 0) && (
              <TableMessage colSpan={showCompany ? 9 : 8} loading={loading}>No stock and no movement in this period</TableMessage>
            )}
            {!loading && data.items.map((r) => (
              <tr key={`${r.companyId}-${r.tagTypeId}`}>
                {showCompany && <td>{nameOf(r)}</td>}
                <td>{r.tagTypeName}</td>
                <td>{formatNumber(r.opening)}</td>
                <td>{formatNumber(r.received)}</td>
                <td>{reclassified(r) > 0 ? '+' : ''}{formatNumber(reclassified(r))}</td>
                <td>{formatNumber(r.returned)}</td>
                <td>{formatNumber(r.used)}</td>
                <td>{formatNumber(r.voided)}</td>
                <td className="fw-bold">{formatNumber(r.closing)}</td>
              </tr>
            ))}
          </tbody>
          {!loading && data.items.length > 1 && (
            <tfoot>
              <tr className="fw-bold">
                <td colSpan={showCompany ? 2 : 1}>Total</td>
                <td>{formatNumber(t.opening)}</td>
                <td>{formatNumber(t.received)}</td>
                <td>{formatNumber((t.reclassifiedIn || 0) - (t.reclassifiedOut || 0))}</td>
                <td>{formatNumber(t.returned)}</td>
                <td>{formatNumber(t.used)}</td>
                <td>{formatNumber(t.voided)}</td>
                <td>{formatNumber(t.closing)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <small className="text-muted">Reclassified = Unclassified opening stock that received its tag type during the period.</small>
    </>
  );
};

/* ── Monthly trend ───────────────────────────────────── */

const MonthlyTrend = ({ filters, refreshKey }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = toQuery({ companyId: filters.companyId, tagTypeId: filters.tagTypeId, months: filters.months });
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    setLoading(true);
    tagApi.usageTrend(JSON.parse(queryKey))
      .then((data) => setRows(data.map((r) => ({ ...r, label: moment(`${r.month}-01`).format('MMM YY') }))))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [queryKey, refreshKey]);

  const used = rows.reduce((s, r) => s + r.used, 0);
  const received = rows.reduce((s, r) => s + r.received, 0);
  if (loading) return <div className="text-center py-5"><span className="spinner-border text-primary" role="status" /></div>;
  return (
    <>
      <TotalsBar items={[
        ['Received', received, '#38bdf8'],
        ['Used', used, '#a78bfa'],
        ['Average used per month', Math.round((used / Math.max(rows.length, 1)) * 10) / 10],
      ]} />
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#1a2228', border: '1px solid #2a3a4a', color: '#e2e8f0' }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Legend />
            <Bar dataKey="received" name="Received" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="used" name="Used" fill="#a78bfa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="table-responsive mt-3">
        <table className="table table-sm">
          <thead><tr><th>Month</th><th>Received</th><th>Used</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.month}><td>{moment(`${r.month}-01`).format('MMMM YYYY')}</td><td>{formatNumber(r.received)}</td><td>{formatNumber(r.used)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* ── Tab ─────────────────────────────────────────────── */

const BalancesTab = ({ types, companies, refreshKey, onOpenTag }) => {
  const [filters, setFilters, clearFilters, active] = useUrlFilters('bal', DEFAULTS, ['view']);
  const view = VIEWS.some(([key]) => key === filters.view) ? filters.view : 'current';
  const typeOptions = types.map((t) => ({ value: String(t.id), label: t.name }));
  const companyOptions = companies.map((c) => ({ value: c.id, label: c.name || c.id }));

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h4 className="card-title mb-0">Balances</h4>
        <div className="btn-group" role="group" aria-label="Report">
          {VIEWS.map(([key, label, icon]) => (
            <button key={key} type="button" className={`btn btn-sm ${view === key ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilters({ view: key })}>
              <i className={`fa ${icon} me-2`} />{label}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        <FilterPanel active={active} onClear={clearFilters}>
          <div className="col-md-3">
            <MultiSelect label="Company" options={companyOptions} value={filters.companyId} onChange={(v) => setFilters({ companyId: v })} placeholder="All companies" />
          </div>
          <div className="col-md-3">
            <MultiSelect label="Tag type" options={typeOptions} value={filters.tagTypeId} onChange={(v) => setFilters({ tagTypeId: v })} placeholder="All types" />
          </div>
          {view !== 'trend' && (
            <div className="col-md-2">
              <SelectFilter label="Group by" value={filters.groupBy} onChange={(v) => setFilters({ groupBy: v })} options={GROUP_OPTIONS} />
            </div>
          )}
          {view === 'current' && (
            <div className="col-md-2">
              <SelectFilter label="Show" value={filters.lowOnly} onChange={(v) => setFilters({ lowOnly: v })} options={[['', 'All'], ['true', 'Low stock only']]} />
            </div>
          )}
          {view === 'movement' && (
            <div className="col-md-3">
              <DateRangeFilter
                label="Period"
                value={{ range: MOVEMENT_RANGES.includes(filters.range) ? filters.range : 'month', from: filters.from, to: filters.to }}
                onChange={(v) => setFilters({ range: v.range || 'month', from: v.from, to: v.to })}
              />
            </div>
          )}
          {view === 'trend' && (
            <div className="col-md-2">
              <SelectFilter label="Months" value={filters.months} onChange={(v) => setFilters({ months: v })}
                options={[['6', 'Last 6 months'], ['12', 'Last 12 months'], ['24', 'Last 24 months'], ['36', 'Last 36 months']]} />
            </div>
          )}
        </FilterPanel>

        {view === 'current' && <CurrentBalance filters={filters} setFilters={setFilters} refreshKey={refreshKey} onOpenTag={onOpenTag} />}
        {view === 'movement' && <StockMovement filters={filters} refreshKey={refreshKey} />}
        {view === 'trend' && <MonthlyTrend filters={filters} refreshKey={refreshKey} />}
      </div>
    </div>
  );
};

export default BalancesTab;
