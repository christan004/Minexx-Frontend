import React from "react";
import {  Nav, Tab } from "react-bootstrap";
import { Link } from "react-router-dom";

import AllReviewTable from "./../Karciz/Review/AllReviewTable";
import RefundedReviewTable from "./../Karciz/Review/RefundedReviewTable";
import SoldReviewTable from "./../Karciz/Review/SoldReviewTable";

const Reviews = () => {	
	return(
		<>
			<div className="page-titles">
				<ol className="breadcrumb">
					<li className="breadcrumb-item active"><Link to={"#"}>Dashboard</Link></li>
					<li className="breadcrumb-item"><Link to={"#"} >Reviews</Link></li>
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
													All Review
												</Nav.Link>
											</Nav.Item >
											<Nav.Item as="li" className="nav-item">
												<Nav.Link className="nav-link px-2 px-lg-3" to="#sold1" role="tab" eventKey="published">
													Published
												</Nav.Link>
											</Nav.Item>
											<Nav.Item as="li" className="nav-item">
												<Nav.Link className="nav-link px-2 px-lg-3"  to="#refunded1" role="tab" eventKey="delete">
													Deleted
												</Nav.Link>
											</Nav.Item>
										</Nav>
									</div>
									<div className="col-sm-12 col-md-5 text-md-end mt-md-0 mt-4">
										<Link to={"#"} className="btn btn-primary rounded me-2 btn-sm px-4">Publish</Link>
										<Link to={"#"} className="btn btn-danger rounded btn-sm px-4">Delete</Link>
									</div>
								</div>
							</div>
						</div>
					</div>	
					<div className="col-xl-12">
						<Tab.Content>
							<Tab.Pane eventKey="all">
								<AllReviewTable />
							</Tab.Pane>
							<Tab.Pane eventKey="published">
								<SoldReviewTable />
							</Tab.Pane>
							<Tab.Pane eventKey="delete">
								<RefundedReviewTable />
							</Tab.Pane>
							
						</Tab.Content>
					</div>
				</div>
			  </Tab.Container>
		</>
	)
}	
export default Reviews; 	