/**
 * AccessControl Service
 * Centralized access control logic for managing user permissions,
 * country-specific features, and API endpoint routing
 */

const ensureTrailingSlash = (url) => url.endsWith('/') ? url : `${url}/`;

const getDRCAPIEndpoint = () => {
  const envEndpoint = typeof process !== 'undefined'
    ? process.env.REACT_APP_DRC_API_URL
    : undefined;

  if (envEndpoint) {
    return ensureTrailingSlash(envEndpoint);
  }

  if (typeof window !== 'undefined' && window.location?.protocol === 'https:') {
    return '/api/';
  }
  

  return 'http://34.133.122.228:3500/';
};

// API Endpoints for each country/mode
const API_ENDPOINTS = {
  DRC: getDRCAPIEndpoint(),
  Togo: 'https://minexxapi-togo-clone-p7n5ing2cq-uc.a.run.app/',
};

// Default endpoint if country not found
const DEFAULT_API_ENDPOINT = API_ENDPOINTS.DRC;

/**
 * Get the appropriate API endpoint based on user country
 * @param {string} country - The user's country
 * @returns {string} - API endpoint URL
 */
export const getAPIEndpoint = (country) => {
  return API_ENDPOINTS[country] || DEFAULT_API_ENDPOINT;
};


/**
 * 
 * 
 * Check if user has Gold-Togo access level
 * @param {object} user - User object from localStorage
 * @returns {boolean}
 */
export const hasGoldTogoAccess = (user) => {
  if (!user) return false;
  return (
    user.access === 'Gold-Togo' && user.email === 'info@minexx.co' 
  );
};

/**
 * Check if user is Gold access (Togo specific)
 * @param {object} user - User object
 * @returns {boolean}
 */
export const isGoldAccess = (user) => {
  if (!user) return false;
  return user.access === 'Gold-Togo' || user.access === 'gold';
};

/**
 * Get user's initial country based on their profile
 * @param {object} user - User object
 * @returns {string} - Country name
 */
export const getInitialCountry = (user) => {
  const storedCountry = localStorage.getItem('_country');

  // Gold-Togo users can only access Togo
  if (hasGoldTogoAccess(user)) {
    return 'Togo';
  }

  // DRC-specific investors
  if (user?.type === 'investor_drc' || user?.type === 'buyers_drc') {
    return 'DRC';
  }

  // Investor with Rwanda access supervisor
  if (user?.type === 'investor' && user?.access_supervisor === 'rwanda') {
    return 'Rwanda';
  }

  // Investor with DRC access supervisor
  if (user?.type === 'investor' && user?.access_supervisor === 'drc') {
    return 'DRC';
  }

  // Investors with multiple access
  if (
    user?.type === 'investor' &&
    user?.access_supervisor === 'rwanda & Ethiopia'
  ) {
    return storedCountry && (storedCountry === 'Rwanda' || storedCountry === 'Ethiopia')
      ? storedCountry
      : 'Rwanda';
  }

  // Buyers can switch between Rwanda and DRC
  if (user?.type === 'buyer' || user?.type === 'buyers') {
    return storedCountry && (storedCountry === 'Rwanda' || storedCountry === 'DRC')
      ? storedCountry
      : 'Rwanda';
  }

  // Named buyer access (Rwanda only)
  if (user?.type === 'buyer_rwanda') {
    return 'Rwanda';
  }

  // Default fallback
  return storedCountry || 'Rwanda';
};

/**
 * Get available countries for the user based on their profile
 * @param {object} user - User object
 * @returns {object} - Object with country flags mapping
 */
export const getAvailableCountries = (user) => {
  const allCountries = {
    Rwanda: 'https://flagcdn.com/w320/rw.png',
    DRC: 'https://flagcdn.com/w320/cd.png',
    Gabon: 'https://flagcdn.com/w320/ga.png',
    Ghana: 'https://flagcdn.com/w320/gh.png',
    France: 'https://flagcdn.com/w320/fr.png',
    Ethiopia: 'https://flagcdn.com/w320/et.png',
    Libya: 'https://flagcdn.com/w320/ly.png',
    Togo: 'https://flagcdn.com/w320/tg.png',
    Niger: 'https://flagcdn.com/w320/ne.png',
  };

  // Countries without Togo (default available)
  const countries = {
    Rwanda: 'https://flagcdn.com/w320/rw.png',
    DRC: 'https://flagcdn.com/w320/cd.png',
    Gabon: 'https://flagcdn.com/w320/ga.png',
    Ghana: 'https://flagcdn.com/w320/gh.png',
    France: 'https://flagcdn.com/w320/fr.png',
    Ethiopia: 'https://flagcdn.com/w320/et.png',
    Togo: 'https://flagcdn.com/w320/tg.png',
    Niger: 'https://flagcdn.com/w320/ne.png',
  };

  if (!user) {
    return countries;
  }

  // Gold-Togo users only see Togo
  if (hasGoldTogoAccess(user)) {
    return { Togo: allCountries.Togo };
  }

  // DRC investors only see DRC
  if (user.type === 'investor_drc' || user.type === 'buyers_drc') {
    return { DRC: countries.DRC };
  }

  // Investors with Rwanda & Ethiopia access
  if (user.type === 'investor' && user.access_supervisor === 'rwanda & Ethiopia') {
    return {
      Rwanda: countries.Rwanda,
      Ethiopia: countries.Ethiopia,
    };
  }

  // Investors with DRC access
  if (user.type === 'investor' && user.access_supervisor === 'drc') {
    return { DRC: countries.DRC };
  }

  // Investors with Rwanda access
  if (user.type === 'investor' && user.access_supervisor === 'rwanda') {
    return { Rwanda: countries.Rwanda };
  }

  // Named buyer (Joseph) - Rwanda only
  if (user.type === 'investor' && user.name === 'Joseph') {
    return { Rwanda: countries.Rwanda };
  }

  // Rwanda buyers
  if (user.type === 'buyer_rwanda') {
    return { Rwanda: countries.Rwanda };
  }

  // Standard buyers can access Rwanda and DRC
  if (user.type === 'buyer' || user.type === 'buyers') {
    return {
      Rwanda: countries.Rwanda,
      DRC: countries.DRC,
    };
  }

  // Default: all countries
  return countries;
};

/**
 * Get the dashboard access level (view mode) for a country
 * @param {string} country - Country name
 * @param {object} user - User object (optional, for special cases)
 * @returns {string} - Access level ('3ts', 'gold', 'both', etc.)
 */
export const getAccessLevel = (country, user) => {
  // Gold-Togo users always get 'gold' access
  if (hasGoldTogoAccess(user)) {
    return 'gold';
  }

  switch (country) {
    case 'Rwanda':
    case 'DRC':
    case 'Libya':
    case 'Ethiopia':
      return '3ts';

    case 'Gabon':
    case 'Ghana':
      return 'gold';

    case 'France':
      return 'both';

    case 'Togo':
      return 'gold';
    case 'Niger':
      return 'gold';

    default:
      return '3ts';
  }
};

/**
 * Get default language for a country
 * @param {string} country - Country name
 * @returns {string} - Language code ('en' or 'fr')
 */
export const getCountryDefaultLanguage = (country) => {
  const languageMap = {
    Rwanda: 'en',
    Ghana: 'en',
    DRC: 'fr',
    France: 'fr',
    Gabon: 'fr',
    Ethiopia: 'en',
    Libya: 'en',
    Togo: 'fr',
  };

  return languageMap[country] || 'en';
};

/**
 * Check if user can access a specific feature
 * @param {string} feature - Feature name (e.g., 'purchase', 'reports')
 * @param {object} user - User object
 * @returns {boolean}
 */
export const canAccessFeature = (feature, user) => {
  if (!user) return false;

  // Gold-Togo users have access to all features
  if (hasGoldTogoAccess(user)) {
    return true;
  }

  // Feature-specific access control can be added here
  // For now, default users have access to all standard features
  switch (feature) {
    case 'purchase':
      // Only Gold-Togo users can access Purchase
      return hasGoldTogoAccess(user);

    case 'reports':
    case 'mining':
    case 'assessments':
      return true;

    default:
      return true;
  }
};

/**
 * Get user profile information
 * @returns {object} - User object from localStorage
 */
export const getUserProfile = () => {
  return JSON.parse(localStorage.getItem('_authUsr')) || null;
};

/**
 * Get current country from localStorage
 * @returns {string} - Country name
 */
export const getCurrentCountry = () => {
  return localStorage.getItem('_country') || 'Rwanda';
};

/**
 * Get all country-specific configuration
 * @param {string} country - Country name
 * @returns {object} - Configuration object
 */
export const getCountryConfig = (country) => {
  return {
    country,
    api: getAPIEndpoint(country),
    accessLevel: getAccessLevel(country),
    language: getCountryDefaultLanguage(country),
  };
};

/**
 * Initialize access control on app load
 * Sets up localStorage values based on user profile
 */
export const initializeAccessControl = () => {
  const user = getUserProfile();
  if (!user) return;

  const initialCountry = getInitialCountry(user);
  const accessLevel = getAccessLevel(initialCountry, user);
  const language = localStorage.getItem('_userLang') ||
    localStorage.getItem('_lang') ||
    getCountryDefaultLanguage(initialCountry);

  localStorage.setItem('_country', initialCountry);
  localStorage.setItem('_dash', accessLevel);
  localStorage.setItem('_lang', language);
  return {
    country: initialCountry,
    accessLevel,
    language,
  };
};

/**
 * Validate if user can access a specific country
 * @param {string} country - Country name
 * @param {object} user - User object
 * @returns {boolean}
 */
export const canAccessCountry = (country, user) => {
  if (!user) return false;

  const availableCountries = getAvailableCountries(user);
  return country in availableCountries;
};

export default {
  getAPIEndpoint,
  hasGoldTogoAccess,
  isGoldAccess,
  getInitialCountry,
  getAvailableCountries,
  getAccessLevel,
  getCountryDefaultLanguage,
  canAccessFeature,
  getUserProfile,
  getCurrentCountry,
  getCountryConfig,
  initializeAccessControl,
  canAccessCountry,
};
