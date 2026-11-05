import React, { useState, useContext } from "react";

/// React router dom
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";

/// images
import logo from "../../../images/logo.png";

export function  NavMenuToggle(){
	setTimeout(()=>{	
		let mainwrapper = document.querySelector("#main-wrapper");
		if(mainwrapper.classList.contains('menu-toggle')){
			mainwrapper.classList.remove("menu-toggle");
		}else{
			mainwrapper.classList.add("menu-toggle");
		}
	},200);
}

const NavHader = () => {
   const [toggle, setToggle] = useState(false);
   const { openMenuToggle } = useContext(ThemeContext);
   return (
      <div className="nav-header">
         <Link to="/overview" className="brand-logo">
            <img className="logo-abbr" src={logo} alt="" />
         </Link>

         <div className="nav-control" 
			onClick={() => {
				setToggle(!toggle);
				NavMenuToggle();
			}}
		>
            <div className={`hamburger ${toggle ? "is-active" : ""}`}>
               <span className="line"></span>
               <span className="line"></span>
               <span className="line"></span>
            </div>
         </div>
      </div>
   );
};

export default NavHader;
