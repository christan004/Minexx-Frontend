import React, { useContext, useState, useEffect } from "react";

/// React router dom
import {  Routes, Route, Outlet, useNavigate  } from "react-router-dom";

/// Css
//import "swiper/css";
import "./index.css";
import "./chart.css";
import "./step.css";

/// Access Control
import { hasGoldTogoAccess, getInitialCountry as getInitialCountryFromAccess, canAccessFeature } from "../services/AccessControl";

/// Layout
import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";
import ScrollToTop from './layouts/ScrollToTop';
/// Dashboard
import Home from './components/Dashboard/Home';
import EventList from './components/Dashboard/EventList';
import EventPage from './components/Dashboard/EventPage';
import Analytics from './components/Dashboard/Analytics';
import Incidents from './pages/Events/Incidents';
import Reviews from './components/Dashboard/Reviews';
import DashboardCustomers from './components/Dashboard/Customers';
import Task from './components/Dashboard/Task';

//Demo
import DashboardLight from './components/Dashboard/demo/DashboardLight';
import Theme1 from './components/Dashboard/demo/Theme1';
import Theme2 from './components/Dashboard/demo/Theme2';
//import Theme3 from './components/Dashboard/demo/Theme3';
import Theme4 from './components/Dashboard/demo/Theme4';
import Theme5 from './components/Dashboard/demo/Theme5';
import Theme6 from './components/Dashboard/demo/Theme6';

//Content
import Content from './components/Cms/Content';
import Menu from './components/Cms/Menu';
import EmailTemplate from './components/Cms/EmailTemplate';
import Blog from './components/Cms/Blog';

//Ticket
import CreateTicket from './components/Ticket/CreateTicket';
import AllTicket from './components/Ticket/AllTicket';

//Customers
import Chat from './components/Customers/Chat';
import Users from './components/Customers/Users';

/// App
import AppProfile from "./components/AppsMenu/AppProfile/AppProfile";
import PostDetails from "./components/AppsMenu/AppProfile/PostDetails";
import EditProfile from "./components/AppsMenu/AppProfile/EditProfile";
import Compose from "./components/AppsMenu/Email/Compose/Compose";
import Inbox from "./components/AppsMenu/Email/Inbox/Inbox";
import Read from "./components/AppsMenu/Email/Read/Read";
import Calendar from "./components/AppsMenu/Calendar/Calendar";

/// Product List
import ProductGrid from "./components/AppsMenu/Shop/ProductGrid/ProductGrid";
import ProductList from "./components/AppsMenu/Shop/ProductList/ProductList";
import ProductDetail from "./components/AppsMenu/Shop/ProductGrid/ProductDetail";
import Checkout from "./components/AppsMenu/Shop/Checkout/Checkout";
import Invoice from "./components/AppsMenu/Shop/Invoice/Invoice";
import ProductOrder from "./components/AppsMenu/Shop/ProductOrder";
import Customers from "./components/AppsMenu/Shop/Customers/Customers";

/// Charts
import SparklineChart from "./components/charts/Sparkline";
import ChartJs from "./components/charts/Chartjs";
//import Chartist from "./components/charts/chartist";
import RechartJs from "./components/charts/rechart";
import ApexChart from "./components/charts/apexcharts";

/// Bootstrap
import UiAlert from "./components/bootstrap/Alert";
import UiAccordion from "./components/bootstrap/Accordion";
import UiBadge from "./components/bootstrap/Badge";
import UiButton from "./components/bootstrap/Button";
import UiModal from "./components/bootstrap/Modal";
import UiButtonGroup from "./components/bootstrap/ButtonGroup";
import UiListGroup from "./components/bootstrap/ListGroup";
import UiCards from "./components/bootstrap/Cards";
import UiCarousel from "./components/bootstrap/Carousel";
import UiDropDown from "./components/bootstrap/DropDown";
import UiPopOver from "./components/bootstrap/PopOver";
import UiProgressBar from "./components/bootstrap/ProgressBar";
import UiTab from "./components/bootstrap/Tab";
import UiPagination from "./components/bootstrap/Pagination";
import UiGrid from "./components/bootstrap/Grid";
import UiTypography from "./components/bootstrap/Typography";

/// Plugins
import Select2 from "./components/PluginsMenu/Select2/Select2";
//import Nestable from "./components/PluginsMenu/Nestable/Nestable";
//import MainNouiSlider from "./components/PluginsMenu/NouiSlider/MainNouiSlider";
import MainSweetAlert from "./components/PluginsMenu/SweetAlert/SweetAlert";
import Toastr from "./components/PluginsMenu/Toastr/Toastr";
import JqvMap from "./components/PluginsMenu/JqvMap/JqvMap";
import Lightgallery from "./components/PluginsMenu/Lightgallery/Lightgallery";

//Redux
import Todo from "./pages/Todo";
//import ReduxForm from "./components/Forms/ReduxForm/ReduxForm";
//import WizardForm from "./components/Forms/ReduxWizard/Index";

/// Widget
import Widget from "./pages/Widget";

/// Table
import SortingTable from "./components/table/SortingTable/SortingTable";
import FilteringTable from "./components/table/FilteringTable/FilteringTable";
import DataTable from "./components/table/DataTable";
import BootstrapTable from "./components/table/BootstrapTable";

/// Form
import Element from "./components/Forms/Element/Element";
import Wizard from "./components/Forms/Wizard/Wizard";
import CkEditor from "./components/Forms/CkEditor/CkEditor";
import Pickers from "./components/Forms/Pickers/Pickers";
import FormValidation from "./components/Forms/FormValidation/FormValidation";

/// Pages
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import KycLogin from "./pages/KycLogin";
import ForgotPassword from "./pages/ForgotPassword";
import LockScreen from "./pages/LockScreen";
import Error400 from "./pages/Error400";
import Error403 from "./pages/Error403";
import Error404 from "./pages/Error404";
import Error500 from "./pages/Error500";
import Error503 from "./pages/Error503";
import { ThemeContext } from "../context/ThemeContext";
import Reports from "./pages/Reports";
import MineSites from "./pages/Locations/MineSites";
import Compliance from "./pages/Compliance";
import Locations from "./pages/Locations/Index";
import Assessments from "./pages/Events/Assessments";
import Villages from "./pages/Locations/Villages";
import DDSystems from "./pages/DDSystems"
import Miners from "./pages/Locations/Miners";
import SummaryReport from "./pages/SummaryReport";
import Company from "./pages/Company";
import Exports from "./pages/Events/Exports";
import Tracking from "./pages/Events/Tracking";
import ProductionSummary from "./pages/ProductionSummary";
import Companies from "./pages/Companies";
import Suppliers from "./pages/Suppliers";
import Systemhealth from "./pages/Systemhealth";
import Mines from "./pages/Locations/Mines";
import Kyc from "./pages/InnerPages/Kyc";
import Export from "./pages/InnerPages/Export";
import Tags from "./pages/Events/Tags";
import TagManagement from "./pages/TagManagement/TagManagement";
import ExportA from "./pages/InnerPages/ExportA";
import Mine from "./pages/InnerPages/Mine";
import Assessment from "./pages/InnerPages/Assessment";
import PurchaseWrapper from "./pages/PurchaseWrapper";

import Minersts from "./pages/3Miners";
import MinerDetails from "./pages/MinerDetails";

const Markup = (props) => {
  const { menuToggle } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  // Get initial country based on user type and access level
  const getInitialCountry = () => {
    const user = JSON.parse(localStorage.getItem(`_authUsr`) || '{}');
    const storedCountry = localStorage.getItem(`_country`);
    
    // Gold_Togo users are ALWAYS locked to Togo
    if (hasGoldTogoAccess(user) || user?.access === 'Gold_Togo') {
      localStorage.setItem('_country', 'Togo');
      localStorage.setItem('_dash', 'gold');
      return 'Togo';
    }
    
    const userType = user?.type;
    
    // DRC-specific investors
    if (userType === 'investor_drc' || userType === 'buyers_drc') {
      return 'DRC';
    }
    
    return storedCountry || 'Rwanda';
  };
  
  const [language, setLanguage] = useState(localStorage.getItem('_lang') || 'en');
  const [country, setCountry] = useState(getInitialCountry());

  // Enforce country and access level constraints
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem(`_authUsr`) || '{}');
    
    // Force Gold_Togo users to Togo
    if (hasGoldTogoAccess(user) || user?.access === 'Gold_Togo') {
      if (country !== 'Togo') {
        setCountry('Togo');
        localStorage.setItem('_country', 'Togo');
      }
      if (localStorage.getItem('_dash') !== 'gold') {
        localStorage.setItem('_dash', 'gold');
      }
      return;
    }
    
    // Force DRC investors to DRC
    const userType = user?.type;
    if ((userType === 'investor_drc' || userType === 'buyers_drc') && country !== 'DRC') {
      setCountry('DRC');
      localStorage.setItem('_country', 'DRC');
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('_lang', newLang); 
  };
  
  const changeCountry = (newCountry) => {
    if (newCountry !== country) {
      setCountry(newCountry);
      localStorage.setItem('_country', newCountry);
      navigate('/overview');
    }
  }; 
  
  const allroutes = [
    /// Dashboard
    { url: "/", component:<Home key={language} language={language}  country={country}/>  },
    { url: 'overview', component: <Home key={language} language={language}  country={country} /> },
    { url: 'companies', component: <Companies/> },
     { url: 'Systemhealth', component: <Systemhealth  language={language}/> },
    { url: 'company/:id', component: <Company key={language} language={language} country={country}/> },
    { url: 'mines/:id', component: <Mine key={language} language={language}/> },
    { url: 'Kyc/:id', component: <Kyc key={language} language={language} country={country} /> },
    {url: 'Tags', component: <Tags key={language} language={language} country={country}/> },
    { url: 'tag-management', component: <TagManagement /> },
     { url: '3tsminers', component: <Minersts language={language} country={country}/> },
    { url: '/3tsminers/:id', component: <MinerDetails language={language} country={country} /> },
    { url: 'users', component: <Users/> },
	  { url: 'incidents', component: <Incidents/> },
	  { url: 'exports', component: <Exports key={language} language={language} country={country}/> },
    { url: 'time-tracking', component: <Tracking key={language} language={language} country={country}/> },
	  { url: 'exports/:id', component: <Export key={language} language={language} country={country}/> },
    { url: 'exportsauth/:id', component: <ExportA/> },
	  { url: 'mines', component: <Mines key={language} language={language} country={country}/> },
	  { url: 'mine-sites', component: <MineSites/> },
	  { url: 'compliance', component: <Compliance/> },
	  { url: 'locations', component: <Locations/> },
	  { url: 'assessment', component: <Assessment key={language} language={language} country={country}/> },
	  { url: 'assessments', component: <Assessments/> },
	  { url: 'villages', component: <Villages/> },
	  { url: 'miners', component: <Miners/> },
	  { url: 'suppliers', component: <Suppliers/> },
	  { url: 'knowledge', component: <DDSystems key={language} language={language} country={country}/> },
    // Purchase module - Routes to appropriate component based on access level
    // Gold access: Uses Purchase.js (Togo trace reports)
    // 3ts access: Uses Purchase_3ts.js (DRC standard purchases)
    {
      url: 'purchase', 
      component: <PurchaseWrapper key={language} language={language} country={country}/>
    },
    { url: 'dashboard-light', component: <DashboardLight/> },
	  { url: 'event-list', component: <EventList/> },
	  { url: 'event', component: <EventPage/> },
	  { url: 'analytics', component: <Analytics/> },
	  { url: 'reviews', component: <Reviews/> },
	  { url: 'customers', component: <DashboardCustomers/> },
	  { url: 'task', component: <Task/> },
	  { url: 'summary-report', component: <SummaryReport/> },
    
    //Demo
	  { url: 'dark-sidebar', component: <Theme1/> },
	  { url: 'header-secondary', component: <Theme2/> },
	  { url: 'horizontal-sidebar', component: <Theme4/> },
	  { url: 'header-style', component: <Theme5/> },
	  { url: 'mini-sidebar', component: <Theme6/> },
    
    //Content
	  { url: 'content', component: <Content/> },
	  { url: 'menu-1', component: <Menu/> },
	  { url: 'email-template', component: <EmailTemplate/> },
	  { url: 'blog', component: <Blog/> },

    //Ticket
	  { url: 'create-ticket', component: <CreateTicket/> },
	  { url: 'all-ticket', component: <AllTicket/> },

    //Customers
    {url:'chat', component:<Chat/> },
    {url:'users/:platform', component:<Users/> },

    //Reports
    {url:'reports/:type', component:<Reports key={language} language={language} country={country}/> },

    /// Apps
    { url: "profile", component: <AppProfile /> },
    { url: "post-details", component: <PostDetails/> },
    { url: "edit-profile", component: <EditProfile/> },
    { url: "email-compose", component: <Compose /> },
    { url: "email-inbox", component: <Inbox/>},
    { url: "email-read", component: <Read/> },
    { url: "app-calender", component: <Calendar /> },

    /// Chart
    { url: "chart-sparkline", component: <SparklineChart /> },
    { url: "chart-chartjs", component: <ChartJs /> },
    //{ url: "chart-chartist", component: Chartist },
    { url: "chart-apexchart", component: <ApexChart /> },
    { url: "chart-rechart", component: <RechartJs /> },

    /// Bootstrap
    { url: "ui-alert", component: <UiAlert /> },
    { url: "ui-badge", component: <UiBadge/> },
    { url: "ui-button", component: <UiButton /> },
    { url: "ui-modal", component: <UiModal /> },
    { url: "ui-button-group", component: <UiButtonGroup /> },
    { url: "ui-accordion", component: <UiAccordion/> },
    { url: "ui-list-group", component: <UiListGroup /> },
    //{ url: "ui-media-object", component: UiMediaObject },
    { url: "ui-card", component: <UiCards/> },
    { url: "ui-carousel", component: <UiCarousel/> },
    { url: "ui-dropdown", component: <UiDropDown/> },
    { url: "ui-popover", component: <UiPopOver /> },
    { url: "ui-progressbar", component: <UiProgressBar /> },
    { url: "ui-tab", component: <UiTab /> },
    { url: "ui-pagination", component: <UiPagination /> },
    { url: "ui-typography", component: <UiTypography/> },
    { url: "ui-grid", component: <UiGrid/> },

    /// Plugin
    { url: "uc-select2", component: <Select2 /> },
    //{ url: "uc-nestable", component: Nestable },
    //{ url: "uc-noui-slider", component: <MainNouiSlider/> },
    { url: "uc-sweetalert", component: <MainSweetAlert/> },
    { url: "uc-toastr", component: <Toastr/> },
    { url: "map-jqvmap", component: <JqvMap/> },
    { url: "uc-lightgallery", component: <Lightgallery/> },

	///Redux
	{ url: "todo", component: <Todo/> },
	//{ url: "redux-form", component: ReduxForm },
    //{ url: "redux-wizard", component: WizardForm },
	
    /// Widget
    { url: "widget-basic", component: <Widget/> },

    /// Shop
    { url: "ecom-product-grid", component: <ProductGrid /> },
    { url: "ecom-product-list", component: <ProductList/> },
    { url: "ecom-product-detail", component: <ProductDetail/> },
    { url: "ecom-product-order", component: <ProductOrder/> },
    { url: "ecom-checkout", component: <Checkout /> },
    { url: "ecom-invoice", component: <Invoice /> },
    { url: "ecom-product-detail", component: <ProductDetail/> },
    { url: "ecom-customers", component: <Customers/> },

    /// Form
    { url: "form-element", component: <Element/> },
    { url: "form-wizard", component: <Wizard/> },
    { url: "form-ckeditor", component: <CkEditor /> },
    { url: "form-pickers", component: <Pickers /> },
    { url: "form-validation", component: <FormValidation /> },

    /// table
	{ url: 'table-filtering', component: <FilteringTable /> },
    { url: 'table-sorting', component: <SortingTable /> },
    { url: "table-datatable-basic", component: <DataTable /> },
    { url: "table-bootstrap-basic", component: <BootstrapTable /> },

    /// pages
    { url: "page-register", component: <Registration /> },
    { url: "page-lock-screen", component: <LockScreen /> },
    { url: "page-login", component: <Login /> },
    { url: "page-forgot-password", component: <ForgotPassword /> },
    { url: "page-error-400", component: <Error400/> },
    { url: "page-error-403", component: <Error403/> },
    { url: "page-error-404", component: <Error404 /> },
    { url: "page-error-500", component: <Error500/> },
    { url: "page-error-503", component: <Error503/> },
  ];
  let path = window.location.pathname;
  path = path.split("/");
  path = path[path.length - 1];

  let pagePath = path.split("-").includes("page");
  return (
    <>
      <Routes>
          <Route path="/"  element={<MainLayout language={language} onLanguageChange={changeLanguage} country={country} onCountryChange={changeCountry} />} > 
              {allroutes.map((data, i) => (
                <Route
                  key={i}
                  exact
                  path={`${data.url}`}
                  element={React.cloneElement(data.component, { 
                    language: language,
                    country: country 
                  })}
                >
                </Route>
              ))}
          </Route>
      </Routes>
      <ScrollToTop />
    </>
  );
};

function MainLayout({ language, onLanguageChange, country, onCountryChange }){
  const { menuToggle, sidebariconHover } = useContext(ThemeContext);

  return (
    <div id="main-wrapper" className={`show ${sidebariconHover ? "iconhover-toggle": ""} ${ menuToggle ? "menu-toggle" : ""}`}>  
      <Nav 
        language={language}
        onLanguageChange={onLanguageChange}
        country={country}
        onCountryChange={onCountryChange}
      />
      <div className="content-body" style={{ minHeight: window.screen.height - 45 }}>
          <div className="container-fluid">
            <Outlet />                
          </div>
      </div>
      <Footer />
    </div>
  )
}

export default Markup;