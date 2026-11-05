import React, { useEffect, useState } from 'react';

const TrendingAssets = ({ data }) => {
  const [trendingData, setTrendingData] = useState({
    'TIN': { color: '#ff7761', current: 0, percentage: 0, displayName: 'Tin' },
    'LME-TIN': { color: '#3e95cd', current: 0, percentage: 0, displayName: 'Cassiterite' },
    'TIN3M': { color: '#e83e8c', current: 0, percentage: 0, displayName: 'Tantalum' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start with loading state when data changes
    setLoading(true);
    
    // Check if we have valid data
    if (!data) {
      setLoading(false);
      return;
    }
    
    try {
      // Get the correct data structure
      let metalData;
      if (data.data && data.data.data) {
        metalData = data.data.data;
      } else if (data.data) {
        metalData = data.data;
      } else {
        console.log("Unexpected data format:", data);
        setLoading(false);
        return;
      }
      
      const processedData = { ...trendingData };
      
      // Process the data for each metal type
      Object.keys(metalData).forEach(metalType => {
        const timeSeriesData = metalData[metalType];
        const dates = Object.keys(timeSeriesData).sort();
        
        if (dates.length >= 2) {
          // Get the current (latest) and previous values
          const currentDate = dates[dates.length - 1];
          const previousDate = dates[0]; // Compare with first date for overall trend
          
          // Check both possible data formats (USDTIN or TIN)
          let currentValue, previousValue;
          
          if (timeSeriesData[currentDate][`USD${metalType}`]) {
            // Format 1: { USDTIN: value }
            currentValue = timeSeriesData[currentDate][`USD${metalType}`];
            previousValue = timeSeriesData[previousDate][`USD${metalType}`];
          } else if (timeSeriesData[currentDate][metalType]) {
            // Format 2: { TIN: value }
            currentValue = timeSeriesData[currentDate][metalType];
            previousValue = timeSeriesData[previousDate][metalType];
          } else {
            // Skip if no valid data format
            return;
          }
          
          // Calculate percentage change
          const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
          
          // Create sparkline data points
          const sparklineData = dates.map(date => {
            // Handle both data formats
            let value;
            if (timeSeriesData[date][`USD${metalType}`]) {
              value = timeSeriesData[date][`USD${metalType}`];
            } else if (timeSeriesData[date][metalType]) {
              value = timeSeriesData[date][metalType];
            } else {
              value = 0;
            }
            
            return {
              date,
              value
            };
          });
  
          // Set positive/negative trend
          const trend = percentageChange >= 0 ? 'positive' : 'negative';
          
          // Update the processed data
          if (processedData[metalType]) {
            processedData[metalType] = {
              ...processedData[metalType],
              current: currentValue,
              previous: previousValue,
              percentageChange,
              sparklineData,
              trend
            };
          }
        }
      });
      
      setTrendingData(processedData);
    } catch (error) {
      console.error("Error processing trending assets data:", error);
    } finally {
      // End loading state after 800ms delay for smoother transition
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  }, [data]);

  const renderSparkline = (sparklineData, color, width = 100, height = 30) => {
    if (!sparklineData || sparklineData.length < 2) return null;
    
    // Extract values for scaling
    const values = sparklineData.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1; // Avoid division by zero
    
    // Calculate points for the SVG path
    const points = sparklineData.map((point, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((point.value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width={width} height={height} className="sparkline">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        {/* Add dots for visual appeal */}
        {[0, Math.floor(sparklineData.length / 2), sparklineData.length - 1].map((index) => {
          if (!sparklineData[index]) return null;
          const x = (index / (sparklineData.length - 1)) * width;
          const y = height - ((sparklineData[index].value - min) / range) * height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="#fff"
              stroke={color}
              strokeWidth="1"
            />
          );
        })}
      </svg>
    );
  };

  // Loading animation for asset card
  const renderSkeletonCard = () => {
    return (
      <div className="col-md-4 p-0">
        <div className="asset-card p-3 m-2 rounded" style={{ backgroundColor: '#1e2130', position: 'relative' }}>
          {/* Asset Header - Skeleton */}
          <div className="d-flex justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <div 
                className="asset-icon-skeleton rounded mr-2 pulse-animation" 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  backgroundColor: '#333',
                  marginRight: '10px'
                }}
              ></div>
              <div 
                className="asset-name-skeleton pulse-animation" 
                style={{ 
                  width: '80px', 
                  height: '20px', 
                  backgroundColor: '#333',
                  borderRadius: '4px'
                }}
              ></div>
            </div>
          </div>
          
          {/* Asset Value - Skeleton */}
          <div className="reward-rate mb-2">
            <div 
              className="small-skeleton pulse-animation" 
              style={{ 
                width: '60px', 
                height: '12px', 
                backgroundColor: '#333',
                borderRadius: '4px',
                marginBottom: '8px'
              }}
            ></div>
            <div 
              className="price-skeleton pulse-animation" 
              style={{ 
                width: '120px', 
                height: '24px', 
                backgroundColor: '#333',
                borderRadius: '4px'
              }}
            ></div>
          </div>
          
          {/* Change Percentage - Skeleton */}
          <div 
            className="change-percent-skeleton mb-3 pulse-animation" 
            style={{ 
              width: '70px', 
              height: '24px', 
              backgroundColor: '#333',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          ></div>
          
          {/* Sparkline - Skeleton */}
          <div 
            className="sparkline-skeleton pulse-animation" 
            style={{ 
              width: '150px', 
              height: '40px', 
              backgroundColor: '#333',
              borderRadius: '4px'
            }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="fs-20 mb-0">Trending Assets</h4>
      </div>
      <div className="card-body p-0">
        {/* Add CSS for loading animation */}
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 0.8; }
              100% { opacity: 0.6; }
            }
            .pulse-animation {
              animation: pulse 1.5s infinite ease-in-out;
            }
          `}
        </style>
        
        <div className="row m-0">
          {loading ? (
            // Show loading skeleton when loading
            <>
              {renderSkeletonCard()}
              {renderSkeletonCard()}
              {renderSkeletonCard()}
            </>
          ) : (
            // Show actual data when loaded
            Object.entries(trendingData).map(([key, asset]) => {
              // Safety check for displayName
              const displayName = asset.displayName || key;
              const firstChar = displayName.charAt(0) || 'X';
              
              return (
                <div key={key} className="col-md-4 p-0">
                  <div className="asset-card p-3 m-2 rounded" style={{ backgroundColor: '#1e2130', position: 'relative' }}>
                    {/* Asset Header */}
                    <div className="d-flex justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <div 
                          className="asset-icon d-flex align-items-center justify-content-center rounded mr-2" 
                          style={{ 
                            width: '36px', 
                            height: '36px', 
                            backgroundColor: asset.color,
                            marginRight: '10px'
                          }}
                        >
                          <span className="fs-16 text-white">{firstChar}</span>
                        </div>
                        <div className="asset-name text-white">{displayName}</div>
                      </div>
                      <div 
                        className="trending-arrow" 
                        style={{ 
                          color: (asset.percentageChange >= 0) ? '#4caf50' : '#f44336',
                          fontSize: '18px'
                        }}
                      >
                        {(asset.percentageChange >= 0) ? '↗' : '↘'}
                      </div>
                    </div>
                    
                    {/* Asset Value */}
                    <div className="reward-rate mb-2">
                      <div className="small text-muted">Reward Rate</div>
                      <div className="fs-24 text-white font-weight-bold">
                        {asset.percentageChange ? Math.abs(asset.percentageChange).toFixed(2) + '%' : '0.00%'}
                      </div>
                    </div>
                    
                    {/* Change Percentage */}
                    <div 
                      className="change-percent mb-3" 
                      style={{ 
                        color: (asset.percentageChange >= 0) ? '#4caf50' : '#f44336',
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: (asset.percentageChange >= 0) ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                      }}
                    >
                      {(asset.percentageChange >= 0) ? '↑' : '↓'} {Math.abs(asset.percentageChange || 0).toFixed(2)}%
                    </div>
                    
                    {/* Sparkline */}
                    <div className="sparkline-container">
                      {asset.sparklineData && renderSparkline(asset.sparklineData, asset.color, 150, 40)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingAssets;