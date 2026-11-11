import React from 'react';
import Select from 'react-select';
import { localMoment, tr } from './i18n';

export const PAGE_SIZE = 25;

export const TAG_STATUSES = ['AVAILABLE', 'ASSIGNED', 'USED', 'VOID'];
export const EVENT_TYPES = ['GENERATED', 'BATCH_CANCELLED', 'ASSIGNED', 'RETURNED', 'USED', 'VOIDED', 'REGISTERED', 'CLASSIFIED'];

// Opening stock registered without a type; it cannot be used until classified
export const UNCLASSIFIED_CODE = 'UNCLASSIFIED';

/** Tag codes from pasted text or a CSV: split on new lines, commas, semicolons, tabs and spaces. */
export const parseCodeList = (text) =>
  [...new Set(String(text || '').split(/[\s,;]+/).map((c) => c.replace(/^"|"$/g, '').trim()).filter(Boolean))];

// Badge classes from the dashboard theme
const BADGE = {
  AVAILABLE: 'badge-success',
  ACTIVE: 'badge-success',
  ASSIGNED: 'badge-info',
  USED: 'badge-primary',
  VOID: 'badge-danger',
  CANCELLED: 'badge-danger',
  RETURNED: 'badge-warning',
  GENERATED: 'badge-success',
  BATCH_CANCELLED: 'badge-danger',
  VOIDED: 'badge-danger',
  REGISTERED: 'badge-success',
  CLASSIFIED: 'badge-info',
  OPENING: 'badge-warning',
};

export const StatusBadge = ({ status }) => (
  <span className={`badge light ${BADGE[status] || 'badge-secondary'}`}>{tr(status)}</span>
);

export const formatDate = (value) => (value ? localMoment(value).format('DD MMM YYYY, HH:mm') : '—');

export const formatNumber = (value) => Number(value || 0).toLocaleString();

/** Admin = Minexx staff; the API only lets them generate, assign, return, void and cancel. */
export const isAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem('_authUsr'))?.type === 'minexx';
  } catch (e) {
    return false;
  }
};

export const fieldLabel = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  display: 'block',
  marginBottom: '6px',
};

// Plain text is translated here, so callers can pass English strings
const text = (value) => (typeof value === 'string' ? tr(value) : value);

export const Field = ({ label, hint, children }) => (
  <div className="mb-3">
    <label style={fieldLabel}>{text(label)}</label>
    {children}
    {hint && <small className="text-muted d-block mt-1">{text(hint)}</small>}
  </div>
);

export const TableMessage = ({ colSpan, loading, children }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-4 text-muted">
      {loading ? <span className="spinner-border spinner-border-sm text-primary" role="status" /> : text(children)}
    </td>
  </tr>
);

export const Pagination = ({ page, limit, total, onChange }) => {
  const pages = Math.max(Math.ceil(total / limit), 1);
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
      <small className="text-muted">
        {tr('Showing {from}–{to} of {total}', { from: formatNumber(from), to: formatNumber(to), total: formatNumber(total) })}
      </small>
      <div className="btn-group">
        <button type="button" className="btn btn-sm btn-outline-primary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          ‹ {tr('Previous')}
        </button>
        <span className="btn btn-sm btn-outline-primary disabled">
          {page} / {pages}
        </span>
        <button type="button" className="btn btn-sm btn-outline-primary" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          {tr('Next')} ›
        </button>
      </div>
    </div>
  );
};

// react-select styled for the dark dashboard cards
export const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: '#111c25',
    borderColor: state.isFocused ? '#007bff' : '#2a3a4a',
    boxShadow: 'none',
    minHeight: '48px',
  }),
  menu: (base) => ({ ...base, background: '#1a2228', border: '1px solid #2a3a4a', zIndex: 20 }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? '#22303c' : 'transparent',
    color: '#e2e8f0',
    cursor: 'pointer',
  }),
  singleValue: (base) => ({ ...base, color: '#e2e8f0' }),
  input: (base) => ({ ...base, color: '#e2e8f0' }),
  placeholder: (base) => ({ ...base, color: '#64748b' }),
};

/** Searchable company picker; `companies` comes from tagApi.companies(). */
export const CompanySelect = ({ companies, value, onChange, isClearable = false, placeholder }) => {
  const options = companies.map((c) => ({
    value: c.id,
    label: c.name || c.id,
  }));
  return (
    <Select
      options={options}
      value={options.find((o) => o.value === value) || null}
      onChange={(option) => onChange(option ? option.value : '')}
      isClearable={isClearable}
      placeholder={placeholder || tr('Select a company…')}
      noOptionsMessage={() => tr('No companies')}
      styles={selectStyles}
    />
  );
};

export const TypeSelect = ({ types, value, onChange, allLabel }) => (
  <select className="form-control" value={value} onChange={(e) => onChange(e.target.value)}>
    {allLabel && <option value="">{text(allLabel)}</option>}
    {types.map((t) => (
      <option key={t.id} value={t.id}>
        {t.name}
      </option>
    ))}
  </select>
);

/** "PREFIX0001 → PREFIX0100" style range label. */
export const RangeLabel = ({ first, last }) => (
  <span style={{ fontFamily: 'monospace' }}>
    {first}
    {last && last !== first ? ` → ${last}` : ''}
  </span>
);
