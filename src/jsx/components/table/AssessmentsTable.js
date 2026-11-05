import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { Link, useNavigate } from "react-router-dom";
import { Accordion, Modal } from "react-bootstrap";
import { toast } from 'react-toastify';
import { translations } from '../../pages/Locations/MinesTranslation';
import axiosInstance from "../../../services/AxiosInstance";
import { baseURL_ } from "../../../config";

const AssessmentsTable = ({ assessments, headers,language,user,id}) => {
  const [data, setData] = useState(
    document.querySelectorAll("#allreview tbody tr")
  );
  const navigate = useNavigate()
  localStorage.removeItem('assessment') 
  const sort = 6;
  const activePag = useRef(0);
  const midpoint = Math.ceil(headers.length / 2);
  const header1 = headers.slice(0, midpoint);
  const header2 = headers.slice(-midpoint);

  const midpoint1 = Math.ceil(header1.length / 2);
  const firstHalf = header1.slice(0, midpoint1);
  const secondHalf = header1.slice(-midpoint1);

  const midpoint2 = Math.ceil(header2.length / 2);
  const thirdHalf = header2.slice(0, midpoint2);
  const fourthHalf = header2.slice(-midpoint2);

  const [assessment, setassessment] = useState()
  const [test, settest] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  // Active data
  const chageData = (frist, sec) => {
    for (var i = 0; i < data.length; ++i) {
      if (i >= frist && i < sec) {
        data[i].classList.remove("d-none");
      } else {
        data[i].classList.add("d-none");
      }
    }
  };
  
  const t = (key) => {
    if (!translations[language]) {
      console.warn(`Translation for language "${language}" not found`);
      return key;
    }
    return translations[language][key] || key;
  };

  const openConfirmModal = (action, assessmentId) => {
    setConfirmAction(action);
    setSelectedAssessmentId(assessmentId);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (confirmAction === 'approve') {
      await handleApprove(selectedAssessmentId);
    } else if (confirmAction === 'disapprove') {
      await handledisapprove(selectedAssessmentId);
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setSelectedAssessmentId(null);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setSelectedAssessmentId(null);
  };

  const handleApprove = async(assessmentId) => {
    try {
      const response = await axiosInstance.post(`${baseURL_}assessments/mine/approve/${assessmentId}`);
      toast.success(response.data.message || 'Assessment approved successfully');
      // Optionally refresh assessments data here
    } catch (error) {
      console.log('Something wrong', error);
      toast.error('Failed to approve assessment');
    }
  };

  const handledisapprove = async(assessmentId) => {
    try {
      const response = await axiosInstance.delete(`${baseURL_}assessments/mine/disapprove/${assessmentId}`);
      toast.success(response.data.message || 'Assessment disapproved successfully');
      // Optionally refresh assessments data here
    } catch (error) {
      console.log('Something wrong', error);
      toast.error('Failed to disapprove assessment');
    }
  }

  const viewAssessment = (item)=>{
    localStorage.setItem('assessment', JSON.stringify(item))
    navigate('/assessment')
  }
  
  // use effect
  useEffect(() => {
    setData(document.querySelectorAll("#allreview tbody tr"));
  }, [ assessments,language,user,id ]);

  // Active pagginarion
  activePag.current === 0 && chageData(0, sort);
  
  // paggination
  let paggination = Array(Math.ceil(data.length / sort))
    .fill()
    .map((_, i) => i + 1);

  // Active paggination & chage data
  const onClick = (i) => {
    activePag.current = i;
    chageData(activePag.current * sort, (activePag.current + 1) * sort);
    settest(i);
  };

  return (
    <div id="All" className="tab-pane">
      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={handleCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to {confirmAction === 'approve' ? 'approve' : 'disapprove'} this assessment?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className={`btn ${confirmAction === 'approve' ? 'btn-primary' : 'btn-danger'}`}
          >
            Confirm
          </button>
        </Modal.Footer>
      </Modal>

      {/* Assessment Details Modal */}
      <Modal size="xl" show={assessment} onEscapeKeyDown={()=>setassessment(null)}>
        <Modal.Header>
            <h3>{assessment ? assessment[25] : `--`}</h3>
            <Link onClick={()=>setassessment(null)} className="modal-dismiss">x</Link>
        </Modal.Header>
        <Modal.Body>
        <div className="row">
          <div className="col-lg-3">
            <Accordion className="accordion accordion-primary" defaultActiveKey="0">
              { firstHalf.map((header, i)=>{
              return assessment ? assessment[headers.indexOf(header)] ? (<Accordion.Item className="accordion-item" key={i} eventKey={i}>
                <Accordion.Header className="accordion-header rounded-lg">
                  {header}
                </Accordion.Header>
                <Accordion.Collapse eventKey={i}>
                    <div className="accordion-body">
                      <p>{assessment ? assessment[headers.indexOf(header)] ? assessment[headers.indexOf(header)] : `--` : `--`}</p>
                    </div>
                </Accordion.Collapse>
              </Accordion.Item>) : (<div></div>) : (<div></div>)
              })
              }
            </Accordion>
          </div>
          <div className="col-lg-3">
            <Accordion className="accordion accordion-primary" defaultActiveKey="0">
              { secondHalf.map((header, i)=>{
                return assessment ? assessment[headers.indexOf(header)] ? (<Accordion.Item className="accordion-item" key={i} eventKey={i}>
                <Accordion.Header className="accordion-header rounded-lg">
                  {header}
                </Accordion.Header>
                <Accordion.Collapse eventKey={i}>
                    <div className="accordion-body">
                      <p>{assessment ? assessment[headers.indexOf(header)] ? assessment[headers.indexOf(header)] : `--` : `--`}</p>
                    </div>
                </Accordion.Collapse>
              </Accordion.Item>) : (<div></div>) : (<div></div>)
              })
              }
            </Accordion>
          </div>
          <div className="col-lg-3">
            <Accordion className="accordion accordion-primary" defaultActiveKey="0">
              { thirdHalf.map((header, i)=>{
                return assessment ? assessment[headers.indexOf(header)] ? (<Accordion.Item className="accordion-item" key={i} eventKey={i}>
                <Accordion.Header className="accordion-header rounded-lg">
                  {header}
                </Accordion.Header>
                <Accordion.Collapse eventKey={i}>
                    <div className="accordion-body">
                      <p>{assessment ? assessment[headers.indexOf(header)] ? assessment[headers.indexOf(header)] : `--` : `--`}</p>
                    </div>
                </Accordion.Collapse>
              </Accordion.Item>) : (<div></div>) : (<div></div>)
              })
              }
            </Accordion>
          </div>
          <div className="col-lg-3">
            <Accordion className="accordion accordion-primary" defaultActiveKey="0">
              { fourthHalf.map((header, i)=>{
                return assessment ? assessment[headers.indexOf(header)] ? (<Accordion.Item className="accordion-item" key={i} eventKey={i}>
                <Accordion.Header className="accordion-header rounded-lg">
                  {header}
                </Accordion.Header>
                <Accordion.Collapse eventKey={i}>
                    <div className="accordion-body">
                      <p>{assessment ? assessment[headers.indexOf(header)] ? assessment[headers.indexOf(header)] : `--` : `--`}</p>
                    </div>
                </Accordion.Collapse>
              </Accordion.Item>) : (<></>) : (<></>)
              })
              }
            </Accordion>
          </div>
        </div>
        </Modal.Body>
        <Modal.Footer>
        <button onClick={()=>setassessment(null)} className="btn btn-sm btn-warning">Close</button>
        </Modal.Footer>
      </Modal>

      <div className="table-responsive table-hover fs-14">
        <div id="allreview" className="dataTables_wrapper no-footer ">
          <table
            id="example2"
            className="table mb-4 dataTablesCard  fs-14 dataTable no-footer"
            role="grid"
            aria-describedby="example2_info"
          >
            <thead>
              <tr role="row">
                <th
                  className="sorting"
                  tabIndex="0" aria-controls="example5" rowSpan="1" colSpan="1"
                  aria-label="Customer: activate to sort column ascending"
                >
                  {t("AssessmentStartDate")}
                </th>
                <th
                  className="sorting"
                  tabIndex="0" aria-controls="example5" rowSpan="1" colSpan="1"
                  aria-label="Customer: activate to sort column ascending"
                >
                  {t("AssessmentEndDate")}
                </th>
                <th
                  className="d-none d-lg-table-cell sorting" tabIndex="0" aria-controls="example5"
                  rowSpan="1" colSpan="1" aria-label="Event NAME: activate to sort column ascending"
                >
                  {t("AssessmentType")}
                </th>
                <th
                  className="sorting" 
                >
                  {("Action")}
                </th>
                {user.type === 'investor' && user.email === "info@minexx.co" && (
                  <th className="sorting">
                    {("Status")}
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {assessments.length === 0 ? <tr>
                <td className="pa-5 text-center font-w200" colSpan={5}>{t("There are no assessments to display.")}</td>
              </tr>
              : assessments.map( (doc, i) => <tr key={i} role="row" className="odd">
                <td>
                  <div className="media align-items-center">
                    <span>{ doc.general[22] }</span>
                  </div>
                </td>
                <td>
                  <div className="media align-items-center">
                    <span>{ doc.general[23] }</span>
                  </div>
                </td>
                <td className="d-none d-lg-table-cell">{doc.general[24]}</td>
                <td onClick={()=>viewAssessment(doc)} >
                  <div className="d-flex">
                    <Link to="" title="View Assessment Report" className="btn btn-primary light btn-sm px-4"><FontAwesomeIcon icon={icon({ name: 'eye' })} /></Link>
                  </div>
                </td>
                {user.type === 'investor' && user.email === "info@minexx.co" && (
                  <td>
                    <div className="d-flex gap-2">
                      {doc.status === 'Approved' ? (
                        <span className="badge badge-success badge-lg">Approved</span>
                      ) : doc.status === 'Disapproved' ? (
                        <span className="badge badge-danger badge-lg">Disapproved</span>
                      ) : (
                        <>
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => openConfirmModal('approve', id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => openConfirmModal('disapprove', id)}
                          >
                            Disapprove
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>)}
            </tbody>
          </table>

          <div className="d-sm-flex text-center justify-content-between align-items-center mt-3">
            <div className="dataTables_info">
              {t("Showing")} {activePag.current * sort + 1} {t("To")}{" "}
              {data.length > (activePag.current + 1) * sort
                ? (activePag.current + 1) * sort
                : data.length}{" "}
              {t("Of")} {data.length} {t("Entries")}
            </div>
            <div
              className="dataTables_paginate paging_simple_numbers"
              id="example2_paginate"
            >
              <Link
                className="paginate_button previous disabled"
                to=""
                onClick={() =>
                  activePag.current > 0 && onClick(activePag.current - 1)
                }
              >
                {t("Previous")}
              </Link>
              <span>
                {paggination.map((number, i) => (
                  <Link
                    key={i}
                    to=""
                    className={`paginate_button  ${
                      activePag.current === i ? "current" : ""
                    } `}
                    onClick={() => onClick(i)}
                  >
                    {number}
                  </Link>
                ))}
              </span>

              <Link
                className="paginate_button next"
                to=""
                onClick={() =>
                  activePag.current + 1 < paggination.length &&
                  onClick(activePag.current + 1)
                }
              >
               {t("Next")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentsTable;