import React,{useState, useEffect} from 'react';
import { baseURL_ } from '../../config'
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Logout } from '../../store/actions/AuthActions';
import { useDispatch } from 'react-redux';

const SummaryReport = () => {
    const navigate = useNavigate()
	const dispatch = useDispatch()
    const [logs, setlogs] = useState([])
    const [filtered, setfiltered] = useState([])
    const [sessions, setsessions] = useState([])
    const [filteredSessions, setfilteredSessions] = useState([])
    const apiHeaders = {
        'authorization': `Bearer ${localStorage.getItem('_authTkn')}`,
        'x-refresh': localStorage.getItem(`_authRfrsh`)
    }

    const loadLogs = ()=>{
        //fetch api logs
        axios.get(`${baseURL_}logs`, {
            headers: apiHeaders
        }).then(response=>{
            setlogs(response.data.logs)
            setfiltered(response.data.logs)
        }).catch(err=>{
            try{
				if(err.response.code === 403){
					dispatch(Logout(navigate))
				}else{
					toast.warn(err.response.message)
				}
			}catch(e){
				toast.error(err.message)
			}
        })
    }

    const loadSessions = ()=>{
        //fetch user sessions
        axios.get(`${baseURL_}sessions`, {
            headers: apiHeaders
        }).then(response=>{
            setsessions(response.data.sessions)
            setfilteredSessions(response.data.sessions)
        }).catch(err=>{
            try{
				if(err.response.code === 403){
					dispatch(Logout(navigate))
				}else{
					toast.warn(err.response.message)
				}
			}catch(e){
				toast.error(err.message)
			}
        })
    }

    const filterlogs = (e)=>{
        const input = e.currentTarget.value
        setfiltered(logs.filter(log=>log.type.toLowerCase().includes(input.toLowerCase()) || log.user.toLowerCase().includes(input.toLowerCase()) || log.message.toLowerCase().includes(input.toLowerCase()) || (log?.endpoint.toLowerCase().includes(input.toLowerCase())) || log.time.toLowerCase().includes(input.toLowerCase())))
    }

    const filterSessions = (e)=>{
        const input = e.currentTarget.value
        if(input === "0"){
            setfilteredSessions(sessions)
        }else{
            const valid = input === "true"
            setfilteredSessions(sessions.filter(session=>session.valid === valid))
        }
    }

    const terminateSession = (id) => {
        axios.delete(`${baseURL_}sessions/${id}`, {
            headers: apiHeaders,
        }).then(response=>{
            toast.success("The session has been terminated successfully!")
            loadSessions()
        })
    }

    const terminateAllSession = () => {
        axios.delete(`${baseURL_}sessions`, {
            headers: apiHeaders,
        }).then(response=>{
            toast.success("All user sessions have been terminated successfully! User's will be prompted to login again")
            loadSessions()
        })
    }

   // use effect
   useEffect(() => {
      loadLogs()
      loadSessions()
	}, []);

  
    return (
        <div>
            <div className="page-titles">
				<ol className="breadcrumb">
					<li className="breadcrumb-item active"><Link to={"#"}>Dashboard</Link></li>
					<li className="breadcrumb-item"><Link to={"#"} >Summary Logs</Link></li>
				</ol>
			</div>
            <div className="row">
                <div className="col-xl-6 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">API Requests Logs</h4>
                            <div className="col-md-4">
                                <input type="search" placeholder="Filter logs" onChange={filterlogs} className="form-control"/>
                            </div>
                        </div>
                        <div className="card-body" style={{ height: '70vh', overflow: 'scroll'}}>
                        { filtered.filter(l=>l.endpoint && l?.endpoint !== '/logs').map(log=>{
                            return <div><div key={log.id} className={`row ${log.type === 'warn' ? 'text-warning' : log.type === 'success' ? 'text-success' : 'text-danger' }`}>
                            <div className='col-md-3'><small>{log.time.substring(0, 10)} [{log.time.substring(11, 16)}]</small></div>
                            <div className='col-md-3'><small>{log?.endpoint ? log?.endpoint.toString() : 'CRON JOB'}</small></div>
                            <div className='col-md-6'><small>[User ID: {log.user}] {log.message}</small></div>
                        </div>
                        <hr/>
                        </div>
                        }) }
                        </div>
                    </div>
                </div>
                <div className="col-xl-6 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">User Sessions</h4>
                            <div className="col-md-3"><button className='btn btn-sm btn-danger' onClick={()=>terminateAllSession()}>Terminate All</button></div>
                            <div className="col-md-3">
                                <select placeholder="Filter Sessions" onChange={filterSessions} className="form-select">
                                    <option value={0}>All Sessions</option>
                                    <option value={true}>Active Sessions</option>
                                    <option value={false}>Inactive Sessions</option>
                                </select>
                            </div>
                        </div>
                        <div className="card-body" style={{ height: '70vh', overflow: 'scroll'}}>
                        { filteredSessions.map(session=>{
                            return <div><div key={session.id} className={`row`}>
                            <div className='col-md-3'><button onClick={()=>terminateSession(session.id)} className={`btn btn-xs btn-outline-${session.valid ? 'success' : 'warning' }`}>{session.created.substring(0, 10)} [{session.created.substring(11, 16)}]</button></div>
                            <div className='col-md-3'><small>{session.userAgent}</small></div>
                            <div className='col-md-6'><small>[User ID: {session.user}] From IP {session.ipAddress}</small></div>
                        </div>
                        <hr/>
                        </div>
                        }) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryReport;