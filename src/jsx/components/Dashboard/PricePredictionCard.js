import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../services/AxiosInstance';
import { baseURL_ } from '../../../config';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { Logout } from '../../../store/actions/AuthActions';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

const TinPredictionChart = ({ language, refreshInterval = 300000,country }) => { // 5 minutes default refresh
  const [forecastData, setForecastData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [countdown, setCountdown] = useState(refreshInterval / 1000);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const refreshTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const t = (key) => {
    return key; // Replace with your translation function if needed
  };

  // Calculate percentage change between two values
  const calculatePercentageChange = (currentValue, previousValue) => {
    if (!previousValue) return '0.00%';
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
  };

  // Function to process historical data
  const processHistoricalData = (data) => {
    if (!data || !data.historicaldata || !data.historicaldata.length) return null;
    
    const historical = data.historicaldata.map((entry, index, array) => {
      const previousDayPrice = index > 0 ? array[index - 1].historical_price : null;
      const percentageChange = calculatePercentageChange(entry.historical_price, previousDayPrice);
      
      return {
        date: entry.date,
        price: entry.historical_price,
        percentageChange,
        type: 'historical'
      };
    });

    return { historicaldata: historical };
  };
  
  // Function to process forecast data and add derived fields
  const processForecastData = (data) => {
    if (!data || !data.forecast || !data.forecast.length) return null;
    
    const forecast = data.forecast.map((entry, index, array) => {
      // Calculate percentage change from previous day
      const previousDayPrice = index > 0 ? array[index - 1].predicted_price : 
        (data.metadata?.lastActualPrice ? parseFloat(data.metadata.lastActualPrice) : null);
      
      const percentageChange = calculatePercentageChange(entry.predicted_price, previousDayPrice);
      
      // Determine confidence level - this is simulated since the API doesn't provide it
      let confidence = 'high';
      if (index > 20) confidence = 'very low';
      else if (index > 15) confidence = 'low';
      else if (index > 7) confidence = 'medium';
      
      // Generate explanation based on confidence
      const confidenceExplanation = getConfidenceExplanation(confidence, index);

      return {
        date: entry.date,
        price: entry.predicted_price,
        percentageChange,
        confidence,
        confidenceExplanation,
        type: 'predicted'
      };
    });

    return { ...data, predictions: forecast };
  };

  // Generate confidence explanation
  const getConfidenceExplanation = (confidence, dayIndex) => {
    switch (confidence) {
      case 'very high':
      case 'high':
        return 'Based on strong historical patterns and recent market stability, this prediction has high reliability.';
      case 'medium':
        return 'Based on historical data with moderate market fluctuations expected in this timeframe.';
      case 'low':
        return 'Market conditions may vary significantly in this period, reducing prediction accuracy.';
      case 'very low':
        return 'Long-term predictions carry inherent uncertainty due to potential market shifts and external factors.';
      default:
        return '';
    }
  };

  // Function to create combined chart
 // Function to create combined chart - FIXED VERSION
const createCombinedChart = (historicalData, forecastData) => {
  if (!chartRef.current) return;

  // Destroy existing chart if it exists
  if (chartInstance.current) {
    chartInstance.current.destroy();
  }

  const ctx = chartRef.current.getContext('2d');
  
  // Create a continuous timeline combining both historical and forecast dates
  const allDataPoints = [];
  const allLabels = [];
  
  // Add historical data points
  if (historicalData?.historicaldata?.length) {
    historicalData.historicaldata.forEach(entry => {
      const date = new Date(entry.date);
      allDataPoints.push({
        date: entry.date,
        price: entry.price,
        type: 'historical',
        percentageChange: entry.percentageChange,
        originalData: entry
      });
      allLabels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    });
  }
  
  // Add forecast data points
  if (forecastData?.predictions?.length) {
    forecastData.predictions.forEach(entry => {
      const date = new Date(entry.date);
      allDataPoints.push({
        date: entry.date,
        price: entry.price,
        type: 'predicted',
        percentageChange: entry.percentageChange,
        confidence: entry.confidence,
        confidenceExplanation: entry.confidenceExplanation,
        originalData: entry
      });
      allLabels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    });
  }
  
  // Sort all data points by date to ensure proper chronological order
  allDataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Separate the sorted data back into historical and forecast arrays for chart datasets
  const sortedHistorical = allDataPoints.filter(point => point.type === 'historical');
  const sortedForecast = allDataPoints.filter(point => point.type === 'predicted');
  
  // Create datasets
  const datasets = [];
  
  // Historical dataset
  if (sortedHistorical.length > 0) {
    // Create array with nulls for forecast dates and actual values for historical dates
    const historicalDataArray = allDataPoints.map(point => 
      point.type === 'historical' ? point.price : null
    );
    
    const historicalGradient = ctx.createLinearGradient(0, 0, 0, 400);
    historicalGradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
    historicalGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

    datasets.push({
      label: 'Historical Price',
      data: historicalDataArray,
      borderColor: 'rgba(34, 197, 94, 1)',
      backgroundColor: historicalGradient,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(34, 197, 94, 1)',
      pointRadius: 3,
      pointHoverRadius: 6,
      spanGaps: false, // Don't connect across null values
      order: 1
    });
  }
  
  // Forecast dataset
  if (sortedForecast.length > 0) {
    // Create array with nulls for historical dates and actual values for forecast dates
    const forecastDataArray = allDataPoints.map(point => 
      point.type === 'predicted' ? point.price : null
    );
    
    // Point colors based on confidence
    const pointColors = allDataPoints.map(point => {
      if (point.type !== 'predicted') return 'rgba(46, 202, 234, 0)'; // Transparent for non-forecast points
      
      switch (point.confidence) {
        case 'very high':
        case 'high':
          return 'rgba(46, 202, 234, 1)';  // Bright blue
        case 'medium':
          return 'rgba(241, 180, 76, 1)';  // Orange
        case 'low':
          return 'rgba(246, 145, 94, 1)';  // Light orange
        case 'very low':
          return 'rgba(249, 110, 87, 1)';  // Red
        default:
          return 'rgba(46, 202, 234, 1)';  // Default blue
      }
    });

    const predictionGradient = ctx.createLinearGradient(0, 0, 0, 400);
    predictionGradient.addColorStop(0, 'rgba(46, 202, 234, 0.3)');
    predictionGradient.addColorStop(1, 'rgba(46, 202, 234, 0)');

    datasets.push({
      label: 'Predicted Price',
      data: forecastDataArray,
      borderColor: 'rgba(46, 202, 234, 1)',
      backgroundColor: predictionGradient,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: pointColors,
      pointRadius: 4,
      pointHoverRadius: 7,
      borderDash: [5, 5], // Dashed line for predictions
      spanGaps: false, // Don't connect across null values
      order: 2
    });
  }
  
  // Update labels to match the sorted chronological order
  const sortedLabels = allDataPoints.map(point => {
    const date = new Date(point.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  // Create the combined chart
  chartInstance.current = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedLabels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      animations: {
        tension: {
          duration: 1000,
          easing: 'linear',
          from: 0.8,
          to: 0.4,
          loop: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              const idx = tooltipItems[0].dataIndex;
              return allDataPoints[idx] ? allDataPoints[idx].date : sortedLabels[idx];
            },
            label: function(context) {
              const datasetLabel = context.dataset.label;
              const value = context.parsed.y;
              const idx = context.dataIndex;
              const dataPoint = allDataPoints[idx];
              
              if (!dataPoint || value === null) return null;
              
              if (datasetLabel === 'Historical Price' && dataPoint.type === 'historical') {
                return [
                  `Historical Price: $${value.toLocaleString()}`,
                  `Change: ${dataPoint.percentageChange}`
                ];
              } else if (datasetLabel === 'Predicted Price' && dataPoint.type === 'predicted') {
                return [
                  `Predicted Price: $${value.toLocaleString()}`,
                  `Change: ${dataPoint.percentageChange}`,
                  `Confidence: ${dataPoint.confidence.charAt(0).toUpperCase() + dataPoint.confidence.slice(1)}`
                ];
              }
              return null;
            },
            afterLabel: function(context) {
              const idx = context.dataIndex;
              const dataPoint = allDataPoints[idx];
              
              if (dataPoint && dataPoint.type === 'predicted' && dataPoint.confidenceExplanation) {
                return `Explanation: ${dataPoint.confidenceExplanation.substring(0, 100)}${dataPoint.confidenceExplanation.length > 100 ? '...' : ''}`;
              }
              return '';
            }
          },
          filter: function(tooltipItem) {
            // Only show tooltip if the data point is not null
            return tooltipItem.parsed.y !== null;
          }
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: 'rgba(255, 255, 255, 0.7)',
            usePointStyle: true,
            padding: 20
          }
        }
      },
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const element = elements[0];
          const index = element.index;
          const dataPoint = allDataPoints[index];
          
          if (dataPoint && dataPoint.originalData) {
            setSelectedPoint({
              ...dataPoint.originalData,
              type: dataPoint.type
            });
          }
        } else {
          setSelectedPoint(null);
        }
      }
    }
  });
};

  // Function to fetch historical data
  const fetchHistoricalData = async () => {
    try {
      const response = await axiosInstance.get(`${baseURL_}historical`);
      if (response.data.success) {
        const processedData = processHistoricalData(response.data.data);
        setHistoricalData(processedData);
        return processedData;
      }
    } catch (err) {
      try {
        if (err.response && err.response.status === 403) {
          dispatch(Logout(navigate));
        } else {
          toast.warn(err.response ? err.response.data.message : err.message);
        }
      } catch (e) {
        console.log(err.message);
      }
    }
    return null;
  };

  // Function to fetch forecast data
  const fetchForecast = async () => {
    try {
      const response = await axiosInstance.get(`${baseURL_}forecast`);
      if (response.data.success) {
        const processedData = processForecastData(response.data.data);
        setForecastData(processedData);
        setLastRefreshed(new Date());
        setCountdown(refreshInterval / 1000);
        return processedData;
      }
    } catch (err) {
      try {
        if (err.response && err.response.status === 403) {
          dispatch(Logout(navigate));
        } else {
          toast.warn(err.response ? err.response.data.message : err.message);
        }
      } catch (e) {
        console.log(err.message);
      }
    }
    return null;
  };

  // Fetch both historical and forecast data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [historicalResult, forecastResult] = await Promise.all([
        fetchHistoricalData(),
        fetchForecast()
      ]);
      
      // Create combined chart after data is fetched and processed
      setTimeout(() => {
        createCombinedChart(historicalResult, forecastResult);
      }, 100); // Small delay to ensure DOM is ready
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
    
    // Setup auto-refresh
    refreshTimerRef.current = setInterval(() => {
      fetchAllData();
    }, refreshInterval);
    
    // Countdown timer
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : refreshInterval / 1000));
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [refreshInterval]);

  // Effect to recreate chart when data updates
  useEffect(() => {
    if (!loading && (historicalData || forecastData)) {
      setTimeout(() => {
        createCombinedChart(historicalData, forecastData);
      }, 100);
    }
  }, [historicalData, forecastData, loading]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchAllData();
  };

  // Helper function to format the confidence badge
  const renderConfidenceBadge = (confidence) => {
    let badgeClass = 'badge badge-';
    
    switch (confidence) {
      case 'very high':
      case 'high':
        badgeClass += 'success';
        break;
      case 'medium':
        badgeClass += 'warning';
        break;
      case 'low':
      case 'very low':
        badgeClass += 'danger';
        break;
      default:
        badgeClass += 'primary';
    }
    
    return (
      <span className={badgeClass}>
        {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
      </span>
    );
  };

  // Format time remaining to next refresh
  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Loading skeleton for the chart
  const renderLoadingSkeleton = () => {
    return (
      <div className="chart-skeleton-loading">
        <style jsx>{`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 0.8; }
            100% { opacity: 0.6; }
          }
          .chart-skeleton {
            background-color: #333;
            border-radius: 4px;
            height: 500px;
            width: 100%;
            animation: pulse 1.5s infinite ease-in-out;
          }
        `}</style>
        <div className="chart-skeleton"></div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header d-sm-flex d-block pb-0 border-0">
        <div>
          <h4 className="fs-20 text-white">{country === 'Gabon' || country ==='Ghana' || country ==='France' || country === 'Togo'? 'Copper' : 'TIN'} Price Analysis</h4>
          <p className="mb-0 fs-12 text-white-50">{t('Historical data and price forecasts combined')}</p>
        </div>
        <div className="d-flex mt-sm-0 mt-3 align-items-center ml-auto">
          {!loading && (
            <>
              <small className="fs-13 text-white-50 mr-3">
                {t('Next refresh')}: {formatTimeRemaining(countdown)}
              </small>
              <small className="fs-13 text-white-50 mr-3">
                {t('Last updated')}: {lastRefreshed.toLocaleTimeString()}
              </small>
              <button 
                className="btn btn-sm btn-outline-info" 
                onClick={handleManualRefresh}
                disabled={loading}
              >
                <i className="fa fa-refresh mr-1"></i> {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="card-body p-3">
        {loading ? (
          <div className="py-4">
            {renderLoadingSkeleton()}
          </div>
        ) : (
          <>
            {/* Combined Chart */}
            <div style={{ height: '500px', position: 'relative' }}>
              <canvas ref={chartRef}></canvas>
            </div>
            
            {/* Legend */}
            <div className="d-flex justify-content-center mt-3 mb-4">
              <div className="me-4">
                <span className="badge" style={{backgroundColor: 'rgba(34, 197, 94, 1)'}}></span>
                <small className="text-white-50 ml-2">Historical Price (Solid Line)</small>
              </div>
              <div className="me-4">
                <span className="badge" style={{backgroundColor: 'rgba(46, 202, 234, 1)'}}></span>
                <small className="text-white-50 ml-2">Predicted Price (Dashed Line)</small>
              </div>
            </div>

            
            
            {/* Selected Point Details */}
            {selectedPoint && (
              <div className="selected-point-details mt-4 p-3 bg-dark rounded">
                <h5 className="text-white">
                  {new Date(selectedPoint.date).toDateString()} 
                  <span className={`badge ml-2 ${selectedPoint.type === 'historical' ? 'badge-success' : 'badge-info'}`}>
                    {selectedPoint.type === 'historical' ? 'Historical' : 'Predicted'}
                  </span>
                </h5>
                <div className="row">
                  <div className="col-md-4 mb-2">
                    <div className="text-white-50">{selectedPoint.type === 'historical' ? 'Historical' : 'Predicted'} Price:</div>
                    <div className="text-white fs-18">${selectedPoint.price.toLocaleString()}</div>
                  </div>
                  <div className="col-md-4 mb-2">
                    <div className="text-white-50">Daily Change:</div>
                    <div className={`fs-18 ${parseFloat(selectedPoint.percentageChange) >= 0 ? 'text-success' : 'text-danger'}`}>
                      <i className={`fa fa-long-arrow-${parseFloat(selectedPoint.percentageChange) >= 0 ? 'up' : 'down'} me-1`}></i>
                      {selectedPoint.percentageChange}
                    </div>
                  </div>
                  {selectedPoint.type === 'predicted' && selectedPoint.confidence && (
                    <div className="col-md-4 mb-2">
                      <div className="text-white-50">Confidence:</div>
                      <div>{renderConfidenceBadge(selectedPoint.confidence)}</div>
                    </div>
                  )}
                </div>
                {selectedPoint.type === 'predicted' && selectedPoint.confidenceExplanation && (
                  <div className="mt-2">
                    <div className="text-white-50">Explanation:</div>
                    <p className="text-white-50 mb-0">{selectedPoint.confidenceExplanation}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        
        
      </div>
    </div>
  );
};

export default TinPredictionChart;