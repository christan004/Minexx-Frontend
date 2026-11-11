/**
 * Settings → Email notifications (admins): is e-mail set up on the server,
 * check low stock now, and the log of every e-mail sent.
 * Low stock e-mails go out by themselves after each change and every 15 minutes; this card only shows them.
 */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import { Pagination, TableMessage, formatDate } from './shared';
import { tr } from './i18n';

const EmailNotifications = ({ refreshKey }) => {
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [log, setLog] = useState({ items: [], total: 0, page: 1, limit: 10 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null); // log row with its alerts shown

  const loadLog = () => {
    setLoading(true);
    tagApi.emailLog({ page, limit: 10 })
      .then(setLog)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { tagApi.emailStatus().then(setStatus).catch(() => setStatus({ configured: false })); }, [refreshKey]);
  useEffect(loadLog, [page, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkNow = async () => {
    setChecking(true);
    try {
      const r = await tagApi.checkLowStock();
      const sent = r.emails.filter((e) => e.status === 'SENT').length;
      const failed = r.emails.length - sent;
      if (!r.configured) toast.warning(tr('E-mail is not set up on the server, so nothing was sent.'));
      else if (r.newAlerts === 0) toast.info(tr('No new low stock. {n} alert(s) already e-mailed earlier.', { n: r.activeAlerts }));
      else toast.success(tr('{alerts} new low stock alert(s): {sent} e-mail(s) sent, {failed} failed.', { alerts: r.newAlerts, sent, failed }));
      if (r.withoutRecipients > 0) toast.warning(tr('{n} alert(s) have nobody to send to. Add contacts below.', { n: r.withoutRecipients }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setChecking(false);
      setPage(1);
      loadLog();
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title mb-0"><i className="fa fa-envelope me-2" />{tr('Email notifications')}</h4>
      </div>
      <div className="card-body">
        {status && (status.configured ? (
          <div className="alert alert-success">
            <i className="fa fa-check-circle me-2" />
            {tr('Low stock e-mails are on. They are sent from {from} when a stock reaches its minimum, once per drop, to the people below.', { from: status.from })}
          </div>
        ) : (
          <div className="alert alert-warning">
            <i className="fa fa-exclamation-triangle me-2" />
            {tr('E-mail is not set up on the server yet (TAG_MAIL_USER and TAG_MAIL_PASS). Nothing is sent until it is.')}
          </div>
        ))}

        <div className="row g-2 align-items-end mb-3">
          <div className="col-md-4">
            <button type="button" className="btn btn-outline-primary w-100" disabled={checking} onClick={checkNow}
              title={tr('E-mails new low stock alerts now instead of waiting for the next automatic check')}>
              <i className="fa fa-sync me-2" />{checking ? tr('Checking…') : tr('Check low stock now')}
            </button>
          </div>
        </div>

        <h5 className="mb-2">{tr('E-mail log')}</h5>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>{tr('When')}</th>
                <th>{tr('Type')}</th>
                <th>{tr('To')}</th>
                <th>{tr('Subject')}</th>
                <th>{tr('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {(loading || log.items.length === 0) && (
                <TableMessage colSpan={5} loading={loading}>No e-mails sent yet</TableMessage>
              )}
              {!loading && log.items.map((row) => (
                <React.Fragment key={row.id}>
                  <tr style={row.details?.length ? { cursor: 'pointer' } : undefined}
                    onClick={() => row.details?.length && setOpen(open === row.id ? null : row.id)}>
                    <td className="text-nowrap"><small>{formatDate(row.createdAt)}</small></td>
                    <td>{row.kind === 'TEST' ? tr('Test') : tr('Low stock')}</td>
                    <td>{row.toEmail}</td>
                    <td>
                      <small>{row.subject}</small>
                      {row.details?.length > 0 && <i className={`fa ${open === row.id ? 'fa-chevron-up' : 'fa-chevron-down'} ms-2 text-muted`} />}
                    </td>
                    <td>
                      <span className={`badge light ${row.status === 'SENT' ? 'badge-success' : 'badge-danger'}`}>
                        {row.status === 'SENT' ? tr('Sent') : tr('Failed')}
                      </span>
                      {row.error && <div><small className="text-danger">{row.error}</small></div>}
                    </td>
                  </tr>
                  {open === row.id && (
                    <tr>
                      <td colSpan={5} className="bg-light-subtle">
                        <ul className="mb-0">
                          {row.details.map((a) => (
                            <li key={`${a.scope}-${a.companyId}-${a.tagTypeName}`}>
                              <strong>{a.scope === 'SYSTEM' ? tr('Not yet given (Minexx)') : (a.companyName || a.companyId)}</strong>
                              {' – '}{a.tagTypeName}: {tr('{n} left (minimum {min})', { n: a.level, min: a.minimum })}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={log.page} limit={log.limit} total={log.total} onChange={setPage} />
      </div>
    </div>
  );
};

export default EmailNotifications;
