import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Accordion, ListGroup, Nav, Tab } from 'react-bootstrap';
import { baseURL_ } from '../../../config'
import { toast } from 'react-toastify';
import { ThemeContext } from '../../../context/ThemeContext';
import { Logout } from '../../../store/actions/AuthActions';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../../services/AxiosInstance';
import { Turtle, CheckCircle, X, XCircle } from 'lucide-react';
import { translations } from '../Events/Exporttranslation';

// Updated DocumentsList component with document availability checking
const DocumentsList = ({ documents, dashboard, exportId, language, country,user }) => {
    // Individual loading states for each document
    const [documentLoading, setDocumentLoading] = useState({});
    // Store file IDs separately, only fetch when needed
    const [fileIds, setFileIds] = useState({});
    // Store available documents information
    const [availableDocuments, setAvailableDocuments] = useState([]);
    // Loading state for initial available documents fetch
    const [loadingAvailability, setLoadingAvailability] = useState(true);
    
    const t = (key) => {
      if (!translations[language]) {
        console.warn(`Translation for language "${language}" not found`);
        return key;
      }
      return translations[language][key] || key;
    };
  
    // Create a normalized country value at component level
    const normalizedCountry = React.useMemo(() => {
      let result = country.trim();
      
      if (result.toLowerCase() === 'rwanda') {
          return '.Rwanda';
      } else {
          return result.replace(/^\.+|\.+$/g, '');
      }
    }, [country]);
  
    // Map field names based on document index
    const getFieldName = (index) => {
      // This should match your uploads array mapping in the main component
      if (dashboard === '3ts' && country === 'Libya') {
        const fieldNames = [
          'invoice',
          'loadingPermission',
          'assayReport',
          'loadingCertificate',
          'slopCertificate',
          'ullageReport',
          'obqReport',
          'bunkerReport',
          'bol',
          'cargoManifest',
          'certificateOfOrigin',
          'veritas'
        ];
        return fieldNames[index] || null;
      } else if (dashboard === '3ts') {
        const fieldNames = [
          'provisionalInvoice',
          'cargoReceipt',
          'exporterApplicationDocument',
          'scannedExportDocuments',
          'asiDocument',
          'packingReport',
          'rraExportDocument',
          'rmbExportDocument',
          'otherDocument',
          'warehouseCert',
          'insuranceCert',
          'billOfLanding',
          'c2',
          'mineSheets',
          'processingSheets',
          'customsDeclaration',
          'tagList',           
          'transporterDocument'
        ];
        return fieldNames[index] || null;
      } else {
        const fieldNames = [
          'provisionalInvoice',
          'packingReport',
          'note',
          'scannedExportDocuments',
          'otherDocument',
          'customsDeclaration',
          'exporterApplicationDocument',
        ];
        return fieldNames[index] || null;
      }
    };
    const getDocumentInfo = (fieldName) => {
  const dbFieldName = getDbFieldName(fieldName);
  return availableDocuments.find(doc => 
    doc.fieldName === fieldName || 
    doc.fieldName === dbFieldName || 
    doc.dbFieldName === fieldName || 
    doc.dbFieldName === dbFieldName
  );
};
    
    // Map field names to dbFieldNames for better matching with available documents
    const getDbFieldName = (fieldName) => {
      if (country === 'Libya' && dashboard === '3ts') {
        const mappings = {
          'invoice': 'Invoice',
          'loadingPermission': 'Loading Permission',
          'assayReport': 'Assay Report from Refinery',
          'loadingCertificate': 'Loading Certificate',
          'slopCertificate': 'Slop Certificate',
          'ullageReport': 'Ullage Report',
          'obqReport': 'OBQ Report',
          'bunkerReport': 'Bunker inspection Report',
          'bol': 'BOL',
          'cargoManifest': 'Cargo Manifest',
          'certificateOfOrigin': 'Certificate of Origin',
          'veritas': 'Testing report from Veritas'
        };
        return mappings[fieldName] || fieldName;
      } else {
        const mappings = {
          'provisionalInvoice': 'ProvisionalInvoice',
          'cargoReceipt': 'CargoReceipt',
          'exporterApplicationDocument': 'ExporterApplicationDocument',
          'scannedExportDocuments': 'ScannedExportDocuments',
          'asiDocument': 'AsiDocument',
          'packingReport': 'PackingReport',
          'rraExportDocument': 'RraExportDocument',
          'rmbExportDocument': 'RmbExportDocument',
          'otherDocument': 'OtherDocument',
          'warehouseCert': 'WarehouseCert',
          'insuranceCert': 'InsuranceCert',
          'billOfLanding': 'BillOfLanding',
          'c2': 'C2',
          'mineSheets': 'MineSheets',
          'processingSheets': 'ProcessingSheets',
          'customsDeclaration': 'CustomsDeclaration',
          'tagList': 'TagList',
          'transporterDocument': 'TransporterDocument',
          'note': 'Note'
        };
        return mappings[fieldName] || fieldName;
      }
    };
  
    // Fetch available documents when component mounts
    useEffect(() => {
      const fetchAvailableDocuments = async () => {
        setLoadingAvailability(true);
        try {
          console.log(`Fetching available documents for export ID ${exportId}`);
          const response = await axiosInstance.get(`/exports/available/${exportId}`, {
            params: { 
              country: normalizedCountry
            }
          });
          
          if (response.data.success && response.data.document && response.data.document.availableDocuments) {
            console.log('Available documents:', response.data.document.availableDocuments);
            setAvailableDocuments(response.data.document.availableDocuments);
            
            // Create a map of all field names we use in our component
            const allFieldNames = Array.from({ length: documents.length }, (_, i) => getFieldName(i));
            const initialFileIds = {};
            
            // For each field name we care about, check if it exists in the available documents
            allFieldNames.forEach(fieldName => {
              if (!fieldName) return;
              
              const dbFieldName = getDbFieldName(fieldName);
              const docExists = response.data.document.availableDocuments.some(doc => 
                doc.fieldName === fieldName || 
                doc.fieldName === dbFieldName || 
                doc.dbFieldName === fieldName || 
                doc.dbFieldName === dbFieldName
              );
              
              // Set as undefined if exists (to be fetched later) or null if doesn't exist
              initialFileIds[fieldName] = docExists ? undefined : null;
            });
            
            console.log('Initial document availability map:', initialFileIds);
            setFileIds(initialFileIds);
          } else {
            console.warn('No available documents found or unexpected response format:', response.data);
          }
        } catch (error) {
          console.error('Error fetching available documents:', error);
          console.log(error.response?.data?.message || `${t("ErrorFetchingDocuments")}`);
        } finally {
          setLoadingAvailability(false);
        }
      };
      
      if (exportId) {
        fetchAvailableDocuments();
      }
    }, [exportId, normalizedCountry, documents]);
  
    // Check if a document exists in the available documents list
    const isDocumentAvailable = (fieldName) => {
      // First check if we've directly set it in fileIds already
      if (fileIds[fieldName] !== undefined) {
        return fileIds[fieldName] !== null;
      }
      
      // Otherwise check in the availableDocuments list
      return availableDocuments.some(doc => 
        doc.fieldName === fieldName || doc.dbFieldName === fieldName
      );
    };
  
    // Get file ID for a document - always use /exportsfield endpoint
    const getFileId = async (index, fieldName) => {
      console.log(`getFileId called for index ${index}, fieldName ${fieldName}, exportId ${exportId},`);
      
      // If we already have the file ID from a previous call, use it
      if (fileIds[fieldName] && fileIds[fieldName] !== undefined) {
        console.log(`Using cached fileId for ${fieldName}: ${fileIds[fieldName]}`);
        return fileIds[fieldName];
      }
      
      // If document doesn't exist according to availability check, don't fetch
      if (fileIds[fieldName] === null) {
        console.log(`Document ${fieldName} already known to not exist`);
        return null;
      }
      
      // If document availability is unknown or we know it exists but need the ID,
      // make the API call to /exportsfield to get the actual file ID
      
      // If not found in available documents, need to fetch from API
      setDocumentLoading(prev => ({
        ...prev,
        [index]: true
      }));
      
      try {
        console.log(`Making API request to: /exportsfield/${exportId}`);
        const response = await axiosInstance.get(`/exportsfield/${exportId}`, {
          params: { 
            field: fieldName,
            country: normalizedCountry
          }
        });
        
        console.log(`API response received:`, response.data);
        
        if (response.data.success && response.data.export && 
            response.data.export.fileId) {
          
          const fileContent = response.data.export.fileContent;
          console.log(`File content found: ${fileContent}`);
          
          setFileIds(prev => ({
            ...prev,
            [fieldName]: fileContent
          }));
          
          return fileContent;
        } else {
          console.warn(`Document not found for ${fieldName}:`, response.data);
          console.log(`${t("DocumentNotFound")}: ${documents[index]}`);
          
          setFileIds(prev => ({
            ...prev,
            [fieldName]: null
          }));
          
          return null;
        }
      } catch (error) {
        console.error('Error fetching file ID:', error);
        
        console.log(error.response?.data?.message || `${t("ErrorFetchingDocument")}`);
        
        setFileIds(prev => ({
          ...prev,
          [fieldName]: null
        }));
        
        return null;
      } finally {
        setDocumentLoading(prev => ({
          ...prev,
          [index]: false
        }));
      }
    };
    //handle Approve Document
 const handleApprove = async (fieldName, index) => {
  setDocumentLoading(prev => ({
    ...prev,
    [index]: true
  }));
  
  try {
    const response = await axiosInstance.post(
      `approve/exportfield/${exportId}?field=${fieldName}`,
      {}
    );
    toast.success("Document approved successfully");
    
    // Force a full page reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.log(error.response?.data?.message || "Something went wrong");
    console.error(`Error approving document for ${fieldName}:`, error);
    
    setDocumentLoading(prev => ({
      ...prev,
      [index]: false
    }));
  }
};

const handleDisapprove = async (fieldName, index) => {
  setDocumentLoading(prev => ({
    ...prev,
    [index]: true
  }));
  
  try {
    await axiosInstance.post(
      `disapprove/exportfield/${exportId}?field=${fieldName}&country=${normalizedCountry}` // ← removed baseURL_
    );
    toast.success("Document disapproved successfully");
    setTimeout(() => window.location.reload(), 1000);
  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
    console.error(`Error disapproving document for ${fieldName}:`, error);
    setDocumentLoading(prev => ({ ...prev, [index]: false }));
  }
};
    // Handle view document action
    const handleViewDocument = async (index) => {
      const fieldName = getFieldName(index);
      if (!fieldName) return;
      
      try {
        const fileId = await getFileId(index, fieldName);
        
        if (fileId) {
          window.open(`https://drive.google.com/file/d/${fileId}/preview`, '_blank');
        }
      } catch (error) {
        console.error(`Error in handleViewDocument for ${fieldName}:`, error);
      }
    };
    
    // Handle download document action
    const handleDownloadDocument = async (index) => {
      const fieldName = getFieldName(index);
      if (!fieldName) return;
      
      const fileId = await getFileId(index, fieldName);
      if (fileId) {
        window.open(`https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0`, '_blank');
      }
    };
  
    if (loadingAvailability) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">{t("CheckingDocumentAvailability")}</p>
        </div>
      );
    }
  
    return (
      <ListGroup>
        {documents.map((document, index) => {
          const fieldName = getFieldName(index);
          const documentAvailable = isDocumentAvailable(fieldName);
           const documentInfo = getDocumentInfo(fieldName); // Get full document info
          
          return (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              <span className="accordion-body">
                {document}
                {fileIds[fieldName]  !== null && <CheckCircle color="green" size={24} className="ms-2" />}
                {fileIds[fieldName] === null && <XCircle color="red" size={24} className="ms-2" />}
              </span>
              <div className="mt-3 d-flex gap-2">
                {documentLoading[index] ? (
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  ) : documentAvailable ? (
              <>
                <button
                  className="btn btn-info"
                  onClick={() => handleViewDocument(index)}
                >
                  {t("View")}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDownloadDocument(index)}
                >
                  {t("Download")}
                </button>
                {user.type === "investor" && user.email === "info@minexx.co" && (
                  documentInfo?.status !== "Approved" ? (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleApprove(fieldName,index)}
                      >
                        {t("Approve")}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDisapprove(fieldName,index)}
                      >
                        {t("Disapprove")}
                      </button>
                    </>
                  ) : (
                    <span className="badge bg-success">{t("Approved")}</span>
                  )
                )}
              </>
            ) : (
              <button
                className="btn btn-danger"
                disabled
              >
                {t("Missing")}
              </button>
            )}
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    );
  };

// Main Export component
const Export = ({ country, language }) => { 
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { changeTitle } = useContext(ThemeContext)
    const access = localStorage.getItem(`_dash`) || '3ts'
    const [ export_ , setexport_] = useState()
    const [loading, setLoading] = useState(true);
    const [document, setdocument] = useState(0)
    const user = JSON.parse(localStorage.getItem(`_authUsr`))
    
    const t = (key) => {
        if (!translations[language]) {
          console.warn(`Translation for language "${language}" not found`);
          return key;
        }
        return translations[language][key] || key;
    };

    // Move normalizedCountry calculation to component level using useMemo
    const normalizedCountry = React.useMemo(() => {
        let result = country.trim();
        
        if (result.toLowerCase() === 'rwanda') {
            return '.Rwanda';
        } else {
            return result.replace(/^\.+|\.+$/g, '');
        }
    }, [country]);

    const documents = access === "3ts" ? (
      country === "Libya" ? [
        t("Invoice"),
        t("LoadingPermission"),
        t("AssayReportFromRefinery"),
        t("LoadingCertificate"),
        t("SlopCertificate"),
        t("UllageReport"),
        t("OBQReport"),
        t("BunkerInspectionReport"),
        t("BillOfLading"),
        t("CargoManifest"),
        t("CertificateOfOrigin"),
        t("TestingReportFromVeritas")
      ] : [
        t("ProvisionalInvoice"),
        t("FreightForwarderCargoReceipt"),
        t("OtherExporterDocuments"),
        t("OtherScannedExporterDocuments"),
        t("AlexStewartCertificateOfAssay"),
        t("AlexStewartPackingReport"),
        t("CertificateOfOrigin"),
        t("ICGLRCertificate"),
        t("InlandTransportation"),
        t("OriginalWarehouseCertificate"),
        t("CertificateOfInsurance"),
        t("BillOfLading"),
        country === "DRC" ? t("C1Form") : t("C2Form"),
        t("MineSheets"),
        t("ProcessingSheets"),
      (country !== "DRC" ?  t("RRACustomsDeclaration") : t("DGDACustomsDeclaration")),
        t("TagList"),
        t("OtherTransporterDocument"),
      ]
    ) : [
      t("ExporterInvoice"),
      t("PackingList"),
      t("NonNarcoticsNote"),
      t("EssayReport"),
      t("ProofOfPayment"),
      t("CopyOfCustomsDeclaration"),
      t("ExportApproval")
    ];
    
    let eid = null;
    
    const getExport = async () => {
        if (eid == null) {
           // toast.info("Getting Export details...")
        }
        eid = id;
        
        try {
            const response = await axiosInstance.get(`exports/${id}`,
                {
                    params:
                    {
                        country: normalizedCountry
                    }
                });
            setexport_(response.data.export);
            changeTitle(`Shipment: ${response.data.export?.exportationID || "--"}`);
        } catch (err) {
            try {
                if (err.response.code === 403) {
                    dispatch(Logout(navigate));
                } else {
                    console.log(err.response.message);
                }
            } catch (e) {
                console.log(err.message);
            }
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        getExport();
    }, [id, country, language, normalizedCountry]);

    const handleDocumentChange = (index) => {
        setdocument(index);
    };

    return (
        <div>
            <div className="row page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><Link to={"#"}> {t('Dashboard')}</Link></li>
                    <li className="breadcrumb-item"><Link to={`/exports`}> {t('Exports')}</Link></li>
                    <li className="breadcrumb-item"><Link to={""}> Shipment: {export_?.shipmentNumber || 'Export ID MISSING'}</Link></li>
                </ol>
            </div>
            {loading ? (
                <div className="row">
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
            <div className="row">
                <Tab.Container defaultActiveKey="basic">
                    <div className='colxl-12'>
                        <div className="card">
                            <div className="card-body px-4 py-3 py-md-2">
                                <div className="row align-items-center">
                                    <div className="col-sm-12 col-md-7">
                                        <Nav as="ul" className="nav nav-pills review-tab" role="tablist">
                                            <Nav.Item as="li" className="nav-item">
                                                <Nav.Link className="nav-link  px-2 px-lg-3"  to="#basic" role="tab" eventKey="basic">
                                                {t('ShipmentDetails')}
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li" className="nav-item">
                                                <Nav.Link className="nav-link px-2 px-lg-3" to="#documents" role="tab" eventKey="documents">
                                                    {t("Documents")}
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
                            <Tab.Pane eventKey="basic" id='basic'>
                                <div className='card'>
                                    <div className='card-body'>
                                        <Accordion className="accordion accordion-primary" defaultActiveKey="exportation">
                                            <Accordion.Item className="accordion-item" key="exportation" eventKey="exportation">
                                                <Accordion.Header className="accordion-header rounded-lg">
                                                {t("ExportationDetails")}
                                                </Accordion.Header>
                                                <Accordion.Collapse eventKey={`exportation`}>
                                                    <div className="accordion-body">
                                                        <div className='row'>
                                                            <div className='col-lg-6'>
                                                                <img src={export_?.picture ? `https://lh3.googleusercontent.com/d/${export_?.picture}=w2160?authuser=0` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx4xrkRCeiKCPwkflbkXd11W_2fzx34RemdWXmv8TXYWLT2SGtLfkqFCyBb_CBoNcNVBc&usqp=CAU'} alt='' width={'100%'} height={600} style={{ objectFit: 'cover' }} className='rounded'/>
                                                            </div>
                                                            <div className='col-lg-6'>
                                                                { export_?.exportationID ?
                                                                    <>
                                                                        <h4 className="text-primary mb-2 mt-4">{t("ExportationID")}</h4>
                                                                        <Link className="text-black">{export_?.exportationID || `--`}</Link>
                                                                    </>
                                                                : <></> }

                                                                { export_?.date ?
                                                                    <>
                                                                        <h4 className="text-primary mb-2 mt-4">{t("ExportationDate")}</h4>
                                                                        <Link className="text-black">
                                                                        {export_?.date
                                                                          ? (typeof export_.date.toDate === 'function'
                                                                              ? export_.date.toDate().toLocaleDateString()
                                                                              : export_.date)
                                                                          : '--'}
                                                                      </Link>
                                                                    </>
                                                                : <></> }
                                                            
                                                                { export_?.mineral ?
                                                                    <>
                                                                        <h4 className="text-primary mb-2 mt-4">{t("MineralType")}</h4>
                                                                        <Link className="text-black">{export_?.mineral || `--`}</Link>
                                                                    </>
                                                                : <></> }
                                                                
                                                                { export_?.grade ?
                                                                    <>
                                                                        <h4 className="text-primary mb-2 mt-4">{t("Grade")}</h4>
                                                                        <Link className="text-black">{export_?.grade || `--`}</Link>
                                                                    </>
                                                                : <></> }
                                                                
                                                                { export_?.netWeight ?
                                                                    <>
                                                                        <h4 className="text-primary mb-2 mt-4">{t("NetWeight")}</h4>
                                                                        <Link className="text-black">{access === '3ts' ? export_?.netWeight : (export_?.netWeight/1000).toFixed(2) || `--`} kg</Link>
                                                                    </>
                                                                : <></> }
                                                                
                                                                { export_?.grossWeight ?
                                                                    <>
                                                                        <h4 className="text-primary mb-2 mt-4">{t("GrossWeight")}</h4>
                                                                        <Link className="text-black">{export_?.grossWeight || `--`} kg</Link>
                                                                    </>
                                                                : <></> }
                                                                
                                                                { export_?.tags ?
                                                                    <>
                                                                        <h4 className="text-primary mb-2 mt-4">{t("NumberOfTags")}</h4>
                                                                        <Link className="text-black">{export_?.tags || 0}</Link>
                                                                    </>
                                                                : <></> }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Accordion.Collapse>
                                            </Accordion.Item>
                                            { export_?.link ? <Accordion.Item className="accordion-item" key="transport" eventKey="shipment">
                                                <Accordion.Header className="accordion-header rounded-lg">
                                                {t("ShipmentTracking")}
                                                </Accordion.Header>
                                                <Accordion.Collapse eventKey={`shipment`}>
                                                    <div className="accordion-body"><a target="_blank" href={`${export_?.link}`} className='text-primary' rel="noreferrer">Click here to Track the Shipment</a></div>
                                                </Accordion.Collapse>
                                            </Accordion.Item> : null }
                                            
                                            <Accordion.Item className="accordion-item" key="transport" eventKey="transport">
                                                <Accordion.Header className="accordion-header rounded-lg">
                                                {t("TransportDetails")}
                                                </Accordion.Header>
                                                <Accordion.Collapse eventKey={`transport`}>
                                                    <div className="accordion-body">
                                                        { export_?.destination ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">{t("Destination")}</h4>
                                                                <Link className="text-black">{export_?.destination || `--`}</Link>
                                                            </>
                                                        : <></> }
                                                    
                                                        { export_?.itinerary ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">{t("Itinerary")}</h4>
                                                                <Link className="text-black">{export_?.itinerary || `--`}</Link>
                                                            </>
                                                        : <></> }
                                                        
                                                        { export_?.shipmentNumber ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">{t("ShipmentNumber")}</h4>
                                                                <Link className="text-black">{export_?.shipmentNumber || `--`}</Link>
                                                            </>
                                                        : <></> }
                                                        
                                                        { export_?.exportCert ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">Export Certificate Number</h4>
                                                                <Link className="text-black">{export_?.exportCert || `--`}</Link>
                                                            </>
                                                        : <></> }
                                                                
                                                        { export_?.rraCert ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">RRA certificate Number</h4>
                                                                <Link className="text-black">{export_?.rraCert || `N/A`}</Link>
                                                            </>
                                                        : <></> }
                                                        
                                                        { export_?.transporter ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">{t("Transporter")}</h4>
                                                                <Link className="text-black">{export_?.transporter || `--`}</Link>
                                                            </>
                                                        : <></> }
                                                        
                                                        { export_?.driverID ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">Driver ID Number</h4>
                                                                <Link className="text-black">{export_?.driverID || `Missing`}</Link>
                                                            </>
                                                        : <></> }
                                                        
                                                        { export_?.truckFrontPlate ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">{t("TruckFrontPlate")}</h4>
                                                                <Link className="text-black">{export_?.truckFrontPlate || `--`}</Link>
                                                            </>
                                                        : <></> }
                                                        
                                                        { export_?.truckBackPlate ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">{t("TruckBackPlate")}</h4>
                                                                <Link className="text-black">{export_?.truckBackPlate || `--`}</Link>
                                                            </>
                                                        : <></> }
                                                    </div>
                                                </Accordion.Collapse>
                                            </Accordion.Item>
                                            <Accordion.Item className="accordion-item" key="representatives" eventKey="representatives">
                                                <Accordion.Header className="accordion-header rounded-lg">
                                                {t("RepresentativesDetails")}
                                                </Accordion.Header>
                                                <Accordion.Collapse eventKey={`representatives`}>
                                                    <div className="accordion-body">
                                                        { export_?.rmbRep ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">{t("RMBRepresentative")}</h4>
                                                                <Link className="text-black">{export_?.rmbRep || `--`}</Link>
                                                            </>
                                                        : <></> }

                                                        { export_?.exportRep ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">{t("ExporterRepresentative")}</h4>
                                                                <Link className="text-black">{export_?.exportRep || `--`}</Link>
                                                            </>
                                                        : <></> }

                                                        { export_?.traceabilityAgent ?
                                                            <>
                                                                <h4 className="text-primary mb-2 mt-4">{t("TraceabilityAgent")}</h4>
                                                                <Link className="text-black">{export_?.traceabilityAgent || `--`}</Link>
                                                            </>
                                                        : <></> }
                                                    </div>
                                                </Accordion.Collapse>
                                            </Accordion.Item>
                                        </Accordion>
                                    </div>
                                </div>
                            </Tab.Pane>
                            
                            <Tab.Pane eventKey="documents" id='documents'>
                                <div className="card">
                                    <div className="card-body">
                                        {loading ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h4 className="mb-4">{t("Documents")}</h4>
                                                <DocumentsList 
                                                    documents={documents} 
                                                    dashboard={access} 
                                                    user={user}
                                                    exportId={id} 
                                                    language={language}
                                                    country={country}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Tab.Pane>
                            
                           
                        </Tab.Content>
                    </div>
                </Tab.Container>
            </div>
            )}
        </div>
    );
};

export default Export;
