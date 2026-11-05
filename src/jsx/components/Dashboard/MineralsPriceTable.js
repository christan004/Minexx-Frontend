import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../../services/AxiosInstance';
import { baseURL_ } from '../../../config';

const MineralsPriceTable = ({ refreshInterval = 60000, country }) => { // 1 minute default refresh
  const [mineralsData, setMineralsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [countdown, setCountdown] = useState(refreshInterval / 1000);
  const refreshTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Define the minerals metadata based on country
  let mineralsMetadata;
  
  if (country === 'Gabon'|| country === 'Ghana' || country === 'France'|| country === 'Togo') {
    mineralsMetadata = {
      'USDCU': { name: 'Copper', symbol: 'Cu', color: '#b87333' },
      'USDDIAMOND': { name: 'Diamond', symbol: 'D', color: '#e8f4fd' },
      'USDXAU': { name: 'Gold', symbol: 'Au', color: '#ffc107' },
      'USDGOLD': { name: 'Gold', symbol: 'Au', color: '#ffd700' }
    };
  } else {
    mineralsMetadata = {
      'USDLME-TIN': { name: 'Cassiterite', symbol: 'C', color: '#3e95cd' },
      'USDTIN': { name: 'Tin', symbol: 'Ti', color: '#ff7761' },
      'USDTIN3M': { name: 'Tantalum', symbol: 'Ta', color: '#e83e8c' },
      'USDMG': { name: 'Magnesium', symbol: 'Mg', color: '#4caf50' },
      'USDXAU': { name: 'Gold', symbol: 'Au', color: '#ffc107' },
      'USDW': { name: 'Wolframite', symbol: 'Wf', color: '#9c27b0' },
      'USDBX': { name: 'Bauxite', symbol: 'Ba', color: '#00bcd4' },
      'USDCOLTAN': { name: 'Coltan', symbol: 'Ta', color: '#2c3e50' },
      'USDGOLD': { name: 'Gold', symbol: 'Au', color: '#ffd700' },
      
    };
  }

  // Generate random percentage change for demo purposes
  const generateRandomChange = () => {
    return (Math.random() * 20 - 5).toFixed(1);
  };

  // Mock data for minerals not available in API
  const getMockData = () => {
    if (country === 'Gabon'|| country === 'Ghana' || country === 'France'|| country === 'Togo') {
      return {
        'USDDIAMOND': 5200.0,  // Price per carat for high-quality diamonds
        'USDCU': 8.45,         // Price per pound for copper
        'USDGOLD': 2340.50     // Price per ounce for gold
      };
    } else {
      return {
        'USDDIAMOND': 5200.0,
        'USDCU': 8.45
      };
    }
  };

  const fetchMineralsData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${baseURL_}metals-apiall`);
      
      console.log('Full API Response:', response);
      console.log('Country prop:', country);
      console.log('Response data:', response.data);
      
      if (response.data && response.data.success) {
        console.log('Rates from API:', response.data.rates);
        
        // Combine API data with mock data
        const mockData = getMockData();
        const combinedRates = { ...response.data.rates, ...mockData };
        console.log('Combined rates (API + Mock):', combinedRates);
        
        // Filter data based on country-specific minerals
        const relevantRates = Object.entries(combinedRates).filter(([key]) => 
          mineralsMetadata.hasOwnProperty(key)
        );
        
        console.log('Filtered rates for country:', relevantRates);
        
        // Transform combined data into the format we need for display
        const formattedData = relevantRates.map(([key, value]) => {
          console.log(`Processing: ${key} = ${value}`);
          
          const metadata = mineralsMetadata[key] || {
            name: key.replace('USD', ''),
            symbol: key.replace('USD', '').charAt(0),
            color: '#6c757d'
          };
          
          let displayPrice = value;
          let unit = '$';
          
          // Special handling for diamonds (price per carat)
          if (key === 'USDDIAMOND') {
            unit = '$/ct';
          }
          // Special handling for copper (price per pound)
          else if (key === 'USDCU') {
            unit = '$/lb';
          }
          // Special handling for gold (price per ounce)
          else if (key === 'USDGOLD' || key === 'USDXAU') {
            unit = '$/oz';
          }
          // Handle very large values
          else if (value > 100000) {
            displayPrice = value / 1000;
            unit = '$/k';
          }
          
          return {
            key,
            name: metadata.name,
            symbol: metadata.symbol,
            color: metadata.color,
            price: displayPrice.toFixed(1),
            unit,
            change: generateRandomChange(),
            isPositive: Math.random() > 0.3
          };
        });
        
        console.log('Formatted data:', formattedData);
        setMineralsData(formattedData);
        setLastRefreshed(new Date());
        setCountdown(refreshInterval / 1000);
        setError(null);
      } else {
        console.log('API response structure issue:', response.data);
        setError('Failed to fetch minerals data');
      }
    } catch (err) {
      console.error('Error fetching minerals data:', err);
      setError('Error fetching minerals data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch and setup auto-refresh
  useEffect(() => {
    fetchMineralsData();
    
    // Setup auto-refresh
    refreshTimerRef.current = setInterval(() => {
      fetchMineralsData();
    }, refreshInterval);
    
    // Countdown timer
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : refreshInterval / 1000));
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [refreshInterval, country]); // Added country to dependency array

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchMineralsData();
  };

  // Format time remaining to next refresh
  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  if (loading && mineralsData.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && mineralsData.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center text-danger">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="fs-20 mb-0">
          Minerals Price {country && `- ${country}`}
        </h4>
        <div className="d-flex align-items-center">
          {/* Refresh controls commented out as in original */}
        </div>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-dark table-striped mb-0">
            <thead>
              <tr>
                <th className="py-3">Asset</th>
                <th className="py-3 text-right">Price</th>
                <th className="py-3 text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {mineralsData.map((mineral) => (
                <tr key={mineral.key}>
                  <td className="py-3">
                    <div className="d-flex align-items-center">
                      <div 
                        className="mineral-icon d-flex align-items-center justify-content-center rounded mr-3" 
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          backgroundColor: mineral.color,
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        {mineral.symbol}
                      </div>
                      <span className="text-nowrap">{mineral.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    {mineral.unit}{mineral.price}
                  </td>
                  <td className="py-3 text-right">
                    <span 
                      style={{ 
                        color: mineral.isPositive ? '#4caf50' : '#f44336',
                        fontWeight: 'bold'
                      }}
                    >
                      {mineral.isPositive ? '+' : ''}{mineral.change}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer text-right">
        <small className="text-white-50">
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};

export default MineralsPriceTable;