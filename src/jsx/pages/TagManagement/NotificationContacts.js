/**
 * Settings: who is told when tag stock reaches its minimum.
 * - Minexx recipients (SYSTEM): receive every low stock alert.
 * - Company contacts (COMPANY): a company's representative or person in charge; receive that company's alerts.
 * Emails are not sent yet; the list is ready for when email is configured.
 */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import { CompanySelect, Field, TableMessage, formatDate } from './shared';

const ROLES = ['Representative', 'In charge', 'Manager', 'Other'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = (scope) => ({ id: null, scope, companyId: '', name: '', email: '', role: scope === 'COMPANY' ? 'Representative' : '', notifyLowStock: true });

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
  const emailOk = EMAIL.test(form.email.trim());
  const canSave = form.name.trim().length >= 2 && emailOk && (!isCompany || form.companyId) && !saving;

  const body = (f) => ({
    scope,
    ...(isCompany ? { companyId: f.companyId } : {}),
    name: f.name.trim(),
    email: f.email.trim(),
    ...(f.role ? { role: f.role } : {}),
    notifyLowStock: f.notifyLowStock,
  });

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
      await tagApi.updateNotificationContact(row.id, body({ ...row, notifyLowStock: !row.notifyLowStock }));
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Remove ${row.name} (${row.email})?`)) return;
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
    id: row.id, scope, companyId: row.companyId || '', name: row.name, email: row.email, role: row.role || '', notifyLowStock: row.notifyLowStock,
  });

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title mb-0">{title}</h4>
      </div>
      <div className="card-body">
        <p className="text-muted">{intro}</p>
        <div className="row align-items-end">
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
            <Field label="Email" hint={form.email && !emailOk ? 'Enter a valid email address' : null}>
              <input type="email" className="form-control" maxLength={150} value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="name@example.com" />
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
          <div className={isCompany ? 'col-md-2' : 'col-md-4'}>
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
                  <td><a href={`mailto:${row.email}`}>{row.email}</a></td>
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
      intro="A company’s representative or person in charge. They receive the low stock alerts of their own company. A company can have several contacts."
      companies={companies}
      refreshKey={refreshKey}
    />
  </>
);

export default NotificationContacts;
