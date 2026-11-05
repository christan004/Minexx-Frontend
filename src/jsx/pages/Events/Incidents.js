import React from 'react';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import {Link, useNavigate} from 'react-router-dom';
import { Modal, Dropdown } from "react-bootstrap";
import IncidentData from '../../components/Karciz/Analytics/IncidentData';
import {DropdownBlogYear} from '../../components/Karciz/Dropdown/DropdownBlog';
import { useState } from 'react';
import axios from 'axios';
import { baseURL_ } from '../../../config';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { Logout } from '../../../store/actions/AuthActions';
import { useDispatch } from 'react-redux';

const PieChart = loadable(() =>
	pMinDelay(import("../../components/Karciz/Analytics/PieChart"), 1000)
);

const Incidents = () =>{

    const navigate = useNavigate()
	const dispatch = useDispatch()
	const [incident, setincident] = useState()
	const [incidents, setincidents] = useState([])
	const [filtered, setfiltered] = useState([])
	const [levels, setlevels] = useState({
		low: 0,
		medium: 0,
		high: 0,
		fatal: 0
	})

	const fetchIncidents = async()=>{
		try{
			let response = await axios.get(`incidents`)
			setlevels(response.data.levels)
			setincidents(response.data.incidents)
			setfiltered(response.data.incidents)
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
	  fetchIncidents()
	  document.title = `Incidents`
	}, [document.title])
	

	return(
		<>
			<Modal className="modal modal-md fade" id="incidentDetails" show={incident} onHide={()=>setincident(null)}>
				<div className="" role="document">
					<div className="">
						<form >
							<div className="modal-header">
								<h4 className="modal-title fs-20">Incident Details</h4>
								<button type="button" className="btn btn-default close" data-dismiss="modal" onClick={()=> setincident(null)}><span>&times;</span></button>
							</div>
							<div className="modal-body">
								{/* <i className="flaticon-cancel-12 close" data-dismiss="modal"></i> */}
								<p className='font-w200'>All incident details will show here.</p>
							</div>
							{/* <div className="modal-footer">
								<button type="button"  className="btn btn-danger" onClick={()=> setincident(null)}> <i className="flaticon-delete-1"></i> Dismiss</button>
							</div> */}
						</form>
					</div>
				</div>
			</Modal>

			<div className="page-titles">
				<ol className="breadcrumb">
					<li className="breadcrumb-item active"><Link to={"#"}>Events</Link></li>
					<li className="breadcrumb-item"><Link to={"#"}>Incidents</Link></li>
				</ol>
			</div>
			<div className="row">
				<div className="col-xl-4">
					<div className="row">
						<div className="col-xl-12">
							<div className="card">
								<div className="card-header border-0 pb-0">
									<h4 className="fs-20 mb-0">Incident Levelss</h4>
									<DropdownBlogYear />
								</div>
								<div className="card-body">
									<div className="d-flex justify-content-between align-items-center bgl-dark p-3 rounded selling">	
										<span className="text-black fs-14">Total</span>
										<span className="text-black fs-14">{incidents.length}</span>
									</div>
									<div className="row">
										<div className="col-md-12">
											<div className="selling-pie-chart">
												<PieChart levels={levels} />
											</div>	
											<div className="chart-point mt-4 text-center">
												<div className="fs-13 col px-0 text-black">
													<span className="a mx-auto"></span>
													Low
												</div>
												<div className="fs-13 col px-0 text-black">
													<span className="b mx-auto"></span>
													Medium
												</div>
												<div className="fs-13 col px-0 text-black">
													<span className="c mx-auto"></span>
													High
												</div>
												<div className="fs-13 col px-0 text-black">
													<span className="d mx-auto"></span>
													Fatal/Very High
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div className="col-xl-8">
					<div className="row">
						<div className="col-xl-12">
							<div className="card overflow-hidden">
								<div className="card-header border-0 pb-0">
									<h4 className="card-title mb-1">Incidents</h4>
									<Dropdown className="ms-auto text-right">
										<Dropdown.Toggle variant="" as="div" className="btn-link i-false">
											<i className="fa fa-ellipsis-v text-dark"></i>
										</Dropdown.Toggle>	
										<Dropdown.Menu alignRight={true} className="dropdown-menu-right">
											<Dropdown.Item >Refresh</Dropdown.Item>	
											<Dropdown.Item >Order By Date Reported</Dropdown.Item>
											<Dropdown.Item >Order By Incident Date</Dropdown.Item>	
										</Dropdown.Menu>	
									</Dropdown>
								</div>
								<div className="card-body pt-0 p-0" style={{ maxHeight: 700, overflow: 'auto' }}>
									{ filtered.length === 0 ?
										<div className='card'>
											<div className='card-body'>
												<h5 className="mt-0 mb-0">No incidents</h5>
												<p className=" fs-12 font-w200">There are no incidents to display yet.</p>
											</div>
										</div>
									: filtered.map(incident=><IncidentData key={incident.id} incident={incident} onItemClick={setincident} />)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>	
		</>
	)
}
export default Incidents;