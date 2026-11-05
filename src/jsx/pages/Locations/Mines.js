import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Accordion, Spinner, Row, Col } from 'react-bootstrap'
import { ThemeContext } from '../../../context/ThemeContext'
import PerfectScrollbar from "react-perfect-scrollbar"
import { baseURL_ } from '../../../config'
import { toast } from 'react-toastify';
import { Logout } from '../../../store/actions/AuthActions';
import axiosInstance from '../../../services/AxiosInstance';
import { useDispatch } from 'react-redux';
import { translations } from './MinesTranslation';

const Mines = ({ language,country }) => {
    const [user] = useState(JSON.parse(localStorage.getItem(`_authUsr`)));
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { changeTitle } = useContext(ThemeContext);
    const [suppliers, setsuppliers] = useState([])
    const [loading, setloading] = useState(true)
    const [mines, setmines] = useState([])
    const [init, setinit] = useState()
    const [filtered, setfiltered] = useState([])
    const apiHeaders = {
        'authorization': `Bearer ${localStorage.getItem('_authTkn')}`,
        'x-refresh': localStorage.getItem(`_authRfrsh`)
    }
    const t = (key) => {
        if (!translations[language]) {
          console.warn(`Translation for language "${language}" not found`);
          return key;
        }
        return translations[language][key] || key;
      };

    const fetch = async() => {
        try {
            
            let normalizedCountry = country.trim();
            
            // Special handling for Rwanda
            if (normalizedCountry.toLowerCase() === 'rwanda') {
                // Randomly choose one of the three formats
                 normalizedCountry ='.Rwanda';
                // normalizedCountry = formats[Math.floor(Math.random() * formats.length)];
            } else {
                // For other countries, remove leading/trailing dots and spaces
                normalizedCountry = normalizedCountry.replace(/^\.+|\.+$/g, '');
            }
            let response = await axiosInstance.get(`companies`,
                {
                    headers: apiHeaders,
                    params: {
                        country: normalizedCountry,
                    }
                })
            let response_ = await axiosInstance.get(`mines`, { headers: apiHeaders })
            setinit(response.data.companies[0].id)
            setsuppliers(response.data.companies)
            setfiltered(response.data.companies)
            setmines(response_.data.mines)
            setloading(false)
        } catch (err) {
            setloading(false)
            try {
                if (err.response.code === 403) { 
                    dispatch(Logout(navigate))
                } else {
                   // toast.warn(err.response.message)
                }
            } catch (e) {
                //toast.error(err.message)
            }
        }
    }

    useEffect(() => {
        fetch()
        changeTitle(`${t('Mines')} | Minexx`)
    }, [language,country]);

    const filter = e => {
        let input = e.currentTarget.value
        setfiltered(suppliers.filter(site => {
            return site.name.toLowerCase().includes(input.toLowerCase())
        }))
    }

    return (
        <>
            <div className="row page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><Link to={"/overview"}> {t("Dashboard")}</Link></li>
                    <li className="breadcrumb-item"><Link to={""}> {t('Mines')}</Link></li>
                </ol>
            </div>
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className='card-header'>
                            <h4 className='card-title'> {t('Mines')}</h4>
                            <div className='col-md-3'>
                                <input className='form-control' placeholder={t('Search')} onChange={filter} />
                            </div>
                        </div>
                        <div className='card-body'>
                            {loading ? <center><Spinner size="md" style={{ margin: 25 }} role="status" variant="primary"><span className="visually-hidden">Loading...</span></Spinner></center> :
                                <PerfectScrollbar className="card-body dz-scroll" style={{ overflow: 'hidden' }}>
                                    <Row className="mt-2">
                                        {filtered.map((supplier, index) => (
                                            <Col xs={12} sm={6} md={4} lg={3} key={supplier?.id} className="mb-3">
                                                <Accordion className="accordion accordion-rounded-stylish accordion-bordered">
                                                    <Accordion.Item className="accordion-item" eventKey={supplier?.id}>
                                                    <Accordion.Header className="accordion-header rounded-lg d-flex justify-content-between align-items-center">
                                                        <div className="d-flex align-items-center" style={{ marginRight: '10px' }}>
                                                        <span className='text-primary'>
                                                                                                                        {supplier?.name} <span className='badge badge-primary ml-2'>{mines.filter(single => single.company === supplier.id).length}</span>
                                                                                                                    </span>
                                                        </div>
                                                    </Accordion.Header>


                                                        <Accordion.Collapse id={supplier?.id} eventKey={supplier?.id}>
                                                            <div className="accordion-body">
                                                                {mines.filter(single => single.company === supplier.id).length === 0 ? <div className='pa-5 text-center'>{t('nomine')} {supplier.name}</div>
                                                                    : mines.filter(single => single.company === supplier.id).map(mine => (
                                                                        <p className='mt-2 mb-2' key={mine.id}>
                                                                            <Link className='text-warning' to={`/mines/${mine.id}`}>{mine.name}</Link><br />
                                                                          
                                                                        </p>
                                                                    ))}
                                                                      <Link className='text-warning' to={`/Kyc/${supplier.id}`}>KYC</Link>
                                                            </div>
                                                        </Accordion.Collapse>
                                                    </Accordion.Item>
                                                </Accordion>
                                            </Col>
                                        ))}
                                    </Row>
                                </PerfectScrollbar>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Mines;