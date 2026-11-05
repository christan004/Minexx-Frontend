import React, { useEffect, useState } from 'react'
import { connect, useDispatch, useStore } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'
import { loadingToggleAction,loginAction,
} from '../../store/actions/AuthActions';

//
import logo from '../../images/logo.png'
import login from "../../images/bg-login2.png";
import loginbg from "../../images/bg-login.jpg";

function Login (props) {
    const navigate = useNavigate();
    const store = useStore()
    const [email, setEmail] = useState('');
    let errorsObj = { email: '', password: '' };
    const [remember, setremember] = useState(true)
    const [errors, setErrors] = useState(errorsObj);
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    function onLogin(e) {
        e.preventDefault();
        let error = false;
        const errorObj = { ...errorsObj };
        if (email === '') {
            errorObj.email = 'Email is Required';
            error = true;
        }
        if (password === '') {
            errorObj.password = 'Password is Required';
            error = true;
        }
        setErrors(errorObj);
        if (error) {
          return ;
        }
		    dispatch(loadingToggleAction(true));	
        dispatch(loginAction(email, password, navigate));
    }

    useEffect(() => {
      if(props.successMessage){
        if (props.successMessage === 'Login Successfully Completed'){
          navigate('/overview')
        }
      }
    }, [])
    

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
                            <Link to={"https://minexx.co"} className="">&copy; 2025 Minexx</Link>
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
                                          <strong>Email</strong>
                                        </label>
                                        <input type="email" className="form-control"
                                          value={email}
                                           onChange={(e) => setEmail(e.target.value)}
                                        />
                                      {errors.email && <div className="text-danger fs-12">{errors.email}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="mb-2 "><strong>Password</strong></label>
                                        <input
                                          type="password"
                                          className="form-control"
                                          value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                        />
                                        {errors.password && <div className="text-danger fs-12">{errors.password}</div>}
                                    </div>
                                    <div className="form-row d-flex justify-content-between mt-4 mb-2">
                                      <div className="form-group">
                                        <div className="form-check custom-checkbox ms-1 ">
                                          <input
                                            type="checkbox"
                                            defaultChecked
                                            value={remember}
                                            onChange={setremember}
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
                                        disabled={props.showLoading}
                                        type="submit"
                                        className="btn btn-primary btn-block"
                                      >
                                        { props.showLoading ? `Please wait...` : `Sign In` }
                                      </button>
                                    </div>
                                </form>
                                <div className="new-account mt-2">
                                  <p className="">
                                    Forgot your password?{" "}
                                    <Link className="text-primary" to="/forgot-password">
                                      Reset Password
                                    </Link>
                                  </p>
                                </div>
                                <div>
                                  {/* <p>
                                  <Link className="text-primary" to="/kyc-login">
                                     Click Here to Upload Kyc Document
                                  </Link>
                                  </p> */}

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
export default connect(mapStateToProps)(Login);