import React from "react";
import { Link } from "react-router-dom";
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({ text }) => <li style={{ fontSize: 20, width: 15, height: 15 }} className="fa fa-map-pin text-danger"></li>;

const Locations = () => {
	
	return(
		<>
			<div className="page-titles">
				<ol className="breadcrumb">
					<li className="breadcrumb-item active"><Link to={"#"}>Dashboard</Link></li>
					<li className="breadcrumb-item"><Link to={"#"} >Locations</Link></li>
				</ol>
			</div>
			<div className="row">
				<div className="col-xl-12">
				<div style={{ height: '80vh', width: '100%' }}>
					{/* <GoogleMapReact
						bootstrapURLKeys={{ key: apiKey }}
						defaultCenter={{ lng: -0.205874, lat: 5.614818 }}
						defaultZoom={11}
					>
					</GoogleMapReact> */}
				</div>
				</div>
			</div>
		</>
	)
}	
export default Locations; 	