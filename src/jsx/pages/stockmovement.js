import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from "../../services/AxiosInstance";
import { translations } from './KpiTranslation';
import { toast } from 'react-toastify';

const Stockmovement = ({ country, language, access }) => {
    const [selectedMineral, setSelectedMineral] = useState('');
    const [sale, setSale] = useState({ sale_Report: [] });
    const [appliedsale, setAppliedSale] = useState({ sale_Report: [] });
    const [salesPage, setsalesPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [graphData, setGraphData] = useState([]);
    const sort = 20;

    const paginate = (array, page_number, page_size) => {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    };

    // ── CSV Export ──────────────────────────────────────────────────────
    const exportToCSV = (rows, headers, filename) => {
        if (!rows || rows.length === 0) {
            toast.warn('No data to export.');
            return;
        }
        const escape = (v) => {
            const s = v === null || v === undefined ? '' : String(v);
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? `"${s.replace(/"/g, '""')}"`
                : s;
        };
        const csvContent = [
            headers.map(escape).join(','),
            ...rows.map(row => headers.map(h => escape(row[h])).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportStockMovement = () => {
        const rows = sale.sale_Report.map(item => ({
            Date: new Date(item.date).toLocaleDateString(),
            'Minexx (Kg)': item.minexx.toFixed(2),
            'RMR/Partenaire (Kg)': item.rmr.toFixed(2),
            'Export (Kg)': item.export.toFixed(2),
            'Pending Shipment (Kg)': item.pending_shipment.toFixed(2),
        }));
        exportToCSV(
            rows,
            ['Date', 'Minexx (Kg)', 'RMR/Partenaire (Kg)', 'Export (Kg)', 'Pending Shipment (Kg)'],
            `stock_movement_${selectedMineral}`
        );
    };
    // ────────────────────────────────────────────────────────────────────

    const t = (key) => {
        if (!translations[language]) {
            console.warn(`Translation for language "${language}" not found`);
            return key;
        }
        return translations[language][key] || key;
    };

    const paggination = (array) => {
        return Array(Math.ceil(array.length / sort))
            .fill()
            .map((_, i) => i + 1);
    };

    // Function to filter data for last month and current month
    const filterLastAndCurrentMonth = (data) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        return data.filter(item => {
            const itemDate = new Date(item.date);
            const itemMonth = itemDate.getMonth();
            const itemYear = itemDate.getFullYear();

            return (
                (itemMonth === currentMonth && itemYear === currentYear) ||
                (itemMonth === lastMonth && itemYear === lastMonthYear)
            );
        });
    };

    // Function to prepare graph data
    const prepareGraphData = (salesData) => {
        const filteredData = filterLastAndCurrentMonth(salesData);
        return filteredData.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            minexx: parseFloat(item.minexx.toFixed(2)),
            fullDate: item.date
        })).sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
    };

    const fetchStockMovementData = async (mineral) => {
        if (!mineral) return;

        setLoading(true);

        try {
            const response = await axiosInstance.get(`/report/mtd6months`, {
                params: {
                    country: country,
                }
            });

            if (response.data && response.data.cumulativeMovements) {
                console.log('API Response:', response.data);
                const movements = response.data.cumulativeMovements;
                const formattedData = {
                    sale_Report: Object.entries(movements).map(([date, data]) => {
                        const mineralLower = mineral.toLowerCase();
                        return {
                            date: date,
                            minexx: data[mineralLower]?.minexx || 0,
                            rmr: data[mineralLower]?.rmr || 0,
                            export: data[mineralLower]?.shipped_buyer || 0,
                            pending_shipment: data[mineralLower]?.pending_shipment || 0,
                        };
                    })
                };
                setSale(formattedData);
                setAppliedSale(formattedData);

                // Prepare graph data for last month and current month only
                const chartData = prepareGraphData(formattedData.sale_Report);
                setGraphData(chartData);
            } else {
                setSale({ sale_Report: [] });
                setAppliedSale({ sale_Report: [] });
                setGraphData([]);
            }
        } catch (err) {
            console.error('Error fetching stock movement data:', err);
            setSale({ sale_Report: [] });
            setAppliedSale({ sale_Report: [] });
            setGraphData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMineralChange = (e) => {
        const mineral = e.target.value;
        setSelectedMineral(mineral);
        setsalesPage(1); // Reset to first page

        if (mineral) {
            fetchStockMovementData(mineral);
        } else {
            setSale({ sale_Report: [] });
            setAppliedSale({ sale_Report: [] });
            setGraphData([]);
        }
    };

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded shadow">
                    <p className="font-weight-bold mb-1">{`Date: ${label}`}</p>
                    <p className="text-primary mb-0">
                        {`Minexx: ${payload[0].value} Kg`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container-fluid">
            {/* Selection Card */}
            <div className="row">
                <div className="col-12">
                    <div className="card" style={{ width: '30%', float: 'left', margin: '15px' }}>
                        <div className="card-header">
                            <h4 className="card-title">Select Minerals To Generate Sale Report</h4>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <select
                                    className="form-control form-control-lg"
                                    value={selectedMineral}
                                    onChange={handleMineralChange}
                                    disabled={loading}
                                >
                                    {access === '3ts' ? (
                                        <>
                                            <option value="">Select Mineral</option>
                                            <option value="cassiterite">Cassiterite/Tin</option>
                                            <option value="coltan">Coltan/Tantalum</option>
                                            <option value="wolframite">Wolframite</option>
                                            <option value="copper">Copper-Cobalt</option>
                                        </>
                                    ) : (

                                        <><option value="">Select Mineral</option>
                                            <option value="Gold">Gold</option></>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* Table Card - Appears below the graph */}
            {selectedMineral && (
                <div className="row">
                    <div className="col-12">
                        <div className='card' style={{ margin: '15px 0' }}>
                            <div className='card-header d-flex justify-content-between align-items-center'>
                                <h4 className='card-title mb-0'>{selectedMineral} Stock Movement Report</h4>
                                <button
                                    className='btn btn-sm btn-success'
                                    onClick={handleExportStockMovement}
                                    disabled={loading || sale.sale_Report.length === 0}
                                    title='Export to CSV'
                                >
                                    <i className='fa fa-download me-1'></i> Export CSV
                                </button>
                            </div>
                            <div className='card-body'>
                                <div id="soldre-view" className="dataTables_wrapper no-footer">
                                    <Table bordered striped hover responsive size='sm'>
                                        <thead>
                                            <tr>
                                                <th>{t("Date")}</th>
                                                <th>{selectedMineral}{t(" With minexx")}</th>
                                                <th>{country === 'DRC' ? (selectedMineral + t(" With Partenaire")) : (selectedMineral + t(" With RMR"))}</th>
                                                <th className="text-center text-dark">{t("Export")}</th>
                                                <th className="text-center text-dark">{t("Pending Shipment")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center">
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="sr-only">Loading...</span>
                                                        </div>
                                                        Loading...
                                                    </td>
                                                </tr>
                                            ) : access !== '3ts' ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center">
                                                        No data found for Gold
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginate(
                                                    sale.sale_Report,
                                                    salesPage,
                                                    sort
                                                ).map((saleItem, i) => (
                                                    <tr key={`sale${i}`}>
                                                        <td>{new Date(saleItem.date).toLocaleDateString()}</td>
                                                        <td className="text-center">{saleItem.minexx.toFixed(2)} Kg</td>
                                                        <td className="text-center">{saleItem.rmr.toFixed(2)} Kg</td>
                                                        <td className="text-center">{saleItem.export.toFixed(2)} Kg</td>
                                                        <td className="text-center">{saleItem.pending_shipment.toFixed(2)} Kg</td>
                                                    </tr>
                                                ))
                                            )}
                                            {!loading && access !== 'Gold' && (sale.sale_Report).length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="text-center">
                                                        The selected Mineral does not have any Stock Movement data to show.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>

                                    {!loading && sale.sale_Report.length > 0 && (
                                        <div className="d-sm-flex text-center justify-content-between align-items-center mt-3">
                                            <div className="dataTables_info">
                                                Showing {(salesPage - 1) * sort + 1} to{" "}
                                                {sale?.sale_Report.length > salesPage * sort ? salesPage * sort : sale?.sale_Report.length}{" "}
                                                of {sale?.sale_Report.length} entries
                                            </div>
                                            <div className="dataTables_paginate paging_simple_numbers">
                                                <button
                                                    className={`btn btn-sm btn-primary me-2 ${salesPage <= 1 ? 'disabled' : ''}`}
                                                    onClick={() => {
                                                        if (salesPage > 1) {
                                                            setsalesPage(salesPage - 1);
                                                        }
                                                    }}
                                                    disabled={salesPage <= 1}
                                                >
                                                    previous
                                                </button>
                                                <button
                                                    className={`btn btn-sm btn-primary ${salesPage >= paggination(sale?.sale_Report || []).length ? 'disabled' : ''}`}
                                                    onClick={() => {
                                                        if (salesPage < paggination(sale?.sale_Report || []).length) {
                                                            setsalesPage(salesPage + 1);
                                                        }
                                                    }}
                                                    disabled={salesPage >= paggination(sale?.sale_Report || []).length}
                                                >
                                                    next
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            )}
            {/* Graph Card - Shows minexx data for last month and current month */}
            {access === '3ts' && selectedMineral && graphData.length > 0 && (
                <div className="row">
                    <div className="col-12">
                        <div className='card' style={{ margin: '15px 0' }}>
                            <div className='card-header'>
                                <h4 className='card-title'>{selectedMineral} Minexx</h4>
                            </div>
                            <div className='card-body'>
                                <div style={{ width: '100%', height: '400px' }}>
                                    <ResponsiveContainer>
                                        <LineChart
                                            data={graphData}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 60,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                fontSize={12}
                                            />
                                            <YAxis
                                                label={{ value: 'Minexx (Kg)', angle: -90, position: 'insideLeft' }}
                                                fontSize={12}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="minexx"
                                                stroke="#007bff"
                                                strokeWidth={2}
                                                dot={{ fill: '#007bff', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6, stroke: '#007bff', strokeWidth: 2 }}
                                                name="Minexx (Kg)"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stockmovement;