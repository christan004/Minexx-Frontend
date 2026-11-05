import React,{useState, useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import {Nav, Tab} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import GoogleMapReact from 'google-map-react';
import PerfectScrollbar from "react-perfect-scrollbar";
import { apiKey } from '../../../config'
import axios from 'axios';
import { toast } from 'react-toastify';

const MineSites = () => {
    const [data, setData] = useState(
		document.querySelectorAll("#ticket_wrapper tbody tr")
	);
    const [mines, setmines] = useState([])
	const sort = 10;
	const activePag = useRef(0);
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

    const fetch = async()=>{
        try{
            let response = await axios.get(`https://pthxuif38b.execute-api.us-east-1.amazonaws.com/mines`)
            setmines(response.data.mines)
            setfiltered(response.data.mines)
        }catch(err){
            try{
                //toast.warn(err.response.data.message)
            }catch(e){
                toast.warn(err.message)
            }
        }
    }

    // use effect
    useEffect(() => {
        fetch()
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
        setfiltered(mines.filter(site=>{
            return site.name.toLowerCase().includes(input.toLowerCase())
        }))
    }
   
	const chackbox = document.querySelectorAll(".sorting_1 input");
	const motherChackBox = document.querySelector(".sorting_asc input");
   // console.log(document.querySelectorAll(".sorting_1 input")[0].checked);
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
                    <li className="breadcrumb-item active"><Link to={"#"}> Locations</Link></li>
                    <li className="breadcrumb-item"><Link to={"#"}> Mine Sites</Link></li>
                </ol>
            </div>
            <div className="row">
                <Tab.Container defaultActiveKey="sites">
                    <div className='colxl-12'>
                        <div className="card">
                            <div className="card-body px-4 py-3 py-md-2">
                                <div className="row align-items-center">
                                    <div className="col-sm-12 col-md-7">
                                        <Nav as="ul" className="nav nav-pills review-tab" role="tablist">
                                            <Nav.Item as="li" className="nav-item">
                                                <Nav.Link className="nav-link  px-2 px-lg-3"  to="#sites" role="tab" eventKey="sites">
                                                    Mine Sites
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li" className="nav-item">
                                                <Nav.Link className="nav-link px-2 px-lg-3" to="#sites-map" role="tab" eventKey="sites-map">
                                                    Map
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <input className='form-control' placeholder='Search for mine site...' onChange={filter}/>
                                            </Nav.Item>
                                        </Nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-12 col-xxl-12">
                        <Tab.Content>
                            <Tab.Pane eventKey="sites" id='sites'>
                                <div className="card event-bx">
                                    <div className="card-header border-0 pb-0">
                                        <h4 className="fs-20">Mine Sites</h4>
                                        {/* <DropdownBlog /> */}
                                    </div>
                                    <PerfectScrollbar className="card-body dz-scroll" style={{ height: 600 }}>
                                        {filtered.map((mine, index)=>(
                                            <div className="media d-md-flex d-block pb-3 border-bottom mb-3" key={index}>
                                                <div className="image">	
                                                    <img src={`https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png`} alt="" />
                                                    {/* <i className="las la-film image-icon"></i> */}
                                                </div>
                                                <div className="media-body">
                                                    <h4 className="fs-18 mb-sm-0 mb-2"><Link to={"#"}> {mine.name}</Link></h4>
                                                    <Link to={mine?.company ? `/company/${mine?.company?.id}` : `#`}><span className={`fs-14 d-block mb-sm-3 mb-2 ${mine.company ? 'text-primary' : 'text-warning'}`}>{mine.company ? mine.company?.name : `Missing company details`}</span></Link>
                                                    <p className="fs-12">{mine?.note}</p>
                                                </div>
                                                <div className="media-footer">
                                                    <div className="text-center">
                                                        {/* {item.iconblog1} */}
                                                        <i className="fas fa-gem"></i>
                                                        <div className="fs-12 text-white">{mine.mineral}</div>
                                                    </div>
                                                    <div className="text-center">
                                                        {/* {item.iconblog2} */}
                                                        <FontAwesomeIcon icon={icon({name: 'scale-unbalanced'})} />
                                                        <div className="fs-12 text-white">1M tons</div>
                                                    </div>
                                                    <div className="text-center" style={{ maxWidth: 100 }}>
                                                        {/* {item.iconblog3} */}
                                                        <i className="far fa-map"></i>
                                                        <div className="fs-12 text-white">{mine.location ? mine.location : 'n/a'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                    </PerfectScrollbar>
                                </div>
                            </Tab.Pane>
                            <Tab.Pane id='sites-map' eventKey={'sites-map'}>
                                <div className="card event-bx" style={{ height: '80vh', width: '100%' }}>
                                    <GoogleMapReact
                                        bootstrapURLKeys={{ key: apiKey }}
                                        defaultCenter={{ lng: -0.205874, lat: 5.614818 }}
                                        defaultZoom={11}
                                    >
                                        {/* <AnyReactComponent
                                            lng={-0.205874}
                                            lat={5.614818}
                                        /> */}
                                    </GoogleMapReact>
                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </Tab.Container>
            </div>
        </>
    );
};


export default MineSites;