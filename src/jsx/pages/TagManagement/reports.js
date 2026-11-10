/**
 * Report toolkit shared by the Batches, Allocations, Tags and Balances tabs:
 * filters kept in the page address (shareable, bookmarkable), date ranges with quick choices,
 * multi-selects, sortable headers, page size, totals and CSV / Excel export.
 */
import React, { useCallback, useMemo, useState } from 'react';
import Select from 'react-select';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { tagApi, errorMessage } from './api';
import { fieldLabel, formatNumber, selectStyles } from './shared';

export const PAGE_SIZES = [25, 50, 100];

/* ── Filters in the URL ───────────────────────────────── */

/**
 * Filters of one tab, stored in the page address as `<prefix>.<key>=value`.
 * `defaults` must be a constant (defined outside the component).
 * Changing any filter other than `page` goes back to page 1.
 * `keep`: keys that are choices of view, not filters (not counted, not cleared).
 */
const NOT_COUNTED = ['page', 'limit', 'sort', 'dir'];

export const useUrlFilters = (prefix, defaults, keep = []) => {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const out = { ...defaults };
    Object.keys(defaults).forEach((key) => {
      const value = params.get(`${prefix}.${key}`);
      if (value !== null) out[key] = value;
    });
    return out;
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const setFilters = useCallback((patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      const name = `${prefix}.${key}`;
      if (value === '' || value === null || value === undefined || String(value) === String(defaults[key])) next.delete(name);
      else next.set(name, String(value));
    });
    if (!('page' in patch)) next.delete(`${prefix}.page`);
    setParams(next, { replace: true });
  }, [params, prefix, setParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const clear = useCallback(() => {
    const next = new URLSearchParams(params);
    [...next.keys()]
      .filter((key) => key.startsWith(`${prefix}.`) && !keep.includes(key.slice(prefix.length + 1)))
      .forEach((key) => next.delete(key));
    setParams(next, { replace: true });
  }, [params, prefix, setParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filters in use (not counting page, size, sorting and view choices)
  const active = Object.keys(defaults)
    .filter((key) => !NOT_COUNTED.includes(key) && !keep.includes(key))
    .filter((key) => String(filters[key]) !== String(defaults[key])).length;

  return [filters, setFilters, clear, active];
};

/* ── Date ranges ──────────────────────────────────────── */

export const DATE_RANGES = [
  ['', 'Any time'],
  ['today', 'Today'],
  ['week', 'This week'],
  ['month', 'This month'],
  ['3months', 'Last 3 months'],
  ['year', 'This year'],
  ['custom', 'Custom dates'],
];

const DAY = 'YYYY-MM-DD';

/** Dates (YYYY-MM-DD) for a quick choice; relative choices stay relative in a saved link. */
export const resolveRange = (range, from, to) => {
  const today = moment();
  switch (range) {
    case 'today': return { from: today.format(DAY), to: today.format(DAY) };
    case 'week': return { from: today.clone().startOf('isoWeek').format(DAY), to: today.format(DAY) };
    case 'month': return { from: today.clone().startOf('month').format(DAY), to: today.format(DAY) };
    case '3months': return { from: today.clone().subtract(3, 'months').add(1, 'day').format(DAY), to: today.format(DAY) };
    case 'year': return { from: today.clone().startOf('year').format(DAY), to: today.format(DAY) };
    case 'custom': return { from: from || '', to: to || '' };
    default: return { from: '', to: '' };
  }
};

/** value = { range, from, to }; onChange gets the same shape. */
export const DateRangeFilter = ({ label, value, onChange }) => (
  <div>
    <label style={fieldLabel}>{label}</label>
    <select className="form-control" value={value.range} onChange={(e) => onChange({ range: e.target.value, from: '', to: '' })}>
      {DATE_RANGES.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
    </select>
    {value.range === 'custom' && (
      <div className="d-flex gap-2 mt-2">
        <input type="date" className="form-control" value={value.from} max={value.to || undefined}
          onChange={(e) => onChange({ ...value, from: e.target.value })} aria-label={`${label} from`} />
        <input type="date" className="form-control" value={value.to} min={value.from || undefined}
          onChange={(e) => onChange({ ...value, to: e.target.value })} aria-label={`${label} to`} />
      </div>
    )}
  </div>
);

/* ── Inputs ───────────────────────────────────────────── */

/** Several values at once; `value` is "A,B". */
export const MultiSelect = ({ label, options, value, onChange, placeholder = 'All' }) => {
  const chosen = String(value || '').split(',').filter(Boolean);
  return (
    <div>
      {label && <label style={fieldLabel}>{label}</label>}
      <Select
        isMulti
        options={options}
        value={options.filter((o) => chosen.includes(String(o.value)))}
        onChange={(list) => onChange((list || []).map((o) => o.value).join(','))}
        placeholder={placeholder}
        styles={{
          ...selectStyles,
          multiValue: (base) => ({ ...base, background: '#22303c' }),
          multiValueLabel: (base) => ({ ...base, color: '#e2e8f0' }),
        }}
      />
    </div>
  );
};

export const TextFilter = ({ label, value, onChange, placeholder }) => (
  <div>
    <label style={fieldLabel}>{label}</label>
    <input className="form-control" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export const SelectFilter = ({ label, value, onChange, options }) => (
  <div>
    <label style={fieldLabel}>{label}</label>
    <select className="form-control" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
    </select>
  </div>
);

/* ── Toolbar, sorting, totals, paging ─────────────────── */

/** Main filters always visible; `more` behind a "More filters" toggle. */
export const FilterPanel = ({ children, more, active, onClear }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3">
      <div className="row g-3 align-items-end">{children}</div>
      {open && more && <div className="row g-3 align-items-end mt-1">{more}</div>}
      <div className="d-flex gap-2 mt-3 flex-wrap">
        {more && (
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setOpen((v) => !v)}>
            <i className={`fa ${open ? 'fa-chevron-up' : 'fa-sliders-h'} me-2`} />{open ? 'Fewer filters' : 'More filters'}
          </button>
        )}
        {active > 0 && (
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClear}>
            <i className="fa fa-times me-2" />Clear filters ({active})
          </button>
        )}
      </div>
    </div>
  );
};

/** Column header that sorts; a second click reverses the order. */
export const SortTh = ({ label, sortKey, filters, onSort, style }) => {
  const activeSort = filters.sort === sortKey;
  const nextDir = activeSort && filters.dir === 'desc' ? 'asc' : 'desc';
  return (
    <th style={{ cursor: 'pointer', whiteSpace: 'nowrap', ...style }} onClick={() => onSort({ sort: sortKey, dir: nextDir })}
      aria-sort={activeSort ? (filters.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      {label}{' '}
      <i className={`fa ${activeSort ? (filters.dir === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} style={{ opacity: activeSort ? 1 : 0.35 }} />
    </th>
  );
};

/** Totals of everything matching the filters: [[label, number, color?], …]. */
export const TotalsBar = ({ items }) => (
  <div className="d-flex flex-wrap gap-2 mb-3">
    {items.map(([label, value, color]) => (
      <span key={label} className="badge light" style={{ fontSize: 13, padding: '8px 12px', background: 'rgba(255,255,255,0.06)', color: color || '#e2e8f0' }}>
        {label}: <b>{formatNumber(value)}</b>
      </span>
    ))}
  </div>
);

export const PageSize = ({ value, onChange }) => (
  <select className="form-control form-control-sm" style={{ width: 'auto' }} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Rows per page">
    {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} per page</option>)}
  </select>
);

/** CSV and Excel downloads of every row matching the filters. */
export const ExportButtons = ({ report, params, disabled }) => {
  const [busy, setBusy] = useState(null);
  const download = async (format) => {
    setBusy(format);
    try {
      await tagApi.exportReport(report, params, format);
    } catch (err) {
      toast.error(await exportErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="btn-group">
      <button type="button" className="btn btn-outline-primary btn-sm" disabled={disabled || busy} onClick={() => download('csv')}>
        <i className="fa fa-file-csv me-2" />{busy === 'csv' ? 'Preparing…' : 'CSV'}
      </button>
      <button type="button" className="btn btn-outline-primary btn-sm" disabled={disabled || busy} onClick={() => download('xlsx')}>
        <i className="fa fa-file-excel me-2" />{busy === 'xlsx' ? 'Preparing…' : 'Excel'}
      </button>
    </div>
  );
};

// A failed download answers JSON inside a Blob
const exportErrorMessage = async (err) => {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try { return JSON.parse(await data.text()).message || 'Export failed'; } catch (e) { return 'Export failed'; }
  }
  return errorMessage(err);
};

/** Drop UI-only keys and empty values before calling the API. */
export const toQuery = (filters, omit = []) =>
  Object.fromEntries(Object.entries(filters).filter(([key, value]) => !omit.includes(key) && value !== '' && value !== null && value !== undefined));
