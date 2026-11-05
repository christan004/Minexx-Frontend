import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {Tab, Nav, Collapse} from 'react-bootstrap';

const MenusBlog = () =>{
    const [open, setOpen] = useState(true);
    const [open2, setOpen2] = useState(true);
    return(
        <>
            <div className="filter cm-content-box box-primary">
                <div className="content-title">
                    <div className="cpa">
                        Menus
                    </div>
                    <div className="tools">
                        <Link to={"#"} className="expand SlideToolHeader"></Link>
                    </div>
                </div>
                <div className="cm-content-body form excerpt">
                    <div className="card-body">
                        <div className="filter cm-content box-primary">
                            <div className="content-title">
                                <div className="cpa">
                                    page
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
                                <div className="cm-content-inner form excerpt">
                                    <div className="card-body">
                                        <Tab.Container defaultActiveKey="View">
                                            <Nav as="ul" className=" tab-my nav nav-tabs" id="myTab" >
                                                <Nav.Item as="li" className="nav-item me-1" role="presentation">
                                                    <Nav.Link as="button"  eventKey="View"  type="button">View All</Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item as="li"  className="nav-item ms-1">
                                                    <Nav.Link as="button" eventKey="Search"   type="button">Search</Nav.Link>
                                                </Nav.Item>                                        
                                            </Nav>
                                            <Tab.Content className="tab-content" id="myTabContent">
                                                <Tab.Pane  eventKey="View">
                                                    <div className="menu-tabs">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                                            <label className="form-check-label" htmlFor="flexCheckDefault">
                                                                Privacy Policy 
                                                            </label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault-1" />
                                                            <label className="form-check-label" htmlFor="flexCheckDefault-1">
                                                                Contact Us 
                                                            </label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault-2" />
                                                            <label className="form-check-label" htmlFor="flexCheckDefault-2">
                                                                Important Information 
                                                            </label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault-3" />
                                                            <label className="form-check-label" htmlFor="flexCheckDefault-3">
                                                                About Us 
                                                            </label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault-4" />
                                                            <label className="form-check-label" htmlFor="flexCheckDefault-4">
                                                            Dummy Co 
                                                            </label>
                                                        </div>
                                                        <div className="d-flex align-items-center flex-wrap">
                                                            <Link to={"#"} className="text-primary fs-14">Select All</Link><span className="mx-2">|</span>
                                                            <Link to={"#"} className="text-primary me-2 fs-14">Deselect All</Link>
                                                        </div>
                                                    </div>
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="Search">
                                                    <div className="menu-tabs">
                                                        <label htmlFor="exampleFormControlInput1" className="form-label">Search</label>
                                                        <input type="text" className="form-control" id="exampleFormControlInput1" placeholder="Enter Page Name" />
                                                    </div>                                                    
                                                </Tab.Pane>
                                                <div className="d-flex align-items-center flex-wrap">                                                
                                                    <button type="submit" className="btn btn-primary dalb-menu-btn">Add to Menu</button>
                                                </div>
                                            </Tab.Content>
                                        </Tab.Container>
                                    </div>
                                    
                                </div>
                            </Collapse>
                        </div>
                        <div className="filter cm-content box-primary">
                            <div className="content-title">
                                <div className="cpa">
                                    Links 
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
                                <div className="cm-content-inner form excerpt">
                                    <div className="card-body">
                                        <div className="row align-items-center">
                                            <div className="col-xl-4">
                                                <h6>URL</h6>
                                            </div>
                                            <div className="col-xl-8">
                                                <input type="text" className="form-control mb-2" placeholder="" />
                                            </div>
                                            <div className="col-xl-4">
                                                <h6>Link Text</h6>
                                            </div>
                                            <div className="col-xl-8">
                                                <input type="text" className="form-control" placeholder="Menu items" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Collapse>
                        </div>
                    </div>
                </div>
            </div>   
        </>
    )
}

export default MenusBlog