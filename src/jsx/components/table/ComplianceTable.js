import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { Link } from "react-router-dom";
import { baseURL_ } from '../../../config';
import { toast } from "react-toastify";
import axiosInstance from '../../../services/AxiosInstance';
import { Modal, Button } from "react-bootstrap";
import { translations } from '../../pages/Companytranslation';

// Pre-define icons for the modal
const checkCircleIcon = icon({ name: 'check-circle' });
const exclamationTriangleIcon = icon({ name: 'exclamation-triangle' });
const fileAltIcon = icon({ name: 'file-alt' });
const infoCircleIcon = icon({ name: 'info-circle' });
const timesIcon = icon({ name: 'times' });
const checkIcon = icon({ name: 'check' });

const platform = localStorage.getItem('_dash') || '3ts';

const ComplianceTable = ({ documents, language, user, onDocumentUpdate }) => {
  const [data, setData] = useState(
    document.querySelectorAll("#allreview tbody tr")
  );

  const t = (key) => {
    if (!translations[language]) {
      console.warn(`Translation for language "${language}" not found`);
      return key;
    }
    return translations[language][key] || key;
  };

  const sort = 6;
  const activePag = useRef(0);

  // Modal state — now holds { type, driveId } instead of the raw doc
  const [docu, setdocu] = useState(null);

  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // ── Lazy file state: { [docId]: 'loading' | 'error' | '<driveFileId>' } ──
  const [documentFiles, setDocumentFiles] = useState({});

  const allDocumentsApproved =
    documents.length > 0 && documents.every(doc => doc.status === "Approved");

  // ── Lazy fetch: call /document/file/:id, store the Drive file ID ──────────
  const fetchDocumentFile = async (docId) => {
    // Already in-flight or resolved — skip
    if (documentFiles[docId]) return;

    setDocumentFiles(prev => ({ ...prev, [docId]: 'loading' }));

    try {
      const response = await fetch(
        `https://minexxapi-drc-p7n5ing2cq-uc.a.run.app/document/file/${docId}`,
        {
          method: 'GET',
          headers: {
            'x-platform': platform,
            'Authorization': `Bearer ${localStorage.getItem('_authRfrsh')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch file');

      const data = await response.json();
      const driveId = data.document?.file;

      setDocumentFiles(prev => ({
        ...prev,
        [docId]: driveId || 'error',
      }));

      // Auto-open the preview modal once we have the Drive ID
      if (driveId) {
        setdocu({ type: data.document?.type, driveId });
      } else {
        toast.error('File not found for this document');
      }
    } catch (err) {
      console.error(`Error fetching file for document ${docId}:`, err);
      setDocumentFiles(prev => ({ ...prev, [docId]: 'error' }));
      toast.error('Failed to load document file');
    }
  };

  const retryFetchDocumentFile = (docId) => {
    setDocumentFiles(prev => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  };

  // ── View button: shows spinner while loading, then opens modal ────────────
  const renderViewButton = (doc) => {
    const fileState = documentFiles[doc.id];

    if (fileState === 'loading') {
      return (
        <button className="btn btn-success light btn-sm px-4" disabled>
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
        </button>
      );
    }

    if (fileState === 'error') {
      return (
        <button
          title="Retry"
          onClick={() => retryFetchDocumentFile(doc.id)}
          className="btn btn-warning light btn-sm px-4"
        >
          <FontAwesomeIcon icon={icon({ name: 'rotate-right' })} />
        </button>
      );
    }

    // idle or resolved — clicking always triggers fetch (guard inside skips if resolved)
    // If resolved, also open modal immediately
    return (
      <button
        title="View Attachment"
        onClick={() => {
          if (fileState && fileState !== 'loading' && fileState !== 'error') {
            // Already fetched — open modal directly with cached Drive ID
            setdocu({ type: doc.type, driveId: fileState });
          } else {
            fetchDocumentFile(doc.id);
          }
        }}
        className="btn btn-success light btn-sm px-4"
      >
        <FontAwesomeIcon icon={icon({ name: 'file' })} />
      </button>
    );
  };

  // ── Download button: fetches if needed, then navigates ───────────────────
  const renderDownloadButton = (doc) => {
    const fileState = documentFiles[doc.id];
    const driveId =
      fileState && fileState !== 'loading' && fileState !== 'error'
        ? fileState
        : null;

    if (fileState === 'loading') {
      return (
        <button className="btn btn-primary light btn-sm mx-4 px-4" disabled>
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
        </button>
      );
    }

    if (driveId) {
      return (
        <Link
          to={`https://drive.usercontent.google.com/download?id=${driveId}&export=download&authuser=0`}
          title="Download"
          className="btn btn-primary light btn-sm mx-4 px-4"
        >
          <FontAwesomeIcon icon={icon({ name: 'download' })} />
        </Link>
      );
    }

    // Not yet fetched (or error) — clicking fetches the file ID first,
    // then the user can click Download again once it resolves
    return (
      <button
        title={fileState === 'error' ? 'Retry to enable download' : 'Download'}
        onClick={() => {
          if (fileState === 'error') {
            retryFetchDocumentFile(doc.id);
          } else {
            fetchDocumentFile(doc.id);
          }
        }}
        className="btn btn-primary light btn-sm mx-4 px-4"
      >
        <FontAwesomeIcon icon={icon({ name: 'download' })} />
      </button>
    );
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const chageData = (frist, sec) => {
    for (var i = 0; i < data.length; ++i) {
      if (i >= frist && i < sec) {
        data[i].classList.remove("d-none");
      } else {
        data[i].classList.add("d-none");
      }
    }
  };

  useEffect(() => {
    setData(document.querySelectorAll("#allreview tbody tr"));
    setSelectedDocuments([]);
    setSelectAll(false);
    // Reset file cache when document list changes
    setDocumentFiles({});
  }, [documents, language, user]);

  activePag.current === 0 && chageData(0, sort);

  let paggination = Array(Math.ceil(data.length / sort))
    .fill()
    .map((_, i) => i + 1);

  const onClick = (i) => {
    activePag.current = i;
    chageData(activePag.current * sort, (activePag.current + 1) * sort);
  };

  // ── Checkbox handlers ─────────────────────────────────────────────────────
  const handleCheckboxChange = (docId) => {
    setSelectedDocuments(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDocuments([]);
      setSelectAll(false);
    } else {
      setSelectedDocuments(documents.map(doc => doc.id));
      setSelectAll(true);
    }
  };

  useEffect(() => {
    if (selectedDocuments.length === documents.length && documents.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedDocuments, documents]);

  // ── Approve / Disapprove ──────────────────────────────────────────────────
  const handleApprove = async (docId) => {
    try {
      await axiosInstance.post(`${baseURL_}approve/document/${docId}`);
      toast.success("Document approved successfully");
      if (onDocumentUpdate) onDocumentUpdate(docId, "Approved");
    } catch (err) {
      console.error(`Error approving document with ID ${docId}:`, err);
      toast.error(err.response?.data?.message || err.message || "Failed to approve Document");
    }
  };

  const handledisapprove = async (docId) => {
    try {
      await axiosInstance.delete(`${baseURL_}disapprove/document/${docId}`);
      toast.success("Document disapproved successfully");
      if (onDocumentUpdate) onDocumentUpdate(docId, "Disapproved");
      setTimeout(() => { window.location.reload(); }, 1500);
    } catch (err) {
      console.error(`Error disapproving document with ID ${docId}:`, err);
      toast.error(err.response?.data?.message || err.message || "Failed to disapprove Document");
    }
  };

  // ── Confirm modal logic ───────────────────────────────────────────────────
  const showConfirmation = (action) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    setShowConfirmModal(false);

    if (confirmAction.type === 'bulk-approve') {
      try {
        const approvePromises = selectedDocuments.map(docId =>
          axiosInstance.post(`${baseURL_}approve/document/${docId}`)
        );
        await Promise.all(approvePromises);
        toast.success(`${selectedDocuments.length} document(s) approved successfully`);
        if (onDocumentUpdate) {
          selectedDocuments.forEach(docId => onDocumentUpdate(docId, "Approved"));
        }
        setSelectedDocuments([]);
        setSelectAll(false);
      } catch (err) {
        console.error("Error approving documents:", err);
        toast.error(err.response?.data?.message || err.message || "Failed to approve some documents");
      }
    } else if (confirmAction.type === 'bulk-disapprove') {
      try {
        const disapprovePromises = selectedDocuments.map(docId =>
          axiosInstance.delete(`${baseURL_}disapprove/document/${docId}`)
        );
        await Promise.all(disapprovePromises);
        toast.success(`${selectedDocuments.length} document(s) disapproved successfully`);
        if (onDocumentUpdate) {
          selectedDocuments.forEach(docId => onDocumentUpdate(docId, "Disapproved"));
        }
        setSelectedDocuments([]);
        setSelectAll(false);
      } catch (err) {
        console.error("Error disapproving documents:", err);
        toast.error(err.response?.data?.message || err.message || "Failed to disapprove some documents");
      }
    } else if (confirmAction.type === 'single-approve') {
      await handleApprove(confirmAction.docId);
    } else if (confirmAction.type === 'single-disapprove') {
      await handledisapprove(confirmAction.docId);
    }

    setConfirmAction(null);
  };

  const handleApproveAll = () => {
    if (selectedDocuments.length === 0) {
      toast.warning("Please select at least one document to approve");
      return;
    }
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    showConfirmation({ type: 'bulk-approve', documents: selectedDocs, count: selectedDocuments.length });
  };

  const handleDisapproveAll = () => {
    if (selectedDocuments.length === 0) {
      toast.warning("Please select at least one document to disapprove");
      return;
    }
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    showConfirmation({ type: 'bulk-disapprove', documents: selectedDocs, count: selectedDocuments.length });
  };

  // ── Confirmation modal render ─────────────────────────────────────────────
  const renderConfirmationModal = () => {
    if (!confirmAction) return null;

    const isBulk = confirmAction.type.includes('bulk');
    const isApprove = confirmAction.type.includes('approve') && !confirmAction.type.includes('disapprove');
    const isDanger = confirmAction.type.includes('disapprove');

    return (
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered backdrop="static">
        <Modal.Header closeButton className={`${isDanger ? 'bg-danger' : 'bg-success'} text-white`}>
          <Modal.Title>
            <FontAwesomeIcon icon={isDanger ? exclamationTriangleIcon : checkCircleIcon} className="me-2" />
            {isApprove ? 'Approve' : 'Disapprove'} {isBulk ? 'Documents' : 'Document'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="confirmation-content">
            {isBulk ? (
              <>
                <p className="fs-16 mb-3">
                  You are about to <strong>{isApprove ? 'approve' : 'disapprove'}</strong>{' '}
                  <span className={`badge ${isDanger ? 'badge-danger' : 'badge-success'} fs-16`}>
                    {confirmAction.count}
                  </span>{' '}
                  document(s):
                </p>
                <div className="document-list bg-dark p-3 rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {confirmAction.documents.map((doc, idx) => (
                    <div key={idx} className="d-flex align-items-start mb-2 pb-2 border-bottom">
                      <FontAwesomeIcon icon={fileAltIcon} className="text-primary me-2 mt-1" />
                      <div>
                        <div className="font-w600">{doc.type}</div>
                        <small className="text-muted">{doc.date}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="fs-16 mb-3">
                  You are about to <strong>{isApprove ? 'approve' : 'disapprove'}</strong> the following document:
                </p>
                <div className="bg-dark p-3 rounded">
                  <div className="d-flex align-items-start">
                    <FontAwesomeIcon icon={fileAltIcon} className="text-primary me-3 mt-1 fs-20" />
                    <div>
                      <div className="font-w600 fs-16">{confirmAction.doc?.type}</div>
                      <small className="text-muted">{confirmAction.doc?.date}</small>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className={`alert ${isDanger ? 'alert-danger' : 'alert-info'} mt-4 mb-0`}>
              <FontAwesomeIcon icon={infoCircleIcon} className="me-2" />
              {isDanger ? (
                <span><strong>Warning:</strong> This action will reject {isBulk ? 'these documents' : 'this document'} and cannot be undone.</span>
              ) : (
                <span>This action will mark {isBulk ? 'these documents' : 'this document'} as approved.</span>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            <FontAwesomeIcon icon={timesIcon} className="me-2" />
            Cancel
          </Button>
          <Button variant={isDanger ? 'danger' : 'success'} onClick={executeAction}>
            <FontAwesomeIcon icon={checkIcon} className="me-2" />
            Yes, {isApprove ? 'Approve' : 'Disapprove'}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div id="All" className="tab-pane">
      {renderConfirmationModal()}

      {/* Preview modal — now uses fetched driveId instead of doc.file */}
      <Modal size="lg" show={!!docu} onHide={() => setdocu(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{docu?.type}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <iframe
            title={docu?.driveId}
            src={`https://drive.google.com/file/d/${docu?.driveId}/preview`}
            width="100%"
            height="600"
            allow="autoplay"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="warning" onClick={() => setdocu(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="table-responsive table-hover fs-14">
        <div id="allreview" className="dataTables_wrapper no-footer">
          <table
            id="example2"
            className="table mb-4 dataTablesCard fs-14 dataTable no-footer"
            role="grid"
            aria-describedby="example2_info"
          >
            <thead>
              <tr role="row">
                {user.type === "investor" && user.email === 'info@minexx.co' && !allDocumentsApproved && (
                  <th
                    className="sorting_asc"
                    tabIndex="0"
                    aria-controls="example5"
                    rowSpan="1"
                    colSpan="1"
                    aria-sort="ascending"
                  >
                    <div className="checkbox me-0 align-self-center">
                      <div className="form-check custom-checkbox">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="form-check-input"
                          id="checkAll"
                        />
                        <label className="form-check-label" htmlFor="checkAll"></label>
                      </div>
                    </div>
                  </th>
                )}
                <th
                  className="d-none d-lg-table-cell sorting"
                  tabIndex="0"
                  aria-controls="example5"
                  rowSpan="1"
                  colSpan="1"
                >
                  {t('Attachment')}
                </th>
                <th>{t('Action')}</th>
                <th>
                  {user.type === "investor" && user.email === 'info@minexx.co' && !allDocumentsApproved && (
                    <div className="d-flex gap-2">
                      <button
                        title="Approve Selected"
                        onClick={handleApproveAll}
                        className="btn btn-success btn-sm px-3"
                        disabled={selectedDocuments.length === 0}
                      >
                        <FontAwesomeIcon icon={icon({ name: 'check' })} className="me-1" />
                        Approve ({selectedDocuments.length})
                      </button>
                      <button
                        title="Disapprove Selected"
                        onClick={handleDisapproveAll}
                        className="btn btn-danger btn-sm px-3"
                        disabled={selectedDocuments.length === 0}
                      >
                        <FontAwesomeIcon icon={icon({ name: 'x' })} className="me-1" />
                        Disapprove ({selectedDocuments.length})
                      </button>
                    </div>
                  )}
                </th>
              </tr>
            </thead>

            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td className="pa-5 text-center font-w200" colSpan={4}>
                    {t('Noducument')}
                  </td>
                </tr>
              ) : (
                documents.map((doc, i) => (
                  <tr key={`doc${i}`} role="row" className="odd">
                    {user.type === "investor" && user.email === 'info@minexx.co' && !allDocumentsApproved && (
                      <td className="sorting_1">
                        <div className="checkbox me-0 align-self-center">
                          <div className="form-check custom-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedDocuments.includes(doc.id)}
                              onChange={() => handleCheckboxChange(doc.id)}
                              className="form-check-input"
                              id={`customCheckBox${i}`}
                            />
                            <label className="form-check-label" htmlFor={`customCheckBox${i}`}></label>
                          </div>
                        </div>
                      </td>
                    )}
                    <td>
                      {/* Row click also triggers lazy fetch then opens modal */}
                      <div
                        className="media align-items-center pointer"
                        onClick={() => {
                          const fileState = documentFiles[doc.id];
                          if (fileState && fileState !== 'loading' && fileState !== 'error') {
                            setdocu({ type: doc.type, driveId: fileState });
                          } else {
                            fetchDocumentFile(doc.id);
                          }
                        }}
                      >
                        <div className="media-body">
                          <h4 className="font-w600 mb-1 wspace-no">{doc.type}</h4>
                          <span>{doc.date}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex">
                        {/* View button — lazy fetch */}
                        {renderViewButton(doc)}

                        {/* Download button — lazy fetch */}
                        {renderDownloadButton(doc)}

                        {/* Approve / Disapprove */}
                        {user.type === "investor" && user.email === 'info@minexx.co' && (
                          doc.status !== "Approved" ? (
                            <>
                              <button
                                title="Approve"
                                onClick={() => showConfirmation({ type: 'single-approve', doc, docId: doc.id })}
                                className="btn btn-secondary light btn-sm px-4"
                              >
                                <FontAwesomeIcon icon={icon({ name: 'check' })} />
                              </button>
                              <button
                                title="Reject"
                                onClick={() => showConfirmation({ type: 'single-disapprove', doc, docId: doc.id })}
                                className="btn btn-danger btn-subtle btn-sm px-4 ms-2"
                              >
                                <FontAwesomeIcon icon={icon({ name: 'x' })} />
                              </button>
                            </>
                          ) : (
                            <span className="btn btn-success light btn-sm px-4">
                              <FontAwesomeIcon icon={icon({ name: 'thumbs-up' })} />
                              Approved
                            </span>
                          )
                        )}
                      </div>
                    </td>
                    <td></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="d-sm-flex text-center justify-content-between align-items-center mt-3">
            <div className="dataTables_info">
              {t('Showing')} {activePag.current * sort + 1} to{" "}
              {data.length > (activePag.current + 1) * sort
                ? (activePag.current + 1) * sort
                : data.length}{" "}
              {t('of')} {data.length} {t('entries')}
            </div>
            <div className="dataTables_paginate paging_simple_numbers" id="example2_paginate">
              <Link
                className="paginate_button previous disabled"
                to=""
                onClick={() => activePag.current > 0 && onClick(activePag.current - 1)}
              >
                {t('Previous')}
              </Link>
              <span>
                {paggination.map((number, i) => (
                  <Link
                    key={i}
                    to=""
                    className={`paginate_button ${activePag.current === i ? "current" : ""}`}
                    onClick={() => onClick(i)}
                  >
                    {number}
                  </Link>
                ))}
              </span>
              <Link
                className="paginate_button next"
                to=""
                onClick={() => activePag.current + 1 < paggination.length && onClick(activePag.current + 1)}
              >
                {t('Next')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceTable;