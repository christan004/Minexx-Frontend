import React, { Fragment, useContext, useEffect, useState } from 'react';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown } from "react-bootstrap";
import { baseURL_ } from '../../../config'
import { subMonths } from 'date-fns'
import { ThemeContext } from '../../../context/ThemeContext';
import { Logout } from '../../../store/actions/AuthActions';
import axiosInstance from '../../../services/AxiosInstance';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { translations } from './Hometranslations';
import { LanguageContext, LanguageProvider } from './LanguageContext';
import MetalPricesChart from './MetalPricesChart';
import TrendingAssets from './TrendingAssets';
import MineralsPriceTable from './MineralsPriceTable';
import MineVolumeChart from './MineVolumeChart';
import PricePredictionCard from './PricePredictionCard';
import PricePredictionCardGold from './PricePredictionCardGold';
import TotalStockDelivery from './TotalStockDelivery';
import LiveScreenCard from './LiveScreenCard';


const Doughnutchart = loadable(() =>
  pMinDelay(import("./../Karciz/Dashboard/Doughnutchart"), 1000)
);
const SellingApexChart = loadable(() =>
  pMinDelay(import("./../Karciz/EventPage/SellingApexChart"), 1000)
);
const HomeSalesRevenueChart = loadable(() =>
  pMinDelay(import("./../Karciz/Dashboard/HomeSalesRevenueChart"), 1000)
);

function Home({ language, country }) {
  const { changeBackground, changeTitle } = useContext(ThemeContext);
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [access, setAccess] = useState(localStorage.getItem(`_dash`) || '3ts')
  const [showexports, setshowexports] = useState(true)
  const [showassessments, setshowassessments] = useState(true)
  const [showincidents, setshowincidents] = useState(true)
  const [incidents, setincidents] = useState([])
  const [rates, setrates] = useState({
    "USDLME-TIN": "",
    "USDTIN": "", 
    "USDTIN3M": ""
  });
  const [apiData, setApiData] = useState({
    data: {
      data: {
        'TIN': {},
        'LME-TIN': {},
        'TIN3M': {},
        'COPPER':{}
      }
    }
  });
 
  const [loading, setloading] = useState(true)
  const [exportweight, setexportweight] = useState(0)
  const months = [
    subMonths(new Date(), 6).toString().substring(4, 7),
    subMonths(new Date(), 5).toString().substring(4, 7),
    subMonths(new Date(), 4).toString().substring(4, 7),
    subMonths(new Date(), 3).toString().substring(4, 7),
    subMonths(new Date(), 2).toString().substring(4, 7),
    subMonths(new Date(), 1).toString().substring(4, 7)
  ]
  const [series1, setseries1] = useState([])
  const [series2, setseries2] = useState([])
  const [series3, setseries3] = useState([])
  const [total1, settotal1] = useState(0)
  const [total2, settotal2] = useState(0)
  const [total3, settotal3] = useState(0)
  const [apex, setapex] = useState({
    keys: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    values: [0, 0, 0, 0, 0, 0, 0]
  })
  const [filter, setfilter] = useState(0)
  const user = JSON.parse(localStorage.getItem(`_authUsr`))
  const [dropdown, setDropdown] = useState([])
  const [dropdown_, setDropdown_] = useState([])

  const t = (key) => {
    if (!translations[language]) {
      console.warn(`Translation for language "${language}" not found`);
      return key;
    }
    return translations[language][key] || key;
  };

  const loadCard = async(selection) => {
    if(user?.type !== 'minexx'){
      return
    }
    axiosInstance.get(`/admin/${selection}`).then(response=>{
      setapex({
        keys: Object.keys(response.data).slice(1).reverse(),
        values: Object.values(response.data).slice(1).reverse()
      })
    }).catch(err=>{
      try{
        if(err.response.code === 403){
          dispatch(Logout(navigate))
        }else{
          console.log(err.response.message);
        }
      }catch(e){
        console.log(err.message);
      }
    })
  }

  const loadOverview = async() => {
    if(user?.type !== 'minexx'){
      axiosInstance.get(`metals-api`).then(response=>{
        setrates(response.data.rates)
      })
    }
    let normalizedCountrys = country.trim();
            
    // Special handling for Rwanda
    if (normalizedCountrys.toLowerCase() === 'rwanda') {
        // Randomly choose one of the three formats
         normalizedCountrys ='.Rwanda';
        // normalizedCountry = formats[Math.floor(Math.random() * formats.length)];
    } else {
        // For other countries, remove leading/trailing dots and spaces
        normalizedCountrys = normalizedCountrys.replace(/^\.+|\.+$/g, '');
    }
    axiosInstance.get(`overview/risks`,
      {
        params: {
            country:normalizedCountrys,
          }
    }).then(response=>{
      setincidents(response.data.risks)
    }).catch(err=>{
      try{
        if(err.response.code === 403){
          dispatch(Logout(navigate))
        }else{
          console.log(err.response.message);
        }
      }catch(e){
        console.log(err.message)
      }
    })

    axiosInstance.get(`overview/incidents`,
      {
        params:
        {
          country:normalizedCountrys,

        }
      }).then(response=>{
      setseries1(response.data.incidents)
      settotal1(response.data.count)
    }).catch(err=>{
      try{
        if(err.response.code === 403){
          dispatch(Logout(navigate))
        }else{
          console.log(err.response.message);
        }
      }catch(e){
        console.log(err.message)
      }
    })
    axiosInstance.get(`metals-api/yearly`
    ).then(response=>{
    console.log("Mineral Data", response.data.data.data);
    setApiData(response.data.data);
  }).catch(err=>{
    try{
      if(err.response.code === 403){
        dispatch(Logout(navigate))
      }else{
        console.log(err.response.message);
      }
    }catch(e){
      console.log(err.message)
    }
  })
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
    axiosInstance.get(`overview/exports`,
      {
        params: {
            country:normalizedCountry,
          }
    }).then(response=>{
      setseries2(response.data.exports)
      settotal2(response.data.count)
      setexportweight((response.data.volume/1000).toFixed(5))
      setloading(false)
    }).catch(err=>{
      setloading(false)
      try{
        if(err.response.code === 403){
          dispatch(Logout(navigate))
        }else{
          console.log(err.response.message);
        }
      }catch(e){
        console.log(err.message)
      }
    })
    let normalizedCountryq = country.trim();
            
    // Special handling for Rwanda
    if (normalizedCountryq.toLowerCase() === 'rwanda') {
        // Randomly choose one of the three formats
         normalizedCountryq ='Rwanda';
        // normalizedCountry = formats[Math.floor(Math.random() * formats.length)];
    } else {
        // For other countries, remove leading/trailing dots and spaces
        normalizedCountryq = normalizedCountryq.replace(/^\.+|\.+$/g, '');
    }
    axiosInstance.get(`overview/assessments`,
      {
        params:
        {
          country:normalizedCountryq,

        }
      }).then(response=>{
      setseries3(response.data.assessments)
      settotal3(response.data.count)
    }).catch(err=>{ 
      try{
        if(err.response.code === 403){
          dispatch(Logout(navigate))
        }else{
          console.log(err.response.message);
        }
      }catch(e){
        console.log(err.message)
      }
    })
  }

  useEffect(() => {
    setAccess(localStorage.getItem(`_dash`) || '3ts')
    loadOverview()
    changeBackground({ value: "dark", label: "Dark" });
    changeTitle(`${t('Overview')} | Minexx`);

    // Update dropdown options based on language
    setDropdown(access === "3ts" 
      ? [t('Production'), t('Blending'), t('Processing')] 
      : [t('Production'), t('Purchase')]
    );
    setDropdown_([t('PurchaseTracker'), t('Blending'), t('Exports')]);

    loadCard(access === "3ts" 
      ? [t('Production'), t('Blending'), t('Processing')][filter].toLowerCase()
      : [t('Production'), t('Purchase')][filter].toLowerCase()
    );
  }, [language, access, filter, country]);

  // Define consistent card height for first row
  const firstRowHeight = 220;

  return(
    <Fragment>
      {/* First row: Overall Volume Card and Mineral Overview - Modified for minimal height */}
      <div className="row">
        <div className="col-md-4">
          <div className="card ticket-bx" style={{ height: `${firstRowHeight}px` }}>
            <div className="card-body py-3">
              <div className="d-sm-flex d-block align-items-center mb-2">
                <div className="me-auto pr-3">
                  <span className="text-white fs-16 font-w200 d-block mb-1">{t('overallSummary')}</span>
                  <h2 className="fs-32 text-white mb-0">{exportweight}<span className="fs-16 ms-2">{t('tons')}</span></h2>
                </div>
                <div className="d-flex flex-wrap">
                  <svg width="70" height="46" viewBox="0 0 87 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.4571 37.6458C11.9375 44.6715 4.81049 52.3964 2 55.7162H68.8125C77.6491 55.7162 84.8125 48.5528 84.8125 39.7162V2L61.531 31.9333C56.8486 37.9536 48.5677 39.832 41.746 36.4211L37.3481 34.2222C30.9901 31.0432 23.2924 32.4352 18.4571 37.6458Z" fill="url(#paint0_linear)"/>
                    <path d="M2 55.7162C4.81049 52.3964 11.9375 44.6715 18.4571 37.6458C23.2924 32.4352 30.9901 31.0432 37.3481 34.2222L41.746 36.4211C48.5677 39.832 56.8486 37.9536 61.531 31.9333L84.8125 2" stroke="white" strokeLinecap="round"/>
                    <defs>
                    <linearGradient id="paint0_linear" x1="43.4062" y1="8.71453" x2="46.7635" y2="55.7162" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" offset="0"/>
                    <stop offset="1" stopColor="white" stopOpacity="0"/>
                    </linearGradient>
                    </defs>
                  </svg>
                </div>
                
              </div>
              { loading ? <div className="progress mt-2 mb-2" style={{height:"12px"}}>
                <div className="progress-bar-striped progress-bar-animated" style={{width: "100%", height:"12px"}} role="progressbar">
                  <span className="sr-only">100% Complete</span>
                </div>
              </div> : null }
              <p className="fs-12 mb-1">{t('cumulativeExport')}</p>
              <Link to={"/exports"} className="text-white">{t('viewDetail')}<i className="las la-long-arrow-alt-right scale5 ms-3"></i></Link>
            </div>
          </div>
        </div>
        { country === 'Libya'  ?
        <div className="col-md-8">

        </div>:
        <div className="col-md-8">
          {/* Pass height prop to MineVolumeChart to make it consistent with other card */}
          <MineVolumeChart country={country} height={firstRowHeight} />
        </div>
        }
      </div>
      
     {/* Live Screen Cards - Export and Purchase Overview */}
      <LiveScreenCard language={language} country={country} access={access} user={user} />

      
      <TotalStockDelivery language={language} country={country} access={access}/>
         
   
     
    </Fragment>
  )
}

export default Home;