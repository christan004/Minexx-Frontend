import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { baseURL_ } from '../../config';
import { toast } from 'react-toastify';
import axiosInstance from '../../services/AxiosInstance';
import { useDispatch } from 'react-redux';
import { Logout } from '../../store/actions/AuthActions';
import { useNavigate } from 'react-router-dom';
import { translations } from './Reportstranslation';

const imageColumns = new Set(['Image', 'Receipt', 'Seller ID Card']);
const ADMIN_EMAILS = ['beda@minexx.email', 'info@minexx.co'];

// All status values that should show Approve / Disapprove buttons
const PENDING_STATUSES = new Set([
    'no available',
    'no avalible',
    'pending',
]);

const Purchase = ({ language, country }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { changeTitle } = useContext(ThemeContext);

    const access = localStorage.getItem(`_dash`) || '3ts';
    const user = JSON.parse(localStorage.getItem(`_authUsr`));
    const isAdmin = ADMIN_EMAILS.includes(user?.email);

    const [companies, setcompanies] = useState([]);
    const [company, setcompany] = useState(null);
    const [attachment, setattachment] = useState(null);
    const [approvingId, setApprovingId] = useState(null);
    const [trace, settrace] = useState({
        purchases: {
            header: [],
            rows: []
        }
    });

    // ── CSV Export Utility ──────────────────────────────────────────────
    const exportToCSV = (rows, headers, filename) => {
        if (!rows || rows.length === 0) {
            toast.warn('No data to export.');
            return;
        }
        const escape = (v) => {
            const s = v === null || v === undefined ? '' : String(v);
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? `"${s.replace(/"/g, '""')}"`
                : s;
        };
        const csvContent = [
            headers.map(escape).join(','),
            ...rows.map(row => headers.map(h => escape(row[h])).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // ── Show Attachment ─────────────────────────────────────────────────
    const showAttachment = (fileId, field) => {
        if (!fileId) return;
        setattachment({ image: fileId, field });
    };

    // ── Change Company Selection ────────────────────────────────────────
    const changeCompany = (e) => {
        const input = e.currentTarget.value;
        if (input === 'Select Company') {
            setcompany(null);
            return toast.warn("Please select a company to generate purchase report for.");
        }
        const selected = JSON.parse(input);
        setcompany(selected);
        toast.info('Generating purchase report, please wait...', {
            delay: 100,
            autoClose: true
        });
    };

    // ── Normalize Country Name ──────────────────────────────────────────
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
        axiosInstance.get(`/companies`, {
            params: { country: normalizedCountry_ }
        }).then(response => {
            setcompanies(response.data.companies);
        }).catch(err => {
            try {
                if (err.response.code === 403) {
                    dispatch(Logout(navigate));
                } else {
                    toast.warn(err.response?.message || 'Error loading companies');
                }
            } catch (e) {
                toast.error(err.message);
            }
        });
    };

    // ── Load Purchase Report ────────────────────────────────────────────
    const loadPurchaseReport = () => {
        if (!company) {
            settrace({ purchases: { header: [], rows: [] } });
            return;
        }

        const normalizedCountry_ = normalizeCountry(country);
        axiosInstance.get(`/report/trace/${company?.id}`, {
            params: { country: normalizedCountry_ }
        }).then(response => {
            if (response.data.trace) {
                settrace(response.data.trace);
                console.log('User data',user.email, 'Access level', access);
                toast.success("Purchase report generated successfully!");
            }
        }).catch(err => {
            try {
                if (err.response?.code === 403) {
                    dispatch(Logout(navigate));
                } else {
                    toast.warn(err.response?.message || 'Error loading purchase report');
                }
            } catch (e) {
                toast.error(err.message);
            }
        });
    };

    // ── Approve Purchase ────────────────────────────────────────────────
    const handleApprove = async (transactionId) => {
        if (!transactionId) return toast.error('Missing Transaction ID');
        setApprovingId(transactionId);
        try {
            await axiosInstance.post(`/purchase/approve/${encodeURIComponent(transactionId)}`);
            toast.success('Purchase approved successfully!');
            
            // Reload page after short delay to refresh data from server
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve purchase');
            setApprovingId(null);
        }
    };

    // ── Disapprove Purchase ─────────────────────────────────────────────
    const handleDisapprove = async (transactionId) => {
        if (!transactionId) return toast.error('Missing Transaction ID');
        setApprovingId(transactionId);
        try {
            await axiosInstance.post(`/purchase/disapprove/${encodeURIComponent(transactionId)}`);
            toast.success('Purchase disapproved successfully!');
            
            // Reload page after short delay to refresh data from server
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to disapprove purchase');
            setApprovingId(null);
        }
    };

    // ── Translation Helper ──────────────────────────────────────────────
    const t = (key) => {
        if (!translations[language]) {
            console.warn(`Translation for language "${language}" not found`);
            return key;
        }
        return translations[language][key] || key;
    };

    // ── Initialize Component ────────────────────────────────────────────
    useEffect(() => {
        changeTitle(`${t('Purchase')} | Minexx`);
        loadCompanies();
    }, [language, country]);

    // ── Load Report When Company Changes ───────────────────────────────
    useEffect(() => {
        if (company) {
            loadPurchaseReport();
        }
    }, [company]);

    // ── Status Badge ────────────────────────────────────────────────────
    const renderStatusBadge = (status) => {
        const statusLower = status ? String(status).toLowerCase().trim() : '';
        const map = {
            'approved':      { cls: 'badge bg-success',           label: 'Approved' },
            'disapproved':   { cls: 'badge bg-danger',            label: 'Disapproved' },
            'no available':  { cls: 'badge bg-secondary',         label: 'Not Available' },
            'no avalible':   { cls: 'badge bg-secondary',         label: 'Not Available' },
            'pending':       { cls: 'badge bg-warning text-dark', label: 'Pending' },
        };
        const def = map[statusLower] || { cls: 'badge bg-secondary', label: status || '—' };
        return <span className={def.cls}>{def.label}</span>;
    };

    // ── Render Cell ─────────────────────────────────────────────────────
    const renderCell = (row, headerField) => {
        const fieldValue = row[headerField];

        // Image / file columns
        if (imageColumns.has(headerField)) {
            return fieldValue ? (
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => showAttachment(fieldValue, headerField)}
                >
                    <i className="fa fa-eye me-1"></i> View
                </button>
            ) : (
                <span className="text-muted">—</span>
            );
        }

        // Status column
        if (headerField === 'Status') {
            const transactionId = row['Transaction Unique ID'];
            const isActioning = approvingId === transactionId;
            const statusLower = fieldValue ? String(fieldValue).toLowerCase().trim() : '';

            // Show buttons when status is pending (no Available / Not Approved / null / empty)
            const isPending =
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
                                title="Approve this purchase"
                            >
                                {isActioning ? (
                                    <span className="spinner-border spinner-border-sm" role="status" />
                                ) : (
                                    <><i className="fa fa-check me-1"></i>Approve</>
                                )}
                            </button>
                            <button
                                className="btn btn-xs btn-danger"
                                style={{ fontSize: '11px', padding: '4px 10px' }}
                                disabled={isActioning}
                                onClick={() => handleDisapprove(transactionId)}
                                title="Disapprove this purchase"
                            >
                                {isActioning ? (
                                    <span className="spinner-border spinner-border-sm" role="status" />
                                ) : (
                                    <><i className="fa fa-times me-1"></i>Disapprove</>
                                )}
                            </button>
                        </>
                    )}
                    {isPending && !isAdmin && (
                        <span className="badge bg-warning text-dark">Pending Review</span>
                    )}
                </div>
            );
        }

        return fieldValue ?? '';
    };

    // ── Compute display headers ─────────────────────────────────────────
    const displayHeaders = trace.purchases?.header || [];

    return (
        <>
            {/* Image Attachment Modal */}
            {attachment && (
                <Modal size='lg' show={!!attachment} onHide={() => setattachment(null)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{attachment.field}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <img
                            alt={attachment.field}
                            className='rounded mt-4'
                            width={'100%'}
                            src={`https://lh3.googleusercontent.com/d/${attachment.image}=w2160?authuser=0`}
                        />
                    </Modal.Body>
                </Modal>
            )}

            {/* Breadcrumb Header */}
            <div className="page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><Link to={"#"}>{t("Dashboard")}</Link></li>
                    <li className="breadcrumb-item"><Link to={"#"}>{t("Purchase")}</Link></li>
                    <li className="breadcrumb-item">
                        <Link to={"#"}>
                            {company ? `${t('Purchase')} [${company.name}]` : t('TraceReport')}
                        </Link>
                    </li>
                </ol>
            </div>

            {/* Main Content */}
            <div className='row'>
                <div className='col-12'>
                    {/* Company Selection */}
                    <div className='row mb-3'>
                        <div className='col-md-3'>
                            <select onChange={changeCompany} className='form-control'>
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
                        <div className='card'>
                            <div className='card-header d-flex justify-content-between align-items-center'>
                                <h4 className='card-title mb-0'>{t("Purchase")}</h4>
                                <button
                                    className='btn btn-success btn-sm'
                                    onClick={() => exportToCSV(
                                        trace.purchases?.rows || [],
                                        trace.purchases?.header || [],
                                        'trace_purchase'
                                    )}
                                >
                                    <i className='fa fa-download me-1'></i> Export CSV
                                </button>
                            </div>
                            <div className='card-body'>
                                <div className="w-100 table-responsive">
                                    <div id="patientTable_basic_table" className="dataTables_wrapper">
                                        <Table bordered striped hover responsive size='sm'>
                                            <thead>
                                                <tr role="row">
                                                    {displayHeaders.map(header => (
                                                        <th
                                                            className="sorting"
                                                            tabIndex={0}
                                                            rowSpan={1}
                                                            colSpan={1}
                                                            style={{
                                                                whiteSpace: 'nowrap',
                                                                minWidth: header === 'Status' && isAdmin ? 280 : 73
                                                            }}
                                                            key={header}
                                                        >
                                                            {t(header)}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {trace.purchases?.rows?.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={displayHeaders.length || 1}>
                                                            {t("NoPurchaseRecords")}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    trace.purchases?.rows?.map((row, rowIndex) => (
                                                        <tr key={`purchase-${rowIndex}`}>
                                                            {displayHeaders.map((headerField, colIndex) => (
                                                                <td key={`${rowIndex}-${colIndex}`}>
                                                                    {renderCell(row, headerField)}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='card'>
                            <div className='card-body'>
                                <p className='text-muted'>{t('SelectCompany')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Purchase;