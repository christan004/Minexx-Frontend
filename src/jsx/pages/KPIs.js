import React, { useState, useEffect } from 'react';
// import { baseURL_ } from '../../config';
import axiosInstance from '../../services/AxiosInstance';
import { translations } from './KpiTranslation';

const baseURL_="https://minexxapi-drc-p7n5ing2cq-uc.a.run.app/";

const KPIs = ({ country, language }) => {
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [purchaseCassiterite, setPurchaseCassiterite] = useState({
        count: 0,
        volume: 0 
    });
    const [purchaseColtan, setPurchaseColtan] = useState({
        count: 0,
        volume: 0
    });
    const [purchaseWolframite, setPurchaseWolframite] = useState({
        count: 0,
        volume: 0
    });
    const [purchaseCopper, setPurchaseCopper] = useState({
        count: 0,
        volume: 0
    });
    const [exportCassiterite, setExportCassiterite] = useState({
        count: 0,
        volume: 0
    });
    const [exportColtan, setExportColtan] = useState({
        count: 0,
        volume: 0
    });
    const [exportWolframite, setExportWolframite] = useState({
        count: 0,
        volume: 0
    });
    const [exportCopper, setExportCopper] = useState({
        count: 0,
        volume: 0
    });
    const [daysToDestination, setDaysToDestination] = useState();
    const [supplier, setSupplier] = useState({
        count: 0,
        active: 0,
    });
    const [users, setUsers] = useState(0); 

    const months = [
        { value: '', label: 'All Quarters' },
        { value: 'Q1', label: 'Q1' },
        { value: 'Q2', label: 'Q2' },
        { value: 'Q3', label: 'Q3' },
        { value: 'Q4', label: 'Q4' },

    ];

    const t = (key) => {
        if (!translations[language]) {
            console.warn(`Translation for language "${language}" not found`);
            return key;
        }
        return translations[language][key] || key;
    };

    const fetchKPIData = async () => {
      
        try {
            const params = {
                country: country,
                year: selectedYear
            };
            
            // Only add month parameter if a specific month is selected
            if (selectedMonth) {
                params.quarter = selectedMonth;
            }

            const response = await axiosInstance.get(`report/kpisyeartest`, {
                params: params
            });
            console.log('KPI Data:', response.data);
            
            if (response.data && response.data.kpis) {
                const data = response.data.kpis;
                
                // Set purchase data
                setPurchaseCassiterite(data.purchases?.cassiterite || { count: 0, volume: 0 });
                setPurchaseColtan(data.purchases?.coltan || { count: 0, volume: 0 });
                setPurchaseWolframite(data.purchases?.wolframite || { count: 0, volume: 0 });
                setPurchaseCopper(data.purchases?.copper_cobalt || { count: 0, volume: 0 });
                
                // Set export data
                setExportCassiterite(data.exports?.cassiterite || { count: 0, volume: 0 });
                setExportColtan(data.exports?.coltan || { count: 0, volume: 0 });
                setExportWolframite(data.exports?.wolframite || { count: 0, volume: 0 });
                setExportCopper(data.exports?.copper_cobalt || { count: 0, volume: 0 });
                
                // Set supplier data
                setSupplier({
                    count: data.supplier?.total_companies || 0,
                    active: data.supplier?.active_companies || 0
                });
                // Set users data
                setUsers(data.total_users || 0);
                // Note: daysToDestination is not in the API response, 
                // you might need to add it to your API or remove it from the component
                setDaysToDestination(data.purchase_days_to_destination.kpi_quarter_days || 0);
                
                console.log('Updated KPI Data:', data.supplier);
                console.log('Updated Users Count:', data.total_users);
            }

        }
        catch (error) {
            console.error('Error fetching KPI data:', error);
        }
    };

    useEffect(() => {
        fetchKPIData();
    }, [selectedYear, selectedMonth, country, language]);

    // Format volume numbers with commas
    const formatVolume = (volume) => {
        return typeof volume === 'number' ? volume.toLocaleString() : volume;
    };

    // Get display text for selected period
    const getPeriodDisplay = () => {
        if (selectedMonth) {
            const monthName = months.find(m => m.value === selectedMonth)?.label;
            return `${monthName} ${selectedYear}`;
        }
        return selectedYear;
    };

    return (
        <div className="container-fluid">
            <div className="card bg-dark text-white">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title">{t('Key Performance Indicators')} ({getPeriodDisplay()})</h4>
                    <div className="d-flex gap-2">
                        <select 
                            className="form-select bg-dark text-white" 
                            style={{ width: '120px' }}
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                        <select 
                            className="form-select bg-dark text-white" 
                            style={{ width: '150px' }}
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {months.map(month => (
                                <option key={month.value} value={month.value}>
                                    {t(month.label)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row g-4">
                        {/* Suppliers Section */}
                        <div className="col-12 col-lg-3">
                            <div className="card bg-dark-light">
                                <div className="card-body">
                                    <h5>{t("Suppliers")}</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>{t('Count')}</span>
                                        <span className="text-info">{supplier.count}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Active</span>
                                        <span className="text-info">{supplier.active}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Days to Destination */}
                        <div className="col-12 col-lg-6">
                            <div className="card bg-dark-light">
                                <div className="card-body text-center">
                                    <h2 className="display-1 text-info">{daysToDestination}</h2>
                                    <p>{t("Purchase to Final Destination")}</p>
                                </div>
                            </div>
                        </div>

                        {/* Users - Note: This data is not in API response */}
                        <div className="col-12 col-lg-3">
                            <div className="card bg-dark-light">
                                <div className="card-body text-center">
                                    <h2 className="display-1 text-info">{users}</h2>
                                    <p>{t("users")}</p>
                                </div>
                            </div>
                        </div>

                        {/* Purchases Section */}
                        <div className="col-12 col-lg-4">
                            <div className="card bg-dark-light">
                                <div className="card-body">
                                    <h5>{t("Purchases (Cassiterite)")}</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>{t('Count')}</span>
                                        <span className="text-info">{purchaseCassiterite.count}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>{t("Volume (KG)")}</span>
                                        <span className="text-info">{formatVolume(purchaseCassiterite.volume)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-4">
                            <div className="card bg-dark-light">
                                <div className="card-body">
                                    <h5>{t("Purchases (Coltan)")}</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>{t('Count')}</span>
                                        <span className="text-info">{purchaseColtan.count}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>{t("Volume (KG)")}</span>
                                        <span className="text-info">{formatVolume(purchaseColtan.volume)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                       
                        {country === 'DRC'?
                        (
                            <div className="col-12 col-lg-4">
                            <div className="card bg-dark-light">
                                <div className="card-body">
                                    <h5>{t("Purchases (Copper/Cobalt)")}</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>{t('Count')}</span>
                                        <span className="text-info">{purchaseCopper.count}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>{t("Volume (KG)")}</span>
                                        <span className="text-info">{formatVolume(purchaseCopper.volume)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ):
                         <div className="col-12 col-lg-4">
                            <div className="card bg-dark-light">
                                <div className="card-body">
                                    <h5>{t("Purchases (Wolframite)")}</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>{t('Count')}</span>
                                        <span className="text-info">{purchaseWolframite.count}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>{t("Volume (KG)")}</span>
                                        <span className="text-info">{formatVolume(purchaseWolframite.volume)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                        

                        {/* Exports Section */}
                        <div className="col-12 col-lg-4">
                            <div className="card bg-dark-light">
                                <div className="card-body">
                                    <h5>{t("Exports (Cassiterite)")}</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>{t('Count')}</span>
                                        <span className="text-info">{exportCassiterite.count}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>{t("Volume (KG)")}</span>
                                        <span className="text-info">{formatVolume(exportCassiterite.volume)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-4">
                            <div className="card bg-dark-light">
                                <div className="card-body">
                                    <h5>{t("Exports (Coltan)")}</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>{t('Count')}</span>
                                        <span className="text-info">{exportColtan.count}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>{t("Volume (KG)")}</span>
                                        <span className="text-info">{formatVolume(exportColtan.volume)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        
                         {country === 'DRC' ?(
                            <div className="col-12 col-lg-4">
                            <div className="card bg-dark-light">
                                <div className="card-body">
                                    <h5>{t("Exports (Copper/Cobalt)")}</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>{t('Count')}</span>
                                        <span className="text-info">{exportCopper.count}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>{t("Volume (KG)")}</span>
                                        <span className="text-info">{formatVolume(exportCopper.volume)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                         ):
                         <div className="col-12 col-lg-4">
                            <div className="card bg-dark-light">
                                <div className="card-body">
                                    <h5>{t("Exports (Wolframite)")}</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>{t('Count')}</span>
                                        <span className="text-info">{exportWolframite.count}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>{t("Volume (KG)")}</span>
                                        <span className="text-info">{formatVolume(exportWolframite.volume)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                         }   
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIs;