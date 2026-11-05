import axios from 'axios';
import { getAPIEndpoint, hasGoldTogoAccess } from './AccessControl';

// Get initial base URL - will be set dynamically
const getBaseURL = () => {
  try {
    const user = JSON.parse(localStorage.getItem('_authUsr') || '{}');
    let country = localStorage.getItem('_country');
    
    // Gold_Togo users ALWAYS use Togo endpoint
    if (hasGoldTogoAccess(user) || user?.access === 'Gold_Togo') {
      country = 'Togo';
      localStorage.setItem('_country', 'Togo');
    }
    
    // Fallback country if not set
    if (!country) {
      country = 'Rwanda';
    }
    
    const endpoint = getAPIEndpoint(country);
    // Remove trailing slash if present for consistency
    return endpoint.replace(/\/$/, '');
  } catch (error) {
    console.warn('Error getting API endpoint:', error);
    return getAPIEndpoint('DRC').replace(/\/$/, '');
  }
};

const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
}); 


// Request interceptor: Update baseURL dynamically and add auth headers
axiosInstance.interceptors.request.use((config) => {
    // Update baseURL dynamically in case country changed
    const currentBaseURL = getBaseURL();
    axiosInstance.defaults.baseURL = currentBaseURL;
    
    // Add authentication headers
    const token = localStorage.getItem(`_authTkn`)
    const refresh = localStorage.getItem(`_authRfrsh`)
    const dash = localStorage.getItem(`_dash`)
    config.params = config.params || {};
    config.headers['authorization'] = token;
    config.headers['x-refresh'] = refresh;
    config.headers['x-platform'] = dash;
    
    return config;
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Handle authentication errors
            console.warn('Authentication error - token may be expired');
        }
        return Promise.reject(error);
    }
);
 
export default axiosInstance;
 
