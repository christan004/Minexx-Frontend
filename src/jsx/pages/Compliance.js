import React from "react";
import {  Nav, Tab } from "react-bootstrap";
import { Link } from "react-router-dom";

import ComplianceTable from "../components/table/ComplianceTable";

const Compliance = () => {	
	return(
		<>
			<div className="page-titles">
				<ol className="breadcrumb">
					<li className="breadcrumb-item active"><Link to={"#"}>Dashboard</Link></li>
					<li className="breadcrumb-item"><Link to={"#"} >Compliance</Link></li>
				</ol>
			</div>
			<Tab.Container defaultActiveKey="all">
				<div className="row">
					<div className="col-xl-12">
						<div className="card">
							<div className="card-body px-4 py-3 py-md-2">
								<div className="row align-items-center">
									<div className="col-sm-12 col-md-7">
										<Nav as="ul" className="nav nav-pills review-tab" role="tablist">
											<Nav.Item as="li" className="nav-item">
												<Nav.Link className="nav-link  px-2 px-lg-3"  to="#all1" role="tab" eventKey="all">
													Certificate of Incorporation
												</Nav.Link>
											</Nav.Item>
											<Nav.Item as="li" className="nav-item">
												<Nav.Link className="nav-link px-2 px-lg-3" to="#sold1" role="tab" eventKey="published">
													Financial &amp; Audit Report
												</Nav.Link>
											</Nav.Item>
											{/* <Nav.Item as="li" className="nav-item">
												<Nav.Link className="nav-link px-2 px-lg-3"  to="#refunded1" role="tab" eventKey="delete">
													Tax Cerificate
												</Nav.Link>
											</Nav.Item>
											<Nav.Item as="li" className="nav-item">
												<Nav.Link className="nav-link px-2 px-lg-3"  to="#refunded1" role="tab" eventKey="delete">
													Status of Company
												</Nav.Link>
											</Nav.Item> */}
											<Nav.Item as="li" className="nav-item">
												<Nav.Link className="nav-link px-2 px-lg-3"  to="#refunded1" role="tab" eventKey="delete">
													Other Documents
												</Nav.Link>
											</Nav.Item>
										</Nav>
									</div>
									<div className="col-sm-12 col-md-5 text-md-end mt-md-0 mt-4">
										<Link to={"#"} className="btn btn-primary rounded me-2 btn-sm px-4">Upload Document(s)</Link>
										{/* <Link to={"#"} className="btn btn-danger rounded btn-sm px-4">Delete</Link> */}
									</div>
								</div>
							</div>
						</div>
					</div>	
					<div className="col-xl-12">
						<Tab.Content>
							<Tab.Pane eventKey="all">
								<ComplianceTable />
							</Tab.Pane>
							<Tab.Pane eventKey="published">
								<ComplianceTable />
							</Tab.Pane>
							<Tab.Pane eventKey="delete">
								<ComplianceTable />
							</Tab.Pane>
							
						</Tab.Content>
					</div>
				</div>
			  </Tab.Container>
		</>
	)
}	
export default Compliance; 	