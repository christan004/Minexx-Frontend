import React, { useState, useEffect, useContext,useMemo } from 'react';
import { Table, Modal, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import axiosInstance from '../../services/AxiosInstance';
import { useDispatch } from 'react-redux';
import { Logout } from '../../store/actions/AuthActions';
import { useNavigate } from 'react-router-dom';
import { translations } from './Reportstranslation';

const imageColumns = new Set(['Picture']);
const fileColumns  = new Set(['Purchase Sheet', 'Assay Report', 'Holding Certificate']);
const dateColumns  = new Set(['Delivery Date', 'Processing Date', 'Payment Date']);
const ADMIN_EMAILS = ['beda@minexx.email', 'info@minexx.co'];
const CAN_VERIFY=['beda@minexx.email', 'b.akaffou@minexx.co'];
const DISPLAY_COLUMNS = [
    'Lot Number',
    'Delivery Date',
    'Supplier Name',
    'Type of Minerals',
    'Total Weight Delivered',
    'Picture',
    'Processing Date',
    'Processing Weight (kg)',
    'Laboratory',
    'Grade (%)',
    'Payment Date',
    'Amount Paid',
    'Holding Certificate',
    'Purchase Sheet',
    'Assay Report',
    'Chain Verify',
];

const PENDING_STATUSES = new Set([
    'no available',
    'no avalible',
    'pending',
]);

// ── Lazy File Button ────────────────────────────────────────────────────────
const LazyFileButton = ({ filePath, type }) => {
    const [fileId,  setFileId]  = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(false);

    const isImage = type === 'image';

    const openFile = (id) => {
    if (isImage) {
        window.dispatchEvent(new CustomEvent('show-purchase-attachment', {
            detail: { image: id, field: 'Picture' }
        }));
    } else {
        // Fix: use proper Google Drive URL format
        const url = `https://drive.google.com/file/d/${id}/view`;
        window.open(url, '_blank');
    }
};

    const handleClick = async () => {
        if (fileId) {
            openFile(fileId);
            return;
        }
        setLoading(true);
        setError(false);
        try {
            const res = await axiosInstance.get(`/file/resolve`, {
                params: { path: filePath }
            });
            const id = res.data.fileId;
            setFileId(id);
            openFile(id);
        } catch (err) {
            console.error('Failed to load file:', err);
            setError(true);
            toast.error('Failed to load file.');
        } finally {
            setLoading(false);
        }
    };

    if (error) return <span className="text-danger" style={{ fontSize: '11px' }}>Error</span>;

    return (
        <button
            className={`btn btn-xs ${isImage ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={handleClick}
            disabled={loading}
        >
            {loading
                ? <span className="spinner-border spinner-border-sm" role="status" />
                : isImage
                    ? <><i className="fa fa-eye me-1"></i> View</>
                    : <><i className="fa fa-file-pdf-o me-1"></i> View</>
            }
        </button>
    );
};

// ── Main Component ──────────────────────────────────────────────────────────
const Purchase = ({ language, country }) => {
    const navigate  = useNavigate();
    const dispatch  = useDispatch();
    const { changeTitle } = useContext(ThemeContext);

    const access  = localStorage.getItem(`_dash`) || '3ts';
    const user    = JSON.parse(localStorage.getItem(`_authUsr`));
    const isAdmin = ADMIN_EMAILS.includes(user?.email);
   const canVerify = CAN_VERIFY.includes(user?.email?.toLowerCase());

const displayColumns = useMemo(
    () => DISPLAY_COLUMNS.filter(col => col !== 'Chain Verify' || canVerify),
    [canVerify]
);

    const [companies,   setCompanies]   = useState([]);
    const [company,     setCompany]     = useState(null);
    const [attachment,  setAttachment]  = useState(null);
    const [approvingId, setApprovingId] = useState(null);
    const [purchases,   setPurchases]   = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [verificationLoadingLot, setVerificationLoadingLot] = useState(null);
    const [verificationModal, setVerificationModal] = useState({
        show: false,
        status: 'idle',
        lotNumber: null,
        data: null,
        error: null
    });
    const itemsPerPage = 20;

    // ── Listen for lazy image events ────────────────────────────────────
    useEffect(() => {
        const handler = (e) => setAttachment(e.detail);
        window.addEventListener('show-purchase-attachment', handler);
        return () => window.removeEventListener('show-purchase-attachment', handler);
    }, []);

    // ── CSV Export ──────────────────────────────────────────────────────
    const exportToCSV = (rows, headers, filename) => {
        if (!rows || rows.length === 0) return toast.warn('No data to export.');
        const escape = (v) => {
            const s = v === null || v === undefined ? '' : String(v);
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const csvContent = [
            headers.map(escape).join(','),
            ...rows.map(row => headers.map(h => escape(row[h])).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // ── Format Date ─────────────────────────────────────────────────────
    const formatDate = (value) => {
        if (!value) return '—';
        const d = new Date(value);
        return isNaN(d) ? value : d.toLocaleDateString();
    };

    const shortenHash = (hash) => {
        if (!hash) return 'Not available';
        if (hash.length <= 24) return hash;
        return `${hash.slice(0, 12)}...${hash.slice(-10)}`;
    };

    const closeVerificationModal = () => {
        setVerificationModal(prev => ({
            ...prev,
            show: false
        }));
    };

    // ── Normalize Country ───────────────────────────────────────────────
    const normalizeCountry = (countryName) => {
        let normalized = countryName.trim();
        if (normalized.toLowerCase() === 'rwanda') {
            normalized = '.Rwanda';
        } else {
            normalized = normalized.replace(/^\.+|\.+$/g, '');
        }
        return normalized;
    };

    // ── Load Companies ──────────────────────────────────────────────────
    const loadCompanies = () => {
        const normalizedCountry_ = normalizeCountry(country);
        axiosInstance.get(`/companies/all`, {
            params: { country: normalizedCountry_ }
        }).then(response => {
            setCompanies(response.data.companies);
        }).catch(err => {
            try {
                if (err.response?.code === 403) {
                    dispatch(Logout(navigate));
                } else {
                    toast.warn(err.response?.message || 'Error loading companies');
                }
            } catch (e) {
                toast.error(err.message);
            }
        });
    };

    // ── Load Purchases ──────────────────────────────────────────────────
    const loadPurchases = () => {
        if (!company) {
            setPurchases([]);
            return;
        }
        const normalizedCountry_ = normalizeCountry(country);
        axiosInstance.get(`/purchases/${company.id}`, {
            params: { country: normalizedCountry_ }
        }).then(response => {
            if (response.data.purchases) {
                setPurchases(response.data.purchases);
                toast.success("Purchase report generated successfully!");
            }
        }).catch(err => {
            try {
                if (err.response?.code === 403) {
                    dispatch(Logout(navigate));
                } else {
                    toast.warn(err.response?.message || 'Error loading purchases');
                }
            } catch (e) {
                toast.error(err.message);
            }
        });
    };

    // ── Approve ─────────────────────────────────────────────────────────
    const handleApprove = async (transactionId) => {
        if (!transactionId) return toast.error('Missing Transaction ID');
        setApprovingId(transactionId);
        try {
            await axiosInstance.post(`/purchase/approve/${encodeURIComponent(transactionId)}`);
            toast.success('Purchase approved successfully!');
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve purchase');
            setApprovingId(null);
        }
    };

    // ── Disapprove ──────────────────────────────────────────────────────
    const handleDisapprove = async (transactionId) => {
        if (!transactionId) return toast.error('Missing Transaction ID');
        setApprovingId(transactionId);
        try {
            await axiosInstance.post(`/purchase/disapprove/${encodeURIComponent(transactionId)}`);
            toast.success('Purchase disapproved successfully!');
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to disapprove purchase');
            setApprovingId(null);
        }
    };

    // ── Blockchain Verify ───────────────────────────────────────────────
    const handleChainVerify = async (lotNumber) => {
        if (!lotNumber) {
            toast.warning('Lot Number is missing, so blockchain verification cannot run.');
            return;
        }

        setVerificationLoadingLot(lotNumber);
        setVerificationModal({
            show: true,
            status: 'loading',
            lotNumber,
            data: null,
            error: null
        });

        try {
            const response = await axiosInstance.get(`/purchase-tracker/lot/${encodeURIComponent(lotNumber)}/verify`);
            const verified = response.data?.verified;

            setVerificationModal({
                show: true,
                status: verified ? 'verified' : 'failed',
                lotNumber,
                data: response.data,
                error: null
            });
        } catch (err) {
            console.error('Error verifying purchase tracker blockchain record:', err);
            setVerificationModal({
                show: true,
                status: 'error',
                lotNumber,
                data: null,
                error: err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to verify blockchain record'
            });
        } finally {
            setVerificationLoadingLot(null);
        }
    };

    // ── Translation ─────────────────────────────────────────────────────
    const t = (key) => {
        if (!translations[language]) return key;
        return translations[language][key] || key;
    };

    // ── Pagination ──────────────────────────────────────────────────────
    const totalPages = Math.ceil(purchases.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPurchases = purchases.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    // ── Change Company ──────────────────────────────────────────────────
    const changeCompany = (e) => {
        const input = e.currentTarget.value;
        if (input === 'Select Company') {
            setCompany(null);
            setPurchases([]);
            return toast.warn("Please select a company.");
        }
        const selected = JSON.parse(input);
        setCompany(selected);
        toast.info('Generating purchase report, please wait...', { delay: 100, autoClose: true });
    };

    // ── Status Badge ────────────────────────────────────────────────────
    const renderStatusBadge = (status) => {
        const statusLower = status ? String(status).toLowerCase().trim() : '';
        const map = {
            'approved':     { cls: 'badge bg-success',           label: 'Approved' },
            'disapproved':  { cls: 'badge bg-danger',            label: 'Disapproved' },
            'no available': { cls: 'badge bg-secondary',         label: 'Not Available' },
            'no avalible':  { cls: 'badge bg-secondary',         label: 'Not Available' },
            'pending':      { cls: 'badge bg-warning text-dark', label: 'Pending' },
        };
        const def = map[statusLower] || { cls: 'badge bg-secondary', label: status || '—' };
        return <span className={def.cls}>{def.label}</span>;
    };

    // ── Render Cell ─────────────────────────────────────────────────────
    const renderCell = (row, headerField) => {
        const fieldValue = row[headerField];

        if (headerField === 'Chain Verify') {
    const lotNumber = row['Lot Number'];
    const isLoading = verificationLoadingLot === lotNumber;

    if (!canVerify) {
        return <span className="text-muted">—</span>;
    }

    return (
        <button
            type="button"
            className="btn btn-xs btn-secondary"
            style={{ fontSize: '11px', padding: '4px 10px', minWidth: 98 }}
            disabled={!lotNumber || isLoading}
            onClick={() => handleChainVerify(lotNumber)}
        >
            {isLoading ? (
                <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Checking
                </>
            ) : (
                <>
                    <i className="fa fa-shield me-1"></i>
                    Verify
                </>
            )}
        </button>
    );
}

        // Image columns — lazy load
        if (imageColumns.has(headerField)) {
            return fieldValue
                ? <LazyFileButton filePath={fieldValue} type="image" />
                : <span className="text-muted">—</span>;
        }

        // File / PDF columns — lazy load
        if (fileColumns.has(headerField)) {
            return fieldValue
                ? <LazyFileButton filePath={fieldValue} type="file" />
                : <span className="text-muted">—</span>;
        }

        // Date columns
        if (dateColumns.has(headerField)) {
            return formatDate(fieldValue);
        }

        // Status column
        if (headerField === 'Status') {
            const transactionId = row['Transaction Unique ID'];
            const isActioning   = approvingId === transactionId;
            const statusLower   = fieldValue ? String(fieldValue).toLowerCase().trim() : '';
            const isPending     =
                PENDING_STATUSES.has(statusLower) ||
                fieldValue === null ||
                fieldValue === undefined ||
                fieldValue === '';

            return (
                <div className="d-flex align-items-center flex-wrap" style={{ gap: '6px' }}>
                    {!isPending && renderStatusBadge(fieldValue)}
                    {isAdmin && isPending && (
                        <>
                            <button
                                className="btn btn-xs btn-success"
                                style={{ fontSize: '11px', padding: '4px 10px' }}
                                disabled={isActioning}
                                onClick={() => handleApprove(transactionId)}
                            >
                                {isActioning
                                    ? <span className="spinner-border spinner-border-sm" role="status" />
                                    : <><i className="fa fa-check me-1"></i>Approve</>}
                            </button>
                            <button
                                className="btn btn-xs btn-danger"
                                style={{ fontSize: '11px', padding: '4px 10px' }}
                                disabled={isActioning}
                                onClick={() => handleDisapprove(transactionId)}
                            >
                                {isActioning
                                    ? <span className="spinner-border spinner-border-sm" role="status" />
                                    : <><i className="fa fa-times me-1"></i>Disapprove</>}
                            </button>
                        </>
                    )}
                    {isPending && !isAdmin && (
                        <span className="badge bg-warning text-dark">Pending Review</span>
                    )}
                </div>
            );
        }

        return fieldValue ?? '—';
    };

    // ── Effects ─────────────────────────────────────────────────────────
    useEffect(() => {
        changeTitle(`${t('Purchase')} | Minexx`);
        loadCompanies();
    }, [language, country]);

    useEffect(() => {
        if (company) {
            setCurrentPage(1);
            loadPurchases();
        }
    }, [company]);

    // ── Render ──────────────────────────────────────────────────────────
    return (
        <>
            {/* Image Attachment Modal */}
            {attachment && (
                <Modal size="lg" show={!!attachment} onHide={() => setAttachment(null)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{attachment.field}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                       <img
                            alt={attachment.field}
                            className="rounded mt-2"
                            style={{ maxWidth: '100%' }}
                            src={`https://lh3.googleusercontent.com/d/${attachment.image}`}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://drive.google.com/uc?export=download&id=${attachment.image}`;
                            }}
                        />
                    </Modal.Body>

                    
                </Modal>
            )}

            <Modal centered size="lg" show={verificationModal.show} onHide={closeVerificationModal}>
                <Modal.Header
                    closeButton
                    style={{
                        borderBottom: 0,
                        paddingBottom: 0
                    }}
                >
                    <div>
                        <h4 className="modal-title mb-1">Blockchain Verification</h4>
                        <div className="text-muted" style={{ fontSize: 13 }}>
                            Lot Number: <span className="font-weight-bold">{verificationModal.lotNumber || 'Not available'}</span>
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    {verificationModal.status === 'loading' ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{ width: 54, height: 54 }} />
                            <h4 className="mt-4 mb-2">Checking blockchain anchor</h4>
                            <p className="text-muted mb-0">Comparing the MySQL purchase record with the on-chain hash.</p>
                        </div>
                    ) : (
                        <div>
                            <div
                                style={{
                                    borderRadius: 8,
                                    padding: 22,
                                    background: verificationModal.status === 'verified' ? '#eaf8f0' : '#fff1f1',
                                    border: verificationModal.status === 'verified' ? '1px solid #b7e6c8' : '1px solid #ffc9c9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    marginBottom: 18
                                }}
                            >
                                <div
                                    style={{
                                        width: 58,
                                        height: 58,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: verificationModal.status === 'verified' ? '#22c55e' : '#ef4444',
                                        color: '#fff',
                                        flex: '0 0 auto',
                                        fontSize: 28
                                    }}
                                >
                                    <i className={verificationModal.status === 'verified' ? 'fa fa-check' : 'fa fa-times'} />
                                </div>
                                <div>
                                    <h3 className="mb-1" style={{ color: verificationModal.status === 'verified' ? '#15803d' : '#b91c1c' }}>
                                        {verificationModal.status === 'verified' ? 'Verified on blockchain' : 'Verification failed'}
                                    </h3>
                                    <div style={{ color: '#475569', lineHeight: 1.5 }}>
                                        {verificationModal.data?.reason || verificationModal.error || 'The blockchain verification request did not complete successfully.'}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="p-3" style={{ border: '1px solid #e5e7eb', borderRadius: 8, height: '100%' }}>
                                        <div className="text-muted mb-1" style={{ fontSize: 12, textTransform: 'uppercase' }}>MySQL hash</div>
                                        <div className="font-weight-bold" style={{ wordBreak: 'break-word' }}>
                                            {shortenHash(verificationModal.data?.mysqlRecordHash)}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="p-3" style={{ border: '1px solid #e5e7eb', borderRadius: 8, height: '100%' }}>
                                        <div className="text-muted mb-1" style={{ fontSize: 12, textTransform: 'uppercase' }}>On-chain hash</div>
                                        <div className="font-weight-bold" style={{ wordBreak: 'break-word' }}>
                                            {shortenHash(verificationModal.data?.onChainRecordHash)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap" style={{ gap: 10 }}>
                                <span className="badge light badge-primary">
                                    Stage: {verificationModal.data?.onChainAsset?.stage || 'Purchase Tracker'}
                                </span>
                                <span className="badge light badge-info">
                                    Anchored by: {verificationModal.data?.onChainAsset?.anchoredBy || 'Not available'}
                                </span>
                                <span className="badge light badge-secondary">
                                    Anchored at: {verificationModal.data?.onChainAsset?.anchoredAt || 'Not available'}
                                </span>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ borderTop: 0 }}>
                    <button type="button" className="btn btn-primary" onClick={closeVerificationModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Breadcrumb */}
            <div className="page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><Link to="#">{t("Dashboard")}</Link></li>
                    <li className="breadcrumb-item"><Link to="#">{t("Purchase")}</Link></li>
                    <li className="breadcrumb-item">
                        <Link to="#">
                            {company ? `${t('Purchase')} [${company.name}]` : t('TraceReport')}
                        </Link>
                    </li>
                </ol>
            </div>

            {/* Main Content */}
            <div className="row">
                <div className="col-12">

                    {/* Company Selector */}
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <select onChange={changeCompany} className="form-control">
                                <option>{t('SelectCompany')}</option>
                                {companies.map(comp => (
                                    <option key={comp.id} value={JSON.stringify(comp)}>
                                        {comp.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {company ? (
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h4 className="card-title mb-0">{t("Purchase")}</h4>
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => exportToCSV(purchases, DISPLAY_COLUMNS, 'purchases')}
                                >
                                    <i className="fa fa-download me-1"></i> Export CSV
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="w-100 table-responsive">
                                    <Table bordered striped hover responsive size="sm">
                                        <thead>
                                            <tr>
                                                {DISPLAY_COLUMNS.map(header => (
                                                    <th
                                                        key={header}
                                                        style={{ whiteSpace: 'nowrap', minWidth: 100 }}
                                                    >
                                                        {t(header)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedPurchases.length === 0 ? (
                                                <tr>
                                                    <td colSpan={DISPLAY_COLUMNS.length} className="text-center text-muted">
                                                        {t("NoPurchaseRecords")}
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedPurchases.map((row, rowIndex) => (
                                                    <tr key={`purchase-${startIndex + rowIndex}`}>
                                                        {DISPLAY_COLUMNS.map((col, colIndex) => (
                                                            <td key={`${rowIndex}-${colIndex}`}>
                                                                {renderCell(row, col)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                                
                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <nav aria-label="Page navigation" className="mt-3">
                                        <ul className="pagination justify-content-center">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </button>
                                            </li>
                                            
                                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                
                                                return (
                                                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                        <button 
                                                            className="page-link" 
                                                            onClick={() => handlePageChange(pageNum)}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                            
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
                                
                                <div className="text-center text-muted mt-2">
                                    <small>
                                        Showing {startIndex + 1} - {Math.min(endIndex, purchases.length)} of {purchases.length} records
                                    </small>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-body">
                                <p className="text-muted">{t('SelectCompany')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Purchase;