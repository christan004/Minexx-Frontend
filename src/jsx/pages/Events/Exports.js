import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { baseURL_ } from "../../../config";
import axiosInstance from '../../../services/AxiosInstance';
import { toast } from "react-toastify";
import { ThemeContext } from "../../../context/ThemeContext";
import { Logout } from '../../../store/actions/AuthActions';
import { useDispatch } from "react-redux";
import { Modal, Spinner, ProgressBar } from "react-bootstrap";
import { Loader, Segment } from 'semantic-ui-react';
import QRCodeWithPrintButton from './QRCodeWithPrintButton';
import { translations } from './Exporttranslation';

// Sticky-column styling for the "Chain Verify" column so it stays visible
// (pinned) while every other column keeps scrolling normally.
const stickyVerifyHeaderStyle = {
    position: 'sticky',
    right: 0,
    zIndex: 3,
    backgroundColor: '#0d71d4',
    boxShadow: '-2px 0 4px rgba(0,0,0,0.08)',
};

const stickyVerifyCellStyle = {
    position: 'sticky',
    right: 0,
    zIndex: 2,
    backgroundColor: '#fff',
    boxShadow: '-2px 0 4px rgba(0,0,0,0.08)',
};

const Exports = ({ language, country }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { changeTitle } = useContext(ThemeContext);
    const [exports, setExports] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [tablehead, setTablehead] = useState([]);
    const [attachment, setAttachment] = useState();
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState({});
    const [containerStatus, setContainerStatus] = useState({});
    const [statusUpdating, setStatusUpdating] = useState({});
    const [verificationLoadingId, setVerificationLoadingId] = useState(null);
    const CAN_VERIFY=['beda@minexx.email', 'b.akaffou@minexx.co'];
    
    const [verificationModal, setVerificationModal] = useState({
        show: false,
        status: 'idle',
        exportId: null,
        data: null,
        error: null
    });
    const access = localStorage.getItem(`_dash`) || '3ts';
    const user = JSON.parse(localStorage.getItem(`_authUsr`));
    const canVerify = CAN_VERIFY.includes(user?.email);
    const PAGE_SIZE = 20;
    const [currentPage, setCurrentPage] = useState(1);

    // Memoized translations function to avoid recreating on every render
    const t = useCallback((key) => {
        if (!translations[language]) {
            return key;
        }
        return translations[language][key] || key;
    }, [language]);

    // Normalize country name once when it changes
    const normalizedCountry = useMemo(() => {
        let result = country.trim();

        if (result.toLowerCase() === 'rwanda') {
            return '.Rwanda';
        } else {
            return result.replace(/^\.+|\.+$/g, '');
        }
    }, [country]);

    // Fetch exports and progress data
    const fetchExports = useCallback(async () => {
        try {
            setLoading(true);

            let response = await axiosInstance.get(`exports`, {
                params: {
                    country: normalizedCountry,
                }
            });

            // Sort the export data by date with latest first
            const exportData = response.data.exports.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });

            setExports(exportData);

            // Create a batch of progress requests
            const progressPromises = exportData
                .filter(item => item.exportationID) // Only process items with ID
                .map(item => ({
                    id: item.exportationID,
                    promise: axiosInstance.get(`progressbar`, {
                        params: { id: item.exportationID }
                    }).catch(err => {
                        console.error(`Failed to fetch progress for ${item.exportationID}:`, err);
                        return { data: { progressbarExport: [{ percentage: 0 }] } };
                    })
                }));

            // Execute all promises in parallel
            const results = await Promise.all(progressPromises.map(item => item.promise));

            // Process results into a map
            const progressDataObj = {};
            progressPromises.forEach((item, index) => {
                const response = results[index];
                if (response.data.progressbarExport &&
                    response.data.progressbarExport.length > 0) {
                    progressDataObj[item.id] = response.data.progressbarExport[0];
                } else {
                    progressDataObj[item.id] = { percentage: 0 };
                }
            });

            setProgressData(progressDataObj);

            // Initialize container status from export data
            const containerStatusObj = {};
            exportData.forEach(exp => {
                if (exp.container_status) {
                    containerStatusObj[exp.id] = exp.container_status;
                }
            });
            setContainerStatus(containerStatusObj);

            setLoading(false);
        } catch (err) {
            setLoading(false);
            if (err.response?.code === 403) {
                dispatch(Logout(navigate));
            } else {
                console.log(err.message || "Failed to fetch exports");
            }
        }
    }, [normalizedCountry, dispatch, navigate]);

    const handleApprove = useCallback(async (exportId) => {
        try {
            // Show loading state (optional - you could add a loading state per button)
            let response = await axiosInstance.post(`approve/export/${exportId}`);

            toast.success("Export approved successfully");

            // Update the local state to reflect the approval
            setExports(prevExports =>
                prevExports.map(exp =>
                    exp.id === exportId
                        ? { ...exp, status: "Approved" }
                        : exp
                )
            );

        } catch (err) {
            if (err.response?.status === 403) { // Fixed: should be 'status' not 'code'
                dispatch(Logout(navigate));
            } else {
                console.log(err.response?.data?.message || err.message || "Failed to approve export");
            }
        }
    }, [dispatch, navigate]);

    // Filtered exports using useMemo to avoid recalculating on every render
    const filtered = useMemo(() => {
        if (!searchInput) return exports;

        const input = searchInput.toLowerCase();
        let filteredData = [];

        if (access === '3ts') {
            filteredData = exports.filter(exp =>
                (exp.exportationID?.toLowerCase() || '').includes(input) ||
                (exp.company?.name?.toLowerCase() || '').includes(input)
            );
        } else {
            filteredData = exports.filter(exp =>
                (exp[tablehead.indexOf('Transaction Unique ID')]?.toLowerCase() || '').includes(input) ||
                (exp[tablehead.indexOf('Name of processor/refiner/exporter')]?.toLowerCase() || '').includes(input) ||
                (exp[tablehead.indexOf('Gold Export License Number')]?.toLowerCase() || '').includes(input) ||
                (exp[tablehead.indexOf('Type of minerals exported')]?.toLowerCase() || '').includes(input)
            );
        }

        return filteredData;
    }, [exports, searchInput, tablehead, access]);

    // Handle search input change – reset to first page when query changes
    const handleSearchChange = (e) => {
        setSearchInput(e.currentTarget.value);
        setCurrentPage(1);
    };

    // Slice the filtered list for the current page
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, currentPage]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

    // Show attachment with error handling
    const showAttachment = useCallback((file, field) => {
        axiosInstance.post(`${baseURL_}image`, { file })
            .then(response => {
                setAttachment({ image: response.data.image, field });
            })
            .catch(err => {
                if (err.response?.code === 403) {
                    dispatch(Logout(navigate));
                } else {
                    console.log(err.message || "Failed to load attachment");
                }
            });
    }, [dispatch, navigate]);

    // Determine progress bar variant based on percentage
    const getProgressVariant = useCallback((percentage) => {
        if (percentage < 25) return "danger";
        if (percentage < 50) return "warning";
        if (percentage < 75) return "info";
        return "success";
    }, []);


    const shortenHash = useCallback((hash) => {
        if (!hash) return 'Not available';
        if (hash.length <= 24) return hash;
        return `${hash.slice(0, 12)}...${hash.slice(-10)}`;
    }, []);

    const closeVerificationModal = useCallback(() => {
        setVerificationModal(prev => ({
            ...prev,
            show: false
        }));
    }, []);

    const handleChainVerify = useCallback(async (exportId) => {
        if (!exportId) {
            toast.warning("Exportation ID is missing, so blockchain verification cannot run.");
            return;
        }

        setVerificationLoadingId(exportId);
        setVerificationModal({
            show: true,
            status: 'loading',
            exportId,
            data: null,
            error: null
        });

        try {
            const response = await axiosInstance.get(`export-blockchain/${encodeURIComponent(exportId)}/verify`);
            const verified = response.data?.verified;

            setVerificationModal({
                show: true,
                status: verified ? 'verified' : 'failed',
                exportId,
                data: response.data,
                error: null
            });
        } catch (error) {
            console.error("Error verifying chain:", error);
            setVerificationModal({
                show: true,
                status: 'error',
                exportId,
                data: null,
                error: error.response?.data?.error || error.response?.data?.message || error.message || "Failed to verify chain"
            });
        } finally {
            setVerificationLoadingId(null);
        }
    }, []);

    // Handle container status change (with per-item updating flag + safer revert + deselect support)
    const handleStatusChange = useCallback(async (exportId, exportationID, status) => {
        const prevStatus = containerStatus[exportId];

        // If clicking the same status again, deselect it (set to 'in transit')
        const newStatus = prevStatus === status ? 'in transit' : status;

        try {
            // mark this item as updating
            setStatusUpdating(prev => ({ ...prev, [exportId]: true }));

            // Optimistically update UI
            setContainerStatus(prev => ({
                ...prev,
                [exportId]: newStatus
            }));

            // Save to backend
            await axiosInstance.post(`livescreen/container-status`, null, {
                params: {
                    country: normalizedCountry,
                    exportId: exportationID,
                    status: newStatus
                }
            });

            toast.success(`Container status updated to ${newStatus === 'in transit' ? 'In Transit' : newStatus}`);
        } catch (err) {
            // Revert on error to previous value (could be undefined)
            setContainerStatus(prev => ({
                ...prev,
                [exportId]: prevStatus
            }));

            if (err.response?.status === 403) {
                dispatch(Logout(navigate));
            } else {
                toast.error(err.response?.data?.message || "Failed to update container status");
            }
        } finally {
            // clear updating flag
            setStatusUpdating(prev => {
                const copy = { ...prev };
                delete copy[exportId];
                return copy;
            });
        }
    }, [normalizedCountry, dispatch, navigate, containerStatus]);

    // Only fetch data when country changes, not language
    useEffect(() => {
        fetchExports();

    }, [fetchExports]);

    // Update page title when language changes
    useEffect(() => {
        changeTitle(`${t('Exports')} | Minexx`);
    }, [changeTitle, t, country, user]);

    return (
        <Segment>
            <Loader active={loading} />
            {attachment ?
                <Modal size='lg' show={!!attachment} onHide={() => setAttachment(null)}>
                    <Modal.Header>
                        <h3 className='modal-title'>{attachment.field}</h3>
                        <Link className='modal-dismiss' onClick={() => setAttachment(null)}>x</Link>
                    </Modal.Header>
                    <Modal.Body>
                        <img
                            alt=''
                            className='rounded mt-4'
                            width={'100%'}
                            src={`https://lh3.googleusercontent.com/d/${attachment.image}=w2160?authuser=0`}
                            loading="lazy" // Add lazy loading for images
                        />
                    </Modal.Body>
                </Modal>
                : null
            }

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
                            Exportation ID: <span className="font-weight-bold">{verificationModal.exportId || 'Not available'}</span>
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    {verificationModal.status === 'loading' ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{ width: 54, height: 54 }} />
                            <h4 className="mt-4 mb-2">Checking blockchain anchor</h4>
                            <p className="text-muted mb-0">Comparing the MySQL export record with the on-chain hash.</p>
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
                                    Stage: {verificationModal.data?.onChainAsset?.stage || 'Export'}
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

            <div className="page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><Link to={"/overview"}>{t('Dashboard')}</Link></li>
                    <li className="breadcrumb-item"><Link to={""} >{t('Exports')}</Link></li>
                </ol>
            </div>

            <div className="row">
                <div className="col-xl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">{t('Exports')}</h4>
                            <div>
                                <input
                                    className="form-control"
                                    placeholder={t('search')}
                                    onChange={handleSearchChange}
                                    value={searchInput}
                                />
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="w-100 table-responsive">
                                <div id="patientTable_basic_table" className="dataTables_wrapper">
                                    <table
                                        id="example5"
                                        className="display dataTable w-100 no-footer"
                                        role="grid"
                                        aria-describedby="example5_info"
                                    >
                                        <thead>
                                            <tr role="row">
                                                <th className="sorting_asc" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1} aria-sort="ascending">
                                                    <div className="custom-control custom-checkbox">
                                                        <input type="checkbox" className="custom-control-input" id="checkAll" required />
                                                        <label className="custom-control-label" htmlFor="checkAll" />
                                                    </div>
                                                </th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{country === 'Gabon' ? t('BuyerID') : t('CompanyName')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{country === 'Gabon' ? t('SaleID') : t('ExportationID')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('Date')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('MineralType')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('Grade')}</th>
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('NetWeight')}</th>
                                                {country !== 'Gabon' &&
                                                    <>
                                                        <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('Track')}</th>
                                                        <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('TradeTimeline')}</th>
                                                    </>
                                                }
                                                {(user?.type === 'investor' && user?.email === 'info@minexx.co' || user?.type === 'minexx' && user?.email === 'beda@minexx.email' || user?.email === 'info_@minexx.co') && country !== 'Gabon' && (
                                                    <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('Container Status')}</th>
                                                )}
                                                <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('QrCode')}</th>
                                               {canVerify && (
                                                    <th
                                                        className="sorting"
                                                        tabIndex={0}
                                                        aria-controls="example5"
                                                        rowSpan={1}
                                                        colSpan={1}
                                                        style={stickyVerifyHeaderStyle}
                                                    >
                                                        {t('Chain Verify')}
                                                    </th>
                                                )}
                                                {/* {user.type ==='investor' && user.email ==='info@minexx.co' && (
                                                    <th className="sorting" tabIndex={0} aria-controls="example5" rowSpan={1} colSpan={1}>{t('Actions')}</th>
                                                )} */}
                                            </tr>
                                        </thead>
                                        {loading ?
                                            <tbody>
                                                <tr><td colSpan={9}><center><Spinner size="md" style={{ margin: 15 }} role="status" variant="primary"><span className="visually-hidden">Loading...</span></Spinner></center></td></tr>
                                            </tbody>
                                            : <tbody>
                                                {filtered.length === 0 ?
                                                    <tr role="row" className="odd">
                                                        <td colSpan={9} className="sorting_1 text-center">{t('NoExportRecords')}</td>
                                                    </tr>
                                                    : paginated.map(_export => (
                                                        <tr role="row" key={_export.id} className="odd">
                                                            <td className="sorting_1">
                                                                <div className="custom-control custom-checkbox ">
                                                                    <input type="checkbox" className="custom-control-input" id={`customCheckBox_${_export.id}`} required />
                                                                    <label className="custom-control-label" htmlFor={`customCheckBox_${_export.id}`} />
                                                                </div>
                                                            </td>
                                                            <td><Link to={`/company/${_export?.company?.id}`}>{_export?.company?.name}</Link></td>
                                                            <td><Link className={_export.exportationID ? "text-primary" : "text-danger"} to={`/exports/${_export?.id}`}>{_export.exportationID ? _export.exportationID : "Exportation ID Missing"}</Link></td>
                                                            <td>{new Date(_export.date).toString().substring(0, 16)}</td>
                                                            <td>
                                                                <span className="badge light badge-warning">
                                                                    <i className="fa fa-circle text-danger me-1" />
                                                                    {_export.mineral}
                                                                </span>
                                                            </td>
                                                            <td>{_export.grade}</td>
                                                            <td>{access === '3ts' ? _export.netWeight : (_export.netWeight / 1000).toFixed(2)}</td>
                                                            {country !== 'Gabon' && (
                                                                <td>{_export.link ? <a target="_blank" href={`${_export.link}`} className="text-primary" rel="noreferrer">Track Shipment</a> : <span className="text-warning">Tracking not available</span>}</td>
                                                            )}
                                                            {country !== 'Gabon' && (<td>
                                                                {_export.exportationID && progressData[_export.exportationID] ?
                                                                    <a href={`/time-tracking/?id=${_export?.exportationID}`} rel="noreferrer" style={{ display: 'block', textDecoration: 'none', width: '100%' }}>
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="me-2 font-weight-bold" style={{ minWidth: '40px' }}>
                                                                                {progressData[_export.exportationID].percentage || 0}%
                                                                            </span>
                                                                            <ProgressBar
                                                                                now={progressData[_export.exportationID].percentage || 0}
                                                                                variant={getProgressVariant(progressData[_export.exportationID].percentage || 0)}
                                                                                style={{ height: '20px', width: '100%', minWidth: '60px' }}
                                                                            />
                                                                        </div>
                                                                    </a> :
                                                                    <span className="text-warning">Progress not available</span>
                                                                }
                                                            </td>
                                                            )}
                                                            {(user?.type === 'investor' && user?.email === 'info@minexx.co' || user?.type === 'minexx' && user?.email === 'beda@minexx.email' || user.email === 'info_@minexx.co') && country !== 'Gabon' && (
                                                                <td>
                                                                    {containerStatus[_export.id] === 'delivered' || containerStatus[_export.id] === 'delay' ? (
                                                                        // Show badge AND allow switching between statuses
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                            <div style={{
                                                                                padding: '8px 14px',
                                                                                borderRadius: '6px',
                                                                                backgroundColor: containerStatus[_export.id] === 'delivered' ? '#d4edda' : '#fff3cd',
                                                                                border: containerStatus[_export.id] === 'delivered' ? '2px solid #28a745' : '2px solid #ffc107',
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: '6px',
                                                                                fontWeight: '600',
                                                                                color: containerStatus[_export.id] === 'delivered' ? '#28a745' : '#ff9800',
                                                                            }}>
                                                                                <i className={containerStatus[_export.id] === 'delivered' ? 'fa fa-check-circle' : 'fa fa-clock-o'}></i>
                                                                                <span>{containerStatus[_export.id] === 'delivered' ? 'Delivered' : 'Delay'}</span>
                                                                            </div>

                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                                <select
                                                                                    aria-label="Change container status"
                                                                                    className="form-select"
                                                                                    style={{ height: 36, padding: '4px 8px', fontSize: 13 }}
                                                                                    value={containerStatus[_export.id]}
                                                                                    onChange={(e) => handleStatusChange(_export.id, _export.exportationID, e.target.value)}
                                                                                    disabled={!!statusUpdating[_export.id]}
                                                                                >
                                                                                    <option value="in transit">In Transit</option>
                                                                                    <option value="delivered">Delivered</option>
                                                                                    <option value="delay">Delay</option>
                                                                                </select>

                                                                                {statusUpdating[_export.id] ? <Spinner animation="border" size="sm" /> : null}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        // Show radio buttons when status is not set or is 'in transit'
                                                                        <div className="d-flex align-items-center gap-2" style={{ flexWrap: 'wrap' }}>
                                                                            <label
                                                                                style={{
                                                                                    padding: '8px 14px',
                                                                                    borderRadius: '6px',
                                                                                    cursor: 'pointer',
                                                                                    border: containerStatus[_export.id] === 'delivered' ? '2px solid #28a745' : '2px solid #e3e6f0',
                                                                                    backgroundColor: containerStatus[_export.id] === 'delivered' ? '#d4edda' : '#f8f9fa',
                                                                                    transition: 'all 0.3s ease',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '6px',
                                                                                    fontWeight: containerStatus[_export.id] === 'delivered' ? '600' : '500',
                                                                                    color: containerStatus[_export.id] === 'delivered' ? '#28a745' : '#495057',
                                                                                }}
                                                                                htmlFor={`delivered_${_export.id}`}
                                                                            >
                                                                                <input
                                                                                    type="radio"
                                                                                    id={`delivered_${_export.id}`}
                                                                                    name={`status_${_export.id}`}
                                                                                    value="delivered"
                                                                                    checked={containerStatus[_export.id] === 'delivered'}
                                                                                    onChange={() => handleStatusChange(_export.id, _export.exportationID, 'delivered')}
                                                                                    style={{ cursor: 'pointer' }}
                                                                                    disabled={!!statusUpdating[_export.id]}
                                                                                />
                                                                                <i className="fa fa-check-circle"></i>
                                                                                <span>Delivered</span>
                                                                            </label>
                                                                            <label
                                                                                style={{
                                                                                    padding: '8px 14px',
                                                                                    borderRadius: '6px',
                                                                                    cursor: 'pointer',
                                                                                    border: containerStatus[_export.id] === 'delay' ? '2px solid #ffc107' : '2px solid #e3e6f0',
                                                                                    backgroundColor: containerStatus[_export.id] === 'delay' ? '#fff3cd' : '#f8f9fa',
                                                                                    transition: 'all 0.3s ease',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '6px',
                                                                                    fontWeight: containerStatus[_export.id] === 'delay' ? '600' : '500',
                                                                                    color: containerStatus[_export.id] === 'delay' ? '#ff9800' : '#495057',
                                                                                }}
                                                                                htmlFor={`delay_${_export.id}`}
                                                                            >
                                                                                <input
                                                                                    type="radio"
                                                                                    id={`delay_${_export.id}`}
                                                                                    name={`status_${_export.id}`}
                                                                                    value="delay"
                                                                                    checked={containerStatus[_export.id] === 'delay'}
                                                                                    onChange={() => handleStatusChange(_export.id, _export.exportationID, 'delay')}
                                                                                    style={{ cursor: 'pointer' }}
                                                                                    disabled={!!statusUpdating[_export.id]}
                                                                                />
                                                                                <i className="fa fa-clock-o"></i>
                                                                                <span>Delay</span>
                                                                            </label>
                                                                            {statusUpdating[_export.id] && <Spinner animation="border" size="sm" />}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            )}
                                                            <td>
                                                                <QRCodeWithPrintButton value={`https://end-end-overview.vercel.app/export/${_export?.id}/${_export?.company?.id}/?x-platform=${_export.mineral === 'Gold' ? 'gold' : '3ts'}`} />
                                                            </td>

                                                            <td style={stickyVerifyCellStyle}>
                                                                {canVerify && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary"
                                                                    onClick={() => handleChainVerify(_export.exportationID)}
                                                                    disabled={!_export.exportationID || verificationLoadingId === _export.exportationID}
                                                                    style={{ minWidth: 98 }}
                                                                >
                                                                    {verificationLoadingId === _export.exportationID ? (
                                                                        <>
                                                                            <Spinner animation="border" size="sm" className="me-2" />
                                                                            Checking
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fa fa-shield me-2" />
                                                                            Verify
                                                                        </>
                                                                    )}
                                                                </button>
                                                                )}
                                                            </td>

                                                            {/* {user.type === 'investor' && user.email === 'info@minexx.co' && (
                                                            <td>
                                                                {_export.status !== "Approved" ? (
                                                                    <button className="btn btn-primary" onClick={() => handleApprove(_export.id)}>Approve</button>
                                                                ) : (
                                                                    <span className="text-success">Approved</span>
                                                                )}
                                                            </td>
                                                        )} */}
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        }
                                    </table>
                                </div>
                                {/* Pagination controls */}
                                {filtered.length > PAGE_SIZE && (
                                    <div className="d-flex justify-content-between align-items-center mt-3 px-1">
                                        <div className="dataTables_info">
                                            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
                                            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
                                        </div>
                                        <div className="dataTables_paginate paging_simple_numbers">
                                            <button
                                                className={`btn btn-sm btn-primary me-2 ${currentPage <= 1 ? 'disabled' : ''}`}
                                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                                disabled={currentPage <= 1}
                                            >
                                                Previous
                                            </button>
                                            <span className="mx-2">Page {currentPage} / {totalPages}</span>
                                            <button
                                                className={`btn btn-sm btn-primary ${currentPage >= totalPages ? 'disabled' : ''}`}
                                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                                disabled={currentPage >= totalPages}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Segment>
    );
};

export default Exports;