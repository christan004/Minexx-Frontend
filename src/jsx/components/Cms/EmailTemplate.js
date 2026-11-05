import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import Select from 'react-select';
import Collapse from 'react-bootstrap/Collapse';

const options = [
    //{ value: '1', label: 'Select Status' },
    { value: '2', label: 'Published' },
    { value: '3', label: 'Draft' },
    { value: '4', label: 'Trash' },
    { value: '5', label: 'Private' },
    { value: '6', label: 'Pending' }
]


const tableData = [
    {number:"1", title:"Store Admin Registration"},
    {number:"2", title:"Create Store"},
];

const EmailTemplate = () =>{
    const [open, setOpen] = useState(true);
    const [open2, setOpen2] = useState(true);
    return(
        <>
            <div className="row">
                <div className="col-xl-12">
                    <div className="row page-titles mt-3 ">
                        <ol className="breadcrumb align-items-center justify-content-between mt-sm-0 mt-2">
                            <li className="breadcrumb-item"><Link to={"#"}>CMS</Link></li>
                            <li className="breadcrumb-item"><Link to={"#"}>Email Template</Link></li>
                            <li className="dropdown ms-auto my-2 my-sm-0">
                                <button className="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Actions 
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><Link to={"#"} className="dropdown-item">Action</Link></li>
                                    <li><Link to={"#"} className="dropdown-item">Another action</Link></li>
                                    <li><Link to={"#"} className="dropdown-item">Something else here</Link></li>
                                </ul>
                            </li>
                        </ol>
                    </div>
                    <div className="filter cm-content-box box-primary">
                        <div className={`content-title ${open ? "" : "collbord"  }`}>
                            <div className="cpa">
                                <i className="fas fa-filter me-2"></i>Filter
                            </div>
                            <div className="tools">
                                <Link to={"#"} className="expand SlideToolHeader"
                                    onClick={() => setOpen(!open)}
                                >
                                    <i className="fas fa-angle-up"></i>
                                </Link>
                            </div>
                        </div>                      
                        <Collapse in={open}>
                            <div className="cm-content-body form excerpt">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-xl-3 col-xxl-6">
                                            <input type="text" className="form-control mb-xl-0 mb-3" id="exampleFormControlInput1" placeholder="Title" />
                                        </div>
                                        <div className="col-xl-3 col-xxl-6">
                                            {/* <select className="from-select w-100 mb-xl-0 mb-3" aria-label="Default select example">
                                                <option selected>Select Status</option>
                                                <option value="1">Published</option>
                                                <option value="2">Draft</option>
                                                <option value="3">Trash</option>
                                                <option value="4">Private</option>
                                                <option value="5">Pending</option>
                                            </select>  */}
                                            <Select options={options} className="custom-react-select mb-3 mb-xxl-0"/>
                                        </div>
                                        <div className="col-xl-3 col-xxl-6">
                                            <input type="date" name="datepicker" className=" form-control mb-xxl-0 mb-3" />
                                        </div>
                                        <div className="col-xl-3 col-xxl-6">
                                            <button className="btn btn-info me-2" title="Click here to Search" type="button"><i className="fa fa-search me-1"></i>Filter</button>
                                            <button className="btn btn-danger" title="Click here to remove filter" type="button">Remove Filter</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Collapse>   
                    </div>
                    <div className="mb-3">
                        <ul className="d-flex align-items-center">
                            <li><Link to={"/add-email"} className="btn btn-primary">New Email Template</Link></li>
                        </ul>
                    </div>
                    <div className="filter cm-content-box box-primary mt-5">
                        <div className={`content-title ${open2 ? "" : "collbord"  }`}>
                            <div className="cpa">
                                <i class="far fa-envelope me-2"></i> Email Template List
                            </div>
                            <div className="tools">
                                <Link to={"#"} className="expand SlideToolHeader"
                                     onClick={() => setOpen2(!open2)}
                                >
                                    <i className="fas fa-angle-up"></i>
                                </Link>
                            </div>
                        </div>
                        <Collapse in={open2}>
                            <div className="cm-content-body form excerpt">
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-responsive-lg">
                                            <thead>
                                                <tr>
                                                    <th>Sr.No</th>
                                                    <th>Title</th>
                                                    <th>Status</th>
                                                    <th>Modified</th>
                                                    <th>Actions</th>
                                                    <th></th>                                                    
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.map((item, ind)=>(
                                                    <tr key={ind}>
                                                        <td>{item.number}</td>
                                                        <td>{item.title}</td>
                                                        <td><Link to={"#"} class=" btn btn-primary btn-sm content-icon status"><i class="fas fa-check"></i></Link></td>
														<td>02 Feb, 2015</td>
														<td>
                                                            <Link to={"#"} className="btn btn-secondary btn-sm content-icon me-1">
                                                                <i className="fa fa-edit"></i>
                                                            </Link>
                                                            <Link to={"#"} className="btn btn-danger btn-sm content-icon ms-1">
                                                                <i className="fa fa-times"></i>
                                                            </Link>
														</td>
														<td></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="d-flex align-items-center justify-content-lg-between flex-wrap justify-content-center">
                                            <span className="mb-2 mb-xl-0 me-3">Page 1 of 4, showing 2 records out of 8 total, starting on record 1, ending on 2</span>
                                            <nav aria-label="Page navigation example">
                                                <ul className="pagination mb-2 mb-xl-0">
                                                <li className="page-item"><Link to={"#"} className="page-link">Previous</Link></li>
                                                <li className="page-item"><Link to={"#"} className="page-link">1</Link></li>
                                                <li className="page-item"><Link to={"#"} className="page-link">2</Link></li>
                                                <li className="page-item"><Link to={"#"} className="page-link">3</Link></li>
                                                <li className="page-item"><Link to={"#"} className="page-link" >Next</Link></li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Collapse> 
                    </div>
                </div>
            </div>
        </>
    )
}
export default EmailTemplate;