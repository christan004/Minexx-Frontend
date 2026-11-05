import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { tagApi, errorMessage } from './api';
import { Field, Pagination, PAGE_SIZE, TableMessage, formatDate } from './shared';

// Plain-language explanation and suggested fix for each refusal reason
const REASONS = {
  WRONG_COMPANY: ['Tag belongs to another company', 'Check the company on the record, or reassign the tag, then Retry.'],
  ALREADY_USED: ['Tag was already used on another record', 'Two records carry the same tag. Correct one of them in AppSheet.'],
  NOT_ASSIGNED: ['Tag was not assigned to any company', 'Assign the tag to the company (Allocations), then Retry.'],
  VOID: ['Tag is void', 'Correct the tag on the record in AppSheet.'],
  WRONG_TAG_TYPE: ['Wrong kind of tag for this stage', 'A tag of another stage was entered. Correct it in AppSheet.'],
  TAG_NOT_FOUND: ['Tag does not exist', 'Probably a typo. Correct the tag in AppSheet.'],
};

const ResolveModal = ({ failure, onClose, onResolved }) => {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { setNote(''); setError(null); }, [failure]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await tagApi.resolveUseFailure(failure.id, note.trim());
      toast.success('Issue marked as resolved');
      onResolved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={Boolean(failure)} onHide={() => !saving && onClose()} centered>
      <Modal.Header closeButton>
        <Modal.Title>Resolve issue</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <p>
          <code>{failure?.tagCode}</code> on {failure?.refTable} <code>{failure?.refId}</code>: {failure?.message}
        </p>
        <Field label="What was done">
          <input className="form-control" maxLength={255} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Bag corrected in AppSheet to TST0005" />
        </Field>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>Cancel</button>
        <button type="button" className="btn btn-primary" onClick={submit} disabled={saving || note.trim().length < 3}>
          {saving ? 'Saving…' : 'Mark resolved'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

/** Tag uses refused after AppSheet had already saved the record. */
const IssuesTab = ({ isAdmin, onChanged, onOpenTag, refreshKey }) => {
  const [status, setStatus] = useState('OPEN');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(null);
  const [toResolve, setToResolve] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await tagApi.useFailures({ status, page, limit: PAGE_SIZE }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const retry = async (failure) => {
    setRetrying(failure.id);
    try {
      await tagApi.retryUseFailure(failure.id);
      toast.success(`${failure.tagCode} is now recorded as used on ${failure.refTable} ${failure.refId}`);
      onChanged();
    } catch (err) {
      toast.error(`Still refused: ${errorMessage(err)}`);
      load();
    } finally {
      setRetrying(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h4 className="card-title mb-1">Tag issues from AppSheet</h4>
          <small className="text-muted">Records saved in AppSheet whose tag the system refused. The record exists; its tag still needs attention.</small>
        </div>
        <select className="form-control" style={{ width: 180 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="OPEN">Open</option>
          <option value="RESOLVED">Resolved</option>
          <option value="">All</option>
        </select>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Record</th>
                <th>Tag</th>
                <th>Company</th>
                <th>Problem</th>
                {isAdmin && status !== 'RESOLVED' && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && data.items.length === 0 && <TableMessage colSpan={5} loading />}
              {!loading && data.items.length === 0 && (
                <TableMessage colSpan={5}>{status === 'OPEN' ? 'No open issues — every tag from AppSheet was accepted.' : 'Nothing here'}</TableMessage>
              )}
              {data.items.map((f) => {
                const [title, fix] = REASONS[f.reason] || [f.reason, ''];
                return (
                  <tr key={f.id}>
                    <td className="text-nowrap">
                      {f.refTable} <code>{f.refId}</code>
                      <div><small className="text-muted">
                        {formatDate(f.lastAttemptAt)}{f.attempts > 1 ? ` · ${f.attempts} attempts` : ''}
                      </small></div>
                    </td>
                    <td>
                      <button type="button" className="btn btn-link p-0" style={{ fontFamily: 'monospace' }} onClick={() => onOpenTag(f.tagCode)}>
                        {f.tagCode}
                      </button>
                    </td>
                    <td>{f.companyName || f.companyId || '—'}</td>
                    <td style={{ minWidth: 260 }}>
                      <span className={`badge light ${f.status === 'OPEN' ? 'badge-danger' : 'badge-success'}`}>{title}</span>
                      <div><small className="text-muted">{f.message}</small></div>
                      <div className="mt-1"><small>
                        {f.status === 'OPEN'
                          ? fix
                          : <>Resolved: {f.resolutionNote} <span className="text-muted">({f.resolvedBy}, {formatDate(f.resolvedAt)})</span></>}
                      </small></div>
                    </td>
                    {isAdmin && status !== 'RESOLVED' && (
                      <td className="text-end text-nowrap">
                        {f.status === 'OPEN' && (
                          <>
                            <button type="button" className="btn btn-sm btn-outline-primary me-1" disabled={retrying === f.id} onClick={() => retry(f)}>
                              {retrying === f.id ? 'Retrying…' : 'Retry'}
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-success" onClick={() => setToResolve(f)}>Resolve</button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
      </div>

      <ResolveModal
        failure={toResolve}
        onClose={() => setToResolve(null)}
        onResolved={() => { setToResolve(null); onChanged(); }}
      />
    </div>
  );
};

export default IssuesTab;
