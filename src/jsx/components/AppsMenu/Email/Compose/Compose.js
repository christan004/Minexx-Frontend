import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar"; 
import DropFile from "./DropFile";

import PageTitle from "../../../../layouts/PageTitle";
//import { Dropdown } from "react-bootstrap";

const Compose = () => {
  return (
    <Fragment>
      <PageTitle activeMenu="Compose" motherMenu="Email" pageContent="Email" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
				<div className="row">
					<div className="col-lg-3">
					  <div className="email-left-box">
						<div className="p-0">
						  <Link to="/email-compose" className="btn btn-primary btn-block">
							{/* <i className="fa-solid fa-plus me-2"></i */}
							Compose
						  </Link>
						</div>
						<div className="mail-list rounded mt-4">
						  <Link to="/email-inbox" className="list-group-item active">
							<i className="fa fa-inbox font-18 align-middle me-2"></i>{" "}Inbox
							<span className="badge badge-primary badge-sm float-end">198</span>
						  </Link>
						  <Link to="/email-compose" className="list-group-item">
							<i className="fa fa-paper-plane font-18 align-middle me-2"></i>Sent
						  </Link>
						  	<Link to={"#"} className="list-group-item">
								<i className="fas fa-star font-18 align-middle me-2"></i>Important 
								<span className="badge badge-danger text-white badge-sm float-end">47</span>
							</Link>
							<Link to={"#"} className="list-group-item">
								<i className="mdi mdi-file-document-box font-18 align-middle me-2"></i>Draft
							</Link>
							<Link to={"#"} className="list-group-item">
								<i className="fa fa-trash font-18 align-middle me-2"></i>Trash
							</Link>
						  	
						</div>
						<div className="mail-list rounded overflow-hidden mt-4 ">
							<div className="intro-title d-flex justify-content-between my-0">
								<h5>Categories</h5>
                        <i className="fa fa-chevron-down"></i>					
							</div>
						  	<Link to="/email-inbox" className="list-group-item">
								<span className="icon-warning"><i className="fa fa-circle"></i></span>{" "}Work 
							</Link>
							<Link to="/email-inbox" className="list-group-item">
								<span className="icon-primary"><i className="fa fa-circle"></i></span>{" "}Private 
							</Link>
							<Link to="/email-inbox" className="list-group-item">
								<span className="icon-success"><i className="fa fa-circle"></i></span>{" "}Support 
							</Link>
							<Link to="/email-inbox" className="list-group-item">
								<span className="icon-dpink"><i className="fa fa-circle"></i></span>{" "}Social 
							</Link>
						</div>
					  </div>
					</div>
					<div className="col-lg-9">
                  <div className="email-right-box ms-0 ms-sm-4 ms-sm-0">	
                     <div className="compose-content">
                        <form action="#">
                           <div className="mb-3">
                              <input type="text" className="form-control bg-transparent" placeholder=" To:" />
                           </div>
                           <div className="mb-3">
                              <input type="text" className="form-control bg-transparent" placeholder=" Subject:"/>
                           </div>
                           <div className="mb-3">
                              <textarea id="email-compose-editor" className="textarea_editor form-control bg-transparent" rows="8"
                                 placeholder="Enter text ..."
                              ></textarea>
                           </div>
                        </form>
                        <h5 className="mb-4"><i className="fa fa-paperclip me-1"></i>Attatchment</h5>
                        <div className="fallback">
                           <DropFile />
                        </div>
                     </div>
                     <div className="text-start mt-4 mb-3">
                        <button className="btn btn-primary btn-sl-sm me-2" type="button">
                           <span className="me-2">
                              <i className="fa fa-paper-plane"></i>
                           </span>
                           Send
                        </button>
                        <button
                           className="btn btn-danger light btn-sl-sm"
                           type="button"
                        >
                           <span className="me-2">
                           <i className="fa fa-times" aria-hidden="true"></i>
                           </span>
                           Discard
                        </button>
                     </div>                  
                  </div>	
					</div>
				</div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Compose;
