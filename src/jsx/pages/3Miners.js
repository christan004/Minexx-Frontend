// src/pages/Miners.js
import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import axiosInstance from '../../services/AxiosInstance';
import { useDispatch } from 'react-redux';
import { Logout } from '../../store/actions/AuthActions';
import { useNavigate } from 'react-router-dom';

// ── Lazy Image Button Component (matches export pattern) ────────────────
const LazyImageButton = ({ minerId, field, fieldLabel, onShowImage }) => {
    const [loading, setLoading] = useState(false);
    const access = localStorage.getItem(`_dash`) || '3ts';

    const handleClick = async () => {
        setLoading(true);
        try {
            // Call the endpoint matching export's /exportsfield/:id pattern
            const res = await axiosInstance.get(`/minerfield/${minerId}`, {
                params: { field },
                headers: { 'x-platform': access }
            });

            console.log('API Response:', res.data); // Debug log

            // Handle the response format - matches export pattern
            const { fileId, fileContent } = res.data.file || {};

            if (!fileId) {
                toast.warn('No image available');
                return;
            }

            // Use fileContent (the Google Drive ID) or fallback to fileId
            const driveId = fileContent || fileId;

            console.log('Drive ID:', driveId); // Debug log

            // Build URLs using the Google Drive ID (matching export pattern)
            const fullSizeUrl = `https://lh3.googleusercontent.com/d/${driveId}=w2160?authuser=0`;
            const thumbnailUrl = `https://lh3.googleusercontent.com/d/${driveId}=w400?authuser=0`;

            // Pass the full URLs to the parent component
            onShowImage({ fullSizeUrl, thumbnailUrl, driveId }, fieldLabel);
        } catch (err) {
            console.error('Failed to load file:', err);
            toast.error('Failed to load image.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className="btn btn-sm btn-primary"
            onClick={handleClick}
            disabled={loading}
            title={fieldLabel}
            style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
        >
            {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" />
            ) : (
                <><i className="fa fa-eye me-1"></i> View</>
            )}
        </button>
    );
};

const Miners = ({ language, country }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { changeTitle } = useContext(ThemeContext);

    const access = localStorage.getItem(`_dash`) || '3ts';
    const user = JSON.parse(localStorage.getItem(`_authUsr`));

    const [miners, setMiners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageField, setSelectedImageField] = useState('');
    const CAN_VERIFY=['beda@minexx.email', 'b.akaffou@minexx.co'];
    const canVerify = CAN_VERIFY.includes(user?.email);
    const [filters, setFilters] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        province: '',
        mineName: '',
        substance: ''
    });

    // ── Blockchain verification state ────────────────────────────────────
    const [verificationLoadingId, setVerificationLoadingId] = useState(null);
    const [verificationModal, setVerificationModal] = useState({
        show: false,
        status: 'idle', // 'loading' | 'verified' | 'failed' | 'error'
        minerId: null,
        data: null,
        error: null
    });

    // Translation helper
    const t = (key) => {
        const translations = {
            en: {
                'Miners': 'Miners',
                'Dashboard': 'Dashboard',
                'All Miners': 'All Miners',
                'First Name': 'First Name',
                'Last Name': 'Last Name',
                'Contact': 'Contact',
                'Email': 'Email',
                'Gender': 'Gender',
                'Mine/Concession': 'Mine/Concession',
                'Substance': 'Substance',
                'Province': 'Province',
                'Department': 'Department',
                'Locality': 'Locality',
                'Actions': 'Actions',
                'View': 'View',
                'Search': 'Search',
                'Reset': 'Reset',
                'No miners found': 'No miners found',
                'Loading miners...': 'Loading miners...',
                'Export CSV': 'Export CSV',
                'Profile Picture': 'Profile Picture',
                'Signature': 'Signature',
                'Identification Card': 'Identification Card',
                'Artisanal Mining Card': 'Artisanal Mining Card',
                'Date of Birth': 'Date of Birth',
                'Place of Birth': 'Place of Birth',
                'Permanent Residence': 'Permanent Residence',
                'Select Gender': 'Select Gender',
                'Male': 'Male',
                'Female': 'Female',
                'Registration Date': 'Registration Date',
                'Miner Details': 'Miner Details',
                'No image available': 'No image available'
            },
            fr: {
                'Miners': 'Mineurs',
                'Dashboard': 'Tableau de bord',
                'All Miners': 'Tous les mineurs',
                'First Name': 'Prénom',
                'Last Name': 'Nom',
                'Contact': 'Contact',
                'Email': 'E-mail',
                'Gender': 'Genre',
                'Mine/Concession': 'Mine/Concession',
                'Substance': 'Substance',
                'Province': 'Province',
                'Department': 'Département',
                'Locality': 'Localité',
                'Actions': 'Actions',
                'View': 'Voir',
                'Search': 'Rechercher',
                'Reset': 'Réinitialiser',
                'No miners found': 'Aucun mineur trouvé',
                'Loading miners...': 'Chargement des mineurs...',
                'Export CSV': 'Exporter CSV',
                'Profile Picture': 'Photo de profil',
                'Signature': 'Signature',
                'Identification Card': 'Carte d\'identité',
                'Artisanal Mining Card': 'Carte d\'exploitation artisanale',
                'Date of Birth': 'Date de naissance',
                'Place of Birth': 'Lieu de naissance',
                'Permanent Residence': 'Résidence permanente',
                'Select Gender': 'Sélectionner le genre',
                'Male': 'Masculin',
                'Female': 'Féminin',
                'Registration Date': 'Date d\'inscription',
                'Miner Details': 'Détails du mineur',
                'No image available': 'Aucune image disponible'
            }
        };
        return translations[language]?.[key] || key;
    };

    // ── Load Miners ──────────────────────────────────────────────────────
    const loadMiners = async (filterParams = {}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.keys(filterParams).forEach(key => {
                if (filterParams[key]) {
                    params.append(key, filterParams[key]);
                }
            });
             const normalizeCountry = (countryName) => {
                let normalized = countryName.trim();
                if (normalized.toLowerCase() === 'rwanda') {
                    normalized = '.Rwanda';
                } else {
                    normalized = normalized.replace(/^\.+|\.+$/g, '');
                }
                return normalized;
            };

            const response = await axiosInstance.get(`/miners?country=${normalizeCountry(country)}`, {
                headers: { 'x-platform': access }
            });

            if (response.data.success) {
                setMiners(response.data.miners || []);
                if (response.data.miners?.length === 0) {
                    toast.info('No miners found matching your criteria');
                }
            } else {
                toast.warn(response.data.message || 'Failed to load miners');
            }
        } catch (err) {
            if (err.response?.status === 403) {
                dispatch(Logout(navigate));
            } else {
                toast.error(err.response?.data?.message || 'Error loading miners');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Export to CSV ────────────────────────────────────────────────────
    const exportToCSV = () => {
        if (!miners || miners.length === 0) {
            toast.warn('No data to export.');
            return;
        }

        const headers = [
            'ID',
            'First Name',
            'Last Name',
            'Contact',
            'Email',
            'Gender',
            'Mine/Concession Name',
            'Substance to be Mined',
            'Province',
            'Department',
            'Locality',
            'Date of Birth',
            'Place of Birth',
            'Permanent Residence',
            'Registration Date'
        ];

        const escape = (v) => {
            const s = v === null || v === undefined ? '' : String(v);
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? `"${s.replace(/"/g, '""')}"`
                : s;
        };

        const csvContent = [
            headers.map(escape).join(','),
            ...miners.map(row => headers.map(h => {
                const fieldMap = {
                    'ID': row.ID,
                    'First Name': row['First Name'],
                    'Last Name': row['Last Name'],
                    'Contact': row.Contact,
                    'Email': row.Email,
                    'Gender': row.Gender,
                    'Mine/Concession Name': row['Mine/Concession Name'],
                    'Substance to be Mined': row['Substance to be Mined'],
                    'Province': row.Province,
                    'Department': row.Department,
                    'Locality': row.Locality,
                    'Date of Birth': row['Date of Birth'],
                    'Place of Birth': row['Place of Birth'],
                    'Permanent Residence': row['Permanent residence'],
                    'Registration Date': row['Date and Time']
                };
                return escape(fieldMap[h]);
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `miners_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported successfully!');
    };

    // ── Show Image Modal ──────────────────────────────────────────────
    const showImage = (imageData, field) => {
        if (!imageData || !imageData.fullSizeUrl) {
            toast.warn(t('No image available'));
            return;
        }
        setSelectedImage(imageData);
        setSelectedImageField(field);
        setShowModal(true);
    };

    // ── Handle Filter Change ────────────────────────────────────────────
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // ── Handle Search ────────────────────────────────────────────────────
    const handleSearch = (e) => {
        e.preventDefault();
        loadMiners(filters);
    };

    // ── Reset Filters ────────────────────────────────────────────────────
    const handleReset = () => {
        setFilters({
            firstName: '',
            lastName: '',
            gender: '',
            province: '',
            mineName: '',
            substance: ''
        });
        loadMiners({});
    };

    // ── View Miner Details ──────────────────────────────────────────────
    const handleViewMiner = (minerId) => {
        navigate(`/3tsminers/${minerId}`);
    };

    // ── Blockchain hash helpers (same convention as Purchase.js) ────────
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

    // ── Blockchain Verify ────────────────────────────────────────────────
    // Calls GET /miners-blockchain/:id/verify to confirm the miner record
    // has not been tampered with since it was anchored on-chain.
    const handleChainVerify = async (minerId) => {
        if (!minerId) {
            toast.warning('Miner ID is missing, so blockchain verification cannot run.');
            return;
        }

        setVerificationLoadingId(minerId);
        setVerificationModal({
            show: true,
            status: 'loading',
            minerId,
            data: null,
            error: null
        });

        try {
            const response = await axiosInstance.get(`/miners-blockchain/${encodeURIComponent(minerId)}/verify`, {
                headers: { 'x-platform': access }
            });
            const verified = response.data?.verified;

            setVerificationModal({
                show: true,
                status: verified ? 'verified' : 'failed',
                minerId,
                data: response.data,
                error: null
            });
        } catch (err) {
            console.error('Error verifying miner blockchain record:', err);
            setVerificationModal({
                show: true,
                status: 'error',
                minerId,
                data: null,
                error: err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to verify blockchain record'
            });
        } finally {
            setVerificationLoadingId(null);
        }
    };

    // ── Initialize ──────────────────────────────────────────────────────
    useEffect(() => {
        changeTitle(`${t('Miners')} | Minexx`);
        loadMiners();
    }, [language, country]);

    return (
        <>
            {/* Image Modal - Uses fullSizeUrl from the API */}
            <Modal size='lg' show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedImageField || t('Profile Picture')}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {selectedImage ? (
                        <img
                            alt={selectedImageField || 'Profile'}
                            className='rounded'
                            width={'100%'}
                            style={{ maxHeight: '600px', objectFit: 'contain' }}
                            src={selectedImage.fullSizeUrl || selectedImage.thumbnailUrl}
                            onError={(e) => {
                                console.error('Image failed to load:', e.target.src);
                                e.target.src = '/assets/images/placeholder.png';
                            }}
                        />
                    ) : (
                        <p className="text-muted">{t('No image available')}</p>
                    )}
                </Modal.Body>
            </Modal>

            {/* Blockchain Verification Modal (mirrors Purchase.js) */}
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
                            Miner ID: <span className="font-weight-bold">{verificationModal.minerId || 'Not available'}</span>
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    {verificationModal.status === 'loading' ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{ width: 54, height: 54 }} />
                            <h4 className="mt-4 mb-2">Checking blockchain anchor</h4>
                            <p className="text-muted mb-0">Comparing the MySQL miner record with the on-chain hash.</p>
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
                                    Stage: {verificationModal.data?.onChainAsset?.stage || 'Miner'}
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

            {/* Breadcrumb Header */}
            <div className="page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">
                        <Link to={"#"}>{t("Dashboard")}</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/3tsminers">{t("Miners")}</Link>
                    </li>
                </ol>
            </div>

            {/* Main Content */}
            <div className='row'>
                <div className='col-12'>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap">
                            <h4 className='card-title mb-0'>{t("All Miners")}</h4>
                            <div className="d-flex gap-2">
                                <button
                                    className='btn btn-success btn-sm'
                                    onClick={exportToCSV}
                                    disabled={miners.length === 0}
                                >
                                    <i className='fa fa-download me-1'></i> {t("Export CSV")}
                                </button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {/* Filter Section */}
                            <Form onSubmit={handleSearch} className="mb-4">
                                <Row className="mt-2">
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>{t("Mine/Concession")}</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="mineName"
                                                value={filters.mineName}
                                                onChange={handleFilterChange}
                                                placeholder={t("Mine/Concession")}
                                                size="sm"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3} className="d-flex align-items-end">
                                        <Button type="submit" variant="primary" size="sm" className="me-2">
                                            <i className="fa fa-search me-1"></i> {t("Search")}
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={handleReset}>
                                            <i className="fa fa-undo me-1"></i> {t("Reset")}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>

                            {/* Table */}
                            <div className="w-100 table-responsive">
                                <div className="dataTables_wrapper">
                                    <Table bordered striped hover responsive size='sm'>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>#</th>
                                                <th>{t("First Name")}</th>
                                                <th>{t("Last Name")}</th>
                                                <th>{t("Contact")}</th>
                                                <th>{t("Email")}</th>
                                                <th>{t("Gender")}</th>
                                                <th style={{ width: '100px' }}>{t("Profile Picture")}</th>
                                                <th>{t("Mine/Concession")}</th>
                                                <th>{t("Substance")}</th>
                                                <th>{t("Province")}</th>
                                                <th style={{ width: '180px' }}>{t("Actions")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="11" className="text-center">
                                                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                                                        {t("Loading miners...")}
                                                    </td>
                                                </tr>
                                            ) : miners.length === 0 ? (
                                                <tr>
                                                    <td colSpan="11" className="text-center text-muted">
                                                        <i className="fa fa-users fa-2x d-block mb-2"></i>
                                                        {t("No miners found")}
                                                    </td>
                                                </tr>
                                            ) : (
                                                miners.map((miner, index) => {
                                                    const isVerifying = verificationLoadingId === miner.ID;
                                                    return (
                                                        <tr key={miner.ID}>
                                                            <td>{index + 1}</td>
                                                            <td>{miner['First Name'] || '-'}</td>
                                                            <td>{miner['Last Name'] || '-'}</td>
                                                            <td>{miner.Contact || '-'}</td>
                                                            <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {miner.Email || '-'}
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${miner.Gender === 'Male' ? 'bg-info' : miner.Gender === 'Female' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                    {miner.Gender || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                <LazyImageButton
                                                                    minerId={miner.ID}
                                                                    field="Profile Picture"
                                                                    fieldLabel={t("Profile Picture")}
                                                                    onShowImage={showImage}
                                                                />
                                                            </td>
                                                            <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {miner['Mine/Concession Name'] || '-'}
                                                            </td>
                                                            <td>{miner['Substance to be Mined'] || '-'}</td>
                                                            <td>{miner.Province || '-'}</td>
                                                            <td>
                                                                <div className="d-flex gap-1 flex-wrap">
                                                                    <button
                                                                        className="btn btn-sm btn-primary"
                                                                        onClick={() => handleViewMiner(miner.ID)}
                                                                        title={t("View Details")}
                                                                    >
                                                                        <i className="fa fa-eye"></i>
                                                                    </button>
                                                                    {/* <LazyImageButton
                                                                        minerId={miner.ID}
                                                                        field="Artisanal Mining Card"
                                                                        fieldLabel={t("Artisanal Mining Card")}
                                                                        onShowImage={showImage}
                                                                    />
                                                                    <LazyImageButton
                                                                        minerId={miner.ID}
                                                                        field="Signature"
                                                                        fieldLabel={t("Signature")}
                                                                        onShowImage={showImage}
                                                                    /> */}
                                                                    
                                                                    {canVerify && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-warning"
                                                                        style={{ fontSize: '11px', padding: '4px 10px', minWidth: 74 }}
                                                                        disabled={!miner.ID || isVerifying}
                                                                        onClick={() => handleChainVerify(miner.ID)}
                                                                    >
                                                                        {isVerifying ? (
                                                                            <span className="spinner-border spinner-border-sm" role="status" />
                                                                        ) : (
                                                                            <><i className="fa fa-shield me-1"></i>Verify</>
                                                                        )}
                                                                    </button>
                                                                )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>

                            {/* Summary */}
                            {!loading && (
                                <div className="mt-3 d-flex justify-content-between align-items-center">
                                    <p className="text-muted mb-0">
                                        Showing <strong>{miners.length}</strong> miner{miners.length !== 1 ? 's' : ''}
                                    </p>
                                    {miners.length > 0 && (
                                        <small className="text-muted">
                                            Last updated: {new Date().toLocaleString()}
                                        </small>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Miners;