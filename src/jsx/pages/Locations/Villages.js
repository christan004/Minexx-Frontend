import React,{useState, useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import {Dropdown, Nav, Tab} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import GoogleMapReact from 'google-map-react';
import { toast } from 'react-toastify';
import PerfectScrollbar from "react-perfect-scrollbar";
import DropdownBlog from '../../components/Karciz/Dropdown/DropdownBlog';
import { apiKey } from '../../../config'
import image from './../../../images/card/1.jpg'

const ticketData = [
    {title:'Glee Smiley', gender:'Male', type:'Customer', Rgdate:'10 Jan, 2023', Expdate:'12 Jan, 2023' },
    {title:'Louis Jovanny', gender:'Male',type:'Guest', Rgdate:'13 Jan, 2023', Expdate:'15 Jan, 2023'   },
    {title:'Cindy Hawkins', gender:'Female',type:'Customer', Rgdate:'14 Jan, 2023', Expdate:'16 Jan, 2023'},
    {title:'Glee Smiley', gender:'Male',type:'Guest', Rgdate:'17 Jan, 2023', Expdate:'19 Jan, 2023'},
    {title:'Timothy L. Brodbeck', gender:'Male',type:'Customer', Rgdate:'18 Jan, 2023', Expdate:'20 Jan, 2023'},
    {title:'Louis Jovanny', gender:'Male', type:'Guest', Rgdate:'21 Jan, 2023', Expdate:'23 Jan, 2023'},
    {title:'Timothy L. Brodbeck', gender:'Female',type:'Customer', Rgdate:'22 Jan, 2023', Expdate:'24 Jan, 2023'},
    {title:'Cindy Hawkins', gender:'Male',type:'Customer', Rgdate:'25 Jan, 2023', Expdate:'27 Jan, 2023'},
    {title:'Louis Jovanny', gender:'Male',type:'Guest', Rgdate:'26 Jan, 2023', Expdate:'28 Jan, 2023'},
    {title:'Cindy Hawkins', gender:'Female',type:'Customer', Rgdate:'29 Jan, 2023', Expdate:'30 Jan, 2023'},
];


const Villages = () => {
    const [data, setData] = useState(
		document.querySelectorAll("#ticket_wrapper tbody tr")
	);
	const sort = 10;
	const activePag = useRef(0);
	//const [test, settest] = useState(0);

    const [users, setusers] = useState([])
    const [filtered, setfiltered] = useState([])

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

    // const getUsers = ()=>{
    //     axiosInstance.get(`/users`).then(response=>{
    //         setusers(response.data.users)
    //         setfiltered(response.data.users)
    //         toast.info(`Users fetched successfully!`, {
    //             style: {
    //                 fontFamily: 'Poppins',
    //                 fontSize: 12
    //             }
    //         })
    //     }).catch(err=>{
    //         toast.error(err.message, {
    //             style: {
    //                 fontFamily: 'Poppins',
    //                 fontSize: 12
    //             }
    //         })
    //     })
    // }

   // use effect
   useEffect(() => {
        // getUsers()
        setData(document.querySelectorAll("#ticket_wrapper tbody tr"));
        //chackboxFun();
	}, []);

  
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
		//settest(i);
	};

    const filter = e => {
        let input = e.currentTarget.value

        setfiltered(users.filter(user=>{
            return user.name.toLowerCase().includes(input.toLowerCase()) || user.email.toLowerCase().includes(input.toLowerCase())
        }))
    }
   
	const chackbox = document.querySelectorAll(".sorting_1 input");
	const motherChackBox = document.querySelector(".sorting_asc input");
	const chackboxFun = (type) => {
      for (let i = 0; i < chackbox.length; i++) {
         const element = chackbox[i];
         if (type === "all") {
            if (motherChackBox.checked) {
               element.checked = true;
            } else {
               element.checked = false;
            }
         } else {
            if (!element.checked) {
               motherChackBox.checked = false;
               break;
            } else {
               motherChackBox.checked = true;
            }
         }
      }
    };
    return (
        <>
            <div className="row page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><Link to={"#"}> Locations</Link></li>
                    <li className="breadcrumb-item"><Link to={"#"}> Villages</Link></li>
                </ol>
            </div>
            <div className="row">
                <Tab.Container defaultActiveKey="sites">
                    <div className='colxl-12'>
                        <div className="card">
                            <div className="card-body px-4 py-3 py-md-2">
                                <div className="row align-items-center">
                                    <div className="col-sm-12 col-md-7">
                                        <Nav as="ul" className="nav nav-pills review-tab" role="tablist">
                                            <Nav.Item as="li" className="nav-item">
                                                <Nav.Link className="nav-link  px-2 px-lg-3"  to="#sites" role="tab" eventKey="sites">
                                                    Villages
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li" className="nav-item">
                                                <Nav.Link className="nav-link px-2 px-lg-3" to="#sites-map" role="tab" eventKey="sites-map">
                                                    Map
                                                </Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-12 col-xxl-12">
                        <Tab.Content>
                            <Tab.Pane eventKey="sites" id='sites'>
							<div className="card">
									<div className="card-header">
										<h4 className="card-title">Villages List</h4>
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
													onClick={() => chackboxFun("all")}
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
												{/* <th
												className="sorting"
												tabIndex={0}
												aria-controls="example5"
												rowSpan={1}
												colSpan={1}
												aria-label="Patient ID: activate to sort column ascending"
												style={{ width: 73 }}
												>
												Patient ID
												</th> */}
												<th
												className="sorting"
												tabIndex={0}
												aria-controls="example5"
												rowSpan={1}
												colSpan={1}
												style={{ width: 100 }}
												>
												Village Name
												</th>
												<th
												className="sorting"
												tabIndex={0}
												aria-controls="example5"
												rowSpan={1}
												colSpan={1}
												style={{ width: 100 }}
												>
												Country
												</th>
												<th
												className="sorting"
												tabIndex={0}
												aria-controls="example5"
												rowSpan={1}
												colSpan={1}
												style={{ width: 120 }}
												>
												Mines in Village
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
												Action
												</th>
											</tr>
											</thead>
											<tbody>
											<tr role="row" className="odd">
												<td className="sorting_1">
												<div className="custom-control custom-checkbox ">
													<input
													type="checkbox"
													onClick={() => chackboxFun()}
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
												<td>Kigali</td>
												<td>Rwanda</td>
												<td>
												<span className="badge light badge-primary">
													<i className="fa fa-circle text-primary me-1" />
													3
												</span>
												</td>
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
														<Dropdown.Item>Add New Mine</Dropdown.Item>
														<Dropdown.Item>View Details</Dropdown.Item>
													</Dropdown.Menu>
												</Dropdown>
												</td>
											</tr>
											</tbody>
										</table>

										<div className="d-sm-flex text-center justify-content-between align-items-center mt-3">
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
										</div>
										</div>
									</div>
									</div>
								</div>
                            </Tab.Pane>
                            <Tab.Pane id='sites-map' eventKey={'sites-map'}>
                                <div className="card event-bx" style={{ height: '80vh', width: '100%' }}>
                                    <GoogleMapReact
                                        bootstrapURLKeys={{ key: apiKey }}
                                        defaultCenter={{ lng: -0.205874, lat: 5.614818 }}
                                        defaultZoom={11}
                                    >
                                        {/* <AnyReactComponent
                                            lng={-0.205874}
                                            lat={5.614818}
                                        /> */}
                                    </GoogleMapReact>
                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </Tab.Container>
            </div>
        </>
    );
};


export default Villages;