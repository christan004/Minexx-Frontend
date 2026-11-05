import React, { useEffect, useState } from 'react'
import { connect, useDispatch, useStore } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import {baseURL_} from "../../config";
import { loadingToggleAction, loginAction } from '../../store/actions/AuthActions';

//
import logo from '../../images/logo.png'
import login from "../../images/bg-login2.png";
import loginbg from "../../images/bg-login.jpg";

function KycLogin (props) {
    const navigate = useNavigate();
    const store = useStore()
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [isValidID, setIsValidID] = useState(false);
    let errorsObj = { email: '', password: '' };
    const [remember, setremember] = useState(true)
    const [errors, setErrors] = useState(errorsObj);
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    // Function to fetch company info by Unique ID
    const kycfetchid = async (uniqueID) => {
        if (!uniqueID) return;
        
        try {
            dispatch(loadingToggleAction(true));
            const response = await axios.get(`${baseURL_}kyc/login/${uniqueID}`);
            dispatch(loadingToggleAction(false));
            
            if (response.data && response.data.success) {
                console.log("API response", response.data.company);
                setCompanyName(response.data.company.name);
                setIsValidID(true);
            } else {
                setCompanyName('');
                setIsValidID(false);
            }
        } catch (error) {
            dispatch(loadingToggleAction(false));
            console.error("Error fetching the Company Info", error);
            setCompanyName('');
            setIsValidID(false);
        }
    };
    
    // Handle Unique ID input change
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        
        // If the input is not empty, try to fetch company info
        if (value) {
            kycfetchid(value);
        } else {
            setCompanyName('');
            setIsValidID(false);
        }
    };

    function onLogin(e) {
        e.preventDefault();
        let error = false;
        const errorObj = { ...errorsObj };
        
        if (email === '') {
            errorObj.email = 'UniqueID is Required';
            error = true;
        }
        
        if (!isValidID) {
            errorObj.email = 'Invalid UniqueID';
            error = true;
        }
      
        setErrors(errorObj);
        if (error) {
            return;
        }
        
        // Now proceed with login since the ID is valid
        dispatch(loadingToggleAction(true));
        
        // Redirect to kyc_upload page instead of standard login flow
        navigate(`/kyc_upload/${email}`);
        
        // If you still need to dispatch login action (e.g., for state management)
        // you can keep this line but modify the navigate destination in the action
        // dispatch(loginAction(email, password, navigate));
    }

    useEffect(() => {
        if(props.successMessage){
            if (props.successMessage === 'Login Successfully Completed'){
                // Changed from '/overview' to '/kyc_upload' to match your requirements
                navigate('/kyc_upload');
            }
        }
    }, [props.successMessage, navigate]);

    return (
        <div className="login-main-page" style={{backgroundImage:"url("+ loginbg +")"}}>
            <div className="login-wrapper">
                <div className="login-aside-left" style={{backgroundImage:"url("+ login +")"}}>
                    <Link to="/" className="login-logo">
                        <img src={logo} style={{ width: 200 }} alt="" />
                    </Link>
                    <div className="login-description">
                        <h2 className="mb-2">Connecting Miners to the World</h2>
                        <p className="fs-12">Digital traceability and trading platform giving access to markets, capital and expertise.</p>
                        <ul className="social-icons mt-4">
                            {/* <li><Link to={"#"}><i className="fab fa-facebook-f"></i></Link></li> */}
                            <li><Link to={"https://uk.linkedin.com/company/minexx"}><i className="fab fa-linkedin-in"></i></Link></li>
                            {/* <li><Link to={"#"}><i className="fab fa-linkedin-in"></i></Link></li> */}
                        </ul>
                        <div className="mt-5">
                            <Link to={"https://minexx.co/technology"} className=" me-4">Technology</Link>
                            <Link to={"https://minexx.co/contact"} className=" me-4">Contact</Link>
                            <Link to={"https://minexx.co"} className="">&copy; 2023 Minexx</Link>
                        </div>
                    </div>
                </div>
                <div className="login-aside-right">
                    <div className="row m-0 justify-content-center h-100 align-items-center">
                      <div className="col-xl-7 col-xxl-7">
                        <div className="authincation-content">
                          <div className="row no-gutters">
                            <div className="col-xl-12">
                              <div className="auth-form-1">
                                <div className="mb-4">
                                    <h3 className="text-primary mb-1">Welcome to Minexx</h3>
                                    <p className="">Sign in by entering information below</p>
                                </div>
                                {props.errorMessage && (
                                    <div className='text-red border-red my-4'>
                                        {props.errorMessage}
                                    </div>
                                )}
                                {props.successMessage && (
                                    <div className='text-green border-green-900 my-4'>
                                        {props.successMessage}
                                    </div>
                                )}
                                <form onSubmit={onLogin}>
                                    <div className="form-group">
                                        <label className="mb-2 ">
                                          <strong>Unique ID</strong>
                                        </label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            value={email}
                                            onChange={handleEmailChange}
                                        />
                                        {errors.email && <div className="text-danger fs-12">{errors.email}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="mb-2 "><strong>Company Name</strong></label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={companyName}
                                          disabled
                                          placeholder={props.showLoading ? "Loading..." : "Enter Unique ID above"}
                                        />
                                    </div>
                                    <div className="form-row d-flex justify-content-between mt-4 mb-2">
                                      <div className="form-group">
                                        <div className="form-check custom-checkbox ms-1 ">
                                          <input
                                            type="checkbox"
                                            defaultChecked
                                            checked={remember}
                                            onChange={(e) => setremember(e.target.checked)}
                                            className="form-check-input"
                                            id="basic_checkbox_1"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="basic_checkbox_1"
                                          >
                                            Remember me
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <button
                                        disabled={props.showLoading || !isValidID}
                                        type="submit"
                                        className="btn btn-primary btn-block"
                                      >
                                        { props.showLoading ? `Please wait...` : `Sign In` }
                                      </button>
                                    </div>
                                </form>
                                <div className="new-account mt-5">
                                    <p className="">
                                        Forgot your Unique Id? Kindly Contact Minexx{" "}
                                    </p>
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
    )
}

const mapStateToProps = (state) => {
    return {
        errorMessage: state.auth.errorMessage,
        successMessage: state.auth.successMessage,
        showLoading: state.auth.showLoading,
    };
};
export default connect(mapStateToProps)(KycLogin);