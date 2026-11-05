import React, {useState} from "react";
import logo from "../../images/logo.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { baseURL_ } from "../../config";

const ForgotPassword = ({ history }) => {
  const [email, setemail] = useState()
  const [loading, setloading] = useState(false)
  const onSubmit = (e) => {
    e.preventDefault();
    if(email){
      if(email.length<8){
        return
      }
      axios.post(`${baseURL_}forgot`, {email}).then(response=>{
        setloading(false)
        setemail()
        toast.success(response.data.message)
      }).catch(err=>{
        setloading(false)
        try{
          toast.error(err.response.data.message)
        }catch(e){
          toast.warn(err.message)
        }
      })
    }
  };
  return (
    <div className="authincation h-100 p-meddle">
      <div className="container h-100">
        {" "}
        <div className="row justify-content-center h-100 align-items-center">
          <div className="col-md-6">
            <div className="authincation-content">
              <div className="row no-gutters">
                <div className="col-xl-12">
                  <div className="auth-form">
                    <div className="text-center mb-3">
                      <Link to="/">
                        <img src={logo} style={{ width: 200 }} alt="" />
                      </Link>
                    </div>
                    <h4 className="text-center mb-4 text-white">
                      Forgot Password
                    </h4>
                    <form onSubmit={(e) => onSubmit(e)}>
                      <div className="form-group">
                        <label className="text-white">
                          <strong>Email</strong>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={e=>setemail(e.currentTarget.value)}
                          className="form-control"
                          placeholder="Email address"
                        />
                      </div>
                      <div className="text-center">
                        <input
                          disabled={loading}
                          type="submit"
                          value={loading ? "Please wait..." : "Reset Password"}
                          className="btn bg-white text-primary btn-block"
                        />
                      </div>
                    </form>
                    <div className="text-center mt-4 text-primary">
                      <Link className="text-primary" to="/login">
                          Back to Login
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
