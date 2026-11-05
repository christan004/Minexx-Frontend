import React from "react";
import {Link} from 'react-router-dom';

const IncidentData = ({ onItemClick, incident }) =>{
    return (
        <>
			<div className="media align-items-center border-bottom p-md-4 p-3" key={incident.id}>
				{/* <span className="number  col-1 px-0 align-self-center d-none d-sm-inline-block">{incident.id}</span> */}
				<div className="media-body col-sm-6 col-6 col-xxl-5 px-0 me-4">
					<h5 className="mt-0 mb-0"><Link to={"#"} onClick={()=>onItemClick(incident)} className=" fs-18 font-w400 text-ov">{incident.description}</Link></h5>
					<p to={"#"} className=" fs-12 font-w200">{incident.detailedDescription}</p>
				</div>
				<div className="media-footer ms-auto col-2 px-0 d-flex align-self-center align-items-center">
					<div className="text-center">
						<span className="text-primary d-block fs-20">{incident.score}</span>
						<span className="fs-14">Incident Score</span>
					</div>
				</div>
				<div className="me-3">
					<p className="mb-0">{incident.location}</p>
					<span className="mt-0 font-w200">{incident.date}</span>
				</div>
				<div className="chart-point mt-4 text-center">
					<div className="fs-13 col px-0 text-black">
						{incident.level === 'low' ? <span className="a mx-auto"></span> : incident.level === 'medium' ? <span className="b mx-auto"></span> : incident.level === <span className="c mx-auto"></span> ? 'warning' : <span className="d mx-auto"></span> }
					</div>
				</div>
			</div>
        </>
    );
   
}

export default IncidentData;
