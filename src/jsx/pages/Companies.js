import React, { useContext, useEffect, useState } from "react";
import {  Button, Dropdown, Modal } from "react-bootstrap";
import {Link, useNavigate} from 'react-router-dom';
import { baseURL_ } from "../../config";
import axios from "axios";
import { toast } from "react-toastify";
import { ThemeContext } from "../../context/ThemeContext";
import { Logout } from '../../store/actions/AuthActions';
import { useDispatch } from "react-redux";

const Companies = () => {
	
	const { changeTitle } = useContext(ThemeContext);
	const [expot, setexpot] = useState()
    const navigate = useNavigate()
	const dispatch = useDispatch()
	const [companies, setcompanies] = useState([])
	const [filtered, setfiltered] = useState([])
	const user = JSON.parse(localStorage.getItem(`_authUsr`))

	const filter = e => {
		let input = e.currentTarget.value
		setfiltered(companies.filter(company=>company.name.toLowerCase().includes(input)))
	}

	const fetchCompanies = async()=>{
		try{
			let response = await axios.get(`companies`)
			setcompanies( user.type === `minexx` ? response.data.companies : response.data.companies.filter(single=>single.type === `Exporter`))
			setfiltered( user.type === `minexx` ? response.data.companies : response.data.companies.filter(single=>single.type === `Exporter`))
		}catch(err){
			try{
				if(err.response.code === 403){
					dispatch(Logout(navigate))
				}else{
					toast.warn(err.response.message)
				}
			}catch(e){
				toast.error(err.message)
			}
		}

	}

	useEffect(() => {
	  fetchCompanies()
	  changeTitle(`Companies | Minexx`)
	}, [])

	return(
		<>
			<div className="page-titles">
				<ol className="breadcrumb">
					<li className="breadcrumb-item active"><Link to={"/overview"}>Dashboard</Link></li>
					<li className="breadcrumb-item"><Link to={""} >Companies</Link></li>
				</ol>
			</div>
			<Modal show={expot} className="modal fade" id="details" onHide={() => setexpot(false)}>
				<div className="modal-content">
					<div className="modal-header">
						<h3 className="modal-title">Export Details</h3>
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
							<h4 className="card-title">Companies</h4>
							<div className="col-md-4">
								<input className="form-control" placeholder="Search for company" onChange={filter} />
							</div>
						</div>
						<div className="card-body">
						<div className="table-responsive">
							<table
								id="example5"
								className="dataTable no-footer"
								role="grid"
							>
								<thead>
								<tr role="row">
									<th
                                        className="sorting"
                                        tabIndex={0}
                                        rowSpan={1}
									>
									    Name
									</th>
									<th
                                        className="sorting"
                                        tabIndex={0}
                                        rowSpan={1}
									>
									    Address
									</th>
									<th
                                        className="sorting"
                                        tabIndex={0}
                                        rowSpan={1}
									>
									    Number
									</th>
									<th
                                        className="sorting"
                                        tabIndex={0}
                                        rowSpan={1}
									>
									    Type
									</th>
									<th
                                        className="sorting"
                                        tabIndex={0}
                                        rowSpan={1}
									>
									    Country
									</th>
									<th
                                        className="sorting"
                                        tabIndex={0}
                                        rowSpan={1}
									>
									    Date
									</th>
								</tr>
								</thead>
								<tbody>
								{
									filtered.length === 0 ?
										<tr role="row" className="odd">
											<td colSpan={6} rowSpan={2} className="sorting_1 text-center">No company records to display yet.</td>
										</tr>
									: filtered.map(company=>{
									return (<tr role="row" className="clickable" key={company.id}>
										<td onClick={()=>navigate(`/company/${company.id}`)}>
											<span>
												{company.name}
											</span>
										</td>
										<td>{company.address}</td>
										<td>{company.number}</td>
										<td>{company.type}</td>
										<td>{company.country}</td>
										<td>{company.date}</td>
										<td>
										<Dropdown className="dropdown ms-auto text-right">
											<Dropdown.Toggle
											variant=""
											className="btn-link i-false"
											data-toggle="dropdown"
											>
											<i className="fa fa-ellipsis-h text-dark"></i>
											</Dropdown.Toggle>
											<Dropdown.Menu className="dropdown-menu dropdown-menu-right">
											    <Dropdown.Item onClick={()=>navigate(`/company/${company.id}`)}>View Details</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
										</td>
									</tr>)
								}) }
								</tbody>
							</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}	
export default Companies; 	