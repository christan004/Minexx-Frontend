import axios from 'axios';
import swal from "sweetalert";
import {
    loginConfirmedAction,
    Logout,
} from '../store/actions/AuthActions';
import { getAPIEndpoint } from './AccessControl';

export function signUp(email, password) {
    //axios call
    const postData = {
        email,
        password,
        returnSecureToken: true,
    }; 
    const apiKey = process.env.apiKey_authservice
    return axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyD3RPAp3nuETDn9OQimqn_YF6zdzqWITII`,
        postData,
    );
}
 
export function login(email, password) {
    const postData = {
        email,
        password,
        returnSecureToken: true,
    };
    const baseURL = getAPIEndpoint('DRC').replace(/\/$/, '');
    return axios.post( 
        `${baseURL}/login`,
        postData,
    );
} 

export function formatError(errorResponse) {
    return errorResponse.message
}

export function saveTokenInLocalStorage(data) {
    localStorage.setItem('_authTkn', data.accessToken);
    localStorage.setItem('_authRfrsh', data.refreshToken);
    localStorage.setItem('_authUsr', JSON.stringify(data.user));
    localStorage.setItem('_dash', data.user.access === 'both' ? '3ts' : data.user.access);
    
    // Set country based on user type and access_supervisor
    let initialCountry = 'Rwanda'; // default
    
    if (data.user.type === 'investor_drc' || data.user.type === 'buyers_drc') {
        initialCountry = 'DRC';
    } else if (data.user.type === 'investor' && data.user.access_supervisor === 'drc') {
        initialCountry = 'DRC';
    } else if (data.user.type === 'investor' && data.user.access_supervisor === 'rwanda') {
        initialCountry = 'Rwanda';
    } else if (data.user.type === 'buyer' || data.user.type === 'buyers') {
        // For buyers with access to both, check if there's a stored preference
        const storedCountry = localStorage.getItem('_country');
        initialCountry = storedCountry && (storedCountry === 'Rwanda' || storedCountry === 'DRC') 
            ? storedCountry 
            : 'Rwanda';
    }
    
    localStorage.setItem('_country', initialCountry);
    
    // Set language based on country
    const countryLanguageDefaults = {
        'Rwanda': 'en',
        'DRC': 'fr',
        'Ghana': 'en',
        'France': 'fr',
        'Gabon': 'fr',
        'Ethiopia': 'en',
        'Libya': 'en',
    };
    
    // Only set default language if user hasn't manually chosen one
    const userLang = localStorage.getItem('_userLang');
    if (!userLang) {
        localStorage.setItem('_lang', countryLanguageDefaults[initialCountry] || 'en');
    }
}

export function runLogoutTimer(dispatch, timer, navigate) {
    setTimeout(() => {
        dispatch(Logout(navigate));
    }, timer);
}

export function checkAutoLogin(dispatch, navigate) {
    const tokenDetailsString = localStorage.getItem('_authUsr');
    let tokenDetails = '';
    if (!tokenDetailsString) {
        dispatch(Logout(navigate));
		return;
    }

    tokenDetails = JSON.parse(tokenDetailsString);
    // let expireDate = new Date(tokenDetails.expireDate);
    // let todaysDate = new Date();

    // if (todaysDate > expireDate) {
    //     dispatch(Logout(navigate));
    //     return;
    // }
		
    dispatch(loginConfirmedAction(tokenDetails));
	
    // const timer = expireDate.getTime() - todaysDate.getTime();
    // runLogoutTimer(dispatch, 100, navigate);
}
export function showIdleWarning(dispatch, navigate) {
    swal({
        title: "Session Timeout",
        text: "You've been inactive for 5 minutes and will be logged out for security.",
        icon: "warning",
        buttons: {
            cancel: false,
            confirm: "OK"
        }
    }).then(() => {
        dispatch(Logout(navigate));
    });
}
