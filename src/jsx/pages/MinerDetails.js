// src/pages/MinerDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Button, Modal, Badge } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import axiosInstance from '../../services/AxiosInstance';
import { useDispatch } from 'react-redux';
import { Logout } from '../../store/actions/AuthActions';

// ── Dark/Blue theme tokens (scoped, no external CSS file needed) ────
const ThemeStyles = () => (
    <style>{`
        .md-dark-wrap {
            --md-bg: #24292d;
            --md-panel: #2f363e;
            --md-panel-alt: #24292d;
            --md-border: #3a424a;
            --md-text: #e5edf7;
            --md-text-muted: #93a3bd;
            --md-blue: #2f6fed;
            --md-blue-soft: rgba(47, 111, 237, 0.15);
            --md-blue-bright: #4f8cff;
        }
        .md-dark-wrap {
            background: var(--md-bg);
            color: var(--md-text);
            padding: 20px;
            border-radius: 12px;
        }
        .md-page-content { max-width: 1440px; margin: 0 auto; }
        .md-breadcrumb .breadcrumb-item a,
        .md-breadcrumb .breadcrumb-item.active {
            color: var(--md-text-muted);
        }
        .md-breadcrumb .breadcrumb-item a:hover { color: var(--md-blue-bright); }

        .md-card {
            background: var(--md-panel) !important;
            border: 1px solid var(--md-border) !important;
            color: var(--md-text) !important;
            border-radius: 14px !important;
        }
        .md-card .card-body { color: var(--md-text); }

        .md-profile-hero {
            background: linear-gradient(112deg, var(--md-panel) 0%, #39434d 100%);
            border: 1px solid var(--md-border);
            border-radius: 16px;
            padding: 22px 24px;
            position: relative;
            overflow: hidden;
        }
        .md-profile-hero::after {
            content: '';
            width: 240px;
            height: 240px;
            position: absolute;
            right: -90px;
            top: -145px;
            border: 34px solid rgba(79, 140, 255, .08);
            border-radius: 50%;
            pointer-events: none;
        }
        .md-profile-title { color: var(--md-text); font-size: clamp(1.35rem, 2vw, 1.8rem); }
        .md-profile-subtitle { color: var(--md-text-muted); }
        .md-section-card { height: 100%; }
        .md-section-title {
            color: var(--md-text);
            font-size: .93rem;
            font-weight: 600;
            margin: 0;
        }
        .md-section-icon {
            width: 32px;
            height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--md-blue-soft);
            border: 1px solid rgba(47, 111, 237, .55);
            border-radius: 9px;
            color: var(--md-blue-bright);
        }
        .md-info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .md-info-item { padding: 14px 16px; min-width: 0; }
        .md-info-item:nth-child(odd) { border-right: 1px solid var(--md-border); }
        .md-info-item:nth-child(n + 3) { border-top: 1px solid var(--md-border); }
        .md-info-value { color: var(--md-text); margin-top: 3px; overflow-wrap: anywhere; }
        .md-document-row { padding: 12px 0; }
        .md-document-row + .md-document-row { border-top: 1px solid var(--md-border); }
        .md-document-icon { color: var(--md-blue-bright); width: 22px; text-align: center; }

        .md-label {
            color: var(--md-text-muted) !important;
            letter-spacing: 0.04em;
        }
        .md-value { color: var(--md-text); }

        .md-btn-outline {
            background: transparent;
            border: 1px solid var(--md-blue);
            color: var(--md-blue-bright);
        }
        .md-btn-outline:hover {
            background: var(--md-blue-soft);
            color: #ffffff;
            border-color: var(--md-blue-bright);
        }
        .md-btn-primary {
            background: var(--md-blue);
            border: 1px solid var(--md-blue);
            color: #ffffff;
        }
        .md-btn-primary:hover {
            background: var(--md-blue-bright);
            border-color: var(--md-blue-bright);
        }

        .md-link-btn {
            color: var(--md-blue-bright) !important;
        }
        .md-link-btn:hover { color: #ffffff !important; text-decoration: underline; }

        .md-badge-blue {
            background: var(--md-blue-soft) !important;
            color: var(--md-blue-bright) !important;
            border: 1px solid var(--md-blue);
            font-weight: 500;
        }

        .md-divider {
            border-color: var(--md-border) !important;
            opacity: 1;
        }

        .md-icon-blue { color: var(--md-blue-bright) !important; }

        /* ── Profile picture: fixed box for BOTH loading + loaded state ── */
        .md-avatar-box {
            width: 112px;
            height: 112px;
            border-radius: 50%;
            border: 3px solid var(--md-blue);
            background: var(--md-panel-alt);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin: 0 auto 10px auto;
            position: relative;
        }
        .md-avatar-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            cursor: pointer;
            opacity: 0;
            animation: mdFadeIn 0.25s ease forwards;
        }
        @keyframes mdFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .md-modal-content {
            background: var(--md-panel) !important;
            color: var(--md-text) !important;
            border: 1px solid var(--md-border) !important;
        }
        .md-modal-content .modal-header,
        .md-modal-content .modal-footer {
            border-color: var(--md-border) !important;
        }
        @media (max-width: 575.98px) {
            .md-dark-wrap { padding: 14px; border-radius: 0; }
            .md-profile-hero { padding: 18px; }
            .md-info-grid { grid-template-columns: 1fr; }
            .md-info-item:nth-child(odd) { border-right: 0; }
            .md-info-item:not(:first-child) { border-top: 1px solid var(--md-border); }
        }
    `}</style>
);

// ── Lazy Image Button for Miner Details (matches export pattern) ────
const LazyImageButton = ({ minerId, field, fieldLabel, onShowImage, variant = 'link' }) => {
    const [loading, setLoading] = useState(false);
    const access = localStorage.getItem(`_dash`) || '3ts';

    const handleClick = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/minerfield/${minerId}`, {
                params: { field },
                headers: { 'x-platform': access }
            });

            const { fileId, fileContent } = res.data.file || {};

            if (!fileId) {
                toast.warn('No image available');
                return;
            }

            const driveId = fileContent || fileId;
            const fullSizeUrl = `https://lh3.googleusercontent.com/d/${driveId}=w2160?authuser=0`;
            const thumbnailUrl = `https://lh3.googleusercontent.com/d/${driveId}=w400?authuser=0`;

            onShowImage({ fullSizeUrl, thumbnailUrl, driveId }, fieldLabel);
        } catch (err) {
            console.error('Failed to load file:', err);
            toast.error('Failed to load image.');
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'link') {
        return (
            <button
                className="btn btn-sm btn-link md-link-btn p-0"
                onClick={handleClick}
                disabled={loading}
                title={fieldLabel}
                style={{ textDecoration: 'none' }}
            >
                {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" />
                ) : (
                    <><i className="fa fa-eye me-1"></i> View</>
                )}
            </button>
        );
    }

    return (
        <button
            className={`btn btn-sm ${variant === 'primary' ? 'md-btn-primary' : 'md-btn-outline'}`}
            onClick={handleClick}
            disabled={loading}
            title={fieldLabel}
        >
            {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" />
            ) : (
                <i className="fa fa-image"></i>
            )}
        </button>
    );
};

const MinerDetails = ({ language, country }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { changeTitle } = useContext(ThemeContext);

    const access = localStorage.getItem(`_dash`) || '3ts';
    const user = JSON.parse(localStorage.getItem(`_authUsr`));

    const [miner, setMiner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageField, setSelectedImageField] = useState('');

    // ── Profile picture states ────────────────────────────────────────
    const [profilePicUrl, setProfilePicUrl] = useState(null);
    const [profilePicLoading, setProfilePicLoading] = useState(false);

    // Translation helper
    const t = (key) => {
        const translations = {
            en: {
                'Miner Details': 'Miner Details',
                'Dashboard': 'Dashboard',
                'Miners': 'Miners',
                'Back to List': 'Back to List',
                'Personal Information': 'Personal Information',
                'Mining Information': 'Mining Information',
                'Document': 'Document',
                'Copy of identity card (CNI) or passport': 'Copy of identity card (CNI) or passport',
                'Full Name': 'Full Name',
                'First Name': 'First Name',
                'Last Name': 'Last Name',
                'Contact': 'Contact',
                'Email': 'Email',
                'Gender': 'Gender',
                'Date of Birth': 'Date of Birth',
                'Place of Birth': 'Place of Birth',
                'Permanent Residence': 'Permanent Residence',
                'National ID': 'National ID',
                'Identification Card Number': 'Identification Card Number',
                'Mine/Concession Name': 'Mine/Concession Name',
                'Substance to be Mined': 'Substance to be Mined',
                'Province': 'Province',
                'Department': 'Department',
                'Locality': 'Locality',
                'Registration Date': 'Registration Date',
                'Place': 'Place',
                'Signature': 'Signature',
                'Profile Picture': 'Profile Picture',
                'Identification Card': 'Identification Card',
                'Artisanal Mining Card': 'Artisanal Mining Card',
                'Loading...': 'Loading...',
                'Miner not found': 'Miner not found',
                'View': 'View',
                'Not provided': 'Not provided',
                'No image available': 'No image available',
                'Miner ID': 'Miner ID',
                'Registration': 'Registration',
                'Registered Miner': 'Registered Miner',
                'Location': 'Location',
                'Documents': 'Documents',
                'No documents available': 'No documents available'
            },
            fr: {
                'Miner Details': 'Détails du mineur',
                'Dashboard': 'Tableau de bord',
                'Miners': 'Mineurs',
                'Back to List': 'Retour à la liste',
                'Personal Information': 'Informations personnelles',
                'Mining Information': 'Informations minières',
                'Document': 'Document',
                'Copy of identity card (CNI) or passport': 'Copie de la carte d\'identité (CNI) ou du passeport',
                'Full Name': 'Nom complet',
                'First Name': 'Prénom',
                'Last Name': 'Nom',
                'Contact': 'Contact',
                'Email': 'E-mail',
                'Gender': 'Genre',
                'Date of Birth': 'Date de naissance',
                'Place of Birth': 'Lieu de naissance',
                'Permanent Residence': 'Résidence permanente',
                'National ID': 'ID National',
                'Identification Card Number': 'Numéro de carte d\'identité',
                'Mine/Concession Name': 'Nom de la mine/concession',
                'Substance to be Mined': 'Substance à extraire',
                'Province': 'Province',
                'Department': 'Département',
                'Locality': 'Localité',
                'Registration Date': 'Date d\'inscription',
                'Place': 'Lieu',
                'Signature': 'Signature',
                'Profile Picture': 'Photo de profil',
                'Identification Card': 'Carte d\'identité',
                'Artisanal Mining Card': 'Carte d\'exploitation artisanale',
                'Loading...': 'Chargement...',
                'Miner not found': 'Mineur non trouvé',
                'View': 'Voir',
                'Not provided': 'Non fourni',
                'No image available': 'Aucune image disponible',
                'Miner ID': 'ID du mineur',
                'Registration': 'Inscription',
                'Registered Miner': 'Mineur inscrit',
                'Location': 'Localisation',
                'Documents': 'Documents',
                'No documents available': 'Aucun document disponible'
            }
        };
        return translations[language]?.[key] || key;
    };

    // ── Load Miner Details ──────────────────────────────────────────────
    const loadMinerDetails = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/miner/${id}`, {
                headers: { 'x-platform': access }
            });

            if (response.data.success) {
                setMiner(response.data.miner || null);
                if (!response.data.miner) {
                    toast.warn('Miner not found');
                }
            } else {
                toast.warn(response.data.message || 'Failed to load miner details');
            }
        } catch (err) {
            if (err.response?.status === 403) {
                dispatch(Logout(navigate));
            } else if (err.response?.status === 404) {
                toast.error('Miner not found');
                setMiner(null);
            } else {
                toast.error(err.response?.data?.message || 'Error loading miner details');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Auto-load profile picture ──────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const fetchProfilePic = async () => {
            if (!miner || !miner['Profile Picture']) {
                setProfilePicUrl(null);
                return;
            }

            setProfilePicLoading(true);
            try {
                const res = await axiosInstance.get(`/minerfield/${miner.ID}`, {
                    params: { field: 'Profile Picture' },
                    headers: { 'x-platform': access }
                });

                const { fileId, fileContent } = res.data.file || {};
                if (!cancelled) {
                    if (fileId) {
                        const driveId = fileContent || fileId;
                        setProfilePicUrl(`https://lh3.googleusercontent.com/d/${driveId}=w2160?authuser=0`);
                    } else {
                        setProfilePicUrl(null);
                    }
                }
            } catch (err) {
                console.error('Failed to auto-load profile picture:', err);
                if (!cancelled) setProfilePicUrl(null);
            } finally {
                if (!cancelled) setProfilePicLoading(false);
            }
        };

        fetchProfilePic();
        return () => { cancelled = true; };
    }, [miner, access]);

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

    // ── Handle Profile Picture Click ────────────────────────────────────
    const handleProfilePictureClick = () => {
        if (!profilePicUrl) {
            toast.warn('No profile picture available');
            return;
        }

        showImage({
            fullSizeUrl: profilePicUrl,
            thumbnailUrl: profilePicUrl.replace('=w2160', '=w400'),
            driveId: profilePicUrl.split('/d/')[1]?.split('=')[0] || ''
        }, t('Profile Picture'));
    };

    // ── Initialize ──────────────────────────────────────────────────────
    useEffect(() => {
        changeTitle(`${t('Miner Details')} | Minexx`);
        if (id) {
            loadMinerDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, language, country]);

    if (loading) {
        return (
            <div className="md-dark-wrap text-center py-5">
                <ThemeStyles />
                <div className="spinner-border" role="status" style={{ color: '#4f8cff' }}>
                    <span className="visually-hidden">{t('Loading...')}</span>
                </div>
                <p className="mt-2" style={{ color: '#93a3bd' }}>{t('Loading...')}</p>
            </div>
        );
    }

    if (!miner) {
        return (
            <div className="md-dark-wrap text-center py-5">
                <ThemeStyles />
                <i className="fa fa-user-slash fa-3x mb-3" style={{ color: '#93a3bd' }}></i>
                <h4>{t('Miner not found')}</h4>
                <p style={{ color: '#93a3bd' }}>The miner you're looking for doesn't exist</p>
                <Button as={Link} to="/3tsminers" className="md-btn-primary">
                    <i className="fa fa-arrow-left me-2"></i> {t('Back to List')}
                </Button>
            </div>
        );
    }

    return (
        <div className="md-dark-wrap">
            <ThemeStyles />

            {/* Image Modal */}
            <Modal size='lg' show={showModal} onHide={() => setShowModal(false)}>
                <div className="md-modal-content">
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedImageField || t('Image')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        {selectedImage ? (
                            <img
                                alt={selectedImageField || 'Image'}
                                className='rounded'
                                width={'100%'}
                                style={{ maxHeight: '600px', objectFit: 'contain' }}
                                src={selectedImage.fullSizeUrl || selectedImage.thumbnailUrl}
                                onError={(e) => {
                                    e.target.src = '/assets/images/placeholder.png';
                                }}
                            />
                        ) : (
                            <p style={{ color: '#93a3bd' }}>{t('No image available')}</p>
                        )}
                    </Modal.Body>
                </div>
            </Modal>

            {/* Breadcrumb Header */}
            <div className="page-titles md-breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">
                        <Link to={"#"}>{t("Dashboard")}</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/3tsminers">{t("Miners")}</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to={"#"}>{t("Miner Details")}</Link>
                    </li>
                </ol>
            </div>

            <main className="md-page-content">
                <section className="md-profile-hero mb-3">
                    <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-3 position-relative" style={{ zIndex: 1 }}>
                        <div className="md-avatar-box mb-0 flex-shrink-0">
                            {profilePicLoading ? <div className="spinner-border spinner-border-sm" role="status" style={{ color: '#4f8cff' }} /> : profilePicUrl ? (
                                <img key={profilePicUrl} src={profilePicUrl} alt={miner['First Name']} onClick={handleProfilePictureClick} onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/avatar.png'; }} />
                            ) : <i className="fa fa-user fa-3x" style={{ color: '#4f8cff' }} />}
                        </div>
                        <div className="text-center text-sm-start flex-grow-1 pt-sm-2">
                            <div className="d-flex flex-column flex-sm-row justify-content-between gap-3">
                                <div>
                                    <div className="md-label small text-uppercase fw-bold mb-1">{t('Registered Miner')}</div>
                                    <h1 className="md-profile-title mb-2">{miner['First Name']} {miner['Last Name']}</h1>
                                    <div className="d-flex flex-wrap justify-content-center justify-content-sm-start align-items-center gap-2">
                                        <Badge bg="" className="md-badge-blue">{miner.Gender || t('Not provided')}</Badge>
                                        <span className="md-profile-subtitle small"><i className="fa fa-id-card me-1 md-icon-blue" />{t('Miner ID')}: {miner.ID}</span>
                                    </div>
                                </div>
                                <Button as={Link} to="/3tsminers" size="sm" className="md-btn-outline align-self-center align-self-sm-start"><i className="fa fa-arrow-left me-2" />{t('Back to List')}</Button>
                            </div>
                        </div>
                    </div>
                </section>

                <Row className="g-3">
                    <Col lg={4}>
                        <Card className="md-card md-section-card">
                            <Card.Body className="p-0">
                                <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom" style={{ borderColor: 'var(--md-border) !important' }}><span className="md-section-icon"><i className="fa fa-user" /></span><h2 className="md-section-title">{t('Personal Information')}</h2></div>
                                <div className="md-info-grid">
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('Date of Birth')}</div><div className="md-info-value">{miner.formattedDateOfBirth || '-'}</div></div>
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('Place of Birth')}</div><div className="md-info-value">{miner['Place of Birth'] || '-'}</div></div>
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('National ID')}</div><div className="md-info-value">{miner['National ID'] || t('Not provided')}</div></div>
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('Identification Card Number')}</div><div className="md-info-value">{miner['Identification Card Number'] || '-'}</div></div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4}>
                        <Card className="md-card md-section-card">
                            <Card.Body className="p-0">
                                <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom" style={{ borderColor: 'var(--md-border) !important' }}><span className="md-section-icon"><i className="fa fa-industry" /></span><h2 className="md-section-title">{t('Mining Information')}</h2></div>
                                <div className="md-info-grid">
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('Mine/Concession Name')}</div><div className="md-info-value">{miner['Mine/Concession Name'] || '-'}</div></div>
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('Substance to be Mined')}</div><div className="md-info-value">{miner['Substance to be Mined'] || '-'}</div></div>
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('Province')}</div><div className="md-info-value">{miner.Province || '-'}</div></div>
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('Department')}</div><div className="md-info-value">{miner.Department || '-'}</div></div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4}>
                        <Card className="md-card md-section-card">
                            <Card.Body className="p-0">
                                <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom" style={{ borderColor: 'var(--md-border) !important' }}><span className="md-section-icon"><i className="fa fa-address-book" /></span><h2 className="md-section-title">{t('Contact')}</h2></div>
                                <div className="md-info-grid">
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('Email')}</div><div className="md-info-value">{miner.Email || t('Not provided')}</div></div>
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('Contact')}</div><div className="md-info-value">{miner.Contact || t('Not provided')}</div></div>
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('Permanent Residence')}</div><div className="md-info-value">{miner['Permanent residence'] || '-'}</div></div>
                                    <div className="md-info-item"><div className="md-label small text-uppercase">{t('Location')}</div><div className="md-info-value">{miner.Place || '-'}</div></div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={7}>
                        <Card className="md-card md-section-card">
                            <Card.Body className="p-0">
                                <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom" style={{ borderColor: 'var(--md-border) !important' }}><span className="md-section-icon"><i className="fa fa-file-text" /></span><h2 className="md-section-title">{t('Documents')}</h2></div>
                                <div className="px-3 py-1">
                                    {[
                                        ['Identification Card', 'Identification Card'], ['Artisanal Mining Card', 'Artisanal Mining Card'], ['Signature', 'Signature'], ['Copy of identity card (CNI) or passport', 'Copy of identity card (CNI) or passport']
                                    ].filter(([field]) => miner[field]).map(([field, label]) => (
                                        <div className="md-document-row d-flex justify-content-between align-items-center gap-3" key={field}><span className="d-flex align-items-center gap-2"><i className="fa fa-file-image-o md-document-icon" />{t(label)}</span><LazyImageButton minerId={miner.ID} field={field} fieldLabel={t(label)} onShowImage={showImage} variant="link" /></div>
                                    ))}
                                    {!['Identification Card', 'Artisanal Mining Card', 'Signature', 'Copy of identity card (CNI) or passport'].some((field) => miner[field]) && <p className="md-profile-subtitle small my-3">{t('No documents available')}</p>}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={5}>
                        <Card className="md-card md-section-card"><Card.Body className="p-0"><div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom" style={{ borderColor: 'var(--md-border) !important' }}><span className="md-section-icon"><i className="fa fa-calendar" /></span><h2 className="md-section-title">{t('Registration')}</h2></div><div className="md-info-grid"><div className="md-info-item"><div className="md-label small text-uppercase">{t('Registration Date')}</div><div className="md-info-value">{miner.formattedDateTime || '-'}</div></div><div className="md-info-item"><div className="md-label small text-uppercase">{t('Locality')}</div><div className="md-info-value">{miner.Locality || '-'}</div></div></div></Card.Body></Card>
                    </Col>
                </Row>
            </main>
        </div>
    );
};

export default MinerDetails;
