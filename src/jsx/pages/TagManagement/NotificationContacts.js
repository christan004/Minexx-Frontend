/**
 * Settings: who is told when tag stock reaches its minimum.
 * - Minexx recipients (SYSTEM): receive every low stock alert.
 * - Company contacts (COMPANY): a company's representative or person in charge; receive that company's alerts.
 * A contact can have several emails (the first one is the main email); all of them get the alerts.
 * Emails are not sent yet; the list is ready for when email is configured.
 */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import { CompanySelect, Field, TableMessage, formatDate } from './shared';

const ROLES = ['Representative', 'In charge', 'Manager', 'Other'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_EMAILS = 10;

/** All emails of a contact, main first (older API answers only have `email`). */
const contactEmails = (row) => (row.emails && row.emails.length ? row.emails : [row.email]).filter(Boolean);

const emptyForm = (scope) => ({ id: null, scope, companyId: '', name: '', emails: [''], role: scope === 'COMPANY' ? 'Representative' : '', notifyLowStock: true });

/** One card: add/edit form + list, for Minexx recipients or company contacts. */
const ContactsCard = ({ scope, title, intro, companies, refreshKey }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm(scope));
  const [companyFilter, setCompanyFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    tagApi.notificationContacts({ scope, companyId: companyFilter })
      .then(setRows)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };
  useEffect(load, [refreshKey, companyFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const isCompany = scope === 'COMPANY';
  const filled = form.emails.map((e) => e.trim()).filter(Boolean);
  const badEmail = (e) => e.trim() !== '' && !EMAIL.test(e.trim());
  const repeated = (e, i) => e.trim() !== ''
    && form.emails.findIndex((x) => x.trim().toLowerCase() === e.trim().toLowerCase()) !== i;
  const emailsOk = filled.length > 0 && form.emails.every((e, i) => !badEmail(e) && !repeated(e, i));
  const canSave = form.name.trim().length >= 2 && emailsOk && (!isCompany || form.companyId) && !saving;

  const setEmail = (i, value) => set({ emails: form.emails.map((e, j) => (j === i ? value : e)) });
  const addEmail = () => set({ emails: [...form.emails, ''] });
  const removeEmail = (i) => set({ emails: form.emails.filter((_, j) => j !== i) });

  // The first filled email is the main one; the others go in extraEmails
  const body = (f) => {
    const [email, ...extraEmails] = f.emails.map((e) => e.trim()).filter(Boolean);
    return {
      scope,
      ...(isCompany ? { companyId: f.companyId } : {}),
      name: f.name.trim(),
      email,
      extraEmails,
      ...(f.role ? { role: f.role } : {}),
      notifyLowStock: f.notifyLowStock,
    };
  };

  const save = async () => {
    setSaving(true);
    try {
      if (form.id) await tagApi.updateNotificationContact(form.id, body(form));
      else await tagApi.createNotificationContact(body(form));
      toast.success(form.id ? 'Contact updated' : 'Contact added');
      setForm({ ...emptyForm(scope), companyId: isCompany ? form.companyId : '' });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleAlerts = async (row) => {
    try {
      await tagApi.updateNotificationContact(row.id, body({ ...row, emails: contactEmails(row), notifyLowStock: !row.notifyLowStock }));
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Remove ${row.name} (${contactEmails(row).join(', ')})?`)) return;
    try {
      await tagApi.removeNotificationContact(row.id);
      toast.success('Contact removed');
      if (form.id === row.id) setForm(emptyForm(scope));
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const edit = (row) => setForm({
    id: row.id, scope, companyId: row.companyId || '', name: row.name, emails: contactEmails(row), role: row.role || '', notifyLowStock: row.notifyLowStock,
  });

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title mb-0">{title}</h4>
      </div>
      <div className="card-body">
        <p className="text-muted">{intro}</p>
        <div className="row align-items-start">
          {isCompany && (
            <div className="col-md-3">
              <Field label="Company">
                <CompanySelect companies={companies} value={form.companyId} onChange={(v) => set({ companyId: v })} />
              </Field>
            </div>
          )}
          <div className={isCompany ? 'col-md-2' : 'col-md-3'}>
            <Field label="Name">
              <input className="form-control" maxLength={100} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Full name" />
            </Field>
          </div>
          <div className="col-md-3">
            <Field label={form.emails.length > 1 ? 'Emails' : 'Email'}>
              {form.emails.map((value, i) => (
                <div key={i} className={i ? 'mt-2' : ''}>
                  <div className="d-flex align-items-center gap-1">
                    <input type="email" className="form-control" maxLength={150} value={value}
                      onChange={(e) => setEmail(i, e.target.value)}
                      placeholder={i ? 'another@example.com' : 'name@example.com'} aria-label={`Email ${i + 1}`} />
                    {form.emails.length > 1 && (
                      <button type="button" className="btn btn-link btn-sm text-danger p-0" title="Remove this email" onClick={() => removeEmail(i)}>
                        <i className="fa fa-times" />
                      </button>
                    )}
                  </div>
                  {badEmail(value) && <small className="text-danger">Enter a valid email address</small>}
                  {!badEmail(value) && repeated(value, i) && <small className="text-danger">This email is already in the list</small>}
                </div>
              ))}
              {form.emails.length < MAX_EMAILS && (
                <button type="button" className="btn btn-link btn-sm p-0 mt-1" onClick={addEmail}>
                  <i className="fa fa-plus me-1" />Add another email
                </button>
              )}
            </Field>
          </div>
          <div className="col-md-2">
            <Field label={isCompany ? 'Role' : 'Role (optional)'}>
              <select className="form-control" value={form.role} onChange={(e) => set({ role: e.target.value })}>
                {!isCompany && <option value="">—</option>}
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <div className={`${isCompany ? 'col-md-2' : 'col-md-4'} pt-md-4`}>
            <div className="form-check mb-2">
              <input id={`notify-${scope}`} type="checkbox" className="form-check-input" checked={form.notifyLowStock}
                onChange={(e) => set({ notifyLowStock: e.target.checked })} />
              <label className="form-check-label" htmlFor={`notify-${scope}`}>Low stock alerts</label>
            </div>
            <div className="d-flex gap-2 mb-3">
              <button type="button" className="btn btn-primary btn-sm" disabled={!canSave} onClick={save}>
                {saving ? 'Saving…' : form.id ? 'Save changes' : 'Add'}
              </button>
              {form.id && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setForm(emptyForm(scope))}>Cancel</button>}
            </div>
          </div>
        </div>

        {isCompany && (
          <div className="row mb-2">
            <div className="col-md-4">
              <CompanySelect companies={companies} value={companyFilter} onChange={setCompanyFilter} isClearable placeholder="Show all companies" />
            </div>
          </div>
        )}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                {isCompany && <th>Company</th>}
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Low stock alerts</th>
                <th>Changed</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(loading || rows.length === 0) && (
                <TableMessage colSpan={isCompany ? 7 : 6} loading={loading}>No contacts yet</TableMessage>
              )}
              {!loading && rows.map((row) => (
                <tr key={row.id}>
                  {isCompany && <td>{row.companyName || row.companyId}</td>}
                  <td className="fw-bold">{row.name}</td>
                  <td>
                    {contactEmails(row).map((email, i, all) => (
                      <div key={email}>
                        <a href={`mailto:${email}`}>{email}</a>
                        {i === 0 && all.length > 1 && <small className="text-muted ms-1">(main)</small>}
                      </div>
                    ))}
                  </td>
                  <td>{row.role || '—'}</td>
                  <td>
                    <button type="button" className={`btn btn-xs btn-sm ${row.notifyLowStock ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => toggleAlerts(row)}
                      title="Click to switch">
                      {row.notifyLowStock ? 'On' : 'Off'}
                    </button>
                  </td>
                  <td><small className="text-muted">{row.updatedBy || row.createdBy}<br />{formatDate(row.updatedAt)}</small></td>
                  <td className="text-end text-nowrap">
                    <button type="button" className="btn btn-outline-primary btn-sm me-1" onClick={() => edit(row)}>Edit</button>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => remove(row)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const NotificationContacts = ({ companies, refreshKey }) => (
  <>
    <div className="alert alert-info">
      <i className="fa fa-envelope me-2" />
      Emails are not sent yet. The people below are saved now, so low stock emails can start as soon as email is configured.
    </div>
    <ContactsCard
      scope="SYSTEM"
      title="Minexx notification recipients"
      intro="These people receive every low stock alert: tags left to give to companies, and every company running low."
      companies={companies}
      refreshKey={refreshKey}
    />
    <ContactsCard
      scope="COMPANY"
      title="Company contacts"
      intro="A company’s representative or person in charge. They receive the low stock alerts of their own company. A company can have several contacts, and each contact can have several emails."
      companies={companies}
      refreshKey={refreshKey}
    />
  </>
);

export default NotificationContacts;
