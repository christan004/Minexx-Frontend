/**
 * Settings (admins): default prefix and digits per tag type, and the low stock minimums.
 * System minimum: alert when unallocated tags of a type fall to this number or below.
 * Company minimum: alert when a company's unused tags fall to this number or below;
 * a company can have its own number instead of the default. 0 = no alert.
 */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import { CompanySelect, Field, TableMessage, TypeSelect, UNCLASSIFIED_CODE, formatDate } from './shared';
import NotificationContacts from './NotificationContacts';
import { tr } from './i18n';

const exampleCode = (prefix, digits) => {
  const n = Number(digits) || 0;
  return `${prefix || ''}${n > 0 ? '1'.padStart(n, '0') : '1'}`;
};

const numberInput = { width: 110 };

const TypeSettingsRow = ({ type, onSaved }) => {
  const initial = () => ({
    name: type.name || '',
    defaultPrefix: type.defaultPrefix || '',
    serialLength: type.serialLength || 0,
    minAvailable: type.minAvailable || 0,
    companyMinDefault: type.companyMinDefault || 0,
  });
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => { setForm(initial()); setEditingName(false); }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const changed = JSON.stringify(form) !== JSON.stringify(initial());
  const nameValid = form.name.trim().length >= 2;

  const save = async () => {
    setSaving(true);
    try {
      await tagApi.updateTypeSettings(type.id, {
        name: form.name.trim(),
        defaultPrefix: form.defaultPrefix,
        serialLength: Number(form.serialLength) || 0,
        minAvailable: Number(form.minAvailable) || 0,
        companyMinDefault: Number(form.companyMinDefault) || 0,
      });
      toast.success(tr('{name} settings saved', { name: form.name.trim() }));
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td>
        {editingName ? (
          <div className="d-flex align-items-center gap-2">
            <input className="form-control" style={{ width: 200 }} maxLength={100} value={form.name} autoFocus
              onChange={(e) => set({ name: e.target.value })} aria-label={tr('Tag type name')} />
            <button type="button" className="btn btn-link btn-sm p-0" title={tr('Undo name change')}
              onClick={() => { set({ name: type.name }); setEditingName(false); }}>
              <i className="fa fa-undo" />
            </button>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold">{form.name}</span>
            <button type="button" className="btn btn-outline-primary btn-xs btn-sm py-0 px-2" title={tr('Rename this tag type')} onClick={() => setEditingName(true)}>
              <i className="fa fa-pen me-1" />{tr('Edit')}
            </button>
          </div>
        )}
        <small className="text-muted" style={{ fontFamily: 'monospace' }}>{type.code}</small>
        {editingName && !nameValid && <small className="text-danger d-block">{tr('At least 2 characters')}</small>}
      </td>
      <td>
        <input
          className="form-control" style={{ width: 120 }} maxLength={20} placeholder={tr('e.g. MB')}
          value={form.defaultPrefix}
          onChange={(e) => set({ defaultPrefix: e.target.value.replace(/[^A-Za-z0-9-]/g, '') })}
        />
      </td>
      <td>
        <input type="number" min={0} max={18} className="form-control" style={{ width: 90 }}
          value={form.serialLength} onChange={(e) => set({ serialLength: e.target.value })} />
      </td>
      <td style={{ fontFamily: 'monospace' }}>{exampleCode(form.defaultPrefix, form.serialLength)}</td>
      <td>
        <input type="number" min={0} className="form-control" style={numberInput}
          value={form.minAvailable} onChange={(e) => set({ minAvailable: e.target.value })} />
      </td>
      <td>
        <input type="number" min={0} className="form-control" style={numberInput}
          value={form.companyMinDefault} onChange={(e) => set({ companyMinDefault: e.target.value })} />
      </td>
      <td>
        <button type="button" className="btn btn-primary btn-sm" disabled={!changed || !nameValid || saving} onClick={save}>
          {saving ? tr('Saving…') : tr('Save')}
        </button>
      </td>
    </tr>
  );
};

const CompanyMinimums = ({ types, companies, refreshKey, onChanged }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ companyId: '', tagTypeId: '', minRemaining: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    tagApi.companyMinimums()
      .then(setRows)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [refreshKey]);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const canSave = form.companyId && form.tagTypeId && form.minRemaining !== '' && Number(form.minRemaining) >= 0 && !saving;
  const defaultFor = (tagTypeId) => types.find((t) => String(t.id) === String(tagTypeId))?.companyMinDefault || 0;

  const save = async () => {
    setSaving(true);
    try {
      await tagApi.setCompanyMinimum({
        companyId: form.companyId,
        tagTypeId: Number(form.tagTypeId),
        minRemaining: Number(form.minRemaining),
      });
      toast.success(tr('Company minimum saved'));
      setForm({ companyId: '', tagTypeId: '', minRemaining: '' });
      load();
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(tr('Remove the minimum for {company} ({type})? The default will apply again.', { company: row.companyName || row.companyId, type: row.tagTypeName }))) return;
    try {
      await tagApi.removeCompanyMinimum(row.companyId, row.tagTypeId);
      toast.success(tr('Company minimum removed'));
      load();
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title mb-0">{tr('Company minimums')}</h4>
      </div>
      <div className="card-body">
        <p className="text-muted">
          {tr('Give one company its own minimum instead of the default above. Use 0 to turn the alert off for that company.')}
        </p>
        <div className="row align-items-end">
          <div className="col-md-5">
            <Field label="Company">
              <CompanySelect companies={companies} value={form.companyId} onChange={(v) => set({ companyId: v })} />
            </Field>
          </div>
          <div className="col-md-3">
            <Field label="Tag type">
              <TypeSelect types={types} value={form.tagTypeId} onChange={(v) => set({ tagTypeId: v })} allLabel="Select a tag type…" />
            </Field>
          </div>
          <div className="col-md-2">
            <Field label="Minimum" hint={form.tagTypeId ? tr('Default: {n}', { n: defaultFor(form.tagTypeId) }) : null}>
              <input type="number" min={0} className="form-control" value={form.minRemaining}
                onChange={(e) => set({ minRemaining: e.target.value })} />
            </Field>
          </div>
          <div className="col-md-2 mb-3">
            <button type="button" className="btn btn-primary w-100" disabled={!canSave} onClick={save}>
              {saving ? tr('Saving…') : tr('Save')}
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{tr('Company')}</th>
                <th>{tr('Tag type')}</th>
                <th>{tr('Minimum')}</th>
                <th>{tr('Default')}</th>
                <th>{tr('Changed by')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(loading || rows.length === 0) && (
                <TableMessage colSpan={6} loading={loading}>No company has its own minimum; the defaults apply to all</TableMessage>
              )}
              {!loading && rows.map((row) => (
                <tr key={`${row.companyId}-${row.tagTypeId}`}>
                  <td>{row.companyName || row.companyId}</td>
                  <td>{row.tagTypeName}</td>
                  <td className="fw-bold">{row.minRemaining === 0 ? tr('Off') : row.minRemaining}</td>
                  <td className="text-muted">{defaultFor(row.tagTypeId)}</td>
                  <td><small className="text-muted">{row.updatedBy}<br />{formatDate(row.updatedAt)}</small></td>
                  <td className="text-end">
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => remove(row)}>{tr('Remove')}</button>
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

const SettingsTab = ({ types: allTypes, companies, refreshKey, onChanged }) => {
  // Unclassified opening stock has no prefix or minimums of its own
  const types = allTypes.filter((t) => t.code !== UNCLASSIFIED_CODE);
  return (
  <>
    <div className="card">
      <div className="card-header">
        <h4 className="card-title mb-0">{tr('Tag type settings')}</h4>
      </div>
      <div className="card-body">
        <p className="text-muted mb-1">
          <strong>{tr('Prefix')}</strong> {tr('and')} <strong>{tr('digits')}</strong> {tr('are filled in automatically when you generate a batch (you can still change them for one batch).')}
        </p>
        <p className="text-muted">
          <strong>{tr('System minimum')}</strong>: {tr('alert when tags not yet given to any company fall to this number or below.')}{' '}
          <strong>{tr('Company minimum')}</strong>: {tr("alert when a company's unused tags fall to this number or below. 0 = no alert.")}
        </p>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{tr('Tag type')}</th>
                <th>{tr('Prefix')}</th>
                <th>{tr('Digits')}</th>
                <th>{tr('First tag')}</th>
                <th>{tr('System minimum')}</th>
                <th>{tr('Company minimum (default)')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <TypeSettingsRow key={type.id} type={type} onSaved={onChanged} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <CompanyMinimums types={types} companies={companies} refreshKey={refreshKey} onChanged={onChanged} />

    <NotificationContacts
      companies={companies.filter((c) => String(c.country || '').trim().toUpperCase() === 'DRC')}
      refreshKey={refreshKey}
    />
  </>
  );
};

export default SettingsTab;
