import React from 'react';
import { Accordion } from 'react-bootstrap';

import {MenuAccordBlog1, MenuAccordBlog2} from './MenuAccord';

const defaultAccordion = [
    { title: "Contact Us" , subtitle:'Category', details : <MenuAccordBlog1 />  },
    { title: "Privacy Policy",subtitle:'Fashion', details: <MenuAccordBlog2 />  },
    { title: "Terms and Conditions",subtitle:'Lifestyle',  details: <MenuAccordBlog2 />  },
    { title: "About Us" ,subtitle:'Food', details: <MenuAccordBlog2 />  },
    { title: "Important Information", subtitle:'Beauty',  details: <MenuAccordBlog2 />  },
];

const MenusBlog2 = () => {
    return (
        <>
            <div className="filter cm-content-box box-primary">
                <div className="content-title flex-wrap">
                    <div className="cpa d-flex align-items-center flex-wrap">
                        Menu Name
                        <input type="text" className="form-control w-auto ms-2" placeholder="information" />
                    </div>
                    <button type="submit" className="btn btn-secondary ms-sm-auto mb-2 mb-sm-0">Save Menu</button>
                </div>
                <div className="cm-content-body form excerpt">
                    <div className="card-body">
                        <h6 className="mb-0 fs-18">Menu Structure</h6>
                        <p>Add menu items from the column on the left.</p>
                        <div className="col-xl-12 nestable">
                            <div className="dd" id="nestable">
                                <ol className="dd-list ps-0" id="accordionExample-1">                                    
                                    <li className="dd-item menu-ac-item" data-id="2">
                                        <Accordion className="accordion" defaultActiveKey="-1">
                                            {defaultAccordion.map((d, i) => (
                                                <Accordion.Item className="accordion-item" key={i} eventKey={`${i}`}>
                                                    <Accordion.Header className="accordion-header rounded-lg">
                                                        <div className="move-media dd-handle">
                                                            <i className="fas fa-arrows-alt"></i>
                                                        </div>
                                                        {d.title} <span className="badge badge-primary ms-2">{d.subtitle}</span>
                                                    </Accordion.Header>
                                                    <Accordion.Collapse eventKey={`${i}`}>
                                                        <div className="accordion-body">{d.details}</div>
                                                    </Accordion.Collapse>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>		
                </div>
                <div className="filter cm-content-box box-primary style-1 mb-0 border-0 ">
                    <div className="content-title border-bot">
                        <div className="cpa">
                            Delete Menu
                        </div>
                        <button type="submit" className="btn btn-secondary my-2">Save Menu</button>
                    </div>
                </div>
            </div>            
        </>
    );
};



export default MenusBlog2;