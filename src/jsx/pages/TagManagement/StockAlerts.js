/**
 * Low stock banner: stock at or below its minimum.
 * Admins see system and company alerts; company users only their own companies (filtered by the API).
 */
import React, { useState } from 'react';
import { formatNumber } from './shared';
import { tr } from './i18n';

const SHOWN = 5;

const StockAlerts = ({ alerts, isAdmin, onOpenSettings }) => {
  const [expanded, setExpanded] = useState(false);
  const lines = [
    ...alerts.system.map((a) => ({
      key: `s-${a.tagTypeId}`,
      text: (
        <>
          <strong>{a.tagTypeName}</strong>:{' '}
          {tr('only {n} tags left to give to companies (minimum {min}). Generate a new batch.', {
            n: formatNumber(a.available), min: formatNumber(a.minimum),
          })}
        </>
      ),
    })),
    ...alerts.companies.map((a) => ({
      key: `c-${a.companyId}-${a.tagTypeId}`,
      text: (
        <>
          <strong>{a.companyName || a.companyId}</strong>:{' '}
          {tr('{n} unused {type} tags left (minimum {min}).', {
            n: formatNumber(a.remaining), type: a.tagTypeName, min: formatNumber(a.minimum),
          })}
          {isAdmin ? ` ${tr('Allocate more tags.')}` : ''}
        </>
      ),
    })),
  ];
  if (lines.length === 0) return null;

  const visible = expanded ? lines : lines.slice(0, SHOWN);
  return (
    <div className="alert alert-danger" role="alert">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <strong>
          <i className="fa fa-exclamation-triangle me-2" />
          {tr('Low tag stock ({n})', { n: lines.length })}
        </strong>
        {isAdmin && (
          <button type="button" className="btn btn-sm btn-outline-light" onClick={onOpenSettings}>
            {tr('Change minimums')}
          </button>
        )}
      </div>
      <ul className="mb-0 mt-2 ps-3">
        {visible.map((line) => <li key={line.key}>{line.text}</li>)}
      </ul>
      {lines.length > SHOWN && (
        <button type="button" className="btn btn-link btn-sm p-0 mt-1 text-white" onClick={() => setExpanded((v) => !v)}>
          {expanded ? tr('Show less') : tr('Show all {n}', { n: lines.length })}
        </button>
      )}
    </div>
  );
};

export default StockAlerts;
