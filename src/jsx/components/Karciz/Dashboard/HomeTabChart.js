import React,{Fragment} from 'react';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import {Tab , Nav} from  'react-bootstrap';
//import {Link} from 'react-router-dom';



const SalesRevenueChart = loadable(() =>
	pMinDelay(import("./SalesRevenueChart"), 1000)
);
const SalesRevenueChart2 = loadable(() =>
	pMinDelay(import("./SalesRevenueChart2"), 1000)
);
const SalesRevenueChart3 = loadable(() =>
	pMinDelay(import("./SalesRevenueChart3"), 1000)
); 

const HomeTabChart = () => {
	return(
		<Fragment>
			
			
			<Tab.Container defaultActiveKey="Monthly">
				<div className="card">
					<div className="card-header border-0 pb-0 d-sm-flex d-block">
						<div>
							<h4 className="mb-0 fs-20">Sales Revenue</h4>
						</div>
						<div className="card-action card-tabs mt-3 mt-sm-0">
							<Nav as="ul" className="nav nav-tabs" role="tablist">
								<Nav.Item as="li" className="nav-item">
									<Nav.Link className="nav-link" eventKey="Monthly" >Monthly</Nav.Link>
								</Nav.Item>
								<Nav.Item as="li" className="nav-item">
									<Nav.Link className="nav-link" eventKey="Weekly" >Weekly</Nav.Link>
								</Nav.Item>
								<Nav.Item as="li" className="nav-item">
									<Nav.Link className="nav-link" eventKey="Daily" >Daily</Nav.Link>
								</Nav.Item>
							</Nav>
						</div>
					</div>
					<div className="card-body">
						<Tab.Content>
							<Tab.Pane eventKey="Monthly">
								<SalesRevenueChart />
							</Tab.Pane>	
							<Tab.Pane eventKey="Weekly">
								<SalesRevenueChart2 />
							</Tab.Pane>	
							<Tab.Pane eventKey="Daily">
								<SalesRevenueChart3 />
							</Tab.Pane>	
						</Tab.Content>	
					</div>
				</div>	
			</Tab.Container>	 
		</Fragment>
	)
}
export default HomeTabChart;