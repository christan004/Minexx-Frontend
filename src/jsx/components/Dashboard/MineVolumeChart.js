import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../../services/AxiosInstance';
import { baseURL_ } from '../../../config';
import { toast } from 'react-toastify';

const MineVolumeChart = ({ country, height = 220 }) => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMineral, setSelectedMineral] = useState('Cassiterite');
  const [error, setError] = useState(null);
  
  const allMinerals = [
    { id: 'Cassiterite', label: 'Cassiterite', color: '#4dc9f6' },
    { id: 'Coltan', label: 'Coltan', color: '#f67019' },
    { id: 'Diomond', label: 'Diomond', color: '#f53794' },
    // { id: 'Tantalum', label: 'Tantalum', color: '#f53794' },
    // { id: 'Tungsten', label: 'Tungsten', color: '#537bc4' },
    { id: 'Gold', label: 'Gold', color: '#acc236' }
  ];

  // Filter minerals based on country
  const getAvailableMinerals = () => {
    if (country && (country.toLowerCase().trim() === 'gabon'|| country.toLowerCase().trim() === 'ghana' || country.toLowerCase().trim() === 'france' ||country.toLowerCase().trim() === 'niger')) {
      return allMinerals.filter(mineral => 
        mineral.id === 'Gold' || mineral.id === 'Diomond'
      );
    }
    return allMinerals.filter(mineral => 
        mineral.id === 'Cassiterite' || mineral.id === 'Coltan'
      );;
  };

  const minerals = getAvailableMinerals();

  // Update selected mineral if current selection is not available for the country
  useEffect(() => {
    const availableMineralIds = minerals.map(m => m.id);
    if (!availableMineralIds.includes(selectedMineral)) {
      setSelectedMineral(availableMineralIds[0] || 'Cassiterite');
    }
  }, [country, minerals, selectedMineral]);

  const fetchSalesData = async (mineral) => {
    setLoading(true);
    setError(null);
    let normalizedCountryq = country.trim();
            
    // Special handling for Rwanda
    if (normalizedCountryq.toLowerCase() === 'rwanda') {
        // Randomly choose one of the three formats
         normalizedCountryq ='.Rwanda';
        // normalizedCountry = formats[Math.floor(Math.random() * formats.length)];
    } else {
        // For other countries, remove leading/trailing dots and spaces
        normalizedCountryq = normalizedCountryq.replace(/^\.+|\.+$/g, '');
    }
    
    try {
      const response = await axiosInstance.get(`report/sales/${mineral}`, {
        params: { country }
      });
      
      if (response.data && response.data.success && response.data.salereport) {
        // Sort by volume in descending order
        const sortedData = response.data.salereport
          .filter(item => item.supplier) // Remove items with empty supplier names
          .sort((a, b) => b.volume - a.volume)
          .slice(0, 5); // Take top 5 for better visualization in small space
        
        setSalesData(sortedData);
      } else {
        setError('Invalid data format received from API');
        toast.error('Failed to load mine volume data');
      }
    } catch (err) {
      setError(err.message || 'Error fetching sales data');
      toast.error('Failed to load mine volume data');
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(selectedMineral);
  }, [selectedMineral, country]);

  const handleMineralChange = (mineral) => {
    setSelectedMineral(mineral);
  };

  const getMineralColor = (mineralId) => {
    const mineral = allMinerals.find(m => m.id === mineralId);
    return mineral ? mineral.color : '#000';
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  // Custom tooltip to display more detailed information
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: '#fff', 
          padding: '5px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          <p className="supplier" style={{ margin: '0 0 2px 0' }}><strong>{data.supplier}</strong></p>
          <p className="volume" style={{ margin: '0 0 2px 0' }}>Volume: {formatNumber(data.volume)} kg</p>
          <p className="value" style={{ margin: '0' }}>Value: ${formatNumber(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate chart height based on container height
  const chartHeight = height - 70; // Subtract header height

  return (
    <div className="card" style={{ height: `${height}px`, overflow: 'hidden' }}>
      <div className="card-header d-flex justify-content-between align-items-center py-2">
        <h4 className="card-title mb-0" style={{ fontSize: '14px' }}>Minerals Performance Overview</h4>
        <div className="d-flex mineral-filters">
          {minerals.map(mineral => (
            <button
              key={mineral.id}
              onClick={() => handleMineralChange(mineral.id)}
              className={`btn ${selectedMineral === mineral.id ? 'btn-primary' : 'btn-outline-primary'} btn-sm mx-1 py-0`}
              style={{ 
                backgroundColor: selectedMineral === mineral.id ? mineral.color : 'transparent',
                borderColor: mineral.color,
                color: selectedMineral === mineral.id ? '#fff' : mineral.color,
                fontSize: '10px',
                padding: '2px 5px'
              }}
            >
              {mineral.label}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body p-0">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: `${chartHeight}px` }}>
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger p-1" style={{ fontSize: '11px' }}>{error}</div>
        ) : salesData.length === 0 ? (
          <div className="alert alert-info p-1" style={{ fontSize: '11px' }}>No data available for the selected mineral.</div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={salesData}
              margin={{ top: 5, right: 10, left: 40, bottom: 40 }}
              barSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="supplier" 
                angle={-25} 
                textAnchor="end"
                height={15}
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickFormatter={value => formatNumber(value)}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="volume" 
                name={`${selectedMineral} Volume`} 
                fill={getMineralColor(selectedMineral)} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MineVolumeChart;