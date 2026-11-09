/**
 * Opening stock (admins): register tags that already exist, and classify Unclassified ones.
 * Both forms first "Check" (dry run, nothing saved) and show what will happen.
 */
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import {
  CompanySelect, Field, RangeLabel, TypeSelect, UNCLASSIFIED_CODE, formatNumber, parseCodeList,
} from './shared';

const ModeSwitch = ({ value, options, onChange }) => (
  <div className="btn-group mb-3" role="group">
    {options.map(([key, label]) => (
      <button key={key} type="button" className={`btn btn-sm ${value === key ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => onChange(key)}>
        {label}
      </button>
    ))}
  </div>
);

/** Paste box + CSV/text file loader (first column, or every value). */
const CodeListInput = ({ text, onChange }) => {
  const loadFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(`${text ? `${text}\n` : ''}${reader.result}`);
    reader.readAsText(file);
    event.target.value = '';
  };
  const count = parseCodeList(text).length;
  return (
    <Field label="Tag codes" hint={`${formatNumber(count)} code(s). One per line, or separated by commas or spaces.`}>
      <textarea className="form-control" rows={6} value={text} onChange={(e) => onChange(e.target.value)} placeholder={'5449\n5450\n9906929'} />
      <input type="file" accept=".csv,.txt" className="form-control form-control-sm mt-2" onChange={loadFile} />
    </Field>
  );
};

const Problems = ({ title, list, render = (x) => x }) => {
  if (!list || list.count === 0) return null;
  return (
    <div className="mt-2">
      <strong>{formatNumber(list.count)} {title}</strong>
      <div className="text-muted" style={{ fontFamily: 'monospace', fontSize: 12, maxHeight: 90, overflowY: 'auto' }}>
        {list.sample.map(render).join(', ')}
        {list.count > list.sample.length ? ` … and ${formatNumber(list.count - list.sample.length)} more` : ''}
      </div>
    </div>
  );
};

/* ── Register opening stock ───────────────────────────── */

export const OpeningStockModal = ({ show, types, companies, onClose, onDone }) => {
  const empty = { mode: 'range', tagTypeId: '', companyId: '', prefix: '', serialLength: 0, startNo: '', endNo: '', text: '', note: '' };
  const [form, setForm] = useState(empty);
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { if (show) { setForm(empty); setReport(null); setError(null); } }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => { setForm((prev) => ({ ...prev, ...patch })); setReport(null); setError(null); };

  const body = () => ({
    mode: form.mode,
    ...(form.tagTypeId ? { tagTypeId: Number(form.tagTypeId) } : {}),
    ...(form.companyId ? { companyId: form.companyId } : {}),
    ...(form.mode === 'range'
      ? { prefix: form.prefix, serialLength: Number(form.serialLength) || 0, startNo: Number(form.startNo), endNo: Number(form.endNo) }
      : { codes: parseCodeList(form.text) }),
    ...(form.note.trim() ? { note: form.note.trim() } : {}),
  });

  const ready = form.mode === 'range'
    ? Number(form.startNo) > 0 && Number(form.endNo) >= Number(form.startNo)
    : parseCodeList(form.text).length > 0;

  const run = async (dryRun) => {
    setBusy(true);
    setError(null);
    try {
      const result = await tagApi.registerOpeningStock({ ...body(), dryRun });
      if (dryRun) {
        setReport(result);
      } else {
        toast.success(`${formatNumber(result.batches.reduce((n, b) => n + b.quantity, 0))} tags registered (${result.batches.map((b) => b.batchCode).join(', ')})`);
        onDone();
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const company = companies.find((c) => c.id === form.companyId);
  return (
    <Modal show={show} onHide={() => !busy && onClose()} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Register opening stock</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted">
          Record tags that already exist. Nothing new is printed. Tags already in the system or already used in
          Bags, Proc Bags, Processing, Production or Drum are skipped.
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row">
          <div className="col-md-6">
            <Field label="Tag type" hint="Not sure yet? Leave it Unclassified and classify the tags later.">
              <select className="form-control" value={form.tagTypeId} onChange={(e) => set({ tagTypeId: e.target.value })}>
                <option value="">Unclassified (not known yet)</option>
                {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Held by" hint="Leave empty when Minexx still holds the tags">
              <CompanySelect companies={companies} value={form.companyId} onChange={(v) => set({ companyId: v })} isClearable placeholder="Minexx (no company)" />
            </Field>
          </div>
        </div>

        <ModeSwitch value={form.mode} options={[['range', 'Range of numbers'], ['list', 'List of codes / CSV']]} onChange={(mode) => set({ mode })} />

        {form.mode === 'range' ? (
          <div className="row">
            <div className="col-md-3">
              <Field label="Prefix" hint="Empty for numbers only">
                <input className="form-control" maxLength={20} value={form.prefix}
                  onChange={(e) => set({ prefix: e.target.value.replace(/[^A-Za-z0-9-]/g, '') })} />
              </Field>
            </div>
            <div className="col-md-3">
              <Field label="Digits" hint="0 = no leading zeros">
                <input type="number" min={0} max={18} className="form-control" value={form.serialLength}
                  onChange={(e) => set({ serialLength: e.target.value })} />
              </Field>
            </div>
            <div className="col-md-3">
              <Field label="First number">
                <input type="number" min={1} className="form-control" value={form.startNo} onChange={(e) => set({ startNo: e.target.value })} />
              </Field>
            </div>
            <div className="col-md-3">
              <Field label="Last number">
                <input type="number" min={1} className="form-control" value={form.endNo} onChange={(e) => set({ endNo: e.target.value })} />
              </Field>
            </div>
          </div>
        ) : (
          <CodeListInput text={form.text} onChange={(text) => set({ text })} />
        )}

        <Field label="Note (optional)">
          <input className="form-control" maxLength={500} value={form.note} onChange={(e) => set({ note: e.target.value })} placeholder="e.g. Physical count 10 Nov 2026" />
        </Field>

        {report && (
          <div className={`alert ${report.toRegister > 0 ? 'alert-info' : 'alert-warning'} mb-0`}>
            <div>
              <strong>{formatNumber(report.toRegister)}</strong> tag(s) will be registered as <strong>{report.tagType.name}</strong>,
              held by <strong>{company ? company.name || company.id : 'Minexx'}</strong>
              {report.toRegister > 0 && <> : <RangeLabel first={report.firstTagCode} last={report.lastTagCode} /></>}
            </div>
            <Problems title="already in the system (skipped)" list={report.alreadyInSystem} />
            <Problems title="already used in a record (skipped)" list={report.usedInRecords} render={(u) => `${u.code} (${u.table} ${u.refId})`} />
            <Problems title="not valid tag codes (skipped)" list={report.invalid} />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={busy}>Close</button>
        <button type="button" className="btn btn-outline-primary" disabled={!ready || busy} onClick={() => run(true)}>
          {busy && !report ? 'Checking…' : 'Check'}
        </button>
        <button type="button" className="btn btn-primary" disabled={!report || report.toRegister === 0 || busy} onClick={() => run(false)}>
          {busy && report ? 'Registering…' : `Register ${report ? formatNumber(report.toRegister) : ''} tags`}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

/* ── Classify Unclassified tags ───────────────────────── */

export const ClassifyModal = ({ show, types, allTypes, presetBatch, onClose, onDone }) => {
  const unclassifiedType = allTypes.find((t) => t.code === UNCLASSIFIED_CODE);
  const empty = { tagTypeId: '', mode: 'batch', batchId: '', startNo: '', endNo: '', text: '' };
  const [form, setForm] = useState(empty);
  const [batches, setBatches] = useState([]);
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show) return;
    setForm({ ...empty, batchId: presetBatch ? String(presetBatch.id) : '' });
    setReport(null);
    setError(null);
    if (unclassifiedType) {
      tagApi.listBatches({ tagTypeId: unclassifiedType.id, status: 'ACTIVE', limit: 200 })
        .then((res) => setBatches(res.items))
        .catch(() => setBatches([]));
    }
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => { setForm((prev) => ({ ...prev, ...patch })); setReport(null); setError(null); };

  const body = () => ({
    tagTypeId: Number(form.tagTypeId),
    mode: form.mode,
    ...(form.mode === 'batch'
      ? {
        batchId: Number(form.batchId),
        ...(form.startNo ? { startNo: Number(form.startNo) } : {}),
        ...(form.endNo ? { endNo: Number(form.endNo) } : {}),
      }
      : { codes: parseCodeList(form.text) }),
  });

  const ready = form.tagTypeId && (form.mode === 'batch' ? form.batchId : parseCodeList(form.text).length > 0);

  const run = async (dryRun) => {
    setBusy(true);
    setError(null);
    try {
      const result = await tagApi.classifyTags({ ...body(), dryRun });
      if (dryRun) {
        setReport(result);
      } else {
        toast.success(`${formatNumber(result.classified)} tags classified as ${result.tagType.name}`);
        onDone();
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const batch = batches.find((b) => String(b.id) === String(form.batchId)) || presetBatch;
  return (
    <Modal show={show} onHide={() => !busy && onClose()} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Classify tags</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted">Give Unclassified tags their tag type. Only then can they be allocated and used.</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <Field label="New tag type">
          <TypeSelect types={types} value={form.tagTypeId} onChange={(v) => set({ tagTypeId: v })} allLabel="Select a tag type…" />
        </Field>

        <ModeSwitch value={form.mode} options={[['batch', 'From a batch'], ['list', 'List of codes / one tag']]} onChange={(mode) => set({ mode })} />

        {form.mode === 'batch' ? (
          <div className="row">
            <div className="col-md-6">
              <Field label="Batch with Unclassified tags">
                <select className="form-control" value={form.batchId} onChange={(e) => set({ batchId: e.target.value })}>
                  <option value="">Select a batch…</option>
                  {[...batches, ...(presetBatch && !batches.some((b) => b.id === presetBatch.id) ? [presetBatch] : [])].map((b) => (
                    <option key={b.id} value={b.id}>{b.batchCode} ({formatNumber(b.quantity)} tags)</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="col-md-3">
              <Field label="From number" hint={batch ? `Batch starts at ${batch.startNo}` : 'Optional'}>
                <input type="number" min={1} className="form-control" value={form.startNo} onChange={(e) => set({ startNo: e.target.value })} placeholder="All" />
              </Field>
            </div>
            <div className="col-md-3">
              <Field label="To number" hint={batch ? `Batch ends at ${batch.endNo}` : 'Optional'}>
                <input type="number" min={1} className="form-control" value={form.endNo} onChange={(e) => set({ endNo: e.target.value })} placeholder="All" />
              </Field>
            </div>
          </div>
        ) : (
          <CodeListInput text={form.text} onChange={(text) => set({ text })} />
        )}

        {report && (
          <div className={`alert ${report.toClassify > 0 ? 'alert-info' : 'alert-warning'} mb-0`}>
            <div>
              <strong>{formatNumber(report.toClassify)}</strong> tag(s) will become <strong>{report.tagType.name}</strong>
              {report.toClassify > 0 && <> : <RangeLabel first={report.firstTagCode} last={report.lastTagCode} /></>}
            </div>
            <Problems title="already have a type (skipped)" list={report.alreadyClassified} />
            <Problems title="used or void (skipped)" list={report.usedOrVoid} />
            <Problems title="not found (skipped)" list={report.notFound} />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={busy}>Close</button>
        <button type="button" className="btn btn-outline-primary" disabled={!ready || busy} onClick={() => run(true)}>
          {busy && !report ? 'Checking…' : 'Check'}
        </button>
        <button type="button" className="btn btn-primary" disabled={!report || report.toClassify === 0 || busy} onClick={() => run(false)}>
          {busy && report ? 'Classifying…' : `Classify ${report ? formatNumber(report.toClassify) : ''} tags`}
        </button>
      </Modal.Footer>
    </Modal>
  );
};
