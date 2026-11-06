import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { tagApi, errorMessage } from './api';
import { StatusBadge, formatDate } from './shared';

const Row = ({ label, children }) => (
  <div className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    <span className="text-muted">{label}</span>
    <span className="text-end">{children || '—'}</span>
  </div>
);

const describeEvent = (event) => {
  const range = event.startNo != null && event.endNo != null && event.startNo !== event.endNo
    ? ` (range ${event.startNo}–${event.endNo})`
    : '';
  const reason = event.details?.reason ? ` — ${event.details.reason}` : '';
  const ref = event.details?.refTable ? ` — ${event.details.refTable} ${event.details.refId || ''}` : '';
  return `${event.fromStatus || '—'} → ${event.toStatus || '—'}${range}${reason}${ref}`;
};

/** A tag's current details: status, type, company and where it was used. */
export const TagSummary = ({ tag }) => (
  <div className="row">
    <div className="col-md-6">
      <Row label="Status"><StatusBadge status={tag.status} /></Row>
      <Row label="Tag type">{tag.tagTypeName}</Row>
      <Row label="Serial number">{tag.serialNo}</Row>
      <Row label="Batch">{tag.batchCode}</Row>
    </div>
    <div className="col-md-6">
      <Row label="Company">{tag.companyName || tag.companyId}</Row>
      <Row label="Allocation">{tag.allocationCode}</Row>
      <Row label="Used on">{tag.usedRefTable ? `${tag.usedRefTable} ${tag.usedRefId || ''}` : null}</Row>
      <Row label={tag.status === 'VOID' ? 'Void reason' : 'Used at'}>
        {tag.status === 'VOID' ? tag.voidReason : tag.usedAt ? formatDate(tag.usedAt) : null}
      </Row>
    </div>
  </div>
);

/** Shows one tag with its full history. `tagCode` null closes the modal. */
const TagDetailModal = ({ tagCode, onClose }) => {
  const [tag, setTag] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tagCode) return;
    setTag(null);
    setError(null);
    tagApi.getTag(tagCode).then(setTag).catch((err) => setError(errorMessage(err)));
  }, [tagCode]);

  return (
    <Modal show={Boolean(tagCode)} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Tag <span style={{ fontFamily: 'monospace' }}>{tagCode}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger mb-0">{error}</div>}
        {!error && !tag && (
          <div className="text-center py-4">
            <span className="spinner-border text-primary" role="status" />
          </div>
        )}
        {tag && (
          <>
            <TagSummary tag={tag} />

            <h5 className="mt-4 mb-3">History</h5>
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Event</th>
                    <th>Change</th>
                    <th>By</th>
                  </tr>
                </thead>
                <tbody>
                  {tag.history.map((event) => (
                    <tr key={event.id}>
                      <td className="text-nowrap">{formatDate(event.createdAt)}</td>
                      <td><StatusBadge status={event.event} /></td>
                      <td>{describeEvent(event)}</td>
                      <td>{event.performedBy}</td>
                    </tr>
                  ))}
                  {tag.history.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted">No history</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default TagDetailModal;
