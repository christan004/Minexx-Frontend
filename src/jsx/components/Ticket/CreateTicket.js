import React from 'react';
import {Link} from 'react-router-dom';
import Select from 'react-select';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DropFile from '../AppsMenu/Email/Compose/DropFile';


const options = [
    { value: '1', label: 'Alabama' },
    { value: '2', label: 'Wyoming' },
]

const CreateTicket = () => {
    return (
        <>
            <div className="page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to={"#"}>Ticket</Link></li>
                    <li className="breadcrumb-item active"><Link to={"#"}>Create Ticket</Link></li>
                </ol>
            </div>
            
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="form-validation">
                                <div className="needs-validation" >
                                    <div className="row">
                                        <div className="col-xl-12">
                                            <div className="mb-3 row">
                                                <label className="col-lg-3 col-form-label" >Ticket Subject
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <div className="col-lg-9">
                                                    <input type="text" className="form-control"   placeholder="Subject" required />
                                                    <div className="invalid-feedback">
                                                        Please enter a username.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label className="col-lg-3 col-form-label" >Email address<span
                                                        className="text-danger">*</span>
                                                </label>
                                                <div className="col-lg-9">
                                                    <input type="text" className="form-control" placeholder="Your valid email.." required />
                                                    <div className="invalid-feedback">
                                                        Please enter a Email.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label className="col-lg-3 col-form-label">Ticket Category
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <div className="col-lg-9 Cms-selecter">                                                   
                                                    <Select options={options} className="custom-react-select mb-3 mb-xxl-0"/>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-xl-3">
                                                    <label className="col-lg-10 col-form-label" >Ticket Description <span
                                                    className="text-danger">*</span>
                                                    </label>
                                                </div>
                                                <div className="col-xl-9">
                                                    <div className="custom-ekeditor ct-ticket">
                                                        {/* <div id="ckeditor"></div> */}
                                                        <CKEditor
                                                            editor={ ClassicEditor }                                                       
                                                            onReady={ editor => {
                                                                console.log( 'Editor is ready to use!', editor );
                                                            } }
                                                            onChange={ ( event, editor ) => {
                                                                const data = editor.getData();
                                                                console.log( { event, editor, data } );
                                                            } }
                                                            onBlur={ ( event, editor ) => {
                                                                console.log( 'Blur.', editor );
                                                            } }
                                                            onFocus={ ( event, editor ) => {
                                                                console.log( 'Focus.', editor );
                                                            } }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <label className="col-lg-3 col-form-label">
                                                    Attatchment <span className="text-danger">*</span>
                                                </label>
                                                <div className="col-xl-9">
                                                    <div className="ticket-file"> 
                                                        <DropFile />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-3 row">
                                                <div className="col-lg-9 ms-auto">
                                                    <button type="submit" className="btn btn-primary">Submit</button>
                                                </div>
                                            </div>
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



export default CreateTicket;