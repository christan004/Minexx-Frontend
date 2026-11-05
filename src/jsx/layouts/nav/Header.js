import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutPage from './Logout';
import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEarthAmericas, faArrowRightArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from '../../../context/ThemeContext';
import ChatBot from '../../components/Dashboard/Chatbot';
import {
  getAvailableCountries as getAvailableCountriesFromAC,
  getInitialCountry as getInitialCountryFromAC,
  getAccessLevel,
  getCountryDefaultLanguage,
  hasGoldTogoAccess,
} from '../../../services/AccessControl';

const translations = {
  en: {
    dashboard: "Dashboard",
    EN: "English (EN)",
    FR: "French (FR)",
    switchTo: "Switch to",
    Logout: "Logout",
    changeCountry: "Change Country"
  },
  fr: {
    dashboard: "Tableau de bord",
    EN: "English (EN)",
    FR: "Français (FR)",
    switchTo: "Passer à",
    Logout: "Déconnexion",
    changeCountry: "Changer de Pays"
  }
};

const Header = ({ onLanguageChange, onCountryChange }) => {
  const [user] = useState(JSON.parse(localStorage.getItem(`_authUsr`)));
  const [access, setAccess] = useState('');
  const [view, setView] = useState(localStorage.getItem(`_dash`) || '');
  
  // Initialize country first using AccessControl
  const [country, setCountry] = useState(getInitialCountryFromAC(user));
  
  // Now initialize lang with country available
  const [lang, setLang] = useState(
    localStorage.getItem(`_userLang`) || 
    localStorage.getItem(`_lang`) || 
    getCountryDefaultLanguage(getInitialCountryFromAC(user)) || 
    'en'
  );

  // Get available countries from AccessControl
  const availableCountriesMap = getAvailableCountriesFromAC(user);
  const availableCountries = availableCountriesMap;

  useEffect(() => {
    // Save country to localStorage
    localStorage.setItem('_country', country);
    
    // If current country is not in available countries, reset to first available
    if (!availableCountries[country]) {
      const firstAvailable = Object.keys(availableCountries)[0];
      setCountry(firstAvailable);
      localStorage.setItem('_country', firstAvailable);
    }
    
    updateAccessAndView(country);
    handleCountryLanguageChange(country);
  }, [country, availableCountries]);

  const updateAccessAndView = (selectedCountry) => {
    const accessLevel = getAccessLevel(selectedCountry, user);
    const newView = selectedCountry === 'France' ? (view || 'gold') : accessLevel;
  
    setAccess(accessLevel);
    setView(newView);
    localStorage.setItem(`_dash`, newView);
  };

  const handleCountryLanguageChange = (selectedCountry) => {
    const defaultLang = getCountryDefaultLanguage(selectedCountry);
    const userLang = localStorage.getItem(`_userLang`);
    
    if (!userLang) {
      setLang(defaultLang);
      localStorage.setItem(`_lang`, defaultLang);
      onLanguageChange(defaultLang);
    }
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem(`_userLang`, newLang);
    localStorage.setItem(`_lang`, newLang);
    onLanguageChange(newLang);
    window.location.reload();
  }

  const changeCountry = (selectedCountry) => {
    setCountry(selectedCountry);
    localStorage.setItem(`_country`, selectedCountry);
    updateAccessAndView(selectedCountry);
    
    localStorage.removeItem(`_userLang`);
    
    const defaultLang = getCountryDefaultLanguage(selectedCountry);
    setLang(defaultLang);
    localStorage.setItem(`_lang`, defaultLang);
    onLanguageChange(defaultLang);
    onCountryChange(selectedCountry);
    
    window.location.reload();
  }

  const changeDashboard = () => {
    if (access === 'both') {
      const newView = view === 'gold' ? '3ts' : 'gold';
      setView(newView);
      localStorage.setItem(`_dash`, newView);
      window.location.reload();
    }
  }

  const t = (key) => translations[lang]?.[key] || key;
  const otherCountries = Object.keys(availableCountries).filter(c => c !== country);

  return (
    <div className="header">
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-left">
              <div className="dashboard_bar" style={{ textTransform: "capitalize" }}>
                {t('dashboard')} - {view.toUpperCase()}
              </div>
            </div> 	
            <ul className="navbar-nav header-right">
              <Dropdown as="li" className="nav-item header-profile">
                <Dropdown.Toggle as="a" variant="" className="nav-link i-false c-pointer">								
                  <img src={availableCountries[country]} width="20" alt={country + " flag"}/>
                  <div className="header-info">
                    <span>{country}<i className="fa fa-caret-down ms-3" aria-hidden="true"></i></span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu align="right" className="mt-2">
                  {otherCountries.map((countryName) => (
                    <Dropdown.Item key={countryName} onClick={() => changeCountry(countryName)} className="dropdown-item ai-icon">
                      <img src={availableCountries[countryName]} width="20" alt={countryName + " flag"} className="me-2" />
                      <span>{countryName}</span>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown as="li" className="nav-item header-profile">
                <Dropdown.Toggle as="a" variant="" className="nav-link i-false c-pointer">								
                  <FontAwesomeIcon icon={faEarthAmericas} />
                  <span>{lang.toUpperCase()}</span>
                  <i className="fa fa-caret-down ms-2" aria-hidden="true"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu align="right" className="mt-2">
                  <Dropdown.Item onClick={() => changeLanguage('en')} className="dropdown-item ai-icon">
                    <span className="ms-2">{t('EN')}</span>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => changeLanguage('fr')} className="dropdown-item ai-icon">
                    <span className="ms-2">{t('FR')}</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown as="li" className="nav-item header-profile">
                <Dropdown.Toggle as="a" variant="" className="nav-link i-false c-pointer">								
                  <img src={user?.photoURL} width="20" alt=""/>
                  <div className="header-info">
                    <span>{user?.name} {user?.surname}<i className="fa fa-caret-down ms-3" aria-hidden="true"></i></span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu align="right" className="mt-2">
                  {access === 'both' && (
                    <Link to="/" onClick={changeDashboard} className="dropdown-item ai-icon">
                      <FontAwesomeIcon icon={faArrowRightArrowLeft} />
                      <span className="ms-2">{t('switchTo')} {view === 'gold' ? '3Ts' : 'Gold'}</span>
                    </Link>
                  )}
                  <LogoutPage logoutText={t('Logout')} />
                </Dropdown.Menu>
              </Dropdown>
            </ul>
          </div>
        </nav>
      </div>
      <ChatBot /> 
    </div>
  );
};

export default Header;