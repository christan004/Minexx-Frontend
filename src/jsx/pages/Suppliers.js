import React, { useContext, useEffect, useState } from "react";
import {  Button, Dropdown, Modal, Nav, Tab } from "react-bootstrap";
import {Link} from 'react-router-dom';
import { ThemeContext } from "../../context/ThemeContext";

const Suppliers = () => {	
	const [expot, setexpot] = useState()
	const { changeTitle } = useContext(ThemeContext)
	const [suppliers, setsuppliers] = useState([])
	const [filtered, setfiltered] = useState([])

	useEffect(() => {
	  changeTitle(`Suppliers | Minexx`)
	}, [])
	
	return(
		<>
			<div className="page-titles">
				<ol className="breadcrumb">
					<li className="breadcrumb-item active"><Link to={"#"}>Dashboard</Link></li>
					<li className="breadcrumb-item"><Link to={"#"} >Suppliers</Link></li>
				</ol>
			</div>
			<Modal show={expot} className="modal fade" id="details" onHide={() => setexpot(false)}>
				<div className="modal-content">
					<div className="modal-header">
						<h3 className="modal-title">Suppliers Li</h3>
						<Button variant="" type="button" className="close" data-dismiss="modal" onClick={() => setexpot(false)} >
							<span>×</span>
						</Button>
						
					</div>
					<div className="modal-body">
						All assessment details would appear here as recorded on the app.
					</div>
				</div>
			</Modal>
			<div className="row">
				<div className="col-xl-12">
					<div className="card">
						<div className="card-header">
							<h4 className="card-title">Suppliers</h4>
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
									<th
									className="sorting_asc"
									tabIndex={0}
									aria-controls="example5"
									rowSpan={1}
									colSpan={1}
									aria-sort="ascending"
									aria-label=": activate to sort column descending"
									style={{ width: 32 }}
									>
									<div className="custom-control custom-checkbox">
										<input
										type="checkbox"
										// onClick={() => chackboxFun("all")}
										className="custom-control-input"
										id="checkAll"
										required
										/>
										<label
										className="custom-control-label"
										htmlFor="checkAll"
										/>
									</div>
									</th>
									<th
									className="sorting"
									tabIndex={0}
									aria-controls="example5"
									rowSpan={1}
									colSpan={1}
									aria-label="Patient ID: activate to sort column ascending"
									style={{ width: 73 }}
									>
									Supplier ID
									</th>
									<th
									className="sorting"
									tabIndex={0}
									aria-controls="example5"
									rowSpan={1}
									colSpan={1}
									aria-label="Date Check in: activate to sort column ascending"
									style={{ width: 100 }}
									>
									Date Added
									</th>
									<th
									className="sorting"
									tabIndex={0}
									aria-controls="example5"
									rowSpan={1}
									colSpan={1}
									style={{ width: 100 }}
									>
									Supplier Name
									</th>
									<th
									className="sorting"
									tabIndex={0}
									aria-controls="example5"
									rowSpan={1}
									colSpan={1}
									style={{ width: 120 }}
									>
									Material
									</th>
									{/* <th
									className="sorting"
									tabIndex={0}
									aria-controls="example5"
									rowSpan={1}
									colSpan={1}
									style={{ width: 62 }}
									>
									Gross Weight (kg)
									</th>
									<th
									className="sorting"
									tabIndex={0}
									aria-controls="example5"
									rowSpan={1}
									colSpan={1}
									aria-label="Status: activate to sort column ascending"
									style={{ width: 106 }}
									>
									Net Weight (kg)
									</th>
									<th
									className="sorting"
									tabIndex={0}
									aria-controls="example5"
									rowSpan={1}
									colSpan={1}
									aria-label="Action: activate to sort column ascending"
									style={{ width: 47 }}
									>
									Exportation ID
									</th> */}
								</tr>
								</thead>
								<tbody>
									{
										filtered.length === 0 ?
										<tr role="row" className="odd">
											<td colSpan={5} rowSpan={2} className="sorting_1 text-center">No supplier records to display yet.</td>
										</tr> : <></>
									}
									{/* <tr role="row" className="odd">
										<td className="sorting_1">
										<div className="custom-control custom-checkbox ">
											<input
											type="checkbox"
											// onClick={() => chackboxFun()}
											className="custom-control-input"
											id="customCheckBox2"
											required
											/>
											<label
											className="custom-control-label"
											htmlFor="customCheckBox2"
											/>
										</div>
										</td>
										<td>ed152848</td>
										<td>26/02/2020, 12:42 AM</td>
										<td>
										<span className="badge light badge-warning">
											<i className="fa fa-circle text-danger me-1" />
											Tin
										</span>
										</td>
										<td>32.77</td>
										<td>8345</td>
										<td>
										8302
										</td>
										<td>RMR/RW/0000001</td>
										<td>
										<Dropdown className="dropdown ms-auto text-right">
											<Dropdown.Toggle
											variant=""
											className="btn-link i-false"
											data-toggle="dropdown"
											>
											<svg
												width="24px"
												height="24px"
												viewBox="0 0 24 24"
												version="1.1"
											>
												<g
												stroke="none"
												strokeWidth={1}
												fill="none"
												fillRule="evenodd"
												>
												<rect x={0} y={0} width={24} height={24} />
												<circle fill="#fff" cx={5} cy={12} r={2} />
												<circle fill="#fff" cx={12} cy={12} r={2} />
												<circle fill="#fff" cx={19} cy={12} r={2} />
												</g>
											</svg>
											</Dropdown.Toggle>
											<Dropdown.Menu className="dropdown-menu dropdown-menu-right">
											<Dropdown.Item onClick={()=>setexpot(true)}>View Details</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
										</td>
									</tr> */}
								</tbody>
							</table>

							{/* <div className="d-sm-flex text-center justify-content-between align-items-center mt-3">
								<div className="dataTables_info">
								Showing {activePag.current * sort + 1} to{" "}
								{data.length > (activePag.current + 1) * sort
									? (activePag.current + 1) * sort
									: data.length}{" "}
								of {data.length} entries
								</div>
								<div
								className="dataTables_paginate paging_simple_numbers"
								id="example5_paginate"
								>
								<Link
									className="paginate_button previous disabled"
									to="/table-datatable-basic"
									onClick={() =>
									activePag.current > 0 && onClick(activePag.current - 1)
									}
								>
									Previous
								</Link>
								<span>
									{paggination.map((number, i) => (
									<Link
										key={i}
										to="/table-datatable-basic"
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
									to="/table-datatable-basic"
									onClick={() =>
									activePag.current + 1 < paggination.length &&
									onClick(activePag.current + 1)
									}
								>
									Next
								</Link>
								</div>
							</div> */}
							</div>
						</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}	
export default Suppliers; 	