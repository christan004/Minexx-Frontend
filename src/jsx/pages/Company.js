import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Modal, Nav, Tab } from 'react-bootstrap';
import { baseURL_ } from '../../config';
import ComplianceTable from '../components/table/ComplianceTable';
import { toast } from 'react-toastify';
import { ThemeContext } from '../../context/ThemeContext';
import { Logout } from '../../store/actions/AuthActions';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../services/AxiosInstance';
import { translations } from './Companytranslation';

const Company = ({ language, country }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { changeTitle } = useContext(ThemeContext);
    
    // Separate loading states for each section
    const [loadingStates, setLoadingStates] = useState({
        basic: true,
        documents: true,
        shareholders: true,
        beneficialOwners: true,
        incidents: false
    });
    
    // Data states
    const [company, setCompany] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [shareholders, setShareholders] = useState([]);
    const [beneficialOwners, setBeneficialOwners] = useState([]);
    const [shareholderID, setShareholderID] = useState(null);
    const [incidents, setIncidents] = useState([]);
    const [incidentview, setIncidentview] = useState(null);
    const user = JSON.parse(localStorage.getItem(`_authUsr`));

    // Multi-select state for incidents
    const [selectedIncidents, setSelectedIncidents] = useState(new Set());

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        show: false,
        action: null,
        incidentId: null,
        message: ''
    });

    const t = (key) => {
        if (!translations[language]) {
            console.warn(`Translation for language "${language}" not found`);
            return key;
        }
        return translations[language][key] || key;
    };

    let normalizedCountrys = country.trim();
            
    // Special handling for Rwanda
    if (normalizedCountrys.toLowerCase() === 'rwanda') {
        normalizedCountrys = '.Rwanda';
    } else {
        normalizedCountrys = normalizedCountrys.replace(/^\.+|\.+$/g, '');
    }

    const handleError = (err) => {
        try {
            if (err.response?.status === 403) {
                dispatch(Logout(navigate));
            } else {
                toast.warn(err.response?.data?.message || 'An error occurred');
            }
        } catch (e) {
            toast.error(err.message || 'An unexpected error occurred');
        }
    };

    // Toggle individual incident selection
    const toggleIncidentSelection = (incidentId, event) => {
        event.stopPropagation();
        setSelectedIncidents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(incidentId)) {
                newSet.delete(incidentId);
            } else {
                newSet.add(incidentId);
            }
            return newSet;
        });
    };

    // Select all incidents
    const selectAllIncidents = () => {
        if (selectedIncidents.size === incidents.length) {
            setSelectedIncidents(new Set());
        } else {
            setSelectedIncidents(new Set(incidents.map(inc => inc.id)));
        }
    };

    // Show confirmation dialog
    const showConfirmDialog = (action, incidentId = null) => {
        let message = '';
        
        switch(action) {
            case 'approve':
                message = 'Are you sure you want to approve this incident?';
                break;
            case 'disapprove':
                message = 'Are you sure you want to disapprove this incident?';
                break;
            case 'bulkApprove':
                message = `Are you sure you want to approve ${selectedIncidents.size} incident(s)?`;
                break;
            case 'bulkDisapprove':
                message = `Are you sure you want to disapprove ${selectedIncidents.size} incident(s)?`;
                break;
            default:
                message = 'Are you sure you want to proceed?';
        }

        setConfirmDialog({
            show: true,
            action,
            incidentId,
            message
        });
    };

    // Hide confirmation dialog
    const hideConfirmDialog = () => {
        setConfirmDialog({
            show: false,
            action: null,
            incidentId: null,
            message: ''
        });
    };

    // Handle confirmation
    const handleConfirm = async () => {
        const { action, incidentId } = confirmDialog;
        hideConfirmDialog();

        switch(action) {
            case 'approve':
                await executeApprove(incidentId);
                break;
            case 'disapprove':
                await executeDisapprove(incidentId);
                break;
            case 'bulkApprove':
                await executeBulkApprove();
                break;
            case 'bulkDisapprove':
                await executeBulkDisapprove();
                break;
            default:
                break;
        }
    };

    // Separate fetch functions for each data type
    const fetchCompanyDetails = async () => {
        try {
            const response = await axiosInstance.get(`companies/country/${id}`, {
                params: { country: normalizedCountrys }
            });
            setCompany(response.data.company);
            changeTitle(response.data.company.name);
        } catch (err) {
            console.log(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, basic: false }));
        }
    };

    const fetchDocuments = async () => {
        try {
            const response = await axiosInstance.get(`documentsnoAuth/${id}`, {
                params: { country: normalizedCountrys }
            });
            setDocuments(response.data.documents.documents);
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, documents: false }));
        }
    };

    const fetchShareholders = async () => {
        try {
            const response = await axiosInstance.get(`shareholders/${id}`, {
                params: { country: normalizedCountrys }
            });
            setShareholders(response.data.shareholders);
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, shareholders: false }));
        }
    };

    const fetchBeneficialOwners = async () => {
        try {
            const response = await axiosInstance.get(`owners/${id}`, {
                params: { country: normalizedCountrys }
            });
            setBeneficialOwners(response.data.beneficial_owners);
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, beneficialOwners: false }));
        }
    };

    
    const fetchIncidents = async () => {
        setLoadingStates(prev => ({ ...prev, incidents: true }));
        try {
            const response = await axiosInstance.get(`incidents/company/${id}`, {
                params: { country: normalizedCountrys }
            });
            setIncidents(response.data.incidents);
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, incidents: false }));
        }
    };

    // Execute approve (called after confirmation)
    const executeApprove = async (incidentID) => {
        setLoadingStates(prev => ({ ...prev, incidents: true }));
        try {
            const response = await axiosInstance.post(`incident/approve/${incidentID}`);
            toast.success(response.data.message || 'Incident approved successfully');
            await fetchIncidents();
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, incidents: false }));
        }
    };
           
    // Execute disapprove (called after confirmation)
    const executeDisapprove = async (incidentID) => {
        setLoadingStates(prev => ({ ...prev, incidents: true }));
        try {
            const response = await axiosInstance.delete(`incident/disapproved/${incidentID}`);
            toast.success(response.data.message || 'Incident disapproved successfully');
            await fetchIncidents();
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, incidents: false }));
        }
    };

    // Execute bulk approve (called after confirmation)
    const executeBulkApprove = async () => {
        setLoadingStates(prev => ({ ...prev, incidents: true }));
        try {
            const incidentIds = Array.from(selectedIncidents);
            const promises = incidentIds.map(incidentId => 
                axiosInstance.post(`incident/approve/${incidentId}`)
            );
            
            const results = await Promise.allSettled(promises);
            
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            
            if (successful > 0) {
                toast.success(`${successful} incident(s) approved successfully`);
            }
            if (failed > 0) {
                toast.error(`${failed} incident(s) failed to approve`);
            }
            
            setSelectedIncidents(new Set());
            await fetchIncidents();
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, incidents: false }));
        }
    };

    // Execute bulk disapprove (called after confirmation)
    const executeBulkDisapprove = async () => {
        setLoadingStates(prev => ({ ...prev, incidents: true }));
        try {
            const incidentIds = Array.from(selectedIncidents);
            const promises = incidentIds.map(incidentId => 
                axiosInstance.delete(`incident/disapproved/${incidentId}`)
            );
            
            const results = await Promise.allSettled(promises);
            
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            
            if (successful > 0) {
                toast.success(`${successful} incident(s) disapproved successfully`);
            }
            if (failed > 0) {
                toast.error(`${failed} incident(s) failed to disapprove`);
            }
            
            setSelectedIncidents(new Set());
            await fetchIncidents();
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, incidents: false }));
        }
    };

    // Add callback function to update document status locally
    const handleDocumentUpdate = (docId, newStatus) => {
        setDocuments(prevDocs => 
            prevDocs.map(doc => 
                doc.id === docId ? { ...doc, status: newStatus } : doc
            )
        );
    };

    useEffect(() => {
        fetchCompanyDetails();
        fetchDocuments();
        fetchShareholders();
        fetchBeneficialOwners();
    }, [id, language, country]);

    // Loading spinner component
    const LoadingSpinner = () => (
        <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    const renderPersonCard = (person, type, index) => (
        <div className='col-md-4' key={`${type}${index}`}>
            <div className='card'>
                <div className='card-body'>
                    <h5 className='text-primary'>{person?.name}</h5>
                    <span>{t('Nationality')}: {person?.nationality}</span><br/>
                    <span>{t('PercentageOwned')}: {person?.percent}%</span><br/>
                    <span>{t('Address')}: {person?.address || '--'}</span><br/>
                    {person.nationalID && (
                        <Link 
                            to="" 
                            className='btn btn-sm btn-primary mt-3' 
                            onClick={() => setShareholderID(person)}
                        >
                            {t('View')}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Confirmation Dialog */}
            {confirmDialog.show && (
                <Modal show={confirmDialog.show} onHide={hideConfirmDialog} centered>
                    <Modal.Header>
                        <h5 className='modal-title'>Confirm Action</h5>
                        <button type="button" className="btn-close" onClick={hideConfirmDialog}></button>
                    </Modal.Header>
                    <Modal.Body>
                        <p className="mb-0">{confirmDialog.message}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className='btn btn-secondary' onClick={hideConfirmDialog}>Cancel</button>
                        <button 
                            className={`btn ${confirmDialog.action?.includes('approve') ? 'btn-success' : 'btn-danger'}`}
                            onClick={handleConfirm}
                        >
                            OK
                        </button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Incident View Modal */}
            {incidentview && (
                <Modal size='lg' show={incidentview} onHide={() => setIncidentview(null)}>
                    <Modal.Header>
                        <h3 className='modal-title'>Incident: {incidentview.id}</h3>
                        <Link className='modal-dismiss' onClick={() => setIncidentview(null)}>x</Link>
                    </Modal.Header>
                    <Modal.Body>
                        <Tab.Container defaultActiveKey="incidentInfo">
                            <Nav as="ul" className="nav nav-pills review-tab" role="tablist">
                                <Nav.Item as="li" className="nav-item">
                                    <Nav.Link className="nav-link px-2 px-lg-3" to="#incidentInfo" role="tab" eventKey="incidentInfo">
                                        Incident Info
                                    </Nav.Link>
                                </Nav.Item>
                                {incidentview.image && (
                                    <Nav.Item as="li" className="nav-item">
                                        <Nav.Link className="nav-link px-2 px-lg-3" to="#image" role="tab" eventKey="image">
                                            Image
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                                {incidentview.proof && (
                                    <Nav.Item as="li" className="nav-item">
                                        <Nav.Link className="nav-link px-2 px-lg-3" to="#proof" role="tab" eventKey="proof">
                                            Proof
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                            </Nav>
                            <Tab.Content>
                                <Tab.Pane eventKey="incidentInfo" id='incidentInfo'>
                                    <div className='card'>
                                        <div className='card-body border mt-4 rounded'>
                                            {Object.keys(incidentview)
                                                .filter(k => k !== "image" && k !== "company" && k !== "proof" && k !== "location" && incidentview[k])
                                                .map(key => (
                                                    <div className='row' key={key}>
                                                        <div className='col-4'><h5>{key.toUpperCase()}: </h5></div>
                                                        <div className='col-8'>
                                                            <p className={`font-w200 ${key === 'level' ? incidentview.level === 'low' ? 'text-primary' : incidentview.level === 'medium' ? 'text-warning' : incidentview.level === 'high' ? 'text-danger' : 'text-warning' : ''}`}>
                                                                {incidentview[key]}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="image" id='image'>
                                    <img alt='' className='rounded mt-4' width={'100%'} src={`https://lh3.googleusercontent.com/d/${incidentview.image}=w2160?authuser=0`} />
                                </Tab.Pane>
                                <Tab.Pane eventKey="proof" id='proof'>
                                    <iframe className='rounded' title={incidentview.proof} src={`https://drive.google.com/file/d/${incidentview.proof}/preview`} width="100%" height={500} allow="autoplay"></iframe>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={() => setIncidentview(null)} className='btn btn-sm btn-outline-warning'>Dismiss</button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Shareholder ID Modal */}
            <Modal show={!!shareholderID} onHide={() => setShareholderID(null)}>
                <Modal.Header closeButton>
                    <h3>{shareholderID?.name || '--'}</h3>
                </Modal.Header>
                <Modal.Body>
                    <iframe 
                        title={shareholderID?.name || '--'} 
                        src={`https://drive.google.com/file/d/${shareholderID?.nationalID || ''}/preview`} 
                        width="100%" 
                        height="600" 
                        allow="autoplay"
                    />
                </Modal.Body>
            </Modal>

            <div className="row page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">
                        <Link to="/overview">{t('Dashboard')}</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/exports">{t('Exports')}</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="">{company?.name || 'Company Details'}</Link>
                    </li>
                </ol>
            </div>

            <div className="row">
                <Tab.Container defaultActiveKey="basic" onSelect={(key) => {
                    if (key === 'incidents') {
                        fetchIncidents();
                    }
                }}>
                    <div className='col-xl-12'>
                        <div className="card">
                            <div className="card-body px-4 py-3 py-md-2">
                                <div className="row align-items-center">
                                    <div className="col-sm-12 col-md-7">
                                        <Nav as="ul" className="nav nav-pills review-tab" role="tablist">
                                            <Nav.Item as="li">
                                                <Nav.Link className="nav-link px-2 px-lg-3" eventKey="basic">
                                                    {t('BasicInfo')}
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li">
                                                <Nav.Link className="nav-link px-2 px-lg-3" eventKey="documents">
                                                    {t('Documents')} <span className='badge badge-primary'>{documents.length}</span>
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li">
                                                <Nav.Link className="nav-link px-2 px-lg-3" eventKey="shareholders">
                                                    {t('Shareholders')}
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li">
                                                <Nav.Link className="nav-link px-2 px-lg-3" eventKey="owners">
                                                    {t('BeneficialOwners')}
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li">
                                                <Nav.Link className="nav-link px-2 px-lg-3" eventKey="incidents">
                                                    {t('Incidents')}
                                                </Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </div>
                                </div> 
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-12 col-xxl-12">
                        <Tab.Content>
                            <Tab.Pane eventKey="basic">
                                {loadingStates.basic ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className='card'>
                                        <div className='card-body'>
                                            <h4 className="text-primary mb-2">{t('CompanyName')}</h4>
                                            <p className="text-black">{company?.name || '--'}</p>
                                            
                                            <h4 className="text-primary mb-2 mt-4">{t('CompanyAddress')}</h4>
                                            <p className="text-black">{company?.address || '--'}</p>
                                            
                                            <h4 className="text-primary mb-2 mt-4">{t('CompanyCountry')}</h4>
                                            <p className="text-black">{company?.country || '--'}</p>
                                            
                                            <h4 className="text-primary mb-2 mt-4">{t('CompanyNumber')}</h4>
                                            <p className="text-black">{company?.number || '--'}</p>
                                            
                                            <h4 className="text-primary mb-2 mt-4">{t('CompanyType')}</h4>
                                            <p className="text-black">{company?.type || '--'}</p>
                                        </div>
                                    </div>
                                )}
                            </Tab.Pane>

                            <Tab.Pane eventKey="documents">
                                {loadingStates.documents ? (
                                    <LoadingSpinner />
                                ) : (
                                    <ComplianceTable documents={documents} language={language} user={user} onDocumentUpdate={handleDocumentUpdate} />
                                )}
                            </Tab.Pane>

                            <Tab.Pane eventKey="shareholders">
                                {loadingStates.shareholders ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="row">
                                        {shareholders.length === 0 ? (
                                            <div className='col-12'>
                                                <div className='card'>
                                                    <div className='card-body text-center'>
                                                        <p>{t('NoShare')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            shareholders.map((shareholder, i) => 
                                                renderPersonCard(shareholder, 'sh', i)
                                            )
                                        )}
                                    </div>
                                )}
                            </Tab.Pane>

                            <Tab.Pane eventKey="owners">
                                {loadingStates.beneficialOwners ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="row">
                                        {beneficialOwners.length === 0 ? (
                                            <div className='col-12'>
                                                <div className='card'>
                                                    <div className='card-body text-center'>
                                                        <p>{t('Nobeneficial')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            beneficialOwners.map((owner, i) => 
                                                renderPersonCard(owner, 'own', i)
                                            )
                                        )}
                                    </div>
                                )}
                            </Tab.Pane>

                            <Tab.Pane eventKey="incidents" id='incidents'>
                                {loadingStates.incidents ? <LoadingSpinner /> : (
                                    <>
                                        {/* Bulk action toolbar */}
                                        {selectedIncidents.size > 0 && (
                                            <div className="card mb-3">
                                                <div className="card-body py-2">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span className="me-3 text-muted fw-bold">
                                                                {selectedIncidents.size} incident(s) selected
                                                            </span>
                                                            <button 
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={selectAllIncidents}
                                                            >
                                                                {selectedIncidents.size === incidents.length ? 'Deselect All' : 'Select All'}
                                                            </button>
                                                        </div>
                                                        <div>
                                                            <button 
                                                                className="btn btn-sm btn-success me-2"
                                                                onClick={() => showConfirmDialog('bulkApprove')}
                                                            >
                                                                Approve Selected ({selectedIncidents.size})
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => showConfirmDialog('bulkDisapprove')}
                                                            >
                                                                Disapprove Selected ({selectedIncidents.size})
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="card-body pt-0 p-0" style={{ maxHeight: 700, overflow: 'auto' }}>
                                            {incidents.length === 0 ? (
                                                <div className='card'>
                                                    <div className='card-body'>
                                                        <h5 className="mt-0 mb-0">{t("Noincidents") || "No incidents"}</h5>
                                                        <p className="fs-12 font-w200">{t("Therearenoincidents") || "There are no incidents"}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                incidents.map(incident => (
                                                    <div 
                                                        onClick={() => setIncidentview(incident)} 
                                                        className={`media align-items-center border-bottom p-md-4 p-3 cursor-pointer ${selectedIncidents.has(incident.id) ? 'bg-light' : ''}`}
                                                        key={incident.id}
                                                    >
                                                        {user.type === 'investor' && user.email === "info@minexx.co" && (
                                                            <div className="form-check me-3">
                                                                <input 
                                                                    className="form-check-input" 
                                                                    type="checkbox" 
                                                                    checked={selectedIncidents.has(incident.id)}
                                                                    onChange={(e) => toggleIncidentSelection(incident.id, e)}
                                                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                                />
                                                            </div>
                                                        )}
                                                        
                                                        <div className="media-body col-sm-6 col-6 col-xxl-5 px-0 me-4">
                                                            <h5 className="mt-0 mb-0">
                                                                <Link to={""} className="fs-18 font-w400 text-ov">
                                                                    {incident.description ? incident.description : `No incident description specified.`}
                                                                </Link>
                                                            </h5>
                                                            <p className="fs-12 font-w200">{incident.detailedDescription}</p>
                                                        </div>
                                                        
                                                        <div className="media-footer ms-auto col-2 px-0 d-flex align-self-center align-items-center">
                                                            <div className="text-center">
                                                                <span className="text-primary d-block fs-20">{incident.score}</span>
                                                                <span className="fs-14">Incident Score</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="me-3">
                                                            <p className={`mb-0 ${incident.level === 'low' ? 'text-primary' : incident.level === 'medium' ? 'text-warning' : incident.level === 'high' ? 'text-danger' : 'text-warning'}`}>
                                                                Level: {incident.level}
                                                            </p>
                                                            <span className="mt-0 font-w200">{incident.date.substring(0, 10)}</span>
                                                        </div>
                                                        
                                                        <div className="chart-point mt-4 text-center">
                                                            <div className="fs-13 col px-0 text-black">
                                                                {incident.level === 'low' ? (
                                                                    <span className="b mx-auto"></span>
                                                                ) : incident.level === 'medium' ? (
                                                                    <span className="c mx-auto"></span>
                                                                ) : incident.level === 'high' ? (
                                                                    <span className="d mx-auto"></span>
                                                                ) : (
                                                                    <span className="b mx-auto"></span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Action buttons or approved status */}
                                                        {user.type === 'investor' && user.email === "info@minexx.co" && (
                                                            <div className="ms-3 d-flex gap-2">
                                                                {incident.Status === 'Approved' ? (
                                                                    <span className='badge bg-success fs-14 px-3 py-2'>Approved</span>
                                                                ) : (
                                                                    <>
                                                                        <button 
                                                                            className='btn btn-sm btn-success' 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                showConfirmDialog('approve', incident.id);
                                                                            }}
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button 
                                                                            className='btn btn-sm btn-danger' 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                showConfirmDialog('disapprove', incident.id);
                                                                            }}
                                                                        >
                                                                            Disapprove
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </Tab.Container>
            </div>
        </>
    );
};

export default Company;