import React, { useContext, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { ThemeContext } from "../../context/ThemeContext";
import axiosInstance from "../../services/AxiosInstance";

const Systemhealth = () => {
    const { changeTitle } = useContext(ThemeContext);
    const [healthapi, sethealthapi] = useState({});
    const [serviceHealthData, setServiceHealthData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to calculate uptime based on records
    const calculateUptime = (records) => {
        if (!records || records.length === 0) return "0%";
        
        const healthyRecords = records.filter(record => 
            record.Status.toLowerCase() === 'healthy'
        );
        const uptime = (healthyRecords.length / records.length) * 100;
        return `${uptime.toFixed(2)}%`;
    };

    // Function to get latest status
    const getLatestStatus = (records) => {
        if (!records || records.length === 0) return "Unknown";
        
        // Sort by created_at to get the latest record (records are already sorted DESC from backend)
        const latestRecord = records[0];
        
        return latestRecord.Status.toLowerCase() === 'healthy' ? 'Operational' : 'Degraded';
    };

    // Generate status bars based on actual records (latest 30 records)
    const generateStatusBarFromRecords = (records) => {
        // If we have fewer than 30 records, create empty slots for missing data
        const maxBars = 30;
        const bars = [];
        
        // Create bars from records (newest to oldest)
        for (let i = 0; i < maxBars; i++) {
            if (i < records.length) {
                const record = records[i];
                const recordDate = new Date(record.created_at);
                const status = record.Status.toLowerCase() === 'healthy' ? 'operational' : 'incident';
                
                bars.unshift({ // Add to beginning to show oldest first (left to right)
                    date: recordDate,
                    status: status,
                    record: record
                });
            } else {
                // No data for this position - show as unknown/no data
                bars.unshift({
                    date: null,
                    status: 'no-data',
                    record: null
                });
            }
        }
        
        return bars;
    };

    

    // Load service health records from new endpoint
    const loadServiceHealthRecords = async () => {
        try {
            const response = await axiosInstance.get('/service_health_records');
            if (response.data && response.data.success) {
                // Limit to latest 30 records per service (they're already sorted DESC by created_at)
                const limitedData = response.data.data.map(service => ({
                    ...service,
                    records: service.records.slice(0, 30) // Take only the first 30 (most recent)
                }));
                
                setServiceHealthData(limitedData);
                console.log("Service Health Records (Latest 30 per service):", limitedData);
            }
        } catch (error) {
            console.error("Error fetching service health records:", error);
            setServiceHealthData([]);
        } finally {
            setLoading(false);
        }
    };

    const StatusBar = ({ bars }) => {
        return (
            <div style={{ display: 'flex', gap: '2px', margin: '8px 0' }}>
                {bars.map((bar, index) => {
                    let backgroundColor = '#6c757d'; // Gray for no data
                    let tooltipText = 'No data available';
                    
                    if (bar.status === 'operational') {
                        backgroundColor = '#28a745';
                        tooltipText = bar.date ? 
                            `${bar.date.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })} - Healthy` : 'Healthy';
                    } else if (bar.status === 'incident') {
                        backgroundColor = '#dc3545';
                        tooltipText = bar.date ? 
                            `${bar.date.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })} - Unhealthy` : 'Unhealthy';
                    }
                    
                    return (
                        <div
                            key={index}
                            style={{
                                width: '4px',
                                height: '30px',
                                backgroundColor: backgroundColor,
                                borderRadius: '1px',
                                cursor: 'pointer'
                            }}
                            title={tooltipText}
                        />
                    );
                })}
            </div>
        );
    };

    // Calculate overall statistics
    const calculateOverallStats = () => {
        if (serviceHealthData.length === 0) {
            return { overallUptime: "0%", activeServices: 0, totalRecords: 0 };
        }

        let totalRecords = 0;
        let totalHealthyRecords = 0;

        serviceHealthData.forEach(service => {
            const serviceRecords = service.records || [];
            totalRecords += serviceRecords.length;
            totalHealthyRecords += serviceRecords.filter(record => 
                record.Status.toLowerCase() === 'healthy'
            ).length;
        });

        const overallUptime = totalRecords > 0 ? 
            `${((totalHealthyRecords / totalRecords) * 100).toFixed(2)}%` : "0%";

        return {
            overallUptime,
            activeServices: serviceHealthData.length,
            totalRecords
        };
    };

    useEffect(() => {
        loadServiceHealthRecords();
        changeTitle(`System Health | Minexx`);
    }, []);

    const cardStyle = {
        backgroundColor: '#2a2d3a',
        border: '1px solid #3a3f51',
        borderRadius: '0.375rem',
        boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.3)',
        margin: '20px 0',
        color: '#ffffff'
    };

    const cardHeaderStyle = {
        backgroundColor: '#1f2330',
        borderBottom: '1px solid #3a3f51',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const serviceItemStyle = {
        borderBottom: '1px solid #3a3f51',
        paddingBottom: '15px',
        marginBottom: '15px'
    };

    const badgeStyle = (variant) => ({
        backgroundColor: variant === 'success' ? '#28a745' : variant === 'warning' ? '#ffc107' : '#6c757d',
        color: variant === 'warning' ? '#212529' : '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
    });

    const stats = calculateOverallStats();

    return (
        <>
            <div className="page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">
                        <Link to={"#"}>Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to={"#"}>System Health</Link>
                    </li>
                </ol>
            </div>

            <div className="row">
                <div className="col-12">
                    <div style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <h4 style={{ margin: 0, color: "#ffffff", fontSize: '1.25rem', fontWeight: '500' }}>
                                System Health - Latest 30 Records
                            </h4>
                           
                        </div>
                        <div style={{ padding: '20px' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                    Loading system health data...
                                </div>
                            ) : (
                                <>
                                    {/* Service Health Records from API */}
                                    {serviceHealthData.map((service, index) => {
                                        const isLast = index === serviceHealthData.length - 1;
                                        const uptime = calculateUptime(service.records);
                                        const status = getLatestStatus(service.records);
                                        
                                        return (
                                            <div 
                                                key={service.serviceName} 
                                                style={isLast ? 
                                                    { ...serviceItemStyle, borderBottom: 'none', marginBottom: '0', paddingBottom: '0' } : 
                                                    serviceItemStyle
                                                }
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h6 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '500', color: '#ffffff' }}>
                                                            {service.serviceName}
                                                        </h6>
                                                       
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span style={badgeStyle(status === 'Operational' ? 'success' : 'warning')}>
                                                            {status}
                                                        </span>
                                                        <div style={{ 
                                                            color: status === 'Operational' ? '#28a745' : '#ffc107', 
                                                            fontSize: '14px', 
                                                            marginTop: '4px' 
                                                        }}>
                                                            {uptime}
                                                        </div>
                                                    </div>
                                                </div>
                                                <StatusBar bars={generateStatusBarFromRecords(service.records || [])} />
                                            </div>
                                        );
                                    })}

                                    {serviceHealthData.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                            No service health data available
                                        </div>
                                    )}

                                    {/* Summary */}
                                    <div style={{
                                        marginTop: '30px',
                                        padding: '20px',
                                        backgroundColor: '#1f2330',
                                        borderRadius: '8px',
                                        border: '1px solid #3a3f51'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                            <div>
                                                <h5 style={{ color: '#28a745', margin: '0 0 4px 0', fontSize: '24px' }}>
                                                    {stats.overallUptime}
                                                </h5>
                                                <small style={{ color: '#9ca3af', fontSize: '13px' }}>
                                                    Overall Uptime
                                                </small>
                                            </div>
                                            <div>
                                                <h5 style={{ color: '#17a2b8', margin: '0 0 4px 0', fontSize: '24px' }}>
                                                    {stats.activeServices}
                                                </h5>
                                                <small style={{ color: '#9ca3af', fontSize: '13px' }}>
                                                    Active Services
                                                </small>
                                            </div>
                                            <div>
                                                <h5 style={{ color: '#6f42c1', margin: '0 0 4px 0', fontSize: '24px' }}>
                                                    {stats.totalRecords}
                                                </h5>
                                                <small style={{ color: '#9ca3af', fontSize: '13px' }}>
                                                    Total Health Checks
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Systemhealth;