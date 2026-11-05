import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../services/AxiosInstance';
import ReactApexChart from 'react-apexcharts';
import { translations } from './Hometranslations';

const TotalStockDelivery = ({ language, country, access }) => {
    const [daily, setDaily] = useState({
        cassiterite: { dailyTarget: 4.76, dailyActual: 0, mtdTarget: 100, mtdActual: 0, shipped: 0 },
        coltan:      { dailyTarget: 0.38, dailyActual: 0, mtdTarget: 8,   mtdActual: 0, shipped: 0 },
        wolframite:  { dailyTarget: 0.19, dailyActual: 0, mtdTarget: 4,   mtdActual: 0, shipped: 0 },
        copper:      { dailyTarget: 0.19, dailyActual: 0, mtdTarget: 4,   mtdActual: 0, shipped: 0 },
        gold:            { dailyTarget: 0, dailyActual: 0, mtdTarget: 0, mtdActual: 0, shipped: 0 },
        diamond:         { dailyTarget: 0, dailyActual: 0, mtdTarget: 0, mtdActual: 0, shipped: 0 },
        preciousStones:  { dailyTarget: 0, dailyActual: 0, mtdTarget: 0, mtdActual: 0, shipped: 0 },
    });

    const [monthly, setMonthly] = useState({
        cassiterite:    { January: 0, February: 0, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0 },
        coltan:         { January: 0, February: 0, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0 },
        wolframite:     { January: 0, February: 0, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0 },
        copper:         { January: 0, February: 0, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0 },
        gold:           { January: 0, February: 0, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0 },
        diamond:        { January: 0, February: 0, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0 },
        preciousStones: { January: 0, February: 0, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0 },
    });

    const [loading, setLoading] = useState(true);

    const isGoldAccess = access === 'gold';

    const t = (key) => {
        if (!translations[language]) {
            console.warn(`Translation for language "${language}" not found`);
            return key;
        }
        return translations[language][key] || key;
    };

    const days = new Date().getDate();

    const normalizeCountry = (raw) => {
        let normalized = raw.trim();
        if (normalized.toLowerCase() === 'rwanda') return '.Rwanda';
        return normalized.replace(/^\.+|\.+$/g, '');
    };

    useEffect(() => {
        fetchDailyData();
        loadMonthlyData();
    }, [country, language, access]);

    const fetchDailyData = async () => {
        try {
            setLoading(true);
            const normalizedCountry = normalizeCountry(country);

            const response = await axiosInstance.get(`/report/daily`, {
                params: { country: normalizedCountry },
            });

            console.log('Daily API Response:', response.data);

            if (response.data) {
                const extract = (mineralKey) => {
                    const companyData = response.data?.[mineralKey]?.company;
                    if (!companyData) return {};

                    if (companyData[normalizedCountry]) return companyData[normalizedCountry];

                    const matchedKey = Object.keys(companyData).find(
                        (k) => k.toLowerCase() === normalizedCountry.toLowerCase()
                    );
                    if (matchedKey) {
                        console.warn(`Country key mismatch: expected "${normalizedCountry}", found "${matchedKey}".`);
                        return companyData[matchedKey];
                    }

                    console.warn(`No data for "${normalizedCountry}" in ${mineralKey}.`, Object.keys(companyData));
                    return {};
                };

                setDaily((prev) => ({
                    ...prev,
                    cassiterite:   { ...prev.cassiterite,   ...extract('cassiterite') },
                    coltan:        { ...prev.coltan,        ...extract('coltan') },
                    wolframite:    { ...prev.wolframite,    ...extract('wolframite') },
                    copper:        { ...prev.copper,        ...extract('copper') },
                    gold:          { ...prev.gold,          ...extract('gold') },
                    diamond:       { ...prev.diamond,       ...extract('diamond') },
                    preciousStones:{ ...prev.preciousStones,...extract('preciousStones') },
                }));
            }
        } catch (error) {
            console.error('Error fetching daily data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMonthlyData = () => {
        const normalizedCountry = normalizeCountry(country);

        axiosInstance.get(`/report/Monthly`, { params: { country: normalizedCountry } })
            .then(response => {
                console.log('Monthly API Response:', response.data);

                const extractMonthly = (mineralKey) => {
                    const companyData = response.data?.[mineralKey]?.company;
                    if (!companyData) {
                        console.warn(`No company data for mineral: ${mineralKey}`);
                        return {};
                    }

                    if (companyData[normalizedCountry]?.monthly)
                        return companyData[normalizedCountry].monthly;

                    const matchedKey = Object.keys(companyData).find(
                        (k) => k.toLowerCase() === normalizedCountry.toLowerCase()
                    );
                    if (matchedKey && companyData[matchedKey]?.monthly) {
                        console.warn(`Case-insensitive match: "${matchedKey}"`);
                        return companyData[matchedKey].monthly;
                    }

                    console.warn(`No monthly data for "${normalizedCountry}" in ${mineralKey}.`);
                    return {};
                };

                setMonthly({
                    cassiterite:    extractMonthly('cassiterite'),
                    coltan:         extractMonthly('coltan'),
                    wolframite:     extractMonthly('wolframite'),
                    copper:         extractMonthly('copper'),
                    gold:           extractMonthly('gold'),
                    diamond:        extractMonthly('diamond'),
                    preciousStones: extractMonthly('preciousStones'),
                });
            })
            .catch(err => {
                console.error('Monthly fetch error:', err.response?.message || err.message);
            });
    };

    const months = [
        'January', 'February', 'March',    'April',
        'May',     'June',     'July',      'August',
        'September','October', 'November',  'December',
    ];

    // ── Chart series: switches based on access ──────────────────────────────
    const chartSeries = isGoldAccess
        ? [
            {
                name: 'Gold',
                data: months.map(m => Number(((monthly.gold[m] || 0) / 1000).toFixed(3))),
            },
            {
                name: 'Diamond',
                data: months.map(m => Number(((monthly.diamond[m] || 0) / 1000).toFixed(3))),
            },
            {
                name: 'Precious Stones',
                data: months.map(m => Number(((monthly.preciousStones[m] || 0) / 1000).toFixed(3))),
            },
        ]
        : [
            {
                name: 'Cassiterite',
                data: months.map(m => Number(((monthly.cassiterite[m] || 0) / 1000).toFixed(3))),
            },
            {
                name: 'Coltan',
                data: months.map(m => Number(((monthly.coltan[m] || 0) / 1000).toFixed(3))),
            },
            {
                name: 'Wolframite',
                data: months.map(m => Number(((monthly.wolframite[m] || 0) / 1000).toFixed(3))),
            },
            ...(country === 'DRC' ? [{
                name: 'Copper',
                data: months.map(m => Number(((monthly.copper[m] || 0) / 1000).toFixed(3))),
            }] : []),
        ];

    const legendColors = chartSeries.map(() => '#fff');

    const chartOptions = {
        chart: { type: 'bar', height: 300, stacked: false, toolbar: { show: true } },
        plotOptions: { bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' } },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 1, colors: ['#fff'] },
        xaxis: { categories: months.map(m => t(m)) },
        yaxis: {
            title: { text: t('MTDActuals') + ' (TONS)' },
            labels: { formatter: (value) => value.toFixed(2) },
        },
        tooltip: { y: { formatter: (val) => val.toFixed(3) + ' TONS' } },
        fill: { opacity: 1 },
        legend: {
            position: 'top',
            horizontalAlign: 'left',
            offsetX: 40,
            labels: { colors: legendColors },
        },
        noData: {
            text: t('NoDataAvailable') || 'No data available yet',
            align: 'center',
            verticalAlign: 'middle',
            style: { color: '#aaa', fontSize: '14px' },
        },
        responsive: [{
            breakpoint: 1000,
            options: {
                plotOptions: { bar: { columnWidth: '70%' } },
                legend: { position: 'bottom', horizontalAlign: 'center', offsetX: 0 },
            },
        }],
    };

    const renderMineralCard = (mineralName, mineralData, dailyTargetMultiplier) => {
        const mtdTargetValue = dailyTargetMultiplier * days;
        const mtdActualVsTarget =
            mtdTargetValue > 0
                ? (((mineralData.mtdActual || 0) / 1000) / mtdTargetValue * 100).toFixed(2)
                : '0.00';

        return (
            <div className="col-md-4" key={mineralName}>
                <div className="card">
                    <div className="card-header" style={{ padding: '8px 15px' }}>
                        <h4 className="card-title" style={{ fontSize: '14px', marginBottom: '0' }}>{mineralName}</h4>
                    </div>
                    <div className="card-body" style={{ padding: '10px 15px' }}>
                        <div className="table-responsive" style={{ marginBottom: '0' }}>
                            <div id="report_wrapper" className="no-footer">
                                <table className="display dataTablesCard table-responsive-sm dataTable no-footer" style={{ marginBottom: '0', fontSize: '12px' }}>
                                    <thead>
                                        <tr style={{ height: '24px' }}>
                                            <th style={{ padding: '4px 6px', fontSize: '11px' }}>{t('Date')}</th>
                                            <th style={{ padding: '4px 6px', fontSize: '11px' }}>{new Date().toUTCString().substring(0, 16)}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ height: '24px' }}>
                                            <td style={{ padding: '4px 6px' }}>{t('DailyTarget')}</td>
                                            <td style={{ padding: '4px 6px' }}>
                                                <Link to={'#'} className="h5" style={{ fontSize: '12px', marginBottom: '0' }}>
                                                    {((mineralData.dailyTarget || 0) / 1000).toFixed(2)}
                                                </Link>
                                            </td>
                                        </tr>
                                        <tr style={{ height: '24px' }}>
                                            <td style={{ padding: '4px 6px' }}>{t('DailyActuals')}</td>
                                            <td style={{ padding: '4px 6px' }}>
                                                <Link to={'#'} className="h5" style={{ fontSize: '12px', marginBottom: '0' }}>
                                                    {((mineralData.dailyActual || 0) / 1000).toFixed(2)}
                                                </Link>
                                            </td>
                                        </tr>
                                        <tr style={{ height: '24px' }}>
                                            <td style={{ padding: '4px 6px' }}>{t('MonthlyTarget')}</td>
                                            <td style={{ padding: '4px 6px' }}>
                                                <Link to={'#'} className="h5" style={{ fontSize: '12px', marginBottom: '0' }}>
                                                    {((mineralData.mtdTarget || 0) / 1000).toFixed(2)}
                                                </Link>
                                            </td>
                                        </tr>
                                        <tr style={{ height: '24px' }}>
                                            <td style={{ padding: '4px 6px' }}>{t('MTDTarget')}</td>
                                            <td style={{ padding: '4px 6px' }}>
                                                <Link to={'#'} className="h5" style={{ fontSize: '12px', marginBottom: '0' }}>
                                                    {mtdTargetValue.toFixed(2)}
                                                </Link>
                                            </td>
                                        </tr>
                                        <tr style={{ height: '24px' }}>
                                            <td style={{ padding: '4px 6px' }}>{t('MTDActuals')}</td>
                                            <td style={{ padding: '4px 6px' }}>
                                                <Link to={'#'} className="h5" style={{ fontSize: '12px', marginBottom: '0' }}>
                                                    {((mineralData.mtdActual || 0) / 1000).toFixed(2)}
                                                </Link>
                                            </td>
                                        </tr>
                                        <tr style={{ height: '24px' }}>
                                            <td style={{ padding: '4px 6px' }}>{t('MTDActualsVsTarget')}</td>
                                            <td style={{ padding: '4px 6px' }}>
                                                <Link to={'#'} className="h5" style={{ fontSize: '12px', marginBottom: '0' }}>
                                                    {mtdActualVsTarget}%
                                                </Link>
                                            </td>
                                        </tr>
                                        <tr style={{ height: '24px' }}>
                                            <td style={{ padding: '4px 6px' }}>{t('Shipped Volume')}</td>
                                            <td style={{ padding: '4px 6px' }}>
                                                <Link to={'#'} className="h5" style={{ fontSize: '12px', marginBottom: '0' }}>
                                                    {((mineralData.shipped || 0) / 1000).toFixed(2)}
                                                </Link>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="progress mt-2 mb-2" style={{ height: '12px' }}>
                <div
                    className="progress-bar-striped progress-bar-animated"
                    style={{ width: '100%', height: '12px' }}
                    role="progressbar"
                >
                    <span className="sr-only">100% Complete</span>
                </div>
            </div>
        );
    }

    return (
        <div className="row mt-4">
            {/* ── Mineral Cards ── */}
            {isGoldAccess ? (
                <>
                    {renderMineralCard('Gold',           daily.gold,           0)}
                    {renderMineralCard('Diamond',         daily.diamond,         0)}
                    {renderMineralCard('Precious Stones', daily.preciousStones,  0)}
                </>
            ) : (
                <>
                    {renderMineralCard('Cassiterite', daily.cassiterite, 4.76)}
                    {renderMineralCard('Coltan',      daily.coltan,      0.38)}
                    {country !== 'DRC' && renderMineralCard('Wolframite', daily.wolframite, 0.19)}
                    {country === 'DRC' && renderMineralCard('Copper',     daily.copper,     0.19)}
                </>
            )}

            {/* ── Performance Chart ── */}
            <div className="col-12 mt-4">
                <div className="card">
                    <div className="card-header" style={{ padding: '8px 15px' }}>
                        <h4 className="card-title" style={{ fontSize: '14px', marginBottom: '0' }}>
                            {t('Minerals Performance Overview')}
                        </h4>
                    </div>
                    <div className="card-body" style={{ padding: '10px 15px' }}>
                        <ReactApexChart
                            options={chartOptions}
                            series={chartSeries}
                            type="bar"
                            height={300}
                            key={JSON.stringify(chartSeries)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TotalStockDelivery;