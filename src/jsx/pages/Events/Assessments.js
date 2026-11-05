import React,{useState, useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import {Button, Dropdown, Modal} from 'react-bootstrap';
import { useDispatch } from 'react-redux';

const Assessments = () => {
    const [data, setData] = useState(
		document.querySelectorAll("#ticket_wrapper tbody tr")
	);
	const sort = 10;
	const [assessment, setassessment] = useState()
	const activePag = useRef(0);
	const dispatch = useDispatch()

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

   // use effect
   useEffect(() => {
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
                    <li className="breadcrumb-item active"><Link to={"#"}> Events</Link></li>
                    <li className="breadcrumb-item"><Link to={"/mines"}> Mines</Link></li>
                    <li className="breadcrumb-item"><Link to={"#"}> Assessments</Link></li>
                </ol>
            </div>
			<Modal show={assessment} className="modal fade" id="details" onHide={() => setassessment(false)}>
				<div className="modal-content">
					<div className="modal-header">
						<h3 className="modal-title">Assessment Details</h3>
						<Button variant="" type="button" className="close" data-dismiss="modal" onClick={() => setassessment(false)} >
							<span>×</span>
						</Button>
						
					</div>
					<div className="modal-body">
						All assessment details would appear here as recorded on the app.
					</div>
				</div>
			</Modal>
            <div className="row">
				<div className="col-xl-12 col-xxl-12">
					<div className="card">
						<div className="card-header">
							<h4 className="card-title">Assessments List</h4>
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
											<th
											className="sorting"
											tabIndex={0}
											aria-controls="example5"
											rowSpan={1}
											colSpan={1}
											style={{ width: 73 }}
											>
											Name of Mining Entity
											</th>
											<th
											className="sorting"
											tabIndex={0}
											aria-controls="example5"
											rowSpan={1}
											colSpan={1}
											style={{ width: 100 }}
											>
											Tax ID
											</th>
											<th
											className="sorting"
											tabIndex={0}
											aria-controls="example5"
											rowSpan={1}
											colSpan={1}
											style={{ width: 100 }}
											>
											Type of Entity
											</th>
											<th
											className="sorting"
											tabIndex={0}
											aria-controls="example5"
											rowSpan={1}
											colSpan={1}
											style={{ width: 120 }}
											>
											Mine License Number
											</th>
											<th
											className="sorting"
											tabIndex={0}
											aria-controls="example5"
											rowSpan={1}
											colSpan={1}
											style={{ width: 106 }}
											>
											Type of Mineral/Concetrate
											</th>
											<th
											className="sorting"
											tabIndex={0}
											aria-controls="example5"
											rowSpan={1}
											colSpan={1}
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
											<td>GAMICO LTD</td>
											<td>102755533</td>
											<td>Company</td>
											<td>RMB/ME/04/022021/022025</td>
											<td>
											<span className="badge light badge-warning">
												{/* <i className="fa fa-circle text-danger me-1" /> */}
												Cassiterite
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
												{/* <Dropdown.Item>Update Mine</Dropdown.Item> */}
												{/* <Dropdown.Item>Reject Order</Dropdown.Item> */}
												<Dropdown.Item onClick={()=>setassessment(true)}>View Full Details</Dropdown.Item>
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
				</div>
            </div>
        </>
    );
};


export default Assessments;