import React, { useState, useEffect } from 'react';
import { Tab, Nav, ListGroup, ProgressBar, Container, Row, Col, Modal, Dropdown } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Turtle, CheckCircle, X, XCircle, Upload, LogOut, ChevronDown, User } from 'lucide-react';
import { baseURL_ } from '../../config';



const KycUpload = ({ language }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [progress, setProgress] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [companyDocs, setCompanyDocs] = useState([]);
  const [missDocs, setMissDocs] = useState([]);
  const [shareholder, setShareholder] = useState([]);
  const [beneficial, setBeneficial] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Loading states
  const [basicLoading, setBasicLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [shareholderLoading, setShareholderLoading] = useState(true);
  const [BeneficialLoading, setBeneficialLoading] = useState(true);
  
  // File upload dialog state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const platform = localStorage.getItem('_dash') || '3ts';

  useEffect(() => {
    if (id) {
      fetchCompanyData(id);
    }
  }, [id, language]);

  const fetchCompanyData = async (id) => {
    try {
      setBasicLoading(true);
      setDocsLoading(true);
      setShareholderLoading(true);
      setBeneficialLoading(true);
      
      // Fetch company info
      const companyResponse = await fetch(
        `${baseURL_}kyc/login/${id}`,
        {
          method: 'GET',
        }
      );
      if (!companyResponse.ok) {
        throw new Error('Network response was not ok for company details');
      }
      const companyData = await companyResponse.json();
      setCompany(companyData.company.name);
      console.log("Name of Company", companyData.company.name);
      setBasicLoading(false);
      console.log("Company Data", companyData);

      // Fetch documents
      const companyDocResponse = await fetch(
        `${baseURL_}documentsnoAuth/${id}`,
        {
          method: 'GET',
          headers: {
            'x-platform': platform
          }
        }
      );
      if (!companyDocResponse.ok) {
        throw new Error('Network response was not ok for documents');
      }
      const companyDocData = await companyDocResponse.json();
      const { documents, progress, totalDocuments, missingDocuments } = companyDocData.documents;
      setCompanyDocs(documents);
      setProgress(progress);
      setMissDocs(missingDocuments);
      setTotalDocuments(totalDocuments);
      setDocsLoading(false);
      console.log("Missing Documents", missingDocuments);
      console.log("Company Document Data", companyDocData);
    } catch (err) {
      console.error('Error fetching company data:', err);
      setBasicLoading(false);
      setDocsLoading(false);
      setShareholderLoading(false);
      setBeneficialLoading(false);
      toast.error('Failed to load company data. Please try again.');
    }
  };

  // Handle opening the upload modal
  const handleUploadClick = (documentType) => {
    setCurrentDocumentType(documentType);
    setShowUploadModal(true);
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const fileType = file.type;
    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(fileType)) {
      toast.error('Only PNG, JPG and PDF files are allowed');
      return;
    }

    // Check file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Handle the file upload to the server
    try {
      // Show upload in progress
      setUploadingFile(true);
      toast.info(`Uploading ${currentDocumentType}...`);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', currentDocumentType);

      // Send the file to the server
      const response = await fetch(`https://upload-p7n5ing2cq-uc.a.run.app/?companyId=${id}`, {
        method: 'POST',
        headers: {
          'x-platform': platform
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const responseData = await response.json();
      
      // Close the modal
      setShowUploadModal(false);
      setUploadingFile(false);
      
      // Show success message
      toast.success(`${currentDocumentType} uploaded successfully`);
      
      // Re-fetch documents after successful upload
      if (id) {
        fetchCompanyData(id);
      }
    } catch (error) {
      console.error('Error uploading file:', error.message);
      setUploadingFile(false);
      toast.error(error.message || 'Failed to upload file');
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear any stored tokens or user data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('_dash');
    // Add any other items you want to clear
    
    // Redirect to login page
    navigate('/login');
  };

  const LoadingSpinner = () => (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="row">
      {/* Improved header with page title and company dropdown */}
      <div className="row page-titles mt-4 mb-3 w-100">
        <div className="col-lg-8 col-md-7 col-sm-6">
          <div className="d-flex align-items-center">
            <h3 className="text-primary mb-0">
              {company && `${company} - `}
              <span className="text-dark">KYC Documents</span>
            </h3>
          </div>
        </div>
        <div className="col-lg-4 col-md-5 col-sm-6 d-flex justify-content-end align-items-center">
          {company && (
            <Dropdown>
              <Dropdown.Toggle 
                variant="light"
                id="dropdown-company" 
                className="d-flex align-items-center bg-transparent border-0"
              >
                <div className="d-flex align-items-center">
                  <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center me-2" style={{ width: '40px', height: '40px' }}>
                    <User size={20} color="white" />
                  </div>
                  <div className="me-2 d-none d-md-block">
                    <h5 className="mb-0 text-truncate" style={{ maxWidth: '150px' }}>{company}</h5>
                  </div>
                  <ChevronDown size={16} />
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center">
                  <LogOut size={18} className="me-2" /> 
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>
   
      <Tab.Container defaultActiveKey="documents">
        <div className='col-xl-12'>
          <div className="card">
            <div className="card-body px-4 py-3 py-md-2">
              <div className="row align-items-center">
                <div className="col-sm-12 col-md-7">
                  <Nav as="ul" className="nav nav-pills review-tab" role="tablist">
                    <Nav.Item as="li" className="nav-item">
                      <Nav.Link className="nav-link px-2 px-lg-3" to="#documents" role="tab" eventKey="documents">
                        Documents
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
            <Tab.Pane eventKey="documents" id="documents">
              <div className="card">
                <div className="card-body">
                  {docsLoading ? (
                    <LoadingSpinner />
                  ) : companyDocs.length > 0 || missDocs.length > 0 ? (
                    <>
                      <Container fluid className="mt-3">
                        <Row className="align-items-center">
                          <Col xs="auto">
                            <div className="d-flex align-items-baseline">
                              <span style={{fontSize: '2.5rem'}} className="fw-bold">KYC Progress: </span>
                              <span style={{fontSize: '2.5rem'}} className="text-primary fw-bold"> {progress}</span>
                              <span style={{fontSize: '1.8rem'}} className="ms-1">%</span>
                            </div>
                          </Col>
                          <Col>
                            <ProgressBar 
                              now={progress} 
                              variant="primary" 
                              style={{ height: '1.5rem' }} 
                            />
                          </Col>
                        </Row>
                      </Container>

                      {/* Completed Documents Section */}
                      {companyDocs.length > 0 && (
                        <div className="mt-4">
                          <h4 className="mb-3">Completed Documents</h4>
                          <ListGroup>
                            {companyDocs.map((document, index) => (
                              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                <span className="accordion-body">
                                  {document.type} <CheckCircle color="green" size={24} />
                                </span>
                                <div className="mt-3 d-flex gap-2">
                                  <a
                                    target="_blank"
                                    className="btn btn-info"
                                    href={`https://drive.google.com/file/d/${document.file}/preview`}
                                    rel="noreferrer"
                                  >
                                    View
                                  </a>
                                  <a
                                    target="_blank"
                                    className="btn btn-primary"
                                    href={`https://drive.usercontent.google.com/download?id=${document.file}&export=download&authuser=0`}
                                    rel="noreferrer"
                                  >
                                    Download
                                  </a>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </div>
                      )}

                      {/* Missing Documents Section */}
                      {missDocs.length > 0 && (
                        <div className="mt-4">
                          <h4 className="mb-3">Required Documents</h4>
                          <ListGroup>
                            {missDocs.map((document, index) => (
                              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                <span className="accordion-body">
                                  {document} <XCircle color="red" size={24} />
                                </span>
                                <div className="mt-3 d-flex gap-2">
                                  <button
                                    onClick={() => handleUploadClick(document)}
                                    className="btn btn-danger"
                                  >
                                    Upload
                                  </button>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-center fs-5 py-4">No documents found for this company.</p>
                  )}
                </div>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </div>
      </Tab.Container>
      
      {/* File Upload Modal Dialog */}
      <Modal 
        show={showUploadModal}
        onHide={() => !uploadingFile && setShowUploadModal(false)}
        centered
        size="lg"
        backdrop="static"
        keyboard={!uploadingFile}
        aria-labelledby="upload-modal"
        className="file-upload-modal"
      >
        <button
  className="btn btn-link position-absolute"
  style={{ top: '15px', right: '20px', zIndex: 10 }}
  onClick={() => !uploadingFile && setShowUploadModal(false)}
>
  <X color="white" size={24} />
</button>

        <Modal.Body className="p-4 text-center" style={{ backgroundColor: '#2c3038', color: 'white', borderRadius: '12px' }}>
          <div className="d-flex flex-column align-items-center justify-content-center">
            <div className="mb-4">
              <div className="upload-icon-container" style={{ backgroundColor: 'rgba(0, 194, 255, 0.2)', borderRadius: '12px', padding: '20px', width: '130px', height: '130px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#00C2FF', borderRadius: '8px', padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 20V4M12 4L18 10M12 4L6 10" stroke="#002138" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <h2 className="mb-3">Please choose the file you would like to upload</h2>
            <p className="text-info mb-4">Only PNG, PDF and JPG files with a max size of 2mb</p>
            
            {uploadingFile ? (
              <div className="py-3">
                <div className="spinner-border text-info" role="status">
                  <span className="visually-hidden">Uploading...</span>
                </div>
                <p className="mt-3">Uploading document, please wait...</p>
              </div>
            ) : (
              <div className="file-input-container">
                <label htmlFor="file-upload" className="btn btn-info btn-lg px-5" style={{ backgroundColor: '#00C2FF', borderColor: '#00C2FF' }}>
                  Browse
                </label>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="d-none" 
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileSelect}
                />
              </div>
            )}
            
            <div className="document-type-container mt-4 p-3 w-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
              <div className="text-center">
                {currentDocumentType}
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default KycUpload;