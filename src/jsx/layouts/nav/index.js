import React, { Fragment, useState, useEffect } from "react";
import SideBar from "./SideBar";
import NavHader from "./NavHader";
import Header from "./Header";
import ChatBox from "../ChatBox";

const JobieNav = ({ title, onClick: ClickToAddEvent, onClick2, onClick3, onCountryChange: parentOnCountryChange }) => {
   const [toggle, setToggle] = useState("");
   const [language, setLanguage] = useState(localStorage.getItem(`_lang`) || 'en');
   
   // Get initial country from localStorage or determine from user
   const getInitialCountry = () => {
      const storedCountry = localStorage.getItem(`_country`);
      if (storedCountry) return storedCountry;
      
      // If no stored country, determine from user data
      const user = JSON.parse(localStorage.getItem(`_authUsr`) || '{}');
      
      if (user.type === 'investor_drc' || user.type === 'buyers_drc') {
         return 'DRC';
      } else if (user.type === 'investor' && user.access_supervisor === 'drc') {
         return 'DRC';
      } else if (user.type === 'investor' && user.access_supervisor === 'rwanda') {
         return 'Rwanda';
      }
      
      return 'Rwanda';
   };
   
   const [country, setCountry] = useState(getInitialCountry());
   
   // Sync country with localStorage on mount
   useEffect(() => {
      const currentCountry = getInitialCountry();
      if (currentCountry !== country) {
         setCountry(currentCountry);
         localStorage.setItem('_country', currentCountry);
      }
   }, []);
   
   const onClick = (name) => setToggle(toggle === name ? "" : name);
   
   const handleLanguageChange = (newLang) => {
     setLanguage(newLang);
   };
   
   const handleCountryChange = (newCountry) => {
      setCountry(newCountry);
      localStorage.setItem('_country', newCountry);
      if (parentOnCountryChange) {
        parentOnCountryChange(newCountry);
      }
   };
   
   return (
      <Fragment>
         <NavHader />
         <SideBar 
           onClick={() => onClick2()} 
           onClick3={() => onClick3()} 
           language={language}
           country={country}
         />
         <Header
            onNote={() => onClick("chatbox")}
            onNotification={() => onClick("notification")}
            onProfile={() => onClick("profile")}
            toggle={toggle}
            title={title}
            onBox={() => onClick("box")}
            onClick={() => ClickToAddEvent()}
            onLanguageChange={handleLanguageChange}
            onCountryChange={handleCountryChange}
            country={country}
         />
         <ChatBox onClick={() => onClick("chatbox")} toggle={toggle} />
      </Fragment>  
   );
};

export default JobieNav;